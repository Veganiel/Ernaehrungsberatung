const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'daniel-suckrow-website');
const dictionary = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
const decode = value => value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const normalise = value => decode(value).replace(/\s+/g, ' ').trim();

const pages = fs.readdirSync(root, { recursive: true })
  .filter(file => file.endsWith('.html') && !file.startsWith('og'))
  .map(file => ({ file, html: fs.readFileSync(path.join(root, file), 'utf8') }))
  .map(page => ({ ...page, head: page.html.split('</head>')[0] }))
  .filter(page => !/<meta\s+name="robots"\s+content="[^"]*noindex/.test(page.head) && /rel="canonical"/.test(page.head))
  .map(page => ({ ...page, english: page.file.split(path.sep).join('/').startsWith('en/') }));
// Pages with their own English file under en/ (scripts/build_english_pages.py) instead of ?lang=en.
const canonicalOf = head => head.match(/<link rel="canonical" href="([^"]+)">/)[1];
const alternates = head => Object.fromEntries([...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]));
const byUrl = new Map(pages.map(page => [canonicalOf(page.head), page]));

test('every public page has its own German and English share image', () => {
  const seen = new Set();
  assert.ok(pages.length >= 40, 'zu wenige Seiten gefunden');
  for (const { file, head, english } of pages) {
    const image = head.match(/<meta property="og:image" content="https:\/\/veganiel\.com\/(og\/[^"]+\.jpg)">/)?.[1];
    assert.ok(image, `${file}: kein eigenes og:image`);
    assert.ok(!seen.has(image), `${file}: Vorschaubild doppelt verwendet`);
    seen.add(image);
    assert.ok(fs.existsSync(path.join(root, image)), `${file}: ${image} fehlt`);
    if (english) assert.match(image, /-en\.jpg$/, `${file}: englische Seite braucht das -en-Vorschaubild`);
    else assert.ok(fs.existsSync(path.join(root, image.replace(/\.jpg$/, '-en.jpg'))), `${file}: englisches Vorschaubild fehlt`);
    assert.match(head, /<meta name="twitter:card" content="summary_large_image">/, file);
    assert.match(head, new RegExp(`<meta name="twitter:image" content="https://veganiel\\.com/${image}">`), file);
    assert.match(head, /<meta property="og:image:width" content="1200">/, file);
  }
});

test('every public page links its German and English version with hreflang', () => {
  for (const { file, head, english } of pages) {
    const canonical = canonicalOf(head);
    const alt = alternates(head);
    assert.ok(alt['x-default'], `${file}: x-default fehlt`);
    if (english) {
      assert.equal(alt.en, canonical, `${file}: hreflang en muss auf die Seite selbst zeigen`);
      assert.equal(alt['x-default'], alt.de, `${file}: x-default zeigt auf die deutsche Seite`);
      assert.equal(alternates(byUrl.get(alt.de)?.head || '').en, canonical, `${file}: deutsche Seite verlinkt nicht zurück`);
    } else {
      assert.equal(alt.de, canonical, `${file}: hreflang de`);
      if (alt.en !== canonical + '?lang=en') {
        assert.equal(alternates(byUrl.get(alt.en)?.head || '').de, canonical, `${file}: englische Seite ${alt.en} fehlt oder verlinkt nicht zurück`);
      }
    }
    for (const key of ['og:title', 'og:description', 'og:url', 'og:locale']) assert.match(head, new RegExp(`property="${key}"`), `${file}: ${key}`);
  }
});

test('titles and descriptions have English translations for the ?lang=en version', () => {
  const missing = [];
  for (const { file, head, english } of pages) {
    if (english) continue; // already English, no ?lang=en version
    const title = normalise(head.match(/<title>([\s\S]*?)<\/title>/)[1]);
    const description = head.match(/<meta name="description" content="([^"]*)">/)?.[1];
    if (!dictionary[title]) missing.push(`${file}: Titel`);
    if (description && !dictionary[normalise(description)]) missing.push(`${file}: Beschreibung`);
  }
  assert.deepEqual(missing, []);
});

test('edge function serves the English head for ?lang=en', async () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'netlify/edge-functions/seo-language.js'), 'utf8');
  const mod = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const page = pages.find(p => p.file === 'saisonkalender-juli.html');
  const out = mod.toEnglish(page.html, dictionary);
  const head = out.split('</head>')[0];
  assert.match(head, /<html lang="en"/);
  assert.match(head, /<title>Seasonal calendar July/);
  assert.match(head, /<link rel="canonical" href="https:\/\/veganiel\.com\/saisonkalender-juli\.html\?lang=en">/);
  assert.match(head, /property="og:image" content="https:\/\/veganiel\.com\/og\/saisonkalender-juli-en\.jpg"/);
  assert.match(head, /property="og:locale" content="en_GB"/);
  assert.match(head, /name="description" content="What is in season in July\?/);
  assert.equal(out.split('</head>')[1], page.html.split('</head>')[1], 'Body bleibt unverändert');
  // Ohne ?lang=en wird nichts verändert
  assert.equal(await mod.default(new Request('https://veganiel.com/saisonkalender-juli.html'), {}), undefined);
  assert.ok(mod.config.excludedPath.includes('/og/*'));
});
