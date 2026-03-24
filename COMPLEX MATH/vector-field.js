const canvasVF = document.getElementById("vector-field")
const ctxVF = canvasVF.getContext("2d")

let vectorDensity = 15
let vectorLengthMax = 0.1

function vectorModule(vector){
    return Math.sqrt((vector[1][0]-vector[0][0])**2+(vector[1][1]-vector[0][1])**2)
}

function distanceToColor(distance){
    return -(220*(2/Math.PI*Math.atan(distance)-1))/2
}

function drawArrow(x1, y1, x2, y2, color) {
    const headLength = 3*(vectorLengthMax*0.25+0.75);
    const headWidth = 3*(vectorLengthMax*0.25+0.75);
    
    // Draw the line
    ctxVF.beginPath();
    ctxVF.moveTo(x1, y1);
    ctxVF.lineTo(x2, y2);
    ctxVF.strokeStyle = color;
    ctxVF.lineWidth = 1;
    ctxVF.stroke();
    
    // Draw the arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctxVF.beginPath();
    ctxVF.moveTo(x2, y2);
    ctxVF.lineTo(
        x2 - headLength * Math.cos(angle) - headWidth * Math.sin(angle),
        y2 - headLength * Math.sin(angle) + headWidth * Math.cos(angle)
    );
    ctxVF.lineTo(
        x2 - headLength * Math.cos(angle) + headWidth * Math.sin(angle),
        y2 - headLength * Math.sin(angle) - headWidth * Math.cos(angle)
    );
    ctxVF.closePath();
    ctxVF.fillStyle = color;
    ctxVF.fill();
}

function drawVector(x, y, dx, dy){
    // Convert canvas coordinates to complex plane coordinates WITH OFFSET
    const point = ConvertCanvasToPlane(canvasVF, {x: x + dx, y: y + dy}, zoom);
    const zReal = point.x;
    const zImag = point.y;
    
    // Evaluate the function at z
    var mathExpr = new Function("z", `return ${parseExpression(formula)}`);
    let fz;
    try {
        fz = mathExpr({real: zReal, imag: zImag});
        if (!fz || typeof fz.real === 'undefined') {
            throw new Error("Invalid complex number");
        }
    } catch(e) {
        fz = {real: 0, imag: 0};
    }
    
    // FOR POLYA VECTOR FIELD: Take the conjugate of f(z)
    const polyaVectorReal = fz.real;
    const polyaVectorImag = -fz.imag;
    
    // The vector represents conjugate(f(z)) for Polya field
    const vectorReal = polyaVectorReal;
    const vectorImag = polyaVectorImag; // Note: we already applied the conjugate above
    
    // Calculate magnitude for coloring and normalization
    const vectorMagnitude = Math.sqrt(vectorReal * vectorReal + vectorImag * vectorImag);
    
    // Get color based on magnitude
    let HSVcolor = hslToRgb(Math.floor(distanceToColor(vectorMagnitude)), 1, 0.7);
    const color = `rgb(${HSVcolor[0]},${HSVcolor[1]},${HSVcolor[2]})`;
    
    let endReal, endImag;
    
    if (vectorMagnitude === 0) {
        // Zero vector - draw a dot or very small arrow
        endReal = zReal;
        endImag = zImag;
    } else {
        // Normalize the vector and scale to max length
        const normalizedReal = vectorReal / vectorMagnitude;
        const normalizedImag = vectorImag / vectorMagnitude;
        
        // Scale to maximum length
        endReal = zReal + vectorLengthMax * normalizedReal;
        endImag = zImag + vectorLengthMax * normalizedImag;
    }
    
    // Convert back to canvas coordinates (without offset for drawing)
    const startCoords = ConvertPlaneToCanvas(
        canvasVF,{
        real: zReal,
        imag: zImag
    }, zoom);
    
    const endCoords = ConvertPlaneToCanvas(
        canvasVF,{
        real: endReal,
        imag: endImag
    }, zoom);
    
    // Draw arrow from start to end point
    drawArrow(startCoords.x-dx, startCoords.y-dy, endCoords.x-dx, endCoords.y-dy, color);
}

function drawVectorField(){
    formula = document.getElementById("formula-input").value;
    
    // Clear with black background
    ctxVF.fillStyle = "black";
    ctxVF.fillRect(0, 0, canvasVF.width, canvasVF.height);
    
    for(let y = 0; y < canvasVF.height; y++){
        if(y % vectorDensity == 0){
            for(let x = 0; x < canvasVF.width; x++){
                if(x % vectorDensity == 0){
                    drawVector(x, y, -offset.x, -offset.y);
                }
            }
        }
    }
}
canvasVF.addEventListener("mousedown", (e) => {
    oldPoint = getMousePos(canvasVF, e);
    mouseHold = true;
    currOffset = { x: 0, y: 0 }; // Reset frame delta
});

canvasVF.addEventListener("mousemove", (e) => {
    if (!mouseHold) {
        currOffset = { x: 0, y: 0 };
        return;
    }
    
    newPoint = getMousePos(canvasVF, e);
    
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
    drawVectorField()
});

// Rest of the event listeners remain the same...
canvasVF.addEventListener("mouseup", (e) => {
    mouseHold = false;
    currOffset = { x: 0, y: 0 };
});

canvasVF.addEventListener("mouseleave", (e) => {
    mouseHold = false;
    currOffset = { x: 0, y: 0 };
});

