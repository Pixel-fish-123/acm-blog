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
      // 文档页顶部：洛谷风格作者信息条
      'doc-top': () => h(ArticleHeader),
    })
  },
}
