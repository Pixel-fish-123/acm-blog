// Markdown 文本处理：标题提取与摘要生成
// 注意：这两个函数接收字符串（不再是文件路径），由调用方负责读取文件

// 读取 markdown 首个 h1 作为标题
export function h1Of(raw) {
  const m = String(raw || '').match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

// 提取纯文本摘要（去掉 frontmatter、代码块、公式、容器语法、markdown 语法）
export function summaryOf(raw, limit = 80) {
  let text = String(raw || '')
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ' ') // frontmatter
  text = text.replace(/```[\s\S]*?```/g, ' ')
  text = text.replace(/`[^`]*`/g, ' ')
  text = text.replace(/\$\$[\s\S]*?\$\$/g, ' ')
  text = text.replace(/\$([^$\n]*)\$/g, (_m, g) => g.replace(/\\/g, ' ').replace(/[{}]/g, ' '))
  text = text.replace(/^\s*:::.*$/gm, ' ') // VitePress 容器语法（含 ::: details 标题行）
  text = text.replace(/^#.*$/gm, ' ')
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  text = text.replace(/[*_>|#~]/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  if (!text) return '（暂无摘要）'
  return text.length > limit ? text.slice(0, limit) + '...' : text
}
