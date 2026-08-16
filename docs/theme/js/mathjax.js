var MATHJAX_CONFIG = {
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
};

// 每次返回深拷贝：MathJax 库加载后会往 window.MathJax 上添加内部属性，
// 如果用同一对象引用，第二次赋值时旧属性还在，MathJax 跳过初始化。
function mathjaxConfig() {
  return JSON.parse(JSON.stringify(MATHJAX_CONFIG));
}

window.MathJax = mathjaxConfig();

// navigation.instant 模式下，每次页面切换强制重新加载 MathJax 库
document$.subscribe(function () {
  window.MathJax = mathjaxConfig();
  var existing = document.querySelector('script[src*="mathjax"]');
  if (existing) existing.remove();
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/4.1.3/tex-mml-chtml.js";
  script.async = true;
  document.head.appendChild(script);
});
