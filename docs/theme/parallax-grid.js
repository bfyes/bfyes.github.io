/**
 * parallax-grid.js
 * 背景虚线网格以比内容更慢的速度滚动，产生视差深度感。
 * CSS 设为 fixed（静止），JS 按比例缓慢推动。
 */
(function () {
  "use strict";

  var RATIO = 0.1;
  var ticking = false;

  function update() {
    document.body.style.backgroundPositionY = -(window.scrollY * RATIO) + "px";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
