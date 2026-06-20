(function () {
  function fixPath(src) {
    return window.location.pathname.includes("/levels/")
      ? src.replace("assets/audio/", "../assets/audio/")
      : src;
  }

  function pickTrack(tracks) {
    var last = localStorage.getItem("type-tutor-last-track") || "";
    var pool = tracks.filter(function (t) {
      return t !== last;
    });
    if (!pool.length) pool = tracks;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    localStorage.setItem("type-tutor-last-track", pick);
    return pick;
  }

  function fadeIn(audio, target) {
    audio.volume = 0;
    var step = target / 30;
    var fade = setInterval(function () {
      if (audio.volume + step >= target) {
        audio.volume = target;
        clearInterval(fade);
      } else {
        audio.volume += step;
      }
    }, 50);
  }

  function startMusic() {
    var audio = document.getElementById("backgroundMusic");
    if (!audio) return;

    /* Detect page fresh every call — works after template injection */
    var p = window.location.pathname;
    var isGamePage = p.includes("/levels/") || p.includes("practice.html");

    var TRACKS = isGamePage
      ? [
          "assets/audio/type1.mp3",
          "assets/audio/type2.mp3",
          "assets/audio/type3.mp3",
        ]
      : [
          "assets/audio/bgm.mp3",
          "assets/audio/bgm2.mp3",
          "assets/audio/bgm3.mp3",
          "assets/audio/bgm4.mp3",
        ];

    var volume = isGamePage ? 0.05 : 0.25;
    var track = fixPath(pickTrack(TRACKS));

    audio.src = track;
    audio.loop = true;

    /* Default sound to ON if never set */
    if (localStorage.getItem("type-tutor-sound") === null) {
      localStorage.setItem("type-tutor-sound", "on");
    }

    /* Sync FAB pill */
    var pill = document.getElementById("fabSoundPill");
    var icon = document.getElementById("fabSoundIcon");
    var label = document.getElementById("fabSoundLabel");
    if (pill) pill.classList.add("on");
    if (icon) icon.textContent = "🔊";
    if (label) label.textContent = "Sound On";

    if (localStorage.getItem("type-tutor-sound") !== "on") return;

    audio
      .play()
      .then(function () {
        fadeIn(audio, volume);
      })
      .catch(function () {
        /* Autoplay blocked — wait for first click */
        document.addEventListener(
          "click",
          function () {
            audio
              .play()
              .then(function () {
                fadeIn(audio, volume);
              })
              .catch(function () {});
          },
          { once: true },
        );
      });

    /* Expose so FAB toggle can restart */
    window._startBgMusic = startMusic;
  }

  /* Works whether DOM is ready or not */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startMusic);
  } else {
    startMusic();
  }

  /* Fires after main.js injects template on level pages */
  document.addEventListener("templateInjected", startMusic);
})();
