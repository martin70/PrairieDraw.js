
function Pendulum(canvasId) {
    this.velocity = true;
    this.acceleration = false;
    this.force = true;
    this.angMom = false;
    drawUtils.Animator.call(this, canvasId);
}
Pendulum.prototype = new drawUtils.Animator;

Pendulum.prototype.draw = function(t) {
    var canvas = document.getElementById(this.canvasId);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var length = Math.min(canvas.width, canvas.height) / 2.5;
    var massRadius = length / 10;
    var angMomRadius = length / 5;
    var mgLength = length / 4;

    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(canvas.width / 2, -canvas.height / 2);

    drawUtils.selectColor(ctx, "black");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    var T = 13.4264;
    var c2 = 3.11152;
    var c6 = 0.287266;

    var a = Math.PI / T;
    var theta = c2 * Math.sin(2 * a * t) + c6 * Math.sin(6 * a * t);
    var omega = 2 * a * c2 * Math.cos(2 * a * t) + 6 * a * c6 * Math.cos(6 * a * t);
    var omega_dot = - 4 * a * a * c2 * Math.sin(2 * a * t) - 36 * a * a * c6 * Math.sin(6 * a * t);
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
    drawUtils.selectColor(ctx, "white");
    ctx.fill();
    drawUtils.selectColor(ctx, "black");
    ctx.stroke();
    ctx.restore();

    // angular momentum
    if (this.angMom) {
        drawUtils.selectColor(ctx, "angMom");
        drawUtils.circleArrow(ctx, 0, 0, angMomRadius, 3 * Math.PI / 2, 3 * omega);
    }

    // velocity
    if (this.velocity) {
        var vx = length * Math.cos(theta) * omega;
        var vy = length * Math.sin(theta) * omega;
        drawUtils.selectColor(ctx, "velocity");
        drawUtils.lineArrow(ctx, x, y, 0.3 * vx, 0.3 * vy);
    }

    // acceleration
    if (this.acceleration) {
        var ar = - length * omega * omega;
        var at = length * omega_dot;
        var ax = ar * Math.sin(theta) + at * Math.cos(theta);
        var ay = - ar * Math.cos(theta) + at * Math.sin(theta);
        drawUtils.selectColor(ctx, "acceleration");
        drawUtils.lineArrow(ctx, x, y, 0.3 * ax, 0.3 * ay);
    }

    // force
    if (this.force) {
        drawUtils.selectColor(ctx, "force");
        drawUtils.lineArrow(ctx, x, y, 0, -mgLength);
    }

    ctx.restore();
}
