// 同步输出层：写入前校验、只写变化的文件、清理过期文件、支持 --check 对比。
import fs from 'node:fs'
import path from 'node:path'
import { collectMd } from './fs-utils.mjs'
import { h1Of } from './markdown.mjs'

export function normalizeRel(rel) {
  return String(rel || '').replaceAll('\\', '/')
}

function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

function assertSafeRel(rel) {
  const value = normalizeRel(rel)
  if (!value || value.startsWith('/') || value.split('/').includes('..')) {
    throw new Error(`非法的输出路径：${rel}`)
  }
  return value
}

// 校验所有题解和索引数据。errors 会中止写入；warnings 只提示。
export function validateSolutions(sols, indexData = []) {
  const errors = []
  const warnings = []
  const rels = new Map()
  const links = new Map()

  for (const sol of sols) {
    const rel = normalizeRel(sol.rel)
    const relKey = rel.toLowerCase()
    if (rels.has(relKey)) {
      errors.push(`重复文件路径：${rel}（与 ${rels.get(relKey)} 冲突）`)
    } else {
      rels.set(relKey, rel)
    }

    if (typeof sol.body !== 'string' || !sol.body.trim()) {
      errors.push(`${rel}：正文为空`)
      continue
    }
    if (!h1Of(sol.body)) {
      errors.push(`${rel}：缺少一级标题（# 标题）`)
    }
    if (/^---\r?\n/.test(String(sol.raw || '')) && /^---\r?\n/.test(sol.body)) {
      errors.push(`${rel}：正文仍包含 frontmatter`)
    }

    const tags = sol.meta?.tags
    if (tags !== undefined && !Array.isArray(tags)) {
      warnings.push(`${rel}：tags 不是数组，可能不会被正常展示`)
    } else if (Array.isArray(tags) && tags.length > 4) {
      warnings.push(`${rel}：tags 有 ${tags.length} 个，约定最多 4 个`)
    } else if (
      rel.endsWith('_solution.md') &&
      (!Array.isArray(tags) || tags.length === 0)
    ) {
      warnings.push(`${rel}：缺少 tags`)
    }
  }

  const idToItems = new Map()
  for (const item of indexData) {
    const link = normalizeRel(item?.link)
    if (!item?.title) errors.push(`索引条目缺少标题：${link || '(空)'}`)
    if (!link) {
      errors.push(`索引条目缺少 link：${item?.title || '(空)'}`)
      continue
    }
    if (links.has(link)) {
      errors.push(`重复的 link：${link}`)
    } else {
      links.set(link, true)
    }
    // 题号重复不阻止发布（不同比赛可能出现同一个 A/B/C），但要把具体位置列清楚。
    if (item.id) {
      const list = idToItems.get(item.id) || []
      list.push({ link, title: item.title })
      idToItems.set(item.id, list)
    }
  }
  const duplicatedIds = [...idToItems.entries()].filter(([, list]) => list.length > 1)
  if (duplicatedIds.length) {
    const detail = duplicatedIds
      .map(
        ([id, list]) =>
          `  ${id}：\n${list.map((item) => `    ${item.link}（${item.title}）`).join('\n')}`
      )
      .join('\n')
    warnings.push(
      `题号重复（页面按 link 区分，不影响打开，但搜索/题号排序会混在一起）：\n${detail}`
    )
  }

  return { errors, warnings }
}

function pruneEmptyDirsRecursive(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const full = path.join(dir, entry.name)
    pruneEmptyDirsRecursive(full)
    if (fs.readdirSync(full).length === 0) fs.rmdirSync(full)
  }
}

// 删除输出目录里不再需要的子目录（保留 dstDir 本身）。
export function pruneEmptyDirs(dstDir) {
  if (!fs.existsSync(dstDir)) return
  pruneEmptyDirsRecursive(dstDir)
}

function existingRelPaths(dstDir) {
  if (!fs.existsSync(dstDir)) return []
  return collectMd(dstDir, dstDir, []).map(normalizeRel)
}

function prepareOutputs(outputs) {
  const seen = new Set()
  return outputs.map(({ rel, content }) => {
    const value = assertSafeRel(rel)
    const key = value.toLowerCase()
    if (seen.has(key)) throw new Error(`重复的输出路径：${value}`)
    seen.add(key)
    return { rel: value, content: String(content ?? '') }
  })
}

// 逐文件原子替换，未变化的文件保持原样；最后删除 stale 文件。
export function writeOutputs(dstDir, outputs) {
  const prepared = prepareOutputs(outputs)
  fs.mkdirSync(dstDir, { recursive: true })

  let changed = 0
  let unchanged = 0
  for (const { rel, content } of prepared) {
    const to = path.join(dstDir, rel)
    const old = readIfExists(to)
    if (old === content) {
      unchanged++
      continue
    }

    fs.mkdirSync(path.dirname(to), { recursive: true })
    const tmp = path.join(
      path.dirname(to),
      `.${path.basename(to)}.tmp-${process.pid}-${Date.now()}`
    )
    try {
      fs.writeFileSync(tmp, content)
      try {
        fs.renameSync(tmp, to)
      } catch (e) {
        // Windows 上目标存在时个别文件系统不允许 rename 覆盖，退化为先删后改名。
        if (!['EEXIST', 'EPERM', 'EACCES'].includes(e.code)) throw e
        fs.rmSync(to, { force: true })
        fs.renameSync(tmp, to)
      }
    } finally {
      if (fs.existsSync(tmp)) fs.rmSync(tmp, { force: true })
    }
    changed++
  }

  const expected = new Set(prepared.map((item) => item.rel))
  let removed = 0
  for (const rel of existingRelPaths(dstDir)) {
    if (expected.has(rel)) continue
    fs.rmSync(path.join(dstDir, rel), { force: true })
    removed++
  }
  pruneEmptyDirs(dstDir)

  return { changed, unchanged, removed }
}

// 不写文件，只返回差异；供 npm run sync -- --check 使用。
export function checkOutputs(dstDir, outputs) {
  const prepared = prepareOutputs(outputs)
  const missing = []
  const changed = []
  for (const { rel, content } of prepared) {
    const old = readIfExists(path.join(dstDir, rel))
    if (old === null) missing.push(rel)
    else if (old !== content) changed.push(rel)
  }

  const expected = new Set(prepared.map((item) => item.rel))
  const stale = existingRelPaths(dstDir).filter((rel) => !expected.has(rel))
  return { missing, changed, stale }
}

export function checkFile(file, content) {
  const old = readIfExists(file)
  if (old === null) return 'missing'
  return old === content ? null : 'changed'
}
