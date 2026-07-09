.PHONY: zensical kill

kill: ## 杀掉 8000 端口进程
	@lsof -ti:8000 | xargs kill -9 2>/dev/null; echo "done"

zensical: kill ## 实时预览文档站点（端口 8000）
	uv run zensical serve -o
