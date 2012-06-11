
var canvas = document.getElementById("test");

var gl = canvas.getContext("experimental-webgl");
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;

/*****************************************************************************/

var triangleVertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
var triangeVertexPositionData = [
    0.0,  1.0,  0.0,
   -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangeVertexPositionData), gl.STATIC_DRAW);
triangleVertexPositionBuffer.itemSize = 3;
triangleVertexPositionBuffer.numItems = 3;

var triangleVertexColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
var triangeVertexColorData = [
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangeVertexColorData), gl.STATIC_DRAW);
triangleVertexColorBuffer.itemSize = 4;
triangleVertexColorBuffer.numItems = 3;

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
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertexColorData), gl.STATIC_DRAW);
squareVertexColorBuffer.itemSize = 4;
squareVertexColorBuffer.numItems = 4;

/*****************************************************************************/

vertexShader = gl.createShader(gl.VERTEX_SHADER);
fragmentScript = document.getElementById("vert");
fragmentSource = fragmentScript.firstChild.textContent;
gl.shaderSource(vertexShader, fragmentSource);
gl.compileShader(vertexShader);

if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
}

/*****************************************************************************/

fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
fragmentScript = document.getElementById("frag");
fragmentSource = fragmentScript.firstChild.textContent;
gl.shaderSource(fragmentShader, fragmentSource);
gl.compileShader(fragmentShader);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
}

/*****************************************************************************/

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

/*****************************************************************************/

gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    mat4.rotate(mvMatrix, t, [0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

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
