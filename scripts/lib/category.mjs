// 分类目录名 → 展示名（洛谷风格中文平台名）
export function categoryName(dir) {
  if (dir === '专题') return '专题'
  if (dir === 'greedy_tuition') return '贪心入门'
  const m = dir.match(/^nowcoder_summer_holiday_competition(\d*)$/)
  if (m) return '牛客暑期联赛' + (m[1] ? `（第${m[1]}场）` : '')
  if (dir.startsWith('nowcoder')) return '牛客' + dir.replace(/^nowcoder_?/, '')
  const mi = dir.match(/^icpc_(\d{4})_online(?:_ver(\d))?$/)
  if (mi) return `ICPC ${mi[1]} 网络赛` + (mi[2] ? `（第${mi[2]}场）` : '')
  if (dir.startsWith('codeforces')) return 'Codeforces'
  if (dir.startsWith('luogu')) return '洛谷'
  if (dir.startsWith('atcoder')) return 'AtCoder'
  if (dir.startsWith('leetcode')) return 'LeetCode'
  return dir
}
