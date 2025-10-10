// 5) fibb(n): n-е число Фибоначчи (n <= 1000).
function fibb(n) {
  if (n < 0 || n > 1000 || n % 1 !== 0) {
    throw new Error("n должно быть целым в диапазоне 0..1000");
  }
  let a = 0n, b = 1n;
  for (let i = 0; i < n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return a.toString();
}

// Примеры:
// console.log(fibb(0));  // "0"
// console.log(fibb(1));  // "1"
// console.log(fibb(10)); // "55"

if (typeof module !== "undefined") module.exports = { fibb };
