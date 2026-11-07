(() => {
  const files = {
    fasten: 'intervallfasten',
    vegan: 'sieben-tage-vegan',
    abendritual: 'abendroutine'
  };
  const links = [];
  for (const [id, slug] of Object.entries(files)) {
    const heading = document.querySelector(`#${id} .section-head`);
    if (!heading) continue;
    const link = document.createElement('a');
    link.className = 'challenge-pdf-download';
    link.setAttribute('download', '');
    heading.append(link);
    links.push([link, slug]);
  }
  const update = () => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'de';
    for (const [link, slug] of links) {
      link.href = `assets/challenges/${slug}-${lang}.pdf`;
      link.textContent = lang === 'en' ? '↓ Download printable PDF' : '↓ Druckversion als PDF herunterladen';
      link.setAttribute('aria-label', `${link.textContent}: ${slug}`);
    }
  };
  document.addEventListener('veganiel:languagechange', update);
  update();
})();
