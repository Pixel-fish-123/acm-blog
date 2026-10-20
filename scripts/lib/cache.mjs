// 缓存时间判断。checkedAt 可以是 ISO 字符串或毫秒时间戳；
// 缺失/非法值一律视为过期，让调用方重新抓取。
export function isFresh(checkedAt, ttlMs, now = Date.now()) {
  if (checkedAt === undefined || checkedAt === null || checkedAt === '') return false
  const time = typeof checkedAt === 'number' ? checkedAt : Date.parse(String(checkedAt))
  if (!Number.isFinite(time)) return false
  return Math.abs(now - time) <= ttlMs
}
