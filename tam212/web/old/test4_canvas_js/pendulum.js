var pendulumRunning;
var pendulumDrawTime;
var pendulumTimeOffset;
var pendulumStartFrame;

function setupPendulum() {
    var canvas = document.getElementById('pendulum');
    canvas.addEventListener("mousedown", togglePendulum, false);

    drawPendulum(0);
    pendulumDrawTime = 0;
    pendulumRunning = false;
}

function togglePendulum() {
    if (pendulumRunning) {
        pendulumRunning = false;
    } else {
        pendulumRunning = true;
        pendulumStartFrame = true;
        requestAnimationFrame(drawPendulumCallback);
    }
}

function drawPendulumCallback(t_ms) {
    if (pendulumStartFrame) {
        pendulumStartFrame = false;
        pendulumTimeOffset = t_ms - pendulumDrawTime;
    }
    pendulumTime = t_ms - pendulumTimeOffset;
    pendulumDrawTime = pendulumTime;
    var t = pendulumTime / 1000;
    drawPendulum(t);
    if (pendulumRunning) {
        requestAnimationFrame(drawPendulumCallback);
    }
}

function drawPendulum(t) {
    var canvas = document.getElementById('pendulum');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var length = canvas.width / 2.2;
    var massRadius = length / 10;
    var angMomRadius = length / 5;
    var mgLength = length / 4;

    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(canvas.width / 2, -(canvas.height - length) / 2);

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    var theta = Math.sin(t);
    var omega = Math.cos(t);
    var x = length * Math.sin(theta);
    var y = -length * Math.cos(theta);

    // rod
    ctx.save()
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    // mass
    ctx.save()
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, massRadius, 0, 7);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // angular momentum
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.strokeStyle = "rgb(255, 0, 0)";
    circleArrow(ctx, 0, 0, angMomRadius, 3 * Math.PI / 2, 4 * omega);

    // velocity
    var vx = length * Math.cos(theta) * omega;
    var vy = length * Math.sin(theta) * omega;
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.strokeStyle = "rgb(0, 255, 0)";
    lineArrow(ctx, x, y, 0.3 * vx, 0.3 * vy);

    // acceleration
    var ax = - length * Math.sin(theta) * omega * omega;
    var ay = length * Math.cos(theta) * omega * omega;
    ctx.fillStyle = "rgb(255, 0, 255)";
    ctx.strokeStyle = "rgb(255, 0, 255)";
    lineArrow(ctx, x, y, 0.3 * ax, 0.3 * ay);

    // force
    ctx.fillStyle = "rgb(0, 0, 255)";
    ctx.strokeStyle = "rgb(0, 0, 255)";
    lineArrow(ctx, x, y, 0, -mgLength);

    ctx.restore();
}

setupPendulum();
