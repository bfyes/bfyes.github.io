(function () {
  "use strict";

  window.bfyes = window.bfyes || {};

  function pageRoot() {
    return document.querySelector(".md-content__inner") || document.querySelector(".md-content") || document.body;
  }

  function pageKey(root) {
    return location.pathname + location.search + "::" + (root ? root.textContent.length : 0);
  }

  var pageHandlers = [];
  var scheduled = false;
  var lastKey = "";
  var lastRoot = null;

  function onPageReady(fn) {
    pageHandlers.push(fn);
  }

  function schedulePageReady() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      var root = pageRoot();
      var key = pageKey(root);
      if (key === lastKey && root === lastRoot) return;
      lastKey = key;
      lastRoot = root;
      for (var i = 0; i < pageHandlers.length; i++) {
        try {
          pageHandlers[i](root);
        } catch (e) {
          console.error("[site]", e);
        }
      }
    }, 0);
  }

  function initPageLifecycle() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", schedulePageReady, { once: true });
    } else {
      schedulePageReady();
    }

    if (window.document$) {
      window.document$.subscribe(schedulePageReady);
    }
  }

  window.bfyes.onPageReady = onPageReady;

  // Images
  function previewUrl(src) {
    return src.replace(/\.(png|jpe?g)(\?|#|$)/i, ".preview.jpg$2");
  }

  function loadNextImage(items, i) {
    if (i >= items.length) return;
    var img = items[i];
    var fullSrc = img.dataset.fullsrc || img.src;
    if (!/\.(png|jpe?g)/i.test(fullSrc) || /\.preview\.jpg/i.test(fullSrc)) {
      loadNextImage(items, i + 1);
      return;
    }

    var pv = previewUrl(fullSrc);
    if (pv !== img.src) img.src = pv;

    var full = new Image();
    full.onload = function () {
      img.src = fullSrc;
      loadNextImage(items, i + 1);
    };
    full.onerror = function () {
      loadNextImage(items, i + 1);
    };
    full.src = fullSrc;
  }

  function upgradeImages(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll(".md-content img, img");
    var candidates = [];
    for (var i = 0; i < imgs.length; i++) {
      if (/\.(png|jpe?g)/i.test(imgs[i].src)) candidates.push(imgs[i]);
    }
    if (candidates.length) {
      setTimeout(function () {
        loadNextImage(candidates, 0);
      }, 500);
    }
  }

  // MathJax
  var mathRetry = 0;
  var mathJaxLoading = false;
  var mathJaxSources = [
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js",
    "https://unpkg.com/mathjax@3/es5/tex-mml-chtml.js"
  ];

  function loadMathJax(i) {
    if (mathJaxLoading || !mathJaxSources[i]) return;
    mathJaxLoading = true;

    var script = document.createElement("script");
    script.src = mathJaxSources[i];
    script.async = true;
    script.onload = function () {
      mathJaxLoading = false;
    };
    script.onerror = function () {
      mathJaxLoading = false;
      loadMathJax(i + 1);
    };
    document.head.appendChild(script);
  }

  function typesetMath(root) {
    if (!root) return;
    if (!root.querySelector(".arithmatex")) return;

    if (!window.MathJax || !MathJax.typesetPromise) {
      loadMathJax(0);
      if (mathRetry < 40) {
        mathRetry++;
        setTimeout(function () {
          typesetMath(root);
        }, 100);
      }
      return;
    }

    mathRetry = 0;
    try {
      if (MathJax.typesetClear) MathJax.typesetClear([root]);
      MathJax.typesetPromise([root]).catch(function (err) {
        console.error("[site] MathJax typeset failed:", err);
      });
    } catch (e) {
      console.error("[site] MathJax typeset failed:", e);
    }
  }

  // Home typewriter
  var typewriterTimers = [];
  var typewriterRun = 0;

  function rememberTimer(id) {
    typewriterTimers.push(id);
    return id;
  }

  function forgetTimer(id) {
    var i = typewriterTimers.indexOf(id);
    if (i >= 0) typewriterTimers.splice(i, 1);
  }

  function clearTypewriter() {
    typewriterRun++;
    for (var i = 0; i < typewriterTimers.length; i++) clearTimeout(typewriterTimers[i]);
    typewriterTimers = [];

    var cursors = document.querySelectorAll(".typed-cursor, .typed-cursor-standalone");
    for (var k = 0; k < cursors.length; k++) cursors[k].remove();

    var lines = document.querySelectorAll(".typed-text");
    for (var l = 0; l < lines.length; l++) {
      lines[l].textContent = "";
      lines[l].style.display = "none";
    }

    var promptLines = document.querySelectorAll(".home-terminal__line--prompt");
    for (var p = 0; p < promptLines.length; p++) promptLines[p].style.display = "none";

    var brs = document.querySelectorAll("[id^='typed-br-']");
    for (var b = 0; b < brs.length; b++) brs[b].style.display = "none";
  }

  function startHomeTypewriter(root) {
    clearTypewriter();

    var scope = root || document;
    var line1Host = scope.querySelector("#typed-line-1-host");
    var line1Separator = scope.querySelector("#typed-line-1-separator");
    var line1Prompt = scope.querySelector("#typed-line-1-prompt");
    var line1Command = scope.querySelector("#typed-line-1-command");
    var el2 = scope.querySelector("#typed-line-2");
    var el3 = scope.querySelector("#typed-line-3");
    var finalPrompt = scope.querySelector(".home-terminal__line--prompt");
    var finalCommand = scope.querySelector("#typed-line-4-command");
    if (!line1Host || !line1Separator || !line1Prompt || !line1Command || !el2 || !el3 || !finalPrompt || !finalCommand) return;

    var run = typewriterRun;

    function delay(ms, done) {
      var timer = rememberTimer(setTimeout(function () {
        forgetTimer(timer);
        if (run !== typewriterRun) return;
        done();
      }, ms));
    }

    function typeText(el, text, speed, done) {
      var i = 0;
      var cursor = document.createElement("span");
      cursor.className = "typed-cursor";
      cursor.textContent = "\u2588";
      el.insertAdjacentElement("afterend", cursor);
      el.style.display = "";

      function step() {
        if (run !== typewriterRun || !document.body.contains(el)) return;
        el.textContent = text.slice(0, i);
        if (i >= text.length) {
          if (done) done(cursor);
          return;
        }
        i++;
        var timer = rememberTimer(setTimeout(function () {
          forgetTimer(timer);
          step();
        }, speed));
      }

      step();
    }

    function showOutputLine(el, text, hold, done) {
      if (run !== typewriterRun || !document.body.contains(el)) return;
      el.textContent = text;
      el.style.display = "";
      var cursor = document.createElement("span");
      cursor.className = "typed-cursor";
      cursor.textContent = "\u2588";
      el.insertAdjacentElement("afterend", cursor);
      if (done) {
        delay(hold, function () {
          cursor.remove();
          done();
        });
      }
    }

    function showFinalPrompt() {
      if (run !== typewriterRun || !document.body.contains(finalPrompt)) return;
      finalPrompt.style.display = "";
      typeText(finalCommand, "welcome to bfyes", 74);
    }

    function start() {
      if (run !== typewriterRun || !document.body.contains(line1Host)) return;

      line1Host.textContent = "bfyes@ZJU";
      line1Separator.textContent = ":";
      line1Prompt.textContent = "~/site$ ";
      line1Host.style.display = "";
      line1Separator.style.display = "";
      line1Prompt.style.display = "";

      delay(260, function () {
        typeText(line1Command, "whoami", 92, function (cursor1) {
          delay(460, function () {
            cursor1.remove();
            showOutputLine(el2, "bfyes@ZJU", 640, function () {
              showOutputLine(el3, "flag{bfyes_1nf0rm4t10n_s3cur1ty_0x01_l0gg3d_1n}", 780, function () {
                delay(120, showFinalPrompt);
              });
            });
          });
        });
      });
    }

    start();
  }

  // GitHub calendar
  var CONTRIBUTIONS_URL = "theme/contributions.json";
  var FRIENDS_URL = "theme/friends.json";
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function htmlEl(name, attrs, text) {
    var node = document.createElement(name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function screenReader(text) {
    return htmlEl("span", { class: "sr-only" }, text);
  }

  function plural(count, one, many) {
    return count === 1 ? one : many;
  }

  function prettyDate(iso) {
    var d = new Date(iso + "T00:00:00Z");
    var day = d.getUTCDate();
    var suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    if (day % 10 === 2 && day !== 12) suffix = "nd";
    if (day % 10 === 3 && day !== 13) suffix = "rd";
    return MONTHS[d.getUTCMonth()] + " " + day + suffix;
  }

  function firstRealDay(week) {
    for (var i = 0; i < week.length; i++) {
      if (week[i]) return week[i];
    }
    return null;
  }

  function toWeeks(days) {
    if (!days.length) return [];
    var first = new Date(days[0].date + "T00:00:00Z");
    var weeks = [];
    var current = [];

    for (var pad = 0; pad < first.getUTCDay(); pad++) current.push(null);
    for (var i = 0; i < days.length; i++) {
      current.push(days[i]);
      if (current.length === 7) {
        weeks.push(current);
        current = [];
      }
    }
    if (current.length) {
      while (current.length < 7) current.push(null);
      weeks.push(current);
    }
    return weeks;
  }

  function monthCells(weeks) {
    var cells = [];
    var i = 0;

    while (i < weeks.length) {
      var day = firstRealDay(weeks[i]);
      if (!day) {
        cells.push({ month: "", colspan: 1 });
        i++;
        continue;
      }

      var month = new Date(day.date + "T00:00:00Z").getUTCMonth();
      var span = 1;
      while (i + span < weeks.length) {
        var next = firstRealDay(weeks[i + span]);
        if (!next || new Date(next.date + "T00:00:00Z").getUTCMonth() !== month) break;
        span++;
      }
      cells.push({ month: MONTH_SHORT[month], full: MONTHS[month], colspan: span });
      i += span;
    }

    if (cells.length > 1 && cells[0].month && cells[cells.length - 1].month === cells[0].month) {
      cells[cells.length - 1].month = "";
      cells[cells.length - 1].full = "";
    }
    return cells;
  }

  function renderGithubHeader(root, total) {
    var header = htmlEl("div", { class: "ghc-header" });
    header.appendChild(htmlEl("h2", { class: "ghc-title" },
      total + " " + plural(total, "contribution", "contributions") + " in the last year"));
    root.appendChild(header);
  }

  function renderGithubCalendar(root, data) {
    var weeks = toWeeks(data.contributions || []);
    var columnCount = weeks.length + 1;
    var tableWidth = 28 + weeks.length * 10 + (columnCount + 1) * 3;
    var table = htmlEl("table", {
      class: "ContributionCalendar-grid",
      role: "grid",
      "aria-readonly": "true",
      "aria-label": "Contribution Graph"
    });
    table.style.width = tableWidth + "px";
    table.appendChild(htmlEl("caption", { class: "sr-only" }, "Contribution Graph"));

    var colgroup = htmlEl("colgroup");
    colgroup.appendChild(htmlEl("col", { class: "ghc-weekday-col" }));
    for (var col = 0; col < weeks.length; col++) {
      colgroup.appendChild(htmlEl("col", { class: "ghc-week-col" }));
    }
    table.appendChild(colgroup);

    var thead = htmlEl("thead");
    var headRow = htmlEl("tr");
    var corner = htmlEl("td", { class: "ContributionCalendar-label ghc-corner" });
    corner.appendChild(screenReader("Day of Week"));
    headRow.appendChild(corner);

    monthCells(weeks).forEach(function (cell) {
      var td = htmlEl("td", {
        class: "ContributionCalendar-label",
        colspan: cell.colspan
      });
      if (cell.month) {
        td.appendChild(screenReader(cell.full));
        td.appendChild(htmlEl("span", { "aria-hidden": "true" }, cell.month));
      }
      headRow.appendChild(td);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = htmlEl("tbody");
    for (var dow = 0; dow < 7; dow++) {
      var row = htmlEl("tr");
      var label = htmlEl("td", { class: "ContributionCalendar-label ghc-day-label" });
      label.appendChild(screenReader(WEEKDAYS[dow]));
      if (dow % 2 === 1) {
        label.appendChild(htmlEl("span", { "aria-hidden": "true" }, WEEKDAY_SHORT[dow]));
      }
      row.appendChild(label);

      for (var w = 0; w < weeks.length; w++) {
        var day = weeks[w][dow];
        if (!day) {
          row.appendChild(htmlEl("td", { class: "ghc-empty-day" }));
          continue;
        }

        var count = day.count || 0;
        var cell = htmlEl("td", {
          tabindex: "0",
          "aria-selected": "false",
          "aria-label": (count ? count + " " + plural(count, "contribution", "contributions") : "No contributions") +
            " on " + prettyDate(day.date) + ".",
          "data-date": day.date,
          "data-level": String(day.level || 0),
          role: "gridcell",
          class: "ContributionCalendar-day"
        });
        cell.title = cell.getAttribute("aria-label");
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    var scroller = htmlEl("div", { class: "ghc-calendar-scroller" });
    scroller.appendChild(table);
    root.appendChild(scroller);
  }

  function renderGithubLegend(root) {
    var legend = htmlEl("div", { class: "ghc-footer" });
    legend.appendChild(htmlEl("a", {
      class: "ghc-help",
      href: "https://docs.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile"
    }, "Learn how we count contributions"));

    var scale = htmlEl("div", { class: "ghc-legend", "aria-hidden": "true" });
    scale.appendChild(htmlEl("span", null, "Less"));
    for (var i = 0; i <= 4; i++) {
      scale.appendChild(htmlEl("span", {
        class: "ContributionCalendar-day ghc-legend-day",
        "data-level": String(i)
      }));
    }
    scale.appendChild(htmlEl("span", null, "More"));
    legend.appendChild(scale);
    root.appendChild(legend);
  }

  function renderGithubOverview(root, data) {
    var overview = htmlEl("div", { class: "ghc-overview" });
    overview.appendChild(htmlEl("h3", { class: "ghc-overview-title" }, "Activity overview"));
    overview.appendChild(htmlEl("p", { class: "ghc-overview-text" },
      "Contributions are refreshed from GitHub during each site deployment."));
    overview.appendChild(htmlEl("p", { class: "ghc-overview-meta" },
      "Last fetched " + (data.fetchedAt || "recently") + "."));
    root.appendChild(overview);
  }

  function renderGithub(container, data) {
    var shell = htmlEl("section", { class: "ghc-shell", "aria-label": "GitHub contributions" });
    renderGithubHeader(shell, data.totalContributions || 0);
    renderGithubCalendar(shell, data);
    renderGithubLegend(shell);
    renderGithubOverview(shell, data);

    container.innerHTML = "";
    container.appendChild(shell);
    container.setAttribute("data-ghc-state", "ready");
  }

  function showGithubError(container, msg) {
    container.innerHTML = '<div class="ghc-error">GitHub contribution graph failed to load: ' + msg + "</div>";
    container.setAttribute("data-ghc-state", "error");
  }

  function initGithubCalendar(root) {
    var container = (root || document).querySelector(".github-calendar-wrap");
    if (!container) return;
    container.setAttribute("data-ghc-state", "loading");

    fetch(CONTRIBUTIONS_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        renderGithub(container, data);
      })
      .catch(function (err) {
        showGithubError(container, err.message || "read failed");
      });
  }

  // Friend links
  function friendInitials(name, github) {
    var source = (name || github || "?").trim();
    if (!source) return "?";
    if (/^[\u4e00-\u9fa5]/.test(source)) return source.slice(0, 1);
    var parts = source.split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2);
  }

  function friendUrl(friend) {
    if (friend.url) return friend.url;
    if (friend.github) return "https://github.com/" + encodeURIComponent(friend.github);
    return "#";
  }

  function renderFriends(container, friends) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < friends.length; i++) {
      var friend = friends[i];
      var link = htmlEl("a", {
        class: "home-friend",
        href: friendUrl(friend),
        target: "_blank",
        rel: "noopener"
      });

      var avatar = htmlEl("span", { class: "home-friend__avatar" }, friendInitials(friend.name, friend.github));
      var avatarSrc = friend.avatar || (friend.github ? "https://github.com/" + encodeURIComponent(friend.github) + ".png?size=96" : "");
      if (avatarSrc) {
        var previewSrc = friend.avatar && !/^https?:\/\//i.test(avatarSrc) ? previewUrl(avatarSrc) : avatarSrc;
        var img = htmlEl("img", {
          src: previewSrc,
          alt: "",
          loading: "lazy"
        });
        if (previewSrc !== avatarSrc) img.dataset.fullsrc = avatarSrc;
        img.onerror = function () {
          var fullSrc = this.dataset.fullsrc;
          if (fullSrc && this.getAttribute("src") !== fullSrc) {
            this.removeAttribute("data-fullsrc");
            this.src = fullSrc;
            return;
          }
          this.remove();
        };
        avatar.appendChild(img);
      }

      link.appendChild(avatar);
      link.appendChild(htmlEl("strong", null, friend.name || friend.github || "friend"));
      link.appendChild(htmlEl("span", { class: "home-friend__handle" }, friend.github ? "@" + friend.github : ""));
      if (friend.description) link.appendChild(htmlEl("span", { class: "home-friend__meta" }, friend.description));
      if (friend.location) link.appendChild(htmlEl("span", { class: "home-friend__meta" }, friend.location));
      frag.appendChild(link);
    }

    container.innerHTML = "";
    container.appendChild(frag);
    upgradeImages(container);
  }

  function initFriends(root) {
    var container = (root || document).querySelector(".home-link-grid");
    if (!container || container.dataset.friendsReady === "true") return;

    fetch(FRIENDS_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (friends) {
        renderFriends(container, friends || []);
        container.dataset.friendsReady = "true";
      })
      .catch(function () {
        container.innerHTML = '<div class="home-friend-loading">Links failed to load.</div>';
      });
  }

  // PDFs
  var PDF_SCRIPT_BASE = "https://unpkg.com/pdfjs-dist@4.0.379/build/";
  var PDF_RENDER_SCALE = 3;
  var pdfjsLib = null;
  var pdfjsLoading = false;
  var pdfjsQueue = [];
  var activePdfViewers = [];

  var SVG_SPINNER =
    '<svg class="pdf-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>' +
    '<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>' +
    "</svg>";
  var SVG_CHEVRON_LEFT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
  var SVG_CHEVRON_RIGHT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function getPDFJS(cb) {
    if (pdfjsLib) {
      cb(pdfjsLib);
      return;
    }
    pdfjsQueue.push(cb);
    if (pdfjsLoading) return;
    pdfjsLoading = true;

    import(PDF_SCRIPT_BASE + "pdf.min.mjs").then(function (mod) {
      pdfjsLib = mod;
      mod.GlobalWorkerOptions.workerSrc = PDF_SCRIPT_BASE + "pdf.worker.min.mjs";
      var q = pdfjsQueue;
      pdfjsQueue = [];
      for (var i = 0; i < q.length; i++) q[i](pdfjsLib);
    }).catch(function (err) {
      console.error("[site] PDF.js load failed:", err);
      pdfjsLoading = false;
      var q = pdfjsQueue;
      pdfjsQueue = [];
      for (var i = 0; i < q.length; i++) q[i](null);
    });
  }

  function buildPdfViewer(iframe) {
    var src = iframe.getAttribute("src");
    if (!src || !/\.pdf(\?.*)?(#.*)?$/i.test(src)) return null;

    var width = iframe.getAttribute("width") || "100%";
    var height = iframe.getAttribute("height") || "600px";
    var root = htmlEl("div", { class: "pdf-viewer" });
    root.style.width = width;
    root.style.maxWidth = "100%";

    var toolbar = htmlEl("div", { class: "pdf-viewer-toolbar" });
    toolbar.innerHTML =
      '<button class="pdf-viewer-btn pdf-prev" title="上一页" disabled>' + SVG_CHEVRON_LEFT + "</button>" +
      '<span class="pdf-viewer-page">- / -</span>' +
      '<button class="pdf-viewer-btn pdf-next" title="下一页" disabled>' + SVG_CHEVRON_RIGHT + "</button>" +
      '<span class="pdf-viewer-spacer"></span>' +
      '<a class="pdf-viewer-download" title="下载" href="' + src + '" download>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>' +
      '<line x1="12" y1="15" x2="12" y2="3"/></svg></a>';
    root.appendChild(toolbar);

    var canvasWrap = htmlEl("div", { class: "pdf-viewer-canvases" });
    var h = parseInt(height, 10);
    if (isNaN(h) || h <= 0) h = 500;
    h = Math.min(h, Math.round(window.innerHeight * 0.8));
    canvasWrap.style.height = h + "px";
    root.appendChild(canvasWrap);

    var overlay = htmlEl("div", { class: "pdf-loader-overlay" });
    overlay.innerHTML =
      SVG_SPINNER +
      '<div class="pdf-loader-text">准备加载 PDF...</div>' +
      '<div class="pdf-loader-bar-track"><div class="pdf-loader-bar-fill"></div></div>' +
      '<div class="pdf-loader-detail"></div>';
    root.appendChild(overlay);

    var errorBox = htmlEl("div", { class: "pdf-viewer-error" });
    errorBox.style.display = "none";
    root.appendChild(errorBox);

    root._src = src;
    root._overlay = overlay;
    root._barFill = overlay.querySelector(".pdf-loader-bar-fill");
    root._detail = overlay.querySelector(".pdf-loader-detail");
    root._text = overlay.querySelector(".pdf-loader-text");
    root._canvasWrap = canvasWrap;
    root._pageLabel = toolbar.querySelector(".pdf-viewer-page");
    root._prevBtn = toolbar.querySelector(".pdf-prev");
    root._nextBtn = toolbar.querySelector(".pdf-next");
    root._errorBox = errorBox;
    root._loaded = false;
    root._pdfDoc = null;
    root._pages = [];
    root._curPage = 0;
    root._totalPages = 0;
    return root;
  }

  function renderPdfPage(viewer, pageNum) {
    if (!viewer._pdfDoc) return;
    var entry = viewer._pages[pageNum];
    if (!entry || entry.rendered) return;
    entry.rendered = true;

    viewer._pdfDoc.getPage(pageNum + 1).then(function (page) {
      var viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
      var canvas = entry.canvas;
      var ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      page.render({ canvasContext: ctx, viewport: viewport });
    }).catch(function (err) {
      console.error("[site] PDF page render failed:", err);
    });
  }

  function scrollPdfToPage(viewer, pageNum) {
    if (pageNum < 0 || pageNum >= viewer._totalPages) return;
    viewer._curPage = pageNum;
    viewer._pageLabel.textContent = (pageNum + 1) + " / " + viewer._totalPages;
    viewer._prevBtn.disabled = pageNum === 0;
    viewer._nextBtn.disabled = pageNum === viewer._totalPages - 1;

    var entry = viewer._pages[pageNum];
    if (entry && entry.container) {
      viewer._canvasWrap.scrollTo({
        top: entry.container.offsetTop - viewer._canvasWrap.offsetTop - 4,
        behavior: "smooth"
      });
    }

    var start = Math.max(0, pageNum - 4);
    var end = Math.min(viewer._totalPages - 1, pageNum + 4);
    for (var i = start; i <= end; i++) renderPdfPage(viewer, i);
  }

  function setupPdfScrollTracking(viewer) {
    var wrap = viewer._canvasWrap;
    var ticking = false;
    wrap.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var containers = wrap.querySelectorAll(".pdf-viewer-page-wrap");
        var wrapRect = wrap.getBoundingClientRect();
        var best = 0;
        var bestDist = Infinity;

        for (var i = 0; i < containers.length; i++) {
          var rect = containers[i].getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          var dist = Math.abs(mid - (wrapRect.top + wrapRect.height / 2));
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        }
        if (best !== viewer._curPage) {
          viewer._curPage = best;
          viewer._pageLabel.textContent = (best + 1) + " / " + viewer._totalPages;
          viewer._prevBtn.disabled = best === 0;
          viewer._nextBtn.disabled = best === viewer._totalPages - 1;
        }
      });
    }, { passive: true });
  }

  function loadPdf(viewer) {
    if (viewer._loaded) return;
    viewer._loaded = true;
    viewer._text.textContent = "正在下载 PDF...";

    fetch(viewer._src)
      .then(function (resp) {
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        var total = resp.headers.get("Content-Length");
        total = total ? parseInt(total, 10) : 0;
        var reader = resp.body.getReader();
        var chunks = [];
        var received = 0;
        if (total > 0) viewer._detail.textContent = "0 / " + formatSize(total);

        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              var buffer = new Uint8Array(received);
              var pos = 0;
              for (var i = 0; i < chunks.length; i++) {
                buffer.set(chunks[i], pos);
                pos += chunks[i].length;
              }
              viewer._text.textContent = "正在解析 PDF...";
              viewer._barFill.style.width = "100%";
              viewer._detail.textContent = total > 0 ? formatSize(total) : formatSize(received);
              renderPdfWithPDFJS(viewer, buffer.buffer);
              return;
            }

            chunks.push(r.value);
            received += r.value.length;
            if (total > 0) {
              var pct = Math.min(100, Math.round((received / total) * 100));
              viewer._barFill.style.width = pct + "%";
              viewer._detail.textContent = formatSize(received) + " / " + formatSize(total);
              viewer._text.textContent = "正在下载 PDF... " + pct + "%";
            } else {
              viewer._detail.textContent = formatSize(received);
            }
            return pump();
          });
        }
        return pump();
      })
      .catch(function (err) {
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 加载失败: " + err.message;
        console.error("[site]", viewer._src, err);
      });
  }

  function renderPdfWithPDFJS(viewer, arrayBuffer) {
    getPDFJS(function (lib) {
      if (!lib) {
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 渲染引擎加载失败";
        return;
      }

      viewer._text.textContent = "正在渲染页面...";
      lib.getDocument({ data: arrayBuffer }).promise.then(function (doc) {
        viewer._pdfDoc = doc;
        viewer._totalPages = doc.numPages;
        viewer._pageLabel.textContent = "1 / " + doc.numPages;
        viewer._prevBtn.disabled = true;
        viewer._nextBtn.disabled = doc.numPages <= 1;

        var frag = document.createDocumentFragment();
        for (var i = 0; i < doc.numPages; i++) {
          var pageWrap = htmlEl("div", { class: "pdf-viewer-page-wrap" });
          var canvas = htmlEl("canvas", { class: "pdf-viewer-canvas" });
          pageWrap.appendChild(canvas);
          frag.appendChild(pageWrap);
          viewer._pages.push({ canvas: canvas, container: pageWrap, rendered: false });
        }
        viewer._canvasWrap.appendChild(frag);

        viewer._overlay.style.opacity = "0";
        setTimeout(function () {
          viewer._overlay.style.display = "none";
        }, 400);

        for (var j = 0; j < doc.numPages; j++) renderPdfPage(viewer, j);
        setupPdfScrollTracking(viewer);

        viewer._prevBtn.onclick = function () {
          scrollPdfToPage(viewer, viewer._curPage - 1);
        };
        viewer._nextBtn.onclick = function () {
          scrollPdfToPage(viewer, viewer._curPage + 1);
        };
        viewer._keyHandler = function (e) {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            scrollPdfToPage(viewer, viewer._curPage - 1);
          } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            scrollPdfToPage(viewer, viewer._curPage + 1);
          }
        };
        document.addEventListener("keydown", viewer._keyHandler);
        activePdfViewers.push(viewer);
      }).catch(function (err) {
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 解析失败: " + err.message;
        console.error("[site]", err);
      });
    });
  }

  function cleanupPdfViewers() {
    for (var i = 0; i < activePdfViewers.length; i++) {
      var viewer = activePdfViewers[i];
      if (viewer._keyHandler) document.removeEventListener("keydown", viewer._keyHandler);
    }
    activePdfViewers = [];
  }

  function scanAndLoadPdfs(root) {
    cleanupPdfViewers();
    var scope = root || document;
    var iframes = scope.querySelectorAll("iframe[src*='.pdf']");
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.parentNode && iframe.parentNode.classList.contains("pdf-viewer")) continue;
      var viewer = buildPdfViewer(iframe);
      if (!viewer) continue;
      iframe.parentNode.replaceChild(viewer, iframe);
      loadPdf(viewer);
    }
  }

  function syncHomePageState(root) {
    var scope = root || document;
    var isHome = !!scope.querySelector(".home-page");
    var hasRainbow = !!scope.querySelector(".rainbow-page");
    document.body.classList.toggle("bfyes-home-page", isHome);
    document.body.classList.toggle("bfyes-rainbow-page", hasRainbow);
  }

  // Background grid
  function initParallaxGrid() {
    var ratio = 0.1;
    var ticking = false;

    function update() {
      document.body.style.setProperty("--bfyes-grid-y", -(window.scrollY * ratio) + "px");
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  onPageReady(function (root) {
    syncHomePageState(root);
    startHomeTypewriter(root);
    typesetMath(root);
    upgradeImages(root);
    scanAndLoadPdfs(root);
    initFriends(root);
    initGithubCalendar(root);
  });

  initParallaxGrid();
  initPageLifecycle();
})();
