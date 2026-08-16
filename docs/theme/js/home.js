(function () {
  "use strict";

  window.site = window.site || {};
  var htmlEl = window.site.htmlEl;

  // ---- page state + parallax grid ----
  function syncPageState(root) {
    var scope = root || document;
    document.body.classList.toggle("home-active", !!scope.querySelector(".home-page"));
    document.body.classList.toggle("rainbow-active", !!scope.querySelector(".rainbow-page"));
  }

  function initParallaxGrid() {
    var ratio = 0.1, ticking = false;
    function update() {
      document.body.style.setProperty("--grid-y", -(window.scrollY * ratio) + "px");
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // ---- friends ----
  function githubAvatarUrl(github) {
    return github ? "https://avatars.githubusercontent.com/" + encodeURIComponent(github) + "?size=160" : "";
  }

  function friendInitials(name, github) {
    var source = (name || github || "?").trim();
    if (!source) return "?";
    if (/^[\u4e00-\u9fa5]/.test(source)) return source.slice(0, 1);
    var parts = source.split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2);
  }

  function buildAvatar(card, name, github) {
    var avatar = htmlEl("span", { class: "home-friend__avatar" }, friendInitials(name, github));
    var src = githubAvatarUrl(github);
    if (src) {
      var img = htmlEl("img", { src: src, alt: "", width: 96, height: 96 });
      img.onerror = function () { this.remove(); };
      avatar.appendChild(img);
    }
    card.insertBefore(avatar, card.firstChild);
  }

  function initFriends(root) {
    var grid = (root || document).querySelector(".home-link-grid");
    if (!grid || grid.dataset.friendsReady === "true") return;
    var cards = grid.querySelectorAll(".home-friend");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var github = card.getAttribute("data-id");
      var strong = card.querySelector("strong");
      var name = (strong ? strong.textContent : "") || github || "";
      card.setAttribute("target", "_blank");
      card.setAttribute("rel", "noopener");
      buildAvatar(card, name, github);
      if (github) {
        var handle = htmlEl("span", { class: "home-friend__handle" }, "@" + github);
        if (strong && strong.nextSibling) card.insertBefore(handle, strong.nextSibling);
        else card.appendChild(handle);
      }
      var desc = card.getAttribute("data-description");
      if (desc) card.appendChild(htmlEl("span", { class: "home-friend__meta" }, desc));
    }
    grid.dataset.friendsReady = "true";
  }

  // ---- github contributions ----
  var CONTRIBUTIONS_URL = "theme/data/contributions.json";
  var WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var WEEKDAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function screenReader(text) { return htmlEl("span", { class: "sr-only" }, text); }
  function plural(n, one, many) { return n === 1 ? one : many; }

  function prettyDate(iso) {
    var d = new Date(iso + "T00:00:00Z"), day = d.getUTCDate(), suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    return MONTHS[d.getUTCMonth()] + " " + day + suffix;
  }

  function firstRealDay(week) {
    for (var i = 0; i < week.length; i++) if (week[i]) return week[i];
    return null;
  }

  function toWeeks(days) {
    if (!days.length) return [];
    var first = new Date(days[0].date + "T00:00:00Z"), weeks = [], current = [];
    for (var pad = 0; pad < first.getUTCDay(); pad++) current.push(null);
    for (var i = 0; i < days.length; i++) {
      current.push(days[i]);
      if (current.length === 7) { weeks.push(current); current = []; }
    }
    if (current.length) { while (current.length < 7) current.push(null); weeks.push(current); }
    return weeks;
  }

  function monthCells(weeks) {
    var cells = [], i = 0;
    while (i < weeks.length) {
      var day = firstRealDay(weeks[i]);
      if (!day) { cells.push({ month: "", colspan: 1 }); i++; continue; }
      var month = new Date(day.date + "T00:00:00Z").getUTCMonth(), span = 1;
      while (i + span < weeks.length) {
        var next = firstRealDay(weeks[i + span]);
        if (!next || new Date(next.date + "T00:00:00Z").getUTCMonth() !== month) break;
        span++;
      }
      cells.push({ month: MONTH_SHORT[month], full: MONTHS[month], colspan: span });
      i += span;
    }
    return cells;
  }

  function renderGithubHeader(root, total) {
    var h = htmlEl("div", { class: "ghc-header" });
    h.appendChild(htmlEl("h2", { class: "ghc-title" }, total + " " + plural(total, "contribution", "contributions") + " in the last year"));
    root.appendChild(h);
  }

  function renderGithubCalendar(root, data) {
    var weeks = toWeeks(data.contributions || []);
    var tableWidth = 28 + weeks.length * 10 + (weeks.length + 2) * 3;
    var table = htmlEl("table", { class: "ContributionCalendar-grid", role: "grid", "aria-readonly": "true", "aria-label": "Contribution Graph" });
    table.style.width = tableWidth + "px";
    table.appendChild(htmlEl("caption", { class: "sr-only" }, "Contribution Graph"));

    var colgroup = htmlEl("colgroup");
    colgroup.appendChild(htmlEl("col", { class: "ghc-weekday-col" }));
    for (var col = 0; col < weeks.length; col++) colgroup.appendChild(htmlEl("col", { class: "ghc-week-col" }));
    table.appendChild(colgroup);

    var thead = htmlEl("thead"), headRow = htmlEl("tr");
    var corner = htmlEl("td", { class: "ContributionCalendar-label ghc-corner" });
    corner.appendChild(screenReader("Day of Week"));
    headRow.appendChild(corner);

    monthCells(weeks).forEach(function (cell) {
      var td = htmlEl("td", { class: "ContributionCalendar-label", colspan: cell.colspan });
      if (cell.month) {
        td.appendChild(screenReader(cell.full));
        td.appendChild(htmlEl("span", { "aria-hidden": "true", style: "position: absolute; top: 0" }, cell.month));
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
      if (dow % 2 === 1) label.appendChild(htmlEl("span", { "aria-hidden": "true" }, WEEKDAY_SHORT[dow]));
      row.appendChild(label);
      for (var w = 0; w < weeks.length; w++) {
        var day = weeks[w][dow];
        if (!day) { row.appendChild(htmlEl("td", { class: "ghc-empty-day" })); continue; }
        var count = day.count || 0;
        var cell = htmlEl("td", {
          tabindex: "0", "aria-selected": "false",
          "aria-label": (count ? count + " " + plural(count, "contribution", "contributions") : "No contributions") + " on " + prettyDate(day.date) + ".",
          "data-date": day.date, "data-level": String(day.level || 0),
          role: "gridcell", class: "ContributionCalendar-day"
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
    legend.appendChild(htmlEl("a", { class: "ghc-help", href: "https://docs.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile" }, "Learn how we count contributions"));
    var scale = htmlEl("div", { class: "ghc-legend", "aria-hidden": "true" });
    scale.appendChild(htmlEl("span", null, "Less"));
    for (var i = 0; i <= 4; i++) scale.appendChild(htmlEl("span", { class: "ContributionCalendar-day ghc-legend-day", "data-level": String(i) }));
    scale.appendChild(htmlEl("span", null, "More"));
    legend.appendChild(scale);
    root.appendChild(legend);
  }

  function initGithubCalendar(root) {
    var container = (root || document).querySelector(".github-calendar-wrap");
    if (!container) return;
    container.setAttribute("data-ghc-state", "loading");
    fetch(CONTRIBUTIONS_URL, { cache: "no-store" })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
      .then(function (data) {
        var shell = htmlEl("section", { class: "ghc-shell", "aria-label": "GitHub contributions" });
        renderGithubHeader(shell, data.totalContributions || 0);
        renderGithubCalendar(shell, data);
        renderGithubLegend(shell);
        container.innerHTML = "";
        container.appendChild(shell);
        container.setAttribute("data-ghc-state", "ready");
      })
      .catch(function (err) {
        container.innerHTML = '<div class="ghc-error">GitHub contribution graph failed to load: ' + (err.message || "read failed") + "</div>";
        container.setAttribute("data-ghc-state", "error");
      });
  }

  // ---- terminal typewriter ----
  var typewriterTimers = [], typewriterRun = 0;

  function rememberTimer(id) { typewriterTimers.push(id); return id; }
  function forgetTimer(id) { var i = typewriterTimers.indexOf(id); if (i >= 0) typewriterTimers.splice(i, 1); }
  function makeCursor() { return htmlEl("span", { class: "typed-cursor" }, "\u2588"); }

  function clearTypewriter() {
    typewriterRun++;
    typewriterTimers.forEach(clearTimeout);
    typewriterTimers = [];
    document.querySelectorAll(".typed-cursor, .typed-cursor-standalone").forEach(function (e) { e.remove(); });
    document.querySelectorAll(".typed-text").forEach(function (e) { e.textContent = ""; e.style.display = "none"; });
    document.querySelectorAll(".home-terminal__line--prompt, .terminal-hidden-input, .home-terminal-keys, [id^='typed-br-']").forEach(function (e) { e.style.display = "none"; });
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
    if (!line1Host || !line1Command || !el2 || !el3 || !finalPrompt || !finalCommand) return;

    var run = typewriterRun;
    function delay(ms, done) {
      var timer = rememberTimer(setTimeout(function () { forgetTimer(timer); if (run === typewriterRun) done(); }, ms));
    }
    function typeText(el, text, speed, done, cursor) {
      var i = 0;
      if (!cursor) { cursor = makeCursor(); el.insertAdjacentElement("afterend", cursor); }
      el.style.display = "";
      function step() {
        if (run !== typewriterRun || !document.body.contains(el)) return;
        el.textContent = text.slice(0, i);
        if (i >= text.length) { if (done) done(cursor); return; }
        i++;
        var timer = rememberTimer(setTimeout(function () { forgetTimer(timer); step(); }, speed));
      }
      step();
    }
    function showOutputLine(el, text, hold, done, showCursor) {
      if (run !== typewriterRun || !document.body.contains(el)) return;
      el.textContent = text; el.style.display = "";
      if (showCursor !== false) { var c = makeCursor(); el.insertAdjacentElement("afterend", c); }
      if (done) delay(hold, function () { if (showCursor !== false) c.remove(); done(); });
    }

    var HOME_SECTIONS = [
      { id: 1, name: "study", label: "学习", path: "/study/" },
      { id: 2, name: "tools", label: "工具", path: "/tools/" },
      { id: 3, name: "diaries", label: "随笔", path: "/diaries/" },
      { id: 4, name: "games", label: "游戏", path: "/games/" }
    ];
    var terminalScreen = scope.querySelector(".home-terminal__screen");
    var currentCmd = null, hiddenInput = null;

    function addOutput(text) {
      if (!terminalScreen) return;
      var line = htmlEl("div", { class: "home-terminal__line home-terminal__line--output" });
      line.appendChild(htmlEl("span", { class: "typed-text" }, text));
      terminalScreen.appendChild(line);
    }
    function removeCurrentCursor() {
      if (currentCmd && currentCmd.nextSibling && currentCmd.nextSibling.classList && currentCmd.nextSibling.classList.contains("typed-cursor")) currentCmd.nextSibling.remove();
    }
    function addSectionLinks() {
      if (!terminalScreen) return;
      var line = htmlEl("div", { class: "home-terminal__line home-terminal__line--output" });
      var keys = htmlEl("span", { class: "home-terminal-keys", role: "group", "aria-label": "快速跳转数字链接" });
      for (var i = 0; i < HOME_SECTIONS.length; i++) {
        var s = HOME_SECTIONS[i];
        keys.appendChild(htmlEl("a", { href: s.path, class: "home-terminal-link", "data-goto": String(s.id) }, s.id + ":" + s.label));
      }
      line.appendChild(keys); terminalScreen.appendChild(line);
    }
    function spawnPrompt(dir) {
      removeCurrentCursor();
      var line = htmlEl("div", { class: "home-terminal__line home-terminal__line--prompt" });
      line.appendChild(htmlEl("span", { class: "typed-text--host" }, "bfyes@ZJU"));
      line.appendChild(htmlEl("span", { class: "typed-text--separator" }, ":"));
      line.appendChild(htmlEl("span", { class: "typed-text--prompt" }, dir ? "~/site/" + dir + "$ " : "~/site$ "));
      var cmd = htmlEl("span", { class: "typed-text typed-text--command" });
      line.appendChild(cmd);
      if (terminalScreen) terminalScreen.appendChild(line);
      var cursor = makeCursor();
      cmd.insertAdjacentElement("afterend", cursor);
      currentCmd = cmd; return cmd;
    }
    function gotoSection(sec) {
      if (currentCmd && document.body.contains(currentCmd)) currentCmd.textContent = "cd ~/site/" + sec.name;
      removeCurrentCursor(); spawnPrompt(sec.name);
      delay(900, function () { if (run === typewriterRun) window.location.href = sec.path; });
    }
    function executeCommand(raw) {
      var text = raw.trim();
      if (text === "") { spawnPrompt(); return; }
      if (text === "ls") { addSectionLinks(); spawnPrompt(); return; }
      if (text === "help" || text === "?") { addOutput("输入编号进入对应页面 (移动端可点击)"); addSectionLinks(); spawnPrompt(); return; }
      var num = parseInt(text, 10);
      if (num >= 1 && num <= HOME_SECTIONS.length) { gotoSection(HOME_SECTIONS[num - 1]); return; }
      var cdMatch = text.match(/^cd(?:\s+(.+))?$/);
      if (cdMatch) {
        var target = cdMatch[1] ? cdMatch[1].trim() : "";
        if (!target) { addOutput("当前目录 ~/site"); removeCurrentCursor(); spawnPrompt(); return; }
        var norm = target.replace(/^~\/site\/?/, "").replace(/^~\/?/, "").replace(/^\//, "").replace(/\/+$/, "");
        for (var i = 0; i < HOME_SECTIONS.length; i++) { if (HOME_SECTIONS[i].name === norm || String(HOME_SECTIONS[i].id) === norm) { gotoSection(HOME_SECTIONS[i]); return; } }
        addOutput("cd: no such directory: " + target);
        addOutput(HOME_SECTIONS.map(function (s) { return s.id + ":" + s.name; }).join("  "));
        spawnPrompt(); return;
      }
      addOutput("command not found: " + text); addOutput("try \"ls\""); spawnPrompt();
    }
    function focusTerminal() {
      if (!hiddenInput || !document.body.contains(hiddenInput)) return;
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
      hiddenInput.focus();
    }
    function setupTerminalInput() {
      if (!terminalScreen || hiddenInput) return;
      hiddenInput = htmlEl("input", { class: "terminal-hidden-input", autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", "aria-label": "terminal input" });
      terminalScreen.appendChild(hiddenInput);
      terminalScreen.addEventListener("click", focusTerminal);
      hiddenInput.addEventListener("keydown", function (e) {
        if (!currentCmd || !document.body.contains(currentCmd)) return;
        if (e.key === "Enter") { e.preventDefault(); executeCommand(currentCmd.textContent); return; }
        if (e.key === "Backspace") { e.preventDefault(); currentCmd.textContent = currentCmd.textContent.slice(0, -1); return; }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) currentCmd.textContent += e.key;
      });
      requestAnimationFrame(focusTerminal);
    }
    function showFinalPrompt() {
      if (run !== typewriterRun || !document.body.contains(finalPrompt)) return;
      finalPrompt.style.display = "";
      var fc = makeCursor();
      finalCommand.insertAdjacentElement("afterend", fc);
      delay(120, function () {
        typeText(finalCommand, "welcome to bfyes", 20, function (dc) {
          delay(100, function () { dc.remove(); addOutput("输入编号进入对应页面 (移动端可点击)"); addSectionLinks(); spawnPrompt(); setupTerminalInput(); });
        }, fc);
      });
    }
    function bindTerminalKeys() {
      if (document.__keysBound) return;
      document.__keysBound = true;
      document.addEventListener("click", function (e) {
        var link = e.target && e.target.closest ? e.target.closest(".home-terminal-link") : null;
        if (!link) return;
        e.preventDefault();
        var num = parseInt(link.getAttribute("data-goto"), 10);
        if (currentCmd && document.body.contains(currentCmd)) currentCmd.textContent = String(num);
        executeCommand(String(num)); focusTerminal();
      });
    }

    bindTerminalKeys();
    line1Host.textContent = "bfyes@ZJU"; line1Separator.textContent = ":"; line1Prompt.textContent = "~/site$ ";
    line1Host.style.display = ""; line1Separator.style.display = ""; line1Prompt.style.display = "";
    var lc = makeCursor();
    line1Command.insertAdjacentElement("afterend", lc);
    delay(100, function () {
      typeText(line1Command, "whoami", 62, function (c1) {
        delay(180, function () {
          c1.remove();
          showOutputLine(el2, "bfyes@ZJU", 10, function () {
            showOutputLine(el3, "flag{1nforMati0n_$3cUrity_0x86_l0gg3d_1n}", 10, function () {}, false);
            delay(10, showFinalPrompt);
          }, false);
        });
      }, lc);
    });
  }

  // ---- init ----
  window.site.onPageReady(syncPageState);
  window.site.onPageReady(initFriends);
  window.site.onPageReady(initGithubCalendar);
  window.site.onPageReady(startHomeTypewriter);
  initParallaxGrid();
})();
