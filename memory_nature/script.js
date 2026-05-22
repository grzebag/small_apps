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
        return [...this.emojis].sort(() => Math.random() - 0.5).slice(0, count);
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

    flipCard(card) {
        // Placeholder for Task 4 logic
        console.log('Card flipped:', card.dataset.emoji);
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
