/* ============================================================
   fab.js  —  Shared Floating Action Button logic
   Works on ALL pages: index, home, levels, practice, results
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     THEME HELPERS
  ---------------------------------------------------------- */
  function getStoredTheme() {
    return localStorage.getItem("type-tutor-theme-preference") || "light";
  }

  function applyTheme(mode) {
    const isDark = mode === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("type-tutor-theme-preference", mode);

    /* Swap the <link id="theme"> stylesheet — this is what actually
       changes the full page colours on typing and practice pages.
       color.css = light theme, black.css = dark theme              */
    const themeLink = document.getElementById("theme");
    if (themeLink) {
      const inLevels = window.location.pathname.includes("/levels/");
      const base = inLevels ? "../css/" : "css/";
      themeLink.href = base + (isDark ? "black" : "color") + ".css";
    }

    /* Sync FAB toggle pill */
    const pill = document.getElementById("fabThemePill");
    if (pill) pill.classList.toggle("on", isDark);

    /* Sync old legacy theme buttons if they still exist */
    const lightBtn = document.getElementById("themeLightBtn");
    const darkBtn = document.getElementById("themeDarkBtn");
    if (lightBtn) lightBtn.classList.toggle("active", !isDark);
    if (darkBtn) darkBtn.classList.toggle("active", isDark);
  }

  /* ----------------------------------------------------------
     SOUND HELPERS  (only relevant on game / practice pages)
  ---------------------------------------------------------- */
  var soundEnabled = false;

  function getSoundState() {
    return localStorage.getItem("type-tutor-sound") === "on";
  }

  function setSoundState(on) {
    soundEnabled = on;
    localStorage.setItem("type-tutor-sound", on ? "on" : "off");

    const pill = document.getElementById("fabSoundPill");
    const audio = document.getElementById("backgroundMusic");

    if (pill) pill.classList.toggle("on", on);

    if (audio) {
      if (on) {
        /* If music.js already loaded a track just resume it,
           otherwise call the global starter it exposed       */
        if (audio.src && audio.src !== window.location.href) {
          audio.play().catch(function () {});
        } else if (window._startBgMusic) {
          window._startBgMusic();
        }
      } else {
        audio.pause();
      }
    }

    /* Keep legacy soundToggle text in sync if it exists */
    const legacyToggle = document.getElementById("soundToggle");
    if (legacyToggle)
      legacyToggle.textContent = on ? "Sound: On" : "Sound: Off";

    /* Keep legacy vol image in sync */
    const volImg = document.querySelector(".vol");
    if (volImg) {
      const base = volImg.src.includes("assets/images/") ? "" : "";
      volImg.src = on
        ? volImg.src
            .replace("mute.png", "volume.png")
            .replace("volume.png", "volume.png")
        : volImg.src
            .replace("volume.png", "mute.png")
            .replace("mute.png", "mute.png");
      /* simpler approach: */
      if (on) {
        volImg.src = volImg.src.includes("../")
          ? "../assets/images/volume.png"
          : "assets/images/volume.png";
      } else {
        volImg.src = volImg.src.includes("../")
          ? "../assets/images/mute.png"
          : "assets/images/mute.png";
      }
    }
  }

  /* ----------------------------------------------------------
     BUILD THE FAB HTML
     Called once on DOMContentLoaded
  ---------------------------------------------------------- */
  function buildFab() {
    /* Detect if we are inside levels/ (paths need ../) */
    const inLevels = window.location.pathname.includes("/levels/");

    /* Detect which page we're on so we show the right nav link */
    const path = window.location.pathname;
    const isHome = path.endsWith("home.html") || path.endsWith("home");
    const isIndex =
      path.endsWith("index.html") || path.endsWith("/") || path === "";
    const isResults = path.endsWith("results.html") || path.endsWith("results");
    const isPractice =
      path.endsWith("practice.html") || path.endsWith("practice");
    const isLevel = path.includes("/levels/");

    const homeHref = inLevels ? "../home.html" : "home.html";
    const resultsHref = inLevels ? "../results.html" : "results.html";
    const indexHref = inLevels ? "../index.html" : "index.html";

    const initTheme = getStoredTheme();
    const initSound = getSoundState();
    const isDark = initTheme === "dark";

    const html = `
<!-- ── FAB click-outside backdrop ─────────────────────── -->
<div class="fab-backdrop" id="fabBackdrop"></div>

<!-- ── Floating Action Button ─────────────────────────── -->
<div class="fab-wrap" id="fabWrap">

  <!-- popup panel (opens upward) -->
  <div class="fab-popup" id="fabPopup" role="dialog" aria-label="Quick settings">

    <span class="fab-section-label">Navigate</span>

    ${
      !isIndex
        ? `
    <a class="fab-item" href="${indexHref}" id="fabGoWelcome">
      <div class="fab-item-left">
        <span class="fab-icon purple">🏠</span>
        <span class="fab-label">Welcome</span>
      </div>
    </a>`
        : ""
    }

    ${
      !isHome
        ? `
    <a class="fab-item" href="${homeHref}" id="fabGoHome">
      <div class="fab-item-left">
        <span class="fab-icon blue">🎮</span>
        <span class="fab-label">Level Select</span>
      </div>
    </a>`
        : ""
    }

    ${
      !isResults
        ? `
    <a class="fab-item" href="${resultsHref}" id="fabGoResults">
      <div class="fab-item-left">
        <span class="fab-icon green">📊</span>
        <span class="fab-label">My Results</span>
      </div>
    </a>`
        : ""
    }

    <hr class="fab-divider">
    <span class="fab-section-label">Display</span>

    <!-- Theme toggle -->
    <div class="fab-item" id="fabThemeToggle" role="button" tabindex="0" aria-label="Toggle theme">
      <div class="fab-item-left">
        <span class="fab-icon amber" id="fabThemeIcon">${isDark ? "🌙" : "☀️"}</span>
        <span class="fab-label" id="fabThemeLabel">Theme</span> </div>
      <div class="fab-toggle">
        <div class="fab-toggle-pill ${isDark ? "on" : ""}" id="fabThemePill"></div>
      </div>
    </div>

    <hr class="fab-divider">
    <span class="fab-section-label">Sound</span>

    <!-- Sound toggle -->
    <div class="fab-item" id="fabSoundToggle" role="button" tabindex="0" aria-label="Toggle sound">
      <div class="fab-item-left">
        <span class="fab-icon pink" id="fabSoundIcon">${initSound ? "🔊" : "🔇"}</span>
        <span class="fab-label" id="fabSoundLabel">${initSound ? "Sound On" : "Sound Off"}</span>
      </div>
      <div class="fab-toggle">
        <div class="fab-toggle-pill ${initSound ? "on" : ""}" id="fabSoundPill"></div>
      </div>
    </div>

    <!-- Volume slider (shown when sound is on) -->
    <div class="fab-volume-row" id="fabVolumeRow" style="${initSound ? "" : "display:none"}">
      <span class="vol-icon">🔈</span>
      <input type="range" id="fabVolumeSlider" min="0" max="100" value="35" aria-label="Volume">
      <span class="vol-icon">🔊</span>
    </div>

    <hr class="fab-divider">
    <span class="fab-section-label">More</span>

    <!-- Slot 4: Restart / Play Again (shown on level pages) -->
    ${
      isLevel
        ? `
    <div class="fab-item" id="fabRestart" role="button" tabindex="0">
      <div class="fab-item-left">
        <span class="fab-icon red">🔄</span>
        <span class="fab-label">Restart Level</span>
      </div>
    </div>`
        : ""
    }

    <!-- Slot 5: About / Info -->
    <div class="fab-item" id="fabAbout" role="button" tabindex="0">
      <div class="fab-item-left">
        <span class="fab-icon blue">ℹ️</span>
        <span class="fab-label">About</span>
      </div>
    </div>

  </div><!-- end .fab-popup -->

  <!-- The trigger button -->
  <button class="fab-btn" id="fabBtn" aria-label="Open settings" aria-expanded="false">
    ⚙️
  </button>

</div><!-- end .fab-wrap -->
`;

    /* Inject at end of body */
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    /* --------------------------------------------------
       WIRE UP EVENTS
    -------------------------------------------------- */
    const fabBtn = document.getElementById("fabBtn");
    const fabPopup = document.getElementById("fabPopup");
    const fabBackdrop = document.getElementById("fabBackdrop");

    function openFab() {
      fabPopup.classList.add("is-open");
      fabBackdrop.classList.add("is-open");
      fabBtn.classList.add("is-open");
      fabBtn.setAttribute("aria-expanded", "true");
    }

    function closeFab() {
      fabPopup.classList.remove("is-open");
      fabBackdrop.classList.remove("is-open");
      fabBtn.classList.remove("is-open");
      fabBtn.setAttribute("aria-expanded", "false");
    }

    function toggleFab() {
      fabPopup.classList.contains("is-open") ? closeFab() : openFab();
    }

    fabBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFab();
    });

    fabBackdrop.addEventListener("click", closeFab);

    /* Theme toggle */
    const themeToggle = document.getElementById("fabThemeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        const nowDark = document.body.classList.contains("dark-mode");
        const next = nowDark ? "light" : "dark";
        applyTheme(next);
        document.getElementById("fabThemeIcon").textContent =
          next === "dark" ? "🌙" : "☀️";
        document.getElementById("fabThemeLabel").textContent = "Theme";
      });
    }

    /* Sound toggle */
    const soundToggle = document.getElementById("fabSoundToggle");
    if (soundToggle) {
      soundToggle.addEventListener("click", function () {
        const nowOn = getSoundState();
        setSoundState(!nowOn);
        document.getElementById("fabSoundIcon").textContent = !nowOn
          ? "🔊"
          : "🔇";
        document.getElementById("fabSoundLabel").textContent = !nowOn
          ? "Sound On"
          : "Sound Off";
        const volRow = document.getElementById("fabVolumeRow");
        if (volRow) volRow.style.display = !nowOn ? "" : "none";
      });
    }

    /* Also hook the old volume button (volbt) if it still exists, for compatibility */
    const oldVolBtn = document.querySelector(".volbt");
    if (oldVolBtn) {
      oldVolBtn.addEventListener("click", function () {
        const nowOn = getSoundState();
        setSoundState(!nowOn);
        document.getElementById("fabSoundIcon").textContent = !nowOn
          ? "🔊"
          : "🔇";
        document.getElementById("fabSoundLabel").textContent = !nowOn
          ? "Sound On"
          : "Sound Off";
      });
    }

    /* Volume slider */
    const volSlider = document.getElementById("fabVolumeSlider");
    if (volSlider) {
      volSlider.addEventListener("input", function () {
        const audio = document.getElementById("backgroundMusic");
        if (audio) audio.volume = volSlider.value / 100;
        /* Also apply to keypress audio if it exists */
        const kpAudio = document.getElementById("keypressAudio");
        if (kpAudio) kpAudio.volume = (volSlider.value / 100) * 0.6;
      });
    }

    /* Restart level */
    const restartBtn = document.getElementById("fabRestart");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        closeFab();
        window.location.reload();
      });
    }

    /* About popup */
    const aboutBtn = document.getElementById("fabAbout");
    if (aboutBtn) {
      aboutBtn.addEventListener("click", function () {
        closeFab();
        alert(
          "Sri Sathya Sai Vidya Vahini — Typing Tutor\nInclusive Education Project\n\nBuilt with ❤️ for children learning to type.",
        );
      });
    }

    /* Keyboard: Escape closes the FAB */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeFab();
    });

    /* Apply stored theme on load */
    applyTheme(initTheme);
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildFab);
  } else {
    buildFab();
  }
})();
