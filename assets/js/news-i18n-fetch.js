/* assets/js/news-i18n-fetch.js
   Provides: window.NewsI18N.fetchPost(langPathBase, lang), window.NewsI18N.fetchIndex()
   - langPathBase example: "/i18n/news/2025/11/08-my-slug" (without ".en.json")
   - lang is "sv", "sr", or "en"
*/
(function () {
  const BUST = String(Date.now());

  async function getJSON(url) {
    const u = url.includes("?") ? `${url}&v=${BUST}` : `${url}?v=${BUST}`;
    const res = await fetch(u, { cache: "no-store" });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} for ${u}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  async function fetchWithFallback(langPathBase, lang) {
    try {
      return await getJSON(`${langPathBase}.${lang}.json`);
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    return getJSON(`${langPathBase}.en.json`);
  }

  async function fetchIndex() {
    return getJSON("/data/news/index.json");
  }

  window.NewsI18N = {
    fetchPost: fetchWithFallback,
    fetchIndex,
  };
})();
