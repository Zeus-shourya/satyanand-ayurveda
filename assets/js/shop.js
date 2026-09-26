/* =====================================================================
   SATYANAND AYURVEDA — shop / listing page
   ---------------------------------------------------------------------
   Search, faceted filters (with live counts), sorting and paged
   rendering over the full catalogue. State lives in the URL
   (?cat=…&q=…&dosha=…&price=…&stock=1&sort=…&badge=…) so every view is
   linkable and survives refresh.

   Scales comfortably to thousands of products: each change is a few
   linear passes over an in-memory array, and only one page of cards
   (PAGE_SIZE) is put in the DOM at a time — "Load more" appends the next
   page instead of re-rendering what is already on screen.
   ===================================================================== */
(function () {
  'use strict';

  const S = window.Satyanand;
  const { $, $$, esc, money, ICON } = S;
  const PAGE_SIZE = 12;

  const PRICES = [
    { id: 'u200',    label: `Under ${money(200)}`,              test: (n) => n < 200 },
    { id: '200-400', label: `${money(200)} – ${money(400)}`,     test: (n) => n >= 200 && n <= 400 },
    { id: '400-700', label: `${money(400)} – ${money(700)}`,     test: (n) => n > 400 && n <= 700 },
    { id: 'o700',    label: `Above ${money(700)}`,               test: (n) => n > 700 }
  ];
  const DOSHAS = [
    { id: 'vata', label: 'Vata', note: 'air + space' },
    { id: 'pitta', label: 'Pitta', note: 'fire + water' },
    { id: 'kapha', label: 'Kapha', note: 'earth + water' }
  ];
  const SORTS = ['featured', 'price-asc', 'price-desc', 'discount', 'name'];
  const BADGE_TITLES = { bestseller: 'Bestsellers', new: 'New launches', trending: 'Trending now', seasonal: 'Seasonal picks' };

  const minPrice = (p) => Math.min.apply(null, p.variants.map((v) => v.price));
  const bestOff = (p) => Math.max.apply(null, p.variants.map(S.pctOff));

  /* ---------- state (from the URL) ---------- */
  const params = new URLSearchParams(location.search);
  const pick = (value, allowed) => (allowed.includes(value) ? value : '');
  const state = {
    q: (params.get('q') || '').trim().slice(0, 80),
    cat: S.catById.has(params.get('cat')) ? params.get('cat') : '',
    badge: pick(params.get('badge'), Object.keys(BADGE_TITLES)),
    dosha: new Set((params.get('dosha') || '').split(',').filter((d) => DOSHAS.some((x) => x.id === d))),
    price: pick(params.get('price'), PRICES.map((p) => p.id)),
    stock: params.get('stock') === '1',
    sort: pick(params.get('sort'), SORTS) || 'featured',
    shown: PAGE_SIZE
  };

  /* ---------- elements ---------- */
  const grid = $('[data-grid]');
  const more = $('[data-more]');
  const countEl = $('[data-count]');
  const activeEl = $('[data-active]');
  const qInput = $('[data-f-q]');
  const sortEl = $('[data-sort]');
  const filtersEl = $('#filters');
  const applyBtn = $('[data-f-apply]');
  let current = [];

  /* ---------- filtering ---------- */
  /** Apply every active filter except `skip` — used for faceted counts. */
  function filtered(skip) {
    let list = state.q ? S.search(state.q) : S.products.slice();
    if (state.cat && skip !== 'cat') list = list.filter((p) => p.category === state.cat);
    if (state.badge && skip !== 'badge') list = list.filter((p) => p.badges.includes(state.badge));
    if (state.dosha.size && skip !== 'dosha') list = list.filter((p) => p.dosha.some((d) => state.dosha.has(d)));
    if (state.price && skip !== 'price') {
      const { test } = PRICES.find((x) => x.id === state.price);
      list = list.filter((p) => test(minPrice(p)));
    }
    if (state.stock && skip !== 'stock') list = list.filter((p) => S.isInStock(p));
    return list;
  }

  function sorted(list) {
    const stockFirst = (a, b) => Number(S.isInStock(b)) - Number(S.isInStock(a));
    switch (state.sort) {
      case 'price-asc': return list.sort((a, b) => minPrice(a) - minPrice(b));
      case 'price-desc': return list.sort((a, b) => minPrice(b) - minPrice(a));
      case 'discount': return list.sort((a, b) => bestOff(b) - bestOff(a) || a.rank - b.rank);
      case 'name': return list.sort((a, b) => a.name.localeCompare(b.name));
      // Featured keeps search relevance (or catalogue order) but sinks sold-out items.
      default: return list.sort(stockFirst);
    }
  }

  /* ---------- filter controls (rendered once, then only counts/checks update) ---------- */
  function renderFilters() {
    $('[data-f-cats]').innerHTML = [{ id: '', name: 'All products' }].concat(S.categories).map((c) =>
      `<label class="opt"><input type="radio" name="f-cat" value="${esc(c.id)}"><span>${esc(c.name)}</span><small data-n="cat:${esc(c.id)}"></small></label>`
    ).join('');
    $('[data-f-dosha]').innerHTML = DOSHAS.map((d) =>
      `<label class="opt"><input type="checkbox" name="f-dosha" value="${d.id}"><span>${d.label} <small>· ${d.note}</small></span><small data-n="dosha:${d.id}"></small></label>`
    ).join('');
    $('[data-f-price]').innerHTML = [{ id: '', label: 'Any price' }].concat(PRICES).map((p) =>
      `<label class="opt"><input type="radio" name="f-price" value="${p.id}"><span>${esc(p.label)}</span><small data-n="price:${p.id}"></small></label>`
    ).join('');
  }

  function syncControls() {
    $$('input[name="f-cat"]').forEach((i) => { i.checked = i.value === state.cat; });
    $$('input[name="f-dosha"]').forEach((i) => { i.checked = state.dosha.has(i.value); });
    $$('input[name="f-price"]').forEach((i) => { i.checked = i.value === state.price; });
    $('[data-f-stock]').checked = state.stock;
    if (document.activeElement !== qInput) qInput.value = state.q;
    sortEl.value = state.sort;
  }

  function updateCounts() {
    const setN = (key, n) => { const el = $(`[data-n="${key}"]`); if (el) el.textContent = n; };
    const byCat = filtered('cat');
    setN('cat:', byCat.length);
    S.categories.forEach((c) => setN('cat:' + c.id, byCat.filter((p) => p.category === c.id).length));
    const byDosha = filtered('dosha');
    DOSHAS.forEach((d) => setN('dosha:' + d.id, byDosha.filter((p) => p.dosha.includes(d.id)).length));
    const byPrice = filtered('price');
    setN('price:', byPrice.length);
    PRICES.forEach((pr) => setN('price:' + pr.id, byPrice.filter((p) => pr.test(minPrice(p))).length));
  }

  /* ---------- headings, chips, URL ---------- */
  function renderHeading() {
    const cat = state.cat && S.catById.get(state.cat);
    let title = 'All products';
    let blurb = 'Classical Ayurvedic formulations for everyday wellbeing — honestly made, fairly priced.';
    if (cat) { title = cat.name; blurb = cat.blurb + '.'; }
    else if (state.badge) { title = BADGE_TITLES[state.badge]; blurb = 'The formulations our customers come back for.'; }
    else if (state.q) { title = `Results for “${state.q}”`; blurb = 'Searching names, herbs, ingredients and concerns.'; }
    $('[data-shop-title]').textContent = title;
    $('[data-shop-blurb]').textContent = blurb;
    $('[data-crumb]').textContent = title;
    document.title = `${title} | Satyanand Ayurveda`;
  }

  function activeFilters() {
    const out = [];
    if (state.q) out.push({ key: 'q', label: `“${state.q}”` });
    if (state.cat) out.push({ key: 'cat', label: S.catById.get(state.cat).name });
    if (state.badge) out.push({ key: 'badge', label: BADGE_TITLES[state.badge] });
    state.dosha.forEach((d) => out.push({ key: 'dosha:' + d, label: DOSHAS.find((x) => x.id === d).label }));
    if (state.price) out.push({ key: 'price', label: PRICES.find((x) => x.id === state.price).label });
    if (state.stock) out.push({ key: 'stock', label: 'In stock' });
    return out;
  }

  function renderActive() {
    const list = activeFilters();
    activeEl.innerHTML = list.length
      ? list.map((f) => `<button type="button" class="pill" data-clear="${esc(f.key)}" aria-label="Remove filter: ${esc(f.label)}">${esc(f.label)} ${ICON.close}</button>`).join('') +
        (list.length > 1 ? '<button type="button" class="clear" data-clear="all">Clear all</button>' : '')
      : '';
    const n = list.filter((f) => f.key !== 'q').length;
    $('[data-filter-n]').textContent = n ? `(${n})` : '';
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cat) p.set('cat', state.cat);
    if (state.badge) p.set('badge', state.badge);
    if (state.dosha.size) p.set('dosha', Array.from(state.dosha).join(','));
    if (state.price) p.set('price', state.price);
    if (state.stock) p.set('stock', '1');
    if (state.sort !== 'featured') p.set('sort', state.sort);
    const qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  /* ---------- results ---------- */
  function renderMore() {
    const total = current.length;
    const shown = Math.min(state.shown, total);
    if (!total) {
      more.innerHTML = '';
      return;
    }
    more.innerHTML = shown < total
      ? `<p>Showing ${shown} of ${total} products</p><div class="meter" aria-hidden="true"><span style="width:${Math.round((shown / total) * 100)}%"></span></div>` +
        `<button type="button" class="btn btn--outline btn--lg" data-more-btn>Load ${Math.min(PAGE_SIZE, total - shown)} more</button>`
      : total > PAGE_SIZE ? `<p>You’ve seen all ${total} products</p>` : '';
  }

  function renderResults() {
    current = sorted(filtered());
    const total = current.length;
    countEl.innerHTML = `<b>${total}</b> product${total === 1 ? '' : 's'}`;
    applyBtn.textContent = `Show ${total} result${total === 1 ? '' : 's'}`;
    grid.innerHTML = total
      ? current.slice(0, state.shown).map((p) => S.cardHTML(p)).join('')
      : `<div class="no-results" style="grid-column:1/-1">${ICON.search}<h2>Nothing matches those filters</h2>` +
        `<p>Try removing a filter, or search for a herb, a concern or a form like “oil”.</p>` +
        `<button type="button" class="btn btn--primary" data-clear="all">Clear all filters</button></div>`;
    renderMore();
  }

  function update() {
    state.shown = PAGE_SIZE;
    renderHeading();
    renderResults();
    renderActive();
    updateCounts();
    syncControls();
    syncUrl();
  }

  function loadMore() {
    const start = state.shown;
    state.shown += PAGE_SIZE;
    grid.insertAdjacentHTML('beforeend', current.slice(start, state.shown).map((p) => S.cardHTML(p)).join(''));
    renderMore();
    // Keep keyboard users where the new products begin.
    const firstNew = grid.children[start];
    const link = firstNew && $('.card__title a', firstNew);
    if (link) link.focus({ preventScroll: true });
  }

  /* ---------- events ---------- */
  filtersEl.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'f-cat') { state.cat = t.value; if (t.value) state.badge = ''; }
    else if (t.name === 'f-dosha') { if (t.checked) state.dosha.add(t.value); else state.dosha.delete(t.value); }
    else if (t.name === 'f-price') state.price = t.value;
    else if (t.matches('[data-f-stock]')) state.stock = t.checked;
    else return;
    update();
  });

  let qTimer = 0;
  qInput.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = qInput.value.trim().slice(0, 80); update(); }, 160);
  });
  qInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(qTimer); state.q = qInput.value.trim().slice(0, 80); update(); } });

  sortEl.addEventListener('change', () => { state.sort = pick(sortEl.value, SORTS) || 'featured'; update(); });

  document.addEventListener('click', (e) => {
    const clear = e.target.closest('[data-clear]');
    if (clear) {
      const key = clear.dataset.clear;
      if (key === 'all') { state.q = ''; state.cat = ''; state.badge = ''; state.dosha.clear(); state.price = ''; state.stock = false; }
      else if (key.startsWith('dosha:')) state.dosha.delete(key.slice(6));
      else if (key === 'stock') state.stock = false;
      else state[key] = '';
      update();
      return;
    }
    if (e.target.closest('[data-more-btn]')) loadMore();
  });

  /* Mobile: the sidebar becomes a dialog. */
  const desktop = window.matchMedia('(min-width: 1024px)');
  const filtersDialog = S.dialog(filtersEl, {
    onOpen() { filtersEl.setAttribute('role', 'dialog'); filtersEl.setAttribute('aria-modal', 'true'); },
    onClose() { filtersEl.removeAttribute('role'); filtersEl.removeAttribute('aria-modal'); }
  });
  $('[data-filters-open]').addEventListener('click', (e) => filtersDialog.open(e.currentTarget));
  desktop.addEventListener('change', () => { if (desktop.matches) filtersDialog.close({ restoreFocus: false }); });

  renderFilters();
  update();
})();
