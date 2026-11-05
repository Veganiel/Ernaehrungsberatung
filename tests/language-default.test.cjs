const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const source = fs.readFileSync('netlify/edge-functions/language-default.js', 'utf8');
  const { default: handler, config } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.equal(config.path, '/language-default');
  for (const [country, expected] of [['DE', 'de'], ['US', 'en'], ['AT', 'de'], ['CH', 'de'], [undefined, 'en']]) {
    const response = handler(new Request('https://veganiel.com/language-default'), { geo: { country: { code: country } } });
    assert.deepEqual(await response.json(), { language: expected });
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  assert.deepEqual(await handler(null, {}).json(), { language: 'en' });
  console.log('PASS country defaults and uncached responses');
})().catch(error => { console.error(error); process.exit(1); });
