.DEFAULT_GOAL := zensical

.PHONY: zensical kill deploy metadata

metadata: ## 生成页面更新时间元数据
	uv run python scripts/generate_page_metadata.py

kill: ## 杀掉 8000 端口进程
	@lsof -ti:8000 | xargs kill -9 2>/dev/null; echo "done"

zensical: metadata kill ## 实时预览文档站点（端口 8000）
	uv run zensical serve -o

deploy: ## 本地构建并部署到 GitHub Pages（gh-pages 分支）
	uv run python scripts/generate_page_metadata.py
	uv run zensical build
	cd site && git init && git add -A && git commit -m "deploy" --allow-empty && git push -f https://github.com/bfyes/bfyes.github.io.git main:gh-pages
