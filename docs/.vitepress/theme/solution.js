import { computed } from 'vue'
import { useData } from 'vitepress'
import solutionIndex from '../solutionIndex.json'

// 由页面路径反查题解元数据。
// relativePath 形如 `solutions/luogu/P3384_solution.md`，
// solutionIndex 里的 link 形如 `/solutions/luogu/P3384_solution`（无扩展名）。
export function findSolutionByRelativePath(rel) {
  if (!rel) return null
  const link = '/' + rel.replace(/\.md$/, '')
  return solutionIndex.find((item) => item.link === link) || null
}

// 当前页面对应的题解；首页、索引页等非题解页返回 null
export function useCurrentSolution() {
  const { page } = useData()
  return computed(() => findSolutionByRelativePath(page.value.relativePath))
}
