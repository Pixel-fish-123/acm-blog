import test from 'node:test'
import assert from 'node:assert/strict'
import { isFresh } from '../scripts/lib/cache.mjs'

const NOW = Date.parse('2026-10-20T12:00:00Z')

test('isFresh 支持 ISO 和时间戳', () => {
  assert.equal(isFresh('2026-10-20T11:00:00Z', 2 * 60 * 60 * 1000, NOW), true)
  assert.equal(isFresh(NOW - 1000, 5000, NOW), true)
  assert.equal(isFresh(NOW - 10_000, 5000, NOW), false)
})

test('isFresh 对缺失、非法值和未来时间', () => {
  assert.equal(isFresh(undefined, 1000, NOW), false)
  assert.equal(isFresh('', 1000, NOW), false)
  assert.equal(isFresh('not-a-date', 1000, NOW), false)
  // 时钟偏差导致的未来时间按新鲜处理
  assert.equal(isFresh(NOW + 1000, 5000, NOW), true)
})

test('isFresh 边界', () => {
  assert.equal(isFresh(NOW - 1000, 1000, NOW), true)
  assert.equal(isFresh(NOW - 1001, 1000, NOW), false)
})
