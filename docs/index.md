---
layout: home

hero:
  name: ACM 题解博客
  text: 竞赛刷题与题解记录
  tagline: 独立于代码仓库的题解博客 · VitePress + GitHub Pages
  actions:
    - theme: brand
      text: 浏览题解
      link: /solutions/
    - theme: alt
      text: GitHub
      link: https://github.com/Pixel-fish-123

features:
  - icon: 📝
    title: 题解归档
    details: 按平台 / 比赛分类归档的竞赛题解，由同步脚本自动维护
  - icon: ⚡
    title: 静态站点
    details: VitePress 构建，毫秒级加载，支持全文搜索与暗色模式
  - icon: 🔒
    title: 代码仓库分离
    details: 博客仓库独立部署，代码仓库保持纯净，单向同步无侵入
---

## 关于本站

本站存放算法竞赛（XCPC / OJ 刷题）的题解，内容来自本地 `acm-icpc` 仓库的
`solutions/` 目录。新增题解后，在博客仓库执行：

```bash
npm run sync   # 同步题解到 docs/solutions/ 并生成索引页
npm run build  # 本地构建验证
```

然后提交推送，GitHub Actions 会自动部署到 Pages。
