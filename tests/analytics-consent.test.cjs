const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..', 'daniel-suckrow-website');
const source = fs.readFileSync(path.join(root, 'scripts/analytics.js'), 'utf8');

function run({ id = 'G-TEST123', gtm = '', tcData, hasCmp = true }) {
  const appended = [];
  let listener;
  const window = {};
  if (hasCmp) window.__tcfapi = (cmd, version, cb) => { if (cmd === 'addEventListener') listener = cb; };
  const document = {
    head: { append: el => appended.push(el.src) },
    createElement: () => ({}),
    querySelector: () => (hasCmp ? {} : null),
  };
  const timers = [];
  const context = vm.createContext({ window, document, setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval: () => { timers.length = 0; }, encodeURIComponent, Date });
  const configured = source.replace(/const CONTAINER_ID = '[^']*';/, `const CONTAINER_ID = '${gtm}';`).replace(/const MEASUREMENT_ID = '[^']*';/, `const MEASUREMENT_ID = '${id}';`);
  vm.runInContext(configured, context);
  timers.slice().forEach(fn => fn());
  if (listener && tcData) listener(tcData, true);
  return appended;
}

test('without a measurement ID nothing is loaded', () => {
  assert.deepEqual(run({ id: '', tcData: { eventStatus: 'tcloaded', gdprApplies: false } }), []);
});

test('Google Analytics loads only after consent', () => {
  assert.deepEqual(run({ tcData: { eventStatus: 'cmpuishown', gdprApplies: true } }), [], 'vor der Entscheidung');
  assert.deepEqual(run({ tcData: { eventStatus: 'useractioncomplete', gdprApplies: true, purpose: { consents: { 1: false } }, vendor: { consents: { 755: true } } } }), [], 'abgelehnt');
  const granted = run({ tcData: { eventStatus: 'useractioncomplete', gdprApplies: true, purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } } });
  assert.equal(granted.length, 1);
  assert.match(granted[0], /googletagmanager\.com\/gtag\/js\?id=G-TEST123/);
});

test('Tag Manager container loads only after consent', () => {
  const tc = granted => ({ eventStatus: 'useractioncomplete', gdprApplies: true, purpose: { consents: { 1: granted } }, vendor: { consents: { 755: true } } });
  assert.deepEqual(run({ id: '', gtm: 'GTM-ABC123', tcData: tc(false) }).filter(s => /googletagmanager/.test(s)), []);
  const loaded = run({ id: '', gtm: 'GTM-ABC123', tcData: tc(true) });
  assert.ok(loaded.some(src => /googletagmanager\.com\/gtm\.js\?id=GTM-ABC123/.test(src)));
});

test('the live configuration uses the Veganiel Tag Manager container', () => {
  assert.match(source, /const CONTAINER_ID = 'GTM-KTXLBGXJ';/);
});

test('pages without ads load the consent message themselves', () => {
  const appended = run({ hasCmp: false });
  assert.ok(appended.some(src => /fundingchoicesmessages\.google\.com\/i\/pub-2996299966418101/.test(src)));
  assert.ok(!appended.some(src => /googletagmanager/.test(src)));
});

test('every page includes the consent-gated analytics script', () => {
  const pages = fs.readdirSync(root, { recursive: true }).filter(f => f.endsWith('.html') && !f.startsWith('og'));
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /<script src="\/scripts\/analytics\.js" defer><\/script>/, file);
    assert.doesNotMatch(html, /googletagmanager\.com\/(gtag|gtm)/, `${file}: Google-Tags dürfen nicht direkt eingebunden sein`);
  }
});
