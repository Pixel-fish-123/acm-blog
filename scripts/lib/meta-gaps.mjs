// 统计 solutionIndex 里缺难度 / 缺原题链接的篇数。
// sync 结束时打印；也可单独跑：node scripts/lib/meta-gaps.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export function formatMetaGaps(index) {
  const list = Array.isArray(index) ? index : []
  let missingDifficulty = 0
  let missingSource = 0
  for (const item of list) {
    if (!item?.difficulty) missingDifficulty++
    if (!item?.source) missingSource++
  }
  return `元数据缺口：共 ${list.length} 篇，缺难度 ${missingDifficulty} 篇，缺原题链接 ${missingSource} 篇`
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''
if (import.meta.url === entry) {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../docs/.vitepress/solutionIndex.json'
  )
  const index = JSON.parse(fs.readFileSync(file, 'utf8'))
  console.log(formatMetaGaps(index))
}
