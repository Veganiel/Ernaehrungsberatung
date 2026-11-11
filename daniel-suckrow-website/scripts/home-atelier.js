/* Home atelier: scroll-triggered details, staggered arrivals and pointer-led depth.
   Decorative only – it adds classes and CSS variables, never content or handlers
   that other scripts depend on. Everything stays visible if this file fails to load. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const belowFold = element => element.getBoundingClientRect().top >= window.innerHeight;

  if (!reduced && 'IntersectionObserver' in window) {
    // 1. One-off details that play when their block is first seen
    //    (drawn rules, the health gauge, challenge ticks, the portrait).
    const seen = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('atl-seen');
        seen.unobserve(entry.target);
      });
    }, {threshold: .18});
    document.querySelectorAll('.section-label, .health-card, .challenge-card, .about-art').forEach(element => {
      if (belowFold(element)) seen.observe(element);
      else element.classList.add('atl-seen');
    });
    // Only now may the stylesheet hide anything: every candidate is either marked or observed.
    root.classList.add('atl-motion');

    // 2. Staggered arrival for blocks the base script does not animate itself.
    const arrive = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        const element = entry.target;
        arrive.unobserve(element);
        element.style.setProperty('--atl-i', String(Math.min(index, 5)));
        element.classList.add('atl-in');
        // Hand the element back untouched once it has settled, so hover states stay crisp.
        window.setTimeout(() => {
          element.classList.remove('atl-pending', 'atl-in');
          element.style.removeProperty('--atl-i');
        }, 1900);
      });
    }, {threshold: .08});
    document.querySelectorAll([
      '.weekly-impulse-inner > *',
      '.calculator-heading',
      '.calculator-links > a',
      '.journal-card:not(.journal-extra)',
      '.blog-toggle-wrap',
      '.closing-copy',
      '.closing-note'
    ].join(',')).forEach(element => {
      if (!belowFold(element)) return;
      element.classList.add('atl-pending');
      arrive.observe(element);
    });
  }

  if (reduced || !finePointer) return;

  // 3. Hero depth: the image leans gently towards the pointer, seal and card drift apart.
  const hero = document.querySelector('.studio-hero');
  const art = hero && hero.querySelector('.hero-art');
  if (art) {
    let targetX = 0, targetY = 0, x = 0, y = 0, frame = 0;
    const clamp = value => Math.max(-1, Math.min(1, value));
    const step = () => {
      x += (targetX - x) * .08;
      y += (targetY - y) * .08;
      art.style.setProperty('--tx', x.toFixed(4));
      art.style.setProperty('--ty', y.toFixed(4));
      frame = Math.abs(targetX - x) > .001 || Math.abs(targetY - y) > .001 ? requestAnimationFrame(step) : 0;
    };
    const run = () => { if (!frame) frame = requestAnimationFrame(step); };
    hero.addEventListener('pointermove', event => {
      const rect = art.getBoundingClientRect();
      targetX = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width * .9));
      targetY = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height * .9));
      run();
    }, {passive: true});
    hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; run(); });
  }

  // 4. Closing: a soft light that follows the pointer across the dark field.
  const closing = document.querySelector('.closing');
  if (closing) {
    let queued = false, px = 0, py = 0;
    closing.addEventListener('pointermove', event => {
      const rect = closing.getBoundingClientRect();
      px = event.clientX - rect.left;
      py = event.clientY - rect.top;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        closing.style.setProperty('--mx', `${px}px`);
        closing.style.setProperty('--my', `${py}px`);
        queued = false;
      });
    }, {passive: true});
  }
})();
