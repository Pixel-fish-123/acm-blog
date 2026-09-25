// 插件：用 git 首次加入该文件的提交日期作为 date，失败时退回源文件 mtime
// 用 --diff-filter=A 而不是最后一次提交，避免一次性批量回填把所有题解压成同一天
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

// sol.rel 是相对 solutions/ 的（如 luogu/P3384_solution.md），
// 而 git 命令的 cwd 是 acmRoot，所以 pathspec 必须带上 solutions/ 前缀，
// 否则 git 匹配不到任何文件、输出空串且退出码为 0，插件会静默退回 mtime。
const relFromRoot = (sol) => path.posix.join('solutions', sol.rel)

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

function firstAddedDate(acmRoot, rel) {
  try {
    return git(acmRoot, ['log', '-1', '--diff-filter=A', '--format=%cs', '--', rel]).split('\n')[0].trim()
  } catch {
    return ''
  }
}

function isTracked(acmRoot, rel) {
  try {
    git(acmRoot, ['ls-files', '--error-unmatch', '--', rel])
    return true
  } catch {
    return false
  }
}

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
    const rel = relFromRoot(sol)
    const date = firstAddedDate(ctx.acmRoot, rel)
    if (date) {
      sol.meta.date = date
      return
    }
    // 跟踪着的文件却查不到首次加入日期，说明 pathspec 之类出了问题，别静默吞掉
    if (isTracked(ctx.acmRoot, rel)) {
      ctx.warn(`git-date: ${rel} 已被 git 跟踪但查不到首次加入日期，退回文件 mtime`)
    }
    sol.meta.date = mtimeDate(sol.full)
  },
}
