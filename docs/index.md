# Welcome

欢迎来到 bfyes

---

!!! info 汇编课友请看

    - 学习汇编语言的同学请参考：[Windows XP on Apple Silicon](https://bfyes.github.io/Virtual-machines-on-Mac/windows-xp-apple-silicon/)

---

!!! info 友情链接

    - Evel1na岗：[Evelina](https://evelina-is.github.io/Evelina_personal_web/)
    - 电科大佬Pastwithin：[Pastwithin](https://pastwithin.github.io/Pastwithin-Zensical/)
    - Orange🍊：[gE](https://0-rangE.cn)

---

## GitHub 贡献图

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-calendar@2.3.2/dist/github-calendar-responsive.css">

<div class="github-calendar-wrap">
  <div id="github-contribution-graph" class="calendar">
    Loading GitHub contributions...
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/github-calendar@2.3.2/dist/github-calendar.min.js"></script>
<script>
  (function () {
    function renderGitHubCalendar() {
      var graph = document.querySelector("#github-contribution-graph");
      if (!graph || graph.dataset.loaded === "true" || typeof GitHubCalendar !== "function") {
        return;
      }

      graph.dataset.loaded = "true";
      GitHubCalendar("#github-contribution-graph", "bfyes", {
        responsive: true,
        global_stats: false,
        tooltips: true,
        cache: 86400,
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderGitHubCalendar);
    } else {
      renderGitHubCalendar();
    }

    if (window.document$) {
      window.document$.subscribe(renderGitHubCalendar);
    }
  })();
</script>
