const keySound = new Audio("./assets/keypress.mp3");
const errorSound = new Audio("./assets/wrong.mp3");
const applaudSound = new Audio("./assets/applaud.mp3");

document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const textToTypeElement = document.getElementById("textToType");
  const messageElement = document.getElementById("message");
  const blurOverlay = document.getElementById("blur-overlay");
  const mascotImg = document.getElementById("mascot-img");
  const congratsText = document.getElementById("congrats-text");
  const restartBtn = document.getElementById("restart-btn");
  const nextBtn = document.getElementById("next-btn");
  const rightHandImg = document.getElementById("rh-hand");
  const leftHandImg = document.getElementById("lh-hand");
  const volBtn = document.querySelector(".vol-btn");
  const timerElement = document.getElementById("timer");

  // Stages (sentences)
  const stages = [
    "zoo zoom zip zebra zigzag zee",
    "fizz buzz quiz maze sizebo",
    "fax tax mix flax text exit lazy fix",
];

  let currentStage = 0;
  let userInput = "";
  let voiceEnabled = false;
  let startTime = null;
  let timerInterval = null;

  // Initialize global results from localStorage or create new
  let allTypingResults = JSON.parse(localStorage.getItem("allTypingResults")) || {};
  const currentLevel = "level5";

  if (!allTypingResults[currentLevel]) {
    allTypingResults[currentLevel] = [];
  }

  // Prevent spacebar from triggering button click
  volBtn.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
    }
  });

  // Start timer
  function startTimer() {
    if (!startTime) {
      startTime = new Date();
      timerInterval = setInterval(() => {
        const currentTime = new Date();
        const timeElapsed = Math.floor((currentTime - startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
        const seconds = (timeElapsed % 60).toString().padStart(2, '0');
        timerElement.textContent = `Time: ${minutes}:${seconds}`;
      }, 1000);
    }
  }

  // Stop timer and return total time in seconds
  function stopTimer() {
    if (startTime && timerInterval) {
      clearInterval(timerInterval);
      const endTime = new Date();
      const totalTime = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
      const seconds = (totalTime % 60).toString().padStart(2, '0');
      timerElement.textContent = `Time: ${minutes}:${seconds}`;
      return totalTime;
    }
    return 0;
  }

  // Calculate WPM and LPS
  function calculateMetrics(totalTime) {
    if (totalTime === 0) return { wpm: 0, lps: 0, totalTime: 0 };

    let totalChars = 0;
    let totalWords = 0;
    stages.forEach(stage => {
      totalChars += stage.length;
      totalWords += stage.split(" ").length;
    });

    const wpm = Math.round((totalWords / (totalTime / 60))) || 0;
    const lps = Number((totalChars / totalTime).toFixed(2)) || 0;
    return { wpm, lps, totalTime };
  }

  // Initialize display
  function updateDisplay() {
    let displayText = "";
    const correctText = stages[currentStage];
    for (let i = 0; i < correctText.length; i++) {
      if (i < userInput.length) {
        displayText += `<span style='color: ${userInput[i] === correctText[i] ? 'green' : 'red'};'>${correctText[i]}</span>`;
      } else {
        displayText += `<span style='color: black;'>${correctText[i]}</span>`;
      }
    }
    textToTypeElement.innerHTML = displayText;
    messageElement.textContent = `Stage ${currentStage + 1}: Type the sentence.`;
  }

  // Show congratulatory overlay with metrics
  function showCongrats() {
    const totalTime = stopTimer();
    const { wpm, lps } = calculateMetrics(totalTime);
    const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
    const seconds = (totalTime % 60).toString().padStart(2, '0');
    blurOverlay.classList.remove("hidden");
    mascotImg.classList.remove("hidden");
    congratsText.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    congratsText.innerHTML = `Congratulations!!🥳<br>WPM: ${wpm}<br>LPS: ${lps}<br>Total Time: ${minutes}:${seconds}`;
    if (voiceEnabled) applaudSound.play();
  }

  // Hide congratulatory overlay
  function hideCongrats() {
    blurOverlay.classList.add("hidden");
    mascotImg.classList.add("hidden");
    congratsText.classList.add("hidden");
    restartBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
  }

  // Speak text or character
  function speak(text) {
    if (voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text === " " ? "space" : text);
      speechSynthesis.speak(utterance);
    }
  }

  // Highlight key on keyboard
  function pressKey(char) {
    const selector = char === " " ? `[data-key="32"]` : `[data-char*="${char.toUpperCase()}"]`;
    const key = document.querySelector(selector);
    if (!key) return;
    key.setAttribute("data-pressed", "on");
    key.style.backgroundColor = "#00FF00";
    key.style.transform = "scale(1.1)";
    setTimeout(() => {
      key.removeAttribute("data-pressed");
      key.style.backgroundColor = "";
      key.style.transform = "scale(1)";
    }, 200);
  }

  // Update hand images based on key
  function updateHands(key) {
    key = key.toUpperCase();
    const leftHandKeys = {
      "V,F,R,T,G,B": "./assets/r2.png",
      "E,D,C": "./assets/r3.png",
      "W,S,X": "./assets/r4.png",
      "Q,A,Z": "./assets/r5.png",
      " ": "./assets/r1.png"
    };
    const rightHandKeys = {
      "N,H,Y,U,J,M": "./assets/r2.png",
      "I,K,<,": "./assets/r3.png",
      "O,L,>,.": "./assets/r4.png",
      "P,;,/": "./assets/r5.png",
      " ": "./assets/r1.png"
    };

    leftHandImg.src = "./assets/r1.png";
    rightHandImg.src = "./assets/r1.png";

    for (const [keys, src] of Object.entries(leftHandKeys)) {
      if (keys.includes(key)) leftHandImg.src = src;
    }
    for (const [keys, src] of Object.entries(rightHandKeys)) {
      if (keys.includes(key)) rightHandImg.src = src;
    }
  }

  // Save typing results to JSON file
  function saveResultsToFile() {
    localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
    const data = {
      results: allTypingResults,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_typing_results.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Handle keydown events
  document.addEventListener("keydown", function (event) {
    let typedChar = event.key;
    if (typedChar.length === 1 || typedChar === "Backspace" || typedChar === " ") {
      if (!startTime && typedChar !== "Backspace") startTimer();

      if (typedChar === "Backspace") {
        userInput = userInput.slice(0, -1);
        if (allTypingResults[currentLevel][currentStage]?.length > 0) {
          allTypingResults[currentLevel][currentStage].pop();
        }
        updateDisplay();
        return;
      }

      if (userInput.length < stages[currentStage].length) {
        const expectedChar = stages[currentStage][userInput.length];
        const typedCharLower = typedChar.toLowerCase();
        const expectedCharLower = expectedChar.toLowerCase();

        if (!allTypingResults[currentLevel][currentStage]) {
          allTypingResults[currentLevel][currentStage] = [];
        }

        if (typedCharLower === expectedCharLower) {
          userInput += expectedChar;
          if (voiceEnabled) {
            keySound.currentTime = 0;
            keySound.play();
          }
          speak(expectedChar);
          pressKey(expectedChar);
          updateHands(expectedChar);
          allTypingResults[currentLevel][currentStage].push([expectedChar, 1]);
        } else {
          if (voiceEnabled) {
            errorSound.currentTime = 0;
            errorSound.play();
          }
          messageElement.textContent = `Wrong key. Expected "${expectedChar}", typed "${typedChar}". Try again.`;
          const keyElement = document.querySelector(`[data-char*="${typedChar.toUpperCase()}"]`);
          if (keyElement) {
            keyElement.style.backgroundColor = "#EF5350";
            keyElement.style.transform = "scale(0.9)";
            setTimeout(() => {
              keyElement.style.backgroundColor = "";
              keyElement.style.transform = "scale(1)";
            }, 300);
          }
          allTypingResults[currentLevel][currentStage].push([expectedChar, 0, typedChar]);
          return;
        }

        updateDisplay();

        if (userInput === stages[currentStage]) {
          setTimeout(() => {
            currentStage++;
            if (currentStage < stages.length) {
              userInput = "";
              hideCongrats();
              updateDisplay();
              speak(stages[currentStage][0]);
            } else {
              messageElement.textContent = "Congratulations! You've completed all stages.";
              textToTypeElement.innerHTML = "";
              showCongrats();
              localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
            }
          }, 1000);
        }
      }
    }
  });

  // Toggle voices
  window.toggleVoice = function () {
    voiceEnabled = !voiceEnabled;
    const voiceToggleElement = document.getElementById("voiceToggle");
    const volImg = document.querySelector(".vol-img");
    voiceToggleElement.textContent = `Voice: ${voiceEnabled ? "On" : "Off"}`;
    volImg.src = voiceEnabled ? "./assets/volume.png" : "./assets/mute.png";
  };

  // Save results on navigation
  window.addEventListener("beforeunload", function () {
    localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
  });

  // Download results on next button click
  nextBtn.addEventListener("click", saveResultsToFile);

  // Keyboard size adjustment
  const keyboard = document.querySelector(".keyboard");
  function resizeKeyboard() {
    const size = keyboard.parentNode.clientWidth / 90;
    keyboard.style.fontSize = `${size}px`;
  }
  window.addEventListener("resize", resizeKeyboard);
  resizeKeyboard();

  // Initialize
  updateDisplay();
  hideCongrats();
});
let virtualShift = false;
let virtualCaps = false;

// Send key to typing engine
function sendKey(keyValue) {
  const evt = new KeyboardEvent("keydown", {
    key: keyValue,
    bubbles: true
  });
  document.dispatchEvent(evt);
}

// Handle virtual key press
function handleVirtualKey(keyEl) {
  const keyCode = keyEl.getAttribute("data-key");
  const charData = keyEl.getAttribute("data-char");

  // ---------- SHIFT ----------
  if (keyCode === "16" || keyCode === "16-R") {
    virtualShift = true;
    keyEl.classList.add("shift-active");
    return;
  }

  // ---------- CAPS LOCK ----------
  if (keyCode === "20") {
    virtualCaps = !virtualCaps;
    keyEl.classList.toggle("caps-active", virtualCaps);
    return;
  }

  // ---------- SPECIAL KEYS ----------
  if (keyCode === "8")  return sendKey("Backspace");
  if (keyCode === "13") return sendKey("Enter");
  if (keyCode === "9")  return sendKey("\t");
  if (keyCode === "32") return sendKey(" ");

  // ---------- NORMAL KEYS ----------
  if (!charData) return;

  

  let normalChar = charData.length > 1 ? charData[1] : charData[0];
  let shiftChar  = charData.length > 1 ? charData[0] : charData[0];

  let finalChar = virtualShift ? shiftChar : normalChar;

  // Letters: apply Caps + Shift logic
  if (/[a-zA-Z]/.test(finalChar)) {
    if (virtualCaps ^ virtualShift) finalChar = finalChar.toUpperCase();
    else finalChar = finalChar.toLowerCase();
  }

  sendKey(finalChar);

  // ---------- RESET SHIFT ----------
  if (virtualShift) {
    virtualShift = false;
    document
      .querySelectorAll('[data-key="16"], [data-key="16-R"]')
      .forEach(k => k.classList.remove("shift-active"));
  }
}

// Attach events
document.querySelectorAll(".keyboard [data-key], .keyboard [data-char]").forEach(key => {
  key.addEventListener("click", () => handleVirtualKey(key));
  key.addEventListener("touchstart", e => {
    e.preventDefault();
    handleVirtualKey(key);
  });
});