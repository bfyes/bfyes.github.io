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
    }
  }
};
