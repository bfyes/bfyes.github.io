/**
 * 主页打字机效果初始化
 * 依赖 Typed.js (通过 CDN 加载)
 *
 * 流程:
 *   1. 第一行逐字打出，光标 (▌) 保留
 *   2. 延迟后第二行开始，同时销毁第一行光标
 *   3. 再延迟后第三行开始，同时销毁第二行光标
 *   4. 第三行打完，移除 Typed 光标，替换为 CSS 持续闪烁的独立光标
 *
 * MkDocs instant navigation 支持：
 *   通过 document$ observable 监听页面切换，当切换回首页时重新初始化。
 */
(function () {
  var _initialized = false;
  var _timers = [];

  function cleanup() {
    // 清除所有未完成的 timer，防止页面切换后旧 timer 在新页面触发
    for (var i = 0; i < _timers.length; i++) {
      clearTimeout(_timers[i]);
    }
    _timers = [];
    // 销毁所有 Typed 实例（通过清除 DOM 元素上绑定的 typed 数据）
    var els = document.querySelectorAll(".typed-text");
    for (var j = 0; j < els.length; j++) {
      els[j].textContent = "";
      els[j].style.display = "none";
      // 移除独立光标
      var next = els[j].nextSibling;
      if (next && next.nodeType === 1 && next.classList && next.classList.contains("typed-cursor-standalone")) {
        next.remove();
      }
    }
    var brs = document.querySelectorAll("[id^='typed-br-']");
    for (var k = 0; k < brs.length; k++) {
      brs[k].style.display = "none";
    }
    _initialized = false;
  }

  function initTyped() {
    if (_initialized) return;

    if (typeof Typed === "undefined") {
      var retryTimer = setTimeout(initTyped, 100);
      _timers.push(retryTimer);
      return;
    }

    var el1 = document.getElementById("typed-line-1");
    var el2 = document.getElementById("typed-line-2");
    var el3 = document.getElementById("typed-line-3");
    var br1 = document.getElementById("typed-br-1");
    var br2 = document.getElementById("typed-br-2");
    if (!el1 || !el2 || !el3) return;

    _initialized = true;

    // ---- 第一行 ----
    el1.style.display = "";
    br1.style.display = "";
    var typed1 = new Typed(el1, {
      strings: ["We1c0me t0 bfyes."],
      typeSpeed: 40,
      showCursor: true,
      cursorChar: "\u258c",
      autoInsertCss: false,
      onBegin: function (self) { el1.style.color = ""; },
    });

    // ---- 第二行（延迟启动） ----
    var t1 = setTimeout(function () {
      _timers.splice(_timers.indexOf(t1), 1);
      if (typed1.cursor) typed1.cursor.remove();

      el2.style.display = "";
      br2.style.display = "";
      var typed2 = new Typed(el2, {
        strings: ["1'm fr0m ZJU."],
        typeSpeed: 30,
        showCursor: true,
        cursorChar: "\u258c",
        autoInsertCss: false,
        onBegin: function (self) { el2.style.color = ""; },
      });

      // ---- 第三行（再延迟启动） ----
      var t2 = setTimeout(function () {
        _timers.splice(_timers.indexOf(t2), 1);
        if (typed2.cursor) typed2.cursor.remove();

        el3.style.display = "";
        var typed3 = new Typed(el3, {
          strings: ["1 maj0r 1n Information Security."],
          typeSpeed: 30,
          showCursor: true,
          cursorChar: "\u258c",
          autoInsertCss: false,
          onBegin: function (self) { el3.style.color = ""; },
          onComplete: function (self) {
            // 移除 Typed 光标，替换为 CSS 闪烁的独立光标
            self.cursor.remove();
            var c = document.createElement("span");
            c.className = "typed-cursor-standalone";
            c.textContent = "\u258c";
            el3.parentNode.insertBefore(c, el3.nextSibling);
          },
        });
      }, 700);
      _timers.push(t2);
    }, 1100);
    _timers.push(t1);
  }

  // 首次加载时初始化
  initTyped();

  // MkDocs instant navigation：监听页面切换
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      // 每次页面切换都清理并重新检查是否需要初始化
      cleanup();
      // 延迟一帧确保 DOM 已更新
      setTimeout(function () {
        initTyped();
      }, 0);
    });
  }
})();
