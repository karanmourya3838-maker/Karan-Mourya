// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Game Settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game State
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

// Initialize
highScoreDisplay.textContent = highScore;

// Event Listeners
document.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
                e.preventDefault();
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
                e.preventDefault();
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
                e.preventDefault();
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
                e.preventDefault();
            }
            break;
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        startBtn.textContent = 'Restart';
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'Pause';
        gameLoop();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
        if (!gamePaused) {
            gameLoop();
        }
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    score = 0;
    scoreDisplay.textContent = score;
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    gameRunning = false;
    gamePaused = false;
    startBtn.textContent = 'Start Game';
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    generateFood();
    draw();
}

function generateFood() {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        validPosition = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    
    food = newFood;
}

function gameLoop() {
    if (!gamePaused && gameRunning) {
        update();
        draw();
    }
    
    if (gameRunning && !gamePaused) {
        setTimeout(gameLoop, 100);
    }
}

function update() {
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional, for visibility)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
            ctx.shadowColor = 'transparent';
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    
    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
}

function endGame() {
    gameRunning = false;
    pauseBtn.disabled = true;
    
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
        alert(`🎉 New High Score! ${score} points!`);
    } else {
        alert(`Game Over! Score: ${score}`);
    }
}

// Initial draw
resetGame();
