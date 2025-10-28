// js/render.js
(() => {
  // ----- Настройки -----
  const CATS = ['soup', 'main', 'salad', 'drink', 'dessert']; // порядок категорий

  // Локализованный компаратор для алфавитной сортировки по имени
  const byName = (a, b) => a.name.localeCompare(b.name, 'ru');

  // Карты DOM-контейнеров сеток, фильтров и блоков сводки
  const grids = Object.fromEntries(
    CATS.map(cat => [cat, document.querySelector(`.menu-grid[data-category="${cat}"]`)])
  );
  const filterBars = Object.fromEntries(
    CATS.map(cat => [cat, document.querySelector(`.filters[data-category="${cat}"]`)])
  );

  // Состояние: выбранные блюда и активные фильтры
  const selected = Object.fromEntries(CATS.map(c => [c, null]));
  const activeFilter = Object.fromEntries(CATS.map(c => [c, null]));

  // Узлы сводки
  const summaryEmpty = document.getElementById('summaryEmpty');
  const totalBlock   = document.getElementById('summaryTotal');
  const totalSumEl   = document.getElementById('totalSum');
  const summaryBlocks = Object.fromEntries(
    CATS.map(cat => [cat, document.querySelector(`.summary-category[data-cat="${cat}"]`)])
  );

  // Текст "ничего не выбрано" по категориям
  const noneText = (cat) => ({
    drink:   'Напиток не выбран',
    dessert: 'Десерт не выбран',
    salad:   'Салат/стартер не выбран',
  }[cat] || 'Блюдо не выбрано');

  const rub = n => `${n}₽`;

  // ----- Рендер карточки -----
  function renderCard(dish) {
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

    const pick = () => selectDish(dish, card);

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.currentTarget === card) pick();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });

    return card;
  }

  // ----- Выбор блюда -----
  function selectDish(dish, cardEl) {
    // снять выделение в категории
    grids[dish.category]?.querySelectorAll('.dish-card.selected')
      .forEach(el => el.classList.remove('selected'));

    // отметить текущую
    cardEl?.classList.add('selected');
    selected[dish.category] = dish;

    updateSummary();
  }

  // ----- Сводка «Ваш заказ» -----
  function updateSummary() {
    const any = CATS.some(cat => selected[cat]);

    summaryEmpty.hidden = any;
    Object.values(summaryBlocks).forEach(b => b.hidden = !any);
    totalBlock.hidden = !any;
    if (!any) return;

    let total = 0;

    CATS.forEach(cat => {
      const container = summaryBlocks[cat];
      const line = container.querySelector('.summary-line');
      const none = container.querySelector('.summary-none');
      const nameEl = container.querySelector('.summary-name');
      const priceEl = container.querySelector('.summary-price');

      const dish = selected[cat];
      if (dish) {
        nameEl.textContent = dish.name;
        priceEl.textContent = rub(dish.price);
        line.hidden = false;
        none.hidden = true;
        total += dish.price;
      } else {
        line.hidden = true;
        none.textContent = noneText(cat);
        none.hidden = false;
      }
    });

    totalSumEl.textContent = String(total);
  }

  // ----- Рендер категории с учётом фильтра -----
  function renderCategory(cat) {
    const grid = grids[cat];
    grid.innerHTML = '';

    const list = window.DISHES
      .filter(d => d.category === cat)
      .filter(d => !activeFilter[cat] || d.kind === activeFilter[cat])
      .sort(byName);

    list.forEach(dish => grid.appendChild(renderCard(dish)));

    // восстановить подсветку, если выбранное блюдо всё ещё на экране
    const chosen = selected[cat];
    if (chosen) {
      const chosenEl = grid.querySelector(`.dish-card[data-dish="${chosen.keyword}"]`);
      if (chosenEl) chosenEl.classList.add('selected');
    }
  }

  function renderAll() { CATS.forEach(renderCategory); }

  // ----- Обработчики фильтров -----
  CATS.forEach(cat => {
    const bar = filterBars[cat];
    if (!bar) return;

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      // переключение: если уже активна — снимаем, иначе ставим и снимаем с соседей
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        activeFilter[cat] = null;
      } else {
        bar.querySelectorAll('.filter-btn.active').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter[cat] = btn.dataset.kind || null;
      }
      renderCategory(cat);
    });
  });

  // ----- Сброс формы: очищаем выбор -----
  const form = document.querySelector('.order-form');
  form?.addEventListener('reset', () => {
    // очистить выбранные блюда
    CATS.forEach(cat => { selected[cat] = null; });
    // снять подсветку
    Object.values(grids).forEach(g =>
      g.querySelectorAll('.dish-card.selected').forEach(el => el.classList.remove('selected'))
    );
    updateSummary();
  });

  // Первичная отрисовка
  renderAll();
})();
