(() => {
 
  const byName = (a, b) => a.name.localeCompare(b.name, 'ru');

 
  const grids = {
    soup:    document.querySelector('.menu-grid[data-category="soup"]'),
    main:    document.querySelector('.menu-grid[data-category="main"]'),
    salad:   document.querySelector('.menu-grid[data-category="salad"]'),
    drink:   document.querySelector('.menu-grid[data-category="drink"]'),
    dessert: document.querySelector('.menu-grid[data-category="dessert"]'),
  };

 
  const currentFilters = { soup: null, main: null, salad: null, drink: null, dessert: null };
  const selected       = { soup: null, main: null, salad: null, drink: null, dessert: null };

 
  const cats = ['soup', 'main', 'salad', 'drink', 'dessert'];
  const summaryEmpty  = document.getElementById('summaryEmpty');
  const totalBlock    = document.getElementById('summaryTotal');
  const totalSumEl    = document.getElementById('totalSum');
  const catBlocks = Object.fromEntries(
    cats.map(cat => [cat, document.querySelector(`.summary-category[data-cat="${cat}"]`)])
  );
  const rub = n => `${n}₽`;

 
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
        none.hidden = false;
      }
    });
    totalSumEl.textContent = String(total);
  }

 
  function renderCategory(cat){
    const grid = grids[cat];
    if (!grid) return;

    const list = window.DISHES
      .filter(d => d.category === cat && (!currentFilters[cat] || d.kind === currentFilters[cat]))
      .sort(byName);

    grid.innerHTML = '';
    list.forEach(d => grid.appendChild(renderCard(d)));

    if (selected[cat] && !list.some(d => d.keyword === selected[cat].keyword)) {
      selected[cat] = null;
      updateSummary();
    }
  }

 
  document.querySelectorAll('.menu-section').forEach(section => {
    const grid = section.querySelector('.menu-grid');
    if (!grid) return;

    const cat = grid.dataset.category;
    const filtersWrap = section.querySelector('.filters');

    renderCategory(cat);

    if (!filtersWrap) return;
    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      const kind = btn.dataset.kind;
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        currentFilters[cat] = null;
      } else {
        filtersWrap.querySelectorAll('.filter-btn.active').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters[cat] = kind;
      }

      renderCategory(cat);
    });
  });

 
  function showNotice(text){
    const backdrop = document.createElement('div');
    backdrop.className = 'notice-backdrop';
    backdrop.innerHTML = `
      <div class="notice" role="dialog" aria-modal="true">
        <p>${text}</p>
        <button type="button" class="notice-btn">Окей 👌</button>
      </div>
    `;
    document.body.appendChild(backdrop);
    const btn = backdrop.querySelector('.notice-btn');
    btn.focus();

    const close = () => backdrop.remove();
    btn.addEventListener('click', close);
    backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(); });
    document.addEventListener('keydown', function onEsc(e){
      if(e.key==='Escape'){ close(); document.removeEventListener('keydown', onEsc); }
    });
  }

 
  function isValidCombo(has){
    
    return has.drink && (has.main || has.soup);
  }

  const form = document.querySelector('.order-form');
  if (form){
    form.addEventListener('reset', () => {
      Object.values(grids).forEach(g => g?.querySelectorAll('.dish-card.selected')
        .forEach(c => c.classList.remove('selected')));
      cats.forEach(cat => selected[cat] = null);
      updateSummary();
    });

    form.addEventListener('submit', (e) => {
      const has = {
        soup:    !!selected.soup,
        main:    !!selected.main,
        salad:   !!selected.salad,
        drink:   !!selected.drink,
        dessert: !!selected.dessert,
      };

      
      if (!has.soup && !has.main && !has.salad && !has.drink && !has.dessert){
        e.preventDefault();
        showNotice('Ничего не выбрано. Выберите блюда для заказа');
        return;
      }

      
      if (!has.drink){
        e.preventDefault();
        showNotice('Выберите напиток');
        return;
      }

      
      if (has.soup && !has.main && !has.salad){
        e.preventDefault();
        showNotice('Выберите главное блюдо/салат/стартер');
        return;
      }

      
      if (has.salad && !has.soup && !has.main){
        e.preventDefault();
        showNotice('Выберите суп или главное блюдо');
        return;
      }

      
      if (!has.main && !has.soup){
        e.preventDefault();
        showNotice('Выберите главное блюдо');
        return;
      }

      
      if (!isValidCombo(has)){
        e.preventDefault();
        showNotice('Проверьте состав ланча (нужны напиток и суп или главное блюдо).');
      }
    });
  }
})();
