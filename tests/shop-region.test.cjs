const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../netlify/edge-functions/shop-region.js'), 'utf8');
const modulePromise = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('shop is available regardless of visitor region', async () => {
  const { default: handler } = await modulePromise;
  for (const country of ['DE', 'FR', 'SE', 'CH', 'GB', 'US', undefined]) {
    const context = { geo: { country: { code: country } }, next: async () => new Response('shop') };
    const region = await handler(new Request('https://veganiel.com/shop-region'), context);
    assert.equal((await region.json()).available, true, country);
    const page = await handler(new Request('https://veganiel.com/shop.html'), context);
    assert.equal(page.status, 200, country);
  }
});
