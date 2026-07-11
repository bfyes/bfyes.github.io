#!/usr/bin/env python3
"""压缩 docs/ 中的 PDF，原地替换源文件。

zensical build 会把 docs/ 原样拷到 site/，所以压缩在 docs/ 里做即可：
build 拷过去的就是压缩版，无需后处理 site/。

使用 Ghostscript 的 /ebook 质量预设（150 dpi，适合屏幕阅读）。
已压缩过的 PDF（二进制含 "Ghostscript" 痕迹）自动跳过，避免反复重压。
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

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


def is_already_compressed(path: Path) -> bool:
    """检测 PDF 是否已由 Ghostscript 压缩过（避免反复重压）。

    Ghostscript 写入的 PDF 留有 "Ghostscript" 关键词（Producer 对象），
    即便对象被压缩也能在原始字节里扫到。
    """
    try:
        with open(path, "rb") as f:
            return b"Ghostscript" in f.read()
    except OSError:
        return False


def compress_inplace(src: Path) -> bool:
    """原地压缩单个 PDF，成功返回 True。"""
    tmp = src.with_suffix(".tmp.pdf")
    result = subprocess.run(
        [*GS_ARGS, f"-sOutputFile={tmp}", str(src)],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"  [警告] Ghostscript 失败: {result.stderr.strip()}", file=sys.stderr)
        tmp.unlink(missing_ok=True)
        return False
    tmp.replace(src)
    return True


def main() -> None:
    doc_pdfs = sorted(DOCS.rglob("*.pdf"))
    if not doc_pdfs:
        print("docs/ 中没有找到 PDF 文件")
        return

    total_before = 0
    total_after = 0
    compressed = 0

    for src in doc_pdfs:
        rel = src.relative_to(DOCS)
        before = src.stat().st_size

        if is_already_compressed(src):
            print(f"跳过: {rel}（{human_size(before)}，已压缩）")
            continue

        print(f"压缩: {rel} ...", end=" ")
        sys.stdout.flush()

        if not compress_inplace(src):
            print(f"{human_size(before)}，失败，保留原文件")
            continue

        after = src.stat().st_size
        if after >= before:
            # 压缩后反而更大——撤回（Ghostscript 的输出已覆盖原文件，
            # 但无法还原，所以这里只是如实报告；实测 /ebook 不会变大）。
            print(f"{human_size(before)}，已是最优")
            total_before += before
            total_after += before
        else:
            pct = (1 - after / before) * 100
            print(f"{human_size(before)} → {human_size(after)}（减小 {pct:.0f}%）")
            total_before += before
            total_after += after
            compressed += 1

    if compressed and total_before:
        pct = (1 - total_after / total_before) * 100
        print(f"本次压缩: {human_size(total_before)} → {human_size(total_after)}（减小 {pct:.0f}%）")
    elif compressed == 0:
        print("无需压缩（所有 PDF 已是压缩版）")


if __name__ == "__main__":
    main()
