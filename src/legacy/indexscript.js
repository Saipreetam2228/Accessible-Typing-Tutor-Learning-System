// Landing page + embedded profile onboarding.
const KEY_PROFILES = "vv_profiles";
const KEY_ACTIVE = "vv_activeProfile";
const KEY_GREETING_MODE = "vv_greetingMode";

let selectedAvatar = null;

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(KEY_PROFILES) || "[]");
  } catch (e) {
    return [];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
}

function getActiveId() {
  return localStorage.getItem(KEY_ACTIVE) || null;
}

function setActiveId(id) {
  localStorage.setItem(KEY_ACTIVE, id);
}

function getActiveProfile() {
  const id = getActiveId();
  return getProfiles().find((profile) => profile.id === id) || null;
}

function generateId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function goToLevels(mode) {
  if (mode) localStorage.setItem(KEY_GREETING_MODE, mode);
  window.location.href = "home.html";
}

function getModal() {
  return document.getElementById("profileModal");
}

function showScreen(id) {
  ["screenWelcome", "screenProfiles", "screenCreate"].forEach((screenId) => {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.toggle("is-active", screenId === id);
  });
}

function openProfileModal(screenId) {
  const modal = getModal();
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("profile-modal-open");
  showScreen(screenId);

  const firstField = modal.querySelector(
    ".profile-screen.is-active input, .profile-screen.is-active button",
  );
  if (firstField) firstField.focus({ preventScroll: true });
}

function closeProfileModal() {
  const modal = getModal();
  if (!modal) return;

  const hasProfiles = getProfiles().length > 0;

  /* If no profiles exist and user tries to close from screenCreate,
     go back to screenProfiles (which shows "Create a profile to begin")
     instead of blocking the close entirely — X and Cancel always work */
  if (
    !hasProfiles &&
    document.getElementById("screenCreate")?.classList.contains("is-active")
  ) {
    showScreen("screenProfiles");
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("profile-modal-open");
}

function resetCreateForm() {
  const name = document.getElementById("inputName");
  const age = document.getElementById("inputAge");
  const error = document.getElementById("createError");

  if (name) name.value = "";
  if (age) age.value = "";
  if (error) {
    error.textContent = "";
    error.classList.remove("is-visible");
  }

  selectedAvatar = null;
  document.querySelectorAll(".avatar-option").forEach((option) => {
    option.classList.remove("is-selected");
  });
}

function showCreateError(message) {
  const error = document.getElementById("createError");
  if (!error) return;
  error.textContent = message;
  error.classList.add("is-visible");
}

function formatAvatar(profile) {
  if (profile.avatar === "Prem") return "Prem";
  if (profile.avatar === "Shanti") return "Shanti";
  return profile.avatar || "Learner";
}

function renderProfileList() {
  const list = document.getElementById("profileList");
  if (!list) return;

  const profiles = getProfiles();
  list.innerHTML = "";

  if (profiles.length === 0) {
    const empty = document.createElement("p");
    empty.className = "profile-empty";
    empty.textContent = "Create a profile to begin.";
    list.appendChild(empty);
    return;
  }

  profiles.forEach((profile) => {
    const row = document.createElement("div");
    row.className = "profile-row";

    const select = document.createElement("button");
    select.type = "button";
    select.className = "profile-select";

    const avatar = document.createElement("span");
    avatar.className = "profile-avatar-badge";
    avatar.textContent = formatAvatar(profile).charAt(0).toUpperCase();

    const text = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = profile.name;
    const age = document.createElement("small");
    age.textContent = `Age ${profile.age}`;
    text.appendChild(name);
    text.appendChild(age);

    select.appendChild(avatar);
    select.appendChild(text);
    select.addEventListener("click", () => {
      setActiveId(profile.id);
      goToLevels("returning");
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "profile-delete";
    del.textContent = "Remove";
    del.addEventListener("click", () => deleteProfile(profile.id));

    row.appendChild(select);
    row.appendChild(del);
    list.appendChild(row);
  });
}

function deleteProfile(id) {
  const profiles = getProfiles().filter((profile) => profile.id !== id);
  saveProfiles(profiles);
  localStorage.removeItem(`vv_progress_${id}`);
  localStorage.removeItem(`vv_practise_${id}`);
  localStorage.removeItem(`vv_typingResults_${id}`);

  if (getActiveId() === id) localStorage.removeItem(KEY_ACTIVE);

  if (profiles.length === 0) {
    resetCreateForm();
    showScreen("screenCreate");
    showCreateError("Create a new profile to continue.");
  } else {
    renderProfileList();
  }
}

function openHome() {
  const profiles = getProfiles();

  // Always let the learner explicitly choose a profile
  // before entering the game.
  if (profiles.length > 0) {
    renderProfileList();
    openProfileModal("screenProfiles");
  } else {
    resetCreateForm();
    openProfileModal("screenCreate");
  }
}

function openCreateProfile() {
  resetCreateForm();
  openProfileModal("screenCreate");
}

function wireProfileModal() {
  const modal = getModal();
  if (!modal) return;

  document
    .querySelectorAll("[data-close-profile], #profileClose")
    .forEach((control) => {
      control.addEventListener("click", closeProfileModal);
    });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeProfileModal();
    }
  });

  document.querySelectorAll(".avatar-option").forEach((option) => {
    option.addEventListener("click", () => {
      selectedAvatar = option.getAttribute("data-avatar");
      document.querySelectorAll(".avatar-option").forEach((item) => {
        item.classList.toggle("is-selected", item === option);
      });
    });
  });

  document
    .getElementById("btnContinue")
    ?.addEventListener("click", () => goToLevels("returning"));

  document.getElementById("btnSwitchProfile")?.addEventListener("click", () => {
    renderProfileList();
    showScreen("screenProfiles");
  });

  document.getElementById("btnNewProfile")?.addEventListener("click", () => {
    resetCreateForm();
    showScreen("screenCreate");
  });

  document.getElementById("btnCreateCancel")?.addEventListener("click", () => {
    const profiles = getProfiles();
    if (profiles.length > 0) {
      renderProfileList();
      showScreen("screenProfiles");
    } else {
      showCreateError("Please create a profile to continue.");
    }
  });

  document.getElementById("btnCreateSave")?.addEventListener("click", () => {
    const name = document.getElementById("inputName")?.value.trim() || "";
    const age = parseInt(document.getElementById("inputAge")?.value || "", 10);

    if (!name) {
      showCreateError("Please enter a name.");
      return;
    }

    if (!age || age < 4 || age > 99) {
      showCreateError("Please enter a valid age from 4 to 99.");
      return;
    }

    if (!selectedAvatar) {
      showCreateError("Please pick an avatar.");
      return;
    }

    const newProfile = {
      id: generateId(),
      name,
      age,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString(),
    };

    const profiles = getProfiles();
    profiles.push(newProfile);
    saveProfiles(profiles);
    setActiveId(newProfile.id);
    goToLevels("new");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireProfileModal();
  setupMascotAnimations();

  const params = new URLSearchParams(window.location.search || "");
  if (params.get("profile") === "create") {
    resetCreateForm();
    openProfileModal("screenCreate");
  }
});

/**
 * Enhanced Mascot Animation System
 * Smoothly transitions between idle and waving states with image switching
 */
function setupMascotAnimations() {
  const mascots = document.querySelectorAll(".mascot");

  mascots.forEach((mascot) => {
    const wrap = mascot.closest(".mascot-wrap");
    if (!wrap) return;

    const idleImage = mascot.getAttribute("data-idle");
    const waveImage = mascot.getAttribute("data-wave");

    if (!idleImage || !waveImage) return;

    let currentState = "idle";
    let transitionTimeout = null;

    // Hover in - transition to waving
    wrap.addEventListener("mouseenter", () => {
      if (currentState === "waving") return;

      currentState = "waving";

      // Clear any pending transitions
      if (transitionTimeout) clearTimeout(transitionTimeout);

      // Add transitioning class for fade effect
      mascot.classList.add("transitioning");

      // Switch to wave image after fade starts
      transitionTimeout = setTimeout(() => {
        mascot.src = waveImage;

        // Trigger reflow to ensure transition is applied
        void mascot.offsetWidth;

        // Remove transitioning class to fade back in
        mascot.classList.remove("transitioning");

        // Add waving class for enhanced animation
        mascot.classList.add("waving");
      }, 225); // Half of transition duration
    });

    // Touch support for tablets — toggle .touched class on tap
    wrap.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const isTouched = wrap.classList.contains("touched");
        document
          .querySelectorAll(".mascot-wrap")
          .forEach((w) => w.classList.remove("touched"));
        if (!isTouched) wrap.classList.add("touched");
      },
      { passive: false },
    );

    // Hover out - transition back to idle
    wrap.addEventListener("mouseleave", () => {
      if (currentState === "idle") return;

      currentState = "idle";

      // Clear any pending transitions
      if (transitionTimeout) clearTimeout(transitionTimeout);

      // Remove waving animation class
      mascot.classList.remove("waving");

      // Add transitioning class for fade effect
      mascot.classList.add("transitioning");

      // Switch back to idle image after fade starts
      transitionTimeout = setTimeout(() => {
        mascot.src = idleImage;

        // Trigger reflow to ensure transition is applied
        void mascot.offsetWidth;

        // Remove transitioning class to fade back in
        mascot.classList.remove("transitioning");
      }, 225);
    });
  });
}
