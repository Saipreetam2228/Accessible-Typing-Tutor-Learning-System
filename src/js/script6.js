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
    "two clever cows crossed the city; checking the curves on the way",
    "come let us go to china; there are many castles",
    "the car is close to the cage; the cub will have to be careful.",
    "the carpenter kept the cash under the carpet; the child spilled coffee.",

    "The goats ran across the street. The bus stopped.",
    "I like cakes, cookies, ice cream, and dosa. My mother cooks good food.",
    "I love computer lessons. My teacher Mrs Savita teaches us nicely.",
    "Sania dances gracefully. She will win the competition.",
    "Monica loves sweets. Laddu is her favourite.",
    "Jack crosses the road carefully. Look on both sides.",
    "Respect your elders. Always help them.",
    "Keep your house clean. Throw the waste in the dustbin.",
    "Speak truth always. Never lie.",

    "Brush your teeth twice a day.",
    "I have a dog; it sleeps on the pillow.",
    "My brother ate all the vegetables; therefore, he should get the gift.",
    "I have lived in Goa; Mumbai; Delhi; Chennai; and Calcutta.",
    "Suhas lost his pen, and his father bought a new one.",
  ];
  let currentStage = 0;
  let userInput = "";
  let soundEnabled = false;

  // Initialize global results from localStorage or create new
  let allTypingResults = JSON.parse(localStorage.getItem("allTypingResults")) || {};
  const currentLevel = "level6";

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

    // Update hand indicators
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

  // ✅ Update hand images and Shift logic
  function updateHands(key) {
    const leftShiftKey = document.querySelector('[data-key="16"]');
    const rightShiftKey = document.querySelector('[data-key="16-R"]');

    // Reset hand images and shift styles
    lnum.src = "./assets/r.png";
    rnum.src = "./assets/r.png";
    leftShiftKey.style.backgroundColor = "";
    rightShiftKey.style.backgroundColor = "";

    const isUppercase = key === key.toUpperCase() && key.match(/[A-Z]/);
    const char = key.toUpperCase();

    // Normal finger highlights
    if (["V", "F", "R", "T", "G", "B"].includes(char)) lnum.src = "./assets/r2.png";
    else if (["E", "D", "C"].includes(char)) lnum.src = "./assets/r3.png";
    else if (["W", "S", "X"].includes(char)) lnum.src = "./assets/r4.png";
    else if (["Q", "A", "Z"].includes(char)) lnum.src = "./assets/r5.png";

    if (["N", "H", "Y", "U", "J", "M"].includes(char)) rnum.src = "./assets/r2.png";
    else if (["I", "K", "<", ","].includes(char)) rnum.src = "./assets/r3.png";
    else if (["O", "L", ">", "."].includes(char)) rnum.src = "./assets/r4.png";
    else if (["P", ";", "/", "?"].includes(char)) rnum.src = "./assets/r5.png";

    if (char === " ") {
      rnum.src = "./assets/r1.png";
      lnum.src = "./assets/r1.png";
    }

    // ✅ Shift key indication for capital letters
    if (isUppercase) {
      const rightHandLetters = ["Y", "U", "I", "O", "P", "H", "J", "K", "L", "N", "M"];
      const useLeftShift = rightHandLetters.includes(char);

      if (useLeftShift) {
        // Typing with right hand -> use left Shift
        leftShiftKey.style.backgroundColor = "#FFD700"; // gold highlight
        lnum.src = "./assets/r5.png"; // left little finger
      } else {
        // Typing with left hand -> use right Shift
        rightShiftKey.style.backgroundColor = "#FFD700";
        rnum.src = "./assets/r5.png"; // right little finger
      }
    }
  }

  // Save all typing results to a single JSON file
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

        if (!allTypingResults[currentLevel][currentStage]) {
          allTypingResults[currentLevel][currentStage] = [];
        }

        // Strict case-sensitive match
        if (typedChar === expectedChar) {
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
              keysToTypeElement.innerHTML = "";
              showCongrats();
              localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
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

  // Save results when navigating away
  window.addEventListener("beforeunload", function () {
    localStorage.setItem("allTypingResults", JSON.stringify(allTypingResults));
  });

  next.addEventListener("click", function () {
    saveResultsToFile();
  });

  const keyboard = document.querySelector(".keyboard");
  function size() {
    const size = keyboard.parentNode.clientWidth / 90;
    keyboard.style.fontSize = size + "px";
  }
  window.addEventListener("resize", size);
  size();

  updateDisplay();
  hideCongrats();
});

function handleInput(char) {
  // Convert letters to lowercase (virtual keyboard = no shift)
  let keyToSend = char;

  if (char.length === 1 && char.match(/[A-Z]/)) {
    keyToSend = char.toLowerCase();
  }

  const event = new KeyboardEvent("keydown", {
    key: keyToSend,
    bubbles: true
  });

  document.dispatchEvent(event);
}

document.querySelectorAll("[data-char], [data-key]").forEach(key => {
  let char = null;

  if (key.hasAttribute("data-char")) {
    char = key.getAttribute("data-char")[0];
  }

  if (key.getAttribute("data-key") === "32") {
    char = " ";
  }

  if (!char) return;

  key.addEventListener("click", () => {
    handleInput(char);
  });

  key.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput(char);
  });
});



