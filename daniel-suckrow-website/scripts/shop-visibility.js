(() => {
  const show = () => document.querySelectorAll('.shop-nav-link').forEach(link => { link.hidden = false; });
  fetch('/shop-region', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { available: false })
    .then(data => { if (data.available) show(); })
    .catch(() => {});
})();
