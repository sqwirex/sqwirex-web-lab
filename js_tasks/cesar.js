// 7) Шифр Цезаря для русского алфавита
const RU_LOW = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
const RU_UP  = RU_LOW.toUpperCase();

function shiftChar(ch, shift) {
  const len = RU_LOW.length;
  let i = RU_LOW.indexOf(ch);
  if (i !== -1) {
    i = (i + shift) % len;
    if (i < 0) i += len;
    return RU_LOW[i];
  }
  i = RU_UP.indexOf(ch);
  if (i !== -1) {
    i = (i + shift) % len;
    if (i < 0) i += len;
    return RU_UP[i];
  }
  return ch;
}

function cesar(str, shift, action) {
  const s = (action === 'decode') ? -shift : shift;
  let out = "";
  for (let k = 0; k < str.length; k++) {
    out += shiftChar(str[k], s);
  }
  return out;
}

// Расшифровка строки "эзтыхз фзъзъз":
// Перебором сдвигов видно, что при shift = 8 получаем: "хакуна матата"
// Ответ: хакуна матата

if (typeof module !== "undefined") module.exports = { cesar };
