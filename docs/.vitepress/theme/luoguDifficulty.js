// 洛谷难度档位与配色。
// 这是客户端（filters.js）和构建脚本（difficulty 插件）共用的唯一来源，
// 新增/调整档位时只改这里。
export const LUOGU_DIFFICULTY = [
  { name: '暂无评定', color: '#bfbfbf' },
  { name: '入门', color: '#fe4c61' },
  { name: '普及-', color: '#f39c11' },
  { name: '普及', color: '#ffc116' },
  { name: '普及+/提高-', color: '#52c41a' },
  { name: '提高', color: '#00c0c0' },
  { name: '提高+/省选-', color: '#3498db' },
  { name: '省选/NOI-', color: '#9d3dcf' },
  { name: 'NOI/NOI+/CTS', color: '#0e1d69' },
]

export const LUOGU_TIERS = LUOGU_DIFFICULTY.map((item) => item.name)
