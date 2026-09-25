// 插件：抓取洛谷账号数据，更新 HomeLuogu.vue 的 luogu 常量与 ArticleHeader.vue 的名字颜色
// 说明：洛谷接口未开放 CORS，只能在构建端抓取，无法浏览器实时请求
import fs from 'node:fs'
import path from 'node:path'
import { fetchText, parseLentilleContext } from '../lib/http.mjs'

const FIELD_MAP = {
  followingCount: 'following',
  followerCount: 'followers',
  passedProblemCount: 'passed',
  submittedProblemCount: 'submitted',
  ranking: 'ranking',
  name: 'name',
  slogan: 'slogan',
  color: 'color',
}

// 洛谷等级颜色 → 站点使用的 16 进制色值（与洛谷官方配色一致）
const COLOR_MAP = {
  Gray: '#7f8c9b',
  Red: '#e74c3c',
  Yellow: '#f1c40f',
  Green: '#52c41a',
  Blue: '#3498db',
  Purple: '#9b59b6',
  Orange: '#f39c12',
  Gold: '#d4a017',
}

function esc(s) {
  return s.replace(/'/g, "\\'").replace(/\\/g, '\\\\')
}

export async function updateLuoguUser({ blogRoot, log = console.log, warn = console.warn } = {}) {
  const vueFile = path.join(blogRoot, 'docs', '.vitepress', 'theme', 'components', 'HomeLuogu.vue')

  let src
  try {
    src = fs.readFileSync(vueFile, 'utf8')
  } catch {
    warn('洛谷数据更新：找不到 HomeLuogu.vue，跳过')
    return
  }

  const uidMatch = src.match(/luogu\.com\.cn\/user\/(\d+)/)
  if (!uidMatch) {
    warn('洛谷数据更新：无法从 HomeLuogu.vue 解析 uid，跳过')
    return
  }
  const uid = uidMatch[1]

  let user
  try {
    const html = await fetchText(`https://www.luogu.com.cn/user/${uid}?_contentOnly=1`)
    user = parseLentilleContext(html)?.data?.user
    if (!user || !user.uid) throw new Error('数据中没有 user 字段')
  } catch (e) {
    warn(`洛谷数据更新：抓取失败（${e.message}），保留原数据`)
    return
  }

  const block = src.match(/const luogu = \{[\s\S]*?\n\}/)
  if (!block) {
    warn('洛谷数据更新：找不到 luogu 常量块，跳过')
    return
  }

  let updated = false
  const changed = []
  for (const [apiKey, vueKey] of Object.entries(FIELD_MAP)) {
    let value = user[apiKey]
    if (value === undefined || value === null) continue
    if (vueKey === 'color') value = COLOR_MAP[value] || value
    let pattern
    let replacement
    if (typeof value === 'number') {
      pattern = new RegExp(`(\\b${vueKey}:\\s*)\\d+`)
      replacement = `$1${value}`
    } else {
      pattern = new RegExp(`(\\b${vueKey}:\\s*)'[^']*'`)
      replacement = `$1'${esc(String(value))}'`
    }
    if (pattern.test(block[0])) {
      const next = block[0].replace(pattern, replacement)
      if (next !== block[0]) {
        updated = true
        changed.push(`${vueKey}: ${value}`)
        block[0] = next
      }
    }
  }

  // 文章页作者名颜色与首页保持同步
  const colorHex = COLOR_MAP[user.color]
  if (colorHex) {
    const articleVueFile = path.join(
      blogRoot,
      'docs',
      '.vitepress',
      'theme',
      'components',
      'ArticleHeader.vue'
    )
    try {
      const art = fs.readFileSync(articleVueFile, 'utf8')
      const next = art.replace(
        /(\.ah-name\s*\{[\s\S]*?color:\s*)#[0-9a-fA-F]{6}/,
        `$1${colorHex}`
      )
      if (next !== art) {
        fs.writeFileSync(articleVueFile, next)
        log(`文章页作者名颜色同步：${colorHex}`)
      }
    } catch (e) {
      warn(`文章页作者名颜色同步失败（${e.message}）`)
    }
  }

  if (!updated) {
    log('洛谷数据更新：无变化')
    return
  }

  fs.writeFileSync(vueFile, src.replace(/const luogu = \{[\s\S]*?\n\}/, block[0]))
  log(`洛谷数据更新：${changed.join('，')}`)
}

export default {
  name: 'luogu-user',
  async onFinish(index, ctx) {
    await updateLuoguUser(ctx)
  },
}
