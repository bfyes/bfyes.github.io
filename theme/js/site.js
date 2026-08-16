(function () {
  "use strict";

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
        full.onload = function () { img.src = fullSrc; };
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

  installHeaderlinkFocusFix();
  initPageLifecycle();
  window.site.onPageReady(syncPageState);
  window.site.onPageReady(upgradeImages);
  initParallaxGrid();
})();
