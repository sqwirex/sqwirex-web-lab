(() => {
  const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
  const API_KEY  = '514731c2-0c47-4f6b-84a3-3cf6374c3755';

  const tbody      = document.getElementById('ordersBody');
  const emptyState = document.getElementById('ordersEmpty');
  const modalRoot  = document.getElementById('modalRoot');

  const dishById = new Map();

  const fmtRub   = (n) => `${Number(n)}₽`;
  const pad2     = (n) => String(n).padStart(2,'0');
  const fmtDate  = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d) ? iso :
      `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };
  const timeToHHMM = (val) => {
    if (!val) return '';
    const m = String(val).match(/^(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : val;
  };
  const deliveryLabel = (o) =>
    (o.delivery_type === 'by_time' && o.delivery_time)
      ? timeToHHMM(o.delivery_time)
      : 'В течение дня (с 07:00 до 23:00)';

  const getDish = (id) => id ? dishById.get(Number(id)) : null;

  const orderItems = (o) => [
    getDish(o.soup_id),
    getDish(o.main_course_id),
    getDish(o.salad_id),
    getDish(o.drink_id),
    getDish(o.dessert_id),
  ].filter(Boolean);

  const orderCost = (o) => orderItems(o).reduce((s, d) => s + (Number(d.price)||0), 0);
  const orderItemsText = (o) => orderItems(o).map(d => d.name).join(', ');

  const closeModal = () => { modalRoot.innerHTML = ''; };
  const modalShell = (title, bodyHTML, footerHTML='') => `
    <div class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-head">
          <h3>${title}</h3>
          <button class="modal-x" aria-label="Закрыть">&times;</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        ${footerHTML ? `<div class="modal-foot">${footerHTML}</div>` : ''}
      </div>
    </div>`;

  const showInfo = (o) => {
    const html = `
      <div class="detail-grid">
        <div>Дата оформления</div><div>${fmtDate(o.created_at)}</div>
        <div>Имя получателя</div><div>${o.full_name ?? '—'}</div>
        <div>Адрес доставки</div><div>${o.delivery_address ?? '—'}</div>
        <div>Время доставки</div><div>${deliveryLabel(o)}</div>
        <div>Телефон</div><div>${o.phone ?? '—'}</div>
        <div>Email</div><div>${o.email ?? '—'}</div>
        <div>Комментарий</div><div>${o.comment || '—'}</div>
        <div class="hr"></div><div class="hr"></div>
        <div>Состав заказа</div>
        <div>
          ${getDish(o.main_course_id)?.name ? `Основное блюдо — ${getDish(o.main_course_id).name} (${fmtRub(getDish(o.main_course_id).price)})<br>`:''}
          ${getDish(o.soup_id)?.name ? `Суп — ${getDish(o.soup_id).name} (${fmtRub(getDish(o.soup_id).price)})<br>`:''}
          ${getDish(o.salad_id)?.name ? `Салат/стартер — ${getDish(o.salad_id).name} (${fmtRub(getDish(o.salad_id).price)})<br>`:''}
          ${getDish(o.drink_id)?.name ? `Напиток — ${getDish(o.drink_id).name} (${fmtRub(getDish(o.drink_id).price)})<br>`:''}
          ${getDish(o.dessert_id)?.name ? `Десерт — ${getDish(o.dessert_id).name} (${fmtRub(getDish(o.dessert_id).price)})`:''}
        </div>
        <div><strong>Стоимость</strong></div><div><strong>${fmtRub(orderCost(o))}</strong></div>
      </div>`;
    modalRoot.innerHTML = modalShell('Просмотр заказа', html, `<button class="btn" id="okInfo">Ок</button>`);
    modalRoot.querySelector('.modal-x').onclick = closeModal;
    modalRoot.querySelector('#okInfo').onclick = closeModal;
  };

  const showEdit = (o) => {
    const form = `
      <form id="editForm" class="edit-form">
        <div class="detail-grid">
          <div>Дата оформления</div><div>${fmtDate(o.created_at)}</div>

          <div>Имя получателя</div>
          <div><input type="text" name="full_name" value="${o.full_name ?? ''}" required></div>

          <div>Адрес доставки</div>
          <div><input type="text" name="delivery_address" value="${o.delivery_address ?? ''}" required></div>

          <div>Время доставки</div>
          <div>
            <select name="delivery_type">
              <option value="now" ${o.delivery_type === 'now' ? 'selected' : ''}>Как можно скорее</option>
              <option value="by_time" ${o.delivery_type === 'by_time' ? 'selected' : ''}>К указанному времени</option>
            </select>
            <input type="time" name="delivery_time" value="${timeToHHMM(o.delivery_time)}" min="07:00" max="23:00" step="300">
          </div>

          <div>Телефон</div>
          <div><input type="tel" name="phone" value="${o.phone ?? ''}" required></div>

          <div>Email</div>
          <div><input type="email" name="email" value="${o.email ?? ''}" required></div>

          <div>Комментарий</div>
          <div><textarea name="comment" rows="3">${o.comment ?? ''}</textarea></div>

          <div class="hr"></div><div class="hr"></div>

          <div>Состав заказа</div>
          <div>
            ${getDish(o.main_course_id)?.name ? `Основное блюдо — ${getDish(o.main_course_id).name} (${fmtRub(getDish(o.main_course_id).price)})<br>`:''}
            ${getDish(o.soup_id)?.name ? `Суп — ${getDish(o.soup_id).name} (${fmtRub(getDish(o.soup_id).price)})<br>`:''}
            ${getDish(o.salad_id)?.name ? `Салат/стартер — ${getDish(o.salad_id).name} (${fmtRub(getDish(o.salad_id).price)})<br>`:''}
            ${getDish(o.drink_id)?.name ? `Напиток — ${getDish(o.drink_id).name} (${fmtRub(getDish(o.drink_id).price)})<br>`:''}
            ${getDish(o.dessert_id)?.name ? `Десерт — ${getDish(o.dessert_id).name} (${fmtRub(getDish(o.dessert_id).price)})`:''}
          </div>

          <div><strong>Стоимость</strong></div><div><strong>${fmtRub(orderCost(o))}</strong></div>
        </div>
      </form>`;
    modalRoot.innerHTML = modalShell(
      'Редактирование заказа',
      form,
      `<button class="btn btn-ghost" id="cancelEdit">Отмена</button>
       <button class="btn" id="saveEdit">Сохранить</button>`
    );
    modalRoot.querySelector('.modal-x').onclick = closeModal;
    modalRoot.querySelector('#cancelEdit').onclick = closeModal;

    modalRoot.querySelector('#saveEdit').onclick = async () => {
      const f = modalRoot.querySelector('#editForm');
      const data = Object.fromEntries(new FormData(f).entries());
      const body = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        delivery_address: data.delivery_address,
        delivery_type: data.delivery_type,
        comment: data.comment || '',
      };
      if (data.delivery_type === 'by_time') {
        if (!data.delivery_time) { alert('Укажите время доставки'); return; }
        body.delivery_time = data.delivery_time;
      } else {
        body.delivery_time = null;
      }

      try {
        const res = await fetch(`${API_BASE}/orders/${o.id}?api_key=${API_KEY}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Ошибка сохранения');
        closeModal();
        alert('Заказ успешно изменён');
        await loadAndRender();
      } catch (e) {
        console.error(e);
        alert('Не удалось сохранить заказ');
      }
    };
  };

  const showDelete = (o) => {
    const html = `<p>Вы уверены, что хотите удалить заказ?</p>`;
    modalRoot.innerHTML = modalShell(
      'Удаление заказа',
      html,
      `<button class="btn btn-ghost" id="cancelDel">Отмена</button>
       <button class="btn btn-danger" id="confirmDel">Да</button>`
    );
    modalRoot.querySelector('.modal-x').onclick = closeModal;
    modalRoot.querySelector('#cancelDel').onclick = closeModal;
    modalRoot.querySelector('#confirmDel').onclick = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${o.id}?api_key=${API_KEY}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Ошибка удаления');
        closeModal();
        alert('Заказ удалён');
        await loadAndRender();
      } catch (e) {
        console.error(e);
        alert('Не удалось удалить заказ');
      }
    };
  };

  const render = (orders) => {
    tbody.innerHTML = '';
    if (!orders.length) { emptyState.hidden = false; return; }
    emptyState.hidden = true;

    orders.forEach((o, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>${orderItemsText(o)}</td>
        <td>${fmtRub(orderCost(o))}</td>
        <td>${deliveryLabel(o)}</td>
        <td class="actions">
          <button class="icon-btn" aria-label="Подробнее" data-act="view"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 3C3.5 3 1 8 1 8s2.5 5 7 5 7-5 7-5-2.5-5-7-5Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg></button>
          <button class="icon-btn" aria-label="Редактировать" data-act="edit"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M12.146 1.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-8.5 8.5L4 13l.638-2.354 8.508-8.5Z"/><path d="M0 12.5V16h3.5l9.854-9.854-3.5-3.5L0 12.5Z"/></svg></button>
          <button class="icon-btn danger" aria-label="Удалить" data-act="del"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M6.5 1h3a1 1 0 0 1 1 1V3H15v1H1V3h4.5V2a1 1 0 0 1 1-1Z"/><path d="M2 5h12l-1 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2L2 5Z"/></svg></button>
        </td>`;
      tr.querySelector('[data-act="view"]').onclick = () => showInfo(o);
      tr.querySelector('[data-act="edit"]').onclick = () => showEdit(o);
      tr.querySelector('[data-act="del"]').onclick  = () => showDelete(o);
      tbody.appendChild(tr);
    });
  };

  const loadDishes = async () => {
    const res = await fetch(`${API_BASE}/dishes?api_key=${API_KEY}`);
    if (!res.ok) throw new Error('Не удалось получить список блюд');
    const list = await res.json();
    list.forEach(d => dishById.set(Number(d.id), d));
  };

  const loadOrders = async () => {
    const res = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`);
    if (!res.ok) throw new Error('Не удалось получить заказы');
    const list = await res.json();
    list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  };

  const loadAndRender = async () => {
    try {
      if (dishById.size === 0) await loadDishes();
      const orders = await loadOrders();
      render(orders);
    } catch (e) {
      console.error(e);
      alert('Ошибка загрузки данных');
    }
  };

  loadAndRender();

  modalRoot.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();
