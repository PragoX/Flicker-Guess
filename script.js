// DOM Elements
const gameScreen = document.getElementById('game');
const endScreen = document.getElementById('endScreen');
const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const streakDisplay = document.getElementById('streak');
const resultDisplay = document.getElementById('result');
const correctCountDisplay = document.getElementById('correctCount');
const wrongCountDisplay = document.getElementById('wrongCount');
const accuracyDisplay = document.getElementById('accuracy');
const finalScoreDisplay = document.getElementById('finalScore');
const highestStreakDisplay = document.getElementById('highestStreak');
const totalCorrectDisplay = document.getElementById('totalCorrect');
const totalWrongDisplay = document.getElementById('totalWrong');
const scoreForm = document.getElementById('scoreForm');
const viewRankingsButton = document.getElementById('viewRankings');
const rankingsScreen = document.getElementById('rankings');
const rankingsBody = document.getElementById('rankingsBody');
const playAgainButton = document.getElementById('playAgain');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const modeButtons = document.querySelectorAll('.mode-btn');

// Google Apps Script Web App URL (replace with your own)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwhgeSuKggXcHeZ3-4y8f-XCIOVtTbfbOPAKemn2B0w7mUeIJRQGsRCNVhct4Ii6Vxp/exec";

// Game Variables
let tiles = [];
let pattern = [];
let playerGuess = [];
let score = 0;
let timeLeft = 60;
let streak = 0;
let highestStreak = 0;
let correctCount = 0;
let wrongCount = 0;
let gameActive = false;
let gridSize = 16; // Default to 4x4 (easy)
let difficulty = 'easy';
let gameMode = 'standard';
let timerInterval;

// Create Play Button
function createPlayButton() {
    grid.style.display = "none";
    const playButton = document.createElement("button");
    playButton.id = "playButton";
    playButton.className = "game-btn";
    playButton.innerHTML = '<span class="btn-effect"></span><span class="btn-text">PLAY GAME</span>';
    playButton.style.padding = "";
    playButton.style.fontSize = "";
    playButton.style.marginTop = "2vh";
    playButton.addEventListener("click", () => {
        grid.style.display = "grid";
        console.log("Grid display set to grid"); // Debug log
        playButton.remove();
        startGame();
    });
    document.querySelector(".difficulty-selector").after(playButton);
}

// Start the Game
function startGame() {
    gameActive = true;
    score = 0;
    streak = 0;
    correctCount = 0;
    wrongCount = 0;
    timeLeft = gameMode === 'timed' ? 30 : 60;
    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;
    correctCountDisplay.textContent = correctCount;
    wrongCountDisplay.textContent = wrongCount;
    accuracyDisplay.textContent = "0%";
    timerDisplay.textContent = timeLeft;

    difficultyButtons.forEach(btn => {
        btn.style.opacity = "0.5";
        btn.style.pointerEvents = "none";
    });

    createGrid();
    nextRound();

    if (gameMode === 'timed') {
        timerInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(timerInterval);
                return;
            }
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }
}

// Create Grid
function createGrid() {
    grid.innerHTML = '';
    tiles = [];
    grid.style.gridTemplateColumns = `repeat(${Math.sqrt(gridSize)}, 1fr)`;
    for (let i = 0; i < gridSize; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.index = i;
        tile.addEventListener('click', () => handleTileClick(i));
        grid.appendChild(tile);
        tiles.push(tile);
    }
    console.log("Grid created with", gridSize, "tiles"); // Debug log
}

// Next Round
function nextRound() {
    resultDisplay.textContent = "";
    playerGuess = [];
    tiles.forEach(tile => {
        tile.classList.remove('active', 'selected');
    });
    generatePattern();
    showPattern();
}

// Generate Pattern
function generatePattern() {
    pattern = [];
    let patternSize;
    switch (difficulty) {
        case 'easy': patternSize = Math.min(3 + Math.floor(streak / 2), 10); break;
        case 'medium': patternSize = Math.min(4 + Math.floor(streak / 2), 12); break;
        case 'hard': patternSize = Math.min(5 + Math.floor(streak / 2), 15); break;
        case 'impossible': patternSize = Math.min(6 + Math.floor(streak / 2), 18); break;
    }
    while (pattern.length < patternSize) {
        const randomIndex = Math.floor(Math.random() * gridSize);
        if (!pattern.includes(randomIndex)) pattern.push(randomIndex);
    }
}

// Show Pattern
function showPattern() {
    const displayDuration = Math.max(1000 - (streak * 50), 400);
    pattern.forEach(index => tiles[index].classList.add('active'));
    setTimeout(() => {
        pattern.forEach(index => tiles[index].classList.remove('active'));
        gameActive = true;
    }, displayDuration);
}

// Handle Tile Click
function handleTileClick(index) {
    if (!gameActive || tiles[index].classList.contains('selected')) return;
    tiles[index].classList.add('selected');
    playerGuess.push(index);
    if (playerGuess.length === pattern.length) checkGuess();
}

// Check Guess
function checkGuess() {
    gameActive = false;
    const correct = pattern.every(index => playerGuess.includes(index));
    if (correct) {
        score += 30;
        streak++;
        correctCount++;
        if (streak > highestStreak) highestStreak = streak;
        scoreDisplay.textContent = score;
        streakDisplay.textContent = streak;
        correctCountDisplay.textContent = correctCount;
        resultDisplay.textContent = "Correct!";
        resultDisplay.style.color = "#00ff00";
        grid.classList.add("celebrate");
        setTimeout(() => {
            grid.classList.remove("celebrate");
            nextRound();
        }, 500);
    } else {
        wrongCount++;
        streak = 0;
        streakDisplay.textContent = streak;
        wrongCountDisplay.textContent = wrongCount;
        resultDisplay.textContent = "Wrong!";
        resultDisplay.style.color = "#ff0000";
        grid.classList.add("shake");
        setTimeout(() => {
            grid.classList.remove("shake");
            endGame();
        }, 500);
    }
    const totalAttempts = correctCount + wrongCount;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    accuracyDisplay.textContent = `${accuracy}%`;
}

// End Game
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    finalScoreDisplay.textContent = score;
    highestStreakDisplay.textContent = highestStreak;
    totalCorrectDisplay.textContent = correctCount;
    totalWrongDisplay.textContent = wrongCount;
    gameScreen.style.display = "none";
    endScreen.style.display = "flex";
}

// Save Score to Google Sheets
function saveScore(name, email, score) {
    const data = { name, email, score, difficulty };
    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(() => console.log("Score saved successfully"))
        .catch(error => console.error("Error saving score:", error));
}

// Show Rankings
function showRankings() {
    fetch(WEB_APP_URL, {
        method: "GET",
        mode: "cors"
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                rankingsBody.innerHTML = "";
                data.rankings.forEach(entry => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${entry.rank}</td><td>${entry.name}</td><td>${entry.score}</td>`;
                    rankingsBody.appendChild(row);
                });
                viewRankingsButton.style.display = "none";
                rankingsScreen.style.display = "block";
            }
        })
        .catch(error => console.error("Error fetching rankings:", error));
}

// Event Listeners
scoreForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const playerName = document.getElementById("playerName").value;
    const playerEmail = document.getElementById("playerEmail").value;
    saveScore(playerName, playerEmail, score);
    scoreForm.style.display = "none";
    viewRankingsButton.style.display = "block";
});

viewRankingsButton.addEventListener("click", showRankings);

playAgainButton.addEventListener("click", () => {
    score = 0;
    timeLeft = gameMode === 'timed' ? 30 : 60;
    streak = 0;
    correctCount = 0;
    wrongCount = 0;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    streakDisplay.textContent = streak;
    correctCountDisplay.textContent = correctCount;
    wrongCountDisplay.textContent = wrongCount;
    accuracyDisplay.textContent = "0%";
    difficultyButtons.forEach(btn => {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
    });
    rankingsScreen.style.display = "none";
    endScreen.style.display = "none";
    scoreForm.style.display = "block";
    viewRankingsButton.style.display = "none";
    gameScreen.style.display = "block";
    createPlayButton();
});

difficultyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (gameActive) return;
        difficulty = btn.dataset.difficulty;
        gridSize = { easy: 16, medium: 25, hard: 36, impossible: 49 }[difficulty];
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        gameMode = btn.dataset.mode;
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    difficultyButtons[0].classList.add('active');
    modeButtons[0].classList.add('active');
    createPlayButton();
});
