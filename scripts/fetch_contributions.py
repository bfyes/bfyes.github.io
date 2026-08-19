#!/usr/bin/env python3
"""构建期抓取 GitHub 贡献图数据并烘焙成静态 JSON。

数据来源：HTML 页面爬取
  https://github.com/users/<user>/contributions （无需认证）

浏览器无法跨域读取该来源，故在构建期预先爬取，前端直接读本地 JSON 文件。
解析逻辑与 docs/theme/js/home.js 的 parseHtml 保持一致（同一套正则）。

等级与总数由前端 home.js 的 packageCells 实时计算，Python 只负责传输原始 {date, count}。
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
UA = "Mozilla/5.0 (compatible; bfyes-site-builder)"

HTML_URL = f"https://github.com/users/{USER}/contributions"
MONTH_FULL = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11,
    "December": 12,
}


def _fetch_via_html() -> dict | None:
    """爬取 GitHub 贡献页 HTML，返回 dict 或 None。"""
    req = urllib.request.Request(HTML_URL, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            html = r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"[contributions] HTML 爬取失败：{e}", file=sys.stderr)
        return None

    # 解析总和
    total = 0
    tm = re.search(
        r'id="js-contribution-activity-description"[^>]*>\s*([0-9,]+)\s*contributions',
        html,
    )
    if tm:
        total = int(tm.group(1).replace(",", ""))

    # 解析日期格子
    cells: list[dict] = []
    for date, _ in re.findall(
        r'data-date="([^"]+)"[^>]*data-level="([0-4])"', html
    ):
        cells.append({"date": date, "count": None})

    # 解析 tooltip 数字
    tips: list[tuple[int, int, int]] = []
    for cnt_txt, month, day in re.findall(
        r">([0-9]+|No) contributions? on (\w+) (\d+)\w{2}\.?</", html
    ):
        m_num = MONTH_FULL.get(month)
        if m_num is None:
            continue
        tips.append((m_num, int(day), 0 if cnt_txt == "No" else int(cnt_txt)))

    # 按 (month, day) 分组，按出现顺序消费（跨年窗口）
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
    return {"user": USER, "totalContributions": total, "contributions": cells}


# ---------- 主函数 ----------


def main() -> int:
    data = _fetch_via_html()

    if not data:
        print(f"[contributions] 数据源失败", file=sys.stderr)
        if OUT.exists():
            print(f"[contributions] 保留旧数据 {OUT}", file=sys.stderr)
            return 0
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    total = sum(c["count"] for c in data["contributions"])
    print(
        f"[contributions] 写入 {OUT.relative_to(ROOT)}："
        f"{total} 次贡献，{len(data['contributions'])} 天",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())