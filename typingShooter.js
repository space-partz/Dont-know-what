const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const words = ['cat', 'dog', 'bat', 'rat', 'hat', 'mat', 'sat', 'pat', 'fat', 'vat'];
let fallingWords = [];
let typedWords = [];
let score = 0;
let level = 1;
let gameOver = false;
let startTime = Date.now();

const wordSpeed = 1;
const wordInterval = 2000;
let nextWordTime = Date.now() + wordInterval;

function getRandomWord() {
    const wordLength = Math.min(3 + Math.floor(score / 10), 8);
    const word = words[Math.floor(Math.random() * words.length)];
    return word.length <= wordLength ? word : getRandomWord();
}

function drawWord(word) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(word.text, word.x, word.y);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function drawLevel() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Level: ' + level, canvas.width - 100, 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fallingWords.forEach(drawWord);
    drawScore();
    drawLevel();
}

function update() {
    if (gameOver) return;

    const currentTime = Date.now();
    if (currentTime >= nextWordTime) {
        const word = {
            text: getRandomWord(),
            x: Math.random() * (canvas.width - 50),
            y: 0
        };
        fallingWords.push(word);
        nextWordTime = currentTime + wordInterval / level;
    }

    fallingWords.forEach(word => {
        word.y += wordSpeed * level;
        if (word.y > canvas.height) {
            endGame();
        }
    });

    draw();
    requestAnimationFrame(update);
}

function endGame() {
    gameOver = true;
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const report = `
        <h1>Game Over</h1>
        <p>Score: ${score}</p>
        <p>Level: ${level}</p>
        <p>Time: ${elapsedTime} seconds</p>
        <p>Words Typed: ${typedWords.join(', ')}</p>
        <button onclick="restartGame()">Restart</button>
    `;
    document.getElementById('report').innerHTML = report;
    document.getElementById('report').style.display = 'block';
    document.getElementById('gameCanvas').style.display = 'none';
}

function restartGame() {
    fallingWords = [];
    typedWords = [];
    score = 0;
    level = 1;
    gameOver = false;
    startTime = Date.now();
    nextWordTime = Date.now() + wordInterval;
    document.getElementById('report').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    update();
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    const key = e.key.toLowerCase();
    fallingWords.forEach((word, index) => {
        if (word.text.startsWith(key)) {
            word.text = word.text.slice(1);
            if (word.text.length === 0) {
                fallingWords.splice(index, 1);
                typedWords.push(word.text);
                score++;
                if (score % 10 === 0) {
                    level++;
                }
            }
        }
    });
});

update();