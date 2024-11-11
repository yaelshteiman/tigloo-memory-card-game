"use strict";
class MemoryGame {
    constructor() {
        this.gridSize = 4;
        this.maxGridSize = 6;
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.timer = 0;
        this.countdown_time = 120;
        this.moveCounter = null;
        this.timerDisplay = null;
        this.gameGrid = null;
        this.leaderboardOverlay = null;
        this.leaderboardContainer = null;
        this.timerInterval = undefined; //used for setInterval
        this.isCountdownMode = false;
        this.extraTimeUsed = false;
        this.extraTime = 30;
        this.isMultiSelectMode = false;
        this.maxSelectableCards = 2;
        try {
            this.init();
        }
        catch (error) {
            console.error("Error during game initialization:", error);
        }
    }
    // Initializes the game, sets up the UI elements and event listeners
    init() {
        this.gameGrid = document.getElementById("game-grid");
        this.moveCounter = document.getElementById("moves");
        this.timerDisplay = document.getElementById("timer");
        this.createLeaderboard();
        const startRegularButton = document.getElementById("start-regular-game");
        const startCountdownButton = document.getElementById("start-countdown-game");
        const peekButton = document.getElementById("peek-power-up");
        const extraTimeButton = document.getElementById("extra-time-power-up");
        const shuffleButton = document.getElementById("shuffle-power-up");
        const multiSelectToggle = document.getElementById("multi-select-toggle");
        if (startRegularButton) {
            startRegularButton.addEventListener('click', () => this.startNewGame(false));
        }
        else {
            console.error("Error: 'Start Regular Game' button not found.");
        }
        if (startCountdownButton) {
            startCountdownButton.addEventListener('click', () => this.startNewGame(true));
        }
        else {
            console.error("Error: 'Start Countdown Game' button not found.");
        }
        if (peekButton) {
            peekButton.addEventListener('click', () => this.peekPowerUp());
        }
        else {
            console.error("Error: 'Peek Power-Up' button not found.");
        }
        if (extraTimeButton) {
            extraTimeButton.addEventListener('click', () => this.extraTimePowerUp());
        }
        else {
            console.error("Error: 'Extra Time Power-Up' button not found.");
        }
        if (shuffleButton) {
            shuffleButton.addEventListener('click', () => this.shufflePowerUp());
        }
        else {
            console.error("Error: 'Shuffle Power-Up' button not found.");
        }
        if (multiSelectToggle) {
            multiSelectToggle.addEventListener('click', () => this.toggleMultiSelectMode());
        }
        else {
            console.error("Error: 'Multi-Select Mode' toggle not found.");
        }
    }
    // Starts a new game, resets the board, and sets the game mode
    startNewGame(isCountdown) {
        this.isCountdownMode = isCountdown;
        this.resetGame();
        this.generateCards();
        this.renderCards();
        if (isCountdown) {
            this.startCountdown();
        }
        else {
            this.startTimer();
        }
    }
    // Resets the game state, including the timer, moves, and card states
    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.extraTimeUsed = false;
        this.maxSelectableCards = 2;
        if (this.isCountdownMode) {
            this.timer = this.countdown_time;
        }
        else {
            this.timer = 0;
        }
        if (this.timerInterval !== undefined) {
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
            // this.gameGrid.style.display = "grid";
            this.gameGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`; // Adjust grid layout
            this.gameGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`; // Adjust grid layout
        }
    }
    // Generates the cards for the game, ensuring pairs (or triplets in multi-select mode)
    generateCards() {
        const totalCards = this.gridSize * this.gridSize;
        const values = Array.from({ length: totalCards }, (_, i) => i.toString());
        values.sort(() => Math.random() - 0.5);
        const colors = ["blue", "red", "green", "purple"];
        const shapes = ["circle", "square"];
        const allCards = [];
        let idCounter = 0;
        let remainingCards = totalCards;
        while (remainingCards > 0) {
            const randomIndex = Math.floor(Math.random() * values.length);
            const value = values[randomIndex];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (this.isMultiSelectMode && remainingCards >= 3 && Math.random() < 0.5) {
                allCards.push({ id: idCounter++, value, isFlipped: false, isMatched: false, color, shape }, { id: idCounter++, value, isFlipped: false, isMatched: false, color, shape }, { id: idCounter++, value, isFlipped: false, isMatched: false, color, shape });
                remainingCards -= 3;
            }
            else if (remainingCards >= 2) {
                allCards.push({ id: idCounter++, value, isFlipped: false, isMatched: false, color, shape }, { id: idCounter++, value, isFlipped: false, isMatched: false, color, shape });
                remainingCards -= 2;
            }
            else {
                break;
            }
        }
        this.cards = allCards.sort(() => Math.random() - 0.5);
    }
    //display the cards on the grid and setup click events for each card
    renderCards() {
        if (!this.gameGrid) {
            console.error("Error: No game grid found.");
            return;
        }
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
    // Handles the card click event, flipping the card and checking for matches
    handleCardClick(card) {
        if (card.isFlipped || card.isMatched || this.flippedCards.length > this.maxSelectableCards) {
            return;
        }
        card.isFlipped = true;
        this.updateCardDisplay(card);
        this.flippedCards.push(card);
        if (this.flippedCards.length === this.maxSelectableCards || this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 2000); // 2 second delay
        }
    }
    // Updates the display of a card based on its state
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
    // Checks if the flipped cards match, updates the game state accordingly
    checkMatch() {
        const allMatch = this.flippedCards.every(card => card.value === this.flippedCards[0].value
            && card.shape === this.flippedCards[0].shape
            && card.color === this.flippedCards[0].color);
        if (allMatch) {
            this.flippedCards.forEach(card => {
                card.isMatched = true;
                this.updateCardDisplay(card, true);
            });
            if (this.isMultiSelectMode) {
                this.moves--;
                if (this.moves < 0) {
                    this.moves = 0;
                }
            }
            else {
                this.moves++;
            }
        }
        else {
            this.flippedCards.forEach(card => {
                card.isFlipped = false;
                this.updateCardDisplay(card, false);
            });
            this.moves++;
        }
        this.flippedCards = [];
        if (this.moveCounter) {
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
        this.checkWinCondition();
    }
    // Checks if all cards have been matched, then shows a celebration and leaderboard
    checkWinCondition() {
        if (this.cards.every(card => card.isMatched)) {
            if (this.timerInterval !== null) {
                clearInterval(this.timerInterval);
            }
            this.showCelebration();
            setTimeout(() => {
                this.showLeaderboard();
            }, 10000); // 10-second delay to match the confetti duration
        }
    }
    // Creates the leaderboard UI and sets up related event handlers
    createLeaderboard() {
        this.leaderboardOverlay = document.createElement("div");
        this.leaderboardOverlay.classList.add("overlay");
        this.leaderboardOverlay.style.display = "none"; // hide it initially
        this.leaderboardContainer = document.createElement("div");
        this.leaderboardContainer.classList.add("leaderboard-container");
        const title = document.createElement("h2");
        title.textContent = `Leaderboard`;
        this.leaderboardContainer.appendChild(title);
        const form = document.createElement("form");
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Enter your name";
        nameInput.required = true;
        form.appendChild(nameInput);
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Add to Leaderboard";
        form.appendChild(submitButton);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const playerName = nameInput.value.trim();
            if (playerName) {
                let time = this.timer;
                if (this.isCountdownMode) {
                    time = (this.countdown_time + (this.extraTimeUsed ? this.extraTime : 0)) - this.timer;
                }
                this.saveToLeaderboard(playerName, this.moves, time);
                nameInput.value = "";
            }
        });
        this.leaderboardContainer.appendChild(form);
        const scoreList = document.createElement("ul");
        scoreList.classList.add("score-list");
        this.leaderboardContainer.appendChild(scoreList);
        // reset leaderboard button
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset Leaderboard";
        resetButton.addEventListener('click', () => {
            this.resetLeaderboard();
        });
        this.leaderboardContainer.appendChild(resetButton);
        // add a restart game button
        const restartButton = document.createElement("button");
        restartButton.textContent = "Restart Game";
        restartButton.addEventListener("click", () => {
            this.leaderboardOverlay.style.display = "none";
            if (this.gridSize < this.maxGridSize) {
                this.gridSize++;
            }
            this.startNewGame(this.isCountdownMode);
        });
        this.leaderboardContainer.appendChild(restartButton);
        this.leaderboardOverlay.appendChild(this.leaderboardContainer);
        document.body.appendChild(this.leaderboardOverlay);
    }
    // Resets the leaderboard data in local storage
    resetLeaderboard() {
        localStorage.removeItem("leaderboard");
        if (this.leaderboardContainer) {
            const scoreList = this.leaderboardContainer.querySelector("ul");
            if (scoreList) {
                scoreList.innerHTML = "";
            }
        }
    }
    // Displays the leaderboard with the current scores
    showLeaderboard() {
        if (!this.leaderboardContainer) {
            console.error("Leaderboard container is not initialized!");
            return;
        }
        this.updateLeaderboardDisplay();
        if (this.leaderboardOverlay) {
            this.leaderboardOverlay.style.display = "flex";
        }
    }
    // Saves a player's score to the leaderboard
    saveToLeaderboard(name, moves, time) {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        leaderboard.push({
            name,
            moves,
            time,
            level: `${this.gridSize}x${this.gridSize}`
        });
        leaderboard.sort((a, b) => a.moves - b.moves || a.time - b.time);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        this.updateLeaderboardDisplay();
    }
    // Updates the leaderboard display with the saved scores
    updateLeaderboardDisplay() {
        if (!this.leaderboardContainer) {
            console.error("Leaderboard container is not initialized!");
            return;
        }
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        const scoreList = this.leaderboardContainer.querySelector(".score-list");
        if (scoreList) {
            scoreList.innerHTML = "";
            leaderboard.forEach((entry) => {
                const listItem = document.createElement("li");
                listItem.textContent = `${entry.name} - Moves: ${entry.moves}, Time: ${entry.time}s, Level: ${entry.level}`;
                scoreList.appendChild(listItem);
            });
        }
    }
    // Shows a celebration animation when the game is won
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
    // Starts a timer that counts up
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
    // Starts a countdown timer
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
        this.timer += this.extraTime;
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
    // Toggles multi-select mode, allowing three cards to be selected
    toggleMultiSelectMode() {
        if (!this.isMultiSelectMode) {
            this.isMultiSelectMode = true;
            this.maxSelectableCards = 3;
        }
        else {
            this.isMultiSelectMode = false;
            this.maxSelectableCards = 2;
        }
        const multiSelectToggle = document.getElementById("multi-select-toggle");
        if (multiSelectToggle) {
            multiSelectToggle.textContent = this.isMultiSelectMode
                ? "Normal Mode"
                : "Multi-Select Mode";
        }
        this.startNewGame(this.isCountdownMode);
    }
}
// Initialize the game when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
//# sourceMappingURL=game.js.map