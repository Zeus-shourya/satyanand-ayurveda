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

  /* ---------- SEO copy for category views ----------
     Each ?cat= view is indexed as its own page. `title` goes in the browser
     tab / Google result (brand is appended), `lead` is shown under the H1 and
     starts the meta description. Keep wording to "traditionally used" /
     "supports" — no promises to cure or treat. A category not listed here
     falls back to "Ayurvedic <name>" and its blurb.                        */
  const CAT_SEO = {
    'immunity':        { title: 'Ayurvedic Medicine for Immunity',       lead: 'Ayurvedic products traditionally used to support natural immunity through the changing seasons.' },
    'digestion':       { title: 'Ayurvedic Medicine for Digestion',      lead: 'Ayurvedic formulations traditionally used to kindle agni and support healthy, comfortable digestion.' },
    'stress-sleep':    { title: 'Ayurvedic Medicine for Stress & Sleep', lead: 'Ayurvedic herbs traditionally used to ease everyday stress and support calm, restful sleep.' },
    'joint-care':      { title: 'Ayurvedic Joint & Muscle Care',         lead: 'Ayurvedic formulations traditionally used for joint and muscle comfort and easy movement.' },
    'skin-care':       { title: 'Ayurvedic Herbal Skin Care',            lead: 'Herbal skin care from classical Ayurvedic beauty rituals, with every ingredient listed.' },
    'hair-care':       { title: 'Ayurvedic Herbal Hair Care',            lead: 'Herbal hair care from the Ayurvedic tradition, made to nourish hair from the roots.' },
    'womens-wellness': { title: 'Ayurvedic Women’s Wellness',            lead: 'Ayurvedic formulations traditionally used to support women’s wellbeing through every phase.' },
    'mens-vitality':   { title: 'Ayurvedic Men’s Vitality',              lead: 'Ayurvedic rasayanas traditionally used to support men’s stamina, strength and vitality.' },
    'liver-detox':     { title: 'Ayurvedic Liver & Detox Care',          lead: 'Ayurvedic formulations traditionally used to support the liver and the body’s natural cleansing.' },
    'sugar-balance':   { title: 'Ayurvedic Sugar Balance Support',       lead: 'Ayurvedic formulations traditionally used to support healthy metabolism alongside a balanced diet.' },
    'respiratory':     { title: 'Ayurvedic Respiratory Care',            lead: 'Ayurvedic formulations traditionally used for respiratory comfort through the changing seasons.' },
    'teas-foods':      { title: 'Ayurvedic Teas & Foods',                lead: 'Herbal teas and traditional foods that bring everyday Ayurveda into your kitchen.' }
  };
  const BRAND = ' | Satyanand Ayurveda';
  const ALL_TITLE = 'Shop Ayurvedic Products Online' + BRAND;
  const ALL_DESC = 'Browse classical Ayurvedic tablets, churnas, oils, juices and teas for immunity, digestion, sleep, skin and hair. Cash on Delivery across India.';

  /* ---------- headings, chips, URL ---------- */
  function renderHeading() {
    const cat = state.cat && S.catById.get(state.cat);
    const seo = cat && CAT_SEO[cat.id];
    let title = 'All products';
    let blurb = 'Shop Ayurvedic products online — classical formulations for everyday wellbeing, honestly made and fairly priced.';
    let pageTitle = ALL_TITLE;
    let desc = ALL_DESC;
    if (cat) {
      title = cat.name;
      blurb = cat.blurb + '.' + (seo ? ' ' + seo.lead : '');
      pageTitle = (seo ? seo.title : 'Ayurvedic ' + cat.name) + BRAND;
      desc = (seo ? seo.lead : `Ayurvedic ${cat.name}: ${cat.blurb}.`) +
        ` Free shipping above ${money(S.CFG.freeShippingAt)} and Cash on Delivery across India.`;
    }
    else if (state.badge) { title = BADGE_TITLES[state.badge]; blurb = 'The formulations our customers come back for.'; pageTitle = title + BRAND; }
    else if (state.q) { title = `Results for “${state.q}”`; blurb = 'Searching names, herbs, ingredients and concerns.'; pageTitle = title + BRAND; }
    $('[data-shop-title]').textContent = title;
    $('[data-shop-blurb]').textContent = blurb;
    $('[data-crumb]').textContent = title;

    // Category views canonicalise to ?cat=…; everything else (filters, sort, badges) to shop.html.
    // Search results are kept out of the index.
    const url = S.absUrl(cat ? 'shop.html?cat=' + encodeURIComponent(cat.id) : 'shop.html');
    S.setSeo({
      title: pageTitle,
      description: desc,
      url,
      robots: state.q ? 'noindex, follow' : 'index, follow, max-image-preview:large'
    });
    return { url, name: cat ? cat.name : 'Shop', pageTitle, desc };
  }

  /** CollectionPage + BreadcrumbList + ItemList for the current view (all matching products, not just the first page). */
  function renderLd(view) {
    const { url, name, pageTitle, desc } = view;
    S.setJsonLd('ld-shop', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': url + '#webpage',
          url,
          name: pageTitle,
          description: desc,
          inLanguage: 'en-IN',
          isPartOf: { '@id': S.absUrl('#website') },
          about: { '@id': S.absUrl('#business') },
          publisher: { '@id': S.absUrl('#business') },
          breadcrumb: { '@id': url + '#breadcrumb' },
          mainEntity: { '@id': url + '#products' }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': url + '#breadcrumb',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: S.absUrl('./') },
            { '@type': 'ListItem', position: 2, name, item: url }
          ]
        },
        {
          '@type': 'ItemList',
          '@id': url + '#products',
          numberOfItems: current.length,
          itemListElement: current.map((p, i) => ({
            '@type': 'ListItem', position: i + 1, name: p.name, url: S.absUrl(S.productUrl(p))
          }))
        }
      ]
    });
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
    const view = renderHeading();
    renderResults();
    renderLd(view);
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
