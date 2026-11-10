/* Home polish: scrolled header, values ribbon, card spotlight, gentle hero parallax. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header elevation after scrolling
  const header = document.querySelector('body > header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
  }

  // Values band → endless ribbon (static grid stays for reduced motion)
  const strip = document.querySelector('.approach-strip');
  const wrap = strip && strip.querySelector(':scope > .wrap');
  if (wrap && !reduced) {
    const items = [...wrap.children];
    const group = document.createElement('div');
    group.className = 'marquee-group';
    items.forEach((item, index) => {
      group.append(item);
      const dot = document.createElement('i');
      dot.setAttribute('aria-hidden', 'true');
      group.append(dot);
    });
    const track = document.createElement('div');
    track.className = 'marquee-track';
    track.append(group);
    // Enough copies to cover wide screens, then one duplicate set for a seamless loop
    const copies = Math.max(1, Math.ceil(window.innerWidth / Math.max(group.scrollWidth || 900, 600)));
    for (let i = 1; i < copies; i++) track.append(group.cloneNode(true));
    const half = [...track.children].map(node => node.cloneNode(true));
    half.forEach(node => { node.setAttribute('aria-hidden', 'true'); track.append(node); });
    wrap.append(track);
    strip.classList.add('is-marquee');
  }

  // Spotlight on discovery cards
  document.querySelectorAll('.discover-card').forEach(card => {
    const light = document.createElement('span');
    light.className = 'card-spotlight';
    light.setAttribute('aria-hidden', 'true');
    card.prepend(light);
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  // Gentle parallax on the hero image
  const frame = document.querySelector('.studio-hero .food-frame');
  if (frame && !reduced && window.matchMedia('(min-width: 761px)').matches) {
    let ticking = false;
    const update = () => {
      const y = Math.min(window.scrollY, 700);
      frame.style.translate = `0 ${y * 0.06}px`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, {passive: true});
  }
})();
