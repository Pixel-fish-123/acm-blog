// 插件：标签词表以 acm-icpc/.skill/SKILL.md 为准
// frontmatter 已有 tags 时只检查是否都在词表里；没有 tags 时从「算法类型」推断
import fs from 'node:fs'
import path from 'node:path'
import { inferTags, parseVocabulary } from './tag-dict.mjs'

function vocabularyOf(ctx, options) {
  if (Array.isArray(ctx.vocabulary)) return ctx.vocabulary

  const rel = options?.skill || '.skill/SKILL.md'
  const file = path.join(ctx.acmRoot, rel)
  let words = []
  try {
    words = parseVocabulary(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    ctx.warn(`infer-meta: 无法读取标签词表 ${file}：${e.message}`)
  }
  if (!words.length) ctx.warn(`infer-meta: ${file} 里没有解析到「标签词表」`)
  else ctx.log(`infer-meta: 从 SKILL.md 读取 ${words.length} 个标签`)

  ctx.vocabulary = words
  return words
}

export default {
  name: 'infer-meta',
  onSolution(sol, ctx, options) {
    const vocabulary = vocabularyOf(ctx, options)
    if (Array.isArray(sol.meta.tags) && sol.meta.tags.length) {
      if (!vocabulary.length) return
      const unknown = sol.meta.tags.filter((tag) => !vocabulary.includes(tag))
      if (unknown.length) {
        ctx.warn(`  infer-meta: ${sol.rel} 的标签不在 SKILL.md 词表中：${unknown.join('、')}`)
      }
      return
    }

    const line = sol.body.match(/^\*\*算法类型\*\*[：:]\s*(.+)$/m)
      || sol.body.match(/^算法类型[：:]\s*(.+)$/m)
    if (!line) return

    const tags = inferTags(line[1], vocabulary, 4)
    if (!tags.length) return

    sol.meta.tags = tags
    ctx.log(`  infer-meta: ${sol.rel} -> ${tags.join(', ')}`)
  },
}
