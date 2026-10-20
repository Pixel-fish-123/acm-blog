import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  checkFile,
  checkOutputs,
  validateSolutions,
  writeOutputs,
} from '../scripts/lib/output.mjs'

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'acm-blog-output-'))
}

test('validateSolutions 发现空正文、缺标题和重复链接', () => {
  const sols = [
    { rel: 'luogu/A_solution.md', raw: '# A\n', body: '# A\n', meta: { tags: ['贪心'] } },
    { rel: 'luogu/B_solution.md', raw: '', body: '', meta: {} },
    { rel: 'luogu/C_solution.md', raw: '正文', body: '正文', meta: {} },
    { rel: 'luogu/A_solution.md', raw: '# A2\n', body: '# A2\n', meta: {} },
  ]
  const indexData = [
    { title: 'A', link: '/solutions/luogu/A_solution' },
    { title: 'A2', link: '/solutions/luogu/A_solution' },
  ]
  const { errors, warnings } = validateSolutions(sols, indexData)
  assert.equal(errors.some((e) => e.includes('正文为空')), true)
  assert.equal(errors.some((e) => e.includes('缺少一级标题')), true)
  assert.equal(errors.some((e) => e.includes('重复文件路径')), true)
  assert.equal(errors.some((e) => e.includes('重复的 link')), true)
  assert.equal(warnings.some((w) => w.includes('缺少 tags')), true)
})

test('validateSolutions 提示 tags 超过 4 个', () => {
  const sols = [
    {
      rel: 'luogu/A_solution.md',
      raw: '# A\n',
      body: '# A\n',
      meta: { tags: ['a', 'b', 'c', 'd', 'e'] },
    },
  ]
  const { errors, warnings } = validateSolutions(sols, [])
  assert.deepEqual(errors, [])
  assert.equal(warnings.some((w) => w.includes('最多 4 个')), true)
})

test('validateSolutions 把重复题号合并成一条提示', () => {
  const sols = [
    { rel: 'a/A_solution.md', raw: '# A\n', body: '# A\n', meta: { tags: ['贪心'] } },
    { rel: 'b/A_solution.md', raw: '# A\n', body: '# A\n', meta: { tags: ['贪心'] } },
  ]
  const indexData = [
    { id: 'A', title: 'A1', link: '/solutions/a/A_solution' },
    { id: 'A', title: 'A2', link: '/solutions/b/A_solution' },
  ]
  const { warnings } = validateSolutions(sols, indexData)
  const duplicate = warnings.filter((w) => w.includes('题号重复'))
  assert.equal(duplicate.length, 1)
  assert.equal(duplicate[0].includes('/solutions/a/A_solution'), true)
  assert.equal(duplicate[0].includes('/solutions/b/A_solution'), true)
  assert.equal(duplicate[0].includes('A1'), true)
  assert.equal(duplicate[0].includes('A2'), true)
})

test('validateSolutions 发现残留 frontmatter', () => {
  const sols = [
    {
      rel: 'luogu/A_solution.md',
      raw: '---\ntags: [贪心]\n---\n# A\n',
      body: '---\ntags: [贪心]\n---\n# A\n',
      meta: {},
    },
  ]
  const { errors } = validateSolutions(sols, [])
  assert.equal(errors.some((e) => e.includes('frontmatter')), true)
})

test('writeOutputs 只写变化文件并清理 stale', () => {
  const dir = tempDir()
  try {
    fs.writeFileSync(path.join(dir, 'same.md'), 'same')
    fs.writeFileSync(path.join(dir, 'changed.md'), 'old')
    fs.writeFileSync(path.join(dir, 'stale.md'), 'old')
    fs.mkdirSync(path.join(dir, 'empty'))

    const stats = writeOutputs(dir, [
      { rel: 'same.md', content: 'same' },
      { rel: 'changed.md', content: 'new' },
      { rel: 'new.md', content: 'new' },
    ])

    assert.deepEqual(stats, { changed: 2, unchanged: 1, removed: 1 })
    assert.equal(fs.readFileSync(path.join(dir, 'changed.md'), 'utf8'), 'new')
    assert.equal(fs.readFileSync(path.join(dir, 'new.md'), 'utf8'), 'new')
    assert.equal(fs.existsSync(path.join(dir, 'stale.md')), false)
    assert.equal(fs.existsSync(path.join(dir, 'empty')), false)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('checkOutputs 报告 missing/changed/stale', () => {
  const dir = tempDir()
  try {
    fs.writeFileSync(path.join(dir, 'changed.md'), 'old')
    fs.writeFileSync(path.join(dir, 'stale.md'), 'old')
    const diffs = checkOutputs(dir, [
      { rel: 'changed.md', content: 'new' },
      { rel: 'missing.md', content: 'new' },
    ])
    assert.deepEqual(diffs.missing, ['missing.md'])
    assert.deepEqual(diffs.changed, ['changed.md'])
    assert.deepEqual(diffs.stale, ['stale.md'])
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('checkFile 区分缺失、变化和相同', () => {
  const dir = tempDir()
  try {
    const file = path.join(dir, 'a.json')
    assert.equal(checkFile(file, 'x'), 'missing')
    fs.writeFileSync(file, 'x')
    assert.equal(checkFile(file, 'x'), null)
    assert.equal(checkFile(file, 'y'), 'changed')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('writeOutputs 拒绝路径穿越', () => {
  const dir = tempDir()
  try {
    assert.throws(() => writeOutputs(dir, [{ rel: '../x.md', content: 'x' }]), /非法/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
