// 插件：难度与难度配色
// - meta.difficulty 缺失时联网抓取（洛谷 9 档难度 / Codeforces rating），结果缓存到 problemCache.json
// - 无论难度来自 frontmatter 还是抓取，都会补上 meta.difficultyColor
// - 抓取失败只警告，保留旧缓存，不写 difficulty
import fs from 'node:fs'
import path from 'node:path'
import { fetchText, parseLentilleContext } from '../lib/http.mjs'
import { LUOGU_DIFFICULTY } from '../../docs/.vitepress/theme/luoguDifficulty.js'
import {
  platformOf,
  idOf,
  luoguPid,
  cfKey,
  isGymId,
} from '../lib/problem-id.mjs'
import { isFresh } from '../lib/cache.mjs'
import { mapLimit } from '../lib/async.mjs'

export { LUOGU_DIFFICULTY }

const NAME_TO_COLOR = new Map(LUOGU_DIFFICULTY.map((d) => [d.name, d.color]))

// 洛谷难度很少变化，30 天刷新一次；CF 未出分的题 6 小时后再查。
const LUOGU_TTL_MS = 30 * 24 * 60 * 60 * 1000
const CF_NULL_TTL_MS = 6 * 60 * 60 * 1000
const LUOGU_CONCURRENCY = 4

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

function cacheFile(ctx) {
  return path.join(ctx.dataDir, 'problemCache.json')
}

function loadCache(ctx) {
  let cache = {}
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile(ctx), 'utf8'))
  } catch (e) {
    if (e.code !== 'ENOENT') ctx.warn(`  difficulty: 缓存读取失败（${e.message}）`)
  }
  cache.luogu ||= {}
  cache.cf ||= {}
  return cache
}

// 每次 sync 独立状态，避免模块级变量在多次运行/测试之间串味。
function stateOf(ctx) {
  if (!ctx.difficultyState) {
    ctx.difficultyState = {
      cache: loadCache(ctx),
      dirty: false,
      cfLoaded: false,
      luoguPreloaded: false,
      nowIso: new Date().toISOString(),
    }
  }
  return ctx.difficultyState
}

function luoguNeedsFetch(state, sol, now) {
  if (sol.meta?.difficulty) return false
  if (!platformOf(sol.dir).startsWith('luogu')) return false
  const pid = luoguPid(idOf(sol.rel))
  if (!pid) return false
  const cached = state.cache.luogu[pid]
  return !cached || !cached.difficulty || !isFresh(cached.checkedAt, LUOGU_TTL_MS, now)
}

// 首次遇到洛谷题时并发预取所有缺缓存/过期的题，而不是在 onSolution 里串行等待。
async function ensureLuoguCache(ctx) {
  const state = stateOf(ctx)
  if (state.luoguPreloaded) return
  state.luoguPreloaded = true
  if (ctx.offline) return

  const now = Date.now()
  const targets = new Set()
  for (const sol of ctx.solutions || []) {
    if (!luoguNeedsFetch(state, sol, now)) continue
    targets.add(luoguPid(idOf(sol.rel)))
  }
  if (!targets.size) return

  await mapLimit([...targets], LUOGU_CONCURRENCY, async (pid) => {
    try {
      const fresh = await fetchLuoguDifficulty(pid)
      state.cache.luogu[pid] = { ...fresh, checkedAt: state.nowIso }
      state.dirty = true
      ctx.log(`  difficulty: ${pid} -> ${fresh.difficulty}`)
    } catch (e) {
      ctx.warn(`  difficulty: 洛谷 ${pid} 抓取失败（${e.message}），跳过`)
    }
  })
}

// 本次 sync 中所有缺少难度的 CF 题，一次请求批量取 rating
export function collectCfKeys(solutions) {
  const keys = []
  for (const sol of solutions || []) {
    if (sol.meta?.difficulty) continue
    if (!platformOf(sol.dir).startsWith('codeforces')) continue
    const id = idOf(sol.rel)
    if (isGymId(id)) continue
    const key = cfKey(id)
    if (key) keys.push(key)
  }
  return [...new Set(keys)]
}

function cfNeedsFetch(state, sol, now) {
  if (sol.meta?.difficulty) return false
  if (!platformOf(sol.dir).startsWith('codeforces')) return false
  const id = idOf(sol.rel)
  if (isGymId(id)) return false
  const key = cfKey(id)
  if (!key) return false
  const cached = state.cache.cf[key]
  if (!cached) return true
  return cached.rating == null && !isFresh(cached.checkedAt, CF_NULL_TTL_MS, now)
}

async function ensureCfCache(ctx) {
  const state = stateOf(ctx)
  if (state.cfLoaded) return
  state.cfLoaded = true
  if (ctx.offline) return

  const now = Date.now()
  if (!(ctx.solutions || []).some((sol) => cfNeedsFetch(state, sol, now))) return

  const keys = collectCfKeys(ctx.solutions)
  if (!keys.length) return
  try {
    const fetched = await fetchCfRatings(keys)
    for (const key of keys) {
      const value = fetched[key]
      if (value) {
        state.cache.cf[key] = { ...state.cache.cf[key], ...value, checkedAt: state.nowIso }
        if (value.rating != null) ctx.log(`  difficulty: CF ${key} -> ${value.rating}`)
      } else {
        // 比赛还没进 problemset 时也记录 checkedAt，避免每次 sync 都重拉整表。
        // 但如果旧缓存已有 rating，说明本次只是没查到，不要把它清空。
        const previous = state.cache.cf[key]
        if (previous?.rating != null) continue
        state.cache.cf[key] = {
          ...previous,
          rating: null,
          checkedAt: state.nowIso,
        }
      }
    }
    state.dirty = true
  } catch (e) {
    ctx.warn(`  difficulty: Codeforces 榜单抓取失败（${e.message}），跳过`)
  }
}

export default {
  name: 'difficulty',

  async onSolution(sol, ctx) {
    const state = stateOf(ctx)
    const platform = platformOf(sol.dir)
    const id = idOf(sol.rel)

    // 难度已由 frontmatter 提供：补配色，并顺手把已知难度沉淀进缓存
    if (sol.meta.difficulty) {
      sol.meta.difficultyColor = colorOfDifficulty(sol.meta.difficulty)
      if (platform.startsWith('luogu')) {
        const pid = luoguPid(id)
        if (pid) {
          state.cache.luogu[pid] = {
            ...state.cache.luogu[pid],
            difficulty: sol.meta.difficulty,
            color: sol.meta.difficultyColor,
            checkedAt: state.nowIso,
          }
          state.dirty = true
        }
      } else if (platform.startsWith('codeforces')) {
        const key = cfKey(id)
        const m = String(sol.meta.difficulty).match(/^CF\s+(\d+)$/i)
        if (key && m) {
          state.cache.cf[key] = {
            ...state.cache.cf[key],
            rating: Number(m[1]),
            color: sol.meta.difficultyColor,
            checkedAt: state.nowIso,
          }
          state.dirty = true
        }
      }
      return
    }

    if (platform.startsWith('luogu')) {
      const pid = luoguPid(id)
      if (!pid) return
      await ensureLuoguCache(ctx)
      let cached = state.cache.luogu[pid]
      if (!cached && !ctx.offline) {
        try {
          cached = await fetchLuoguDifficulty(pid)
          state.cache.luogu[pid] = { ...cached, checkedAt: state.nowIso }
          state.dirty = true
          ctx.log(`  difficulty: ${pid} -> ${cached.difficulty}`)
        } catch (e) {
          ctx.warn(`  difficulty: 洛谷 ${pid} 抓取失败（${e.message}），跳过`)
          return
        }
      }
      if (!cached) return
      sol.meta.difficulty = cached.difficulty
      sol.meta.difficultyColor = cached.color || colorOfDifficulty(cached.difficulty)
      return
    }

    if (platform.startsWith('codeforces')) {
      const key = cfKey(id)
      if (!key) return
      await ensureCfCache(ctx)
      const cached = state.cache.cf[key]
      if (!cached || cached.rating == null) return
      sol.meta.difficulty = `CF ${cached.rating}`
      sol.meta.difficultyColor = cfColor(cached.rating)
    }
  },

  async onFinish(index, ctx) {
    const state = ctx.difficultyState
    if (!state?.dirty) return
    try {
      fs.mkdirSync(ctx.dataDir, { recursive: true })
      fs.writeFileSync(cacheFile(ctx), JSON.stringify(state.cache, null, 2))
      ctx.log(`  难度缓存已更新 -> docs/.vitepress/problemCache.json`)
    } catch (e) {
      ctx.warn(`  difficulty: 缓存写入失败（${e.message}）`)
    }
  },
}
