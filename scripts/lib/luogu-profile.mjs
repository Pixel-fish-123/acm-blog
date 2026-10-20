// 洛谷账号资料的纯函数：把接口返回值合并进 profile.json，不再改 .vue 源码。
export const COLOR_MAP = {
  Gray: '#7f8c9b',
  Red: '#e74c3c',
  Yellow: '#f1c40f',
  Green: '#52c41a',
  Blue: '#3498db',
  Purple: '#9b59b6',
  Orange: '#f39c12',
  Gold: '#d4a017',
}

const COUNT_FIELDS = [
  ['followingCount', 'following'],
  ['followerCount', 'followers'],
  ['passedProblemCount', 'passed'],
  ['submittedProblemCount', 'submitted'],
  ['ranking', 'ranking'],
]

const TEXT_FIELDS = [
  ['name', 'name'],
  ['slogan', 'slogan'],
]

// current: profile.json 现有内容；user: 洛谷接口的 data.user；uid: 可选的显式 uid。
// 返回新对象，不修改入参。字符串里的引号/反斜杠/换行由 JSON.stringify 统一处理。
export function mergeProfile(current = {}, user = {}, { uid } = {}) {
  const next = { ...current }
  const resolvedUid = String(uid ?? user.uid ?? current.uid ?? '').trim()
  if (resolvedUid) {
    next.uid = resolvedUid
    next.home = `https://www.luogu.com.cn/user/${resolvedUid}`
  }

  for (const [apiKey, profileKey] of TEXT_FIELDS) {
    const value = user[apiKey]
    if (value === undefined || value === null) continue
    next[profileKey] = String(value)
  }

  for (const [apiKey, profileKey] of COUNT_FIELDS) {
    const value = user[apiKey]
    if (value === undefined || value === null || value === '') continue
    const number = Number(value)
    if (Number.isFinite(number)) next[profileKey] = number
  }

  if (user.color !== undefined && user.color !== null) {
    const color = String(user.color)
    next.color = COLOR_MAP[color] || color
  }

  return next
}

export function changedProfileKeys(before = {}, after = {}) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  return [...keys].filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])
  )
}
