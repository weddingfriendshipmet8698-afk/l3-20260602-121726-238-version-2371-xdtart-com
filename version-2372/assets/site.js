(() => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (toggle && mobilePanel) {
        toggle.addEventListener('click', () => {
            mobilePanel.classList.toggle('open');
        });
    }

    const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prevButton = document.querySelector('[data-hero-prev]');
    const nextButton = document.querySelector('[data-hero-next]');
    let heroIndex = 0;
    let heroTimer = null;

    const showHero = (index) => {
        if (!heroSlides.length) {
            return;
        }

        heroIndex = (index + heroSlides.length) % heroSlides.length;

        heroSlides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });

        heroDots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    };

    const startHero = () => {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }

        if (heroSlides.length > 1) {
            heroTimer = window.setInterval(() => showHero(heroIndex + 1), 5200);
        }
    };

    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showHero(index);
            startHero();
        });
    });

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            showHero(heroIndex - 1);
            startHero();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            showHero(heroIndex + 1);
            startHero();
        });
    }

    showHero(0);
    startHero();

    const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach((form) => {
        const input = form.querySelector('[data-filter-input]');
        const clear = form.querySelector('[data-filter-clear]');
        const scope = document.querySelector('[data-filter-scope]');
        const tabs = Array.from(document.querySelectorAll('[data-category-filter]'));
        let activeCategory = '';

        const applyFilter = () => {
            if (!scope || !input) {
                return;
            }

            const query = input.value.trim().toLowerCase();
            const cards = Array.from(scope.children);

            cards.forEach((card) => {
                const text = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(' ').toLowerCase();

                const categoryMatch = !activeCategory || card.dataset.category === activeCategory;
                const queryMatch = !query || text.includes(query);
                card.classList.toggle('is-hidden', !(categoryMatch && queryMatch));
            });
        };

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilter();
        });

        if (input) {
            const params = new URLSearchParams(window.location.search);
            const initial = params.get('q');

            if (initial) {
                input.value = initial;
            }

            input.addEventListener('input', applyFilter);
            applyFilter();
        }

        if (clear && input) {
            clear.addEventListener('click', () => {
                input.value = '';
                activeCategory = '';
                tabs.forEach((tab) => tab.classList.toggle('active', !tab.dataset.categoryFilter));
                applyFilter();
            });
        }

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                activeCategory = tab.dataset.categoryFilter || '';
                tabs.forEach((item) => item.classList.toggle('active', item === tab));
                applyFilter();
            });
        });
    });

    const players = Array.from(document.querySelectorAll('[data-player]'));

    const attachSource = (video, sourceUrl) => {
        if (!video || !sourceUrl) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }

        video.src = sourceUrl;
    };

    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        const sourceUrl = video.dataset.src;

        const play = () => {
            if (!video.src) {
                attachSource(video, sourceUrl);
            }

            button.classList.add('hide');
            video.play().catch(() => {
                button.classList.remove('hide');
            });
        };

        button.addEventListener('click', play);
        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', () => button.classList.add('hide'));
    });
})();
