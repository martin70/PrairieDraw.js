
function Test3D(canvasId) {
    this.tg = new drawUtils3D.TG(canvasId);
    this.tri = new drawUtils3D.Triangle(this.tg, vec3.create([0, 1, 0]),
                                        vec3.create([-1, -1, 0]),
                                        vec3.create([1, -1, 0]),
                                        [1, 0.5, 0.5, 1]);
    this.cube = new drawUtils3D.Cube(this.tg, [1.0, 1.0, 0.0, 1.0]);
    this.cube2 = new drawUtils3D.Cube(this.tg, [0.0, 1.0, 1.0, 1.0]);
    this.square = new drawUtils3D.Square(this.tg, [0.5, 0.5, 1.0, 1.0]);
    this.line = new drawUtils3D.Line(this.tg, vec3.create([-1, 0, 0]),
                                     vec3.create([1, 0, 0]),
                                     [0, 0, 0, 1]);
    var pMatrix = mat4.create();
    mat4.perspective(45, this.tg.aspectRatio, 0.1, 100.0, pMatrix);
    this.tg.setPMatrix(pMatrix);

    drawUtils.Animator.call(this, canvasId);
    this.start();
}
Test3D.prototype = new drawUtils.Animator;

Test3D.prototype.draw = function(t) {
    this.tg.clear();

    var mvMatrix = mat4.create();

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [1.5, 0.0, -7.0]);
    mat4.rotate(mvMatrix, t, [0, 0, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.tri.draw();

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    mat4.rotate(mvMatrix, t, [0, 0, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.square.draw();

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(mvMatrix, t, [0, 1, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.cube.draw();

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [2.0, 2.0, -10.0]);
    mat4.rotate(mvMatrix, t, [1, 0.3, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.cube2.draw();

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -4.0]);
    mat4.rotate(mvMatrix, 2 * t, [0, 0, 1]);
    this.tg.setMVMatrix(mvMatrix);
    this.line.draw();
}
