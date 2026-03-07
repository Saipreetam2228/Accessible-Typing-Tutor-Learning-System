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
    "Sat fat hat far gate fame late ran hand",
"tan man sang land wand can van pan fan",
"put pop pup pull pill pomp puppy pot top",
"rope pit port pack pain page pad park palm",

"quite quit quiet quit queen quill quest quite quiet equal",
"quill quest quite quiet equal  quite quit quiet quit queen",

"zoo zoom zip zebra zigzag zee ",
"fizz buzz quiz maze size box",
"fax tax mix flax text exit lazy fix",

"The quiet queen quit her kingdom.",
"The lazy zebra in the zoo ate the mixture.",
"Zoya gave six mixed sized boxes",
"Appy fizz was shared equally among the buzzing bees.",
  ];
  let currentStage = 0;
  let userInput = "";
  let soundEnabled = false;

  // Initialize global results from localStorage or create new
  let allTypingResults = JSON.parse(localStorage.getItem("allTypingResults")) || {};
  const currentLevel = "level7";

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

  function updateHands(key) {
  const leftShiftKey = document.querySelector('[data-key="16"]');
  const rightShiftKey = document.querySelector('[data-key="16-R"]');
  lnum.src = "./assets/r.png";
  rnum.src = "./assets/r.png";
  leftShiftKey.style.backgroundColor = "";
  rightShiftKey.style.backgroundColor = "";

  const char = key.toUpperCase();
  const isUppercase = char === key && key.match(/[A-Z]/);

  // left hand
  if (["V", "F", "R", "T", "G", "B", "4", "5"].includes(char))
    lnum.src = "./assets/r2.png"; // left index
  else if (["E", "D", "C", "3"].includes(char))
    lnum.src = "./assets/r3.png"; // left middle
  else if (["W", "S", "X", "2"].includes(char))
    lnum.src = "./assets/r4.png"; // left ring
  else if (["Q", "A", "Z","1","`"].includes(char))
    lnum.src = "./assets/r5.png"; // left pinky

  // right hand
  if (["N", "H", "Y", "U", "J", "M", "6", "7"].includes(char))
    rnum.src = "./assets/r2.png"; // right index
  else if (["I", "K", "<", ",", "8"].includes(char))
    rnum.src = "./assets/r3.png"; // right middle
  else if (["O", "L", ">", ".", "9"].includes(char))
    rnum.src = "./assets/r4.png"; // right ring
  else if (["P", ";", "/","'","[","-","=","]","\\"].includes(char))
    rnum.src = "./assets/r5.png"; // right pinky

  if (char === " ") {
    rnum.src = "./assets/r1.png";
    lnum.src = "./assets/r1.png";
  }

  // --- NEW: Special characters that need Shift ---
  const shiftChars = {
    "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5",
    "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
    "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\",
    ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/"
  };

  // --- Check if it's a special Shift symbol ---
  if (shiftChars[key]) {
    const base = shiftChars[key].toUpperCase();

    // Use same finger as base key
    updateHands(base);

    // Highlight appropriate Shift key
    const rightHandSymbols = ["^","&","*","(",")","+","{","}","|",":","\"","<",">","?"];
    const useLeftShift = rightHandSymbols.includes(key);

    if (useLeftShift) {
      leftShiftKey.style.backgroundColor = "#FFD700";
      lnum.src = "./assets/r5.png";
    } else {
      rightShiftKey.style.backgroundColor = "#FFD700";
      rnum.src = "./assets/r5.png";
    }
    return; // prevent recursion loop
  }

  // --- Existing uppercase logic ---
  if (isUppercase) {
    const rightHandLetters = ["Y","U","I","O","P","H","J","K","L","N","M"];
    const useLeftShift = rightHandLetters.includes(char);
    if (useLeftShift) {
      leftShiftKey.style.backgroundColor = "#FFD700";
      lnum.src = "./assets/r5.png";
    } else {
      rightShiftKey.style.backgroundColor = "#FFD700";
      rnum.src = "./assets/r5.png";
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


/*function handleInput(char) {
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

  // SHIFT KEY
  if (key.getAttribute("data-key") === "16" || key.getAttribute("data-key") === "16-R") {
    key.addEventListener("click", () => {
      virtualShift = true;
      key.classList.add("shift-active");
    });

    key.addEventListener("touchstart", (e) => {
      e.preventDefault();
      virtualShift = true;
      key.classList.add("shift-active");
    });

    return;
  }

  // SPACE
  if (key.getAttribute("data-key") === "32") {
    char = " ";
  }

  // NORMAL KEYS
  if (key.hasAttribute("data-char")) {
    char = key.getAttribute("data-char")[0];
  }

  if (!char) return;

  key.addEventListener("click", () => {
    handleInput(char);
  });

  key.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput(char);
  });
});*/

let virtualShift = false;
let virtualCaps = false;

function handleInput(char) {
  let keyToSend = char;

  // Letters only
  if (char.length === 1 && /[a-zA-Z]/.test(char)) {
    if (virtualCaps ^ virtualShift) {
      keyToSend = char.toUpperCase();
    } else {
      keyToSend = char.toLowerCase();
    }
  }

  // TAB
  if (char === "TAB") {
    keyToSend = "\t";
  }

  const event = new KeyboardEvent("keydown", {
    key: keyToSend,
    bubbles: true
  });

  document.dispatchEvent(event);

  // Shift resets after one key
  if (virtualShift) {
    virtualShift = false;
    document
      .querySelectorAll('[data-key="16"], [data-key="16-R"]')
      .forEach(k => k.classList.remove("shift-active"));
  }
}

document.querySelectorAll("[data-char], [data-key]").forEach(key => {
  let char = null;
  const keyCode = key.getAttribute("data-key");

  // SHIFT
  if (keyCode === "16" || keyCode === "16-R") {
    key.addEventListener("click", () => {
      virtualShift = true;
      key.classList.add("shift-active");
    });

    key.addEventListener("touchstart", e => {
      e.preventDefault();
      virtualShift = true;
      key.classList.add("shift-active");
    });

    return;
  }

  // CAPS LOCK
  if (keyCode === "20") {
    key.addEventListener("click", () => {
      virtualCaps = !virtualCaps;
      key.classList.toggle("caps-active", virtualCaps);
    });

    key.addEventListener("touchstart", e => {
      e.preventDefault();
      virtualCaps = !virtualCaps;
      key.classList.toggle("caps-active", virtualCaps);
    });

    return;
  }

  // TAB
  if (keyCode === "9") {
    char = "TAB";
  }

  // SPACE
  if (keyCode === "32") {
    char = " ";
  }

  // NORMAL KEYS
  if (key.hasAttribute("data-char")) {
    char = key.getAttribute("data-char")[0];
  }

  if (!char) return;

  key.addEventListener("click", () => handleInput(char));
  key.addEventListener("touchstart", e => {
    e.preventDefault();
    handleInput(char);
  });
});





