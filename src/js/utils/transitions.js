/**
 * Global Page Transition System
 * Implements smooth cinematic transitions between pages
 */

(function() {
  // Inject transition styles early to prevent FOUC
  const style = document.createElement("style");
  style.textContent = `
    /* Base html background to match theme and prevent white flashes */
    html {
      background-color: #cbe8ff; /* Light theme sky-mid */
    }
    html.dark-mode,
    html:has(body.dark-mode) {
      background-color: #2d3e52; /* Dark theme sky-mid */
    }

    /* Body starts hidden and scaled down */
    body {
      opacity: 0;
      transform: scale(0.98);
      transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Class added when page is ready */
    body.page-transition-loaded {
      opacity: 1;
      transform: scale(1);
    }

    /* Class added when leaving page */
    body.page-transition-exiting {
      opacity: 0;
      transform: scale(1.02); /* Cinematic slight zoom-in on exit */
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Apply theme to HTML immediately for proper background color match
  try {
    const theme = localStorage.getItem("type-tutor-theme-preference");
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
    }
  } catch(e) {}

  document.addEventListener("DOMContentLoaded", () => {
    // Fade in on load
    requestAnimationFrame(() => {
      // Small delay for visual polish (allows rendering to settle)
      setTimeout(() => {
        document.body.classList.add("page-transition-loaded");
      }, 50);
    });

    // Intercept standard anchor tags for cinematic exit
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      
      if (link && link.href) {
        // Ignore JS, hash, external links
        if (link.href.startsWith("javascript:") || 
            link.getAttribute("href").startsWith("#") || 
            link.target === "_blank") {
          return;
        }
        
        const url = new URL(link.href);
        // Only intercept local navigation
        if (url.origin === window.location.origin) {
          e.preventDefault();
          window.transitionToPage(link.href);
        }
      }
    });
  });

  // Global function for programmatic transitions
  window.transitionToPage = function(url) {
    document.body.classList.remove("page-transition-loaded");
    document.body.classList.add("page-transition-exiting");
    
    setTimeout(() => {
      window.location.href = url;
    }, 450); // Matches CSS transition duration
  };
})();