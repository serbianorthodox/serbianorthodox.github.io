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

  // Pick language — prefer user's saved choice, then URL, then <html lang>, default 'sv'
  const stored = (localStorage.getItem('lang') || '').toLowerCase();
  const urlLang = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  const lang = stored || urlLang || htmlLang || 'sv';

  // Re-apply translations for injected content without changing the user's choice
  if (window.__setLang) {
    await window.__setLang(lang);
  } else {
    document.documentElement.lang = lang;
  }

  // Ensure favicon + Apple touch icon on every page
  (function ensureIcons() {
    const head = document.head;
    if (!head.querySelector('link[rel~="icon"]')) {
      const ico = document.createElement('link');
      ico.rel = 'icon';
      ico.href = '/favicon.ico';
      head.appendChild(ico);
    }
    if (!head.querySelector('link[rel="apple-touch-icon"]')) {
      const apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.sizes = '180x180';
      apple.href = '/favicon-180.png';
      head.appendChild(apple);
    }
  })();
});
