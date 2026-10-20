// 题解文件路径与题号相关的纯函数。
// 之前 sync / difficulty / problem-link 各有一份 idOf，规则还不完全一致，
// 这里统一成唯一实现。
import path from 'node:path'

export function platformOf(dir) {
  return String(dir || '').split(/[\\/]/)[0]
}

// 文件名去掉可选的 _solution 后缀：
//   luogu/P3384_solution.md -> P3384
//   useful_maths_conclusions/combination_formula.md -> combination_formula
export function idOf(rel) {
  return path.basename(String(rel || '')).replace(/(_solution)?\.md$/, '')
}

// luogu/P3384 -> P3384；P3379(tarjan) -> P3379
export function luoguPid(id) {
  const m = String(id || '').match(/^([A-Z]+\d+)/)
  return m ? m[1] : ''
}

// cf1748E -> 1748/E；gym101061F -> 101061/F
export function cfKey(id) {
  const m = String(id || '').match(/^(?:cf|gym)(\d+)([A-Za-z]\d*)$/)
  return m ? `${m[1]}/${m[2].toUpperCase()}` : ''
}

export function isGymId(id) {
  return /^gym\d/i.test(String(id || ''))
}
