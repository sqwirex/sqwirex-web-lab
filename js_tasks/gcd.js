// 2) gcd(a, b): Наибольший общий делитель (алгоритм Евклида)
function gcd(a, b) {
  if (a < 0 || b < 0) {
    throw new Error("a и b должны быть неотрицательными.");
  }
  a = a | 0;
  b = b | 0;
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

// Примеры:
// console.log(gcd(12, 18)); // 6
// console.log(gcd(7, 13));  // 1

if (typeof module !== "undefined") module.exports = { gcd };
