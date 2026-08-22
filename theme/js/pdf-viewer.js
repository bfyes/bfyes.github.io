(function () {
  "use strict";

  var htmlEl = window.site.htmlEl;

  var SVG_EXTERNAL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
  var SVG_DOWNLOAD = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  var PDFJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/";
  var RENDER_SCALE = 3;
  var pdfjsLib = null, pdfjsQueue = [];

  function isIOS() {
    var ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function loadPdfjs(done) {
    if (pdfjsLib) return done(null, pdfjsLib);
    pdfjsQueue.push(done);
    if (pdfjsQueue.length > 1) return;
    import(PDFJS_BASE + "pdf.min.mjs").then(function (mod) {
      pdfjsLib = mod;
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + "pdf.worker.min.mjs";
      pdfjsQueue.splice(0).forEach(function (d) { d(null, pdfjsLib); });
    }).catch(function (err) {
      pdfjsQueue.splice(0).forEach(function (d) { d(err); });
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
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
    var status = htmlEl("span", { class: "pdf-viewer-status" }, "准备加载");
    heading.append(dot, title, status);
    toolbar.append(heading, iconLink("pdf-viewer-action", "在新标签页打开", src, SVG_EXTERNAL),
      iconLink("pdf-viewer-action pdf-viewer-download", "下载", src, SVG_DOWNLOAD));
    root.appendChild(toolbar);

    var wrap = htmlEl("div", { class: "pdf-viewer-native-wrap" });
    wrap.style.height = height + "px";
    var frame = htmlEl("iframe", { class: "pdf-viewer-native", title: iframe.getAttribute("title") || "PDF preview", loading: "lazy" });
    frame.setAttribute("allowfullscreen", "");
    wrap.appendChild(frame);

    var canvasWrap = htmlEl("div", { class: "pdf-viewer-canvases", hidden: "" });
    wrap.appendChild(canvasWrap);

    var external = htmlEl("div", { class: "pdf-viewer-external", hidden: "" });
    external.innerHTML = '<div class="pdf-viewer-external__title">Safari 内嵌预览受限</div><div class="pdf-viewer-external__text">请在新标签页打开完整 PDF。</div><a class="pdf-viewer-external__button" target="_blank" rel="noopener" href="' + src + '">' + SVG_EXTERNAL + '<span>新标签页打开</span></a>';
    wrap.appendChild(external);
    root.appendChild(wrap);

    var overlay = htmlEl("div", { class: "pdf-loader-overlay" });
    overlay.innerHTML = '<div class="pdf-loader-percent">0.0%</div><div class="pdf-loader-bar-track"><div class="pdf-loader-bar-fill"></div></div><div class="pdf-loader-detail"></div>';
    root.appendChild(overlay);

    return { root: root, frame: frame, status: status, dot: dot, overlay: overlay,
      percent: overlay.querySelector(".pdf-loader-percent"),
      barFill: overlay.querySelector(".pdf-loader-bar-fill"),
      detail: overlay.querySelector(".pdf-loader-detail"),
      canvasWrap: canvasWrap, external: external };
  }

  function hideOverlay(v) {
    v.overlay.style.opacity = "0";
    setTimeout(function () { v.overlay.style.display = "none"; }, 400);
  }

  function showPdf(v, blob) {
    if (isIOS()) return showCanvasPdf(v, blob);
    var url = URL.createObjectURL(blob);
    // 先挂 load 再设 src：iframe 的 PDF 查看器加载完成后即 revoke。
    // 原生查看器此时已把整个 blob 读进内存，revoke 仅使该 URL 失效（不再可被新请求
    // 引用），不影响已加载内容。不 revoke 会留在 blob URL 注册表里直到文档 unload，
    // 连看多个 PDF 会累积泄漏。
    v.frame.addEventListener("load", function () { URL.revokeObjectURL(url); }, { once: true });
    v.frame.src = url;
    v.status.textContent = "已加载";
    v.dot.classList.add("pdf-loader-dot--done");
    hideOverlay(v);
  }

  function showCanvasPdf(v, blob) {
    v.frame.hidden = true;
    v.canvasWrap.hidden = false;
    v.status.textContent = "正在渲染…";
    blob.arrayBuffer().then(function (buf) {
      loadPdfjs(function (err, lib) {
        if (err) return showExternal(v);
        lib.getDocument({ data: new Uint8Array(buf) }).promise.then(function (pdf) {
          function renderPage(n) {
            if (n > pdf.numPages) {
              v.status.textContent = "已加载";
              v.dot.classList.add("pdf-loader-dot--done");
              hideOverlay(v);
              return;
            }
            v.status.textContent = "渲染第 " + n + " / " + pdf.numPages + " 页";
            pdf.getPage(n).then(function (page) {
              var vp = page.getViewport({ scale: RENDER_SCALE });
              var wrap = htmlEl("div", { class: "pdf-viewer-page-wrap" });
              var canvas = htmlEl("canvas", { class: "pdf-viewer-canvas" });
              canvas.width = vp.width; canvas.height = vp.height;
              canvas.style.aspectRatio = vp.width + " / " + vp.height;
              wrap.appendChild(canvas);
              v.canvasWrap.appendChild(wrap);
              page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise.then(function () { renderPage(n + 1); });
            });
          }
          renderPage(1);
        }).catch(function () { showExternal(v); });
      });
    }).catch(function () { showExternal(v); });
  }

  function showExternal(v) {
    v.frame.hidden = true;
    v.canvasWrap.hidden = true;
    v.external.hidden = false;
    v.status.textContent = "请在新标签页打开";
    v.dot.classList.add("pdf-loader-dot--done");
    hideOverlay(v);
  }

  function fallback(v, msg) {
    v.frame.src = v.root._src;
    v.status.textContent = msg;
    v.dot.classList.add("pdf-loader-dot--done");
    v.barFill.style.width = "100%";
    hideOverlay(v);
  }

  function loadPdf(v, src) {
    v.status.textContent = "下载中…";
    fetch(src).then(function (resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      var total = parseInt(resp.headers.get("Content-Length"), 10) || 0;
      var reader = resp.body.getReader(), received = 0, chunks = [];

      function pump() {
        return reader.read().then(function (r) {
          if (r.done) {
            var blob = new Blob(chunks, { type: "application/pdf" });
            v.barFill.style.width = "100%";
            v.percent.textContent = "100.0%";
            v.detail.textContent = formatSize(total || received);
            showPdf(v, blob);
            return;
          }
          chunks.push(r.value);
          received += r.value.length;
          if (total) {
            var pct = (received / total * 100).toFixed(1) + "%";
            v.barFill.style.width = pct;
            v.percent.textContent = pct;
            v.detail.textContent = formatSize(received) + " / " + formatSize(total);
          } else {
            v.detail.textContent = formatSize(received);
          }
          return pump();
        });
      }
      return pump();
    }).catch(function () {
      fallback(v, "浏览器加载");
    });
  }

  function scanPdfs(root) {
    (root || document).querySelectorAll("iframe[src*='.pdf']").forEach(function (iframe) {
      if (iframe.parentNode.classList.contains("pdf-viewer")) return;
      var v = buildViewer(iframe);
      v.root._src = iframe.getAttribute("src");
      iframe.parentNode.replaceChild(v.root, iframe);
      loadPdf(v, v.root._src);
    });
  }

  window.site.onPageReady(scanPdfs);
})();
