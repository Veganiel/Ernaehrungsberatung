/* Über mich: subtle fade-up for the top sections. Content stays visible without JS or with reduced motion. */
(() => {
  const root = document.documentElement;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.remove('about-motion'); return; }
  root.classList.add('about-motion');
  window.__aboutReveal = true;
  const items = [...document.querySelectorAll('.reveal:not(.about-hero .reveal)')];
  const groups = new Map();
  items.forEach(item => {
    const parent = item.parentElement;
    const index = groups.get(parent) || 0;
    groups.set(parent, index + 1);
    item.style.setProperty('--reveal-delay', Math.min(index * 0.08, 0.4) + 's');
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(item => observer.observe(item));
})();
