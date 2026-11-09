(() => {
  const target = document.querySelector('main');
  if (!target) return;

  const section = document.createElement('aside');
  section.className = 'veganiel-ad';
  section.setAttribute('aria-label', 'Werbung');
  section.innerHTML = '<span class="veganiel-ad__label">Werbung · Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2996299966418101" data-ad-slot="8732762798" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  target.append(section);

  const style = document.createElement('style');
  style.textContent = '.veganiel-ad{max-width:860px;margin:clamp(48px,7vw,96px) auto 24px;padding:0 20px;text-align:center}.veganiel-ad__label{display:block;margin-bottom:12px;color:#67766c;font:600 11px/1.4 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}.veganiel-ad.is-empty{display:none}';
  document.head.append(style);

  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) { section.classList.add('is-empty'); }
  const observer = new MutationObserver(() => {
    const status = section.querySelector('ins')?.getAttribute('data-ad-status');
    if (status === 'unfilled') section.classList.add('is-empty');
    if (status === 'filled') section.classList.remove('is-empty');
  });
  observer.observe(section.querySelector('ins'), { attributes: true, attributeFilter: ['data-ad-status'] });
  setTimeout(() => {
    if (!section.querySelector('ins')?.getAttribute('data-ad-status')) section.classList.add('is-empty');
  }, 10000);
})();
