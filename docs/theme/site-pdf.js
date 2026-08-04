(function () {
  "use strict";

  window.bfyes = window.bfyes || {};
  var htmlEl = window.bfyes.htmlEl;
  var activePdfViewers = [];

  var SVG_SPINNER =
    '<svg class="pdf-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>' +
    '<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>' +
    "</svg>";

  var SVG_EXTERNAL =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/>' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

  var SVG_DOWNLOAD =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
    '<polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function buildIconLink(className, title, href, svg) {
    var link = htmlEl("a", {
      class: className,
      title: title,
      href: href
    });
    link.innerHTML = svg;
    return link;
  }

  function splitHash(src) {
    var hashIndex = src.indexOf("#");
    if (hashIndex < 0) return { fetchSrc: src, hash: "" };
    return {
      fetchSrc: src.slice(0, hashIndex),
      hash: src.slice(hashIndex)
    };
  }

  function buildPdfViewer(iframe) {
    var src = iframe.getAttribute("src");
    if (!src || !/\.pdf(\?.*)?(#.*)?$/i.test(src)) return null;

    var width = iframe.getAttribute("width") || "100%";
    var height = iframe.getAttribute("height") || "600px";
    var root = htmlEl("div", { class: "pdf-viewer" });
    root.style.width = width;
    root.style.maxWidth = "100%";

    var toolbar = htmlEl("div", { class: "pdf-viewer-toolbar" });
    var title = htmlEl("span", { class: "pdf-viewer-title" }, "PDF");
    var status = htmlEl("span", { class: "pdf-viewer-status" }, "准备加载");
    var spacer = htmlEl("span", { class: "pdf-viewer-spacer" });
    var open = buildIconLink("pdf-viewer-action", "在新标签页打开", src, SVG_EXTERNAL);
    open.setAttribute("target", "_blank");
    open.setAttribute("rel", "noopener");
    var download = buildIconLink("pdf-viewer-action pdf-viewer-download", "下载", src, SVG_DOWNLOAD);
    download.setAttribute("download", "");
    toolbar.append(title, status, spacer, open, download);
    root.appendChild(toolbar);

    var frameWrap = htmlEl("div", { class: "pdf-viewer-native-wrap" });
    var h = parseInt(height, 10);
    if (isNaN(h) || h <= 0) h = 600;
    h = Math.min(h, Math.round(window.innerHeight * 0.82));
    frameWrap.style.height = h + "px";

    var nativeFrame = htmlEl("iframe", {
      class: "pdf-viewer-native",
      title: iframe.getAttribute("title") || "PDF preview",
      loading: "lazy"
    });
    nativeFrame.setAttribute("allowfullscreen", "");
    frameWrap.appendChild(nativeFrame);
    root.appendChild(frameWrap);

    var overlay = htmlEl("div", { class: "pdf-loader-overlay" });
    overlay.innerHTML =
      SVG_SPINNER +
      '<div class="pdf-loader-text">准备加载 PDF...</div>' +
      '<div class="pdf-loader-bar-track"><div class="pdf-loader-bar-fill"></div></div>' +
      '<div class="pdf-loader-detail"></div>';
    root.appendChild(overlay);

    var errorBox = htmlEl("div", { class: "pdf-viewer-error" });
    errorBox.style.display = "none";
    root.appendChild(errorBox);

    root._src = src;
    root._fetchSrc = splitHash(src).fetchSrc;
    root._hash = splitHash(src).hash;
    root._status = status;
    root._nativeFrame = nativeFrame;
    root._overlay = overlay;
    root._barFill = overlay.querySelector(".pdf-loader-bar-fill");
    root._detail = overlay.querySelector(".pdf-loader-detail");
    root._text = overlay.querySelector(".pdf-loader-text");
    root._errorBox = errorBox;
    root._loaded = false;
    root._objectUrl = "";
    return root;
  }

  function hideOverlay(viewer) {
    viewer._overlay.style.opacity = "0";
    setTimeout(function () {
      viewer._overlay.style.display = "none";
    }, 400);
  }

  function showNativePdf(viewer, blob) {
    if (viewer._objectUrl) URL.revokeObjectURL(viewer._objectUrl);
    viewer._objectUrl = URL.createObjectURL(blob);
    viewer._nativeFrame.src = viewer._objectUrl + viewer._hash;
    viewer._status.textContent = "已加载";
    hideOverlay(viewer);
    activePdfViewers.push(viewer);
  }

  function fallbackToBrowser(viewer, message) {
    viewer._nativeFrame.src = viewer._src;
    viewer._status.textContent = "浏览器加载";
    viewer._text.textContent = message;
    viewer._detail.textContent = "";
    viewer._barFill.style.width = "100%";
    setTimeout(function () {
      hideOverlay(viewer);
    }, 700);
  }

  function loadPdf(viewer) {
    if (viewer._loaded) return;
    viewer._loaded = true;
    viewer._text.textContent = "正在下载 PDF...";
    viewer._status.textContent = "下载中";

    if (!window.fetch || !window.ReadableStream) {
      fallbackToBrowser(viewer, "当前浏览器不支持读取进度，改用内置 PDF 查看器");
      return;
    }

    fetch(viewer._fetchSrc)
      .then(function (resp) {
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        if (!resp.body || !resp.body.getReader) {
          return resp.blob().then(function (blob) {
            viewer._barFill.style.width = "100%";
            viewer._detail.textContent = formatSize(blob.size);
            showNativePdf(viewer, blob);
          });
        }

        var total = resp.headers.get("Content-Length");
        total = total ? parseInt(total, 10) : 0;
        var reader = resp.body.getReader();
        var chunks = [];
        var received = 0;
        if (total > 0) viewer._detail.textContent = "0 / " + formatSize(total);

        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              var blob = new Blob(chunks, { type: resp.headers.get("Content-Type") || "application/pdf" });
              viewer._text.textContent = "正在交给浏览器 PDF 查看器...";
              viewer._barFill.style.width = "100%";
              viewer._detail.textContent = total > 0 ? formatSize(total) : formatSize(received);
              showNativePdf(viewer, blob);
              return;
            }

            chunks.push(r.value);
            received += r.value.length;
            if (total > 0) {
              var pct = Math.min(100, Math.round((received / total) * 100));
              viewer._barFill.style.width = pct + "%";
              viewer._detail.textContent = formatSize(received) + " / " + formatSize(total);
              viewer._text.textContent = "正在下载 PDF... " + pct + "%";
            } else {
              viewer._detail.textContent = formatSize(received);
            }
            return pump();
          });
        }
        return pump();
      })
      .catch(function (err) {
        console.warn("[site] PDF progress loader failed, falling back:", viewer._src, err);
        fallbackToBrowser(viewer, "无法读取下载进度，改用内置 PDF 查看器");
      });
  }

  function cleanupPdfViewers() {
    for (var i = 0; i < activePdfViewers.length; i++) {
      var viewer = activePdfViewers[i];
      if (viewer._objectUrl) URL.revokeObjectURL(viewer._objectUrl);
      viewer._objectUrl = "";
    }
    activePdfViewers = [];
  }

  function scanAndLoadPdfs(root) {
    cleanupPdfViewers();
    var scope = root || document;
    var iframes = scope.querySelectorAll("iframe[src*='.pdf']");
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.parentNode && iframe.parentNode.classList.contains("pdf-viewer")) continue;
      var viewer = buildPdfViewer(iframe);
      if (!viewer) continue;
      iframe.parentNode.replaceChild(viewer, iframe);
      loadPdf(viewer);
    }
  }

  window.bfyes.onPageReady(scanAndLoadPdfs);
})();
