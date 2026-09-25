# acm-blog

个人 ACM 竞赛题解博客，基于 [VitePress](https://vitepress.dev) + GitHub Pages。
与代码仓库 `acm-icpc` 完全分离：题解在 `acm-icpc` 中编写，通过同步脚本单向同步到本站。

线上地址：<https://Pixel-fish-123.github.io/acm-blog/>

## 目录结构

```
acm-blog/
├── docs/                          # 博客站点
│   ├── .vitepress/
│   │   ├── config.mjs             # 站点配置（导航、搜索分词、禁用明暗切换等）
│   │   ├── solutionIndex.json     # 题解数据（由 sync 生成，勿手动编辑）
│   │   ├── problemCache.json      # 难度抓取缓存（可提交，删掉会重新抓取）
│   │   └── theme/
│   │       ├── index.js           # 主题入口（插槽注入：洛谷图标、作者条、相关题解）
│   │       ├── filters.js         # 首页筛选/排序/统计的纯函数
│   │       ├── solution.js        # 由页面路径反查 solutionIndex 条目
│   │       ├── custom.css         # 全局洛谷风格样式
│   │       └── components/
│   │           ├── HomeLuogu.vue        # 首页（题解列表 + 筛选 + 个人栏）
│   │           ├── SolutionFilter.vue   # 首页筛选条（关键词/平台/排序/已选条件）
│   │           ├── SolutionIndexPage.vue# 题解索引页（平台分组 + 标签筛选）
│   │           ├── StatsPage.vue        # 上传时间线（纯 CSS 条状图）
│   │           ├── ArticleHeader.vue    # 文章页作者条（作者 + 难度 + 标签 + 原题）
│   │           ├── RelatedSolutions.vue # 文章页底部相关题解
│   │           └── NavLuogu.vue         # 导航栏洛谷图标
│   ├── public/                    # 静态资源（avatar.png、luogu_favicon.ico）
│   ├── index.md                   # 首页入口（layout: page）
│   ├── stats.md                   # 上传时间线入口（layout: page，手写）
│   └── solutions/                 # 题解内容（由同步脚本生成，勿手动编辑）
├── scripts/
│   ├── sync.mjs                   # 同步脚本：收集题解 → 跑插件 → 写输出
│   ├── fetch-luogu.mjs            # 只更新洛谷账号数据（npm run luogu）
│   ├── lib/                       # 共享工具（文件、markdown、分类、frontmatter、HTTP）
│   └── plugins/                   # 构建期插件（见下文）
├── .github/workflows/deploy.yml   # push 后自动构建部署到 GitHub Pages
└── package.json
```

## 快速开始

```powershell
npm install        # 首次安装依赖
npm run dev        # 本地预览 http://localhost:5173（注意访问 /acm-blog/ 路径）
npm run sync       # 从 acm-icpc 同步题解并刷新洛谷数据
npm run build      # 本地构建验证
npm run preview    # 预览构建产物（http://localhost:4173/acm-blog/，验证搜索用）
```

## 站点功能

- **题解索引页 `/solutions/`**：左侧按平台分组，右侧标签筛选框（多选，所选标签需全部命中）。
- **首页筛选**：关键词同时匹配题号、标题、摘要和标签（`p3384`、`1748e` 都能搜到）；支持平台、排序（日期倒序 / 题号 / 难度）。
  - 侧栏「算法标签」「难度分布」点一下就能按标签或难度筛选，再点取消；「分类」也是点选筛选。
  - 筛选状态会写进地址栏（`?q=&cat=&tag=a,b&diff=&sort=`），复制链接给别人或刷新都能还原。
- **题解页**：标题下方显示平台标签、难度徽章、算法标签和「原题」链接；点算法标签会跳回首页并只显示带该标签的题解；页面底部列出相关题解。
- **上传时间线 `/stats`**：按日期升序的条状图，显示每天上传了几篇，展开可以看到当天的题解标题。
- **全站搜索**：右上角搜索框支持中文关键词（「剖分」「博弈」「线段树」）与题号，中文按两字一组建立索引，无需输入完整词语。

## 如何添加一篇题解（核心流程）

1. **在 `acm-icpc` 仓库编写题解**：将题解 Markdown 放入 `acm-icpc/solutions/<平台目录>/`（文件名形如 `G_solution.md`，首行为 `# 标题`；也可让 AI 通过 xcpc-solution 技能生成）。
   建议在文件开头写上 frontmatter，供本站展示和筛选使用：

   ```markdown
   ---
   tags: [树链剖分, 线段树]
   difficulty: "提高+/省选-"
   source: "https://www.luogu.com.cn/problem/P3384"
   ---
   # P3384 【模板】重链剖分 / 树链剖分 题解
   ```

   三个字段都可选：`tags` 决定算法标签（词表见 `.cursor/rules/solution-frontmatter.mdc`），`difficulty` 写洛谷难度名或 `"CF 2300"`，`source` 写原题链接。缺失时同步脚本会尽量推断（标签按「算法类型」推断、题号推断原题链接、难度联网抓取）。

2. **同步到博客**：

   ```powershell
   cd C:\Users\13368\Desktop\acm-blog
   npm run sync
   ```

   `sync` 会完成：
   - 拷贝 `acm-icpc/solutions/` 下所有 `.md` 到 `docs/solutions/`（并把「参考代码」折叠起来）
   - 生成题解索引页 `docs/solutions/index.md`
   - 生成数据文件 `docs/.vitepress/solutionIndex.json`（标题、摘要、分类、**算法标签**、难度、原题链接、**首次上传日期**）
   - 刷新首页个人数据（洛谷昵称、等级颜色、通过数等）

3. **本地验证**：

   ```powershell
   npm run build
   ```

   确认输出 `build complete` 且无 `build error`。

4. **发布**：

   ```powershell
   git add docs/
   git commit -m "sync solutions"
   git push origin main
   ```

   GitHub Actions 自动构建并部署，约 1-2 分钟后线上生效。

> 若 `acm-icpc` 仓库不在博客仓库上一级目录，用环境变量指定：
> ```powershell
> $env:ACM_ICPC_ROOT = "D:\code\acm-icpc"; npm run sync
> ```

## 维护指南

### 同步脚本（scripts/）

`scripts/sync.mjs` 只负责编排：收集源文件 → 依次跑插件 → 写出题解、索引页和数据文件。
新增功能优先写成插件，登记在 `scripts/plugins/index.mjs`（一行 `[插件, 选项]`，注释掉即停用）：

| 插件 | 作用 |
| --- | --- |
| `frontmatter` | 解析题解开头的 `tags` / `difficulty` / `source`（纯正则，不依赖 YAML 库） |
| `infer-meta` | 没有 `tags` 时按正文「**算法类型**」推断，且只输出词表内的词 |
| `problem-link` | 没有 `source` 时按文件名推断原题链接（洛谷 / CF / AtCoder） |
| `difficulty` | 没有 `difficulty` 时抓取洛谷难度或 CF rating，结果缓存到 `problemCache.json` |
| `git-date` | 用 git 首次加入该题的提交日期作为上传日期，失败退回文件修改时间 |
| `collapse-code` | 把「参考代码」一节包进可折叠块 |
| `luogu-user` | 抓取洛谷账号数据，更新首页个人栏与文章页昵称颜色 |

插件接口：`onSolution(sol, ctx)` 每篇题解调用一次，`onFinish(index, ctx)` 全部处理完后调用一次；单个插件报错只打印警告，不会中断整次同步。

### 首页（HomeLuogu.vue）

- 布局：左侧题解列表（标题 + 平台标签 + 摘要 + 难度，右侧作者头像/名字/日期）；右侧个人栏（头像、等级色用户名、做题数据、洛谷/GitHub 按钮）+「算法标签」「难度分布」「分类」三张可从侧栏筛选的卡片。
- **个人信息在组件顶部 `luogu` 常量中硬编码**，由 `npm run sync` 自动刷新（也可手动改）。
- **列表与标签完全由 `solutionIndex.json` 驱动**，加文章只需执行 `npm run sync`，无需改组件。
- 筛选逻辑集中在 `theme/filters.js`（纯函数），筛选条 UI 在 `theme/components/SolutionFilter.vue`。

### 索引页 / 时间线页

- `/solutions/`：外壳是 `docs/solutions/index.md`（由 `sync` 生成），列表和右侧标签筛选框都在 `SolutionIndexPage.vue` 里。
- `/stats/`：外壳是手写的 `docs/stats.md`，内容在 `StatsPage.vue`（纯 CSS 条状图，不引入图表库）。日期取自 `solutionIndex.json` 的 `date`，即**首次上传**日期。

### 全站搜索

- 配置在 `config.mjs` 的 `themeConfig.search.options`：自定义分词把中文切成两字一组（bigram），所以搜「剖分」能命中「树链剖分」；`_render` 还会把题号和算法标签补进索引文本。
- `tokenize` 函数会被 VitePress 序列化成源码字符串发给浏览器，因此必须**自包含**（不能引用外部变量），否则构建能过、但浏览器里搜不到。
- 搜索索引只在构建产物里生成，验证请用 `npm run build` + `npm run preview`（`npm run dev` 不提供生产搜索索引）。

### 导航栏 / 文章页 / 静态资源

- 菜单项、GitHub 图标、站名隐藏等：`config.mjs` 的 `themeConfig.nav` / `socialLinks`。
- 明暗模式切换已禁用（`appearance: false`，顶层配置）。
- **作者条**（`ArticleHeader.vue`）：头像 + 昵称 + 「更新于 YYYY-MM-DD」（取 git 最后提交时间）+ 难度徽章 + 算法标签 + 原题链接，通过 `doc-before` 插槽注入。
- **单栏居中布局**：无侧边栏、无右侧大纲（`aside: false` + `outline: false`），正文宽约 1180px。
- `docs/public/avatar.png`：头像（洛谷头像本地化）；`docs/public/luogu_favicon.ico`：导航洛谷图标。

### 数据流总览

```
acm-icpc/solutions/*.md  ──npm run sync──►  docs/solutions/*.md
                                              ├─► docs/solutions/index.md（索引页外壳）
                                              └─► .vitepress/solutionIndex.json（首页/索引/时间线/搜索）
```

## 部署

已配置 GitHub Actions（`.github/workflows/deploy.yml`），push 到 `main` 自动构建并部署。

首次配置（一次性）：仓库 Settings → Pages → Source 选择 **GitHub Actions**。
站点地址：`https://<用户名>.github.io/acm-blog/`（与仓库名一致时无需改配置）。

> 若改了仓库名，需同步修改 `docs/.vitepress/config.mjs` 中 `base`（默认 `/acm-blog/`）与 `package.json` 的 `name`。

## 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| dev server 启动慢 | VitePress 冷启动需全量编译（含公式 SSR 渲染），10-30s 属正常；**改 `config.mjs` 会触发完整重启**，改组件/样式走 HMR 是秒级。可将 `node_modules` 加入 Windows Defender 排除列表提速 |
| 文章不显示/标签缺失 | 忘记 `npm run sync`；或手动改了 `docs/solutions/`（该目录与 `solutionIndex.json` 都是生成物，改动会被覆盖） |
| 中文搜不到 | 搜索索引只在构建产物里，请用 `npm run build` + `npm run preview` 验证；确认没有改动 `config.mjs` 里的 `cjkTokenize` |
| preview 页面样式全丢/点不动 | 构建后没有重启 `npm run preview`：静态服务器的文件清单在启动时确定，新 hash 的文件会 404 |
| push 报 TLS/连接错误 | 网络对 GitHub 不稳定，等待数秒重试即可 |
| 公式显示为源码 | 题解中 `$...$` 需成对闭合；MathJax 渲染已启用（`markdown.math: true`） |
| 明暗切换按钮出现 | 确认 `appearance: false` 在 `config.mjs` **顶层**（不在 themeConfig 内） |

## 项目约定

- 只提交 `docs/`、`scripts/` 下的改动与 `package.json`/`package-lock.json`；`node_modules`、`.cursor`、`.vitepress/cache`、`.vitepress/dist` 已 gitignore。
- 首页与文章页保持洛谷简洁风格：无阴影、4px 圆角、不引入 emoji、不使用额外依赖。
- 不下载/不安装多余浏览器或依赖（浏览器实测使用本机 Edge）。
