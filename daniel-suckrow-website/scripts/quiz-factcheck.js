/* „Fakt oder Fake" – swipe format for the quiz world.
   Statements are built from the existing, sourced question banks: a question paired with
   either its correct answer (Fakt) or one of its distractors (Fake). Results count for the
   weekly league via the existing 'veganiel:quiz-finished' event (key "Fakt oder Fake · <Stufe>"). */
(function (root) {
  'use strict';
  const ROUND = 10, SECONDS = 60, LEVELS = ['Leicht', 'Mittel', 'Schwer'];
  const KEY_PREFIX = 'Fakt oder Fake · ';

  function rng(seed) { let n = seed >>> 0; return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; }; }

  // Pure: pick ROUND unique questions and turn each into a true/false claim.
  function buildStatements(questions, seed, count = ROUND) {
    const random = rng(seed), seen = new Set();
    const pool = questions.filter(q => q && q.q && Array.isArray(q.a) && q.a.length > 1 && q.a[q.correct] && !seen.has(q.q) && seen.add(q.q));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const picked = pool.slice(0, count);
    // Balanced: half true, half false, in shuffled order
    const truths = picked.map((_, i) => i < Math.ceil(picked.length / 2));
    for (let i = truths.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [truths[i], truths[j]] = [truths[j], truths[i]]; }
    return picked.map((q, i) => {
      const wrong = q.a.filter((_, k) => k !== q.correct);
      const truth = truths[i];
      const claim = truth ? q.a[q.correct] : wrong[Math.floor(random() * wrong.length)];
      return { topic: q.topic || '', question: q.q, claim, truth, answer: q.a[q.correct], info: q.info || '', source: q.source || '' };
    });
  }
  function timeBonus(secondsLeft, points, total = ROUND) {
    const s = Math.max(0, Math.min(SECONDS, Math.floor(secondsLeft))), p = Math.max(0, Math.min(total, points));
    return Math.min(75, Math.floor(s * p / total));
  }
  const api = { buildStatements, timeBonus, KEY_PREFIX, LEVELS, ROUND, SECONDS, keys: LEVELS.map(l => KEY_PREFIX + l) };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.QuizFactcheck = api;

  // ───────────────────────────── Browser UI ─────────────────────────────
  const ui = root.VeganielQuizUI;
  if (!ui || !ui.banks || !root.document) return;
  const doc = root.document, $ = id => doc.getElementById(id);
  const reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WEEK_KEY = 'veganiel.factcheck.week';

  function weekStart() { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10); }
  function playedThisWeek() { try { const v = JSON.parse(localStorage.getItem(WEEK_KEY) || '{}'); return v.week === weekStart() && Array.isArray(v.levels) ? v.levels : []; } catch { return []; } }
  function markPlayed(level) { try { const levels = [...new Set([...playedThisWeek(), level])]; localStorage.setItem(WEEK_KEY, JSON.stringify({ week: weekStart(), levels })); } catch { /* storage optional */ } }
  function el(tag, cls, text) { const n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  // Feature card on the landing page
  const hub = doc.querySelector('.world-hub');
  const feature = el('section', 'factcheck-feature');
  feature.setAttribute('aria-labelledby', 'factcheck-title');
  feature.innerHTML =
    '<div class="fc-feature-copy">' +
      '<p class="world-kicker"><span class="fc-new">Neu</span> Fakt oder Fake · 60 Sekunden</p>' +
      '<h2 id="factcheck-title">Wisch dich<br><em>zur Wahrheit.</em></h2>' +
      '<p class="fc-feature-text">Zehn Aussagen, eine Minute. Wische nach rechts, wenn die Antwort stimmt – nach links, wenn sie ein Fake ist. Treffer in Serie bauen deine Combo auf, Tempo bringt Zeitbonus.</p>' +
      '<div class="fc-levels" role="group" aria-label="Stufe wählen"></div>' +
      '<p class="fc-league-note small">Zählt für die Wochen-Liga: dein erster Versuch pro Stufe und Woche – inklusive Zeitbonus.</p>' +
    '</div>' +
    '<div class="fc-demo" aria-hidden="true"><div class="fc-demo-card fc-demo-3"></div><div class="fc-demo-card fc-demo-2"></div>' +
      '<div class="fc-demo-card fc-demo-1"><span class="fc-demo-kicker">Stimmt das?</span><strong>Hülsenfrüchte liefern Protein.</strong><span class="fc-demo-stamp">Fakt</span></div>' +
      '<span class="fc-demo-hint fc-demo-left">← Fake</span><span class="fc-demo-hint fc-demo-right">Fakt →</span></div>';
  if (hub) hub.after(feature);
  const levelBox = feature.querySelector('.fc-levels');
  function renderLevels() {
    const played = playedThisWeek();
    levelBox.replaceChildren();
    LEVELS.forEach(level => {
      const b = el('button', 'fc-level-btn'); b.type = 'button';
      b.append(el('span', 'fc-level-name', level), el('small', null, played.includes(level) ? '✓ Diese Woche gewertet' : 'Für die Liga offen'));
      b.addEventListener('click', () => start(level));
      levelBox.append(b);
    });
  }
  renderLevels();

  // Game view
  const view = el('section', 'factcheck hidden');
  view.id = 'factcheck';
  view.setAttribute('aria-label', 'Fakt oder Fake');
  view.innerHTML =
    '<div class="fc-top"><button type="button" class="fc-quit">← Zurück</button><span class="fc-title"></span>' +
      '<span class="fc-clock" aria-live="off"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle class="fc-clock-ring" cx="22" cy="22" r="19"/></svg><b>60</b></span></div>' +
    '<div class="fc-meta"><span class="fc-count">1 / 10</span><span class="fc-points">0 Punkte</span><span class="fc-combo" aria-live="polite"></span></div>' +
    '<div class="fc-progress" aria-hidden="true"><i></i></div>' +
    '<div class="fc-play">' +
      '<div class="fc-stack"></div>' +
      '<div class="fc-actions"><button type="button" class="fc-btn fc-btn-fake" aria-label="Fake – die Antwort stimmt nicht"><span aria-hidden="true">✕</span> Fake</button>' +
      '<button type="button" class="fc-btn fc-btn-fact" aria-label="Fakt – die Antwort stimmt"><span aria-hidden="true">✓</span> Fakt</button></div>' +
      '<p class="fc-keys small">Tipp: Wischen, Buttons oder Pfeiltasten ← →</p>' +
      '<div class="fc-feedback" role="status" aria-live="polite"></div>' +
    '</div>' +
    '<div class="fc-result hidden"></div>';
  const anchor = $('quiz') || $('landing');
  if (anchor) anchor.after(view); else ($('main') || doc.body).append(view);

  const stack = view.querySelector('.fc-stack'), feedback = view.querySelector('.fc-feedback');
  const clockText = view.querySelector('.fc-clock b'), ring = view.querySelector('.fc-clock-ring');
  const playBox = view.querySelector('.fc-play'), resultBox = view.querySelector('.fc-result');
  let state = null, timer = null;

  function start(level) {
    stop();
    const pool = Object.entries(ui.banks[level] || {}).flatMap(([topic, qs]) => qs.map(q => ({ ...q, topic })));
    const seed = Math.floor(Math.random() * 4294967296);
    state = { level, items: buildStatements(pool, seed), index: 0, points: 0, combo: 0, bestCombo: 0, answers: [], seconds: SECONDS, done: false, locked: false };
    $('landing')?.classList.add('hidden'); $('quiz')?.classList.add('hidden');
    view.classList.remove('hidden', 'is-finished'); playBox.classList.remove('hidden'); resultBox.classList.add('hidden');
    view.querySelector('.fc-title').textContent = 'Fakt oder Fake · ' + level;
    feedback.textContent = ''; updateMeta(); renderStack(); tickClock();
    timer = setInterval(() => { state.seconds--; tickClock(); if (state.seconds <= 0) finish(true); }, 1000);
    root.scrollTo({ top: 0, behavior: 'instant' });
    stack.querySelector('.fc-card')?.focus({ preventScroll: true });
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function tickClock() {
    const s = Math.max(0, state.seconds); clockText.textContent = String(s);
    ring.style.strokeDashoffset = String(119.4 * (1 - s / SECONDS));
    view.querySelector('.fc-clock').classList.toggle('is-urgent', s <= 10);
  }
  function updateMeta() {
    view.querySelector('.fc-count').textContent = Math.min(state.index + 1, ROUND) + ' / ' + state.items.length;
    view.querySelector('.fc-points').textContent = state.points + ' ' + (state.points === 1 ? 'Punkt' : 'Punkte');
    const combo = view.querySelector('.fc-combo');
    combo.textContent = state.combo >= 2 ? 'Combo ×' + state.combo : '';
    combo.classList.remove('is-pop'); void combo.offsetWidth; if (state.combo >= 2) combo.classList.add('is-pop');
    view.querySelector('.fc-progress i').style.width = (state.index / state.items.length * 100) + '%';
  }
  function card(item, depth) {
    const c = el('article', 'fc-card'); c.dataset.depth = String(depth);
    if (depth === 0) { c.tabIndex = 0; c.setAttribute('aria-label', 'Aktuelle Aussage'); }
    c.append(el('span', 'fc-card-topic', item.topic), el('p', 'fc-card-question', item.question), el('span', 'fc-card-label', 'Antwort'), el('strong', 'fc-card-claim', item.claim),
      el('span', 'fc-stamp fc-stamp-fact', 'Fakt'), el('span', 'fc-stamp fc-stamp-fake', 'Fake'));
    return c;
  }
  function renderStack() {
    stack.replaceChildren();
    const rest = state.items.slice(state.index, state.index + 3);
    rest.slice().reverse().forEach((item, i) => stack.append(card(item, rest.length - 1 - i)));
    const top = stack.lastElementChild; if (top) bindDrag(top);
  }
  function bindDrag(c) {
    let startX = 0, startY = 0, dx = 0, dragging = false, id = null;
    c.addEventListener('pointerdown', e => { if (state.locked) return; dragging = true; id = e.pointerId; startX = e.clientX; startY = e.clientY; dx = 0; c.setPointerCapture(id); c.classList.add('is-dragging'); });
    c.addEventListener('pointermove', e => {
      if (!dragging) return; dx = e.clientX - startX; const dy = (e.clientY - startY) * 0.25;
      c.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + dx / 18 + 'deg)';
      c.style.setProperty('--fact', String(Math.max(0, Math.min(1, dx / 120))));
      c.style.setProperty('--fake', String(Math.max(0, Math.min(1, -dx / 120))));
    });
    const end = () => {
      if (!dragging) return; dragging = false; c.classList.remove('is-dragging');
      if (Math.abs(dx) > 110) decide(dx > 0); else { c.style.transform = ''; c.style.setProperty('--fact', '0'); c.style.setProperty('--fake', '0'); }
    };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  }
  function decide(saysTrue) {
    if (!state || state.done || state.locked) return;
    const item = state.items[state.index], correct = saysTrue === item.truth, top = stack.lastElementChild;
    state.locked = true; state.answers.push({ ...item, saysTrue, correct });
    if (correct) { state.points++; state.combo++; state.bestCombo = Math.max(state.bestCombo, state.combo); } else state.combo = 0;
    feedback.className = 'fc-feedback ' + (correct ? 'is-right' : 'is-wrong');
    feedback.replaceChildren(el('strong', null, correct ? '✓ Richtig!' : '✕ Daneben.'), doc.createTextNode(' '),
      el('span', null, item.truth ? 'Die Antwort stimmt:' : 'Das war ein Fake. Richtig ist:'), doc.createTextNode(' '), el('em', null, item.truth ? item.claim : item.answer));
    if (top) {
      top.classList.add(saysTrue ? 'fly-right' : 'fly-left', correct ? 'was-right' : 'was-wrong');
      top.style.transform = '';
    }
    const next = () => { if (!state || state.done) return; state.index++; state.locked = false; updateMeta(); if (state.index >= state.items.length) finish(false); else { renderStack(); stack.lastElementChild?.focus({ preventScroll: true }); } };
    setTimeout(next, reduced ? 60 : 380);
  }
  function finish(timedOut) {
    if (!state || state.done) return; state.done = true; stop(); view.classList.add('is-finished');
    const secondsLeft = timedOut ? 0 : Math.max(0, state.seconds);
    const bonus = timeBonus(secondsLeft, state.points), key = KEY_PREFIX + state.level;
    const alreadyCounted = playedThisWeek().includes(state.level);
    ui.profile?.recordFactcheck(state.points, state.bestCombo); ui.updateGameLab?.(); markPlayed(state.level); renderLevels();
    root.dispatchEvent(new CustomEvent('veganiel:quiz-finished', { detail: { key, score: state.points, timeBonus: bonus } }));
    if (state.points === state.items.length) root.VeganielFX?.confetti();
    playBox.classList.add('hidden'); resultBox.classList.remove('hidden'); resultBox.replaceChildren();
    const head = el('div', 'fc-result-head');
    const scoreRing = el('div', 'fc-score'); scoreRing.style.setProperty('--p', String(state.points / state.items.length));
    scoreRing.append(el('strong', 'fc-score-num', state.points + ' / ' + state.items.length), el('span', null, 'Treffer'));
    const copy = el('div', 'fc-result-copy');
    copy.append(el('p', 'world-kicker', timedOut ? 'Zeit abgelaufen' : 'Runde geschafft'),
      el('h2', null, state.points === state.items.length ? 'Makellos. Kein Fake kommt an dir vorbei.' : state.points >= 7 ? 'Starker Faktenblick!' : state.points >= 4 ? 'Gute Runde – da geht noch mehr.' : 'Jede Runde schärft den Blick.'));
    const stats = el('ul', 'fc-stats');
    [['Zeitbonus', '+' + bonus], ['Liga-Punkte', String(state.points + bonus)], ['Beste Combo', '×' + state.bestCombo]].forEach(([k, v]) => { const li = el('li'); li.append(el('span', null, k), el('strong', null, v)); stats.append(li); });
    copy.append(stats, el('p', 'small fc-result-note', alreadyCounted ? 'Für die Liga zählt dein erster Versuch dieser Woche auf dieser Stufe. Diese Runde bringt dir trotzdem XP.' : 'Mit Anmeldung und Liga-Teilnahme zählt diese Runde für die Wochen-Liga. XP sammelst du in jedem Fall.'));
    const actions = el('div', 'fc-result-actions');
    const again = el('button', 'btn', 'Neue Runde ↻'); again.type = 'button'; again.addEventListener('click', () => start(state.level));
    const other = el('button', 'btn secondary', 'Zur Quizwelt'); other.type = 'button'; other.addEventListener('click', quit);
    actions.append(again, other); copy.append(actions);
    head.append(scoreRing, copy); resultBox.append(head);
    const review = el('div', 'fc-review'); review.append(el('h3', null, 'Alle Aussagen im Überblick'));
    state.answers.forEach(a => {
      const d = el('details', 'fc-review-item ' + (a.correct ? 'is-right' : 'is-wrong'));
      const s = el('summary'), text = el('span');
      text.append(el('span', null, a.question), doc.createTextNode(' → '), el('em', null, a.claim));
      s.append(el('span', 'fc-review-mark', a.correct ? '✓' : '✕'), text);
      const p = el('p');
      p.append(el('strong', null, a.truth ? 'Fakt.' : 'Fake.'), doc.createTextNode(' '));
      if (!a.truth) p.append(el('span', null, 'Richtig ist:'), doc.createTextNode(' '), el('em', null, a.answer), doc.createTextNode(' · '));
      p.append(el('span', null, a.info));
      d.append(s, p);
      if (a.source) { const link = el('a', null, 'Quelle ansehen ↗'); link.href = a.source; link.target = '_blank'; link.rel = 'noopener noreferrer'; d.append(link); }
      review.append(d);
    });
    const missed = state.items.length - state.answers.length;
    if (missed > 0) { const note = el('p', 'small'); note.append(el('strong', null, String(missed)), doc.createTextNode(' '), el('span', null, 'Aussagen nicht mehr geschafft – beim nächsten Mal bringt Tempo mehr Zeitbonus.')); review.append(note); }
    resultBox.append(review);
    root.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
  function quit() { stop(); state = null; view.classList.add('hidden'); $('landing')?.classList.remove('hidden'); feature.scrollIntoView({ block: 'start' }); }
  view.querySelector('.fc-quit').addEventListener('click', quit);
  view.querySelector('.fc-btn-fact').addEventListener('click', () => decide(true));
  view.querySelector('.fc-btn-fake').addEventListener('click', () => decide(false));
  doc.addEventListener('keydown', e => {
    if (view.classList.contains('hidden') || !state || state.done) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); decide(true); } else if (e.key === 'ArrowLeft') { e.preventDefault(); decide(false); }
  });
  root.VeganielFactcheck = { start };
})(typeof window !== 'undefined' ? window : globalThis);
