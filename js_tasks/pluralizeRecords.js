// 4) pluralizeRecords(n): Русская плюрализация для "запись"
// Возвращает полную фразу: 
// "В результате выполнения запроса <...> n запись/записи/записей"
function pluralizeRecords(n) {
  if (n < 0 || n % 1 !== 0) {
    throw new Error("n должно быть целым неотрицательным.");
  }
  const mod10 = n % 10;
  const mod100 = n % 100;
  let noun; 
  let verb; 
  if (mod10 === 1 && mod100 !== 11) {
    noun = "запись";
    verb = "была найдена";
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    noun = "записи";
    verb = "было найдено";
  } else {
    noun = "записей";
    verb = "было найдено";
  }
  return `В результате выполнения запроса ${verb} ${n} ${noun}.`;
}

// Примеры:
// console.log(pluralizeRecords(1));  // "была найдена 1 запись."
// console.log(pluralizeRecords(2));  // "было найдено 2 записи."
// console.log(pluralizeRecords(5));  // "было найдено 5 записей."

if (typeof module !== "undefined") module.exports = { pluralizeRecords };
