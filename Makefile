.DEFAULT_GOAL := zensical

.PHONY: zensical kill deploy contributions previews images clean

previews: ## 生成文章图片的低分辨率预览图（本地构建用）
	uv run python scripts/images.py previews

images: ## 压缩 docs/ 中的源图片（排除 preview）
	uv run python scripts/images.py compress

kill: ## 杀掉 8000 端口进程
	@lsof -ti:8000 | xargs kill -9 2>/dev/null; echo "done"

zensical: previews kill ## 实时预览文档站点（端口 8000）
	uv run zensical serve -o &
	@sleep 1.5 && uv run python scripts/blocks.py && uv run python scripts/link_previews.py && uv run python scripts/metadata.py
	@wait

contributions: ## 抓取 GitHub 贡献图数据烘焙成静态 JSON
	uv run python scripts/contributions.py

deploy: ## 本地构建并部署到 GitHub Pages（gh-pages 分支）
	uv run python scripts/contributions.py
	uv run python scripts/pdfs.py
	uv run python scripts/images.py all
	uv run zensical build
	uv run python scripts/blocks.py
	uv run python scripts/link_previews.py
	uv run python scripts/metadata.py
	cd site && git add -A && git commit -m "deploy" --allow-empty && git push --force origin HEAD:gh-pages

clean: ## 清理 site 目录并重新初始化 git 仓库（不影响主仓库）
	rm -rf site
	git init site
	cd site && git remote add origin https://github.com/bfyes/bfyes.github.io.git
