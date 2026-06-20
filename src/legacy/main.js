// ── Audio ─────────────────────────────────────────────────
const keySound = new Audio("../assets/audio/keypress.mp3");
const errorSound = new Audio("../assets/audio/wrong.mp3");
const applaudSound = new Audio("../assets/audio/applaud.mp3");
const backgroundMusic = new Audio("../assets/audio/bgm.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

//  STEP 1 — Fetch template.html and inject into page,
//           then boot the engine.

fetch("../levels/template.html")
  .then(function (response) {
    if (!response.ok) throw new Error("template.html not found");
    return response.text();
  })
  .then(function (html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const templateLink = doc.querySelector("link#theme");
    if (templateLink) {
      const existing = document.getElementById("theme");
      if (existing) {
        existing.href = ".." + templateLink.href;
      } else {
        document.head.appendChild(document.importNode(templateLink, true));
      }
    }

    document.body.innerHTML = doc.body.innerHTML;

    /* Also inject CSS links from template <head> that aren't already loaded */
    doc.head
      .querySelectorAll("link[rel='stylesheet']")
      .forEach(function (oldLink) {
        var href = oldLink.getAttribute("href");
        if (!href) return;
        /* Fix relative path — template paths start with ../ which is correct */
        if (!document.querySelector("link[href='" + href + "']")) {
          var newLink = document.createElement("link");
          newLink.rel = "stylesheet";
          newLink.href = href;
          document.head.appendChild(newLink);
        }
      });

    /* Re-run scripts from template — both inline and external src */
    function loadScriptsSequentially(scripts, index) {
      if (index >= scripts.length) {
        bootEngine();
        return;
      }
      var oldScript = scripts[index];
      var newScript = document.createElement("script");
      if (oldScript.src || oldScript.getAttribute("src")) {
        /* External script — set src and wait for it to load before next */
        newScript.src = oldScript.getAttribute("src");
        newScript.onload = function () {
          loadScriptsSequentially(scripts, index + 1);
        };
        newScript.onerror = function () {
          /* If one fails, still continue */
          loadScriptsSequentially(scripts, index + 1);
        };
        document.body.appendChild(newScript);
      } else {
        /* Inline script — run immediately */
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
        loadScriptsSequentially(scripts, index + 1);
      }
    }

    var allScripts = Array.from(doc.body.querySelectorAll("script"));
    loadScriptsSequentially(allScripts, 0);

    setTimeout(function () {
      document.dispatchEvent(new Event("templateInjected"));
    }, 300);
  })
  .catch(function (err) {
    document.body.innerHTML =
      "<div style='font-family:sans-serif;padding:40px;color:red;'>" +
      "<h2>Could not load template.html</h2>" +
      "<p>Make sure you are running this with a local server (e.g. VS Code Live Server).</p>" +
      "<p>Error: " +
      err.message +
      "</p>" +
      "</div>";
  });

// ============================================================
//  STEP 2 — Engine boots after template is injected
// ============================================================
function bootEngine() {
  let virtualShift = false;
  let virtualCaps = false;

  // ── Set mascot image based on active profile's avatar ──
  (function () {
    try {
      var activeId = localStorage.getItem("vv_activeProfile");
      var profiles = JSON.parse(localStorage.getItem("vv_profiles") || "[]");
      var profile = profiles.find(function (p) {
        return p.id === activeId;
      });
      var avatar =
        profile && profile.avatar ? profile.avatar.toLowerCase() : "prem";
      var mascotImg = document.getElementById("mascotImg");
      if (mascotImg) {
        mascotImg.src =
          "../assets/images/" + avatar + "/" + avatar + "-celb.png";
      }
    } catch (e) {}
  })();
  // ── Show number row always ───────────────
  const numRow = document.getElementById("number-row");
  if (numRow) numRow.style.display = "";

  // ── Show timer if this level needs it ────────────────────
  if (levelConfig.hasTimer) {
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.style.display = "";
  }

  // ── Resolve DOM elements ─────────────────────────────────
  const keysToTypeElement = document.getElementById("keysToTypeSpan");
  const messageElement = document.getElementById("message");
  const blury = document.querySelector(".blur");
  const mascot = document.querySelector(".mascot");
  const congo = document.querySelector(".congo");
  const restart = document.querySelector(".restart");
  const home = document.querySelector(".home");
  const next = document.querySelector(".next");
  const lnum = document.querySelector(".lh");
  const rnum = document.querySelector(".rh");
  const volButton = document.querySelector(".volbt");
  const timerElement = document.getElementById("timer");
  const timerPausedOverlay = document.getElementById("timerPausedOverlay");

  // ── Set restart / next hrefs from levelConfig ────────────
  if (restart) restart.href = levelConfig.restartPage;
  if (next) next.href = levelConfig.nextPage;
  if (home) home.href = "../home.html";

  // ── Prevent spacebar from clicking volume button ─────────
  if (volButton) {
    volButton.addEventListener("keydown", function (event) {
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
      }
    });
  }

  // ── Runtime state ────────────────────────────────────────
  let currentStage = 0;
  let userInput = "";
  let soundEnabled = false;
  let startTime = null;
  let timerInterval = null;
  let pausedTime = 0;
  let inactivityTimer = null;
  let isPaused = false;
  let highlightEnabled = true;
  let highlightEl = null;

  // ── Session tracking ─────────────────────────────────────
  const currentLevel = levelConfig.currentLevel;
  const sessionStart = new Date().toISOString();
  let sessionKeystrokes = []; // {expected, typed, correct}
  let currentAttempt = []; // tuples for results.html

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function saveSession() {
    var totalChars = stages.reduce(function (a, s) {
      return a + s.length;
    }, 0);
    var totalWords = stages.reduce(function (a, s) {
      return a + s.trim().split(/\s+/).length;
    }, 0);
    var elapsed = levelConfig.hasTimer
      ? pausedTime +
        (startTime ? Math.floor((new Date() - startTime) / 1000) : 0)
      : Math.floor((new Date() - new Date(sessionStart)) / 1000);
    var correct = sessionKeystrokes.filter(function (k) {
      return k.correct;
    }).length;
    var totalChars = stages.reduce(function (a, s) {
      return a + s.length;
    }, 0);
    var wrongCount = sessionKeystrokes.filter(function (k) {
      return !k.correct;
    }).length;
    var accuracy =
      totalChars > 0
        ? Math.max(
            0,
            Math.round(((totalChars - wrongCount) / totalChars) * 100),
          )
        : 100;
    var wpm = elapsed > 0 ? Math.round(totalWords / (elapsed / 60)) : 0;

    var session = {
      session_id: generateId(),
      timestamp: sessionStart,
      mode: "learn",
      level: currentLevel,
      total_time_seconds: elapsed,
      total_words: totalWords,
      total_characters: totalChars,
      wpm: wpm,
      accuracy_percent: accuracy,
      keystrokes: sessionKeystrokes,
    };

    var history = [];
    try {
      history = JSON.parse(localStorage.getItem("typingHistory")) || [];
    } catch (e) {}
    history.push(session);
    localStorage.setItem("typingHistory", JSON.stringify(history));
    saveLevelProgress(session);
  }

  function saveAttemptForResults(attemptArray) {
    try {
      var profileId = getActiveProfileId();
      var storageKey = profileId
        ? "vv_typingResults_" + profileId
        : "typingResults";
      var raw = localStorage.getItem(storageKey);
      var store = raw ? JSON.parse(raw) : { results: {} };
      if (!store.results) store.results = {};
      var lvl = levelConfig.currentLevel;
      if (!store.results[lvl]) store.results[lvl] = [];
      store.results[lvl].push(attemptArray);
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch (e) {}
  }

  function getActiveProfileId() {
    return localStorage.getItem("vv_activeProfile") || null;
  }

  function computeStars(accuracy) {
    if (accuracy >= 95) return 3;
    if (accuracy >= 85) return 2;
    return 1;
  }

  function saveLevelProgress(session) {
    var profileId = getActiveProfileId();
    if (!profileId) return;

    var progressKey = "vv_progress_" + profileId;
    var progress = {};
    try {
      progress = JSON.parse(localStorage.getItem(progressKey) || "{}");
    } catch (e) {}

    var levelName = session.level || currentLevel;
    var levelKey =
      typeof levelName === "string" && levelName.trim().length > 0
        ? levelName.replace(/^level_?/i, "level_")
        : "level_" + currentLevel.replace(/^level_?/i, "");

    if (!/^level_\d+$/i.test(levelKey)) {
      levelKey = "level_" + currentLevel.replace(/^level_?/i, "");
    }

    var existing = progress[levelKey] || {};
    var previousAccuracy =
      parseInt(
        existing.accuracy_percent ||
          existing.accuracyPercent ||
          existing.accuracy ||
          0,
        10,
      ) || 0;
    var previousStars = parseInt(existing.stars || 0, 10) || 0;

    var bestAccuracy = Math.max(
      previousAccuracy,
      parseInt(session.accuracy_percent || session.accuracy || 0, 10),
    );
    var stars = Math.max(previousStars, computeStars(bestAccuracy));

    progress[levelKey] = {
      completed: true,
      stars: stars,
      accuracy_percent: bestAccuracy,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (e) {
      console.warn("Unable to save level progress", e);
    }
  }

  function pauseTimer() {
    if (!isPaused && startTime && timerInterval) {
      isPaused = true;
      clearInterval(timerInterval);
      timerInterval = null;
      pausedTime += Math.floor((new Date() - startTime) / 1000);
      startTime = null;
      if (timerPausedOverlay) timerPausedOverlay.style.display = "flex";
    }
  }

  function resumeTimer() {
    if (isPaused) {
      isPaused = false;
      startTime = new Date();
      timerInterval = setInterval(function () {
        const elapsed =
          pausedTime + Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (elapsed % 60).toString().padStart(2, "0");
        if (timerElement)
          timerElement.textContent = "Time: " + minutes + ":" + seconds;
      }, 1000);
      if (timerPausedOverlay) timerPausedOverlay.style.display = "none";
    }
  }

  function startTimer() {
    if (!startTime && timerElement) {
      startTime = new Date();
      timerInterval = setInterval(function () {
        var elapsed = pausedTime + Math.floor((new Date() - startTime) / 1000);
        var minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0");
        var seconds = (elapsed % 60).toString().padStart(2, "0");
        timerElement.textContent = "Time: " + minutes + ":" + seconds;

        /* ── Live HUD timer ── */
        var hudTimer = document.getElementById("hudTimer");
        var hudTimerBlock = document.getElementById("hudTimerBlock");
        if (hudTimer) hudTimer.textContent = minutes + ":" + seconds;
        if (hudTimerBlock) hudTimerBlock.style.display = "";

        /* Live HUD WPM -- */
        if (elapsed > 0 && userInput.length > 0) {
          var words = userInput.trim().split(/\s+/).filter(Boolean).length || 1;
          var liveWpm = Math.round(words / (elapsed / 60));
          var hudWpm = document.getElementById("hudWpm");
          if (hudWpm) hudWpm.textContent = liveWpm;
        }
      }, 1000);
    }
  }

  function stopTimer() {
    if (startTime && timerInterval) {
      clearInterval(timerInterval);
      const totalTime =
        pausedTime + Math.floor((new Date() - startTime) / 1000);
      const minutes = Math.floor(totalTime / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (totalTime % 60).toString().padStart(2, "0");
      if (timerElement) {
        timerElement.textContent = "Time: " + minutes + ":" + seconds;
      }
      return totalTime;
    }
    return 0;
  }

  function calculateMetrics(totalTime) {
    if (totalTime === 0) return { wpm: 0, lps: 0, totalTime: 0 };
    let totalChars = 0;
    let totalWords = 0;
    stages.forEach(function (stage) {
      totalChars += stage.length;
      totalWords += stage.split(" ").length;
    });
    const wpm = Math.round(totalWords / (totalTime / 60)) || 0;
    const lps = Number((totalChars / totalTime).toFixed(2)) || 0;
    return { wpm: wpm, lps: lps, totalTime: totalTime };
  }

  // ==========================================================
  //  NEXT KEY HIGHLIGHT
  // ==========================================================
  function clearNextKeyHighlight() {
    if (highlightEl) {
      highlightEl.classList.remove("next-key-highlight");
      highlightEl = null;
    }
    document
      .querySelector('[data-key="16"]')
      ?.classList.remove("next-key-highlight");
    document
      .querySelector('[data-key="16-R"]')
      ?.classList.remove("next-key-highlight");
  }

  function applyNextKeyHighlight(char) {
    clearNextKeyHighlight();
    if (!highlightEnabled) return;

    const leftHandKeys = [
      "q",
      "w",
      "e",
      "r",
      "t",
      "a",
      "s",
      "d",
      "f",
      "g",
      "z",
      "x",
      "c",
      "v",
      "b",
    ];
    const rightHandKeys = [
      "y",
      "u",
      "i",
      "o",
      "p",
      "h",
      "j",
      "k",
      "l",
      "n",
      "m",
    ];
    const leftShiftSymbols = ["!", "@", "#", "$", "%"];
    const rightShiftSymbols = [
      "^",
      "&",
      "*",
      "(",
      ")",
      "+",
      "_",
      "~",
      ":",
      '"',
      "?",
      ">",
    ];

    const isUpperCase = char.length === 1 && /[A-Z]/.test(char);
    const lc = char.toLowerCase();

    let target;
    if (char === "shift-l") {
      target = document.querySelector('[data-key="16"]');
    } else if (char === "shift-r") {
      target = document.querySelector('[data-key="16-R"]');
    } else if (char === "'" || char === '"') {
      target = document.querySelector('[data-key="222"]');
    } else if (char === " ") {
      target = document.querySelector('[data-key="32"]');
    } else {
      target = document.querySelector(
        '[data-char*="' + char.toUpperCase() + '"]',
      );
    }

    if (target) {
      target.classList.add("next-key-highlight");
      highlightEl = target;
    }

    // Highlight the required shift key alongside the letter/symbol key
    if (isUpperCase && leftHandKeys.includes(lc)) {
      document
        .querySelector('[data-key="16-R"]')
        ?.classList.add("next-key-highlight");
    } else if (isUpperCase && rightHandKeys.includes(lc)) {
      document
        .querySelector('[data-key="16"]')
        ?.classList.add("next-key-highlight");
    } else if (leftShiftSymbols.includes(char)) {
      document
        .querySelector('[data-key="16-R"]')
        ?.classList.add("next-key-highlight");
    } else if (rightShiftSymbols.includes(char) || char === '"') {
      document
        .querySelector('[data-key="16"]')
        ?.classList.add("next-key-highlight");
    }
  }

  // ==========================================================
  //  UPDATE DISPLAY
  // ==========================================================
  function updateDisplay() {
    const correctText = stages[currentStage];

    // Decide which mode to use
    const useBoxes =
      levelConfig.useLetterBoxes &&
      currentStage < (levelConfig.switchToParaAt ?? Infinity);

    if (useBoxes) {
      // ── BOX MODE (early stages) ──────────────────────────────
      let displayText = "";

      for (let i = 0; i < correctText.length; i++) {
        const isSpace = correctText[i] === " ";
        let className = "letterBox" + (isSpace ? " space" : "");

        if (i < userInput.length) {
          className += userInput[i] === correctText[i] ? " correct" : " wrong";
        }

        const ch = isSpace ? "␣" : correctText[i];
        displayText += '<span class="' + className + '">' + ch + "</span>";
      }

      keysToTypeElement.innerHTML = displayText;
    } else {
      // ── PARAGRAPH MODE (later stages) ───────────────────────
      let html = "";

      // Show current stage + up to 3 upcoming stages below it
      const lastVisible = Math.min(currentStage + 4, stages.length);

      for (let s = currentStage; s < lastVisible; s++) {
        if (s === currentStage) {
          // Active line — render character by character
          let lineHtml = "";

          for (let i = 0; i < stages[s].length; i++) {
            const ch = stages[s][i] === " " ? "&nbsp;" : stages[s][i];

            if (i < userInput.length) {
              const cls = userInput[i] === stages[s][i] ? "correct" : "wrong";
              lineHtml += '<span class="' + cls + '">' + ch + "</span>";
            } else if (i === userInput.length) {
              // Cursor position — give it a special class
              lineHtml += '<span class="cursor">' + ch + "</span>";
            } else {
              lineHtml += '<span class="pending">' + ch + "</span>";
            }
          }

          html += '<div class="paraLine active">' + lineHtml + "</div>";
        } else {
          // Upcoming lines — plain dimmed text, escape HTML just in case
          const safe = stages[s]
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          html += '<div class="paraLine">' + safe + "</div>";
        }
      }

      keysToTypeElement.innerHTML = html;
    }

    // ── Common: message, key highlight, hand images ──────────
    messageElement.textContent =
      "Stage " + (currentStage + 1) + " of " + stages.length;

    if (userInput.length < correctText.length) {
      applyNextKeyHighlight(correctText[userInput.length]);
      updateHands(correctText[userInput.length]);
    } else {
      if (lnum) lnum.src = "../assets/images/letters/left_idle.webp";
      if (rnum) rnum.src = "../assets/images/letters/right_idle.webp";
      clearNextKeyHighlight();
    }
  }

  // ==========================================================
  //  CONGRATS OVERLAY
  // ==========================================================
  function showCongrats() {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
    clearNextKeyHighlight();

    // ── Compute stats ──────────────────────────────────────
    var _elapsed = levelConfig.hasTimer
      ? pausedTime +
        (startTime ? Math.floor((new Date() - startTime) / 1000) : 0)
      : Math.floor((new Date() - new Date(sessionStart)) / 1000);
    // Total characters = sum of all stage lengths (each position counts once)
    var _totalChars = stages.reduce(function (a, s) {
      return a + s.length;
    }, 0);
    // Wrong keypresses = keystrokes where correct===false (retries on same position)
    var _wrongCount = sessionKeystrokes.filter(function (k) {
      return !k.correct;
    }).length;
    // Accuracy = (total positions - wrong attempts) / total positions * 100
    // Clamped to 0 minimum
    var _acc =
      _totalChars > 0
        ? Math.max(
            0,
            Math.round(((_totalChars - _wrongCount) / _totalChars) * 100),
          )
        : 100;
    var _words = stages.reduce(function (a, s) {
      return a + s.trim().split(/\s+/).length;
    }, 0);
    var _wpm = _elapsed > 0 ? Math.round(_words / (_elapsed / 60)) : 0;
    var _mm = Math.floor(_elapsed / 60)
      .toString()
      .padStart(2, "0");
    var _ss = (_elapsed % 60).toString().padStart(2, "0");

    // ── Populate stat boxes ───────────────────────────────
    var wpmEl = document.getElementById("statWpm");
    var accEl = document.getElementById("statAccuracy");
    var timeEl = document.getElementById("statTime");
    if (wpmEl) wpmEl.textContent = _wpm;
    if (accEl) accEl.textContent = _acc + "%";
    if (timeEl) timeEl.textContent = _mm + ":" + _ss;

    // ── Analyse errors ────────────────────────────────────
    var errorMap = {};
    sessionKeystrokes.forEach(function (k) {
      if (!k.correct) {
        var pair = k.expected + "→" + k.typed;
        errorMap[pair] = (errorMap[pair] || 0) + 1;
      }
    });

    var errorPairs = Object.keys(errorMap)
      .map(function (pair) {
        return { pair: pair, count: errorMap[pair] };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 3);

    // ── Tip map ───────────────────────────────────────────
    var leftKeys = "qwertasdfgzxcvb";
    var rightKeys = "yuiophjklnm";

    function getHand(ch) {
      if (leftKeys.indexOf(ch.toLowerCase()) !== -1) return "left";
      if (rightKeys.indexOf(ch.toLowerCase()) !== -1) return "right";
      return "other";
    }

    var majorErrors = 0;
    var tips = [];

    errorPairs.forEach(function (e) {
      var parts = e.pair.split("→");
      var exp = parts[0];
      var typed = parts[1];
      if (
        getHand(exp) !== getHand(typed) &&
        getHand(exp) !== "other" &&
        getHand(typed) !== "other"
      ) {
        majorErrors++;
      }
    });

    // ── Build error feedback HTML ─────────────────────────
    var feedbackEl = document.getElementById("errorFeedback");
    var tipEl = document.getElementById("feedbackTip");

    if (feedbackEl) {
      if (errorPairs.length === 0) {
        feedbackEl.innerHTML =
          "<span class='fb-perfect'>✅ No mistakes! Perfect run!</span>";
      } else {
        var html =
          "<span class='fb-title'>😅 You mixed these up:</span><ul class='fb-list'>";
        errorPairs.forEach(function (e) {
          var parts = e.pair.split("→");
          html +=
            "<li>Expected <kbd>" +
            parts[0] +
            "</kbd> but typed <kbd>" +
            parts[1] +
            "</kbd> — " +
            e.count +
            " time" +
            (e.count > 1 ? "s" : "") +
            "</li>";
        });
        html += "</ul>";
        feedbackEl.innerHTML = html;
      }
    }

    if (tipEl) {
      var tip = "";
      if (_acc === 100) {
        tip = "🌟 Absolutely perfect! You're a typing star!";
      } else if (majorErrors > 0) {
        tip =
          "🤝 Try to keep your left hand on the left keys and right hand on the right keys!";
      } else if (_acc >= 90) {
        tip = "💪 Almost perfect! Just a tiny mix-up. You've got this!";
      } else if (_acc >= 75) {
        tip = "🎯 Good effort! Focus on the keys you mixed up above.";
      } else if (_wpm < 10) {
        tip = "🐢 Take your time — accuracy matters more than speed right now!";
      } else {
        tip = "😊 Keep practising! Every session makes you better!";
      }
      tipEl.textContent = tip;
    }

    // ── Show overlay ──────────────────────────────────────
    if (levelConfig.hasTimer) stopTimer();
    [blury, mascot, congo, restart, home, next].forEach(function (el) {
      if (el) el.classList.remove("hidden");
    });
    applaudSound.play();
  }
  function hideCongrats() {
    [blury, mascot, congo, restart, home, next].forEach(function (el) {
      if (el) el.classList.add("hidden");
    });
  }

  // ==========================================================
  //  SPEECH
  // ==========================================================
  function speak(text) {
    if (soundEnabled) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        text === " " ? "space" : text,
      );
      speechSynthesis.speak(utterance);
    }
  }

  // ==========================================================
  //  PRESS KEY — no green flash, just data-pressed
  // ==========================================================
  function pressKey(char) {
    const target =
      char === "'" || char === '"'
        ? document.querySelector('[data-key="222"]')
        : char === " "
          ? document.querySelector('[data-key="32"]')
          : document.querySelector('[data-char*="' + char.toUpperCase() + '"]');
    if (!target) return;
    target.setAttribute("data-pressed", "on");
    setTimeout(function () {
      target.removeAttribute("data-pressed");
    }, 200);
  }

  // ==========================================================
  //  APPLY POSITION HELPER
  // ==========================================================

  function applyPos(el, pos) {
    if (!pos) return;
    /* Only set properties that are explicitly defined in pos —
       never clear left/right/bottom with "" because that removes
       the CSS fallback and makes the hand jump off screen        */
    if (pos.left !== undefined) el.style.left = pos.left;
    if (pos.right !== undefined) el.style.right = pos.right;
    if (pos.top !== undefined) el.style.top = pos.top;
    if (pos.bottom !== undefined) el.style.bottom = pos.bottom;
    if (pos.transform !== undefined) el.style.transform = pos.transform;
  }

  // ==========================================================
  //  UPDATE HANDS
  // ==========================================================
  function updateHands(key) {
    if (!lnum || !rnum) return;

    const leftShiftKey = document.querySelector('[data-key="16"]');
    const rightShiftKey = document.querySelector('[data-key="16-R"]');

    lnum.src = "../assets/images/letters/left_idle.webp";
    rnum.src = "../assets/images/letters/right_idle.webp";

    if (leftShiftKey) leftShiftKey.style.backgroundColor = "";
    if (rightShiftKey) rightShiftKey.style.backgroundColor = "";

    const char = key.toLowerCase();
    const isUpperCase =
      key !== " " &&
      key === key.toUpperCase() &&
      key.length === 1 &&
      /[A-Z]/.test(key);

    const leftHandKeys = [
      "q",
      "w",
      "e",
      "r",
      "t",
      "a",
      "s",
      "d",
      "f",
      "g",
      "z",
      "x",
      "c",
      "v",
      "b",
      "1",
      "2",
      "3",
      "4",
      "5",
      "!",
      "@",
      "#",
      "$",
      "%",
    ];
    const rightHandKeys = [
      "y",
      "u",
      "i",
      "o",
      "p",
      "h",
      "j",
      "k",
      "l",
      "n",
      "m",
      ";",
      "<",
      ">",
      '"',
      "'",
      "?",
      ",",
      ".",
      "/",
      "-",
      "=",
      "6",
      "7",
      "8",
      "9",
      "0",
      "_",
      "+",
      "^",
      "&",
      "*",
      "(",
      ")",
    ];

    // ── Per-letter position maps ──────────────────────────────
    const leftHandPos = {
      q: { left: "8vw", bottom: "-44vh" },
      w: { left: "8vw", bottom: "-45vh" },
      e: { left: "9vw", bottom: "-40 vh" },
      r: { left: "9vw", bottom: "-44vh" },
      t: { left: "12vw", bottom: "-43vh" },
      a: { left: "8vw", bottom: "-43vh" },
      s: { left: "8vw", bottom: "-45vh" },
      d: { left: "9vw", bottom: "-45vh" },
      f: { left: "10vw", bottom: "-44vh" },
      g: { left: "11vw", bottom: "-45vh" },
      z: { left: "8vw", bottom: "-48vh" },
      x: { left: "10vw", bottom: "-45vh" },
      c: { left: "10vw", bottom: "-46vh" },
      v: { left: "10vw", bottom: "-48vh" },
      b: { left: "12vw", bottom: "-48vh" },
      1: { left: "6.5vw", bottom: "-42vh" },
      2: { left: "7.2vw", bottom: "-42vh" },
      3: { left: "7.3vw", bottom: "-43vh" },
      4: { left: "8vw", bottom: "-43vh" },
      5: { left: "8vw", bottom: "-42vh" },
      "!": { left: "6.5vw", bottom: "-43vh" },
      "@": { left: "7.5vw", bottom: "-43vh" },
      "#": { left: "7.5vw", bottom: "-44vh" },
      $: { left: "8vw", bottom: "-44vh" },
      "%": { left: "9vw", bottom: "-44vh" },
    };

    const rightHandPos = {
      y: { right: "16vw", bottom: "-38vh" },
      u: { right: "14vw", bottom: "-39vh" },
      i: { right: "14vw", bottom: "-39vh" },
      o: { right: "13vw", bottom: "-39vh" },
      p: { right: "11vw", bottom: "-39vh" },
      h: { right: "16vw", bottom: "-40vh" },
      j: { right: "14vw", bottom: "-40vh" },
      k: { right: "13vw", bottom: "-42vh" },
      l: { right: "13vw", bottom: "-42vh" },
      n: { right: "14vw", bottom: "-45vh" },
      m: { right: "12vw", bottom: "-45vh" },
      ";": { right: "11.5vw", bottom: "-39vh" },
      "'": { right: "11vw", bottom: "-40vh" },
      ",": { right: "13vw", bottom: "-41.2vh" },
      ".": { right: "10vw", bottom: "-43vh" },
      "/": { right: "11vw", bottom: "-46vh" },
      "-": { right: "17vw", bottom: "-48vh" },
      "=": { right: "17vw", bottom: "-48vh" },
      ":": { right: "16vw", bottom: "-46vh" },
      '"': { right: "11.5vw", bottom: "-40vh" },
      ">": { right: "10vw", bottom: "-42vh" },
      "?": { right: "12vw", bottom: "-45vh" },
      6: { right: "16vw", bottom: "-38vh" },
      7: { right: "15.5vw", bottom: "-38vh" },
      8: { right: "14.5vw", bottom: "-39vh" },
      9: { right: "13.5vw", bottom: "-38vh" },
      0: { right: "13.5vw", bottom: "-37.5vh" },
      space: { right: "13vw", bottom: "-42vh" },
      "^": { right: "16vw", bottom: "-39vh" },
      "&": { right: "15.3vw", bottom: "-38.5vh" },
      "*": { right: "14vw", bottom: "-39vh" },
      "(": { right: "14vw", bottom: "-38.5vh" },
      ")": { right: "14vw", bottom: "-38.5vh" },
    };

    // ── File name map for special characters ──────────────────
    const fileNameMap = {
      "?": "questionmark",
      ".": "fullstop",
      "/": "questionmark",
      ">": "fullstop",
      "<": ",",
      ":": ";",
      '"': "'",
      "!": "1",
      "@": "2",
      "#": "3",
      $: "4",
      "%": "5",
      "^": "6",
      "&": "7",
      "*": "8",
      "(": "9",
      ")": "0",
      _: "-",
      "+": "=",
    };

    // ── Apply src + position ──────────────────────────────────
    if (leftHandKeys.includes(char)) {
      const fileName = fileNameMap[char] || char;
      lnum.src = "../assets/images/letters/" + fileName + ".webp";
      applyPos(lnum, leftHandPos[char]);
    } else if (rightHandKeys.includes(char)) {
      const fileName = fileNameMap[char] || char;
      rnum.src = "../assets/images/letters/" + fileName + ".webp";
      applyPos(rnum, rightHandPos[char]);
    } else if (key === " ") {
      rnum.src = "../assets/images/letters/space.webp";
      applyPos(rnum, rightHandPos["space"]);
    }

    // ── Shift symbols ─────────────────────────────────────────
    const leftShiftSymbols = ["!", "@", "#", "$", "%"];
    const rightShiftSymbols = [
      "^",
      "&",
      "*",
      "(",
      ")",
      "_",
      "+",
      "~",
      ":",
      '"',
      "?",
      ">",
      "<",
    ];

    // ── Dedicated shift hand positions ───────────────────
    const leftShiftPos = { left: "10vw", bottom: "-45vh" }; // left  Shift key
    const rightShiftPos = { right: "12vw", bottom: "-45vh" }; // right Shift key

    // ── Shift / uppercase ─────────────────────────────────────
    if (isUpperCase) {
      if (leftHandKeys.includes(char)) {
        rnum.src = "../assets/images/letters/right_shift.webp";
        applyPos(rnum, rightShiftPos);
      } else if (rightHandKeys.includes(char)) {
        lnum.src = "../assets/images/letters/left_shift.webp";
        applyPos(lnum, leftShiftPos);
      }
    }

    if (leftShiftSymbols.includes(key)) {
      rnum.src = "../assets/images/letters/right_shift.webp";
      applyPos(rnum, rightShiftPos);
    }

    if (rightShiftSymbols.includes(key)) {
      lnum.src = "../assets/images/letters/left_shift.webp";
      applyPos(lnum, leftShiftPos);
    }
  } // end updateHands()
  // ==========================================================
  //  KEYDOWN HANDLER — core typing engine
  // ==========================================================
  document.addEventListener("keydown", function (event) {
    let typedChar = event.key;

    // Resume timer if paused
    if (levelConfig.hasTimer && isPaused) {
      resumeTimer();
    }

    // Reset inactivity countdown
    if (levelConfig.hasTimer && startTime) {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(function () {
        pauseTimer();
      }, 5000);
    }

    // level9: swap single ↔ double quote
    if (levelConfig.quoteSwap) {
      if (typedChar === '"') typedChar = "'";
      else if (typedChar === "'") typedChar = '"';
    }

    if (
      typedChar.length !== 1 &&
      typedChar !== "Backspace" &&
      typedChar !== " "
    )
      return;

    // Start timer on first keypress (level10 only)
    if (levelConfig.hasTimer && !startTime && typedChar !== "Backspace") {
      startTimer();
    }

    // Backspace
    if (typedChar === "Backspace") {
      userInput = userInput.slice(0, -1);
      if (sessionKeystrokes.length > 0) sessionKeystrokes.pop();
      if (currentAttempt.length > 0) currentAttempt.pop();
      updateDisplay();
      window._checkAndStartNextBlink();
      return;
    }

    // Normal character
    if (userInput.length < stages[currentStage].length) {
      const expectedChar = stages[currentStage][userInput.length];

      const isCorrect = typedChar === expectedChar;

      /* ── Update live HUD values after every keypress ── */
      (function () {
        var elapsed = startTime
          ? Math.max(1, Math.floor((new Date() - startTime) / 1000))
          : 1;
        var totalTyped = sessionKeystrokes.length + 1;
        var wrongSoFar =
          sessionKeystrokes.filter(function (k) {
            return !k.correct;
          }).length + (isCorrect ? 0 : 1);
        var acc =
          totalTyped > 0
            ? Math.max(
                0,
                Math.round(((totalTyped - wrongSoFar) / totalTyped) * 100),
              )
            : 100;
        var words = userInput.trim().split(/\s+/).filter(Boolean).length || 1;
        var wpm = Math.round(words / (elapsed / 60));
        window._liveWpm = wpm;
        window._liveAccuracy = acc;
      })();

      if (isCorrect) {
        userInput += expectedChar;
        window._handlePulseKeyPress(expectedChar);
        if (soundEnabled) {
          keySound.currentTime = 0;
          keySound.play().catch(function () {});
        }
        speak(expectedChar);
        pressKey(expectedChar);
        sessionKeystrokes.push({
          expected: expectedChar,
          typed: typedChar,
          correct: true,
        });
        currentAttempt.push([expectedChar, 1]);

        /* ── Live HUD accuracy update ── */
        (function () {
          var total = sessionKeystrokes.length;
          var wrong = sessionKeystrokes.filter(function (k) {
            return !k.correct;
          }).length;
          var acc = Math.max(0, Math.round(((total - wrong) / total) * 100));
          var hudAcc = document.getElementById("hudAccuracy");
          if (hudAcc) hudAcc.textContent = acc + "%";
        })();

        updateDisplay();

        // Stage complete?
        if (userInput === stages[currentStage]) {
          keysToTypeElement.classList.add("slide-out-left");

          setTimeout(function () {
            currentStage++;

            if (currentStage < stages.length) {
              userInput = "";
              hideCongrats();

              virtualCaps = false;
              document
                .querySelector('[data-key="20"]')
                ?.classList.remove("caps-active");
              if (timerPausedOverlay) timerPausedOverlay.style.display = "none";

              keysToTypeElement.classList.remove("slide-out-left");
              updateDisplay();
              window._startStagePulse();

              keysToTypeElement.classList.add("slide-in-right");

              setTimeout(function () {
                keysToTypeElement.classList.remove("slide-in-right");
              }, 300);

              speak(stages[currentStage][0]);
            } else {
              keysToTypeElement.classList.remove("slide-out-left");
              messageElement.textContent =
                "Congratulations! You've completed all stages.";
              keysToTypeElement.innerHTML = "";
              showCongrats();
              saveSession();
              saveAttemptForResults(currentAttempt.slice());
              currentAttempt = [];
              // ── Add "View Full Report" button ──────────────────
              (function () {
                var old = document.getElementById("viewReportBtn");
                if (old) old.remove();
                var btn = document.createElement("a");
                btn.id = "viewReportBtn";
                btn.href = "../results.html#" + levelConfig.currentLevel;
                btn.textContent = "📊 View Full Report";
                btn.style.cssText = [
                  "display:block",
                  "margin-top:12px",
                  "padding:13px 28px",
                  "background:linear-gradient(135deg,#2E7D52,#43A573)",
                  "color:#fff",
                  "font-family:inherit",
                  "font-size:15px",
                  "font-weight:800",
                  "border-radius:14px",
                  "text-decoration:none",
                  "box-shadow:0 4px 16px rgba(46,125,82,.4)",
                  "text-align:center",
                  "cursor:pointer",
                ].join(";");
                var container = document.querySelector(".action-buttons-aaa");
                if (container) container.appendChild(btn);
              })();
            }
          }, 200);
        }
      } else {
        // Wrong key
        if (soundEnabled) {
          errorSound.currentTime = 0;
          errorSound.play().catch(function () {});
        }
        messageElement.textContent =
          'Wrong key. Expected "' +
          expectedChar +
          '", typed "' +
          typedChar +
          '". Try again.';

        // Flash the keyboard key red
        const keyEl = document.querySelector(
          '[data-char*="' + typedChar.toUpperCase() + '"]',
        );
        if (keyEl) {
          keyEl.style.backgroundColor = "#EF5350";
          keyEl.style.transform = "scale(0.9)";
          setTimeout(function () {
            keyEl.style.backgroundColor = "";
            keyEl.style.transform = "scale(1)";
          }, 300);
        }

        // Blink the current letterBox red (level1 only)
        if (levelConfig.useLetterBoxes) {
          const boxes = keysToTypeElement.querySelectorAll(".letterBox");
          const currentBox = boxes[userInput.length];
          if (currentBox) {
            currentBox.style.backgroundColor = "#ffcdd2";
            currentBox.style.borderColor = "#e53935";
            setTimeout(function () {
              currentBox.style.backgroundColor = "";
              currentBox.style.borderColor = "";
            }, 300);
          }
        }
        sessionKeystrokes.push({
          expected: expectedChar,
          typed: typedChar,
          correct: false,
        });

        /* ── Live HUD accuracy update on wrong key too ── */
        (function () {
          var total = sessionKeystrokes.length;
          var wrong = sessionKeystrokes.filter(function (k) {
            return !k.correct;
          }).length;
          var acc = Math.max(0, Math.round(((total - wrong) / total) * 100));
          var hudAcc = document.getElementById("hudAccuracy");
          if (hudAcc) hudAcc.textContent = acc + "%";
        })();
        currentAttempt.push([expectedChar, 0, typedChar]);
      }
    }
  });

  // ==========================================================
  //  TOGGLE SOUND
  // ==========================================================
  window.toggleSound = function () {
    soundEnabled = !soundEnabled;
    localStorage.setItem("sound-enabled", soundEnabled ? "true" : "false");
    const toggleEl = document.getElementById("soundToggle");
    const volImg = document.querySelector(".vol");
    if (toggleEl) {
      toggleEl.textContent = "Sound: " + (soundEnabled ? "On" : "Off");
    }
    if (volImg) {
      volImg.src = soundEnabled
        ? "../assets/images/volume.png"
        : "../assets/images/mute.png";
    }
    if (soundEnabled) {
      backgroundMusic.play().catch(function () {});
    } else {
      backgroundMusic.pause();
    }
  };

  // ==========================================================
  //  COLOR NUMBER KEYS  (level8 + level9 only)
  // ==========================================================
  if (levelConfig.colorNumbers) {
    const colorMap = {
      2: "#ff7b7b",
      3: "#ffa07a",
      4: "#ffd700",
      5: "#ffd700",
      6: "#ffd700",
      7: "#ffd700",
      8: "#ffa07a",
      9: "#ff7b7b",
    };
    Object.entries(colorMap).forEach(function (entry) {
      const key = document.querySelector(
        '.keyboard [data-char^="' + entry[0] + '"]',
      );
      if (key) key.style.color = entry[1];
    });
  }

  // ==========================================================
  //  KEYBOARD RESIZE
  // ==========================================================
  const keyboard = document.querySelector(".keyboard");
  function resizeKeyboard() {
    if (keyboard && keyboard.parentNode) {
      keyboard.style.fontSize = keyboard.parentNode.clientWidth / 100 + "px";
    }
  }
  window.addEventListener("resize", resizeKeyboard);
  resizeKeyboard();

  // ==========================================================
  //  VIRTUAL KEYBOARD  (touch + click)
  // ==========================================================
  document
    .querySelectorAll(".keyboard [data-key], .keyboard [data-char]")
    .forEach(function (key) {
      key.addEventListener("click", function () {
        handleVirtualKey(key);
      });
      key.addEventListener("touchstart", function (e) {
        e.preventDefault();
        handleVirtualKey(key);
      });
    });

  // ==========================================================
  //  INITIALISE
  // ==========================================================
  hideCongrats();
  updateDisplay();

  // ── NEW-KEY INTRO BLINK ──────────────────────────────────
  const pending = (levelConfig.introKeys || []).slice();
  let blinkEl = null;

  const blinkStyle = document.createElement("style");
  blinkStyle.textContent = `
    @keyframes keyblink {
      0%,100% { background-color:#FFAA00 !important;
                transform:scale(1.25);
                box-shadow:0 0 14px 5px rgba(255,170,0,0.75); }
      50%     { background-color:inherit !important;
                transform:scale(1.0);
                box-shadow:none; }
    }
    .key-blink { animation: keyblink 650ms ease-in-out infinite !important; }
  `;
  document.head.appendChild(blinkStyle);

  function findKeyEl(ch) {
    if (ch === " " || ch === "space")
      return document.querySelector('[data-key="32"]');
    if (ch === "shift-l") return document.querySelector('[data-key="16"]');
    if (ch === "shift-r") return document.querySelector('[data-key="16-R"]');
    if (/[a-zA-Z]/.test(ch))
      return document.querySelector('[data-char*="' + ch.toUpperCase() + '"]');
    for (const el of document.querySelectorAll("[data-char]"))
      if (el.getAttribute("data-char").includes(ch)) return el;
    return null;
  }

  function matches(a, b) {
    return /[a-zA-Z]/.test(b) ? a.toLowerCase() === b.toLowerCase() : a === b;
  }

  function checkBlink() {
    if (!pending.length) return;
    const next = stages[currentStage][userInput.length];
    if (!next) return;

    const p = pending[0];

    // Special: shift keys — blink when next char needs shift
    if (p === "shift-l" || p === "shift-r") {
      const needsShift = /[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(next);
      if (needsShift) {
        if (!blinkEl) {
          blinkEl = findKeyEl(p);
          if (blinkEl) blinkEl.classList.add("key-blink");
        }
      } else {
        if (blinkEl) {
          blinkEl.classList.remove("key-blink");
          blinkEl = null;
        }
        pending.shift();
        checkBlink();
      }
      return;
    }

    if (matches(next, p)) {
      if (!blinkEl) {
        blinkEl = findKeyEl(p);
        if (blinkEl) blinkEl.classList.add("key-blink");
      }
    } else {
      if (blinkEl) {
        blinkEl.classList.remove("key-blink");
        blinkEl = null;
      }
    }
  }

  window._handlePulseKeyPress = function (ch) {
    if (!pending.length) return;
    const p = pending[0];

    if (p === "shift-l" || p === "shift-r") {
      // shift is "used" when a capital/symbol is correctly typed
      const needsShift = /[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(ch);
      if (needsShift) {
        if (blinkEl) {
          blinkEl.classList.remove("key-blink");
          blinkEl = null;
        }
        pending.shift();
      }
    } else {
      if (blinkEl && matches(ch, p)) {
        blinkEl.classList.remove("key-blink");
        blinkEl = null;
        pending.shift();
      }
    }
    checkBlink();
  };

  window._startStagePulse = checkBlink;
  window._checkAndStartNextBlink = checkBlink;

  checkBlink();

  // ==========================================================
  //  SETTINGS DIALOG
  // ==========================================================
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const settingsClose = document.getElementById("settingsClose");
  const toggleHighlight = document.getElementById("toggleHighlight");

  if (settingsBtn) {
    settingsBtn.addEventListener("click", function () {
      settingsOverlay.classList.add("open");
    });
  }

  if (settingsClose) {
    settingsClose.addEventListener("click", function () {
      settingsOverlay.classList.remove("open");
    });
  }

  if (settingsOverlay) {
    settingsOverlay.addEventListener("click", function (e) {
      if (e.target === settingsOverlay) {
        settingsOverlay.classList.remove("open");
      }
    });
  }

  /* ── Keyboard visible state — tracked here so keydown can respect it ── */
  let keyboardShowing = true;
  let handsShowing = true;

  /* Expose to HUD buttons in template.html */
  window._setKeyboardVisible = function (show) {
    keyboardShowing = show;
    var kbEl = document.getElementById("keyboardEl");
    if (kbEl) {
      kbEl.style.visibility = show ? "visible" : "hidden";
      kbEl.style.pointerEvents = show ? "" : "none";
    }
  };

  window._setHandsVisible = function (show) {
    handsShowing = show;
    if (lnum) lnum.style.visibility = show ? "visible" : "hidden";
    if (rnum) rnum.style.visibility = show ? "visible" : "hidden";
  };

  const toggleHands = document.getElementById("toggleHands");
  if (toggleHands) {
    toggleHands.addEventListener("change", function () {
      window._setHandsVisible(toggleHands.checked);
    });
  }

  if (toggleHighlight) {
    toggleHighlight.addEventListener("change", function () {
      highlightEnabled = toggleHighlight.checked;
      if (!highlightEnabled) {
        clearNextKeyHighlight();
      } else {
        const correctText = stages[currentStage];
        if (userInput.length < correctText.length) {
          applyNextKeyHighlight(correctText[userInput.length]);
        }
      }
    });
  }

  function sendKey(keyValue) {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: keyValue, bubbles: true }),
    );
  }

  function handleVirtualKey(keyEl) {
    const keyCode = keyEl.getAttribute("data-key");
    const charData = keyEl.getAttribute("data-char");

    if (keyCode === "16" || keyCode === "16-R") {
      virtualShift = true;
      keyEl.classList.add("shift-active");
      return;
    }
    if (keyCode === "20") {
      virtualCaps = !virtualCaps;
      keyEl.classList.toggle("caps-active", virtualCaps);
      return;
    }
    if (keyCode === "8") return sendKey("Backspace");
    if (keyCode === "13") return sendKey("Enter");
    if (keyCode === "9") return sendKey("\t");
    if (keyCode === "32") return sendKey(" ");

    if (!charData) return;

    let normalChar = charData.length > 1 ? charData[1] : charData[0];
    let shiftChar = charData[0];
    let finalChar = virtualShift ? shiftChar : normalChar;

    if (/[a-zA-Z]/.test(finalChar)) {
      finalChar =
        virtualCaps ^ virtualShift
          ? finalChar.toUpperCase()
          : finalChar.toLowerCase();
    }

    sendKey(finalChar);

    if (virtualShift) {
      virtualShift = false;
      document
        .querySelectorAll('[data-key="16"], [data-key="16-R"]')
        .forEach(function (k) {
          k.classList.remove("shift-active");
        });
    }

    document
      .querySelectorAll(".keyboard [data-key], .keyboard [data-char]")
      .forEach((key) => {
        key.addEventListener("click", () => handleVirtualKey(key));
        key.addEventListener("touchstart", (e) => {
          e.preventDefault();
          handleVirtualKey(key);
        });
      });
  } // end bootEngine()

  // ============================================================
  //  VIRTUAL KEYBOARD HANDLERS
  // ============================================================
}
