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
    python scripts/generate_image_previews.py --site   # generate in site/ (deploy)

Both modes also delete orphaned previews whose source image no longer exists,
so every run (which already hashes sources) doubles as a cleanup pass.
"""

from __future__ import annotations

import argparse
import hashlib
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
MARKER_KEY = "bfyes-image-preview"
MARKER_PREFIX = f"{MARKER_KEY}:".encode("ascii")


def is_source_image(path: Path) -> bool:
    if path.suffix.lower() not in IMAGE_EXTS:
        return False
    return not path.name.endswith(PREVIEW_SUFFIX)


def preview_path(path: Path) -> Path:
    return path.with_name(f"{path.stem}.preview.jpg")


def sha256_hex(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def marker_text(src_hash: str) -> bytes:
    return (
        f"{MARKER_KEY}:v=1;edge={MAX_EDGE};quality={JPEG_QUALITY};source={src_hash}"
    ).encode("ascii")


def jpeg_segments(data: bytes):
    if not data.startswith(b"\xff\xd8"):
        return
    i = 2
    while i < len(data):
        start = i
        if data[i] != 0xFF:
            return
        while i < len(data) and data[i] == 0xFF:
            i += 1
        if i >= len(data):
            return
        marker = data[i]
        i += 1
        if marker == 0xDA:
            return
        if marker == 0xD9 or marker == 0x01 or 0xD0 <= marker <= 0xD7:
            yield start, i, marker, b""
            continue
        if i + 2 > len(data):
            return
        length = int.from_bytes(data[i : i + 2], "big")
        end = i + length
        if length < 2 or end > len(data):
            return
        yield start, end, marker, data[i + 2 : end]
        i = end


def strip_marker(data: bytes) -> bytes:
    if not data.startswith(b"\xff\xd8"):
        return data

    out = bytearray(data[:2])
    last = 2
    for start, end, marker, payload in jpeg_segments(data) or ():
        out.extend(data[last:start])
        if not (marker == 0xFE and payload.startswith(MARKER_PREFIX)):
            out.extend(data[start:end])
        last = end
    out.extend(data[last:])
    return bytes(out)


def read_marker(out: Path) -> bytes:
    if not out.exists():
        return b""
    for _, _, marker, payload in jpeg_segments(out.read_bytes()) or ():
        if marker == 0xFE and payload.startswith(MARKER_PREFIX):
            return payload
    return b""


def write_marker(out: Path, src_hash: str) -> None:
    data = strip_marker(out.read_bytes())
    marker = marker_text(src_hash)
    segment = b"\xff\xfe" + (len(marker) + 2).to_bytes(2, "big") + marker
    out.write_bytes(data[:2] + segment + data[2:])


def needs_update(src: Path, out: Path) -> bool:
    return not out.exists() or read_marker(out) != marker_text(sha256_hex(src))


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
    write_marker(out, sha256_hex(src))


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
    parser.add_argument("--site", action="store_true", help="generate in site/ (orphan cleanup runs in both modes)")
    parser.add_argument("--force", action="store_true", help="regenerate all previews")
    args = parser.parse_args()

    if subprocess.run(["which", "sips"], stdout=subprocess.DEVNULL).returncode != 0:
        print("[image-previews] sips not found; this script is intended for local macOS builds", file=sys.stderr)
        return 1

    base = SITE if args.site else DOCS
    generated, skipped = generate(base, args.force)

    cleaned = clean_stale_previews(base)

    print(
        f"[image-previews] {base.relative_to(ROOT)}/ — generated {generated}, skipped {skipped}, cleaned {cleaned}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
