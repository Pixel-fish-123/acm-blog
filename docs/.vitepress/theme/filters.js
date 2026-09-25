// 首页筛选：解析/序列化 URL 参数、过滤、排序、统计。
// 首页（HomeLuogu.vue）负责持有筛选状态，SolutionFilter.vue 只负责渲染控件。
// 题解页抬头的标签链接指向 `/?tag=xxx`，靠 parseFilters 在这里被读回来。

// 洛谷难度档位顺序，与 scripts/plugins/difficulty.mjs 的 LUOGU_DIFFICULTY 保持一致（改了要同步改那边）
export const LUOGU_TIERS = [
  '暂无评定',
  '入门',
  '普及-',
  '普及',
  '普及+/提高-',
  '提高',
  '提高+/省选-',
  '省选/NOI-',
  'NOI/NOI+/CTS',
]

// 抓不到难度的题（gym / ICPC / 牛客等 id 不匹配的平台）统一显示为「未标注」
export const UNKNOWN_DIFFICULTY = '未标注'

export const SORT_OPTIONS = [
  { value: 'date', label: '日期倒序' },
  { value: 'id', label: '题号' },
  { value: 'difficulty', label: '难度' },
]

export function emptyFilters() {
  return { q: '', cat: '', tags: [], diffs: [], sort: 'date' }
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// `?q=&cat=&tag=a,b&diff=&sort=` -> filters
export function parseFilters(search) {
  const filters = emptyFilters()
  if (!search) return filters
  const params = new URLSearchParams(search.startsWith('?') ? search : '?' + search)
  filters.q = (params.get('q') || '').trim()
  filters.cat = params.get('cat') || ''
  filters.tags = splitList(params.get('tag'))
  filters.diffs = splitList(params.get('diff'))
  const sort = params.get('sort')
  if (SORT_OPTIONS.some((option) => option.value === sort)) filters.sort = sort
  return filters
}

// filters -> `?q=&cat=&tag=a,b&diff=&sort=`（默认项不写进 URL）
export function toQuery(filters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.cat) params.set('cat', filters.cat)
  if (filters.tags.length) params.set('tag', filters.tags.join(','))
  if (filters.diffs.length) params.set('diff', filters.diffs.join(','))
  if (filters.sort && filters.sort !== 'date') params.set('sort', filters.sort)
  const query = params.toString()
  return query ? '?' + query : ''
}

export function isFiltering(filters) {
  return Boolean(filters.q || filters.cat || filters.tags.length || filters.diffs.length)
}

export function difficultyLabel(item) {
  return item.difficulty || UNKNOWN_DIFFICULTY
}

// 排序用的粗糙难度档位：洛谷取档位下标，CF 按 rating 分段折算到同一把尺子上
export function difficultyRank(item) {
  const text = item.difficulty
  if (!text) return 999
  const cf = String(text).match(/^CF\s+(\d+)$/i)
  if (cf) {
    const rating = Number(cf[1])
    if (rating < 1200) return 2
    if (rating < 1400) return 3
    if (rating < 1600) return 4
    if (rating < 1900) return 6
    if (rating < 2100) return 7
    return 8
  }
  const index = LUOGU_TIERS.indexOf(text)
  return index < 0 ? 999 : index
}

export function matches(item, filters) {
  if (filters.cat && item.category !== filters.cat) return false
  if (filters.tags.length) {
    const own = item.tags || []
    if (!filters.tags.every((tag) => own.includes(tag))) return false
  }
  if (filters.diffs.length && !filters.diffs.includes(difficultyLabel(item))) return false
  if (filters.q) {
    const needle = filters.q.toLowerCase()
    const haystack = [item.id, item.title, item.summary, ...(item.tags || [])]
      .join('\n')
      .toLowerCase()
    if (!haystack.includes(needle)) return false
  }
  return true
}

export function sortItems(items, sort) {
  const out = [...items]
  const byId = (a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })
  if (sort === 'id') out.sort(byId)
  else if (sort === 'difficulty') out.sort((a, b) => difficultyRank(a) - difficultyRank(b) || byId(a, b))
  else out.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title, 'zh'))
  return out
}

export function countBy(items, valueOf) {
  const map = new Map()
  for (const item of items) {
    const key = valueOf(item)
    if (key) map.set(key, (map.get(key) || 0) + 1)
  }
  return map
}

// 标签 + 数量，按数量降序、同数量按名称
export function collectTags(items) {
  const map = new Map()
  for (const item of items) {
    for (const tag of item.tags || []) map.set(tag, (map.get(tag) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))
    .map(([name, count]) => ({ name, count }))
}

// 难度分布：洛谷档位按顺序在前，CF 按 rating 升序居中，未标注放最后
export function difficultyStats(items) {
  const counted = countBy(items, difficultyLabel)
  const colorOf = (name) => {
    const hit = items.find((item) => difficultyLabel(item) === name)
    return hit?.difficultyColor || '#bfbfbf'
  }
  const luogu = LUOGU_TIERS.filter((name) => counted.has(name))
  const cf = [...counted.keys()]
    .filter((name) => /^CF\s+\d+$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  const known = new Set([...luogu, ...cf, UNKNOWN_DIFFICULTY])
  const rest = [...counted.keys()].filter((name) => !known.has(name)).sort()
  const names = [...luogu, ...cf, ...rest]
  if (counted.has(UNKNOWN_DIFFICULTY)) names.push(UNKNOWN_DIFFICULTY)
  return names.map((name) => ({ name, count: counted.get(name), color: colorOf(name) }))
}
