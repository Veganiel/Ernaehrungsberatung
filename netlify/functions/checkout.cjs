const crypto = require('node:crypto');
const shop = require('./lib/shop.cjs');
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (statusCode, data) => ({ statusCode, headers, body: JSON.stringify(data) });
exports.handler = async event => {
  try {
    const action = event.queryStringParameters?.action;
    if (action === 'config' && event.httpMethod === 'GET') {
      const ready = shop.configured();
      return json(200, { ready, ...(ready ? { clientId: process.env.PAYPAL_CLIENT_ID, mode: process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox' } : {}) });
    }
    if (action === 'download' && event.httpMethod === 'GET') {
      const data = shop.unseal(event.queryStringParameters.token);
      if (data.purpose !== 'download' || !shop.LANGS.includes(data.lang)) throw shop.fail(403, 'Invalid download');
      // A refunded/reversed payment must no longer grant a new download.
      const order = await shop.paypal('/v2/checkout/orders/' + encodeURIComponent(data.order));
      const verified = shop.verifyOrder(order);
      if (verified.product !== shop.PRODUCT || verified.lang !== data.lang) throw shop.fail(403, 'Wrong language');
      return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="Veganiel-Longevity-${data.lang.toUpperCase()}.pdf"` }, isBase64Encoded: true, body: shop.pdf(data.lang).toString('base64') };
    }
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
    if (!shop.configured()) return json(503, { error: 'Shop not configured' });
    if ((event.body || '').length > 100000) return json(413, { error: 'Request too large' });
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Invalid JSON' }); }
    if (action === 'webhook') {
      const h = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
      const result = await shop.paypal('/v1/notifications/verify-webhook-signature', 'POST', {
        auth_algo: h['paypal-auth-algo'], cert_url: h['paypal-cert-url'], transmission_id: h['paypal-transmission-id'], transmission_sig: h['paypal-transmission-sig'], transmission_time: h['paypal-transmission-time'], webhook_id: process.env.PAYPAL_WEBHOOK_ID, webhook_event: body
      });
      if (result.verification_status !== 'SUCCESS') return json(403, { error: 'Invalid signature' });
      if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const id = body.resource?.supplementary_data?.related_ids?.order_id;
        if (!/^[A-Z0-9]{10,40}$/.test(id || '')) return json(400, { error: 'Missing order' });
        const order = await shop.paypal('/v2/checkout/orders/' + id);
        await shop.deliver(order);
      }
      return json(200, { received: true });
    }
    const origin = event.headers?.origin || event.headers?.Origin;
    const allowed = ['https://veganiel.com', 'https://www.veganiel.com', process.env.DEPLOY_PRIME_URL].filter(Boolean);
    if (!origin || !allowed.includes(origin)) return json(403, { error: 'Invalid origin' });
    if (action === 'create') {
      if (!shop.LANGS.includes(body.lang) || (body.product === 'consulting' ? body.serviceConsent !== true : body.digitalConsent !== true)) return json(400, { error: 'Language and consent required' });
      const product = body.product === 'consulting' ? shop.CONSULTING : shop.PRODUCT;
      const price = product === shop.CONSULTING ? '79.00' : '2.00';
      const nonce = crypto.randomUUID();
      const order = await shop.paypal('/v2/checkout/orders', 'POST', {
        intent: 'CAPTURE', purchase_units: [{ reference_id: product, custom_id: shop.metadata(body.lang, nonce, product), description: product === shop.CONSULTING ? 'Veganiel Ernährungsberatung / Nutrition consultation' : `Veganiel Longevity & Health Full Protocol · ${body.lang.toUpperCase()} · PDF`, amount: { currency_code: 'EUR', value: price } }],
        payment_source: { paypal: { experience_context: { brand_name: 'Veganiel', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' } } }
      }, nonce);
      if (!/^[A-Z0-9]{10,40}$/.test(order.id || '')) throw shop.fail(502, 'Invalid PayPal order');
      return json(200, { id: order.id, receipt: shop.seal({ purpose: 'capture', order: order.id, product, lang: body.lang, exp: Date.now() + 6 * 3600000 }) });
    }
    if (action === 'capture') {
      const receipt = shop.unseal(body.receipt);
      if (receipt.purpose !== 'capture' || !/^[A-Z0-9]{10,40}$/.test(receipt.order || '')) throw shop.fail(403, 'Invalid receipt');
      let order = await shop.paypal('/v2/checkout/orders/' + receipt.order);
      if (order.status !== 'COMPLETED') {
        try { order = await shop.paypal('/v2/checkout/orders/' + receipt.order + '/capture', 'POST', {}, 'capture-' + receipt.order); }
        catch { order = await shop.paypal('/v2/checkout/orders/' + receipt.order); }
      }
      const verified = shop.verifyOrder(order);
      if ((receipt.product && verified.product !== receipt.product) || verified.lang !== receipt.lang) throw shop.fail(403, 'Wrong product language');
      try { return json(200, { paid: true, emailed: true, ...await shop.deliver(order) }); }
      catch {
        // Payment is complete: do not invite another payment when email is delayed.
        if (verified.product === shop.CONSULTING) return json(200, { paid: true, emailed: false, product: verified.product, contactUrl: 'mailto:info@veganiel.com?subject=' + encodeURIComponent('Ernährungsberatung · ' + verified.capture.id) });
        const created = Date.parse(verified.capture.create_time);
        const token = shop.seal({ purpose: 'download', order: order.id, lang: verified.lang, exp: created + 30 * 86400000 });
        return json(200, { paid: true, emailed: false, downloadUrl: '/.netlify/functions/checkout?action=download&token=' + encodeURIComponent(token) });
      }
    }
    return json(404, { error: 'Unknown action' });
  } catch (error) {
    // Do not log credentials, payer details, tokens or complete provider responses.
    console.error('Checkout failed:', error.status || 500);
    return json(error.status || 500, { error: 'Checkout unavailable' });
  }
};
