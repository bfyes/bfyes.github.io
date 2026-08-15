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
  // chtml: {
  //   // MathJax 4 默认 adaptiveCSS=true，只生成已渲染过的 wrapper 的 CSS。
  //   // navigation.instant 无刷新切换时，从无公式页面切到有公式页面，
  //   // 新 wrapper 的样式不会被追加，导致版式错乱。
  //   // 关闭后 MathJax 一次性生成完整样式表，instant 切换不受影响。
  //   adaptiveCSS: false,
  // },
};

// navigation.instant 无刷新切换时的 workaround（当前已关闭 navigation.instant）：
// 1. mathjax.js 会被重新执行，但 MathJax 库不会重新加载
// 2. startup.pageReady 不会再被调用，导致 startup.promise 和
//    document._readyPromise 永远 pending，typesetPromise 卡在 whenReady 上
// 3. MathJax 内部的 _actionPromises 保留上一页的渲染记录
// 修复：手动 resolve startup.promise + 重置 _readyPromise，
// 然后 typesetClear 清除旧记录，typesetPromise 异步重新渲染
// document$.subscribe(function () {
//   if (!window.MathJax || !MathJax.typesetPromise) return;
//   var startup = MathJax.startup;
//   if (startup && typeof startup.promiseResolve === "function") {
//     startup.promiseResolve();
//   }
//   var doc = startup && startup.document;
//   if (doc && doc._readyPromise) {
//     doc._readyPromise = Promise.resolve();
//   }
//   MathJax.typesetClear();
//   MathJax.typesetPromise();
// });

document$.subscribe(function () {
  MathJax.typesetPromise();
});
