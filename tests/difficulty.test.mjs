import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import difficulty, {
  LUOGU_DIFFICULTY,
  cfColor,
  collectCfKeys,
  colorOfDifficulty,
} from '../scripts/plugins/difficulty.mjs'
import { LUOGU_DIFFICULTY as SHARED } from '../docs/.vitepress/theme/luoguDifficulty.js'

test('difficulty 插件复用共享难度表', () => {
  assert.deepEqual(LUOGU_DIFFICULTY, SHARED)
  assert.equal(LUOGU_DIFFICULTY.length, 9)
})

test('colorOfDifficulty 支持洛谷档位和 CF rating', () => {
  assert.equal(colorOfDifficulty('提高+/省选-'), '#3498db')
  assert.equal(colorOfDifficulty('CF 2300'), cfColor(2300))
  assert.equal(colorOfDifficulty('未知'), '#bfbfbf')
  assert.equal(colorOfDifficulty(''), '#bfbfbf')
})

test('cfColor 分段边界', () => {
  assert.equal(cfColor(1199), '#bfbfbf')
  assert.equal(cfColor(1200), '#52c41a')
  assert.equal(cfColor(1400), '#00c0c0')
  assert.equal(cfColor(1600), '#3498db')
  assert.equal(cfColor(1900), '#9d3dcf')
  assert.equal(cfColor(2100), '#f39c12')
  assert.equal(cfColor(2400), '#fe4c61')
})

test('collectCfKeys 跳过 Gym、洛谷和已有难度的题', () => {
  const keys = collectCfKeys([
    { rel: 'codeforces/cf1748E_solution.md', dir: 'codeforces', meta: {} },
    { rel: 'codeforces/gym101061F_solution.md', dir: 'codeforces', meta: {} },
    { rel: 'codeforces/cf2261A_solution.md', dir: 'codeforces', meta: { difficulty: 'CF 800' } },
    { rel: 'luogu/P3384_solution.md', dir: 'luogu', meta: {} },
    { rel: 'codeforces/cf1748E_solution.md', dir: 'codeforces', meta: {} },
  ])
  assert.deepEqual(keys, ['1748/E'])
})

test('difficulty 在离线模式只使用已有缓存，状态按 ctx 隔离', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acm-blog-difficulty-'))
  try {
    fs.writeFileSync(
      path.join(dataDir, 'problemCache.json'),
      JSON.stringify({
        luogu: { P1: { difficulty: '提高', color: '#00c0c0', checkedAt: '2026-10-20T00:00:00Z' } },
        cf: { '1748/E': { rating: 2300, color: '#f39c12', checkedAt: '2026-10-20T00:00:00Z' } },
      })
    )
    const sols = [
      { rel: 'luogu/P1_solution.md', dir: 'luogu', meta: {} },
      { rel: 'codeforces/cf1748E_solution.md', dir: 'codeforces', meta: {} },
    ]
    const ctx = {
      dataDir,
      solutions: sols,
      offline: true,
      log() {},
      warn() {},
    }
    await difficulty.onSolution(sols[0], ctx)
    await difficulty.onSolution(sols[1], ctx)
    assert.equal(sols[0].meta.difficulty, '提高')
    assert.equal(sols[0].meta.difficultyColor, '#00c0c0')
    assert.equal(sols[1].meta.difficulty, 'CF 2300')
    assert.equal(sols[1].meta.difficultyColor, '#f39c12')
    assert.notEqual(ctx.difficultyState, undefined)
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }
})
