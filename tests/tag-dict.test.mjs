import test from 'node:test'
import assert from 'node:assert/strict'
import { ALIAS_RULES, inferTags, parseVocabulary } from '../scripts/plugins/tag-dict.mjs'

test('parseVocabulary 只读取「按类分组」之后的行并去掉括号注释', () => {
  const markdown = [
    '# SKILL',
    '',
    '## 标签词表',
    '',
    '这一行是说明，不参与词表',
    '',
    '按类分组，只能从下表取词：',
    '- 基础：贪心、枚举、交互（必须放第一位）',
    '- 数据结构：线段树、树状数组',
    '',
    '## 模板',
    '- 不应被读取',
  ].join('\n')
  assert.deepEqual(parseVocabulary(markdown), ['贪心', '枚举', '交互', '线段树', '树状数组'])
})

test('inferTags 同一起点取最长匹配，主算法在前', () => {
  const vocabulary = ['贪心', 'DP', '线性DP', '线段树', '分治', 'CDQ分治']
  const tags = inferTags('**算法类型**：CDQ分治 + 线段树', vocabulary)
  assert.deepEqual(tags, ['CDQ分治', '线段树'])
})

test('inferTags 使用别名规则', () => {
  const vocabulary = ['树状数组']
  assert.deepEqual(inferTags('算法类型：BIT', vocabulary), ['树状数组'])
  assert.equal(ALIAS_RULES.some(([, tag]) => tag === '树状数组'), true)
})

test('inferTags 最多返回 4 个标签', () => {
  const vocabulary = ['a', 'b', 'c', 'd', 'e']
  assert.deepEqual(inferTags('a b c d e', vocabulary, 4), ['a', 'b', 'c', 'd'])
})

test('inferTags 识别细分别名且英文缩写不跨词误匹配', () => {
  const vocabulary = [
    '树状数组',
    'CDQ分治',
    '分治',
    '树上差分',
    '欧拉回路',
    '强连通分量',
    '割点与桥',
    '0-1Trie',
    '计算几何',
  ]
  assert.deepEqual(inferTags('bit-parallel LCS', vocabulary), [])
  assert.deepEqual(inferTags('CDQ 分治 + 带权 BIT', vocabulary), ['CDQ分治', '树状数组'])
  assert.deepEqual(
    inferTags('欧拉环游 + 树上点差分 + 0-1 字典树 + 多边形不等式', vocabulary, 6),
    ['欧拉回路', '树上差分', '0-1Trie', '计算几何']
  )
})
