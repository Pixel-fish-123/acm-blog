<script setup>
import { withBase } from 'vitepress'
import solutionIndex from '../../solutionIndex.json'

const items = solutionIndex
const total = items.length
const categories = [...new Set(items.map((i) => i.category))]
</script>

<template>
  <div class="lg-home">
    <div class="lg-main">
      <div class="lg-content">
        <section class="lg-card">
          <header class="lg-card-head">
            <h2 class="lg-card-title">题解列表</h2>
            <span class="lg-card-sub">共 {{ total }} 篇</span>
          </header>
          <div class="lg-list">
            <a
              v-for="item in items"
              :key="item.link"
              class="lg-item"
              :href="withBase(item.link)"
            >
              <div class="lg-item-title">{{ item.title }}</div>
              <div class="lg-item-summary">{{ item.summary }}</div>
              <div class="lg-item-meta">
                <span class="lg-tag">{{ item.category }}</span>
                <span class="lg-date">{{ item.date }}</span>
              </div>
            </a>
          </div>
        </section>
      </div>

      <aside class="lg-side">
        <div class="lg-card lg-profile">
          <img
            class="lg-avatar"
            src="https://avatars.githubusercontent.com/Pixel-fish-123"
            alt="avatar"
          />
          <div class="lg-name">Pixel-fish-123</div>
          <div class="lg-bio">算法竞赛 · 刷题与题解记录</div>
          <div class="lg-stats">
            <div class="lg-stat">
              <b>{{ total }}</b>
              <span>题解</span>
            </div>
            <div class="lg-stat">
              <b>{{ categories.length }}</b>
              <span>分类</span>
            </div>
          </div>
          <a
            class="lg-btn"
            href="https://github.com/Pixel-fish-123"
            target="_blank"
            rel="noopener"
          >GitHub 主页</a>
        </div>

        <div class="lg-card">
          <header class="lg-card-head">
            <h2 class="lg-card-title">分类</h2>
          </header>
          <div class="lg-cats">
            <a
              v-for="c in categories"
              :key="c"
              class="lg-cat"
              :href="withBase('/solutions/')"
            >
              <span>{{ c }}</span>
              <span class="lg-cat-num">{{
                items.filter((i) => i.category === c).length
              }}</span>
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
  max-width: 1120px;
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
  border: 1px solid #e3e8ef;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(20, 40, 80, 0.04);
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

.lg-item {
  display: block;
  padding: 14px 20px;
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

.lg-item-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3436;
  line-height: 1.5;
}

.lg-item:hover .lg-item-title {
  color: #3498db;
}

.lg-item-summary {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7785;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lg-item-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.lg-tag {
  display: inline-block;
  padding: 1px 8px;
  font-size: 12px;
  color: #3498db;
  background: #eaf3fb;
  border-radius: 3px;
}

.lg-date {
  font-size: 12px;
  color: #a0aab6;
}

.lg-profile {
  padding: 24px 20px 20px;
  text-align: center;
}

.lg-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 1px solid #e3e8ef;
}

.lg-name {
  margin-top: 12px;
  font-size: 17px;
  font-weight: 600;
  color: #2d3436;
}

.lg-bio {
  margin-top: 4px;
  font-size: 13px;
  color: #7f8c9b;
}

.lg-stats {
  margin-top: 16px;
  display: flex;
  justify-content: center;
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
  font-size: 18px;
  color: #2d3436;
}

.lg-stat span {
  font-size: 12px;
  color: #7f8c9b;
}

.lg-btn {
  display: block;
  margin-top: 16px;
  padding: 8px 0;
  font-size: 14px;
  color: #fff;
  background: #3498db;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.15s;
}

.lg-btn:hover {
  background: #2980b9;
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

.lg-cat-num {
  font-size: 12px;
  color: #a0aab6;
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
