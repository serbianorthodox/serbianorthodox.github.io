<script>
(function () {
  const DEFAULT_LANG = 'sv'; // pick your preferred default
  const SUPPORTED = ['sr', 'sv', 'en'];

  function getLangFromQuery() {
    const m = location.search.match(/[?&]lang=(sr|sv|en)\b/i);
    return m ? m[1].toLowerCase() : null;
  }

  function getBrowserLang() {
    const n = navigator.language?.toLowerCase() || '';
    if (n.startsWith('sr')) return 'sr';
    if (n.startsWith('sv')) return 'sv';
    return 'en';
  }

  function currentLang() {
    return localStorage.getItem('lang')
        || getLangFromQuery()
        || getBrowserLang()
        || DEFAULT_LANG;
  }

  async function loadTranslations(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    const res = await fetch(`i18n/${lang}.json?cache=${Date.now()}`);
    const dict = await res.json();
    document.documentElement.lang = lang;

    // Swap any [data-i18n="key"] text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });

    // Also update <title>
    const titleEl = document.querySelector('title');
    if (titleEl && dict['site.name']) titleEl.textContent = dict['site.name'];
  }

  async function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    await loadTranslations(lang);
    // Optional: update URL ?lang=xx without reloading
    const url = new URL(location);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }

  // Wire flag buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (btn) {
      e.preventDefault();
      setLanguage(btn.getAttribute('data-lang'));
    }
  });

  // Init
  loadTranslations(currentLang());
})();
</script>

