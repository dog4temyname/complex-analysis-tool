

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

document.addEventListener("dragover", (event) => {
    event.preventDefault();
});
document.addEventListener("dragenter", (event) => {
    event.preventDefault();
});
let formula = "z"
let customColorsOption = 0
    
function drawImageToCanvas() {
    ctxDC.save();
    ctxDC.setTransform(1,0,0,1,0,0);
    ctxDC.clearRect(0,0,canvasDC.width,canvasDC.height);
    ctxDC.restore();

    ctxDC.drawImage(image, 0, 0, 200, 200);
}

function calculateDCForOnePixel(x,y,dx,dy){
    const zReal = ConvertCanvasToPlane(canvasDC, {x: x-dx, y: 0}, zoom).x;
    const zImag = ConvertCanvasToPlane(canvasDC, {x: 0, y: y-dy}, zoom).y;
    
    let answer;
    try {
        answer = mathExpr({real: zReal, imag: zImag})
        
        if (!answer || typeof answer.real === 'undefined') {
            throw new Error("Invalid complex number");
        }
    }
    catch(e) {
        answer = {real: 0, imag: 0};
    }

    const TWO_THIRDS = 2/3
    const RADIAN_CONSTANT = 180/PI
    const TWO_DIVIDE_PI = 2/PI
    let option = document.getElementById("dc-type-slider").value
    let rgbValue
    if(customColorsOption == 0){
        let Hvalue
        let Svalue
        let Lvalue
        if(parseInt(option) >= 0){
            Hvalue = (ComplexArgument(answer).real + TWO_THIRDS) * RADIAN_CONSTANT;
        }
        else{
            Hvalue = 0
        }
        if(parseInt(option) == -1){
            Svalue = 0;
        }
        else{
            Svalue = 1.0;
        }
        if(parseInt(option) <= 0){
            Lvalue = TWO_DIVIDE_PI*Math.atan(Math.log(ComplexAbs(answer).real+1));
        }
        else{
            Lvalue = 0.5
        }
        rgbValue = hslToRgb(Hvalue, Svalue, Lvalue);
    }
    else{
    let answerRadians = Math.floor((ComplexArgument(answer).real) * RADIAN_CONSTANT * 357/180)
    let Rvalue, Gvalue, Bvalue
    if(parseInt(option) > -1){
    try{
        Rvalue = colorGradient[Math.abs(answerRadians)][0]
        Gvalue = colorGradient[Math.abs(answerRadians)][1]
        Bvalue = colorGradient[Math.abs(answerRadians)][2]  
    }
    catch{
        Rvalue = 255; Gvalue = 255; Bvalue = 255;
    }        
    }
    else{
        Rvalue = 0
        Gvalue = 0
        Bvalue = 0
    }
    let hslValue = rgbToHsl(Rvalue, Gvalue, Bvalue)
    if(parseInt(option) < 1){
        const magnitude = ComplexAbs(answer).real
        console.log(magnitude)
        
        let lightnessAdjustment;
        if (magnitude === 0) {
            lightnessAdjustment = 0.5; 
        } else {
            lightnessAdjustment = 0.5+1/PI * Math.atan(Math.log10(magnitude))
        }
        hslValue[2] = lightnessAdjustment
    }
    rgbValue = hslToRgb(hslValue[0], hslValue[1], hslValue[2])

    }
    
    
    const idx = 4 * (y * width + x);
    ctxDCPixelData.data[idx] = rgbValue[0];
    ctxDCPixelData.data[idx+1] = rgbValue[1];
    ctxDCPixelData.data[idx+2] = rgbValue[2];
    ctxDCPixelData.data[idx+3] = 255;
}

const canvasDC = document.getElementById("complex-plane")
const ctxDC = canvasDC.getContext("2d")
let zoom = 1/100

function ConvertCanvasToPlane(canvas, coordinates, scaleFactor) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return {
        x: scaleFactor * (coordinates.x - centerX),
        y: scaleFactor * (centerY - coordinates.y)
    };
}

function ConvertPlaneToCanvas(canvas, complexNumber, scaleFactor) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return {
        x: complexNumber.real / scaleFactor + centerX,
        y: centerY - complexNumber.imag / scaleFactor
    };
}

var mathExpr = new Function("z", `return ${parseExpression(formula)}`)
var width = canvasDC.width;
var height = canvasDC.height;
const ctxDCPixelData = ctxDC.getImageData(0, 0, canvasDC.width, canvasDC.height);
let colorGradient
function drawDomainColoring() {
    colorGradient = createColorGradient(colorList, colorStep)
    offset = {x: offset.x*zoom, y: offset.y*zoom}
    zoom = 1/parseFloat(document.getElementById("zoom-input").value)
    offset = {x: offset.x/zoom, y: offset.y/zoom}
    formula = document.getElementById("formula-input").value
    getFunction()
    ctxDC.fillStyle = "black";
    ctxDC.fillRect(0, 0, canvasDC.width, canvasDC.height);
    
    for (let yPos = 0; yPos < height; yPos++) {
        for (let xPos = 0; xPos < width; xPos++) {
            calculateDCForOnePixel(xPos,yPos,offset.x,offset.y)
        }
    }
    ctxDC.putImageData(ctxDCPixelData, 0, 0);
}

// dragging the canvas

var oldPoint = null;
var newPoint = null;
var mouseHold = false;
var offset = { x: 0, y: 0 };       // Total cumulative offset (integer)
var currOffset = { x: 0, y: 0 };   // Frame delta offset (integer)

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
        x: Math.round((evt.clientX - rect.left) * scaleX),  // Round to integer
        y: Math.round((evt.clientY - rect.top) * scaleY)    // Round to integer
    };
}

// Initialize canvas context
var ctx = canvasDC.getContext('2d');

canvasDC.addEventListener("mousedown", (e) => {
    oldPoint = getMousePos(canvasDC, e);
    mouseHold = true;
    currOffset = { x: 0, y: 0 }; // Reset frame delta
});

canvasDC.addEventListener("mousemove", (e) => {
    const coords = getScaledCoordinates(e.clientX, e.clientY);
    let planeCoordinates = ConvertCanvasToPlane(canvasIP, { x: coords.x, y: coords.y }, zoom);
    let planeCoordinatesFunction = mathExpr({ real: planeCoordinates.x, imag: planeCoordinates.y });
    document.getElementById("latex-coordinates-number").innerHTML = 
        `${formatNumber(planeCoordinates.x)} + ${formatNumber(planeCoordinates.y)}i`;
    document.getElementById("latex-function-number").innerHTML = 
        `${formatNumber(planeCoordinatesFunction.real)} + ${formatNumber(planeCoordinatesFunction.imag)}i`;
        MathJax.typeset();
    if (!mouseHold) {
        currOffset = { x: 0, y: 0 };
        return;
    }
    
    newPoint = getMousePos(canvasDC, e);
    
    // Calculate integer frame delta
    currOffset = {
        x: newPoint.x - oldPoint.x,
        y: newPoint.y - oldPoint.y
    };
    
    // Update total offset by adding frame delta to initial drag position
    offset = {
        x: offset.x + currOffset.x,
        y: offset.y + currOffset.y
    };
    
    oldPoint = newPoint;
    
    redrawCanvas();
});

// Rest of the event listeners remain the same...
canvasDC.addEventListener("mouseup", (e) => {
    mouseHold = false;
    currOffset = { x: 0, y: 0 };
});

canvasDC.addEventListener("mouseleave", (e) => {
    mouseHold = false;
    currOffset = { x: 0, y: 0 };
});
let idx
function redrawCanvas() {
    // Make a temporary copy of the current image
    const tempImageData = new ImageData(width, height);
    tempImageData.data.set(ctxDCPixelData.data);
    
    // Clear the canvas
    ctxDC.fillStyle = "black";
    ctxDC.fillRect(0, 0, width, height);
    
    // Move all pixels according to the accumulated offset
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Note: We subtract the offset to create the dragging effect
            const srcX = x - currOffset.x;
            const srcY = y - currOffset.y;
            
            if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                const srcIdx = 4 * (srcY * width + srcX);
                const dstIdx = 4 * (y * width + x);
                
                ctxDCPixelData.data[dstIdx] = tempImageData.data[srcIdx];
                ctxDCPixelData.data[dstIdx+1] = tempImageData.data[srcIdx+1];
                ctxDCPixelData.data[dstIdx+2] = tempImageData.data[srcIdx+2];
                ctxDCPixelData.data[dstIdx+3] = tempImageData.data[srcIdx+3];
            }
        }
    }
    
    // Calculate newly exposed areas based on the current frame's movement (currOffset)
    // Right edge (if moved left)
    if (currOffset.x < 0) {
        for (let x = width + currOffset.x; x < width; x++) {
            for (let y = 0; y < height; y++) {
                calculateDCForOnePixel(x, y, offset.x, offset.y);
            }
        }
    }
    // Left edge (if moved right)
    else if (currOffset.x > 0) {
        for (let x = 0; x < currOffset.x; x++) {
            for (let y = 0; y < height; y++) {
                calculateDCForOnePixel(x, y, offset.x, offset.y);
            }
        }
    }
    
    // Bottom edge (if moved up)
    if (currOffset.y < 0) {
        for (let y = height + currOffset.y; y < height; y++) {
            for (let x = 0; x < width; x++) {
                calculateDCForOnePixel(x, y, offset.x, offset.y);
            }
        }
    }
    // Top edge (if moved down)
    else if (currOffset.y > 0) {
        for (let y = 0; y < currOffset.y; y++) {
            for (let x = 0; x < width; x++) {
                calculateDCForOnePixel(x, y, offset.x, offset.y);
            }
        }
    }
    
    // Update the canvas
    ctxDC.putImageData(ctxDCPixelData, 0, 0);
}

canvasDC.addEventListener('wheel', (e) => {
    if(e.deltaY > 0){
        zoom *= 1.1
        offset = {x: offset.x/1.1, y: offset.y/1.1}
    }
    else{
        zoom /= 1.1
        offset = {x: offset.x*1.1, y: offset.y*1.1}
    }
    drawDomainColoring()
});
