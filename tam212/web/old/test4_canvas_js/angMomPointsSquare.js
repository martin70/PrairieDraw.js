var angMomPointsSquareShowAngMoms;

var angMomPointsSquareRunning;
var angMomPointsSquareDrawTime;
var angMomPointsSquareTimeOffset;
var angMomPointsSquareStartFrame;

function setupAngMomPointsSquare() {
    var canvas = document.getElementById('angMomPointsSquare');
    canvas.addEventListener("mousedown", toggleAngMomPointsSquare, false);

    drawAngMomPointsSquare(0);
    angMomPointsSquareDrawTime = 0;
    angMomPointsSquareRunning = false;
    angMomPointsSquareShowAngMoms = false;
}

function startAngMomPointsSquare() {
    angMomPointsSquareRunning = true;
    angMomPointsSquareStartFrame = true;
    requestAnimationFrame(drawAngMomPointsSquareCallback);
}

function stopAngMomPointsSquare() {
    angMomPointsSquareRunning = false;
}

function toggleAngMomPointsSquare() {
    if (angMomPointsSquareRunning) {
        stopAngMomPointsSquare();
    } else {
        startAngMomPointsSquare();
    }
}

function drawAngMomPointsSquareCallback(t_ms) {
    if (angMomPointsSquareStartFrame) {
        angMomPointsSquareStartFrame = false;
        angMomPointsSquareTimeOffset = t_ms - angMomPointsSquareDrawTime;
    }
    angMomPointsSquareTime = t_ms - angMomPointsSquareTimeOffset;
    angMomPointsSquareDrawTime = angMomPointsSquareTime;
    var t = angMomPointsSquareTime / 1000;
    drawAngMomPointsSquare(t);
    if (angMomPointsSquareRunning) {
        requestAnimationFrame(drawAngMomPointsSquareCallback);
    }
}

function redrawAngMomPointsSquare() {
    if (!angMomPointsSquareRunning) {
        drawAngMomPointsSquare(angMomPointsSquareDrawTime / 1000);
    }
}

function drawAngMomPointsSquare(t) {
    var canvas = document.getElementById('angMomPointsSquare');
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
    var d = Math.sin(s);
    var v = Math.cos(s);
    var x, y, vx, vy;
    if (s < Math.PI / 2) {
        x = -1;
        y = -d;
        vx = 0;
        vy = -v;
    } else if (s < 3 * Math.PI / 2) {
        x = -d;
        y = -1;
        vx = -v;
        vy = 0;
    } else if (s < 5 * Math.PI / 2) {
        x = 1;
        y = d;
        vx = 0;
        vy = v;
    } else if (s < 7 * Math.PI / 2) {
        x = d;
        y = 1;
        vx = v;
        vy = 0;
    } else {
        x = -1;
        y = -d;
        vx = 0;
        vy = -v;
    }

    // mass
    var px = x * length;
    var py = y * length;
    ctx.beginPath();
    ctx.arc(px, py, massRadius, 0, 7);
    ctx.fill();

    drawAngMomAtPoint(ctx, x, y, vx, vy, "i", 2, 2, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "h", 0, 2, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "g", -2, 2, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "f", 2, 0, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "e", 0, 0, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "d", -2, 0, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "c", 2, -2, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "b", 0, -2, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);
    drawAngMomAtPoint(ctx, x, y, vx, vy, "a", -2, -2, length, angMomRadius, dotSize, angMomPointsSquareShowAngMoms);

    ctx.restore();
}

setupAngMomPointsSquare();
