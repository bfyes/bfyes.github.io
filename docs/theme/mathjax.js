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
      // document$ 是 MkDocs Material 提供的 observable，每次页面切换都会触发
      if (typeof document !== "undefined") {
        // 方案1：如果 document$ 可用（MkDocs instant navigation），用 observable
        if (typeof document$ !== "undefined") {
          document$.subscribe(function () {
            MathJax.typesetPromise();
          });
        }
        // 方案2：兜底——首次加载时也渲染一次
        MathJax.typesetPromise();
      }
    }
  }
};
