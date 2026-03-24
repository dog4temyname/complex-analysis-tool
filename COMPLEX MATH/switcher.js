import { draw3DPlot } from "./3d-domain-coloring.js"

function switchPlanes(arg){
    if(arg == "complex-plane"){
        document.getElementById("complex-plane").style.display = "block"
        document.getElementById("vector-field").style.display = "none"
        document.getElementById("3d-complex-plane").style.display = "none"
        document.getElementById("transformation-plane").style.display = "none"
    }
    if(arg == "vector-field"){
        document.getElementById("complex-plane").style.display = "none"
        document.getElementById("vector-field").style.display = "block"
        document.getElementById("3d-complex-plane").style.display = "none"
        document.getElementById("transformation-plane").style.display = "none"
    }
    if(arg == "3d-complex-plane"){
        document.getElementById("complex-plane").style.display = "none"
        document.getElementById("vector-field").style.display = "none"
        document.getElementById("3d-complex-plane").style.display = "block"
        document.getElementById("transformation-plane").style.display = "none"
    }
    if(arg == "transformation-plane"){
        document.getElementById("complex-plane").style.display = "none"
        document.getElementById("vector-field").style.display = "none"
        document.getElementById("3d-complex-plane").style.display = "none"
        document.getElementById("transformation-plane").style.display = "block"
    }
}


function drawGraph(){
    if(document.getElementById("complex-plane").style.display == "block"){
        drawDomainColoring()
    }
    if(document.getElementById("vector-field").style.display == "block"){
        drawVectorField()
    }
    if(document.getElementById("3d-complex-plane").style.display == "block"){
        draw3DPlot()
    }
    if(document.getElementById("transformation-plane").style.display == "block"){
        ctxTP.clearRect(0,0,canvasTP.width,canvasTP.height);
        formula = document.getElementById("formula-input").value
        for(let k = -10; k <= 10; k++){
            let valueReal
            let valueImag
            if(k < 0){
                ctxTP.strokeStyle = "#808080ff";
                ctxTP.lineWidth = 2;
                valueReal = `(z${k}*i)`
                valueImag = `(z*i${k})`
            }
            else{
                if(k > 0){
                    ctxTP.strokeStyle = "#808080ff";
                    ctxTP.lineWidth = 2;
                   valueReal = `(z+${k}*i)`
                    valueImag = `(z*i+${k})` 
                }
                else{
                    ctxTP.strokeStyle = "#ffffffff";
                    ctxTP.lineWidth = 5;
                    valueReal = `(z)`
                    valueImag = `(z*i)`       
                }
            }
            drawParametric(`real(${formula.split("z").join(valueReal)})`,`imag(${formula.split("z").join(valueReal)})`,-10,10,20000)
            drawParametric(`real(${formula.split("z").join(valueImag)})`,`imag(${formula.split("z").join(valueImag)})`,-10,10,20000)
        }

    }
}

function switchCustomColor(){
    customColorsOption = Math.abs(customColorsOption-1)
}



document.getElementById('draw-plane').addEventListener('click', drawGraph);
document.getElementById('calculate-integral').addEventListener('click', toggleIntegralPlaneClickThrough)
document.getElementById('calculate-derivative').addEventListener('click', toggleDerivativePlaneClickThrough)
document.addEventListener('load', switchPlanes("complex-plane"));
window.drawGraph = drawGraph
window.switchPlanes = switchPlanes
document.getElementById("use-custom-gradient").addEventListener("click", switchCustomColor)