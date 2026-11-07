(() => {
  const products = [
    ['shirts','Weniger, aber bewusster','Less, but more mindful','Weniger, aber bewusster','Less, but more mindful','Kleiner Satz mit Sonne und Blatt als feine Liniengrafik.','Small phrase with a fine sun-and-leaf line drawing.','#e7dfcf','#e4ebe1','#315b45'],
    ['shirts','Pflanzen sind Zukunft','Plants are the future','Pflanzen sind Zukunft','Plants are the future','Typografisches Motiv mit einer stilisierten Blüte.','Typography with a stylized bloom.','#f4f0e4','#e9e9dc','#3b633f'],
    ['shirts','Leave room to grow','Leave room to grow','Leave room to grow','Leave room to grow','Dezente englische Zeile mit einem Keimling.','Quiet English phrase with a seedling.','#284b3b','#dbe5d7','#e5e9d6'],
    ['shirts','Mitgefühl ist eine Entscheidung','Compassion is a choice','Mitgefühl ist eine Entscheidung','Compassion is a choice','Eigenes Zitat als Rückenmotiv, vorn ein kleines Herzblatt.','Original quote on the back, small heart-leaf on the front.','#e7e3d9','#efe9e0','#315343'],
    ['shirts','Kein Wegwerfplanet','No throwaway planet','Unser Planet ist kein Wegwerfprodukt','Our planet is not disposable','Kreisgrafik mit Erde und Blättern; bewusst auffälliger.','Circular earth-and-leaves graphic; a bolder look.','#c7d5c4','#e9eee5','#254d37'],
    ['hoodies','Grow gently','Grow gently','Grow gently','Grow gently','Kleine, tonale Brustgrafik.','Small tonal chest graphic.','#294b3c','#dfe9df','#d9e4d6'],
    ['hoodies','Für alles, was lebt','For all living things','Für alles, was lebt','For all living things','Originalzitat als Rückenmotiv, kleines Blatt vorn.','Original quote on the back, small leaf in front.','#ddd8c9','#e8e5db','#315945'],
    ['hoodies','More roots. Less waste.','More roots. Less waste.','More roots. Less waste.','More roots. Less waste.','Wurzellinien unter klarer Schrift.','Root lines beneath clear typography.','#3c4540','#e5e8df','#e3e7d7'],
    ['hoodies','Zukunft wächst gemeinsam','The future grows together','Zukunft wächst gemeinsam','The future grows together','Zwei ineinanderlaufende Pflanzenformen.','Two interwoven plant forms.','#cdd7c8','#e9ede2','#2b503b'],
    ['hoodies','Veganiel Earth Club','Veganiel Earth Club','Veganiel Earth Club','Veganiel Earth Club','Modernes Outdoor-Emblem mit kleiner Ärmelzeile.','Modern outdoor emblem with a small sleeve phrase.','#e7e2d4','#e5e9dc','#2f5943']
  ];
  // Original vector studies, drawn at a shared scale for the garment previews.
  const motifs = [
    ['sunrise', '<circle cx="50" cy="30" r="16" fill="#bd7750" stroke="none"/><path d="M9 69Q33 29 53 67T91 62M11 76Q31 56 52 78T91 73M20 56l-8-11m66 6 9-12"/>'],
    ['botanical', '<path d="M50 90Q38 50 64 12M48 70Q10 61 13 34Q45 34 48 70ZM51 56Q51 21 87 24Q82 51 51 56ZM56 32Q30 30 30 8Q54 7 56 32Z"/><path d="M16 38l29 28m9-14 27-23M34 13l19 16"/>'],
    ['seedling', '<path d="M50 83V49Q52 25 71 21M50 61Q25 57 22 34Q45 31 50 55M50 52Q58 17 82 22Q81 47 50 52M34 84h32"/><circle cx="71" cy="14" r="3" fill="#d4ac73" stroke="none"/>'],
    ['heartleaf', '<path d="M49 82C37 72 11 52 13 32C15 14 38 13 49 30C62 10 87 16 87 36C87 56 63 73 49 82Z"/><path d="M49 79Q42 45 68 33M49 62q-7-15-19-20m19 13 17-8"/>'],
    ['planet', '<circle cx="50" cy="50" r="31"/><path d="M19 50h62M26 34q24 12 48 0M26 66q24-12 48 0M50 19c-25 15-25 47 0 62m0-62c25 15 25 47 0 62M13 69a43 43 0 0 1 1-40m72 42a43 43 0 0 0 0-42"/><circle cx="13" cy="69" r="4" fill="#a65539" stroke="none"/><circle cx="86" cy="29" r="4" fill="#a65539" stroke="none"/>'],
    ['sprig', '<path d="M22 75Q55 70 79 23M41 67Q16 54 22 42Q41 43 41 67ZM55 57Q53 33 40 28Q35 47 55 57ZM61 50Q78 57 88 42Q74 36 61 50ZM72 34Q65 16 79 11Q85 24 72 34Z"/>'],
    ['wildlife', '<path d="M15 69q15 9 27-3l13-15 17-6 15 3-12 8-8 17q-6 14-24 11L15 69Zm38-18Q39 19 17 23q2 21 29 37m30-11h1M29 77 15 87"/><path d="M80 23v14m-7-7h14" stroke="#b2724e"/>'],
    ['roots', '<path d="M50 10v30m0 0L25 59 16 79m9-20-11 3m36-22 23 19 12 20M73 59l15 3M50 40l-9 35-13 14m13-14 10 13m-1-48 8 32 13 18m-13-18 8-8"/><path d="M18 31h64" stroke="#cfa470"/>'],
    ['twin', '<path d="M48 86Q19 63 26 20Q64 35 48 86ZM52 86Q42 48 79 27Q87 71 52 86ZM29 26Q32 64 48 86m28-51Q66 68 52 86"/><circle cx="54" cy="24" r="10" fill="#bc7550" stroke="none"/>'],
    ['club', '<path d="M50 6 86 24v36L50 94 14 60V24Z"/><path d="m23 60 20-28 10 13 10-9 15 24M26 69h48M37 76h26"/><circle cx="65" cy="25" r="6" fill="#b97246" stroke="none"/>']
  ];

  const render = () => {
    const en = document.documentElement.lang === 'en';
    for (const kind of ['shirts','hoodies']) {
      const target = document.getElementById(kind);
      target.replaceChildren();
      for (const p of products.filter(item => item[0] === kind)) {
        const card = document.createElement('article');
        card.className = `product ${kind === 'hoodies' ? 'hoodie' : ''}`;
        card.style.cssText = `--fabric:${p[7]};--scene:${p[8]};--print:${p[9]}`;
        const mockup = document.createElement('div'); mockup.className = 'mockup';
        const garment = document.createElement('div'); garment.className = 'garment';
        const print = document.createElement('div'); print.className = 'print';
        const [style, drawing] = motifs[products.indexOf(p)];
        print.classList.add(style);
        const artwork = document.createElement('span');
        artwork.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${drawing}</svg>`;
        const wording = document.createElement('b'); wording.textContent = en ? p[4] : p[3];
        const brand = document.createElement('small'); brand.textContent = 'Veganiel';
        print.append(artwork,wording,brand); garment.append(print); mockup.append(garment);
        const info = document.createElement('div'); info.className = 'product-info';
        const tag = document.createElement('span'); tag.textContent = kind === 'hoodies' ? (en ? 'Hoodie · Concept' : 'Hoodie · Konzept') : (en ? 'T-shirt · Concept' : 'T-Shirt · Konzept');
        const title = document.createElement('h3'); title.textContent = en ? p[2] : p[1];
        const description = document.createElement('p'); description.textContent = en ? p[6] : p[5];
        info.append(tag,title,description); card.append(mockup,info); target.append(card);
      }
    }
  };
  document.addEventListener('veganiel:languagechange', render);
  render();
})();
