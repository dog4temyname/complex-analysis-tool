const canvasIP = document.getElementById("integral-plane");
const ctxIP = canvasIP.getContext("2d");
toggleIntegralPlaneClickThrough();

// Храним реальные размеры холста
const canvasWidth = canvasIP.width;
const canvasHeight = canvasIP.height;

// Кэшируем размеры отображения элемента (в CSS-пикселях)
let cachedRect = canvasIP.getBoundingClientRect();
// Коэффициенты масштабирования по X и Y для преобразования координат мыши
let scaleX = canvasWidth / cachedRect.width;
let scaleY = canvasHeight / cachedRect.height;

// Скрываем элемент для вывода интеграла изначально
document.getElementById("latex-integral").style.display = "none";

// Обновляем кэш размеров при изменении окна
function updateCachedRect() {
    cachedRect = canvasIP.getBoundingClientRect();
    scaleX = canvasWidth / cachedRect.width;
    scaleY = canvasHeight / cachedRect.height;
}

// Получение координат мыши, масштабированных с учётом кэша и оффсета
function getScaledCoordinates(clientX, clientY) {
    return {
        x: (clientX - cachedRect.left) * scaleX - offset.x,
        y: (clientY - cachedRect.top) * scaleY - offset.y
    };
}

let integralResult = { real: 0, imag: 0 }; // Накопленный результат интеграла (комплексное число)
let isDrawingIP = false;                   // Флаг: происходит ли рисование траектории интеграла
let xIP = 0;                              // Предыдущая координата X при рисовании
let yIP = 0;                              // Предыдущая координата Y при рисовании

// Обновляем кэш размеров холста при изменении окна
window.addEventListener('resize', updateCachedRect);

// Функция форматирования числа для вывода (округляет и переключается на экспоненциальный вид при больших значениях)
function formatNumber(num) {
    if (num === 0) return "0";

    let numStr = num.toString();
    if (numStr.includes('e')) {
        const [coefficient, exponent] = numStr.split('e');
        return `${parseFloat(coefficient).toFixed(3)}*10^${exponent}`;
    }
    if (Math.log10(Math.abs(num)) > 3) {
        const exponent = Math.floor(Math.log10(Math.abs(num)));
        const coefficient = (num / Math.pow(10, exponent)).toFixed(3);
        return `${coefficient}*10^${exponent}`;
    }
    return num.toFixed(8);
}

var mathExpr; // Здесь должна быть ваша функция комплексного выражения (установите её позже)

// Обработчик нажатия кнопки мыши - начало рисования интеграла
canvasIP.addEventListener("mousedown", (e) => {
    integralResult = { real: 0, imag: 0 }; // Сбрасываем результат интеграла
    const coords = getScaledCoordinates(e.clientX, e.clientY);
    xIP = coords.x; // Запоминаем начальную координату X
    yIP = coords.y; // Запоминаем начальную координату Y
    isDrawingIP = true; // Включаем режим рисования
    document.getElementById("latex-integral").style.display = "block"; // Показываем блок с результатом
});


// Обработчик движения мыши - обновляет линию и вычисляет интеграл
canvasIP.addEventListener("mousemove", (e) => {

    // Получаем преобразованные координаты мыши
    const coords = getScaledCoordinates(e.clientX, e.clientY);
    
    // Преобразуем координаты холста в координаты комплексной плоскости
    let planeCoordinates = ConvertCanvasToPlane(canvasIP, { x: coords.x, y: coords.y }, zoom);
    // Вычисляем значение функции в этой точке
    let planeCoordinatesFunction = mathExpr({ real: planeCoordinates.x, imag: planeCoordinates.y });
    
    // Обновляем отображение координат и значения функции
    document.getElementById("latex-coordinates-number").innerHTML = 
        `${formatNumber(planeCoordinates.x)} + ${formatNumber(planeCoordinates.y)}i`;
    document.getElementById("latex-function-number").innerHTML = 
        `${formatNumber(planeCoordinatesFunction.real)} + ${formatNumber(planeCoordinatesFunction.imag)}i`;
    
    if (isDrawingIP) {
        // Рисуем линию от последней точки к текущей (с учётом смещения offset)
        drawLine(ctxIP, xIP + offset.x, yIP + offset.y, coords.x + offset.x, coords.y + offset.y);
        
        // Переводим начальную и текущую точки линии в комплексную плоскость
        let coordsIPNew = ConvertCanvasToPlane(canvasIP, { x: xIP, y: yIP }, zoom);
        let coordsIP = ConvertCanvasToPlane(canvasIP, { x: coords.x, y: coords.y }, zoom);

        // Вычисляем среднюю точку отрезка (для оценки значения функции)
        let average = {
            real: (coordsIPNew.x + coordsIP.x) / 2,
            imag: (coordsIPNew.y + coordsIP.y) / 2
        };
        
        // Вычисляем значение функции в средней точке отрезка
        let Faverage = mathExpr(average);

        // Вычисляем разность координат (дифференциал dz)
        let dz = { real: coordsIPNew.x - coordsIP.x, imag: coordsIPNew.y - coordsIP.y };

        // Множим функцию на -1 и на dz для вычисления вклада от этого малого отрезка
        let mass = ComplexMultiplication(ComplexMultiplication(Faverage, Complex(-1, 0)), dz);
        // Добавляем этот вклад к общему интегралу
        integralResult = ComplexSum(integralResult, mass);

        // Форматируем для удобного отображения и обновляем на странице
        formattedReal = formatNumber(integralResult.real);
        formattedImag = formatNumber(integralResult.imag);
        document.getElementById("latex-integral-number").innerHTML = `${formattedReal} + ${formattedImag}i`;

        // Обновляем последнюю точку для следующей линии
        xIP = coords.x;
        yIP = coords.y;
    }
});

// Обработчик отпускания кнопки мыши — прекращаем рисование и очистка холста
canvasIP.addEventListener("mouseup", (e) => {
    if (isDrawingIP) {
        const coords = getScaledCoordinates(e.clientX, e.clientY);
        ctxIP.clearRect(0, 0, canvasWidth, canvasHeight); // Очищаем холст
        isDrawingIP = false; // Выключаем режим рисования
    }
});

// Если мышь покидает область холста во время рисования — сбрасываем процесс
canvasIP.addEventListener("mouseleave", (e) => {
    if (isDrawingIP) {
        ctxIP.clearRect(0, 0, canvasWidth, canvasHeight);
        isDrawingIP = false;
    }
});

// Вспомогательная функция для рисования линии на холсте
function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

// Переключатель события кликов на холст (для управления взаимодействием)
function toggleIntegralPlaneClickThrough() {
    canvasIP.style.pointerEvents = canvasIP.style.pointerEvents === 'none' ? 'auto' : 'none';
}

// Инициализация: обновляем кэшированное значение размеров холста для точного пересчёта координат
updateCachedRect();