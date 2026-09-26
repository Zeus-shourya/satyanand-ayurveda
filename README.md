# Satyanand Ayurveda — online store

A fast, static e-commerce storefront for **Satyanand Ayurveda**, modelled on the
structure of maharishiayurvedaindia.com and built in the brand palette
(`#7AC74F` `#A1CF6B` `#D5D887` `#E0C879` `#054A29`).

Plain HTML / CSS / JS — **no build step, no framework, no server**. Drop the folder
on any static host and it runs.

---

## Before launch — the checklist

1. **WhatsApp number** — `assets/js/config.js` → `whatsapp: '91XXXXXXXXXX'`.
   Orders, consultations, the floating chat button and the footer CTA all use it.
   Until it is set, those buttons are hidden and checkout shows a "copy order" fallback.
2. **Phone / email** — same file. They appear in the footer only when filled in.
3. **Products & prices** — `assets/js/catalog.js`. Every product, price, pack size,
   description and ingredient list there is **placeholder copy** written for the design.
   Replace with the real label text.
4. **Real product photos** (optional) — add `image: 'assets/img/products/name.jpg'`
   (square, ~800×800) to a product. Without it the site draws a branded pack illustration.
5. **Claims to confirm with the owner** — "Vaidya-guided" / consultations, "small-batch",
   "carefully sourced herbs", the process on `about.html`, the returns window and delivery
   times on `policies.html`. Remove anything that isn't true for the business.
6. **Policies** — `policies.html` is template text; have the owner (and ideally a lawyer) review it.
7. **Social preview** — once the domain is known, change `og:image` in each page's `<head>`
   to the absolute URL (`https://yourdomain/assets/img/og-image.jpg`) so WhatsApp and
   Facebook show the logo card when a link is shared.

---

## Hosting (important)

**Don't use GitHub Pages for the live shop.** GitHub's terms don't allow Pages to be used
for sites whose primary purpose is e-commerce, and it has soft bandwidth limits. It's fine
for a client preview link.

For production use **Cloudflare Pages** (free, unlimited bandwidth, global CDN) or Netlify:
connect the repo or drag the folder in, no build command, output directory = root.
The `_headers` file in this folder sets CDN caching and security headers on both.

### Why it holds up under heavy traffic

- **Nothing to overload.** Every page is a static file served from CDN edge caches — there
  is no application server or database in the request path, so 10 visitors and 100,000
  cost the same to serve.
- **Small pages.** HTML + CSS + JS for a page is ~200 KB uncompressed (~50 KB gzipped).
  Product images are drawn in the browser, so a catalogue page makes no image requests.
- **Cheap in the browser.** Measured with a synthetic 4,000-product catalogue: search
  < 1 ms, filter + sort 0.3 ms, rendering a page of cards ~5 ms. Only one page of 12
  products is in the DOM at a time; "Load more" appends rather than re-rendering.
  All clicks go through a handful of delegated listeners; scroll work is batched per frame.
- **Cached.** CSS/JS are cached for a day and images for 30 days at the edge and in the
  browser (see `_headers`). Asset URLs carry `?v=1` — bump it in the HTML after changing
  CSS/JS so returning visitors get the new files.

### What a static store can't do (yet)

There is no backend, so: orders arrive as WhatsApp messages (the customer presses Send),
payment for prepaid orders is a UPI link you send back, and stock isn't decremented
automatically. Coupons are checked in the browser and should be re-checked when an order
arrives. When order volume outgrows WhatsApp, the natural next step is a payment gateway
(Razorpay) with a small serverless function, or moving the catalogue to Shopify.

---

## Run it locally

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:4351>. (`serve.ps1` is a dev convenience only — don't deploy it.)

---

## Structure

```
satyanand-ayurveda/
├── index.html          home — hero slider, categories, rails, consult, dosha, story
├── shop.html           listing — search, faceted filters, sort, load more (URL-driven)
├── product.html        product page — ?id=<product-id>&v=<variant-id>
├── checkout.html       checkout → WhatsApp order
├── dosha-quiz.html     10-question prakriti quiz with matched products
├── consult.html        Vaidya consultation request → WhatsApp
├── about.html          brand story & emblem meaning
├── policies.html       shipping, returns, privacy, terms, disclaimer
├── 404.html
├── _headers            CDN cache + security headers (Cloudflare Pages / Netlify)
├── site.webmanifest, robots.txt, .nojekyll
└── assets/
    ├── css/style.css   design tokens, components, responsive, reduced-motion
    ├── img/            logo cut-outs, favicons, share image
    └── js/
        ├── config.js   ← store settings: WhatsApp, shipping, coupons
        ├── catalog.js  ← categories + products
        ├── packshot.js pack illustrations (bottle, jar, pouch, tube …)
        ├── store.js    cart, drawer, search, cards, toasts — every page
        └── home.js, shop.js, product.js, checkout.js, quiz.js
```

### Editing the header / footer

The header, menu and footer are repeated in each HTML file (so pages work and index well
without JavaScript). If you change a nav link, change it in all nine pages.

### Cart and data

The cart, saved checkout details, recent orders, recently viewed products and quiz result
live in the visitor's own browser (`localStorage`). Nothing is sent anywhere until the
customer sends the WhatsApp message.
