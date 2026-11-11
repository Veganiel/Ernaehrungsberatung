/* Google Analytics 4 – lädt erst nach Einwilligung.
 * Die Einwilligung holt die bereits genutzte, von Google zertifizierte Einwilligungsmitteilung
 * (AdSense „Datenschutz & Mitteilungen“, IAB TCF v2.2). Ohne Einwilligung wird kein Google-Analytics-Code geladen.
 * Aktivierung: Mess-ID (G-…) unten eintragen. Leer = Analytics ist aus.
 */
(() => {
  'use strict';
  const MEASUREMENT_ID = '';
  const PUBLISHER = 'pub-2996299966418101';
  const GOOGLE_VENDOR = 755; // Google Advertising Products im IAB-TCF
  if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return;

  let loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.append(script);
  }

  function allowed(tcData) {
    if (!tcData || !['tcloaded', 'useractioncomplete'].includes(tcData.eventStatus)) return false;
    if (tcData.gdprApplies === false) return true; // außerhalb von EWR, UK und Schweiz
    return Boolean(tcData.purpose?.consents?.[1] && tcData.vendor?.consents?.[GOOGLE_VENDOR]);
  }

  function listen() {
    window.__tcfapi('addEventListener', 2, (tcData, success) => { if (success && allowed(tcData)) loadAnalytics(); });
  }

  // Seiten ohne Anzeigen laden die Einwilligungsmitteilung selbst, damit sie überall gleich funktioniert.
  if (!window.__tcfapi && !document.querySelector('script[src*="pagead2.googlesyndication.com"],script[src*="fundingchoicesmessages.google.com"]')) {
    const cmp = document.createElement('script');
    cmp.async = true;
    cmp.src = 'https://fundingchoicesmessages.google.com/i/' + PUBLISHER + '?ers=1';
    document.head.append(cmp);
  }

  let tries = 0;
  const wait = setInterval(() => {
    if (typeof window.__tcfapi === 'function') { clearInterval(wait); listen(); }
    else if (++tries > 100) clearInterval(wait); // nach 20 Sekunden ohne Einwilligungsdienst: kein Analytics
  }, 200);
})();
