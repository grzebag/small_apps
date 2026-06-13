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
            case 'defeat':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 1.5);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                osc.start(now);
                osc.stop(now + 1.5);
                break;
            case 'victory':
                osc.type = 'square';
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.15);
                osc.frequency.setValueAtTime(784, now + 0.3);
                osc.frequency.setValueAtTime(1047, now + 0.45);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.setValueAtTime(0.25, now + 0.45);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                osc.start(now);
                osc.stop(now + 1.2);
                break;
        }
    },
    
    toggle() {
        this.muted = !this.muted;
        if (!this.ctx) this.init();
    }
};

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
        const baseHeight = height * 0.55;
        const amplitude = height * 0.08;
        
        for (let x = 0; x < width; x++) {
            let h = 0;
            h += noise.noise(x * 0.005, 0) * amplitude;
            h += noise.noise(x * 0.015, 0) * amplitude * 0.4;
            h += noise.noise(x * 0.04, 0) * amplitude * 0.15;
            let terrainTop = Math.floor(baseHeight - h);
            terrainTop = Math.max(30, Math.min(height - 50, terrainTop));
            
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
        const ix = Math.floor(x);
        for (let y = 0; y < this.height; y++) {
            if (this.get(ix, y)) return y;
        }
        return this.height;
    }
};

let terrainImageData = null;

function drawTerrain() {
    terrainImageData = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            if (TERRAIN.get(x, y)) {
                const depth = y - TERRAIN.getHeightAt(x);
                if (depth < 20) {
                    terrainImageData.data[idx] = 74; terrainImageData.data[idx+1] = 124; terrainImageData.data[idx+2] = 63;
                } else if (depth < 80) {
                    terrainImageData.data[idx] = 139; terrainImageData.data[idx+1] = 90; terrainImageData.data[idx+2] = 43;
                } else {
                    terrainImageData.data[idx] = 107; terrainImageData.data[idx+1] = 107; terrainImageData.data[idx+2] = 107;
                }
                terrainImageData.data[idx+3] = 255;
            }
        }
    }
}

class Tank {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.angle = 45;
        this.hp = 100;
        this.maxHp = 100;
        this.isPlayer = isPlayer;
        this.width = 32;
        this.height = 20;
        this.falling = false;
        this.fallSpeed = 0;
    }

    draw(ctx) {
        const baseY = this.y;
        const cx = this.x;
        const py = baseY - 20;
        
        const c = this.isPlayer ? {
            dark: '#1a3a4a', mid: '#2a6a8a', light: '#4acaff',
            highlight: '#8aeaff', track: '#1a1a2a', wheel: '#3a3a5a', wheelInner: '#5a5a7a'
        } : {
            dark: '#4a1a1a', mid: '#8a2a2a', light: '#cc4a4a',
            highlight: '#ff8a8a', track: '#1a1a2a', wheel: '#3a3a5a', wheelInner: '#5a5a7a'
        };
        
        this.drawTankBody(ctx, cx, py, c);
        this.drawBarrel(ctx, cx, py);
        
        // HP bar
        const barWidth = 30;
        const barHeight = 3;
        const barX = cx - barWidth/2;
        const barY = baseY - 40;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = this.hp > 30 ? '#4caf50' : '#f44336';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }
    
    drawTankBody(ctx, cx, py, c) {
        // Antenna
        ctx.fillStyle = '#222';
        ctx.fillRect(cx + 12, py + 2, 1, 8);
        ctx.fillRect(cx + 11, py + 1, 3, 1);
        
        // Track left
        ctx.fillStyle = c.track;
        ctx.fillRect(cx - 14, py + 16, 28, 4);
        
        // Track wheels
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = c.wheel;
            ctx.fillRect(cx - 12 + i * 7, py + 15, 5, 5);
            ctx.fillStyle = c.wheelInner;
            ctx.fillRect(cx - 11 + i * 7, py + 16, 3, 3);
        }
        
        // Track teeth
        ctx.fillStyle = c.track;
        for (let i = 0; i < 7; i++) {
            ctx.fillRect(cx - 13 + i * 4, py + 14, 2, 2);
        }
        
        // Hull bottom
        ctx.fillStyle = c.dark;
        ctx.fillRect(cx - 13, py + 10, 26, 6);
        
        // Hull middle
        ctx.fillStyle = c.mid;
        ctx.fillRect(cx - 12, py + 8, 24, 4);
        
        // Hull top
        ctx.fillStyle = c.light;
        ctx.fillRect(cx - 10, py + 6, 20, 3);
        
        // Hull highlight
        ctx.fillStyle = c.highlight;
        ctx.fillRect(cx - 8, py + 7, 8, 1);
        
        // Turret base
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.arc(cx, py + 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Turret
        ctx.fillStyle = c.mid;
        ctx.beginPath();
        ctx.arc(cx, py + 4, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Turret highlight
        ctx.fillStyle = c.light;
        ctx.beginPath();
        ctx.arc(cx - 2, py + 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Commander hatch
        ctx.fillStyle = c.dark;
        ctx.fillRect(cx + 3, py + 0, 4, 3);
        ctx.fillStyle = c.mid;
        ctx.fillRect(cx + 4, py + 0, 2, 2);
    }
    
    drawBarrel(ctx, cx, py) {
        const barrelAngle = this.angle * Math.PI / 180;
        ctx.save();
        ctx.translate(cx, py + 4);
        ctx.rotate(-barrelAngle);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(-2, -2, 4, 4);
        
        ctx.fillStyle = '#444';
        ctx.fillRect(0, -1, 16, 2);
        
        ctx.fillStyle = '#555';
        ctx.fillRect(0, -1, 16, 1);
        
        ctx.fillStyle = '#222';
        ctx.fillRect(14, -2, 3, 4);
        
        ctx.restore();
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

// Touch controls - swipe anywhere on canvas to aim
const canvasContainer = document.querySelector('.canvas-container');
let touchStartX = 0, touchStartY = 0;
let touchStartAngle = 0, touchStartPower = 0;
let touchMoved = false;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
    document.body.classList.add('touch-device');
    
    canvasContainer.addEventListener('touchstart', (e) => {
        if (game.phase !== 'player') return;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchStartAngle = game.player.angle;
        touchStartPower = parseInt(powerSlider.value);
        touchMoved = false;
    }, { passive: true });

    canvasContainer.addEventListener('touchmove', (e) => {
        if (game.phase !== 'player') return;
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) touchMoved = true;
        
        const newAngle = Math.max(0, Math.min(180, touchStartAngle - dy * 0.5));
        const newPower = Math.max(0, Math.min(100, touchStartPower + dx * 0.5));
        
        game.player.angle = Math.round(newAngle);
        powerSlider.value = Math.round(newPower);
        angleSlider.value = game.player.angle;
        angleValue.textContent = game.player.angle;
        powerValue.textContent = powerSlider.value;
    }, { passive: false });

    canvasContainer.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!touchMoved && game.phase === 'player') fire();
    }, { passive: false });
}

fireBtn.addEventListener('click', fire);
fireBtn.addEventListener('touchend', (e) => { e.preventDefault(); fire(); });

function showMessage(text, duration = 1500) {
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => messageEl.classList.add('hidden'), duration);
}

function fire() {
    if (game.phase !== 'player' || !game.player) return;
    AudioSystem.play('fire');
    game.phase = 'shooting';
    fireBtn.disabled = true;
    
    const power = parseInt(powerSlider.value) / 100;
    const angle = game.player.angle * Math.PI / 180;
    const speed = power * 12;
    
    game.projectile = {
        x: game.player.x,
        y: game.player.y - game.player.height - 2,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        owner: 'player'
    };
}

document.addEventListener('keydown', (e) => {
    if (game.phase !== 'player') return;
    
    switch(e.key) {
        case 'ArrowUp':
            game.player.angle = Math.min(180, game.player.angle + 1);
            angleSlider.value = game.player.angle;
            angleValue.textContent = game.player.angle;
            break;
        case 'ArrowDown':
            game.player.angle = Math.max(0, game.player.angle - 1);
            angleSlider.value = game.player.angle;
            angleValue.textContent = game.player.angle;
            break;
        case 'ArrowRight':
            powerSlider.value = Math.min(100, parseInt(powerSlider.value) + 1);
            powerValue.textContent = powerSlider.value;
            break;
        case 'ArrowLeft':
            powerSlider.value = Math.max(0, parseInt(powerSlider.value) - 1);
            powerValue.textContent = powerSlider.value;
            break;
        case ' ':
            e.preventDefault();
            fire();
            break;
    }
});

function placeTanks() {
    const margin = 60;
    const px = margin + Math.random() * (canvas.width / 2 - margin);
    const ex = canvas.width / 2 + margin + Math.random() * (canvas.width / 2 - margin);
    
    game.player = new Tank(px, TERRAIN.getHeightAt(px), true);
    game.enemy = new Tank(ex, TERRAIN.getHeightAt(ex), false);
    game.player.angle = 30;
    game.enemy.angle = 150;
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    applyShake();
    if (terrainDirty || !terrainImageData) {
        drawTerrain();
        terrainDirty = false;
    }
    if (terrainImageData) ctx.putImageData(terrainImageData, 0, 0);
    if (game.player) game.player.draw(ctx);
    if (game.enemy) game.enemy.draw(ctx);
    if (game.projectile) drawProjectile();
    drawExplosions();
    drawHUD();
    ctx.restore();
}

const trail = [];

function drawProjectile() {
    trail.forEach((t, i) => {
        const alpha = i / trail.length;
        ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    const p = game.projectile;
    ctx.fillStyle = '#ff0';
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawExplosions() {
    game.explosions.forEach(e => {
        const progress = e.age / e.maxAge;
        const alpha = 1 - progress;
        const currentRadius = e.radius * (0.3 + progress * 0.7);
        
        ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, currentRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
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

function drawHUD() {
    const windArrow = document.getElementById('wind-arrow');
    const windText = document.getElementById('wind-text');
    if (windArrow && windText) {
        if (game.wind > 0) windArrow.textContent = '→';
        else if (game.wind < 0) windArrow.textContent = '←';
        else windArrow.textContent = '•';
        windText.textContent = Math.abs(game.wind * 100).toFixed(1);
    }
}

const GRAVITY = 0.15;

function updatePhysics() {
    if (!game.projectile) { trail.length = 0; return; }
    
    const p = game.projectile;
    trail.push({ x: p.x, y: p.y });
    if (trail.length > 15) trail.shift();
    
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

let shakeAmount = 0;
let terrainDirty = true;

function explode(x, y, owner, directHit = false) {
    AudioSystem.play('explode');
    shakeAmount = 8;
    terrainDirty = true;
    const power = parseInt(powerSlider.value) / 100;
    const radius = 15 + power * 10;
    const damage = directHit ? 20 : 0;
    
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
        checkGameOver() || endTurn();
    }, 500);
}

function endTurn() {
    updateHPBars();
    
    if (checkGameOver()) return;
    
    game.wind = (Math.random() - 0.5) * 0.1;
    
    if (game.turn === 'player') {
        game.turn = 'enemy';
        game.phase = 'enemy';
        setTimeout(aiTurn, 1500);
    } else {
        game.turn = 'player';
        game.phase = 'player';
        fireBtn.disabled = false;
        showMessage('TWOJA TURA!', 1000);
    }
}

function aiTurn() {
    if (!game.enemy || game.enemy.hp <= 0) return;
    
    const target = game.player;
    const dx = target.x - game.enemy.x;
    const dy = (target.y - target.height/2) - (game.enemy.y - game.enemy.height/2);
    const absDx = Math.abs(dx);
    const sign = dx > 0 ? 1 : -1;
    
    // Ballistic calculation to aim at target
    // v = sqrt(range * g / sin(2*angle))
    // Try to find optimal angle/power
    let bestAngle = 45;
    let bestPower = 50;
    let bestError = Infinity;
    
    for (let angle = 15; angle <= 75; angle += 5) {
        const rad = angle * Math.PI / 180;
        const sin2 = Math.sin(2 * rad);
        if (sin2 <= 0) continue;
        
        // Required speed for this angle to reach target distance
        const requiredSpeed = Math.sqrt(absDx * GRAVITY / sin2);
        const requiredPower = (requiredSpeed / 12) * 100;
        
        if (requiredPower < 10 || requiredPower > 100) continue;
        
        // Check if this angle/power combination would hit near target
        // Simulate trajectory
        let simX = game.enemy.x;
        let simY = game.enemy.y - game.enemy.height/2;
        let simVx = Math.cos(rad) * requiredSpeed * sign;
        let simVy = -Math.sin(rad) * requiredSpeed;
        let error = Infinity;
        
        for (let t = 0; t < 200; t++) {
            simVx += game.wind;
            simVy += GRAVITY;
            simX += simVx;
            simY += simVy;
            
            if (simY >= target.y - target.height && Math.abs(simX - target.x) < absDx * 0.3) {
                error = Math.abs(simX - target.x) + Math.abs(simY - target.y) * 0.5;
                break;
            }
            if (simY > canvas.height || simX < 0 || simX > canvas.width) {
                error = Math.abs(simX - target.x) + Math.abs(simY - target.y);
                break;
            }
        }
        
        if (error < bestError) {
            bestError = error;
            bestAngle = angle;
            bestPower = requiredPower;
        }
    }
    
    // Add wind compensation
    bestPower -= game.wind * 30 * sign;
    
    // Apply difficulty-based randomness
    let angleError, powerError;
    switch(game.difficulty) {
        case 'easy':
            angleError = (Math.random() - 0.5) * 20;
            powerError = (Math.random() - 0.5) * 25;
            break;
        case 'medium':
            angleError = (Math.random() - 0.5) * 10;
            powerError = (Math.random() - 0.5) * 15;
            break;
        case 'hard':
            angleError = (Math.random() - 0.5) * 4;
            powerError = (Math.random() - 0.5) * 8;
            break;
    }
    
    game.enemy.angle = Math.max(5, Math.min(175, (sign > 0 ? bestAngle : 180 - bestAngle) + angleError));
    const power = Math.max(10, Math.min(100, bestPower + powerError));
    
    const angle = game.enemy.angle * Math.PI / 180;
    const speed = (power / 100) * 12;
    
    game.projectile = {
        x: game.enemy.x,
        y: game.enemy.y - game.enemy.height - 2,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        owner: 'enemy'
    };
    
    AudioSystem.play('fire');
}

function checkGameOver() {
    const overlay = document.getElementById('game-over');
    if (game.player.hp <= 0) {
        overlay.className = 'game-over defeat';
        AudioSystem.play('defeat');
        return true;
    }
    if (game.enemy.hp <= 0) {
        overlay.className = 'game-over victory';
        AudioSystem.play('victory');
        return true;
    }
    return false;
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
    let fallen = false;
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
            fallen = true;
            return false;
        }
        return true;
    });
    if (fallen) {
        updateHPBars();
        if (checkGameOver()) return;
    }
}

function updateExplosions() {
    game.explosions = game.explosions.filter(e => {
        e.age++;
        return e.age < e.maxAge;
    });
}

function updateHPBars() {
    if (!game.player || !game.enemy) return;
    const playerFill = document.getElementById('player-hp');
    const enemyFill = document.getElementById('enemy-hp');
    const playerText = document.getElementById('player-hp-text');
    const enemyText = document.getElementById('enemy-hp-text');
    
    if (playerFill && enemyFill && playerText && enemyText) {
        playerFill.style.width = game.player.hp + '%';
        enemyFill.style.width = game.enemy.hp + '%';
        playerText.textContent = game.player.hp;
        enemyText.textContent = game.enemy.hp;
        
        playerFill.classList.toggle('low', game.player.hp <= 30);
        enemyFill.classList.toggle('low', game.enemy.hp <= 30);
    }
}

function startGame() {
    document.getElementById('game-over').className = 'game-over hidden';
    document.getElementById('difficulty-select').classList.remove('hidden');
}

document.getElementById('restart-btn-defeat').addEventListener('click', startGame);
document.getElementById('restart-btn-victory').addEventListener('click', startGame);

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        game.difficulty = btn.dataset.level;
        document.getElementById('difficulty-select').classList.add('hidden');
        initGame();
    });
});

function initGame() {
    resizeCanvas();
    TERRAIN.generate(canvas.width, canvas.height);
    placeTanks();
    game.wind = (Math.random() - 0.5) * 0.1;
    game.turn = 'player';
    game.phase = 'player';
    game.projectile = null;
    game.explosions = [];
    game.fallingTanks = [];
    fireBtn.disabled = false;
    terrainDirty = true;
    updateHPBars();
    showMessage('TWOJA TURA!', 1000);
}

let frameCount = 0;
function gameLoop() {
    frameCount++;
    updatePhysics();
    updateFalling();
    updateExplosions();
    updateHPBars();
    draw();
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 300;
    canvas.width = w;
    canvas.height = h;
    terrainDirty = true;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.getElementById('mute-btn').addEventListener('click', () => {
    AudioSystem.toggle();
    document.getElementById('mute-btn').textContent = AudioSystem.muted ? '🔇' : '🔊';
});

document.getElementById('info-btn').addEventListener('click', () => {
    document.getElementById('info-modal').classList.toggle('hidden');
});

document.getElementById('info-close').addEventListener('click', () => {
    document.getElementById('info-modal').classList.add('hidden');
});

setTimeout(() => {
    resizeCanvas();
    startGame();
    requestAnimationFrame(gameLoop);
}, 200);
