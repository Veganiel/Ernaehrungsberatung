/* Challenges page: highlight the active chapter and let visitors tick off the 7-day vegan plan. */
(() => {
  'use strict';

  // Sticky chapter bar: mark the challenge currently in view.
  const tabs = [...document.querySelectorAll('.ch-tabs a')];
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

  // 7-day vegan plan: progress is kept only in this browser.
  const boxes = [...document.querySelectorAll('.day-check input')];
  const count = document.getElementById('veganCount');
  const bar = document.getElementById('veganBar');
  const reset = document.getElementById('veganReset');
  if (!boxes.length || !count || !bar) return;

  const key = 'veganiel-challenge-vegan-days';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { saved = []; }
  if (!Array.isArray(saved)) saved = [];
  boxes.forEach(box => { box.checked = saved.includes(box.value); });

  const update = persist => {
    const done = boxes.filter(box => box.checked);
    count.textContent = String(done.length);
    bar.style.width = `${(done.length / boxes.length) * 100}%`;
    if (reset) reset.hidden = done.length === 0;
    if (persist) {
      try { localStorage.setItem(key, JSON.stringify(done.map(box => box.value))); } catch (_) { /* Storage may be disabled. */ }
    }
  };

  boxes.forEach(box => box.addEventListener('change', () => update(true)));
  if (reset) reset.addEventListener('click', () => { boxes.forEach(box => { box.checked = false; }); update(true); });
  update(false);
})();
