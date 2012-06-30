
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
        this._canvas.prairieDraw = this;

        /** @private */ this._ctx = this._canvas.getContext('2d');
        /** @private */ this._width = this._canvas.width;
        /** @private */ this._height = this._canvas.height;

        /** @private */ this._trans = Matrix.I(3);
        /** @private */ this._transStack = [];

        /** @private */ this._props = {};
        this._initProps();
        /** @private */ this._propStack = [];

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

    this._props.arrowLineWidthPx = 2;
    this._props.arrowheadLengthRatio = 7; // arrowheadLength / arrowLineWidth
    this._props.arrowheadWidthRatio = 0.3; // arrowheadWidth / arrowheadLength
    this._props.arrowheadOffsetRatio = 0.3; // arrowheadOffset / arrowheadLength
    this._props.circleArrowWrapOffsetRatio = 1.5;

    this._props.textOffsetPx = 4;

    this._props.pointRadiusPx = 2;

    this._props.shapeStrokeWidthPx = 2;
    this._props.shapeOutlineColor = "rgb(0, 0, 0)";
    this._props.shapeInsideColor = "rgb(255, 255, 255)";

    this._props.groundDepthPx = 10;
    this._props.groundOutlineColor = "rgb(0, 0, 0)";
    this._props.groundInsideColor = "rgb(220, 220, 220)";

    this._props.gridColor = "rgb(200, 200, 200)";
    this._props.positionColor = "rgb(0, 0, 255)";
    this._props.velocityColor = "rgb(0, 200, 0)";
    this._props.accelerationColor = "rgb(255, 0, 255)";
    this._props.angMomColor = "rgb(255, 0, 0)";
    this._props.forceColor = "rgb(210, 105, 30)";
}

/*****************************************************************************/

/** The golden ratio.
*/
PrairieDraw.prototype.goldenRatio = (1 + Math.sqrt(5)) / 2;

/** Scale the coordinate system.

    @param {Vector} factor Scale factors.
*/
PrairieDraw.prototype.scale = function(factor) {
    this._trans = this._trans.x($M([[factor.e(1), 0, 0], [0, factor.e(2), 0], [0, 0, 1]]));
}

/** Translate the coordinate system.

    @param {Vector} offset Translation offset (drawing coords).
*/
PrairieDraw.prototype.translate = function(offset) {
    this._trans = this._trans.x($M([[1, 0, offset.e(1)], [0, 1, offset.e(2)], [0, 0, 1]]));
}

/** Rotate the coordinate system.

    @param {number} angle Angle to rotate by (radians).
*/
PrairieDraw.prototype.rotate = function(angle) {
    this._trans = this._trans.x(Matrix.RotationZ(angle));
}

/** Transform a vector from drawing to pixel coords.

    @param {Vector} vDw Vector in drawing coords.
    @return {Vector} Vector in pixel coords.
*/
PrairieDraw.prototype.vec2Px = function(vDw) {
    var vPx3 = this._trans.x($V([vDw.e(1), vDw.e(2), 0]))
    return $V([vPx3.e(1), vPx3.e(2)]);
}

/** Transform a position from drawing to pixel coords.

    @param {Vector} pDw Position in drawing coords.
    @return {Vector} Position in pixel coords.
*/
PrairieDraw.prototype.pos2Px = function(pDw) {
    var pPx3 = this._trans.x($V([pDw.e(1), pDw.e(2), 1]))
    return $V([pPx3.e(1), pPx3.e(2)]);
}

/** Transform a vector from pixel to drawing coords.

    @param {Vector} vPx Vector in pixel coords.
    @return {Vector} Vector in drawing coords.
*/
PrairieDraw.prototype.vec2Dw = function(vPx) {
    var vDw3 = this._trans.inverse().x($V([vPx.e(1), vPx.e(2), 0]))
    return $V([vDw3.e(1), vDw3.e(2)]);
}

/** Transform a position from pixel to drawing coords.

    @param {Vector} pPx Position in pixel coords.
    @return {Vector} Position in drawing coords.
*/
PrairieDraw.prototype.pos2Dw = function(pPx) {
    var pDw3 = this._trans.inverse().x($V([pPx.e(1), pPx.e(2), 1]))
    return $V([pDw3.e(1), pDw3.e(2)]);
}

/** @private Returns true if the current transformation is a reflection.

    @return {bool} Whether the current transformation is a reflection.
*/
PrairieDraw.prototype._transIsReflection = function() {
    var det = this._trans.e(1, 1) * this._trans.e(2, 2) - this._trans.e(1, 2) * this._trans.e(2, 1);
    if (det < 0) {
        return true;
    } else {
        return false;
    }
}

/** Transform a position from normalized viewport [0,1] to drawing coords.

    @param {Vector} pNm Position in normalized viewport coordinates.
    @return {Vector} Position in drawing coordinates.
*/
PrairieDraw.prototype.posNm2Dw = function(pNm) {
    var pPx = this.posNm2Px(pNm);
    return this.pos2Dw(pPx);
}

/** Transform a position from normalized viewport [0,1] to pixel coords.

    @param {Vector} pNm Position in normalized viewport coords.
    @return {Vector} Position in pixel coords.
*/
PrairieDraw.prototype.posNm2Px = function(pNm) {
    return $V([pNm.e(1) * this._width, (1 - pNm.e(2)) * this._height]);
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

/** Save the graphics state (properties, options, and transformations).

    @see restore().
*/
PrairieDraw.prototype.save = function() {
    this._ctx.save();
    var oldProps = {};
    for (p in this._props) {
        oldProps[p] = this._props[p];
    }
    this._propStack.push(oldProps);
    this._transStack.push(this._trans.dup());
}

/** Restore the graphics state (properties, options, and transformations).

    @see save().
*/
PrairieDraw.prototype.restore = function() {
    this._ctx.restore();
    if (this._propStack.length == 0) {
        throw new Error("PrairieDraw: tried to restore() without corresponding save()");
    }
    if (this._propStack.length != this._transStack.length) {
        throw new Error("PrairieDraw: incompatible save stack lengths");
    }
    this._props = this._propStack.pop();
    this._trans = this._transStack.pop();
}

/*****************************************************************************/

/** Reset the canvas image and drawing context.
*/
PrairieDraw.prototype.resetDrawing = function() {
    while (this._propStack.length > 0) {
        this.restore();
    }
    this._ctx.clearRect(0, 0, this._width, this._height);
}

/** Reset everything to the intial state.
*/
PrairieDraw.prototype.reset = function() {
    this._options = {};
    this.redraw();
}

/** Stop all action and computation.
*/
PrairieDraw.prototype.stop = function() {
}

/*****************************************************************************/

/** Set the visable coordinate sizes.

    @param {number} xSize The horizontal size of the drawing area in coordinate units.
    @param {number} ySize The vertical size of the drawing area in coordinate units.
    @param {bool} preserveCanvasSize If true, do not resize the canvas to match the coordinate ratio.
*/
PrairieDraw.prototype.setUnits = function(xSize, ySize, preserveCanvasSize) {
    this.resetDrawing();
    this.save();
    var xScale = this._width / xSize;
    var yScale = this._height / ySize
    if (xScale < yScale) {
        /** @private */ this._scale = xScale;
        if ((!preserveCanvasSize) && (xScale != yScale)) {
            var newHeight = xScale * ySize;
            this._canvas.height = newHeight;
            this._height = newHeight;
        }
        this.translate($V([this._width / 2, this._height / 2]));
        this.scale($V([1, -1]));
        this.scale($V([xScale, xScale]));
    } else {
        /** @private */ this._scale = yScale;
        if ((!preserveCanvasSize) && (xScale != yScale)) {
            var newWidth = yScale * xSize;
            this._canvas.width = newWidth;
            this._width = newWidth;
        }
        this.translate($V([this._width / 2, this._height / 2]));
        this.scale($V([1, -1]));
        this.scale($V([yScale, yScale]));
    }
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

    @param {Vector} posDw Position of the point (drawing coords).
*/
PrairieDraw.prototype.point = function(posDw) {
    var posPx = this.pos2Px(posDw);
    this._ctx.beginPath();
    this._ctx.arc(posPx.e(1), posPx.e(2), this._props.pointRadiusPx, 0, 2 * Math.PI);
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

    @param {Vector} startDw Initial point of the line (drawing coords).
    @param {Vector} endDw Final point of the line (drawing coords).
    @param {string} type Optional type of line being drawn.
*/
PrairieDraw.prototype.line = function(startDw, endDw, type) {
    var startPx = this.pos2Px(startDw);
    var endPx = this.pos2Px(endDw);
    this._ctx.save();
    this._setLineStyles(type);
    this._ctx.beginPath();
    this._ctx.moveTo(startPx.e(1), startPx.e(2));
    this._ctx.lineTo(endPx.e(1), endPx.e(2));
    this._ctx.stroke();
    this._ctx.restore();
}

/*****************************************************************************/

/** @private Draw an arrowhead.

    @param {Vector} posDw Position of the tip (drawing coords).
    @param {Vector} dirDw Direction vector that the arrowhead point in (drawing coords).
    @param {number} lenPx Length of the arrowhead (pixel coords).
*/
PrairieDraw.prototype._arrowhead = function(posDw, dirDw, lenPx) {
    var posPx = this.pos2Px(posDw);
    var dirPx = this.vec2Px(dirDw);
    var dxPx = - (1 - this._props.arrowheadOffsetRatio) * lenPx;
    var dyPx = this._props.arrowheadWidthRatio * lenPx;
    
    this._ctx.save();
    this._ctx.translate(posPx.e(1), posPx.e(2));
    this._ctx.rotate(this.angleOf(dirPx));
    this._ctx.beginPath();
    this._ctx.moveTo(0, 0);
    this._ctx.lineTo(-lenPx, dyPx);
    this._ctx.lineTo(dxPx, 0);
    this._ctx.lineTo(-lenPx, -dyPx);
    this._ctx.closePath();
    this._ctx.fill();
    this._ctx.restore();
}

/** Draw an arrow given start position and offset.

    @param {Vector} startDw Initial point of the arrow (drawing coords).
    @param {Vector} endDw Final point of the arrow (drawing coords).
    @param {string} type Optional type of vector being drawn.
*/
PrairieDraw.prototype.arrow = function(startDw, endDw, type) {
    var startPx = this.pos2Px(startDw);
    var endPx = this.pos2Px(endDw);

    this.save();
    this._ctx.lineWidth = this._props.arrowLineWidthPx;
    this._setLineStyles(type);

    var offsetDw = endDw.subtract(startDw);
    var offsetPx = endPx.subtract(startPx);
    var arrowLengthPx = offsetPx.modulus();
    if (arrowLengthPx < 1) {
        // if too short, just draw a simple line
        this.line(startDw, endDw);
        return;
    }

    var arrowheadMaxLengthPx = this._props.arrowheadLengthRatio * this._props.arrowLineWidthPx;
    var arrowheadLengthPx = Math.min(arrowheadMaxLengthPx, arrowLengthPx / 2);
    var arrowheadCenterLengthPx = (1 - this._props.arrowheadOffsetRatio) * arrowheadLengthPx;
    var lineLengthPx = arrowLengthPx - arrowheadCenterLengthPx;
    var lineEndDw = startDw.add(offsetDw.x(lineLengthPx / arrowLengthPx));
    this.line(startDw, lineEndDw, type);
    this._arrowhead(endDw, offsetDw, arrowheadLengthPx);
    this.restore();
}

/*****************************************************************************/

/** Draw a circle arrow.

    @param {Vector} posDw The center of the circle arrow.
    @param {number} radDw The radius at the mid-angle.
    @param {number} startAngleDw The starting angle (counterclockwise from x axis, in radians).
    @param {number} endAngleDw The ending angle (counterclockwise from x axis, in radians).
    @param {string} type Optional type of the arrow.
*/
PrairieDraw.prototype.circleArrow = function(posDw, radDw, startAngleDw, endAngleDw, type) {
    this.save();
    this._ctx.lineWidth = this._props.arrowLineWidthPx;
    this._setLineStyles(type);

    // convert to Px coordinates
    var startOffsetDw = this.vector2DAtAngle(startAngleDw).x(radDw);
    var posPx = this.pos2Px(posDw);
    var startOffsetPx = this.vec2Px(startOffsetDw);
    var radiusPx = startOffsetPx.modulus();
    var startAnglePx = this.angleOf(startOffsetPx);
    var deltaAngleDw = endAngleDw - startAngleDw;
    // assume a possibly reflected/rotated but equally scaled Dw/Px transformation
    var deltaAnglePx = this._transIsReflection() ? (- deltaAngleDw) : deltaAngleDw;
    var endAnglePx = startAnglePx + deltaAnglePx;

    // compute arrowhead properties
    var startRadiusPx = this._circleArrowRadius(radiusPx, startAnglePx, startAnglePx, endAnglePx);
    var endRadiusPx = this._circleArrowRadius(radiusPx, endAnglePx, startAnglePx, endAnglePx);
    var arrowLengthPx = radiusPx * Math.abs(endAnglePx - startAnglePx);
    var arrowheadMaxLengthPx = this._props.arrowheadLengthRatio * this._props.arrowLineWidthPx;
    var arrowheadLengthPx = Math.min(arrowheadMaxLengthPx, arrowLengthPx / 2);
    var arrowheadCenterLengthPx = (1 - this._props.arrowheadOffsetRatio) * arrowheadLengthPx;
    var arrowheadExtraCenterLengthPx = (1 - this._props.arrowheadOffsetRatio / 3) * arrowheadLengthPx;
    var arrowheadAnglePx = arrowheadCenterLengthPx / endRadiusPx;
    var arrowheadExtraAnglePx = arrowheadExtraCenterLengthPx / endRadiusPx;
    var preEndAnglePx = endAnglePx - this.sign(endAnglePx - startAnglePx) * arrowheadAnglePx;
    var arrowBaseAnglePx = endAnglePx - this.sign(endAnglePx - startAnglePx) * arrowheadExtraAnglePx;

    this._ctx.save();
    this._ctx.translate(posPx.e(1), posPx.e(2));
    var idealSegmentSize = 0.2; // radians
    var numSegments = Math.ceil(Math.abs(preEndAnglePx - startAnglePx) / idealSegmentSize);
    var i, anglePx, rPx;
    var offsetPx = this.vector2DAtAngle(startAnglePx).x(startRadiusPx);
    this._ctx.beginPath();
    this._ctx.moveTo(offsetPx.e(1), offsetPx.e(2));
    for (i = 1; i <= numSegments; i++) {
        anglePx = this.linearInterp(startAnglePx, preEndAnglePx, i / numSegments);
        rPx = this._circleArrowRadius(radiusPx, anglePx, startAnglePx, endAnglePx);
        offsetPx = this.vector2DAtAngle(anglePx).x(rPx);
        this._ctx.lineTo(offsetPx.e(1), offsetPx.e(2));
    }
    this._ctx.stroke();
    this._ctx.restore();

    var arrowBaseRadiusPx = this._circleArrowRadius(radiusPx, arrowBaseAnglePx, startAnglePx, endAnglePx);
    var arrowPosPx = posPx.add(this.vector2DAtAngle(endAnglePx).x(endRadiusPx));
    var arrowBasePosPx = posPx.add(this.vector2DAtAngle(arrowBaseAnglePx).x(arrowBaseRadiusPx));
    var arrowDirPx = arrowPosPx.subtract(arrowBasePosPx)
    var arrowPosDw = this.pos2Dw(arrowPosPx);
    var arrowDirDw = this.vec2Dw(arrowDirPx);
    this._arrowhead(arrowPosDw, arrowDirDw, arrowheadLengthPx);

    this.restore();
}

/** @private Compute the radius at a certain angle within a circle arrow.

    @param {number} midRadPx The radius at the midpoint of the circle arrow.
    @param {number} anglePx The angle at which to find the radius.
    @param {number} startAnglePx The starting angle (counterclockwise from x axis, in radians).
    @param {number} endAnglePx The ending angle (counterclockwise from x axis, in radians).
    @return {number} The radius at the given angle (pixel coords).
*/
PrairieDraw.prototype._circleArrowRadius = function(midRadPx, anglePx, startAnglePx, endAnglePx) {
    if (Math.abs(endAnglePx - startAnglePx) < 1e-4) {
        return midRadPx;
    }
    var arrowheadMaxLengthPx = this._props.arrowheadLengthRatio * this._props.arrowLineWidthPx;
    var spacingPx = arrowheadMaxLengthPx * this._props.arrowheadWidthRatio
        * this._props.circleArrowWrapOffsetRatio;
    var circleArrowWrapDensity = midRadPx * Math.PI * 2 / spacingPx;
    var midAnglePx = (startAnglePx + endAnglePx) / 2;
    var offsetAnglePx = (anglePx - midAnglePx) * this.sign(endAnglePx - startAnglePx);
    if (offsetAnglePx > 0) {
        return midRadPx * (1 + offsetAnglePx / circleArrowWrapDensity);
    } else {
        return midRadPx * Math.exp(offsetAnglePx / circleArrowWrapDensity);
    }
}

/*****************************************************************************/

/** Draw a rod with hinge points at start and end and the given width.

    @param {Vector} startDw The first hinge point (center of circular end) in drawing coordinates.
    @param {Vector} startDw The second hinge point (drawing coordinates).
    @param {number} widthDw The width of the rod (drawing coordinates).
*/
PrairieDraw.prototype.rod = function(startDw, endDw, widthDw) {
    var offsetLengthDw = endDw.subtract(startDw);
    var offsetWidthDw = offsetLengthDw.rotate(Math.PI/2, $V([0,0])).toUnitVector().x(widthDw);

    var startPx = this.pos2Px(startDw);
    var offsetLengthPx = this.vec2Px(offsetLengthDw);
    var offsetWidthPx = this.vec2Px(offsetWidthDw);
    var lengthPx = offsetLengthPx.modulus();
    var rPx = offsetWidthPx.modulus() / 2;

    this._ctx.save();
    this._ctx.translate(startPx.e(1), startPx.e(2));
    this._ctx.rotate(this.angleOf(offsetLengthPx));
    this._ctx.beginPath();
    this._ctx.moveTo(0, rPx);
    this._ctx.arcTo(lengthPx + rPx, rPx, lengthPx + rPx, -rPx, rPx);
    this._ctx.arcTo(lengthPx + rPx, -rPx, 0, -rPx, rPx);
    this._ctx.arcTo(-rPx, -rPx, -rPx, rPx, rPx);
    this._ctx.arcTo(-rPx, rPx, 0, rPx, rPx);
    this._ctx.lineWidth = this._props.shapeStrokeWidthPx;
    this._ctx.strokeStyle = this._props.shapeOutlineColor;
    this._ctx.fillStyle = this._props.shapeInsideColor;
    this._ctx.fill();
    this._ctx.stroke();
    this._ctx.restore();
}

/** Draw a pivot.

    @param {Vector} baseDw The center of the base (drawing coordinates).
    @param {Vector} hingeDw The hinge point (center of circular end) in drawing coordinates.
    @param {number} widthDw The width of the pivot (drawing coordinates).
*/
PrairieDraw.prototype.pivot = function(baseDw, hingeDw, widthDw) {
    var offsetLengthDw = hingeDw.subtract(baseDw);
    var offsetWidthDw = offsetLengthDw.rotate(Math.PI/2, $V([0,0])).toUnitVector().x(widthDw);

    var basePx = this.pos2Px(baseDw);
    var offsetLengthPx = this.vec2Px(offsetLengthDw);
    var offsetWidthPx = this.vec2Px(offsetWidthDw);
    var lengthPx = offsetLengthPx.modulus();
    var rPx = offsetWidthPx.modulus() / 2;

    this._ctx.save();
    this._ctx.translate(basePx.e(1), basePx.e(2));
    this._ctx.rotate(this.angleOf(offsetLengthPx));
    this._ctx.beginPath();
    this._ctx.moveTo(0, rPx);
    this._ctx.arcTo(lengthPx + rPx, rPx, lengthPx + rPx, -rPx, rPx);
    this._ctx.arcTo(lengthPx + rPx, -rPx, 0, -rPx, rPx);
    this._ctx.lineTo(0, -rPx);
    this._ctx.closePath();
    this._ctx.lineWidth = this._props.shapeStrokeWidthPx;
    this._ctx.strokeStyle = this._props.shapeOutlineColor;
    this._ctx.fillStyle = this._props.shapeInsideColor;
    this._ctx.fill();
    this._ctx.stroke();
    this._ctx.restore();
}

/** Draw a square with a given base point and center.

    @param {Vector} baseDw The mid-point of the base (drawing coordinates).
    @param {Vector} centerDw The center of the square (drawing coordinates).
*/
PrairieDraw.prototype.square = function(baseDw, centerDw) {
    var basePx = this.pos2Px(baseDw);
    var centerPx = this.pos2Px(centerDw);
    var offsetPx = centerPx.subtract(basePx);
    var rPx = offsetPx.modulus();
    this._ctx.save();
    this._ctx.translate(basePx.e(1), basePx.e(2));
    this._ctx.rotate(this.angleOf(offsetPx));
    this._ctx.beginPath();
    this._ctx.rect(0, -rPx, 2 * rPx, 2 * rPx);
    this._ctx.lineWidth = this._props.shapeStrokeWidthPx;
    this._ctx.strokeStyle = this._props.shapeOutlineColor;
    this._ctx.fillStyle = this._props.shapeInsideColor;
    this._ctx.fill();
    this._ctx.stroke();
    this._ctx.restore();
}

/** Draw a ground element.

    @param {Vector} posDw The position of the ground center (drawing coordinates).
    @param {Vector} normDw The outward normal (drawing coordinates).
    @param (number} lengthDw The total length of the ground segment.
*/
PrairieDraw.prototype.ground = function(posDw, normDw, lengthDw) {
    var tangentDw = normDw.rotate(Math.PI/2, $V([0,0])).toUnitVector().x(lengthDw);
    var posPx = this.pos2Px(posDw);
    var normPx = this.vec2Px(normDw);
    var tangentPx = this.vec2Px(tangentDw);
    var lengthPx = tangentPx.modulus();

    this._ctx.save();
    this._ctx.translate(posPx.e(1), posPx.e(2));
    this._ctx.rotate(this.angleOf(normPx) - Math.PI/2);
    this._ctx.beginPath();
    this._ctx.rect(-lengthPx / 2, -this._props.groundDepthPx,
                   lengthPx, this._props.groundDepthPx);
    this._ctx.fillStyle = this._props.groundInsideColor;
    this._ctx.fill();

    this._ctx.beginPath();
    this._ctx.moveTo(- lengthPx / 2, 0);
    this._ctx.lineTo(lengthPx / 2, 0);
    this._ctx.lineWidth = this._props.shapeStrokeWidthPx;
    this._ctx.strokeStyle = this._props.groundOutlineColor;
    this._ctx.stroke();
    this._ctx.restore();
}

/*****************************************************************************/

/** Draw text.

    @param {Vector} posDw The position to draw at.
    @param {Vector} anchor The anchor on the text that will be located at pos (in -1 to 1 local coordinates).
    @param {string} text The text to draw. If text begins with "TEX:" then it is interpreted as LaTeX.
*/
PrairieDraw.prototype.text = function(posDw, anchor, text) {
    var posPx = this.pos2Px(posDw);
    if (text.slice(0,4) == "TEX:") {
        var tex_text = text.slice(4);
        var hash = Sha1.hash(tex_text);
        this._texts = this._texts || {};
        if (hash in this._texts) {
            var img = this._texts[hash];
            var xPx =  - (anchor.e(1) + 1) / 2 * img.width;
            var yPx = (anchor.e(2) - 1) / 2 * img.height;
            var offsetPx = anchor.toUnitVector().x(Math.abs(anchor.max()) * this._props.textOffsetPx);
            this._ctx.save();
            this._ctx.translate(posPx.e(1), posPx.e(2));
            this._ctx.drawImage(img, xPx - offsetPx.e(1), yPx + offsetPx.e(2));
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
        this._ctx.translate(posPx.e(1), posPx.e(2));
        var offsetPx = anchor.toUnitVector().x(Math.abs(anchor.max()) * this._props.textOffsetPx);
        this._ctx.fillText(text, - offsetPx.e(1), offsetPx.e(2));
        this._ctx.restore();
    }
}

/** Draw text to label a line.

    @param {Vector} startDw The start position of the line.
    @param {Vector} endDw The end position of the line.
    @param {Vector} pos The position relative to the line (-1 to 1 local coordinates, x along the line, y orthogonal).
    @param {string} text The text to draw.
*/
PrairieDraw.prototype.labelLine = function(startDw, endDw, pos, text) {
    var midpointDw = (startDw.add(endDw)).x(0.5);
    var offsetDw = endDw.subtract(startDw).x(0.5);
    var pDw = midpointDw.add(offsetDw.x(pos.e(1)));
    var u1Dw = offsetDw.toUnitVector();
    var u2Dw = u1Dw.rotate(Math.PI/2, $V([0,0]));
    var oDw = u1Dw.x(pos.e(1)).add(u2Dw.x(pos.e(2)));
    var a = oDw.x(-1).toUnitVector().x(Math.abs(pos.max()));
    this.text(pDw, a, text);
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
        this.draw = drawFcn.bind(this);
    }
    this.draw(0);
}
PrairieDrawAnim.prototype = new PrairieDraw;

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
PrairieDrawAnim.prototype._requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;

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
    var animTime = t_ms - this._timeOffset;
    this._drawTime = animTime;
    this.draw(animTime / 1000);
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

/** Reset the animation time to zero.
*/
PrairieDrawAnim.prototype.resetTime = function() {
    this._drawTime = 0;
    this._startFrame = true;
    this.redraw();
}

/** Reset everything to the intial state.
*/
PrairieDrawAnim.prototype.reset = function() {
    this._options = {};
    this.stopAnim();
    this.resetTime();
}

/** Stop all action and computation.
*/
PrairieDrawAnim.prototype.stop = function() {
    this.stopAnim();
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
