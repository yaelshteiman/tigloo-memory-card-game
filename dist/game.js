"use strict";
class MemoryGame {
    constructor() {
        this.gridSize = 4;
        this.maxGridSize = 6;
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.timer = 0;
        this.moveCounter = null;
        this.timerDisplay = null;
        this.gameGrid = null;
        this.timerInterval = undefined; //used for setInterval
        this.isCountdownMode = false;
        this.extraTimeUsed = false;
        this.init();
    }
    init() {
        this.gameGrid = document.getElementById("game-grid");
        this.moveCounter = document.getElementById("moves");
        this.timerDisplay = document.getElementById("timer");
        const startRegularButton = document.getElementById("start-regular-game");
        const startCountdownButton = document.getElementById("start-countdown-game");
        const peekButton = document.getElementById("peek-power-up");
        const extraTimeButton = document.getElementById("extra-time-power-up");
        const shuffleButton = document.getElementById("shuffle-power-up");
        if (startRegularButton) {
            startRegularButton.addEventListener('click', () => this.startNewGame(false));
        }
        if (startCountdownButton) {
            startCountdownButton.addEventListener('click', () => this.startNewGame(true));
        }
        if (peekButton) {
            peekButton.addEventListener('click', () => this.peekPowerUp());
        }
        if (extraTimeButton) {
            extraTimeButton.addEventListener('click', () => this.extraTimePowerUp());
        }
        if (shuffleButton) {
            shuffleButton.addEventListener('click', () => this.shufflePowerUp());
        }
    }
    startNewGame(isCountdown) {
        this.isCountdownMode = isCountdown;
        this.resetGame();
        this.generateCards();
        this.renderCards();
        if (this.isCountdownMode) {
            this.startCountdown();
        }
        else {
            this.startTimer();
        }
    }
    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        if (this.isCountdownMode) {
            this.timer = 120;
        }
        else {
            this.timer = 0;
        }
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
        }
        if (this.moveCounter) {
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `Time: ${this.timer}`;
        }
        if (this.gameGrid) {
            this.gameGrid.innerHTML = '';
            this.gameGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`; // Adjust grid layout
            this.gameGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`; // Adjust grid layout
        }
    }
    generateCards() {
        const totalCards = this.gridSize * this.gridSize;
        const values = Array.from({ length: totalCards / 2 }, (_, i) => i.toString());
        // const allValues = [...values, ...values].sort(() => Math.random() - 0.5);
        const colors = ["blue", "red", "green"];
        const shapes = ["circle", "square"];
        const allCards = [];
        let idCounter = 0;
        values.forEach(value => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            allCards.push({ id: idCounter++, value, isFlipped: false, isMatched: false, color, shape }, { id: idCounter++, value, isFlipped: false, isMatched: false, color, shape });
        });
        this.cards = allCards.sort(() => Math.random() - 0.5);
    }
    //display the cards on the grid + setup click events for each card
    renderCards() {
        if (!this.gameGrid)
            return;
        this.gameGrid.innerText = '';
        this.cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.dataset.id = card.id.toString();
            const cardInner = document.createElement("div");
            cardInner.classList.add("card-inner");
            const cardFront = document.createElement("div");
            cardFront.classList.add("card-front", card.color, card.shape);
            cardFront.textContent = card.value;
            const cardBack = document.createElement("div");
            cardBack.classList.add("card-back");
            cardBack.textContent = "";
            cardElement.appendChild(cardInner);
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            if (!card.isMatched) {
                cardElement.addEventListener('click', () => this.handleCardClick(card));
            }
            if (this.gameGrid) {
                this.gameGrid.appendChild(cardElement);
            }
        });
    }
    handleCardClick(card) {
        if (card.isFlipped || card.isMatched) {
            return;
        }
        card.isFlipped = true;
        this.updateCardDisplay(card);
        this.flippedCards.push(card);
        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    updateCardDisplay(card, flipped = true) {
        const cardElement = document.querySelector(`[data-id="${card.id}"]`);
        if (cardElement) {
            if (card.isMatched) {
                cardElement.classList.add("matched");
            }
            else if (flipped) {
                cardElement.classList.add("flipped");
            }
            else {
                cardElement.classList.remove("flipped");
            }
        }
    }
    checkMatch() {
        const allMatch = this.flippedCards.every(card => card.value === this.flippedCards[0].value);
        if (allMatch) {
            this.flippedCards.forEach(card => {
                card.isMatched = true;
                this.updateCardDisplay(card, true);
            });
        }
        else {
            this.flippedCards.forEach(card => {
                card.isFlipped = false;
                this.updateCardDisplay(card, false);
            });
        }
        this.moves++;
        this.flippedCards = [];
        if (this.moveCounter) {
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
        this.checkWinCondition();
    }
    checkWinCondition() {
        console.log("checkWinCondition called");
        if (this.cards.every(card => card.isMatched)) {
            if (this.timerInterval !== null) {
                clearInterval(this.timerInterval);
            }
            this.showCelebration();
            if (this.gridSize <= this.maxGridSize) {
                this.gridSize++;
                console.log(`Grid size increased to: ${this.gridSize}`);
            }
            console.log(this.gridSize);
            setTimeout(() => {
                this.startNewGame(this.isCountdownMode);
            }, 10000);
        }
    }
    showCelebration() {
        // Create and display the "Congratulations!" message
        const messageElement = document.createElement("div");
        messageElement.classList.add("congrats-message");
        messageElement.textContent = "Congratulations! You Won!";
        document.body.appendChild(messageElement);
        // Create the confetti container
        const confettiContainer = document.createElement("div");
        confettiContainer.classList.add("confetti-container");
        document.body.appendChild(confettiContainer);
        // Generate multiple confetti elements
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random colors
            confetti.style.animationDelay = `${Math.random() * 3}s`; // Random delay
            confettiContainer.appendChild(confetti);
        }
        // Remove the message and confetti after 10 seconds
        setTimeout(() => {
            document.body.removeChild(messageElement);
            document.body.removeChild(confettiContainer);
        }, 10000); // 10-second duration
    }
    startTimer() {
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
        }
        this.timer = 0;
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `Time: ${this.timer}s`;
        }
        this.timerInterval = window.setInterval(() => {
            this.timer++;
            if (this.timerDisplay) {
                this.timerDisplay.textContent = `Time: ${this.timer}s`;
            }
        }, 1000);
    }
    startCountdown() {
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
        }
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `Time: ${this.timer}s`;
        }
        this.timerInterval = window.setInterval(() => {
            this.timer--;
            if (this.timerDisplay) {
                this.timerDisplay.textContent = `Time: ${this.timer}s`;
            }
            if (this.timer <= 0) {
                clearInterval(this.timerInterval);
                alert("Time's up! game over.");
                this.startNewGame(this.isCountdownMode);
            }
        }, 1000);
    }
    peekPowerUp() {
        this.cards.forEach(card => {
            if (!card.isMatched) {
                card.isFlipped = true;
                this.updateCardDisplay(card, true);
            }
        });
        setTimeout(() => {
            this.cards.forEach(card => {
                if (!card.isMatched) {
                    card.isFlipped = false;
                    this.updateCardDisplay(card, false);
                }
            });
        }, 1000);
        this.moves++;
        if (this.moveCounter) {
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
    }
    extraTimePowerUp() {
        if (this.extraTimeUsed) {
            alert("Extra Time can only be used once per game!");
            return;
        }
        if (!this.isCountdownMode) {
            alert("Extra Time is only available in countdown mode");
            return;
        }
        this.extraTimeUsed = true;
        this.timer += 30;
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `Time: ${this.timer}s`;
        }
    }
    shufflePowerUp() {
        this.moves++;
        if (this.moveCounter) {
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
        // const matchedCards = this.cards.filter(card => card.isMatched);
        const unmatchedCards = this.cards.filter(card => !card.isMatched);
        for (let i = unmatchedCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unmatchedCards[i], unmatchedCards[j]] = [unmatchedCards[j], unmatchedCards[i]];
        }
        let unmatchedIndex = 0;
        this.cards = this.cards.map(card => {
            if (card.isMatched) {
                return card;
            }
            else {
                return unmatchedCards[unmatchedIndex++];
            }
        });
        this.renderCards();
    }
}
window.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
//# sourceMappingURL=game.js.map