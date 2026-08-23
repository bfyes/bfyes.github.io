(function () {
  "use strict";

  var htmlEl = window.site.htmlEl;

  var SVG_EXTERNAL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  var SVG_DOWNLOAD = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  var SVG_CLOSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function isIOS() {
    var ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function iconLink(cls, title, href, svg) {
    var a = htmlEl("a", { class: cls, title: title, href: href, target: "_blank", rel: "noopener" });
    a.innerHTML = svg;
    return a;
  }

  function buildViewer(iframe) {
    var src = iframe.getAttribute("src");
    var height = 600;

    var root = htmlEl("div", { class: "pdf-viewer" });
    root.style.maxWidth = "100%";

    var toolbar = htmlEl("div", { class: "pdf-viewer-toolbar" });
    var heading = htmlEl("span", { class: "pdf-viewer-heading" });
    var dot = htmlEl("span", { class: "pdf-loader-dot", "aria-hidden": "true" });
    var title = htmlEl("span", { class: "pdf-viewer-title" }, "PDF");
    var status = htmlEl("span", { class: "pdf-viewer-status" }, "加载中");
    heading.append(dot, title, status);
    toolbar.append(heading,
      iconLink("pdf-viewer-action", "在新标签页打开", src, SVG_EXTERNAL),
      iconLink("pdf-viewer-action pdf-viewer-download", "下载", src, SVG_DOWNLOAD));
    root.appendChild(toolbar);
    // 工具栏按钮由 JS 动态创建，晚于主题原生 tooltip 扫描，手动补绑。
    window.site.bindTooltips(toolbar, ".pdf-viewer-action[title]", "pdf-tooltip");

    // iOS 提示
    if (isIOS()) {
      var hint = htmlEl("div", { class: "pdf-viewer-ios-hint" });
      var hintText = htmlEl("span", { class: "pdf-viewer-ios-hint__text" });
      hintText.textContent = "iOS 内嵌预览受限，建议点击上方「在新标签页打开」查看完整 PDF。";
      var closeBtn = htmlEl("button", { class: "pdf-viewer-ios-hint__close", type: "button", "aria-label": "关闭提示" });
      closeBtn.innerHTML = SVG_CLOSE;
      closeBtn.addEventListener("click", function () { hint.remove(); });
      hint.append(hintText, closeBtn);
      root.appendChild(hint);
    }

    var wrap = htmlEl("div", { class: "pdf-viewer-native-wrap" });
    wrap.style.height = height + "px";
    var frame = htmlEl("iframe", { class: "pdf-viewer-native", title: iframe.getAttribute("title") || "PDF preview", loading: "lazy" });
    frame.setAttribute("allowfullscreen", "");
    frame.src = src;
    frame.addEventListener("load", function () {
      status.textContent = "已加载";
      dot.classList.add("pdf-loader-dot--done");
    });
    wrap.appendChild(frame);
    root.appendChild(wrap);

    return { root: root };
  }

  function scanPdfs(root) {
    (root || document).querySelectorAll("iframe[src*='.pdf']").forEach(function (iframe) {
      if (iframe.parentNode.classList.contains("pdf-viewer")) return;
      var v = buildViewer(iframe);
      iframe.parentNode.replaceChild(v.root, iframe);
    });
  }

  window.site.onPageReady(scanPdfs);
})();
