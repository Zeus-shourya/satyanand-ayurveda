/* =====================================================================
   SATYANAND AYURVEDA — dosha (prakriti) quiz
   Ten questions → vata / pitta / kapha balance → tips + product picks.
   ===================================================================== */
(function () {
  'use strict';

  const S = window.Satyanand;
  const { $, esc } = S;
  const RESULT_KEY = 'satyanand.dosha.v1';

  /* Each option is written as [vata, pitta, kapha]. */
  const QUESTIONS = [
    { q: 'How would you describe your body frame?', a: [
      ['Slim and light', 'I find it hard to put on weight'],
      ['Medium and athletic', 'I gain or lose weight fairly easily'],
      ['Broad and solid', 'I put on weight easily and lose it slowly']] },
    { q: 'What is your skin usually like?', a: [
      ['Dry, thin and cool', 'Gets rough or flaky, especially in winter'],
      ['Warm and sensitive', 'Prone to redness, rashes or breakouts'],
      ['Smooth, thick and soft', 'Slightly oily, rarely troubled']] },
    { q: 'And your hair?', a: [
      ['Dry, frizzy or thin', 'Tangles and splits easily'],
      ['Fine and straight', 'Early greying or thinning runs in the family'],
      ['Thick, wavy and lustrous', 'Heavy, with plenty of volume']] },
    { q: 'How is your appetite?', a: [
      ['Irregular', 'Sometimes ravenous, sometimes not hungry at all'],
      ['Strong and sharp', 'I get irritable if I miss a meal'],
      ['Steady but mild', 'I can skip a meal without much trouble']] },
    { q: 'How does your digestion usually behave?', a: [
      ['Gas and bloating', 'I tend towards constipation'],
      ['Quick and intense', 'Prone to acidity, heartburn or loose motions'],
      ['Slow and heavy', 'I feel sluggish after eating']] },
    { q: 'How do you sleep?', a: [
      ['Lightly', 'Easily disturbed; I often wake in the night'],
      ['Moderately well', 'Sound, but I sleep less when stressed or busy'],
      ['Deeply and long', 'I find it hard to get up in the morning']] },
    { q: 'Under pressure, you tend to become…', a: [
      ['Anxious and restless', 'My mind races and I worry'],
      ['Irritable and impatient', 'I get critical or short-tempered'],
      ['Withdrawn', 'I go quiet and avoid dealing with it']] },
    { q: 'Which weather bothers you most?', a: [
      ['Cold and windy', 'I’m always reaching for another layer'],
      ['Hot and humid', 'Heat makes me uncomfortable and cranky'],
      ['Cold and damp', 'Grey, rainy days make me feel heavy']] },
    { q: 'How is your energy through the day?', a: [
      ['In quick bursts', 'Lots of enthusiasm, then I tire suddenly'],
      ['Focused and driven', 'I like goals, plans and a bit of competition'],
      ['Slow and steady', 'Slow to start, but I have great stamina']] },
    { q: 'How do you learn and remember?', a: [
      ['Learn fast, forget fast', 'I grasp ideas quickly but they don’t stick'],
      ['Sharp and precise', 'I remember what I understand clearly'],
      ['Slow but lasting', 'It takes time to learn, but I never forget']] }
  ];
  const DOSHAS = ['vata', 'pitta', 'kapha'];

  const PROFILES = {
    vata: {
      name: 'Vata', element: 'air + space',
      summary: 'You are creative, quick-thinking and full of ideas. When vata runs high you may notice dryness, restlessness, irregular digestion and light sleep — so warmth, routine and nourishment are your best friends.',
      tips: [
        ['Eat warm and moist', 'Favour cooked meals, soups, stews and a little ghee over cold, raw and dry food.'],
        ['Keep a rhythm', 'Wake, eat and sleep at the same times each day — routine calms vata.'],
        ['Oil daily', 'A warm sesame-oil abhyanga before your bath grounds body and mind.'],
        ['Stay warm', 'Avoid cold drinks and wind; sip warm water or ginger tea through the day.']]
    },
    pitta: {
      name: 'Pitta', element: 'fire + water',
      summary: 'You are focused, ambitious and sharp, with strong digestion. When pitta runs high it shows up as acidity, irritability, skin flare-ups and overheating — so cooling, calming choices keep you balanced.',
      tips: [
        ['Choose cooling foods', 'Cucumber, coconut, sweet fruits, leafy greens and a little ghee.'],
        ['Go easy on heat', 'Limit chillies, fried food, sour pickles, alcohol and too much caffeine.'],
        ['Avoid the midday sun', 'Exercise in the cooler hours and take breaks when you overheat.'],
        ['Soften the edges', 'Moonlit walks, swimming and cooling breathwork like sheetali pranayama.']]
    },
    kapha: {
      name: 'Kapha', element: 'earth + water',
      summary: 'You are calm, steady and loyal, with natural strength and stamina. When kapha builds up it can feel like sluggishness, congestion and weight gain — so lightness, warmth and movement bring you back.',
      tips: [
        ['Eat light and spiced', 'Warm, lightly cooked meals with ginger, black pepper and bitter greens.'],
        ['Move every day', 'Brisk walks, sun salutations or anything that raises a light sweat.'],
        ['Rise early', 'Wake before 6 am and skip daytime naps — both keep kapha from settling.'],
        ['Cut the heavy stuff', 'Go easy on sweets, dairy, fried food and cold drinks.']]
    }
  };

  const root = $('[data-quiz]');
  const picks = $('[data-quiz-products]');
  const answers = new Array(QUESTIONS.length).fill(null);
  let step = 0;

  /* Rotate option order per question so the "first answer" isn't always vata. */
  const order = (i) => [0, 1, 2].map((n) => (n + i) % 3);

  function renderQuestion(moveFocus) {
    const Q = QUESTIONS[step];
    const pct = Math.round((step / QUESTIONS.length) * 100);
    root.innerHTML =
      `<div class="quiz__top"><span>Question ${step + 1} of ${QUESTIONS.length}</span>` +
        (step ? '<button class="btn btn--ghost btn--sm" type="button" data-restart>Start over</button>' : '') + `</div>` +
      `<div class="meter" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>` +
      `<form class="q" data-q>` +
        `<fieldset>` +
          `<legend><span tabindex="-1" data-q-title>${esc(Q.q)}</span></legend>` +
          `<div class="q-opts">${order(step).map((d) =>
            `<label class="q-opt"><input type="radio" name="answer" value="${DOSHAS[d]}"${answers[step] === DOSHAS[d] ? ' checked' : ''} required>` +
            `<span class="q-opt__mark" aria-hidden="true"></span>` +
            `<span class="q-opt__text"><b>${esc(Q.a[d][0])}</b><span>${esc(Q.a[d][1])}</span></span></label>`).join('')}</div>` +
        `</fieldset>` +
        `<div class="quiz__nav">` +
          `<button class="btn btn--outline" type="button" data-back${step ? '' : ' disabled'}>Back</button>` +
          `<button class="btn btn--primary" type="submit" data-next${answers[step] ? '' : ' disabled'}>${step === QUESTIONS.length - 1 ? 'See my result' : 'Next'}</button>` +
        `</div>` +
      `</form>`;
    if (moveFocus) $('[data-q-title]', root).focus();
  }

  function score() {
    const counts = { vata: 0, pitta: 0, kapha: 0 };
    answers.forEach((a) => { if (a) counts[a] += 1; });
    const total = answers.filter(Boolean).length || 1;
    const pct = {};
    DOSHAS.forEach((d) => { pct[d] = Math.round((counts[d] / total) * 100); });
    // Rounding can drift a point off 100 — give the difference to the largest.
    const top = DOSHAS.slice().sort((a, b) => counts[b] - counts[a]);
    pct[top[0]] += 100 - DOSHAS.reduce((n, d) => n + pct[d], 0);
    return pct;
  }

  function renderResult(pct, moveFocus) {
    const ranked = DOSHAS.slice().sort((a, b) => pct[b] - pct[a]);
    const [first, second] = ranked;
    const dual = pct[first] - pct[second] <= 10;
    const P = PROFILES[first];
    const title = dual ? `${PROFILES[first].name}–${PROFILES[second].name}` : P.name;

    root.innerHTML =
      `<div class="result">` +
        `<div class="result__head">` +
          `<span class="eyebrow">Your prakriti</span>` +
          `<h2 class="h1" tabindex="-1" data-result-title>You are <em>${esc(title)}</em>${dual ? '' : ' dominant'}</h2>` +
          `<p class="lead">${esc(P.summary)}${dual ? ` With ${PROFILES[second].name.toLowerCase()} close behind, you’ll recognise some of its traits too.` : ''}</p>` +
        `</div>` +
        `<div class="panel bars">${ranked.map((d) =>
          `<div class="bar bar--${d}"><div class="bar__label"><span>${PROFILES[d].name} <small class="muted">· ${PROFILES[d].element}</small></span><span>${pct[d]}%</span></div>` +
          `<div class="bar__track"><div class="bar__fill" style="width:${pct[d]}%"></div></div></div>`).join('')}</div>` +
        `<div style="display:grid;gap:14px"><h3 class="h3">Daily tips for ${esc(P.name.toLowerCase())}</h3>` +
          `<div class="tips">${P.tips.map((t) => `<div class="tip"><b>${esc(t[0])}</b>${esc(t[1])}</div>`).join('')}</div></div>` +
        `<div class="slide__ctas" style="justify-content:center">` +
          `<button class="btn btn--outline btn--lg" type="button" data-restart>Retake the quiz</button>` +
          `<a class="btn btn--primary btn--lg" href="consult.html">Talk to a Vaidya</a>` +
        `</div>` +
        `<p class="fine" style="text-align:center">This quiz is a general guide, not a diagnosis. A Vaidya can assess your prakriti and any current imbalance (vikriti) in detail.</p>` +
      `</div>`;
    if (moveFocus) $('[data-result-title]', root).focus();

    // Products that suit the dominant dosha — specialists first, then bestsellers.
    const list = S.products
      .filter((p) => p.dosha.includes(first) && S.isInStock(p))
      .map((p) => ({ p, s: (p.dosha.length === 1 ? 2 : p.dosha.length === 2 ? 1 : 0) + (p.badges.includes('bestseller') ? 1.5 : 0) + (dual && p.dosha.includes(second) ? 0.5 : 0) }))
      .sort((a, b) => b.s - a.s || a.p.rank - b.p.rank)
      .slice(0, 10)
      .map((x) => x.p);
    $('[data-qp-title]').textContent = `Picked for ${title}`;
    S.renderProducts($('[data-qp]'), list);
    picks.hidden = false;
    S.initRails(picks);
  }

  function restart() {
    answers.fill(null);
    step = 0;
    S.store.remove(RESULT_KEY);
    picks.hidden = true;
    renderQuestion(true);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  root.addEventListener('change', (e) => {
    if (e.target.name !== 'answer') return;
    answers[step] = e.target.value;
    $('[data-next]', root).disabled = false;
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!answers[step]) return;
    if (step < QUESTIONS.length - 1) { step += 1; renderQuestion(true); return; }
    const pct = score();
    S.store.set(RESULT_KEY, { pct, at: new Date().toISOString() });
    renderResult(pct, true);
  });

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]') && step > 0) { step -= 1; renderQuestion(true); }
    else if (e.target.closest('[data-restart]')) restart();
  });

  const saved = S.store.get(RESULT_KEY, null);
  const valid = saved && saved.pct && DOSHAS.every((d) => Number.isFinite(saved.pct[d]));
  if (valid) renderResult(saved.pct, false);
  else renderQuestion(false);
})();
