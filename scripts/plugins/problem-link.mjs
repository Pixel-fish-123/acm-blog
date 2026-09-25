// 插件：frontmatter 缺 source 时按文件名推断原题链接
// 只推断洛谷 / Codeforces / AtCoder 三种，其余平台不猜（与 solution-frontmatter.mdc 一致）
import path from 'node:path'

function platformOf(dir) {
  return String(dir || '').split(/[\\/]/)[0]
}

function idOf(rel) {
  return path.basename(rel).replace(/_solution\.md$/, '')
}

// luogu/P3384 -> https://www.luogu.com.cn/problem/P3384
// luogu/P3379(tarjan) -> https://www.luogu.com.cn/problem/P3379
function luoguSource(id) {
  const m = id.match(/^([A-Z]+\d+)/)
  return m ? `https://www.luogu.com.cn/problem/${m[1]}` : ''
}

// codeforces/cf1748E -> https://codeforces.com/problemset/problem/1748/E
function codeforcesSource(id) {
  const m = id.match(/^cf(\d+)([A-Za-z]\d*)$/)
  return m ? `https://codeforces.com/problemset/problem/${m[1]}/${m[2].toUpperCase()}` : ''
}

// atcoder/agc_028B -> https://atcoder.jp/contests/agc028/tasks/agc028_b
function atcoderSource(id) {
  const m = id.match(/^([a-z]+)_(\d+)([A-Za-z]\d*)$/)
  if (!m) return ''
  const contest = `${m[1]}${m[2]}`
  return `https://atcoder.jp/contests/${contest}/tasks/${contest}_${m[3].toLowerCase()}`
}

export default {
  name: 'problem-link',
  onSolution(sol, ctx) {
    if (sol.meta.source) return

    const platform = platformOf(sol.dir)
    const id = idOf(sol.rel)
    let source = ''
    if (platform.startsWith('luogu')) source = luoguSource(id)
    else if (platform.startsWith('codeforces')) source = codeforcesSource(id)
    else if (platform.startsWith('atcoder')) source = atcoderSource(id)

    if (!source) return
    sol.meta.source = source
    ctx.log(`  problem-link: ${sol.rel} -> ${source}`)
  },
}
