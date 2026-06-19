(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    bindNavigation();
    bindHeroCarousel();
    bindFilters();
    bindPlayers();
  });

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-search-input]");
    var year = document.querySelector("[data-year-filter]");
    var genre = document.querySelector("[data-genre-filter]");
    var clear = document.querySelector("[data-clear-filter]");
    var count = document.querySelector("[data-filter-count]");

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedGenre = genre ? genre.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || "",
          card.dataset.genre || "",
          card.dataset.region || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !selectedYear || card.dataset.year === selectedYear;
        var okGenre = !selectedGenre || (card.dataset.genre || "").indexOf(selectedGenre) !== -1 || haystack.indexOf(selectedGenre.toLowerCase()) !== -1;
        var show = okKeyword && okYear && okGenre;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " / " + cards.length + " 部影片";
      }
    }

    [search, year, genre].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });

    if (clear) {
      clear.addEventListener("click", function () {
        if (search) {
          search.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (genre) {
          genre.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var source = box.dataset.videoSrc;
      var started = false;
      var hls = null;

      function loadAndPlay() {
        if (!video || !source) {
          return;
        }
        if (!started) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else {
            video.src = source;
          }
          started = true;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            loadAndPlay();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
