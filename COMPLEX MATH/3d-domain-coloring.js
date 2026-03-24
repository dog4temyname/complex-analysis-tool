import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

// Инициализация рендерера с привязкой к canvas с id='3d-complex-plane'
var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('3d-complex-plane') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111, 1); // Фон сцены - почти чёрный

const scene = new THREE.Scene();

// Камера с перспективной проекцией
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Управление камерой мышкой (вращение, масштаб, панорама)
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableDamping = true;  // плавное затухание движения
controls.dampingFactor = 0.15;

controls.minDistance = 0.1;
controls.maxDistance = 1000;

// Ось "вверх" и начальная позиция камеры
camera.up.set(0, 1, 0);
camera.position.set(10, 10, 10);
controls.target.set(0, 0, 0); // Камера смотрит в центр сцены (в начало координат)
controls.update();

scene.add(camera); // Добавляем камеру в сцену (необязательно, но часто так делают)


// Параметры сетки: количество разбивок и размер области в комплексной плоскости
let subdivisions = 500;
const domainSize = 10;

// Материал для поверхности: цвет вершин + двусторонний рендеринг
const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    wireframe: false
});

let mesh; // Заменяемая меш-сетка, на которую строится график

// Функция перерисовки 3D-графика комплексной функции
export function draw3DPlot() {
    const formula = document.getElementById("formula-input").value;

    // Создаем геометрию с атрибутами позиций и цветов
    const complexSurface = new THREE.BufferGeometry();
    const positions = new Float32Array(subdivisions * subdivisions * 3); // x,y,z для каждой вершины
    const colors = new Float32Array(subdivisions * subdivisions * 3); // r,g,b для каждой вершины

    // Преобразуем пользовательскую формулу в функцию, принимающую комплексное число z
    var mathExpr = new Function("z", `return ${parseExpression(formula)}`);

    let index = 0;
    for (let i = 0; i < subdivisions; i++) {
        for (let j = 0; j < subdivisions; j++) {
            // Преобразуем индекс сетки в координаты x, y в области [-domainSize, domainSize]
            let x = (j / (subdivisions - 1) - 0.5) * 2 * domainSize;
            let y = (i / (subdivisions - 1) - 0.5) * 2 * domainSize;

            let z = { real: x, imag: y }; // комплексное число z = x + iy

            // Вычисляем значение функции f(z), обрабатываем ошибки
            let answer;
            try {
                answer = mathExpr(z);
                // Проверяем валидность результата - наличие real и imag, не NaN
                if (!answer || typeof answer.real === 'undefined' || isNaN(answer.real) || isNaN(answer.imag)) {
                    throw new Error("Invalid complex number");
                }
            } catch (e) {
                answer = { real: 0, imag: 0 }; // При ошибке ставим нули
            }

            // Расчёт цвета в зависимости от аргумента и модуля результата
            const TWO_THIRDS = 2 / 3;
            const RADIAN_CONSTANT = 180 / Math.PI;

            // Вычисляем угол (аргумент) комплексного числа для Hue, сдвиг и нормализация
            let Hvalue = (ComplexArgument(answer).real + TWO_THIRDS) * RADIAN_CONSTANT;
            if (isNaN(Hvalue)) Hvalue = 0;
            Hvalue = Hvalue % 360;
            if (Hvalue < 0) Hvalue += 360;

            let Svalue = 1.0;  // Насыщенность цвета
            let Lvalue = 0.5;  // Светлота цвета

            // Перевод из HSL в RGB цвета
            let rgbValue = hslToRgb(Hvalue, Svalue, Lvalue);

            // Высота по Z - модуль комплексного значения
            let positionValue = ComplexAbs(answer).real;
            if (isNaN(positionValue)) positionValue = 0;

            // Заполняем массивы координат и цветов (нормализуя цвета к диапазону 0..1)
            positions[index] = x;
            positions[index + 1] = y;
            positions[index + 2] = positionValue;

            colors[index] = rgbValue[0] / 256 || 0;
            colors[index + 1] = rgbValue[1] / 256 || 0;
            colors[index + 2] = rgbValue[2] / 256 || 0;

            index += 3;
        }
    }

    // Назначаем атрибуты геометрии
    complexSurface.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    complexSurface.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Индексы для построения треугольников через разбивку сетки
    const indices = [];
    for (let i = 0; i < subdivisions - 1; i++) {
        for (let j = 0; j < subdivisions - 1; j++) {
            const a = i * subdivisions + j;
            const b = i * subdivisions + j + 1;
            const c = (i + 1) * subdivisions + j;
            const d = (i + 1) * subdivisions + j + 1;

            // Два треугольника на каждый прямоугольник сетки
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    complexSurface.setIndex(indices);

    // Удаляем старую сетку из сцены (если есть)
    if (mesh) {
        scene.remove(mesh);
    }

    // Создаем новый меш и добавляем его на сцену
    mesh = new THREE.Mesh(complexSurface, material);
    mesh.rotation.x = Math.PI / 2; // Поворот, чтобы ось Z стала вверх
    mesh.rotation.y = Math.PI;
    scene.add(mesh);
}

// Анимационный цикл: обновляем управление и рендерим сцену
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// При изменении размера окна обновляем камеру и рендер
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();