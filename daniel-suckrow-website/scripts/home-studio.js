(() => {
  'use strict';
  const nav = document.getElementById('nav');
  const menuButton = document.getElementById('menuBtn');
  const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
  const quizLink = nav.querySelector('.nav-dropdown-menu a[href="quiz.html"]');
  quizLink?.parentElement.prepend(quizLink);
  const knowledgeMenu = quizLink?.parentElement;
  if (knowledgeMenu && !knowledgeMenu.querySelector('a[href="saisonkalender.html"]')) {
    const calendarLink = document.createElement('a');
    calendarLink.href = 'saisonkalender.html';
    calendarLink.textContent = 'Saisonkalender';
    knowledgeMenu.append(calendarLink);
  }
  const strip = document.querySelector('.approach-strip');
  if (strip && !document.querySelector('.weekly-impulse')) {
    const impulse = document.createElement('section');
    impulse.className = 'weekly-impulse';
    impulse.setAttribute('aria-label', 'Dein Wochenimpuls');
    impulse.innerHTML = '<div class="wrap weekly-impulse-inner"><div><p class="eyebrow">DEIN WOCHENIMPULS</p><h2>Ein kleiner Schritt,<br><em>der bleiben darf.</em></h2></div><div class="weekly-impulse-task"><span aria-hidden="true">01</span><p><strong>Diese Woche:</strong> Baue zu einer Mahlzeit bewusst eine pflanzliche Proteinquelle ein – etwa Linsen, Bohnen, Tofu oder Tempeh.</p><a href="challenges.html">Impulse entdecken <span aria-hidden="true">↗</span></a></div></div>';
    strip.after(impulse);
  }
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
  // Neueste Blogbeiträge automatisch aus der Blog-Übersicht übernehmen (statische Karten bleiben als Fallback).
  fetch('blog-uebersicht.html', {cache: 'no-cache'}).then(r => r.ok ? r.text() : '').then(text => {
    if (!text) return;
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const seen = new Set();
    const posts = [...doc.querySelectorAll('a.card[href^="blog/"]')].map(card => {
      const href = card.getAttribute('href');
      const slug = (href.match(/^blog\/([^/]+)\//) || [])[1];
      const num = card.querySelector('.num');
      return slug && !seen.has(slug) && seen.add(slug) ? {href, slug,
        category: num ? num.textContent.split('·').slice(1).join('·').trim() : '',
        title: card.querySelector('h3')?.textContent || '', text: card.querySelector('p')?.textContent || ''} : null;
    }).filter(Boolean);
    const current = grid.querySelector('.journal-card')?.getAttribute('href');
    if (!posts.length || current === posts[0].href) return;
    const esc = value => value.replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
    grid.innerHTML = posts.map((post, index) => `<a class="journal-card${index < 3 ? '' : ' journal-extra'}" href="${esc(post.href)}"><div class="journal-image"><img src="assets/blog/${esc(post.slug)}.jpg" alt="" width="1200" height="800" loading="lazy" decoding="async"><span class="journal-arrow" aria-hidden="true">↗</span></div><div class="journal-copy"><span class="journal-category">${String(posts.length - index).padStart(2, '0')} · ${esc(post.category)}</span><h3>${esc(post.title)}</h3><p>${esc(post.text)}</p><span class="read-link">Beitrag lesen <span aria-hidden="true">↗</span></span></div></a>`).join('');
  }).catch(() => {});
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
