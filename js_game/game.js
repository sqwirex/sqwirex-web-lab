// Math Game: три уровня — начальный, средний, продвинутый.
// - Подсчёт правильных/неправильных ответов, отображение на странице
// - Вопросы не повторяются
// - 10 вопросов на уровень; проход при >=80%
// - Начальный: арифметика; Средний: + операторы сравнения; Продвинутый: логические и/или двоичные операции
// - Поздравление в конце; возможность перезапуска или выхода

(function () {
  const levelNames = ["начальный", "средний", "продвинутый"];
  let level = 0;              
  let correct = 0;
  let wrong = 0;
  let total = 0;
  let asked = new Set();      
  let timerId = null;
  const levelSeconds = 5 * 60; 
  let timeLeft = levelSeconds;
  let currentAnswer = null;  
   
  const levelNameEl = document.getElementById("levelName");
  const timerEl = document.getElementById("timer");
  const correctEl = document.getElementById("correct");
  const wrongEl = document.getElementById("wrong");
  const totalEl = document.getElementById("total");
  const questionEl = document.getElementById("question");
  const answerEl = document.getElementById("answer");
  const submitBtn = document.getElementById("submit");
  const feedbackEl = document.getElementById("feedback");
  const restartBtn = document.getElementById("restart");
  const quitBtn = document.getElementById("quit");

  function pad2(x) { return (x < 10 ? "0" : "") + x; }
  function updateTimerView() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerEl.textContent = `${m}:${pad2(s)}`;
  }
  function startTimer() {
    clearInterval(timerId);
    timeLeft = levelSeconds;
    updateTimerView();
    timerId = setInterval(() => {
      timeLeft--;
      updateTimerView();
      if (timeLeft <= 0) {
        clearInterval(timerId);
        gameOver(false, "Время вышло. Попробуйте снова.");
      }
    }, 1000);
  }

  // Служебные функции
  function rndInt(min, max) { 
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) {
    return arr[rndInt(0, arr.length - 1)];
  }
  function toBoolString(v) { return v ? "true" : "false"; }

  // Генерация вопросов по уровням
  function makeArithmeticQuestion() {
    const ops = ["+", "-", "*", "/"];
    let a, b, op, text, ans;
    while (true) {
      a = rndInt(1, 20);
      b = rndInt(1, 20);
      op = pick(ops);
      if (op === "/") {
        if (a % b !== 0) continue;
        ans = String(a / b);
      } else if (op === "+") ans = String(a + b);
      else if (op === "-") ans = String(a - b);
      else if (op === "*") ans = String(a * b);
      text = `${a} ${op} ${b}`;
      if (!asked.has(text)) break;
    }
    return { text, answer: ans, placeholder: "Введите число" };
  }

  function makeComparisonQuestion() {
    const ops = [">", "<", ">=", "<=", "==", "!="];
    let a, b, op, text, ans;
    while (true) {
      a = rndInt(-30, 30);
      b = rndInt(-30, 30);
      op = pick(ops);
      // вычислим
      let value = false;
      if (op === ">") value = a > b;
      else if (op === "<") value = a < b;
      else if (op === ">=") value = a >= b;
      else if (op === "<=") value = a <= b;
      else if (op === "==") value = a === b;
      else if (op === "!=") value = a !== b;
      ans = toBoolString(value);
      text = `${a} ${op} ${b}`;
      if (!asked.has(text)) break;
    }
    return { text, answer: ans, placeholder: "true/false (или да/нет/1/0)" };
  }

  function bitwiseOp(op, a, b) {
    if (op === "&") return a & b;
    if (op === "|") return a | b;
    if (op === "^") return a ^ b;
    return 0;
  }

  function toBinary(n, width) {
    let s = (n >>> 0).toString(2);
    while (s.length < width) s = "0" + s;
    return s;
  }

  function makeAdvancedQuestion() {
    const kind = pick(["logic", "binary"]);
    if (kind === "logic") {
      const ops = ["&&", "||"];
      const A = Math.random() < 0.5;
      const B = Math.random() < 0.5;
      const C = Math.random() < 0.5;
      const op1 = pick(ops);
      const op2 = pick(ops);
      let value;
      if (Math.random() < 0.5) {
        value = op2 === "&&"
          ? ( (op1 === "&&" ? (A && B) : (A || B)) && C )
          : ( (op1 === "&&" ? (A && B) : (A || B)) || C );
        var text = `(${A} ${op1} ${B}) ${op2} ${C}`;
      } else {
        value = op1 === "&&"
          ? ( A && (op2 === "&&" ? (B && C) : (B || C)) )
          : ( A || (op2 === "&&" ? (B && C) : (B || C)) );
        var text = `${A} ${op1} (${B} ${op2} ${C})`;
      }
      const ans = toBoolString(!!value);
      if (asked.has(text)) return makeAdvancedQuestion();
      return { text, answer: ans, placeholder: "true/false (или да/нет/1/0)" };
    } else {
      const width = rndInt(4, 8);
      const op = pick(["&", "|", "^"]);
      const a = rndInt(0, (1 << width) - 1);
      const b = rndInt(0, (1 << width) - 1);
      const text = `${toBinary(a, width)} ${op} ${toBinary(b, width)} (в двоичной системе)`;
      const val = bitwiseOp(op, a, b);
      const ans = toBinary(val, width);
      if (asked.has(text)) return makeAdvancedQuestion();
      return { text, answer: ans, placeholder: "Введите бинарный ответ (например, 0101)" };
    }
  }

  function nextQuestion() {
    let q;
    if (level === 0) q = makeArithmeticQuestion();
    else if (level === 1) {
      q = Math.random() < 0.5 ? makeArithmeticQuestion() : makeComparisonQuestion();
    } else q = makeAdvancedQuestion();

    currentAnswer = q.answer;
    asked.add(q.text);
    questionEl.textContent = q.text;
    answerEl.value = "";
    answerEl.placeholder = q.placeholder;
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback muted";
    answerEl.focus();
  }

  function normalizeAnswer(raw) {
    let s = String(raw).trim().toLowerCase();
    if (s === "да" || s === "1") return "true";
    if (s === "нет" || s === "0") return "false";
    return s;
  }

  function submit() {
    if (currentAnswer == null) return;
    const user = normalizeAnswer(answerEl.value);
    const isCorrect = user === String(currentAnswer).trim().toLowerCase();
    if (isCorrect) {
      correct++;
      feedbackEl.textContent = "Верно!";
      feedbackEl.className = "feedback success";
    } else {
      wrong++;
      feedbackEl.textContent = `Неверно. Правильный ответ: ${currentAnswer}`;
      feedbackEl.className = "feedback error";
    }
    total++;
    correctEl.textContent = String(correct);
    wrongEl.textContent = String(wrong);
    totalEl.textContent = String(total);

    if (total >= 10) {
      // финал уровня
      setTimeout(() => finishLevel(), 300);
    } else {
      setTimeout(() => nextQuestion(), 300);
    }
  }

  function finishLevel() {
    clearInterval(timerId);
    const pass = correct >= 8;
    if (pass && level < 2) {
      feedbackEl.textContent = `Поздравляем! Вы набрали ${correct}/10 и переходите на следующий уровень.`;
      feedbackEl.className = "feedback success";
      level++;
      levelNameEl.textContent = levelNames[level];
      asked = new Set();
      correct = 0; wrong = 0; total = 0;
      correctEl.textContent = "0";
      wrongEl.textContent = "0";
      totalEl.textContent = "0";
      startTimer();
      setTimeout(() => nextQuestion(), 600);
    } else if (pass && level === 2) {
      gameOver(true, `Поздравляем! Игра завершена. Итог: ${correct}/10 на продвинутом уровне.`);
    } else {
      gameOver(false, `Упс! Достаточно набрать 8 из 10. Ваш результат: ${correct}/10.`);
    }
  }

  function gameOver(won, message) {
    clearInterval(timerId);
    questionEl.textContent = "Игра окончена";
    feedbackEl.textContent = message + (won ? " Отличная работа!" : " Попробуете ещё раз?");
    feedbackEl.className = "feedback " + (won ? "success" : "error");
    currentAnswer = null;
  }

  function restart() {
    clearInterval(timerId);
    level = 0;
    levelNameEl.textContent = levelNames[level];
    asked = new Set();
    correct = 0; wrong = 0; total = 0;
    correctEl.textContent = "0";
    wrongEl.textContent = "0";
    totalEl.textContent = "0";
    startTimer();
    nextQuestion();
  }

  function quit() {
    clearInterval(timerId);
    questionEl.textContent = "Вы вышли из игры.";
    feedbackEl.textContent = "Нажмите «Перезапустить», чтобы начать заново.";
    feedbackEl.className = "feedback muted";
    currentAnswer = null;
  }

  submitBtn.addEventListener("click", submit);
  answerEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
  restartBtn.addEventListener("click", restart);
  quitBtn.addEventListener("click", quit);

  restart();
})();