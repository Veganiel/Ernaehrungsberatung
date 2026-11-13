(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const en = () => document.documentElement.lang === 'en' || document.documentElement.dataset.pageLang === 'en';
  const SEL = '.journal-grid .card, #blogCards .card, .rz-card';
  const ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
  let toast;
  const showToast = (msg) => {
    if (!toast) { toast = document.createElement('div'); toast.className = 'card-share-toast'; toast.setAttribute('role', 'status'); document.body.append(toast); }
    toast.textContent = msg; toast.classList.add('is-visible');
    clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };
  const share = async (card) => {
    const url = new URL(card.getAttribute('href'), location.href).href;
    const title = (card.querySelector('h2, h3')?.textContent || document.title).trim();
    if (navigator.share) { try { await navigator.share({ title, url }); } catch (_) {} return; }
    try { await navigator.clipboard.writeText(url); showToast(en() ? 'Link copied' : 'Link kopiert'); }
    catch (_) { window.prompt('Link:', url); }
  };
  const ensure = () => {
    document.querySelectorAll(SEL).forEach((card) => {
      if (card.tagName !== 'A') return;
      const own = [...card.children].find((c) => c.classList.contains('card-share'));
      card.querySelectorAll('.card-share').forEach((b) => { if (b !== own) b.remove(); });
      if (own) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'card-share';
      b.setAttribute('aria-label', en() ? 'Share' : 'Teilen'); b.title = en() ? 'Share' : 'Teilen';
      b.innerHTML = ICON;
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); share(card); });
      card.append(b);
    });
  };
  ensure();
  window.addEventListener('load', ensure);
  new MutationObserver(ensure).observe(document.body, { childList: true, subtree: true });
})();
