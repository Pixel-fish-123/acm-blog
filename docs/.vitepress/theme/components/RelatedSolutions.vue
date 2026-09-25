<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import solutionIndex from '../../solutionIndex.json'
import { useCurrentSolution } from '../solution.js'

// 文章底部「相关题解」：按共同标签数降序取前 5 篇，数量相同时同平台优先
const MAX = 5

const solution = useCurrentSolution()

const related = computed(() => {
  const current = solution.value
  const mine = current?.tags || []
  if (!mine.length) return []

  const matched = new Set(mine)
  return solutionIndex
    .filter((item) => item.link !== current.link)
    .map((item) => {
      const shared = (item.tags || []).filter((tag) => matched.has(tag)).length
      const sameCategory = item.category === current.category ? 1 : 0
      return { item, shared, sameCategory }
    })
    .filter((entry) => entry.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.sameCategory - a.sameCategory ||
        (b.item.date || '').localeCompare(a.item.date || '')
    )
    .slice(0, MAX)
    .map((entry) => entry.item)
})
</script>

<template>
  <section v-if="related.length" class="rs-card">
    <header class="rs-head">
      <h2 class="rs-title">相关题解</h2>
      <span class="rs-sub">按共同算法标签推荐</span>
    </header>
    <ul class="rs-list">
      <li v-for="item in related" :key="item.link" class="rs-item">
        <a class="rs-link" :href="withBase(item.link)">{{ item.title }}</a>
        <span class="rs-cat">{{ item.category }}</span>
        <span class="rs-tags">
          <span v-for="tag in item.tags || []" :key="tag" class="rs-tag">{{ tag }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.rs-card {
  margin-top: 32px;
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 4px;
}

.rs-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #eef1f6;
}

.rs-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2d3436;
  border: none;
  padding: 0;
}

.rs-sub {
  font-size: 12px;
  color: #a0aab6;
}

.rs-list {
  margin: 0;
  padding: 4px 0 8px;
  list-style: none;
}

.rs-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 8px 20px;
  border-bottom: 1px solid #f2f4f8;
}

.rs-item:last-child {
  border-bottom: none;
}

.rs-item:hover {
  background: #f7fafd;
}

.rs-link {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #2d3436;
  text-decoration: none;
}

.rs-item:hover .rs-link {
  color: #3498db;
}

.rs-cat {
  flex-shrink: 0;
  padding: 1px 7px;
  font-size: 12px;
  color: #3498db;
  background: #eaf3fb;
  border-radius: 3px;
  white-space: nowrap;
}

.rs-tags {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.rs-tag {
  padding: 1px 6px;
  font-size: 11px;
  color: #4a5664;
  background: #f2f4f8;
  border-radius: 3px;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .rs-tags {
    display: none;
  }
}
</style>
