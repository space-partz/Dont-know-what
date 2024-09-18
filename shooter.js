const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    speed: 5,
    dx: 0,
    dy: 0
};

const bullets = [];
const enemies = [];
const particles = [];
let score = 0;

const targetScore = 900;
const gameTime = 3 * 60 * 1000; // 3 minutes in milliseconds
let startTime = Date.now();
let countdownTime = 10 * 1000; // 10 seconds in milliseconds
let countdownActive = false;
let countdownStartTime = null;

function drawPlayer() {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullet(bullet) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawEnemy(enemy) {
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawParticle(particle) {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function drawTimer() {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(gameTime - elapsedTime, 0);
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Time: ' + timeString, canvas.width - 100, 20);

    if (remainingTime <= 0 && !countdownActive) {
        startCountdown();
    }
}

function drawCountdown() {
    const elapsedTime = Date.now() - countdownStartTime;
    const remainingTime = Math.max(countdownTime - elapsedTime, 0);
    const seconds = Math.floor(remainingTime / 1000);
    const timeString = `0:${seconds < 10 ? '0' : ''}${seconds}`;

    ctx.fillStyle = 'red';
    ctx.font = '30px Arial';
    ctx.fillText('Continue? ' + timeString, canvas.width / 2 - 100, canvas.height / 2);

    if (remainingTime <= 0) {
        endGame(false);
    }
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    player.x += player.dx;
    player.y += player.dy;

    // Boundary checks
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function update() {
    clear();
    drawPlayer();
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        drawBullet(bullet);
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        drawEnemy(enemy);
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
    particles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life -= 1;
        drawParticle(particle);
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    checkCollisions();
    drawScore();
    if (countdownActive) {
        drawCountdown();
    } else {
        drawTimer();
    }
    newPos();
    requestAnimationFrame(update);
}

function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function shoot() {
    const bullet = {
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7
    };
    bullets.push(bullet);
}

function spawnEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 20),
        y: 0,
        width: 20,
        height: 20,
        speed: 2
    };
    enemies.push(enemy);
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 2,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            life: 20,
            color: 'orange'
        });
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                if (score >= targetScore) {
                    endGame(true);
                }
            }
        });
    });
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        moveUp();
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        moveDown();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        shoot();
    } else if (countdownActive && (e.key === 'Enter' || e.key === ' ')) {
        continueGame();
    }
}

function keyUp(e) {
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
        player.dx = 0;
        player.dy = 0;
    }
}

function startCountdown() {
    countdownActive = true;
    countdownStartTime = Date.now();
}

function continueGame() {
    countdownActive = false;
    startTime = Date.now();
}

function endGame(win) {
    if (win) {
        alert('YOU WIN, CONGRATULATIONS!');
    } else {
        alert('GAME OVER');
    }
    document.location.reload();
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

setInterval(spawnEnemy, 1000);
update();