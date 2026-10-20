import test from 'node:test'
import assert from 'node:assert/strict'
import {
  changedProfileKeys,
  mergeProfile,
} from '../scripts/lib/luogu-profile.mjs'

test('mergeProfile 更新 uid、home、文本和数字字段', () => {
  const current = {
    uid: '1',
    home: 'https://www.luogu.com.cn/user/1',
    name: 'old',
    slogan: 'old',
    color: '#000000',
    followers: 1,
  }
  const next = mergeProfile(current, {
    uid: 2,
    name: 'new',
    slogan: "a'b\\c\nd",
    color: 'Blue',
    followerCount: '9',
    passedProblemCount: 385,
    submittedProblemCount: null,
  })
  assert.equal(next.uid, '2')
  assert.equal(next.home, 'https://www.luogu.com.cn/user/2')
  assert.equal(next.name, 'new')
  assert.equal(next.slogan, "a'b\\c\nd")
  assert.equal(next.color, '#3498db')
  assert.equal(next.followers, 9)
  assert.equal(next.passed, 385)
  // null 不覆盖旧值
  assert.equal(next.submitted, undefined)
  // 入参不被修改
  assert.equal(current.uid, '1')
  assert.equal(current.name, 'old')
})

test('mergeProfile 输出可被 JSON 安全序列化', () => {
  const next = mergeProfile({}, { name: 'a\'b\\c\nd', slogan: '</script>' })
  const roundtrip = JSON.parse(JSON.stringify(next))
  assert.equal(roundtrip.name, 'a\'b\\c\nd')
  assert.equal(roundtrip.slogan, '</script>')
})

test('mergeProfile 保留无人识别的颜色值', () => {
  const next = mergeProfile({}, { color: '#123456' })
  assert.equal(next.color, '#123456')
})

test('changedProfileKeys 找出新增和变化字段', () => {
  assert.deepEqual(
    changedProfileKeys({ a: 1, b: 'x' }, { a: 1, b: 'y', c: true }).sort(),
    ['b', 'c']
  )
})
