(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupNav() {
    var toggle = one(".nav-toggle");
    var menu = one(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = one("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(next);
        play();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupSearch() {
    var inputs = all("[data-search-input]");
    inputs.forEach(function (input) {
      var scope = input.closest("section") || document;
      var cards = all(".movie-card", scope);
      if (!cards.length) {
        cards = all(".movie-card");
      }

      function apply(value) {
        var query = String(value || "").trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", function () {
        apply(input.value);
      });

      all("[data-quick-filter]", scope).forEach(function (button) {
        button.addEventListener("click", function () {
          input.value = button.getAttribute("data-quick-filter") || "";
          apply(input.value);
          input.focus();
        });
      });
    });
  }

  window.startPlayer = function (url) {
    var video = one("#moviePlayer");
    var button = one(".player-start");
    if (!video || !button || !url) {
      return;
    }
    var loaded = false;

    function attach() {
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      button.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }

    button.addEventListener("click", attach);
    video.addEventListener("click", function () {
      if (!loaded) {
        attach();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupHero();
    setupSearch();
  });
})();
