// Флаг, указывающий, используется ли кастомная (пользовательская) функция или нет
var customFunction = true

// Функция для обработки кода, введённого пользователем в элемент с id "code-input"
function handleCustomFunction(){
    // Получаем текст из поля ввода, убираем все переносы строк
    let userCode = document.getElementById("code-input").value.split("\n").join("")
    // Формируем строку с кодом: объявляем переменную fz,
    // выполняем код пользователя и возвращаем значение fz
    code = "let fz; " + userCode + "; return fz"
    // Создаём функцию с одним аргументом z, в теле которой - сформированный код
    mathExpr = new Function("z", `${code}`)
}

// Функция для получения функции вычисления в зависимости от флага customFunction
function getFunction(){
    if(customFunction){
        // Если включена пользовательская функция — обработать ввод пользователя
        handleCustomFunction()
    }
    else{
        // Иначе сформировать функцию из формулы,
        // сначала распарсив её с помощью parseExpression
        mathExpr = new Function("z", `return ${parseExpression(formula)}`)
    }
}

// Переключение режима использования кастомной функции
function switchFunctionType(){
    // Меняет значение customFunction true->false, false->true
    customFunction = !customFunction
}