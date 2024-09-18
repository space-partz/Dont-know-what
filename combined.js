// Combined JavaScript file for all games

// Shared utility functions
function loadGame(gameName) {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameControls').style.display = 'block';
    currentGame = games[gameName];
    currentGame.init();
}

function goToArcade() {
    if (currentGame) {
        currentGame.stop();
    }
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('gameControls').style.display = 'none';
    document.getElementById('report').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

function restartGame() {
    if (currentGame) {
        currentGame.restart();
    }
}

function pauseGame() {
    if (currentGame) {
        currentGame.togglePause();
    }
}

// Game modules
const games = {
    shooter: {
        player: null,
        bullets: [],
        enemies: [],
        particles: [],
        score: 0,
        targetScore: 900,
        gameTime: 3 * 60 * 1000,
        startTime: null,
        countdownTime: 10 * 1000,
        countdownActive: false,
        countdownStartTime: null,
        gameOver: false,
        paused: false,

        init: function() {
            this.player = {
                x: canvas.width / 2,
                y: canvas.height / 2,
                width: 20,
                height: 20,
                speed: 5,
                dx: 0,
                dy: 0
            };
            this.bullets = [];
            this.enemies = [];
            this.particles = [];
            this.score = 0;
            this.startTime = Date.now();
            this.gameOver = false;
            this.paused = false;
            this.countdownActive = false;
            
            document.addEventListener('keydown', this.keyDown.bind(this));
            document.addEventListener('keyup', this.keyUp.bind(this));
            
            setInterval(this.spawnEnemy.bind(this), 1000);
            this.update();
        },

        stop: function() {
            // Clean up event listeners and intervals
            document.removeEventListener('keydown', this.keyDown);
            document.removeEventListener('keyup', this.keyUp);
        },

        restart: function() {
            this.init();
        },

        togglePause: function() {
            this.paused = !this.paused;
            if (!this.paused) {
                this.update();
            }
        },

        update: function() {
            if (this.gameOver || this.paused) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawPlayer();
            this.updateBullets();
            this.updateEnemies();
            this.updateParticles();
            this.checkCollisions();
            this.drawScore();
            if (this.countdownActive) {
                this.drawCountdown();
            } else {
                this.drawTimer();
            }
            this.newPos();
            requestAnimationFrame(this.update.bind(this));
        },

        drawPlayer: function() {
            ctx.fillStyle = 'green';
            ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        },

        updateBullets: function() {
            this.bullets.forEach((bullet, index) => {
                bullet.y -= bullet.speed;
                ctx.fillStyle = 'yellow';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                if (bullet.y < 0) {
                    this.bullets.splice(index, 1);
                }
            });
        },

        updateEnemies: function() {
            this.enemies.forEach((enemy, index) => {
                enemy.y += enemy.speed;
                ctx.fillStyle = 'red';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                if (enemy.y > canvas.height) {
                    this.enemies.splice(index, 1);
                }
            });
        },

        updateParticles: function() {
            this.particles.forEach((particle, index) => {
                particle.x += particle.dx;
                particle.y += particle.dy;
                particle.life -= 1;
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
                if (particle.life <= 0) {
                    this.particles.splice(index, 1);
                }
            });
        },

        checkCollisions: function() {
            this.bullets.forEach((bullet, bulletIndex) => {
                this.enemies.forEach((enemy, enemyIndex) => {
                    if (
                        bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y
                    ) {
                        this.bullets.splice(bulletIndex, 1);
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        if (this.score >= this.targetScore) {
                            this.endGame(true);
                        }
                    }
                });
            });
        },

        drawScore: function() {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Score: ' + this.score, 10, 20);
        },

        drawTimer: function() {
            const elapsedTime = Date.now() - this.startTime;
            const remainingTime = Math.max(this.gameTime - elapsedTime, 0);
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Time: ' + timeString, canvas.width - 100, 20);

            if (remainingTime <= 0 && !this.countdownActive) {
                this.startCountdown();
            }
        },

        drawCountdown: function() {
            const elapsedTime = Date.now() - this.countdownStartTime;
            const remainingTime = Math.max(this.countdownTime - elapsedTime, 0);
            const seconds = Math.floor(remainingTime / 1000);
            const timeString = `0:${seconds < 10 ? '0' : ''}${seconds}`;

            ctx.fillStyle = 'red';
            ctx.font = '30px Arial';
            ctx.fillText('Continue? ' + timeString, canvas.width / 2 - 100, canvas.height / 2);

            if (remainingTime <= 0) {
                this.endGame(false);
            }
        },

        newPos: function() {
            this.player.x += this.player.dx;
            this.player.y += this.player.dy;

            // Boundary checks
            if (this.player.x < 0) {
                this.player.x = 0;
            }
            if (this.player.x + this.player.width > canvas.width) {
                this.player.x = canvas.width - this.player.width;
            }
            if (this.player.y < 0) {
                this.player.y = 0;
            }
            if (this.player.y + this.player.height > canvas.height) {
                this.player.y = canvas.height - this.player.height;
            }
        },

        spawnEnemy: function() {
            if (this.gameOver || this.paused) return;
            const enemy = {
                x: Math.random() * (canvas.width - 20),
                y: 0,
                width: 20,
                height: 20,
                speed: 2
            };
            this.enemies.push(enemy);
        },

        createExplosion: function(x, y) {
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: x,
                    y: y,
                    size: Math.random() * 5 + 2,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                    life: 20,
                    color: 'orange'
                });
            }
        },

        keyDown: function(e) {
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                this.player.dx = this.player.speed;
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                this.player.dx = -this.player.speed;
            } else if (e.key === 'ArrowUp' || e.key === 'Up') {
                this.player.dy = -this.player.speed;
            } else if (e.key === 'ArrowDown' || e.key === 'Down') {
                this.player.dy = this.player.speed;
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                this.shoot();
            } else if (this.countdownActive && (e.key === 'Enter' || e.key === ' ')) {
                this.continueGame();
            }
        },

        keyUp: function(e) {
            if (
                e.key === 'ArrowRight' ||
                e.key === 'Right' ||
                e.key === 'ArrowLeft' ||
                e.key === 'Left' ||
                e.key === 'ArrowUp' ||
                e.key === 'Up' ||
                e.key === 'ArrowDown' ||
                e.key === 'Down'
            ) {
                this.player.dx = 0;
                this.player.dy = 0;
            }
        },

        shoot: function() {
            const bullet = {
                x: this.player.x + this.player.width / 2 - 2.5,
                y: this.player.y,
                width: 5,
                height: 10,
                speed: 7
            };
            this.bullets.push(bullet);
        },

        startCountdown: function() {
            this.countdownActive = true;
            this.countdownStartTime = Date.now();
        },

        continueGame: function() {
            this.countdownActive = false;
            this.startTime = Date.now();
        },

        endGame: function(win) {
            this.gameOver = true;
            if (win) {
                alert('YOU WIN, CONGRATULATIONS!');
            } else {
                alert('GAME OVER');
            }
            goToArcade();
        }
    },

    brickBreaker: {
        // Implement Brick Breaker game logic here
        init: function() {
            // Initialize Brick Breaker game
        },
        stop: function() {
            // Clean up Brick Breaker game
        },
        restart: function() {
            // Restart Brick Breaker game
        },
        togglePause: function() {
            // Toggle pause for Brick Breaker game
        }
    },

    typingShooter: {
        words: ['cat', 'dog', 'bat', 'rat', 'hat', 'mat', 'sat', 'pat', 'fat', 'vat'],
        fallingWords: [],
        typedWords: [],
        score: 0,
        level: 1,
        gameOver: false,
        paused: false,
        startTime: null,
        wordSpeed: 1,
        wordInterval: 2000,
        nextWordTime: null,

        init: function() {
            this.fallingWords = [];
            this.typedWords = [];
            this.score = 0;
            this.level = 1;
            this.gameOver = false;
            this.paused = false;
            this.startTime = Date.now();
            this.nextWordTime = Date.now() + this.wordInterval;

            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            this.update();
        },

        stop: function() {
            document.removeEventListener('keydown', this.handleKeyDown);
        },

        restart: function() {
            this.init();
        },

        togglePause: function() {
            this.paused = !this.paused;
            if (!this.paused) {
                this.update();
            }
        },

        getRandomWord: function() {
            const wordLength = Math.min(3 + Math.floor(this.score / 10), 8);
            const word = this.words[Math.floor(Math.random() * this.words.length)];
            return word.length <= wordLength ? word : this.getRandomWord();
        },

        drawWord: function(word) {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(word.text, word.x, word.y);
        },

        drawScore: function() {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Score: ' + this.score, 10, 20);
        },

        drawLevel: function() {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Level: ' + this.level, canvas.width - 100, 20);
        },

        draw: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.fallingWords.forEach(this.drawWord);
            this.drawScore();
            this.drawLevel();
        },

        update: function() {
            if (this.gameOver || this.paused) return;

            const currentTime = Date.now();
            if (currentTime >= this.nextWordTime) {
                const word = {
                    text: this.getRandomWord(),
                    x: Math.random() * (canvas.width - 50),
                    y: 0
                };
                this.fallingWords.push(word);
                this.nextWordTime = currentTime + this.wordInterval / this.level;
            }

            this.fallingWords.forEach(word => {
                word.y += this.wordSpeed * this.level;
                if (word.y > canvas.height) {
                    this.endGame();
                }
            });

            this.draw();
            requestAnimationFrame(this.update.bind(this));
        },

        endGame: function() {
            this.gameOver = true;
            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            const report = `
                <h1>Game Over</h1>
                <p>Score: ${this.score}</p>
                <p>Level: ${this.level}</p>
                <p>Time: ${elapsedTime} seconds</p>
                <p>Words Typed: ${this.typedWords.join(', ')}</p>
            `;
            document.getElementById('report').innerHTML = report;
            document.getElementById('report').style.display = 'block';
            document.getElementById('gameCanvas').style.display = 'none';
            document.getElementById('gameControls').style.display = 'none';
        },

        handleKeyDown: function(e) {
            if (this.gameOver || this.paused) return;

            const key = e.key.toLowerCase();
            this.fallingWords.forEach((word, index) => {
                if (word.text.startsWith(key)) {
                    word.text = word.text.slice(1);
                    if (word.text.length === 0) {
                        this.fallingWords.splice(index, 1);
                        this.typedWords.push(word.text);
                        this.score++;
                        if (this.score % 10 === 0) {
                            this.level++;
                        }
                    }
                }
            });
        }
    }
};

let currentGame = null;

// Initialize the arcade
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
});