# Memory Scoring Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add session score accumulation, save records (time/score/combo per level + session total) to localStorage, improve mobile/iOS compatibility.

**Architecture:** Pure vanilla JS class `MemoryGame` — add `sessionScore`, `levelScore`, `records` properties. Persist via `localStorage` under key `natureMemoryRecords`. Migrate from old `natureMemoryBestTimes`.

**Tech Stack:** Vanilla JS, HTML5, CSS3. No frameworks.

---

### Task 1: Session score accumulation in JS

**Files:**
- Modify: `memory_nature/script.js:1-76`
- Modify: `memory_nature/script.js:134-183`
- Modify: `memory_nature/script.js:197-245`

- [ ] **Step 1: Add sessionScore and rename score → levelScore**

In constructor (`script.js:1-33`):
- Rename `this.score = 0` to `this.levelScore = 0`
- Add `this.sessionScore = 0`
- Add `this.records = {}` (will be loaded from localStorage later)

In `initLevel()` (`script.js:47-76`):
- Change `this.score = 0` to `this.levelScore = 0`
- Change `document.getElementById('score').innerText = this.score` to `document.getElementById('score').innerText = this.levelScore`

In `startGame()` (`script.js:41-45`):
- Add `this.sessionScore = 0` before `this.initLevel()`

- [ ] **Step 2: Update checkMatch to use levelScore**

In `checkMatch()` (`script.js:134-183`):
- Change `this.score += pointsEarned` to `this.levelScore += pointsEarned`
- Change `document.getElementById('score').innerText = this.score` to `document.getElementById('score').innerText = this.levelScore`

- [ ] **Step 3: Update handleWin — accumulate session score**

In `handleWin()` (`script.js:197-245`):
- After `clearInterval(this.timer)` (line 199), add:
  ```javascript
  this.sessionScore += this.levelScore;
  ```
- Change `document.getElementById('stat-total-score').innerText = this.score` to `document.getElementById('stat-total-score').innerText = this.levelScore`
- After populating the level stats (around line 222), add session score display:
  ```javascript
  document.getElementById('stat-session-score').innerText = this.sessionScore;
  ```

- [ ] **Step 4: Add session score to next-level-btn handler**

In the `document.getElementById('next-level-btn').onclick` handler (`script.js:239-244`):
- Remove the line `document.getElementById('level').innerText = this.level` (already there, keep this)
- Make sure `initLevel()` is called (it is)

- [ ] **Step 5: Verify no score reset on level transition**

In `initLevel()` confirm `this.sessionScore` is NOT reset.

- [ ] **Step 6: Commit**

```bash
git add memory_nature/script.js
git commit -m "refactor: session score accumulation across levels"
```

---

### Task 2: Records system with localStorage

**Files:**
- Modify: `memory_nature/script.js:1-33`
- Modify: `memory_nature/script.js:197-245`

- [ ] **Step 1: Load records and migrate old data in constructor**

In constructor (`script.js:18`), replace:
```javascript
this.bestTimes = JSON.parse(localStorage.getItem('natureMemoryBestTimes')) || {};
```
with:
```javascript
this.records = JSON.parse(localStorage.getItem('natureMemoryRecords')) || {};
this.migrateOldRecords();
```

Add new method after constructor:
```javascript
migrateOldRecords() {
    const oldData = localStorage.getItem('natureMemoryBestTimes');
    if (oldData && !localStorage.getItem('natureMemoryRecords')) {
        const oldTimes = JSON.parse(oldData);
        Object.keys(oldTimes).forEach(level => {
            this.records[level] = {
                time: oldTimes[level],
                score: 0,
                combo: 0
            };
        });
        localStorage.setItem('natureMemoryRecords', JSON.stringify(this.records));
        localStorage.removeItem('natureMemoryBestTimes');
    }
}
```

- [ ] **Step 2: Save records in handleWin**

In `handleWin()`, replace the existing best-times save block (`script.js:199-204`):
```javascript
// Record keeping — time, score, combo per level + session total
const rec = this.records[this.level] || { time: Infinity, score: 0, combo: 0 };
let newRecordFlags = { time: false, score: false, combo: false, session: false };

if (!this.records[this.level] || this.seconds < rec.time) {
    rec.time = this.seconds;
    newRecordFlags.time = true;
}
if (this.levelScore > rec.score) {
    rec.score = this.levelScore;
    newRecordFlags.score = true;
}
if (this.maxCombo > rec.combo) {
    rec.combo = this.maxCombo;
    newRecordFlags.combo = true;
}

this.records[this.level] = rec;

if (this.sessionScore > (this.records.session?.score || 0)) {
    this.records.session = { score: this.sessionScore };
    newRecordFlags.session = true;
}

localStorage.setItem('natureMemoryRecords', JSON.stringify(this.records));
```

- [ ] **Step 3: Commit**

```bash
git add memory_nature/script.js
git commit -m "feat: save records (time/score/combo) to localStorage"
```

---

### Task 3: Header display — session score + current level records

**Files:**
- Modify: `memory_nature/index.html:13-19`
- Modify: `memory_nature/script.js:247-257`
- Modify: `memory_nature/styles.css:114-138`

- [ ] **Step 1: Update HTML header**

In `index.html`, change the header section (lines 14-19) from:
```html
<header>
    <div class="stat">Poziom: <span id="level">1</span></div>
    <div class="stat best-time">Najlepszy: <span id="best-time">--:--</span></div>
    <div class="stat">Czas: <span id="timer">00:00</span></div>
    <div class="stat">Wynik: <span id="score">0</span></div>
</header>
```
to:
```html
<header>
    <div class="stat">Poziom: <span id="level">1</span></div>
    <div class="stat">Czas: <span id="timer">00:00</span></div>
    <div class="stat">Poziom: <span id="score">0</span></div>
    <div class="stat">Łącznie: <span id="session-score">0</span></div>
    <div class="stat record" id="record-display">
        <span class="record-label">Rekord:</span>
        <span class="record-value" id="record-detail">--</span>
    </div>
</header>
```

- [ ] **Step 2: Update updateBestTimeDisplay → updateRecordDisplay**

Replace `updateBestTimeDisplay()` method:
```javascript
updateRecordDisplay() {
    const el = document.getElementById('record-detail');
    const rec = this.records[this.level];
    if (rec) {
        const stars = rec.time <= this.getCardCount() * 1.5 ? '★★★' :
                      rec.time <= this.getCardCount() * 2.5 ? '★★☆' : '★☆☆';
        const mins = Math.floor(rec.time / 60).toString().padStart(2, '0');
        const secs = (rec.time % 60).toString().padStart(2, '0');
        el.innerText = `${stars} ${mins}:${secs} | ${rec.score}pkt | x${rec.combo}`;
    } else {
        el.innerText = '--';
    }
}
```

Update all calls from `this.updateBestTimeDisplay()` to `this.updateRecordDisplay()` in `initLevel()` and `startGame()`.

Add session score update in `initLevel()` and `startGame()`:
```javascript
document.getElementById('session-score').innerText = this.sessionScore;
```

- [ ] **Step 3: Add CSS for record display**

In `styles.css` after `.stat.best-time` block (after line 138), add:
```css
.stat.record {
    font-size: 0.7rem;
    opacity: 0.8;
    flex-direction: column;
    align-items: center;
}
.stat.record .record-value {
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
}
```

In the `@media (max-width: 768px)` block, add:
```css
.stat.record .record-value {
    font-size: 0.65rem;
}
```

- [ ] **Step 4: Commit**

```bash
git add memory_nature/script.js memory_nature/index.html memory_nature/styles.css
git commit -m "feat: show session score and level records in header"
```

---

### Task 4: Win overlay — session score + NEW RECORD badge

**Files:**
- Modify: `memory_nature/index.html:39-74`
- Modify: `memory_nature/script.js:215-237`

- [ ] **Step 1: Update overlay HTML**

In `index.html`, inside `#next-level-overlay .menu-content`, after the existing `.summary-item.total` (line 68), add a new row for session score:
```html
<div class="summary-item session-total">
    <span>ŁĄCZNY WYNIK:</span>
    <span id="stat-session-score">0</span>
</div>
```

After `.stars` div (after line 46), add:
```html
<div id="new-record-badge" class="new-record hidden">🏆 NOWY REKORD!</div>
```

- [ ] **Step 2: Show/hide new record badge in handleWin**

In `handleWin()`, after the record saving block, add:
```javascript
// Show new record badge if any record was broken
const badge = document.getElementById('new-record-badge');
const anyRecord = newRecordFlags.time || newRecordFlags.score || newRecordFlags.combo || newRecordFlags.session;
if (anyRecord) {
    badge.classList.remove('hidden');
    setTimeout(() => badge.classList.add('hidden'), 4000);
} else {
    badge.classList.add('hidden');
}
```

- [ ] **Step 3: Add CSS for new record badge and session total**

In `styles.css`, after the `.summary-item.total` styles (after line 228), add:
```css
.summary-item.session-total {
    margin-top: 0.3rem;
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(0,0,0,0.1);
    font-size: 1.3rem;
    opacity: 1;
}
.summary-item.session-total span:last-child {
    color: #e74c3c;
    font-size: 1.6rem;
    text-shadow: 0 0 15px rgba(231, 76, 60, 0.3);
}

.new-record {
    font-size: 1.8rem;
    font-weight: 900;
    color: #f39c12;
    text-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
    animation: record-pulse 1s ease-in-out infinite;
    margin: 0.5rem 0;
}

@keyframes record-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}
```

- [ ] **Step 4: Commit**

```bash
git add memory_nature/index.html memory_nature/script.js memory_nature/styles.css
git commit -m "feat: show session score and new record badge in win overlay"
```

---

### Task 5: iOS / Mobile compatibility fixes

**Files:**
- Modify: `memory_nature/styles.css:16-25`
- Modify: `memory_nature/styles.css:84-93`
- Modify: `memory_nature/styles.css:256-258`

- [ ] **Step 1: Add dvh, safe-area, overscroll-behavior**

In `body` (line 16-25), change:
```css
body {
    min-height: 100vh;
```
to:
```css
body {
    min-height: 100dvh;
    overscroll-behavior: none;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
```

In `#game-container` (line 84-93), add safe-area inset:
```css
#game-container {
    width: 95vw;
    max-width: 1000px;
    height: 95dvh;
    padding: 2rem;
    padding: 2rem env(safe-area-inset-right, 2rem) 2rem env(safe-area-inset-left, 2rem);
```

- [ ] **Step 2: Disable sticky hover on touch devices**

Around line 256, replace:
```css
.card:not(.flipped):hover {
    transform: translateY(-8px);
}
```
with:
```css
@media (hover: hover) {
    .card:not(.flipped):hover {
        transform: translateY(-8px);
    }
}
```

Also wrap the `.theme-eco .card:not(.flipped):hover` rule (line 392-394) similarly:
```css
@media (hover: hover) {
    .theme-eco .card:not(.flipped):hover .card-inner {
        transform: translateY(-5px) rotate(2deg);
    }
}
```

- [ ] **Step 3: Remove grain overlay on iOS for performance**

The SVG grain overlay (`body::after` with `background-image`) can cause performance issues on iOS. Add after the grain keyframes:
```css
@supports (-webkit-touch-callout: none) {
    body::after {
        display: none;
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add memory_nature/styles.css
git commit -m "fix: iOS/mobile compatibility - dvh, safe-area, hover, grain"
```

---

### Task 6: Final integration check

**Files:**
- Verify: `memory_nature/script.js`
- Verify: `memory_nature/index.html`
- Verify: `memory_nature/styles.css`

- [ ] **Step 1: Review all cross-references**

Check that:
- `this.records` is used everywhere (not `this.bestTimes`)
- `this.levelScore` is used everywhere (not `this.score`)
- `this.sessionScore` is properly accumulated and displayed
- `updateRecordDisplay()` is called in the right places (initLevel, startGame)
- `session-score` element exists in HTML
- `stat-session-score` element exists in HTML
- `record-detail` element exists in HTML
- `new-record-badge` element exists in HTML
- All CSS class names match what's used in HTML/JS

- [ ] **Step 2: Commit any final fixes**

```bash
git add -A
git commit -m "fix: final integration fixes"
```
