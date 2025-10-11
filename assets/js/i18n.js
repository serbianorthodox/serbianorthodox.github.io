<script>
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

  // Prefer URL ?lang, then localStorage, then browser, then default
  function currentLang() {
    return getLangFromQuery() || localStorage.getItem('lang') || getBrowserLang() || DEFAULT_LANG;
  }

  async function loadTranslations(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    try {
      // Cache-bust so updated keys are fetched immediately
      const res = await fetch(`/i18n/${lang}.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load i18n file for ' + lang);
      const dict = await res.json();

      document.documentElement.lang = lang;

      // Apply to all elements that declare data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          el.textContent = dict[key];
        }
      });

      // Do NOT overwrite <title> with site.name.
      // If <title> has data-i18n, it was already handled above.
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
</script>
