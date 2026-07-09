/**
 * github-calendar.js
 *
 * 渲染 GitHub 贡献热力图。数据来自构建期烘焙的静态 JSON
 * (theme/contributions.json)，由 scripts/fetch_contributions.py 从
 * https://github.com/users/<user>/contributions 解析得到——与 GitHub 页面
 * "N contributions in the last year" 完全同源、同口径。
 *
 * 为什么是静态 JSON 而非运行时 API：GitHub 贡献页不开放 CORS，浏览器无法跨域
 * 抓取；第三方代理 API 数据口径偶有出入。构建期烘焙最稳，每次部署即刷新。
 *
 * 配色与版式严格对齐 GitHub（见 main.css 的 .ghc-L0..L4）。
 */
(function () {
  "use strict";

  var DATA_URL = "theme/contributions.json";

  var CELL = 11;
  var GAP = 3;
  var STEP = CELL + GAP;
  var RADIUS = 2;
  var PAD_LEFT = 40;   // 左侧星期标签（含与格子的间距）
  var PAD_TOP = 26;    // 顶部月份标签（含与格子的间距）
  var PAD_RIGHT = 4;
  var PAD_BOTTOM = 4;

  var WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs, text) {
    var node = document.createElementNS(NS, name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function levelClass(level) {
    return "ghc-L" + level;
  }

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00Z");
    var y = d.getUTCFullYear();
    var m = d.getUTCMonth() + 1;
    var day = d.getUTCDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }

  /** 把扁平的 day 列表按 GitHub 的列优先排布：每周一列，最上层可能是周日。 */
  function toWeeks(days) {
    if (!days.length) return [];
    var first = new Date(days[0].date + "T00:00:00Z");
    // GitHub 窗口起点是某周日；对齐到周日作为第一列第一行。
    var firstDow = first.getUTCDay(); // 0=Sun..6=Sat
    var weeks = [];
    var cur = [];
    // 前置空格补齐到周日（数据通常已对齐，这里兜底）
    for (var p = 0; p < firstDow; p++) cur.push(null);
    for (var i = 0; i < days.length; i++) {
      cur.push(days[i]);
      if (cur.length === 7) {
        weeks.push(cur);
        cur = [];
      }
    }
    if (cur.length) weeks.push(cur);
    return weeks;
  }

  function render(container, data) {
    var weeks = toWeeks(data.contributions || []);
    var total = data.totalContributions || 0;
    var cols = weeks.length;
    var innerW = cols * STEP;
    var width = PAD_LEFT + innerW + PAD_RIGHT;
    var height = PAD_TOP + 7 * STEP + PAD_BOTTOM;

    var svg = el("svg", {
      class: "github-contribution-chart",
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-label": (data.user || "GitHub") + " 的 GitHub 贡献图，共 " + total + " 次贡献",
    });

    // 月份标签：每个完整新月所在列起首画一次
    var lastMonth = -1;
    for (var w = 0; w < weeks.length; w++) {
      var firstDay = weeks[w][0];
      if (!firstDay) {
        // 列首是 null（对齐补齐），看列内第一个真实日
        for (var r = 0; r < 7 && !firstDay; r++) firstDay = weeks[w][r];
      }
      if (!firstDay) continue;
      var d = new Date(firstDay.date + "T00:00:00Z");
      var m = d.getUTCMonth();
      if (m !== lastMonth) {
        svg.appendChild(el("text", {
          class: "ghc-month",
          x: PAD_LEFT + w * STEP,
          y: PAD_TOP - 8,
        }, MONTHS[m]));
        lastMonth = m;
      }
    }

    // 星期标签（每偶数行）
    for (var rr = 0; rr < 7; rr++) {
      if (WEEKDAYS[rr]) {
        svg.appendChild(el("text", {
          class: "ghc-weekday",
          x: 0,
          y: PAD_TOP + rr * STEP + 9,
        }, WEEKDAYS[rr]));
      }
    }

    // 格子 + <title>（hover 提示，文案与 GitHub 一致）
    for (var wi = 0; wi < weeks.length; wi++) {
      var week = weeks[wi];
      for (var di = 0; di < week.length; di++) {
        var day = week[di];
        if (!day) continue;
        var rect = el("rect", {
          class: "ghc-cell " + levelClass(day.level),
          x: PAD_LEFT + wi * STEP,
          y: PAD_TOP + di * STEP,
          width: CELL,
          height: CELL,
          rx: RADIUS,
          ry: RADIUS,
        });
        var count = day.count;
        rect.appendChild(el("title", null,
          (count > 0 ? count + " 次" : "无") + "贡献 · " + fmtDate(day.date)));
        svg.appendChild(rect);
      }
    }

    container.innerHTML = "";
    container.appendChild(svg);

    // 图例 + 统计行
    var legend = el("div", { class: "ghc-legend" });
    var less = el("span", { class: "ghc-legend__label" }, "少");
    legend.appendChild(less);
    for (var lv = 0; lv <= 4; lv++) {
      legend.appendChild(el("span", { class: "ghc-legend__box " + levelClass(lv) }));
    }
    legend.appendChild(el("span", { class: "ghc-legend__label" }, "多"));
    var sum = el("span", { class: "ghc-summary" },
      total + " 次贡献 · 过去一年");
    legend.appendChild(sum);
    container.appendChild(legend);
  }

  function showError(container, msg) {
    container.innerHTML = '<div class="ghc-error">贡献图加载失败：' + msg + "</div>";
  }

  function init() {
    var container = document.querySelector(".github-calendar-wrap");
    if (!container) return;

    fetch(DATA_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        render(container, data);
      })
      .catch(function (err) {
        showError(container, err.message || "读取失败");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
