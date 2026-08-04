# bfyes.github.io

bfyes 的个人文档站仓库，内容以学习笔记、工具折腾记录、电脑体验和随笔为主。站点使用
Zensical/MkDocs 风格的文档结构构建，并在主题层加入了若干自定义前端能力。

站点目前包含：

- 学习笔记、课程实验报告、工具记录、电脑体验和随笔
- 对不同电脑、系统与设备的使用体验和个人感想
- 明暗色主题适配与 Giscus 评论区主题同步
- 正文观感结合 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)（GitHub 风格排版，作用域 `.md-typeset`，随主题自动切换明暗）
- 页面最后更新时间、站点浏览量和 GitHub stars 展示
- GitHub 贡献图静态数据烘焙
- PDF 内联阅读器，移动端通过 PDF.js 渲染
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
│   └── theme/                # 自定义 CSS、JS 和构建期生成数据
│       ├── main.css          # 正文观感层（GitHub 风格排版 + 代码高亮）
│       └── components.css    # 站点自定义 UI 组件（贡献图/首页/PDF/彩虹等）
├── overrides/                # 主题模板覆盖
│   ├── main.html             # 全局模板入口
│   └── partials/             # 评论区、logo、页面信息等局部模板
├── scripts/                  # 构建期辅助脚本
├── .github/workflows/        # GitHub Actions 自动部署
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
make metadata       # 生成 docs/theme/page-metadata.js
make previews       # 生成 docs/ 下图片的 .preview.jpg
make contributions  # 抓取 GitHub 贡献数据到 docs/theme/contributions.json
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
- unpkg CDN：加载 MathJax、Typed.js 和 PDF.js。
- Google Fonts：加载 Noto Sans SC、Noto Serif SC、Inter、JetBrains Mono 等站点字体。
- jsDelivr CDN：从 [github/mona-sans](https://github.com/github/mona-sans) 仓库加载 Mona Sans 正文可变字体（与 github.com 同款，SIL OFL 1.1 开源）。
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)：为正文提供 GitHub 风格排版观感。

## 样式拆分说明

`docs/theme/` 下的样式按职责拆分，避免单一文件臃肿、职责混杂：

- `main.css`：正文观感层。承载字体栈（含 Mona Sans）、GitHub 明暗主题变量与 GitHub 式正文排版（作用域 `.md-typeset`），以及代码高亮增强。
- `components.css`：站点自定义 UI 组件层。承载标题自动编号、GitHub 贡献图、左上角 Logo、页面信息、虚线网格背景、PDF 阅读器、彩虹背景、首页与终端打字机等效。

`zensical.toml` 的 `extra_css` 按 `main.css → components.css` 顺序加载，组件层覆盖正文观感层。原 `main.css` 在样式拆分前已备份为 `main.css.bak`。

如果在非 macOS 环境构建，`generate_image_previews.py` 可能不可用，因为它依赖 `sips`。

## 自动部署

GitHub Actions 工作流位于 `.github/workflows/deploy.yml`，触发方式包括：

- 推送到 `main`
- 手动触发 `workflow_dispatch`
- 每天 `08:17 UTC`，即北京时间 `16:17`，用于刷新贡献图数据

CI 当前执行：

```text
uv sync -> metadata -> contributions -> zensical build -> patch_image_src -> deploy gh-pages
```

注意：CI 目前没有执行 PDF 压缩，也没有在 Ubuntu 上生成图片预览图。因此新增图片后，如果希望线上图片走预览图链路，需要先在本地运行 `make previews` 并提交生成的 `.preview.jpg`，或者后续把预览图脚本改成跨平台实现。

## 写作约定

- 文章主要放在 `docs/study/`、`docs/tools/`、`docs/computers/`、`docs/diaries/`。
- `docs/computers/` 用来记录不同电脑、系统、硬件设备的体验感想，适合放带有主观偏好、长期使用感受和折腾记录的文章。
- 新页面加入导航时，需要同步修改 `zensical.toml` 的 `nav`。
- 文章图片建议放在同名 `.assets/` 目录中，并运行 `make previews`。
- PDF 可以在 Markdown 中用 `<iframe src="xxx.pdf">` 嵌入，前端会自动替换为自定义 PDF 阅读器。
- 页面如不需要评论区，可在 Markdown front matter 中设置 `comments: false`。
- 页面如不需要底部信息，可设置 `page_info: false`。
<!--
以下内容已注释, 目前不符合实际情况.
## 维护建议

- 统一本地和 CI 构建流程，避免 `make deploy` 与 GitHub Actions 行为不一致。
- 将图片预览图生成脚本改为跨平台方案，例如 Pillow 或 ImageMagick，方便 CI 自动生成。
- 为 `zensical.toml` 补充 `site_url`、`site_description`、`site_author` 等元信息，提升站点分享和 SEO 质量。
- 逐步拆分 `docs/theme/main.css` 和较大的 JS 文件，按功能维护会更轻松。
- PDF 阅读器现在会下载并渲染页面内全部 PDF，后续可以改成懒加载或按页渲染，减轻移动端压力。
- 考虑在 CI 中加入构建检查、链接检查和资源缺失检查，减少发布后才发现 broken link 或缺预览图的情况。
-->
