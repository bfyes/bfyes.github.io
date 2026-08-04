# bfyes.github.io

bfyes 的个人文档站仓库，内容以学习笔记、工具折腾记录、游戏记录和随笔为主。站点使用
Zensical/MkDocs 风格的文档结构构建，并在主题层加入了若干自定义前端能力。

站点目前包含：

- 学习笔记、课程实验报告、工具记录、游戏记录和随笔
- 明暗色主题适配与 Giscus 评论区主题同步
- 正文观感结合 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)（GitHub 风格排版，作用域 `.md-typeset`，随主题自动切换明暗）
- 页面最后更新时间、站点浏览量和 GitHub stars 展示
- GitHub 贡献图静态数据烘焙
- PDF 内联阅读器，下载时显示进度条；桌面交给浏览器原生 PDF 查看器渲染，iOS/iPadOS 降级为 PDF.js 画布渲染
- 图片低清预览图与构建后 HTML 图片路径处理
- 桌面端背景网格与主页打字机效果

## 项目结构

```text
.
├── docs/                     # 站点内容源文件
│   ├── index.md              # 主页
│   ├── study/                # 学习笔记与课程实验
│   ├── tools/                # 工具、环境配置、折腾记录
│   ├── computers/            # 不同电脑的体验感想
│   ├── diaries/              # 随笔与阶段总结
│   ├── games/                # 游戏记录与样式测试页
│   └── theme/                # 自定义 CSS、JS 和构建期生成数据
│       ├── css/              # 正文观感层与组件样式
│       ├── js/               # 站点前端增强脚本
│       ├── data/             # 构建期生成/维护的 JSON 与 metadata
│       └── assets/           # favicon、头像等静态资产
├── overrides/                # 主题模板覆盖
│   ├── main.html             # 全局模板入口
│   └── partials/             # 评论区、logo、页面信息等局部模板
├── scripts/                  # 构建期辅助脚本
├── Makefile                  # 本地常用命令入口
├── zensical.toml             # 站点配置、导航、主题与插件配置
├── pyproject.toml            # Python 项目与开发依赖声明
└── uv.lock                   # uv 锁文件
```

`site/` 是本地构建产物，已在 `.gitignore` 中忽略，不要手动维护。`.cache/` 用于脚本缓存，也不需要提交。

## 本地开发

本项目使用 `uv` 管理 Python 环境与依赖。

```bash
uv sync
make zensical
```

`make zensical` 会按顺序执行：

1. 生成页面更新时间元数据
2. 生成文章图片低清预览图
3. 释放本地 `8000` 端口
4. 启动 Zensical 预览服务

常用命令：

```bash
make metadata       # 生成 docs/theme/data/page-metadata.js
make previews       # 生成 docs/ 下图片的 .preview.jpg
make contributions  # 抓取 GitHub 贡献数据到 docs/theme/data/contributions.json
make deploy         # 本地完整构建并强推 site/ 到 gh-pages
```

## 构建链路

主要脚本职责如下：

- `scripts/generate_page_metadata.py`：读取 Git 历史，生成每个页面的最后更新时间。
- `scripts/fetch_contributions.py`：抓取 GitHub 贡献图 HTML，解析后写入静态 JSON。
- `scripts/generate_image_previews.py`：为文章图片生成低清 JPEG 预览图。
- `scripts/compress_pdfs.py`：使用 Ghostscript 压缩 `docs/` 下的 PDF。
- `scripts/patch_image_src.py`：构建后把 HTML 中的图片 `src` 替换为预览图，并把原图写入 `data-fullsrc`。

本地完整部署流程见 `Makefile` 的 `deploy` 目标：

```text
metadata -> contributions -> compress_pdfs -> zensical build -> previews --site -> patch_image_src -> push gh-pages
```

## 外部依赖

除了 Python 依赖外，部分脚本或页面能力还依赖外部工具/服务：

- `sips`：macOS 自带，用于生成图片预览图。
- `gs` / Ghostscript：用于 PDF 压缩。
- GitHub contributions 页面：用于构建期抓取贡献图。
- Giscus、Busuanzi、shields.io：用于评论区、访问量和 stars badge。
- unpkg CDN：加载 MathJax、Typed.js，以及 iOS/iPadOS PDF 降级渲染所需的 PDF.js。
- Google Fonts：加载 Noto Sans SC、Noto Serif SC、Inter、JetBrains Mono 等站点字体。
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)：为正文提供 GitHub 风格排版观感。

## 主题资源结构

`docs/theme/` 下的前端资源按类型拆分，避免 CSS、JS、数据和图片混在同一层：

- `css/main.css`：正文观感层。承载系统字体栈、GitHub 明暗主题变量与 GitHub 式正文排版（作用域 `.md-typeset`），以及代码高亮增强。
- `css/components.css`：站点自定义 UI 组件层。承载标题自动编号、GitHub 贡献图、左上角 Logo、页面信息、虚线网格背景、PDF 阅读器、彩虹背景、首页与终端打字机等效。
- `js/`：站点前端增强脚本，包括主题同步、首页动效、图片预览、PDF 阅读器、友链和贡献图等。
- `data/`：构建期生成或维护的数据，例如页面更新时间、GitHub 贡献图数据和友链数据。
- `assets/`：favicon、头像等可直接被页面引用的静态资产。

`zensical.toml` 的 `extra_css` 按 `css/main.css → css/components.css` 顺序加载，组件层覆盖正文观感层。原 `main.css` 在样式拆分前已备份为 `css/old_main.css.bak`。

如果在非 macOS 环境构建，`generate_image_previews.py` 可能不可用，因为它依赖 `sips`。

## 写作约定

- 文章主要放在 `docs/study/`、`docs/tools/`、`docs/computers/`、`docs/diaries/`、`docs/games/`。
- `docs/computers/` 用来记录不同电脑、系统、硬件设备的体验感想，适合放带有主观偏好、长期使用感受和折腾记录的文章。
- 新页面加入导航时，需要同步修改 `zensical.toml` 的 `nav`。
- 文章图片建议放在同名 `.assets/` 目录中，并运行 `make previews`。
- PDF 可以在 Markdown 中用 `<iframe src="xxx.pdf">` 嵌入，前端会自动替换为自定义 PDF 阅读器。
- 页面如不需要评论区，可在 Markdown front matter 中设置 `comments: false`。
- 页面如不需要底部信息，可设置 `page_info: false`。
