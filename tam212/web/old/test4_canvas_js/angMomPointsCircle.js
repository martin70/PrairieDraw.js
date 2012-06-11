var angMomPointsCircleShowAngMoms;

var angMomPointsCircleRunning;
var angMomPointsCircleDrawTime;
var angMomPointsCircleTimeOffset;
var angMomPointsCircleStartFrame;

function setupAngMomPointsCircle() {
    var canvas = document.getElementById('angMomPointsCircle');
    canvas.addEventListener("mousedown", toggleAngMomPointsCircle, false);

    drawAngMomPointsCircle(0);
    angMomPointsCircleDrawTime = 0;
    angMomPointsCircleRunning = false;
    angMomPointsCircleShowAngMoms = false;
}

function toggleAngMomPointsCircle() {
    if (angMomPointsCircleRunning) {
        angMomPointsCircleRunning = false;
    } else {
        angMomPointsCircleRunning = true;
        angMomPointsCircleStartFrame = true;
        requestAnimationFrame(drawAngMomPointsCircleCallback);
    }
}

function drawAngMomPointsCircleCallback(t_ms) {
    if (angMomPointsCircleStartFrame) {
        angMomPointsCircleStartFrame = false;
        angMomPointsCircleTimeOffset = t_ms - angMomPointsCircleDrawTime;
    }
    angMomPointsCircleTime = t_ms - angMomPointsCircleTimeOffset;
    angMomPointsCircleDrawTime = angMomPointsCircleTime;
    var t = angMomPointsCircleTime / 1000;
    drawAngMomPointsCircle(t);
    if (angMomPointsCircleRunning) {
        requestAnimationFrame(drawAngMomPointsCircleCallback);
    }
}

function drawAngMomPointsCircle(t) {
    var canvas = document.getElementById('angMomPointsCircle');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var length = Math.min(canvas.width, canvas.height) / 5;
    var massRadius = length / 10;
    var angMomRadius = length / 4;
    var dotSize = 2;

    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(canvas.width / 2, -canvas.height / 2);

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    var s = 2 * t % (4 * Math.PI);
    var x = Math.cos(s);
    var y = Math.sin(s);
    var vx = -Math.sin(s);
    var vy = Math.cos(s);

    // mass
    var px = x * length;
    var py = y * length;
    ctx.beginPath();
    ctx.arc(px, py, massRadius, 0, 7);
    ctx.fill();

    drawAngMomAtPoint(ctx, x, y, vx, vy, "i", 2, 2, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "h", 0, 2, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "g", -2, 2, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "f", 2, 0, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "e", 0, 0, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "d", -2, 0, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "c", 2, -2, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "b", 0, -2, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "a", -2, -2, length, angMomRadius, dotSize, angMomPointsCircleShowAngMoms);

    ctx.restore();
}

setupAngMomPointsCircle();
