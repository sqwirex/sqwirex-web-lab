// js/render.js
(() => {
  const byName = (a, b) => a.name.localeCompare(b.name, 'ru');

  const grids = {
    soup:  document.querySelector('.menu-grid[data-category="soup"]'),
    main:  document.querySelector('.menu-grid[data-category="main"]'),
    drink: document.querySelector('.menu-grid[data-category="drink"]'),
  };

  const selected = { soup: null, main: null, drink: null };

  const summaryEmpty  = document.getElementById('summaryEmpty');    
  const totalBlock    = document.getElementById('summaryTotal');    
  const totalSumEl    = document.getElementById('totalSum');

  const cats = ['soup', 'main', 'drink'];
  const catBlocks = Object.fromEntries(
    cats.map(cat => [cat, document.querySelector(`.summary-category[data-cat="${cat}"]`)])
  );

  function rub(n){ return `${n}₽`; }

  function renderCard(dish){
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.dataset.dish = dish.keyword;
    card.tabIndex = 0; 

    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <p class="price">${rub(dish.price)}</p>
      <p class="name">${dish.name}</p>
      <div class="card-bottom">
        <p class="weight">${dish.count}</p>
        <button class="btn" type="button">Добавить</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.currentTarget === card) {
        selectDish(dish, card);
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectDish(dish, card);
      }
    });
    return card;
  }

  function selectDish(dish, cardEl){
    const grid = grids[dish.category];
    grid?.querySelectorAll('.dish-card.selected').forEach(c => c.classList.remove('selected'));

    cardEl?.classList.add('selected');
    selected[dish.category] = dish;
    updateSummary();
  }

  function updateSummary(){
    const any = cats.some(c => selected[c]);

    summaryEmpty.hidden = any;
    Object.values(catBlocks).forEach(block => block.hidden = !any);
    totalBlock.hidden = !any;

    if (!any) return;

    let total = 0;

    cats.forEach(cat => {
      const block = catBlocks[cat];
      const line  = block.querySelector('.summary-line');
      const none  = block.querySelector('.summary-none');
      const nameEl  = block.querySelector('.summary-name');
      const priceEl = block.querySelector('.summary-price');

      const dish = selected[cat];
      if (dish){
        nameEl.textContent  = dish.name;
        priceEl.textContent = rub(dish.price);
        line.hidden = false;
        none.hidden = true;
        total += dish.price;
      } else {
        line.hidden = true;
        none.textContent = (cat === 'drink') ? 'Напиток не выбран' : 'Блюдо не выбрано';
        none.hidden = false;
      }
    });

    totalSumEl.textContent = total.toString();
  }

  ['soup','main','drink'].forEach(cat => {
    const list = window.DISHES.filter(d => d.category === cat).sort(byName);
    const grid = grids[cat];
    list.forEach(d => grid.appendChild(renderCard(d)));
  });
})();
