/* =====================================================================
   SATYANAND AYURVEDA — home page
   Hero slideshow (autoplay with pause, dots, arrows, swipe) and the
   "Product highlights" tabs.
   ===================================================================== */
(function () {
  'use strict';

  const S = window.Satyanand;
  const { $, $$ } = S;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     HERO
     ================================================================ */
  const hero = $('[data-hero]');
  if (hero) {
    const track = $('[data-hero-track]', hero);
    const viewport = $('.hero__viewport', hero);
    const slides = $$('.slide', track);
    const dotsBox = $('[data-hero-dots]', hero);
    const pauseBtn = $('[data-hero-pause]', hero);
    const PAUSE_ICON = pauseBtn.innerHTML;
    const PLAY_ICON = '<svg class="i" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5L8 5.5Z"/></svg>';
    const DELAY = 6500;

    let index = 0;
    let timer = 0;
    let playing = !reduced;
    let hovered = false;
    let focused = false;

    dotsBox.innerHTML = slides.map((_, i) =>
      `<button type="button" class="hero__dot" aria-label="Show slide ${i + 1} of ${slides.length}"></button>`).join('');
    const dots = $$('.hero__dot', dotsBox);

    function schedule() {
      clearTimeout(timer);
      if (playing && !hovered && !focused && !document.hidden) timer = setTimeout(() => go(index + 1), DELAY);
    }

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      slides.forEach((s, n) => {
        const active = n === index;
        s.inert = !active;
        s.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((d, n) => d.setAttribute('aria-current', String(n === index)));
      hero.classList.toggle('is-dark', slides[index].classList.contains('on-dark'));
      schedule();
    }

    function setPlaying(on) {
      playing = on;
      pauseBtn.innerHTML = on ? PAUSE_ICON : PLAY_ICON;
      pauseBtn.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
      schedule();
    }

    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    $('[data-hero-prev]', hero).addEventListener('click', () => go(index - 1));
    $('[data-hero-next]', hero).addEventListener('click', () => go(index + 1));
    pauseBtn.addEventListener('click', () => setPlaying(!playing));

    hero.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    hero.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    hero.addEventListener('focusin', () => { focused = true; schedule(); });
    hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) { focused = false; schedule(); } });
    document.addEventListener('visibilitychange', schedule);

    /* Swipe on touch screens. Vertical drags are left to the page scroll. */
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let tracking = false;
    let swiped = false;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      tracking = true; swiped = false; dx = 0;
      startX = e.clientX; startY = e.clientY;
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!tracking) return;
      dx = e.clientX - startX;
      if (!track.classList.contains('is-dragging')) {
        if (Math.abs(e.clientY - startY) > Math.abs(dx)) { tracking = false; return; }
        if (Math.abs(dx) < 8) return;
        track.classList.add('is-dragging');
      }
      track.style.transform = `translateX(calc(${-index * 100}% + ${dx}px))`;
    });
    const endSwipe = () => {
      if (!tracking) return;
      tracking = false;
      if (!track.classList.contains('is-dragging')) return;
      track.classList.remove('is-dragging');
      swiped = Math.abs(dx) > 10;
      go(Math.abs(dx) > 50 ? index + (dx < 0 ? 1 : -1) : index);
    };
    viewport.addEventListener('pointerup', endSwipe);
    viewport.addEventListener('pointercancel', endSwipe);
    // A swipe that ends over a link must not also follow the link.
    viewport.addEventListener('click', (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true);

    setPlaying(playing);
    go(0);
  }

  /* ================================================================
     HIGHLIGHT TABS (WAI-ARIA tabs pattern)
     ================================================================ */
  const tablist = $('[data-tabs]');
  if (tablist) {
    const tabs = $$('[role="tab"]', tablist);
    const panel = document.getElementById(tabs[0].getAttribute('aria-controls'));
    const rail = panel.closest('[data-rail]');

    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      S.renderProducts(panel, S.select(tab.dataset.tab, { limit: 12 }));
      panel.scrollLeft = 0;
      S.initRails(rail);
      if (focus) tab.focus();
    };

    tablist.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab && tab.getAttribute('aria-selected') !== 'true') select(tab);
    });
    tablist.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], true);
    });
  }
})();
