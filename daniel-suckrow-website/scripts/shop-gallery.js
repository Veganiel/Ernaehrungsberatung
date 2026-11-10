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
