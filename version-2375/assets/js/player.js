import { H as Hls } from './video-vendor.js';

(function () {
  var video = document.querySelector('[data-player="movie"]');
  var mask = document.querySelector('[data-player-mask]');
  var button = document.querySelector('[data-play-trigger]');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream') || '';
  var hls = null;

  function loadStream() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlay() {
    loadStream();
    video.controls = true;
    if (mask) {
      mask.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener('click', startPlay);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlay();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
