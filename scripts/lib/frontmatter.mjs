// 题解 frontmatter 解析（不引入 YAML 依赖）
// 支持三种写法：key: value、key: "value"、key: [a, b]

// 解析后返回值：{ meta, body }
// meta 中的 tags 为数组，其余为字符串；body 为去掉 frontmatter 的正文
export function parseFrontmatter(raw) {
  // 去掉 Windows 编辑器可能写入的 BOM，否则开头的 --- 匹配不到。
  const text = String(raw || '').replace(/^\uFEFF/, '')
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?/)
  if (!m) return { meta: {}, body: text }

  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    const value = kv[2].trim()
    const arr = value.match(/^\[([\s\S]*)\]$/)
    if (arr) {
      meta[key] = arr[1]
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
      continue
    }
    meta[key] = value.replace(/^["']|["']$/g, '')
  }
  return { meta, body: text.slice(m[0].length) }
}
