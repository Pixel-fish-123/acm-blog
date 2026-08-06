import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const solutionsDir = path.resolve(__dirname, '../solutions')

// 博客部署在项目页：https://<user>.github.io/acm-blog/
const base = process.env.VITEPRESS_BASE || '/acm-blog/'

// 读取 markdown 首个 h1 作为侧边栏显示名
function titleOf(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const m = raw.match(/^#\s+(.+)$/m)
    if (m) return m[1]
  } catch { /* fallthrough */ }
  return path.basename(file, '.md')
}

// 题解页侧边栏：只显示当前文章标题。
// VitePress 1.6 的 sidebar 只接受数组或映射（SidebarMulti），不支持函数
// （getSidebar 对函数走 Object.keys 得到 []，侧边栏为空）。
// 因此按文件预计算为合规的 SidebarMulti 映射：每个文章路径对应 [{ text, items: [] }]。
function sidebarFor(file) {
  return [{ text: titleOf(file), items: [] }]
}

function buildSidebarMap() {
  const map = {}
  for (const rel of fs.readdirSync(solutionsDir, { recursive: true })) {
    if (!rel.endsWith('.md') || rel === 'index.md') continue
    const key = '/solutions/' + rel.replace(/\\/g, '/').replace(/\.md$/, '')
    map[key] = sidebarFor(path.join(solutionsDir, rel))
  }
  return map
}

// 内联 SVG 图标（不依赖外网 CDN，避免图标空白）
const githubIcon =
  '<svg viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>'
const luoguIcon =
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3498db"/><text x="12" y="16.8" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#ffffff" font-family="sans-serif">洛</text></svg>'

export default defineConfig({
  title: 'ACM 题解博客',
  description: '算法竞赛刷题与题解记录',
  base,
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    math: true, // 启用数学公式渲染（题解中的 $...$ / $$...$$）
  },
  themeConfig: {
    siteTitle: false, // 左上角不显示站名，搜索框占据该位置
    nav: [
      { text: '首页', link: '/' },
      { text: '题解索引', link: '/solutions/' },
    ],
    sidebar: buildSidebarMap(),
    outline: { level: [2, 3] },
    search: { provider: 'local' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '更新于', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },
    socialLinks: [
      { icon: { svg: githubIcon }, link: 'https://github.com/Pixel-fish-123' },
      { icon: { svg: luoguIcon }, link: 'https://www.luogu.com.cn/user/361708' },
    ],
    footer: {
      message: '题解由同步脚本从 acm-icpc 仓库维护',
      copyright: 'Copyright © 2026 Pixel-fish-123',
    },
  },
})
