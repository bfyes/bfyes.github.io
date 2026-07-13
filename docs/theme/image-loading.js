(function () {
  "use strict";

  function previewUrl(src) {
    return src.replace(/\.(png|jpe?g)(\?|#|$)/i, ".preview.jpg$2");
  }

  function loadNext(items, i) {
    if (i >= items.length) return;
    var img = items[i];
    var fullSrc = img.dataset.fullsrc || img.src;
    if (!/\.(png|jpe?g)/i.test(fullSrc)) { loadNext(items, i + 1); return; }
    if (/\.preview\.jpg/i.test(fullSrc)) { loadNext(items, i + 1); return; }

    // 先用预览图顶上去
    var pv = previewUrl(fullSrc);
    if (pv !== img.src) img.src = pv;

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
    // 匹配所有 .md-content 下的图片（不需要 data-fullsrc）
    var imgs = document.querySelectorAll(".md-content img");
    var candidates = [];
    for (var k = 0; k < imgs.length; k++) {
      if (/\.(png|jpe?g)/i.test(imgs[k].src)) candidates.push(imgs[k]);
    }
    if (!candidates.length) return;
    setTimeout(function () { loadNext(candidates, 0); }, 500);
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
