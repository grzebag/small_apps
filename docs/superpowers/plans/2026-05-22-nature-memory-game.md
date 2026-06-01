# Nature Memory Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a progressive Memory game with 3 interchangeable nature themes (Zen, Forest, Eco) and a timed progression system.

**Architecture:** A central `MemoryGame` JS class managing state, logic, and levels. CSS Variables handle all visual differences between themes. A single `index.html` structure with a theme-switcher menu.

**Tech Stack:** HTML5, CSS3 (Grid/Flexbox/Variables), Vanilla JavaScript.

---

### Task 1: Basic Project Structure & HTML Scaffolding

**Files:**
- Create: `memory_nature/index.html`
- Create: `memory_nature/styles.css`
- Create: `memory_nature/script.js`

- [ ] **Step 1: Create the directory and files**

Run: `mkdir memory_nature`

- [ ] **Step 2: Implement basic HTML structure**
Create `memory_nature/index.html` with a dashboard (stats), game board container, and a hidden-by-default menu.

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nature Memory - Odkrywanka</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="theme-zen">
    <div id="game-container">
        <header>
            <div class="stat">Poziom: <span id="level">1</span></div>
            <div class="stat">Czas: <span id="timer">00:00</span></div>
            <div class="stat">Wynik: <span id="score">0</span></div>
        </header>
        
        <main id="game-board"></main>

        <div id="menu-overlay" class="overlay">
            <div class="menu-content">
                <h1>Nature Memory</h1>
                <p>Wybierz swój styl:</p>
                <div class="theme-options">
                    <button data-theme="zen">Nature Zen</button>
                    <button data-theme="forest">Forest Quest</button>
                    <button data-theme="eco">Vibrant Eco</button>
                </div>
            </div>
        </div>

        <div id="next-level-overlay" class="overlay hidden">
            <div class="menu-content">
                <h2>Poziom Ukończony!</h2>
                <p id="level-summary"></p>
                <button id="next-level-btn">Następny Poziom</button>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 3: Commit initial structure**

Run: `git add memory_nature/index.html`
Run: `git commit -m "feat: initial HTML structure for memory game"`

---

### Task 2: CSS Variables & Base Layout

**Files:**
- Modify: `memory_nature/styles.css`

- [ ] **Step 1: Define CSS Variables and Base Styles**
Set up the layout using CSS Grid for the board and Flexbox for headers. Define theme variables.

```css
:root {
    --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    --card-back: #fff;
    --card-front: #e2e8f0;
    --accent: #4a90e2;
    --text-color: #2d3748;
    --card-radius: 12px;
    --transition-speed: 0.5s;
}

body.theme-zen {
    --bg-gradient: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    --card-back: #fff;
    --accent: #a8e6cf;
}

body.theme-forest {
    --bg-gradient: linear-gradient(135deg, #1a2a1a 0%, #0d140d 100%);
    --card-back: rgba(255, 255, 255, 0.1);
    --accent: #2d5a27;
    --text-color: #e2e8f0;
}

body.theme-eco {
    --bg-gradient: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
    --card-back: #fff;
    --accent: #ff6b6b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--bg-gradient);
    color: var(--text-color);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

#game-container {
    width: 90vw;
    max-width: 800px;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: bold;
}

#game-board {
    display: grid;
    gap: 15px;
    perspective: 1000px;
}

.overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.hidden { display: none !important; }

.menu-content {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    color: #333;
}
```

- [ ] **Step 2: Commit CSS**
Run: `git add memory_nature/styles.css`
Run: `git commit -m "style: add base styles and theme variables"`

---

### Task 3: Game Engine - Card Shuffling & Rendering

**Files:**
- Modify: `memory_nature/script.js`

- [ ] **Step 1: Implement MemoryGame class core**
Define the class, card data, and basic rendering logic.

```javascript
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.level = 1;
        this.score = 0;
        this.timer = null;
        this.seconds = 0;
        this.isLocked = false;

        this.emojis = ['🌿', '🦊', '🌻', '🦉', '🍄', '🦋', '🌲', '🐿️', '🦌', '🐻', '🌸', '🐝', '🐞', '🍃', '🍎', '🍐'];
        
        this.board = document.getElementById('game-board');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.theme-options button').forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(e.target.dataset.theme));
        });
    }

    startGame(theme) {
        document.body.className = `theme-${theme}`;
        document.getElementById('menu-overlay').classList.add('hidden');
        this.initLevel();
    }

    initLevel() {
        this.board.innerHTML = '';
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isLocked = false;
        
        const cardCount = this.getCardCount();
        const levelEmojis = this.getRandomEmojis(cardCount / 2);
        const gameSet = [...levelEmojis, ...levelEmojis].sort(() => Math.random() - 0.5);

        this.board.style.gridTemplateColumns = `repeat(${this.getColumns()}, 1fr)`;

        gameSet.forEach((emoji, index) => {
            const card = this.createCardElement(emoji, index);
            this.board.appendChild(card);
        });

        this.startTimer();
    }

    getCardCount() {
        const counts = { 1: 12, 2: 16, 3: 20, 4: 24 };
        return counts[this.level] || 24;
    }

    getColumns() {
        const cols = { 1: 4, 2: 4, 3: 5, 4: 6 };
        return cols[this.level] || 6;
    }

    getRandomEmojis(count) {
        return this.emojis.sort(() => Math.random() - 0.5).slice(0, count);
    }

    createCardElement(emoji, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${emoji}</div>
            </div>
        `;
        card.addEventListener('click', () => this.flipCard(card));
        return card;
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.seconds = 0;
        this.timer = setInterval(() => {
            this.seconds++;
            const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
            const secs = (this.seconds % 60).toString().padStart(2, '0');
            document.getElementById('timer').innerText = `${mins}:${secs}`;
        }, 1000);
    }
}

const game = new MemoryGame();
```

- [ ] **Step 2: Commit JS Core**
Run: `git add memory_nature/script.js`
Run: `git commit -m "feat: basic game engine with card shuffling"`

---

### Task 4: Card Flip Logic & Matching

**Files:**
- Modify: `memory_nature/script.js`
- Modify: `memory_nature/styles.css`

- [ ] **Step 1: Add Card Flip styles**
Implement 3D flip effect in CSS.

```css
.card {
    aspect-ratio: 3/4;
    cursor: pointer;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform var(--transition-speed);
    transform-style: preserve-3d;
}

.card.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    border-radius: var(--card-radius);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-front {
    background: var(--card-back);
    color: var(--accent);
}

.card-back {
    background: white;
    transform: rotateY(180deg);
}
```

- [ ] **Step 2: Implement flipCard logic in script.js**

```javascript
flipCard(card) {
    if (this.isLocked || card.classList.contains('flipped') || this.flippedCards.includes(card)) return;

    card.classList.add('flipped');
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
        this.checkMatch();
    }
}

checkMatch() {
    this.isLocked = true;
    const [card1, card2] = this.flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;

    if (isMatch) {
        this.matchedPairs++;
        this.score += 10;
        document.getElementById('score').innerText = this.score;
        this.flippedCards = [];
        this.isLocked = false;
        
        if (this.matchedPairs === this.getCardCount() / 2) {
            this.handleWin();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.flippedCards = [];
            this.isLocked = false;
        }, 1000);
    }
}
```

- [ ] **Step 3: Commit Flip logic**
Run: `git add memory_nature/script.js memory_nature/styles.css`
Run: `git commit -m "feat: card flipping and matching logic"`

---

### Task 5: Progression & Victory UI

**Files:**
- Modify: `memory_nature/script.js`

- [ ] **Step 1: Implement handleWin and Next Level logic**

```javascript
handleWin() {
    clearInterval(this.timer);
    const summary = `Ukończyłeś poziom ${this.level} w czasie ${this.seconds} sekund!`;
    document.getElementById('level-summary').innerText = summary;
    document.getElementById('next-level-overlay').classList.remove('hidden');
    
    document.getElementById('next-level-btn').onclick = () => {
        this.level++;
        document.getElementById('level').innerText = this.level;
        document.getElementById('next-level-overlay').classList.add('hidden');
        this.initLevel();
    };
}
```

- [ ] **Step 2: Commit Progression**
Run: `git commit -am "feat: progression and win state UI"`

---

### Task 6: Visual Polish - Nature Zen Theme

**Files:**
- Modify: `memory_nature/styles.css`

- [ ] **Step 1: Refine Zen theme styles**
Focus on minimalism and soft transitions.

```css
.theme-zen .card-front {
    border: 2px solid #e0e0e0;
}
.theme-zen .card-inner {
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

### Task 7: Visual Polish - Forest Quest Theme

**Files:**
- Modify: `memory_nature/styles.css`

- [ ] **Step 1: Refine Forest theme (Glassmorphism)**

```css
.theme-forest .card-front {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #4ade80;
}
.theme-forest .card-back {
    background: rgba(255, 255, 255, 0.9);
}
```

---

### Task 8: Visual Polish - Vibrant Eco Theme

**Files:**
- Modify: `memory_nature/styles.css`

- [ ] **Step 1: Refine Eco theme (Bounce & Color)**

```css
.theme-eco .card-inner {
    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.theme-eco .card-front {
    background: #fff0f0;
    border: 3px solid #ff6b6b;
}
```

---

### Task 9: Final Polish & Responsive Grid

**Files:**
- Modify: `memory_nature/styles.css`

- [ ] **Step 1: Add media queries for mobile**

```css
@media (max-width: 600px) {
    #game-board {
        gap: 8px;
    }
    .card-front, .card-back {
        font-size: 1.5rem;
    }
}
```

- [ ] **Step 2: Final Commit**
Run: `git commit -am "polish: final theme refinements and responsiveness"`
