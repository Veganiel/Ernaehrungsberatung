/* Google Analytics 4 – lädt erst nach Einwilligung.
 * Die Einwilligung holt die bereits genutzte, von Google zertifizierte Einwilligungsmitteilung
 * (AdSense „Datenschutz & Mitteilungen“, IAB TCF v2.2). Ohne Einwilligung wird kein Google-Analytics-Code geladen.
 * Aktivierung: Container-ID (GTM-…) und/oder Mess-ID (G-…) unten eintragen. Beide leer = aus.
 */
(() => {
  'use strict';
  const CONTAINER_ID = 'GTM-KTXLBGXJ'; // Google Tag Manager
  const MEASUREMENT_ID = 'G-LYY0J7EX52'; // Google Analytics 4 (optional, direkt ohne Tag Manager)
  const PUBLISHER = 'pub-2996299966418101';
  const GOOGLE_VENDOR = 755; // Google Advertising Products im IAB-TCF
  const useGtm = /^GTM-[A-Z0-9]+$/.test(CONTAINER_ID), useGa = /^G-[A-Z0-9]+$/.test(MEASUREMENT_ID);
  if (!useGtm && !useGa) return;

  let loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (useGtm) {
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const gtm = document.createElement('script');
      gtm.async = true;
      gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONTAINER_ID);
      document.head.append(gtm);
    }
    if (useGa) {
      window.gtag('js', new Date());
      window.gtag('config', MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
      document.head.append(script);
    }
  }

  function allowed(tcData) {
    if (!tcData || !['tcloaded', 'useractioncomplete'].includes(tcData.eventStatus)) return false;
    if (tcData.gdprApplies === false) return true; // außerhalb von EWR, UK und Schweiz
    return Boolean(tcData.purpose?.consents?.[1] && tcData.vendor?.consents?.[GOOGLE_VENDOR]);
  }

  function listen() {
    window.__tcfapi('addEventListener', 2, (tcData, success) => { if (success && allowed(tcData)) loadAnalytics(); });
  }

  // Die Einwilligungsmitteilung selbst laden – unabhängig davon, ob AdSense schon aktiv ist
  // und eigene Werbung ausspielt (sonst bleibt Analytics ohne aktives AdSense ohne Einwilligung).
  if (!window.__tcfapi && !document.querySelector('script[src*="fundingchoicesmessages.google.com"]')) {
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
