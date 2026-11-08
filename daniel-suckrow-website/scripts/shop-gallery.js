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
