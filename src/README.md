# Type Tutor ⌨️

**Type Tutor** is a browser-based typing tutor application built with pure HTML, CSS, and JavaScript. It helps users learn touch typing from scratch and improve their speed and accuracy — no installation or backend required.

---

## ✨ Features

- **Learning Mode** — A progressive level system that introduces new keys one step at a time, with visual hints and letter boxes guiding the user
- **Practice Mode** — A free-form typing environment with generated paragraphs across 20+ topics (Space, Animals, Technology, and more)
- **Real-Time Metrics** — Tracks Words Per Minute (WPM), Letters Per Second (LPS), and Accuracy live as you type
- **Interactive Virtual Keyboard** — Highlights the next required key and shows correct finger placement using animated virtual hands
- **Profile System** — Multiple user profiles with independent progress and session history
- **My Results** — Per-profile history of past sessions, persisted across browser sessions via localStorage
- **Dark / Light Mode** — Built-in theme toggle
- **Sound** — Keystroke sounds, error sounds, and background music with a toggle to turn them on or off

---

## 📂 Project Structure

```
type-tutor/
├── index.html              # Profile selection screen
├── home.html               # Main menu
├── practice.html           # Practice mode
├── results.html            # My Results page
├── css/                    # Stylesheets
├── js/
│   ├── config.js           # Level configuration
│   ├── home.js             # Home screen logic
│   ├── utils/
│   │   ├── music.js        # Background music handling
│   │   └── transitions.js  # Page transition effects
├── legacy/
│   ├── main.js             # Core gameplay engine
│   └── indexscript.js      # Profile management
├── levels/                 # HTML files for each learning level
└── assets/
    ├── audio/              # Sound effects and background music
    ├── images/             # UI images and icons
    └── keyboard/           # Virtual keyboard assets
```

---

## 🔗 Live Demo

[https://sssvvtypingtutor.netlify.app](https://sssvvtypingtutor.netlify.app)

---

## 🛠️ Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage for data persistence
