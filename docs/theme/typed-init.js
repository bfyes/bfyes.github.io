/**
 * 主页打字机效果初始化
 * 依赖 Typed.js (通过 CDN 加载)
 *
 * 流程:
 *   1. 第一行逐字打出，光标 (▌) 保留
 *   2. 延迟后第二行开始打出，同时销毁第一行光标
 *   3. 第二行打完，移除 Typed 光标，替换为 CSS 持续闪烁的独立光标
 */
(function () {
  // 等待 Typed.js 库加载完成
  function initTyped() {
    if (typeof Typed === "undefined") {
      // Typed.js 还没加载，稍后重试
      setTimeout(initTyped, 100);
      return;
    }

    // ---------- 获取 DOM 元素 ----------
    var el1 = document.getElementById("typed-line-1");
    var el2 = document.getElementById("typed-line-2");

    if (!el1 || !el2) return;

    // ---------- 第一行打字 ----------
    var typed1 = new Typed(el1, {
      strings: ["We1c0me t0 bfyes."],
      typeSpeed: 40,              // 打字速度 (ms/字)
      showCursor: true,
      cursorChar: "\u258c",        // 半宽方块 ▌
      autoInsertCss: false,        // 不插入 Typed.js 默认光标样式
      onBegin: function (self) {
        el1.style.color = "";      // 触发 Typed 后应用 CSS 颜色
      },
      onComplete: function (self) {
        // 保留光标，等第二行开始时再销毁
      },
    });

    // ---------- 第二行打字（延迟启动）----------
    setTimeout(function () {
      // 销毁第一行的光标，页面上只保留一个光标
      if (typed1.cursor) typed1.cursor.remove();

      var typed2 = new Typed(el2, {
        strings: ["1'm fr0m ZJU. 1 maj0r 1n Information Security."],
        typeSpeed: 30,
        showCursor: true,
        cursorChar: "\u258c",
        autoInsertCss: false,
        onBegin: function (self) {
          el2.style.color = "";
        },
        onComplete: function (self) {
          // 打字完成：移除 Typed 生成的光标，改为 CSS 闪烁的独立光标
          self.cursor.remove();
          var cursor = document.createElement("span");
          cursor.className = "typed-cursor-standalone";
          cursor.textContent = "\u258c";
          el2.parentNode.insertBefore(cursor, el2.nextSibling);
        },
      });
    }, 2000); // 第一行打完等 2 秒再开始第二行
  }

  initTyped();
})();
