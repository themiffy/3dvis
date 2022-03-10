//Import libraries
import * as dat from './libs/dat.gui.module.js'

//Import utility functions
import * as glutils from './glutils.js'
import { imgload } from './imgload.js';

//setup control object
const settings = {black: 500, white: 500, zoom: 1};

//create control interface
const gui = new dat.GUI();
gui.add(settings, 'black', 0, 1000);
gui.add(settings, 'white', 0, 1000);
gui.add(settings, 'zoom', 0.5, 2, .1);

//Image load

const vsSource = await (await fetch('vs.fx')).text();
const fsSource = await (await fetch('fs.fx')).text();;

const {gl, pr, vao} = init()
render()

const image = await imgload('img_016.dcm')

function init() {
    //get canvas ui element and set its internal resolution to align with its actual screen resolution
    const c = document.getElementById("canvas");
    c.width = c.clientWidth;
    c.height = c.clientHeight;

    //get WebGL2 darwing context and exit if not found
    const gl = c.getContext("webgl2")
    if(gl == null) {
        alert("Context not found");
        throw "Context not found";
    }
    var ext = gl.getExtension('OES_texture_float_linear');

    //-compile source code into shaders
    var vs = glutils.createShader(gl, gl.VERTEX_SHADER, vsSource);
    var fs = glutils.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    //-assemble shaders into program (pipeline)                                                                                
    var pr = glutils.createProgram(gl, vs, fs);
    
    var positionAttributeLocation = gl.getAttribLocation(pr, "a_position");

    const geometry = [
        0, 0, 
        1, 0,
        1, 1,
        0, 1
    ]

    const triangles = [
        0, 1, 2, 
        0, 3, 2
    ]

    //-create vertex array to store geometry data
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    //-init position buffer and fill with data
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry), gl.STATIC_DRAW);
    //-assign buffer to position attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    //-init index buffer and fill with data
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), gl.STATIC_DRAW);

    //-setup additional pipeline parameters (enable depth filtering)
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    return {gl, pr, vao}
}

function render() {
    //setup drawing area
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //set clear color
    gl.clearColor(0, 0, 0, 1);
    //set clear mode (clear color & depth)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //use graphic pipeline defined by shader program *pr*
    gl.useProgram(pr);
    //set geometry to draw
    gl.bindVertexArray(vao);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render)
}








