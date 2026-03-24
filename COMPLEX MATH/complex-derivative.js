var derivativeToggle = 0;

const canvasDP = document.getElementById("derivative-plane");
const ctxDP = canvasDP.getContext("2d"); // Исправлено: правильный canvas

toggleDerivativePlaneClickThrough();

function toggleDerivativePlaneClickThrough() {
    canvasDP.style.pointerEvents = canvasDP.style.pointerEvents === 'none' ? 'auto' : 'none';
}

function changeDerivativeToggle(a) {
    derivativeToggle = a;
}

function stupidFuckingConverter(canvas, coords, zoom) {
    let k = ConvertCanvasToPlane(canvas, coords, zoom);
    return { real: k.x, imag: k.y };
}

let dzNorm = { real: 0, imag: 0 };
let complexDerivative;

canvasDP.addEventListener("mousemove", (e) => {
    const coords = getScaledCoordinates(e.clientX, e.clientY);
    ctxDP.clearRect(0, 0, width, height);

    if (derivativeToggle === 0) {
        // Нормируем вектор от центра к курсору
        let dx = coords.x - width / 2;
        let dy = height / 2 - coords.y;
        let length = Math.hypot(dx, dy) || 1;
        dzNorm = { real: dx / length, imag: dy / length };
        document.getElementById("dz-direction").innerHTML = `dz norm = ${dzNorm.real.toFixed(4)} + ${dzNorm.imag.toFixed(4)}i`;

        // Рисуем точку
        ctxDP.beginPath();
        ctxDP.arc(coords.x + offset.x, coords.y + offset.y, 1, 0, Math.PI * 2);
        ctxDP.lineWidth = 10;
        ctxDP.strokeStyle = "#ffffff";
        ctxDP.stroke();

        // Рисуем линию через центр в направлении dzNorm
        drawLine(ctxDP,
            width / 2 - dzNorm.real * 1000 + offset.x, height / 2 - dzNorm.imag * 1000 + offset.y,
            width / 2 + dzNorm.real * 1000 + offset.x, height / 2 + dzNorm.imag * 1000 + offset.y);
    }

    if (derivativeToggle === 1) {
        // Рисуем точку
        ctxDP.beginPath();
        ctxDP.arc(coords.x + offset.x, coords.y + offset.y, 1, 0, Math.PI * 2);
        ctxDP.lineWidth = 3;
        ctxDP.strokeStyle = "#ffffff";
        ctxDP.stroke();
        ctxDP.closePath();

        // Вычисляем производную
        const planeCoordinates = stupidFuckingConverter(canvasDP, coords, zoom);
        const dz = ComplexMultiplication(dzNorm, Complex(1e-7, 0));
        complexDerivative = ComplexDivision(
            ComplexSubtraction(
                mathExpr(ComplexSum(planeCoordinates, dz)),
                mathExpr(planeCoordinates)
            ),
            dz
        );
    }

    // Обновление отображаемых значений в DOM
    const planeCoordinates = ConvertCanvasToPlane(canvasIP, { x: coords.x, y: coords.y }, zoom);
    const planeCoordinatesFunction = mathExpr({ real: planeCoordinates.x, imag: planeCoordinates.y });

    document.getElementById("latex-coordinates-number").innerHTML =
        `${formatNumber(planeCoordinates.x)} + ${formatNumber(planeCoordinates.y)}i`;
    document.getElementById("latex-function-number").innerHTML =
        `${formatNumber(planeCoordinatesFunction.real)} + ${formatNumber(planeCoordinatesFunction.imag)}i`;
    document.getElementById("latex-derivative-number").innerHTML =
        `${formatNumber(complexDerivative?.real || 0)} + ${formatNumber(complexDerivative?.imag || 0)}i`;

    // Если используете MathJax для обновления формул
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
});

canvasDP.addEventListener("mouseup", (e) => {
    if (derivativeToggle >= 0) {
        ctxDP.clearRect(0, 0, width, height);
        derivativeToggle = -1;
        toggleDerivativePlaneClickThrough();
    }
});