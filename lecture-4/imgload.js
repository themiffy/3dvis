export async function imgload(path, rows, cols, slices, is16, psx, psy, psz) {
    const response = await fetch(path)
    const buffer = await response.arrayBuffer();
    const bufferArray = new Uint8Array(buffer)

    return parseByteArray(bufferArray, rows, cols, slices, is16, psx, psy, psz)

    
}

function parseByteArray(byteArray, rows, cols, slices, is16, psx, psy, psz) {
    try {
        var img = {
            rows: rows, columns: cols, slices: slices, 
            pixelSpacingX: psx, pixelSpacingY: psy, pixelSpacingZ: psz, 
            xort: [-1, 0, 0], yort: [0, 1, 0], zort: [0, 0, 1],
            pixelData: []};

        if (is16){
            img.pixelData = new Uint16Array(byteArray.buffer, 0, img.rows * img.columns * img.slices);
        } else {
            img.pixelData = new Uint8Array(byteArray.buffer, 0, img.rows * img.columns * img.slices);
        }
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