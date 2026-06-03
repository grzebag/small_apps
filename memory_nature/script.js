class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.level = 1;
        this.levelScore = 0;
        this.sessionScore = 0;
        this.records = JSON.parse(localStorage.getItem('natureMemoryRecords')) || {};
        this.migrateOldRecords();
        this.timer = null;
        this.seconds = 0;
        this.isLocked = false;
        
        // New Mechanics
        this.combo = 0;
        this.maxCombo = 0;
        this.totalSpeedBonus = 0;
        this.basePointsTotal = 0;
        this.lastMatchTime = 0;

        // Expanded Emoji Pool (Nature, Food, Transport, Objects)
        this.emojis = [
            '🌿', '🦊', '🌻', '🦉', '🍄', '🦋', '🌲', '🐿️', '🦌', '🐻', 
            '🌸', '🐝', '🐞', '🍃', '🍎', '🍐', '🦉', '🐦', '🌳', '🌺',
            '🐇', '🦔', '🐸', '🐢', '🦢', '🪻', '🌵', '🥥', '🥭', '🍍',
            '🍕', '🍔', '🍣', '🍦', '🍩', '🥐', '🥨', '🥑', '🥦', '🌶️',
            '🚗', '🚀', '✈️', '🚲', '🚁', '⛵', '🚂', '🚜', '🛵', '🛸',
            '💡', '💎', '🎨', '🎸', '⚽', '🎮', '📱', '⌚', '📷', '🔑',
            '👾', '🐷', '☢️', '🎈', '🧨', '🎁', '🎞️', '🎪', '🧵', '👓',
            '🕶️', '🥾', '⛑️', '🪖', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉',
            '🎱', '💋', '🎳', '🥌', '🎣', '🤿', '🛷', '🎿', '🎯', '🎲',
            '🕹️', '🔮', '🪄', '🎤', '🎙️', '🎻', '🎸', '🪗', '📻', '⚒️',
            '⛏️', '🪓', '🔨', '🔧', '🪛', '🔩', '🪵', '🛖', '🛢️', '⚗️',
            '🧪', '⚙️', '⚔️', '🔫', '🏹', '🪚', '🛡️', '☎️', '🗿', '🪫',
            '🔌', '💽', '💾', '🖲️', '🎥', '🧮', '📽️', '📼', '💡', '💰',
            '💵', '💼', '⌚', '⏰', '⏱️', '🕰️', '✂️', '🍭', '🚛', '🏍️',
            '🚂', '🛩️', '🚀', '⚓', '🚢', '🏝️', '🕋', '🍟', '🍖', '🌴'
        ];
        
        this.board = document.getElementById('game-board');
        this.setupEventListeners();
        this.updateHeaderRecords();
    }

    migrateOldRecords() {
        const oldData = localStorage.getItem('natureMemoryBestTimes');
        if (oldData && !localStorage.getItem('natureMemoryRecords')) {
            const oldTimes = JSON.parse(oldData);
            Object.keys(oldTimes).forEach(level => {
                this.records[level] = {
                    time: oldTimes[level],
                    score: 0,
                    combo: 0
                };
            });
            localStorage.setItem('natureMemoryRecords', JSON.stringify(this.records));
            localStorage.removeItem('natureMemoryBestTimes');
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.theme-options button').forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(e.target.dataset.theme));
        });
    }

    startGame(theme) {
        document.body.className = `theme-${theme}`;
        document.getElementById('menu-overlay').classList.add('hidden');
        this.sessionScore = 0;
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
        this.levelScore = 0;
        document.getElementById('score').innerText = this.levelScore;
        document.getElementById('combo-display').innerText = 'x0';
        
        const cardCount = this.getCardCount();
        const levelEmojis = this.getRandomEmojis(cardCount / 2);
        const gameSet = [...levelEmojis, ...levelEmojis].sort(() => Math.random() - 0.5);

        this.board.style.gridTemplateColumns = `repeat(${this.getColumns()}, 1fr)`;

        gameSet.forEach((emoji, index) => {
            const card = this.createCardElement(emoji, index);
            this.board.appendChild(card);
        });

        document.getElementById('session-score').innerText = this.sessionScore;
        this.updateHeaderRecords();
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
            this.levelScore += pointsEarned;
            document.getElementById('score').innerText = this.levelScore;
            document.getElementById('combo-display').innerText = `x${this.combo}`;

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
            document.getElementById('combo-display').innerText = 'x0';
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

        this.sessionScore += this.levelScore;
        
        // Record keeping — time, score, combo per level + session total
        const rec = this.records[this.level] || { time: Infinity, score: 0, combo: 0 };
        let anyRecord = false;

        if (!this.records[this.level] || this.seconds < rec.time) {
            rec.time = this.seconds;
            anyRecord = true;
        }
        if (this.levelScore > rec.score) {
            rec.score = this.levelScore;
            anyRecord = true;
        }
        if (this.maxCombo > rec.combo) {
            rec.combo = this.maxCombo;
            anyRecord = true;
        }

        this.records[this.level] = rec;

        if (this.sessionScore > (this.records.session?.score || 0)) {
            this.records.session = { score: this.sessionScore };
            anyRecord = true;
        }

        localStorage.setItem('natureMemoryRecords', JSON.stringify(this.records));
        this.updateHeaderRecords();

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
        document.getElementById('stat-total-score').innerText = this.levelScore;
        document.getElementById('stat-session-score').innerText = this.sessionScore;

        // Show new record badge
        const badge = document.getElementById('new-record-badge');
        if (anyRecord) {
            badge.classList.remove('hidden');
            setTimeout(() => badge.classList.add('hidden'), 4000);
        } else {
            badge.classList.add('hidden');
        }

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

    updateHeaderRecords() {
        const rec = this.records[this.level];

        // Best time
        const bestTimeEl = document.getElementById('best-time');
        if (rec && rec.time !== Infinity) {
            const mins = Math.floor(rec.time / 60).toString().padStart(2, '0');
            const secs = (rec.time % 60).toString().padStart(2, '0');
            bestTimeEl.innerText = `${mins}:${secs}`;
        } else {
            bestTimeEl.innerText = '--:--';
        }

        // Best score
        document.getElementById('best-score').innerText = rec ? rec.score : 0;

        // Best combo
        document.getElementById('best-combo').innerText = rec ? `x${rec.combo}` : 'x0';

        // Best stars
        const starsEl = document.getElementById('best-stars-display');
        if (rec && rec.time !== Infinity) {
            const cardCount = this.getCardCount();
            const stars = rec.time <= cardCount * 1.5 ? '★★★' :
                          rec.time <= cardCount * 2.5 ? '★★☆' : '★☆☆';
            starsEl.innerText = stars;
        } else {
            starsEl.innerText = '---';
        }

        // Best session
        const bestSessionEl = document.getElementById('best-session');
        bestSessionEl.innerText = this.records.session ? this.records.session.score : 0;
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
