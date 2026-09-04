.DEFAULT_GOAL := zensical

.PHONY: zensical serve kill deploy contributions previews images clean

previews: ## 生成文章图片的低分辨率预览图（本地构建用）
	uv run python scripts/images.py previews

images: ## 压缩 docs/ 中的源图片（排除 preview）
	uv run python scripts/images.py compress

kill: ## 停止 make zensical / make serve 的 8000 端口监听服务
	@pids="$$(lsof -tiTCP:8000 -sTCP:LISTEN 2>/dev/null)"; \
	if [ -n "$$pids" ]; then \
		kill -9 $$pids; \
		echo "已停止监听 0.0.0.0:8000（或 localhost:8000）的预览服务"; \
	else \
		echo "8000 端口没有运行中的预览服务"; \
	fi

zensical: previews kill ## 实时预览文档站点（端口 8000）
	uv run zensical serve -o &
	@sleep 1.5 && uv run python scripts/blocks.py && uv run python scripts/link_previews.py && uv run python scripts/metadata.py
	@wait

serve: previews kill ## 允许同一热点设备访问并实时预览文档站点（端口 8000）
	@host_ip="$$(ipconfig getifaddr en0 2>/dev/null || true)"; \
	if [ -z "$$host_ip" ]; then \
		host_ip="$$(ifconfig | awk '/inet / && $$2 !~ /^127\./ { print $$2; exit }')"; \
	fi; \
	echo "文档站已监听 0.0.0.0:8000"; \
	echo "本机访问：http://127.0.0.1:8000/"; \
	if [ -n "$$host_ip" ]; then \
		echo "同一热点设备访问：http://$$host_ip:8000/"; \
	else \
		echo "未检测到局域网 IPv4；连接手机热点后重新运行 make serve。"; \
	fi
	uv run zensical serve --dev-addr 0.0.0.0:8000 &
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
