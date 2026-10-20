import test from 'node:test'
import assert from 'node:assert/strict'
import { parseFrontmatter } from '../scripts/lib/frontmatter.mjs'

test('没有 frontmatter 时原样返回正文', () => {
  const { meta, body } = parseFrontmatter('# 标题\n\n正文\n')
  assert.deepEqual(meta, {})
  assert.equal(body, '# 标题\n\n正文\n')
})

test('解析数组、引号和 CRLF', () => {
  const raw = '---\r\ntags: [树链剖分, 线段树]\r\ndifficulty: "提高+/省选-"\r\nsource: "https://example.com/a"\r\n---\r\n# 标题\r\n正文'
  const { meta, body } = parseFrontmatter(raw)
  assert.deepEqual(meta.tags, ['树链剖分', '线段树'])
  assert.equal(meta.difficulty, '提高+/省选-')
  assert.equal(meta.source, 'https://example.com/a')
  assert.equal(body, '# 标题\r\n正文')
})

test('去掉 BOM 后仍能解析 frontmatter', () => {
  const raw = '\uFEFF---\ntags: [贪心]\n---\n# 标题\n'
  const { meta, body } = parseFrontmatter(raw)
  assert.deepEqual(meta.tags, ['贪心'])
  assert.equal(body, '# 标题\n')
})

test('空数组和多余空格', () => {
  const { meta } = parseFrontmatter('---\ntags: [ 贪心 , 枚举 ]\n---\n# T\n')
  assert.deepEqual(meta.tags, ['贪心', '枚举'])
})
