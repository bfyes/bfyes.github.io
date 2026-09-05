#!/usr/bin/env python3
"""Inject page update date and word count into built HTML."""

from __future__ import annotations

import os
import re
import subprocess
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
os.chdir(DOCS)

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


def git_updated(source: Path) -> datetime:
    """Return the source file's last Git commit date, falling back to mtime."""

    result = subprocess.run(
        [
            "git",
            "-C",
            str(ROOT),
            "log",
            "-1",
            "--format=%cI",
            "--",
            source.resolve().relative_to(ROOT).as_posix(),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    try:
        return datetime.fromisoformat(result.stdout.strip())
    except ValueError:
        return datetime.fromtimestamp(source.stat().st_mtime).astimezone()


def page_info_html(source: Path, markdown: str) -> str:
    updated = git_updated(source)
    words = count_words(markdown)
    return (
        '<div class="page-updated-top">'
        '<span class="page-updated-top__label">最后更新于</span>'
        f'<time class="page-updated-top__time" datetime="{updated.isoformat()}">{updated:%Y/%m/%d}</time>'
        '<span class="page-updated-top__sep">·</span>'
        f'<span class="page-updated-top__words">约 {words} 字</span>'
        "</div>"
    )


def patch_page(source: Path, html_path: Path) -> bool:
    if not html_path.is_file():
        return False

    markdown = source.read_text(encoding="utf-8")
    front_matter = FRONT_MATTER.match(markdown)
    if front_matter and PAGE_METADATA_OFF.search(front_matter.group(0)):
        return False

    html = html_path.read_text(encoding="utf-8")
    match = H1.search(html)
    if not match:
        return False

    if "page-updated-top" in html:
        return False

    info = page_info_html(source, markdown)
    patched = html[: match.end()] + info + html[match.end() :]
    html_path.write_text(patched, encoding="utf-8")
    return True


def main() -> None:
    count = 0
    for source in sorted(Path(".").rglob("*.md")):
        html_path = (
            DOCS.parent / "site" / source.parent / "index.html"
            if source.name == "index.md"
            else DOCS.parent / "site" / source.with_suffix("") / "index.html"
        )
        if patch_page(source, html_path):
            count += 1
    print(f"patched page info: {count} pages")


if __name__ == "__main__":
    main()
