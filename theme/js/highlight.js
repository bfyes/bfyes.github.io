/**
 * highlight.js 运行时语法高亮（用法与 MathJax 相同：CDN 引入 + 本脚本控制渲染）。
 *
 * 背景：全局改用 highlight.js 取代 Pygments 构建时高亮，分词语义与 GitHub/VS Code
 * 一致（asm 的 mov 等助记符归到 keyword），用官方 github 明暗两套配色复刻 GitHub 观感。
 *
 * - theme 切换：复用 theme-sync.js 暴露的 window.site.theme，切换 github / github-dark。
 * - 页面导航：订阅 document$，在每次（含 instant 无刷新）渲染完成后重新高亮。
 * - 行号：轻量实现——高亮后把每个 <code> 按换行拆成 <span class="bfy-line"> 块，
 *   行号用 CSS counter 渲染（::before），不拆表格、不污染复制文本。
 */
(function () {
  "use strict";

  var hljsLib = window.hljs;
  if (!hljsLib) return;

  var STYLE_ID = "hljs-theme";
  var DARK_URL = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
  var LIGHT_URL = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

  /** 预加载非当前主题的 CSS（用 preload 不阻塞渲染，切换时零延迟）。 */
  function preloadAlternate(mode) {
    var altUrl = mode === "dark" ? LIGHT_URL : DARK_URL;
    var preloadId = "hljs-theme-preload";
    if (document.getElementById(preloadId)) return;
    var preload = document.createElement("link");
    preload.id = preloadId;
    preload.rel = "preload";
    preload.as = "style";
    preload.href = altUrl;
    document.head.appendChild(preload);
  }

  /** 根据 currentMode('light'/'dark') 应用对应 github 主题样式表。 */
  function applyTheme(mode) {
    var link = document.getElementById(STYLE_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = STYLE_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    var url = mode === "dark" ? DARK_URL : LIGHT_URL;
    if (link.href !== url) link.href = url;
    preloadAlternate(mode);
    return link;
  }

  function whenThemeReady(callback) {
    var link = applyTheme(currentMode());
    if (link.sheet) {
      callback();
      return;
    }
    // CSS 没加载完，等 load 事件；如果 preload 已完成 load 不会再来，
    // 用 document.fonts.ready 兜底（字体加载完时 CSS 一定也好了）
    link.addEventListener("load", callback, { once: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(callback);
    }
  }

  /** 高亮当前根内的所有代码块。 */
  function highlightRoot(root) {
    if (!hljsLib.highlightElement) return;
    root = root || document;
    var blocks = root.querySelectorAll("pre code[class*='language-'], pre code.highlight");
    blocks.forEach(function (el) {
      if (el.dataset.hljsDone === "1") return; // 已高亮则跳过，避免 instant 导航重复
      // 汇编语言重映射：pymdownx 的 ```asm 生成 language-asm，
      // 而 hljs 里 x86 汇编注册名是 x86asm（Intel 语法）。
      if (el.classList && el.classList.contains("language-asm")) {
        el.classList.remove("language-asm");
        el.classList.add("language-x86asm");
      }
      hljsLib.highlightElement(el);
      el.dataset.hljsDone = "1";
    });
  }

  function currentMode() {
    if (window.site && window.site.theme && window.site.theme.mode) {
      return window.site.theme.mode; // 'light' | 'dark'
    }
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // 主题切换：复用 theme-sync.js 的 subscribe（立即回调一次当前 mode）
  if (window.site && window.site.theme && window.site.theme.subscribe) {
    window.site.theme.subscribe(applyTheme);
  }

  // 与 MathJax 一样，document$ 同时覆盖首次页面完成与 instant 无刷新导航。
  if (window.document$) {
    window.document$.subscribe(function () {
      whenThemeReady(function () { highlightRoot(document); });
    });
  } else {
    whenThemeReady(function () { highlightRoot(document); });
  }
})();
