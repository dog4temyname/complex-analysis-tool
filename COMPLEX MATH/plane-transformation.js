const canvasTP = document.getElementById("transformation-plane")
const ctxTP = canvasTP.getContext("2d")
const centerX = canvasTP.width / 2;
const centerY = canvasTP.height / 2;
const scale = Math.min(canvasTP.width, canvasTP.height) / 3;

function drawParametric(fx, gx, tmin, tmax, quality) {  
    const STEP = (tmax - tmin) / quality;
    
    try {
        var functionX = new Function("z", `return ${parseExpression(fx)}.real`);
        var functionY = new Function("z", `return ${parseExpression(gx)}.real`);
        
        
        ctxTP.beginPath();
        for(let t = tmin; t <= tmax; t += STEP) {
            let x = functionX(Complex(t,0));
            let y = functionY(Complex(t,0));
            

            const canvasX = centerX + (x * scale);
            const canvasY = centerY - (y * scale);
            
            if (t === tmin) {
                ctxTP.moveTo(canvasX, canvasY);
            } else {
                ctxTP.lineTo(canvasX, canvasY);
            }
            
        }
        
        ctxTP.stroke();
        
    } catch (error) {
        console.error("Error:", error);
    }
}

