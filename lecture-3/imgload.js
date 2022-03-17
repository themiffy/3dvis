const importUMD = async (url, module = {exports:{}}) =>
  (Function('module', 'exports', await (await fetch(url)).text()).call(module, module, module.exports), module).exports
const dicomParser = await importUMD('libs/dicomParser.min.js')

export async function imgload(url) {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer();
    const bufferArray = new Uint8Array(buffer)
    return parseByteArray(bufferArray)
}

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