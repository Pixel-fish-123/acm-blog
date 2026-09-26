// 插件：难度与难度配色
// - meta.difficulty 缺失时联网抓取（洛谷 9 档难度 / Codeforces rating），结果缓存到 problemCache.json
// - 无论难度来自 frontmatter 还是抓取，都会补上 meta.difficultyColor
// - 抓取失败只警告，保留旧缓存，不写 difficulty
import fs from 'node:fs'
import path from 'node:path'
import { fetchText, parseLentilleContext } from '../lib/http.mjs'

// 洛谷难度档位（0-8，来源：https://www.luogu.com.cn/_lfe/config 的 ProblemDifficulty）
export const LUOGU_DIFFICULTY = [
  { name: '暂无评定', color: '#bfbfbf' },
  { name: '入门', color: '#fe4c61' },
  { name: '普及-', color: '#f39c11' },
  { name: '普及', color: '#ffc116' },
  { name: '普及+/提高-', color: '#52c41a' },
  { name: '提高', color: '#00c0c0' },
  { name: '提高+/省选-', color: '#3498db' },
  { name: '省选/NOI-', color: '#9d3dcf' },
  { name: 'NOI/NOI+/CTS', color: '#0e1d69' },
]

const NAME_TO_COLOR = new Map(LUOGU_DIFFICULTY.map((d) => [d.name, d.color]))

// Codeforces rating 分段配色
export function cfColor(rating) {
  if (!Number.isFinite(rating)) return '#bfbfbf'
  if (rating < 1200) return '#bfbfbf'
  if (rating < 1400) return '#52c41a'
  if (rating < 1600) return '#00c0c0'
  if (rating < 1900) return '#3498db'
  if (rating < 2100) return '#9d3dcf'
  if (rating < 2400) return '#f39c12'
  return '#fe4c61'
}

// 由难度字符串反推配色（兼容 frontmatter 手写的难度）
export function colorOfDifficulty(difficulty) {
  const text = String(difficulty || '').trim()
  const cf = text.match(/^CF\s+(\d+)$/i)
  if (cf) return cfColor(Number(cf[1]))
  return NAME_TO_COLOR.get(text) || '#bfbfbf'
}

function platformOf(dir) {
  return String(dir || '').split(/[\\/]/)[0]
}

function idOf(rel) {
  return path.basename(rel).replace(/_solution\.md$/, '')
}

function luoguPid(id) {
  const m = id.match(/^([A-Z]+\d+)/)
  return m ? m[1] : ''
}

function cfKey(id) {
  const m = id.match(/^cf(\d+)([A-Za-z]\d*)$/)
  return m ? `${m[1]}/${m[2].toUpperCase()}` : ''
}

async function fetchLuoguDifficulty(pid) {
  const html = await fetchText(`https://www.luogu.com.cn/problem/${pid}?_contentOnly=1`)
  const data = parseLentilleContext(html)
  const problem = data?.data?.problem
  if (!problem) throw new Error('响应中没有 problem 字段')
  const level = Number(problem.difficulty)
  const tier = LUOGU_DIFFICULTY[level]
  if (!tier) throw new Error(`未知难度档位 ${level}`)
  return { difficulty: tier.name, color: tier.color, level }
}

async function fetchCfRatings(keys) {
  const text = await fetchText('https://codeforces.com/api/problemset.problems', { timeout: 30000 })
  const json = JSON.parse(text)
  if (json.status !== 'OK') throw new Error(`Codeforces 返回 status=${json.status}`)
  const want = new Set(keys)
  const out = {}
  for (const p of json.result.problems || []) {
    const key = `${p.contestId}/${p.index}`
    if (!want.has(key)) continue
    out[key] = { rating: p.rating ?? null, name: p.name }
  }
  return out
}

export default {
  name: 'difficulty',
  options: { cache: true },

  // 每个实例只加载一次缓存
  _cache: null,
  _dirty: false,
  _cfLoaded: false,

  cacheFile(ctx) {
    return path.join(ctx.dataDir, 'problemCache.json')
  },

  loadCache(ctx) {
    if (this._cache) return this._cache
    try {
      this._cache = JSON.parse(fs.readFileSync(this.cacheFile(ctx), 'utf8'))
    } catch {
      this._cache = {}
    }
    this._cache.luogu ||= {}
    this._cache.cf ||= {}
    return this._cache
  },

  async onSolution(sol, ctx) {
    const cache = this.loadCache(ctx)
    const platform = platformOf(sol.dir)
    const id = idOf(sol.rel)

    // 难度已由 frontmatter 提供：补配色，并顺手把已知难度沉淀进缓存
    if (sol.meta.difficulty) {
      sol.meta.difficultyColor = colorOfDifficulty(sol.meta.difficulty)
      if (platform.startsWith('luogu')) {
        const pid = luoguPid(id)
        if (pid && !cache.luogu[pid]) {
          cache.luogu[pid] = { difficulty: sol.meta.difficulty, color: sol.meta.difficultyColor }
          this._dirty = true
        }
      } else if (platform.startsWith('codeforces')) {
        const key = cfKey(id)
        const m = String(sol.meta.difficulty).match(/^CF\s+(\d+)$/i)
        if (key && m && !cache.cf[key]) {
          cache.cf[key] = { rating: Number(m[1]), color: sol.meta.difficultyColor }
          this._dirty = true
        }
      }
      return
    }

    if (platform.startsWith('luogu')) {
      const pid = luoguPid(id)
      if (!pid) return
      let cached = cache.luogu[pid]
      if (!cached) {
        try {
          cached = await fetchLuoguDifficulty(pid)
          cache.luogu[pid] = cached
          this._dirty = true
          ctx.log(`  difficulty: ${pid} -> ${cached.difficulty}`)
        } catch (e) {
          ctx.warn(`  difficulty: 洛谷 ${pid} 抓取失败（${e.message}），跳过`)
          return
        }
      }
      sol.meta.difficulty = cached.difficulty
      sol.meta.difficultyColor = cached.color || colorOfDifficulty(cached.difficulty)
      return
    }

    if (platform.startsWith('codeforces')) {
      const key = cfKey(id)
      if (!key) return
      let cached = cache.cf[key]
      // 新比赛出分前 rating 为 null，每次 sync 都要重查，直到拿到 rating
      if ((!cached || cached.rating == null) && !this._cfLoaded) {
        try {
          const fetched = await fetchCfRatings(this.collectCfKeys(ctx))
          for (const [k, v] of Object.entries(fetched)) {
            if (cache.cf[k] && cache.cf[k].rating === v.rating) continue
            cache.cf[k] = v
            this._dirty = true
            if (v.rating != null) ctx.log(`  difficulty: CF ${k} -> ${v.rating}`)
          }
        } catch (e) {
          ctx.warn(`  difficulty: Codeforces 榜单抓取失败（${e.message}），跳过`)
        }
        this._cfLoaded = true
        cached = cache.cf[key]
      }
      if (!cached || cached.rating == null) return
      sol.meta.difficulty = `CF ${cached.rating}`
      sol.meta.difficultyColor = cfColor(cached.rating)
    }
  },

  // 本次 sync 中所有缺少难度的 CF 题，一次请求批量取 rating
  collectCfKeys(ctx) {
    const keys = []
    for (const sol of ctx.solutions || []) {
      if (sol.meta.difficulty) continue
      if (!platformOf(sol.dir).startsWith('codeforces')) continue
      const key = cfKey(idOf(sol.rel))
      if (key) keys.push(key)
    }
    return keys
  },

  async onFinish(index, ctx) {
    if (!this._dirty || !this._cache) return
    try {
      fs.mkdirSync(ctx.dataDir, { recursive: true })
      fs.writeFileSync(this.cacheFile(ctx), JSON.stringify(this._cache, null, 2))
      ctx.log(`  难度缓存已更新 -> docs/.vitepress/problemCache.json`)
    } catch (e) {
      ctx.warn(`  difficulty: 缓存写入失败（${e.message}）`)
    }
  },
}
