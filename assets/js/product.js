/* =====================================================================
   SATYANAND AYURVEDA — product page (product.html?id=…&v=…)
   ===================================================================== */
(function () {
  'use strict';

  const S = window.Satyanand;
  const { $, $$, esc, money, ICON, CFG } = S;
  const RECENT_KEY = 'satyanand.recent.v1';

  const params = new URLSearchParams(location.search);
  const p = S.byId.get(params.get('id') || '');
  const root = $('[data-pdp]');
  root.removeAttribute('aria-busy');

  if (!p) {
    root.innerHTML =
      `<div class="not-found"><img src="assets/img/emblem.png" alt="" width="120" height="120">` +
      `<h1 class="h2">We couldn’t find that product</h1>` +
      `<p class="lead">It may have been renamed or is no longer available.</p>` +
      `<a class="btn btn--primary btn--lg" href="shop.html">Browse all products</a></div>`;
    document.title = 'Product not found | Satyanand Ayurveda';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    return;
  }

  const small = (body) => `<svg class="i" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  const SHARE = small('<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>');
  const CASH = small('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  let variant = p.variants.find((v) => v.id === params.get('v') && S.isInStock(p, v)) ||
                p.variants.find((v) => S.isInStock(p, v)) || p.variants[0];
  let qty = 1;

  /* ---------- render ---------- */
  const sizes = p.variants.length > 1
    ? `<div><p class="pdp__label" id="size-label">Pack size</p><div class="sizes" role="group" aria-labelledby="size-label">${p.variants.map((v) =>
        `<button type="button" class="size" data-size="${esc(v.id)}" aria-pressed="false"${S.isInStock(p, v) ? '' : ' disabled'}>` +
        `<b>${esc(v.label)}</b><span>${money(v.price)}${S.pctOff(v) ? ` · ${S.pctOff(v)}% off` : ''}</span></button>`).join('')}</div></div>`
    : `<p class="muted"><b>Pack size:</b> ${esc(p.variants[0].label)}</p>`;

  const notify = S.waConfigured
    ? `<a class="btn btn--outline btn--lg" data-notify hidden href="${esc(S.waLink(`Hello ${CFG.brand}, please tell me when ${p.name} is back in stock.`))}" target="_blank" rel="noopener">Notify me on WhatsApp</a>`
    : '';

  root.innerHTML =
    `<div class="pdp">` +
      `<div class="pdp__gallery">` +
        `<div class="pdp__stage" style="--tint:${esc(p.cat.tint)}">${S.badgeHTML(p)}` +
          `<button class="icon-btn pdp__share" type="button" data-share aria-label="Share this product">${SHARE}</button>` +
          `<img src="${esc(S.image(p))}" alt="${esc(p.name)} (${esc(p.form)}) by Satyanand Ayurveda" width="400" height="400" fetchpriority="high">` +
        `</div>` +
      `</div>` +
      `<div class="pdp__info">` +
        `<a class="pdp__cat" href="shop.html?cat=${encodeURIComponent(p.category)}">${esc(p.cat.name)} · ${esc(p.form)}</a>` +
        `<h1 class="pdp__title">${esc(p.name)}</h1>` +
        `<p class="pdp__tagline">${esc(p.tagline)}</p>` +
        `<div class="pdp__price price" data-price></div>` +
        `<p class="pdp__tax">Inclusive of all taxes · Free shipping above ${money(CFG.freeShippingAt)}</p>` +
        sizes +
        `<div>` +
          `<p class="pdp__label" id="qty-label">Quantity</p>` +
          `<div class="buy">` +
            `<div class="qty qty--lg" role="group" aria-labelledby="qty-label">` +
              `<button type="button" data-step="-1" aria-label="Decrease quantity">${ICON.minus}</button>` +
              `<span class="qty__n" data-qty aria-live="polite">1</span>` +
              `<button type="button" data-step="1" aria-label="Increase quantity">${ICON.plus}</button>` +
            `</div>` +
            `<button class="btn btn--primary btn--lg" type="button" data-add-main>${ICON.bag}<span>Add to cart</span></button>` +
            `<button class="btn btn--gold btn--lg" type="button" data-buy-now>Buy now</button>` +
            notify +
          `</div>` +
        `</div>` +
        `<ul class="perks">` +
          `<li class="perk">${ICON.truck}<div><b>Free shipping</b><br>above ${money(CFG.freeShippingAt)}</div></li>` +
          `<li class="perk">${CASH}<div><b>Cash on Delivery</b><br>available</div></li>` +
          `<li class="perk">${ICON.leaf}<div><b>Classical recipe</b><br>full ingredient list</div></li>` +
        `</ul>` +
        (p.dosha.length
          ? `<div class="dosha-tags"><span>Best suited to:</span>${p.dosha.map((d) => `<span class="dosha-tag">${cap(d)}</span>`).join('')}` +
            `<a href="dosha-quiz.html" style="text-decoration:underline">What’s my dosha?</a></div>`
          : '') +
        `<div class="acc">` +
          `<details open><summary>About this product</summary><div class="acc__body"><p>${esc(p.description)}</p></div></details>` +
          `<details><summary>Key benefits</summary><div class="acc__body"><ul>${(p.benefits || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></details>` +
          `<details><summary>Ingredients</summary><div class="acc__body"><ul>${(p.ingredients || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></details>` +
          `<details><summary>How to use</summary><div class="acc__body"><p>${esc(p.usage)}</p><p class="fine">Store in a cool, dry place away from direct sunlight. Keep out of reach of children.</p></div></details>` +
          `<details><summary>Shipping &amp; returns</summary><div class="acc__body"><p>Dispatched within 1–2 working days and usually delivered in 3–7. Free shipping above ${money(CFG.freeShippingAt)}; Cash on Delivery available. Damaged or wrong item? Tell us within 48 hours for a free replacement.</p><p><a href="policies.html#returns" style="text-decoration:underline">Read the full policy</a></p></div></details>` +
        `</div>` +
      `</div>` +
    `</div>`;

  const priceEl = $('[data-price]', root);
  const qtyEl = $('[data-qty]', root);
  const addBtn = $('[data-add-main]', root);
  const buyBtn = $('[data-buy-now]', root);
  const notifyBtn = $('[data-notify]', root);
  const [decBtn, incBtn] = $$('[data-step]', root);

  function update() {
    const off = S.pctOff(variant);
    priceEl.innerHTML = S.priceHTML(variant) +
      (off ? `<span class="fine" style="flex-basis:100%">You save ${money(variant.mrp - variant.price)} on MRP</span>` : '');
    $$('[data-size]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === variant.id)));
    const sold = !S.isInStock(p, variant);
    qtyEl.textContent = qty;
    decBtn.disabled = sold || qty <= 1;
    incBtn.disabled = sold || qty >= S.Cart.max;
    addBtn.disabled = sold;
    addBtn.innerHTML = sold ? 'Sold out' : `${ICON.bag}<span>Add to cart</span>`;
    buyBtn.hidden = sold;
    if (notifyBtn) notifyBtn.hidden = !sold;
    updateBuybar();
  }

  root.addEventListener('click', (e) => {
    const size = e.target.closest('[data-size]');
    if (size && !size.disabled) {
      variant = S.variantOf(p, size.dataset.size);
      const u = new URL(location.href);
      u.searchParams.set('v', variant.id);
      history.replaceState(null, '', u);
      update();
      return;
    }
    const step = e.target.closest('[data-step]');
    if (step) {
      qty = Math.min(S.Cart.max, Math.max(1, qty + Number(step.dataset.step)));
      update();
      return;
    }
    if (e.target.closest('[data-add-main]')) { S.addToCart(p.id, variant.id, qty, addBtn); return; }
    if (e.target.closest('[data-buy-now]')) {
      S.Cart.add(p.id, variant.id, qty);
      location.href = 'checkout.html';
      return;
    }
    if (e.target.closest('[data-share]')) share();
  });

  async function share() {
    const data = { title: p.name + ' — Satyanand Ayurveda', text: p.tagline, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(location.href);
      S.toast({ title: 'Link copied' });
    } catch (err) {
      if (err && err.name !== 'AbortError') S.toast({ title: 'Couldn’t share — copy the address bar link instead' });
    }
  }

  /* ---------- sticky "add to cart" bar (mobile) ---------- */
  const bar = $('[data-buybar]');
  const barBtn = $('[data-buybar-add]', bar);
  $('[data-buybar-img]', bar).src = S.image(p);
  $('[data-buybar-img]', bar).style.setProperty('--tint', p.cat.tint);
  $('[data-buybar-name]', bar).textContent = p.name;
  let barWanted = false;

  function updateBuybar() {
    const sold = !S.isInStock(p, variant);
    $('[data-buybar-price]', bar).textContent = money(variant.price) + (p.variants.length > 1 ? ` · ${variant.label}` : '');
    barBtn.disabled = sold;
    barBtn.textContent = sold ? 'Sold out' : 'Add to cart';
    const show = barWanted && window.matchMedia('(max-width: 1023px)').matches;
    bar.classList.toggle('is-shown', show);
    bar.setAttribute('aria-hidden', String(!show));
    barBtn.tabIndex = show ? 0 : -1;
    document.body.classList.toggle('has-buybar', show);
  }
  barBtn.addEventListener('click', () => S.addToCart(p.id, variant.id, qty, barBtn));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      // Show once the main button has scrolled *above* the viewport.
      barWanted = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      updateBuybar();
    }).observe(addBtn);
  }
  window.matchMedia('(max-width: 1023px)').addEventListener('change', updateBuybar);

  /* ---------- SEO: title, description, breadcrumbs, structured data ---------- */
  const desc = `${p.tagline}. ${p.description}`.slice(0, 158);
  const named = p.name.toLowerCase().includes(p.form.toLowerCase()) ? p.name : `${p.name} — ${p.form}`;
  document.title = `${named} | Satyanand Ayurveda`;
  const setMeta = (sel, value) => { const m = document.head.querySelector(sel); if (m) m.setAttribute('content', value); };
  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', document.title);
  setMeta('meta[property="og:description"]', desc);
  $('[data-crumbs]').insertAdjacentHTML('beforeend',
    `<li><a href="shop.html?cat=${encodeURIComponent(p.category)}">${esc(p.cat.name)}</a></li><li aria-current="page">${esc(p.name)}</li>`);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    sku: p.id,
    category: p.cat.name,
    brand: { '@type': 'Brand', name: CFG.brand },
    offers: p.variants.map((v) => ({
      '@type': 'Offer',
      sku: `${p.id}-${v.id}`,
      name: v.label,
      price: v.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/' + (S.isInStock(p, v) ? 'InStock' : 'OutOfStock'),
      url: location.origin + location.pathname + `?id=${encodeURIComponent(p.id)}&v=${encodeURIComponent(v.id)}`
    }))
  };
  if (p.image) ld.image = new URL(p.image, location.href).href;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld).replace(/</g, '\\u003c');
  document.head.appendChild(script);

  /* ---------- related + recently viewed ---------- */
  function railInto(wrapSel, trackSel, list) {
    const wrap = $(wrapSel);
    if (!list.length) return;
    S.renderProducts($(trackSel), list);
    wrap.hidden = false;
    S.initRails(wrap);
  }

  const sameCat = S.select('category:' + p.category, { exclude: p.id });
  const sameDosha = S.products.filter((x) => x.id !== p.id && x.category !== p.category && x.dosha.some((d) => p.dosha.includes(d)) && x.badges.includes('bestseller'));
  const related = sameCat.concat(sameDosha).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 10);
  railInto('[data-related-wrap]', '[data-related]', related);

  const recentIds = S.store.get(RECENT_KEY, []);
  const recent = (Array.isArray(recentIds) ? recentIds : []).map((id) => S.byId.get(id)).filter((x) => x && x.id !== p.id).slice(0, 10);
  railInto('[data-recent-wrap]', '[data-recent]', recent);
  S.store.set(RECENT_KEY, [p.id].concat(recent.map((x) => x.id)).slice(0, 12));

  update();
})();
