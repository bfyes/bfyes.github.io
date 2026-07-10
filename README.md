# bfyes.github.io

这是 bfyes 的个人文档站仓库，内容以学习笔记、工具记录和随笔为主，使用 Zensical/MkDocs 风格的文档结构构建。

站点里包含一些构建期生成的动态信息，例如：

- 页面最后更新时间
- GitHub 贡献图
- 页面阅读量
- GitHub stars badge

## 仓库结构

```text
.
├── docs/                 # 站点内容源文件
│   ├── index.md          # 主页
│   ├── study/            # 学习笔记
│   ├── tools/            # 工具/折腾记录
│   ├── diaries/          # 随笔
│   └── theme/            # 自定义 CSS/JS/静态数据
├── overrides/            # 主题模板覆盖
│   ├── main.html
│   └── partials/         # 评论区、logo、页面信息等局部模板
├── scripts/              # 构建期脚本
│   ├── generate_page_metadata.py
│   └── fetch_contributions.py
├── site/                 # 构建产物，通常不手动编辑
├── .github/workflows/    # GitHub Actions 自动部署配置
├── Makefile              # 本地预览、构建、部署命令入口
├── zensical.toml         # 站点配置、导航、主题与插件配置
├── pyproject.toml        # Python 项目与依赖声明
└── uv.lock               # uv 锁文件，固定依赖版本
```

- `docs/`：写文章主要改这里。Markdown 文件会被构建成网页。
- `docs/theme/`：放站点自定义前端资源，例如 `main.css`、GitHub 贡献图脚本和静态 JSON。
- `overrides/`：覆盖默认主题模板，例如页面底部的最后更新时间、阅读量和 star 提示。
- `scripts/`：构建前生成数据。`generate_page_metadata.py` 生成页面更新时间，`fetch_contributions.py` 抓取 GitHub 贡献图数据。
- `zensical.toml`：站点核心配置，包括导航、仓库链接、主题选项、额外 CSS/JS。
- `uv.lock`：锁定依赖版本，保证本地和 GitHub Actions 构建环境尽量一致。

## 常用命令

```bash
make metadata        # 生成页面更新时间元数据
make contributions   # 抓取 GitHub 贡献图数据
make zensical        # 本地预览站点
make deploy          # 本地构建并部署到 gh-pages
```

也可以直接使用：

```bash
uv run zensical build
```

## 自动部署

仓库使用 GitHub Actions 自动构建并发布到 GitHub Pages。定时任务会在 GitHub 服务器上重新生成站点数据并发布到 `gh-pages`，不需要依赖本地电脑运行。
