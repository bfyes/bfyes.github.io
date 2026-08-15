// 用 Promise 阻塞：tex-mml-chtml.js 完全加载并完成 startup 后才 resolve，
// 之后 document$ 每次触发（含 navigation.instant 无刷新切换）才放行 typesetPromise。
var mathjaxReady = new Promise(function (resolve) {
  window.MathJax = {
    tex: {
      inlineMath: [["\\(", "\\)"]],
      displayMath: [["\\[", "\\]"]],
      processEscapes: true,
      processEnvironments: true,
    },
    options: {
      ignoreHtmlClass: ".*|",
      processHtmlClass: "arithmatex",
    },
    chtml: {
      // MathJax 4 默认 adaptiveCSS=true，只生成已渲染过的 wrapper 的 CSS。
      // navigation.instant 无刷新切换时，从无公式页面切到有公式页面，
      // 新 wrapper 的样式不会被追加，导致版式错乱。
      // 关闭后 MathJax 一次性生成完整样式表，instant 切换不受影响。
      adaptiveCSS: false,
    },
    startup: {
      pageReady: function () {
        return MathJax.startup.defaultPageReady().then(function () {
          resolve();
        });
      },
    },
  };
});

document$.subscribe(function () {
  mathjaxReady.then(function () {
    MathJax.typesetPromise();
  });
});
