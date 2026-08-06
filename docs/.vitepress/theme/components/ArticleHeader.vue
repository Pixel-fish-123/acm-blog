<script setup>
import { withBase } from 'vitepress'

// 文章页作者标识：小头像 + 名字，紧凑显示在标题上方左侧
const luoguHome = 'https://www.luogu.com.cn/user/361708'
</script>

<template>
  <div class="article-header">
    <a class="ah-avatar" :href="luoguHome" target="_blank" rel="noopener">
      <img :src="withBase('/avatar.png')" alt="avatar" />
    </a>
    <a class="ah-name" :href="luoguHome" target="_blank" rel="noopener">Pixel_fish</a>
  </div>
</template>

<style scoped>
.article-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ah-avatar img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e3e8ef;
  display: block;
}

.ah-name {
  font-size: 13px;
  font-weight: 600;
  color: #52c41a; /* 洛谷等级色：绿 */
  text-decoration: none;
}

.ah-name:hover {
  text-decoration: underline;
}
</style>
