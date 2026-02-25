const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let gravity = 0.6;
let cameraX = 0;

let car = {
    x: 200,
    y: 0,
    width: 90,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    angle: 0,
    wheelRadius: 18
};

function terrain(x) {
    return canvas.height - 150 + Math.sin(x * 0.005) * 120;
}

function drawTerrain() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        ctx.lineTo(x, terrain(x + cameraX));
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.fillStyle = "#2e7d32";
    ctx.fill();
}

function update() {

    // GAS
    if (keys["ArrowUp"]) {
        car.velocityX += 0.3;
    }

    // BRAKE / REVERSE
    if (keys["ArrowDown"]) {
        car.velocityX -= 0.3;
    }

    // BALANCE
    if (keys["ArrowLeft"]) car.angle -= 0.03;
    if (keys["ArrowRight"]) car.angle += 0.03;

    car.velocityY += gravity;

    car.x += car.velocityX;
    car.y += car.velocityY;

    let ground = terrain(car.x);

    if (car.y + car.height > ground) {
        car.y = ground - car.height;
        car.velocityY = 0;
    }

    // friction
    car.velocityX *= 0.99;

    // camera follows car
    cameraX = car.x - 200;
}

function drawCar() {

    ctx.save();
    ctx.translate(car.x - cameraX, car.y);
    ctx.rotate(car.angle);

    // car body
    ctx.fillStyle = "#1565c0";
    ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);

    // top cabin
    ctx.fillStyle = "#1e88e5";
    ctx.fillRect(-25, -35, 50, 20);

    // wheels
    ctx.fillStyle = "black";

    ctx.beginPath();
    ctx.arc(-30, 20, car.wheelRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(30, 20, car.wheelRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update();
    drawTerrain();
    drawCar();

    requestAnimationFrame(loop);
}

loop();