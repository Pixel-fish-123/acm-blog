import test from 'node:test'
import assert from 'node:assert/strict'
import {
  platformOf,
  idOf,
  luoguPid,
  cfKey,
  isGymId,
} from '../scripts/lib/problem-id.mjs'

test('platformOf 取第一级目录，兼容反斜杠', () => {
  assert.equal(platformOf('luogu'), 'luogu')
  assert.equal(platformOf('codeforces/gym101061F'), 'codeforces')
  assert.equal(platformOf('codeforces\\gym101061F'), 'codeforces')
  assert.equal(platformOf(''), '')
})

test('idOf 同时支持 _solution.md 和普通 .md', () => {
  assert.equal(idOf('luogu/P3384_solution.md'), 'P3384')
  assert.equal(idOf('codeforces/cf1748E_solution.md'), 'cf1748E')
  assert.equal(idOf('useful_maths_conclusions/combination_formula.md'), 'combination_formula')
  assert.equal(idOf('luogu/P3379(tarjan)_solution.md'), 'P3379(tarjan)')
  assert.equal(idOf('nowcoder_summer_holiday_competition7/G_solution.md'), 'G')
})

test('luoguPid 从题号前缀取题号', () => {
  assert.equal(luoguPid('P3384'), 'P3384')
  assert.equal(luoguPid('SP18185'), 'SP18185')
  assert.equal(luoguPid('P3379(tarjan)'), 'P3379')
  assert.equal(luoguPid('abc'), '')
})

test('cfKey 支持普通 CF 和 Gym', () => {
  assert.equal(cfKey('cf1748E'), '1748/E')
  assert.equal(cfKey('cf2261A'), '2261/A')
  assert.equal(cfKey('gym101061F'), '101061/F')
  assert.equal(cfKey('abc'), '')
})

test('isGymId 只认 gym 前缀', () => {
  assert.equal(isGymId('gym101061F'), true)
  assert.equal(isGymId('Gym101061F'), true)
  assert.equal(isGymId('cf1748E'), false)
})
