
var canvas = document.getElementById("test");

var gl = canvas.getContext("experimental-webgl");
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;

/*****************************************************************************/

var triangleVertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
var triangleVertexPositionData = [
    0.0,  1.0,  0.0,
   -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexPositionData), gl.STATIC_DRAW);
triangleVertexPositionBuffer.itemSize = 3;
triangleVertexPositionBuffer.numItems = 3;

var triangleVertexColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
var triangleVertexColorData = [
    1.0, 0.5, 0.5, 1.0,
    1.0, 0.5, 0.5, 1.0,
    1.0, 0.5, 0.5, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexColorData), gl.STATIC_DRAW);
triangleVertexColorBuffer.itemSize = 4;
triangleVertexColorBuffer.numItems = 3;

var triangleVertexNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
var triangleVertexNormalData = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexNormalData), gl.STATIC_DRAW);
triangleVertexNormalBuffer.itemSize = 3;
triangleVertexNormalBuffer.numItems = 3;

/*****************************************************************************/

function makeCube(color) {
    var pos = [];
    var norm = [];
    var col = [];
    var nTri = 0;
    var a0, a1, a2, u, v, w, i, p, n;
    for (a0 = 0; a0 < 3; a0++) {
        a1 = (a0 + 1) % 3;
        a2 = (a1 + 1) % 3;
        for (u = -1; u <= 1; u += 2) {
            p = [];
            n = [];
            i = 0;
            for (v = -1; v <= 1; v += 2) {
                for (w = -1; w <= 1; w += 2) {
                    p[i] = [0, 0, 0];
                    p[i][a0] = u;
                    p[i][a1] = v;
                    p[i][a2] = w;
                    n[i] = [0, 0, 0];
                    n[i][a0] = u;
                    i++;
                }
            }
            // first tri
            pos = pos.concat(p[0], p[1], p[2]);
            norm = norm.concat(n[0], n[1], n[2]);
            col = col.concat(color, color, color);
            nTri = nTri + 1;
            // second tri
            pos = pos.concat(p[1], p[2], p[3]);
            norm = norm.concat(n[1], n[2], n[3]);
            col = col.concat(color, color, color);
            nTri = nTri + 1;
        }
    }
    var cube = {pos: pos, norm: norm, col: col, nTri: nTri};
    return cube;
}

cube = makeCube([1.0, 1.0, 0.0, 1.0]);

var cubeVertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
var cubeVertexPositionData = cube.pos;
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPositionData), gl.STATIC_DRAW);
cubeVertexPositionBuffer.itemSize = 3;
cubeVertexPositionBuffer.numItems = cube.nTri * 3;

var cubeVertexColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
var cubeVertexColorData = cube.col;
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexColorData), gl.STATIC_DRAW);
cubeVertexColorBuffer.itemSize = 4;
cubeVertexColorBuffer.numItems = cube.nTri * 3;

var cubeVertexNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
var cubeVertexNormalData = cube.norm;
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexNormalData), gl.STATIC_DRAW);
cubeVertexNormalBuffer.itemSize = 3;
cubeVertexNormalBuffer.numItems = cube.nTri * 3;

/*****************************************************************************/

var squareVertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
var squareVertexPositionData = [
    1.0,  1.0,  0.0,
   -1.0,  1.0,  0.0,
    1.0, -1.0,  0.0,
   -1.0, -1.0,  0.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertexPositionData), gl.STATIC_DRAW);
squareVertexPositionBuffer.itemSize = 3;
squareVertexPositionBuffer.numItems = 4;

var squareVertexColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
var squareVertexColorData = [
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertexColorData), gl.STATIC_DRAW);
squareVertexColorBuffer.itemSize = 4;
squareVertexColorBuffer.numItems = 4;

var squareVertexNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
var squareVertexNormalData = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertexNormalData), gl.STATIC_DRAW);
squareVertexNormalBuffer.itemSize = 3;
squareVertexNormalBuffer.numItems = 4;

/*****************************************************************************/

var lineVertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
var lineVertexPositionData = [
   -1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertexPositionData), gl.STATIC_DRAW);
lineVertexPositionBuffer.itemSize = 3;
lineVertexPositionBuffer.numItems = 2;

var lineVertexColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
var lineVertexColorData = [
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertexColorData), gl.STATIC_DRAW);
lineVertexColorBuffer.itemSize = 4;
lineVertexColorBuffer.numItems = 2;

/*****************************************************************************/

function loadShader(type, id) {
    var shader = gl.createShader(type);
    var script = document.getElementById(id);
    var source = script.firstChild.textContent;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createShaderProgram(vertexId, fragmentId) {
    var vertexShader = loadShader(gl.VERTEX_SHADER, vertexId);
    var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentId);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;
}

/*****************************************************************************/

var shaderProgram = createShaderProgram("vert", "frag");
gl.useProgram(shaderProgram);

shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

/*****************************************************************************/

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

function draw(t) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var pMatrix = mat4.create();
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

    var mvMatrix = mat4.create();

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [1.5, 0.0, -7.0]);
    mat4.rotate(mvMatrix, t, [0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, triangleVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    mat4.rotate(mvMatrix, t, [0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, squareVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(mvMatrix, t, [0, 1, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVertexPositionBuffer.numItems);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -4.0]);
    mat4.rotate(mvMatrix, 2 * t, [0, 0, 1]);
    gl.lineWidth(2.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, lineVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.LINES, 0, lineVertexPositionBuffer.numItems);
}

/*****************************************************************************/

requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

requestAnimationFrame.call(window, callback);

function callback(t_ms) {
    var t = t_ms / 1000;
    draw(t);
    requestAnimationFrame.call(window, callback);
}

/*****************************************************************************/
