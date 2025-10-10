// 3) minDigit(x): Наименьшая цифра неотрицательного целого x
function minDigit(x) {
  if (x < 0 || x % 1 !== 0) {
    throw new Error("x должно быть целым неотрицательным.");
  }
  if (x === 0) return 0;
  let min = 9;
  while (x > 0) {
    const d = x % 10;
    if (d < min) min = d;
    if (min === 0) return 0;
    x = (x - d) / 10;
  }
  return min;
}

// Примеры:
// console.log(minDigit(987654)); // 4
// console.log(minDigit(1002));   // 0

if (typeof module !== "undefined") module.exports = { minDigit };
