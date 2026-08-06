import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const solutionsDir = path.resolve(__dirname, '../solutions')

// 博客部署在项目页：https://<user>.github.io/acm-blog/
// 若改为个人主页仓库（<user>.github.io），将 base 改为 '/'
const base = process.env.VITEPRESS_BASE || '/acm-blog/'

// 读取 markdown 的首个 h1 作为侧边栏显示名
function titleOf(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const m = raw.match(/^#\s+(.+)$/m)
    if (m) return m[1]
  } catch { /* fallthrough */ }
  return path.basename(file, '.md')
}

function solutionItems(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .map((f) => ({
      text: titleOf(path.join(dir, f)),
      link: '/solutions/' + path.relative(solutionsDir, path.join(dir, f)).replace(/\\/g, '/'),
    }))
}

// 构建时扫描 docs/solutions/ 目录结构，自动生成侧边栏
function buildSidebar() {
  if (!fs.existsSync(solutionsDir)) return []
  const groups = []
  const rootItems = solutionItems(solutionsDir)
  if (rootItems.length) groups.push({ text: '专题', items: rootItems })
  for (const entry of fs.readdirSync(solutionsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const full = path.join(solutionsDir, entry.name)
    const items = solutionItems(full)
    if (items.length) groups.push({ text: entry.name, items })
  }
  return groups
}

export default defineConfig({
  title: 'ACM 题解博客',
  description: '算法竞赛刷题与题解记录',
  base,
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    math: true, // 启用 KaTeX 数学公式渲染（题解中的 $...$ / $$...$$）
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '题解索引', link: '/solutions/' },
    ],
    sidebar: buildSidebar(),
    outline: { level: [2, 3] },
    search: { provider: 'local' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '更新于', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Pixel-fish-123' }],
    footer: { message: '题解由同步脚本从 acm-icpc 仓库维护', copyright: 'Copyright © 2026 Pixel-fish-123' },
  },
})
