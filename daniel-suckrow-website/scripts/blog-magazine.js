(() => {
  'use strict';
  function articleSlug(href, base) {
    try {
      const parts = new URL(href, base).pathname.split('/').filter(Boolean);
      const blog = parts.indexOf('blog');
      return blog < 0 ? null : parts[blog + 1] || null;
    } catch (_) { return null; }
  }
  if (typeof module !== 'undefined') module.exports = { articleSlug };
  if (typeof document === 'undefined') return;
  const photoBase = new URL('../assets/blog/', document.currentScript.src);
  const archive = document.querySelector('.blog-magazine');
  const grid = document.querySelector(archive ? '.journal-grid' : '#blogCards');
  if (!grid) return;
  const photos = {
    "vitamin-d-winter": {
      "theme": "science",
      "position": "50% 60%"
    },
    "achtsames-spazieren-im-wald": {
      "theme": "nature",
      "position": "50% 50%"
    },
    "zusatzstoffe-nahrungsmitteln": {
      "theme": "science",
      "position": "50% 50%"
    },
    "umgang-mit-stress": {
      "theme": "calm",
      "position": "50% 38%"
    },
    "darmreinigung-sanierung": {
      "theme": "food",
      "position": "50% 50%"
    },
    "achtsamkeit": {
      "theme": "nature",
      "position": "50% 50%"
    },
    "antioxidantien": {
      "theme": "food",
      "position": "50% 50%"
    },
    "omega-3-6-verhaeltnis": {
      "theme": "food",
      "position": "50% 50%"
    },
    "kritische-naehrstoffe-vegan": {
      "theme": "science",
      "position": "50% 50%"
    },
    "antiangiogenese": {
      "theme": "science",
      "position": "50% 50%"
    },
    "ballaststoffe": {
      "theme": "food",
      "position": "50% 50%"
    },
    "karottensaft": {
      "theme": "food",
      "position": "50% 58%"
    },
    "vitamin-b12": {
      "theme": "science",
      "position": "50% 50%"
    },
    "diskriminierung": {
      "theme": "calm",
      "position": "50% 50%"
    },
    "bioaktive-verbindungen": {
      "theme": "science",
      "position": "50% 50%"
    },
    "veganismus-chancen-herausforderungen": {
      "theme": "food",
      "position": "50% 50%"
    },
    "telomere": {
      "theme": "science",
      "position": "50% 50%"
    },
    "supplemente": {
      "theme": "science",
      "position": "50% 50%"
    },
    "weniger-salz": {
      "theme": "food",
      "position": "50% 50%"
    },
    "kritische-naehrstoffe": {
      "theme": "food",
      "position": "50% 50%"
    },
    "omega-fettsaeuren": {
      "theme": "food",
      "position": "50% 50%"
    }
  };
  const cards = [...grid.querySelectorAll('.card')];
  cards.forEach((card, index) => {
    const number=card.querySelector('.num');
    if(number){const category=number.textContent.split('·').slice(1).join('·').trim();number.textContent=String(index+1).padStart(2,'0')+' · '+category;}
    const slug = articleSlug(card.getAttribute('href'), location.href);
    const photo = photos[slug];
    if (!photo) return;
    const theme = photo.theme;
    card.dataset.topic = theme;
    const cover = document.createElement('div');
    cover.className = 'journal-cover';
    cover.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.src = new URL(slug + '.jpg', photoBase).href;
    image.alt = ''; // Decorative: the adjoining article heading names the linked content.
    image.width = 1200;
    image.height = 800;
    image.loading = archive && index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.style.objectPosition = photo.position;
    cover.append(image);
    const body = document.createElement('div');
    body.className = 'journal-body';
    while (card.firstChild) body.append(card.firstChild);
    card.append(cover, body);
  });
  if (!archive) return;
  const search = document.getElementById('journal-search');
  let topic = 'all';
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      card.hidden = (topic !== 'all' && card.dataset.topic !== topic) || !card.textContent.toLocaleLowerCase().includes(query);
      if (!card.hidden) count++;
    });
    document.getElementById('journal-count').textContent = `${count} / ${cards.length}`;
    document.getElementById('journal-empty').hidden = count !== 0;
  };
  search.addEventListener('input', update);
  document.querySelectorAll('[data-journal-filter]').forEach(button => button.addEventListener('click', () => {
    topic = button.dataset.journalFilter;
    document.querySelectorAll('[data-journal-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  }));
  update();
})();
