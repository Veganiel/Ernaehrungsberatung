const { test } = require('node:test');
const assert = require('node:assert/strict');
const { articleSlug } = require('../daniel-suckrow-website/scripts/blog-magazine.js');

test('photo mapping supports source links and Netlify rewritten production links', () => {
  const base = 'https://veganiel.com/blog-uebersicht';
  for (const href of [
    'blog/achtsamkeit/index.html',
    '/blog/achtsamkeit/',
    '/blog/achtsamkeit',
    'https://veganiel.com/blog/achtsamkeit/?lang=en',
    '/blog/achtsamkeit/index.html#community'
  ]) assert.equal(articleSlug(href, base), 'achtsamkeit', href);
  assert.equal(articleSlug('../../blog/karottensaft/', 'https://veganiel.com/blog/example/'), 'karottensaft');
  assert.equal(articleSlug('/angebot.html', base), null);
  assert.equal(articleSlug('/blog/', base), null);
});
