
// module object to package all functions and data
var drawUtils = drawUtils || {};

// properties object to include all drawing parameters
drawUtils.props = {};

/* store the appropriate version of requestAnimationFrame

  Use this like:
  drawUtils.requestAnimationFrame.call(window, this.callback.bind(this));

  We can't do drawUtils.requestAnimationFrame(callback),
  because that would run requestAnimationFrame in the context of
  drawUtils ("this" would be drawUtils), and requestAnimationFrame
  needs "this" to be "window".

  We need to pass this.callback.bind(this) as the callback function
  rather than just this.callback as otherwise the callback functions
  is called from "window" context, and we want it to be called from
  the context of our own object.
*/
drawUtils.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

/*****************************************************************************/
// helper functions

drawUtils.sign = function(x) {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    } else {
        return 0;
    }
}

drawUtils.linearInterp = function(x0, x1, alpha) {
    return (1 - alpha) * x0 + alpha * x1;
}

drawUtils.proj = function(v, u) {
    // projection of v onto the u direction
    var uLen2 = Math.pow(u[0], 2) + Math.pow(u[1], 2);
    if (uLen2 == 0) {
        return [0, 0];
    }
    var a = (v[0] * u[0] + v[1] * u[1]) / uLen2;
    return [a * u[0], a * u[1]];
}

drawUtils.rej = function(v, u) {
    // rejection of v onto u (projection onto orthogonal complement of u)
    var uLen2 = Math.pow(u[0], 2) + Math.pow(u[1], 2);
    if (uLen2 == 0) {
        return [0, 0];
    }
    var a = (v[0] * u[0] + v[1] * u[1]) / uLen2;
    return [v[0] - a * u[0], v[1] - a * u[1]];
}

/*****************************************************************************/
// colors

drawUtils.colors = {
    black: "rgb(0, 0, 0)",
    white: "rgb(255, 255, 255)",
    red: "rgb(255, 0, 0)",
    green: "rgb(0, 200, 0)",
    blue: "rgb(0, 0, 255)",
    yellow: "rgb(200, 200, 0)",
    magenta: "rgb(255, 0, 255)",
    cyan: "rgb(0, 200, 200)"
};

drawUtils.selectColor = function(ctx, type) {
    if (type in drawUtils.colors) {
        c = drawUtils.colors[type];
    } else {
        switch (type) {
        case "position": c = drawUtils.colors.blue; break;
        case "velocity": c = drawUtils.colors.green; break;
        case "acceleration": c = drawUtils.colors.magenta; break;
        case "angMom": c = drawUtils.colors.red; break;
        case "force": c = drawUtils.colors.yellow; break;
        default: c = drawUtils.colors.black; break;
        }
    }
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
}

/*****************************************************************************/
// arrows

drawUtils.props.arrowhead = {
    length: 15,
    widthRatio: 0.3,
    offsetRatio: 0.3
};

drawUtils.props.circleArrow = {
    wrapOffsetRatio: 1.5
}

drawUtils.arrowhead = function(ctx, x, y, theta, length) {
    var dx = - (1 - drawUtils.props.arrowhead.offsetRatio) * length;
    var dy = drawUtils.props.arrowhead.widthRatio * length;
    
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

drawUtils.lineArrow = function(ctx, x0, y0, dx, dy) {
    var arrowHeading = Math.atan2(dy, dx);
    var lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    var arrowLength = Math.min(drawUtils.props.arrowhead.length, lineLength);
    var arrowBodyLength = (1 - drawUtils.props.arrowhead.offsetRatio) * arrowLength;
    var drawLineLength = lineLength - arrowBodyLength;
    var drawLineRatio = drawLineLength / lineLength;
    var x2 = x0 + dx * drawLineRatio;
    var y2 = y0 + dy * drawLineRatio;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    drawUtils.arrowhead(ctx, x0 + dx, y0 + dy, arrowHeading, arrowLength);
}

drawUtils.circleArrow = function(ctx, x, y, r, midAngle, deltaAngle) {
    var startAngle = midAngle - deltaAngle / 2;
    var endAngle = midAngle + deltaAngle / 2;
    var startRadius = drawUtils.circleArrowRadius(r, midAngle, startAngle, deltaAngle);
    var endRadius = drawUtils.circleArrowRadius(r, midAngle, endAngle, deltaAngle);
    var arrowLength = Math.min(drawUtils.props.arrowhead.length, Math.min(r / 0.3, Math.abs(r * deltaAngle)));
    var arrowBodyLength = (1 - drawUtils.props.arrowhead.offsetRatio) * arrowLength;
    var arrowExtraBodyLength = (1 - drawUtils.props.arrowhead.offsetRatio / 3) * arrowLength;
    var arrowAngle = arrowBodyLength / endRadius;
    var arrowExtraAngle = arrowExtraBodyLength / endRadius;
    var preEndAngle = endAngle - drawUtils.sign(deltaAngle) * arrowAngle;
    var arrowBaseAngle = endAngle - drawUtils.sign(deltaAngle) * arrowExtraAngle;

    ctx.save();

    ctx.translate(x, y);
    var idealSegmentSize = 0.2;
    var numSegments = Math.ceil(Math.abs(preEndAngle - startAngle) / idealSegmentSize);
    var i, angle, radius;
    var ax = startRadius * Math.cos(startAngle);
    var ay = startRadius * Math.sin(startAngle);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    for (i = 1; i <= numSegments; i++) {
        angle = drawUtils.linearInterp(startAngle, preEndAngle, i / numSegments);
        radius = drawUtils.circleArrowRadius(r, midAngle, angle, deltaAngle);
        ax = radius * Math.cos(angle);
        ay = radius * Math.sin(angle);
        ctx.lineTo(ax, ay);
    }
    ctx.stroke();

    var arrowBaseRadius = drawUtils.circleArrowRadius(r, midAngle, arrowBaseAngle, deltaAngle);
    var xe = endRadius * Math.cos(endAngle);
    var ye = endRadius * Math.sin(endAngle);
    var xp = arrowBaseRadius * Math.cos(arrowBaseAngle);
    var yp = arrowBaseRadius * Math.sin(arrowBaseAngle);
    var arrowHeading = Math.atan2(ye - yp, xe - xp);
    drawUtils.arrowhead(ctx, xe, ye, arrowHeading, arrowLength);

    ctx.restore();
}

drawUtils.circleArrowRadius = function(r0, midAngle, angle, deltaAngle) {
    var spacing = drawUtils.props.arrowhead.length
        * drawUtils.props.arrowhead.widthRatio * drawUtils.props.circleArrow.wrapOffsetRatio;
    var circleArrowWrapDensity = r0 * Math.PI * 2 / spacing;
    var angleIncrement = (angle - midAngle) * drawUtils.sign(deltaAngle);
    if (angleIncrement > 0) {
        return r0 * (1 + angleIncrement / circleArrowWrapDensity);
    } else {
        return r0 * Math.exp(angleIncrement / circleArrowWrapDensity);
    }
}

/*****************************************************************************/
// angular momentum of a point

drawUtils.drawAngMomAtPoint = function(ctx, x, y, vx, vy, name, cx, cy, length,
                                       angMomRadius, dotSize, show, showConstruct, showOrthPos) {
    var h = ((x - cx) * vy - (y - cy) * vx);
    var px = x * length;
    var py = y * length;
    var pcx = cx * length;
    var pcy = cy * length;
    var pvx = vx * length;
    var pvy = vy * length;

    // point dot
    ctx.beginPath();
    ctx.arc(pcx, pcy, dotSize, 0, 7);
    drawUtils.selectColor(ctx, "black");
    ctx.fill();

    // label
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.scale(1, -1);
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(name, 0, -5);
    ctx.restore();

    if (showConstruct) {
        drawUtils.selectColor(ctx, "position");
        drawUtils.lineArrow(ctx, pcx, pcy, px - pcx, py - pcy);
        drawUtils.selectColor(ctx, "velocity");
        drawUtils.lineArrow(ctx, px, py, pvx, pvy);
    }
    if (showOrthPos) {
        var p = [x, y];
        var cp = [x - cx, y - cy];
        var v = [vx, vy];
        var orthPos = drawUtils.rej(cp, v);
        drawUtils.selectColor(ctx, "position");
        ctx.save();
        ctx.lineWidth = ctx.lineWidth / 2;
        drawUtils.lineArrow(ctx, (p[0] - orthPos[0]) * length,
                            (p[1] - orthPos[1]) * length, orthPos[0] * length, orthPos[1] * length);
        ctx.restore();
    }

    // angular momentum circle arrow
    drawUtils.selectColor(ctx, "angMom")
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.strokeStyle = "rgb(255, 0, 0)";
    if (show) {
        drawUtils.circleArrow(ctx, pcx, pcy, angMomRadius, 3 * Math.PI / 2, 3 * h);
    }
}

/*****************************************************************************/
// show and hide divs and handle show/hide buttons

drawUtils.showDiv = function(div) {
    div.style.display = "block";
}

drawUtils.hideDiv = function(div) {
    div.style.display = "none";
}

drawUtils.showHideDiv = function(button, divId, showEval, hideEval) {
    var div = document.getElementById(divId);
    if (div.style.display == "inline") {
        eval(hideEval);
        div.style.display = "none";
        button.childNodes[0].nodeValue = "Show";
    } else {
        eval(showEval);
        div.style.display = "inline";
        button.childNodes[0].nodeValue = "Hide";
    }
}

drawUtils.setShow = function(button) {
    if (button.hasChildNodes()) {
        button.childNodes[0].nodeValue = "Show";
    } else {
        var textNode = document.createTextNode("Show");
        button.appendChild(textNode);
    }
}

drawUtils.setHide = function(button) {
    if (button.hasChildNodes()) {
        button.childNodes[0].nodeValue = "Hide";
    } else {
        var textNode = document.createTextNode("Hide");
        button.appendChild(textNode);
    }
}

drawUtils.isShow = function(button) {
    if (button.childNodes[0].nodeValue == "Show") {
        return true;
    }
    return false;
}

/*****************************************************************************/
// Animator object

drawUtils.Animator = function(canvasId, noClickHandle) {
    this.canvasId = canvasId
    if (canvasId) {
        this.canvas = document.getElementById(this.canvasId);
        if (!noClickHandle) {
            this.canvas.addEventListener("mousedown", this.toggle.bind(this), false);
        }

        this.draw(0);
        this.drawTime = 0;
        this.running = false;

        this.canvas.animator = this;
    }
}

drawUtils.Animator.prototype.start = function() {
    this.running = true;
    this.startFrame = true;
    drawUtils.requestAnimationFrame.call(window, this.callback.bind(this));
}

drawUtils.Animator.prototype.stop = function() {
    this.running = false;
}

drawUtils.Animator.prototype.toggle = function() {
    if (this.running) {
        this.stop();
    } else {
        this.start();
    }
}

drawUtils.Animator.prototype.callback = function(t_ms) {
    if (this.startFrame) {
        this.startFrame = false;
        this.timeOffset = t_ms - this.drawTime;
    }
    var simTime = t_ms - this.timeOffset;
    this.drawTime = simTime;
    this.draw(simTime / 1000);
    if (this.running) {
        drawUtils.requestAnimationFrame.call(window, this.callback.bind(this));
    }
}

drawUtils.Animator.prototype.redraw = function() {
    if (!this.running) {
        this.draw(this.drawTime / 1000);
    }
}

drawUtils.Animator.prototype.resetTime = function() {
    this.drawTime = 0;
    this.startFrame = true;
}

/*****************************************************************************/
// ExampleController object

drawUtils.ExampleController = function(exampleId) {
    this.exampleId = exampleId
    if (exampleId) {
        // get the top-level div
        this.outerDiv = document.getElementById(exampleId);

        // store and setup the main show/hide button
        var x = document.evaluate('.//button[@class="example"]', this.outerDiv, null,
                                  XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        this.button = x.singleNodeValue;
        drawUtils.setShow(this.button)
        this.button.addEventListener("click", this.click.bind(this), false);

        // store the inner div
        var x = document.evaluate('.//div[@class="exampleInner"]', this.outerDiv, null,
                                  XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        this.div = x.singleNodeValue;

        // store the canvas
        var x = document.evaluate('.//canvas', this.outerDiv, null,
                                  XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        this.canvas = x.singleNodeValue;

        // create and store the solution button controllers
        this.solutionControllers = [];
        var x = document.evaluate('.//button[@class="solution"]', this.outerDiv, null,
                                  XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < x.snapshotLength; i++) {
            var solutionButton = x.snapshotItem(i);
            this.solutionControllers.push(new drawUtils.SolutionController(solutionButton, this.canvas, this.outerDiv));
        }
    }
}

drawUtils.ExampleController.prototype.show = function() {
    drawUtils.setHide(this.button)
    this.hideSolutions();
    this.resetAnimation();
    this.startAnimation();
    drawUtils.showDiv(this.div);
}

drawUtils.ExampleController.prototype.hide = function() {
    drawUtils.setShow(this.button)
    drawUtils.hideDiv(this.div);
    this.hideSolutions();
    this.stopAnimation();
}

drawUtils.ExampleController.prototype.click = function() {
    if (drawUtils.isShow(this.button)) {
        this.show();
    } else {
        this.hide();
    }
}

drawUtils.ExampleController.prototype.hideSolutions = function() {
    this.solutionControllers.forEach(function (s) {
        s.hide();
    });
}

drawUtils.ExampleController.prototype.showSolutions = function() {
    this.solutionControllers.forEach(function (s) {
        s.show();
    });
}

drawUtils.ExampleController.prototype.resetAnimation = function() {
    this.canvas.animator.resetTime();
}

drawUtils.ExampleController.prototype.startAnimation = function() {
    this.canvas.animator.start();
}

drawUtils.ExampleController.prototype.stopAnimation = function() {
    this.canvas.animator.stop();
}

/*****************************************************************************/
// SolutionController object

drawUtils.SolutionController = function(button, canvas, outerDiv) {
    this.button = button;
    this.canvas = canvas;
    if (button) {
        // store the solution name
        this.name = button.dataset.solution;

        // store the solution div
        var x = document.evaluate('.//div[@class="solution" and @data-solution="' + this.name + '"]',
                                  outerDiv, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        this.div = x.singleNodeValue;

        this.hide();
        this.button.addEventListener("click", this.click.bind(this), false);
    }
}

drawUtils.SolutionController.prototype.show = function() {
    drawUtils.setHide(this.button)
    drawUtils.showDiv(this.div);
    this.canvas.animator[this.name] = true;
    this.canvas.animator.redraw();
}

drawUtils.SolutionController.prototype.hide = function() {
    drawUtils.setShow(this.button)
    drawUtils.hideDiv(this.div);
    this.canvas.animator[this.name] = false;
    this.canvas.animator.redraw();
}

drawUtils.SolutionController.prototype.click = function() {
    if (drawUtils.isShow(this.button)) {
        this.show();
    } else {
        this.hide();
    }
}

/*****************************************************************************/
