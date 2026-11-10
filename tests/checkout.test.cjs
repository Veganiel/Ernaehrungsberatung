const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const shop = require('../netlify/functions/lib/shop.cjs');
const { handler } = require('../netlify/functions/checkout.cjs');
const path = require('node:path');
const os = require('node:os');
const originalCwd = process.cwd();
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'veganiel-checkout-'));
process.chdir(fixtureDir);
fs.mkdirSync('private-products');
process.env.PDF_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
const originals = { de: Buffer.from('%PDF-1.7 German fixture'), en: Buffer.from('%PDF-1.7 English fixture') };
for (const lang of ['de', 'en']) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.PDF_ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(originals[lang]), cipher.final()]);
  fs.writeFileSync(`private-products/longevity-${lang}.enc`, Buffer.concat([iv, cipher.getAuthTag(), encrypted]));
}
process.on('exit', () => { process.chdir(originalCwd); fs.rmSync(fixtureDir, { recursive: true, force: true }); });
function order(lang = 'en') { return { id: 'ORDER1234567890', status: 'COMPLETED', payer: { email_address: 'buyer@example.com' }, purchase_units: [{ custom_id: shop.metadata(lang, 'test-nonce'), amount: { value: '2.00', currency_code: 'EUR' }, payments: { captures: [{ id: 'CAPTURE123456', status: 'COMPLETED', amount: { value: '2.00', currency_code: 'EUR' }, create_time: new Date().toISOString() }] } }] }; }
test('both encrypted assets decrypt to the original PDFs; wrong key rejected', () => {
  assert.deepEqual(shop.pdf('de'), originals.de);
  assert.deepEqual(shop.pdf('en'), originals.en);
  const original = process.env.PDF_ENCRYPTION_KEY;
  process.env.PDF_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
  assert.throws(() => shop.pdf('en'));
  process.env.PDF_ENCRYPTION_KEY = original;
});
test('only correctly paid, signed product orders pass', () => {
  assert.equal(shop.verifyOrder(order()).lang, 'en');
  for (const mutate of [o => o.status = 'APPROVED', o => o.purchase_units[0].payments.captures[0].amount.value = '0.01', o => o.purchase_units[0].amount.currency_code = 'USD', o => o.purchase_units[0].custom_id = 'unknown', o => o.purchase_units[0].custom_id = o.purchase_units[0].custom_id.replace(':en:', ':de:'), o => o.purchase_units[0].payments.captures[0].status = 'REFUNDED', o => delete o.payer.email_address]) {
    const o = order(); mutate(o); assert.throws(() => shop.verifyOrder(o));
  }
});
test('tokens reject tampering, expiry and oversized input', () => {
  const token = shop.seal({ exp: Date.now() + 10000, lang: 'de' });
  assert.equal(shop.unseal(token).lang, 'de');
  assert.throws(() => shop.unseal(token + 'x'));
  assert.throws(() => shop.unseal(shop.seal({ exp: Date.now() - 1 })));
  assert.throws(() => shop.unseal('x'.repeat(2001)));
});
test('unconfigured checkout fails closed and does not leak secrets', async () => {
  const result = await handler({ httpMethod: 'GET', queryStringParameters: { action: 'config' } });
  assert.deepEqual(JSON.parse(result.body), { ready: false });
  assert.equal((await handler({ httpMethod: 'POST', queryStringParameters: { action: 'create' } })).statusCode, 503);
});
test('delivery uses PayPal email and selected PDF; stable idempotency and message', async () => {
  const original = global.fetch; const requests = [];
  global.fetch = async (url, options) => { requests.push({ url, options }); return { ok: true }; };
  try {
    const o = order('en'); await shop.deliver(o); await shop.deliver(o);
    const sent = JSON.parse(requests[0].options.body);
    assert.deepEqual(sent.to, ['buyer@example.com']);
    assert.match(sent.attachments[0].filename, /EN.pdf$/);
    assert.deepEqual(Buffer.from(sent.attachments[0].content, 'base64'), shop.pdf('en'));
    assert.equal(requests[0].options.headers['Idempotency-Key'], requests[1].options.headers['Idempotency-Key']);
    assert.equal(requests[0].options.body, requests[1].options.body);
  } finally { global.fetch = original; }
});

function enable() {
  Object.assign(process.env, { PAYPAL_CLIENT_ID: 'test-client', PAYPAL_CLIENT_SECRET: 'test-secret', PAYPAL_WEBHOOK_ID: 'test-hook', RESEND_API_KEY: 'test-resend' });
}
test('rejects foreign origin and missing consent before creating orders', async () => {
  enable();
  assert.equal((await handler({ httpMethod: 'POST', headers: { origin: 'https://attacker.example' }, queryStringParameters: { action: 'create' }, body: '{}' })).statusCode, 403);
  assert.equal((await handler({ httpMethod: 'POST', headers: { origin: 'https://veganiel.com' }, queryStringParameters: { action: 'create' }, body: JSON.stringify({ lang: 'en', digitalConsent: false }) })).statusCode, 400);
});
test('invalid webhook signatures never trigger delivery', async () => {
  const original = global.fetch; let calls = 0;
  global.fetch = async url => { calls++; return { ok: true, json: async () => url.endsWith('/token') ? { access_token: 'test' } : { verification_status: 'FAILURE' } }; };
  try {
    const response = await handler({ httpMethod: 'POST', headers: {}, queryStringParameters: { action: 'webhook' }, body: JSON.stringify({ event_type: 'PAYMENT.CAPTURE.COMPLETED' }) });
    assert.equal(response.statusCode, 403); assert.equal(calls, 2);
  } finally { global.fetch = original; }
});
test('email failure after completed payment returns a download, never asks for another charge', async () => {
  const original = global.fetch; let captured = false;
  global.fetch = async url => {
    if (url.endsWith('/capture')) captured = true;
    if (url.includes('resend.com')) return { ok: false };
    return { ok: true, json: async () => url.endsWith('/token') ? { access_token: 'test' } : order('de') };
  };
  try {
    const receipt = shop.seal({ purpose: 'capture', order: 'ORDER1234567890', lang: 'de', exp: Date.now() + 10000 });
    const response = await handler({ httpMethod: 'POST', headers: { origin: 'https://veganiel.com' }, queryStringParameters: { action: 'capture' }, body: JSON.stringify({ receipt }) });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200); assert.equal(body.paid, true); assert.equal(body.emailed, false); assert.match(body.downloadUrl, /token=/); assert.equal(captured, false);
  } finally { global.fetch = original; }
});
test('consultation requires exactly EUR 79 and sends booking confirmation without a PDF', async () => {
  const o = order('de');
  o.purchase_units[0].custom_id = shop.metadata('de', 'consultation', shop.CONSULTING);
  o.purchase_units[0].amount.value = o.purchase_units[0].payments.captures[0].amount.value = '79.00';
  assert.equal(shop.verifyOrder(o).product, shop.CONSULTING);
  const originalFetch = global.fetch;
  let sent;
  global.fetch = async (url, options) => { sent = JSON.parse(options.body); return { ok: true }; };
  try {
    const result = await shop.deliver(o);
    assert.match(result.contactUrl, /^mailto:info@veganiel.com/);
    assert.equal(sent.attachments, undefined);
    assert.deepEqual(sent.bcc, ['info@veganiel.com']);
    assert.match(sent.text, /Termin/);
  } finally { global.fetch = originalFetch; }
  o.purchase_units[0].payments.captures[0].amount.value = '2.00';
  assert.throws(() => shop.verifyOrder(o));
});
test('compact consultation requires exactly EUR 49, never accepts the 79 price, and promises documents instead of calls', async () => {
  const o = order('de');
  o.purchase_units[0].custom_id = shop.metadata('de', 'compact', shop.CONSULTING_BASIC);
  o.purchase_units[0].amount.value = o.purchase_units[0].payments.captures[0].amount.value = '49.00';
  assert.equal(shop.verifyOrder(o).product, shop.CONSULTING_BASIC);
  const originalFetch = global.fetch; let sent, headers;
  global.fetch = async (url, options) => { sent = JSON.parse(options.body); headers = options.headers; return { ok: true }; };
  try {
    const result = await shop.deliver(o);
    assert.match(result.contactUrl, /Kompakt/);
    assert.equal(sent.attachments, undefined);
    assert.deepEqual(sent.bcc, ['info@veganiel.com']);
    assert.match(sent.text, /49 €/); assert.match(sent.text, /Unterlagen/); assert.doesNotMatch(sent.text, /Termin/);
    assert.match(headers['Idempotency-Key'], /basic/);
  } finally { global.fetch = originalFetch; }
  for (const value of ['79.00', '2.00', '48.99']) { const x = JSON.parse(JSON.stringify(o)); x.purchase_units[0].amount.value = x.purchase_units[0].payments.captures[0].amount.value = value; assert.throws(() => shop.verifyOrder(x)); }
  const full = order('de'); full.purchase_units[0].custom_id = shop.metadata('de', 'full', shop.CONSULTING);
  full.purchase_units[0].amount.value = full.purchase_units[0].payments.captures[0].amount.value = '49.00';
  assert.throws(() => shop.verifyOrder(full), 'the full package cannot be bought for 49');
});
test('compact consultation orders are created for EUR 49 and need service consent', async () => {
  enable();
  const original = global.fetch; let created;
  global.fetch = async (url, options) => { if (url.endsWith('/v2/checkout/orders')) created = JSON.parse(options.body); return { ok: true, json: async () => url.endsWith('/token') ? { access_token: 't' } : { id: 'ORDERCOMPACT12345' } }; };
  try {
    const bad = await handler({ httpMethod: 'POST', headers: { origin: 'https://veganiel.com' }, queryStringParameters: { action: 'create' }, body: JSON.stringify({ lang: 'de', product: 'consulting-basic', serviceConsent: false }) });
    assert.equal(bad.statusCode, 400);
    const ok = await handler({ httpMethod: 'POST', headers: { origin: 'https://veganiel.com' }, queryStringParameters: { action: 'create' }, body: JSON.stringify({ lang: 'de', product: 'consulting-basic', serviceConsent: true }) });
    assert.equal(ok.statusCode, 200);
    assert.equal(created.purchase_units[0].amount.value, '49.00');
    assert.equal(created.purchase_units[0].reference_id, shop.CONSULTING_BASIC);
  } finally { global.fetch = original; }
});
