// 标签推断
// 规范词只来自 acm-icpc/.skill/SKILL.md 的「标签词表」，同步时解析，不在这里抄一份。
// ALIAS_RULES 只放「正文没写规范词」的别名（BIT → 树状数组）。新标签加进 SKILL.md 即可。

// 从 SKILL.md 全文抽出标签词表。格式约定：
//   ## 标签词表 到下一个 ## 标题之间，每一类一行「- 分类：词1、词2」
//   词后的中文括号注释会去掉，例如「交互（必须放第一位）」只保留「交互」
export function parseVocabulary(markdown) {
  const text = String(markdown || '').replace(/\r\n/g, '\n')
  const section = text.match(/^## 标签词表\n([\s\S]*?)(?=^## )/m)
  if (!section) return []

  const words = []
  let started = false
  for (const line of section[1].split('\n')) {
    // 说明文字在「按类分组」之前，不参与词表
    if (!started) {
      if (line.trim().startsWith('按类分组')) started = true
      continue
    }
    const body = line.match(/^-\s*[^：:\n]+[：:]\s*(.*)$/)
    if (!body) continue
    const cleaned = body[1].replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '')
    for (const part of cleaned.split('、')) {
      const word = part.trim()
      if (!word || /[\s`：:]/.test(word) || words.includes(word)) continue
      words.push(word)
    }
  }
  return words
}

// 别名 → 规范标签。规范词本身靠词表最长匹配，不要写进这里。
export const ALIAS_RULES = [
  [/BIT/i, '树状数组'],
  [/CDQ/i, 'CDQ分治'],
  [/重链剖分/, '树链剖分'],
  [/区间\s*(?:动态规划|DP)/, '区间DP'],
  [/树形\s*(?:动态规划|DP)/, '树形DP'],
  [/状压\s*(?:动态规划|DP)/, '状压DP'],
  [/数位\s*(?:动态规划|DP)/, '数位DP'],
  [/计数\s*(?:动态规划|DP)/, '计数DP'],
  [/线性\s*(?:动态规划|DP)|动态规划|(?<![A-Za-z])DP\b/, '线性DP'],
  [/字典树/i, 'Trie'],
  [/最小割/, '网络流'],
  [/黑白染色|Hall/, '二分图'],
  [/拓扑序/, '拓扑排序'],
  [/强连通|割点|双连通/, 'Tarjan'],
  [/最近公共祖先|倍增/, 'LCA'],
  [/SPFA|Floyd|Dijkstra/i, '最短路'],
  [/Kruskal/i, '最小生成树'],
  [/树上差分|树上|子树/, '树上问题'],
  [/小根堆|大根堆|优先队列/, '堆'],
  [/莫队|整除分块/, '分块'],
  [/后缀和|后缀最小|后缀最大/, '前缀和'],
  [/失配|border/i, 'KMP'],
  [/快速幂/, '矩阵'],
  [/组合计数|组合数|方案数|阶乘/, '组合数学'],
  [/Nim|威佐夫|Wythoff|博弈/i, '博弈论'],
  [/素数|质数|逆元|中国剩余定理|莫比乌斯/, '数论'],
  [/异或|按位|掩码|二进制/, '位运算'],
  [/广度优先/, 'BFS'],
  [/深度优先/, 'DFS'],
  [/交换论证|邻项交换/, '贪心'],
  [/背包/, '背包DP'],
]

function vocabularySpans(text, vocabulary) {
  const spans = []
  for (const word of vocabulary) {
    const ascii = /^[\x00-\x7F]+$/.test(word)
    const hay = ascii ? text.toLowerCase() : text
    const needle = ascii ? word.toLowerCase() : word
    if (!needle) continue
    let from = 0
    while (from <= hay.length - needle.length) {
      const at = hay.indexOf(needle, from)
      if (at < 0) break
      spans.push({ start: at, end: at + needle.length, tag: word })
      from = at + 1
    }
  }
  return spans
}

function aliasSpans(text, vocabulary) {
  const spans = []
  for (const [re, tag] of ALIAS_RULES) {
    if (!vocabulary.includes(tag)) continue
    const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`
    const globalRe = new RegExp(re.source, flags)
    for (const match of text.matchAll(globalRe)) {
      if (!match[0] || match.index == null) continue
      spans.push({ start: match.index, end: match.index + match[0].length, tag })
    }
  }
  return spans
}

// 从一段文字（通常是「算法类型」那一行）推断规范标签。
// 同一起点取最长匹配，所以「CDQ分治」不会再拆出「分治」，「单调栈」不会再拆出「栈」。
// 命中顺序按文中出现位置，主算法在前。
export function inferTags(text, vocabulary, max = 4) {
  const words = Array.isArray(vocabulary) ? vocabulary : []
  const source = String(text || '')
  if (!source || !words.length) return []

  const spans = [...vocabularySpans(source, words), ...aliasSpans(source, words)]
  spans.sort((a, b) => a.start - b.start || b.end - a.end)

  const hits = []
  let cursor = 0
  for (const span of spans) {
    if (hits.length >= max) break
    if (span.start < cursor) continue
    cursor = span.end
    if (!hits.includes(span.tag)) hits.push(span.tag)
  }
  return hits
}
