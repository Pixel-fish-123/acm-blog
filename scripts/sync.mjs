// 同步脚本：编排「收集题解 -> 跑插件 -> 写出结果」
// 用法：npm run sync
// 可通过环境变量 ACM_ICPC_ROOT 指定 acm-icpc 仓库路径（默认：博客仓库的上一级目录）
// 插件登记在 plugins/index.mjs，新增功能优先以插件形式加入
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectMd } from './lib/fs-utils.mjs'
import { h1Of, summaryOf } from './lib/markdown.mjs'
import { categoryName } from './lib/category.mjs'
import plugins from './plugins/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const blogRoot = path.resolve(__dirname, '..')
const acmRoot = process.env.ACM_ICPC_ROOT || path.resolve(blogRoot, '..', 'acm-icpc')
const srcDir = path.join(acmRoot, 'solutions')
const dstDir = path.join(blogRoot, 'docs', 'solutions')
const dataDir = path.join(blogRoot, 'docs', '.vitepress')

if (!fs.existsSync(srcDir)) {
  console.error(`找不到题解源目录: ${srcDir}`)
  console.error('请确认 acm-icpc 仓库位置，或用环境变量 ACM_ICPC_ROOT 指定，例如：')
  console.error('  $env:ACM_ICPC_ROOT = "D:\\code\\acm-icpc"; npm run sync')
  process.exit(1)
}

const log = (msg) => console.log(msg)
const warn = (msg) => console.warn(msg)
const norm = (p) => p.replaceAll('\\', '/')
const idOf = (rel) => path.basename(rel).replace(/_solution\.md$/, '')

// 1. 收集源文件
const files = collectMd(srcDir, srcDir, []).sort()
const sols = files.map((rel) => {
  const r = norm(rel)
  const full = path.join(srcDir, rel)
  const dir = path.dirname(r) === '.' ? '专题' : path.dirname(r)
  return { rel: r, dir, full, raw: fs.readFileSync(full, 'utf8'), body: '', meta: {} }
})

const ctx = { blogRoot, acmRoot, srcDir, dstDir, dataDir, log, warn, solutions: sols }

// 2. 依次执行插件；单个插件抛错只警告，不中断整次 sync
for (const [plugin, options] of plugins) {
  if (typeof plugin.onSolution !== 'function') continue
  const label = plugin.name || 'anonymous'
  for (const sol of sols) {
    try {
      await plugin.onSolution(sol, ctx, options)
    } catch (e) {
      warn(`插件 ${label} 处理 ${sol.rel} 失败：${e.message}`)
    }
  }
}

// 3. 写出题解 markdown（body 由插件决定，默认等于源文件原文）
fs.rmSync(dstDir, { recursive: true, force: true })
for (const sol of sols) {
  const to = path.join(dstDir, sol.rel)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, sol.body)
}

// 4. 生成索引页（docs/solutions/index.md）：先按平台分组，再按算法分组
const groups = new Map()
for (const sol of sols) {
  if (!groups.has(sol.dir)) groups.set(sol.dir, [])
  groups.get(sol.dir).push(sol)
}
let index = '# 题解索引\n\n> 本页由 `npm run sync` 自动生成，请勿手动编辑。\n\n'
for (const group of [...groups.keys()].sort()) {
  index += `## ${group}\n\n`
  for (const sol of groups.get(group)) {
    index += `- [${h1Of(sol.body)}](./${sol.rel})\n`
  }
  index += '\n'
}

const tagGroups = new Map()
for (const sol of sols) {
  for (const tag of sol.meta.tags || []) {
    if (!tagGroups.has(tag)) tagGroups.set(tag, [])
    tagGroups.get(tag).push(sol)
  }
}
if (tagGroups.size) {
  index += '## 按算法\n\n'
  for (const tag of [...tagGroups.keys()].sort((a, b) => a.localeCompare(b, 'zh'))) {
    index += `### ${tag}\n\n`
    for (const sol of tagGroups.get(tag)) {
      index += `- [${h1Of(sol.body)}](./${sol.rel})\n`
    }
    index += '\n'
  }
}
fs.writeFileSync(path.join(dstDir, 'index.md'), index)

// 5. 生成站点数据（docs/.vitepress/solutionIndex.json）
const indexData = sols.map((sol) => {
  const entry = {
    title: h1Of(sol.body),
    id: idOf(sol.rel),
    category: categoryName(sol.dir),
    link: '/solutions/' + sol.rel.replace(/\.md$/, ''),
    summary: summaryOf(sol.body),
    date: sol.meta.date,
  }
  if (sol.meta.tags && sol.meta.tags.length) entry.tags = sol.meta.tags
  if (sol.meta.difficulty) entry.difficulty = sol.meta.difficulty
  if (sol.meta.difficultyColor) entry.difficultyColor = sol.meta.difficultyColor
  if (sol.meta.source) entry.source = sol.meta.source
  return entry
})

// 6. 收尾钩子（写缓存、抓洛谷账号数据等）
for (const [plugin, options] of plugins) {
  if (typeof plugin.onFinish !== 'function') continue
  const label = plugin.name || 'anonymous'
  try {
    await plugin.onFinish(indexData, ctx, options)
  } catch (e) {
    warn(`插件 ${label} 收尾失败：${e.message}`)
  }
}

// 组内按标题排序，组间保持原顺序
indexData.sort((a, b) =>
  a.category === b.category ? a.title.localeCompare(b.title, 'zh') : 0
)

fs.mkdirSync(dataDir, { recursive: true })
fs.writeFileSync(path.join(dataDir, 'solutionIndex.json'), JSON.stringify(indexData, null, 2))

log(`同步完成：${sols.length} 篇题解 → docs/solutions/`)
log(`站点数据 → docs/.vitepress/solutionIndex.json`)
