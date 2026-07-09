// Level 15 — Punctuation: . , ; '
const stages = [
  "... ... ... ...",
  "a. b. c. d. e.",
  ",,, ,,, ,,, ,,,",
  "red, blue, green.",
  ";;; ;;; ;;; ;;;",
  "run; jump; stop.",
  "She ran; he walked.",
  "''' ''' ''' '''",
  "it's can't don't I'm",
  "She didn't stop. He couldn't wait.",
  "a. b, c; d. e, f;",
  "I like tea, coffee, and juice.",
  "She ran. He walked; they stopped.",
];

const levelConfig = {
  currentLevel  : "level15",
  nextPage      : "level16.html",
  restartPage   : "level15.html",
  hasTimer      : true,
  useLetterBoxes: true,
  switchToParaAt : 3,
  introKeys     : ['.',';',',','\''],
};
