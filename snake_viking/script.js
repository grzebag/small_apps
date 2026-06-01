const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

// Game settings
const gridSize = 25;
const tileCount = canvas.width / gridSize; // 500 / 25 = 20
let gameSpeed = 8;
let lastRenderTime = 0;
let gameOver = false;

// Snake
let snake = [];
let snakeLength = 3;
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;

// Rune (Food)
let foodX = Math.floor(tileCount / 2);
let foodY = Math.floor(tileCount / 4);

// Obstacles
let obstacles = [];

// Score
let score = 0;
let highScore = localStorage.getItem('vikingSnakeHighScore') || 0;
highScoreElement.textContent = highScore;

function resetGame() {
    snake = [];
    snakeLength = 3;
    const startX = Math.floor(tileCount / 2);
    const startY = Math.floor(tileCount / 2);
    
    for(let i=0; i<snakeLength; i++) {
        snake.push({x: startX, y: startY + i}); 
    }
    
    dx = 0;
    dy = -1;
    nextDx = 0;
    nextDy = -1;
    gameSpeed = 8;
    
    obstacles = []; // Reset obstacles
    
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameOverScreen.classList.add('hidden');
    
    placeFood();
    requestAnimationFrame(main);
}

function main(currentTime) {
    if (gameOver) {
        handleGameOver();
        return;
    }

    window.requestAnimationFrame(main);

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / gameSpeed) return;

    lastRenderTime = currentTime;

    update();
    draw();
}

function update() {
    dx = nextDx;
    dy = nextDy;
    
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision (Valhalla awaits)
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }
    
    // Obstacle collision
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            gameOver = true;
            return;
        }
    }

    snake.unshift(head);

    // Eat Rune
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('vikingSnakeHighScore', highScore);
        }
        
        // Increase speed slightly
        if (score % 50 === 0) {
            gameSpeed += 0.8;
        }
        
        // Add obstacle every 30 points (3 runes)
        if (score % 30 === 0) {
            addObstacle();
        }
        
        placeFood();
    } else {
        snake.pop(); // remove tail if didn't eat
    }
}

function addObstacle() {
    let newX, newY;
    let valid = false;
    while (!valid) {
        newX = Math.floor(Math.random() * tileCount);
        newY = Math.floor(Math.random() * tileCount);
        valid = true;
        
        // Don't spawn on snake
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newX && snake[i].y === newY) valid = false;
        }
        // Don't spawn on food
        if (foodX === newX && foodY === newY) valid = false;
        // Don't spawn on existing obstacles
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].x === newX && obstacles[i].y === newY) valid = false;
        }
        // Don't spawn immediately in front of the snake's head (give some reaction time)
        const distToHead = Math.abs(newX - snake[0].x) + Math.abs(newY - snake[0].y);
        if (distToHead < 4) valid = false;
    }
    obstacles.push({x: newX, y: newY});
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Obstacles
    drawObstacles();

    // Draw Rune (Food)
    drawRune(foodX, foodY);

    // Draw Jörmungandr (Snake)
    for (let i = 0; i < snake.length; i++) {
        drawSnakeSegment(snake[i].x, snake[i].y, i === 0);
    }
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const px = obstacles[i].x * gridSize;
        const py = obstacles[i].y * gridSize;
        
        // Dark stone base
        ctx.fillStyle = '#3a4146'; 
        ctx.beginPath();
        ctx.moveTo(px + 4, py + gridSize - 2);
        ctx.lineTo(px + 2, py + gridSize - 6);
        ctx.lineTo(px + 6, py + 4);
        ctx.lineTo(px + gridSize - 6, py + 2);
        ctx.lineTo(px + gridSize - 2, py + 10);
        ctx.lineTo(px + gridSize - 4, py + gridSize - 2);
        ctx.closePath();
        ctx.fill();
        
        // Lighter stone highlight
        ctx.fillStyle = '#4f575d'; 
        ctx.beginPath();
        ctx.moveTo(px + 8, py + gridSize - 6);
        ctx.lineTo(px + 6, py + 8);
        ctx.lineTo(px + gridSize - 10, py + 6);
        ctx.lineTo(px + gridSize - 8, py + 14);
        ctx.closePath();
        ctx.fill();
    }
}

function drawRune(x, y) {
    const px = x * gridSize;
    const py = y * gridSize;
    const center = gridSize / 2;
    
    ctx.fillStyle = '#a5d8d9'; // ice blue
    ctx.shadowColor = '#a5d8d9';
    ctx.shadowBlur = 10;
    
    // Draw a magical diamond/rune shape
    ctx.beginPath();
    ctx.moveTo(px + center, py + 4);
    ctx.lineTo(px + gridSize - 4, py + center);
    ctx.lineTo(px + center, py + gridSize - 4);
    ctx.lineTo(px + 4, py + center);
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function drawSnakeSegment(x, y, isHead) {
    const px = x * gridSize;
    const py = y * gridSize;
    
    if (isHead) {
        ctx.fillStyle = '#1e3829'; // dark serpent green
        ctx.fillRect(px, py, gridSize, gridSize);
        
        // Eyes
        ctx.fillStyle = '#d4af37'; // gold eyes
        if (dx === 1) { // moving right
            ctx.fillRect(px + gridSize - 6, py + 4, 4, 4);
            ctx.fillRect(px + gridSize - 6, py + gridSize - 8, 4, 4);
        } else if (dx === -1) { // moving left
            ctx.fillRect(px + 2, py + 4, 4, 4);
            ctx.fillRect(px + 2, py + gridSize - 8, 4, 4);
        } else if (dy === 1) { // moving down
            ctx.fillRect(px + 4, py + gridSize - 6, 4, 4);
            ctx.fillRect(px + gridSize - 8, py + gridSize - 6, 4, 4);
        } else { // moving up
            ctx.fillRect(px + 4, py + 2, 4, 4);
            ctx.fillRect(px + gridSize - 8, py + 2, 4, 4);
        }
    } else {
        ctx.fillStyle = '#2d4c3b';
        ctx.fillRect(px + 1, py + 1, gridSize - 2, gridSize - 2);
        
        // Scales texture
        ctx.fillStyle = '#1e3829';
        ctx.beginPath();
        ctx.arc(px + gridSize/2, py + gridSize/2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleGameOver() {
    gameOverScreen.classList.remove('hidden');
}

// Input handling
window.addEventListener('keydown', e => {
    // Prevent default scrolling when playing
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { nextDx = 0; nextDy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { nextDx = 1; nextDy = 0; }
            break;
    }
});

function placeFood() {
    let newX, newY;
    let valid = false;
    while (!valid) {
        newX = Math.floor(Math.random() * tileCount);
        newY = Math.floor(Math.random() * tileCount);
        valid = true;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newX && snake[i].y === newY) {
                valid = false;
                break;
            }
        }
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].x === newX && obstacles[i].y === newY) {
                valid = false;
                break;
            }
        }
    }
    foodX = newX;
    foodY = newY;
}

restartBtn.addEventListener('click', resetGame);

// Start game initially
resetGame();