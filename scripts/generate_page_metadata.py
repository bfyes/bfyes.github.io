#!/usr/bin/env python3
"""Generate page metadata used by the static site footer."""

from __future__ import annotations

import json
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUTPUT = DOCS / "theme" / "data" / "page-metadata.js"


def page_url(path: Path) -> str:
    rel = path.relative_to(DOCS)
    if rel.name == "index.md":
        parent = rel.parent.as_posix()
        return "/" if parent == "." else f"/{parent}/"

    return f"/{rel.with_suffix('').as_posix()}/"


def last_commit_date(path: Path) -> str | None:
    result = subprocess.run(
        ["git", "log", "-1", "--follow", "--format=%cI", "--", str(path.relative_to(ROOT))],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    value = result.stdout.strip()
    return value or None


def file_modified_date(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime).astimezone().isoformat()


def main() -> None:
    pages = {}
    for path in sorted(DOCS.rglob("*.md")):
        updated = last_commit_date(path) or file_modified_date(path)
        pages[page_url(path)] = {"updated": updated}

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        "window.__BFYES_PAGE_META__ = "
        + json.dumps(pages, ensure_ascii=True, indent=2, sort_keys=True)
        + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
