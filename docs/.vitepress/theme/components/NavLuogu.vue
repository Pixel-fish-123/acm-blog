<script setup>
import { withBase } from 'vitepress'

// 导航栏洛谷图标（使用 docs/public/luogu_favicon.ico）
const luoguHome = 'https://www.luogu.com.cn/user/361708'
</script>

<template>
  <a
    class="nav-luogu"
    :href="luoguHome"
    target="_blank"
    rel="noopener"
    aria-label="洛谷主页"
    title="洛谷主页"
  >
    <img class="nav-luogu-icon" :src="withBase('/luogu_favicon.ico')" alt="洛谷" />
  </a>
</template>

<style scoped>
.nav-luogu {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  margin-left: 8px;
}

.nav-luogu-icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: block;
  transition: opacity 0.15s;
}

.nav-luogu:hover .nav-luogu-icon {
  opacity: 0.8;
}
</style>
