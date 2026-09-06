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
ASSETS_DIR := assets
SITE_SLIDES_DIR := ../site/slides
SLIDES := $(wildcard *.md)
.PHONY: build clean help

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

clean: ## 清理当前 Markdown 对应的静态输出目录
	@set -e; \
	for source in $(SLIDES); do \
		rm -rf "$(SITE_SLIDES_DIR)/$${source%.md}"; \
	done

help: ## 显示子项目命令
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-10s %s\n", $$1, $$2}'
