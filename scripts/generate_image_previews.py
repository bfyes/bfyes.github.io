#!/usr/bin/env python3
"""Generate low-resolution image previews for local builds.

The site keeps original images for lightbox/full-size viewing. This script
creates small JPEG previews next to source images so the frontend can display a
fast first paint and swap to the original when it finishes loading.

Output naming:
    image.jpg  -> image.preview.jpg
    image.png  -> image.preview.jpg
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
PREVIEW_SUFFIX = ".preview.jpg"
MAX_EDGE = 720
JPEG_QUALITY = 55


def is_source_image(path: Path) -> bool:
    if path.suffix.lower() not in IMAGE_EXTS:
        return False
    return not path.name.endswith(PREVIEW_SUFFIX)


def preview_path(path: Path) -> Path:
    return path.with_name(f"{path.stem}.preview.jpg")


def needs_update(src: Path, out: Path) -> bool:
    return not out.exists() or src.stat().st_mtime > out.stat().st_mtime


def generate_preview(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "sips",
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        str(JPEG_QUALITY),
        "-Z",
        str(MAX_EDGE),
        str(src),
        "--out",
        str(out),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="regenerate all previews")
    args = parser.parse_args()

    if subprocess.run(["which", "sips"], stdout=subprocess.DEVNULL).returncode != 0:
        print("[image-previews] sips not found; this script is intended for local macOS builds", file=sys.stderr)
        return 1

    sources = sorted(path for path in DOCS.rglob("*") if path.is_file() and is_source_image(path))
    generated = 0
    skipped = 0

    for src in sources:
        out = preview_path(src)
        if not args.force and not needs_update(src, out):
            skipped += 1
            continue
        try:
            generate_preview(src, out)
        except subprocess.CalledProcessError as exc:
            print(f"[image-previews] failed: {src.relative_to(ROOT)}", file=sys.stderr)
            if exc.stderr:
                print(exc.stderr.strip(), file=sys.stderr)
            return 1
        generated += 1

    print(
        f"[image-previews] generated {generated}, skipped {skipped}, sources {len(sources)}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
