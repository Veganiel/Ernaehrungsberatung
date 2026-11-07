(() => {
  const products = [
    ['shirts','Weniger, aber bewusster','Less, but more mindful','☼','Weniger, aber bewusster','Less, but more mindful','Kleiner Satz mit Sonne und Blatt als feine Liniengrafik.','Small phrase with a fine sun-and-leaf line drawing.','#e7dfcf','#e4ebe1','#315b45'],
    ['shirts','Pflanzen sind Zukunft','Plants are the future','✿','Pflanzen sind Zukunft','Plants are the future','Typografisches Motiv mit einer stilisierten Blüte.','Typography with a stylized bloom.','#f4f0e4','#e9e9dc','#3b633f'],
    ['shirts','Leave room to grow','Leave room to grow','⌁','Leave room to grow','Leave room to grow','Dezente englische Zeile mit einem Keimling.','Quiet English phrase with a seedling.','#284b3b','#dbe5d7','#e5e9d6'],
    ['shirts','Mitgefühl ist eine Entscheidung','Compassion is a choice','♡','Mitgefühl ist eine Entscheidung','Compassion is a choice','Eigenes Zitat als Rückenmotiv, vorn ein kleines Herzblatt.','Original quote on the back, small heart-leaf on the front.','#e7e3d9','#efe9e0','#315343'],
    ['shirts','Kein Wegwerfplanet','No throwaway planet','◎','Unser Planet ist kein Wegwerfprodukt','Our planet is not disposable','Kreisgrafik mit Erde und Blättern; bewusst auffälliger.','Circular earth-and-leaves graphic; a bolder look.','#c7d5c4','#e9eee5','#254d37'],
    ['hoodies','Grow gently','Grow gently','❧','Grow gently','Grow gently','Kleine, tonale Brustgrafik.','Small tonal chest graphic.','#294b3c','#dfe9df','#d9e4d6'],
    ['hoodies','Für alles, was lebt','For all living things','✳','Für alles, was lebt','For all living things','Originalzitat als Rückenmotiv, kleines Blatt vorn.','Original quote on the back, small leaf in front.','#ddd8c9','#e8e5db','#315945'],
    ['hoodies','More roots. Less waste.','More roots. Less waste.','⌁','More roots. Less waste.','More roots. Less waste.','Wurzellinien unter klarer Schrift.','Root lines beneath clear typography.','#3c4540','#e5e8df','#e3e7d7'],
    ['hoodies','Zukunft wächst gemeinsam','The future grows together','❀','Zukunft wächst gemeinsam','The future grows together','Zwei ineinanderlaufende Pflanzenformen.','Two interwoven plant forms.','#cdd7c8','#e9ede2','#2b503b'],
    ['hoodies','Veganiel Earth Club','Veganiel Earth Club','◉','Veganiel Earth Club','Veganiel Earth Club','Modernes Outdoor-Emblem mit kleiner Ärmelzeile.','Modern outdoor emblem with a small sleeve phrase.','#e7e2d4','#e5e9dc','#2f5943']
  ];
  const render = () => {
    const en = document.documentElement.lang === 'en';
    for (const kind of ['shirts','hoodies']) {
      const target = document.getElementById(kind);
      target.replaceChildren();
      for (const p of products.filter(item => item[0] === kind)) {
        const card = document.createElement('article');
        card.className = `product ${kind === 'hoodies' ? 'hoodie' : ''}`;
        card.style.cssText = `--fabric:${p[8]};--scene:${p[9]};--print:${p[10]}`;
        const mockup = document.createElement('div'); mockup.className = 'mockup';
        const garment = document.createElement('div'); garment.className = 'garment';
        const print = document.createElement('div'); print.className = 'print';
        const symbol = document.createElement('em'); symbol.textContent = p[3];
        const wording = document.createElement('b'); wording.textContent = en ? p[5] : p[4];
        const brand = document.createElement('small'); brand.textContent = 'Veganiel';
        print.append(symbol,wording,brand); garment.append(print); mockup.append(garment);
        const info = document.createElement('div'); info.className = 'product-info';
        const tag = document.createElement('span'); tag.textContent = kind === 'hoodies' ? 'Hoodie · Konzept' : (en ? 'T-shirt · Concept' : 'T-Shirt · Konzept');
        const title = document.createElement('h3'); title.textContent = en ? p[2] : p[1];
        const description = document.createElement('p'); description.textContent = en ? p[7] : p[6];
        info.append(tag,title,description); card.append(mockup,info); target.append(card);
      }
    }
  };
  document.addEventListener('veganiel:languagechange', render);
  render();
})();
