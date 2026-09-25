// 插件：把「## 参考代码」小节包进 VitePress 的 details 容器，默认折叠
// frontmatter 写 collapse: false 可单篇关闭；小节内已出现 ::: 时改用四冒号容器
export default {
  name: 'collapse-code',

  wrap(body, title) {
    const lines = body.split('\n')
    const start = lines.findIndex((l) => /^##\s+参考代码\s*$/.test(l))
    if (start < 0) return body

    let end = lines.length
    for (let i = start + 1; i < lines.length; i++) {
      if (/^##\s/.test(lines[i])) {
        end = i
        break
      }
    }

    const section = lines.slice(start, end)
    const fence = section.some((l) => l.includes(':::')) ? '::::' : ':::'
    const wrapped = [`${fence} details ${title}`, '', ...section, '', fence, '']
    return [...lines.slice(0, start), ...wrapped, ...lines.slice(end)].join('\n')
  },

  onSolution(sol, ctx, options = {}) {
    if (String(sol.meta.collapse) === 'false') return
    if (!/^##\s+参考代码\s*$/m.test(sol.body)) return
    sol.body = this.wrap(sol.body, options.title || '点击展开参考代码')
  },
}
