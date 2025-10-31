(() => {
  const API_ROOT = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
  const API_KEY  = '514731c2-0c47-4f6b-84a3-3cf6374c3755';
  const STORAGE_KEY = 'fc.order.v1';

  const rub = n => `${n}₽`;
  const byName = (a,b) => a.name.localeCompare(b.name,'ru');

  let ALL_DISHES = [];
  const orderCards = document.getElementById('orderCards');
  const emptyMsg   = document.getElementById('emptyOrderMsg');

  const sumEl = {
    soup:    document.getElementById('sumSoup'),
    main:    document.getElementById('sumMain'),
    salad:   document.getElementById('sumSalad'),
    drink:   document.getElementById('sumDrink'),
    dessert: document.getElementById('sumDessert'),
    total:   document.getElementById('sumTotal'),
  };

  let SELECTED_IDS = { soup:null, main:null, salad:null, drink:null, dessert:null };

  function loadSelectedFromStorage(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      SELECTED_IDS = Object.assign(SELECTED_IDS, JSON.parse(raw||'{}') || {});
    }catch{}
  }

  async function loadDishes(){
    const res = await fetch(`${API_ROOT}/dishes`);
    if(!res.ok) throw new Error('Не удалось загрузить блюда');
    const data = await res.json();
    return data.map(d => ({ ...d, category: d.category === 'main-course' ? 'main' : d.category }));
  }

  function selectedDish(cat){
    const id = SELECTED_IDS[cat];
    return id ? ALL_DISHES.find(d => d.id === id) : null;
  }

  function persist(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SELECTED_IDS));
  }

  function isComboValid(){
    const has = k => Boolean(SELECTED_IDS[k]);
    const any = has('soup') || has('main') || has('salad') || has('drink') || has('dessert');
    if (!any) return { ok:false, reason:'empty' };
    if (!has('drink')) return { ok:false, reason:'needDrink' };
    if (has('soup') && !has('main') && !has('salad')) return { ok:false, reason:'soupNoMainSalad' };
    if (has('salad') && !has('soup') && !has('main')) return { ok:false, reason:'saladNoSoupMain' };
    if (!has('soup') && !has('main') && (has('drink') || has('dessert'))) return { ok:false, reason:'needMain' };
    return { ok:true };
  }

  function renderOrderCards(){
    const ids = Object.values(SELECTED_IDS).filter(Boolean);
    const any = ids.length > 0;
    emptyMsg.hidden = any;
    orderCards.innerHTML = '';
    if (!any) return;

    const list = ['soup','main','salad','drink','dessert']
      .map(cat => selectedDish(cat))
      .filter(Boolean)
      .sort(byName);

    list.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'dish-card';
      card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <p class="price">${rub(dish.price)}</p>
        <p class="name">${dish.name}</p>
        <div class="card-bottom">
          <p class="weight">${dish.count}</p>
          <button class="btn" type="button">Удалить</button>
        </div>
      `;
      card.querySelector('.btn').addEventListener('click', () => {
        SELECTED_IDS[dish.category] = null;
        persist();
        renderOrderCards();
        updateSummary();
      });
      orderCards.appendChild(card);
    });
  }

  function updateSummary(){
    let total = 0;
    ['soup','main','salad','drink','dessert'].forEach(cat => {
      const d = selectedDish(cat);
      if (d){ sumEl[cat].textContent = `${d.name} ${rub(d.price)}`; total += d.price; }
      else  { sumEl[cat].textContent = (cat==='main' ? 'Не выбрано' : 'Не выбран'); }
    });
    sumEl.total.textContent = String(total) + "₽";
  }

  function showNotify(text){
    const wrap = document.createElement('div');
    wrap.className = 'notify-overlay';
    wrap.innerHTML = `
      <div class="notify-card">
        <div class="notify-text">${text}</div>
        <button class="notify-btn" type="button">Окей 👌</button>
      </div>`;
    wrap.querySelector('.notify-btn').addEventListener('click', () => wrap.remove());
    document.body.appendChild(wrap);
  }

  function comboErrorText(reason){
    switch(reason){
      case 'empty':            return 'Ничего не выбрано. Выберите блюда для заказа';
      case 'needDrink':        return 'Выберите напиток';
      case 'soupNoMainSalad':  return 'Выберите главное блюдо/салат/стартер';
      case 'saladNoSoupMain':  return 'Выберите суп или главное блюдо';
      case 'needMain':         return 'Выберите главное блюдо';
      default: return 'Проверьте состав заказа';
    }
  }

  async function submitOrder(e){
    e.preventDefault();

    const v = isComboValid();
    if (!v.ok){
      showNotify(comboErrorText(v.reason));
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      full_name:        fd.get('full_name')?.trim(),
      email:            fd.get('email')?.trim(),
      subscribe:        fd.get('subscribe') ? 1 : 0,
      phone:            fd.get('phone')?.trim(),
      delivery_address: fd.get('delivery_address')?.trim(),
      delivery_type:    fd.get('delivery_type'),
      delivery_time:    fd.get('delivery_time') || null,
      comment:          fd.get('comment') || ''
    };

    payload.soup_id        = SELECTED_IDS.soup   || null;
    payload.main_course_id = SELECTED_IDS.main   || null; 
    payload.salad_id       = SELECTED_IDS.salad  || null;
    payload.drink_id       = SELECTED_IDS.drink  || null; 
    payload.dessert_id     = SELECTED_IDS.dessert|| null;

    if (!payload.full_name || !payload.email || !payload.phone || !payload.delivery_address || !payload.delivery_type){
      showNotify('Заполните обязательные поля формы.');
      return;
    }
    if (payload.delivery_type === 'by_time' && !payload.delivery_time){
      showNotify('Укажите время доставки.');
      return;
    }

    try{
      const res = await fetch(`${API_ROOT}/orders?api_key=${encodeURIComponent(API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok || data?.error){
        throw new Error(data?.error || 'Ошибка оформления заказа');
      }
      localStorage.removeItem(STORAGE_KEY);
      showNotify('Заказ успешно оформлен! 🎉');
      SELECTED_IDS = { soup:null, main:null, salad:null, drink:null, dessert:null };
      renderOrderCards(); updateSummary();
      form.reset();
    }catch(err){
      console.error(err);
      showNotify('Не удалось оформить заказ. Попробуйте позже.');
    }
  }

  (async function init(){
    loadSelectedFromStorage();
    try{
      ALL_DISHES = await loadDishes();
      renderOrderCards();
      updateSummary();
      document.getElementById('orderForm').addEventListener('submit', submitOrder);
      document.getElementById('orderForm').addEventListener('reset', () => {
        setTimeout(() => updateSummary(), 0);
      });
    }catch(err){
      console.error(err);
      alert('Не удалось загрузить меню. Обновите страницу позже.');
    }
  })();
})();
