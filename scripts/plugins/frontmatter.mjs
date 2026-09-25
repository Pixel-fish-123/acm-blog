// 插件：解析源题解开头的 frontmatter，写入 sol.meta 并把正文赋给 sol.body
import { parseFrontmatter } from '../lib/frontmatter.mjs'

export default {
  name: 'frontmatter',
  onSolution(sol) {
    const { meta, body } = parseFrontmatter(sol.raw)
    sol.meta = { ...meta }
    sol.body = body
  },
}
