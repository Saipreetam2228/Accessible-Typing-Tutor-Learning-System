/**
 * ============================================================
 * Home Page - Level Selection
 * ============================================================
 * Generates 32 level buttons with progress stars from localStorage
 */

const TOTAL_LEVELS = 32;
const LEVELS_PER_PAGE = 12;
const KEY_VISIT_PREFIX = "vv_levelVisits_";

// Get active profile ID
function getActiveProfileId() {
  return localStorage.getItem(KEY_ACTIVE) || null;
}

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(KEY_PROFILES) || "[]");
  } catch (e) {
    return [];
  }
}

function getActiveProfile() {
  const profileId = getActiveProfileId();
  return getProfiles().find((profile) => profile.id === profileId) || null;
}

function renderPlayerGreeting() {
  const greeting = document.getElementById("playerGreeting");
  if (!greeting) return;

  const profile = getActiveProfile();

  // Prevent very long names from breaking the UI layout
  const rawName = profile?.name || "Learner";
  const name = rawName.length > 15 ? rawName.substring(0, 12) + "..." : rawName;

  const mode = localStorage.getItem(KEY_GREETING_MODE);
  const profileId = getActiveProfileId();
  const visitKey = `${KEY_VISIT_PREFIX}${profileId || "guest"}`;
  const previousVisits =
    parseInt(localStorage.getItem(visitKey) || "0", 10) || 0;
  const visits = mode === "new" ? 1 : previousVisits + 1;
  localStorage.setItem(visitKey, String(visits));

  const returningMessages =
    visits >= 4
      ? [
          `Welcome Back Champ ✨`,
          `${name} Returns ✨`,
          `Typing Hero Returns 🌟`,
          `You're doing amazing ${name} 🌟`,
          `Ready for another adventure?`,
        ]
      : [`Welcome back ${name} 👋`, `Hi ${name} 👋`, `${name} returns ✨`];

  const text =
    mode === "new"
      ? `Welcome ${name} ✨`
      : returningMessages[visits % returningMessages.length];

  const wrapper = greeting.closest(".player-greeting");
  if (wrapper) {
    wrapper.classList.toggle("is-returning", mode !== "new");
    wrapper.classList.toggle("is-new", mode === "new");
  }

  greeting.textContent = text;
  // Added extra buffer to character count to prevent clipping with non-monospace fonts
  greeting.style.setProperty(
    "--greeting-chars",
    String(Array.from(text).length + 3),
  );

  /* After the pop-in animation plays, fade the whole greeting out
     and collapse its space — it should appear once, then vanish */
  if (wrapper) {
    wrapper.classList.remove("greeting-done");
    /* Force reflow so re-adding the class restarts the animation
       if the user revisits the page in the same session          */
    void wrapper.offsetWidth;
    setTimeout(function () {
      wrapper.classList.add("greeting-done");
    }, 50);
  }

  // Ensure the message does not disappear by forcing visibility & layout overrides
  greeting.style.opacity = "1";
  greeting.style.visibility = "visible";
  greeting.style.overflow = "visible";
  greeting.style.width = "auto";
  greeting.style.whiteSpace = "normal";
  greeting.style.animation = "none";

  localStorage.removeItem(KEY_GREETING_MODE);
}

// Get level progress for active profile
function getLevelProgress() {
  const profileId = getActiveProfileId();
  if (!profileId) return {};

  const key = `vv_progress_${profileId}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch (e) {
    return {};
  }
}

// Get stars for a specific level (1-3 stars, or 0 if not completed)
function getLevelStars(levelNumber) {
  const progress = getLevelProgress();
  const levelKey1 = `level_${levelNumber}`;
  const levelKey2 = `level${levelNumber}`;
  const p = progress[levelKey1] || progress[levelKey2];
  return p ? parseInt(p.stars || 0, 10) : 0;
}

// Get a friendly progress state without gating access.
function getLevelState(levelNumber) {
  const progress = getLevelProgress();
  const levelKey1 = `level_${levelNumber}`;
  const levelKey2 = `level${levelNumber}`;
  const levelProgress = progress[levelKey1] || progress[levelKey2];

  if (
    levelProgress &&
    (levelProgress.completed === true ||
      levelProgress.completed === "true" ||
      parseInt(levelProgress.stars, 10) > 0)
  )
    return "completed";
  if (levelProgress) return "in-progress";

  const completedLevels = Object.keys(progress)
    .map((key) => Number(key.replace("level_", "").replace("level", "")))
    .filter((num) => {
      if (!Number.isFinite(num)) return false;
      const p = progress[`level_${num}`] || progress[`level${num}`];
      return (
        p &&
        (p.completed === true ||
          p.completed === "true" ||
          parseInt(p.stars, 10) > 0)
      );
    });

  const nextSuggestedLevel = completedLevels.length
    ? Math.min(Math.max(...completedLevels) + 1, TOTAL_LEVELS)
    : 1;

  return levelNumber === nextSuggestedLevel ? "in-progress" : "not-started";
}

// Generate level buttons
const LEVEL_CATEGORIES = [
  { label: "Beginner", emoji: "🌱", from: 1, to: 15 },
  { label: "Intermediate", emoji: "⚡", from: 16, to: 26 },
  { label: "Advanced", emoji: "🔥", from: 27, to: 32 },
];

function generateLevelGrid() {
  const grid = document.getElementById("levelsGrid");
  grid.innerHTML = "";

  LEVEL_CATEGORIES.forEach(function (cat) {
    // ── Category banner ──
    const banner = document.createElement("div");
    banner.className = "level-category-banner";
    banner.innerHTML = `<span class="cat-emoji">${cat.emoji}</span><span class="cat-label">${cat.label}</span>`;
    grid.appendChild(banner);

    // ── Level buttons ──
    for (let i = cat.from; i <= cat.to; i++) {
      const btn = document.createElement("button");
      const levelState = getLevelState(i);
      btn.className = `level-btn level-${levelState}`;
      btn.dataset.level = i;
      btn.dataset.state = levelState;
      btn.type = "button";
      btn.setAttribute(
        "aria-label",
        `Open level ${i}, ${levelState.replace("-", " ")}`,
      );

      const stars = getLevelStars(i);

      const numberSpan = document.createElement("span");
      numberSpan.className = "level-number";
      numberSpan.textContent = i;
      btn.appendChild(numberSpan);

      const starsSpan = document.createElement("span");
      starsSpan.className = "level-stars";
      for (let s = 1; s <= 3; s++) {
        const star = document.createElement("span");
        star.className = "star" + (s <= stars ? "" : " empty");
        star.textContent = "★";
        starsSpan.appendChild(star);
      }
      btn.appendChild(starsSpan);

      btn.addEventListener("click", () => {
        window.location.href = `./levels/level${i}.html`;
      });

      grid.appendChild(btn);
    }
  });
}

// Scroll functionality
function setupScrolling() {
  const wrapper = document.querySelector(".levels-grid-wrapper");
  const upBtn = document.getElementById("navUp");
  const downBtn = document.getElementById("navDown");

  const scrollAmount = 200;

  upBtn.addEventListener("click", () => {
    wrapper.scrollBy({
      top: -scrollAmount,
      behavior: "smooth",
    });
  });

  downBtn.addEventListener("click", () => {
    wrapper.scrollBy({
      top: scrollAmount,
      behavior: "smooth",
    });
  });

  // Update button state based on scroll position
  function updateScrollButtons() {
    const isAtTop = wrapper.scrollTop === 0;
    const isAtBottom =
      wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 10;

    upBtn.disabled = isAtTop;
    downBtn.disabled = isAtBottom;
  }

  wrapper.addEventListener("scroll", updateScrollButtons);
  updateScrollButtons();
}

// Select button (optional - just highlights selected level)
function setupSelectButton() {
  const selectBtn = document.getElementById("selectBtn");
  const grid = document.getElementById("levelsGrid");

  selectBtn.addEventListener("click", () => {
    const selected = grid.querySelector(".level-btn.selected");
    if (selected) {
      const levelNum = parseInt(selected.dataset.level);
      window.location.href = `./levels/level${levelNum}.html`;
    }
  });
}

// Verify active profile and open the profile modal if none exists
function ensureProfileReady() {
  const profileId = getActiveProfileId();
  if (profileId) {
    return true;
  }

  renderProfileList();
  const profiles = getProfiles();
  openProfileModal(profiles.length > 0 ? "screenProfiles" : "screenCreate");
  return false;
}

// Back to dashboard (home button)
function setupBackButton() {
  const homeBtn = document.querySelector(".home-link");
  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "dashboard.html";
    });
  }
}

// ===== Progress summary helpers =====
function parseLevelProgressEntries() {
  const progress = getLevelProgress();
  return Object.keys(progress)
    .map((key) => {
      const normalized = key.toLowerCase().replace(/^level_?/, "");
      const levelNumber = parseInt(normalized, 10);
      if (
        !Number.isFinite(levelNumber) ||
        levelNumber < 1 ||
        levelNumber > TOTAL_LEVELS
      ) {
        return null;
      }

      const entry = progress[key] || {};
      const completed =
        entry.completed === true ||
        entry.completed === "true" ||
        parseInt(entry.stars, 10) > 0;

      const accuracyFields = [
        "accuracy",
        "accuracy_percent",
        "accuracyPercent",
        "accuracy_percent_value",
        "accuracyValue",
        "acc",
        "accPercent",
      ];

      let accuracy = null;
      accuracyFields.forEach((field) => {
        if (entry[field] != null && entry[field] !== "") {
          const value = Number(entry[field]);
          if (!Number.isNaN(value)) {
            accuracy = accuracy === null ? value : Math.max(accuracy, value);
          }
        }
      });

      if (accuracy === null && typeof entry === "number") {
        accuracy = entry;
      }

      return {
        levelNumber,
        completed,
        stars: parseInt(entry.stars, 10) || 0,
        accuracy: accuracy === null ? null : Math.round(accuracy),
      };
    })
    .filter(Boolean);
}

function getCompletedLevelsCount() {
  return parseLevelProgressEntries().filter((item) => item.completed).length;
}

function getBestAccuracy() {
  const entries = parseLevelProgressEntries();
  const best = entries.reduce((max, item) => {
    if (item.accuracy != null && !Number.isNaN(item.accuracy)) {
      return Math.max(max, item.accuracy);
    }
    return max;
  }, -Infinity);
  return best === -Infinity
    ? null
    : Math.min(Math.max(Math.round(best), 0), 100);
}

function renderHomeProgressSummary() {
  const completedEl = document.getElementById("completedLevelsCount");
  const accuracyEl = document.getElementById("bestAccuracyValue");

  if (completedEl) {
    completedEl.textContent = String(getCompletedLevelsCount());
  }

  if (accuracyEl) {
    const best = getBestAccuracy();
    accuracyEl.textContent = best !== null ? `${best}%` : "—";
  }
}

/* setupResultsButton() removed — Results is now accessed only
   via the sidebar navigation, per the redesign spec           */

function syncProfileAvatarChip() {
  var img = document.getElementById("profileAvatarChipImg");
  if (!img) return;
  var profile = getActiveProfile();
  var avatarName = (
    profile && profile.avatar ? profile.avatar : "Prem"
  ).toLowerCase();
  img.src = "assets/images/" + avatarName + "/" + avatarName + "-dp.png";
  img.onerror = function () {
    img.src = "assets/images/prem/prem-dp.png";
  };
}

function initHomePage() {
  renderPlayerGreeting();
  renderHomeProgressSummary();
  generateLevelGrid();
  setupScrolling();
  setupSelectButton();
  setupBackButton();
  ensureProfileReady();
  syncProfileAvatarChip();
}

window.addEventListener("DOMContentLoaded", initHomePage);
