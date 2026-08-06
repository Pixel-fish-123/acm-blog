# acm-blog

个人 ACM 竞赛题解博客，基于 [VitePress](https://vitepress.dev) + GitHub Pages，与代码仓库 `acm-icpc` 完全分离。

## 目录结构

```
acm-blog/
├── docs/                # 博客站点
│   ├── .vitepress/      # 站点配置（侧边栏构建时自动扫描题解目录）
│   ├── index.md         # 首页
│   └── solutions/       # 题解内容（由同步脚本生成，勿手动编辑）
├── scripts/
│   └── sync.mjs         # 同步脚本：从 acm-icpc 仓库拷贝题解并生成索引页
└── .github/workflows/   # GitHub Pages 自动部署
```

## 日常使用

```bash
npm install        # 首次安装依赖

npm run sync       # ① 写完新题解后，同步到 docs/solutions/ 并生成索引页
npm run dev        # ② 本地预览 http://localhost:5173
npm run build      # ③ 本地构建验证

# ④ 提交推送，GitHub Actions 自动部署到 Pages
git add -A && git commit -m "sync solutions" && git push
```

若 `acm-icpc` 仓库不在博客仓库上一级目录，用环境变量指定：

```powershell
$env:ACM_ICPC_ROOT = "D:\code\acm-icpc"; npm run sync
```

## 部署配置（首次）

1. 在 GitHub 创建新仓库 `acm-blog`（Public）。
2. 推送代码到 `main` 分支。
3. 仓库 Settings → Pages → **Source 选择 GitHub Actions**（workflow 已就绪）。
4. 站点地址：`https://<你的用户名>.github.io/acm-blog/`。

> 若仓库名不同，需同步修改 `docs/.vitepress/config.mjs` 中的 `base`（默认 `/acm-blog/`）以及 `package.json` 的 `name`。
