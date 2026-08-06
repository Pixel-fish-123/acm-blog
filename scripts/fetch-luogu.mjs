// 抓取洛谷账号数据，更新 HomeLuogu.vue 中 luogu 常量（每次 npm run sync 时执行）
// 说明：洛谷接口未开放 CORS，只能在构建端抓取，无法浏览器实时请求
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vueFile = path.resolve(
  __dirname,
  '..',
  'docs',
  '.vitepress',
  'theme',
  'components',
  'HomeLuogu.vue'
)

const FIELD_MAP = {
  followingCount: 'following',
  followerCount: 'followers',
  passedProblemCount: 'passed',
  submittedProblemCount: 'submitted',
  ranking: 'ranking',
  name: 'name',
  slogan: 'slogan',
}

function esc(s) {
  return s.replace(/'/g, "\\'").replace(/\\/g, '\\\\')
}

async function main() {
  let src
  try {
    src = fs.readFileSync(vueFile, 'utf8')
  } catch {
    console.warn('洛谷数据更新：找不到 HomeLuogu.vue，跳过')
    return
  }

  const uidMatch = src.match(/luogu\.com\.cn\/user\/(\d+)/)
  if (!uidMatch) {
    console.warn('洛谷数据更新：无法从 HomeLuogu.vue 解析 uid，跳过')
    return
  }
  const uid = uidMatch[1]

  let user
  try {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    }
    const url = `https://www.luogu.com.cn/user/${uid}?_contentOnly=1`
    // 洛谷会对首次请求 302 并下发 cookie，带上 cookie 重试才能拿到数据
    let res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(15000) })
    for (let i = 0; i < 4 && res.status >= 300 && res.status < 400; i++) {
      const setCookie = res.headers.get('set-cookie')
      if (setCookie) headers['Cookie'] = setCookie.split(';')[0]
      res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(15000) })
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const m = html.match(/<script id="lentille-context"[^>]*>([\s\S]*?)<\/script>/)
    if (!m) throw new Error('未找到 lentille-context 数据')
    const data = JSON.parse(m[1])
    user = data?.data?.user
    if (!user || !user.uid) throw new Error('数据中没有 user 字段')
  } catch (e) {
    console.warn(`洛谷数据更新：抓取失败（${e.message}），保留原数据`)
    return
  }

  const block = src.match(/const luogu = \{[\s\S]*?\n\}/)
  if (!block) {
    console.warn('洛谷数据更新：找不到 luogu 常量块，跳过')
    return
  }

  let updated = false
  const changed = []
  for (const [apiKey, vueKey] of Object.entries(FIELD_MAP)) {
    const value = user[apiKey]
    if (value === undefined || value === null) continue
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

  if (!updated) {
    console.log('洛谷数据更新：无变化')
    return
  }

  fs.writeFileSync(vueFile, src.replace(/const luogu = \{[\s\S]*?\n\}/, block[0]))
  console.log(`洛谷数据更新：${changed.join('，')}`)
}

main()
