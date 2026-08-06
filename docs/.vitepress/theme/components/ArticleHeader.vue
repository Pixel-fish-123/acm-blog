<script setup>
import { computed } from 'vue'
import { withBase, useData } from 'vitepress'

// 文章页抬头作者信息：头像 + 名字 + 修改日期（小字）
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
</script>

<template>
  <div class="article-header">
    <img class="ah-avatar" :src="withBase('/avatar.png')" alt="avatar" />
    <a class="ah-name" :href="luoguHome" target="_blank" rel="noopener">Pixel_fish</a>
    <span v-if="date" class="ah-date">更新于 {{ date }}</span>
  </div>
</template>

<style scoped>
.article-header {
  display: flex;
  align-items: center;
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
  color: #52c41a; /* 洛谷等级色：绿 */
  text-decoration: none;
}

.ah-name:hover {
  text-decoration: underline;
}

.ah-date {
  font-size: 12px;
  color: #a0aab6;
}
</style>
