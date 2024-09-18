const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = {
    width: 100,
    height: 10,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 7,
    dx: 0,
    lengthMultiplier: 1
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    size: 10,
    speed: 4,
    dx: 4,
    dy: -4,
    speedMultiplier: 1
};

const balls = [ball];

const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 35;

const colors = ['#0095DD', '#FF5733', '#33FF57', '#FF33A1'];
const powerUps = {
    speed: '#FF5733',
    multiBall: '#33FF57',
    longerPaddle: '#FF33A1'
};

let bricks = [];
let score = 0;
let lives = 3;

let speedPowerUpCount = 0;
let multiBallPowerUpCount = 0;
let longerPaddlePowerUpCount = 0;

const maxSpeedPowerUp = 4;
const maxMultiBallPowerUp = 4;
const maxLongerPaddlePowerUp = 3;

function generateBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            bricks[c][r] = { x: 0, y: 0, status: 1, color: color };
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddle.x, paddle.y, paddle.width * paddle.lengthMultiplier, paddle.height);
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.fillStyle = bricks[c][r].color;
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}

function movePaddle() {
    paddle.x += paddle.dx;

    if (paddle.x < 0) {
        paddle.x = 0;
    }

    if (paddle.x + paddle.width * paddle.lengthMultiplier > canvas.width) {
        paddle.x = canvas.width - paddle.width * paddle.lengthMultiplier;
    }
}

function moveBall(ball) {
    ball.x += ball.dx * ball.speedMultiplier;
    ball.y += ball.dy * ball.speedMultiplier;

    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    }

    if (ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    if (ball.y + ball.size > canvas.height) {
        lives--;
        if (!lives) {
            alert('GAME OVER');
            document.location.reload();
        } else {
            resetBall(ball);
            paddle.x = canvas.width / 2 - paddle.width / 2;
        }
    }

    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width * paddle.lengthMultiplier &&
        ball.y + ball.size > paddle.y
    ) {
        const collidePoint = ball.x - (paddle.x + paddle.width * paddle.lengthMultiplier / 2);
        const normalizedCollidePoint = collidePoint / (paddle.width * paddle.lengthMultiplier / 2);
        const angle = normalizedCollidePoint * (Math.PI / 3);

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }

    bricks.forEach(column => {
        column.forEach(brick => {
            if (brick.status === 1) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brickWidth &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brickHeight
                ) {
                    ball.dy *= -1;
                    brick.status = 0;
                    score++;
                    handlePowerUp(brick.color);
                    if (score === brickRowCount * brickColumnCount) {
                        alert('YOU WIN, CONGRATULATIONS!');
                        document.location.reload();
                    }
                }
            }
        });
    });
}

function handlePowerUp(color) {
    if (color === powerUps.speed && speedPowerUpCount < maxSpeedPowerUp) {
        ball.speedMultiplier = Math.min(ball.speedMultiplier + 0.5, 2);
        speedPowerUpCount++;
    } else if (color === powerUps.multiBall && multiBallPowerUpCount < maxMultiBallPowerUp) {
        if (balls.length < 4) {
            const newBall = { ...ball, x: ball.x, y: ball.y, dx: -ball.dx, dy: -ball.dy };
            balls.push(newBall);
            multiBallPowerUpCount++;
        }
    } else if (color === powerUps.longerPaddle && longerPaddlePowerUpCount < maxLongerPaddlePowerUp) {
        paddle.lengthMultiplier = Math.min(paddle.lengthMultiplier + 0.5, 2.5);
        longerPaddlePowerUpCount++;
    }
}

function resetBall(ball) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = 4;
    ball.dy = -4;
    ball.speedMultiplier = 1;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    balls.forEach(drawBall);
    drawPaddle();
    drawScore();
    drawLives();
}

function update() {
    movePaddle();
    balls.forEach(moveBall);
    draw();
    requestAnimationFrame(update);
}

function keyDown(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
}

function keyUp(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

generateBricks();
update();
