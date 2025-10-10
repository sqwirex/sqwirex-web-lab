// 6) getSortedArray(array, key): сортировка массива объектов по возрастанию
function getSortedArray(array, key) {
  if (!array || array.length === 0) return array;
  for (let i = 1; i < array.length; i++) {
    const current = array[i];
    let j = i - 1;
    while (j >= 0 && array[j][key] > current[key]) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = current;
  }
  return array;
}

// Пример:
// const people = [
//   { name: "Ольга", age: 31 },
//   { name: "Антон", age: 25 },
//   { name: "Борис", age: 29 }
// ];
// console.log(getSortedArray(people, "name")); // по имени
// console.log(getSortedArray(people, "age"));  // по возрасту

if (typeof module !== "undefined") module.exports = { getSortedArray };
