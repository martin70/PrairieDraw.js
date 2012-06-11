
var arrowheadLength = 15;
var arrowheadWidthRatio = 0.3;
var arrowheadOffsetRatio = 0.3;
var circleArrowWrapOffsetRatio = 1.5;

function circleArrow(ctx, x, y, r, midAngle, deltaAngle) {
    var startAngle = midAngle - deltaAngle / 2;
    var endAngle = midAngle + deltaAngle / 2;
    var startRadius = circleArrowRadius(r, midAngle, startAngle, deltaAngle);
    var endRadius = circleArrowRadius(r, midAngle, endAngle, deltaAngle);
    var arrowLength = Math.min(arrowheadLength, Math.min(r / 0.3, Math.abs(r * deltaAngle)));
    var arrowBodyLength = (1 - arrowheadOffsetRatio) * arrowLength;
    var arrowExtraBodyLength = (1 - arrowheadOffsetRatio / 3) * arrowLength;
    var arrowAngle = arrowBodyLength / endRadius;
    var arrowExtraAngle = arrowExtraBodyLength / endRadius;
    var preEndAngle = endAngle - sign(deltaAngle) * arrowAngle;
    var arrowBaseAngle = endAngle - sign(deltaAngle) * arrowExtraAngle;

    ctx.save();

    ctx.translate(x, y);
    /*
    ctx.beginPath();
    if (deltaAngle > 0) {
        ctx.arc(0, 0, r, startAngle, preEndAngle);
    } else {
        ctx.arc(0, 0, r, startAngle, preEndAngle, true);
    }
    */
    var idealSegmentSize = 0.2;
    var numSegments = Math.ceil(Math.abs(preEndAngle - startAngle) / idealSegmentSize);
    var i, angle, radius;
    var ax = startRadius * Math.cos(startAngle);
    var ay = startRadius * Math.sin(startAngle);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    for (i = 1; i <= numSegments; i++) {
        angle = linearInterp(startAngle, preEndAngle, i / numSegments);
        radius = circleArrowRadius(r, midAngle, angle, deltaAngle);
        ax = radius * Math.cos(angle);
        ay = radius * Math.sin(angle);
        ctx.lineTo(ax, ay);
    }
    ctx.stroke();

    var arrowBaseRadius = circleArrowRadius(r, midAngle, arrowBaseAngle, deltaAngle);
    var xe = endRadius * Math.cos(endAngle);
    var ye = endRadius * Math.sin(endAngle);
    var xp = arrowBaseRadius * Math.cos(arrowBaseAngle);
    var yp = arrowBaseRadius * Math.sin(arrowBaseAngle);
    var arrowHeading = Math.atan2(ye - yp, xe - xp);
    arrowhead(ctx, xe, ye, arrowHeading, arrowLength);

    ctx.restore();
}

function circleArrowRadius(r0, midAngle, angle, deltaAngle) {
    var spacing = arrowheadLength * arrowheadWidthRatio * circleArrowWrapOffsetRatio;
    var circleArrowWrapDensity = r0 * Math.PI * 2 / spacing;
    var angleIncrement = (angle - midAngle) * sign(deltaAngle);
    if (angleIncrement > 0) {
        return r0 * (1 + angleIncrement / circleArrowWrapDensity);
    } else {
        return r0 * Math.exp(angleIncrement / circleArrowWrapDensity);
    }
}

function lineArrow(ctx, x0, y0, dx, dy) {
    var arrowHeading = Math.atan2(dy, dx);
    var lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    var arrowLength = Math.min(arrowheadLength, lineLength);
    var arrowBodyLength = (1 - arrowheadOffsetRatio) * arrowLength;
    var drawLineLength = lineLength - arrowBodyLength;
    var drawLineRatio = drawLineLength / lineLength;
    var x2 = x0 + dx * drawLineRatio;
    var y2 = y0 + dy * drawLineRatio;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    arrowhead(ctx, x0 + dx, y0 + dy, arrowHeading, arrowLength);
}

function arrowhead(ctx, x, y, theta, length) {
    var dx = - (1 - arrowheadOffsetRatio) * length;
    var dy = arrowheadWidthRatio * length;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(theta);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-length, dy);
    ctx.lineTo(dx, 0);
    ctx.lineTo(-length, -dy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function sign(x) {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    } else {
        return 0;
    }
}

function linearInterp(x0, x1, alpha) {
    return (1 - alpha) * x0 + alpha * x1;
}

function drawAngMomAtPoint(ctx, x, y, vx, vy, name, cx, cy, length, angMomRadius, dotSize, show) {
    var h = ((x - cx) * vy - (y - cy) * vx);
    var px = cx * length;
    var py = cy * length;
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.strokeStyle = "rgb(255, 0, 0)";
    if (show) {
        circleArrow(ctx, px, py, angMomRadius, 3 * Math.PI / 2, 3 * h);
    }

    ctx.beginPath();
    ctx.arc(px, py, dotSize, 0, 7);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fill();

    ctx.save();
    ctx.scale(1, -1);
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(name, px, py - 5);
    ctx.restore();
}
