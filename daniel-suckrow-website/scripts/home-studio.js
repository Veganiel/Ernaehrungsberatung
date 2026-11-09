(() => {
  'use strict';
  const nav = document.getElementById('nav');
  const menuButton = document.getElementById('menuBtn');
  const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
  const quizLink = nav.querySelector('.nav-dropdown-menu a[href="quiz.html"]');
  quizLink?.parentElement.prepend(quizLink);
  const closeDropdowns = except => dropdowns.forEach(item => {
    if (item === except) return;
    item.classList.remove('is-open');
    item.querySelector('button').setAttribute('aria-expanded', 'false');
  });
  const closeMenu = () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    closeDropdowns();
  };
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    if (!open) closeDropdowns();
  });
  dropdowns.forEach(item => {
    const button = item.querySelector('button');
    button.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      closeDropdowns(item);
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const opened = dropdowns.find(item => item.classList.contains('is-open'));
    if (opened) {
      closeDropdowns();
      opened.querySelector('button').focus();
    } else if (nav.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.querySelector('header').addEventListener('focusout', event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeDropdowns();
  });

  const toggle = document.getElementById('blogToggle');
  const grid = document.getElementById('blogCards');
  toggle.addEventListener('click', () => {
    const expanded = grid.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    const label = expanded ? 'Weniger Beiträge anzeigen' : 'Mehr Beiträge anzeigen';
    toggle.firstElementChild.textContent = window.VeganielI18n?.translate(label) || label;
    toggle.querySelector('.arrow').textContent = expanded ? '↑' : '↓';
    if (!expanded) document.getElementById('blog').scrollIntoView({block: 'start'});
  });
  const localise = () => {
    const english = document.documentElement.lang === 'en';
    document.querySelector('[data-home-cover]').src = english ? 'longevity-guide-cover-en.png' : 'longevity-guide-cover.png';
    menuButton.setAttribute('aria-label', english ? 'Open menu' : 'Menü öffnen');
    toggle.firstElementChild.textContent = english
      ? (grid.classList.contains('is-expanded') ? 'Show fewer articles' : 'Show more articles')
      : (grid.classList.contains('is-expanded') ? 'Weniger Beiträge anzeigen' : 'Mehr Beiträge anzeigen');
  };
  document.addEventListener('veganiel:languagechange', localise);
  localise();
  document.getElementById('year').textContent = new Date().getFullYear();

  // Content is visible by default; animation is only added to off-screen sections.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: .06, rootMargin: '0px 0px 0px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      document.querySelectorAll('.reveal-pending').forEach(el => el.classList.add('is-visible'));
    });
  }
  const progress = document.querySelector('.reading-progress');
  let pending = false;
  const updateProgress = () => {
    const length = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, Math.max(0, window.scrollY / length)) : 0})`;
    pending = false;
  };
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(updateProgress); }
  }, {passive: true});
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
