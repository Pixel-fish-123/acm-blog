// 插件：frontmatter 缺 tags 时，用 tag-dict 从「算法类型」一行推断规范标签
import { inferTags } from './tag-dict.mjs'

export default {
  name: 'infer-meta',
  onSolution(sol, ctx) {
    if (Array.isArray(sol.meta.tags) && sol.meta.tags.length) return

    const line = sol.body.match(/^\*\*算法类型\*\*[：:]\s*(.+)$/m)
      || sol.body.match(/^算法类型[：:]\s*(.+)$/m)
    if (!line) return

    const tags = inferTags(line[1], 4)
    if (!tags.length) return

    sol.meta.tags = tags
    ctx.log(`  infer-meta: ${sol.rel} -> ${tags.join(', ')}`)
  },
}
