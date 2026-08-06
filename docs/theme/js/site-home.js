(function () {
  "use strict";

  window.bfyes = window.bfyes || {};

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

  window.bfyes.onPageReady(syncHomePageState);
  initParallaxGrid();
})();
