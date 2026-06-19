(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-grid]').forEach(function (area) {
    var grid = area.querySelector('.movie-grid');
    var input = area.querySelector('[data-grid-search]');
    var year = area.querySelector('[data-grid-year]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.type, card.dataset.genre, card.dataset.region].join(' ').toLowerCase();
        var passText = !q || text.indexOf(q) >= 0;
        var passYear = !y || String(card.dataset.year) === y;
        card.style.display = passText && passYear ? '' : 'none';
      });
    }
    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var source = player.dataset.video;
    var started = false;
    function play() {
      if (!video || !source) return;
      player.classList.add('playing');
      if (started) {
        video.play();
        return;
      }
      started = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play();
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.src = source;
          video.play();
        }
      });
    }
    if (cover) cover.addEventListener('click', play);
    if (video) video.addEventListener('click', function () {
      if (!started) play();
    });
  });

  var searchApp = document.querySelector('[data-search-app]');
  if (searchApp && window.SITE_MOVIES) {
    var searchInput = searchApp.querySelector('[data-search-input]');
    var categorySelect = searchApp.querySelector('[data-search-category]');
    var typeSelect = searchApp.querySelector('[data-search-type]');
    var result = searchApp.querySelector('[data-search-result]');
    function render() {
      var q = searchInput.value.trim().toLowerCase();
      var cat = categorySelect.value;
      var type = typeSelect.value;
      var items = window.SITE_MOVIES.filter(function (item) {
        var text = [item.title, item.genre, item.region, item.type, item.tags].join(' ').toLowerCase();
        return (!q || text.indexOf(q) >= 0) && (!cat || item.category === cat) && (!type || item.type === type);
      }).slice(0, 80);
      if (!items.length) {
        result.innerHTML = '<div class="empty-state">没有匹配内容，请更换关键词或筛选条件。</div>';
        return;
      }
      result.innerHTML = items.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + item.url + '">' +
          '<img src="./' + item.image + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + item.year + '</span>' +
          '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
          '<p class="meta-line">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.categoryName) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (s) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[s];
      });
    }
    searchInput.addEventListener('input', render);
    categorySelect.addEventListener('change', render);
    typeSelect.addEventListener('change', render);
    render();
  }
})();
