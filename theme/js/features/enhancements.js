(function () {
  "use strict";
  /* ============================================================================
     features/enhancements.js —— 站点增强
     ----------------------------------------------------------------------------
     LQIP、页面状态、TOC、Giscus、脚注修正，以及瞬时导航后的 tooltip 回收。
     ============================================================================ */
  // ---- LQIP：预览图 → 全分辨率 ------------------------------------------
  var LQIP_MAX_WAIT = 15000;

  // 所有渐进图片共用同一套收尾逻辑：至少让模糊占位绘制一帧，
  // 再移除 lqip 触发 CSS 的 blur → clear 过渡。15 秒是最长等待时间，
  // 避免网络失败时图片永久模糊。
  function revealLqip(img) {
    if (!img) return;
    if (img.dataset.lqipTimer) {
      clearTimeout(Number(img.dataset.lqipTimer));
      img.dataset.lqipTimer = "";
    }
    var frame = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    frame(function () {
      frame(function () { img.classList.remove("lqip"); });
    });
  }

  function scheduleLqipTimeout(img) {
    if (!img || img.dataset.lqipTimer) return;
    img.dataset.lqipTimer = String(setTimeout(function () {
      img.dataset.lqipTimer = "";
      revealLqip(img);
    }, LQIP_MAX_WAIT));
  }

  function initLqip(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img.lqip, img[data-fullsrc]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        scheduleLqipTimeout(img);
        if (img.hasAttribute("data-fullsrc")) return;
        img.addEventListener("load", function () { revealLqip(img); }, { once: true });
        img.addEventListener("error", function () { revealLqip(img); }, { once: true });
        if (img.complete) {
          if (img.naturalWidth > 0) revealLqip(img);
        }
      })(imgs[i]);
    }
  }

  function upgradeImages(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img[data-fullsrc]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        var fullSrc = img.getAttribute("data-fullsrc");
        if (!fullSrc) return;
        scheduleLqipTimeout(img);
        var full = new Image();
        full.onload = function () {
          img.src = fullSrc;
          revealLqip(img);
        };
        full.onerror = function () { revealLqip(img); };
        full.src = fullSrc;
      })(imgs[i]);
    }
  }
  // ---- 页面状态（全站功能）----
  function setPageState(name, value) {
    document.body.setAttribute("data-page-" + name, value ? "true" : "false");
  }

  function syncPageState(root) {
    var scope = root || document;
    setPageState("home", !!scope.querySelector(".home-page"));
    setPageState("rainbow", !!scope.querySelector(".rainbow-page"));
    setPageState("grid", !scope.querySelector('[data-page-grid="false"]'));
  }

  // ---- 右侧 TOC 逐条淡入 ----
  // 由 JS 按实际条数给每条链接注入递增的 animation-delay（inline style），
  // 替代 CSS 里手写的 nth-child 规则，任意条数都自适应、无需维护上限。
  // data-md-component="toc" 位于 <ul class="md-nav__list"> 上（即 TOC 容器本身）；
  // 页面里主侧边栏也存在同名标记，因此必须限定在 .md-sidebar--secondary 内。
  // querySelectorAll 返回深度优先文档序，父级标题在前、子级紧随，
  // 注入的序号即"视觉从上到下"的线性顺序，不受目录嵌套层级影响。
  function initTocFade(root) {
    var sidebar = document.querySelector(".md-sidebar--secondary");
    var toc = sidebar && sidebar.querySelector('[data-md-component="toc"]');
    if (!toc) return;
    var links = toc.querySelectorAll(".md-nav__link");
    toc.style.setProperty("--nav-count", String(links.length));
    for (var i = 0; i < links.length; i++) {
      links[i].style.animationDelay = (i * 100) + "ms";
    }
  }

  // ---- Giscus 评论区 ----
  // 通过 onPageReady 注册：首次加载 + instant 换页（document$）都会触发，
  // 覆盖 navigation.instant 的 SPA 切换，无需再单独订阅 document$。
  // 主题用 window.site.theme 总线同步；换页时先退订旧的再订阅，避免监听器累积。
  var GISCUS_ATTRS = {
    "data-repo": "bfyes/bfyes.github.io",
    "data-repo-id": "R_kgDOQ6xWqA",
    "data-category": "Announcements",
    "data-category-id": "DIC_kwDOQ6xWqM4DA0Jv",
    "data-mapping": "pathname",
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-lang": "zh-CN",
    "crossorigin": "anonymous"
  };
  var giscusUnsubscribe = null;

  function setGiscusTheme(mode) {
    var frame = document.querySelector(".giscus-frame");
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: mode === "dark" ? "dark" : "light" } } },
        "https://giscus.app"
      );
    } catch (e) { /* iframe 未就绪或跨域受限（代理/超时），静默跳过 */ }
  }

  function initGiscus() {
    // 换页前退订上一次的主题同步，避免 listeners 累积
    if (giscusUnsubscribe) { giscusUnsubscribe(); giscusUnsubscribe = null; }

    var container = document.querySelector(".giscus");
    if (!container) return;

    // 已有 iframe（非 instant 的普通渲染）则只补主题即可
    if (!container.querySelector("iframe.giscus-frame")) {
      var scheme = document.documentElement.getAttribute("data-md-color-scheme");
      container.innerHTML = "";
      var script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      for (var key in GISCUS_ATTRS) script.setAttribute(key, GISCUS_ATTRS[key]);
      script.setAttribute("data-theme", scheme === "slate" ? "dark" : "light");
      container.appendChild(script);
    }

    // 换页后 1.5s 补发一次主题，覆盖新页面 iframe 就绪的窗口。
    // 用实时主题，即使稍晚也保证正确。
    setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 1500);

    // 切主题：立即（subscribe 内触发）+ 0.8s + 3.5s 分层补发。
    // 若主题切换发生在 iframe 加载完成之前，前面的广播会因 iframe 不存在而落空
    // （setGiscusTheme 内直接 return）；后面的延时补发覆盖 iframe 刚就绪的窗口。
    giscusUnsubscribe = window.site.theme.subscribe(function (mode) {
      setGiscusTheme(mode);                       // 立即
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 800);  // 0.8s
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 1600); // 1.6s
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 4500); // 4.5s
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 12000); // 12s
    });
  }

  function initLqipBlur(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img.lqip");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var m = /zoom\s*:\s*([\d.]+)%/i.exec(img.getAttribute("style") || "");
      if (m) {
        var zoom = parseFloat(m[1]) / 100;
        img.style.setProperty("--lqip-blur", Math.round(6 / zoom) + "px");
      }
    }
  }

  // ---- Python-Markdown 脚注回跳修正 --------------------------------------
  function lastFootnoteListTarget(list) {
    var node = list;
    while (node) {
      var child = node.lastElementChild;
      if (!child) return node;
      if (child.tagName === "UL" || child.tagName === "OL" || child.tagName === "LI") {
        node = child;
        continue;
      }
      if (child.tagName === "P") return child;
      return node;
    }
    return null;
  }

  function normalizeFootnoteBackrefs(root) {
    var scope = root || document;
    var items = scope.querySelectorAll(".footnote ol > li");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var paragraph = item.lastElementChild;
      if (!paragraph || paragraph.tagName !== "P") continue;

      var link = paragraph.firstElementChild;
      if (!link || !link.classList.contains("footnote-backref") || paragraph.children.length !== 1) continue;

      var list = paragraph.previousElementSibling;
      if (!list || (list.tagName !== "UL" && list.tagName !== "OL")) continue;

      var target = lastFootnoteListTarget(list);
      if (!target) continue;

      target.appendChild(document.createTextNode("\u00A0"));
      target.appendChild(link);
      paragraph.remove();
    }
  }

  // 换页时清除上一页残留在 body 的 tooltip（append 到 body 的，不受
  // container.innerHTML="" 影响，instant 切页会累积）。动态组件（贡献图、PDF
  // 工具栏）各自创建 tooltip，换页时由这里统一回收。
  function purgeTooltips() {
    document.querySelectorAll(".ghc-tooltip, .pdf-tooltip").forEach(function (t) { t.remove(); });
  }
  window.site.onPageReady(syncPageState);
  window.site.onPageReady(upgradeImages);
  window.site.onPageReady(initLqip);
  window.site.onPageReady(initLqipBlur);
  window.site.onPageReady(initTocFade);
  window.site.onPageReady(initGiscus);
  window.site.onPageReady(normalizeFootnoteBackrefs);
  window.site.onPageReady(purgeTooltips);
})();
