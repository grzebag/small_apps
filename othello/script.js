// Game Constants
const EMPTY = 0;
const BLACK = 1; // Player
const WHITE = 2; // Computer
const BOARD_SIZE = 8;

// Game State
let board = [];
let currentPlayer = BLACK;
let gameActive = true;
let difficulty = 'medium';

// DOM Elements
const boardElement = document.getElementById('board');
const scoreBlack = document.getElementById('score-black');
const scoreWhite = document.getElementById('score-white');
const statusElement = document.getElementById('status');
const newGameBtn = document.getElementById('new-game-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Initialize board with starting position
function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    const center = BOARD_SIZE / 2;
    board[center - 1][center - 1] = WHITE;
    board[center - 1][center] = BLACK;
    board[center][center - 1] = BLACK;
    board[center][center] = WHITE;
}

// Check if position is within board bounds
function isValidPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Get all valid moves for a player
function getValidMoves(boardState, player) {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (boardState[row][col] === EMPTY) {
                if (wouldFlip(boardState, row, col, player).length > 0) {
                    moves.push({ row, col });
                }
            }
        }
    }
    return moves;
}

// Check which discs would be flipped by a move
function wouldFlip(boardState, row, col, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    const flipped = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of directions) {
        const toFlip = [];
        let r = row + dr;
        let c = col + dc;

        while (isValidPosition(r, c) && boardState[r][c] === opponent) {
            toFlip.push({ row: r, col: c });
            r += dr;
            c += dc;
        }

        if (toFlip.length > 0 && isValidPosition(r, c) && boardState[r][c] === player) {
            flipped.push(...toFlip);
        }
    }

    return flipped;
}

// Make a move and flip discs
function makeMove(boardState, row, col, player) {
    const flipped = wouldFlip(boardState, row, col, player);
    boardState[row][col] = player;
    for (const { row: r, col: c } of flipped) {
        boardState[r][c] = player;
    }
    return flipped;
}

// Count discs for each player
function countDiscs(boardState) {
    let black = 0;
    let white = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (boardState[row][col] === BLACK) black++;
            else if (boardState[row][col] === WHITE) white++;
        }
    }
    return { black, white };
}

// Check if game is over
function isGameOver(boardState) {
    const blackMoves = getValidMoves(boardState, BLACK);
    const whiteMoves = getValidMoves(boardState, WHITE);
    return blackMoves.length === 0 && whiteMoves.length === 0;
}

// Get winner
function getWinner(boardState) {
    const { black, white } = countDiscs(boardState);
    if (black > white) return BLACK;
    if (white > black) return WHITE;
    return null; // Draw
}

// Position weight matrix for evaluation
const POSITION_WEIGHTS = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10,  -2,  1, 1, 1, 1,  -2, 10],
    [5,   -2,  1, 0, 0, 1,  -2, 5],
    [5,   -2,  1, 0, 0, 1,  -2, 5],
    [10,  -2,  1, 1, 1, 1,  -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100]
];

// Evaluate board position
function evaluateBoard(boardState, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    let score = 0;
    
    // Position weights
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (boardState[row][col] === player) {
                score += POSITION_WEIGHTS[row][col];
            } else if (boardState[row][col] === opponent) {
                score -= POSITION_WEIGHTS[row][col];
            }
        }
    }
    
    // Mobility (number of available moves)
    const playerMoves = getValidMoves(boardState, player).length;
    const opponentMoves = getValidMoves(boardState, opponent).length;
    score += (playerMoves - opponentMoves) * 5;
    
    // Disc count (less important early, more important late)
    const discs = countDiscs(boardState);
    const playerDiscs = player === BLACK ? discs.black : discs.white;
    const opponentDiscs = player === BLACK ? discs.white : discs.black;
    const totalDiscs = playerDiscs + opponentDiscs;
    
    if (totalDiscs > 50) {
        score += (playerDiscs - opponentDiscs) * 10;
    }
    
    return score;
}

// Minimax with alpha-beta pruning
function minimax(boardState, depth, alpha, beta, isMaximizing, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    
    if (depth === 0 || isGameOver(boardState)) {
        return { score: evaluateBoard(boardState, player) };
    }
    
    if (isMaximizing) {
        const validMoves = getValidMoves(boardState, player);
        
        if (validMoves.length === 0) {
            return minimax(boardState, depth - 1, alpha, beta, false, player);
        }
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of validMoves) {
            const newBoard = boardState.map(row => [...row]);
            makeMove(newBoard, move.row, move.col, player);
            
            const result = minimax(newBoard, depth - 1, alpha, beta, false, player);
            
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
            
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break;
        }
        
        return { score: bestScore, move: bestMove };
    } else {
        const validMoves = getValidMoves(boardState, opponent);
        
        if (validMoves.length === 0) {
            return minimax(boardState, depth - 1, alpha, beta, true, player);
        }
        
        let bestScore = Infinity;
        
        for (const move of validMoves) {
            const newBoard = boardState.map(row => [...row]);
            makeMove(newBoard, move.row, move.col, opponent);
            
            const result = minimax(newBoard, depth - 1, alpha, beta, true, player);
            
            bestScore = Math.min(bestScore, result.score);
            beta = Math.min(beta, bestScore);
            
            if (beta <= alpha) break;
        }
        
        return { score: bestScore };
    }
}

// Get AI move based on difficulty
function getAIMove(boardState) {
    const validMoves = getValidMoves(boardState, WHITE);
    
    if (validMoves.length === 0) return null;
    
    let depth;
    
    switch (difficulty) {
        case 'easy':
            // Random move
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        
        case 'medium':
            depth = 2;
            break;
        
        case 'hard':
            depth = 4;
            break;
        
        default:
            depth = 2;
    }
    
    // Use minimax for medium/hard
    const result = minimax(boardState, depth, -Infinity, Infinity, true, WHITE);
    
    // For medium, add some randomness if scores are close
    if (difficulty === 'medium' && validMoves.length > 1) {
        const topMoves = validMoves.filter(move => {
            const newBoard = boardState.map(row => [...row]);
            makeMove(newBoard, move.row, move.col, WHITE);
            const score = evaluateBoard(newBoard, WHITE);
            return score >= result.score * 0.8;
        });
        
        if (topMoves.length > 1) {
            return topMoves[Math.floor(Math.random() * topMoves.length)];
        }
    }
    
    return result.move || validMoves[0];
}

// Render the board to DOM
function renderBoard() {
    boardElement.innerHTML = '';
    
    const validMoves = gameActive ? getValidMoves(board, currentPlayer) : [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add valid move indicator
            if (validMoves.some(m => m.row === row && m.col === col)) {
                cell.classList.add('valid-move');
            }
            
            // Add disc if present
            if (board[row][col] !== EMPTY) {
                const disc = document.createElement('div');
                disc.className = `disc ${board[row][col] === BLACK ? 'black' : 'white'}`;
                cell.appendChild(disc);
            }
            
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

// Update score display
function updateScores() {
    const { black, white } = countDiscs(board);
    scoreBlack.textContent = black;
    scoreWhite.textContent = white;
}

// Update status message
function updateStatus(message) {
    statusElement.textContent = message;
}

// Handle cell click
function handleCellClick(e) {
    if (!gameActive || currentPlayer !== BLACK) return;
    
    const row = parseInt(e.currentTarget.dataset.row);
    const col = parseInt(e.currentTarget.dataset.col);
    
    // Check if move is valid
    const validMoves = getValidMoves(board, BLACK);
    if (!validMoves.some(m => m.row === row && m.col === col)) return;
    
    // Make player move
    const flipped = makeMove(board, row, col, BLACK);
    renderBoard();
    updateScores();
    
    // Check if game is over
    if (isGameOver(board)) {
        endGame();
        return;
    }
    
    // Switch to AI turn
    currentPlayer = WHITE;
    updateStatus('Komputer myśli...');
    
    // AI move with delay for better UX
    setTimeout(() => {
        makeAIMove();
    }, 500);
}

// Make AI move
function makeAIMove() {
    const move = getAIMove(board);
    
    if (move) {
        makeMove(board, move.row, move.col, WHITE);
        renderBoard();
        updateScores();
    }
    
    // Check if game is over
    if (isGameOver(board)) {
        endGame();
        return;
    }
    
    // Check if player has valid moves
    const playerMoves = getValidMoves(board, BLACK);
    if (playerMoves.length === 0) {
        // Player has no moves, AI goes again
        updateStatus('Nie masz ruchów. Komputer gra ponownie...');
        currentPlayer = WHITE;
        setTimeout(() => {
            makeAIMove();
        }, 1000);
        return;
    }
    
    // Switch back to player
    currentPlayer = BLACK;
    updateStatus('Twoja kolej (czarne)');
}

// End game
function endGame() {
    gameActive = false;
    const winner = getWinner(board);
    const { black, white } = countDiscs(board);
    
    let message;
    if (winner === BLACK) {
        message = `Wygrałeś! ${black}:${white}`;
    } else if (winner === WHITE) {
        message = `Komputer wygrał. ${black}:${white}`;
    } else {
        message = `Remis! ${black}:${white}`;
    }
    
    updateStatus(message);
}

// Start new game
function startNewGame() {
    initBoard();
    currentPlayer = BLACK;
    gameActive = true;
    renderBoard();
    updateScores();
    updateStatus('Twoja kolej (czarne)');
}

// Set difficulty
function setDifficulty(level) {
    difficulty = level;
    difficultyBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
    });
    startNewGame();
}

// Event Listeners
newGameBtn.addEventListener('click', startNewGame);

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.level);
    });
});

// Initialize game
startNewGame();
