(function () {
  "use strict";

  window.bfyes = window.bfyes || {};
  var htmlEl = window.bfyes.htmlEl;
  var previewUrl = window.bfyes.previewUrl;
  var upgradeImages = window.bfyes.upgradeImages;

  var FRIENDS_URL = "theme/friends.json";

  function friendInitials(name, github) {
    var source = (name || github || "?").trim();
    if (!source) return "?";
    if (/^[\u4e00-\u9fa5]/.test(source)) return source.slice(0, 1);
    var parts = source.split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2);
  }

  function friendUrl(friend) {
    if (friend.url) return friend.url;
    if (friend.github) return "https://github.com/" + encodeURIComponent(friend.github);
    return "#";
  }

  function renderFriends(container, friends) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < friends.length; i++) {
      var friend = friends[i];
      var link = htmlEl("a", {
        class: "home-friend",
        href: friendUrl(friend),
        target: "_blank",
        rel: "noopener"
      });

      var avatar = htmlEl("span", { class: "home-friend__avatar" }, friendInitials(friend.name, friend.github));
      var avatarSrc = friend.avatar || (friend.github ? "https://github.com/" + encodeURIComponent(friend.github) + ".png?size=96" : "");
      if (avatarSrc) {
        var previewSrc = friend.avatar && !/^https?:\/\//i.test(avatarSrc) ? previewUrl(avatarSrc) : avatarSrc;
        var img = htmlEl("img", {
          src: previewSrc,
          alt: "",
          loading: "lazy"
        });
        if (previewSrc !== avatarSrc) img.dataset.fullsrc = avatarSrc;
        img.onerror = function () {
          var fullSrc = this.dataset.fullsrc;
          if (fullSrc && this.getAttribute("src") !== fullSrc) {
            this.removeAttribute("data-fullsrc");
            this.src = fullSrc;
            return;
          }
          this.remove();
        };
        avatar.appendChild(img);
      }

      link.appendChild(avatar);
      link.appendChild(htmlEl("strong", null, friend.name || friend.github || "friend"));
      link.appendChild(htmlEl("span", { class: "home-friend__handle" }, friend.github ? "@" + friend.github : ""));
      if (friend.description) link.appendChild(htmlEl("span", { class: "home-friend__meta" }, friend.description));
      if (friend.location) link.appendChild(htmlEl("span", { class: "home-friend__meta" }, friend.location));
      frag.appendChild(link);
    }

    container.innerHTML = "";
    container.appendChild(frag);
    upgradeImages(container);
  }

  function initFriends(root) {
    var container = (root || document).querySelector(".home-link-grid");
    if (!container || container.dataset.friendsReady === "true") return;

    fetch(FRIENDS_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (friends) {
        renderFriends(container, friends || []);
        container.dataset.friendsReady = "true";
      })
      .catch(function () {
        container.innerHTML = '<div class="home-friend-loading">Links failed to load.</div>';
      });
  }

  window.bfyes.onPageReady(initFriends);
})();
