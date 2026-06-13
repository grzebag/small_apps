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

function placeTanks() {
    const margin = 60;
    const px = margin + Math.random() * (canvas.width / 2 - margin);
    const ex = canvas.width / 2 + margin + Math.random() * (canvas.width / 2 - margin);
    
    game.player = new Tank(px, TERRAIN.getHeightAt(px), true);
    game.enemy = new Tank(ex, TERRAIN.getHeightAt(ex), false);
    game.player.angle = 45;
    game.enemy.angle = 135;
}

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

function gameLoop() {
    updatePhysics();
    updateFalling();
    updateExplosions();
    updateHPBars();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
});

canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

startGame();
requestAnimationFrame(gameLoop);
