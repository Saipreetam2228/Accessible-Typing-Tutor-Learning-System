const keySound = new Audio("./assets/keypress.mp3");
const errorSound = new Audio("./assets/wrong.mp3");
const applaudSound = new Audio("./assets/applaud.mp3");

document.addEventListener("DOMContentLoaded", function () {
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
  const keyboard = document.querySelector(".keyboard");

  const stages = [
    "-This is not a chair.",
    "It is a table.",
    "The vase on the table is made of glass.",
    "The book kept on the table is perfect.",

    "Let's go!",
    "All tall walls fall; during an earthquake.",
    "The ill jill climbed the hill.",
    "My mother has made a big cake; it's yummy.",
    "In each town-Mumbai, Bangalore, and Chennai-we stayed in hotels.",

    " Help! he cried. I can't swim! ",
    "Have you read Harry Potter?",
    "I went to Delhi (my favourite city) and stayed there for three weeks.",
    "I don't often go swimming; I prefer to play cricket.",
    "Ugh! Why are you shouting at me?",
    "I wore a blue-colored, long skirt."
  ];

  let currentStage = 0;
  let userInput = "";
  let soundEnabled = false;

  let allTypingResults = JSON.parse(localStorage.getItem("allTypingResults")) || {};
  const currentLevel = "level8";
  if (!allTypingResults[currentLevel]) allTypingResults[currentLevel] = [];

  volButton.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Spacebar") e.preventDefault();
  });

  function updateDisplay() {
    const correctText = stages[currentStage];
    let displayText = "";
    for (let i = 0; i < correctText.length; i++) {
      if (i < userInput.length) {
        displayText += `<span style='color:${userInput[i] === correctText[i] ? "green" : "red"};'>${correctText[i]}</span>`;
      } else displayText += `<span style='color:black;'>${correctText[i]}</span>`;
    }
    keysToTypeElement.innerHTML = displayText;
    messageElement.textContent = `Stage ${currentStage + 1}`;
    if (userInput.length < correctText.length)
      updateHands(correctText[userInput.length]);
    else {
      lnum.src = "./assets/r.png";
      rnum.src = "./assets/r.png";
    }
  }

  function showCongrats() {
    [blury, mascot, congo, restart, next].forEach(el => el.classList.remove("hidden"));
    applaudSound.play();
  }
  function hideCongrats() {
    [blury, mascot, congo, restart, next].forEach(el => el.classList.add("hidden"));
  }

  function speak(text) {
    if (soundEnabled) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text === " " ? "space" : text);
      speechSynthesis.speak(u);
    }
  }

  function pressKey(char) {
    const key = document.querySelector(`[data-char*="${char.toUpperCase()}"]`);
    if (!key && char !== " ") return;
    const target = char === " " ? document.querySelector('[data-key="32"]') : key;
    if (!target) return;
    target.setAttribute("data-pressed", "on");
    target.style.backgroundColor = "#00FF00";
    target.style.transform = "scale(1.1)";
    setTimeout(() => {
      target.removeAttribute("data-pressed");
      target.style.backgroundColor = "";
      target.style.transform = "scale(1)";
    }, 200);
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

  // ✅ Modified: single quote is default, double quote requires Shift
  document.addEventListener("keydown", function (event) {
    let typedChar = event.key;

    // Swap single & double quote behavior
    if (typedChar === '"') {
      typedChar = "'";
    } else if (typedChar === "'") {
      typedChar = '"';
    }

    if (typedChar.length === 1 || typedChar === "Backspace" || typedChar === " ") {
      if (typedChar === "Backspace") {
        userInput = userInput.slice(0, -1);
        if (allTypingResults[currentLevel][currentStage]?.length)
          allTypingResults[currentLevel][currentStage].pop();
        updateDisplay();
        return;
      }

      if (userInput.length < stages[currentStage].length) {
        const expectedChar = stages[currentStage][userInput.length];
        if (!allTypingResults[currentLevel][currentStage])
          allTypingResults[currentLevel][currentStage] = [];

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

  window.toggleSound = function () {
    soundEnabled = !soundEnabled;
    const soundToggleElement = document.getElementById("soundToggle");
    const vol = document.querySelector(".vol");
    soundToggleElement.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
    vol.src = soundEnabled ? "./assets/volume.png" : "./assets/mute.png";
  };

  function resizeKeyboard() {
    const size = keyboard.parentNode.clientWidth / 90;
    keyboard.style.fontSize = size + "px";
  }
  window.addEventListener("resize", resizeKeyboard);
  resizeKeyboard();

  // ✅ Color numbers by their finger’s color
  function colorNumberKeys() {
    const colorMap = {
      "2": "#ff7b7b", // same as W (left ring)
      "3": "#ffa07a", // E (left middle)
      "4": "#ffd700", // R (left index)
      "5": "#ffd700", // R
      "6": "#ffd700", // Y (right index)
      "7": "#ffd700", // Y
      "8": "#ffa07a", // I (right middle)
      "9": "#ff7b7b"  // O (right ring)
    };
    Object.entries(colorMap).forEach(([num, color]) => {
      const key = document.querySelector(`.keyboard [data-char^="${num}"]`);
      if (key) key.style.color = color;
    });
  }

  colorNumberKeys();
  next.addEventListener("click", saveResultsToFile);
  updateDisplay();
  hideCongrats();
});

// touch 
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