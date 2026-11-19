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
    const maxTags = options?.maxTags || 4
    const isMathNote = sol.dir === 'useful_maths_conclusions'
    const line = sol.body.match(/^\*\*算法类型\*\*[：:]\s*(.+)$/m)
      || sol.body.match(/^算法类型[：:]\s*(.+)$/m)
    const inferred = line
      ? inferTags(line[1], vocabulary, maxTags)
      : isMathNote
        ? inferTags(sol.body, vocabulary, maxTags)
        : []
    if (isMathNote && (!vocabulary.length || vocabulary.includes('好用的数学结论'))) {
      const idx = inferred.indexOf('好用的数学结论')
      if (idx > 0) inferred.splice(idx, 1)
      if (idx !== 0) inferred.unshift('好用的数学结论')
      if (inferred.length > maxTags) inferred.length = maxTags
    }

    if (Array.isArray(sol.meta.tags) && sol.meta.tags.length) {
      if (!vocabulary.length) return
      const unknown = sol.meta.tags.filter((tag) => !vocabulary.includes(tag))
      if (unknown.length) {
        ctx.warn(`  infer-meta: ${sol.rel} 的标签不在 SKILL.md 词表中：${unknown.join('、')}`)
      }
      if (options?.supplement !== false && inferred.length && sol.meta.tags.length < maxTags) {
        const merged = [...sol.meta.tags]
        for (const tag of inferred) {
          if (merged.length >= maxTags) break
          if (!merged.includes(tag)) merged.push(tag)
        }
        if (merged.length > sol.meta.tags.length) {
          sol.meta.tags = merged
        }
      }
      return
    }

    if (!inferred.length) return

    sol.meta.tags = inferred
    ctx.log(`  infer-meta: ${sol.rel} -> ${inferred.join(', ')}`)
  },
}
