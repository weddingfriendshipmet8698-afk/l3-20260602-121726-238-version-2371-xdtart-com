(function () {
  function formatTime(value) {
    if (!Number.isFinite(value)) {
      return "0:00";
    }
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  window.initializeMoviePlayer = function (sourceUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var progress = shell.querySelector("[data-player-progress]");
    var time = shell.querySelector("[data-player-time]");
    var playButtons = Array.prototype.slice.call(shell.querySelectorAll("[data-player-action='play']"));
    var muteButton = shell.querySelector("[data-player-action='mute']");
    var fullscreenButton = shell.querySelector("[data-player-action='fullscreen']");
    var streamReady = false;
    var hlsInstance = null;

    function attachStream() {
      if (streamReady) {
        return;
      }
      streamReady = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }
    }

    function updateButtons() {
      playButtons.forEach(function (button) {
        button.textContent = video.paused ? "▶" : "❚❚";
      });
      shell.classList.toggle("is-playing", !video.paused);
      if (muteButton) {
        muteButton.textContent = video.muted ? "静音" : "音量";
      }
    }

    function playVideo() {
      attachStream();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function togglePlay() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
      updateButtons();
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", togglePlay);
    });
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updateButtons);
    video.addEventListener("pause", updateButtons);
    video.addEventListener("loadedmetadata", function () {
      if (progress) {
        progress.max = video.duration || 0;
      }
      if (time) {
        time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
      }
    });
    video.addEventListener("timeupdate", function () {
      if (progress) {
        progress.value = video.currentTime || 0;
        progress.max = video.duration || 0;
      }
      if (time) {
        time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
      }
    });
    if (progress) {
      progress.addEventListener("input", function () {
        attachStream();
        video.currentTime = Number(progress.value) || 0;
      });
    }
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        updateButtons();
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
    updateButtons();
  };
})();
