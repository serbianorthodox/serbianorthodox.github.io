(function () {
  const DEFAULT_LANG = 'sv';
  const SUPPORTED = ['sr', 'sv', 'en'];
  const I18N_ATTR = 'data-i18n';

  let DICT = {};
  let CURRENT_LANG = null;

  function getLangFromQuery() {
    const p = new URLSearchParams(location.search);
    const lang = (p.get('lang') || '').toLowerCase();
    return SUPPORTED.includes(lang) ? lang : null;
  }
  function getBrowserLang() {
    const n = (navigator.language || '').toLowerCase();
    if (n.startsWith('sr')) return 'sr';
    if (n.startsWith('sv')) return 'sv';
    return 'en';
  }
  function currentLang() {
    // Prefer URL ?lang, then localStorage, then browser, then default
    return getLangFromQuery() || localStorage.getItem('lang') || getBrowserLang() || DEFAULT_LANG;
  }

  function applyTranslations(root) {
    const scope = root || document;
    scope.querySelectorAll('[' + I18N_ATTR + ']').forEach(el => {
      const key = el.getAttribute(I18N_ATTR);
      if (Object.prototype.hasOwnProperty.call(DICT, key)) {
        el.textContent = DICT[key];
      }
    });
  }

  async function loadTranslations(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    const url = `/i18n/${lang}.json?v=${Date.now()}`; // cache-bust so new keys show up
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load i18n file for ' + lang);
    DICT = await res.json();
    document.documentElement.lang = lang;
    applyTranslations(document);
  }

  async function setLanguage(lang) {
    CURRENT_LANG = SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;
    localStorage.setItem('lang', CURRENT_LANG);
    await loadTranslations(CURRENT_LANG);
    // keep URL shareable
    const url = new URL(location);
    url.searchParams.set('lang', CURRENT_LANG);
    history.replaceState(null, '', url);
  }

  // MutationObserver: re-apply when header/footer are injected by include.js
  const observer = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) applyTranslations(node);
      });
    }
  });

  // Wire up flag buttons (elements with data-lang="sv|sr|en")
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    e.preventDefault();
    setLanguage(btn.getAttribute('data-lang'));
  });

  // Expose manual switch for quick testing
  window.__setLang = setLanguage;

  // Init
  (async () => {
    try {
      await setLanguage(currentLang());
      observer.observe(document.documentElement, { childList: true, subtree: true });
      // extra safety: re-apply once window fully loaded
      if (document.readyState === 'complete') applyTranslations(document);
      else window.addEventListener('load', () => applyTranslations(document), { once: true });
    } catch (err) {
      console.error(err);
    }
  })();
})();
