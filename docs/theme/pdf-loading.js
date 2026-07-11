/**
 * PDF 加载进度 + 懒加载 + PDF.js canvas 渲染
 *
 * 解决手机上 iframe 嵌入 PDF 只显示第一页的问题：
 *   用 PDF.js 把 PDF 逐页渲染为 canvas，彻底绕过浏览器 PDF 查看器限制。
 *
 * 用法：在 Markdown 中照常写 <iframe src="xxx.pdf"> 即可，脚本会自动替换。
 */
(function () {
  "use strict";

  // ============================================================
  // 配置
  // ============================================================
  var SCRIPT_BASE =
    "https://unpkg.com/pdfjs-dist@4.0.379/build/";
  var ROOT_MARGIN = "300px";
  var RENDER_SCALE = 3;

  // ============================================================
  // 工具
  // ============================================================
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  var SVG_SPINNER =
    '<svg class="pdf-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>' +
    '<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>' +
    "</svg>";

  var SVG_CHEVRON_LEFT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
  var SVG_CHEVRON_RIGHT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  // ============================================================
  // PDF.js 加载（script 标签，兼容性优于动态 import）
  // ============================================================
  var pdfjsLib = null;
  var pdfjsLoading = false;
  var pdfjsQueue = [];

  function getPDFJS(cb) {
    if (pdfjsLib) { cb(pdfjsLib); return; }
    pdfjsQueue.push(cb);
    if (pdfjsLoading) return;
    pdfjsLoading = true;

    import(SCRIPT_BASE + "pdf.min.mjs").then(function (mod) {
      pdfjsLib = mod;
      mod.GlobalWorkerOptions.workerSrc = SCRIPT_BASE + "pdf.worker.min.mjs";
      var q = pdfjsQueue;
      pdfjsQueue = [];
      for (var i = 0; i < q.length; i++) q[i](pdfjsLib);
    }).catch(function (err) {
      console.error("[pdf-loading] PDF.js 加载失败:", err);
      pdfjsLoading = false;
      var q = pdfjsQueue;
      pdfjsQueue = [];
      for (var i = 0; i < q.length; i++) q[i](null);
    });
  }

  // ============================================================
  // 构建 PDF 查看器 DOM
  // ============================================================
  function buildViewer(iframe) {
    var src = iframe.getAttribute("src");
    if (!src || !/\.pdf(\?.*)?(#.*)?$/i.test(src)) return null;

    var width  = iframe.getAttribute("width")  || "100%";
    var height = iframe.getAttribute("height") || "600px";

    // ---- 外壳 ----
    var root = el("div", "pdf-viewer");
    root.style.width  = width;
    root.style.maxWidth = "100%";

    // ---- 工具栏 ----
    var toolbar = el("div", "pdf-viewer-toolbar");
    toolbar.innerHTML =
      '<button class="pdf-viewer-btn pdf-prev" title="上一页" disabled>' + SVG_CHEVRON_LEFT + "</button>" +
      '<span class="pdf-viewer-page">- / -</span>' +
      '<button class="pdf-viewer-btn pdf-next" title="下一页" disabled>' + SVG_CHEVRON_RIGHT + "</button>" +
      '<span class="pdf-viewer-spacer"></span>' +
      '<a class="pdf-viewer-download" title="下载" href="' + src + '" download>' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>' +
        '<line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      "</a>";
    root.appendChild(toolbar);

    // ---- 画布容器 ----
    var canvasWrap = el("div", "pdf-viewer-canvases");
    // 固定高度 + 滚动，防止撑爆页面
    var h = parseInt(height, 10);
    if (isNaN(h) || h <= 0) h = 500;
    h = Math.min(h, Math.round(window.innerHeight * 0.8));
    canvasWrap.style.height = h + "px";
    root.appendChild(canvasWrap);

    // ---- 加载覆盖层 ----
    var overlay = el("div", "pdf-loader-overlay");
    overlay.innerHTML =
      SVG_SPINNER +
      '<div class="pdf-loader-text">准备加载 PDF...</div>' +
      '<div class="pdf-loader-bar-track"><div class="pdf-loader-bar-fill"></div></div>' +
      '<div class="pdf-loader-detail"></div>';
    root.appendChild(overlay);

    // ---- 错误提示 ----
    var errorBox = el("div", "pdf-viewer-error");
    errorBox.style.display = "none";
    root.appendChild(errorBox);

    // ---- 存储引用 ----
    root._src       = src;
    root._overlay   = overlay;
    root._barFill   = overlay.querySelector(".pdf-loader-bar-fill");
    root._detail    = overlay.querySelector(".pdf-loader-detail");
    root._text      = overlay.querySelector(".pdf-loader-text");
    root._canvasWrap = canvasWrap;
    root._toolbar   = toolbar;
    root._pageLabel = toolbar.querySelector(".pdf-viewer-page");
    root._prevBtn   = toolbar.querySelector(".pdf-prev");
    root._nextBtn   = toolbar.querySelector(".pdf-next");
    root._errorBox  = errorBox;
    root._loaded    = false;
    root._pdfDoc    = null;
    root._pages     = [];       // {canvas, container, rendered}
    root._curPage   = 0;        // 0-based
    root._totalPages = 0;

    return root;
  }

  // ============================================================
  // 渲染单页为 canvas
  // ============================================================
  function renderPage(viewer, pageNum) {
    if (!viewer._pdfDoc) return;
    var entry = viewer._pages[pageNum];
    if (!entry || entry.rendered) return;
    entry.rendered = true;

    viewer._pdfDoc.getPage(pageNum + 1).then(function (page) {
      var viewport = page.getViewport({ scale: RENDER_SCALE });
      var canvas = entry.canvas;
      var ctx = canvas.getContext("2d");

      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width  = "100%";
      canvas.style.height = "auto";

      page.render({ canvasContext: ctx, viewport: viewport });
    }).catch(function (err) {
      console.error("[pdf-loading] 渲染第 " + (pageNum + 1) + " 页失败:", err);
    });
  }

  // ============================================================
  // 滚动到当前页（仅移动画布容器，不滚主页面）
  // ============================================================
  function scrollToPage(viewer, pageNum) {
    if (pageNum < 0 || pageNum >= viewer._totalPages) return;
    viewer._curPage = pageNum;
    viewer._pageLabel.textContent = (pageNum + 1) + " / " + viewer._totalPages;
    viewer._prevBtn.disabled = pageNum === 0;
    viewer._nextBtn.disabled = pageNum === viewer._totalPages - 1;

    var entry = viewer._pages[pageNum];
    if (entry && entry.container) {
      var wrap = viewer._canvasWrap;
      // 计算目标页相对于滚动容器的偏移，只滚画布不滚页面
      var offset = entry.container.offsetTop - wrap.offsetTop;
      // 减去一点顶部内边距，让页码工具栏刚好露出
      wrap.scrollTo({ top: offset - 4, behavior: "smooth" });
    }
    // 确保当前页及前后各 4 页已渲染
    var start = Math.max(0, pageNum - 4);
    var end = Math.min(viewer._totalPages - 1, pageNum + 4);
    for (var k = start; k <= end; k++) {
      renderPage(viewer, k);
    }
  }

  // ============================================================
  // 滚动监听：自动更新当前页码
  // ============================================================
  function setupScrollTracking(viewer) {
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

  // ============================================================
  // 下载 PDF + 进度条 + PDF.js 渲染
  // ============================================================
  function loadPDF(viewer) {
    if (viewer._loaded) return;
    viewer._loaded = true;

    var src   = viewer._src;
    var text  = viewer._text;
    var bar   = viewer._barFill;
    var detail = viewer._detail;
    var overlay = viewer._overlay;
    var errorBox = viewer._errorBox;

    text.textContent = "正在下载 PDF...";

    fetch(src)
      .then(function (resp) {
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        var total = resp.headers.get("Content-Length");
        total = total ? parseInt(total, 10) : 0;
        var reader = resp.body.getReader();
        var chunks = [];
        var received = 0;

        if (total > 0) detail.textContent = "0 / " + formatSize(total);

        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              var buffer = new Uint8Array(received);
              var pos = 0;
              for (var i = 0; i < chunks.length; i++) {
                buffer.set(chunks[i], pos);
                pos += chunks[i].length;
              }

              text.textContent = "正在解析 PDF...";
              bar.style.width = "100%";
              detail.textContent = total > 0 ? formatSize(total) : formatSize(received);

              // 交给 PDF.js
              renderWithPDFJS(viewer, buffer.buffer);
              return;
            }

            chunks.push(r.value);
            received += r.value.length;

            if (total > 0) {
              var pct = Math.min(100, Math.round((received / total) * 100));
              bar.style.width = pct + "%";
              detail.textContent = formatSize(received) + " / " + formatSize(total);
              text.textContent = "正在下载 PDF... " + pct + "%";
            } else {
              detail.textContent = formatSize(received);
            }
            return pump();
          });
        }
        return pump();
      })
      .catch(function (err) {
        overlay.style.display = "none";
        errorBox.style.display = "flex";
        errorBox.textContent = "PDF 加载失败: " + err.message;
        console.error("[pdf-loading]", src, err);
      });
  }

  // ============================================================
  // PDF.js 渲染所有页面
  // ============================================================
  function renderWithPDFJS(viewer, arrayBuffer) {
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

        // 先创建所有页面的 canvas 占位
        var frag = document.createDocumentFragment();
        for (var i = 0; i < doc.numPages; i++) {
          var pageWrap = el("div", "pdf-viewer-page-wrap");
          var canvas = el("canvas", "pdf-viewer-canvas");
          pageWrap.appendChild(canvas);
          frag.appendChild(pageWrap);

          viewer._pages.push({
            canvas: canvas,
            container: pageWrap,
            rendered: false
          });
        }
        viewer._canvasWrap.appendChild(frag);

        // 隐藏加载层
        viewer._overlay.style.opacity = "0";
        setTimeout(function () {
          viewer._overlay.style.display = "none";
        }, 400);

        // 只渲染当前页及前后各 4 页，避免手机上一次性渲全部页面 OOM
        var start = Math.max(0, viewer._curPage - 4);
        var end = Math.min(doc.numPages - 1, viewer._curPage + 4);
        for (var j = start; j <= end; j++) {
          renderPage(viewer, j);
        }

        // 滚动跟踪当前页码
        setupScrollTracking(viewer);

        // 工具栏按钮
        viewer._prevBtn.onclick = function () {
          scrollToPage(viewer, viewer._curPage - 1);
        };
        viewer._nextBtn.onclick = function () {
          scrollToPage(viewer, viewer._curPage + 1);
        };

        // 键盘翻页
        viewer._keyHandler = function (e) {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            scrollToPage(viewer, viewer._curPage - 1);
          } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            scrollToPage(viewer, viewer._curPage + 1);
          }
        };
        document.addEventListener("keydown", viewer._keyHandler);

      }).catch(function (err) {
        viewer._overlay.style.display = "none";
        viewer._errorBox.style.display = "flex";
        viewer._errorBox.textContent = "PDF 解析失败: " + err.message;
        console.error("[pdf-loading]", err);
      });
    });
  }

  // ============================================================
  // 全局懒加载入口（组件级：仅 PDF 组件进入视口才开始下载）
  // ============================================================
  var entryObserver;
  try {
    entryObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entryObserver.unobserve(entry.target);
            loadPDF(entry.target);
          }
        });
      },
      { rootMargin: ROOT_MARGIN, threshold: 0.01 }
    );
  } catch (e) {
    entryObserver = null;
  }

  // ============================================================
  // 扫描页面
  // ============================================================
  function scanAndWrap() {
    var iframes = document.querySelectorAll(
      ".md-content iframe[src*='.pdf'], article iframe[src*='.pdf']"
    );

    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.parentNode && iframe.parentNode.classList.contains("pdf-viewer")) continue;

      var viewer = buildViewer(iframe);
      if (!viewer) continue;

      iframe.parentNode.replaceChild(viewer, iframe);

      if (entryObserver) {
        entryObserver.observe(viewer);
      } else {
        loadPDF(viewer);
      }
    }
  }

  // ============================================================
  // 启动
  // ============================================================
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scanAndWrap);
    } else {
      scanAndWrap();
    }
    if (window.document$) {
      window.document$.subscribe(scanAndWrap);
    }
  }

  init();
})();
