const difficulties = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

let currentDifficulty = 'beginner';
let board = [];
let gameOver = false;
let firstClick = true;
let minesLeft = 0;
let timerInterval = null;
let timeElapsed = 0;
let safeCellsRevealed = 0;
let totalSafeCells = 0;
let isFlagMode = false;

const boardElement = document.getElementById('board');
const mineCounterElement = document.getElementById('mine-counter');
const timerElement = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const flagModeBtn = document.getElementById('flag-mode-btn');
const difficultySelect = document.getElementById('difficulty');

function initGame() {
    clearInterval(timerInterval);
    const config = difficulties[currentDifficulty];
    gameOver = false;
    firstClick = true;
    minesLeft = config.mines;
    timeElapsed = 0;
    safeCellsRevealed = 0;
    totalSafeCells = (config.rows * config.cols) - config.mines;
    isFlagMode = false;
    flagModeBtn.classList.remove('active');
    
    updateMineCounter();
    updateTimerDisplay();
    resetBtn.querySelector('.btn-inner').textContent = 'SCAN';
    resetBtn.classList.remove('win', 'lose');
    
    boardElement.style.gridTemplateColumns = `repeat(${config.cols}, 34px)`;
    boardElement.style.gridTemplateRows = `repeat(${config.rows}, 34px)`;
    boardElement.innerHTML = '';
    
    board = [];
    for (let r = 0; r < config.rows; r++) {
        const row = [];
        for (let c = 0; c < config.cols; c++) {
            const cell = {
                r, c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                element: document.createElement('div'),
                longPressTimer: null
            };
            
            cell.element.classList.add('cell');
            
            // Event listeners
            cell.element.addEventListener('mousedown', (e) => {
                if (e.button === 0 && !gameOver && !cell.isRevealed) {
                    resetBtn.querySelector('.btn-inner').textContent = 'PING';
                }
            });
            
            cell.element.addEventListener('mouseup', (e) => {
                if (!gameOver) {
                    resetBtn.querySelector('.btn-inner').textContent = 'SCAN';
                }
            });
            
            cell.element.addEventListener('click', (e) => {
                if (isFlagMode) {
                    handleRightClick(r, c);
                } else {
                    handleLeftClick(r, c);
                }
            });

            cell.element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            });

            // Touch support for mobile
            cell.element.addEventListener('touchstart', (e) => {
                if (gameOver || cell.isRevealed) return;
                
                cell.longPressTimer = setTimeout(() => {
                    handleRightClick(r, c);
                    cell.longPressTimer = null;
                }, 500);
            }, { passive: true });

            cell.element.addEventListener('touchend', (e) => {
                if (cell.longPressTimer) {
                    clearTimeout(cell.longPressTimer);
                    cell.longPressTimer = null;
                }
            });

            cell.element.addEventListener('touchmove', (e) => {
                if (cell.longPressTimer) {
                    clearTimeout(cell.longPressTimer);
                    cell.longPressTimer = null;
                }
            });
            
            boardElement.appendChild(cell.element);
            row.push(cell);
        }
        board.push(row);
    }
}

function placeMines(firstR, firstC) {
    const config = difficulties[currentDifficulty];
    let minesPlaced = 0;
    
    while (minesPlaced < config.mines) {
        const r = Math.floor(Math.random() * config.rows);
        const c = Math.floor(Math.random() * config.cols);
        
        // Don't place mine on first click or its immediate neighbors
        // Standard Minesweeper often guarantees at least an empty 3x3 on first click
        if (!board[r][c].isMine && (Math.abs(r - firstR) > 1 || Math.abs(c - firstC) > 1)) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }
    
    // Calculate numbers
    for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
            if (!board[r][c].isMine) {
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const nr = r + i;
                        const nc = c + j;
                        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && board[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                board[r][c].neighborMines = count;
            }
        }
    }
}

function handleLeftClick(r, c) {
    if (gameOver || board[r][c].isFlagged || board[r][c].isRevealed) return;
    
    if (firstClick) {
        firstClick = false;
        placeMines(r, c);
        startTimer();
    }
    
    revealCell(r, c);
    checkWinCondition();
}

function handleRightClick(r, c) {
    if (gameOver || board[r][c].isRevealed) return;
    
    const cell = board[r][c];
    if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.element.classList.remove('flag');
        cell.element.textContent = '';
        minesLeft++;
    } else {
        cell.isFlagged = true;
        cell.element.classList.add('flag');
        cell.element.textContent = '[!]';
        minesLeft--;
    }
    updateMineCounter();
}

function revealCell(r, c) {
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;
    
    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    
    if (cell.isMine) {
        cell.element.classList.add('mine', 'blown');
        cell.element.textContent = '×';
        triggerGameOver(false);
        return;
    }
    
    safeCellsRevealed++;
    
    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.setAttribute('data-value', cell.neighborMines);
    } else {
        // Flood fill
        const config = difficulties[currentDifficulty];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i;
                const nc = c + j;
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                    revealCell(nr, nc);
                }
            }
        }
    }
}

function triggerGameOver(isWin) {
    gameOver = true;
    clearInterval(timerInterval);
    
    if (isWin) {
        resetBtn.querySelector('.btn-inner').textContent = 'SAFE';
        resetBtn.classList.add('win');
        // Flag remaining mines
        const config = difficulties[currentDifficulty];
        for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
                const cell = board[r][c];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isFlagged = true;
                    cell.element.classList.add('flag');
                    cell.element.textContent = '[!]';
                }
            }
        }
        minesLeft = 0;
        updateMineCounter();
    } else {
        resetBtn.querySelector('.btn-inner').textContent = 'FAIL';
        resetBtn.classList.add('lose');
        // Reveal all mines
        const config = difficulties[currentDifficulty];
        for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
                const cell = board[r][c];
                if (cell.isMine && !cell.isRevealed && !cell.isFlagged) {
                    cell.element.classList.add('revealed', 'mine');
                    cell.element.textContent = '×';
                } else if (!cell.isMine && cell.isFlagged) {
                    // False flag
                    cell.element.textContent = 'ERR';
                }
            }
        }
    }
}

function checkWinCondition() {
    if (safeCellsRevealed === totalSafeCells && !gameOver) {
        triggerGameOver(true);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        if (timeElapsed > 999) timeElapsed = 999;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    timerElement.textContent = timeElapsed.toString().padStart(3, '0');
}

function updateMineCounter() {
    // Handle negative numbers for counter correctly if over-flagged
    let displayNum = minesLeft;
    let prefix = '';
    if (displayNum < 0) {
        prefix = '-';
        displayNum = Math.abs(displayNum);
    }
    mineCounterElement.textContent = prefix + displayNum.toString().padStart(prefix ? 2 : 3, '0');
}

// Event Listeners
resetBtn.addEventListener('click', initGame);
flagModeBtn.addEventListener('click', () => {
    isFlagMode = !isFlagMode;
    flagModeBtn.classList.toggle('active', isFlagMode);
});
difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    initGame();
});

// Initialize first game
initGame();
