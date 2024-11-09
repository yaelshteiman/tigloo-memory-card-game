type Card = {
    id: number,
    value: string,
    isFlipped: boolean,
    isMatched: boolean
};

class MemoryGame{
    private gridSize : number = 4;
    private cards: Card[] = [];
    private flippedCards: Card[] = [];
    private moves: number = 0;
    private timer: number = 0;
    private moveCounter: HTMLElement | null = null;
    private timerDisplay: HTMLElement | null = null;
    private gameGrid: HTMLElement | null = null;
    private timerInterval: number | undefined = undefined; //used for setInterval
    private isCountdownMode: boolean = false;

    constructor() {
        this.init();
    }

    init(){
        this.gameGrid = document.getElementById("game-grid");
        this.moveCounter = document.getElementById("moves");
        this.timerDisplay = document.getElementById("timer");

        const startRegularButton = document.getElementById("start-regular-game");
        const startCountdownButton = document.getElementById("start-countdown-game");

        if (startRegularButton){
            startRegularButton.addEventListener('click', () => this.startNewGame(false));
        }
        if (startCountdownButton){
            startCountdownButton.addEventListener('click', () => this.startNewGame(true));
        }
    }

    startNewGame(isCountdown: boolean){
        this.isCountdownMode = isCountdown;
        this.resetGame();
        this.generateCards();
        this.renderCards();
        this.startTimer();
        if(this.isCountdownMode){
            this.startCountdown();
        } else {
            this.startRegularTimer();
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
        }
    }

    generateCards(){
        const totalCards = this.gridSize * this.gridSize;
        const values = Array.from({ length: totalCards / 2 }, (_, i) => i.toString());
        const allValues = [...values, ...values].sort(() => Math.random() - 0.5);
        this.cards = allValues.map((value, index) => ({
            id: index,
            value,
            isFlipped: false,
            isMatched: false,
        }));
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
            cardFront.classList.add("card-front");
            cardFront.textContent = card.value;

            const cardBack = document.createElement("div");
            cardBack.classList.add("card-back");
            cardBack.textContent = "";

            cardElement.appendChild(cardInner);
            cardInner.appendChild(cardFront)
            cardInner.appendChild(cardBack);

            cardElement.addEventListener('click', () => this.handleCardClick(card));

            if(this.gameGrid){
                this.gameGrid.appendChild(cardElement);
            }
        })
    }




}

window.addEventListener('DOMContentLoaded', () => new MemoryGame());