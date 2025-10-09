async function inject(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return false;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Not found: ' + url);
    host.innerHTML = await res.text();
    return true;
  } catch (e) {
    console.error('Include failed:', e);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Inject header & footer
  await inject('#include-header', '/partials/header.html');
  await inject('#include-footer', '/partials/footer.html');

  // 2) Language: prefer saved -> URL -> <html lang> -> 'sv'
  const stored  = (localStorage.getItem('lang') || '').toLowerCase();
  const urlLang = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  const htmlLang= (document.documentElement.lang || '').toLowerCase();
  const lang    = stored || urlLang || htmlLang || 'sv';

  if (window.__setLang) {
    await window.__setLang(lang); // re-apply i18n to injected content
  } else {
    document.documentElement.lang = lang;
  }

  // 3) Footer dates: current year + page last modified
  (function initFooterDates(){
    const y  = document.getElementById('currentYear');
    const lu = document.getElementById('lastUpdated');
    if (y)  y.textContent = new Date().getFullYear();
    if (lu) {
      const d = new Date(document.lastModified);
      if (!isNaN(d)) {
        lu.dateTime = d.toISOString();
        lu.textContent = d.toLocaleDateString(
          document.documentElement.lang || 'sv',
          { year: 'numeric', month: 'short', day: 'numeric' }
        );
      }
    }
  })();

  // 4) Signal that layout (header/footer/i18n) is ready (optional hook for pages)
  document.dispatchEvent(new CustomEvent('layout:ready', { detail: { lang } }));
});
