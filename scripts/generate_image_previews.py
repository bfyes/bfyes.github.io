#!/usr/bin/env python3
"""Generate low-resolution image previews for local builds.

The site keeps original images for lightbox/full-size viewing. This script
creates small JPEG previews next to source images so the frontend can display a
fast first paint and swap to the original when it finishes loading.

Output naming:
    image.jpg  -> image.preview.jpg
    image.png  -> image.preview.jpg

Usage:
    python scripts/generate_image_previews.py          # generate in docs/ (local dev)
    python scripts/generate_image_previews.py --site   # generate in site/ + cleanup stale (deploy)
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
PREVIEW_SUFFIX = ".preview.jpg"
MAX_EDGE = 300
JPEG_QUALITY = 25


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


def clean_stale_previews(base: Path) -> int:
    """Delete preview files whose source image no longer exists."""
    removed = 0
    # Skip site/assets/ (build artifacts)
    skip_dir = base / "assets"
    for pv in sorted(base.rglob(f"*{PREVIEW_SUFFIX}")):
        if not pv.is_file():
            continue
        if pv.is_relative_to(skip_dir):
            continue
        stem = pv.stem.replace(".preview", "")
        src_jpg = pv.with_name(f"{stem}.jpg")
        src_png = pv.with_name(f"{stem}.png")
        if not src_jpg.exists() and not src_png.exists():
            pv.unlink()
            removed += 1
            print(f"  cleaned: {pv.relative_to(base)}", file=sys.stderr)
    return removed


def generate(base: Path, force: bool) -> tuple[int, int]:
    # Skip site/assets/ (favicon etc.) — build artifacts, not content images.
    # Match only the top-level "assets" directory, not e.g. "*.assets/".
    skip_dir = base / "assets"
    sources = sorted(
        path for path in base.rglob("*")
        if path.is_file()
        and is_source_image(path)
        and not path.is_relative_to(skip_dir)
    )
    generated = 0
    skipped = 0

    for src in sources:
        out = preview_path(src)
        if not force and not needs_update(src, out):
            skipped += 1
            continue
        try:
            generate_preview(src, out)
        except subprocess.CalledProcessError as exc:
            print(f"[image-previews] failed: {src.relative_to(ROOT)}", file=sys.stderr)
            if exc.stderr:
                print(exc.stderr.strip(), file=sys.stderr)
            return generated, skipped
        generated += 1

    return generated, skipped


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", action="store_true", help="generate in site/ + cleanup stale previews")
    parser.add_argument("--force", action="store_true", help="regenerate all previews")
    args = parser.parse_args()

    if subprocess.run(["which", "sips"], stdout=subprocess.DEVNULL).returncode != 0:
        print("[image-previews] sips not found; this script is intended for local macOS builds", file=sys.stderr)
        return 1

    base = SITE if args.site else DOCS
    generated, skipped = generate(base, args.force)

    cleaned = 0
    if args.site:
        cleaned = clean_stale_previews(base)

    print(
        f"[image-previews] {base.relative_to(ROOT)}/ — generated {generated}, skipped {skipped}, cleaned {cleaned}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
