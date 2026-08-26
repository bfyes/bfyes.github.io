# [bfyes.github.io](https://bfyes.github.io)

bfyes 的个人文档站，使用 Zensical/MkDocs 构建，主题层基于 GitHub 风格深度定制。

## 如需 Fork 请阅读

```bash
git clone https://github.com/bfyes/bfyes.github.io.git
cd bfyes.github.io
uv sync    # 安装依赖
make       # 本地预览 http://127.0.0.1:8000
make deploy # 构建并部署到 GitHub Pages
```

Fork 后按需修改 `zensical.toml` 和 `docs/index.md` 中的个人信息。

> 部分功能依赖 macOS（`sips` 图片预览、`gs` PDF 压缩）。

## 新特性

- 明暗主题适配，站点字体、颜色和 GitHub 风格正文排版
- Giscus 评论区，并随站点主题自动切换
- Instant navigation、页面滚动追踪、返回顶部和前后页导航
- 搜索建议、关键词高亮与搜索结果分享
- 右侧 TOC 自动跟随、当前项高亮，以及按页面开关的目录折叠
- 桌面侧栏与移动端抽屉式导航，TOC 跟随和展开均带平滑动画
- 标题自动编号、锚点图标、脚注回跳与链接定位
- highlight.js 运行时代码高亮，支持复制、选择和代码注释
- MathJax 公式、Tabbed、Details、Admonition 等内容组件
- tooltip
- PDF 内联阅读器
- 图片低清预览（LQIP）& 渐进清晰加载
- 彩虹背景、网格背景
- 页面级开关
- 主页终端，友情链接，GitHub 贡献图静态数据 + 前端渲染
- 页面更新时间、字数、浏览量、Stars 与编辑/查看链接
- 构建期图片压缩、PDF 处理、链接预览和页面元数据生成

## 文件结构

```text
docs/              # 站点内容
  theme/css/       # variables → main → features → home
  theme/js/        # core → mathjax → highlight → features
  theme/data/      # 贡献图 JSON（构建期生成）
overrides/         # main.html + partials（comments/page-info/logo）
scripts/           # 构建期脚本
zensical.toml      # 站点配置
```

## 生成流程

```text
contributions → pdfs → images(all) → zensical build → blocks → link_previews → metadata → push gh-pages
```

## 写作约定

- 文章放 `docs/study/`、`docs/tools/`、`docs/diaries/`、`docs/games/`
- 图片放同名 `.assets/` 目录，运行 `make previews`
- PDF 用 `<iframe src="xxx.pdf">` 嵌入，前端自动替换为阅读器
- 关闭评论区：front matter 加 `comments: false`
- 关闭顶部更新时间/字数：front matter 加 `page_metadata: false`
- 关闭底部信息：front matter 加 `page_info: false`
