window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]]
  },
  options: {
    processHtmlClass: "arithmatex"
  },
  startup: {
    ready: function () {
      MathJax.startup.defaultReady();
      // 在 MkDocs instant navigation 切换页面后重新渲染公式
      if (typeof document !== "undefined" && document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {
          if (typeof document$ !== "undefined") {
            document$.subscribe(function () {
              MathJax.typesetPromise();
            });
          }
        });
      }
    }
  }
};
