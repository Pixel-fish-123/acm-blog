import test from 'node:test'
import assert from 'node:assert/strict'
import { mapLimit } from '../scripts/lib/async.mjs'

test('mapLimit 保持结果顺序并限制并发', async () => {
  let active = 0
  let maxActive = 0
  const result = await mapLimit([1, 2, 3, 4, 5, 6], 3, async (value) => {
    active++
    maxActive = Math.max(maxActive, active)
    await new Promise((resolve) => setTimeout(resolve, 5))
    active--
    return value * 2
  })
  assert.deepEqual(result, [2, 4, 6, 8, 10, 12])
  assert.equal(maxActive <= 3, true)
})

test('mapLimit 处理空数组和非法并发数', async () => {
  assert.deepEqual(await mapLimit([], 3, async () => 1), [])
  assert.deepEqual(await mapLimit([1, 2], 0, async (value) => value + 1), [2, 3])
})
