#!/usr/bin/env python3
"""构建期抓取 GitHub 贡献图数据并烘焙成静态 JSON。

GitHub 的贡献页 (https://github.com/users/<user>/contributions) 不开放 CORS，
浏览器无法跨域抓取，因此在构建期用服务端请求抓取原始 {date, count} 格子写成
docs/theme/data/contributions.json，前端运行时直接读本地文件。

等级与总数由前端 home.js 的 packageCells 实时计算，Python 只负责传输原始数据。
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "theme" / "data" / "contributions.json"
USER = "bfyes"
URL = f"https://github.com/users/{USER}/contributions"
UA = "Mozilla/5.0 (compatible; bfyes-site-builder)"

MONTH_FULL = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11,
    "December": 12,
}
# 等级计算已在 JS 端（home.js packageCells）统一处理，Python 不参与。


def fetch() -> str:
    req = urllib.request.Request(URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=8) as r:
        return r.read().decode("utf-8", errors="replace")


def parse(html: str) -> list:
    """解析贡献页 HTML，返回原始 {date, count} 格子列表。
    不计等级、不计总数——等级与总数由前端 runtime home.js 的 packageCells 统一计算。"""
    cells: list[dict] = []
    for date, _ in re.findall(
        r'data-date="([^"]+)"[^>]*data-level="([0-4])"', html
    ):
        cells.append({"date": date, "count": None})

    tips: list[tuple[int, int, int]] = []  # (month, day, count)
    for cnt_txt, month, day in re.findall(
        r">([0-9]+|No) contributions? on (\w+) (\d+)\w{2}\.?<", html
    ):
        m_num = MONTH_FULL.get(month)
        if m_num is None:
            continue
        tips.append((m_num, int(day), 0 if cnt_txt == "No" else int(cnt_txt)))

    # 同一 (month, day) 在跨年窗口里可能出现两次（窗口跨年）。按出现顺序逐个消费。
    pending: dict[tuple[int, int], list[int]] = {}
    for m_num, day, cnt in tips:
        pending.setdefault((m_num, day), []).append(cnt)

    for c in cells:
        d = datetime.strptime(c["date"], "%Y-%m-%d")
        queue = pending.get((d.month, d.day))
        if queue:
            c["count"] = queue.pop(0)
        else:
            c["count"] = 0

    cells.sort(key=lambda c: c["date"])
    return cells


def main() -> int:
    try:
        html = fetch()
    except Exception as e:  # noqa: BLE001
        print(f"[contributions] 抓取失败：{e}", file=sys.stderr)
        if OUT.exists():
            print(f"[contributions] 保留旧数据 {OUT}", file=sys.stderr)
            return 0
        return 1

    cells = parse(html)
    data = {"user": USER, "contributions": cells}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    total = sum(c["count"] for c in cells)
    print(
        f"[contributions] 写入 {OUT.relative_to(ROOT)}："
        f"{total} 次贡献，{len(cells)} 天",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
