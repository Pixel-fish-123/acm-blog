// 文件收集工具
import fs from 'node:fs'
import path from 'node:path'

// 递归收集 dir 下的所有 .md，返回相对 base 的路径
export function collectMd(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectMd(full, base, out)
    else if (entry.name.endsWith('.md')) out.push(path.relative(base, full))
  }
  return out
}
