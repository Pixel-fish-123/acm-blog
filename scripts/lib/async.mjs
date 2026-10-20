// 限制并发的 map。网络抓取时用，避免一次性打满对方站点。
export async function mapLimit(items, limit, fn) {
  const list = [...items]
  const concurrency = Math.min(Math.max(1, Number(limit) || 1), list.length)
  const results = new Array(list.length)
  let next = 0

  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const index = next++
      if (index >= list.length) return
      results[index] = await fn(list[index], index)
    }
  })

  await Promise.all(workers)
  return results
}
