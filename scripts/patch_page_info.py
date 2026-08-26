#!/usr/bin/env python3
"""Build-time page metadata patcher."""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"

FRONT_MATTER = re.compile(r"\A---\s*\n.*?\n---\s*\n", re.DOTALL)
H1 = re.compile(r"(<h1[^>]*>.*?</h1>)", re.DOTALL)
INLINE_CODE = re.compile(r"`[^`]*`")
HTML_TAG = re.compile(r"<[^>]+>")
LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
MARKDOWN_NOISE = re.compile(r"[#>*_~|\-]+")
CJK = re.compile(r"[\u4e00-\u9fff\u3400-\u4dbf]")
WORD = re.compile(r"[A-Za-z]+")
PAGE_METADATA_OFF = re.compile(r"^page_metadata:\s*false\s*$", re.MULTILINE)


def count_words(markdown: str) -> int:
    text = FRONT_MATTER.sub(" ", markdown)
    text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
    text = re.sub(r"~~~.*?~~~", " ", text, flags=re.DOTALL)
    text = INLINE_CODE.sub(" ", text)
    text = HTML_TAG.sub(" ", text)
    text = LINK.sub(r"\1", text)
    text = MARKDOWN_NOISE.sub(" ", text)
    return len(CJK.findall(text)) + len(WORD.findall(text))


def source_path_for(html_path: Path) -> Path | None:
    """Map a generated HTML page back to its Markdown source.

    Zensical emits directory URLs: both ``docs/foo.md`` and
    ``docs/foo/index.md`` can generate ``site/foo/index.html``.
    """

    rel = html_path.relative_to(SITE)

    if html_path.name != "index.html":
        candidate = DOCS / rel.with_suffix(".md")
        return candidate if candidate.is_file() else None

    if rel == Path("index.html"):
        candidates = [DOCS / "index.md"]
    else:
        parent = rel.parent
        candidates = [
            DOCS / parent / "index.md",
            DOCS / parent.with_suffix(".md"),
        ]

    return next((candidate for candidate in candidates if candidate.is_file()), None)


def page_info_html(source: Path) -> str:
    markdown = source.read_text(encoding="utf-8")
    updated = datetime.fromtimestamp(source.stat().st_mtime).astimezone()
    words = count_words(markdown)
    return (
        '<div class="page-updated-top">'
        '<span class="page-updated-top__label">最后更新于</span>'
        f'<time class="page-updated-top__time" datetime="{updated.isoformat()}">{updated:%Y/%m/%d}</time>'
        '<span class="page-updated-top__sep">·</span>'
        f'<span class="page-updated-top__words">约 {words} 字</span>'
        "</div>"
    )


def patch_page(html_path: Path) -> bool:
    source = source_path_for(html_path)
    if source is None:
        return False

    markdown = source.read_text(encoding="utf-8")

    html = html_path.read_text(encoding="utf-8")
    match = H1.search(html)
    if not match:
        return False

    if "page-updated-top" in html:
        return False

    info = page_info_html(source)
    patched = html[: match.end()] + info + html[match.end() :]
    html_path.write_text(patched, encoding="utf-8")
    return True


def main() -> None:
    count = 0
    for html_path in sorted(SITE.rglob("*.html")):
        if patch_page(html_path):
            count += 1
    print(f"patched page info: {count} pages")


if __name__ == "__main__":
    main()
