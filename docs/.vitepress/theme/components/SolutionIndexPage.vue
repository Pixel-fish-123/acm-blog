<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import solutionIndex from '../../solutionIndex.json'

// 索引页：左侧按平台分组的题解列表，右侧算法标签筛选框
const selected = ref([])

const allTags = computed(() => {
  const counter = new Map()
  for (const item of solutionIndex) {
    for (const tag of item.tags || []) counter.set(tag, (counter.get(tag) || 0) + 1)
  }
  return [...counter.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh')
  )
})

// 多选：所选标签全部命中才保留
const filtered = computed(() =>
  selected.value.length
    ? solutionIndex.filter((item) =>
        selected.value.every((tag) => (item.tags || []).includes(tag))
      )
    : solutionIndex
)

const groups = computed(() => {
  const map = new Map()
  for (const item of filtered.value) {
    if (!map.has(item.category)) map.set(item.category, [])
    map.get(item.category).push(item)
  }
  return [...map.entries()]
})

function toggle(tag) {
  const i = selected.value.indexOf(tag)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(tag)
}
</script>

<template>
  <div class="si-page">
    <div class="si-main">
      <div class="si-content">
        <section class="si-card">
          <header class="si-card-head">
            <h2 class="si-card-title">题解索引</h2>
            <span class="si-card-sub">
              共 {{ solutionIndex.length }} 篇<span v-if="selected.length">
                / 筛选后 {{ filtered.length }} 篇</span
              >
            </span>
          </header>

          <div v-if="filtered.length" class="si-groups">
            <div v-for="[category, list] in groups" :key="category" class="si-group">
              <h3 class="si-group-title">
                {{ category }}
                <span class="si-group-num">{{ list.length }}</span>
              </h3>
              <ul class="si-list">
                <li v-for="item in list" :key="item.link" class="si-item">
                  <a class="si-link" :href="withBase(item.link)">{{ item.title }}</a>
                  <span class="si-item-date">{{ item.date }}</span>
                  <span v-if="item.tags && item.tags.length" class="si-item-tags">
                    <span v-for="tag in item.tags" :key="tag" class="si-item-tag">{{ tag }}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <p v-else class="si-empty">没有符合条件的题解</p>
        </section>
      </div>

      <aside class="si-side">
        <div class="si-card si-tagcard">
          <header class="si-card-head">
            <h2 class="si-card-title">算法标签</h2>
            <button v-if="selected.length" class="si-clear" @click="selected = []">
              清空
            </button>
          </header>
          <p class="si-hint">
            选中多个标签时，只显示<span>同时</span>包含这些标签的题解。
          </p>
          <div class="si-tags">
            <button
              v-for="[tag, count] in allTags"
              :key="tag"
              class="si-tag"
              :class="{ 'si-tag-active': selected.includes(tag) }"
              @click="toggle(tag)"
            >
              <span>{{ tag }}</span>
              <span class="si-tag-num">{{ count }}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.si-page {
  min-height: 100%;
  background: #f4f6f9;
  padding: 24px 16px 40px;
}

.si-main {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.si-content {
  flex: 1;
  min-width: 0;
}

.si-side {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

.si-card {
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 4px;
}

.si-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #eef1f6;
}

.si-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3436;
}

.si-card-sub {
  font-size: 13px;
  color: #7f8c9b;
}

.si-clear {
  padding: 2px 10px;
  font-size: 12px;
  color: #3498db;
  background: #eaf3fb;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.si-clear:hover {
  background: #dcebf8;
}

.si-groups {
  padding: 6px 0 12px;
}

.si-group-title {
  margin: 16px 20px 6px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5664;
  border: none;
  padding: 0;
}

.si-group-num {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 400;
  color: #a0aab6;
}

.si-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.si-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 9px 20px;
  border-bottom: 1px solid #f2f4f8;
}

.si-item:last-child {
  border-bottom: none;
}

.si-item:hover {
  background: #f7fafd;
}

.si-link {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #2d3436;
  text-decoration: none;
}

.si-item:hover .si-link {
  color: #3498db;
}

.si-item-date {
  flex-shrink: 0;
  font-size: 12px;
  color: #a0aab6;
}

.si-item-tags {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.si-item-tag {
  padding: 1px 6px;
  font-size: 11px;
  color: #3498db;
  background: #eaf3fb;
  border-radius: 3px;
  white-space: nowrap;
}

.si-empty {
  margin: 0;
  padding: 40px 20px;
  text-align: center;
  font-size: 14px;
  color: #7f8c9b;
}

.si-hint {
  margin: 0;
  padding: 12px 20px 0;
  font-size: 12px;
  color: #a0aab6;
  line-height: 1.6;
}

.si-hint span {
  color: #3498db;
}

.si-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px 18px;
}

.si-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  font-size: 12px;
  color: #4a5664;
  background: #f2f4f8;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}

.si-tag:hover {
  color: #3498db;
  background: #eaf3fb;
}

.si-tag-active {
  color: #fff;
  background: #3498db;
  border-color: #3498db;
}

.si-tag-active:hover {
  color: #fff;
  background: #2980b9;
}

.si-tag-num {
  font-size: 11px;
  color: #a0aab6;
}

.si-tag-active .si-tag-num {
  color: #d6e9f8;
}

@media (max-width: 1000px) {
  .si-main {
    flex-direction: column;
  }

  .si-side {
    width: 100%;
    position: static;
    order: -1;
  }
}
</style>
