// 同步脚本：从 acm-icpc 仓库的 solutions/ 拷贝题解到博客 docs/solutions/，并生成索引页
// 用法：npm run sync
// 可通过环境变量 ACM_ICPC_ROOT 指定 acm-icpc 仓库路径（默认：博客仓库的上一级目录）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const blogRoot = path.resolve(__dirname, '..')
const acmRoot = process.env.ACM_ICPC_ROOT || path.resolve(blogRoot, '..', 'acm-icpc')
const srcDir = path.join(acmRoot, 'solutions')
const dstDir = path.join(blogRoot, 'docs', 'solutions')

if (!fs.existsSync(srcDir)) {
  console.error(`找不到题解源目录: ${srcDir}`)
  console.error('请确认 acm-icpc 仓库位置，或用环境变量 ACM_ICPC_ROOT 指定，例如：')
  console.error('  $env:ACM_ICPC_ROOT = "D:\\code\\acm-icpc"; npm run sync')
  process.exit(1)
}

function collectMd(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectMd(full, base, out)
    else if (entry.name.endsWith('.md')) out.push(path.relative(base, full))
  }
  return out
}

// 读取 markdown 首个 h1 作为链接文本
function h1Of(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const m = raw.match(/^#\s+(.+)$/m)
    if (m) return m[1]
  } catch { /* fallthrough */ }
  return path.basename(file, '.md')
}

// 1. 清空并重建目标目录
fs.rmSync(dstDir, { recursive: true, force: true })
fs.mkdirSync(dstDir, { recursive: true })

// 2. 拷贝所有 markdown（保留子目录结构）
const files = collectMd(srcDir, srcDir, []).sort()
for (const rel of files) {
  const to = path.join(dstDir, rel)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(path.join(srcDir, rel), to)
}

// 3. 生成索引页（docs/solutions/index.md）
const groups = new Map()
for (const rel of files) {
  const dir = path.dirname(rel) === '.' ? '专题' : path.dirname(rel)
  if (!groups.has(dir)) groups.set(dir, [])
  groups.get(dir).push(rel)
}
let index = '# 题解索引\n\n> 本页由 `npm run sync` 自动生成，请勿手动编辑。\n\n'
for (const group of [...groups.keys()].sort()) {
  index += `## ${group}\n\n`
  for (const rel of groups.get(group)) {
    index += `- [${h1Of(path.join(srcDir, rel))}](./${rel.replaceAll('\\', '/')})\n`
  }
  index += '\n'
}
fs.writeFileSync(path.join(dstDir, 'index.md'), index)

console.log(`同步完成：${files.length} 篇题解 → docs/solutions/`)
