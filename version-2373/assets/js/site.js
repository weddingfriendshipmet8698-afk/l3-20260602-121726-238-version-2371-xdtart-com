(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      slides[index].classList.remove("is-active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    play();
  }

  function bindFilters() {
    var input = document.querySelector("[data-movie-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeValue = "";

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-meta"));
        var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedChip = !activeValue || haystack.indexOf(activeValue) !== -1;
        card.style.display = matchedText && matchedChip ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeValue = normalize(chip.getAttribute("data-filter-value"));
        apply();
      });
    });
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("load"));
      };
      document.head.appendChild(script);
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var box = document.querySelector(".watch-player");
    if (!box || !streamUrl) {
      return;
    }

    var video = box.querySelector("video");
    var mask = box.querySelector(".player-mask");
    var errorText = box.querySelector(".player-error");
    var prepared = false;
    var hlsInstance = null;

    function showError() {
      if (errorText) {
        errorText.textContent = "视频加载失败，请稍后再试。";
      }
      if (mask) {
        mask.classList.remove("is-hidden");
      }
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
          return;
        }
        video.src = streamUrl;
        video.load();
      });
    }

    function start() {
      if (errorText) {
        errorText.textContent = "";
      }
      prepare().then(function () {
        if (mask) {
          mask.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            if (mask) {
              mask.classList.remove("is-hidden");
            }
          });
        }
      }).catch(showError);
    }

    if (mask) {
      mask.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    video.addEventListener("click", function () {
      if (!prepared) {
        start();
        return;
      }
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
