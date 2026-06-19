(function () {
  var data = window.SEARCH_MOVIES || [];
  var form = document.querySelector('[data-search-page-form]');
  var queryInput = document.querySelector('[data-search-query]');
  var categorySelect = document.querySelector('[data-search-category]');
  var yearSelect = document.querySelector('[data-search-year]');
  var results = document.querySelector('[data-search-results]');

  if (!form || !queryInput || !categorySelect || !yearSelect || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  queryInput.value = params.get('q') || '';

  var categories = Array.from(new Set(data.map(function (item) { return item.category; }))).sort();
  categories.forEach(function (category) {
    var option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  var years = Array.from(new Set(data.map(function (item) { return item.yearNumber; }).filter(Boolean))).sort(function (a, b) { return b - a; });
  years.forEach(function (year) {
    var option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  });

  function matchItem(item, query, category, year) {
    var text = [item.title, item.region, item.type, item.category, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
    var keywordMatch = !query || text.indexOf(query.toLowerCase()) !== -1;
    var categoryMatch = !category || item.category === category;
    var yearMatch = !year || String(item.yearNumber) === year;
    return keywordMatch && categoryMatch && yearMatch;
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="card-year">' + escapeHtml(item.year) + '</span>',
      '<span class="card-play">播放</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render() {
    var query = queryInput.value.trim();
    var category = categorySelect.value;
    var year = yearSelect.value;
    var matched = data.filter(function (item) {
      return matchItem(item, query, category, year);
    });
    matched.sort(function (a, b) {
      return (b.yearNumber || 0) - (a.yearNumber || 0) || a.title.localeCompare(b.title, 'zh-CN');
    });
    var visible = matched.slice(0, 240);
    results.innerHTML = visible.length ? visible.map(card).join('') : '<div class="empty-state">没有找到匹配内容</div>';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
  });

  categorySelect.addEventListener('change', render);
  yearSelect.addEventListener('change', render);
  render();
})();
