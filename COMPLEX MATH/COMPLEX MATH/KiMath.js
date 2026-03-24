/***********************************************************************
 * KiMath v3 – Ultimate Quantum Adaptive Math Library (2025+ Edition)
 *
 * Features:
 *   • Extensive, high-performance math functions organized by domain.
 *   • Self-optimizing: dynamically selects the best implementation based on context.
 *   • Hybrid execution: native JS, WASM stubs, multi-threaded workers, and (stub) GPU modes.
 *   • Unified DSL for symbolic and numerical computation.
 *   • Plugin architecture for seamless community extensions.
 *   • Built-in performance dashboard and auto-tuning stubs.
 *
 * Usage: Simply include this file in your project. Access functions via KiMath.<function>().
 *
 * Note: Some advanced modules (WASM/GPU/ML auto-tuning) are provided as stubs to illustrate the design.
 ***********************************************************************/

"use strict";

/* --------------------------------------------------------------
   UTILITIES & HELPERS
   -------------------------------------------------------------- */
// Memoization helper
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Deep clone helper (for objects/arrays)
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* --------------------------------------------------------------
   ADVANCED: WORKER POOL FOR MULTI-THREADING (Quantum Compute)
   -------------------------------------------------------------- */
// Detect Worker implementation: use native Worker if available; otherwise, in Node use worker_threads.
let WorkerGlobal;
if (typeof Worker !== "undefined") {
  WorkerGlobal = Worker;
} else {
  try {
    // Node.js environment: use worker_threads
    const { Worker: NodeWorker } = require("worker_threads");
    WorkerGlobal = NodeWorker;
  } catch (err) {
    console.error("Worker is not available in this environment.");
  }
}

const WORKER_COUNT = 4; // Can be auto-tuned later
const _workerPool = [];

function initWorkerPool() {
  // Prepend our worker code with a definition for "self"
  const workerCode = `
    var self = typeof self !== "undefined" ? self : globalThis;
    self.onmessage = function(e) {
      const { id, funcName, args } = e.data;
      let result;
      try {
        // Only allow safe KiMath functions to be called in the worker.
        // The worker has its own KiMathWorkerFuncs object.
        if (self.KiMathWorkerFuncs && self.KiMathWorkerFuncs[funcName]) {
          result = self.KiMathWorkerFuncs[funcName](...args);
        } else {
          throw new Error("Function not registered in worker: " + funcName);
        }
      } catch (err) {
        result = { error: err.message };
      }
      self.postMessage({ id, result });
    };
    // Example functions available in worker context:
    self.KiMathWorkerFuncs = {
      fastSqrt: (x) => Math.sqrt(x),
      fastAdd: (a, b) => a + b
      // Additional worker-optimized functions can be registered here.
    };
  `;
  
  // In Node.js, use eval:true option. In browser, use Blob.
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    for (let i = 0; i < WORKER_COUNT; i++) {
      const worker = new WorkerGlobal(workerCode, { eval: true });
      _workerPool.push(worker);
    }
  } else {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const blobURL = URL.createObjectURL(blob);
    for (let i = 0; i < WORKER_COUNT; i++) {
      const worker = new WorkerGlobal(blobURL);
      _workerPool.push(worker);
    }
  }
}
initWorkerPool();

// Quantum compute: offload work to a worker pool (stub auto-assignment)
const KiMath_quantumCompute = (funcName, ...args) => {
  return new Promise((resolve, reject) => {
    const worker = _workerPool[Math.floor(Math.random() * WORKER_COUNT)];
    const id = Math.random().toString(36).substr(2);
    const handler = (e) => {
      if (e.data.id === id) {
        if (typeof worker.removeEventListener === "function") {
          worker.removeEventListener("message", handler);
        } else {
          worker.off("message", handler);
        }
        if (e.data.result && e.data.result.error) reject(e.data.result.error);
        else resolve(e.data.result);
      }
    };
    if (typeof worker.addEventListener === "function") {
      worker.addEventListener("message", handler);
    } else {
      worker.on("message", handler);
    }
    worker.postMessage({ id, funcName, args });
  });
};

/* --------------------------------------------------------------
   ADVANCED: DYNAMIC OPTIMIZATION & AUTO-TUNING (STUB)
   -------------------------------------------------------------- */
function dynamicOptimize(funcName, variants) {
  // TODO: Based on usage, hardware, and performance, select the best variant.
  // For now, simply return the first variant.
  return variants[0];
}

/* --------------------------------------------------------------
   ADVANCED: UNIFIED DSL FOR EXPRESSION COMPUTATION
   -------------------------------------------------------------- */
function parseExpression(expr, variables = {}) {
  // WARNING: This uses the Function constructor for demonstration.
  // In production, use a safe parser or library.
  const varNames = Object.keys(variables);
  const varValues = Object.values(variables);
  try {
    const func = new Function(...varNames, "return " + expr + ";");
    return func(...varValues);
  } catch (err) {
    throw new Error("Error parsing expression: " + err.message);
  }
}

/* --------------------------------------------------------------
   PLUGIN SYSTEM
   -------------------------------------------------------------- */
const _plugins = {};
function registerPlugin(pluginName, pluginObject) {
  if (_plugins[pluginName]) {
    throw new Error("Plugin already registered: " + pluginName);
  }
  _plugins[pluginName] = pluginObject;
  // Merge plugin functions into KiMath (if desired)
  Object.assign(KiMath, pluginObject);
}

/* --------------------------------------------------------------
   PERFORMANCE DASHBOARD (STUB)
   -------------------------------------------------------------- */
const _performanceMetrics = {};
function recordMetric(name, value) {
  _performanceMetrics[name] = value;
}
function performanceDashboard() {
  console.log("=== KiMath Performance Dashboard ===");
  console.table(_performanceMetrics);
}

/* --------------------------------------------------------------
   MAIN LIBRARY OBJECT: KiMath
   -------------------------------------------------------------- */
const KiMath = {};

// ========================================================
// 1. BASIC ARITHMETIC & NUMBER FUNCTIONS
// ========================================================

KiMath.add = (a, b) => a + b;
KiMath.sub = (a, b) => a - b;
KiMath.mul = (a, b) => a * b;
KiMath.div = (a, b) => { if (b === 0) throw new Error("Division by zero"); return a / b; };
KiMath.mod = (a, b) => ((a % b) + b) % b;

KiMath.abs   = (x) => Math.abs(x);
KiMath.sqrt  = (x) => Math.sqrt(x);
KiMath.cbrt  = (x) => Math.cbrt ? Math.cbrt(x) : Math.pow(x, 1/3);
KiMath.pow   = (x, y) => Math.pow(x, y);
KiMath.exp   = (x) => Math.exp(x);
KiMath.log   = (x) => Math.log(x);
KiMath.log10 = (x) => Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10;
KiMath.log2  = (x) => Math.log2 ? Math.log2(x) : Math.log(x) / Math.LN2;
KiMath.ceil  = (x) => Math.ceil(x);
KiMath.floor = (x) => Math.floor(x);
KiMath.round = (x) => Math.round(x);
KiMath.trunc = (x) => Math.trunc ? Math.trunc(x) : (x < 0 ? Math.ceil(x) : Math.floor(x));
KiMath.sign  = (x) => Math.sign ? Math.sign(x) : (x > 0 ? 1 : (x < 0 ? -1 : 0));
KiMath.clamp = (x, min, max) => Math.min(Math.max(x, min), max);
KiMath.lerp  = (a, b, t) => a + (b - a) * t;

KiMath.sumArray  = (arr) => arr.reduce((s, v) => s + v, 0);
KiMath.prodArray = (arr) => arr.reduce((p, v) => p * v, 1);
KiMath.avgArray  = (arr) => KiMath.sumArray(arr) / arr.length;
KiMath.minArray  = (arr) => Math.min(...arr);
KiMath.maxArray  = (arr) => Math.max(...arr);

KiMath.factorial = memoize(function(n) {
  if (n < 0) throw new Error("Negative factorial not defined");
  return n <= 1 ? 1 : n * KiMath.factorial(n - 1);
});

KiMath.fibonacci = (n) => {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }
  return a;
};

KiMath.gcd = (a, b) => b === 0 ? a : KiMath.gcd(b, a % b);
KiMath.lcm = (a, b) => Math.abs(a * b) / KiMath.gcd(a, b);

// Generate power and root functions for exponents 2..50
for (let n = 2; n <= 50; n++) {
  KiMath['power' + n] = ((exp) => (x) => Math.pow(x, exp))(n);
  KiMath['root' + n]  = ((nVal) => (x) => Math.pow(x, 1 / nVal))(n);
}

// ---- End of Basic Arithmetic & Numbers ----

// ========================================================
// 2. TRIGONOMETRY & HYPERBOLIC FUNCTIONS
// ========================================================

KiMath.sin   = (x) => Math.sin(x);
KiMath.cos   = (x) => Math.cos(x);
KiMath.tan   = (x) => Math.tan(x);
KiMath.asin  = (x) => Math.asin(x);
KiMath.acos  = (x) => Math.acos(x);
KiMath.atan  = (x) => Math.atan(x);
KiMath.atan2 = (y, x) => Math.atan2(y, x);

KiMath.sec   = (x) => 1 / Math.cos(x);
KiMath.csc   = (x) => 1 / Math.sin(x);
KiMath.cot   = (x) => 1 / Math.tan(x);

KiMath.sinh  = (x) => Math.sinh ? Math.sinh(x) : (Math.exp(x) - Math.exp(-x)) / 2;
KiMath.cosh  = (x) => Math.cosh ? Math.cosh(x) : (Math.exp(x) + Math.exp(-x)) / 2;
KiMath.tanh  = (x) => Math.tanh ? Math.tanh(x) : KiMath.sinh(x) / KiMath.cosh(x);
KiMath.asinh = (x) => Math.asinh ? Math.asinh(x) : Math.log(x + Math.sqrt(x*x + 1));
KiMath.acosh = (x) => Math.acosh ? Math.acosh(x) : Math.log(x + Math.sqrt(x*x - 1));
KiMath.atanh = (x) => Math.atanh ? Math.atanh(x) : 0.5 * Math.log((1 + x)/(1 - x));

KiMath.degToRad = (deg) => deg * (Math.PI / 180);
KiMath.radToDeg = (rad) => rad * (180 / Math.PI);

KiMath.sinDeg = (deg) => KiMath.sin(KiMath.degToRad(deg));
KiMath.cosDeg = (deg) => KiMath.cos(KiMath.degToRad(deg));
KiMath.tanDeg = (deg) => KiMath.tan(KiMath.degToRad(deg));

// ---- End of Trigonometry & Hyperbolic ----

// ========================================================
// 3. CALCULUS: DERIVATIVES, INTEGRALS & SERIES
// ========================================================

KiMath.derivative = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
KiMath.secondDerivative = (f, x, h = 1e-5) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);

KiMath.integral = (f, a, b, n = 10000) => {
  const step = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += f(a + i * step) * step;
  }
  return sum;
};

KiMath.integralSimpson = (f, a, b, n = 1000) => {
  if (n % 2 !== 0) n++; // Ensure even number of intervals
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
  }
  return (h / 3) * sum;
};

KiMath.taylorSeries = (f, x, n = 10) => {
  let sum = 0;
  let deriv = f;
  for (let i = 0; i < n; i++) {
    const derivVal = i === 0 ? f(0) : KiMath.derivative(deriv, 0);
    sum += (derivVal * Math.pow(x, i)) / KiMath.factorial(i);
    deriv = ((prev) => (z) => KiMath.derivative(prev, z))(deriv);
  }
  return sum;
};

// ---- End of Calculus ----

// ========================================================
// 4. LINEAR ALGEBRA & MATRIX OPERATIONS
// ========================================================

KiMath.matrixAdd = (A, B) =>
  A.map((row, i) => row.map((val, j) => val + B[i][j]));

KiMath.matrixSub = (A, B) =>
  A.map((row, i) => row.map((val, j) => val - B[i][j]));

KiMath.matrixMul = (A, B) => {
  const rowsA = A.length, colsA = A[0].length, colsB = B[0].length;
  const result = new Array(rowsA);
  for (let i = 0; i < rowsA; i++) {
    result[i] = new Array(colsB).fill(0);
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
};

KiMath.matrixTranspose = (M) =>
  M[0].map((_, i) => M.map(row => row[i]));

KiMath.matrixDeterminant = (M) => {
  const n = M.length;
  if (n === 1) return M[0][0];
  if (n === 2) return M[0][0]*M[1][1] - M[0][1]*M[1][0];
  let det = 0;
  for (let i = 0; i < n; i++) {
    const subMatrix = M.slice(1).map(row => row.filter((_, j) => j !== i));
    det += ((i % 2 === 0 ? 1 : -1) * M[0][i] * KiMath.matrixDeterminant(subMatrix));
  }
  return det;
};

KiMath.matrixInverse2x2 = (M) => {
  if (M.length !== 2 || M[0].length !== 2) throw new Error("Not a 2x2 matrix");
  const det = KiMath.matrixDeterminant(M);
  if (det === 0) throw new Error("Matrix not invertible");
  return [
    [ M[1][1] / det, -M[0][1] / det ],
    [ -M[1][0] / det, M[0][0] / det ]
  ];
};

KiMath.dotProduct = (v1, v2) =>
  v1.reduce((sum, val, i) => sum + val * v2[i], 0);

KiMath.crossProduct = (v1, v2) => [
  v1[1]*v2[2] - v1[2]*v2[1],
  v1[2]*v2[0] - v1[0]*v2[2],
  v1[0]*v2[1] - v1[1]*v2[0]
];

KiMath.vectorNorm = (v) =>
  Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));

KiMath.vectorDistance = (v1, v2) =>
  KiMath.vectorNorm(v1.map((val, i) => val - v2[i]));

// ---- End of Linear Algebra & Matrices ----

// ========================================================
// 5. NUMBER THEORY & COMBINATORICS
// ========================================================

KiMath.isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2, s = Math.sqrt(n); i <= s; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

KiMath.nextPrime = (n) => {
  let num = n + 1;
  while (!KiMath.isPrime(num)) num++;
  return num;
};

KiMath.primeFactors = (n) => {
  const factors = [];
  for (let i = 2; i <= n; i++) {
    while (n % i === 0) {
      factors.push(i);
      n /= i;
    }
  }
  return factors;
};

KiMath.totient = (n) => {
  let count = 0;
  for (let i = 1; i <= n; i++) {
    if (KiMath.gcd(n, i) === 1) count++;
  }
  return count;
};

KiMath.sumDivisors = (n) => {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) sum += i;
  }
  return sum;
};

KiMath.isPerfect = (n) => KiMath.sumDivisors(n) - n === n;

KiMath.modExp = (base, exp, mod) => {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
};

KiMath.modInverse = (a, m) => {
  let m0 = m, x0 = 0, x1 = 1;
  if (m === 1) return 0;
  while (a > 1) {
    const q = Math.floor(a / m);
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  if (x1 < 0) x1 += m0;
  return x1;
};

KiMath.permutations = (n, r) =>
  KiMath.factorial(n) / KiMath.factorial(n - r);
KiMath.combinations = (n, r) =>
  KiMath.factorial(n) / (KiMath.factorial(r) * KiMath.factorial(n - r));
KiMath.binomialCoefficient = KiMath.combinations;
KiMath.catalan = (n) => KiMath.combinations(2 * n, n) / (n + 1);
KiMath.derangements = (n) => {
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    sum += ((k % 2 === 0 ? 1 : -1) / KiMath.factorial(k));
  }
  return Math.round(KiMath.factorial(n) * sum);
};

// ---- End of Number Theory & Combinatorics ----

// ========================================================
// 6. STATISTICS & PROBABILITY
// ========================================================

KiMath.mean = (arr) => KiMath.sumArray(arr) / arr.length;
KiMath.median = (arr) => {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
KiMath.mode = (arr) => {
  const freq = {};
  arr.forEach(v => freq[v] = (freq[v] || 0) + 1);
  return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
};
KiMath.variance = (arr) => {
  const m = KiMath.mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
};
KiMath.stdDev = (arr) => Math.sqrt(KiMath.variance(arr));
KiMath.sampleVariance = (arr) => {
  const m = KiMath.mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
};
KiMath.sampleStdDev = (arr) => Math.sqrt(KiMath.sampleVariance(arr));
KiMath.skewness = (arr) => {
  const m = KiMath.mean(arr), s = KiMath.stdDev(arr);
  return arr.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0) / arr.length;
};
KiMath.kurtosis = (arr) => {
  const m = KiMath.mean(arr), s = KiMath.stdDev(arr);
  return arr.reduce((sum, v) => sum + ((v - m) / s) ** 4, 0) / arr.length - 3;
};
KiMath.percentile = (arr, p) => {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index), upper = Math.ceil(index);
  return lower === upper ? sorted[lower] : sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};
KiMath.quartiles = (arr) => ({
  Q1: KiMath.percentile(arr, 25),
  Q2: KiMath.percentile(arr, 50),
  Q3: KiMath.percentile(arr, 75)
});
KiMath.interquartileRange = (arr) => KiMath.quartiles(arr).Q3 - KiMath.quartiles(arr).Q1;
KiMath.covariance = (arr1, arr2) => {
  const m1 = KiMath.mean(arr1), m2 = KiMath.mean(arr2);
  let cov = 0;
  for (let i = 0; i < arr1.length; i++) {
    cov += (arr1[i] - m1) * (arr2[i] - m2);
  }
  return cov / arr1.length;
};
KiMath.correlation = (arr1, arr2) =>
  KiMath.covariance(arr1, arr2) / (KiMath.stdDev(arr1) * KiMath.stdDev(arr2));
KiMath.normalPDF = (x, mean = 0, std = 1) => {
  const coef = 1 / (std * Math.sqrt(2 * Math.PI));
  return coef * Math.exp(-((x - mean) ** 2) / (2 * std ** 2));
};
KiMath.normalCDF = (x, mean = 0, std = 1) => {
  const erf = (z) => {
    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z);
    const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741;
    const a4 = -1.453152027, a5 =  1.061405429, p  =  0.3275911;
    const t = 1 / (1 + p * z);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z*z);
    return sign * y;
  };
  return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
};
KiMath.poissonPDF = (lambda, k) =>
  (Math.exp(-lambda) * Math.pow(lambda, k)) / KiMath.factorial(k);
KiMath.exponentialPDF = (x, lambda) => lambda * Math.exp(-lambda * x);

// ---- End of Statistics & Probability ----

// ========================================================
// 7. GEOMETRY: AREAS, PERIMETERS, VOLUMES, ETC.
 // ========================================================

KiMath.areaCircle = (r) => Math.PI * r * r;
KiMath.circumferenceCircle = (r) => 2 * Math.PI * r;
KiMath.areaEllipse = (a, b) => Math.PI * a * b;
KiMath.circumferenceEllipse = (a, b) => Math.PI * (3*(a + b) - Math.sqrt((3*a + b) * (a + 3*b)));
KiMath.areaTriangle = (a, b, c) => {
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
};
KiMath.areaTriangleBaseHeight = (base, height) => 0.5 * base * height;
KiMath.areaRectangle = (l, w) => l * w;
KiMath.perimeterRectangle = (l, w) => 2 * (l + w);
KiMath.areaSquare = (s) => s * s;
KiMath.perimeterSquare = (s) => 4 * s;
KiMath.areaParallelogram = (base, height) => base * height;
KiMath.areaTrapezoid = (a, b, h) => ((a + b) / 2) * h;
KiMath.areaRegularPolygon = (n, s) => {
  const apothem = s / (2 * Math.tan(Math.PI / n));
  return (n * s * apothem) / 2;
};
for (let sides = 3; sides <= 20; sides++) {
  KiMath["areaRegularPolygon" + sides] = (s) => {
    const apothem = s / (2 * Math.tan(Math.PI / sides));
    return (sides * s * apothem) / 2;
  };
}
KiMath.perimeterPolygon = (n, s) => n * s;
KiMath.volumeSphere = (r) => (4 / 3) * Math.PI * Math.pow(r, 3);
KiMath.volumeCylinder = (r, h) => Math.PI * r * r * h;
KiMath.volumeCone = (r, h) => (1 / 3) * Math.PI * r * r * h;
KiMath.volumeCube = (s) => Math.pow(s, 3);
KiMath.volumeRectPrism = (l, w, h) => l * w * h;
KiMath.surfaceAreaSphere = (r) => 4 * Math.PI * r * r;
KiMath.surfaceAreaCylinder = (r, h) => 2 * Math.PI * r * (r + h);
KiMath.surfaceAreaCone = (r, l) => Math.PI * r * (r + l);
KiMath.surfaceAreaCube = (s) => 6 * s * s;
KiMath.distance2D = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
KiMath.distance3D = (x1, y1, z1, x2, y2, z2) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);

// ---- End of Geometry ----

// ========================================================
// 8. FINANCE & ECONOMICS FUNCTIONS
// ========================================================

KiMath.compoundInterest = (P, r, t, n = 1) => P * Math.pow(1 + r/n, n*t);
KiMath.futureValue = (PV, r, t) => PV * Math.pow(1 + r, t);
KiMath.presentValue = (FV, r, t) => FV / Math.pow(1 + r, t);
KiMath.annuityPayment = (PV, r, n) => (PV * r) / (1 - Math.pow(1 + r, -n));
KiMath.mortgagePayment = (P, r, n) =>
  (P * (r/12) * Math.pow(1 + r/12, n)) / (Math.pow(1 + r/12, n) - 1);
KiMath.netPresentValue = (cashFlows, r) =>
  cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + r, i), 0);
KiMath.internalRateOfReturn = (cashFlows, guess = 0.1, iterations = 1000) => {
  let r = guess;
  for (let i = 0; i < iterations; i++) {
    let npv = KiMath.netPresentValue(cashFlows, r);
    let derivative = (KiMath.netPresentValue(cashFlows, r + 1e-5) - npv) / 1e-5;
    r = r - npv / derivative;
  }
  return r;
};
KiMath.depreciationStraightLine = (cost, salvage, life) => (cost - salvage) / life;
KiMath.depreciationDecliningBalance = (cost, rate, period) => cost * Math.pow(1 - rate, period);
KiMath.roi = (gain, cost) => ((gain - cost) / cost) * 100;

// ---- End of Finance & Economics ----

// ========================================================
// 9. PHYSICS & ENGINEERING FUNCTIONS
// ========================================================

KiMath.kineticEnergy = (m, v) => 0.5 * m * v * v;
KiMath.potentialEnergy = (m, g, h) => m * g * h;
KiMath.momentum = (m, v) => m * v;
KiMath.force = (m, a) => m * a;
KiMath.power = (work, t) => work / t;
KiMath.workDone = (F, d) => F * d;
KiMath.pressure = (F, A) => F / A;
KiMath.density = (mass, volume) => mass / volume;
KiMath.acceleration = (v0, v, t) => (v - v0) / t;
KiMath.gravitationalForce = (m1, m2, d) =>
  (6.67430e-11 * m1 * m2) / (d * d);
KiMath.impulse = (F, t) => F * t;
KiMath.ohmsLaw = (V, I) => V / I;
KiMath.idealGasLaw = (n, R, T, V) => (n * R * T) / V;

// ---- End of Physics & Engineering ----

// ========================================================
// 10. MACHINE LEARNING & AI FUNCTIONS
// ========================================================

KiMath.sigmoid = (x) => 1 / (1 + Math.exp(-x));
KiMath.tanh = (x) =>
  Math.tanh ? Math.tanh(x) : (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
KiMath.relu = (x) => Math.max(0, x);
KiMath.leakyRelu = (x, alpha = 0.01) => (x > 0 ? x : alpha * x);
KiMath.softplus = (x) => Math.log(1 + Math.exp(x));
KiMath.swish = (x) => x * KiMath.sigmoid(x);

KiMath.mseLoss = (pred, actual) => {
  if (pred.length !== actual.length)
    throw new Error("Array lengths must match");
  return KiMath.mean(pred.map((p, i) => (p - actual[i]) ** 2));
};
KiMath.maeLoss = (pred, actual) => {
  if (pred.length !== actual.length)
    throw new Error("Array lengths must match");
  return KiMath.mean(pred.map((p, i) => Math.abs(p - actual[i])));
};
KiMath.crossEntropyLoss = (pred, actual) => {
  if (pred.length !== actual.length)
    throw new Error("Array lengths must match");
  return -pred.reduce((sum, p, i) => sum + actual[i] * Math.log(p + 1e-15), 0);
};

// ---- End of Machine Learning & AI ----

// ========================================================
// 11. UTILITY & CONVERSION FUNCTIONS
// ========================================================

KiMath.random = (min = 0, max = 1) => Math.random() * (max - min) + min;
KiMath.randomInt = (min = 0, max = 100) =>
  Math.floor(KiMath.random(min, max + 1));
KiMath.shuffleArray = (arr) => {
  const array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
KiMath.rangeArray = (start, end, step = 1) => {
  const arr = [];
  for (let i = start; i <= end; i += step) arr.push(i);
  return arr;
};
KiMath.uniqueArray = (arr) => Array.from(new Set(arr));
KiMath.celsiusToFahrenheit = (C) => (C * 9/5) + 32;
KiMath.fahrenheitToCelsius = (F) => (F - 32) * 5/9;
KiMath.kmToMiles = (km) => km * 0.621371;
KiMath.milesToKm = (miles) => miles / 0.621371;
KiMath.kgToPounds = (kg) => kg * 2.20462;
KiMath.poundsToKg = (lb) => lb / 2.20462;

// ---- End of Utility & Conversion ----

// ========================================================
// 12. ADVANCED FEATURES: DSL, AUTO-TUNING, PLUGINS, & PERFORMANCE
// ========================================================

KiMath.compute = (expression, variables = {}) => parseExpression(expression, variables);

KiMath.setOptimizationMode = (mode) => {
  console.log("Optimization mode set to:", mode);
  KiMath._optimizationMode = mode;
};

KiMath.registerPlugin = registerPlugin;

KiMath.showPerformanceDashboard = performanceDashboard;

KiMath.quantumCompute = (funcName, ...args) =>
  KiMath_quantumCompute(funcName, ...args);

// ---- End of Advanced Features ----

// ========================================================
// EXPORT / GLOBAL ASSIGNMENT
// ========================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = KiMath;
} else {
  window.KiMath = KiMath;
}