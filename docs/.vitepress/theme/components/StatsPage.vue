<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import solutionIndex from '../../solutionIndex.json'

// 上传时间线：按首次上传日期（solutionIndex.json 的 date，git 首次加入日期）聚合题解，
// 纯 CSS 条状图，不引入图表库。数据来源见 scripts/plugins/git-date.mjs。
const UNKNOWN = '未知日期'

// 按日期升序分组；无日期的归到末尾的「未知日期」
const groups = computed(() => {
  const map = new Map()
  for (const item of solutionIndex) {
    const key = item.date || UNKNOWN
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  const dated = [...map.entries()].filter(([date]) => date !== UNKNOWN)
  dated.sort((a, b) => a[0].localeCompare(b[0]))
  const withUnknown = [...dated]
  if (map.has(UNKNOWN)) withUnknown.push([UNKNOWN, map.get(UNKNOWN)])
  return withUnknown.map(([date, items]) => {
    items.sort((a, b) => a.title.localeCompare(b.title, 'zh'))
    return { date, items, count: items.length }
  })
})

// 单日最大篇数：条宽按它取百分比
const maxCount = computed(() =>
  groups.value.reduce((max, g) => (g.date === UNKNOWN ? max : Math.max(max, g.count)), 0)
)

const totalCount = computed(() => solutionIndex.length)
const dayCount = computed(() => groups.value.filter((g) => g.date !== UNKNOWN).length)

// 时间跨度
const span = computed(() => {
  const dated = groups.value.filter((g) => g.date !== UNKNOWN)
  if (!dated.length) return '—'
  const first = dated[0].date
  const last = dated[dated.length - 1].date
  return first === last ? first : `${first} ~ ${last}`
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
function weekday(date) {
  const d = new Date(`${date}T00:00:00`)
  return Number.isNaN(d.getTime()) ? '' : `周${weekdays[d.getDay()]}`
}

// 默认全部展开；点一行收起/展开当天的题解列表
const collapsed = ref({})
const toggle = (date) => {
  collapsed.value = { ...collapsed.value, [date]: !collapsed.value[date] }
}
</script>

<template>
  <div class="st-page">
    <div class="st-main">
      <section class="st-card">
        <header class="st-head">
          <h1 class="st-title">上传时间线</h1>
          <span class="st-sub">按首次上传日期统计</span>
        </header>

        <div v-if="groups.length" class="st-summary">
          <div class="st-stat">
            <b>{{ totalCount }}</b>
            <span>题解总数</span>
          </div>
          <div class="st-stat">
            <b>{{ dayCount }}</b>
            <span>有上传的天数</span>
          </div>
          <div class="st-stat">
            <b>{{ maxCount }}</b>
            <span>单日最多</span>
          </div>
          <div class="st-stat st-stat-wide">
            <b class="st-span">{{ span }}</b>
            <span>时间跨度</span>
          </div>
        </div>

        <div v-if="groups.length" class="st-chart">
          <div v-for="g in groups" :key="g.date" class="st-row">
            <button class="st-row-btn" @click="toggle(g.date)">
              <span class="st-date-col">
                <span class="st-date">{{ g.date }}</span>
                <span v-if="g.date !== UNKNOWN" class="st-weekday">{{ weekday(g.date) }}</span>
              </span>
              <span class="st-bar-col">
                <span
                  class="st-bar"
                  :class="{ 'st-bar-unknown': g.date === UNKNOWN }"
                  :style="{ width: maxCount ? Math.max((g.count / maxCount) * 100, 2) + '%' : '2%' }"
                ></span>
                <span class="st-count">{{ g.count }}</span>
              </span>
              <span class="st-caret">{{ collapsed[g.date] ? '展开' : '收起' }}</span>
            </button>

            <ul v-if="!collapsed[g.date]" class="st-list">
              <li v-for="item in g.items" :key="item.link" class="st-item">
                <a class="st-link" :href="withBase(item.link)">{{ item.title }}</a>
                <span class="st-cat">{{ item.category }}</span>
              </li>
            </ul>
          </div>
        </div>

        <p v-else class="st-empty">暂无上传记录</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.st-page {
  min-height: 100%;
  background: #f4f6f9;
  padding: 24px 16px 40px;
}

.st-main {
  max-width: 900px;
  margin: 0 auto;
}

.st-card {
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 4px;
}

.st-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #eef1f6;
}

.st-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
}

.st-sub {
  font-size: 12px;
  color: #a0aab6;
}

/* ---- 顶部汇总 ---- */
.st-summary {
  display: flex;
  padding: 14px 24px;
  border-bottom: 1px solid #eef1f6;
}

.st-stat {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.st-stat-wide {
  flex: 1.6;
}

.st-stat b {
  display: block;
  font-size: 18px;
  color: #2d3436;
}

.st-stat .st-span {
  font-size: 14px;
  line-height: 24px;
}

.st-stat span {
  font-size: 12px;
  color: #7f8c9b;
}

/* ---- 条状图 ---- */
.st-chart {
  padding: 8px 0 12px;
}

.st-row + .st-row {
  border-top: 1px solid #f2f4f8;
}

.st-row-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 24px;
  background: none;
  border: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.st-row-btn:hover {
  background: #f7fafd;
}

.st-date-col {
  flex-shrink: 0;
  width: 116px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.st-date {
  font-size: 13px;
  color: #4a5664;
  font-variant-numeric: tabular-nums;
}

.st-weekday {
  font-size: 11px;
  color: #a0aab6;
}

.st-bar-col {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.st-bar {
  height: 12px;
  min-width: 3px;
  background: #3498db;
  border-radius: 2px;
  transition: width 0.2s;
}

.st-bar-unknown {
  background: #bfbfbf;
}

.st-count {
  flex-shrink: 0;
  font-size: 12px;
  color: #6b7785;
  font-variant-numeric: tabular-nums;
}

.st-caret {
  flex-shrink: 0;
  font-size: 11px;
  color: #a0aab6;
}

/* ---- 当天题解列表 ---- */
.st-list {
  margin: 0 0 10px;
  padding: 0 24px 0 152px;
  list-style: none;
}

.st-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 4px 0;
}

.st-link {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #4a5664;
  text-decoration: none;
}

.st-link:hover {
  color: #3498db;
}

.st-cat {
  flex-shrink: 0;
  padding: 1px 6px;
  font-size: 11px;
  color: #3498db;
  background: #eaf3fb;
  border-radius: 3px;
  white-space: nowrap;
}

.st-empty {
  margin: 0;
  padding: 40px 24px;
  text-align: center;
  font-size: 14px;
  color: #7f8c9b;
}

@media (max-width: 720px) {
  .st-summary {
    flex-wrap: wrap;
    gap: 12px 0;
  }

  .st-stat {
    flex: 1 1 40%;
  }

  .st-date-col {
    width: 96px;
  }

  .st-caret {
    display: none;
  }

  .st-list {
    padding-left: 24px;
  }
}
</style>
