(() => {
  const collection = {
    shirts: [
      ['Let Them Graze', 'Kuh und Löwenzahn im cremefarbenen Holzschnitt auf verwaschenem Schwarz.', 'Cream woodcut of a cow and dandelion on washed black.'],
      ['Grow Plants, Spare Lives', 'Tomatenrot und Kobaltblau im Stil eines alten Konservenetiketts.', 'Tomato red and cobalt in the style of a vintage can label.', true],
      ['Make the Connection', 'Ein lila Falter aus Blättern, leuchtende Sterne und ein heller Schriftzug darunter.', 'A purple moth made of leaves, bright stars and light lettering below.', true],
      ['Plant Based', 'Rote Schrägschrift zwischen den Dornen einer Brombeerranke.', 'Slanted red lettering among the thorns of a bramble.', true],
      ['Keep It Wild', 'Wildtiere, Farne und Bäume als Waldszene auf Tintenblau.', 'Wild animals, ferns and trees in a woodland scene on ink blue.', true]
    ],
    hoodies: [
      ['End Speciesism', 'Ein Fuchs bricht durch Asphalt. Hinter ihm stehen Pferd, Schwein und Kuh.', 'A fox breaks through asphalt, with a horse, pig and cow behind it.', true],
      ['The Future Is Grown', 'Ein Gewächshaus unter einer großen Sonne, gezeichnet wie ein alter Bauplan.', 'A greenhouse under a giant sun, drawn like a vintage blueprint.'],
      ['Understory', 'Pilze und ein verzweigtes Myzel als cremefarbene Gravur auf Waldgrün.', 'Mushrooms and branching mycelium etched in cream on pine green.'],
      ['Run on Plants', 'Eine Läuferin mit einem Arm voll Lauch als Comicmotiv auf Weinrot.', 'A runner carrying an armful of leeks in a comic panel on faded wine red.', true],
      ['Make Room for Life', 'Eine Biene über Wildblumen in Kornblumenblau und Gelb.', 'A bee above wildflowers in cornflower blue and pale yellow.']
    ]
  };

  const frontViews = new Set();

  const renderStaticCopy = () => {
    const language = document.documentElement.lang === 'en' ? 'en' : 'de';
    document.querySelectorAll('[data-de][data-en]').forEach(element => {
      element.textContent = element.dataset[language];
    });
  };

  const render = () => {
    const en = document.documentElement.lang === 'en';
    for (const [kind, items] of Object.entries(collection)) {
      const cards = items.map(([name, de, english, revised], index) => {
        if (kind === 'hoodies' && index === 0) return null;
        const card = document.createElement('article');
        card.className = 'product';
        card.setAttribute('translate', 'no');

        const mockup = document.createElement('div');
        mockup.className = 'product-photo';
        const photo = document.createElement('img');
        const backPhoto = '/assets/shop/' + kind + (revised ? '-revised' : '') + '.jpg';
        const backAlt = name + ' · ' + (en ? english : de);
        photo.src = backPhoto;
        photo.alt = backAlt;
        photo.loading = index < 2 && kind === 'shirts' ? 'eager' : 'lazy';
        photo.style.left = (-100 * index) + '%';
        mockup.append(photo);

        const info = document.createElement('div');
        info.className = 'product-info';
        const tag = document.createElement('span');
        tag.textContent = (kind === 'shirts' ? 'T-Shirt' : 'Hoodie') + (en ? ' · Design concept' : ' · Entwurf');
        const title = document.createElement('h3');
        title.textContent = name;
        const description = document.createElement('p');
        description.textContent = en ? english : de;
        info.append(tag, title, description);
        if (kind === 'hoodies') {
          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'product-view-toggle';
          const updateView = () => {
            const front = frontViews.has(name);
            photo.src = front ? '/assets/shop/hoodies-front.jpg' : backPhoto;
            photo.alt = front
              ? name + (en ? ' · Front with small left chest design' : ' · Vorderseite mit kleinem Motiv links auf der Brust')
              : backAlt;
            toggle.textContent = front
              ? (en ? 'Show back' : 'Rückseite ansehen')
              : (en ? 'Show front' : 'Vorderseite ansehen');
            toggle.setAttribute('aria-label', toggle.textContent + ' · ' + name);
          };
          toggle.addEventListener('click', () => {
            if (frontViews.has(name)) frontViews.delete(name);
            else frontViews.add(name);
            updateView();
          });
          updateView();
          info.append(toggle);
        }
        card.append(mockup, info);
        return card;
      }).filter(Boolean);
      document.getElementById(kind).replaceChildren(...cards);
    }
  };

  document.addEventListener('veganiel:languagechange', () => {
    renderStaticCopy();
    render();
  });
  window.VeganielI18n?.ready.then(renderStaticCopy);
  renderStaticCopy();
  render();
})();
