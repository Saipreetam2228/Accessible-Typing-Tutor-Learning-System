const keySound = new Audio("./assets/keypress.mp3");
const errorSound = new Audio("./assets/wrong.mp3");
const applaudSound = new Audio("./assets/applaud.mp3");

document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const keysToTypeElement = document.getElementById("keysToTypeSpan");
  const messageElement = document.getElementById("message");
  const blury = document.querySelector(".blur");
  const mascot = document.querySelector(".mascot");
  const congo = document.querySelector(".congo");
  const restart = document.querySelector(".restart");
  const next = document.querySelector(".next");
  const rnum = document.querySelector(".rh");
  const lnum = document.querySelector(".lh");
  const volButton = document.querySelector(".volbt");

  // Stages (sentences)
  const stages = [
    "fvf gfv bvg dfv fvbg gfvb bvf",
    "sdf dfv wsv rdfv edfv ertv rfv",
    "wedv sdfv edv sdv efb edb sdvb",
    "sedv wsbv trvb wdvb refv dsbv revb",
    "nm mn jm jn hn hm yn ym un um",
    "yhn uhn yhn yhm hny hnm jnm jmy",
    "yhnm uhnm ihnm ohnm okmn olmn ujmn",
    "five fiber every very vet fibber ever",
    "jim him rim trim them hem them",
    "tin fin dint jnj tint jujnj tinted ten oven",
    "often men mine moment mind remember den over",
    "talk less work more",
    "love all serve all",
    "be good do good see good",
    "life is love enjoy it",

  ];
  let currentStage = 0;
  let userInput = "";
  let soundEnabled = false;

  // Initialize global results from localStorage or create new
  let allTypingResults = JSON.parse(localStorage.getItem("allTypingResults")) || {};
  const currentLevel = "level5";

  // Initialize results for the current level if not exists
  if (!allTypingResults[currentLevel]) {
    allTypingResults[currentLevel] = [];
  }

  // Prevent spacebar from triggering button click
  volButton.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
    }
  });

  // Initialize display
  function updateDisplay() {
    let displayText = "";
    const correctText = stages[currentStage];
    for (let i = 0; i < correctText.length; i++) {
      if (i < userInput.length) {
        if (userInput[i] === correctText[i]) {
          displayText += `<span style='color: green;'>${correctText[i]}</span>`;
        } else {
          displayText += `<span style='color: red;'>${correctText[i]}</span>`;
        }
      } else {
        displayText += `<span style='color: black;'>${correctText[i]}</span>`;
      }
    }
    keysToTypeElement.innerHTML = displayText;
    messageElement.textContent = `Stage ${currentStage + 1}: Type the letter.`;
    // Update hand indicators for the next key to be typed
    if (userInput.length < stages[currentStage].length) {
      updateHands(stages[currentStage][userInput.length]);
    } else {
      lnum.src = "./assets/r.png";
      rnum.src = "./assets/r.png";
    }
  }

  // Show congratulatory overlay
  function showCongrats() {
    blury.classList.remove("hidden");
    mascot.classList.remove("hidden");
    congo.classList.remove("hidden");
    restart.classList.remove("hidden");
    next.classList.remove("hidden");
    applaudSound.play();
  }

  // Hide congratulatory overlay
  function hideCongrats() {
    blury.classList.add("hidden");
    mascot.classList.add("hidden");
    congo.classList.add("hidden");
    restart.classList.add("hidden");
    next.classList.add("hidden");
  }

  // Speak text or character
  function speak(text) {
    if (soundEnabled) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text === " " ? "space" : text);
      speechSynthesis.speak(utterance);
    }
  }

  // Highlight key on keyboard
  function pressKey(char) {
    const key = document.querySelector(`[data-char*="${char.toUpperCase()}"]`);
    if (!key && char !== " ") return;
    if (char === " ") {
      const spaceKey = document.querySelector(`[data-key="32"]`);
      if (spaceKey) {
        spaceKey.setAttribute("data-pressed", "on");
        spaceKey.style.backgroundColor = "#00FF00";
        spaceKey.style.transform = "scale(1.1)";
        setTimeout(() => {
          spaceKey.removeAttribute("data-pressed");
          spaceKey.style.backgroundColor = "";
          spaceKey.style.transform = "scale(1)";
        }, 200);
      }
    } else {
      key.setAttribute("data-pressed", "on");
      key.style.backgroundColor = "#00FF00";
      key.style.transform = "scale(1.1)";
      setTimeout(() => {
        key.removeAttribute("data-pressed");
        key.style.backgroundColor = "";
        key.style.transform = "scale(1)";
      }, 200);
    }
  }

  // Update hand images based on key
  function updateHands(key) {
    key = key.toUpperCase();
    // Reset both hands to default
    lnum.src = "./assets/r.png";
    rnum.src = "./assets/r.png";

    // Update left hand
    if (["V", "F", "R", "T", "G", "B"].includes(key)) {
      lnum.src = "./assets/r2.png";
    } else if (["E", "D", "C"].includes(key)) {
      lnum.src = "./assets/r3.png";
    } else if (["W", "S", "X"].includes(key)) {
      lnum.src = "./assets/r4.png";
    } else if (["Q", "A", "Z"].includes(key)) {
      lnum.src = "./assets/r5.png";
    }

    // Update right hand
    if (["N", "H", "Y", "U", "J", "M"].includes(key)) {
      rnum.src = "./assets/r2.png";
    } else if (["I", "K", "<", ","].includes(key)) {
      rnum.src = "./assets/r3.png";
    } else if (["O", "L", ">", "."].includes(key)) {
      rnum.src = "./assets/r4.png";
    } else if (["P", ";", "/", "?"].includes(key)) {
      rnum.src = "./assets/r5.png";
    }

    // Handle space key
    if (key === " ") {
      rnum.src = "./assets/r1.png";
      lnum.src = "./assets/r1.png";
    }
  }

  // Save all typing results to a single JSON file
  function saveResultsToFile() {
    // Update localStorage before saving
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Handle keydown events
  document.addEventListener("keydown", function (event) {
    let typedChar = event.key;
    if (typedChar.length === 1 || typedChar === "Backspace" || typedChar === " ") {
      if (typedChar === "Backspace") {
        userInput = userInput.slice(0, -1);
        // Remove the last result if backspace is pressed
        if (
          allTypingResults[currentLevel][currentStage] &&
          allTypingResults[currentLevel][currentStage].length > 0
        ) {
          allTypingResults[currentLevel][currentStage].pop();
        }
        updateDisplay();
        return;
      }

      if (userInput.length < stages[currentStage].length) {
        const expectedChar = stages[currentStage][userInput.length];
        const typedCharLower = typedChar.toLowerCase();
        const expectedCharLower = expectedChar.toLowerCase();

        // Initialize results array for current stage if not exists
        if (!allTypingResults[currentLevel][currentStage]) {
          allTypingResults[currentLevel][currentStage] = [];
        }

        if (typedCharLower === expectedCharLower) {
          userInput += expectedChar;
          keySound.currentTime = 0;
          keySound.play();
          speak(expectedChar);
          pressKey(expectedChar);
          allTypingResults[currentLevel][currentStage].push([expectedChar, 1]);
        } else {
          errorSound.currentTime = 0;
          errorSound.play();
          messageElement.textContent = `Wrong key. Expected "${expectedChar}", typed "${typedChar}". Try again.`;
          const keyElement = document.querySelector(
            `[data-char*="${typedChar.toUpperCase()}"]`
          );
          if (keyElement) {
            keyElement.style.backgroundColor = "#EF5350";
            keyElement.style.transform = "scale(0.9)";
            setTimeout(() => {
              keyElement.style.backgroundColor = "";
              keyElement.style.transform = "scale(1)";
            }, 300);
          }
          // Record incorrect input with expected and actual characters
          allTypingResults[currentLevel][currentStage].push([expectedChar, 0, typedChar]);
          return; // Prevent further input until correct key is pressed
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
              keysToTypeElement.innerHTML = "";
              showCongrats();
              // Save results to localStorage
              localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
              // Optionally save file here or wait for user action
            }
          }, 1000);
        }
      }
    }
  });

  // Toggle sound
  window.toggleSound = function () {
    soundEnabled = !soundEnabled;
    const soundToggleElement = document.getElementById("soundToggle");
    const vol = document.querySelector(".vol");
    soundToggleElement.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
    vol.src = soundEnabled ? "./assets/volume.png" : "./assets/mute.png";
  };

  // Save results when navigating away (optional)
  window.addEventListener("beforeunload", function () {
    localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
  });

  // Add a button or trigger to download results (optional)
  // For example, modify the "next" button to save results
  next.addEventListener("click", function () {
    saveResultsToFile();
  });

  // Keyboard size adjustment
  const keyboard = document.querySelector(".keyboard");
  function size() {
    const size = keyboard.parentNode.clientWidth / 90;
    keyboard.style.fontSize = size + "px";
  }
  window.addEventListener("resize", size);
  size();

  // Initialize
  updateDisplay();
  hideCongrats();
});
// touch 
function handleInput(char) {
  const event = new KeyboardEvent("keydown", { key: char });
  document.dispatchEvent(event);
}

document.querySelectorAll("[data-char]").forEach(key => {
  const char = key.getAttribute("data-char")[0];

  // Mouse click
  key.addEventListener("click", () => {
    handleInput(char);
  });

  // Touch screen
  key.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput(char);
  });
});

const key = document.querySelector(
  `[data-char*="${e.key.toUpperCase()}"]`
);