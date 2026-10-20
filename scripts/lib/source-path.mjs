// 源文件相对 acmRoot 的路径。
// solutions/ 里的 sol.rel 是相对 solutions/ 的，而 extraDirs 的 rel 已经相对 acmRoot，
// 所以 sync 会给每个 sol 写入 srcRel；这里保留旧的回退逻辑。
import path from 'node:path'

export function sourceRelOf(sol) {
  const explicit = String(sol?.srcRel || '').replaceAll('\\', '/')
  if (explicit) return explicit
  return path.posix.join('solutions', String(sol?.rel || '').replaceAll('\\', '/'))
}
