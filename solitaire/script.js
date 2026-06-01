// Generowanie SVG
function getCardSVG(rank, suit) {
    let color1, color2, suitId;
    if (suit === '♥') { color1 = '#ff4b6a'; color2 = '#d63031'; suitId = 'H'; }
    else if (suit === '♦') { color1 = '#ff7f50'; color2 = '#e84118'; suitId = 'D'; }
    else if (suit === '♣') { color1 = '#2f3640'; color2 = '#192a56'; suitId = 'C'; }
    else if (suit === '♠') { color1 = '#353b48'; color2 = '#2f3640'; suitId = 'S'; }

    let symbol = '';
    const fill = `url(#grad-${suitId})`;
    
    if (suit === '♥') symbol = `<path d="M50 85 C 50 85, 15 50, 15 30 A 18 18 0 0 1 50 30 A 18 18 0 0 1 85 30 C 85 50, 50 85, 50 85 Z" fill="${fill}"/>`;
    else if (suit === '♦') symbol = `<polygon points="50,15 85,50 50,85 15,50" fill="${fill}"/>`;
    else if (suit === '♣') symbol = `<circle cx="50" cy="35" r="18" fill="${fill}"/><circle cx="30" cy="60" r="18" fill="${fill}"/><circle cx="70" cy="60" r="18" fill="${fill}"/><path d="M50 50 L 65 90 L 35 90 Z" fill="${fill}"/>`;
    else if (suit === '♠') symbol = `<path d="M50 15 C 50 15, 85 50, 85 70 A 18 18 0 0 1 50 70 A 18 18 0 0 1 15 70 C 15 50, 50 15, 50 15 Z M50 65 L 65 95 L 35 95 Z" fill="${fill}"/>`;

    const svg = `
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-${suitId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color1}"/>
                <stop offset="100%" stop-color="${color2}"/>
            </linearGradient>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="100%" stop-color="#fdfbfb"/>
            </linearGradient>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#f9d423"/>
                <stop offset="100%" stop-color="#ff4e50"/>
            </linearGradient>
            <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4" flood-color="${color2}"/>
            </filter>
        </defs>
        <rect width="100" height="140" rx="6" fill="url(#bgGrad)" stroke="#dcdde1" stroke-width="1"/>
        <rect width="90" height="130" x="5" y="5" rx="4" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6"/>
        
        <path d="M 5 15 L 15 5" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6"/>
        <path d="M 95 15 L 85 5" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6"/>
        <path d="M 5 125 L 15 135" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6"/>
        <path d="M 95 125 L 85 135" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6"/>

        <text x="16" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="url(#grad-${suitId})">${rank}</text>
        <g transform="translate(4, 32) scale(0.24)">${symbol}</g>
        
        <g transform="translate(50, 70) scale(0.65) translate(-50, -50)" filter="url(#drop)">${symbol}</g>
        
        <g transform="translate(100, 140) rotate(180)">
            <text x="16" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="url(#grad-${suitId})">${rank}</text>
            <g transform="translate(4, 32) scale(0.24)">${symbol}</g>
        </g>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

const cardBackURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="backBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#192a56"/>
            <stop offset="100%" stop-color="#273c75"/>
        </linearGradient>
        <linearGradient id="goldLines" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f1c40f"/>
            <stop offset="100%" stop-color="#e67e22"/>
        </linearGradient>
        <pattern id="patBack" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 10 L20 10 M10 0 L10 20" stroke="url(#goldLines)" stroke-width="1.5" opacity="0.3"/>
            <circle cx="10" cy="10" r="3" fill="url(#goldLines)" opacity="0.5"/>
        </pattern>
    </defs>
    <rect width="100" height="140" rx="6" fill="#fff" stroke="#dcdde1" stroke-width="1"/>
    <rect width="90" height="130" x="5" y="5" rx="4" fill="url(#backBg)"/>
    <rect width="90" height="130" x="5" y="5" rx="4" fill="url(#patBack)"/>
    
    <rect width="70" height="110" x="15" y="15" rx="3" fill="none" stroke="url(#goldLines)" stroke-width="2" opacity="0.8"/>
    <circle cx="50" cy="70" r="18" fill="none" stroke="url(#goldLines)" stroke-width="2" opacity="0.8"/>
    <polygon points="50,42 63,70 50,98 37,70" fill="url(#goldLines)" opacity="0.8"/>
</svg>
`.trim())}`;

// Game Data
const suits = ['♥', '♦', '♣', '♠'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let state = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableaus: [[], [], [], [], [], [], []]
};

function initGame() {
    let deck = [];
    suits.forEach(suit => {
        ranks.forEach((rank, i) => {
            deck.push({
                id: `${rank}${suit}`,
                suit: suit,
                rank: rank,
                value: i + 1,
                color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
                faceUp: false
            });
        });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    state = { stock: [], waste: [], foundations: [[], [], [], []], tableaus: [[], [], [], [], [], [], []] };
    
    // Deal
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            if (j === i) card.faceUp = true;
            state.tableaus[i].push(card);
        }
    }
    state.stock = deck;
    renderBoard();
}

// Rendering
function createCardDOM(card, source, col, idx) {
    const el = document.createElement('div');
    el.classList.add('card');
    el.dataset.id = card.id;
    el.dataset.source = source;
    el.dataset.col = col;
    el.dataset.idx = idx;
    el.dataset.faceup = card.faceUp;
    
    if (card.faceUp) {
        el.style.backgroundImage = `url('${getCardSVG(card.rank, card.suit)}')`;
        el.draggable = true;
    } else {
        el.style.backgroundImage = `url('${cardBackURI}')`;
        el.draggable = false;
    }
    
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);
    el.addEventListener('dblclick', onDblClick);
    
    return el;
}

function renderBoard() {
    // Stock
    const stockEl = document.getElementById('stock');
    stockEl.innerHTML = '';
    if (state.stock.length > 0) {
        stockEl.appendChild(createCardDOM(state.stock[state.stock.length - 1], 'stock', 0, state.stock.length - 1));
    }

    // Waste
    const wasteEl = document.getElementById('waste');
    wasteEl.innerHTML = '';
    let p = wasteEl;
    state.waste.forEach((card, i) => {
        const el = createCardDOM(card, 'waste', 0, i);
        p.appendChild(el);
        p = el;
    });

    // Foundations
    for (let i = 0; i < 4; i++) {
        const fEl = document.getElementById(`foundation-${i}`);
        fEl.innerHTML = '';
        let p = fEl;
        state.foundations[i].forEach((card, idx) => {
            const el = createCardDOM(card, 'foundation', i, idx);
            p.appendChild(el);
            p = el;
        });
    }

    // Tableaus
    for (let i = 0; i < 7; i++) {
        const tEl = document.getElementById(`tableau-${i}`);
        tEl.innerHTML = '';
        let p = tEl;
        state.tableaus[i].forEach((card, idx) => {
            const el = createCardDOM(card, 'tableau', i, idx);
            p.appendChild(el);
            p = el;
        });
    }
}

// Interactions
document.getElementById('stock').addEventListener('click', () => {
    if (state.stock.length > 0) {
        const card = state.stock.pop();
        card.faceUp = true;
        state.waste.push(card);
    } else {
        while (state.waste.length > 0) {
            const card = state.waste.pop();
            card.faceUp = false;
            state.stock.push(card);
        }
    }
    renderBoard();
});

document.getElementById('reset-btn').addEventListener('click', initGame);

function onDragStart(e) {
    if (e.target.dataset.faceup !== 'true') {
        e.preventDefault();
        return;
    }
    const data = {
        source: e.target.dataset.source,
        col: parseInt(e.target.dataset.col),
        idx: parseInt(e.target.dataset.idx)
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
}

function onDragOver(e) {
    e.preventDefault();
}

function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    let targetEl = e.target.closest('.card, .pile');
    if (!targetEl) return;
    
    const targetSource = targetEl.dataset.source;
    if (targetSource !== 'tableau' && targetSource !== 'foundation') return;
    const targetCol = parseInt(targetEl.dataset.col);
    
    const dataString = e.dataTransfer.getData('text/plain');
    if (!dataString) return;
    const dragData = JSON.parse(dataString);
    
    if (dragData.source === targetSource && dragData.col === targetCol) return;

    handleMove(dragData, targetSource, targetCol);
}

function handleMove(drag, targetSource, targetCol) {
    let draggedCards = [];
    if (drag.source === 'tableau') draggedCards = state.tableaus[drag.col].slice(drag.idx);
    else if (drag.source === 'waste') draggedCards = [state.waste[state.waste.length - 1]];
    else if (drag.source === 'foundation') draggedCards = [state.foundations[drag.col][state.foundations[drag.col].length - 1]];
    
    const movingCard = draggedCards[0];
    if (!movingCard) return;

    let isValid = false;
    
    if (targetSource === 'tableau') {
        const tCol = state.tableaus[targetCol];
        if (tCol.length === 0) {
            if (movingCard.value === 13) isValid = true;
        } else {
            const topCard = tCol[tCol.length - 1];
            if (topCard.color !== movingCard.color && movingCard.value === topCard.value - 1) isValid = true;
        }
    } else if (targetSource === 'foundation') {
        if (draggedCards.length === 1) {
            const fCol = state.foundations[targetCol];
            if (fCol.length === 0) {
                if (movingCard.value === 1) isValid = true;
            } else {
                const topCard = fCol[fCol.length - 1];
                if (topCard.suit === movingCard.suit && movingCard.value === topCard.value + 1) isValid = true;
            }
        }
    }
    
    if (isValid) {
        // Remove from source
        if (drag.source === 'tableau') {
            state.tableaus[drag.col].splice(drag.idx);
            if (state.tableaus[drag.col].length > 0) state.tableaus[drag.col][state.tableaus[drag.col].length - 1].faceUp = true;
        } else if (drag.source === 'waste') state.waste.pop();
        else if (drag.source === 'foundation') state.foundations[drag.col].pop();
        
        // Add to target
        if (targetSource === 'tableau') state.tableaus[targetCol].push(...draggedCards);
        else if (targetSource === 'foundation') state.foundations[targetCol].push(movingCard);
        
        renderBoard();
        checkWin();
    }
}

function onDblClick(e) {
    e.stopPropagation();
    const el = e.currentTarget;
    if (el.dataset.faceup !== 'true') return;
    
    const source = el.dataset.source;
    const col = parseInt(el.dataset.col);
    const idx = parseInt(el.dataset.idx);
    
    let draggedCards = [];
    if (source === 'tableau') draggedCards = state.tableaus[col].slice(idx);
    else if (source === 'waste') draggedCards = [state.waste[state.waste.length - 1]];
    else return;
    
    if (draggedCards.length !== 1) return;
    const movingCard = draggedCards[0];
    
    for (let f = 0; f < 4; f++) {
        const fCol = state.foundations[f];
        if (fCol.length === 0) {
            if (movingCard.value === 1) {
                handleMove({source, col, idx}, 'foundation', f);
                return;
            }
        } else {
            const topCard = fCol[fCol.length - 1];
            if (topCard.suit === movingCard.suit && movingCard.value === topCard.value + 1) {
                handleMove({source, col, idx}, 'foundation', f);
                return;
            }
        }
    }
}

function checkWin() {
    if (state.foundations.every(f => f.length === 13)) {
        showVictoryScreen();
    }
}

function showVictoryScreen() {
    const victoryScreen = document.getElementById('victory-screen');
    victoryScreen.classList.remove('hidden');
    
    // Confetti effect
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#f1c40f', '#e74c3c', '#2980b9']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#f1c40f', '#e74c3c', '#2980b9']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('victory-screen').classList.add('hidden');
    initGame();
});

// Event Listeners for empty piles (dropping on empty slots)
document.querySelectorAll('.pile').forEach(pile => {
    pile.addEventListener('dragover', onDragOver);
    pile.addEventListener('drop', onDrop);
});

// Start game
initGame();