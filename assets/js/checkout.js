/* =====================================================================
   SATYANAND AYURVEDA — checkout
   ---------------------------------------------------------------------
   There is no server: a placed order is written up as a WhatsApp
   message to the store number in config.js, which the customer sends.
   The store confirms it there (and sends a UPI link for prepaid orders).

   Totals are always recomputed from catalog.js — nothing the browser
   stored is trusted for price — and the message carries line prices so
   the owner can check them at a glance before confirming.
   ===================================================================== */
(function () {
  'use strict';

  const S = window.Satyanand;
  const { $, $$, esc, money, Cart, CFG, ICON } = S;
  const PROFILE_KEY = 'satyanand.profile.v1';
  const ORDERS_KEY = 'satyanand.orders.v1';
  const PROFILE_FIELDS = ['name', 'phone', 'email', 'line1', 'line2', 'landmark', 'pincode', 'city', 'state'];

  const form = $('[data-co-form]');
  const empty = $('[data-co-empty]');
  const success = $('[data-co-success]');
  const linesEl = $('[data-co-lines]');
  const couponEl = $('[data-co-coupon]');
  const totalsEl = $('[data-co-totals]');
  const submitBtn = $('[data-co-submit]');
  let placed = false;

  const field = (name) => form.elements.namedItem(name);
  const payment = () => { const r = form.querySelector('input[name="payment"]:checked'); return r ? r.value : 'upi'; };
  const cleanPhone = (v) => String(v).replace(/\D/g, '').replace(/^(?:91|0)(?=\d{10}$)/, '');

  /* ---------- saved details ---------- */
  const profile = S.store.get(PROFILE_KEY, null);
  if (profile && typeof profile === 'object') {
    PROFILE_FIELDS.forEach((k) => { if (typeof profile[k] === 'string') field(k).value = profile[k].slice(0, 200); });
    const pay = form.querySelector(`input[name="payment"][value="${profile.payment === 'cod' ? 'cod' : 'upi'}"]`);
    if (pay) pay.checked = true;
  }
  if (CFG.codFee) $('[data-cod-note]').textContent = `Pay when your order arrives. A ${money(CFG.codFee)} COD fee applies.`;

  /* ---------- rendering ---------- */
  const row = (label, value, cls = '') => `<div class="${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;

  function renderCoupon(t) {
    if (t.coupon && !t.coupon.error) {
      couponEl.innerHTML =
        `<div class="coupon__applied"><span><b>${esc(t.coupon.code)}</b> applied — you save ${money(t.discount)}</span>` +
        `<button type="button" data-coupon-remove>Remove</button></div>`;
      return;
    }
    const first = Object.keys(CFG.coupons || {})[0];
    couponEl.innerHTML =
      `<div class="coupon"><label class="sr-only" for="co-coupon">Coupon code</label>` +
      `<input class="input" id="co-coupon" placeholder="Coupon code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" value="${esc(t.coupon ? t.coupon.code : '')}">` +
      `<button class="btn btn--outline" type="button" data-coupon-apply>Apply</button></div>` +
      (t.coupon && t.coupon.error ? `<p class="coupon__msg is-err" role="alert">${esc(t.coupon.error)}</p>` : '') +
      (!t.coupon && first ? `<p class="coupon__hint">Have you tried <button type="button" data-coupon-try="${esc(first)}">${esc(first)}</button>? ${esc(CFG.coupons[first].note || '')}</p>` : '');
  }

  function renderTotals(t) {
    totalsEl.innerHTML =
      row(`Subtotal (${t.count} item${t.count === 1 ? '' : 's'})`, money(t.subtotal)) +
      (t.discount ? row(`Coupon ${esc(t.coupon.code)}`, '−' + money(t.discount), 'sum__disc') : '') +
      row('Shipping', t.shipping ? money(t.shipping) : 'Free') +
      (t.codFee ? row('Cash on Delivery fee', money(t.codFee)) : '') +
      row('Total', money(t.total), 'sum__total') +
      (t.savings + t.discount > 0 ? row('Your total savings', money(t.savings + t.discount), 'sum__save') : '');
    submitBtn.innerHTML = `Place order <span aria-hidden="true">·</span> ${money(t.total)}`;
    const ship = $('[data-co-ship]');
    ship.hidden = !t.shipping;
    if (t.shipping) ship.innerHTML = `Add <b>${money(t.toFreeShipping)}</b> more to get <b>free shipping</b>. <a href="shop.html?badge=bestseller" style="text-decoration:underline">Browse bestsellers</a>`;
  }

  function render() {
    if (placed) return;
    const count = Cart.count();
    empty.hidden = count > 0;
    form.hidden = count === 0;
    if (!count) { renderLastOrder(); return; }

    // Keep keyboard focus on the same control when quantities re-render.
    const active = document.activeElement;
    const focusKey = active && linesEl.contains(active) ? active.dataset.focusKey : '';
    linesEl.innerHTML = Cart.lines().map(S.lineHTML).join('');
    if (focusKey) {
      const again = linesEl.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`);
      (again && !again.disabled ? again : submitBtn).focus({ preventScroll: true });
    }
    const t = Cart.totals({ payment: payment() });
    renderCoupon(t);
    renderTotals(t);
  }

  /* An order placed recently but maybe never sent — offer to resend it. */
  function renderLastOrder() {
    const orders = S.store.get(ORDERS_KEY, []);
    const last = Array.isArray(orders) && orders[0];
    const old = $('[data-last-order]', empty);
    if (old) old.remove();
    if (!last || !last.text || Date.now() - Date.parse(last.at) > 48 * 3600 * 1000) return;
    const href = S.waLink(last.text);
    if (!href) return;
    empty.insertAdjacentHTML('beforeend',
      `<p class="fine" data-last-order>Placed order <b>${esc(last.id)}</b> but didn’t send it? <a href="${esc(href)}" target="_blank" rel="noopener" style="text-decoration:underline">Send it on WhatsApp</a></p>`);
  }

  /* ---------- coupon ---------- */
  function applyCoupon(code) {
    const clean = String(code || '').trim().toUpperCase();
    if (!clean) return;
    Cart.setCoupon(clean);
    const t = Cart.totals({ payment: payment() });
    if (t.coupon && !t.coupon.error) S.toast({ title: `${t.coupon.code} applied — you save ${money(t.discount)}` });
    else $('#co-coupon') && $('#co-coupon').focus();
  }

  couponEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-coupon-apply]')) applyCoupon($('#co-coupon').value);
    else if (e.target.closest('[data-coupon-remove]')) Cart.setCoupon('');
    else if (e.target.closest('[data-coupon-try]')) applyCoupon(e.target.closest('[data-coupon-try]').dataset.couponTry);
  });
  couponEl.addEventListener('keydown', (e) => {
    // Enter in the coupon box applies the code instead of submitting the order.
    if (e.key === 'Enter' && e.target.id === 'co-coupon') { e.preventDefault(); applyCoupon(e.target.value); }
  });

  /* ---------- validation ---------- */
  const RULES = {
    name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
    phone: (v) => /^[6-9]\d{9}$/.test(cleanPhone(v)) || 'Enter a valid 10-digit Indian mobile number.',
    email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email, or leave it blank.',
    line1: (v) => v.trim().length >= 4 || 'Please enter your house number and street.',
    pincode: (v) => /^[1-9]\d{5}$/.test(v.trim()) || 'Enter a valid 6-digit PIN code.',
    city: (v) => v.trim().length >= 2 || 'Please enter your city or town.',
    state: (v) => !!v || 'Please choose your state.'
  };

  function validate(name) {
    const f = field(name);
    const result = RULES[name](f.value);
    const ok = result === true;
    const wrap = f.closest('.field');
    const err = $('.field__err', wrap);
    wrap.classList.toggle('is-invalid', !ok);
    f.setAttribute('aria-invalid', String(!ok));
    if (err) {
      err.textContent = ok ? '' : result;
      if (ok) f.removeAttribute('aria-describedby'); else f.setAttribute('aria-describedby', err.id);
    }
    return ok;
  }

  form.addEventListener('focusout', (e) => {
    const name = e.target.name;
    if (RULES[name] && e.target.value) validate(name);
  });
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.name === 'pincode') t.value = t.value.replace(/\D/g, '').slice(0, 6);
    if (RULES[t.name] && t.closest('.field.is-invalid')) validate(t.name);
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'payment') renderTotals(Cart.totals({ payment: payment() }));
    if (e.target.name === 'state') validate('state');
  });

  /* ---------- placing the order ---------- */
  function orderId() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const rnd = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(rnd);
    return `SAT-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rnd[0].toString(36).toUpperCase().padStart(6, '0').slice(-6)}`;
  }

  function orderText(o) {
    const c = o.customer;
    const t = o.totals;
    const out = [`*New order — ${CFG.brand}*`, `Order ID: ${o.id}`, ''];
    o.items.forEach((it, i) => out.push(`${i + 1}. ${it.name} (${it.variant}) × ${it.qty} = ${money(it.price * it.qty)}`));
    out.push('', `Subtotal: ${money(t.subtotal)}`);
    if (t.discount) out.push(`Coupon ${o.coupon}: −${money(t.discount)}`);
    out.push(`Shipping: ${t.shipping ? money(t.shipping) : 'Free'}`);
    if (t.codFee) out.push(`COD fee: ${money(t.codFee)}`);
    out.push(`*Total: ${money(t.total)}*`);
    out.push(`Payment: ${o.payment === 'cod' ? 'Cash on Delivery' : 'UPI / prepaid — please send a payment link'}`);
    out.push('', '*Deliver to*', c.name, `+91 ${c.phone}`, [c.line1, c.line2].filter(Boolean).join(', '));
    if (c.landmark) out.push(`Landmark: ${c.landmark}`);
    out.push(`${c.city}, ${c.state} – ${c.pincode}`);
    if (c.email) out.push(`Email: ${c.email}`);
    if (o.note) out.push('', `Note: ${o.note}`);
    return out.join('\n');
  }

  function placeOrder() {
    const get = (k) => String(field(k).value || '').trim();
    const pay = payment();
    const t = Cart.totals({ payment: pay });
    const order = {
      id: orderId(),
      at: new Date().toISOString(),
      payment: pay,
      coupon: t.discount ? t.coupon.code : '',
      items: Cart.lines().map((l) => ({ id: l.pid, name: l.product.name, variant: l.variant.label, qty: l.qty, price: l.variant.price })),
      totals: { subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, codFee: t.codFee, total: t.total },
      customer: {
        name: get('name'), phone: cleanPhone(get('phone')), email: get('email'),
        line1: get('line1'), line2: get('line2'), landmark: get('landmark'),
        city: get('city'), state: get('state'), pincode: get('pincode')
      },
      note: get('note')
    };
    order.text = orderText(order);

    if (field('remember').checked) {
      const saved = { payment: pay };
      PROFILE_FIELDS.forEach((k) => { saved[k] = k === 'phone' ? order.customer.phone : get(k); });
      S.store.set(PROFILE_KEY, saved);
    } else {
      S.store.remove(PROFILE_KEY);
    }
    const past = S.store.get(ORDERS_KEY, []);
    S.store.set(ORDERS_KEY, [order].concat(Array.isArray(past) ? past : []).slice(0, 20));

    const href = S.waLink(order.text);
    if (href) window.open(href, '_blank', 'noopener');

    placed = true;
    Cart.clear();
    showSuccess(order, href);
  }

  function showSuccess(order, href) {
    form.hidden = true;
    empty.hidden = true;
    $('[data-co-title]').textContent = 'Order ready';
    const prepaid = order.payment !== 'cod';
    success.innerHTML =
      `<div class="success__tick">${ICON.check}</div>` +
      `<span class="eyebrow">Order ${esc(order.id)}</span>` +
      (href
        ? `<h2 class="h2">One last step — press <em>Send</em> in WhatsApp</h2>` +
          `<p class="lead">We’ve opened WhatsApp with your order filled in. Send it and we’ll confirm shortly${prepaid ? ', along with a secure UPI payment link' : ''}.</p>` +
          `<div class="success__actions"><a class="btn btn--wa btn--lg" href="${esc(href)}" target="_blank" rel="noopener">${ICON.whatsapp} Send order on WhatsApp</a>` +
          `<a class="btn btn--outline btn--lg" href="shop.html">Continue shopping</a></div>`
        : `<h2 class="h2">Your order details are ready</h2>` +
          `<p class="lead">${S.isLocal
            ? 'Online ordering isn’t connected yet — set the store’s WhatsApp number in <code>assets/js/config.js</code> and this button will send the order straight to you.'
            : 'Please copy your order details below and send them to us, and we’ll confirm your order.'}</p>` +
          `<div class="success__actions"><button class="btn btn--primary btn--lg" type="button" data-copy>Copy order details</button>` +
          `<a class="btn btn--outline btn--lg" href="shop.html">Continue shopping</a></div>`) +
      `<details class="panel success__box"${href ? '' : ' open'}><summary style="cursor:pointer;font-weight:600">Order summary · ${money(order.totals.total)}</summary>` +
        `<pre class="order-text" style="margin-top:12px">${esc(order.text)}</pre>` +
        (href ? `<button class="btn btn--ghost btn--sm" type="button" data-copy style="margin-top:8px">Copy order details</button>` : '') +
      `</details>`;
    success.hidden = false;
    success.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    success.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-copy]')) return;
      try {
        await navigator.clipboard.writeText(order.text);
        S.toast({ title: 'Order details copied' });
      } catch (err) {
        S.toast({ title: 'Couldn’t copy — select the text and copy it' });
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!Cart.count()) { render(); return; }
    const invalid = Object.keys(RULES).filter((name) => !validate(name));
    if (invalid.length) {
      field(invalid[0]).focus();
      S.toast({ title: invalid.length === 1 ? 'Please fix the highlighted field' : `Please fix the ${invalid.length} highlighted fields` });
      return;
    }
    placeOrder();
  });

  document.addEventListener('cart:change', render);
  render();
})();
