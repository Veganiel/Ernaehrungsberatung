(() => {
  const collection = {
    shirts: [
      ['Let Them Graze', 'Kuh und Löwenzahn im cremefarbenen Holzschnitt auf verwaschenem Schwarz.', 'Cream woodcut of a cow and dandelion on washed black.'],
      ['Plant After Plant', 'Tomatenrot und Kobaltblau im Stil eines alten Konservenetiketts.', 'Tomato red and cobalt in the style of a vintage can label.'],
      ['Night Pollinator', 'Ein Falter aus Blättern, umgeben von leuchtenden Sternen auf Pflaume.', 'A moth made of leaves amid bright stars on faded plum.'],
      ['Grow a Backbone', 'Rote Schrägschrift zwischen den Dornen einer Brombeerranke.', 'Slanted red lettering among the thorns of a bramble.'],
      ['Keep It Wild', 'Ein Sardinenschwarm in einer brechenden Welle auf Tintenblau.', 'A school of sardines in a breaking wave on ink blue.']
    ],
    hoodies: [
      ['Let the Wild In', 'Ein roter Fuchs bricht durch Asphalt. Rückenprint auf Anthrazit.', 'A red fox breaks through asphalt. Back print on charcoal.'],
      ['The Future Is Grown', 'Ein Gewächshaus unter einer großen Sonne, gezeichnet wie ein alter Bauplan.', 'A greenhouse under a giant sun, drawn like a vintage blueprint.'],
      ['Understory', 'Pilze und ein verzweigtes Myzel als cremefarbene Gravur auf Waldgrün.', 'Mushrooms and branching mycelium etched in cream on pine green.'],
      ['Run on Roots', 'Eine Läuferin mit einem Arm voll Lauch als Comicmotiv auf Weinrot.', 'A runner carrying an armful of leeks in a comic panel on faded wine red.'],
      ['Make Room for Life', 'Eine Biene über Wildblumen in Kornblumenblau und Gelb.', 'A bee above wildflowers in cornflower blue and pale yellow.']
    ]
  };

  const render = () => {
    const en = document.documentElement.lang === 'en';
    for (const [kind, items] of Object.entries(collection)) {
      const cards = items.map(([name, de, english], index) => {
        const card = document.createElement('article');
        card.className = 'product';
        card.setAttribute('translate', 'no');

        const mockup = document.createElement('div');
        mockup.className = 'product-photo';
        const photo = document.createElement('img');
        photo.src = '/assets/shop/' + kind + '.jpg';
        photo.alt = name + ' · ' + (en ? english : de);
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
        card.append(mockup, info);
        return card;
      });
      document.getElementById(kind).replaceChildren(...cards);
    }
  };

  document.addEventListener('veganiel:languagechange', render);
  render();
})();
