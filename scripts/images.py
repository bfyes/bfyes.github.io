#!/usr/bin/env python3
"""Image pipeline: optimize sources and generate previews.

Subcommands:
    compress   Optimize source images in docs/ and slides/ in place.
    previews   Generate low-resolution JPEG previews beside docs/ source images.
    all        Optimize docs/ and slides/, then generate previews only in docs/.

Generated site/ output is never processed. Reveal-md copies optimized
slide assets during its normal static build; it does not use LQIP previews.
"""

from __future__ import annotations

import argparse
import hashlib
import subprocess
import sys
import zlib
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SLIDES = ROOT / "slides"
COMPRESSION_ROOTS = (DOCS, SLIDES)
PREVIEW_ROOTS = (DOCS,)

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
PREVIEW_SUFFIX = ".preview.jpg"

# Source compression settings.
TARGET_BYTES = 2_000_000
MIN_SAVING_RATIO = 0.98
SETTINGS_VERSION = 1
JPEG_QUALITIES = (82, 76, 70, 64, 58)
JPEG_MAX_EDGES = (3000, 2600, 2200, 2000, 1800, 1600, 1400)
PNG_MAX_EDGES = (2200, 2000, 1800, 1600, 1400, 1200)
COMPRESS_MARKER_KEY = "bfyes-image-compress"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

# Preview settings.
PREVIEW_MAX_EDGE = 300
PREVIEW_JPEG_QUALITY = 25
PREVIEW_MARKER_KEY = "bfyes-image-preview"
PREVIEW_MARKER_PREFIX = f"{PREVIEW_MARKER_KEY}:".encode("ascii")


@dataclass(frozen=True)
class ImageInfo:
    fmt: str
    width: int
    height: int

    @property
    def max_edge(self) -> int:
        return max(self.width, self.height)


def human_size(nbytes: int) -> str:
    size = float(nbytes)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1000:
            return f"{size:.1f} {unit}"
        size /= 1000
    return f"{size:.1f} TB"


def is_source_image(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTS and not path.name.endswith(PREVIEW_SUFFIX)


def iter_source_images(base: Path) -> list[Path]:
    """Return source images, excluding generated assets and npm dependencies."""
    return sorted(
        path
        for path in base.rglob("*")
        if path.is_file()
        and is_source_image(path)
        and path.relative_to(base).parts[0] not in {"assets", "node_modules"}
    )


def sips_available() -> bool:
    if subprocess.run(["which", "sips"], stdout=subprocess.DEVNULL).returncode == 0:
        return True
    print("[image-pipeline] sips not found; this script is intended for local macOS builds", file=sys.stderr)
    return False


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


def strip_jpeg_marker(data: bytes, prefix: bytes) -> bytes:
    if not data.startswith(b"\xff\xd8"):
        return data

    out = bytearray(data[:2])
    last = 2
    for start, end, marker, payload in jpeg_segments(data) or ():
        out.extend(data[last:start])
        if not (marker == 0xFE and payload.startswith(prefix)):
            out.extend(data[start:end])
        last = end
    out.extend(data[last:])
    return bytes(out)


# ---------------------------------------------------------------------------
# Source compression
# ---------------------------------------------------------------------------

def compression_marker_text(target_bytes: int) -> bytes:
    return (
        f"{COMPRESS_MARKER_KEY};v=1;settings={SETTINGS_VERSION};target={target_bytes}"
    ).encode("ascii")


def has_compress_marker(path: Path) -> bool:
    data = path.read_bytes()
    key = COMPRESS_MARKER_KEY.encode("ascii")

    if data.startswith(b"\xff\xd8"):
        return any(
            marker == 0xFE and payload.startswith(key)
            for _, _, marker, payload in jpeg_segments(data) or ()
        )

    if data.startswith(PNG_SIGNATURE):
        i = 8
        prefix = key + b"\0"
        while i + 12 <= len(data):
            length = int.from_bytes(data[i : i + 4], "big")
            chunk_type = data[i + 4 : i + 8]
            chunk_data = data[i + 8 : i + 8 + length]
            i += 12 + length
            if chunk_type == b"tEXt" and chunk_data.startswith(prefix):
                return True
            if chunk_type == b"IEND":
                break

    return False


def strip_compress_marker(data: bytes) -> bytes:
    key = COMPRESS_MARKER_KEY.encode("ascii")

    if data.startswith(b"\xff\xd8"):
        return strip_jpeg_marker(data, key)

    if data.startswith(PNG_SIGNATURE):
        out = bytearray(data[:8])
        i = 8
        prefix = key + b"\0"
        while i + 12 <= len(data):
            start = i
            length = int.from_bytes(data[i : i + 4], "big")
            chunk_type = data[i + 4 : i + 8]
            chunk_data = data[i + 8 : i + 8 + length]
            end = i + 12 + length
            if end > len(data):
                out.extend(data[start:])
                break
            if not (chunk_type == b"tEXt" and chunk_data.startswith(prefix)):
                out.extend(data[start:end])
            i = end
            if chunk_type == b"IEND":
                out.extend(data[i:])
                break
        return bytes(out)

    return data


def png_chunk(chunk_type: bytes, chunk_data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(chunk_data, crc) & 0xFFFFFFFF
    return len(chunk_data).to_bytes(4, "big") + chunk_type + chunk_data + crc.to_bytes(4, "big")


def write_compress_marker(path: Path, target_bytes: int) -> bool:
    data = strip_compress_marker(path.read_bytes())
    marker = compression_marker_text(target_bytes)

    if data.startswith(b"\xff\xd8"):
        segment = b"\xff\xfe" + (len(marker) + 2).to_bytes(2, "big") + marker
        path.write_bytes(data[:2] + segment + data[2:])
        return True

    if data.startswith(PNG_SIGNATURE):
        iend = data.rfind(b"\x00\x00\x00\x00IEND")
        if iend == -1:
            return False
        text = COMPRESS_MARKER_KEY.encode("ascii") + b"\0" + marker
        path.write_bytes(data[:iend] + png_chunk(b"tEXt", text) + data[iend:])
        return True

    return False


def read_image_info(path: Path) -> ImageInfo | None:
    result = subprocess.run(
        ["sips", "-g", "format", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  [警告] sips 读取失败: {result.stderr.strip()}", file=sys.stderr)
        return None

    values: dict[str, str] = {}
    for line in result.stdout.splitlines():
        if ":" in line:
            key, value = line.strip().split(":", 1)
            values[key.strip()] = value.strip()

    try:
        return ImageInfo(
            fmt=values["format"].lower(),
            width=int(values["pixelWidth"]),
            height=int(values["pixelHeight"]),
        )
    except (KeyError, ValueError):
        print(f"  [警告] 无法解析图片信息: {path}", file=sys.stderr)
        return None


def run_sips(src: Path, out: Path, info: ImageInfo, quality: int | None, max_edge: int | None) -> bool:
    cmd = ["sips"]
    if info.fmt in {"jpeg", "jpg"}:
        cmd.extend(["-s", "format", "jpeg"])
        if quality is not None:
            cmd.extend(["-s", "formatOptions", str(quality)])
    elif info.fmt == "png":
        cmd.extend(["-s", "format", "png"])
    else:
        return False

    if max_edge is not None and max_edge < info.max_edge:
        cmd.extend(["-Z", str(max_edge)])

    result = subprocess.run([*cmd, str(src), "--out", str(out)], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [警告] sips 压缩失败: {result.stderr.strip()}", file=sys.stderr)
        return False
    return out.exists() and out.stat().st_size > 0


def candidate_settings(info: ImageInfo) -> list[tuple[int | None, int | None]]:
    if info.fmt in {"jpeg", "jpg"}:
        edges = [None, *(edge for edge in JPEG_MAX_EDGES if edge < info.max_edge)]
        return [(edge, quality) for edge in edges for quality in JPEG_QUALITIES]
    if info.fmt == "png":
        return [(edge, None) for edge in [None, *(edge for edge in PNG_MAX_EDGES if edge < info.max_edge)]]
    return []


def compress_one(src: Path, target_bytes: int) -> tuple[bool, int, int]:
    before = src.stat().st_size
    info = read_image_info(src)
    if info is None:
        return False, before, before

    best_tmp: Path | None = None
    best_size = before

    for index, (max_edge, quality) in enumerate(candidate_settings(info), start=1):
        tmp = src.with_name(f"{src.name}.tmp-{index}{src.suffix.lower()}")
        tmp.unlink(missing_ok=True)

        if not run_sips(src, tmp, info, quality, max_edge):
            tmp.unlink(missing_ok=True)
            continue

        size = tmp.stat().st_size
        if size < best_size:
            best_tmp.unlink(missing_ok=True) if best_tmp else None
            best_tmp = tmp
            best_size = size
        else:
            tmp.unlink(missing_ok=True)

        if size <= target_bytes:
            break

    if best_tmp is None or best_size >= before * MIN_SAVING_RATIO:
        best_tmp.unlink(missing_ok=True) if best_tmp else None
        return False, before, before

    best_tmp.replace(src)
    return True, before, best_size


def compress_images(target_bytes: int, force: bool, include_small: bool) -> int:
    compressed = skipped = marked = 0
    total_before = total_after = 0

    for base in COMPRESSION_ROOTS:
        for src in iter_source_images(base):
            before = src.stat().st_size
            total_before += before
            rel = src.relative_to(ROOT)

            if has_compress_marker(src) and not force:
                total_after += before
                skipped += 1
                continue

            if before <= target_bytes and not include_small:
                total_after += before
                skipped += 1
                continue

            print(f"压缩图片: {rel} ...", end=" ")
            sys.stdout.flush()
            changed, old_size, new_size = compress_one(src, target_bytes)

            if write_compress_marker(src, target_bytes):
                marked += 1
                new_size = src.stat().st_size

            if changed:
                pct = (1 - new_size / old_size) * 100
                print(f"{human_size(old_size)} -> {human_size(new_size)}（减小 {pct:.0f}%）")
                compressed += 1
                total_after += new_size
            else:
                print(f"跳过（{human_size(new_size)}）")
                skipped += 1
                total_after += new_size

    if compressed:
        pct = (1 - total_after / total_before) * 100
        print(
            f"[image-compress] {compressed} compressed, {skipped} skipped, {marked} marked: "
            f"{human_size(total_before)} -> {human_size(total_after)}（减小 {pct:.0f}%）"
        )
    else:
        print(f"[image-compress] 无需压缩（{skipped} skipped, {marked} marked）")

    return 0


# ---------------------------------------------------------------------------
# Preview generation
# ---------------------------------------------------------------------------

def preview_path(path: Path) -> Path:
    return path.with_name(f"{path.stem}.preview.jpg")


def sha256_hex(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def preview_marker_text(src_hash: str) -> bytes:
    return (
        f"{PREVIEW_MARKER_KEY}:v=1;edge={PREVIEW_MAX_EDGE};"
        f"quality={PREVIEW_JPEG_QUALITY};source={src_hash}"
    ).encode("ascii")


def read_preview_marker(out: Path) -> bytes:
    if not out.exists():
        return b""
    for _, _, marker, payload in jpeg_segments(out.read_bytes()) or ():
        if marker == 0xFE and payload.startswith(PREVIEW_MARKER_PREFIX):
            return payload
    return b""


def write_preview_marker(out: Path, src_hash: str) -> None:
    data = strip_jpeg_marker(out.read_bytes(), PREVIEW_MARKER_PREFIX)
    marker = preview_marker_text(src_hash)
    segment = b"\xff\xfe" + (len(marker) + 2).to_bytes(2, "big") + marker
    out.write_bytes(data[:2] + segment + data[2:])


def needs_preview_update(src: Path, out: Path) -> bool:
    return not out.exists() or read_preview_marker(out) != preview_marker_text(sha256_hex(src))


def generate_preview(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "sips",
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        str(PREVIEW_JPEG_QUALITY),
        "-Z",
        str(PREVIEW_MAX_EDGE),
        str(src),
        "--out",
        str(out),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    write_preview_marker(out, sha256_hex(src))


def clean_stale_previews(base: Path) -> int:
    """Delete preview files whose source image no longer exists."""
    removed = 0
    for pv in sorted(base.rglob(f"*{PREVIEW_SUFFIX}")):
        if not pv.is_file() or pv.relative_to(base).parts[0] in {"assets", "node_modules"}:
            continue
        stem = pv.stem.replace(".preview", "")
        src_jpg = pv.with_name(f"{stem}.jpg")
        src_png = pv.with_name(f"{stem}.png")
        if not src_jpg.exists() and not src_png.exists():
            pv.unlink()
            removed += 1
            print(f"  cleaned: {pv.relative_to(base)}", file=sys.stderr)
    return removed


def generate_previews(base: Path, force: bool) -> int:
    generated = 0
    skipped = 0

    for src in iter_source_images(base):
        out = preview_path(src)
        if not force and not needs_preview_update(src, out):
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

    cleaned = clean_stale_previews(base)
    print(
        f"[image-previews] {base.relative_to(ROOT)}/ — "
        f"generated {generated}, skipped {skipped}, cleaned {cleaned}",
        file=sys.stderr,
    )
    return 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Compress source images and generate preview images.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    compress_parser = subparsers.add_parser("compress", help="optimize source images in docs/ and slides/")
    compress_parser.add_argument("--all", action="store_true", help="also optimize images already under target")
    compress_parser.add_argument("--force", action="store_true", help="ignore embedded markers")
    compress_parser.add_argument("--target-mb", type=float, default=2.0, help="target size in MB, default: 2.0")

    preview_parser = subparsers.add_parser("previews", help="generate low-resolution previews for docs/ source images")
    preview_parser.add_argument("--force", action="store_true", help="regenerate all previews")

    all_parser = subparsers.add_parser(
        "all",
        help="compress docs/ and slides/, then generate previews only in docs/",
    )
    all_parser.add_argument("--all", action="store_true", help="also optimize images already under target")
    all_parser.add_argument("--force", action="store_true", help="ignore embedded markers")
    all_parser.add_argument("--target-mb", type=float, default=2.0, help="target size in MB, default: 2.0")

    args = parser.parse_args()
    if not sips_available():
        return 1

    if args.command in ("compress", "all"):
        status = compress_images(
            int(args.target_mb * 1_000_000),
            args.force,
            args.all,
        )
        if status != 0:
            return status

    if args.command in ("previews", "all"):
        for base in PREVIEW_ROOTS:
            if generate_previews(base, args.force) != 0:
                return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
