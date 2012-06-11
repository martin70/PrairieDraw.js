
function AngMomPointsCircle(canvasId) {
    this.showE = false;
    this.showD = false;
    this.showAE = false;
    this.showAll = false;
    drawUtils.Animator.call(this, canvasId);
}
AngMomPointsCircle.prototype = new drawUtils.Animator;

AngMomPointsCircle.prototype.draw = function(t) {
    var canvas = document.getElementById(this.canvasId);
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

    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "a", -2, 2, length, angMomRadius, dotSize, this.showAE || this.showAll, this.showAE);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "b", 0, 2, length, angMomRadius, dotSize, this.showAll, false);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "c", 2, 2, length, angMomRadius, dotSize, this.showAll, false);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "d", -2, 0, length, angMomRadius, dotSize, this.showD || this.showAll, this.showD);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "e", 0, 0, length, angMomRadius, dotSize, this.showE || this.showAE || this.showAll, this.showE || this.showAE);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "f", 2, 0, length, angMomRadius, dotSize, this.showAll, false);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "g", -2, -2, length, angMomRadius, dotSize, this.showAll, false);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "h", 0, -2, length, angMomRadius, dotSize, this.showAll, false);
    drawUtils.drawAngMomAtPoint(ctx, x, y, vx, vy, "i", 2, -2, length, angMomRadius, dotSize, this.showAll, false);

    ctx.restore();
}
