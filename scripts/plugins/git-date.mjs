// 插件：用 git 首次加入该文件的提交日期作为 date，失败时退回源文件 mtime
// 用 --diff-filter=A 而不是最后一次提交，避免一次性批量回填把所有题解压成同一天
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

function mtimeDate(full) {
  try {
    return fs.statSync(full).mtime.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

export default {
  name: 'git-date',
  onSolution(sol, ctx) {
    if (sol.meta.date) return
    try {
      const out = execFileSync(
        'git',
        ['log', '-1', '--diff-filter=A', '--format=%cs', '--', sol.rel],
        { cwd: ctx.acmRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      )
      const date = out.trim().split('\n')[0].trim()
      if (date) {
        sol.meta.date = date
        return
      }
    } catch { /* 非 git 仓库或 git 不可用 */ }
    sol.meta.date = mtimeDate(sol.full)
  },
}
