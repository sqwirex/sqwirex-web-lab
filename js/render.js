// js/render.js
(() => {
  // Сортировка по алфавиту (учитываем русскую локаль)
  const byName = (a, b) => a.name.localeCompare(b.name, 'ru');

  // Контейнеры сеток
  const grids = {
    soup:    document.querySelector('.menu-grid[data-category="soup"]'),
    main:    document.querySelector('.menu-grid[data-category="main"]'),
    salad:   document.querySelector('.menu-grid[data-category="salad"]'),
    drink:   document.querySelector('.menu-grid[data-category="drink"]'),
    dessert: document.querySelector('.menu-grid[data-category="dessert"]'),
  };

  // Текущий фильтр по каждой категории (null = показывать всё)
  const currentFilters = { soup: null, main: null, salad: null, drink: null, dessert: null };

  // Состояние выбранных позиций
  const selected = { soup: null, main: null, salad: null, drink: null, dessert: null };

  // Элементы блока "Ваш заказ"
  const cats = ['soup', 'main', 'salad', 'drink', 'dessert'];
  const summaryEmpty  = document.getElementById('summaryEmpty');
  const totalBlock    = document.getElementById('summaryTotal');
  const totalSumEl    = document.getElementById('totalSum');
  const catBlocks = Object.fromEntries(
    cats.map(cat => [cat, document.querySelector(`.summary-category[data-cat="${cat}"]`)])
  );

  const rub = n => `${n}₽`;

  // Создание карточки
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

    const choose = () => selectDish(dish, card);

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.currentTarget === card) choose();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });

    return card;
  }

  // Выбор блюда
  function selectDish(dish, cardEl){
    const grid = grids[dish.category];
    grid?.querySelectorAll('.dish-card.selected').forEach(c => c.classList.remove('selected'));
    cardEl?.classList.add('selected');
    selected[dish.category] = dish;
    updateSummary();
  }

  // Обновление блока "Ваш заказ"
  function updateSummary(){
    const any = cats.some(c => selected[c]);
    summaryEmpty.hidden = any;
    Object.values(catBlocks).forEach(b => b.hidden = !any);
    totalBlock.hidden = !any;
    if (!any) return;

    let total = 0;
    cats.forEach(cat => {
      const block   = catBlocks[cat];
      const line    = block.querySelector('.summary-line');
      const none    = block.querySelector('.summary-none');
      const nameEl  = block.querySelector('.summary-name');
      const priceEl = block.querySelector('.summary-price');
      const dish    = selected[cat];

      if (dish){
        nameEl.textContent  = dish.name;
        priceEl.textContent = rub(dish.price);
        line.hidden = false; none.hidden = true;
        total += dish.price;
      } else {
        line.hidden = true;
        none.textContent = (cat === 'drink') ? 'Напиток не выбран' : 'Блюдо не выбрано';
        none.hidden = true; // показываем «не выбрано» только когда есть хоть один выбор
      }
    });
    totalSumEl.textContent = String(total);
  }

  // Рендер одной категории с учётом фильтра
  function renderCategory(cat){
    const grid = grids[cat];
    if (!grid) return;

    const list = window.DISHES
      .filter(d => d.category === cat && (!currentFilters[cat] || d.kind === currentFilters[cat]))
      .sort(byName);

    grid.innerHTML = '';
    list.forEach(d => grid.appendChild(renderCard(d)));

    // Если выбранное блюдо не проходит текущий фильтр — сбросить выбор
    if (selected[cat] && !list.some(d => d.keyword === selected[cat].keyword)) {
      selected[cat] = null;
      updateSummary();
    }
  }

  // Инициализация фильтров в каждой секции
  document.querySelectorAll('.menu-section').forEach(section => {
    const grid = section.querySelector('.menu-grid');
    if (!grid) return;

    const cat = grid.dataset.category;           // soup | main | salad | drink | dessert
    const filtersWrap = section.querySelector('.filters');

    // начальный рендер
    renderCategory(cat);

    if (!filtersWrap) return;

    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      const kind = btn.dataset.kind;             // fish | meat | veg | cold | hot | small | medium | large

      // Клик по уже активной — снимаем фильтр
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        currentFilters[cat] = null;
      } else {
        // Переключить активную
        filtersWrap.querySelectorAll('.filter-btn.active').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters[cat] = kind;
      }

      renderCategory(cat);
    });
  });

  // Сброс формы: очистить выбор и подсветки
  const form = document.querySelector('.order-form');
  if (form){
    form.addEventListener('reset', () => {
      Object.values(grids).forEach(g => g?.querySelectorAll('.dish-card.selected')
        .forEach(c => c.classList.remove('selected')));
      cats.forEach(cat => selected[cat] = null);
      updateSummary();
    });
  }
})();
