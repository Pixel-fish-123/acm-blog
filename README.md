# acm-blog

个人 ACM 竞赛题解博客，基于 [VitePress](https://vitepress.dev) + GitHub Pages。
题解源码维护在相邻仓库 `acm-icpc`，本站通过同步脚本单向同步构建。

线上地址：<https://Pixel-fish-123.github.io/acm-blog/>

## 常用命令

```powershell
npm install                 # 首次安装依赖
npm run sync                # 从 ../acm-icpc 同步题解并刷新洛谷账号数据（名字颜色、通过数、排名等）
npm run sync -- --check     # 只检查生成物是否最新，不写文件（可加 --offline 禁联网）
npm run luogu               # 仅刷新洛谷账号资料（写入 docs/.vitepress/theme/profile.json）
npm test                    # 运行单元测试
npm run dev                 # 本地预览 http://localhost:5173/acm-blog/
npm run build               # 构建生产产物
npm run preview             # 预览构建产物 http://localhost:4173/acm-blog/（验证全站搜索）
```

> 若 `acm-icpc` 不在上一级目录，可指定环境变量：`$env:ACM_ICPC_ROOT = "D:\path\to\acm-icpc"; npm run sync`

## 目录结构

```
acm-blog/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mjs             # 站点与中文搜索配置
│   │   ├── solutionIndex.json     # 题解索引数据（sync 生成，勿手改）
│   │   ├── problemCache.json      # 洛谷难度 / CF rating 缓存
│   │   └── theme/
│   │       ├── profile.json       # 洛谷账号资料（昵称、等级色、做题数、排名，自动刷新）
│   │       ├── filters.js         # 首页筛选/排序/统计纯函数
│   │       ├── luoguDifficulty.js # 洛谷难度档位定义
│   │       └── components/        # HomeLuogu / SolutionFilter / SolutionIndexPage / StatsPage / ArticleHeader 等
│   ├── solutions/                 # 同步生成的题解与索引页（勿手改）
│   ├── index.md                   # 首页入口
│   └── stats.md                   # 上传时间线入口
├── scripts/
│   ├── sync.mjs                   # 同步主流程（收集 → 插件 → 校验 → 增量写入）
│   ├── fetch-luogu.mjs            # 单独刷新洛谷账号数据
│   ├── lib/                       # 公共工具库
│   └── plugins/                   # 构建期插件（frontmatter / infer-meta / problem-link / difficulty / git-date / collapse-code / luogu-user）
├── tests/                         # node:test 单元测试
└── .github/workflows/deploy.yml   # 自动更新洛谷状态并构建部署到 GitHub Pages
```

## 添加与更新题解

1. **在 `acm-icpc` 编写题解**：放入 `acm-icpc/solutions/<平台目录>/<题号>_solution.md`（通用数学笔记放 `acm-icpc/useful_maths_conclusions/`）：

   ```markdown
   ---
   tags: [树链剖分, 线段树]
   difficulty: "提高+/省选-"
   source: "https://www.luogu.com.cn/problem/P3384"
   ---
   # P3384 【模板】重链剖分 / 树链剖分 题解
   ```

   标签词表唯一维护在 `acm-icpc/.skill/SKILL.md` 的 `## 标签词表`。缺省字段在 `sync` 时会自动推断或联网抓取。

2. **同步并验证**：

   ```powershell
   npm run sync
   npm test
   npm run build
   ```

3. **提交发布**：

   ```powershell
   git add docs/ scripts/ tests/
   git commit -m "Sync solutions"
   git push origin main
   ```

## 洛谷状态与名字颜色同步

- **数据源**：`docs/.vitepress/theme/profile.json` 保存洛谷 `uid`、昵称、`color`（洛谷名字等级颜色）、个性签名、关注/粉丝、通过/提交数与排名。
- **页面绑定**：首页个人信息栏、题解列表作者名（`HomeLuogu.vue`）和文章页头部作者名（`ArticleHeader.vue`）均直接读取 `profile.json` 的 `color` 与统计字段。
- **自动更新时机**：
  1. 本地执行 `npm run sync` 或 `npm run luogu` 时，自动向洛谷拉取最新状态并更新 `profile.json`。
  2. 每次部署（`.github/workflows/deploy.yml`）在 `npm run build` 前都会执行 `npm run luogu`，抓取最新洛谷状态与名字颜色后再打包发布（若网络异常则自动回退保留仓库内的已有数据）。

## 常见问题

| 现象 | 处理方式 |
| --- | --- |
| 文章或标签未更新 | 运行 `npm run sync`；切勿直接手改 `docs/solutions/` 或 `solutionIndex.json` |
| 本地验证中文搜索 | 搜索索引仅在构建时生成，需运行 `npm run build` 后再 `npm run preview`（每次重构建后需重启 `preview`） |
| 数学公式显示为源码 | 检查 `$...$` 是否成对闭合 |
| `git push` 报 `127.0.0.1` 连接失败 | 检查本机代理端口是否与 `git config --global http.proxy` 一致，可用 `git ls-remote origin HEAD` 测试连通性 |
