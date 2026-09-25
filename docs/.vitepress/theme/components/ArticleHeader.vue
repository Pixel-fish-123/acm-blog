<script setup>
import { computed } from 'vue'
import { withBase, useData } from 'vitepress'
import { useCurrentSolution } from '../solution.js'

// 文章页抬头：作者 + 修改日期；若当前页是题解，再补平台 / 难度 / 标签 / 原题
const { page } = useData()
const luoguHome = 'https://www.luogu.com.cn/user/361708'

const date = computed(() => {
  const ts = page.value.lastUpdated
  if (!ts) return ''
  const ms = ts > 1e12 ? ts : ts * 1000
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

// 当前页面对应的题解；首页、索引页等找不到时返回 null
const solution = useCurrentSolution()

const tags = computed(() => solution.value?.tags || [])

// 标签点击后回到首页并带上筛选参数（首页筛选见优化方案第 4 节）
const tagLink = (tag) => withBase('/?tag=' + encodeURIComponent(tag))
</script>

<template>
  <div class="article-header">
    <img class="ah-avatar" :src="withBase('/avatar.png')" alt="avatar" />
    <a class="ah-name" :href="luoguHome" target="_blank" rel="noopener">Pixel_fish</a>
    <span v-if="date" class="ah-date">更新于 {{ date }}</span>

    <template v-if="solution">
      <span class="ah-sep" aria-hidden="true"></span>
      <span class="ah-cat">{{ solution.category }}</span>
      <span
        v-if="solution.difficulty"
        class="ah-diff"
        :style="{ backgroundColor: solution.difficultyColor || '#bfbfbf' }"
      >{{ solution.difficulty }}</span>
      <a
        v-for="tag in tags"
        :key="tag"
        class="ah-tag"
        :href="tagLink(tag)"
      >{{ tag }}</a>
      <a
        v-if="solution.source"
        class="ah-source"
        :href="solution.source"
        target="_blank"
        rel="noopener"
      >原题</a>
    </template>
  </div>
</template>

<style scoped>
.article-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.ah-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e3e8ef;
  display: block;
}

.ah-name {
  font-size: 13px;
  font-weight: 600;
  color: #f39c12; /* 洛谷等级色（npm run sync 自动同步） */
  text-decoration: none;
}

.ah-name:hover {
  text-decoration: underline;
}

.ah-date {
  font-size: 12px;
  color: #a0aab6;
}

/* 分隔线：把作者信息和题解元信息视觉上分开 */
.ah-sep {
  width: 1px;
  height: 14px;
  background: #e3e8ef;
}

/* 平台标签 */
.ah-cat {
  padding: 1px 8px;
  font-size: 12px;
  color: #3498db;
  background: #eaf3fb;
  border-radius: 3px;
  white-space: nowrap;
}

/* 难度徽章：背景色取难度色，白字 */
.ah-diff {
  padding: 1px 8px;
  font-size: 12px;
  color: #fff;
  border-radius: 3px;
  white-space: nowrap;
}

/* 算法标签：链接样式 */
.ah-tag {
  padding: 1px 8px;
  font-size: 12px;
  color: #4a5664;
  background: #f2f4f8;
  border-radius: 3px;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
}

.ah-tag:hover {
  color: #3498db;
  background: #eaf3fb;
}

/* 原题链接 */
.ah-source {
  padding: 1px 8px;
  font-size: 12px;
  color: #fff;
  background: #3498db;
  border-radius: 3px;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}

.ah-source:hover {
  background: #2980b9;
}
</style>
