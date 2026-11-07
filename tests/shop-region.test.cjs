const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../netlify/edge-functions/shop-region.js'), 'utf8');
const modulePromise = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('EU visitors can see shop; others cannot', async () => {
  const { default: handler } = await modulePromise;
  for (const [country, allowed] of [['DE', true], ['FR', true], ['SE', true], ['CH', false], ['GB', false], ['US', false], [undefined, false]]) {
    const context = { geo: { country: { code: country } }, next: async () => new Response('shop') };
    const region = await handler(new Request('https://veganiel.com/shop-region'), context);
    assert.equal((await region.json()).available, allowed, country);
    const page = await handler(new Request('https://veganiel.com/shop.html'), context);
    assert.equal(page.status, allowed ? 200 : 404, country);
  }
});
