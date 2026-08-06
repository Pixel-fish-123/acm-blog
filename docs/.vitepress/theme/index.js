import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import ArticleHeader from './components/ArticleHeader.vue'

// 数学公式由 markdown-it-mathjax3 渲染（SVG 输出，无需外部 CSS）
export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 文档页顶部：洛谷风格作者信息条
      'doc-top': () => h(ArticleHeader),
    })
  },
}
