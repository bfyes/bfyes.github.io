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

## Fork 使用指南

如果你想基于这个仓库搭建自己的文档站，可以按以下步骤操作：

1. **Fork 并克隆仓库**

   在 GitHub 上 Fork 本仓库，然后克隆到本地：

   ```bash
   git clone https://github.com/<你的用户名>/bfyes.git
   cd bfyes
   ```

2. **安装依赖**

   本项目使用 [uv](https://docs.astral.sh/uv/) 管理 Python 环境与依赖：

   ```bash
   uv sync
   ```

3. **修改站点配置与替换个人信息**

   编辑 `zensical.toml`，至少修改以下内容：

   - `site_name`：站点名称
   - `site_url`：你的站点 URL（通常是 `https://<用户名>.github.io/`）
   - `repo_url`、`repo_name`：指向你 Fork 后的仓库
   - `nav`：导航结构，替换为你自己的页面

   同时替换以下个人信息：

   - `docs/theme/data/contributions.json`：运行 `make contributions` 重新抓取你的 GitHub 贡献图
   - `overrides/partials/` 下的模板：Logo、评论区等局部模板
   - `docs/index.md`：首页内容、终端命令与友链卡片

   接着在 `docs/` 下编写你的内容，文章图片放在同名 `.assets/` 目录中，新页面需同步加入 `zensical.toml` 的 `nav`。

4. **本地预览与部署**

   本地预览：

   ```bash
   make
   ```

   访问 `http://127.0.0.1:8000` 查看效果。

   部署到 GitHub Pages：

   ```bash
   make deploy
   ```

   这会执行完整构建并强推 `site/` 到 `gh-pages` 分支。确保仓库 Settings → Pages 中 Source 设置为 `gh-pages` 分支。

> **注意**：部分功能依赖 macOS 环境（`sips` 生成图片预览、`gs` 压缩 PDF）。在非 macOS 环境下，`make previews` 和 `make compress_pdfs` 可能不可用，需要寻找替代方案。

## 设计与特色

这个站点的主题层在 GitHub 风格的可读性基础上叠加了充足定制化细节。

- **正文排版**：在 MkDocs Material 既有 DOM、主题变量和代码高亮体系之上做兼容式 patch，引入接近 GitHub 的系统无衬线字体栈与 `github-markdown-css` 观感 (反复调整)。代码、表格、引用、行内代码和代码块都尽量贴近 GitHub 的阅读密度；H1 标题保留 `Noto Serif SC` 与 700 字重，让标题和正文有区分度。
- **背景与正文底板**：普通正文页使用很轻的虚线网格背景，且有细节上的透明度渐变，正文区域用主题色底板遮住背景，避免纹理穿透影响阅读；首页和彩虹页会关闭普通网格，改用独立的彩虹氛围背景层。
- **彩虹背景**：多个低透明度 `radial-gradient` 固定背景层叠加，通过 blur、saturate 和慢速动画形成轻微流动感。
- **提示块与代码块**：admonition/details 提示块做了透明正文 (通过 css 复刻 material)、轻渐变标题和图标对齐；代码块清理了复制提示、行号背景和分割线，让它更接近正文整体风格。
- **代码高亮**：保留 MkDocs/Pygments 体系，并在其 token 分类上细调关键字、函数、字符串、注释、数字、内建名、寄存器/变量、label/attribute 等颜色，尤其照顾 C、Python、x86 asm、RISC-V 等常见代码块的差异化观感。
- **图片与 PDF 优化**：构建链路会压缩过大的源图片，并为文章图片生成低清 JPEG 预览图，构建后 HTML 先加载预览图，再通过 `data-fullsrc` 升级到原图；PDF 文件可通过 Ghostscript 压缩，降低文档站首屏和附件访问的体积压力。
- **PDF 阅读器**：PDF iframe 会被前端替换为自定义阅读器。下载阶段显示进度条、百分比和状态提示；桌面端下载完成后交给浏览器原生 PDF 查看器，iOS/iPadOS 则降级为 PDF.js canvas 渲染，避免 Safari 内嵌 PDF 只能显示第一页的问题。
- **首页终端**：主页终端不仅有打字机动画，也支持简单交互命令。`ls`、`help`、`?` 会列出分类，输入数字可跳转；`cd` 命令会通过路径归一化支持 `/study`、`~/site/study`、`study/` 等多种写法。
- **友情链接头像**：友链卡片写在 `docs/index.md` 的 `.home-link-grid` 里，只需提供链接(`href`)、外显名字(`<strong>`)、GitHub 用户标识符(`data-id`)和可选描述(`data-description`)。`@名字`、头像、占位首字母等均由 `site-friends.js` 自动补齐；头像实时抓取 `https://avatars.githubusercontent.com/<user>?size=160`，无需本地图片。
- **GitHub 贡献图**：贡献图在构建期抓取并烘焙为静态 JSON，前端按 GitHub 的月份、星期、level 0-4、legend、tooltip 与 aria label 结构重新渲染，亮色和暗色配色都尽量高度还原。

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
│       └── assets/           # favicon 等静态资产
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

## 构建链路

主要脚本职责如下：

- `scripts/generate_page_metadata.py`：读取 Git 历史，生成每个页面的最后更新时间。
- `scripts/fetch_contributions.py`：抓取 GitHub 贡献图 HTML，解析后写入静态 JSON。
- `scripts/generate_image_previews.py`：为文章图片生成低清 JPEG 预览图。
- `scripts/compress_images.py`：压缩 `docs/` 下的源图片，排除低清预览图。
- `scripts/compress_pdfs.py`：使用 Ghostscript 压缩 `docs/` 下的 PDF。
- `scripts/patch_image_src.py`：构建后把 HTML 中的图片 `src` 替换为预览图，并把原图写入 `data-fullsrc`。

本地完整部署流程见 `Makefile` 的 `deploy` 目标：

```text
metadata -> contributions -> compress_pdfs -> compress_images -> zensical build -> previews --site -> patch_image_src -> push gh-pages
```

## 外部依赖

除了 Python 依赖外，部分脚本或页面能力还依赖外部工具/服务：

- `sips`：macOS 自带，用于压缩源图片并生成图片预览图。
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
- `data/`：构建期生成或维护的数据，例如页面更新时间、GitHub 贡献图数据。
- `assets/`：favicon 等可直接被页面引用的静态资产。

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
