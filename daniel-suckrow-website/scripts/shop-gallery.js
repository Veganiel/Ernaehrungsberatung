for (const gallery of document.querySelectorAll('[data-shop-gallery]')) {
  const images = gallery.querySelectorAll('[data-view]');
  const controls = gallery.querySelector('.gallery-controls');
  const buttons = controls.querySelectorAll('button[data-show]');

  function show(view) {
    for (const image of images) image.hidden = image.dataset.view !== view;
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.show === view));
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => show(button.dataset.show));
  }
  show('back');
  controls.hidden = false;
}

// Keep the original shop images: previews are never recoloured or reconstructed.
const heroStage = document.querySelector('.hero-stage');
const heroSwitch = document.querySelector('.hero-switch');
if (heroStage && heroSwitch) {
  for (const button of heroSwitch.querySelectorAll('[data-hero-show]')) {
    button.addEventListener('click', () => {
      const view = button.dataset.heroShow;
      heroStage.dataset.feature = view;
      heroStage.querySelectorAll('[data-hero-view]').forEach(item => { item.hidden = item.dataset.heroView !== view; });
      heroStage.querySelectorAll('[data-hero-label]').forEach(item => { item.hidden = item.dataset.heroLabel !== view; });
      heroSwitch.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  }
  heroSwitch.hidden = false;
}

const lightbox = document.querySelector('.shop-lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const image = lightbox.querySelector('img');
  const title = lightbox.querySelector('#lightbox-title');
  let opener;
  const close = () => lightbox.close();
  document.querySelectorAll('[data-zoom-image]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      opener = button;
      image.src = button.dataset.zoomImage;
      image.alt = button.querySelector('img').alt;
      title.textContent = window.VeganielI18n?.translate(button.dataset.zoomLabel) || button.dataset.zoomLabel;
      lightbox.showModal();
    });
  });
  lightbox.querySelector('[data-close-lightbox]').addEventListener('click', close);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) { const rect = lightbox.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
  lightbox.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
}
