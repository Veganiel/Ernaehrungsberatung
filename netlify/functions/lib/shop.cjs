const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const PRODUCT = 'veganiel-longevity-v1';
const LANGS = ['de', 'en'];
const CONSULTING = 'veganiel-consulting-v1';
// Compact package: same analysis, no video calls; intake documents and follow-up by email.
const CONSULTING_BASIC = 'veganiel-consulting-basic-v1';
const PRICES = { [PRODUCT]: '2.00', [CONSULTING]: '79.00', [CONSULTING_BASIC]: '49.00' };
const isConsulting = product => product === CONSULTING || product === CONSULTING_BASIC;
const fail = (status, message) => Object.assign(new Error(message), { status });
function key() {
  const value = process.env.PDF_ENCRYPTION_KEY || '';
  if (!/^[a-f0-9]{64}$/i.test(value)) throw fail(503, 'Shop not configured');
  return Buffer.from(value, 'hex');
}
function sign(value) { return crypto.createHmac('sha256', key()).update(value).digest('base64url'); }
function seal(data) { const value = Buffer.from(JSON.stringify(data)).toString('base64url'); return value + '.' + sign(value); }
function unseal(token) {
  if (typeof token !== 'string' || token.length > 2000) throw fail(403, 'Invalid token');
  const [value, signature, extra] = token.split('.');
  const expected = sign(value || '');
  if (extra || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw fail(403, 'Invalid token');
  let data;
  try { data = JSON.parse(Buffer.from(value, 'base64url').toString()); } catch { throw fail(403, 'Invalid token'); }
  if (!data.exp || data.exp < Date.now()) throw fail(403, 'Expired token');
  return data;
}
function asset(lang) {
  if (!LANGS.includes(lang)) throw fail(400, 'Invalid language');
  return path.join(process.cwd(), 'private-products', `longevity-${lang}.enc`);
}
function pdf(lang) {
  const encrypted = fs.readFileSync(asset(lang));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), encrypted.subarray(0, 12));
  decipher.setAuthTag(encrypted.subarray(12, 28));
  return Buffer.concat([decipher.update(encrypted.subarray(28)), decipher.final()]);
}
function configured() {
  try {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_WEBHOOK_ID && process.env.RESEND_API_KEY && LANGS.every(lang => pdf(lang).subarray(0, 5).toString() === '%PDF-'));
  } catch { return false; }
}
function apiBase() { return process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }
async function accessToken() {
  const response = await fetch(apiBase() + '/v1/oauth2/token', {
    method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', signal: AbortSignal.timeout(12000)
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw fail(502, 'PayPal unavailable');
  return data.access_token;
}
async function paypal(route, method = 'GET', body, requestId) {
  const token = await accessToken();
  const response = await fetch(apiBase() + route, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(requestId ? { 'PayPal-Request-Id': requestId } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok) throw fail(502, 'PayPal request failed');
  return data;
}
function metadata(lang, nonce, product = PRODUCT) { const value = `${product}:${lang}:${nonce}`; return value + ':' + sign(value); }
function verifyOrder(order) {
  const units = order.purchase_units;
  if (!Array.isArray(units) || units.length !== 1) throw fail(403, 'Wrong product');
  const unit = units[0];
  const [product, lang, nonce, signature, extra] = (unit.custom_id || '').split(':');
  const value = `${product}:${lang}:${nonce}`;
  if (extra || !Object.hasOwn(PRICES, product) || !LANGS.includes(lang) || !nonce || signature !== sign(value)) throw fail(403, 'Wrong product');
  const price = PRICES[product];
  const captures = unit.payments?.captures || [];
  const capture = captures.find(c => c.status === 'COMPLETED');
  if (order.status !== 'COMPLETED' || captures.length !== 1 || !capture || capture.amount?.value !== price || capture.amount?.currency_code !== 'EUR' || unit.amount?.value !== price || unit.amount?.currency_code !== 'EUR') throw fail(409, 'Payment not completed');
  if (capture.final_capture === false) throw fail(409, 'Partial payment');
  const email = order.payer?.email_address;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(502, 'PayPal email unavailable');
  return { product, lang, capture, email };
}
async function deliver(order) {
  const { product, lang, capture, email } = verifyOrder(order);
  if (product === CONSULTING_BASIC) {
    const english = lang === 'en';
    const text = english
      ? `Thank you for booking the Veganiel compact nutrition consultation (€49, without video calls). Your payment reference: ${capture.id}. I will send you the intake documents and the food diary template by email shortly. You can reach me by email with any questions. Please do not send medical records through PayPal.
Daniel Suckrow · info@veganiel.com`
      : `Vielen Dank für die Buchung der Veganiel-Ernährungsberatung Kompakt (49 €, ohne Online-Gespräche). Deine Zahlungsreferenz: ${capture.id}. Ich schicke dir in Kürze die Unterlagen zum Ausfüllen und das Dokument zur Ernährungserfassung per E-Mail. Bei Rückfragen erreichst du mich jederzeit per E-Mail. Bitte sende keine medizinischen Unterlagen über PayPal.
Daniel Suckrow · info@veganiel.com`;
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${CONSULTING_BASIC}/${capture.id}` }, body: JSON.stringify({ from: 'Veganiel <info@veganiel.com>', to: [email], bcc: ['info@veganiel.com'], reply_to: 'info@veganiel.com', subject: english ? 'Your Veganiel compact nutrition consultation' : 'Deine Veganiel-Ernährungsberatung Kompakt', text }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw fail(502, 'Email delivery pending');
    return { product, contactUrl: 'mailto:info@veganiel.com?subject=' + encodeURIComponent('Ernährungsberatung Kompakt · ' + capture.id) };
  }
  if (product === CONSULTING) {
    const english = lang === 'en';
    const text = english
      ? `Thank you for booking your Veganiel nutrition consultation (€79). Your payment reference: ${capture.id}. Please reply to this email to arrange your appointment and the next steps. Please do not send medical records through PayPal.
Daniel Suckrow · info@veganiel.com`
      : `Vielen Dank für die Buchung deiner Veganiel-Ernährungsberatung (79 €). Deine Zahlungsreferenz: ${capture.id}. Antworte bitte auf diese E-Mail, um deinen Termin und die nächsten Schritte zu vereinbaren. Bitte sende keine medizinischen Unterlagen über PayPal.
Daniel Suckrow · info@veganiel.com`;
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${CONSULTING}/${capture.id}` }, body: JSON.stringify({ from: 'Veganiel <info@veganiel.com>', to: [email], bcc: ['info@veganiel.com'], reply_to: 'info@veganiel.com', subject: english ? 'Your Veganiel nutrition consultation' : 'Deine Veganiel-Ernährungsberatung', text }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw fail(502, 'Email delivery pending');
    return { product, contactUrl: 'mailto:info@veganiel.com?subject=' + encodeURIComponent('Ernährungsberatung · ' + capture.id) };
  }
  const created = Date.parse(capture.create_time);
  if (!Number.isFinite(created)) throw fail(502, 'Invalid payment timestamp');
  const download = seal({ purpose: 'download', order: order.id, lang, exp: created + 30 * 86400000 });
  const url = 'https://veganiel.com/.netlify/functions/checkout?action=download&token=' + encodeURIComponent(download);
  const english = lang === 'en';
  const filename = english ? 'Veganiel-Longevity-Health-Full-Protocol-EN.pdf' : 'Veganiel-Longevity-Health-Protokoll-DE.pdf';
  const body = {
    from: 'Veganiel <info@veganiel.com>', to: [email], reply_to: 'info@veganiel.com',
    subject: english ? 'Your Veganiel Longevity & Health Guide' : 'Dein Veganiel Longevity & Health Guide',
    text: english ? `Thank you for your purchase! Your English PDF is attached. Download again within 30 days: ${url}\nQuestions? info@veganiel.com\nDaniel Suckrow · Veganiel` : `Vielen Dank für deinen Kauf! Deine deutsche PDF findest du im Anhang. Innerhalb von 30 Tagen erneut herunterladen: ${url}\nFragen? info@veganiel.com\nDaniel Suckrow · Veganiel`,
    attachments: [{ filename, content: pdf(lang).toString('base64') }]
  };
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${PRODUCT}/${capture.id}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw fail(502, 'Email delivery pending');
  return { downloadUrl: url };
}
module.exports = { LANGS, PRODUCT, CONSULTING, CONSULTING_BASIC, PRICES, isConsulting, fail, seal, unseal, metadata, pdf, configured, paypal, verifyOrder, deliver };
