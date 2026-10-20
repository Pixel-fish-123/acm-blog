import test from 'node:test'
import assert from 'node:assert/strict'
import { sourceRelOf } from '../scripts/lib/source-path.mjs'

test('solutions 使用 solutions/ 前缀', () => {
  assert.equal(sourceRelOf({ rel: 'luogu/P3384_solution.md' }), 'solutions/luogu/P3384_solution.md')
  assert.equal(sourceRelOf({ rel: 'luogu\\P3384_solution.md' }), 'solutions/luogu/P3384_solution.md')
})

test('extraDirs 使用显式 srcRel', () => {
  assert.equal(
    sourceRelOf({ rel: 'useful_maths_conclusions/combination_formula.md', srcRel: 'useful_maths_conclusions/combination_formula.md' }),
    'useful_maths_conclusions/combination_formula.md'
  )
})

test('srcRel 里的反斜杠会归一化', () => {
  assert.equal(sourceRelOf({ rel: 'x.md', srcRel: 'useful_maths_conclusions\\x.md' }), 'useful_maths_conclusions/x.md')
})
