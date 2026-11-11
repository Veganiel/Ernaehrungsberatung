/* Dezente Werbeplätze (Google AdSense).
 * Großer Bildschirm: je eine schmale Leiste links und rechts neben dem Inhalt (bleibt beim Scrollen stehen).
 * Kleinere Bildschirme und Handy: höchstens drei Anzeigen zwischen den Abschnitten bzw. Beiträgen.
 * Quizwelt: Werbung nur, während eine Quizfrage zu sehen ist.
 * Einwilligung und Personalisierung regelt Googles Einwilligungsmitteilung.
 */
(() => {
  'use strict';
  const CLIENT = 'ca-pub-2996299966418101';
  const SLOT = '8732762798';
  const main = document.querySelector('main');
  if (!main) return;
  const isQuiz = Boolean(document.getElementById('questionView'));

  const style = document.createElement('style');
  style.textContent = [
    '.veganiel-ad{max-width:760px;margin:clamp(36px,6vw,64px) auto;padding:18px 16px 14px;border-top:1px solid rgba(33,74,55,.12);border-bottom:1px solid rgba(33,74,55,.12);text-align:center}',
    '.veganiel-ad__label{display:block;margin-bottom:10px;color:#7a877e;font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase}',
    '.veganiel-ad.is-empty,.veganiel-rail.is-empty{display:none!important}',
    '.cards>.veganiel-ad,.journal-grid>.veganiel-ad{grid-column:1/-1;width:100%}',
    '.veganiel-rail{position:fixed;top:112px;z-index:5;display:none;text-align:center;transition:opacity .3s}',
    '.veganiel-rail.is-on{display:block}',
    '.veganiel-rail.is-faded{opacity:0;pointer-events:none}',
    '.veganiel-rail .veganiel-ad__label{margin-bottom:8px}',
    '.veganiel-quiz-ad{margin:36px auto 0;max-width:680px}',
    '@media print{.veganiel-ad,.veganiel-rail{display:none!important}}'
  ].join('');
  document.head.append(style);

  function unit(width, height) {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.dataset.adClient = CLIENT;
    ins.dataset.adSlot = SLOT;
    if (width) {
      ins.style.cssText = 'display:inline-block;width:' + width + 'px;height:' + height + 'px';
    } else {
      ins.style.display = 'block';
      ins.dataset.adFormat = 'auto';
      ins.dataset.fullWidthResponsive = 'true';
    }
    return ins;
  }

  function fill(container) {
    const ins = container.querySelector('ins');
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) { container.classList.add('is-empty'); return; }
    new MutationObserver(() => {
      const status = ins.getAttribute('data-ad-status');
      if (status === 'unfilled') container.classList.add('is-empty');
      if (status === 'filled') container.classList.remove('is-empty');
    }).observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    // Ohne Rückmeldung von AdSense (z. B. Werbeblocker) bleibt kein leerer Kasten stehen.
    setTimeout(() => { if (!ins.getAttribute('data-ad-status')) container.classList.add('is-empty'); }, 10000);
  }

  function block(extraClass) {
    const aside = document.createElement('aside');
    aside.className = 'veganiel-ad' + (extraClass ? ' ' + extraClass : '');
    aside.setAttribute('aria-label', 'Werbung');
    aside.innerHTML = '<span class="veganiel-ad__label">Werbung · Advertisement</span>';
    aside.append(unit());
    return aside;
  }

  /* ---------- Seitenleisten auf großen Bildschirmen ---------- */
  const rails = [];
  function contentWidth() {
    const wrap = main.querySelector('.wrap, article, .container') || main;
    return Math.min(wrap.getBoundingClientRect().width || 1160, window.innerWidth);
  }
  function railSize() {
    const gutter = (window.innerWidth - contentWidth()) / 2;
    if (gutter >= 160 + 48) return { w: 160, gutter };
    if (gutter >= 120 + 40) return { w: 120, gutter };
    return null;
  }
  function makeRails(size) {
    ['left', 'right'].forEach(side => {
      const rail = document.createElement('aside');
      rail.className = 'veganiel-rail is-on';
      rail.dataset.side = side;
      rail.setAttribute('aria-label', 'Werbung');
      rail.innerHTML = '<span class="veganiel-ad__label">Werbung</span>';
      rail.append(unit(size.w, 600));
      document.body.append(rail);
      rails.push(rail);
    });
    positionRails(size);
    rails.forEach(fill);
  }
  function positionRails(size) {
    rails.forEach(rail => {
      const offset = Math.max(12, (size.gutter - size.w) / 2);
      rail.style.left = rail.dataset.side === 'left' ? offset + 'px' : '';
      rail.style.right = rail.dataset.side === 'right' ? offset + 'px' : '';
    });
  }
  function railsWanted() {
    if (!isQuiz) return true;
    const quiz = document.getElementById('quiz');
    const view = document.getElementById('questionView');
    return quiz && view && !quiz.classList.contains('hidden') && !view.classList.contains('hidden');
  }
  function updateRails() {
    const size = railSize();
    const show = Boolean(size) && railsWanted() && window.innerHeight >= 720;
    if (show && !rails.length) makeRails(size);
    if (rails.length) {
      if (size) positionRails(size);
      rails.forEach(rail => rail.classList.toggle('is-on', show));
    }
    return show;
  }
  // Leisten über dem Seitenende ausblenden, damit sie den Fußbereich nicht überdecken.
  const footer = document.querySelector('footer');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      rails.forEach(rail => rail.classList.toggle('is-faded', visible));
    }).observe(footer);
  }

  /* ---------- Anzeigen zwischen Abschnitten ---------- */
  let inlinePlaced = false;
  function placeInline() {
    if (inlinePlaced || isQuiz) return;
    inlinePlaced = true;
    const spots = [];
    const article = main.querySelector('article');
    const cards = main.querySelector('section.cards, .journal-grid');
    if (article && article.querySelectorAll('h2').length >= 3) {
      // Blogartikel: vor der 3., 5. und 7. Zwischenüberschrift
      const headings = [...article.querySelectorAll('h2')];
      [2, 4, 6].forEach(i => headings[i] && spots.push({ before: headings[i] }));
    } else if (cards && cards.children.length >= 7) {
      // Beitragsübersicht: nach jedem sechsten Beitrag
      const items = [...cards.children];
      [6, 12, 18].forEach(i => items[i] && spots.push({ before: items[i] }));
    } else {
      // Übrige Seiten: zwischen größeren Abschnitten, nicht direkt nach dem Seitenkopf
      const sections = [...main.children].filter(el => /^(SECTION|ARTICLE|DIV)$/.test(el.tagName) && el.offsetHeight > 120);
      [2, 4, 6].forEach(i => sections[i] && spots.push({ before: sections[i] }));
      if (!spots.length && sections.length) spots.push({ after: sections[sections.length - 1] });
    }
    spots.slice(0, 3).forEach(spot => {
      const ad = block();
      if (spot.before) spot.before.before(ad); else spot.after.after(ad);
      fill(ad);
    });
  }

  /* ---------- Quiz: Werbung nur bei den Fragen ---------- */
  let quizAd;
  function updateQuiz() {
    const railsOn = updateRails();
    if (railsOn || !railsWanted()) return;
    if (!quizAd) {
      quizAd = block('veganiel-quiz-ad');
      document.getElementById('questionView').append(quizAd);
      fill(quizAd);
    }
  }

  function init() {
    if (isQuiz) {
      updateQuiz();
      const observer = new MutationObserver(updateQuiz);
      ['quiz', 'questionView'].forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
      });
    } else if (!updateRails()) {
      placeInline();
    }
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (isQuiz) updateQuiz(); else if (!updateRails()) placeInline(); }, 250);
    });
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });
})();
