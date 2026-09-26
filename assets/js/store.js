/* =====================================================================
   SATYANAND AYURVEDA — storefront core (loaded on every page)
   ---------------------------------------------------------------------
   Catalogue index + search, cart state, the cart drawer, search dialog,
   mobile menu, product cards, toasts and small UI behaviours.

   Built for load: the site is static files on a CDN, so traffic never
   reaches a server. In the browser every list renders as one HTML string,
   all clicks go through a handful of delegated listeners (no per-card
   handlers), images are lazy and sized up front, and scroll work is
   batched into animation frames.

   Page scripts (home.js, shop.js …) use the API exposed at the bottom
   as window.Satyanand.
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.SATYANAND_CONFIG;
  const CATALOG = window.SATYANAND_CATALOG;
  const Pack = window.SatyanandPackshot;

  /* ================================================================
     1. HELPERS
     ================================================================ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ESC[c]);
  const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const money = (n) => INR.format(Math.round(n));
  const pctOff = (v) => (v.mrp > v.price ? Math.round((1 - v.price / v.mrp) * 100) : 0);
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';

  /* localStorage can throw (private mode, blocked storage, quota) — never let it break the shop. */
  const store = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }
  };

  const icon = (body, cls = '') =>
    `<svg class="i ${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  const ICON = {
    search: icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
    bag: icon('<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>'),
    close: icon('<path d="M6 6l12 12M18 6 6 18"/>'),
    trash: icon('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    minus: icon('<path d="M6 12h12"/>'),
    plus: icon('<path d="M12 6v12M6 12h12"/>'),
    arrow: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    check: icon('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    truck: icon('<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    leaf: icon('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z"/><path d="M5 19 13 11"/>'),
    whatsapp: '<svg class="i" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.59 14.86L2 22l5.27-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 1 1 6.98 3.86Zm4.51-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06a6.73 6.73 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.76 2.76 0 0 0-.86 2.05 4.8 4.8 0 0 0 1 2.55 11 11 0 0 0 4.2 3.71c1.57.68 2.18.73 2.97.62.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29Z"/></svg>'
  };

  /* ================================================================
     2. CATALOGUE INDEX + SEARCH
     ================================================================ */
  const categories = CATALOG.categories;
  const products = CATALOG.products;
  const catById = new Map(categories.map((c) => [c.id, c]));
  const byId = new Map();

  products.forEach((p, i) => {
    p.rank = i;
    p.cat = catById.get(p.category) || { id: p.category, name: p.category, tint: '#EEF2DF', blurb: '' };
    p.badges = p.badges || [];
    p.dosha = p.dosha || [];
    const short = String(p.short || '');
    p._name = norm(p.name + ' ' + short.replace(/\|/g, ''));
    p._cat = norm(p.cat.name);
    p._hay = norm([
      p.name, short.replace(/\|/g, ''), short.replace(/\|/g, ' '), p.form, p.cat.name, p.tagline,
      (p.ingredients || []).join(' '), p.badges.join(' '), p.dosha.join(' ')
    ].join(' '));
    byId.set(p.id, p);
  });
  categories.forEach((c) => { c.count = products.filter((p) => p.category === c.id).length; });

  const isInStock = (p, v) => p.stock !== false && !(v && v.stock === false);
  const variantOf = (p, vid) => p.variants.find((v) => v.id === vid) || p.variants[0];
  const productUrl = (p) => 'product.html?id=' + encodeURIComponent(p.id);
  const image = (p, opts) => Pack.url(p, opts);

  /** Every term must match; name hits outrank category hits outrank ingredient hits. */
  function search(query, list = products) {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return list.slice();
    const hits = [];
    for (const p of list) {
      let score = 0;
      let ok = true;
      for (const t of terms) {
        if (!p._hay.includes(t)) { ok = false; break; }
        score += p._name.startsWith(t) ? 8 : p._name.includes(t) ? 5 : p._cat.includes(t) ? 3 : 1;
      }
      if (ok) hits.push([score, p]);
    }
    return hits.sort((a, b) => b[0] - a[0] || a[1].rank - b[1].rank).map((h) => h[1]);
  }

  /** Resolve a list spec like "badge:bestseller", "category:immunity", "dosha:vata", "ids:a,b". */
  function select(spec, { limit = 0, exclude = '' } = {}) {
    const [kind, value = ''] = String(spec || 'all').split(':');
    let list;
    if (kind === 'badge') list = products.filter((p) => p.badges.includes(value));
    else if (kind === 'category') list = products.filter((p) => p.category === value);
    else if (kind === 'dosha') list = products.filter((p) => p.dosha.includes(value));
    else if (kind === 'ids') list = value.split(',').map((id) => byId.get(id.trim())).filter(Boolean);
    else list = products.slice();
    if (exclude) list = list.filter((p) => p.id !== exclude);
    // In-stock first; Array#sort is stable so catalogue order holds within each group.
    list.sort((a, b) => Number(isInStock(b)) - Number(isInStock(a)));
    return limit ? list.slice(0, limit) : list;
  }

  /* ================================================================
     3. CART
     ================================================================ */
  const CART_KEY = 'satyanand.cart.v1';
  const COUPON_KEY = 'satyanand.coupon.v1';
  const MAX_QTY = Math.max(1, CFG.maxQtyPerItem || 10);

  /* Stored carts are untrusted: products get removed, prices change, people
     edit localStorage. Keep only lines that still exist and are in stock,
     merge duplicates, clamp quantities. Prices are always read live from
     the catalogue — never from storage. */
  function sanitize(raw) {
    const merged = new Map();
    (Array.isArray(raw) ? raw : []).forEach((l) => {
      const p = l && byId.get(l.pid);
      const v = p && p.variants.find((x) => x.id === l.vid);
      if (!v || !isInStock(p, v)) return;
      const key = p.id + '|' + v.id;
      const qty = (merged.has(key) ? merged.get(key).qty : 0) + Math.max(0, Math.floor(Number(l.qty)) || 0);
      if (qty > 0) merged.set(key, { pid: p.id, vid: v.id, qty: Math.min(MAX_QTY, qty) });
    });
    return Array.from(merged.values());
  }

  let lines = sanitize(store.get(CART_KEY, []));

  function commit() {
    store.set(CART_KEY, lines);
    document.dispatchEvent(new CustomEvent('cart:change'));
  }

  function evaluateCoupon(code, subtotal) {
    code = String(code || '').trim().toUpperCase();
    if (!code) return null;
    const c = (CFG.coupons || {})[code];
    if (!c) return { code, amount: 0, error: 'That code isn’t valid.' };
    if (subtotal < (c.minSubtotal || 0)) {
      return { code, amount: 0, error: `Add ${money(c.minSubtotal - subtotal)} more to use ${code}.` };
    }
    let amount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
    if (c.maxDiscount) amount = Math.min(amount, c.maxDiscount);
    return { code, amount: Math.min(amount, subtotal), note: c.note || '' };
  }

  const findLine = (pid, vid) => lines.find((l) => l.pid === pid && l.vid === vid);

  const Cart = {
    max: MAX_QTY,

    lines() {
      return lines.map((l) => {
        const product = byId.get(l.pid);
        const variant = variantOf(product, l.vid);
        return {
          pid: l.pid, vid: l.vid, qty: l.qty, product, variant,
          total: variant.price * l.qty,
          mrpTotal: Math.max(variant.mrp || 0, variant.price) * l.qty
        };
      });
    },

    count() { return lines.reduce((n, l) => n + l.qty, 0); },

    qty(pid, vid) { const l = findLine(pid, vid); return l ? l.qty : 0; },

    /** Returns how many were actually added (0 when sold out or already at the cap). */
    add(pid, vid, qty = 1) {
      const p = byId.get(pid);
      if (!p) return 0;
      const v = variantOf(p, vid);
      if (!isInStock(p, v)) return 0;
      const line = findLine(p.id, v.id);
      const before = line ? line.qty : 0;
      const after = Math.min(MAX_QTY, before + Math.max(1, Math.floor(qty) || 1));
      if (after === before) return 0;
      if (line) line.qty = after;
      else lines.unshift({ pid: p.id, vid: v.id, qty: after });
      commit();
      return after - before;
    },

    set(pid, vid, qty) {
      const n = Math.floor(Number(qty)) || 0;
      if (n <= 0) { Cart.remove(pid, vid); return; }
      const line = findLine(pid, vid);
      if (!line) return;
      line.qty = Math.min(MAX_QTY, n);
      commit();
    },

    remove(pid, vid) {
      lines = lines.filter((l) => !(l.pid === pid && l.vid === vid));
      commit();
    },

    clear() {
      lines = [];
      store.remove(COUPON_KEY);
      commit();
    },

    couponCode() { return store.get(COUPON_KEY, ''); },

    setCoupon(code) {
      const clean = String(code || '').trim().toUpperCase();
      if (clean) store.set(COUPON_KEY, clean); else store.remove(COUPON_KEY);
      document.dispatchEvent(new CustomEvent('cart:change'));
    },

    totals({ payment = '' } = {}) {
      const ls = Cart.lines();
      const count = ls.reduce((n, l) => n + l.qty, 0);
      const subtotal = ls.reduce((n, l) => n + l.total, 0);
      const mrpTotal = ls.reduce((n, l) => n + l.mrpTotal, 0);
      const coupon = ls.length ? evaluateCoupon(Cart.couponCode(), subtotal) : null;
      const discount = coupon && !coupon.error ? coupon.amount : 0;
      const net = subtotal - discount;
      const shipping = !ls.length || net >= CFG.freeShippingAt ? 0 : CFG.shippingFee;
      const codFee = payment === 'cod' && ls.length ? CFG.codFee || 0 : 0;
      return {
        count, subtotal, mrpTotal, savings: mrpTotal - subtotal, coupon, discount,
        shipping, codFee, total: net + shipping + codFee,
        toFreeShipping: Math.max(0, CFG.freeShippingAt - net)
      };
    }
  };

  /* Another tab changed the cart — pick it up so both tabs agree. */
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY || e.key === COUPON_KEY || e.key === null) {
      lines = sanitize(store.get(CART_KEY, []));
      document.dispatchEvent(new CustomEvent('cart:change'));
    }
  });

  /* ================================================================
     4. RENDERING — prices, cards, category tiles
     ================================================================ */
  const BADGES = { bestseller: 'Bestseller', new: 'New', trending: 'Trending', seasonal: 'Seasonal' };

  function priceHTML(v) {
    const off = pctOff(v);
    return `<span class="price__now">${money(v.price)}</span>` +
      (off ? `<s class="price__mrp"><span class="sr-only">MRP </span>${money(v.mrp)}</s><span class="price__off">${off}% off</span>` : '');
  }

  function badgeHTML(p) {
    if (!isInStock(p)) return '<span class="badge badge--muted">Sold out</span>';
    const b = p.badges[0];
    return b ? `<span class="badge badge--${b}">${BADGES[b] || esc(b)}</span>` : '';
  }

  function cardHTML(p, { eager = false } = {}) {
    const v = p.variants[0];
    const soldOut = !isInStock(p);
    const href = productUrl(p);
    const sizes = p.variants.length > 1
      ? `<div class="chips" role="group" aria-label="Pack size">${p.variants.map((x, i) =>
          `<button type="button" class="chip" data-variant="${esc(x.id)}" aria-pressed="${i === 0}"${isInStock(p, x) ? '' : ' disabled'}>${esc(x.label)}</button>`
        ).join('')}</div>`
      : `<p class="card__size">${esc(v.label)}</p>`;

    return `<article class="card${soldOut ? ' is-soldout' : ''}" data-pid="${esc(p.id)}" data-vid="${esc(v.id)}">` +
      `<a class="card__media" href="${href}" tabindex="-1" aria-hidden="true" style="--tint:${esc(p.cat.tint)}">${badgeHTML(p)}` +
        `<img src="${esc(image(p))}" alt="" width="400" height="400"${eager ? '' : ' loading="lazy"'} decoding="async"></a>` +
      `<div class="card__body">` +
        `<p class="card__cat">${esc(p.cat.name)}</p>` +
        `<h3 class="card__title"><a href="${href}">${esc(p.name)}</a></h3>` +
        `<p class="card__tag">${esc(p.tagline)}</p>` +
        sizes +
        `<p class="price" data-price>${priceHTML(v)}</p>` +
        `<button type="button" class="btn btn--primary btn--block card__add" data-add${soldOut ? ' disabled' : ''}>` +
          (soldOut ? 'Sold out' : `${ICON.bag}<span>Add to cart</span>`) +
        `</button>` +
      `</div>` +
    `</article>`;
  }

  function renderProducts(el, list, opts) {
    el.innerHTML = list.map((p, i) => cardHTML(p, { eager: opts && opts.eager && i < 4 })).join('');
  }

  function renderCategories(el) {
    el.innerHTML = categories.map((c) => {
      const lead = select('category:' + c.id).find((p) => p.badges.includes('bestseller')) || select('category:' + c.id)[0];
      return `<a class="cat" href="shop.html?cat=${encodeURIComponent(c.id)}" style="--tint:${esc(c.tint)}">` +
        `<span class="cat__media">${lead ? `<img src="${esc(image(lead, { bare: true }))}" alt="" width="400" height="400" loading="lazy" decoding="async">` : ''}</span>` +
        `<span class="cat__name">${esc(c.name)}</span>` +
      `</a>`;
    }).join('');
  }

  /** Fill every declarative slot on the page: product lists, pack images, category tiles. */
  function hydrate(root = document) {
    $$('[data-products]', root).forEach((el) => {
      renderProducts(el, select(el.dataset.products, { limit: Number(el.dataset.limit) || 0 }));
    });
    $$('img[data-packshot]', root).forEach((img) => {
      const p = byId.get(img.dataset.packshot);
      if (p) img.src = image(p, { bare: img.hasAttribute('data-bare') });
    });
    $$('[data-categories]', root).forEach(renderCategories);
  }

  /* ================================================================
     5. INJECTED CHROME — cart drawer, search, toasts, WhatsApp button
     ================================================================ */
  const WA = String(CFG.whatsapp || '').replace(/\D/g, '');
  const waConfigured = /^\d{10,15}$/.test(WA);
  const waLink = (text) => (waConfigured ? `https://wa.me/${WA}?text=${encodeURIComponent(text)}` : '');

  document.body.insertAdjacentHTML('beforeend',
    `<div class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" hidden>` +
      `<div class="drawer__scrim" data-close></div>` +
      `<section class="drawer__panel">` +
        `<header class="drawer__head">` +
          `<h2 id="cart-title" class="drawer__title">Your cart <span data-cart-count-label></span></h2>` +
          `<button type="button" class="icon-btn" data-close aria-label="Close cart">${ICON.close}</button>` +
        `</header>` +
        `<div class="ship-meter" data-ship-meter></div>` +
        `<div class="drawer__body" data-cart-body></div>` +
        `<footer class="drawer__foot" data-cart-foot></footer>` +
      `</section>` +
    `</div>` +
    `<div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search products" hidden>` +
      `<div class="search__scrim" data-close></div>` +
      `<div class="search__panel">` +
        `<form class="search__form" action="shop.html" method="get" role="search">` +
          `<span class="search__icon">${ICON.search}</span>` +
          `<label class="sr-only" for="search-input">Search products</label>` +
          `<input id="search-input" name="q" type="search" enterkeyhint="search" placeholder="Search ashwagandha, triphala, hair oil…" autocomplete="off" spellcheck="false" data-focus>` +
          `<button type="button" class="icon-btn" data-close aria-label="Close search">${ICON.close}</button>` +
        `</form>` +
        `<div class="search__results" data-search-results></div>` +
      `</div>` +
    `</div>` +
    `<div class="toasts" role="status" aria-live="polite" data-toasts></div>` +
    (waConfigured
      ? `<a class="wa-fab" href="${esc(waLink(`Hello ${CFG.brand}, I have a question.`))}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${ICON.whatsapp}</a>`
      : '')
  );

  /* ================================================================
     6. DIALOGS — focus trap, Escape, scroll lock, return focus
     ================================================================ */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const isVisible = (n) => !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length);
  let lockDepth = 0;

  function lockScroll(on) {
    lockDepth = Math.max(0, lockDepth + (on ? 1 : -1));
    const root = document.documentElement;
    if (lockDepth && !root.classList.contains('is-locked')) {
      root.style.setProperty('--scrollbar', window.innerWidth - root.clientWidth + 'px');
      root.classList.add('is-locked');
    } else if (!lockDepth) {
      root.classList.remove('is-locked');
    }
  }

  const openDialogs = new Set();

  function dialog(el, { onOpen, onClose } = {}) {
    let returnTo = null;
    let hideTimer = 0;
    const api = {
      get isOpen() { return el.classList.contains('is-open'); },
      open(trigger) {
        if (api.isOpen) return;
        openDialogs.forEach((d) => d.close({ restoreFocus: false }));
        clearTimeout(hideTimer);
        returnTo = trigger || document.activeElement;
        el.hidden = false;
        void el.offsetWidth; // commit display before the transition starts
        el.classList.add('is-open');
        openDialogs.add(api);
        lockScroll(true);
        $$(`[aria-controls="${el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
        if (onOpen) onOpen();
        const target = $('[data-focus]', el) || $$(FOCUSABLE, el).find(isVisible);
        if (target) target.focus({ preventScroll: true });
      },
      close({ restoreFocus = true } = {}) {
        if (!api.isOpen) return;
        el.classList.remove('is-open');
        openDialogs.delete(api);
        lockScroll(false);
        $$(`[aria-controls="${el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
        hideTimer = setTimeout(() => { el.hidden = true; }, reducedMotion() ? 0 : 320);
        if (onClose) onClose();
        if (restoreFocus && returnTo && document.contains(returnTo)) returnTo.focus({ preventScroll: true });
      }
    };
    // Guarded by isOpen: the shop filters reuse this as a plain sidebar on desktop.
    el.addEventListener('click', (e) => { if (api.isOpen && e.target.closest('[data-close]')) api.close(); });
    el.addEventListener('keydown', (e) => {
      if (!api.isOpen) return;
      if (e.key === 'Escape') { e.stopPropagation(); api.close(); return; }
      if (e.key !== 'Tab') return;
      const items = $$(FOCUSABLE, el).filter(isVisible);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    return api;
  }

  /* ================================================================
     7. CART DRAWER
     ================================================================ */
  function lineHTML(l) {
    const p = l.product;
    const v = l.variant;
    const href = productUrl(p);
    const key = `${p.id}:${v.id}`;
    return `<li class="line" data-pid="${esc(p.id)}" data-vid="${esc(v.id)}">` +
      `<a class="line__media" href="${href}" style="--tint:${esc(p.cat.tint)}" tabindex="-1" aria-hidden="true">` +
        `<img src="${esc(image(p))}" alt="" width="400" height="400" decoding="async"></a>` +
      `<div class="line__info">` +
        `<a class="line__name" href="${href}">${esc(p.name)}</a>` +
        `<p class="line__meta">${esc(v.label)} · ${money(v.price)}</p>` +
        `<div class="line__row">` +
          `<div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">` +
            `<button type="button" data-qty="-1" data-focus-key="dec:${esc(key)}" aria-label="${l.qty === 1 ? 'Remove' : 'Decrease quantity'}">${l.qty === 1 ? ICON.trash : ICON.minus}</button>` +
            `<span class="qty__n" aria-live="polite">${l.qty}</span>` +
            `<button type="button" data-qty="1" data-focus-key="inc:${esc(key)}" aria-label="Increase quantity"${l.qty >= MAX_QTY ? ' disabled' : ''}>${ICON.plus}</button>` +
          `</div>` +
          `<p class="line__price">${money(l.total)}${l.mrpTotal > l.total ? `<s><span class="sr-only">MRP </span>${money(l.mrpTotal)}</s>` : ''}</p>` +
        `</div>` +
      `</div>` +
      `<button type="button" class="line__remove" data-remove data-focus-key="rm:${esc(key)}" aria-label="Remove ${esc(p.name)}">${ICON.close}</button>` +
    `</li>`;
  }

  function shipMeterHTML(t) {
    if (!t.count) return '';
    const pct = Math.min(100, Math.round(((CFG.freeShippingAt - t.toFreeShipping) / CFG.freeShippingAt) * 100));
    const msg = t.toFreeShipping > 0
      ? `Add <b>${money(t.toFreeShipping)}</b> more for <b>free shipping</b>`
      : `${ICON.check}<span>You’ve unlocked <b>free shipping</b></span>`;
    return `<p class="ship-meter__msg">${msg}</p><div class="meter" aria-hidden="true"><span style="width:${pct}%"></span></div>`;
  }

  function renderCart() {
    const t = Cart.totals();
    $$('[data-cart-count]').forEach((n) => { n.textContent = t.count > 99 ? '99+' : t.count; n.hidden = !t.count; });
    $$('[data-cart-open].cart-btn').forEach((b) => b.setAttribute('aria-label', t.count ? `Cart, ${t.count} item${t.count === 1 ? '' : 's'}` : 'Cart, empty'));

    const drawer = $('#cart');
    // Remember which control had focus so re-rendering doesn't throw keyboard users out.
    const focusKey = document.activeElement && drawer.contains(document.activeElement) ? document.activeElement.dataset.focusKey : '';

    $('[data-cart-count-label]', drawer).textContent = t.count ? `(${t.count})` : '';
    $('[data-ship-meter]', drawer).innerHTML = shipMeterHTML(t);
    $('[data-cart-body]', drawer).innerHTML = t.count
      ? `<ul class="lines">${Cart.lines().map(lineHTML).join('')}</ul>`
      : `<div class="empty">${ICON.bag}<h3>Your cart is empty</h3><p>Classical formulations, honestly made. Start with the ones our customers reorder most.</p><a class="btn btn--primary" href="shop.html?badge=bestseller">Shop bestsellers</a></div>`;
    $('[data-cart-foot]', drawer).innerHTML = t.count
      ? `<dl class="sum"><div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>` +
        (t.savings > 0 ? `<div class="sum__save"><dt>You save on MRP</dt><dd>${money(t.savings)}</dd></div>` : '') +
        `</dl><p class="fine">Inclusive of all taxes. Shipping and coupons are applied at checkout.</p>` +
        `<a class="btn btn--primary btn--block btn--lg" href="checkout.html">Checkout <span aria-hidden="true">·</span> ${money(t.subtotal)}</a>`
      : '';

    if (focusKey) {
      const again = $(`[data-focus-key="${CSS.escape(focusKey)}"]`, drawer);
      (again && !again.disabled ? again : $('.drawer__head [data-close]', drawer)).focus({ preventScroll: true });
    }
  }

  /* Quantity / remove controls — shared by the drawer and the checkout summary. */
  document.addEventListener('click', (e) => {
    const line = e.target.closest('.line[data-pid]');
    if (!line) return;
    const { pid, vid } = line.dataset;
    const step = e.target.closest('[data-qty]');
    if (step) { Cart.set(pid, vid, Cart.qty(pid, vid) + Number(step.dataset.qty)); return; }
    if (e.target.closest('[data-remove]')) Cart.remove(pid, vid);
  });

  /* ================================================================
     8. TOASTS
     ================================================================ */
  function toast({ title, product, variant, action } = {}) {
    // The open cart already shows the change — don't cover it.
    if (product && cartDialog.isOpen) return;
    const host = $('[data-toasts]');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML =
      (product ? `<img src="${esc(image(product))}" alt="" width="48" height="48" style="--tint:${esc(product.cat.tint)}">` : `<span class="toast__icon">${ICON.check}</span>`) +
      `<div class="toast__text"><strong>${esc(title)}</strong>` +
        (product ? `<span>${esc(product.name)}${variant && product.variants.length > 1 ? ' · ' + esc(variant.label) : ''}</span>` : '') +
      `</div>` +
      (action ? `<button type="button" class="toast__action" data-cart-open>${esc(action)}</button>` : '');
    host.appendChild(el);
    while (host.children.length > 3) host.firstElementChild.remove();
    requestAnimationFrame(() => el.classList.add('is-in'));
    setTimeout(() => {
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), 300);
    }, 3600);
  }

  /** Add to cart with feedback. `button` (optional) briefly shows "Added". */
  function addToCart(pid, vid, qty = 1, button) {
    const p = byId.get(pid);
    if (!p) return 0;
    const v = variantOf(p, vid);
    const added = Cart.add(pid, vid, qty);
    if (!added) {
      toast({ title: isInStock(p, v) ? `You already have the maximum of ${MAX_QTY} in your cart` : 'This item is sold out' });
      return 0;
    }
    if (button && !button.classList.contains('is-added')) {
      const html = button.innerHTML;
      button.classList.add('is-added');
      button.innerHTML = `${ICON.check}<span>Added</span>`;
      setTimeout(() => { button.classList.remove('is-added'); button.innerHTML = html; }, 1400);
    }
    toast({ title: 'Added to cart', product: p, variant: v, action: 'View cart' });
    return added;
  }

  /* Card interactions — one listener for every card on the page. */
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.card [data-variant]');
    if (chip) {
      const card = chip.closest('.card');
      const v = variantOf(byId.get(card.dataset.pid), chip.dataset.variant);
      card.dataset.vid = v.id;
      $$('[data-variant]', card).forEach((b) => b.setAttribute('aria-pressed', String(b === chip)));
      $('[data-price]', card).innerHTML = priceHTML(v);
      return;
    }
    const add = e.target.closest('.card [data-add]');
    if (add && !add.disabled) {
      const card = add.closest('.card');
      addToCart(card.dataset.pid, card.dataset.vid, 1, add);
    }
  });

  /* ================================================================
     9. SEARCH DIALOG
     ================================================================ */
  const POPULAR = ['Ashwagandha', 'Triphala', 'Chyawanprash', 'Kumkumadi', 'Hair oil', 'Acidity'];

  function renderSearch(q) {
    const box = $('[data-search-results]');
    const query = q.trim();
    if (!query) {
      box.innerHTML =
        `<p class="search__label">Popular searches</p>` +
        `<div class="search__pills">${POPULAR.map((w) => `<a class="pill" href="shop.html?q=${encodeURIComponent(w)}">${esc(w)}</a>`).join('')}</div>` +
        `<p class="search__label">Shop by category</p>` +
        `<div class="search__pills">${categories.map((c) => `<a class="pill pill--soft" href="shop.html?cat=${encodeURIComponent(c.id)}">${esc(c.name)}</a>`).join('')}</div>`;
      return;
    }
    const hits = search(query);
    box.innerHTML = hits.length
      ? `<p class="search__label">${hits.length} result${hits.length === 1 ? '' : 's'}</p>` +
        `<ul class="search__list">${hits.slice(0, 6).map((p) =>
          `<li><a class="hit" href="${productUrl(p)}">` +
            `<img src="${esc(image(p))}" alt="" width="56" height="56" style="--tint:${esc(p.cat.tint)}">` +
            `<span class="hit__text"><span class="hit__name">${esc(p.name)}</span><span class="hit__cat">${esc(p.cat.name)} · ${esc(p.form)}</span></span>` +
            `<span class="hit__price">${money(p.variants[0].price)}</span>` +
          `</a></li>`).join('')}</ul>` +
        `<a class="search__all" href="shop.html?q=${encodeURIComponent(query)}">See all results for “${esc(query)}” ${ICON.arrow}</a>`
      : `<div class="search__none"><p>No products match “${esc(query)}”.</p><p>Try a herb (“tulsi”), a concern (“sleep”) or a form (“oil”).</p></div>`;
  }

  /* ================================================================
     10. SMALL UI — header, nav, rails, reveal, WhatsApp, footer
     ================================================================ */
  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;
    let queued = false;
    const update = () => { queued = false; header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    const page = document.body.dataset.page;
    $$('[data-nav]').forEach((a) => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); });

    // The mega menu opens on hover/focus, so Escape must be able to dismiss it (WCAG 1.4.13).
    $$('.has-mega').forEach((item) => {
      const reset = () => item.classList.remove('is-dismissed');
      item.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        item.classList.add('is-dismissed');
        $('a', item).focus();
      });
      item.addEventListener('mouseleave', reset);
      item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) reset(); });
    });
  }

  /** Horizontal product rails with prev/next buttons that disable at the ends. */
  function initRails(root = document) {
    const rails = root !== document && root.matches('[data-rail]') ? [root] : $$('[data-rail]', root);
    rails.forEach((wrap) => {
      if (wrap._rail) { wrap._rail(); return; }
      const track = $('[data-rail-track]', wrap);
      const prev = $('[data-rail-prev]', wrap);
      const next = $('[data-rail-next]', wrap);
      if (!track) return;
      let queued = false;
      const update = () => {
        queued = false;
        const max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
        wrap.classList.toggle('is-static', max <= 0);
      };
      const go = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: reducedMotion() ? 'auto' : 'smooth' });
      track.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
      if (prev) prev.addEventListener('click', () => go(-1));
      if (next) next.addEventListener('click', () => go(1));
      if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
      wrap._rail = update;
      update();
    });
  }

  function initReveal() {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach((el) => io.observe(el));
  }

  function initWhatsApp() {
    $$('[data-wa]').forEach((a) => {
      const href = waLink(a.dataset.wa || `Hello ${CFG.brand}, I have a question.`);
      if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; }
      else (a.closest('[data-wa-wrap]') || a).hidden = true;
    });
    if (!waConfigured) console.warn('[Satyanand] WhatsApp number not set — add it in assets/js/config.js');
  }

  function initContacts() {
    $$('[data-contact]').forEach((el) => {
      const kind = el.dataset.contact;
      const value = String(CFG[kind] || '').trim();
      const host = el.closest('[data-contact-wrap]') || el;
      if (!value) { host.hidden = true; return; }
      el.textContent = value;
      if (el.tagName === 'A') el.href = kind === 'email' ? `mailto:${value}` : `tel:${value.replace(/[^\d+]/g, '')}`;
    });
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$('[data-free-ship]').forEach((el) => { el.textContent = money(CFG.freeShippingAt); });
  }

  /** Any <form data-wa-form="Title"> is sent to WhatsApp as a labelled message. */
  function sendFormToWhatsApp(form) {
    const rows = [`*${form.dataset.waForm}* — ${CFG.brand}`, ''];
    $$('input, select, textarea', form).forEach((f) => {
      if (!f.name || f.type === 'submit' || ((f.type === 'radio' || f.type === 'checkbox') && !f.checked)) return;
      const value = String(f.value || '').trim();
      if (!value) return;
      const label = f.dataset.label || (f.labels && f.labels[0] ? f.labels[0].textContent.replace(/\s*\*$/, '').trim() : f.name);
      rows.push(`${label}: ${value}`);
    });
    const href = waLink(rows.join('\n'));
    const status = $('[data-form-status]', form);
    if (href) {
      window.open(href, '_blank', 'noopener');
      if (status) status.innerHTML = `Opening WhatsApp… If it didn’t open, <a href="${esc(href)}" target="_blank" rel="noopener">tap here</a>.`;
    } else if (status) {
      status.innerHTML = isLocal
        ? 'WhatsApp number not set — add it in <code>assets/js/config.js</code> and this form will open a pre-filled chat.'
        : 'We couldn’t open WhatsApp just now. Please try again in a little while.';
    }
  }

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-wa-form]');
    if (!form) return;
    e.preventDefault();
    if (form.reportValidity()) sendFormToWhatsApp(form);
  });

  /* ================================================================
     11. BOOT
     ================================================================ */
  const cartDialog = dialog($('#cart'), {
    onOpen() { $$('.toast').forEach((t) => t.remove()); renderCart(); }
  });
  const searchInput = $('#search-input');
  const searchDialog = dialog($('#search'), { onOpen: () => { searchInput.value = ''; renderSearch(''); } });
  const menuEl = $('#menu');
  const menuDialog = menuEl ? dialog(menuEl) : null;

  let searchTimer = 0;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderSearch(searchInput.value), 90);
  });

  document.addEventListener('click', (e) => {
    const cartBtn = e.target.closest('[data-cart-open]');
    if (cartBtn) { e.preventDefault(); cartDialog.open(cartBtn); return; }
    const searchBtn = e.target.closest('[data-search-open]');
    if (searchBtn) { e.preventDefault(); searchDialog.open(searchBtn); return; }
    const menuBtn = e.target.closest('[data-menu-open]');
    if (menuBtn && menuDialog) { e.preventDefault(); menuDialog.open(menuBtn); }
  });

  /* "/" opens search from anywhere, like most big shops. */
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    e.preventDefault();
    searchDialog.open();
  });

  document.addEventListener('cart:change', renderCart);

  hydrate();
  renderCart();
  initHeader();
  initRails();
  initReveal();
  initWhatsApp();
  initContacts();

  window.Satyanand = {
    CFG, ICON, BADGES, categories, products, byId, catById,
    $, $$, esc, money, norm, pctOff, store, isLocal,
    isInStock, variantOf, productUrl, image, search, select,
    priceHTML, badgeHTML, cardHTML, lineHTML, renderProducts, hydrate,
    Cart, addToCart, evaluateCoupon, toast, waLink, waConfigured,
    initRails, initReveal,
    openCart: (trigger) => cartDialog.open(trigger),
    closeCart: () => cartDialog.close(),
    dialog
  };
})();
