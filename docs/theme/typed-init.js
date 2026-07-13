/**
 * 主页打字机效果初始化
 * 依赖 Typed.js (通过 CDN 加载)
 *
 * 流程:
 *   1. 第一行逐字打出，光标 (▌) 保留
 *   2. 延迟后第二行开始，同时销毁第一行光标
 *   3. 再延迟后第三行开始，同时销毁第二行光标
 *   4. 第三行打完，移除 Typed 光标，替换为 CSS 持续闪烁的独立光标
 */
(function () {
  function initTyped() {
    if (typeof Typed === "undefined") {
      setTimeout(initTyped, 100);
      return;
    }

    var el1 = document.getElementById("typed-line-1");
    var el2 = document.getElementById("typed-line-2");
    var el3 = document.getElementById("typed-line-3");
    var br1 = document.getElementById("typed-br-1");
    var br2 = document.getElementById("typed-br-2");
    if (!el1 || !el2 || !el3) return;

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
    setTimeout(function () {
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
      setTimeout(function () {
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
    }, 1100);
  }

  initTyped();
})();
