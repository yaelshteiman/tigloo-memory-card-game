# Memory Card Game

A strategic memory card game built using pure Typescript, with a few added twists for gameplay depth. <br>

## Table of Contents

- [SetUp Instructions](#setup-instructions)
- [Explanation of Technical Decisions](#explanation-of-technical-decisions)
- [Assumptions](#assumptions)
- [Implemented Features](#implemented-features)
- [Future Improvements](#future-improvements)

---

## SetUp Instructions

### Steps to Run the Project:
1. **Clone the repository**
2. **Compile TypeScript to JavaScript:**
   * To compile TypeScript code, run:
   ```sh
   npx tsc
   ```
   * This will generate the JavaScript code in the dist directory.
3. **Start a local server:**
   * To serve your project locally, you can use a simple HTTP server like `http-server`:
   ```sh
   npx http-server .
   ```
   * This will host the project, and you can open it in your browser at
   ```sh
   http://localhost:8080
   ```

### Explanation of Technical Decisions
1. **DOM Manipulation:** Instead of using a frontend framework.
2. **CSS for Styling:** Basic CSS was used for styling the game interface, focusing on responsiveness and ease of use.
3. **Local Storage:** I used `localStorage` to save and retrieve the game state, allowing players to resume from where they left off.
4. **Error Handling:** Implemented extensive error handling using `console.error` to capture and debug issues efficiently.

### Assumptions
1. **Assumptions:**
   * The game starts with 4x4 grid, but it can increase in size with each restart - only after winning.
   * All the cards have shapes and color from the beginning of the game.
   * The cards should be equal in value, color and shape to be matched.
   * After clicking on the cards, there will be a 2-second delay to ensure the user has finished selecting all the cards.
   * The maximum grid size is 6x6, but it can easily be changed.
   * When the grid size is odd and the multi-select mode is OFF, there will be an even number of pairs (one card will be missing).
   * When the multi-select mode is ON, a random number of pairs and trios is chosen.
   * The countdown mode is set to 120 seconds which are 2 minutes. This number can be changed easily.
   * In the leaderboard, the user can reset the board.
   * After a win, the leaderboard appears, and the game will restart only when the user clicks the button `Restart Game`.
   * The leaderboard is sorted by the moves and then by time.
2. **Performance vs. Simplicity:** <br>
   I prioritized simplicity and readability over optimizing every aspect of performance, given the nature of the project.

### Implemented Features
1. **Core Gameplay:**
   * 4x4 grid of cards with options to increase grid size.
   * Click to flip cards and match pairs.
2. **Timer and Move Counter:**
   * A timer that counts up in regular mode and counts down in countdown mode.
   * A move counter to track the number of moves made.
3. **Power-Ups:**
   * **Peek Power-Up:** Temporarily reveal all cards.
   * **Extra Time Power-Up:** Adds extra time in countdown mode (one-time use).
   * **Shuffle Power-Up:** Shuffles unmatched cards.
   * **Multi-Select Mode:** Allows selecting three cards at a time.
4. **Leaderboard:**
   * Save and display the top scores, with an option to reset the leaderboard.

### Future Improvements
1. **Animations:** Enhance the card flip animation to make it smoother and more engaging.
2. **Responsive Design:** Further optimize the game interface for mobile and tablet screens.
3. **Sound Effects:** Add audio feedback for card flips, matches, and power-up usage.
4. **Unit Tests:** Add test coverage to include edge cases and user interactions.
5. **Accessibility:** Include keyboard controls.
6. **Dynamic Grid Size:** Provide an option for players to choose grid size at the start of the game.
7. **Dark Mode:** Implement a dark mode bor better user experience in low-light conditions.
8. **Colors and Shapes:** Adding more colors and shapes to make it more challenging.