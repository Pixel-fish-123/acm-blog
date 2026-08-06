# acm-blog

个人 ACM 竞赛题解博客，基于 [VitePress](https://vitepress.dev) + GitHub Pages。
与代码仓库 `acm-icpc` 完全分离：题解在 `acm-icpc` 中编写，通过同步脚本单向同步到本站。

线上地址：<https://Pixel-fish-123.github.io/acm-blog/>

## 目录结构

```
acm-blog/
├── docs/                          # 博客站点
│   ├── .vitepress/
│   │   ├── config.mjs             # 站点配置（导航、禁用明暗切换、文章页单栏等）
│   │   ├── solutionIndex.json     # 首页数据（由 sync 生成，勿手动编辑）
│   │   └── theme/
│   │       ├── index.js           # 主题入口（插槽注入：洛谷图标、文章作者条）
│   │       ├── custom.css         # 全局洛谷风格样式
│   │       └── components/        # 自定义组件
│   │           ├── HomeLuogu.vue  # 首页（左列表 + 右个人栏）
│   │           ├── ArticleHeader.vue # 文章页作者条（作者 + 修改日期）
│   │           └── NavLuogu.vue   # 导航栏洛谷图标
│   ├── public/                    # 静态资源（avatar.png、luogu_favicon.ico）
│   ├── index.md                   # 首页入口（layout: page）
│   └── solutions/                 # 题解内容（由同步脚本生成，勿手动编辑）
├── scripts/
│   └── sync.mjs                   # 同步脚本：从 acm-icpc 仓库拷贝题解
├── .github/workflows/deploy.yml   # push 后自动构建部署到 GitHub Pages
└── package.json
```

## 快速开始

```powershell
npm install        # 首次安装依赖
npm run dev        # 本地预览 http://localhost:5173（注意访问 /acm-blog/ 路径）
npm run build      # 本地构建验证
```

## 如何添加一篇题解（核心流程）

1. **在 `acm-icpc` 仓库编写题解**：将题解 Markdown 放入 `acm-icpc/solutions/<平台目录>/`（文件名形如 `G_solution.md`，首行为 `# 标题`；也可让 AI 通过 xcpc-solution 技能生成）。

2. **同步到博客**：

   ```powershell
   cd C:\Users\13368\Desktop\acm-blog
   npm run sync
   ```

   `sync` 会完成三件事：
   - 拷贝 `acm-icpc/solutions/` 下所有 `.md` 到 `docs/solutions/`
   - 生成题解索引页 `docs/solutions/index.md`
   - 生成首页数据 `docs/.vitepress/solutionIndex.json`（标题、摘要、**分类标签**、日期，供首页列表和标签使用）

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

### 首页（HomeLuogu.vue）

- 布局：左侧洛谷风格题解列表（每条：标题 + 分类标签 + 摘要，右侧作者头像/名字/日期）；右侧个人栏（头像、绿色用户名、slogan、关注/粉丝/题解、通过/提交/排名、洛谷/GitHub 按钮）。
- **个人信息在组件顶部 `luogu` 常量中硬编码**（洛谷主页数据快照）。洛谷资料变化后需手动更新（或改为接口动态获取）。
- **列表与标签完全由 `solutionIndex.json` 驱动**，加文章只需执行 `npm run sync`，无需改组件。
- 分类标签来自 `solutionIndex.json` 的 `category` 字段（如"牛客暑期联赛（第6场）""专题"），映射规则在 `scripts/sync.mjs` 的 `categoryName()` 中。

### 导航栏

- 菜单项、GitHub 图标、站名隐藏等：`docs/.vitepress/config.mjs` 的 `themeConfig.nav` / `socialLinks`。
- 洛谷图标：`NavLuogu.vue` 使用 `docs/public/luogu_favicon.ico`，通过 `theme/index.js` 的 `nav-bar-content-after` 插槽注入。
- 明暗模式切换已禁用（`appearance: false`，顶层配置）。

### 文章页

- **作者条**（`ArticleHeader.vue`）：头像 + `Pixel_fish` + "更新于 YYYY-MM-DD"（日期自动取 git 提交时间）。通过 `doc-before` 插槽注入，位于文章卡片内、标题上方。
- **单栏居中布局**：无侧边栏、无右侧大纲（`themeConfig.sidebar` 未配置 + `aside: false` + `outline: false`），内容宽约 936px。
- 全局排版细节（代码块、表格、引用、公式对齐等）：`custom.css`。

### 静态资源

- `docs/public/avatar.png`：头像（洛谷头像本地化，避免外链加载失败）
- `docs/public/luogu_favicon.ico`：导航洛谷图标

### 数据流总览

```
acm-icpc/solutions/*.md  ──npm run sync──►  docs/solutions/*.md
                                              ├─► docs/solutions/index.md（索引页）
                                              └─► .vitepress/solutionIndex.json（首页数据）
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
| push 报 TLS/连接错误 | 网络对 GitHub 不稳定，等待数秒重试即可 |
| 公式显示为源码 | 题解中 `$...$` 需成对闭合；MathJax 渲染已启用（`markdown.math: true`） |
| 明暗切换按钮出现 | 确认 `appearance: false` 在 `config.mjs` **顶层**（不在 themeConfig 内） |

## 项目约定

- 只提交 `docs/` 下的改动与 `package.json`/`package-lock.json`；`node_modules`、`.vitepress/cache`、`.vitepress/dist` 已 gitignore。
- 首页与文章页保持洛谷简洁风格：无阴影、4px 圆角、不引入 emoji、不使用额外依赖。
- 不下载/不安装多余浏览器或依赖（浏览器实测使用本机 Edge）。
