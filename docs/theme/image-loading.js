(function () {
  "use strict";

  function loadNext(items, i) {
    if (i >= items.length) return;
    var img = items[i];
    var fullSrc = img.dataset.fullsrc;
    if (!fullSrc) { loadNext(items, i + 1); return; }

    var full = new Image();
    full.onload = function () {
      img.src = fullSrc;
      loadNext(items, i + 1);
    };
    full.onerror = function () {
      loadNext(items, i + 1);
    };
    full.src = fullSrc;
  }

  function upgradeImages() {
    var imgs = document.querySelectorAll(".md-content img[data-fullsrc]");
    if (!imgs.length) return;
    // 等页面稳定后逐张加载高清，不抢预览图带宽
    setTimeout(function () { loadNext(imgs, 0); }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", upgradeImages);
  } else {
    upgradeImages();
  }

  if (window.document$) {
    window.document$.subscribe(upgradeImages);
  }
})();
