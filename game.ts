type Card = {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
    color: string;
    shape: string;
};

interface LeaderboardEntry {
    name: string;
    moves: number;
    time: number;
    level: string;
}

class MemoryGame{
    private gridSize : number = 4;
    private maxGridSize: number = 6;
    private cards: Card[] = [];
    private flippedCards: Card[] = [];
    private moves: number = 0;
    private timer: number = 0;
    private moveCounter: HTMLElement | null = null;
    private timerDisplay: HTMLElement | null = null;
    private gameGrid: HTMLElement | null = null;
    private leaderboardOverlay: HTMLElement | null = null;
    private leaderboardContainer: HTMLElement | null = null;
    private timerInterval: number | undefined = undefined; //used for setInterval
    private isCountdownMode: boolean = false;
    private extraTimeUsed: boolean = false;
    private isMultiSelectMode: boolean = false;
    private maxSelectableCards: number = 2;

    constructor() {
        this.init();
    }

    init(){
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

        if (startRegularButton){
            startRegularButton.addEventListener('click', () => this.startNewGame(false));
        }
        if (startCountdownButton){
            startCountdownButton.addEventListener('click', () => this.startNewGame(true));
        }
        if (peekButton){
            peekButton.addEventListener('click', () => this.peekPowerUp());
        }
        if (extraTimeButton){
            extraTimeButton.addEventListener('click', () => this.extraTimePowerUp());
        }
        if (shuffleButton){
            shuffleButton.addEventListener('click', () => this.shufflePowerUp());
        }
        if(multiSelectToggle){
            multiSelectToggle.addEventListener('click', () => this.toggleMultiSelectMode());
        }
    }

    startNewGame(isCountdown: boolean){
        this.isCountdownMode = isCountdown;
        this.resetGame();
        this.generateCards();
        this.renderCards();
        if(this.isCountdownMode){
            this.startCountdown();
        } else {
            this.startTimer();
        }
    }

    resetGame(){
        this.cards = []
        this.flippedCards = []
        this.moves = 0
        if (this.isCountdownMode){
            this.timer = 120;
        } else {
            this.timer = 0;
        }

        if (this.timerInterval !== null){
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
        }
        if(this.moveCounter){
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
        if (this.timerDisplay){
            this.timerDisplay.textContent = `Time: ${this.timer}`;
        }
        if (this.gameGrid) {
            this.gameGrid.innerHTML = ''
            this.gameGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`; // Adjust grid layout
            this.gameGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;   // Adjust grid layout

        }
    }

    generateCards(){
        const totalCards = this.gridSize * this.gridSize;
        const values = Array.from({ length: totalCards / 2 }, (_, i) => i.toString());
        // const allValues = [...values, ...values].sort(() => Math.random() - 0.5);
        const colors = ["blue", "red", "green"];
        const shapes = ["circle", "square"];
        const allCards: Card[] = [];
        let idCounter = 0;
        values.forEach(value => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            allCards.push(
                { id: idCounter++, value, isFlipped: false, isMatched: false, color, shape },
                { id: idCounter++, value, isFlipped: false, isMatched: false, color, shape },
            );
        });

        this.cards = allCards.sort(() => Math.random() - 0.5);
    }

    //display the cards on the grid + setup click events for each card
    renderCards(){
        if (!this.gameGrid) return;
        this.gameGrid.innerText = '';

        this.cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.dataset.id = card.id.toString()

            const cardInner = document.createElement("div");
            cardInner.classList.add("card-inner");


            const cardFront = document.createElement("div");
            cardFront.classList.add("card-front", card.color, card.shape);
            cardFront.textContent = card.value;


            const cardBack = document.createElement("div");
            cardBack.classList.add("card-back");
            cardBack.textContent = "";


            cardElement.appendChild(cardInner);
            cardInner.appendChild(cardFront)
            cardInner.appendChild(cardBack);

            if (!card.isMatched){
                cardElement.addEventListener('click', () => this.handleCardClick(card));
            }

            if(this.gameGrid){
                this.gameGrid.appendChild(cardElement);
            }
        });
    }

    handleCardClick(card: Card){
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= this.maxSelectableCards){
            return;
        }

        card.isFlipped = true;
        this.updateCardDisplay(card);
        this.flippedCards.push(card);

        if (this.flippedCards.length === this.maxSelectableCards || this.flippedCards.length === 2){
            setTimeout(() => this.checkMatch(), 3000);
        }
    }

    updateCardDisplay(card: Card, flipped: boolean = true){
        const cardElement = document.querySelector(`[data-id="${card.id}"]`);
        if (cardElement){
            if (card.isMatched){
                cardElement.classList.add("matched");
            } else if (flipped){
                cardElement.classList.add("flipped");
            } else {
                cardElement.classList.remove("flipped");
            }
        }
    }

    checkMatch(){
        const allMatch = this.flippedCards.every(
            card => card.value === this.flippedCards[0].value
        );
        if (allMatch){
            this.flippedCards.forEach(card => {
                card.isMatched = true;
                this.updateCardDisplay(card, true);
            });
            if (this.isMultiSelectMode){
                this.moves -= 1;
            } else {
                this.moves++;
            }
        } else {
            this.flippedCards.forEach(card => {
                card.isFlipped = false;
                this.updateCardDisplay(card, false);
            });
            this.moves++;
        }

        this.flippedCards = []
        if (this.moveCounter){
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }
        this.checkWinCondition();
    }

    checkWinCondition(){
        if (this.cards.every(card => card.isMatched)){
            if (this.timerInterval !== null){
                clearInterval(this.timerInterval);
            }
            this.showCelebration();
            setTimeout(() => {
                this.showLeaderboard();
            }, 10000); // 10-second delay to match the confetti duration
        }
    }

    createLeaderboard(){
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
            if(playerName){
                this.saveToLeaderboard(playerName, this.moves, this.timer);
                nameInput.value = "";
            }
        });
        this.leaderboardContainer.appendChild(form);

        const scoreList = document.createElement("ul");
        scoreList.classList.add("score-list");
        this.leaderboardContainer.appendChild(scoreList);

        // add a restart game button
        const restartButton = document.createElement("button");
        restartButton.textContent = "Restart Game";
        restartButton.addEventListener("click", () => {
            this.leaderboardOverlay!.style.display = "none";
            if (this.gridSize <= this.maxGridSize) {
                this.gridSize++;
            }
            this.startNewGame(this.isCountdownMode);
        });
        this.leaderboardContainer.appendChild(restartButton);

        this.leaderboardOverlay.appendChild(this.leaderboardContainer);
        document.body.appendChild(this.leaderboardOverlay);
    }

    showLeaderboard(){
        if (!this.leaderboardContainer){
            console.error("Leaderboard container is not initialized!");
            return;
        }
        this.updateLeaderboardDisplay();

        if (this.leaderboardOverlay){
            this.leaderboardOverlay.style.display = "flex";
        }
    }

    saveToLeaderboard(name: string, moves: number, time: number){
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        leaderboard.push({
            name,
            moves,
            time,
            level: `${this.gridSize}x${this.gridSize}`
        });
        leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.moves - b.moves || a.time - b.time);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        this.updateLeaderboardDisplay();
    }

    updateLeaderboardDisplay(){
        if(!this.leaderboardContainer){
            console.error("Leaderboard container is not initialized!");
            return;
        }
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

        const scoreList = this.leaderboardContainer.querySelector(".score-list");
        if (scoreList){
            scoreList.innerHTML = "";

            leaderboard.forEach((entry: LeaderboardEntry) =>{
                const listItem = document.createElement("li");
                listItem.textContent = `${entry.name} - Moves: ${entry.moves}, Time: ${entry.time}s, Level: ${entry.level}`;
                scoreList.appendChild(listItem)
            })
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

    startTimer(){
        if (this.timerInterval !== null){
            clearInterval(this.timerInterval);
        }
        this.timer = 0
        if (this.timerDisplay){
            this.timerDisplay.textContent = `Time: ${this.timer}s`;
        }

        this.timerInterval = window.setInterval(()=>{
            this.timer++;
            if (this.timerDisplay){
                this.timerDisplay.textContent = `Time: ${this.timer}s`;
            }
        }, 1000);
    }

    startCountdown(){
        if (this.timerInterval !== null){
            clearInterval(this.timerInterval);
        }
        if(this.timerDisplay){
            this.timerDisplay.textContent = `Time: ${this.timer}s`;
        }
        this.timerInterval = window.setInterval(()=>{
            this.timer--;
            if(this.timerDisplay){
                this.timerDisplay.textContent = `Time: ${this.timer}s`;
            }
            if (this.timer <= 0){
                clearInterval(this.timerInterval);
                alert("Time's up! game over.");
                this.startNewGame(this.isCountdownMode);
            }
        }, 1000);
    }

    peekPowerUp(){
        this.cards.forEach(card => {
            if (!card.isMatched){
                card.isFlipped = true;
                this.updateCardDisplay(card, true);
            }
        });
        setTimeout(() => {
            this.cards.forEach(card => {
                if(!card.isMatched){
                    card.isFlipped = false;
                    this.updateCardDisplay(card, false);
                }
            })
        }, 1000);

        this.moves++;
        if (this.moveCounter){
            this.moveCounter.textContent = `Moves: ${this.moves}`;
        }

    }

    extraTimePowerUp(){
        if (this.extraTimeUsed){
            alert("Extra Time can only be used once per game!");
            return;
        }
        if (!this.isCountdownMode){
            alert("Extra Time is only available in countdown mode");
            return;
        }
        this.extraTimeUsed = true;
        this.timer += 30;
        if (this.timerDisplay){
            this.timerDisplay.textContent = `Time: ${this.timer}s`;
        }
    }

    shufflePowerUp(){
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
            if (card.isMatched){
                return card;
            } else {
                return unmatchedCards[unmatchedIndex++];
            }
        });

        this.renderCards();
    }

    toggleMultiSelectMode(){
        if(!this.isMultiSelectMode){
            this.isMultiSelectMode = true;
            this.maxSelectableCards = 3;
        } else {
            this.isMultiSelectMode = false;
            this.maxSelectableCards = 2;
        }

        const multiSelectToggle = document.getElementById("multi-select-toggle");
        if (multiSelectToggle){
            multiSelectToggle.textContent = this.isMultiSelectMode
                ? "Normal Mode"
                : "Multi-Select Mode";
        }
        this.startNewGame(this.isCountdownMode);
    }

}

window.addEventListener('DOMContentLoaded', ()=>{
    new MemoryGame();
});