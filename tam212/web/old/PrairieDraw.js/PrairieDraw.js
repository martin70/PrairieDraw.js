
/*****************************************************************************/

/** Creates a PrairieDraw object.

    @constructor
    @this {PrairieDraw}
    @param {HTMLCanvasElement or string} canvas The canvas element to draw on or the ID of the canvas elemnt.
    @param {Function} drawfcn An optional function that draws on the canvas.
*/
function PrairieDraw(canvas, drawFcn) {
    if (canvas) {
        if (canvas instanceof HTMLCanvasElement) {
            /** @private */ this._canvas = canvas;
        } else if (canvas instanceof String || typeof canvas == "string") {
            /** @private */ this._canvas = document.getElementById(canvas);
        } else {
            throw new Error("PrairieDraw: unknown object type for constructor")
        }
        /** @private */ this._ctx = this._canvas.getContext('2d');
        /** @private */ this._width = this._canvas.width;
        /** @private */ this._height = this._canvas.height;

        /** @private */ this._props = {};
        this._initProps();
        /** @private */ this._prop_stack = [];

        /** @private */ this._options = {};

        if (drawFcn) {
            this.draw = drawFcn.bind(this);
        }
        this.draw();
    }
}

/** Creates a new PrairieDraw from a canvas ID.

    @param {string} id The ID of the canvas element to draw on.
    @return {PrairieDraw} The new PrairieDraw object.
*/
PrairieDraw.fromCanvasId = function(id) {
    var canvas = document.getElementById(id);
    if (!canvas) {
        throw new Error("PrairieDraw: unable to find canvas ID: " + id);
    }
    return new PrairieDraw(canvas);
}

/** Prototype function to draw on the canvas, should be implemented by children.
*/
PrairieDraw.prototype.draw = function() {
}

/** Redraw the drawing.
*/
PrairieDraw.prototype.redraw = function() {
    this.draw();
}

/** @private Initialize properties.
*/
PrairieDraw.prototype._initProps = function() {

    this._props.arrowLineWidth = 2; // px
    this._props.arrowheadLength = 15; // px
    this._props.arrowheadWidthRatio = 0.3;
    this._props.arrowheadOffsetRatio = 0.3;
    this._props.circleArrowWrapOffsetRatio = 1.5;

    this._props.textOffset = 4; // px

    this._props.pointRadius = 2; // px

    this._props.shapeStrokeWidth = 2; // px
    this._props.shapeOutlineColor = "rgb(0, 0, 0)";
    this._props.shapeInsideColor = "rgb(255, 255, 255)";

    this._props.groundDepth = 10; // px
    this._props.groundOutlineColor = "rgb(0, 0, 0)";
    this._props.groundInsideColor = "rgb(220, 220, 220)";

    this._props.gridColor = "rgb(200, 200, 200)";
    this._props.positionColor = "rgb(0, 0, 255)";
    this._props.velocityColor = "rgb(0, 200, 0)";
    this._props.accelerationColor = "rgb(255, 0, 255)";
    this._props.angMomColor = "rgb(255, 0, 0)";
    this._props.forceColor = "rgb(200, 200, 0)";
}

/*****************************************************************************/

/** @private Store the appropriate version of requestAnimationFrame.

    Use this like:
    prairieDraw.requestAnimationFrame.call(window, this.callback.bind(this));

    We can't do prairieDraw.requestAnimationFrame(callback), because
    that would run requestAnimationFrame in the context of prairieDraw
    ("this" would be prairieDraw), and requestAnimationFrame needs
    "this" to be "window".

    We need to pass this.callback.bind(this) as the callback function
    rather than just this.callback as otherwise the callback functions
    is called from "window" context, and we want it to be called from
    the context of our own object.
*/
PrairieDraw.prototype._requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

/*****************************************************************************/

/** @private Center the coordinate system in the canvas and flip vertically so y is positive up.
*/
PrairieDraw.prototype._centerAndFlipV = function() {
    this.save();
    this._ctx.scale(1, -1);
    this._ctx.translate(this._width / 2, -this._height / 2);
}

/** Translate the coordinate system.

    @param {Vector} offset Translation offset (drawing coords).
*/
PrairieDraw.prototype.translate = function(offset) {
    var dx = offset.e(1) * this._scale;
    var dy = offset.e(2) * this._scale;
    this._ctx.translate(dx, dy);
}

/** Rotate the coordinate system.

    @param {number} angle Angle to rotate by (radians).
*/
PrairieDraw.prototype.rotate = function(angle) {
    this._ctx.rotate(angle);
}

/*****************************************************************************/

/** Set a property.

    @param {string} name The name of the property.
    @param {number} value The value to set the property to.
*/
PrairieDraw.prototype.setProp = function(name, value) {
    if (!(name in this._props)) {
        throw new Error("PrairieDraw: unknown property name: " + name);
    }
    this._props[name] = value;
}

/** Get a property.

    @param {string} name The name of the property.
    @return {number} The current value of the property.
*/
PrairieDraw.prototype.getProp = function(name) {
    if (!(name in this._props)) {
        throw new Error("PrairieDraw: unknown property name: " + name);
    }
    return this._props[name];
}

/** Save the graphics state.
*/
PrairieDraw.prototype.save = function() {
    this._ctx.save();
    var oldProps = {};
    for (p in this._props) {
        oldProps[p] = this._props[p];
    }
    this._prop_stack.push(oldProps);
}

/** Restore the graphics state.
*/
PrairieDraw.prototype.restore = function() {
    this._ctx.restore();
    if (this._props.length == 0) {
        throw new Error("PrairieDraw: tried to restore() without corresponding save()");
    }
    this._props = this._prop_stack.pop();
}

/*****************************************************************************/

/** Add an external option for this drawing.

    @param {string} name The option name.
    @param {object} value The default initial value.
*/
PrairieDraw.prototype.addOption = function(name, value) {
    if (!(name in this._options)) {
        this._options[name] = value;
    }
}

/** Set an option to a given value.

    @param {string} name The option name.
    @param {object} value The new value for the option.
*/
PrairieDraw.prototype.setOption = function(name, value) {
    if (!(name in this._options)) {
        throw new Error("PrairieDraw: unknown option: " + name);
    }
    this._options[name] = value;
    this.redraw();
}

/** Get the value of an option.

    @param {string} name The option name.
    @return {object} The current value for the option.
*/
PrairieDraw.prototype.getOption = function(name) {
    if (!(name in this._options)) {
        throw new Error("PrairieDraw: unknown option: " + name);
    }
    return this._options[name];
}

/** Set an option to the logical negation of its current value.

    @param {string} name The option name.
*/
PrairieDraw.prototype.toggleOption = function(name) {
    if (!(name in this._options)) {
        throw new Error("PrairieDraw: unknown option: " + name);
    }
    this._options[name] = !this._options[name];
    this.redraw();
}

/*****************************************************************************/

/** Reset the canvas.
*/
PrairieDraw.prototype.reset = function() {
    while (this._prop_stack.length > 0) {
        this.restore();
    }
    this._ctx.clearRect(0, 0, this._width, this._height);
}

/*****************************************************************************/

/** Set the visable coordinate sizes.

    @param {number} xSize The horizontal size of the drawing area in coordinate units.
    @param {number} ySize The vertical size of the drawing area in coordinate units.
    @param {bool} preserveCanvasSize If true, do not resize the canvas to match the coordinate ratio.
*/
PrairieDraw.prototype.setUnits = function(xSize, ySize, preserveCanvasSize) {
    this.reset();
    var xScale = this._width / xSize;
    var yScale = this._height / ySize
    if (xScale < yScale) {
        /** @private */ this._scale = xScale;
        if ((!preserveCanvasSize) && (xScale != yScale)) {
            var newHeight = this._scale * ySize;
            this._canvas.height = newHeight;
            this._height = newHeight;
        }
    } else {
        /** @private */ this._scale = yScale;
        if ((!preserveCanvasSize) && (xScale != yScale)) {
            var newWidth = this._scale * xSize;
            this._canvas.width = newWidth;
            this._width = newWidth;
        }
    }
    this._centerAndFlipV();
}

/*****************************************************************************/

/** Create a 2D unit vector pointing at a given angle.

    @param {number} angle The counterclockwise angle from the positive x axis (radians).
    @return {Vector} A unit vector in direction angle.
*/
PrairieDraw.prototype.vector2DAtAngle = function(angle) {
    return $V([Math.cos(angle), Math.sin(angle)]);
}

/** Find the counterclockwise angle of the vector from the x axis.

    @param {Vector} vec The vector to find the angle of.
    @return {number} The counterclockwise angle of vec from the x axis.
*/
PrairieDraw.prototype.angleOf = function(vec) {
    return Math.atan2(vec.e(2), vec.e(1));
}

/** Return the sign of the argument.

    @param {number} x The argument to find the sign of.
    @return {number} Either -1/0/+1 if x is negative/zero/positive.
*/
PrairieDraw.prototype.sign = function(x) {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    } else {
        return 0;
    }
}

/** Linearly interpolate between two numbers.

    @param {number} x0 The first number.
    @param {number} x1 The second number.
    @param {number} alpha The proportion of x1 versus x0 (between 0 and 1).
    @return {number} The quanity (1 - alpha) * x0 + alpha * x1.
*/
PrairieDraw.prototype.linearInterp = function(x0, x1, alpha) {
    return (1 - alpha) * x0 + alpha * x1;
}

/*****************************************************************************/

/** Draw a point.

    @param {Vector} pos Position of the point.
*/
PrairieDraw.prototype.point = function(pos) {
    var x = pos.e(1) * this._scale;
    var y = pos.e(2) * this._scale;
    this._ctx.beginPath();
    this._ctx.arc(x, y, this._props.pointRadius, 0, 2 * Math.PI);
    this._ctx.fillStyle = this._props.shapeOutlineColor;
    this._ctx.fill();
}

/*****************************************************************************/

/** @private Set the stroke/fill styles for drawing lines.

    @param {string} type The type of line being drawn.
*/
PrairieDraw.prototype._setLineStyles = function(type) {
    if (type) {
        var col = type + "Color";
        if (col in this._props) {
            this._ctx.strokeStyle = this._props[col];
            this._ctx.fillStyle = this._props[col];
        } else {
            throw new Error("PrairieDraw: unknown type: " + type);
        }
    } else {
        this._ctx.strokeStyle = "rgb(0, 0, 0)";
        this._ctx.fillStyle = "rgb(0, 0, 0)";
    }
}

/** Draw a single line given start and end positions.

    @param {Vector} start Initial point of the line (drawing coords).
    @param {Vector} end Final point of the line (drawing coords).
    @param {string} type Optional type of line being drawn.
*/
PrairieDraw.prototype.line = function(start, end, type) {
    var x0 = start.e(1) * this._scale;
    var y0 = start.e(2) * this._scale;
    var x1 = end.e(1) * this._scale;
    var y1 = end.e(2) * this._scale;
    this._ctx.save();
    this._setLineStyles(type);
    this._ctx.beginPath();
    this._ctx.moveTo(x0, y0);
    this._ctx.lineTo(x1, y1);
    this._ctx.stroke();
    this._ctx.restore();
}

/*****************************************************************************/

/** @private Draw an arrowhead.

    @param {Vector} pos Position of the tip (drawing coords).
    @param {Vector} dir Direction vector that the arrowhead point in (drawing coords).
    @param {number} len Length of the arrowhead (pixel coords).
*/
PrairieDraw.prototype._arrowhead = function(pos, dir, len) {
    var dx = - (1 - this._props.arrowheadOffsetRatio) * len;
    var dy = this._props.arrowheadWidthRatio * len;
    
    this.save();
    this.translate(pos);
    this.rotate(Math.atan2(dir.e(2), dir.e(1)));
    this._ctx.beginPath();
    this._ctx.moveTo(0, 0);
    this._ctx.lineTo(-len, dy);
    this._ctx.lineTo(dx, 0);
    this._ctx.lineTo(-len, -dy);
    this._ctx.closePath();
    this._ctx.fill();
    this.restore();
}

/** Draw an arrow given start position and offset.

    @param {Vector} start Initial point of the arrow (drawing coords).
    @param {Vector} end Final point of the arrow (drawing coords).
    @param {string} type Optional type of vector being drawn.
*/
PrairieDraw.prototype.arrow = function(start, end, type) {
    this.save();
    this._ctx.lineWidth = this._props.arrowLineWidth;
    this._setLineStyles(type);

    var offset = end.subtract(start);
    var arrowLength = offset.modulus() * this._scale;
    if (arrowLength < 1) {
        // if too short, just draw a simple line
        this.line(start, end);
        return;
    }

    var arrowheadLength = Math.min(this._props.arrowheadLength, arrowLength / 2);
    var arrowheadCenterLength = (1 - this._props.arrowheadOffsetRatio) * arrowheadLength;
    var lineLength = arrowLength - arrowheadCenterLength;
    var lineEnd = start.add(offset.x(lineLength / arrowLength));
    this.line(start, lineEnd, type);
    this._arrowhead(end, offset, arrowheadLength);
    this.restore();
}

/*****************************************************************************/

/** Draw a circle arrow.

    @param {Vector} pos The center of the circle arrow.
    @param {number} rad The radius at the mid-angle.
    @param {number} startAngle The starting angle (counterclockwise from x axis, in radians).
    @param {number} endAngle The ending angle (counterclockwise from x axis, in radians).
    @param {string} type Optional type of the arrow.
*/
PrairieDraw.prototype.circleArrow = function(pos, rad, startAngle, endAngle, type) {
    this.save();
    this._ctx.lineWidth = this._props.arrowLineWidth;
    this._setLineStyles(type);

    var radius = rad * this._scale;
    var startRadius = this._circleArrowRadius(radius, startAngle, startAngle, endAngle);
    var endRadius = this._circleArrowRadius(radius, endAngle, startAngle, endAngle);
    var arrowLength = radius * Math.abs(endAngle - startAngle);
    var arrowheadLength = Math.min(this._props.arrowheadLength, arrowLength / 2);
    var arrowheadCenterLength = (1 - this._props.arrowheadOffsetRatio) * arrowheadLength;
    var arrowheadExtraCenterLength = (1 - this._props.arrowheadOffsetRatio / 3) * arrowheadLength;
    var arrowheadAngle = arrowheadCenterLength / endRadius;
    var arrowheadExtraAngle = arrowheadExtraCenterLength / endRadius;
    var preEndAngle = endAngle - this.sign(endAngle - startAngle) * arrowheadAngle;
    var arrowBaseAngle = endAngle - this.sign(endAngle - startAngle) * arrowheadExtraAngle;

    this.translate(pos);
    var idealSegmentSize = 0.2; // radians
    var numSegments = Math.ceil(Math.abs(preEndAngle - startAngle) / idealSegmentSize);
    var i, angle, r;
    var p = this.vector2DAtAngle(startAngle).x(startRadius);
    this._ctx.beginPath();
    this._ctx.moveTo(p.e(1), p.e(2));
    for (i = 1; i <= numSegments; i++) {
        angle = this.linearInterp(startAngle, preEndAngle, i / numSegments);
        r = this._circleArrowRadius(radius, angle, startAngle, endAngle);
        p = this.vector2DAtAngle(angle).x(r);
        this._ctx.lineTo(p.e(1), p.e(2));
    }
    this._ctx.stroke();

    var arrowBaseRadius = this._circleArrowRadius(radius, arrowBaseAngle, startAngle, endAngle);
    var arrowPos = this.vector2DAtAngle(endAngle).x(endRadius / this._scale);
    var arrowBasePos = this.vector2DAtAngle(arrowBaseAngle).x(arrowBaseRadius / this._scale);
    this._arrowhead(arrowPos, arrowPos.subtract(arrowBasePos), arrowheadLength);

    this.restore();
}

/** @private Compute the radius at a certain angle within a circle arrow.

    @param {number} midRad The radius at the midpoint of the circle arrow.
    @param {number} angle The angle at which to find the radius.
    @param {number} startAngle The starting angle (counterclockwise from x axis, in radians).
    @param {number} endAngle The ending angle (counterclockwise from x axis, in radians).
    @return {number} The radius at the given angle.
*/
PrairieDraw.prototype._circleArrowRadius = function(midRad, angle, startAngle, endAngle) {
    if (Math.abs(endAngle - startAngle) < 1e-4) {
        return midRad;
    }
    var spacing = this._props.arrowheadLength
        * this._props.arrowheadWidthRatio * this._props.circleArrowWrapOffsetRatio;
    var circleArrowWrapDensity = midRad * Math.PI * 2 / spacing;
    var midAngle = (startAngle + endAngle) / 2;
    var offsetAngle = (angle - midAngle) * this.sign(endAngle - startAngle);
    if (offsetAngle > 0) {
        return midRad * (1 + offsetAngle / circleArrowWrapDensity);
    } else {
        return midRad * Math.exp(offsetAngle / circleArrowWrapDensity);
    }
}

/*****************************************************************************/

/** Draw a rod with hinge points at start and end and the given width.

    @param {Vector} start The first hinge point (center of circular end) in drawing coordinates.
    @param {Vector} start The second hinge point (drawing coordinates).
    @param {number} width The width of the rod (drawing coordinates).
*/
PrairieDraw.prototype.rod = function(start, end, width) {
    this.save();
    var offset = end.subtract(start)
    var r = width / 2 * this._scale;
    var length = offset.modulus() * this._scale;
    this.translate(start);
    this.rotate(this.angleOf(offset));
    this._ctx.beginPath();
    this._ctx.moveTo(0, r);
    this._ctx.arcTo(length + r, r, length + r, -r, r);
    this._ctx.arcTo(length + r, -r, 0, -r, r);
    this._ctx.arcTo(-r, -r, -r, r, r);
    this._ctx.arcTo(-r, r, 0, r, r);
    this._ctx.lineWidth = this._props.shapeStrokeWidth;
    this._ctx.strokeStyle = this._props.shapeOutlineColor;
    this._ctx.fillStyle = this._props.shapeInsideColor;
    this._ctx.fill();
    this._ctx.stroke();
    this.restore();
}

/** Draw a pivot.

    @param {Vector} base The center of the base (drawing coordinates).
    @param {Vector} hinge The hinge point (center of circular end) in drawing coordinates.
    @param {number} width The width of the pivot (drawing coordinates).
*/
PrairieDraw.prototype.pivot = function(base, hinge, width) {
    this.save();
    var r = width / 2 * this._scale;
    var offset = hinge.subtract(base)
    var length = offset.modulus() * this._scale;
    this.translate(base);
    this.rotate(this.angleOf(offset));
    this._ctx.beginPath();
    this._ctx.moveTo(0, r);
    this._ctx.arcTo(length + r, r, length + r, -r, r);
    this._ctx.arcTo(length + r, -r, 0, -r, r);
    this._ctx.lineTo(0, -r);
    this._ctx.closePath();
    this._ctx.lineWidth = this._props.shapeStrokeWidth;
    this._ctx.strokeStyle = this._props.shapeOutlineColor;
    this._ctx.fillStyle = this._props.shapeInsideColor;
    this._ctx.fill();
    this._ctx.stroke();
    this.restore();
}

/** Draw a square from the base point and center.

    @param {Vector} base The mid-point of the base (drawing coordinates).
    @param {Vector} center The center of the square (drawing coordinates).
*/
PrairieDraw.prototype.square = function(base, center) {
    this.save();
    var offset = center.subtract(base)
    var r = offset.modulus() * this._scale;
    this.translate(base);
    this.rotate(this.angleOf(offset));
    this._ctx.beginPath();
    this._ctx.rect(0, -r, 2 * r, 2 * r);
    this._ctx.lineWidth = this._props.shapeStrokeWidth;
    this._ctx.strokeStyle = this._props.shapeOutlineColor;
    this._ctx.fillStyle = this._props.shapeInsideColor;
    this._ctx.fill();
    this._ctx.stroke();
    this.restore();
}

/** Draw a ground element.

    @param {Vector} pos The position of the ground center (drawing coordinates).
    @param {Vector} norm The outward normal (drawing coordinates).
    @param (number} length The total length of the ground segment.
*/
PrairieDraw.prototype.ground = function(pos, norm, length) {
    this.save();
    this.translate(pos);
    this.rotate(this.angleOf(norm) - Math.PI/2);
    this._ctx.beginPath();
    this._ctx.rect(-length/2 * this._scale, -this._props.groundDepth,
                   length * this._scale, this._props.groundDepth);
    this._ctx.fillStyle = this._props.groundInsideColor;
    this._ctx.fill();
    this._ctx.lineWidth = this._props.shapeStrokeWidth;
    this._ctx.strokeStyle = this._props.groundOutlineColor;
    this.line($V([-length/2, 0]), $V([length/2, 0]));
    this.restore();
}

/*****************************************************************************/

/** Draw text.

    @param {Vector} pos The position to draw at.
    @param {Vector} anchor The anchor on the text that will be located at pos (in -1 to 1 local coordinates).
    @param {string} text The text to draw. If text begins with "TEX:" then it is interpreted as LaTeX.
*/
PrairieDraw.prototype.text = function(pos, anchor, text) {
    if (text.slice(0,4) == "TEX:") {
        var tex_text = text.slice(4);
        var hash = Sha1.hash(tex_text);
        this._texts = this._texts || {};
        if (hash in this._texts) {
            var img = this._texts[hash];
            var x =  - (anchor.e(1) + 1) / 2 * img.width;
            var y = (anchor.e(2) - 1) / 2 * img.height;
            var offset = anchor.toUnitVector().x(Math.abs(anchor.max()) * this._props.textOffset);
            this._ctx.save();
            this._ctx.translate(pos.e(1) * this._scale, pos.e(2) * this._scale);
            this._ctx.scale(1, -1);
            this._ctx.drawImage(img, x - offset.e(1), y + offset.e(2));
            this._ctx.restore();
        } else {
            var imgSrc = "text/" + hash + ".png";
            var img = new Image();
            img.onload = this.redraw.bind(this);
            img.src = imgSrc;
            this._texts[hash] = img;
        }
    } else {
        var align, baseline;
        switch (anchor.e(1)) {
        case -1: align = "left"; break;
        case  0: align = "center"; break;
        case  1: align = "right"; break;
        default: throw new Error("PrairieDraw: non-tex text must have x anchor of -1, 0, or 1");
        }
        switch (anchor.e(2)) {
        case -1: baseline = "bottom"; break;
        case  0: baseline = "middle"; break;
        case  1: baseline = "top"; break;
        default: throw new Error("PrairieDraw: non-tex text must have y anchor of -1, 0, or 1");
        }
        this._ctx.save();
        this._ctx.textAlign = align;
        this._ctx.textBaseline = baseline;
        this._ctx.translate(pos.e(1) * this._scale, pos.e(2) * this._scale);
        this._ctx.scale(1, -1);
        var offset = anchor.toUnitVector().x(Math.abs(anchor.max()) * this._props.textOffset);
        this._ctx.fillText(text, - offset.e(1), offset.e(2));
        this._ctx.restore();
    }
}

/** Draw text to label a line.

    @param {Vector} start The start position of the line.
    @param {Vector} end The end position of the line.
    @param {Vector} pos The position relative to the line (-1 to 1 local coordinates, x along the line, y orthogonal).
    @param {string} text The text to draw.
*/
PrairieDraw.prototype.labelLine = function(start, end, pos, text) {
    var midpoint = (start.add(end)).x(0.5);
    var offset = end.subtract(start).x(0.5);
    var p = midpoint.add(offset.x(pos.e(1)));
    var u1 = offset.toUnitVector();
    var u2 = u1.rotate(Math.PI/2, $V([0,0]));
    var o = u1.x(pos.e(1)).add(u2.x(pos.e(2)));
    var a = o.x(-1).toUnitVector().x(Math.abs(pos.max()));
    this.text(p, a, text);
}

/*****************************************************************************/

PrairieDraw.prototype.numDiff = function(f, t) {
    var eps = 1e-4;

    var x0 = f(t - eps);
    var x1 = f(t);
    var x2 = f(t + eps);
    var d = {}
    d.diff = {};
    d.ddiff = {};
    for (e in x0) {
        if (x0[e] instanceof Vector) {
            d[e] = x1[e];
            d.diff[e] = x1[e].subtract(x0[e]).x(1 / eps);
            d.ddiff[e] = x2[e].subtract(x1[e].x(2)).add(x0[e]).x(1 / (eps * eps));
        } else {
            d[e] = x1[e];
            d.diff[e] = (x1[e] - x0[e]) / eps;
            d.ddiff[e] = (x2[e] - 2 * x1[e] + x0[e]) / (eps * eps);
        }
    }
    return d;
}

/*****************************************************************************/

/** Creates a PrairieDrawAnim object.

    @constructor
    @this {PrairieDraw}
    @param {HTMLCanvasElement or string} canvas The canvas element to draw on or the ID of the canvas elemnt.
    @param {Function} drawfcn An optional function that draws on the canvas at time t.
*/
function PrairieDrawAnim(canvas, drawFcn) {
    PrairieDraw.call(this, canvas, null);
    this._drawTime = 0;
    this._running = false;
    if (drawFcn) {
        this.draw = drawFcn;
    }
    this.draw(0);

    this._canvas.animator = this;
}
PrairieDrawAnim.prototype = new PrairieDraw;

/** Prototype function to draw on the canvas, should be implemented by children.

    @param {number} t Current animation time in seconds.
*/
PrairieDrawAnim.prototype.draw = function(t) {
}

/** Start the animation.
*/
PrairieDrawAnim.prototype.startAnim = function() {
    this._running = true;
    this._startFrame = true;
    this._requestAnimationFrame.call(window, this._callback.bind(this));
}

/** Stop the animation.
*/
PrairieDrawAnim.prototype.stopAnim = function() {
    this._running = false;
}

/** Toggle the animation.
*/
PrairieDrawAnim.prototype.toggleAnim = function() {
    if (this._running) {
        this.stopAnim();
    } else {
        this.startAnim();
    }
}

/** @private Callback function to handle the animationFrame events.
*/
PrairieDrawAnim.prototype._callback = function(t_ms) {
    if (this._startFrame) {
        this._startFrame = false;
        this._timeOffset = t_ms - this._drawTime;
    }
    var simTime = t_ms - this._timeOffset;
    this._drawTime = simTime;
    this.draw(simTime / 1000);
    if (this._running) {
        this._requestAnimationFrame.call(window, this._callback.bind(this));
    }
}

/** Redraw the drawing at the current time.
*/
PrairieDrawAnim.prototype.redraw = function() {
    if (!this._running) {
        this.draw(this._drawTime / 1000);
    }
}

/** Reset the simulation time to zero.
*/
PrairieDrawAnim.prototype.resetTime = function() {
    this._drawTime = 0;
    this._startFrame = true;
    this.redraw();
}

/*****************************************************************************/

/** Interpolate between different states in a sequence.

    @param {Array}
*/
PrairieDrawAnim.prototype.sequence = function(states, transTimes, holdTimes, t) {
    var totalTime = 0;
    var i;
    for (i = 0; i < states.length; i++) {
        totalTime += transTimes[i];
        totalTime += holdTimes[i];
    }
    var ts = t % totalTime;
    totalTime = 0;
    var state = {};
    var e, ip;
    var lastTotalTime = 0;
    for (i = 0; i < states.length; i++) {
        ip = i == states.length - 1 ? 0 : i + 1;
        totalTime += transTimes[i];
        if (totalTime > ts) {
            // in transition from i to i+1
            state.t = ts - lastTotalTime;
            state.index = i;
            state.alpha = state.t / (totalTime - lastTotalTime);
            for (e in states[i]) {
                state[e] = this.linearInterp(states[i][e], states[ip][e], state.alpha);
            }
            return state;
        }
        lastTotalTime = totalTime;
        totalTime += holdTimes[i];
        if (totalTime > ts) {
            // holding at i+1
            state.t = 0;
            state.index = ip;
            for (e in states[i]) {
                state[e] = states[ip][e];
            }
            return state;
        }
        lastTotalTime = totalTime;
    }
}

/*****************************************************************************/
