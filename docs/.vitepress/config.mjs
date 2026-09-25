import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'

// 博客部署在项目页：https://<user>.github.io/acm-blog/
const base = process.env.VITEPRESS_BASE || '/acm-blog/'

// 中文没有词间空格，MiniSearch 默认的 tokenize 只按空格和标点切分，会把一整句中文
// 当成一个 token，于是搜「剖分」命中不了正文里的「树链剖分」。这里改成：
// 英文数字按单词切分并转小写，连续汉字切成长度为 2 的相邻切片（bigram），落单的汉字原样保留。
// 建索引和查询必须用同一个分词器，否则 bigram 对不上。
// 注意：这个函数会随站点数据被 VitePress 序列化成源码字符串（`_vp-fn_` 前缀）再在浏览器里
// new Function 还原，所以它必须自包含 —— 不能引用外部变量、import 或 this。
function cjkTokenize(text) {
  const tokens = []
  let han = ''
  let word = ''
  const flushWord = () => {
    if (word) {
      tokens.push(word.toLowerCase())
      word = ''
    }
  }
  const flushHan = () => {
    if (!han) return
    if (han.length === 1) tokens.push(han)
    else {
      for (let i = 0; i < han.length - 1; i++) tokens.push(han.slice(i, i + 2))
    }
    han = ''
  }
  for (const ch of String(text)) {
    const code = ch.codePointAt(0)
    if (code >= 0x4e00 && code <= 0x9fff) {
      flushWord()
      han += ch
    } else if (/[0-9A-Za-z_]/.test(ch)) {
      flushHan()
      word += ch
    } else {
      flushWord()
      flushHan()
    }
  }
  flushWord()
  flushHan()
  return tokens
}

// 题解页的索引文本里要补上「题号 + 算法标签」。标签以 solutionIndex.json 为准：
// 它可能来自 frontmatter，也可能是 sync 的 infer-meta 插件推断出来的，比 frontmatter 更全。
// 注意：本地搜索插件传给 _render 的 markdown 已经被 processIncludes 去掉了 frontmatter
// （实测 env.frontmatter 是空的），所以只能从 env.path 自己往上找 solutionIndex.json。
// 按目录缓存一份解析结果，整次构建只读一次文件。
const solutionIndexCache = new Map()

function solutionIndexFor(file) {
  let dir = path.dirname(file)
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, '.vitepress', 'solutionIndex.json')
    if (fs.existsSync(candidate)) {
      if (!solutionIndexCache.has(candidate)) {
        try {
          const list = JSON.parse(fs.readFileSync(candidate, 'utf8'))
          solutionIndexCache.set(candidate, new Map(list.map((item) => [item.link, item])))
        } catch {
          solutionIndexCache.set(candidate, new Map())
        }
      }
      return solutionIndexCache.get(candidate)
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return new Map()
}

// 内联 SVG 图标（不依赖外网 CDN，避免图标空白）
const githubIcon =
  '<svg viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>'

export default defineConfig({
  title: 'Pixel_fish 的题解博客',
  description: '算法竞赛刷题与题解记录',
  base,
  lastUpdated: true,
  cleanUrls: true,
  appearance: false, // 禁用明暗模式切换（顶层配置，固定浅色；右上角切换按钮随之消失）
  markdown: {
    math: true, // 启用数学公式渲染（题解中的 $...$ / $$...$$）
  },
  themeConfig: {
    siteTitle: false, // 左上角不显示站名，搜索框占据该位置
    nav: [
      { text: '首页', link: '/' },
      { text: '题解索引', link: '/solutions/' },
      { text: '上传时间线', link: '/stats' },
    ],
    outline: false, // 不渲染目录大纲
    aside: false, // 移除右侧 aside 区域（否则会留下 256px 空白的"无色区域"）
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            // 自定义分词：中文按 bigram 切分，英文数字按单词切分（见文件顶部的 cjkTokenize）
            tokenize: cjkTokenize,
          },
          searchOptions: {
            prefix: true,
            fuzzy: 0.2,
            // 覆盖 VitePress 默认的 { title: 4, text: 2, titles: 1 }：标题权重拉开，正文降权，
            // 避免正文里的 bigram 命中把标题命中的题解挤下去
            boost: { title: 4, titles: 2 },
          },
        },
        // 题解正文里通常不出现「题号」和算法标签，把它们补进索引文本，
        // 搜 P3384 / 贪心入门 / 笛卡尔树 才能命中对应题解。
        // 只处理 docs/solutions/**/<name>_solution.md；首页、索引页、时间线页原样返回。
        // 前缀 `_` 让 VitePress 跳过序列化，所以这里可以正常用闭包和 node API。
        _render(src, env, md) {
          const html = md.render(src, env)
          const rel = env.relativePath || ''
          if (!rel.startsWith('solutions/') || !rel.endsWith('_solution.md')) return html
          const item = solutionIndexFor(env.path).get('/' + rel.replace(/\.md$/, ''))
          const words = [item?.id, ...(item?.tags || [])].filter(Boolean)
          if (!words.length) return html
          // 插在 </h1> 之后，关键词就落进一级标题那一节，搜索结果直接指向文章开头。
          // 这个返回值只喂给搜索索引（splitPageIntoSections），不会进页面 HTML。
          const marker = `<p hidden>${words.join(' ')}</p>`
          const at = html.indexOf('</h1>')
          return at < 0 ? html + marker : html.slice(0, at + 5) + marker + html.slice(at + 5)
        },
      },
    },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '更新于', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },
    socialLinks: [
      { icon: { svg: githubIcon }, link: 'https://github.com/Pixel-fish-123' },
      // 洛谷图标由 NavLuogu 组件渲染（docs/public/luogu_favicon.ico）
    ],
    footer: {
      message: '题解由同步脚本从 acm-icpc 仓库维护',
      copyright: 'Copyright © 2026 Pixel-fish-123',
    },
  },
})
