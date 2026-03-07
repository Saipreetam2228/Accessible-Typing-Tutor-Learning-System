function getKey(e) {
  var location = e.location;
  var selector;
  if (location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
    selector = ['[data-key="' + e.keyCode + '-R"]'];
  } else {
    var code = e.keyCode || e.which;
    selector = [
      '[data-key="' + code + '"]',
      '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]',
    ].join(",");
  }
  return document.querySelector(selector);
}

function pressKey(char) {
  var key = document.querySelector('[data-char*="' + char.toUpperCase() + '"]');
  if (!key) {
    return console.warn("No key for", char);
  }
  key.setAttribute("data-pressed", "on");
  setTimeout(function () {
    key.removeAttribute("data-pressed");
  }, 200);
}

// var h1 = document.querySelector("h1");
// var originalQueue = h1.innerHTML;
// var queue = h1.innerHTML;
console.log("sairam");

const blury = document.querySelector(".blur");
const mascot = document.querySelector(".mascot");
const congo = document.querySelector(".congo");
const restart = document.querySelector(".restart");
const next = document.querySelector(".next");
var applaud = document.getElementById("myAudio");

document.querySelector(".volbt").addEventListener("keydown", function (event) {
  if (event.key === " ") {
    // Check if spacebar is pressed
    event.preventDefault(); // Prevent default behavior (click event)
  }
});

const showContent = function () {
  console.log("show");
  blury.classList.add("hidden");
  mascot.classList.add("hidden");
  congo.classList.add("hidden");
  restart.classList.add("hidden");
  next.classList.add("hidden");
};

const hideContent = function () {
  console.log("show");
  blury.classList.remove("hidden");
  mascot.classList.remove("hidden");
  congo.classList.remove("hidden");
  restart.classList.remove("hidden");
  next.classList.remove("hidden");
};

// function next() {
//   var c = queue[0];
//   queue = queue.slice(1);
//   h1.innerHTML = originalQueue.slice(0, originalQueue.length - queue.length);
//   pressKey(c);
//   if (queue.length) {
//     setTimeout(next, Math.random() * 200 + 50);
//   }
// }

// h1.innerHTML = "&nbsp;";
// setTimeout(next, 500);

document.body.addEventListener("keydown", function (e) {
  var key = getKey(e);
  if (!key) {
    return console.warn("No key for", e.keyCode);
  }

  key.setAttribute("data-pressed", "on");
});

document.body.addEventListener("keyup", function (e) {
  var key = getKey(e);
  key && key.removeAttribute("data-pressed");
});

function size() {
  var size = keyboard.parentNode.clientWidth / 90;
  keyboard.style.fontSize = size + "px";
  console.log(size);
}

var keyboard = document.querySelector(".keyboard");
window.addEventListener("resize", function (e) {
  size();
});
size();

function con() {
  var congoaudio = new Audio("./assets/applaud.mp3");
  congoaudio.play();
}

function pressed() {
  var congoaudio = new Audio("./assets/keypress.mp3");
  congoaudio.play();
}

function wrong() {
  var congoaudio = new Audio("./assets/wrong.mp3");
  congoaudio.play();
}

const stages = [
  // [
  //   "F",
  //   " ",
  //   "D",
  //   " ",
  //   "S",
  //   " ",
  //   "A",
  //   " ",
  //   "J",
  //   " ",
  //   "K",
  //   " ",
  //   "L",
  //   " ",
  //   "G",
  //   " ",
  //   "H",
  //   " ",
  //   ";",
  // ],
  // ["E", "I"],
  // ["R", "U"],
  ["F", " ", "F", "F", " ", "F", "F", "F", " ", "F", "F", "F", "F"],
];

let currentStage = 0;
const messageElement = document.getElementById("message");
const keysToTypeElement = document.getElementById("keysToTypeSpan");
let soundEnabled = false;
// keysToTypeElement.textContent = stages[currentStage][0]; //press any key to type

// Initial speech when the page loads
// speakKey(stages[currentStage][0]);

document.addEventListener("keydown", function (event) {
  const pressedKey = event.key.toUpperCase(); //case sensitive check
  pressed();

  lastKey = pressedKey;
  checkKey(pressedKey);
});

var rnum = document.querySelector(".rh");
var lnum = document.querySelector(".lh");

function checkKey(key) {
  const correctKey = stages[currentStage][0];
  const toshow=stages[currentStage][1]; //checks the first key

  if (
    toshow == "V" ||
    toshow == "F" ||
    toshow == "R" ||
    toshow == "T" ||
    toshow == "G" ||
    toshow == "B"
  ) {
    lnum.src = `./assets/r2.png`;
    console.log("2");
  } else if (correctKey == "E" || correctKey == "D" || correctKey == "C") {
    lnum.src = `./assets/r3.png`;
    console.log("3");
  } else if (correctKey == "W" || correctKey == "S" || correctKey == "X") {
    console.log("4");
    lnum.src = `./assets/r4.png`;
  } else if (correctKey == "Q" || correctKey == "A" || correctKey == "Z") {
    console.log("5");
    lnum.src = `./assets/r5.png`;
  } else {
    lnum.src = `./assets/r.png`;
  }

  if (
    toshow == "N" ||
    toshow == "H" ||
    toshow == "Y" ||
    toshow == "U" ||
    toshow == "J" ||
    toshow == "M"
  ) {
    rnum.src = `./assets/r2.png`;
    console.log("r2");
  } else if (
    toshow == "I" ||
    toshow == "K" ||
    toshow == "<" ||
    toshow == ","
  ) {
    rnum.src = `./assets/r3.png`;
    console.log("r3");
  } else if (
    toshow == "O" ||
    toshow == "L" ||
    toshow == ">" ||
    toshow == "."
  ) {
    console.log("r4");
    rnum.src = `./assets/r4.png`;
  } else if (
    toshow == "P" ||
    toshow == ";" ||
    toshow == "/" ||
    toshow == "?"
  ) {
    console.log("r5");
    rnum.src = `./assets/r5.png`;
  } else {
    rnum.src = `./assets/r.png`;
  }

  if (toshow === " ") {
    rnum.src = `./assets/r1.png`;
    lnum.src = `./assets/r1.png`;
  }

  if (correctKey === key) {
    stages[currentStage].shift();
    document.getElementById(key.toLowerCase()).style.backgroundColor =
      getRandomColor();
    document.getElementById(key.toLowerCase()).style.transform = "scale(1.1)";

    if (stages[currentStage].length === 0) {
      currentStage++;
      if (currentStage < stages.length) {
        messageElement.textContent = `Stage ${
          currentStage + 1
        }: Type the letter ${stages[currentStage][0]} now.`;
        keysToTypeElement.textContent = stages[currentStage][0];
        speakKey(stages[currentStage][0]); // Speak the next key
      } else {
        messageElement.textContent =
          "Congratulations! You completed all stages.";
        keysToTypeElement.textContent = "";
        hideContent();
        con();
      }
    } else {
      messageElement.textContent = `Correct! Type the letter ${stages[currentStage][0]} now.`;
      keysToTypeElement.textContent = stages[currentStage].join(""); //,
      speakKey(stages[currentStage][0]); // Speak the next key
    }
  } else {
    wrong();
    messageElement.textContent = "Wrong key. Try again.";
    document.getElementById(key.toLowerCase()).style.backgroundColor =
      "#EF5350";
    document.getElementById(key.toLowerCase()).style.transform = "scale(0.9)";
  }

  setTimeout(() => {
    document.getElementById(key.toLowerCase()).style.backgroundColor = "#333";
    document.getElementById(key.toLowerCase()).style.transform = "scale(1)";
  }, 300);
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// function speakKey(key) {
//   if (soundEnabled) {
//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(key);
//     synth.speak(utterance);
//   }
// }

function speakKey(key) {
  if (soundEnabled) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();

    // Convert space to "space" for speech
    if (key === " ") {
      utterance.text = "space";
    } else {
      utterance.text = key;
    }

    // Speak the key
    synth.speak(utterance);

    // Add a small delay to ensure proper processing of the next key
    utterance.onend = function() {
      setTimeout(() => {
        // After speaking, you can trigger any action needed, like typing/displaying the key
        console.log("Key spoken:", key); // Replace with the typing/display action
      }, 100); // Adjust the delay as needed (in milliseconds)
    };
  }
}



function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundToggleElement = document.getElementById("soundToggle");
  let vol = document.querySelector(".vol");
  soundToggleElement.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
  if (soundEnabled) {
    vol.src = `./assets/volume.png`;
  } else {
    vol.src = "./assets/mute.png";
  }
}

// querySelctorall,toggle;
