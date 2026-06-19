(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var grid = form.parentElement.querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var count = form.querySelector("[data-filter-count]");
      var params = new URLSearchParams(window.location.search);
      var queryInput = form.querySelector("input[name='q']");
      if (queryInput && params.get("q")) {
        queryInput.value = params.get("q");
      }

      function applyFilter() {
        var query = normalize(queryInput ? queryInput.value : "");
        var region = normalize(form.querySelector("select[name='region']") && form.querySelector("select[name='region']").value);
        var year = normalize(form.querySelector("select[name='year']") && form.querySelector("select[name='year']").value);
        var type = normalize(form.querySelector("select[name='type']") && form.querySelector("select[name='type']").value);
        var sort = form.querySelector("select[name='sort']") ? form.querySelector("select[name='sort']").value : "default";
        var shown = [];

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            shown.push(card);
          }
        });

        shown.sort(function (a, b) {
          if (sort === "newest") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (sort === "heat") {
            return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
          }
          if (sort === "title") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
        });
        shown.forEach(function (card) {
          grid.appendChild(card);
        });
        if (count) {
          count.textContent = shown.length ? "匹配到 " + shown.length + " 部内容" : "没有匹配内容";
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
      Array.prototype.slice.call(form.elements).forEach(function (element) {
        element.addEventListener("input", applyFilter);
        element.addEventListener("change", applyFilter);
      });
      applyFilter();
    });
  }

  function initImageState() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
        if (image.parentElement) {
          image.parentElement.classList.add("is-missing");
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initImageState();
  });
})();
