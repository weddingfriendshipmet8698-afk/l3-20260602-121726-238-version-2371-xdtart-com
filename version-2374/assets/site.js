function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
}

function setupMenu() {
    document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
        button.addEventListener("click", function () {
            var target = document.getElementById(button.getAttribute("data-menu-toggle"));
            if (target) {
                target.classList.toggle("open");
            }
        });
    });
}

function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
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
        timer = setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function reset() {
        if (timer) {
            clearInterval(timer);
        }
        start();
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
            reset();
        });
    });
    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            reset();
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            reset();
        });
    }
    if (slides.length > 1) {
        start();
    }
}

function setupLocalFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var search = scope.querySelector("[data-local-search]");
        var region = scope.querySelector("[data-region-filter]");
        var year = scope.querySelector("[data-year-filter]");
        var list = document.querySelector("[data-card-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function apply() {
            var q = search ? search.value.trim().toLowerCase() : "";
            var r = region ? region.value : "";
            var y = year ? year.value : "";
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || "",
                    card.dataset.genre || "",
                    card.dataset.tags || "",
                    card.dataset.region || "",
                    card.dataset.year || ""
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && card.dataset.region !== r) {
                    ok = false;
                }
                if (y && card.dataset.year !== y) {
                    ok = false;
                }
                card.hidden = !ok;
            });
        }

        [search, region, year].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
    });
}

function setupPlayer(source) {
    var player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var loaded = false;

    function begin() {
        if (!video || !source) {
            return;
        }
        if (layer) {
            layer.classList.add("hidden");
        }
        if (loaded) {
            video.play().catch(function () {});
            return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
        }
    }

    if (layer) {
        layer.addEventListener("click", begin);
    }
    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("hidden");
        }
    });
}

function createResultCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-mask\">立即观看</span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
        "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p class=\"meta-line\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + item.year + "</p>" +
        "<p class=\"one-line\">" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
        }[char];
    });
}

function renderSearchResults() {
    var box = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    if (!box || !window.SEARCH_MOVIES) {
        return;
    }
    var q = qs("q").trim();
    if (input) {
        input.value = q;
    }
    if (!q) {
        box.innerHTML = "<div class=\"search-empty\">请输入关键词后查看相关影片。</div>";
        return;
    }
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_MOVIES.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(" "), item.oneLine].join(" ").toLowerCase();
        return words.every(function (word) {
            return text.indexOf(word) !== -1;
        });
    }).slice(0, 80);
    if (!matched.length) {
        box.innerHTML = "<div class=\"search-empty\">未找到相关内容，换一个关键词继续搜索。</div>";
        return;
    }
    box.innerHTML = "<div class=\"movie-grid\">" + matched.map(createResultCard).join("") + "</div>";
}

document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
});
