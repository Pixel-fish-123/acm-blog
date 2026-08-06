import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import ArticleHeader from './components/ArticleHeader.vue'
import NavLuogu from './components/NavLuogu.vue'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 导航栏右侧：洛谷图标（luogu_favicon.ico）
      'nav-bar-content-after': () => h(NavLuogu),
      // 文章页顶部（content-container 内、标题上方）：作者 + 修改日期
      'doc-before': () => h(ArticleHeader),
    })
  },
}
