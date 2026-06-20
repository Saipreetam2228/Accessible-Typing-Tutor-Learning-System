// Level 11 — Numbers: Left hand 1 2 3 4 5
const stages = [
  "1 1 1 2 2 2 3 3 3",
  "4 4 4 5 5 5",
  "11 22 33 44 55",
  "12 21 13 31 14 41",
  "123 321 123 321",
  "1234 4321 1234",
  "12345 54321 12345",
  "I have 1 dog.",
  "She has 2 cats.",
  "Buy 3 apples.",
  "I need 4 pens.",
  "There are 5 students.",
];

const levelConfig = {
  currentLevel  : "level11",
  nextPage      : "level12.html",
  restartPage   : "level11.html",
  hasTimer      : true,
  useLetterBoxes: true,
  switchToParaAt : 2,
  introKeys     : ['1','2','3','4','5'],
};
