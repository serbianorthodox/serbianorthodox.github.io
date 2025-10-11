// /assets/js/include.js
async function inject(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return false;
  try {
    // Cache-buster so GitHub Pages/CDNs never serve stale header/footer
    const bust = `v=${Date.now()}`;
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}${bust}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Not found: ' + url);
    host.innerHTML = await res.text();
    return true;
  } catch (e) {
    console.error('Include failed:', e);
    return false;
  }
}

// Highlight the current nav link after header is injected
function markActiveNav() {
  const path = location.pathname.replace(/index\.html$/i, '') || '/';
  const links = document.querySelectorAll('nav .nav-link[href]');
  links.forEach(a => {
    try {
      const href = new URL(a.getAttribute('href'), location.origin).pathname
        .replace(/index\.html$/i, '') || '/';

      // Exact match…
      let isActive = (href === path);

      // …plus: treat /etiquette.html as active for any /etiquette/* subpage
      if (!isActive && path.startsWith('/etiquette/') && href === '/etiquette.html') {
        isActive = true;
      }

      if (isActive) a.classList.add('active');
    } catch (_) {}
  });
}

// Language helpers
async function applyLang(lang) {
  const code = (lang || '').toLowerCase() || 'sv';
  localStorage.setItem('lang', code);
  document.documentElement.lang = code;

  // Update compact language button label if present (class .lang-btn in header)
  const trigger = document.querySelector('.lang-btn');
  if (trigger) trigger.textContent = code.toUpperCase();

  // Apply site i18n (so injected header/footer get translated too)
  if (window.__setLang) {
    await window.__setLang(code);
  }
}

function bindLangClicks() {
  // Works for both initial DOM and injected header
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const code = (btn.getAttribute('data-lang') || '').toLowerCase();
    if (!code) return;
    e.preventDefault();
    await applyLang(code);
    document.dispatchEvent(new CustomEvent('layout:ready', { detail: { lang: code } }));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Inject header & footer (with cache-buster)
  await inject('#include-header', '/partials/header.html');
  await inject('#include-footer', '/partials/footer.html');

  // 2) Determine language: saved -> URL -> <html lang> -> 'sv'
  const stored   = (localStorage.getItem('lang') || '').toLowerCase();
  const urlLang  = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  const lang     = stored || urlLang || htmlLang || 'sv';

  // 3) Apply language to whole page (and injected header/footer)
  await applyLang(lang);

  // 4) Mark current nav item as active (incl. /etiquette/*)
  markActiveNav();

  // 5) Footer dates: current year + page last modified
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

  // 6) Bind language switcher clicks
  bindLangClicks();

  // 7) Signal that layout (header/footer/i18n) is ready
  document.dispatchEvent(new CustomEvent('layout:ready', { detail: { lang } }));
});
