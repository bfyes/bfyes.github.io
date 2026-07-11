#!/usr/bin/env python3
"""构建后压缩 site/ 中的所有 PDF，减小部署体积、加快加载速度。

使用 Ghostscript 的 /ebook 质量预设（150 dpi，适合屏幕阅读）。
压缩结果缓存在 .cache/compressed_pdfs/（与 docs/ 相同的目录结构），
源文件未变时直接复制缓存到 site/，避免每次构建都跑 Ghostscript。
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"
CACHE_DIR = ROOT / ".cache" / "compressed_pdfs"
HASH_FILE = ROOT / ".cache" / "pdf_hashes.json"

GS_ARGS = [
    "gs",
    "-sDEVICE=pdfwrite",
    "-dPDFSETTINGS=/ebook",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dCompressFonts=true",
    "-dDetectDuplicateImages=true",
]


def human_size(nbytes: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if nbytes < 1000:
            return f"{nbytes:.1f} {unit}"
        nbytes /= 1000
    return f"{nbytes:.1f} TB"


def sha256_hex(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def load_hashes() -> dict[str, str]:
    if HASH_FILE.is_file():
        try:
            return json.loads(HASH_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, ValueError):
            return {}
    return {}


def save_hashes(hashes: dict[str, str]) -> None:
    HASH_FILE.parent.mkdir(parents=True, exist_ok=True)
    HASH_FILE.write_text(json.dumps(hashes, ensure_ascii=False, indent=2), encoding="utf-8")


def run_gs(src: Path, dst: Path) -> bool:
    """运行 Ghostscript，成功返回 True。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    tmp = dst.with_suffix(".tmp.pdf")
    result = subprocess.run(
        [*GS_ARGS, f"-sOutputFile={tmp}", str(src)],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"  [警告] Ghostscript 失败: {result.stderr.strip()}", file=sys.stderr)
        tmp.unlink(missing_ok=True)
        return False
    tmp.replace(dst)
    return True


def main() -> None:
    # 1. 收集 docs/ 下所有 PDF，key = 相对路径
    doc_pdfs = {p.relative_to(DOCS): p for p in sorted(DOCS.rglob("*.pdf"))}
    if not doc_pdfs:
        print("docs/ 中没有找到 PDF 文件")
        return

    hashes = load_hashes()
    gs_runs = 0
    total_before = 0
    total_after = 0

    # 2. 逐文件检查：源文件变了就重新压缩到 .cache/
    for rel, src in doc_pdfs.items():
        cur_hash = sha256_hex(src)
        cached_pdf = CACHE_DIR / rel

        if hashes.get(str(rel)) == cur_hash:
            # 缓存有效（压缩版或之前已确认不可压缩）
            continue

        print(f"压缩: {rel} ...", end=" ")
        sys.stdout.flush()
        before = src.stat().st_size

        if not run_gs(src, cached_pdf):
            # Ghostscript failed — don't cache anything; save hash so we
            # skip retrying on future deploys and copy the original directly.
            print(f"{human_size(before)}，Ghostscript 失败，保留原文件")
            after = before
        else:
            after = cached_pdf.stat().st_size
            if after >= before:
                # Already optimal — don't keep the larger file in cache.
                cached_pdf.unlink(missing_ok=True)
                after = before
                print(f"{human_size(before)}，已是最优，保留原文件")
            else:
                pct = (1 - after / before) * 100
                print(f"{human_size(before)} → {human_size(after)}（减小 {pct:.0f}%）")

        hashes[str(rel)] = cur_hash
        total_before += before
        total_after += after
        gs_runs += 1

    # 清理：1) hash 中已删除 docs 的条目  2) cache 目录中 hash 没记录的孤儿文件  3) 空目录
    valid = {str(r) for r in doc_pdfs}
    # 删除过期的 hash 条目和对应缓存文件
    for s in set(hashes) - valid:
        del hashes[s]
        (CACHE_DIR / s).unlink(missing_ok=True)
    # 删除 .cache/compressed_pdfs/ 中存在但 hash 没记录的孤儿文件
    if CACHE_DIR.is_dir():
        for f in sorted(CACHE_DIR.rglob("*.pdf")):
            rel = str(f.relative_to(CACHE_DIR))
            if rel not in hashes:
                f.unlink(missing_ok=True)
        # 删除空目录（自底向上）
        for d in sorted(CACHE_DIR.rglob("*"), reverse=True):
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()

    save_hashes(hashes)

    if gs_runs == 0:
        print("所有 PDF 缓存有效，无需重新压缩")

    # 3. 将压缩结果复制到 site/ — 有缓存的用缓存，没有的（Ghostscript 失败/
    #    已最优）直接从 docs/ 复制原始文件。
    print("部署压缩 PDF 到 site/ ...", end=" ")
    sys.stdout.flush()
    copied = 0
    for rel in doc_pdfs:
        cached = CACHE_DIR / rel
        dest = SITE / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if cached.is_file():
            shutil.copy2(cached, dest)
        else:
            shutil.copy2(DOCS / rel, dest)
        copied += 1
    print(f"完成（{copied} 个文件）")

    if total_before:
        pct = (1 - total_after / total_before) * 100
        print(f"本次压缩: {human_size(total_before)} → {human_size(total_after)}（减小 {pct:.0f}%）")


if __name__ == "__main__":
    main()
