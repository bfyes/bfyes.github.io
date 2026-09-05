# Reveal-md 子项目。
# 约定：foo.md 构建为 /slides/foo/；foo.assets/ 放 foo.md 使用的图片等资源。
.DEFAULT_GOAL := build

NODE_MODULES := node_modules/.package-lock.json
REVEAL_MD := ./node_modules/.bin/reveal-md
TEMPLATE := template.html
ASSETS_DIR := assets
SITE_SLIDES_DIR := ../site/slides
SLIDES := $(wildcard *.md)
.PHONY: build clean help

$(NODE_MODULES): package-lock.json package.json
	npm ci

build: $(NODE_MODULES) ## 构建 presentations/ 下全部 Markdown 演示
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

clean: ## 清理当前 Markdown 对应的静态输出目录
	@set -e; \
	for source in $(SLIDES); do \
		rm -rf "$(SITE_SLIDES_DIR)/$${source%.md}"; \
	done

help: ## 显示子项目命令
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-10s %s\n", $$1, $$2}'
