# Reveal-md 幻灯片子项目。
# 约定：foo.md 构建为 /slides/foo/；foo.assets/ 存放 foo.md 使用的图片等资源。
# 依赖清单和 node_modules 均放在 .reveal/，首次构建时会自动执行 npm ci。
.DEFAULT_GOAL := build

REVEAL_DIR := .reveal
PACKAGE_JSON := $(REVEAL_DIR)/package.json
PACKAGE_LOCK := $(REVEAL_DIR)/package-lock.json
NODE_MODULES := $(REVEAL_DIR)/node_modules/.package-lock.json
REVEAL_MD := ./$(REVEAL_DIR)/node_modules/.bin/reveal-md
TEMPLATE := template.html
CSS += custom.css
ASSETS_DIR := assets
SITE_SLIDES_DIR := ../site/slides
SLIDES := $(wildcard *.md)
FILE ?=
PREVIEW_PORT ?= 1948
.PHONY: build pdf kill clean help

$(NODE_MODULES): $(PACKAGE_JSON) $(PACKAGE_LOCK)
	npm ci --prefix "$(REVEAL_DIR)"

build: $(NODE_MODULES) ## 构建 slides/ 下全部 Markdown 幻灯片
	@set -e; \
	for source in $(SLIDES); do \
		name="$${source%.md}"; \
		target="$(SITE_SLIDES_DIR)/$$name"; \
		echo "构建：$$source → $$target"; \
		rm -rf "$$target"; \
		"$(REVEAL_MD)" "$$source" --template "$(TEMPLATE)" \
			--assets-dir "$(ASSETS_DIR)" --static "$$target"; \
		rm -f "$$target/$$name.html"; \
	done

pdf: kill $(NODE_MODULES) ## 导出单份幻灯片为 PDF（make pdf FILE=astro）
	@set -e; \
	name="$(FILE)"; \
	name="$${name%.md}"; \
	if [ -z "$$name" ]; then \
		echo "用法：make pdf FILE=<名字>，例如 make pdf FILE=astro"; \
		echo "可选：$(SLIDES)"; \
		exit 1; \
	fi; \
	source="$$name.md"; \
	if [ ! -f "$$source" ]; then \
		echo "找不到 $$source；可选：$(SLIDES)"; \
		exit 1; \
	fi; \
	echo "导出：$$source → $$name.pdf"; \
	"$(REVEAL_MD)" "$$source" --template "$(TEMPLATE)" \
		--css "$(CSS)" --print "$$name.pdf"; \
	echo "完成：$$name.pdf"

kill: ## 停止占用 PREVIEW_PORT 的预览服务
	@pids="$$(lsof -tiTCP:$(PREVIEW_PORT) -sTCP:LISTEN 2>/dev/null)"; \
	if [ -n "$$pids" ]; then \
		kill -9 $$pids; \
		echo "已停止 $(PREVIEW_PORT) 端口上的预览服务"; \
	else \
		echo "$(PREVIEW_PORT) 端口没有运行中的预览服务"; \
	fi

clean: ## 清理当前 Markdown 对应的静态输出目录
	@set -e; \
	for source in $(SLIDES); do \
		rm -rf "$(SITE_SLIDES_DIR)/$${source%.md}"; \
	done

help: ## 显示子项目命令
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-10s %s\n", $$1, $$2}'
