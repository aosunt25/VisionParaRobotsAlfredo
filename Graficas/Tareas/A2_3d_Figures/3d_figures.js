let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube

function createPyramid(gl, translation, rotationAxis){

    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //Front Face
        -0.5, 0.0, 0.5,
        0.5, 0.0, 0.5,
        0.0, 1.0, 0.0,

        //Back Face
        -0.5, 0.0, -0.5,
        0.5, 0.0, -0.5,
        0.0, 1.0, 0.0,

        //Left Face
        -0.5, 0.0, -0.5,
        -0.5, 0.0, 0.5,
        0.0, 1.0, 0.0,

        //Right Face
        0.5, 0.0, -0.5,
        0.5, 0.0, 0.5,
        0.0, 1.0, 0.0,

        //Bottom Face
        -0.5, 0.0, 0.5,
        0.5, 0.0, 0.5,
        -0.5, 0.0, -0.5,
        0.5, 0.0, -0.5
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [1.0, 1.0, 0.0, 1.0], // Left face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0],  
        [0.0, 1.0, 1.0, 1.0]// Bottom face
    ]

    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
        0, 1, 2,      // Front face
        3, 4, 5,      // Back face
        6, 7, 8,      // Left face
        9, 10, 11,    // Right face
        12, 13, 14,   13, 14, 15 // Bottom face
        
    ]

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
        vertSize:3, nVerts: 16, colorSize:4, nColors: 16, nIndices:18,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

function createOctahedron(gl, translation, rotationAxis){

    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    let verts = [
       //Front Face
       -0.5, 0.0, 0.5,
       0.5, 0.0, 0.5,
       0.0, 1.0, 0.0,

       //Back Face
       -0.5, 0.0, -0.5,
       0.5, 0.0, -0.5,
       0.0, 1.0, 0.0,

       //Left Face
       -0.5, 0.0, -0.5,
       -0.5, 0.0, 0.5,
       0.0, 1.0, 0.0,

       //Right Face
       0.5, 0.0, -0.5,
       0.5, 0.0, 0.5,
       0.0, 1.0, 0.0,

        //Front Face
        -0.5, 0.0, 0.5,
        0.5, 0.0, 0.5,
        0.0, -1.0, 0.0,

        //Back Face
        -0.5, 0.0, -0.5,
        0.5, 0.0, -0.5,
        0.0, -1.0, 0.0,

        //Left Face
        -0.5, 0.0, -0.5,
        -0.5, 0.0, 0.5,
        0.0, -1.0, 0.0,

        //Right Face
        0.5, 0.0, -0.5,
        0.5, 0.0, 0.5,
        0.0, -1.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front Down face
        [0.0, 1.0, 0.0, 1.0], // Back Down face
        [1.0, 1.0, 0.0, 1.0], // Left Down face
        [1.0, 0.0, 1.0, 1.0], // Right Down face
        [1.0, 1.0, 0.0, 1.0], // Front Down face
        [0.0, 1.0, 1.0, 1.0], // Back Down face
        [1.0, 0.0, 1.0, 1.0], // Left Down face
        [1.0, 0.0, 0.0, 1.0], // Right Down face
        
    ]

    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0, 1, 2,      // Front face
        3, 4, 5,      // Back face
        6, 7, 8,      // Left face
        9, 10, 11,    // Right face
        12, 13, 14,   // Front Down face
        15, 16, 17,   // Back Down face
        18, 19, 20,   // Left Down face
        21, 22, 23    // Right Down face
    ]

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

    let octahedron = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
        vertSize:3, nVerts: 22, colorSize:4, nColors: 22, nIndices:24,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    octahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octahedron;
}

function createPenthPyramid(gl, translation, rotationAxis){
    
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts = []
    verts.push(0.0, 0.0, 0.0);
    for(j = 0; j<360; j+=72){    
        angle = j;
        x1 = 0.5 * Math.cos(angle * Math.PI / 180);
        z1 = 0.5 * Math.sin(angle * Math.PI / 180);
        verts.push(x1, 0.0, z1); 
        verts.push(x1, 0.0, z1);  
    }
    for(j = 0; j<360; j+=72){    
        angle = j;
        x1 = 0.5 * Math.cos(angle * Math.PI / 180);
        z1 = 0.5 * Math.sin(angle * Math.PI / 180);
        verts.push(x1, 0.0, z1); 
        verts.push(x1, 0.0, z1);  
    }
    verts.push(0.0,1,0.0);
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],   // Bottom face
        [1.0, 0.0, 0.0, 1.0],   // Bottom face
        [1.0, 0.0, 0.0, 1.0],   // Bottom face
        [1.0, 0.0, 0.0, 1.0],   // Bottom face
        [1.0, 0.0, 0.0, 1.0],   // Bottom face
        [0.0, 1.0, 0.0, 1.0], // Back Down face
        [1.0, 1.0, 0.0, 1.0], // Left Down face
        [1.0, 0.0, 1.0, 1.0], // Right Down face
        [1.0, 0.0, 0.0, 1.0], // Front Down face
        [0.0, 1.0, 0.0, 1.0] // Back Down face
        
    ]

    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let penthPyramidIndices = [
        0, 2, 3,      // Front face
        0, 4, 5,      // Back face
        0, 6, 7,      // Left face
        0, 8, 9,    // Right face
        0, 10, 1,   // Front Down face  
        21, 12, 13,      // Front face
        21, 14, 15,      // Back face
        21, 16, 17,      // Left face
        21, 18, 19,    // Right face
        21, 20, 11,  
    ]

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(penthPyramidIndices), gl.STATIC_DRAW);

    let octahedron = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
        vertSize:3, nVerts: 22, colorSize:4, nColors: 40, nIndices:30,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    octahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octahedron;
}
function createDodecahedron(gl, translation, rotationAxis){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let t = ( 1 + Math.sqrt( 5 ) ) / 2;
    let r = 1 / t;
    let verts = [
        // (±1, ±1, ±1)
        - 0.5, - 0.5, - 0.5,	
        - 0.5, - 0.5, 0.5,
        - 0.5, 0.5, - 0.5,
        - 0.5, 0.5, 0.5,
        0.5, - 0.5, - 0.5, 
        0.5, - 0.5, 0.5,
        0.5, 0.5, - 0.5, 
        0.5, 0.5, 0.5,

		// (0, ±1/φ, ±φ)
         0, - r/2, - t/2, 
         0, - r/2, t/2,
         0, r/2, - t/2, 
         0, r/2, t/2,

		// (±1/φ, ±φ, 0)
        - r/2, - t/2, 0, 
        - r/2, t/2, 0,
        r/2, - t/2, 0, 
        r/2, t/2, 0,

		// (±φ, 0, ±1/φ)
        - t/2, 0, - r/2,
        t/2, 0, - r/2,
        - t/2, 0, r/2, 
        t/2, 0, r/2
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0,.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0]
    ]

    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 9; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    
    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    var dodecahedronIndices = [
		3, 11, 7, 	3, 7, 15, 	3, 15, 13,
		7, 19, 17, 	7, 17, 6, 	7, 6, 15,
		17, 4, 8, 	17, 8, 10, 	17, 10, 6,
		8, 0, 16, 	8, 16, 2, 	8, 2, 10,
		0, 12, 1, 	0, 1, 18, 	0, 18, 16,
		6, 10, 2, 	6, 2, 13, 	6, 13, 15,
		2, 16, 18, 	2, 18, 3, 	2, 3, 13,
		18, 1, 9, 	18, 9, 11, 	18, 11, 3,
		4, 14, 12, 	4, 12, 0, 	4, 0, 8,
		11, 9, 5, 	11, 5, 19, 	11, 19, 7,
		19, 5, 14, 	19, 14, 4, 	19, 4, 17,
		1, 12, 14, 	1, 14, 5, 	1, 5, 9
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);

    let dodecahedron = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
        vertSize:3, nVerts: 20, colorSize:4, nColors: 20, nIndices:108,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;

}
function createShader(gl, str, type)
{
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i< objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });

    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
