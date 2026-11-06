(() => {
  'use strict';
  const archive = document.querySelector('.blog-magazine');
  const grid = document.querySelector(archive ? '.journal-grid' : '#blogCards');
  if (!grid) return;
  const illustrations = {
    nature: `<rect width="600" height="360" fill="#cbd7b1"/><circle cx="450" cy="100" r="56" fill="#f3e5af"/><path d="M0 260Q160 150 330 250T600 230V360H0" fill="#94ae83"/><path d="M0 300Q210 220 600 290V360H0" fill="#426f52"/><path d="M280 360Q350 310 320 280Q290 245 340 228" fill="none" stroke="#e4d8ad" stroke-width="30"/><g fill="#214a37"><path d="M70 0h15v360H70zM480 0h19v360h-19zM160 0h11v300h-11z"/><path d="M-30 0H230Q190 90 95 120Q10 165-30 95M360 0H630V150Q550 155 530 100Q420 140 360 0"/></g><g fill="#6f915f"><ellipse cx="110" cy="70" rx="65" ry="30" transform="rotate(-30 110 70)"/><ellipse cx="490" cy="50" rx="75" ry="35" transform="rotate(25 490 50)"/></g>`,
    food: `<rect width="600" height="360" fill="#f1d9bb"/><circle cx="300" cy="180" r="145" fill="#fff7e7"/><circle cx="300" cy="180" r="114" fill="#e5e9c9"/><g fill="#597c47"><ellipse cx="260" cy="130" rx="30" ry="65" transform="rotate(-40 260 130)"/><ellipse cx="330" cy="130" rx="30" ry="60" transform="rotate(38 330 130)"/><ellipse cx="350" cy="210" rx="35" ry="55" transform="rotate(65 350 210)"/></g><g fill="#d16d42"><circle cx="250" cy="227" r="35"/><circle cx="304" cy="248" r="26"/></g><g fill="#e9b954"><circle cx="310" cy="173" r="16"/><circle cx="340" cy="178" r="12"/><circle cx="295" cy="202" r="13"/></g><path d="M90 70v210m-16-210v65q16 22 32 0V70m405 0v210m0-210q-45 40 0 105" fill="none" stroke="#b58e64" stroke-width="8" stroke-linecap="round"/>`,
    calm: `<rect width="600" height="360" fill="#dbdfeb"/><circle cx="300" cy="145" r="83" fill="#e5b39e"/><path d="M0 245Q145 180 300 252T600 240V360H0" fill="#a3b4a5"/><path d="M0 305Q230 220 600 295V360H0" fill="#527467"/><path d="M245 263q55-30 110 0m-94-28q39-17 78 0m-56-27q17-8 34 0" fill="none" stroke="#f9efde" stroke-width="4" stroke-linecap="round"/><path d="M110 110q12-15 25 0q13-15 25 0m270-32q12-15 25 0q13-15 25 0" fill="none" stroke="#687b75" stroke-width="4"/>`,
    science: `<rect width="600" height="360" fill="#d9e5d8"/><circle cx="300" cy="180" r="110" fill="#b7ceae"/><g fill="none" stroke="#426d51" stroke-width="3"><ellipse cx="300" cy="180" rx="170" ry="60" transform="rotate(35 300 180)"/><ellipse cx="300" cy="180" rx="170" ry="60" transform="rotate(-35 300 180)"/><ellipse cx="300" cy="180" rx="60" ry="145"/></g><g fill="#e8bb77"><circle cx="168" cy="98" r="18"/><circle cx="440" cy="109" r="14"/><circle cx="300" cy="323" r="14"/></g><circle cx="300" cy="180" r="28" fill="#214a37"/>`
  };
  const cards = [...grid.querySelectorAll('.card')];
  cards.forEach(card => {
    const slug = card.getAttribute('href');
    const theme = /wald|achtsamkeit/.test(slug) ? 'nature' : /stress|diskriminierung/.test(slug) ? 'calm' : /telomere|antiangiogenese|bioaktive|zusatzstoffe|supplement|vitamin/.test(slug) ? 'science' : 'food';
    card.dataset.topic = theme;
    const cover = document.createElement('div');
    cover.className = 'journal-cover';
    cover.setAttribute('aria-hidden', 'true');
    cover.innerHTML = `<svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${illustrations[theme]}</svg>`;
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
