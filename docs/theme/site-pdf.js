(function () {
  "use strict";

  window.bfyes = window.bfyes || {};
  var htmlEl = window.bfyes.htmlEl;

  var PDF_SCRIPT_BASE = "https://unpkg.com/pdfjs-dist@4.0.379/build/";
  var PDF_RENDER_SCALE = 3;
  var pdfjsLib = null;
  var pdfjsLoading = false;
  var pdfjsQueue = [];
  var activePdfViewers = [];

  var SVG_SPINNER =
    '<svg class="pdf-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>' +
    '<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>' +
    "</svg>";
  var SVG_CHEVRON_LEFT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
  var SVG_CHEVRON_RIGHT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function getPDFJS(cb) {
    if (pdfjsLib) {
      cb(pdfjsLib);
      return;
    }
    pdfjsQueue.push(cb);
    if (pdfjsLoading) return;
    pdfjsLoading = true;

    import(PDF_SCRIPT_BASE + "pdf.min.mjs").then(function (mod) {
      pdfjsLib = mod;
      mod.GlobalWorkerOptions.workerSrc = PDF_SCRIPT_BASE + "pdf.worker.min.mjs";
      var q = pdfjsQueue;
      pdfjsQueue = [];
      for (var i = 0; i < q.length; i++) q[i](pdfjsLib);
    }).catch(function (err) {
      console.error("[site] PDF.js load failed:", err);
      pdfjsLoading = false;
      var q = pdfjsQueue;
      pdfjsQueue = [];
      for (var i = 0; i < q.length; i++) q[i](null);
    });
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
    toolbar.innerHTML =
      '<button class="pdf-viewer-btn pdf-prev" title="上一页" disabled>' + SVG_CHEVRON_LEFT + "</button>" +
      '<span class="pdf-viewer-page">- / -</span>' +
      '<button class="pdf-viewer-btn pdf-next" title="下一页" disabled>' + SVG_CHEVRON_RIGHT + "</button>" +
      '<span class="pdf-viewer-spacer"></span>' +
      '<a class="pdf-viewer-download" title="下载" href="' + src + '" download>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>' +
      '<line x1="12" y1="15" x2="12" y2="3"/></svg></a>';
    root.appendChild(toolbar);

    var canvasWrap = htmlEl("div", { class: "pdf-viewer-canvases" });
    var h = parseInt(height, 10);
    if (isNaN(h) || h <= 0) h = 500;
    h = Math.min(h, Math.round(window.innerHeight * 0.8));
    canvasWrap.style.height = h + "px";
    root.appendChild(canvasWrap);

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
    root._overlay = overlay;
    root._barFill = overlay.querySelector(".pdf-loader-bar-fill");
    root._detail = overlay.querySelector(".pdf-loader-detail");
    root._text = overlay.querySelector(".pdf-loader-text");
    root._canvasWrap = canvasWrap;
    root._pageLabel = toolbar.querySelector(".pdf-viewer-page");
    root._prevBtn = toolbar.querySelector(".pdf-prev");
    root._nextBtn = toolbar.querySelector(".pdf-next");
    root._errorBox = errorBox;
    root._loaded = false;
    root._pdfDoc = null;
    root._pages = [];
    root._curPage = 0;
    root._totalPages = 0;
    return root;
  }

  function renderPdfPage(viewer, pageNum) {
    if (!viewer._pdfDoc) return;
    var entry = viewer._pages[pageNum];
    if (!entry || entry.rendered) return;
    entry.rendered = true;

    viewer._pdfDoc.getPage(pageNum + 1).then(function (page) {
      var viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
      var canvas = entry.canvas;
      var ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      page.render({ canvasContext: ctx, viewport: viewport });
    }).catch(function (err) {
      console.error("[site] PDF page render failed:", err);
    });
  }

  function scrollPdfToPage(viewer, pageNum) {
    if (pageNum < 0 || pageNum >= viewer._totalPages) return;
    viewer._curPage = pageNum;
    viewer._pageLabel.textContent = (pageNum + 1) + " / " + viewer._totalPages;
    viewer._prevBtn.disabled = pageNum === 0;
    viewer._nextBtn.disabled = pageNum === viewer._totalPages - 1;

    var entry = viewer._pages[pageNum];
    if (entry && entry.container) {
      viewer._canvasWrap.scrollTo({
        top: entry.container.offsetTop - viewer._canvasWrap.offsetTop - 4,
        behavior: "smooth"
      });
    }

    var start = Math.max(0, pageNum - 4);
    var end = Math.min(viewer._totalPages - 1, pageNum + 4);
    for (var i = start; i <= end; i++) renderPdfPage(viewer, i);
  }

  function setupPdfScrollTracking(viewer) {
    var wrap = viewer._canvasWrap;
    var ticking = false;
    wrap.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var containers = wrap.querySelectorAll(".pdf-viewer-page-wrap");
        var wrapRect = wrap.getBoundingClientRect();
        var best = 0;
        var bestDist = Infinity;

        for (var i = 0; i < containers.length; i++) {
          var rect = containers[i].getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          var dist = Math.abs(mid - (wrapRect.top + wrapRect.height / 2));
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        }
        if (best !== viewer._curPage) {
          viewer._curPage = best;
          viewer._pageLabel.textContent = (best + 1) + " / " + viewer._totalPages;
          viewer._prevBtn.disabled = best === 0;
          viewer._nextBtn.disabled = best === viewer._totalPages - 1;
        }
      });
    }, { passive: true });
  }

  function loadPdf(viewer) {
    if (viewer._loaded) return;
    viewer._loaded = true;
    viewer._text.textContent = "正在下载 PDF...";

    fetch(viewer._src)
      .then(function (resp) {
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        var total = resp.headers.get("Content-Length");
        total = total ? parseInt(total, 10) : 0;
        var reader = resp.body.getReader();
        var chunks = [];
        var received = 0;
        if (total > 0) viewer._detail.textContent = "0 / " + formatSize(total);

        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              var buffer = new Uint8Array(received);
              var pos = 0;
              for (var i = 0; i < chunks.length; i++) {
                buffer.set(chunks[i], pos);
                pos += chunks[i].length;
              }
              viewer._text.textContent = "正在解析 PDF...";
              viewer._barFill.style.width = "100%";
              viewer._detail.textContent = total > 0 ? formatSize(total) : formatSize(received);
              renderPdfWithPDFJS(viewer, buffer.buffer);
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
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 加载失败: " + err.message;
        console.error("[site]", viewer._src, err);
      });
  }

  function renderPdfWithPDFJS(viewer, arrayBuffer) {
    getPDFJS(function (lib) {
      if (!lib) {
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 渲染引擎加载失败";
        return;
      }

      viewer._text.textContent = "正在渲染页面...";
      lib.getDocument({ data: arrayBuffer }).promise.then(function (doc) {
        viewer._pdfDoc = doc;
        viewer._totalPages = doc.numPages;
        viewer._pageLabel.textContent = "1 / " + doc.numPages;
        viewer._prevBtn.disabled = true;
        viewer._nextBtn.disabled = doc.numPages <= 1;

        var frag = document.createDocumentFragment();
        for (var i = 0; i < doc.numPages; i++) {
          var pageWrap = htmlEl("div", { class: "pdf-viewer-page-wrap" });
          var canvas = htmlEl("canvas", { class: "pdf-viewer-canvas" });
          pageWrap.appendChild(canvas);
          frag.appendChild(pageWrap);
          viewer._pages.push({ canvas: canvas, container: pageWrap, rendered: false });
        }
        viewer._canvasWrap.appendChild(frag);

        viewer._overlay.style.opacity = "0";
        setTimeout(function () {
          viewer._overlay.style.display = "none";
        }, 400);

        for (var j = 0; j < doc.numPages; j++) renderPdfPage(viewer, j);
        setupPdfScrollTracking(viewer);

        viewer._prevBtn.onclick = function () {
          scrollPdfToPage(viewer, viewer._curPage - 1);
        };
        viewer._nextBtn.onclick = function () {
          scrollPdfToPage(viewer, viewer._curPage + 1);
        };
        viewer._keyHandler = function (e) {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            scrollPdfToPage(viewer, viewer._curPage - 1);
          } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            scrollPdfToPage(viewer, viewer._curPage + 1);
          }
        };
        document.addEventListener("keydown", viewer._keyHandler);
        activePdfViewers.push(viewer);
      }).catch(function (err) {
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 解析失败: " + err.message;
        console.error("[site]", err);
      });
    });
  }

  function cleanupPdfViewers() {
    for (var i = 0; i < activePdfViewers.length; i++) {
      var viewer = activePdfViewers[i];
      if (viewer._keyHandler) document.removeEventListener("keydown", viewer._keyHandler);
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
