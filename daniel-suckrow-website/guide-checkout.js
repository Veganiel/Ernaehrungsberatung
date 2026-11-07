/* PayPal loads only after the buyer explicitly starts checkout. */
(() => {
  'use strict';
  const root = document.getElementById('guide-checkout');
  if (!root) return;
  const consulting = root.dataset.product === 'consulting';
  const language = root.querySelector('select');
  const consent = root.querySelector('input');
  const terms = root.querySelector('[data-terms-consent]');
  const start = root.querySelector('button');
  const status = root.querySelector('[role="status"]');
  const buttons = document.getElementById('paypal-buttons');
  const retry = root.querySelector('[data-retry]');
  let ready = false, config, sdk, receipt, selected = false, locked = false;
  const copy = {
    de: { acceptTerms: 'Ich stimme den', acceptTermsEnd: 'zu.', withdrawal: 'Widerruf', language: 'Sprache deiner PDF', price: 'Einmalig · 2,00 € · PDF per E-Mail', consent: 'Ich stimme ausdrücklich zu, dass die Bereitstellung der PDF vor Ablauf der Widerrufsfrist beginnt. Ich weiß, dass ich dadurch mein Widerrufsrecht verliere.', start: 'Mit PayPal kaufen · 2,00 €', loading: 'Zahlung wird vorbereitet …', unavailable: 'Der Verkauf wird eingerichtet. Momentan werden keine Zahlungen angenommen.', intro: 'Wähle deine PDF-Sprache. Die PDF geht nach bestätigter Zahlung an deine bei PayPal hinterlegte E-Mail-Adresse.', cancelled: 'Zahlung abgebrochen. Du wurdest nicht belastet.', error: 'Die Zahlung konnte nicht bestätigt werden. Bitte prüfe zuerst dein PayPal-Konto und versuche die Bestätigung erneut.', success: 'Vielen Dank! Deine PDF wurde zum Versand an deine PayPal-E-Mail-Adresse angenommen. Prüfe auch den Spamordner.', delayed: 'Die Zahlung ist abgeschlossen. Der E-Mail-Versand ist verzögert. Lade deine PDF hier herunter; bitte nicht erneut bezahlen.', download: 'Deine PDF herunterladen', retry: 'Zahlung erneut prüfen', legal: 'Information zur sofortigen Bereitstellung', help: 'Fragen? info@veganiel.com' },
    en: { acceptTerms: 'I agree to the terms (', acceptTermsEnd: ').', withdrawal: 'Withdrawal', language: 'PDF language', price: 'One-time payment · €2.00 · PDF by email', consent: 'I expressly agree that the PDF will be supplied before the withdrawal period ends. I acknowledge that I thereby lose my right of withdrawal.', start: 'Buy with PayPal · €2.00', loading: 'Preparing checkout …', unavailable: 'Checkout is being set up. No payments are currently accepted.', intro: 'Choose your PDF language. After confirmed payment, the PDF is sent to the email address registered with PayPal.', cancelled: 'Payment cancelled. You have not been charged.', error: 'Payment could not be confirmed. Check your PayPal account first, then try confirming again.', success: 'Thank you! Your PDF has been accepted for delivery to your PayPal email address. Please also check your spam folder.', delayed: 'Your payment is complete. Email delivery is delayed. Download your PDF here; please do not pay again.', download: 'Download your PDF', retry: 'Check payment again', legal: 'Immediate digital delivery', help: 'Questions? info@veganiel.com' }
  };
  if (consulting) {
    Object.assign(copy.de, { price: 'Einmalig · 79,00 € · Persönliche Ernährungsberatung', consent: 'Ich möchte, dass die Beratung nach Terminvereinbarung auch vor Ablauf der 14-tägigen Widerrufsfrist beginnen kann. Bei einem Widerruf kann für bereits erbrachte Leistungen ein anteiliger Betrag anfallen.', start: 'Beratung mit PayPal buchen · 79,00 €', intro: 'Nach bestätigter Zahlung erhältst du eine Bestätigung per E-Mail. Deinen Termin und die nächsten Schritte vereinbaren wir anschließend per E-Mail.', success: 'Vielen Dank! Deine Beratung ist bezahlt. Die Bestätigung wurde zum Versand angenommen. Antworte darauf, um deinen Termin zu vereinbaren.', delayed: 'Deine Beratung ist bezahlt. Die Bestätigungs-E-Mail ist verzögert. Bitte kontaktiere uns mit deiner PayPal-Zahlungsreferenz, um den Termin zu vereinbaren. Bitte nicht erneut bezahlen.', download: 'Termin per E-Mail vereinbaren', legal: 'Widerruf und Beginn der Beratung' });
    Object.assign(copy.en, { price: 'One-time payment · €79.00 · Personal nutrition consultation', consent: 'I request that the consultation may begin, by appointment, before the 14-day withdrawal period expires. If I withdraw, a proportionate charge may apply for services already provided.', start: 'Book consultation with PayPal · €79.00', intro: 'After confirmed payment, you will receive an email confirmation. We will arrange your appointment and next steps by email.', success: 'Thank you! Your consultation is paid. Your confirmation email has been accepted for delivery. Reply to arrange your appointment.', delayed: 'Your consultation is paid. The confirmation email is delayed. Please contact us with your PayPal payment reference to arrange your appointment. Please do not pay again.', download: 'Arrange your appointment by email', legal: 'Withdrawal and starting your consultation' });
  }
  const ui = () => document.documentElement.lang === 'de' ? 'de' : 'en';
  const t = key => copy[ui()][key];
  function render() {
    const cover = document.querySelector('.guide-cover');
    if (cover) cover.src = ui() === 'en' ? 'longevity-guide-cover-en.png' : 'longevity-guide-cover.png';
    root.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t(el.dataset.copy); });
    if (!selected && !locked) language.value = ui();
    start.disabled = !ready || !consent.checked || !terms.checked || locked;
    if (!locked) status.textContent = ready ? t('intro') : t('unavailable');
  }
  async function request(action, body) {
    const response = await fetch('/.netlify/functions/checkout?action=' + action, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error('Checkout failed');
    return data;
  }
  async function capture() {
    retry.hidden = true;
    status.textContent = t('loading');
    try {
      const result = await request('capture', { receipt });
      if (!result.paid || !(consulting ? result.contactUrl : result.downloadUrl)) throw new Error('Not completed');
      status.textContent = t(result.emailed ? 'success' : 'delayed') + ' ';
      const link = document.createElement('a');
      link.href = consulting ? result.contactUrl : result.downloadUrl;
      link.textContent = t('download');
      link.style.textDecoration = 'underline';
      status.append(link);
      buttons.hidden = true;
    } catch {
      status.textContent = t('error');
      retry.hidden = false;
    }
  }
  language.addEventListener('change', () => { selected = true; });
  consent.addEventListener('change', render);
  terms.addEventListener('change', render);
  document.addEventListener('veganiel:languagechange', render);
  retry.addEventListener('click', capture);
  start.addEventListener('click', async () => {
    if (!ready || !consent.checked || !terms.checked || locked) return;
    locked = true;
    language.disabled = consent.disabled = terms.disabled = true;
    start.hidden = true;
    status.textContent = t('loading');
    try {
      if (!sdk) sdk = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(config.clientId) + '&currency=EUR&intent=capture&components=buttons&disable-funding=credit,paylater&locale=' + (ui() === 'de' ? 'de_DE' : 'en_US');
        script.onload = resolve;
        script.onerror = () => { script.remove(); sdk = null; reject(new Error('SDK failed')); };
        document.head.append(script);
      });
      await sdk;
      await window.paypal.Buttons({
        style: { layout: 'vertical', label: 'pay' },
        createOrder: async () => {
          const order = await request('create', { lang: language.value, product: consulting ? 'consulting' : 'guide', digitalConsent: !consulting && consent.checked, serviceConsent: consulting && consent.checked });
          receipt = order.receipt;
          return order.id;
        },
        onApprove: capture,
        onCancel: () => { status.textContent = t('cancelled'); },
        onError: () => { status.textContent = t('error'); if (receipt) retry.hidden = false; }
      }).render(buttons);
      status.textContent = t('intro');
    } catch {
      locked = false;
      language.disabled = consent.disabled = terms.disabled = false;
      start.hidden = false;
      buttons.replaceChildren();
      render();
      status.textContent = t('error');
    }
  });
  render();
  request('config').then(data => { config = data; ready = data.ready === true; render(); }).catch(render);
})();
