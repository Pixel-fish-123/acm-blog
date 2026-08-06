<script setup>
import { withBase } from 'vitepress'

// 文章页顶部作者信息条（仿洛谷专栏文章头部）
const luoguHome = 'https://www.luogu.com.cn/user/361708'
</script>

<template>
  <div class="article-header">
    <a class="ah-avatar" :href="luoguHome" target="_blank" rel="noopener">
      <img :src="withBase('/avatar.png')" alt="avatar" />
    </a>
    <a class="ah-name" :href="luoguHome" target="_blank" rel="noopener">Pixel_fish</a>
    <span class="ah-divider"></span>
    <span class="ah-meta">题解收录于 acm-icpc 仓库</span>
  </div>
</template>

<style scoped>
.article-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 4px 16px;
  border-bottom: 1px solid #eef1f6;
  margin-bottom: 20px;
}

.ah-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e3e8ef;
  display: block;
}

.ah-name {
  font-size: 14px;
  font-weight: 600;
  color: #52c41a; /* 洛谷等级色：绿 */
  text-decoration: none;
}

.ah-name:hover {
  text-decoration: underline;
}

.ah-divider {
  width: 1px;
  height: 16px;
  background: #e3e8ef;
  margin: 0 2px;
}

.ah-meta {
  font-size: 12px;
  color: #a0aab6;
}
</style>
