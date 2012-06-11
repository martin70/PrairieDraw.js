
function Pendulum(canvasId) {
    this.viewAngleX = 1;
    this.viewAngleZ = 0.6;

    this.fontscale = 0.5;

    this.tg = new drawUtils3D.TG(canvasId);
    this.cube = new drawUtils3D.Cube(this.tg, [0, 0.7, 1, 1]);
    this.angMom = new drawUtils3D.Line(this.tg, vec3.create([0, 0, 0]), vec3.create([0, 0, 1]), [1, 0, 0, 1]);
    this.vel = new drawUtils3D.Line(this.tg, vec3.create([0, 0, 0]), vec3.create([0, 0, 1]), [0, 1, 0, 1]);

    this.texO = new drawUtils3D.ImagePlane(this.tg, "tex/O_rescaled.png");
    this.texP = new drawUtils3D.ImagePlane(this.tg, "tex/P_rescaled.png");
    this.texv = new drawUtils3D.ImagePlane(this.tg, "tex/v_rescaled.png");
    this.texH = new drawUtils3D.ImagePlane(this.tg, "tex/H_rescaled.png");
    /*
    this.texO = new drawUtils3D.ImagePlane(this.tg, "tex/O_outline_rescaled.png");
    this.texP = new drawUtils3D.ImagePlane(this.tg, "tex/P_outline_rescaled.png");
    this.texv = new drawUtils3D.ImagePlane(this.tg, "tex/v_outline_rescaled.png");
    this.texH = new drawUtils3D.ImagePlane(this.tg, "tex/H_outline_rescaled.png");
    */
    this.square = new drawUtils3D.Square(this.tg, [0, 0, 0, 0.4]);
    this.xAxis = new drawUtils3D.Line(this.tg, vec3.create([-1, 0, 0]), vec3.create([1, 0, 0]), [0, 0, 0, 0.3]);
    this.yAxis = new drawUtils3D.Line(this.tg, vec3.create([0, -1, 0]), vec3.create([0, 1, 0]), [0, 0, 0, 0.3]);
    this.zAxis = new drawUtils3D.Line(this.tg, vec3.create([0, 0, -1]), vec3.create([0, 0, 1]), [0, 0, 0, 0.3]);

    drawUtils.Animator.call(this, canvasId, true);
    this.start();

    this.mouseDown = false;
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this), false);
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this), false);
}
Pendulum.prototype = new drawUtils.Animator;

Pendulum.prototype.handleMouseDown = function(event) {
    this.mouseDown = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
}

Pendulum.prototype.handleMouseUp = function(event) {
    this.mouseDown = false;
}

Pendulum.prototype.handleMouseMove = function(event) {
    if (!this.mouseDown) {
        return;
    }
    var deltaX = event.clientX - this.lastMouseX;
    var deltaY = event.clientY - this.lastMouseY;
    this.viewAngleX += -deltaY * 0.01;
    this.viewAngleZ += deltaX * 0.01;
    this.viewAngleX = Math.min(Math.PI/2, Math.max(0, this.viewAngleX));
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
}

Pendulum.prototype.draw = function(t) {
    this.tg.clear();

    var pMatrix = mat4.create();
    mat4.perspective(45, this.tg.aspectRatio, 0.1, 100.0, pMatrix);
    mat4.translate(pMatrix, [0, 0, -10]);
    mat4.rotate(pMatrix, this.viewAngleX, [-1, 0, 0]);
    mat4.rotate(pMatrix, this.viewAngleZ, [0, 0, 1]);
    this.tg.setPMatrix(pMatrix);

    var mvMatrix = mat4.create();

    // coordinate axes
    mat4.identity(mvMatrix);
    mat4.scale(mvMatrix, [3, 3, 3]);
    this.tg.setMVMatrix(mvMatrix);
    this.xAxis.draw();
    this.yAxis.draw();
    this.zAxis.draw();

    // x-y plane
    this.tg.enableTransparency();
    mat4.identity(mvMatrix);
    mat4.scale(mvMatrix, [2.5, 2.5, 2.5]);
    this.tg.setMVMatrix(mvMatrix);
    this.square.draw();
    this.tg.disableTransparency();

    var theta = Math.sin(t);
    var omega = Math.cos(t);
    var px = 2.15 * Math.sin(theta);
    var py = -2.15 * Math.cos(theta);
    var vx = 2.15 * Math.cos(theta) * omega;
    var vy = 2.15 * Math.sin(theta) * omega;

    // H vector
    this.angMom.newData(vec3.create([0, 0, 0]), vec3.create([0, 0, 2 * omega]), [1, 0, 0, 1]);
    mat4.identity(mvMatrix);
    this.tg.setMVMatrix(mvMatrix);
    this.tg.gl.lineWidth(4);
    this.tg.gl.disable(this.tg.gl.DEPTH_TEST);
    this.angMom.draw();
    this.tg.gl.enable(this.tg.gl.DEPTH_TEST);
    this.tg.gl.lineWidth(2);

    // v vector
    this.vel.newData(vec3.create([px, py, 0.02]), vec3.create([px + vx, py + vy, 0.02]), [0, 1, 0, 1]);
    mat4.identity(mvMatrix);
    this.tg.setMVMatrix(mvMatrix);
    this.vel.draw();

    // rod
    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, Math.sin(t), [0, 0, 1]);
    mat4.scale(mvMatrix, [0.05, 1, 0.05]);
    mat4.translate(mvMatrix, [0, -1, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.cube.draw();

    // mass
    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, Math.sin(t), [0, 0, 1]);
    mat4.translate(mvMatrix, [0, -2, 0]);
    mat4.scale(mvMatrix, [0.15, 0.15, 0.05]);
    mat4.translate(mvMatrix, [0, -1, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.cube.draw();

    // O label
    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, -this.viewAngleZ, [0, 0, 1]);
    mat4.rotate(mvMatrix, -this.viewAngleX, [-1, 0, 0]);
    mat4.scale(mvMatrix, [this.fontscale, this.fontscale, this.fontscale]);
    mat4.scale(mvMatrix, [0.49, 0.51, 1]);
    mat4.translate(mvMatrix, [1.2, 1.2, 0]);
    this.tg.setMVMatrix(mvMatrix);
    this.tg.enableTransparency();
    this.texO.draw();
    this.tg.disableTransparency();

    // P label
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [px, py, 0]);
    mat4.rotate(mvMatrix, -this.viewAngleZ, [0, 0, 1]);
    mat4.rotate(mvMatrix, -this.viewAngleX, [-1, 0, 0]);
    mat4.scale(mvMatrix, [this.fontscale, this.fontscale, this.fontscale]);
    mat4.scale(mvMatrix, [0.51, 0.49, 1]);
    mat4.translate(mvMatrix, [0, 1.5, 0]);
    this.tg.setMVMatrix(mvMatrix);
    this.tg.enableTransparency();
    this.texP.draw();
    this.tg.disableTransparency();

    // v label
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [px + vx, py + vy, 0]);
    mat4.rotate(mvMatrix, -this.viewAngleZ, [0, 0, 1]);
    mat4.rotate(mvMatrix, -this.viewAngleX, [-1, 0, 0]);
    mat4.scale(mvMatrix, [this.fontscale, this.fontscale, this.fontscale]);
    mat4.scale(mvMatrix, [0.43, 0.51, 1]);
    mat4.translate(mvMatrix, [0, -1, 0]);
    this.tg.setMVMatrix(mvMatrix);
    this.tg.enableTransparency();
    this.texv.draw();
    this.tg.disableTransparency();

    // H label
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0, 0, 2 * omega]);
    mat4.rotate(mvMatrix, -this.viewAngleZ, [0, 0, 1]);
    mat4.rotate(mvMatrix, -this.viewAngleX, [-1, 0, 0]);
    mat4.scale(mvMatrix, [this.fontscale, this.fontscale, this.fontscale]);
    mat4.scale(mvMatrix, [0.56, 0.60, 1]);
    mat4.translate(mvMatrix, [-1.1, 0, 0]);
    this.tg.setMVMatrix(mvMatrix);
    this.tg.enableTransparency();
    this.texH.draw();
    this.tg.disableTransparency();
}
