 (async function () {
  try {
    const qs = new URLSearchParams(location.search);
    const activeLang = (qs.get('lang') || (document.documentElement.lang || 'sv')).toLowerCase();
    const bust = Date.now();

    // 0) Layout prep: keep the first <h1> in <main>, remove other children (stubs)
    const main = document.querySelector('main') || document.body;
    const h1 = main.querySelector('h1');
    Array.from(main.children).forEach(el => {
      if (el !== h1) el.remove();
    });

    // Create/ensure render root right after H1
    let root = document.querySelector('#news-list');
    if (!root) {
      root = document.createElement('div');
      root.id = 'news-list';
      if (h1 && h1.parentNode === main) {
        h1.insertAdjacentElement('afterend', root);
      } else {
        main.prepend(root);
      }
    } else {
      root.innerHTML = '';
    }

    // 1) load index (cache-busted)
    const idxRes = await fetch(`data/news/index.json?v=${bust}`, { cache: 'no-store' });
    if (!idxRes.ok) throw new Error('index.json load failed');
    const index = await idxRes.json();
    if (!Array.isArray(index) || index.length === 0) return;

    const latest = index[0];
    const i18nPath = latest.i18nPath;

    // 2) load post JSON with fallback to en
    async function loadPost(i18nPath, lang) {
      const tryUrl = (lng) => `${i18nPath}.${lng}.json?v=${bust}`;
      let r = await fetch(tryUrl(lang), { cache: 'no-store' });
      if (r.ok) return r.json();
      r = await fetch(tryUrl('en'), { cache: 'no-store' });
      if (r.ok) return r.json();
      throw new Error('missing i18n json for ' + i18nPath);
    }
    const post = await loadPost(i18nPath, activeLang);

    // 3) render latest
    root.innerHTML = `
      <article class="card my-3">
        <div class="card-body">
          <div class="small text-muted">${latest.date}</div>
          <h2 class="h4 my-2">${post.title}</h2>
          <div style="white-space:pre-wrap">${post.body}</div>
        </div>
      </article>
    `;
  } catch (e) {
    console.error('news-render failed:', e);
  }
})();
