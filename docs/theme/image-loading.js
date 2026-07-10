(function () {
  "use strict";

  var EAGER_COUNT = 2;
  var PREVIEW_RE = /\.(?:png|jpe?g)(?=$|[?#])/i;

  function isContentImage(img) {
    return (img.currentSrc !== "" || img.src !== "") &&
      img.closest(".md-content") &&
      !img.closest(".page-info") &&
      !img.closest(".github-calendar-wrap");
  }

  function preloadImage(src) {
    if (!src || document.querySelector('link[rel="preload"][as="image"][href="' + CSS.escape(src) + '"]')) {
      return;
    }

    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  }

  function previewSrc(src) {
    if (!src || src.indexOf(".preview.jpg") !== -1 || !PREVIEW_RE.test(src)) {
      return "";
    }
    return src.replace(PREVIEW_RE, ".preview.jpg");
  }

  function swapFromPreview(img, fullSrc) {
    var full = new Image();
    full.decoding = "async";
    full.src = fullSrc;
    full.onload = function () {
      img.src = fullSrc;
      img.classList.add("image-preview-loaded");
    };
  }

  function tuneImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll(".md-content img"))
      .filter(isContentImage);

    images.forEach(function (img, index) {
      img.decoding = "async";

      if (index < EAGER_COUNT) {
        var fullSrc = img.currentSrc || img.src;
        var lowSrc = previewSrc(fullSrc);
        img.loading = "eager";
        img.fetchPriority = index === 0 ? "high" : "auto";
        if (lowSrc) {
          img.dataset.fullsrc = fullSrc;
          img.src = lowSrc;
          preloadImage(fullSrc);
          swapFromPreview(img, fullSrc);
        } else {
          preloadImage(fullSrc);
        }
      } else {
        img.loading = "lazy";
        img.fetchPriority = "low";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tuneImages);
  } else {
    tuneImages();
  }

  if (window.document$) {
    window.document$.subscribe(tuneImages);
  }
})();
