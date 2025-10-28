// 1) pow(x, n): Возведение в степень без оператора **
function pow(x, n) {
  if (n % 1 !== 0 || n < 1) {
    throw new Error("n должно быть натуральным (целым > 0).");
  }
  let result = 1;
  for (let i = 0; i < n; i++) {
    result = result * x;
  }
  return result;
}

// Примеры:
console.log(pow(2, 10)); // 1024
// console.log(pow(5, 1));  // 5

if (typeof module !== "undefined") module.exports = { pow };
