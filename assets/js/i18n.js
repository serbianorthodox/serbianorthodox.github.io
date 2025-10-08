(function () {
  const DEFAULT_LANG = 'sv';
  const SUPPORTED = ['sr', 'sv', 'en'];

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
    return localStorage.getItem('lang') || getLangFromQuery() || getBrowserLang() || DEFAULT_LANG;
  }

  async function loadTranslations(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    try {
      const res = await fetch(`/i18n/${lang}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load i18n file for ' + lang);
      const dict = await res.json();

      document.documentElement.lang = lang;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          el.textContent = dict[key];
        }
      });

      const titleEl = document.querySelector('title');
      if (titleEl && dict['site.name']) titleEl.textContent = dict['site.name'];
    } catch (err) {
      console.error(err);
    }
  }

  async function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    await loadTranslations(lang);
    const url = new URL(location);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }

  // Make it callable if needed
  window.__setLang = setLanguage;

  // Wire up flag buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (btn) {
      e.preventDefault();
      setLanguage(btn.getAttribute('data-lang'));
    }
  });

  // Initialize
  loadTranslations(currentLang());
})();
