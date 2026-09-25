<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import solutionIndex from '../../solutionIndex.json'
import SolutionFilter from './SolutionFilter.vue'
import {
  collectTags,
  countBy,
  difficultyStats,
  emptyFilters,
  isFiltering,
  matches,
  parseFilters,
  sortItems,
  toQuery,
} from '../filters.js'

const items = solutionIndex
const total = items.length

// 筛选状态由首页持有，控件（SolutionFilter）、列表和侧栏卡片共用
const filters = ref(emptyFilters())
const filtering = computed(() => isFiltering(filters.value))
const visible = computed(() => sortItems(items.filter((item) => matches(item, filters.value)), filters.value.sort))

const categories = computed(() =>
  [...countBy(items, (item) => item.category).entries()].map(([name, count]) => ({ name, count }))
)
const tags = computed(() => collectTags(items))
const difficulties = computed(() => difficultyStats(items))
const maxDiffCount = computed(() => difficulties.value.reduce((max, d) => Math.max(max, d.count), 0))

function setCategory(name) {
  filters.value = { ...filters.value, cat: filters.value.cat === name ? '' : name }
}

function toggleTag(tag) {
  const has = filters.value.tags.includes(tag)
  filters.value = {
    ...filters.value,
    tags: has ? filters.value.tags.filter((t) => t !== tag) : [...filters.value.tags, tag],
  }
}

function toggleDifficulty(name) {
  const has = filters.value.diffs.includes(name)
  filters.value = {
    ...filters.value,
    diffs: has ? filters.value.diffs.filter((d) => d !== name) : [...filters.value.diffs, name],
  }
}

// 筛选状态同步到 URL（题解页的标签链接就是 /?tag=xxx），仅客户端执行
onMounted(() => {
  filters.value = parseFilters(window.location.search)
})

watch(
  filters,
  (value) => {
    if (typeof window === 'undefined') return
    window.history.replaceState(null, '', window.location.pathname + toQuery(value))
  },
  { deep: true }
)

// 洛谷用户信息（来源：https://www.luogu.com.cn/user/361708）
const luogu = {
  home: 'https://www.luogu.com.cn/user/361708',
  name: 'Pixel_fish',
  slogan: '有时候在想，然后我忘了（）',
  color: '#f39c12',
  followers: 9,
  following: 11,
  passed: 385,
  submitted: 390,
  ranking: 10103,
}
</script>

<template>
  <div class="lg-home" :style="{ '--lg-name-color': luogu.color }">
    <div class="lg-main">
      <div class="lg-content">
        <SolutionFilter v-model="filters" :categories="categories" />

        <section class="lg-card">
          <header class="lg-card-head">
            <h2 class="lg-card-title">题解列表</h2>
            <span class="lg-card-sub">
              共 {{ total }} 篇<template v-if="filtering"> / 筛选后 {{ visible.length }} 篇</template>
            </span>
          </header>
          <div class="lg-list">
            <a
              v-for="item in visible"
              :key="item.link"
              class="lg-item"
              :href="withBase(item.link)"
            >
              <div class="lg-item-main">
                <div class="lg-item-title-row">
                  <div class="lg-item-title">{{ item.title }}</div>
                  <span class="lg-tag">{{ item.category }}</span>
                </div>
                <div class="lg-item-summary">{{ item.summary }}</div>
              </div>
              <div class="lg-item-author">
                <img class="lg-item-avatar" :src="withBase('/avatar.png')" alt="avatar" />
                <div class="lg-item-author-name">Pixel_fish</div>
                <div class="lg-item-author-date">{{ item.date }}</div>
              </div>
            </a>
            <p v-if="!visible.length" class="lg-empty">没有符合条件的题解</p>
          </div>
        </section>
      </div>

      <aside class="lg-side">
        <!-- 洛谷用户主页风格信息栏 -->
        <div class="lg-card lg-profile">
          <a class="lg-avatar-wrap" :href="luogu.home" target="_blank" rel="noopener">
            <img class="lg-avatar" :src="withBase('/avatar.png')" alt="avatar" />
          </a>
          <div class="lg-name">{{ luogu.name }}</div>
          <div class="lg-slogan">{{ luogu.slogan }}</div>

          <div class="lg-stats">
            <div class="lg-stat">
              <b>{{ luogu.following }}</b>
              <span>关注</span>
            </div>
            <div class="lg-stat">
              <b>{{ luogu.followers }}</b>
              <span>粉丝</span>
            </div>
            <div class="lg-stat">
              <b>{{ total }}</b>
              <span>题解</span>
            </div>
          </div>

          <div class="lg-codes">
            <div class="lg-code">
              <span class="lg-code-num">{{ luogu.passed }}</span>
              <span class="lg-code-label">通过</span>
            </div>
            <div class="lg-code">
              <span class="lg-code-num">{{ luogu.submitted }}</span>
              <span class="lg-code-label">提交</span>
            </div>
            <div class="lg-code">
              <span class="lg-code-num">{{ luogu.ranking }}</span>
              <span class="lg-code-label">排名</span>
            </div>
          </div>

          <div class="lg-btns">
            <a class="lg-btn lg-btn-primary" :href="luogu.home" target="_blank" rel="noopener">洛谷主页</a>
            <a class="lg-btn lg-btn-ghost" href="https://github.com/Pixel-fish-123" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>

        <div class="lg-card">
          <header class="lg-card-head">
            <h2 class="lg-card-title">算法标签</h2>
            <span class="lg-card-sub">{{ tags.length }} 个</span>
          </header>
          <div class="lg-tagbox">
            <button
              v-for="t in tags"
              :key="t.name"
              class="lg-tagbtn"
              :class="{ 'lg-tagbtn-active': filters.tags.includes(t.name) }"
              @click="toggleTag(t.name)"
            >
              <span>{{ t.name }}</span>
              <span class="lg-tagbtn-num">{{ t.count }}</span>
            </button>
          </div>
        </div>

        <div class="lg-card">
          <header class="lg-card-head">
            <h2 class="lg-card-title">难度分布</h2>
            <span class="lg-card-sub">{{ total }} 篇</span>
          </header>
          <div class="lg-diffs">
            <button
              v-for="d in difficulties"
              :key="d.name"
              class="lg-diffrow"
              :class="{ 'lg-diffrow-active': filters.diffs.includes(d.name) }"
              @click="toggleDifficulty(d.name)"
            >
              <span class="lg-diffname">{{ d.name }}</span>
              <span class="lg-diffbar-wrap">
                <span
                  class="lg-diffbar"
                  :style="{
                    width: maxDiffCount ? (d.count / maxDiffCount) * 100 + '%' : '0%',
                    background: d.color,
                  }"
                ></span>
              </span>
              <span class="lg-diffnum">{{ d.count }}</span>
            </button>
          </div>
        </div>

        <div class="lg-card">
          <header class="lg-card-head">
            <h2 class="lg-card-title">分类</h2>
          </header>
          <div class="lg-cats">
            <a
              v-for="c in categories"
              :key="c.name"
              class="lg-cat"
              :class="{ 'lg-cat-active': filters.cat === c.name }"
              :href="withBase('/?cat=' + encodeURIComponent(c.name))"
              @click.prevent="setCategory(c.name)"
            >
              <span>{{ c.name }}</span>
              <span class="lg-cat-num">{{ c.count }}</span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.lg-home {
  min-height: 100%;
  background: #f4f6f9;
  padding: 24px 16px 40px;
}

.lg-main {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.lg-content {
  flex: 1;
  min-width: 0;
}

.lg-side {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lg-card {
  background: #fff;
  border: 1px solid var(--lg-card-border, #e3e8ef);
  border-radius: 4px;
}

.lg-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #eef1f6;
}

.lg-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3436;
}

.lg-card-sub {
  font-size: 13px;
  color: #7f8c9b;
}

.lg-list {
  padding: 8px 0;
}

/* 洛谷 article 风格条目：左侧标题+摘要，右侧作者头像/名字/日期 */
.lg-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 24px;
  border-bottom: 1px solid #f2f4f8;
  text-decoration: none;
  transition: background 0.15s;
}

.lg-item:last-child {
  border-bottom: none;
}

.lg-item:hover {
  background: #f7fafd;
}

.lg-item-main {
  flex: 1;
  min-width: 0;
}

.lg-item-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.lg-item-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3436;
  line-height: 1.5;
  min-width: 0;
}

.lg-item:hover .lg-item-title {
  color: #3498db;
}

/* 分类标签：洛谷风格小徽章 */
.lg-tag {
  flex-shrink: 0;
  display: inline-block;
  padding: 1px 8px;
  font-size: 12px;
  color: #3498db;
  background: #eaf3fb;
  border-radius: 3px;
  white-space: nowrap;
}

.lg-item-summary {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7785;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lg-item-author {
  flex-shrink: 0;
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lg-item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e3e8ef;
}

.lg-item-author-name {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--lg-name-color, #52c41a); /* 洛谷等级色 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lg-item-author-date {
  margin-top: 2px;
  font-size: 12px;
  color: #a0aab6;
}

/* ---- 洛谷用户主页风格信息栏 ---- */
.lg-profile {
  padding: 24px 20px 20px;
  text-align: center;
}

.lg-avatar-wrap {
  display: inline-block;
}

.lg-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 1px solid #e3e8ef;
  transition: opacity 0.15s;
}

.lg-avatar:hover {
  opacity: 0.85;
}

.lg-name {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--lg-name-color, #52c41a); /* 洛谷等级色 */
}

.lg-slogan {
  margin-top: 6px;
  font-size: 13px;
  color: #7f8c9b;
  line-height: 1.5;
}

.lg-stats {
  margin-top: 16px;
  display: flex;
  border-top: 1px solid #eef1f6;
  border-bottom: 1px solid #eef1f6;
}

.lg-stat {
  flex: 1;
  padding: 12px 0;
  text-align: center;
}

.lg-stat + .lg-stat {
  border-left: 1px solid #eef1f6;
}

.lg-stat b {
  display: block;
  font-size: 17px;
  color: #2d3436;
}

.lg-stat span {
  font-size: 12px;
  color: #7f8c9b;
}

.lg-codes {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 18px;
}

.lg-code {
  text-align: center;
}

.lg-code-num {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d3436;
}

.lg-code-label {
  font-size: 12px;
  color: #a0aab6;
}

.lg-btns {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.lg-btn {
  flex: 1;
  display: block;
  padding: 8px 0;
  font-size: 14px;
  border-radius: 4px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.lg-btn:hover {
  opacity: 0.88;
}

.lg-btn-primary {
  color: #fff;
  background: #3498db;
}

.lg-btn-ghost {
  color: #4a5664;
  background: #f2f4f8;
}

.lg-cats {
  padding: 10px 0;
}

.lg-cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 20px;
  font-size: 14px;
  color: #4a5664;
  text-decoration: none;
  transition: color 0.15s;
}

.lg-cat:hover {
  color: #3498db;
}

.lg-cat-active {
  color: #3498db;
  background: #eaf3fb;
  font-weight: 600;
}

.lg-cat-num {
  font-size: 12px;
  color: #a0aab6;
}

.lg-cat-active .lg-cat-num {
  color: #3498db;
}

/* ---- 侧栏：算法标签 ---- */
.lg-tagbox {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 20px 18px;
}

.lg-tagbtn {
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
  transition: color 0.15s, background 0.15s;
}

.lg-tagbtn:hover {
  color: #3498db;
  background: #eaf3fb;
}

.lg-tagbtn-active {
  color: #fff;
  background: #3498db;
}

.lg-tagbtn-active:hover {
  color: #fff;
  background: #2980b9;
}

.lg-tagbtn-num {
  font-size: 11px;
  color: #a0aab6;
}

.lg-tagbtn-active .lg-tagbtn-num {
  color: #d6e9f8;
}

/* ---- 侧栏：难度分布（纯 CSS 横向条，点击筛选） ---- */
.lg-diffs {
  padding: 8px 0 10px;
}

.lg-diffrow {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 20px;
  background: none;
  border: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.lg-diffrow:hover {
  background: #f7fafd;
}

.lg-diffrow-active {
  background: #eaf3fb;
}

.lg-diffrow-active .lg-diffname {
  color: #3498db;
  font-weight: 600;
}

.lg-diffname {
  flex-shrink: 0;
  width: 84px;
  font-size: 12px;
  color: #4a5664;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lg-diffbar-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.lg-diffbar {
  height: 10px;
  min-width: 2px;
  border-radius: 2px;
  transition: width 0.2s;
}

.lg-diffnum {
  flex-shrink: 0;
  width: 20px;
  font-size: 12px;
  color: #a0aab6;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ---- 空结果 ---- */
.lg-empty {
  margin: 0;
  padding: 40px 24px;
  text-align: center;
  font-size: 14px;
  color: #7f8c9b;
}

@media (max-width: 900px) {
  .lg-main {
    flex-direction: column;
  }

  .lg-side {
    width: 100%;
    order: -1;
  }
}
</style>
