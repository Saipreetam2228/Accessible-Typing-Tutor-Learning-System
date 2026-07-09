/* ============================================================
   sidebar.js — Collapsible overlay sidebar
   Works on ALL pages automatically
   ============================================================ */
(function () {
  /* ── Detect current page to highlight active item ── */
  var path = window.location.pathname;
  var isIndex =
    path.endsWith("index.html") || path.endsWith("/") || path === "";
  var isHome = path.endsWith("home.html");
  var isLevels = path.includes("/levels/");
  var isPractice = path.endsWith("practice.html");
  var isResults = path.endsWith("results.html");

  /* ── Path prefix — levels pages need ../ ── */
  var pre = isLevels ? "../" : "";

  /* ── Read active profile from localStorage ── */
  function getActiveProfile() {
    try {
      var profiles = JSON.parse(localStorage.getItem("vv_profiles") || "[]");
      var activeId = localStorage.getItem("vv_activeProfile");
      return (
        profiles.find(function (p) {
          return String(p.id) === String(activeId);
        }) ||
        profiles[0] ||
        null
      );
    } catch (e) {
      return null;
    }
  }

  /* ── Avatar image path ── */
  function getAvatarSrc(profile) {
    if (!profile) return pre + "assets/images/prem/prem-dp.png";
    var name = (profile.avatar || "Prem").toLowerCase();
    return pre + "assets/images/" + name + "/" + name + "-dp.png";
  }

  /* ── Make any user-typed text safe to insert as HTML ── */
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  /* ── Build the sidebar HTML ── */
  function buildSidebar() {
    var profile = getActiveProfile();
    var name = profile ? escapeHtml(profile.name || "Player") : "No profile";
    var age = profile ? "Age " + escapeHtml(profile.age || "—") : "No profile";
    var avatarSrc = getAvatarSrc(profile);

    function activeIf(condition) {
      return condition ? " active" : "";
    }

    var html = `
<!-- Hamburger button -->
<button class="sidebar-hamburger" id="sidebarHamburger" aria-label="Open menu" aria-expanded="false">
  <span class="bar"></span>
  <span class="bar"></span>
  <span class="bar"></span>
</button>

<!-- Click-outside backdrop -->
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>

<!-- Sidebar panel -->
<nav class="sidebar-panel" id="sidebarPanel" aria-label="Main navigation">

  <!-- Header -->
  <div class="sidebar-header">
    <div class="sidebar-brand">
      <img src="${pre}assets/images/ie.png" alt="Logo">
      <div class="sidebar-brand-name">Typing Tutor<br><span style="font-weight:500;font-size:0.75rem;opacity:0.7;">Vidya Vahini</span></div>
    </div>
    <button class="sidebar-close" id="sidebarClose" aria-label="Close menu">✕</button>
  </div>

  <!-- Nav items -->
  <div class="sidebar-nav">

    <span class="sidebar-section-label">Navigation</span>

    <a class="sidebar-item${activeIf(isIndex)}" href="${pre}index.html">
      <span class="sidebar-item-icon si-purple">🏠</span>
      Welcome
    </a>

    <a class="sidebar-item${activeIf(isHome)}" href="${pre}home.html">
      <span class="sidebar-item-icon si-blue">🎮</span>
      Levels
    </a>

    <a class="sidebar-item${activeIf(isPractice)}" href="${pre}practice.html">
      <span class="sidebar-item-icon si-green">⌨️</span>
      Practice
    </a>

    <a class="sidebar-item${activeIf(isResults)}" href="${pre}results.html">
      <span class="sidebar-item-icon si-amber">📊</span>
      My Results
    </a>

    <div class="sidebar-divider"></div>
    <span class="sidebar-section-label">More</span>

    <a class="sidebar-item" href="${pre}home.html#achievements" id="sidebarAchievements">
      <span class="sidebar-item-icon si-pink">🏆</span>
      Achievements
      <span style="margin-left:auto;font-size:0.65rem;padding:2px 7px;background:rgba(248,113,113,0.18);color:#e24b4a;border-radius:999px;font-family:Fredoka,sans-serif;font-weight:700;">Soon</span>
    </a>

    <button class="sidebar-item" id="sidebarSettingsBtn">
      <span class="sidebar-item-icon si-indigo">⚙️</span>
      Settings
    </button>

  </div>

  <!-- Bottom: Profile + Logout -->
  <div class="sidebar-bottom">

    <div class="sidebar-profile-card" id="sidebarProfileCard" title="Switch profile">
      <img class="sidebar-avatar" src="${avatarSrc}" alt="${name}" id="sidebarAvatarImg"
           onerror="this.src='${pre}assets/images/prem/prem-dp.png'">
      <div class="sidebar-profile-info">
        <div class="sidebar-profile-name" id="sidebarProfileName">${name}</div>
        <div class="sidebar-profile-sub" id="sidebarProfileSub">${age}</div>
      </div>
      <span style="font-size:0.8rem;opacity:0.5;">✏️</span>
    </div>

    <button class="sidebar-logout" id="sidebarLogout">
      <span class="sidebar-logout-icon">🚪</span>
      Exit to Welcome
    </button>

  </div>

</nav>
`;

    var container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    /* ── Wire up events ── */
    var hamburger = document.getElementById("sidebarHamburger");
    var panel = document.getElementById("sidebarPanel");
    var backdrop = document.getElementById("sidebarBackdrop");
    var closeBtn = document.getElementById("sidebarClose");

    function openSidebar() {
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
      hamburger.setAttribute("aria-expanded", "true");
      /* Refresh profile info in case it changed */
      var p = getActiveProfile();
      if (p) {
        var nameEl = document.getElementById("sidebarProfileName");
        var subEl = document.getElementById("sidebarProfileSub");
        var imgEl = document.getElementById("sidebarAvatarImg");
        if (nameEl) nameEl.textContent = escapeHtml(p.name || "Player");
        if (subEl) subEl.textContent = "Age " + escapeHtml(p.age || "—");
        if (imgEl) imgEl.src = getAvatarSrc(p);
      }
    }

    function closeSidebar() {
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
    }

    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.classList.contains("is-open") ? closeSidebar() : openSidebar();
    });

    closeBtn.addEventListener("click", closeSidebar);
    backdrop.addEventListener("click", closeSidebar);

    /* Escape key closes sidebar */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSidebar();
    });

    /* Settings button — opens FAB popup if available, else alert */
    var settingsBtn = document.getElementById("sidebarSettingsBtn");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", function () {
        closeSidebar();
        /* Open the FAB popup */
        var fabPopup = document.getElementById("fabPopup");
        var fabBtn = document.getElementById("fabBtn");
        var fabBackdrop = document.getElementById("fabBackdrop");
        if (fabPopup) {
          fabPopup.classList.add("is-open");
          if (fabBackdrop) fabBackdrop.classList.add("is-open");
          if (fabBtn) fabBtn.classList.add("is-open");
        }
      });
    }

    /* Profile card — go to index to switch profile */
    var profileCard = document.getElementById("sidebarProfileCard");
    if (profileCard) {
      profileCard.addEventListener("click", function () {
        closeSidebar();
        if (typeof openProfileModal === "function") {
          /* On index page — open modal directly */
          openProfileModal("screenProfiles");
        } else {
          /* On other pages — go to index */
          window.location.href = pre + "index.html";
        }
      });
    }

    /* Logout — go to welcome page */
    var logoutBtn = document.getElementById("sidebarLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        closeSidebar();
        window.location.href = pre + "index.html";
      });
    }
  }

  /* ── Init ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSidebar);
  } else {
    buildSidebar();
  }
})();
