(function () {
  "use strict";

  window.bfyes = window.bfyes || {};

  var mathRetry = 0;
  var mathJaxLoading = false;
  var mathJaxSources = [
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js",
    "https://unpkg.com/mathjax@3/es5/tex-mml-chtml.js"
  ];

  function loadMathJax(i) {
    if (mathJaxLoading || !mathJaxSources[i]) return;
    mathJaxLoading = true;

    var script = document.createElement("script");
    script.src = mathJaxSources[i];
    script.async = true;
    script.onload = function () {
      mathJaxLoading = false;
    };
    script.onerror = function () {
      mathJaxLoading = false;
      loadMathJax(i + 1);
    };
    document.head.appendChild(script);
  }

  function typesetMath(root) {
    if (!root) return;
    if (!root.querySelector(".arithmatex")) return;

    if (!window.MathJax || !MathJax.typesetPromise) {
      loadMathJax(0);
      if (mathRetry < 40) {
        mathRetry++;
        setTimeout(function () {
          typesetMath(root);
        }, 100);
      }
      return;
    }

    mathRetry = 0;
    try {
      if (MathJax.typesetClear) MathJax.typesetClear([root]);
      MathJax.typesetPromise([root]).catch(function (err) {
        console.error("[site] MathJax typeset failed:", err);
      });
    } catch (e) {
      console.error("[site] MathJax typeset failed:", e);
    }
  }

  window.bfyes.onPageReady(typesetMath);
})();
