(() => {
  const API_ROOT = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
  const STORAGE_KEY = 'fc.order.v1'; 
  const rub = n => `${n}₽`;
  const byName = (a, b) => a.name.localeCompare(b.name, 'ru');

  
  let ALL_DISHES = [];                  
  const grids = {
    soup:    document.querySelector('.menu-grid[data-category="soup"]'),
    main:    document.querySelector('.menu-grid[data-category="main"]'),
    salad:   document.querySelector('.menu-grid[data-category="salad"]'),
    drink:   document.querySelector('.menu-grid[data-category="drink"]'),
    dessert: document.querySelector('.menu-grid[data-category="dessert"]'),
  };
  const currentFilters = { soup:null, main:null, salad:null, drink:null, dessert:null };
  const selected = { soup:null, main:null, salad:null, drink:null, dessert:null };

  const bar = document.getElementById('checkoutBar');
  const stickyTotal = document.getElementById('stickyTotal');
  const toCheckout = document.getElementById('toCheckout');

  async function loadDishes(){
    const res = await fetch(`${API_ROOT}/dishes`);
    if(!res.ok) throw new Error('Не удалось загрузить блюда');
    const data = await res.json();
    return data.map(d => ({ ...d, category: d.category === 'main-course' ? 'main' : d.category }));
  }

  function restoreSelection(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    let ids;
    try { ids = JSON.parse(raw) || {}; } catch { ids = {}; }
    ['soup','main','salad','drink','dessert'].forEach(cat => {
      const id = ids[cat];
      if(!id) return;
      const dish = ALL_DISHES.find(d => d.id === id);
      if(dish){ selected[cat] = dish; }
    });
  }

  function persistSelection(){
    const ids = {};
    Object.keys(selected).forEach(cat => { ids[cat] = selected[cat]?.id ?? null; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function renderCard(dish){
    const el = document.createElement('div');
    el.className = 'dish-card';
    el.dataset.dishId = dish.id;
    el.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <p class="price">${rub(dish.price)}</p>
      <p class="name">${dish.name}</p>
      <div class="card-bottom">
        <p class="weight">${dish.count}</p>
        <button class="btn" type="button">Добавить</button>
      </div>
    `;
    const choose = () => selectDish(dish, el);
    el.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.currentTarget === el) choose();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });
    return el;
  }

  function selectDish(dish, card){
    const grid = grids[dish.category];
    grid?.querySelectorAll('.dish-card.selected').forEach(c => c.classList.remove('selected'));
    card?.classList.add('selected');
    selected[dish.category] = dish;
    persistSelection();
    updateSticky();
  }

  function renderCategory(cat){
    const grid = grids[cat];
    if(!grid) return;
    const list = ALL_DISHES
      .filter(d => d.category === cat && (!currentFilters[cat] || d.kind === currentFilters[cat]))
      .sort(byName);
    grid.innerHTML = '';
    list.forEach(d => {
      const el = renderCard(d);
      if (selected[cat]?.id === d.id) el.classList.add('selected');
      grid.appendChild(el);
    });
  }

  function isComboValid(sel){
    const has = k => Boolean(sel[k]);
    const any = has('soup') || has('main') || has('salad') || has('drink') || has('dessert');
    if (!any) return { ok:false, reason:'empty' };
    if (!has('drink')) return { ok:false, reason:'needDrink' };
    if (has('soup') && !has('main') && !has('salad')) return { ok:false, reason:'soupNoMainSalad' };
    if (has('salad') && !has('soup') && !has('main')) return { ok:false, reason:'saladNoSoupMain' };
    if (!has('soup') && !has('main') && (has('drink') || has('dessert'))) return { ok:false, reason:'needMain' };
    return { ok:true };
  }

  function updateSticky(){
    const sum = Object.values(selected).reduce((acc, d) => acc + (d?.price || 0), 0);
    const any = sum > 0;
    bar.hidden = !any;
    stickyTotal.textContent = String(sum);
    const valid = isComboValid(selected).ok;
    toCheckout.setAttribute('aria-disabled', valid ? 'false' : 'true');
  }

  function initFilters(){
    document.querySelectorAll('.menu-section').forEach(section => {
      const grid = section.querySelector('.menu-grid');
      if (!grid) return;
      const cat = grid.dataset.category;
      const wrap = section.querySelector('.filters');
      renderCategory(cat);
      if (!wrap) return;
      wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        const kind = btn.dataset.kind;
        if (btn.classList.contains('active')) {
          btn.classList.remove('active'); currentFilters[cat] = null;
        } else {
          wrap.querySelectorAll('.filter-btn.active').forEach(b => b.classList.remove('active'));
          btn.classList.add('active'); currentFilters[cat] = kind;
        }
        renderCategory(cat);
      });
    });
  }

  (async function init(){
    try{
      ALL_DISHES = await loadDishes();
      restoreSelection();
      initFilters();
      Object.keys(grids).forEach(renderCategory);
      updateSticky();
    }catch(err){
      console.error(err);
      alert('Не удалось загрузить меню. Обновите страницу позже.');
    }
  })();
})();
