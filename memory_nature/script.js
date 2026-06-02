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
        
        // New Mechanics
        this.combo = 0;
        this.maxCombo = 0;
        this.totalSpeedBonus = 0;
        this.basePointsTotal = 0;
        this.lastMatchTime = 0;
        this.bestTimes = JSON.parse(localStorage.getItem('natureMemoryBestTimes')) || {};

        // Expanded Emoji Pool (Nature, Food, Transport, Objects)
        this.emojis = [
            '🌿', '🦊', '🌻', '🦉', '🍄', '🦋', '🌲', '🐿️', '🦌', '🐻', 
            '🌸', '🐝', '🐞', '🍃', '🍎', '🍐', '🦉', '🐦', '🌳', '🌺',
            '🐇', '🦔', '🐸', '🐢', '🦢', '🪻', '🌵', '🥥', '🥭', '🍍',
            '🍕', '🍔', '🍣', '🍦', '🍩', '🥐', '🥨', '🥑', '🥦', '🌶️',
            '🚗', '🚀', '✈️', '🚲', '🚁', '⛵', '🚂', '🚜', '🛵', '🛸',
            '💡', '💎', '🎨', '🎸', '⚽', '🎮', '📱', '⌚', '📷', '🔑'
        ];
        
        this.board = document.getElementById('game-board');
        this.setupEventListeners();
        this.updateBestTimeDisplay();
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
        
        // Stats Reset
        this.combo = 0;
        this.maxCombo = 0;
        this.totalSpeedBonus = 0;
        this.basePointsTotal = 0;
        this.lastMatchTime = 0;
        this.seconds = 0;
        this.score = 0; // Reset score for the level display? Actually let's keep total score but track level stats
        document.getElementById('score').innerText = this.score;
        
        const cardCount = this.getCardCount();
        const levelEmojis = this.getRandomEmojis(cardCount / 2);
        const gameSet = [...levelEmojis, ...levelEmojis].sort(() => Math.random() - 0.5);

        this.board.style.gridTemplateColumns = `repeat(${this.getColumns()}, 1fr)`;

        gameSet.forEach((emoji, index) => {
            const card = this.createCardElement(emoji, index);
            this.board.appendChild(card);
        });

        this.updateBestTimeDisplay();
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
        const shuffled = [...this.emojis].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
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
        
        // Mobile-friendly interaction
        let touchStarted = false;
        const handleInteraction = (e) => {
            if (e.type === 'touchstart') {
                touchStarted = true;
            } else if (e.type === 'click' && touchStarted) {
                touchStarted = false;
                return;
            }
            this.flipCard(card);
        };

        card.addEventListener('click', handleInteraction);
        card.addEventListener('touchstart', handleInteraction, { passive: true });
        
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
            // Speed & Combo Logic
            const timeSinceLastMatch = this.seconds - this.lastMatchTime;
            this.lastMatchTime = this.seconds;

            if (timeSinceLastMatch <= 5) {
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            } else {
                this.combo = 1;
                if (this.maxCombo === 0) this.maxCombo = 1;
            }

            const basePoints = 10;
            const speedBonus = Math.max(0, 5 - timeSinceLastMatch) * 2;
            const pointsEarned = (basePoints + speedBonus) * this.combo;
            
            this.basePointsTotal += basePoints;
            this.totalSpeedBonus += speedBonus * this.combo;
            this.score += pointsEarned;
            document.getElementById('score').innerText = this.score;

            this.matchedPairs++;
            
            setTimeout(() => {
                if (this.combo > 1) {
                    this.showComboMsg(this.combo);
                }
            }, 400);

            this.flippedCards = [];
            this.isLocked = false;
            
            if (this.matchedPairs === this.getCardCount() / 2) {
                this.handleWin();
            }
        } else {
            this.combo = 0; 
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flippedCards = [];
                this.isLocked = false;
            }, 800);
        }
    }

    showComboMsg(count) {
        const msg = document.getElementById('combo-msg');
        msg.innerText = `COMBO x${count}`;
        msg.style.display = 'block';
        
        if (this.comboTimeout) clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            msg.style.display = 'none';
        }, 2000);
    }

    handleWin() {
        clearInterval(this.timer);
        
        // Record keeping
        if (!this.bestTimes[this.level] || this.seconds < this.bestTimes[this.level]) {
            this.bestTimes[this.level] = this.seconds;
            localStorage.setItem('natureMemoryBestTimes', JSON.stringify(this.bestTimes));
        }

        // Star rating
        const cardCount = this.getCardCount();
        const goldTime = cardCount * 1.5;
        const silverTime = cardCount * 2.5;
        
        let starsCount = 1;
        if (this.seconds <= goldTime) starsCount = 3;
        else if (this.seconds <= silverTime) starsCount = 2;

        // Populate Detailed Stats
        const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const secs = (this.seconds % 60).toString().padStart(2, '0');
        document.getElementById('stat-time').innerText = `${mins}:${secs}`;
        document.getElementById('stat-base-pts').innerText = this.basePointsTotal;
        document.getElementById('stat-speed-bonus').innerText = `+${Math.round(this.totalSpeedBonus)}`;
        document.getElementById('stat-max-combo').innerText = `x${this.maxCombo}`;
        document.getElementById('stat-total-score').innerText = this.score;

        // Animate stars
        const starsEl = document.getElementById('level-stars');
        const stars = starsEl.querySelectorAll('.star');
        stars.forEach((s, i) => {
            s.classList.remove('active');
            setTimeout(() => {
                if (i < starsCount) s.classList.add('active');
            }, 300 + (i * 300));
        });

        // Show Overlay
        setTimeout(() => {
            document.getElementById('next-level-overlay').classList.remove('hidden');
        }, 1000);
        
        document.getElementById('next-level-btn').onclick = () => {
            this.level++;
            document.getElementById('level').innerText = this.level;
            document.getElementById('next-level-overlay').classList.add('hidden');
            this.initLevel();
        };
    }

    updateBestTimeDisplay() {
        const best = this.bestTimes[this.level];
        const el = document.getElementById('best-time');
        if (best) {
            const mins = Math.floor(best / 60).toString().padStart(2, '0');
            const secs = (best % 60).toString().padStart(2, '0');
            el.innerText = `${mins}:${secs}`;
        } else {
            el.innerText = '--:--';
        }
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
