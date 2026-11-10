/* Quiz world effects: confetti, unlock toasts, XP gains, score count-up and staged entrances.
   Purely presentational – it observes the existing UI and never changes game state. */
(() => {
  'use strict';
  const doc = document, $ = id => doc.getElementById(id);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Confetti ─────────────────────────────────────────────────────────────
  let canvas, ctx, parts = [], raf = null;
  function confetti(x = innerWidth / 2, y = innerHeight * 0.32, count = 150) {
    if (reduced) return;
    if (!canvas) { canvas = doc.createElement('canvas'); canvas.className = 'fx-confetti'; canvas.setAttribute('aria-hidden', 'true'); doc.body.append(canvas); ctx = canvas.getContext('2d'); }
    const dpr = Math.min(2, devicePixelRatio || 1); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ['#d6e99d', '#214a37', '#b08d47', '#c7bddc', '#e7a27a', '#f8f5e8'];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 10;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 7, g: .26 + Math.random() * .12, w: 6 + Math.random() * 7, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .35, c: colors[i % colors.length], life: 0, max: 90 + Math.random() * 60 });
    }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life < p.max);
    for (const p of parts) {
      p.life++; p.vx *= .985; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - p.life / p.max); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(step); else { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = null; }
  }

  // ── Toasts ───────────────────────────────────────────────────────────────
  let toastBox;
  function toast(title, text, icon = '✦') {
    if (!toastBox) { toastBox = doc.createElement('div'); toastBox.className = 'fx-toasts'; toastBox.setAttribute('role', 'status'); toastBox.setAttribute('aria-live', 'polite'); doc.body.append(toastBox); }
    const n = doc.createElement('div'); n.className = 'fx-toast';
    const i = doc.createElement('span'); i.className = 'fx-toast-icon'; i.setAttribute('aria-hidden', 'true'); i.textContent = icon;
    const body = doc.createElement('div'); const s = doc.createElement('strong'); s.textContent = title; const p = doc.createElement('p'); p.textContent = text; body.append(s, p);
    n.append(i, body); toastBox.append(n);
    setTimeout(() => n.classList.add('is-leaving'), 4600); setTimeout(() => n.remove(), 5200);
  }
  window.VeganielFX = { confetti, toast };

  const firstNumber = text => { const m = String(text || '').match(/\d+/); return m ? Number(m[0]) : null; };

  // ── XP gains and level-ups ───────────────────────────────────────────────
  const xpNode = $('player-xp'), levelNode = $('player-level'), playerCard = doc.querySelector('.player-card');
  let lastXp = firstNumber(xpNode?.textContent), lastLevel = levelNode?.textContent || '';
  if (xpNode && playerCard) new MutationObserver(() => {
    const xp = firstNumber(xpNode.textContent);
    if (xp !== null && lastXp !== null && xp > lastXp) {
      const chip = doc.createElement('span'); chip.className = 'fx-xp-gain'; chip.textContent = '+' + (xp - lastXp) + ' XP'; chip.setAttribute('aria-hidden', 'true');
      playerCard.append(chip); setTimeout(() => chip.remove(), 1800);
      playerCard.classList.remove('fx-pulse'); void playerCard.offsetWidth; playerCard.classList.add('fx-pulse');
    }
    if (xp !== null) lastXp = xp;
  }).observe(xpNode, { childList: true, characterData: true, subtree: true });
  if (levelNode) new MutationObserver(() => {
    const now = levelNode.textContent;
    if (lastLevel && now && now !== lastLevel && (firstNumber(xpNode?.textContent) || 0) > 0) { toast('Level aufgestiegen!', 'Du bist jetzt ' + now + '.', '✦'); confetti(); }
    lastLevel = now;
  }).observe(levelNode, { childList: true, characterData: true, subtree: true });

  // ── Badge unlocks (keyed by grid + position, so language switches don't re-trigger) ──
  const KNOWN = 'veganiel.quiz-fx.earned';
  let known = null; try { const raw = localStorage.getItem(KNOWN); known = raw ? new Set(JSON.parse(raw)) : null; } catch { known = null; }
  function scanBadges() {
    const earned = [];
    ['badges', 'game-badges'].forEach(id => { const grid = $(id); if (!grid) return; [...grid.children].forEach((card, i) => { if (card.classList.contains('earned')) earned.push({ key: id + ':' + i, card }); }); });
    if (known === null) { known = new Set(earned.map(e => e.key)); save(); return; }
    const fresh = earned.filter(e => !known.has(e.key));
    fresh.forEach((e, n) => {
      known.add(e.key); e.card.classList.add('is-new');
      setTimeout(() => toast('Abzeichen freigeschaltet', e.card.querySelector('h3')?.textContent || '', e.card.querySelector('.badge-icon')?.textContent || '✦'), n * 700);
    });
    if (fresh.length) { confetti(); save(); }
  }
  function save() { try { localStorage.setItem(KNOWN, JSON.stringify([...known])); } catch { /* optional */ } }
  let badgeTimer = null;
  const badgeObserver = new MutationObserver(() => { clearTimeout(badgeTimer); badgeTimer = setTimeout(scanBadges, 120); });
  ['badges'].forEach(id => $(id) && badgeObserver.observe($(id), { childList: true }));
  const watchGameBadges = () => { const g = $('game-badges'); if (g && !g.dataset.fxWatched) { g.dataset.fxWatched = '1'; badgeObserver.observe(g, { childList: true }); } };
  watchGameBadges(); setTimeout(() => { watchGameBadges(); scanBadges(); }, 400);

  // ── Classic quiz: question entrance + result count-up / confetti ─────────
  const question = $('question'), questionView = $('questionView');
  if (question && questionView) new MutationObserver(() => {
    questionView.classList.remove('fx-enter'); void questionView.offsetWidth; questionView.classList.add('fx-enter');
  }).observe(question, { childList: true, characterData: true, subtree: true });
  // Count-up: our own intermediate writes are recognised and ignored, the final value always lands.
  const score = $('score'), written = new Set(); let run = 0;
  if (score) new MutationObserver(() => {
    const text = score.textContent;
    if (written.has(text)) { written.delete(text); return; }
    const m = text.match(/^(\d+)\s*\/\s*(\d+)$/); if (!m) return;
    const value = Number(m[1]), total = Number(m[2]), id = ++run;
    if (value === total && total > 0) setTimeout(() => confetti(), 250);
    if (reduced || value === 0) return;
    const t0 = performance.now(), d = 900;
    const write = v => { const s = v + ' / ' + total; if (score.textContent !== s) { written.add(s); score.textContent = s; } };
    const frame = now => { if (id !== run) return; const k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3); write(k < 1 ? Math.round(value * e) : value); if (k < 1) requestAnimationFrame(frame); };
    write(0); requestAnimationFrame(frame);
    setTimeout(() => { if (id === run) write(value); }, d + 400); // safety net
  }).observe(score, { childList: true, characterData: true, subtree: true });

  // ── Staggered entrances for re-rendered lists ────────────────────────────
  const stagger = (node, step) => node && new MutationObserver(() => { [...node.children].forEach((c, i) => c.style.setProperty('--fx-i', String(Math.min(i, 14) * step))); }).observe(node, { childList: true });
  stagger($('topics'), 35); stagger($('weekly-leaders'), 80); stagger($('leaderboard-history'), 90);
  [...($('topics')?.children || [])].forEach((c, i) => c.style.setProperty('--fx-i', String(Math.min(i, 14) * 35)));

  // ── Reveal sections on scroll ────────────────────────────────────────────
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('fx-visible'); io.unobserve(e.target); } }), { threshold: .12 });
    doc.querySelectorAll('.world-hub article, .factcheck-feature, .game-lab article, .leaderboard-panel, .quiz-progress-card').forEach(n => {
      if (n.getBoundingClientRect().top < innerHeight) return; n.classList.add('fx-reveal'); io.observe(n);
    });
    // Safety nets: never leave content hidden, even if the observer does not fire
    const sweep = () => doc.querySelectorAll('.fx-reveal:not(.fx-visible)').forEach(n => { if (n.getBoundingClientRect().top < innerHeight * 1.1) n.classList.add('fx-visible'); });
    addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });
    setTimeout(sweep, 2500);
  }
})();
