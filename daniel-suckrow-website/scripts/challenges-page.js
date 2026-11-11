/* Challenges page: highlight the active chapter and let visitors tick off the plans. */
(() => {
  'use strict';

  // Old links to the former one-page version (challenges.html#vegan …) open the challenge's own page.
  const legacy = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (legacy && legacy.matches('a.ch-card[href]')) { location.replace(legacy.href); return; }

  // Sticky chapter bar: on a page with several challenges, mark the one currently in view.
  const tabs = [...document.querySelectorAll('.ch-tabs a[href^="#"]')];
  const strip = document.querySelector('.ch-tabs-inner');
  const sections = tabs.map(tab => document.querySelector(tab.getAttribute('href'))).filter(Boolean);
  if (tabs.length && sections.length && 'IntersectionObserver' in window) {
    const activate = id => tabs.forEach(tab => {
      const active = tab.getAttribute('href') === `#${id}`;
      tab.setAttribute('aria-current', active ? 'true' : 'false');
      if (active && strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' });
      }
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  // Hide the bar once the last challenge has scrolled past (the sections stay direct children of <main> for the ad placement).
  const tabBar = document.querySelector('.ch-tabs');
  const last = sections[sections.length - 1];
  if (tabBar && last) {
    let queued = false;
    const check = () => {
      queued = false;
      tabBar.classList.toggle('is-past', last.getBoundingClientRect().bottom < tabBar.getBoundingClientRect().bottom + 40);
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(check); } }, { passive: true });
    check();
  }

  // Tick-off plans (7-day vegan, 8-week running): progress is kept only in this browser.
  document.querySelectorAll('[data-tracker]').forEach(root => {
    const boxes = [...root.querySelectorAll('.day-check input')];
    const count = root.querySelector('.ch-progress-count');
    const fill = root.querySelector('.ch-progress-bar i');
    const reset = root.querySelector('.ch-progress-reset');
    if (!boxes.length || !count || !fill) return;

    const key = `veganiel-challenge-${root.dataset.tracker}`;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { saved = []; }
    if (!Array.isArray(saved)) saved = [];
    boxes.forEach(box => { box.checked = saved.includes(box.value); });

    const update = persist => {
      const done = boxes.filter(box => box.checked);
      count.textContent = String(done.length);
      fill.style.width = `${(done.length / boxes.length) * 100}%`;
      if (reset) reset.hidden = done.length === 0;
      if (persist) {
        try { localStorage.setItem(key, JSON.stringify(done.map(box => box.value))); } catch (_) { /* Storage may be disabled. */ }
      }
    };

    boxes.forEach(box => box.addEventListener('change', () => update(true)));
    if (reset) reset.addEventListener('click', () => { boxes.forEach(box => { box.checked = false; }); update(true); });
    update(false);
  });
})();
