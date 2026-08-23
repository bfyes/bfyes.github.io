#!/usr/bin/env python3
"""patch_home_blocks.py — 构建后把主页自定义语法替换为 HTML。

支持块语法（::terminal:: / ::changelog:: / ::friends:: / ::activity::）：

::friends::
gE | gE0650 | https://0-rangE.cn | Orange
dreamem0ra1n | dreamem0ra1n | https://dreamem0ra1n.github.io/ISYS/ | ISYS
::/friends::

  字段：显示名 | GitHub用户名 | URL | 描述（可选，无描述留空）

::changelog::
2026.08.16: 修复公式问题。重构 css。
::/changelog::

  字段：日期: 内容（内容经 Markdown 行内渲染，支持 <url> 与 [text](url)）。

::activity:: —— 块语法，参数为 GitHub 用户名（::activity::user::/activity::）。

用法: uv run python scripts/patch_home_blocks.py
"""
from __future__ import annotations

import html
import re
from pathlib import Path
from urllib.parse import quote

import markdown

SITE = Path(__file__).resolve().parents[1] / "site"


def friend_initials(name: str, github: str) -> str:
    """与原 home.js friendInitials 一致：中文取首字；多词取前两词首字母；单词取前两字符。"""
    source = (name or github or "?").strip()
    if not source:
        return "?"
    if "一" <= source[0] <= "龥":
        return source[0]
    parts = source.split()
    if len(parts) > 1:
        return (parts[0][0] + parts[1][0]).upper()
    return source[:2]


def github_avatar_url(github: str) -> str:
    """与原 home.js githubAvatarUrl 一致（encodeURIComponent → quote(safe='')）。"""
    return f"https://avatars.githubusercontent.com/{quote(github, safe='')}?size=160" if github else ""


def render_avatar(name: str, github: str) -> str:
    """构建头像 span：首字母占位 + 叠加 GitHub 头像 img。

    img 初始 opacity:0（不可见，首字母露出）；加载完成后 onload 设 opacity:1
    带 blur-up 过渡淡入；加载失败 onerror 移除 img，首字母保持。"""
    initials = html.escape(friend_initials(name, github))
    src = github_avatar_url(github)
    img = (
        f'<img src="{html.escape(src, quote=True)}" alt="" width="96" height="96" '
        f'class="lqip" style="opacity:0" '
        f'onload="this.style.opacity=1" '
        f'onerror="this.remove()">'
        if src
        else ""
    )
    return f'<span class="home-friend__avatar">{initials}{img}</span>'


def parse_block(content: str, tag: str) -> str | None:
    """提取 ::tag:: ... ::/tag:: 块内容。"""
    m = re.search(rf"::{tag}::\s*(.*?)\s*::/{tag}::", content, re.DOTALL)
    return m.group(1) if m else None


def render_inline_markdown(text: str) -> str:
    """把单行文本经 Markdown 渲染，并剥掉外层 <p>…</p>，支持 <url> 与 [text](url)。"""
    rendered = markdown.markdown(text.strip())
    if rendered.startswith("<p>") and rendered.endswith("</p>"):
        rendered = rendered[len("<p>") : -len("</p>")]
    return rendered


def render_changelog(lines: str) -> str:
    items = []
    for line in lines.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        if ":" not in line:
            continue
        date, text = line.split(":", 1)
        rendered = render_inline_markdown(text)
        items.append(
            f'      <div class="home-log">\n'
            f'        <span class="home-log__date">{html.escape(date.strip())}</span>\n'
            f"        <span>{rendered}</span>\n"
            f"      </div>"
        )
    return (
        '<section class="home-section" aria-labelledby="home-log-title">\n'
        '    <div class="home-section__head">\n'
        '      <h2 id="home-log-title" class="home-section__title">Changelog</h2>\n'
        "    </div>\n"
        '    <div class="home-log-list">\n'
        + "\n".join(items) + "\n"
        + "    </div>\n"
        + "</section>"
    )


def render_friends(lines: str, title: str = "Links", section_id: str = "home-friends-title") -> str:
    items = []
    for line in lines.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split("|", 3)]
        if len(parts) < 3:
            continue
        # 显示名 | GitHub用户名 | URL | 描述（可选，缺省留空）
        name, github_id, href = parts[0], parts[1], parts[2]
        desc = parts[3] if len(parts) > 3 else ""
        attrs = f'href="{html.escape(href)}" target="_blank" rel="noopener"'
        # 头像：构建期生成首字母 + GitHub 头像 img（onerror 移除 img 露出首字母）。
        avatar = render_avatar(name, github_id)
        # handle：仅当有 GitHub 用户名时输出 @用户名。
        handle = (
            f'\n        <span class="home-friend__handle">@{html.escape(github_id)}</span>'
            if github_id
            else ""
        )
        # 描述：过一遍 Markdown 渲染，支持 <url> 与 [text](url)，直接以正文 span 输出。
        # 无描述时附加 --empty class（CSS 将其 display:none），保留 \xa0 占位；
        # 有描述时正常显示。卡片通过 justify-content: center 统一垂直居中，
        # 2 行（name + handle）和 3 行（+ meta）均适用。
        has_desc = bool(desc)
        meta_content = render_inline_markdown(desc) if has_desc else "\xa0"
        meta_cls = "home-friend__meta" + ("" if has_desc else " home-friend__meta--empty")
        meta = f'\n        <span class="{meta_cls}">{meta_content}</span>'
        items.append(
            f'      <a class="home-friend" {attrs}>\n'
            f"        {avatar}\n"
            f'        <span class="home-friend__body">\n'
            f"          <strong>{html.escape(name)}</strong>{handle}{meta}\n"
            f"        </span>\n"
            f"      </a>"
        )
    return (
        f'<section class="home-section" aria-labelledby="{section_id}">\n'
        f'    <div class="home-section__head">\n'
        f'      <h2 id="{section_id}" class="home-section__title">{title}</h2>\n'
        f"    </div>\n"
        f'    <div class="home-link-grid">\n'
        + "\n".join(items) + "\n"
        + "    </div>\n"
        + "</section>"
    )


def render_terminal() -> str:
    return (
        '<section aria-label="homepage intro">\n'
        '      <div class="home-terminal" aria-label="bfyes terminal intro">\n'
        '        <div class="home-terminal__bar">\n'
        '          <span class="home-terminal__dot home-terminal__dot--red"></span>\n'
        '          <span class="home-terminal__dot home-terminal__dot--yellow"></span>\n'
        '          <span class="home-terminal__dot home-terminal__dot--green"></span>\n'
        '          <span class="home-terminal__title">bfyes@ZJU:~</span>\n'
        '        </div>\n'
        '        <div class="home-terminal__screen">\n'
        '          <div class="home-terminal__line">\n'
        '            <span id="typed-line-1-host" class="typed-text typed-text--host" style="display:none;"></span><span id="typed-line-1-separator" class="typed-text typed-text--separator" style="display:none;"></span><span id="typed-line-1-prompt" class="typed-text typed-text--prompt" style="display:none;"></span><span id="typed-line-1-command" class="typed-text typed-text--command" style="display:none;"></span>\n'
        '          </div>\n'
        '          <div class="home-terminal__line home-terminal__line--user">\n'
        '            <span id="typed-line-2" class="typed-text" style="display:none;"></span>\n'
        '          </div>\n'
        '          <div class="home-terminal__line home-terminal__line--flag">\n'
        '            <span id="typed-line-3" class="typed-text" style="display:none;"></span>\n'
        '          </div>\n'
        '          <div class="home-terminal__line home-terminal__line--prompt" style="display:none;">\n'
        '            <span class="typed-text--host">bfyes@ZJU</span><span class="typed-text--separator">:</span><span class="typed-text--prompt">~/site$ </span><span id="typed-line-4-command" class="typed-text typed-text--command" style="display:none;"></span>\n'
        '          </div>\n'
        '        </div>\n'
        '      </div>\n'
        '</section>'
    )


def render_activity(user: str = "") -> str:
    user_attr = f' data-user="{html.escape(user)}"' if user else ""
    return (
        '<section class="home-section home-section--activity" aria-labelledby="home-activity-title">\n'
        '    <div class="home-section__head">\n'
        '      <h2 id="home-activity-title" class="home-section__title">Activity</h2>\n'
        "    </div>\n"
        f'    <div class="github-calendar-wrap"{user_attr}>\n'
        '      <div class="ghc-loading">正在加载 GitHub 贡献图...</div>\n'
        "    </div>\n"
        "</section>"
    )


def process_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    if "::terminal::" not in content and "::changelog::" not in content and "::friends::" not in content and "::activity::" not in content:
        return False

    original = content

    # ::terminal::
    if "::terminal::" in content:
        content = re.sub(r"::terminal::\s*\n?", render_terminal(), content)

    # ::changelog::
    cl = parse_block(content, "changelog")
    if cl:
        content = content.replace(
            re.search(r"::changelog::.*?::/changelog::", content, re.DOTALL).group(0),
            render_changelog(cl),
        )

    # ::friends:: (支持多个块，逐个替换)
    while True:
        fr = parse_block(content, "friends")
        if not fr:
            break
        block = re.search(r"::friends::.*?::/friends::", content, re.DOTALL).group(0)
        content = content.replace(block, render_friends(fr), 1)

    # ::activity:: (块语法 ::activity::user::/activity::)
    act = parse_block(content, "activity")
    if act:
        content = content.replace(
            re.search(r"::activity::.*?::/activity::", content, re.DOTALL).group(0),
            render_activity(act.strip()),
        )

    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"  patched: {path.relative_to(SITE)}")
        return True
    return False


def main() -> None:
    count = 0
    for html_file in SITE.rglob("*.html"):
        if process_file(html_file):
            count += 1
    print(f"Done: {count} files patched")


if __name__ == "__main__":
    main()
