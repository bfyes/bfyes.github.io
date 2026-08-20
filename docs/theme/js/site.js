(function () {
  "use strict";

  console.log("welcome to bfyes");

  // 核心：页面生命周期与共享工具。各功能模块通过 window.site.onPageReady 注册。
  window.site = window.site || {};

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

  // 点击标题书签后，浏览器可能保留链接焦点，使书签一直显示。
  // 失焦不影响锚点跳转；键盘 Tab 导航产生的 focus-visible 仍由 CSS 保留。
  function installHeaderlinkFocusFix() {
    if (document.documentElement.dataset.headerlinkFocusFix) return;
    document.documentElement.dataset.headerlinkFocusFix = "1";
    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest(".headerlink")
        : null;
      if (!link) return;
      setTimeout(function () {
        if (document.activeElement === link) link.blur();
      }, 0);
    });
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

  // 共享 DOM 工具（github / friends / pdf 模块使用）
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

  // ---- 主题同步（highlight.js / giscus 订阅）----
  var mq = matchMedia("(prefers-color-scheme: dark)");
  var themeListeners = [];

  function isDark() {
    var attr = document.body.getAttribute("data-md-color-scheme");
    if (attr) return attr === "slate";
    return mq.matches;
  }

  function themeMode() { return isDark() ? "dark" : "light"; }

  function notifyTheme() {
    var m = themeMode();
    themeListeners.forEach(function (fn) { try { fn(m); } catch (e) {} });
  }

  new MutationObserver(notifyTheme).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-md-color-scheme"],
  });
  mq.addEventListener("change", notifyTheme);

  // ---- 图片渐进加载（preview → 全分辨率）----
  function upgradeImages(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img[data-fullsrc]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        var fullSrc = img.getAttribute("data-fullsrc");
        if (!fullSrc) return;
        var full = new Image();
        full.onload = function () {
          img.src = fullSrc;
          img.classList.remove("lqip");
        };
        full.src = fullSrc;
      })(imgs[i]);
    }
  }

  window.site.onPageReady = onPageReady;
  window.site.htmlEl = htmlEl;
  window.site.theme = {
    get mode() { return themeMode(); },
    subscribe: function (fn) {
      themeListeners.push(fn);
      try { fn(themeMode()); } catch (e) {}
      return function () {
        var i = themeListeners.indexOf(fn);
        if (i >= 0) themeListeners.splice(i, 1);
      };
    },
  };

  // ---- 页面状态 + 视差网格（全站功能）----
  function syncPageState(root) {
    var scope = root || document;
    document.body.classList.toggle("home-active", !!scope.querySelector(".home-page"));
    document.body.classList.toggle("rainbow-active", !!scope.querySelector(".rainbow-page"));
    document.body.classList.toggle("grid-off-active", !!scope.querySelector(".grid-off"));
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


  installHeaderlinkFocusFix();
  initPageLifecycle();
  window.site.onPageReady(syncPageState);
  window.site.onPageReady(upgradeImages);
  window.site.onPageReady(initLqipBlur);
  window.site.onPageReady(initTocFade);
  initParallaxGrid();
  window.site.onPageReady(initGiscus);
})();

