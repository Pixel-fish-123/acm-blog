import test from 'node:test'
import assert from 'node:assert/strict'
import { h1Of, summaryOf } from '../scripts/lib/markdown.mjs'

test('h1Of 提取第一个一级标题并去掉 BOM', () => {
  assert.equal(h1Of('\uFEFF# P3384 题解\n\n## 题意'), 'P3384 题解')
  assert.equal(h1Of('正文\n没有标题'), '')
})

test('summaryOf 去掉代码、frontmatter 和 LaTeX 命令', () => {
  const raw = [
    '---',
    'tags: [贪心]',
    '---',
    '# 标题',
    '',
    '给定 $n$ 个数，求 $\\frac{a}{b}$。',
    '',
    '```cpp',
    'int main() {}',
    '```',
    '',
    '然后贪心。',
  ].join('\n')
  const summary = summaryOf(raw)
  assert.equal(summary.includes('int main'), false)
  assert.equal(summary.includes('tags:'), false)
  assert.equal(summary.includes('frac'), false)
  assert.equal(summary.includes('贪心'), true)
})

test('summaryOf 超长时截断并加省略号', () => {
  const summary = summaryOf('字'.repeat(100), 10)
  assert.equal(summary, '字'.repeat(10) + '...')
})
