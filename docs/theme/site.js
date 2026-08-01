(function () {
  "use strict";

  // 核心：页面生命周期与共享工具。各功能模块通过 window.bfyes.onPageReady 注册。
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

  window.bfyes.onPageReady = onPageReady;
  window.bfyes.htmlEl = htmlEl;

  initPageLifecycle();
})();
