#!/usr/bin/env python3
"""构建期抓取 GitHub 贡献图数据并烘焙成静态 JSON。

GitHub 的贡献页 (https://github.com/users/<user>/contributions) 不开放 CORS，
浏览器无法跨域抓取，因此在构建期用服务端请求把每个格子的 {date, level, count}
解析出来，写成 docs/theme/data/contributions.json，前端运行时直接读本地文件。

数据来源与 GitHub 页面完全一致（同一份 HTML），故与 GitHub 页面显示的
"N contributions in the last year" 完全对齐。
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
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
# data-level 0..4；count 缺失时的兜底（仅影响 tooltip 数字，不影响颜色分级）。
LEVEL_FALLBACK = {0: 0, 1: 1, 2: 3, 3: 6, 4: 9}


def level_from_count(count: int, thresholds: tuple) -> int:
    """按贡献数和动态阈值计算 0..4 的色阶。

    GitHub 的 data-level 是基于全年最大贡献数动态划分的：
    level 1: 1 ~ max/4
    level 2: max/4+1 ~ max/2
    level 3: max/2+1 ~ 3*max/4
    level 4: 3*max/4+1 ~ max
    thresholds 是 (q1, q2, q3) 三个分界值。
    """
    if count <= 0:
        return 0
    if count <= thresholds[0]:
        return 1
    if count <= thresholds[1]:
        return 2
    if count <= thresholds[2]:
        return 3
    return 4


def compute_thresholds(cells: list) -> tuple:
    """从全年最大贡献数计算四等分阈值 (q1, q2, q3)。

    GitHub 按全年最大 count 的四等分划分 level 1-4。
    """
    max_count = max((c["count"] for c in cells if c["count"]), default=0)
    if max_count <= 0:
        return (1, 2, 4)
    q1 = max_count // 4
    q2 = max_count // 2
    q3 = 3 * max_count // 4
    # 确保阈值递增且至少差 1
    q2 = max(q2, q1 + 1) if q1 < q2 else q2
    q3 = max(q3, q2 + 1) if q2 < q3 else q3
    return (q1, q2, q3)


def fetch() -> str:
    req = urllib.request.Request(URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=8) as r:
        return r.read().decode("utf-8", errors="replace")


def parse(html: str) -> dict:
    # 总贡献数：<h2 ...>N\ncontributions\nin the last year</h2>
    total = 0
    m = re.search(
        r'id="js-contribution-activity-description"[^>]*>\s*([0-9,]+)\s*contributions',
        html,
    )
    if m:
        total = int(m.group(1).replace(",", ""))

    # 每个格子：<td ... data-date="YYYY-MM-DD" ... data-level="0..4" ...>
    # GitHub 当前结构里 td 不带 data-count，count 需从紧随其后的 tool-tip 取。
    cells: list[dict] = []
    # 按 td 出现顺序收集 (date, level)；同一份 HTML 里 td 顺序即日历顺序。
    for date, _gh_level in re.findall(
        r'data-date="([^"]+)"[^>]*data-level="([0-4])"', html
    ):
        # 不采用 GitHub 的 data-level（见 level_from_count 说明），最终 level
        # 在 count 确定后由 level_from_count(count) 计算，这里先占位。
        cells.append({"date": date, "level": 0, "count": None})

    # tool-tip 文本：「No contributions on September 21st.」「4 contributions on July 9th.」
    # 与 td 一一对应、且顺序一致。用 (月名, 日序数) 在 cells 里定位补 count。
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
        key = (d.month, d.day)
        queue = pending.get(key)
        if queue:
            c["count"] = queue.pop(0)

    # count 已全部就位（缺失的用 level 兜底），最终 level 按动态分位数计算。
    for c in cells:
        if c["count"] is None:
            c["count"] = LEVEL_FALLBACK.get(c["level"], 0)

    thresholds = compute_thresholds(cells)
    for c in cells:
        c["level"] = level_from_count(c["count"], thresholds)

    cells.sort(key=lambda c: c["date"])

    # 校准 total：以 count 之和为准（GitHub 头条偶尔与格子之和不符）。
    count_sum = sum(c["count"] for c in cells)
    if total != count_sum:
        total = count_sum

    dates = [c["date"] for c in cells] if cells else []
    return {
        "user": USER,
        "totalContributions": total,
        "from": min(dates) if dates else None,
        "to": max(dates) if dates else None,
        "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "contributions": cells,
    }


def main() -> int:
    try:
        html = fetch()
    except Exception as e:  # noqa: BLE001
        print(f"[contributions] 抓取失败：{e}", file=sys.stderr)
        if OUT.exists():
            print(f"[contributions] 保留旧数据 {OUT}", file=sys.stderr)
            return 0
        return 1

    data = parse(html)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(
        f"[contributions] 写入 {OUT.relative_to(ROOT)}："
        f"{data['totalContributions']} 次贡献，"
        f"{len(data['contributions'])} 天，"
        f"窗口 {data['from']} → {data['to']}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
