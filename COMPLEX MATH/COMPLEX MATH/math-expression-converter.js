class FunctionStore {
    
    constructor() {
        this.functions = new Map();
        this.nextId = 0;
    }
    
    addFunction(funcCall) {
        const funcId = `#${this.nextId++}#`;
        this.functions.set(funcId, funcCall);
        return funcId;
    }
    
    getFinalExpression(expr) {
        const sortedIds = Array.from(this.functions.keys())
            .sort((a, b) => b.length - a.length || b.localeCompare(a));
        
        let result = expr;
        for (const funcId of sortedIds) {
            result = result.split(funcId).join(this.functions.get(funcId));
        }
        
        return result;
    }
}

// Map of standard functions to their complex equivalents
const COMPLEX_FUNCTION_MAP = {
    sin: 'ComplexSin',
    cos: 'ComplexCos',
    tan: 'ComplexTan',
    exp: 'ComplexExp',
    log: 'ComplexLog',
    ln: 'ComplexLn',
    sqrt: 'ComplexSqrt',
    asin: 'ComplexAsin',
    acos: 'ComplexAcos',
    atan: 'ComplexAtan',
    sinh: 'ComplexSinh',
    cosh: 'ComplexCosh',
    tanh: 'ComplexTanh',
    asinh: 'ComplexAsinh',
    acosh: 'ComplexAcosh',
    atanh: 'ComplexAtanh',
    real: 'ComplexRealPart',
    imag: 'ComplexImagPart',
    abs: 'ComplexAbs',
    arg: 'ComplexArgument'
};

function parseExpression(expr) {
    const store = new FunctionStore();
    
    // Replace "i" with a temporary placeholder
    let tempExpr = expr.replace(/(?<!\w)i(?!\w)/g, '#IMAG#');
    
    // Process the expression
    tempExpr = processParentheses(tempExpr, store);
    tempExpr = processOperations(tempExpr, store);
    
    // Get the final expression
    let finalExpr = store.getFinalExpression(tempExpr);
    
    // Convert numbers and restore imaginary unit
    finalExpr = convertNumbersToComplex(finalExpr);
    finalExpr = finalExpr.replace(/#IMAG#/g, 'Complex(0, 1)');
    
    return finalExpr;
}

function convertNumbersToComplex(expr) {
    let result = '';
    let i = 0;
    
    while (i < expr.length) {
        // Skip Complex() calls
        if (expr.substring(i, i + 8) === 'Complex(') {
            let depth = 1;
            let j = i + 8;
            result += 'Complex(';
            
            while (j < expr.length && depth > 0) {
                if (expr[j] === '(') depth++;
                if (expr[j] === ')') depth--;
                result += expr[j];
                j++;
            }
            i = j;
            continue;
        }
        
        // Handle negative numbers
        if (expr[i] === '-' && i + 1 < expr.length && /\d/.test(expr[i + 1])) {
            const isNegativeNumber = i === 0 || ['(', ',', '+', '-', '*', '/', '^'].includes(expr[i - 1]);
            
            if (isNegativeNumber) {
                let number = '-';
                let j = i + 1;
                
                while (j < expr.length && /[\d\.]/.test(expr[j])) {
                    number += expr[j];
                    j++;
                }
                
                const isStandalone = (j === expr.length || !/[\w#]/.test(expr[j]));
                
                if (isStandalone && number !== '-') {
                    result += `Complex(${number}, 0)`;
                } else {
                    result += number;
                }
                i = j;
                continue;
            }
        }
        
        // Handle positive numbers
        if (/\d/.test(expr[i])) {
            let number = '';
            let j = i;
            
            while (j < expr.length && /[\d\.]/.test(expr[j])) {
                number += expr[j];
                j++;
            }
            
            const isStandalone = (i === 0 || !/[\w#]/.test(expr[i - 1])) &&
                                (j === expr.length || !/[\w#]/.test(expr[j]));
            
            if (isStandalone && number) {
                result += `Complex(${number}, 0)`;
            } else {
                result += number;
            }
            i = j;
            continue;
        }
        
        // Regular characters
        result += expr[i];
        i++;
    }
    
    return result;
}

function processParentheses(expr, store) {
    let newExpr = expr;
    const parenRegex = /([a-zA-Z]+)?\(([^()]+)\)/g;
    
    while (true) {
        const match = parenRegex.exec(newExpr);
        if (!match) break;
        
        const [fullMatch, funcName, innerExpr] = match;
        const start = match.index;
        const end = start + fullMatch.length;
        
        if (funcName) {
            // Function call
            const complexFuncName = COMPLEX_FUNCTION_MAP[funcName] || funcName;
            const args = innerExpr.split(',')
                .map(arg => processOperations(arg.trim(), store));
            
            const funcId = store.addFunction(`${complexFuncName}(${args.join(', ')})`);
            newExpr = newExpr.substring(0, start) + funcId + newExpr.substring(end);
        } else {
            // Parentheses grouping
            const processedInner = processOperations(innerExpr, store);
            newExpr = newExpr.substring(0, start) + processedInner + newExpr.substring(end);
        }
        
        parenRegex.lastIndex = 0;
    }
    
    return newExpr;
}

function processOperations(expr, store) {
    let newExpr = expr;
    
    // Process exponentiation
    newExpr = processOperation(newExpr, store, /\^/, (a, b) => `ComplexPower(${a}, ${b})`);
    
    // Process multiplication and division
    newExpr = processOperation(newExpr, store, /[*\/]/, (a, b, op) => 
        op === '*' ? `ComplexMultiplication(${a}, ${b})` : `ComplexDivision(${a}, ${b})`);
    
    // Process addition and subtraction
    newExpr = processOperation(newExpr, store, /[+-]/, (a, b, op) => 
        op === '+' ? `ComplexSum(${a}, ${b})` : `ComplexSubtraction(${a}, ${b})`);
    
    return newExpr;
}

function processOperation(expr, store, opPattern, createFuncCall) {
    let newExpr = expr;
    const opChars = opPattern.source.replace(/[\[\]]/g, '');
    const opRegex = new RegExp(`([0-9#a-zA-Z.()]+)\\s*([${opChars}])\\s*([0-9#a-zA-Z.()]+)`);
    
    while (true) {
        const match = opRegex.exec(newExpr);
        if (!match) break;
        
        const [fullMatch, left, op, right] = match;
        const start = match.index;
        const end = start + fullMatch.length;
        
        const funcCall = createFuncCall(left, right, op);
        const funcId = store.addFunction(funcCall);
        
        newExpr = newExpr.substring(0, start) + funcId + newExpr.substring(end);
        opRegex.lastIndex = 0;
    }
    
    return newExpr;
}