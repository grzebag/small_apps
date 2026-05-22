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

    handleWin() {
        clearInterval(this.timer);
        const summary = `Ukończyłeś poziom ${this.level} w czasie ${this.seconds} sekund! Twój wynik to ${this.score}.`;
        document.getElementById('level-summary').innerText = summary;
        document.getElementById('next-level-overlay').classList.remove('hidden');
        
        document.getElementById('next-level-btn').onclick = () => {
            this.level++;
            document.getElementById('level').innerText = this.level;
            document.getElementById('next-level-overlay').classList.add('hidden');
            this.initLevel();
        };
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
