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
  await inject('#include-header', '/partials/header.html');
  await inject('#include-footer', '/partials/footer.html');

  // Re-apply translations for injected content
  const lang =
    document.documentElement.lang ||
    localStorage.getItem('lang') ||
    'sv';

  if (window.__setLang) {
    // Re-run i18n without changing language
    window.__setLang(lang);
  }
});

