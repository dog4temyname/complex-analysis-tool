// Начальный список цветов: красный и синий (в формате RGB)
let colorList = [[255, 0, 0], [0, 0, 255]]
let colorStep = 360  // Качество цвета

// Получаем ссылку на element <canvas> по id и его 2D-контекст для рисования
const customGradientCanvas = document.getElementById("custom-gradient-canvas")
const customGradientCtx = customGradientCanvas.getContext("2d")

// Задаём размер канваса: высота 1 пиксель и ширина 360 пикселей (ширина градиента)
customGradientCanvas.height = 1
customGradientCanvas.width = 360

// Вычисляет разницу каждого RGB-компонента между двумя цветами
function deltaColor(color1, color2) {
    return [
        color2[0] - color1[0],  // разница красного
        color2[1] - color1[1],  // разница зелёного
        color2[2] - color1[2]   // разница синего
    ]
}

// Складывает два цвета покомпонентно (полезно для интерполяции)
function sumColors(color1, color2) {
    return [
        parseFloat(color1[0]) + parseFloat(color2[0]),
        parseFloat(color1[1]) + parseFloat(color2[1]),
        parseFloat(color1[2]) + parseFloat(color2[2])
    ]
}

// Умножает каждый компонент цвета на число (масштабирование)
function multiplyColor(color, number) {
    return [
        color[0] * number,
        color[1] * number,
        color[2] * number
    ]
}

// Создаёт массив плавного цветового градиента и рисует его на канвасе
// colorList - исходные цвета для градиента, colorQuality - сколько всего цветов в итоговом градиенте
function createColorGradient(colorList, colorQuality) {
    let colorAmount = colorList.length                      // число цветов в исходном списке
    let colorGradient = []                                  // массив итогового градиента цветов
    const customGradientCanvasData = customGradientCtx.createImageData(360, 1); // пустой ImageData шириной 360, высотой 1
    
    let gradientIndex = 0; // индекс текущего пикселя/цвета в канвасе и итоговом массиве
    
    // Проходим по всем парам соседних цветов
    for (let i = 0; i < colorAmount - 1; i++) {
        // Делим общее число шагов градиента на количество промежутков (пар цветов)
        const steps = Math.floor(colorQuality / (colorAmount - 1))
        
        // Для каждого шага интерполируем цвет между colorList[i] и colorList[i+1]
        for (let j = 0; j < steps; j++) {
            const t = j / steps // параметр интерполяции от 0 до 1
            
            const interpolatedColor = sumColors(
                colorList[i],
                multiplyColor(deltaColor(colorList[i], colorList[i + 1]), t)
            )
            
            colorGradient.push(interpolatedColor) // добавляем вычисленный цвет в массив
            
            // Записываем цвет в ImageData канваса (указываем RGBA)
            const pixelIndex = gradientIndex * 4;
            customGradientCanvasData.data[pixelIndex] = interpolatedColor[0]       // красный
            customGradientCanvasData.data[pixelIndex + 1] = interpolatedColor[1]   // зелёный
            customGradientCanvasData.data[pixelIndex + 2] = interpolatedColor[2]   // синий
            customGradientCanvasData.data[pixelIndex + 3] = 255                    // альфа - полностью непрозрачный
            
            gradientIndex++; // переходим к следующему пикселю
        }
    }
    
    // Добавляем в конец последний цвет из списка, чтобы не потерять его в градиенте
    colorGradient.push(colorList[colorAmount - 1])
    
    // Если остались пустые пиксели (до ширины канваса 360), заполняем их последним цветом
    while (gradientIndex < 360) {
        const pixelIndex = gradientIndex * 4;
        customGradientCanvasData.data[pixelIndex] = colorList[colorAmount - 1][0]
        customGradientCanvasData.data[pixelIndex + 1] = colorList[colorAmount - 1][1]
        customGradientCanvasData.data[pixelIndex + 2] = colorList[colorAmount - 1][2]
        customGradientCanvasData.data[pixelIndex + 3] = 255
        gradientIndex++;
    }
    
    // Выводим сформированный градиент на канвас
    customGradientCtx.putImageData(customGradientCanvasData, 0, 0);
    
    // Возвращаем массив цветов градиента (на случай дальнейшего использования)
    return colorGradient
}

// Функция добавления нового цвета из color-picker в список цветов для градиента,
// затем создаёт обновлённый градиент и рисует его
function addColorToGradient() {
    // преобразуем HEX-цвет в RGB (функция hexToRgb должна быть определена отдельно)
    let color = hexToRgb(document.getElementById("color-picker-gradient").value)
    // добавляем новый цвет в массив
    colorList.push(color)
    // пересоздаём градиент с новым списком
    createColorGradient(colorList, 360)
}

// Удаляет последний цвет из массива и обновляет градиент
function removeColorToGradient() {
    // Извлекаем последний цвет из массива
    colorList.pop()
    // Обновляем градиент после удаления
    createColorGradient(colorList, 360)
}

// По умолчанию отключаем использование пользовательского градиента
document.getElementById("use-custom-gradient").checked = false;