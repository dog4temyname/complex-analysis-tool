const E = 2.71828182845904523536
const PI = 3.14159265358979323846

// ------------------------------------------
// - Basic Complex Functions and Polar Form -
// ------------------------------------------

function Complex(a, b) {
    return { real: a, imag: b }
}

function Polar(abs, arg) {
    return { abs: abs, arg: arg }
}

function ComplexToPolar(a) {
    return { abs: ComplexAbs(a), arg: ComplexArgument(a) }
}

function PolarToComplex(a) {
    return { real: a.abs * Math.cos(a.arg), imag: a.abs * Math.sin(a.arg) }
}

function ComplexConjugate(a) {
    return { real: a.real, imag: -a.imag }
}

function ComplexAbs(a) {
    return {real: Math.sqrt(a.real * a.real + a.imag * a.imag), imag: 0}
}

function ComplexArgument(a) {
    return {real: Math.atan2(a.imag, a.real), imag: 0}
}

function ComplexRealPart(a) {
    return { real: a.real, imag: 0 }
}

function ComplexImagPart(a) {
    return { real: a.imag, imag: 0 }
}

// ------------------------------------------
// -               Arithmetic               -
// ------------------------------------------

function ComplexSum(a, b) {
    return { real: a.real + b.real, imag: a.imag + b.imag }
}

function ComplexSubtraction(a, b) {
    return { real: a.real - b.real, imag: a.imag - b.imag }
}

function ComplexMultiplication(a, b) {
    return { real: a.real * b.real - a.imag * b.imag, imag: a.real * b.imag + a.imag * b.real }
}

function ComplexDivision(a, b) {
    const denominator = b.real * b.real + b.imag * b.imag
    return { real: (a.real * b.real + a.imag * b.imag) / denominator, imag: (a.imag * b.real - a.real * b.imag) / denominator }
}

// ------------------------------------------
// -          Exponents, Logarithms         -
// ------------------------------------------

function ComplexLn(a) {
    return { real: Math.log(ComplexAbs(a).real), imag: ComplexArgument(a).real }
}

function ComplexPower(a, b) {
    let exponent = ComplexMultiplication(b, ComplexLn(a))
    return { real: Math.exp(exponent.real) * Math.cos(exponent.imag), imag: Math.exp(exponent.real) * Math.sin(exponent.imag) }
}

function ComplexExp(a) {
    return { real: Math.exp(a.real) * Math.cos(a.imag), imag: Math.exp(a.real) * Math.sin(a.imag) }
}

function ComplexLog(a, base) {
    return ComplexDivision(ComplexLn(a), ComplexLn(base))
}

// ------------------------------------------
// -          Trigonometry                  -
// ------------------------------------------

function ComplexSin(a) {
    return { real: Math.sin(a.real) * Math.cosh(a.imag), imag: Math.cos(a.real) * Math.sinh(a.imag) }
}

function ComplexCos(a) {
    return { real: Math.cos(a.real) * Math.cosh(a.imag), imag: -Math.sin(a.real) * Math.sinh(a.imag) }
}

function ComplexTan(a) {
    return ComplexDivision(ComplexSin(a), ComplexCos(a))
}

function ComplexCsc(a) {
    return ComplexDivision(Complex(1, 0), ComplexSin(a))
}

function ComplexSec(a) {
    return ComplexDivision(Complex(1, 0), ComplexCos(a))
}

function ComplexCtg(a) {
    return ComplexDivision(ComplexCos(a), ComplexSin(a))
}

function ComplexAsin(z) {
    const term1 = ComplexMultiplication(z, z)
    const term2 = ComplexSubtraction(Complex(1, 0), term1)
    const term3 = ComplexPower(term2, Complex(0.5, 0))
    const term4 = ComplexMultiplication(z, Complex(0, 1))
    const term5 = ComplexSum(term3, term4)
    const term6 = ComplexLn(term5)
    const term7 = ComplexMultiplication(term6, Complex(0, 1))
    return ComplexMultiplication(Complex(-1, 0), term7)
}

function ComplexAcos(z) {
    return ComplexSubtraction(Complex(PI / 2, 0), ComplexAsin(z))
}

function ComplexAtan(z) {
    const term1 = ComplexSubtraction(Complex(0, 1), z)
    const term2 = ComplexSum(Complex(0, 1), z)
    const term3 = ComplexDivision(term1, term2)
    const term4 = ComplexLn(term3)
    return ComplexMultiplication(Complex(0, -0.5), term4)
}

function ComplexAcsc(z) {
    return ComplexAsin(ComplexDivision(Complex(1, 0), z))
}

function ComplexAsec(z) {
    return ComplexAcos(ComplexDivision(Complex(1, 0), z))
}

function ComplexAcot(z) {
    return ComplexAtan(ComplexDivision(Complex(1, 0), z))
}

function ComplexSinh(z) {
    const term1 = ComplexExp(z)
    const term2 = ComplexExp(ComplexMultiplication(Complex(-1, 0), z))
    const term3 = ComplexSubtraction(term1, term2)
    return ComplexDivision(term3, Complex(2, 0))
}

function ComplexCosh(z) {
    const term1 = ComplexExp(z)
    const term2 = ComplexExp(ComplexMultiplication(Complex(-1, 0), z))
    const term3 = ComplexSum(term1, term2)
    return ComplexDivision(term3, Complex(2, 0))
}

function ComplexTanh(z) {
    return ComplexDivision(ComplexSinh(z), ComplexCosh(z))
}

function ComplexCsch(z) {
    return ComplexDivision(Complex(1, 0), ComplexSinh(z))
}

function ComplexSech(z) {
    return ComplexDivision(Complex(1, 0), ComplexCosh(z))
}

function ComplexCtgh(z) {
    return ComplexDivision(Complex(1, 0), ComplexTanh(z))
}

function ComplexAsinh(z) {
    const term1 = ComplexMultiplication(z, z)
    const term2 = ComplexSum(term1, Complex(1, 0))
    const term3 = ComplexPower(term2, Complex(0.5, 0))
    const term4 = ComplexSum(z, term3)
    return ComplexLn(term4)
}

function ComplexAcosh(z) {
    const term1 = ComplexMultiplication(z, z)
    const term2 = ComplexSum(term1, Complex(-1, 0))
    const term3 = ComplexPower(term2, Complex(0.5, 0))
    const term4 = ComplexSum(z, term3)
    return ComplexLn(term4)
}

function ComplexAtanh(z) {
    const term1 = ComplexSum(Complex(1, 0), z)
    const term2 = ComplexSubtraction(Complex(1, 0), z)
    const term3 = ComplexDivision(term1, term2)
    const term4 = ComplexLn(term3)
    return ComplexMultiplication(term4, Complex(0.5, 0))
}

function ComplexAcsch(z) {
    const term1 = ComplexDivision(Complex(1, 0), z)
    const term2 = ComplexMultiplication(z, z)
    const term3 = ComplexDivision(Complex(1, 0), term2)
    const term4 = ComplexSum(term3, Complex(1, 0))
    const term5 = ComplexPower(term4, Complex(0.5, 0))
    const term6 = ComplexSum(term1, term5)
    return ComplexLn(term6)
}

function ComplexAsech(z) {
    const term1 = ComplexDivision(Complex(1, 0), z)
    const term2 = ComplexMultiplication(z, z)
    const term3 = ComplexDivision(Complex(1, 0), term2)
    const term4 = ComplexSubtraction(term3, Complex(1, 0))
    const term5 = ComplexPower(term4, Complex(0.5, 0))
    const term6 = ComplexSum(term1, term5)
    return ComplexLn(term6)
}

function ComplexActgh(z) {
    const term1 = ComplexSum(z, Complex(1, 0))
    const term2 = ComplexSubtraction(z, Complex(1, 0))
    const term3 = ComplexDivision(term1, term2)
    const term4 = ComplexLn(term3)
    return ComplexMultiplication(term4, Complex(0.5, 0))
}