# Tank Wars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a turn-based Tank Wars game with terrain deformation, wind physics, AI opponent, and PWA support for mobile iOS.

**Architecture:** Canvas-based game with pixel terrain stored in 2D array. Terrain generated via Simplex noise, deformed by explosions. Physics engine handles parabolic projectile trajectories with wind. AI opponent calculates optimal angle/power with configurable difficulty.

**Tech Stack:** Vanilla HTML + JavaScript + CSS, Web Audio API, Canvas 2D, PWA manifest

---

## File Structure

```
tank_wars/
├── index.html          # Game layout, canvas, controls, HUD
├── script.js           # Game engine, physics, terrain, AI, rendering
├── styles.css          # Mobile-first responsive styling
├── manifest.json       # PWA manifest
├── icon-192.png        # App icon 192x192
└── icon-512.png        # App icon 512x512
```

---

## Task 1: Create HTML structure and CSS layout

**Files:**
- Create: `tank_wars/index.html`
- Create: `tank_wars/styles.css`

- [ ] **Step 1: Create index.html with game layout**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Tank Wars - Wojna Czołgów</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <div class="game-wrapper">
        <header class="game-header">
            <h1>TANK WARS</h1>
            <div class="stats">
                <div class="stat-box player">
                    <span class="label">GRACZ</span>
                    <div class="hp-bar"><div class="hp-fill" id="player-hp"></div></div>
                    <span class="hp-text" id="player-hp-text">100</span>
                </div>
                <div class="wind-box">
                    <span class="label">WIATR</span>
                    <div class="wind-arrow" id="wind-arrow">→</div>
                    <span class="wind-text" id="wind-text">0.0</span>
                </div>
                <div class="stat-box enemy">
                    <span class="label">AI</span>
                    <div class="hp-bar"><div class="hp-fill" id="enemy-hp"></div></div>
                    <span class="hp-text" id="enemy-hp-text">100</span>
                </div>
            </div>
        </header>

        <div class="canvas-container">
            <canvas id="gameCanvas"></canvas>
            <div id="message" class="message hidden"></div>
        </div>

        <div class="controls">
            <div class="slider-group">
                <label>KĄT: <span id="angle-value">45</span>°</label>
                <input type="range" id="angle-slider" min="0" max="180" value="45">
            </div>
            <div class="slider-group">
                <label>SIŁA: <span id="power-value">50</span>%</label>
                <input type="range" id="power-slider" min="0" max="100" value="50">
            </div>
            <button id="fire-btn">STRZAŁ</button>
        </div>

        <div class="difficulty-select" id="difficulty-select">
            <h2>WYBIERZ POZIOM TRUDNOŚCI</h2>
            <button class="diff-btn" data-level="easy">ŁATWY</button>
            <button class="diff-btn" data-level="medium">ŚREDNI</button>
            <button class="diff-btn" data-level="hard">TRUDNY</button>
        </div>

        <div class="game-over hidden" id="game-over">
            <h2 id="game-over-text">KONIEC GRY</h2>
            <button id="restart-btn">ZAGRAJ PONOWNIE</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create styles.css with mobile-first layout**

```css
:root {
    --bg-dark: #1a1a2e;
    --panel-bg: #16213e;
    --accent: #e94560;
    --green: #4a7c3f;
    --text: #eee;
    --hp-green: #4caf50;
    --hp-red: #f44336;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Courier New', monospace;
    background: var(--bg-dark);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
}

.game-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 800px;
    height: 100vh;
    height: 100dvh;
}

.game-header {
    background: var(--panel-bg);
    padding: 8px 12px;
    border-bottom: 2px solid var(--accent);
}

h1 {
    text-align: center;
    font-size: 1.4rem;
    color: var(--accent);
    margin-bottom: 6px;
    letter-spacing: 3px;
}

.stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.stat-box {
    flex: 1;
    text-align: center;
}

.label {
    font-size: 0.65rem;
    color: #888;
    display: block;
    margin-bottom: 2px;
}

.hp-bar {
    height: 12px;
    background: #333;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 2px;
}

.hp-fill {
    height: 100%;
    background: var(--hp-green);
    transition: width 0.3s, background 0.3s;
    width: 100%;
}

.hp-fill.low { background: var(--hp-red); }

.hp-text {
    font-size: 0.8rem;
    font-weight: bold;
}

.wind-box {
    text-align: center;
    min-width: 60px;
}

.wind-arrow {
    font-size: 1.2rem;
    transition: transform 0.3s;
}

.wind-text {
    font-size: 0.7rem;
    color: #aaa;
}

.canvas-container {
    flex: 1;
    position: relative;
    background: #0f0f23;
    overflow: hidden;
}

canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.85);
    color: var(--accent);
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    pointer-events: none;
    z-index: 10;
}

.message.hidden { display: none; }

.controls {
    background: var(--panel-bg);
    padding: 10px 12px;
    display: flex;
    gap: 10px;
    align-items: center;
    border-top: 2px solid var(--accent);
}

.slider-group {
    flex: 1;
}

.slider-group label {
    display: block;
    font-size: 0.7rem;
    color: #aaa;
    margin-bottom: 2px;
}

input[type="range"] {
    width: 100%;
    height: 24px;
    -webkit-appearance: none;
    background: #333;
    border-radius: 4px;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
}

#fire-btn {
    padding: 10px 20px;
    background: var(--green);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 1px;
}

#fire-btn:active { background: #3a6630; }
#fire-btn:disabled { background: #555; cursor: not-allowed; }

.difficulty-select, .game-over {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.92);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    z-index: 20;
}

.difficulty-select.hidden, .game-over.hidden { display: none; }

.difficulty-select h2, .game-over h2 {
    color: var(--accent);
    font-size: 1.3rem;
    letter-spacing: 2px;
}

.diff-btn {
    width: 200px;
    padding: 14px;
    background: var(--panel-bg);
    color: var(--text);
    border: 2px solid var(--accent);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 1px;
}

.diff-btn:active { background: var(--accent); }

#restart-btn {
    padding: 14px 32px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    cursor: pointer;
}

@media (min-width: 600px) {
    h1 { font-size: 1.8rem; }
    .controls { padding: 14px 20px; }
    .slider-group label { font-size: 0.8rem; }
}
```

- [ ] **Step 3: Verify HTML structure loads correctly**

Open `tank_wars/index.html` in browser. Expected: dark background, header with HP bars, empty canvas area, control sliders, difficulty selection overlay visible.

---

## Task 2: Create PWA manifest and icons

**Files:**
- Create: `tank_wars/manifest.json`
- Create: `tank_wars/icon-192.png`
- Create: `tank_wars/icon-512.png`

- [ ] **Step 1: Create manifest.json**

```json
{
    "name": "Tank Wars - Wojna Czołgów",
    "short_name": "Tank Wars",
    "description": "Turowa gra czołgowa z deformacją terenu",
    "start_url": "./index.html",
    "display": "standalone",
    "background_color": "#1a1a2e",
    "theme_color": "#e94560",
    "orientation": "portrait",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

- [ ] **Step 2: Generate placeholder icons**

Create simple canvas-generated icons (green tank on dark background). These are placeholders - can be replaced with proper art later. Use any simple 192x192 and 512x512 PNG files, or generate them programmatically.

- [ ] **Step 3: Verify PWA installability**

Open in Chrome DevTools > Application > Manifest. Expected: manifest loaded, icons detected, "Add to home screen" available.

---

## Task 3: Implement Simplex noise and terrain generation

**Files:**
- Create: `tank_wars/script.js`

- [ ] **Step 1: Create script.js with Simplex noise implementation**

```javascript
// Simplex Noise (simplified 2D)
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(seed * 256 + i) % 256;
        this.perm = [];
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    dot(g, x, y) { return g[0] * x + g[1] * y; }

    noise(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;
        let s = (xin + yin) * F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        let t = (i + j) * G2;
        let X0 = i - t, Y0 = j - t;
        let x0 = xin - X0, y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }
        let x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        let x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        let ii = i & 255, jj = j & 255;
        let gi0 = this.perm[ii + this.perm[jj]] % 12;
        let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        let n0 = 0, n1 = 0, n2 = 0;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); }
        return 70 * (n0 + n1 + n2);
    }
}
```

- [ ] **Step 2: Add terrain generation function**

Append to `script.js`:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TERRAIN = {
    pixels: null,
    width: 0,
    height: 0,
    generate(width, height) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint8Array(width * height);
        const noise = new SimplexNoise();
        const baseHeight = height * 0.65;
        const amplitude = height * 0.2;
        
        for (let x = 0; x < width; x++) {
            let h = 0;
            h += noise.noise(x * 0.008, 0) * amplitude;
            h += noise.noise(x * 0.02, 0) * amplitude * 0.5;
            h += noise.noise(x * 0.05, 0) * amplitude * 0.25;
            let terrainTop = Math.floor(baseHeight - h);
            terrainTop = Math.max(20, Math.min(height - 40, terrainTop));
            
            for (let y = terrainTop; y < height; y++) {
                this.pixels[y * width + x] = 1;
            }
        }
    },
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        return this.pixels[y * this.width + x];
    },
    set(x, y, val) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.pixels[y * this.width + x] = val;
    },
    getHeightAt(x) {
        for (let y = 0; y < this.height; y++) {
            if (this.get(x, y)) return y;
        }
        return this.height;
    }
};
```

- [ ] **Step 3: Test terrain generation**

Add temporary test code at bottom of script.js:

```javascript
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    TERRAIN.generate(canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawTerrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            if (TERRAIN.get(x, y)) {
                const depth = y - TERRAIN.getHeightAt(x);
                if (depth < 10) {
                    imageData.data[idx] = 74; imageData.data[idx+1] = 124; imageData.data[idx+2] = 63;
                } else if (depth < 40) {
                    imageData.data[idx] = 139; imageData.data[idx+1] = 90; imageData.data[idx+2] = 43;
                } else {
                    imageData.data[idx] = 107; imageData.data[idx+1] = 107; imageData.data[idx+2] = 107;
                }
                imageData.data[idx+3] = 255;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

drawTerrain();
```

Open in browser. Expected: hilly terrain rendered with green/brown/gray gradient.

- [ ] **Step 4: Commit initial terrain**

```bash
git add tank_wars/
git commit -m "feat: add terrain generation with simplex noise"
```

---

## Task 4: Implement tank rendering and positioning

**Files:**
- Modify: `tank_wars/script.js`

- [ ] **Step 1: Add Tank class**

Append to `script.js`:

```javascript
class Tank {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.angle = 45;
        this.hp = 100;
        this.maxHp = 100;
        this.isPlayer = isPlayer;
        this.width = 20;
        this.height = 10;
        this.falling = false;
        this.fallSpeed = 0;
    }

    draw(ctx) {
        const baseY = this.y;
        const dir = this.isPlayer ? 1 : -1;
        
        // Tank body
        ctx.fillStyle = this.isPlayer ? '#2d5a1e' : '#5a1e1e';
        ctx.fillRect(this.x - this.width/2, baseY - this.height, this.width, this.height);
        
        // Tank turret
        ctx.fillStyle = this.isPlayer ? '#1e3a12' : '#3a1212';
        ctx.fillRect(this.x - 4, baseY - this.height - 4, 8, 4);
        
        // Barrel
        ctx.save();
        ctx.translate(this.x, baseY - this.height - 2);
        ctx.rotate(-this.angle * Math.PI / 180 * dir);
        ctx.fillStyle = '#444';
        ctx.fillRect(0, -2, 14, 4);
        ctx.restore();
        
        // HP bar
        const barWidth = 24;
        const barHeight = 3;
        const barX = this.x - barWidth/2;
        const barY = baseY - this.height - 10;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = this.hp > 30 ? '#4caf50' : '#f44336';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }
}

const game = {
    player: null,
    enemy: null,
    difficulty: 'medium',
    wind: 0,
    turn: 'player',
    phase: 'selecting',
    projectile: null,
    explosions: [],
    fallingTanks: []
};
```

- [ ] **Step 2: Add tank placement function**

```javascript
function placeTanks() {
    const margin = 60;
    const px = margin + Math.random() * (canvas.width / 2 - margin);
    const ex = canvas.width / 2 + margin + Math.random() * (canvas.width / 2 - margin);
    
    game.player = new Tank(px, TERRAIN.getHeightAt(px), true);
    game.enemy = new Tank(ex, TERRAIN.getHeightAt(ex), false);
    game.player.angle = 45;
    game.enemy.angle = 135;
}
```

- [ ] **Step 3: Update draw loop to include tanks**

Replace temporary drawTerrain with:

```javascript
function draw() {
    drawTerrain();
    if (game.player) game.player.draw(ctx);
    if (game.enemy) game.enemy.draw(ctx);
    if (game.projectile) drawProjectile();
    drawExplosions();
    drawHUD();
}

function drawProjectile() {
    const p = game.projectile;
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawExplosions() {
    game.explosions.forEach(e => {
        const alpha = 1 - e.age / e.maxAge;
        ctx.fillStyle = `rgba(255, ${100 * alpha}, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * (1 - alpha * 0.3), 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHUD() {
    // Wind indicator
    const windArrow = document.getElementById('wind-arrow');
    const windText = document.getElementById('wind-text');
    if (game.wind > 0) windArrow.textContent = '→';
    else if (game.wind < 0) windArrow.textContent = '←';
    else windArrow.textContent = '•';
    windText.textContent = Math.abs(game.wind * 100).toFixed(1);
}

requestAnimationFrame(function loop() {
    draw();
    requestAnimationFrame(loop);
});
```

- [ ] **Step 4: Test tanks render on terrain**

Open in browser. Expected: two tanks positioned on terrain surface, colored differently (green for player, red for enemy), with HP bars and barrels.

---

## Task 5: Implement player controls (sliders + fire button)

**Files:**
- Modify: `tank_wars/script.js`

- [ ] **Step 1: Add control event listeners**

```javascript
const angleSlider = document.getElementById('angle-slider');
const powerSlider = document.getElementById('power-slider');
const angleValue = document.getElementById('angle-value');
const powerValue = document.getElementById('power-value');
const fireBtn = document.getElementById('fire-btn');
const messageEl = document.getElementById('message');

angleSlider.addEventListener('input', () => {
    game.player.angle = parseInt(angleSlider.value);
    angleValue.textContent = angleSlider.value;
});

powerSlider.addEventListener('input', () => {
    powerValue.textContent = powerSlider.value;
});

fireBtn.addEventListener('click', fire);
fireBtn.addEventListener('touchend', (e) => { e.preventDefault(); fire(); });

function showMessage(text, duration = 1500) {
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => messageEl.classList.add('hidden'), duration);
}

function fire() {
    if (game.phase !== 'player' || !game.player) return;
    game.phase = 'shooting';
    fireBtn.disabled = true;
    
    const power = parseInt(powerSlider.value) / 100;
    const angle = game.player.angle * Math.PI / 180;
    const speed = power * 12;
    
    game.projectile = {
        x: game.player.x,
        y: game.player.y - game.player.height - 2,
        vx: Math.cos(angle) * speed * (game.player.angle <= 90 ? 1 : -1),
        vy: -Math.sin(angle) * speed,
        owner: 'player'
    };
    
    showMessage('SZYBUJE...', 500);
}
```

- [ ] **Step 2: Add keyboard controls**

```javascript
document.addEventListener('keydown', (e) => {
    if (game.phase !== 'player') return;
    
    switch(e.key) {
        case 'ArrowLeft':
            game.player.angle = Math.min(180, game.player.angle + 2);
            angleSlider.value = game.player.angle;
            angleValue.textContent = game.player.angle;
            break;
        case 'ArrowRight':
            game.player.angle = Math.max(0, game.player.angle - 2);
            angleSlider.value = game.player.angle;
            angleValue.textContent = game.player.angle;
            break;
        case 'ArrowUp':
            powerSlider.value = Math.min(100, parseInt(powerSlider.value) + 2);
            powerValue.textContent = powerSlider.value;
            break;
        case 'ArrowDown':
            powerSlider.value = Math.max(0, parseInt(powerSlider.value) - 2);
            powerValue.textContent = powerSlider.value;
            break;
        case ' ':
            e.preventDefault();
            fire();
            break;
    }
});
```

- [ ] **Step 3: Test controls work**

Open in browser. Move sliders - angle/power values update. Press fire - projectile appears (even if no physics yet). Keyboard arrows adjust values.

---

## Task 6: Implement projectile physics and collisions

**Files:**
- Modify: `tank_wars/script.js`

- [ ] **Step 1: Add physics update loop**

```javascript
const GRAVITY = 0.15;

function updatePhysics() {
    if (!game.projectile) return;
    
    const p = game.projectile;
    p.vy += GRAVITY;
    p.vx += game.wind;
    p.x += p.vx;
    p.y += p.vy;
    
    // Terrain collision
    if (TERRAIN.get(Math.floor(p.x), Math.floor(p.y))) {
        explode(p.x, p.y, p.owner);
        return;
    }
    
    // Tank collision
    const target = p.owner === 'player' ? game.enemy : game.player;
    if (target) {
        const dx = p.x - target.x;
        const dy = p.y - (target.y - target.height/2);
        if (Math.abs(dx) < target.width/2 + 3 && Math.abs(dy) < target.height/2 + 3) {
            explode(p.x, p.y, p.owner, true);
            return;
        }
    }
    
    // Out of bounds
    if (p.x < 0 || p.x > canvas.width || p.y > canvas.height) {
        game.projectile = null;
        endTurn();
        return;
    }
}

function explode(x, y, owner, directHit = false) {
    const power = parseInt(powerSlider.value) / 100;
    const radius = 15 + power * 10;
    const damage = directHit ? 40 : 0;
    
    game.explosions.push({ x, y, radius, age: 0, maxAge: 30 });
    
    // Deform terrain
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx*dx + dy*dy <= radius*radius) {
                const px = Math.floor(x + dx);
                const py = Math.floor(y + dy);
                if (TERRAIN.get(px, py) && py < TERRAIN.height - 10) {
                    TERRAIN.set(px, py, 0);
                }
            }
        }
    }
    
    // Apply damage to nearby tanks
    [game.player, game.enemy].forEach(tank => {
        if (!tank) return;
        const dist = Math.sqrt((tank.x - x)**2 + (tank.y - y)**2);
        if (dist < radius + 10) {
            const dmg = Math.floor(40 * (1 - dist / (radius + 10)));
            tank.hp = Math.max(0, tank.hp - dmg);
        }
    });
    
    // Direct hit extra damage
    if (directHit) {
        const target = owner === 'player' ? game.enemy : game.player;
        if (target) target.hp = Math.max(0, target.hp - damage);
    }
    
    game.projectile = null;
    
    // Check for falling tanks
    checkFalling();
    
    setTimeout(() => {
        drawTerrain();
        checkGameOver() || endTurn();
    }, 500);
}

function checkFalling() {
    [game.player, game.enemy].forEach(tank => {
        if (!tank) return;
        const groundY = TERRAIN.getHeightAt(tank.x);
        if (tank.y < groundY) {
            tank.falling = true;
            tank.fallSpeed = 0;
            game.fallingTanks.push(tank);
        }
    });
}

function updateFalling() {
    game.fallingTanks = game.fallingTanks.filter(tank => {
        tank.fallSpeed += GRAVITY;
        tank.y += tank.fallSpeed;
        
        const groundY = TERRAIN.getHeightAt(tank.x);
        if (tank.y >= groundY) {
            tank.y = groundY;
            tank.falling = false;
            const fallDamage = Math.floor(tank.fallSpeed * 2);
            tank.hp = Math.max(0, tank.hp - fallDamage);
            tank.fallSpeed = 0;
            return false;
        }
        return true;
    });
}
```

- [ ] **Step 2: Add animation loop integration**

```javascript
function gameLoop() {
    updatePhysics();
    updateFalling();
    updateExplosions();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateExplosions() {
    game.explosions = game.explosions.filter(e => {
        e.age++;
        return e.age < e.maxAge;
    });
}

function updateHPBars() {
    const playerFill = document.getElementById('player-hp');
    const enemyFill = document.getElementById('enemy-hp');
    const playerText = document.getElementById('player-hp-text');
    const enemyText = document.getElementById('enemy-hp-text');
    
    playerFill.style.width = game.player.hp + '%';
    enemyFill.style.width = game.enemy.hp + '%';
    playerText.textContent = game.player.hp;
    enemyText.textContent = game.enemy.hp;
    
    playerFill.classList.toggle('low', game.player.hp <= 30);
    enemyFill.classList.toggle('low', game.enemy.hp <= 30);
}
```

- [ ] **Step 3: Test projectile flight and terrain deformation**

Fire a shot. Expected: projectile follows parabolic arc, terrain deforms on impact, HP bars update if tanks are hit.

---

## Task 7: Implement turn system and game over

**Files:**
- Modify: `tank_wars/script.js`

- [ ] **Step 1: Add turn management**

```javascript
function endTurn() {
    updateHPBars();
    
    if (checkGameOver()) return;
    
    if (game.turn === 'player') {
        game.turn = 'enemy';
        game.phase = 'enemy';
        showMessage('TURA AI...', 1000);
        setTimeout(aiTurn, 1500);
    } else {
        game.turn = 'player';
        game.phase = 'player';
        fireBtn.disabled = false;
        showMessage('TWOJA TURA!', 1000);
    }
}

function checkGameOver() {
    if (game.player.hp <= 0) {
        showMessage('PRZEGRAŁEŚ!', 999999);
        document.getElementById('game-over-text').textContent = 'PRZEGRAŁEŚ!';
        document.getElementById('game-over').classList.remove('hidden');
        return true;
    }
    if (game.enemy.hp <= 0) {
        showMessage('WYGRAŁEŚ!', 999999);
        document.getElementById('game-over-text').textContent = 'WYGRAŁEŚ!';
        document.getElementById('game-over').classList.remove('hidden');
        return true;
    }
    return false;
}
```

- [ ] **Step 2: Add restart functionality**

```javascript
function startGame() {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('difficulty-select').classList.remove('hidden');
}

document.getElementById('restart-btn').addEventListener('click', startGame);

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        game.difficulty = btn.dataset.level;
        document.getElementById('difficulty-select').classList.add('hidden');
        initGame();
    });
});

function initGame() {
    TERRAIN.generate(canvas.width, canvas.height);
    placeTanks();
    game.wind = (Math.random() - 0.5) * 0.1;
    game.turn = 'player';
    game.phase = 'player';
    game.projectile = null;
    game.explosions = [];
    game.fallingTanks = [];
    fireBtn.disabled = false;
    updateHPBars();
    showMessage('TWOJA TURA!', 1000);
}
```

- [ ] **Step 3: Initialize game on load**

Replace temporary code at bottom with:

```javascript
window.addEventListener('resize', () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
});

canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

startGame();
requestAnimationFrame(gameLoop);
```

- [ ] **Step 4: Test full turn cycle**

Start game, fire shot, wait for AI turn (will fail without AI implemented), verify turns alternate.

---

## Task 8: Implement AI opponent

**Files:**
- Modify: `tank_wars/script.js`

- [ ] **Step 1: Add AI logic**

```javascript
function aiTurn() {
    if (!game.enemy || game.enemy.hp <= 0) return;
    
    const target = game.player;
    const dist = target.x - game.enemy.x;
    const heightDiff = target.y - game.enemy.y;
    const absDist = Math.abs(dist);
    
    // Calculate optimal angle and power based on distance
    let optimalAngle, optimalPower;
    
    if (absDist < 100) {
        optimalAngle = dist > 0 ? 60 : 120;
        optimalPower = 40;
    } else if (absDist < 250) {
        optimalAngle = dist > 0 ? 50 : 130;
        optimalPower = 60;
    } else {
        optimalAngle = dist > 0 ? 40 : 140;
        optimalPower = 80;
    }
    
    // Adjust for height difference
    if (heightDiff > 30) optimalPower += 15;
    else if (heightDiff < -30) optimalPower -= 10;
    
    // Add wind consideration
    optimalPower -= game.wind * 50 * Math.sign(dist);
    
    // Apply difficulty-based randomness
    let angleError, powerError;
    switch(game.difficulty) {
        case 'easy':
            angleError = (Math.random() - 0.5) * 30;
            powerError = (Math.random() - 0.5) * 40;
            break;
        case 'medium':
            angleError = (Math.random() - 0.5) * 16;
            powerError = (Math.random() - 0.5) * 20;
            break;
        case 'hard':
            angleError = (Math.random() - 0.5) * 6;
            powerError = (Math.random() - 0.5) * 10;
            break;
    }
    
    game.enemy.angle = Math.max(0, Math.min(180, optimalAngle + angleError));
    const power = Math.max(10, Math.min(100, optimalPower + powerError));
    
    // Fire
    const angle = game.enemy.angle * Math.PI / 180;
    const speed = (power / 100) * 12;
    
    game.projectile = {
        x: game.enemy.x,
        y: game.enemy.y - game.enemy.height - 2,
        vx: Math.cos(angle) * speed * (game.enemy.angle <= 90 ? 1 : -1),
        vy: -Math.sin(angle) * speed,
        owner: 'enemy'
    };
    
    showMessage('AI STRZELA...', 500);
}
```

- [ ] **Step 2: Test AI fires back**

Start game, fire at AI, wait. Expected: AI calculates angle/power, fires projectile, terrain deforms, turns alternate.

- [ ] **Step 3: Commit complete game logic**

```bash
git add tank_wars/
git commit -m "feat: complete Tank Wars game with AI, physics, and terrain deformation"
```

---

## Task 9: Add visual effects and polish

**Files:**
- Modify: `tank_wars/script.js`
- Modify: `tank_wars/styles.css`

- [ ] **Step 1: Add explosion visual effects**

```javascript
function drawExplosions() {
    game.explosions.forEach(e => {
        const progress = e.age / e.maxAge;
        const alpha = 1 - progress;
        const currentRadius = e.radius * (0.3 + progress * 0.7);
        
        // Outer glow
        ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, currentRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Main explosion
        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, currentRadius);
        gradient.addColorStop(0, `rgba(255, 255, 100, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${alpha})`);
        gradient.addColorStop(1, `rgba(100, 0, 0, ${alpha * 0.5})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(e.x, e.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}
```

- [ ] **Step 2: Add projectile trail**

```javascript
const trail = [];

function updatePhysics() {
    if (!game.projectile) { trail.length = 0; return; }
    
    const p = game.projectile;
    trail.push({ x: p.x, y: p.y });
    if (trail.length > 15) trail.shift();
    
    // ... rest of physics
}

function drawProjectile() {
    // Trail
    trail.forEach((t, i) => {
        const alpha = i / trail.length;
        ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Projectile
    const p = game.projectile;
    ctx.fillStyle = '#ff0';
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}
```

- [ ] **Step 3: Add screen shake on explosion**

```javascript
let shakeAmount = 0;

function explode(x, y, owner, directHit = false) {
    shakeAmount = 8;
    // ... rest of explode function
}

function applyShake() {
    if (shakeAmount > 0) {
        const dx = (Math.random() - 0.5) * shakeAmount;
        const dy = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(dx, dy);
        shakeAmount *= 0.85;
        if (shakeAmount < 0.5) shakeAmount = 0;
    }
}
```

- [ ] **Step 4: Test visual effects**

Fire shots. Expected: smooth explosion animation with color gradient, projectile trail, screen shake on impact.

---

## Task 10: Add Web Audio API sounds

**Files:**
- Modify: `tank_wars/script.js`

- [ ] **Step 1: Add audio system**

```javascript
const AudioSystem = {
    ctx: null,
    muted: true,
    
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    
    play(type) {
        if (this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        const now = this.ctx.currentTime;
        
        switch(type) {
            case 'fire':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'explode':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'hit':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
        }
    },
    
    toggle() {
        this.muted = !this.muted;
        if (!this.ctx) this.init();
    }
};
```

- [ ] **Step 2: Add sound triggers**

```javascript
// In fire() function:
AudioSystem.play('fire');

// In explode() function:
AudioSystem.play('explode');

// Add mute button to HTML:
// <button id="mute-btn">🔊</button>
```

- [ ] **Step 3: Add mute button handler**

```javascript
document.getElementById('mute-btn').addEventListener('click', () => {
    AudioSystem.toggle();
    document.getElementById('mute-btn').textContent = AudioSystem.muted ? '🔇' : '🔊';
});
```

- [ ] **Step 4: Test audio**

Click fire, hear sound. Click mute, verify sounds stop. Toggle back, verify sounds resume.

---

## Task 11: Final testing and optimization

**Files:**
- Modify: `tank_wars/script.js`
- Modify: `tank_wars/styles.css`

- [ ] **Step 1: Test complete game flow**

1. Start game → difficulty selection appears
2. Select difficulty → game initializes with terrain and tanks
3. Adjust angle/power sliders → values update
4. Fire → projectile flies, terrain deforms, HP updates
5. AI takes turn → AI fires, terrain deforms
6. Tanks fall if terrain destroyed → fall damage applied
7. One tank reaches 0 HP → game over screen
8. Click restart → back to difficulty selection

- [ ] **Step 2: Test mobile responsiveness**

1. Open on mobile device or Chrome DevTools mobile emulation
2. Verify sliders are touch-friendly
3. Verify fire button is large enough to tap
4. Verify canvas scales properly
5. Test in both portrait and landscape

- [ ] **Step 3: Add performance optimization**

```javascript
// Only redraw terrain when it changes
let terrainDirty = true;

function explode(x, y, owner, directHit = false) {
    terrainDirty = true;
    // ...
}

function draw() {
    if (terrainDirty) {
        drawTerrain();
        terrainDirty = false;
    }
    // ...
}
```

- [ ] **Step 4: Final commit**

```bash
git add tank_wars/
git commit -m "feat: Tank Wars game complete with PWA support"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | HTML structure + CSS layout | 5 min |
| 2 | PWA manifest + icons | 3 min |
| 3 | Simplex noise + terrain generation | 8 min |
| 4 | Tank rendering + positioning | 5 min |
| 5 | Player controls (sliders + fire) | 5 min |
| 6 | Projectile physics + collisions | 10 min |
| 7 | Turn system + game over | 5 min |
| 8 | AI opponent | 8 min |
| 9 | Visual effects + polish | 5 min |
| 10 | Web Audio sounds | 5 min |
| 11 | Final testing + optimization | 5 min |
| **Total** | | **~64 min** |
