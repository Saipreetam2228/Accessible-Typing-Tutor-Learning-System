// Level 31 — Advanced: Numeric Keypad (number-heavy real-world data)
const stages = [
  "123 456 789 0 123 456 789 0",
  "147 258 369 0 147 258 369 0",
  "159 260 371 482 159 260 371",
  "1234 5678 9012 3456 7890",
  "9876 5432 1098 7654 3210",
  "12 34 56 78 90 12 34 56 78 90",
  "phone: 9876543210 pin: 482910",
  "date: 14 03 2024 time: 09 30 00",
  "roll number 2047 scored 378 out of 400",
  "invoice 10042 amount 3750 due in 30 days",
  "coordinates: 17.3850 north 78.4867 east",
  "train 12723 departs at 06 15 arrives at 14 40",
  "population of india: 1428627663 as of 2024",
  "she deposited 25000 and withdrew 7500 on 03 01 2024",
];

const levelConfig = {
  currentLevel  : "level31",
  nextPage      : "level32.html",
  restartPage   : "level31.html",
  hasTimer      : true,
  useLetterBoxes: false,
  introKeys     : [],
};

