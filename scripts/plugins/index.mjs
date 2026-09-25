// 插件登记表：按顺序执行，注释掉一行即可停用对应插件
// 每项是 [插件, 选项]，插件接口见各文件：
//   onSolution(sol, ctx, options)  每篇题解调用一次，可改 sol.meta / sol.body
//   onFinish(index, ctx, options)  全部处理完后调用一次，可读写 index、写缓存
import frontmatter from './frontmatter.mjs'
import inferMeta from './infer-meta.mjs'
import problemLink from './problem-link.mjs'
import difficulty from './difficulty.mjs'
import gitDate from './git-date.mjs'
import collapseCode from './collapse-code.mjs'
import luoguUser from './luogu-user.mjs'

export default [
  [frontmatter],
  [inferMeta, { dict: 'tag-dict.mjs' }],
  [problemLink],
  [difficulty, { cache: true }],
  [gitDate],
  [collapseCode, { title: '点击展开参考代码' }],
  [luoguUser],
]
