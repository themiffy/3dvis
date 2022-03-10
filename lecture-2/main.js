//Import libraries
import * as dat from './libs/dat.gui.module.js'

const importUMD = async (url, module = {exports:{}}) =>
  (Function('module', 'exports', await (await fetch(url)).text()).call(module, module, module.exports), module).exports
const dicomParser = await importUMD('libs/dicomParser.min.js')

//setup control object
const settings = {black: 500, white: 500, zoom: 1};

//create control interface
const gui = new dat.GUI();
gui.add(settings, 'black', 0, 1000);
gui.add(settings, 'white', 0, 1000);
gui.add(settings, 'zoom', 0.5, 2, .1);

//Image load
const response = await fetch('img_016.dcm')
const buffer = await response.arrayBuffer();
const bufferArray = new Uint8Array(buffer)
const image = parseByteArray(bufferArray)

const vsSource = await (await fetch('vs.fx')).text();
const fsSource = await (await fetch('fs.fx')).text();;

const {gl, pr, vao} = init()
render()

function parseByteArray(byteArray) {
    try {
        var img = {rows: 0, columns: 0, pixelSpacingX: 0, pixelSpacingY: 0, pixelData: []};
        var dataSet = dicomParser.parseDicom(byteArray);
        img.rows = dataSet.uint16('x00280010');
        img.columns = dataSet.uint16('x00280011');

        img.pixelSpacingX = dataSet.floatString('x00280030', 0);
        img.pixelSpacingY = dataSet.floatString('x00280030', 1);

        // if(dataSet.elements.x00200032 !== undefined) {
        //     img.imagePositionPatientX = dataSet.floatString('x00200032',0);
        //     img.imagePositionPatientY = dataSet.floatString('x00200032',1);
        //     img.imagePositionPatientZ = dataSet.floatString('x00200032',2);
        // }

        var pixelDataElement = dataSet.elements.x7fe00010;

        var arrType = Uint8Array;
        if(dataSet.uint16('x00280100') == 16)
        {
            if(dataSet.uint16('x00280100') == 1) {
                arrType = Int16Array;
            } else {
                arrType = Uint16Array;
            }
        } else {
            if(dataSet.uint16('x00280100') == 1) {
                arrType = Int8Array;
            }
        }

        img.pixelData = new arrType(dataSet.byteArray.buffer, pixelDataElement.dataOffset, img.rows * img.columns);
        var l = img.pixelData.length;
        var fa = new Float32Array(l);
        for(var i = 0; i < l; i++) {
            fa[i] = img.pixelData[i];
        }

        img.pixelData = fa;
        return img;
    }
    catch(err)
    {
        // we catch the error and display it to the user
        alert(err);
    }
}

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
    var vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    var fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    //-assemble shaders into program (pipeline)                                                                                
    var pr = createProgram(gl, vs, fs);
    
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

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}







