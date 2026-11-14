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
  [/(?<![A-Za-z0-9_])BIT(?!\s*-)|Fenwick/i, '树状数组'],
  [/CDQ\s*分治|\bCDQ\b/i, 'CDQ分治'],
  [/重链剖分|长链剖分/, '树链剖分'],
  [/换根\s*(?:动态规划|DP)/i, '换根DP'],
  [/区间\s*(?:动态规划|DP)/i, '区间DP'],
  [/树形\s*(?:动态规划|DP)|树上\s*(?:动态规划|DP)/i, '树形DP'],
  [/状压\s*(?:动态规划|DP)|状态压缩\s*(?:动态规划|DP)?/i, '状压DP'],
  [/数位\s*(?:动态规划|DP)/i, '数位DP'],
  [/计数\s*(?:动态规划|DP)/i, '计数DP'],
  [/概率\s*(?:动态规划|DP)|期望\s*(?:动态规划|DP)/i, '概率DP'],
  [/单调队列优化\s*(?:动态规划|DP)/i, '单调队列优化DP'],
  [/斜率优化\s*(?:动态规划|DP)?|凸包优化/i, '斜率优化DP'],
  [/0-?1\s*背包|完全背包|多重背包|分组背包|树上背包|背包\s*(?:动态规划|DP)|背包/i, '背包DP'],
  [/0-?1\s*(?:Trie|字典树)|异或字典树/i, '0-1Trie'],
  [/字典树|前缀树/i, 'Trie'],
  [/动态开点权值线段树|权值线段树/, '权值线段树'],
  [/动态开点线段树|动态开点/, '动态开点线段树'],
  [/主席树|可持久化权值线段树|可持久化线段树/, '可持久化线段树'],
  [/DSU\s*on\s*tree|树上启发式/i, '树上启发式合并'],
  [/Treap|FHQ[\s-]*Treap|Splay|平衡二叉搜索树/i, '平衡树'],
  [/\bRMQ\b|稀疏表/i, 'ST表'],
  [/扩展域并查集|种类并查集|带权并查集/, '带权并查集'],
  [/\bDSU\b/i, '并查集'],
  [/最大流最小割|最小割/, '最小割'],
  [/最大流|\bDinic\b|\bISAP\b/i, '网络流'],
  [/最小费用最大流|最大费用最大流|\bMCMF\b/i, '费用流'],
  [/匈牙利算法|黑白染色|染色判二分图|Hall\s*定理|\bHall\b|最大匹配/i, '二分图'],
  [/拓扑序|\bKahn\b/i, '拓扑排序'],
  [/欧拉路径|欧拉通路|欧拉回路|欧拉环游|一笔画/, '欧拉回路'],
  [/\bSCC\b|强连通分量|强连通|缩点/i, '强连通分量'],
  [/点双连通|边双连通|双连通分量|双连通|\bBCC\b/i, '双连通分量'],
  [/割点|割边|找桥|删桥/, '割点与桥'],
  [/最近公共祖先|树上倍增/, 'LCA'],
  [/\bSPFA\b|Bellman[\s-]*Ford|\bFloyd\b|\bDijkstra\b|0-?1\s*BFS/i, '最短路'],
  [/\bKruskal\b|\bPrim\b|\bBoruvka\b|瓶颈生成树/i, '最小生成树'],
  [/树上点差分|树上边差分|树上异或差分|树上差分/, '树上差分'],
  [/直径/, '树的直径'],
  [/重心/, '树的重心'],
  [/点分树|动态点分治/, '点分治'],
  [/树上|子树/, '树上问题'],
  [/小根堆|大根堆|优先队列|对顶堆/, '堆'],
  [/回滚莫队|树上莫队|带修莫队|莫队/, '莫队'],
  [/整除分块|数论分块|根号分治|块状链表|值域分块/, '分块'],
  [/二维前缀和|二维差分/, '差分'],
  [/后缀和|后缀最小|后缀最大|前後缀|前后缀/, '前缀和'],
  [/滑动窗口|同向双指针|相向双指针/, '双指针'],
  [/坐标离散化/, '离散化'],
  [/折半枚举|双向搜索|meet\s*in\s*the\s*middle/i, '折半搜索'],
  [/扩展\s*KMP|\bexKMP\b/i, 'Z函数'],
  [/马拉车/, 'Manacher'],
  [/AC\s*自动机/i, 'AC自动机'],
  [/后缀数组|\bSA\b/i, '后缀数组'],
  [/后缀自动机|\bSAM\b/i, '后缀自动机'],
  [/前缀函数|失配指针|失配|\bborder\b/i, 'KMP'],
  [/矩阵快速幂|伴随矩阵/, '矩阵快速幂'],
  [/快速幂/, '数学'],
  [/容斥|莫比乌斯函数容斥/, '容斥原理'],
  [/\bLucas\b/i, '卢卡斯定理'],
  [/\bCatalan\b/i, '卡特兰数'],
  [/组合计数|组合数|方案数|阶乘|二项式|曲棍球棒/, '组合数学'],
  [/SG\s*定理|SG\s*函数|Sprague[\s-]*Grundy/i, 'SG函数'],
  [/Anti-?Nim|Fibonacci\s*Nim|\bNim\b|威佐夫|\bWythoff\b|巴什|博弈|必胜|必败/i, '博弈论'],
  [/线性筛|欧拉筛|埃氏筛|素数筛|质数筛/, '素数筛'],
  [/分解质因数|唯一分解/, '质因数分解'],
  [/最大公约数|最小公倍数|裴蜀定理|辗转相除|\bgcd\b|\blcm\b/i, 'GCD'],
  [/\bexgcd\b|扩展欧几里得/i, '扩展欧几里得'],
  [/\bCRT\b|\bexCRT\b|扩展中国剩余定理/i, '中国剩余定理'],
  [/费马小定理|线性求逆元|阶乘逆元|逆元/, '乘法逆元'],
  [/莫比乌斯反演|杜教筛/, '莫比乌斯反演'],
  [/欧拉定理|扩展欧拉定理|\bphi\b/i, '欧拉函数'],
  [/同余方程|模\s*\d+|二次剩余/, '同余'],
  [/素数|质数|合数|整除|因子|约数|莫比乌斯|数论/, '数论'],
  [/异或空间|异或线性基/, '线性基'],
  [/高斯[\s-]*约旦/, '高斯消元'],
  [/\bFFT\b|\bNTT\b|\bFWT\b|生成函数|卷积/i, '多项式'],
  [/凸包|叉积|点积|极角排序|旋转卡壳|半平面交|欧氏距离|切线|多边形/, '计算几何'],
  [/异或|按位|掩码|二进制|最高有效位|\blowbit\b|\bpopcount\b|\bbitset\b/i, '位运算'],
  [/随机种子|\bmt19937\b/i, '随机化'],
  [/广度优先|宽搜/, 'BFS'],
  [/深度优先|深搜|回溯/, 'DFS'],
  [/交换论证|邻项交换/, '贪心'],
  [/线性\s*(?:动态规划|DP)|动态规划|(?<![A-Za-z])DP\b/, '线性DP'],
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
