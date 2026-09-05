.DEFAULT_GOAL := preview

.PHONY: preview kill deploy contributions previews images clean

PREVIEW_PORT ?= 8000
PREVIEW_HOST ?= 127.0.0.1
PRESENTATIONS_DIR := presentations

previews: ## 生成 docs/ 图片的低分辨率预览图
	uv run python scripts/images.py previews

images: ## 压缩 docs/ 与 presentations/ 中的源图片（排除 preview）
	uv run python scripts/images.py compress

kill: ## 停止 8000 端口上的统一预览服务
	@pids="$$(lsof -tiTCP:$(PREVIEW_PORT) -sTCP:LISTEN 2>/dev/null)"; \
	if [ -n "$$pids" ]; then \
		kill -9 $$pids; \
		echo "已停止 $(PREVIEW_PORT) 端口上的预览服务"; \
	else \
		echo "$(PREVIEW_PORT) 端口没有运行中的预览服务"; \
	fi

# Zensical 原生监听文档变化；PPT 仅在启动预览时静态构建到 site/slides/。
preview: previews kill ## 预览文档站；启动时构建 PPT（端口 8000）
	@uv run zensical serve --dev-addr $(PREVIEW_HOST):$(PREVIEW_PORT) --open & \
		zensical_pid=$$!; \
		sleep 1.5; \
		$(MAKE) -C $(PRESENTATIONS_DIR) build && \
		uv run python scripts/blocks.py && \
		uv run python scripts/link_previews.py && \
		uv run python scripts/metadata.py; \
		wait $$zensical_pid

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
	$(MAKE) -C $(PRESENTATIONS_DIR) build
	cd site && git add -A && git commit -m "deploy" --allow-empty && git push --force origin HEAD:gh-pages

clean: ## 清理 site 目录并重新初始化 git 仓库（不影响主仓库）
	rm -rf site
	git init site
	cd site && git remote add origin https://github.com/bfyes/bfyes.github.io.git
