(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupCarousels() {
        var carousels = document.querySelectorAll('[data-carousel]');
        carousels.forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
            var prev = carousel.querySelector('[data-carousel-prev]');
            var next = carousel.querySelector('[data-carousel-next]');
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
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
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-carousel-dot')) || 0);
                    start();
                });
            });

            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });
    }

    function setupFilters() {
        var forms = document.querySelectorAll('[data-filter-form]');
        forms.forEach(function (form) {
            var section = form.parentElement;
            var input = form.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(form.querySelectorAll('[data-filter]'));
            var result = form.querySelector('[data-result-count]');
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (input && query && !input.value) {
                input.value = query;
            }

            function apply() {
                var text = normalize(input ? input.value : '');
                var activeFilters = {};
                selects.forEach(function (select) {
                    activeFilters[select.getAttribute('data-filter')] = normalize(select.value);
                });

                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var ok = !text || haystack.indexOf(text) !== -1;

                    Object.keys(activeFilters).forEach(function (key) {
                        var value = activeFilters[key];
                        if (value && normalize(card.getAttribute('data-' + key)) !== value) {
                            ok = false;
                        }
                    });

                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll('[data-video-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src');
            var hlsInstance = null;
            var initialized = false;

            if (!video || !button || !source) {
                return;
            }

            function attachSource() {
                if (initialized) {
                    return;
                }
                initialized = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                attachSource();
                video.setAttribute('controls', 'controls');
                player.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupCarousels();
        setupFilters();
        setupPlayers();
    });
})();
