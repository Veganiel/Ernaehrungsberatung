/* Shared DE/EN presentation layer. Source content and interactive state remain intact. */
(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const storageKey = 'veganiel-language';
  const supported = value => value === 'en' || value === 'de';
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch (_) { /* Storage may be disabled. */ }
  const requested = new URL(location.href).searchParams.get('lang');
  const explicitLanguage = supported(requested) ? requested : supported(saved) ? saved : null;
  let language = explicitLanguage || 'en';
  if (supported(requested)) { try { localStorage.setItem(storageKey, requested); } catch (_) {} }
  let dictionary = {}, fragments = null, observer, scheduled = false;
  const textState = new WeakMap(), attributeState = new WeakMap();
  const normalise = value => value.replace(/\s+/g, ' ').trim();
  const excluded = 'script,style,noscript,code,pre,textarea,[translate="no"],.notranslate,.community-comment,.community-avatar,#community-user strong';
  const attributes = ['alt', 'title', 'placeholder', 'aria-label'];
  const escapeRE = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function translate(value) {
    if (language !== 'en' || !value) return value;
    const key = normalise(value);
    let result = dictionary[key];
    if (!result) {
      // Rendered quiz counters, answer letters, product summaries and progress labels.
      result = key.replace(/^Frage (\d+) von (\d+)$/, 'Question $1 of $2')
        .replace(/\b(\d+) Fragen\b/g, '$1 questions')
        .replace(/\bca\. (\d+) Minuten\b/g, 'approx. $1 minutes');
      if (fragments) result = result.replace(fragments, match => dictionary[match]);
    }
    return value.match(/^\s*/)[0] + result + value.match(/\s*$/)[0];
  }

  function translateText(node) {
    if (!node.parentElement || node.parentElement.closest(excluded) || !normalise(node.data)) return;
    let state = textState.get(node);
    if (!state || node.data !== state.last) state = { source: node.data, last: node.data };
    const translated = translate(state.source);
    if (node.data !== translated) node.data = translated;
    state.last = translated;
    textState.set(node, state);
  }

  function translateAttribute(element, name) {
    const current = element.getAttribute(name);
    if (!current) return;
    let states = attributeState.get(element);
    if (!states) { states = {}; attributeState.set(element, states); }
    let state = states[name];
    if (!state || current !== state.last) state = { source: current, last: current };
    const translated = translate(state.source);
    if (current !== translated) element.setAttribute(name, translated);
    state.last = translated;
    states[name] = state;
  }

  function observe() {
    observer.observe(document.documentElement, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: [...attributes, 'content']
    });
  }

  function render() {
    if (observer) observer.disconnect();
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateText(walker.currentNode);
    document.querySelectorAll('[alt],[title],[placeholder],[aria-label]').forEach(element => {
      if (!element.closest(excluded)) attributes.forEach(name => translateAttribute(element, name));
    });
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach(element => translateAttribute(element, 'content'));
    document.documentElement.lang = language;
    const button = document.getElementById('langBtn');
    if (button) {
      button.textContent = language === 'en' ? 'DE' : 'EN';
      button.setAttribute('aria-label', language === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English');
      button.setAttribute('title', language === 'en' ? 'Deutsch' : 'English');
    }
    if (observer) observe();
  }

  function setLanguage(next) {
    if (!supported(next)) return;
    language = next;
    try { localStorage.setItem(storageKey, language); } catch (_) { /* Preference remains active for this page. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    try { history.replaceState(null, '', url); } catch (_) { /* Local previews may restrict history. */ }
    render();
    document.dispatchEvent(new CustomEvent('veganiel:languagechange', { detail: { language } }));
  }

  const api = { setLanguage, translate, get language() { return language; } };
  window.VeganielI18n = api;
  // Browser dialogs from existing interactive features also follow the selection.
  for (const method of ['alert', 'confirm']) {
    const native = window[method].bind(window);
    window[method] = message => native(translate(String(message)));
  }

  async function getDefaultLanguage() {
    if (explicitLanguage) return explicitLanguage;
    // Suchmaschinen sehen auf der Adresse ohne ?lang die deutsche Quelle; die englische Fassung hat ihre eigene Adresse (?lang=en).
    if (/bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse/i.test(navigator.userAgent || '')) return 'de';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(new URL('/language-default', scriptURL), {
        cache: 'no-store', signal: controller.signal
      });
      if (!response.ok) return 'en';
      const data = await response.json();
      return supported(data.language) ? data.language : 'en';
    } catch (_) { return 'en'; }
    finally { clearTimeout(timeout); }
  }

  const translations = fetch(new URL('locales/en.json', scriptURL), { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw new Error('English translations could not be loaded');
    return response.json();
  });
  api.ready = Promise.all([translations, getDefaultLanguage()]).then(([data, initialLanguage]) => {
    language = initialLanguage;
    dictionary = data;
    const keys = Object.keys(data).filter(key => key !== data[key] && key.length >= 3)
      .sort((a, b) => b.length - a.length);
    fragments = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + keys.map(escapeRE).join('|') + ')(?![\\p{L}\\p{N}_])', 'gu');
    let button = document.getElementById('langBtn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'langBtn';
      const nav = document.querySelector('header .nav') || document.querySelector('header .wrap') || document.querySelector('header');
      if (nav) {
        const actions = document.createElement('div');
        actions.className = 'veganiel-header-actions';
        const back = nav.querySelector(':scope > a:not(.brand):not(.veganiel-logo-brand)');
        if (back) actions.append(back);
        actions.append(button);
        nav.append(actions);
      }
      else { button.classList.add('veganiel-language-floating'); document.body.append(button); }
    }
    button.type = 'button';
    button.classList.add('veganiel-language-button');
    button.setAttribute('translate', 'no');
    if (!button.classList.contains('vn-language')) button.addEventListener('click', () => setLanguage(language === 'de' ? 'en' : 'de'));
    render();
    observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; render(); });
    });
    observe();
    document.dispatchEvent(new CustomEvent('veganiel:languagechange', { detail: { language } }));
  }).catch(error => {
    console.error(error);
    document.documentElement.lang = 'de';
    const button = document.getElementById('langBtn');
    if (button) { button.textContent = 'EN'; button.title = 'English could not be loaded. Please reload the page.'; }
    throw error;
  });
})();
