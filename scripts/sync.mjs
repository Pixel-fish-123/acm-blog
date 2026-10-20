// 同步脚本：编排「收集题解 -> 跑插件 -> 校验 -> 写出结果」
// 用法：npm run sync
//       npm run sync -- --check   只对比，不写文件；有差异时退出码为 1
//       npm run sync -- --offline 不联网，只用已有缓存
// 可通过环境变量 ACM_ICPC_ROOT 指定 acm-icpc 仓库路径（默认：博客仓库的上一级目录）
// 插件登记在 plugins/index.mjs，新增功能优先以插件形式加入
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectMd } from './lib/fs-utils.mjs'
import { h1Of, summaryOf } from './lib/markdown.mjs'
import { categoryName } from './lib/category.mjs'
import { formatMetaGaps } from './lib/meta-gaps.mjs'
import { idOf } from './lib/problem-id.mjs'
import { checkFile, checkOutputs, validateSolutions, writeOutputs } from './lib/output.mjs'
import plugins from './plugins/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const blogRoot = path.resolve(__dirname, '..')
const acmRoot = process.env.ACM_ICPC_ROOT || path.resolve(blogRoot, '..', 'acm-icpc')
const srcDir = path.join(acmRoot, 'solutions')
const extraDirs = ['useful_maths_conclusions']
const dstDir = path.join(blogRoot, 'docs', 'solutions')
const dataDir = path.join(blogRoot, 'docs', '.vitepress')
const args = new Set(process.argv.slice(2))
const checkOnly = args.has('--check')
const offline = args.has('--offline')

const log = (msg) => console.log(msg)
const warn = (msg) => console.warn(msg)
const norm = (p) => String(p).replaceAll('\\', '/')

function indexPageMd() {
  return [
    '---',
    'layout: page',
    '---',
    '',
    '<script setup>',
    "import SolutionIndexPage from '../.vitepress/theme/components/SolutionIndexPage.vue'",
    '</script>',
    '',
    '<SolutionIndexPage />',
    '',
  ].join('\n')
}

function collectSources() {
  const files = collectMd(srcDir, srcDir, []).map((rel) => ({
    rel,
    full: path.join(srcDir, rel),
    srcRel: norm(path.join('solutions', rel)),
  }))
  for (const name of extraDirs) {
    const dir = path.join(acmRoot, name)
    if (!fs.existsSync(dir)) continue
    for (const rel of collectMd(dir, dir, [])) {
      files.push({
        rel: path.join(name, rel),
        full: path.join(dir, rel),
        srcRel: norm(path.join(name, rel)),
      })
    }
  }
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))
  return files
}

function solutionsOf(files) {
  return files.map(({ rel, srcRel, full }) => {
    const r = norm(rel)
    const dir = path.dirname(r) === '.' ? '专题' : path.dirname(r)
    return {
      rel: r,
      srcRel: norm(srcRel),
      dir,
      full,
      raw: fs.readFileSync(full, 'utf8'),
      body: '',
      meta: {},
    }
  })
}

function indexOf(sols) {
  return sols.map((sol) => {
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
}

function reportDiffs(diffs) {
  const lines = []
  for (const rel of diffs.missing) lines.push(`  缺少：docs/solutions/${rel}`)
  for (const rel of diffs.changed) lines.push(`  内容不同：docs/solutions/${rel}`)
  for (const rel of diffs.stale) lines.push(`  多余：docs/solutions/${rel}`)
  if (diffs.index === 'missing') lines.push('  缺少：docs/.vitepress/solutionIndex.json')
  if (diffs.index === 'changed') lines.push('  内容不同：docs/.vitepress/solutionIndex.json')
  return lines
}

async function main() {
  if (!fs.existsSync(srcDir)) {
    console.error(`找不到题解源目录: ${srcDir}`)
    console.error('请确认 acm-icpc 仓库位置，或用环境变量 ACM_ICPC_ROOT 指定，例如：')
    console.error('  $env:ACM_ICPC_ROOT = "D:\\code\\acm-icpc"; npm run sync')
    process.exitCode = 1
    return
  }

  // 1. 收集源文件
  const sols = solutionsOf(collectSources())
  const ctx = {
    blogRoot,
    acmRoot,
    srcDir,
    dstDir,
    dataDir,
    log,
    warn,
    solutions: sols,
    check: checkOnly,
    offline,
  }

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

  // 3. 生成站点数据（onFinish 可能继续修改 index）
  const indexData = indexOf(sols)

  // 4. 收尾钩子（写缓存、抓洛谷账号数据等）；--check 不产生副作用
  if (!checkOnly) {
    for (const [plugin, options] of plugins) {
      if (typeof plugin.onFinish !== 'function') continue
      const label = plugin.name || 'anonymous'
      try {
        await plugin.onFinish(indexData, ctx, options)
      } catch (e) {
        warn(`插件 ${label} 收尾失败：${e.message}`)
      }
    }
  }

  // 组内按标题排序，组间保持原顺序
  indexData.sort((a, b) =>
    a.category === b.category ? a.title.localeCompare(b.title, 'zh') : 0
  )

  // 5. 写入前先校验，避免把空正文/重复链接写进站点
  const { errors, warnings } = validateSolutions(sols, indexData)
  for (const message of warnings) warn(`  校验提示：${message}`)
  if (errors.length) {
    for (const message of errors) console.error(`  校验错误：${message}`)
    console.error(`同步中止：发现 ${errors.length} 个错误，未写入任何文件。`)
    process.exitCode = 1
    return
  }

  const outputs = sols.map((sol) => ({ rel: sol.rel, content: sol.body }))
  outputs.push({ rel: 'index.md', content: indexPageMd() })
  const indexJson = JSON.stringify(indexData, null, 2)

  if (checkOnly) {
    const diffs = checkOutputs(dstDir, outputs)
    diffs.index = checkFile(path.join(dataDir, 'solutionIndex.json'), indexJson)
    const lines = reportDiffs(diffs)
    if (lines.length) {
      console.error('生成结果与仓库不一致：')
      for (const line of lines) console.error(line)
      process.exitCode = 1
    } else {
      log('生成结果已是最新。')
    }
    log(formatMetaGaps(indexData))
    return
  }

  // 6. 只写有变化的文件，并清理 stale；不再 rmSync 整个目录
  const stats = writeOutputs(dstDir, outputs)
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, 'solutionIndex.json'), indexJson)

  log(
    `同步完成：${sols.length} 篇题解 → docs/solutions/` +
      `（写入 ${stats.changed}，未变 ${stats.unchanged}，清理 ${stats.removed}）`
  )
  log(`站点数据 → docs/.vitepress/solutionIndex.json`)
  log(formatMetaGaps(indexData))
}

main().catch((e) => {
  console.error(`同步失败：${e.stack || e.message}`)
  process.exitCode = 1
})
