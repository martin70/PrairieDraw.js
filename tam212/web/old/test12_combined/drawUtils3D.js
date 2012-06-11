
var drawUtils3D = drawUtils3D || {};

/*****************************************************************************/

drawUtils3D.TG = function(canvasId) {
    this.canvasId = canvasId;
    if (canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext("experimental-webgl");
        this.gl.viewportWidth = this.canvas.width;
        this.gl.viewportHeight = this.canvas.height;
        this.aspectRatio = this.gl.viewportWidth / this.gl.viewportHeight;

        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.lineWidth(2.0);

        this.disableTransparency();

        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);

        this.setupShaders();
        this.gl.uniform1i(this.shProg.useLightingUniform, 1);
    }
}

drawUtils3D.TG.prototype.vertexShaderSource = [
    'attribute vec3 aVertexPosition;',
    'attribute vec4 aVertexColor;',
    'attribute vec3 aVertexNormal;',
    'attribute vec2 aVertexTextureCoord;',
    'uniform mat4 uMVMatrix;',
    'uniform mat4 uPMatrix;',
    'uniform bool uUseTexture;',
    'uniform bool uUseLighting;',
    'varying vec4 vColor;',
    'varying vec2 vTextureCoord;',
    'void main(void) {',
    '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
    '    if (uUseTexture) {',
    '        vTextureCoord = aVertexTextureCoord;',
    '    } else {',
    '        float brightness;',
    '        if (uUseLighting) {',
    '            float ambient = 0.3;',
    '            vec4 lightDir = normalize(vec4(0, 0, 1, 0));',
    '            float diffuse = 10.0 * max(0.0, dot(lightDir, uMVMatrix * vec4(aVertexNormal, 0.0)));',
    '            brightness = min(1.0, ambient + diffuse);',
    '        } else {',
    '            brightness = 1.0;',
    '        }',
    '        vColor = aVertexColor * brightness;',
    '        vColor[3] = aVertexColor[3];',
    '    }',
    '}'].join('\n');

drawUtils3D.TG.prototype.fragmentShaderSource = [
    'precision mediump float;',
    'uniform sampler2D uSampler;',
    'uniform bool uUseTexture;',
    'varying vec4 vColor;',
    'varying vec2 vTextureCoord;',
    'void main(void) {',
    '    if (uUseTexture) {',
    '        gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
    '    } else {',
    '        gl_FragColor = vColor;',
    '    }',
    '}'].join('\n');

drawUtils3D.TG.prototype.compileShader = function(type, source) {
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(shader));
    }
    return shader;
}

drawUtils3D.TG.prototype.setupShaders = function() {
    var vertexShader = this.compileShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
    var fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);
    this.shProg = this.gl.createProgram();
    this.gl.attachShader(this.shProg, vertexShader);
    this.gl.attachShader(this.shProg, fragmentShader);
    this.gl.linkProgram(this.shProg);
    if (!this.gl.getProgramParameter(this.shProg, this.gl.LINK_STATUS)) {
        console.log(this.gl.getProgramInfoLog(this.shProg));
    }
    this.gl.useProgram(this.shProg);

    this.shProg.vertexPositionAttribute = this.gl.getAttribLocation(this.shProg, "aVertexPosition");
    this.gl.enableVertexAttribArray(this.shProg.vertexPositionAttribute);

    this.shProg.vertexColorAttribute = this.gl.getAttribLocation(this.shProg, "aVertexColor");
    this.gl.enableVertexAttribArray(this.shProg.vertexColorAttribute);

    this.shProg.vertexNormalAttribute = this.gl.getAttribLocation(this.shProg, "aVertexNormal");
    this.gl.enableVertexAttribArray(this.shProg.vertexNormalAttribute);

    this.shProg.vertexTextureCoordAttribute = this.gl.getAttribLocation(this.shProg, "aVertexTextureCoord");
    this.gl.enableVertexAttribArray(this.shProg.vertexTextureCoordAttribute);

    this.shProg.pMatrixUniform = this.gl.getUniformLocation(this.shProg, "uPMatrix");
    this.shProg.mvMatrixUniform = this.gl.getUniformLocation(this.shProg, "uMVMatrix");
    this.shProg.samplerUniform = this.gl.getUniformLocation(this.shProg, "uSampler");
    this.shProg.useTextureUniform = this.gl.getUniformLocation(this.shProg, "uUseTexture");
    this.shProg.useLightingUniform = this.gl.getUniformLocation(this.shProg, "uUseLighting");
}

drawUtils3D.TG.prototype.setPMatrix = function(pMatrix) {
    this.gl.uniformMatrix4fv(this.shProg.pMatrixUniform, false, pMatrix);
}

drawUtils3D.TG.prototype.setMVMatrix = function(mvMatrix) {
    this.gl.uniformMatrix4fv(this.shProg.mvMatrixUniform, false, mvMatrix);
}

drawUtils3D.TG.prototype.clear = function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

drawUtils3D.TG.prototype.enableTransparency = function() {
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
}

drawUtils3D.TG.prototype.disableTransparency = function() {
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.BLEND);
}

/*****************************************************************************/

drawUtils3D.TriangleSet = function(tg, data) {
    this.tg = tg;
    if (tg) {
        this.posBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.pos), this.tg.gl.STATIC_DRAW);
        this.posBuf.itemSize = 3;
        this.posBuf.numItems = data.pos.length / 3;

        this.normBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.norm), this.tg.gl.STATIC_DRAW);
        this.normBuf.itemSize = 3;
        this.normBuf.numItems = data.norm.length / 3;
        
        this.colBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.col), this.tg.gl.STATIC_DRAW);
        this.colBuf.itemSize = 4;
        this.colBuf.numItems = data.col.length / 4;

        this.texBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.tex), this.tg.gl.STATIC_DRAW);
        this.texBuf.itemSize = 2;
        this.texBuf.numItems = data.tex.length / 2;
    }
}

drawUtils3D.TriangleSet.prototype.draw = function() {
    this.tg.gl.uniform1i(this.tg.shProg.useTextureUniform, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexPositionAttribute, this.posBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexNormalAttribute, this.normBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexColorAttribute, this.colBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexTextureCoordAttribute, this.texBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.drawArrays(this.tg.gl.TRIANGLES, 0, this.posBuf.numItems);
}

/*****************************************************************************/

drawUtils3D.LineSet = function(tg, data) {
    this.tg = tg;
    if (tg) {
        this.posBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.pos), this.tg.gl.STATIC_DRAW);
        this.posBuf.itemSize = 3;
        this.posBuf.numItems = data.pos.length / 3;

        this.normBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.norm), this.tg.gl.STATIC_DRAW);
        this.normBuf.itemSize = 3;
        this.normBuf.numItems = data.norm.length / 3;
        
        this.colBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.col), this.tg.gl.STATIC_DRAW);
        this.colBuf.itemSize = 4;
        this.colBuf.numItems = data.col.length / 4;

        this.texBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.tex), this.tg.gl.STATIC_DRAW);
        this.texBuf.itemSize = 2;
        this.texBuf.numItems = data.tex.length / 2;
    }
}

drawUtils3D.LineSet.prototype.draw = function() {
    this.tg.gl.uniform1i(this.tg.shProg.useTextureUniform, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexPositionAttribute, this.posBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexNormalAttribute, this.normBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexColorAttribute, this.colBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexTextureCoordAttribute, this.texBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.drawArrays(this.tg.gl.LINES, 0, this.posBuf.numItems);
}

drawUtils3D.LineSet.prototype.newData = function(data) {
    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
    this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.pos), this.tg.gl.STATIC_DRAW);
    this.posBuf.itemSize = 3;
    this.posBuf.numItems = data.pos.length / 3;

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
    this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.norm), this.tg.gl.STATIC_DRAW);
    this.normBuf.itemSize = 3;
    this.normBuf.numItems = data.norm.length / 3;

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
    this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.col), this.tg.gl.STATIC_DRAW);
    this.colBuf.itemSize = 4;
    this.colBuf.numItems = data.col.length / 4;

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
    this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(data.tex), this.tg.gl.STATIC_DRAW);
    this.texBuf.itemSize = 2;
    this.texBuf.numItems = data.tex.length / 2;
}

/*****************************************************************************/

drawUtils3D.triNormal = function(v0, v1, v2) {
    var e1 = vec3.create();
    var e2 = vec3.create();
    var n = vec3.create();
    vec3.subtract(v0, v1, e1);
    vec3.subtract(v2, v1, e2);
    vec3.cross(e2, e1, n);
    vec3.normalize(n);
    return n;
}

drawUtils3D.vec3ToArray = function(v) {
    return [v[0], v[1], v[2]];
}

drawUtils3D.vec3ArrayFlatten = function(va) {
    var f = [];
    for (i = 0; i < va.length; i++) {
        f = f.concat(drawUtils3D.vec3ToArray(va[i]));
    }
    return f;
}

drawUtils3D.append = function(array, extraArray) {
    for (i = 0; i < extraArray.length; i++) {
        array.push(extraArray[i]);
    }
}

drawUtils3D.shapeDataAddTri = function(data, v0, v1, v2, col) {
    var n = drawUtils3D.triNormal(v0, v1, v2);
    data.pos = data.pos || [];
    data.norm = data.norm || [];
    data.col = data.col || [];
    data.tex = data.tex || [];
    drawUtils3D.append(data.pos, drawUtils3D.vec3ArrayFlatten([v0, v1, v2]));
    drawUtils3D.append(data.norm, drawUtils3D.vec3ArrayFlatten([n, n, n]));
    drawUtils3D.append(data.col, [].concat(col, col, col));
    drawUtils3D.append(data.tex, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
}

drawUtils3D.shapeDataAddLine = function(data, v0, v1, col) {
    data.pos = data.pos || [];
    data.norm = data.norm || [];
    data.col = data.col || [];
    data.tex = data.tex || [];
    drawUtils3D.append(data.pos, drawUtils3D.vec3ArrayFlatten([v0, v1]));
    drawUtils3D.append(data.norm, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    drawUtils3D.append(data.col, [].concat(col, col));
    drawUtils3D.append(data.tex, [0.0, 0.0, 0.0, 0.0]);
}

/*****************************************************************************/

drawUtils3D.Triangle = function(tg, v0, v1, v2, col) {
    var data = {};
    drawUtils3D.shapeDataAddTri(data, v0, v1, v2, col);
    drawUtils3D.TriangleSet.call(this, tg, data);
}
drawUtils3D.Triangle.prototype = new drawUtils3D.TriangleSet;

drawUtils3D.Cube = function(tg, col) {
    var data = {};
    var v000 = vec3.create([-1, -1, -1]);
    var v001 = vec3.create([-1, -1,  1]);
    var v010 = vec3.create([-1,  1, -1]);
    var v011 = vec3.create([-1,  1,  1]);
    var v100 = vec3.create([ 1, -1, -1]);
    var v101 = vec3.create([ 1, -1,  1]);
    var v110 = vec3.create([ 1,  1, -1]);
    var v111 = vec3.create([ 1,  1,  1]);
    drawUtils3D.shapeDataAddTri(data, v000, v001, v010, col);
    drawUtils3D.shapeDataAddTri(data, v001, v011, v010, col);
    drawUtils3D.shapeDataAddTri(data, v110, v101, v100, col);
    drawUtils3D.shapeDataAddTri(data, v110, v111, v101, col);
    drawUtils3D.shapeDataAddTri(data, v000, v100, v001, col);
    drawUtils3D.shapeDataAddTri(data, v100, v101, v001, col);
    drawUtils3D.shapeDataAddTri(data, v011, v110, v010, col);
    drawUtils3D.shapeDataAddTri(data, v011, v111, v110, col);
    drawUtils3D.shapeDataAddTri(data, v000, v010, v100, col);
    drawUtils3D.shapeDataAddTri(data, v010, v110, v100, col);
    drawUtils3D.shapeDataAddTri(data, v101, v011, v001, col);
    drawUtils3D.shapeDataAddTri(data, v101, v111, v011, col);
    drawUtils3D.TriangleSet.call(this, tg, data);
}
drawUtils3D.Cube.prototype = new drawUtils3D.TriangleSet;

drawUtils3D.Square = function(tg, col) {
    var data = {};
    var v00 = vec3.create([-1, -1,  0]);
    var v01 = vec3.create([-1,  1,  0]);
    var v10 = vec3.create([ 1, -1,  0]);
    var v11 = vec3.create([ 1,  1,  0]);
    drawUtils3D.shapeDataAddTri(data, v00, v10, v01, col);
    drawUtils3D.shapeDataAddTri(data, v10, v11, v01, col);
    drawUtils3D.TriangleSet.call(this, tg, data);
}
drawUtils3D.Square.prototype = new drawUtils3D.TriangleSet;

drawUtils3D.Line = function(tg, v0, v1, col) {
    var data = {};
    drawUtils3D.shapeDataAddLine(data, v0, v1, col);
    drawUtils3D.LineSet.call(this, tg, data);
}
drawUtils3D.Line.prototype = new drawUtils3D.LineSet;

drawUtils3D.Line.prototype.newData = function(v0, v1, col) {
    var data = {};
    drawUtils3D.shapeDataAddLine(data, v0, v1, col);
    drawUtils3D.LineSet.prototype.newData.call(this, data);
}

/*****************************************************************************/

drawUtils3D.ImagePlane = function(tg, imageSrc) {
    this.tg = tg;
    if (tg) {
        this.tex = this.tg.gl.createTexture();
        this.tex.image = new Image();
        this.tex.image.src = imageSrc;
        this.tex.image.onload = this.textureLoad.bind(this);

        var dataPos = [
            -1.0, -1.0, 0.0,
             1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
             1.0,  1.0, 0.0
        ];
        var dataNorm = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ];
        var dataCol = [
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0
        ];
        var dataTex = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];
        var dataInd = [
            0, 1, 3,
            3, 2, 0
        ];

        this.posBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataPos), this.tg.gl.STATIC_DRAW);
        this.posBuf.itemSize = 3;
        this.posBuf.numItems = 4;

        this.normBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataNorm), this.tg.gl.STATIC_DRAW);
        this.normBuf.itemSize = 3;
        this.normBuf.numItems = 4;
        
        this.colBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataCol), this.tg.gl.STATIC_DRAW);
        this.colBuf.itemSize = 4;
        this.colBuf.numItems = 4;
        
        this.texBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataTex), this.tg.gl.STATIC_DRAW);
        this.texBuf.itemSize = 2;
        this.texBuf.numItems = 4;

        this.indBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ELEMENT_ARRAY_BUFFER, this.indBuf);
        this.tg.gl.bufferData(this.tg.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dataInd), this.tg.gl.STATIC_DRAW);
        this.indBuf.itemSize = 1;
        this.indBuf.numItems = 6;
    }
}

drawUtils3D.ImagePlane.prototype.textureLoad = function() {
    this.tg.gl.bindTexture(this.tg.gl.TEXTURE_2D, this.tex);
    this.tg.gl.pixelStorei(this.tg.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.tg.gl.texImage2D(this.tg.gl.TEXTURE_2D, 0, this.tg.gl.RGBA, this.tg.gl.RGBA, this.tg.gl.UNSIGNED_BYTE, this.tex.image);
    this.tg.gl.texParameteri(this.tg.gl.TEXTURE_2D, this.tg.gl.TEXTURE_MAG_FILTER, this.tg.gl.LINEAR);
    this.tg.gl.texParameteri(this.tg.gl.TEXTURE_2D, this.tg.gl.TEXTURE_MIN_FILTER, this.tg.gl.LINEAR);
    //this.tg.gl.texParameteri(this.tg.gl.TEXTURE_2D, this.tg.gl.TEXTURE_MIN_FILTER, this.tg.gl.LINEAR_MIPMAP_LINEAR);
    //this.tg.gl.generateMipmap(this.tg.gl.TEXTURE_2D);
    this.tg.gl.bindTexture(this.tg.gl.TEXTURE_2D, null);
}

drawUtils3D.ImagePlane.prototype.draw = function() {
    this.tg.gl.activeTexture(this.tg.gl.TEXTURE0);
    this.tg.gl.bindTexture(this.tg.gl.TEXTURE_2D, this.tex);
    this.tg.gl.uniform1i(this.tg.shProg.samplerUniform, 0);

    this.tg.gl.uniform1i(this.tg.shProg.useTextureUniform, 1);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexPositionAttribute, this.posBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexNormalAttribute, this.normBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexColorAttribute, this.colBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexTextureCoordAttribute, this.texBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ELEMENT_ARRAY_BUFFER, this.indBuf);

    this.tg.gl.drawElements(this.tg.gl.TRIANGLES, this.indBuf.numItems, this.tg.gl.UNSIGNED_SHORT, 0);
}

/*****************************************************************************/

drawUtils3D.Arrowhead = function(tg, col) {
    this.tg = tg;
    if (tg) {
        var dataPos = [
             0.0,  0.0, 0.0,
            -1.0,  0.3, 0.0,
            -1.0, -0.3, 0.0,
            -0.7,  0.0, 0.0
        ];
        var dataNorm = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ];
        var dataCol = [].concat(col, col, col, col);
        var dataTex = [
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0
        ];
        var dataInd = [
            1, 3, 0,
            3, 2, 0
        ];

        this.posBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataPos), this.tg.gl.STATIC_DRAW);
        this.posBuf.itemSize = 3;
        this.posBuf.numItems = 4;

        this.normBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataNorm), this.tg.gl.STATIC_DRAW);
        this.normBuf.itemSize = 3;
        this.normBuf.numItems = 4;
        
        this.colBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataCol), this.tg.gl.STATIC_DRAW);
        this.colBuf.itemSize = 4;
        this.colBuf.numItems = 4;
        
        this.texBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
        this.tg.gl.bufferData(this.tg.gl.ARRAY_BUFFER, new Float32Array(dataTex), this.tg.gl.STATIC_DRAW);
        this.texBuf.itemSize = 2;
        this.texBuf.numItems = 4;

        this.indBuf = this.tg.gl.createBuffer();
        this.tg.gl.bindBuffer(this.tg.gl.ELEMENT_ARRAY_BUFFER, this.indBuf);
        this.tg.gl.bufferData(this.tg.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dataInd), this.tg.gl.STATIC_DRAW);
        this.indBuf.itemSize = 1;
        this.indBuf.numItems = 6;
    }
}

drawUtils3D.Arrowhead.prototype.draw = function() {
    this.tg.gl.uniform1i(this.tg.shProg.useTextureUniform, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.posBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexPositionAttribute, this.posBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.normBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexNormalAttribute, this.normBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.colBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexColorAttribute, this.colBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ARRAY_BUFFER, this.texBuf);
    this.tg.gl.vertexAttribPointer(this.tg.shProg.vertexTextureCoordAttribute, this.texBuf.itemSize, this.tg.gl.FLOAT, false, 0, 0);

    this.tg.gl.bindBuffer(this.tg.gl.ELEMENT_ARRAY_BUFFER, this.indBuf);

    this.tg.gl.drawElements(this.tg.gl.TRIANGLES, this.indBuf.numItems, this.tg.gl.UNSIGNED_SHORT, 0);
}

/*****************************************************************************/
