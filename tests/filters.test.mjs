import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LUOGU_TIERS,
  badgeTextColor,
  difficultyRank,
  difficultyStats,
  matches,
  parseFilters,
  sortItems,
  toQuery,
} from '../docs/.vitepress/theme/filters.js'
import { LUOGU_TIERS as SHARED_TIERS } from '../docs/.vitepress/theme/luoguDifficulty.js'

const items = [
  {
    id: 'P3384',
    title: 'P3384 树链剖分',
    category: '洛谷',
    summary: '模板题',
    tags: ['树链剖分', '线段树'],
    difficulty: '提高+/省选-',
    difficultyColor: '#3498db',
    date: '2026-09-02',
  },
  {
    id: 'cf1748E',
    title: 'cf1748E 计数',
    category: 'Codeforces',
    summary: '笛卡尔树',
    tags: ['笛卡尔树', '计数DP'],
    difficulty: 'CF 2300',
    difficultyColor: '#f39c12',
    date: '2026-09-03',
  },
  {
    id: 'gym1A',
    title: 'gym1A',
    category: 'Codeforces',
    summary: '没有难度',
    tags: ['贪心'],
    date: '2026-09-01',
  },
]

test('难度档位只有一份来源', () => {
  assert.deepEqual(LUOGU_TIERS, SHARED_TIERS)
  assert.equal(LUOGU_TIERS[0], '暂无评定')
  assert.equal(LUOGU_TIERS.at(-1), 'NOI/NOI+/CTS')
})

test('URL 参数往返', () => {
  const filters = parseFilters('?q=树链&cat=洛谷&tag=树链剖分,线段树&diff=提高&sort=id')
  assert.equal(filters.q, '树链')
  assert.equal(filters.cat, '洛谷')
  assert.deepEqual(filters.tags, ['树链剖分', '线段树'])
  assert.deepEqual(filters.diffs, ['提高'])
  assert.equal(filters.sort, 'id')
  assert.equal(toQuery(filters), '?q=%E6%A0%91%E9%93%BE&cat=%E6%B4%9B%E8%B0%B7&tag=%E6%A0%91%E9%93%BE%E5%89%96%E5%88%86%2C%E7%BA%BF%E6%AE%B5%E6%A0%91&diff=%E6%8F%90%E9%AB%98&sort=id')
})

test('matches 支持关键词、平台、标签 AND 和难度', () => {
  const filters = parseFilters(
    '?q=树链&cat=洛谷&tag=树链剖分,线段树&diff=' + encodeURIComponent('提高+/省选-')
  )
  assert.equal(matches(items[0], filters), true)
  assert.equal(matches(items[1], filters), false)
  assert.equal(matches(items[0], parseFilters('?tag=不存在')), false)
})

test('难度排序把 CF 折算到洛谷档位，未标注放最后', () => {
  assert.equal(difficultyRank({ difficulty: 'CF 1200' }) < difficultyRank({ difficulty: 'CF 2300' }), true)
  assert.equal(difficultyRank({}), 999)
  const sorted = sortItems(items, 'difficulty')
  assert.equal(sorted.at(-1).id, 'gym1A')
})

test('难度统计顺序：洛谷档位、CF、未知', () => {
  const stats = difficultyStats(items)
  assert.deepEqual(stats.map((item) => item.name), ['提高+/省选-', 'CF 2300', '未标注'])
  assert.equal(stats[2].count, 1)
})

test('徽章文字色按亮度选择', () => {
  assert.equal(badgeTextColor('#ffffff'), '#2d3436')
  assert.equal(badgeTextColor('#000000'), '#fff')
  assert.equal(badgeTextColor('not-a-color'), '#fff')
})
