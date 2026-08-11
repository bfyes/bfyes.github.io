(function () {
  "use strict";

  // Zensical/MkDocs 把 permalink 放在标题文字之后；GitHub 的样式把它放在前面。
  // 保留生成器提供的 id 和 href，避免改动已有书签链接。
  var SVG_NS = "http://www.w3.org/2000/svg";
  var LINK_PATH = "m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z";

  function makeIcon() {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", LINK_PATH);
    svg.appendChild(path);
    return svg;
  }

  function enhanceAnchors(root) {
    var headings = root.querySelectorAll("h1, h2, h3, h4, h5, h6");
    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var anchor = heading.querySelector(":scope > a.headerlink");
      if (!anchor) continue;

      anchor.setAttribute("aria-label", "Permalink: " + heading.textContent.replace(/¶/g, "").trim());
      anchor.setAttribute("title", "Permanent link");
      anchor.classList.add("bfyes-heading-anchor");

      if (!anchor.querySelector("svg")) {
        anchor.textContent = "";
        anchor.appendChild(makeIcon());
      }
      if (heading.firstElementChild !== anchor) {
        heading.insertBefore(anchor, heading.firstChild);
      }
    }
  }

  if (window.bfyes && window.bfyes.onPageReady) {
    window.bfyes.onPageReady(enhanceAnchors);
  }
})();
