const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'daniel-suckrow-website');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('saisonkalender.html');
const dictionary = JSON.parse(read('locales/en.json'));
const normalise = value => value.replace(/\s+/g, ' ').trim();
const decode = value => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

const months = [...html.matchAll(/<article class="month" id="([a-z]+)">(.*?)<\/article>/g)].map(match => ({
  id: match[1],
  name: match[2].match(/<h3>([^<]+)<\/h3>/)[1],
  items: [...match[2].matchAll(/<li( class="fruit")?>([^<]+)<\/li>/g)].map(item => ({ text: decode(item[2]), fruit: Boolean(item[1]) }))
}));

test('twelve months in calendar order with unique anchors', () => {
  assert.deepEqual(months.map(month => month.id), ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember']);
  assert.deepEqual(months.map(month => month.name), ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']);
});

test('every month lists vegetables and fruit without duplicates', () => {
  for (const month of months) {
    const names = month.items.map(item => item.text);
    assert.equal(new Set(names).size, names.length, `${month.name}: doppelte Einträge`);
    assert.ok(month.items.some(item => item.fruit), `${month.name}: kein Obst`);
    assert.ok(month.items.some(item => !item.fruit), `${month.name}: kein Gemüse`);
    assert.ok(names.length >= 6, `${month.name}: zu wenige Einträge`);
  }
});

test('month navigation links to every month card', () => {
  const nav = [...html.matchAll(/<nav class="month-nav"[^>]*>(.*?)<\/nav>/g)][0][1];
  const targets = [...nav.matchAll(/href="#([a-z]+)"/g)].map(match => match[1]);
  assert.deepEqual(targets, months.map(month => month.id));
});

test('visible content is static: scripts no longer overwrite headings or fruit lists', () => {
  const scenes = read('scripts/season-scenes.js');
  assert.doesNotMatch(scenes, /fruitSelection|innerHTML='Mit den Jahreszeiten|now-picks/);
  assert.doesNotMatch(html, /data-veg=|data-fruit=/);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
});

test('search and sharing metadata is complete', () => {
  const title = decode(html.match(/<title>([^<]+)<\/title>/)[1]);
  const description = decode(html.match(/<meta name="description" content="([^"]+)"/)[1]);
  assert.match(title, /Saisonkalender/);
  assert.ok(description.length >= 70 && description.length <= 175, `Beschreibung hat ${description.length} Zeichen`);
  for (const property of ['og:title', 'og:description', 'og:image', 'og:url', 'og:locale']) assert.match(html, new RegExp(`property="${property}"`), property);
  for (const name of ['twitter:card', 'twitter:image']) assert.match(html, new RegExp(`name="${name}"`), name);
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(data['@type'], 'WebPage');
  assert.equal(data.url, 'https://veganiel.com/saisonkalender.html');
  const image = html.match(/property="og:image" content="https:\/\/veganiel\.com\/([^"]+)"/)[1];
  assert.ok(fs.existsSync(path.join(root, image)), `og:image fehlt im Publish-Verzeichnis: ${image}`);
});

test('the page loads the shared translation layer and every visible text has an English entry', () => {
  assert.match(html, /<link rel="stylesheet" href="i18n\.css">/);
  assert.match(html, /<script src="i18n\.js[^"]*" defer><\/script>/);
  const body = html.slice(html.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, '');
  const strings = new Set();
  for (const match of body.matchAll(/>([^<>]+)</g)) strings.add(normalise(decode(match[1])));
  for (const match of body.matchAll(/(?:aria-label|alt|title|placeholder)="([^"]+)"/g)) strings.add(normalise(decode(match[1])));
  ['Jetzt Saison', 'Alle Zutaten werden angezeigt.', 'Es wird nur Gemüse angezeigt.', 'Es wird nur Obst angezeigt.'].forEach(text => strings.add(text));
  const missing = [...strings].filter(text => /[A-Za-zÄÖÜäöüß]/.test(text) && !(text in dictionary));
  assert.deepEqual(missing, [], 'Fehlende englische Übersetzungen');
});

test('stylesheet is loaded in the head so month cards do not shift after first paint', () => {
  const head = html.slice(0, html.indexOf('<body'));
  assert.match(head, /styles\/season-scenes\.css/);
  assert.match(html, /<script src="scripts\/season-scenes\.js" defer><\/script>/);
});
