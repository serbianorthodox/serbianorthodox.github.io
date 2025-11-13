(async function () {
  try {
    const qs = new URLSearchParams(location.search);
    const activeLang = (qs.get("lang") || (document.documentElement.lang || "sv")).toLowerCase();
    const bust = Date.now();

    // 0) Layout prep: keep the first <h1> in <main>, remove other children (stubs)
    const main = document.querySelector("main") || document.body;
    const h1 = main.querySelector("h1");
    Array.from(main.children).forEach((el) => {
      if (el !== h1) el.remove();
    });

    // Create/ensure render root right after H1
    let root = document.querySelector("#news-list");
    if (!root) {
      root = document.createElement("div");
      root.id = "news-list";
      if (h1 && h1.parentNode === main) {
        h1.insertAdjacentElement("afterend", root);
      } else {
        main.prepend(root);
      }
    } else {
      root.innerHTML = "";
    }

    // 1) load index (cache-busted)
    const idxRes = await fetch(`data/news/index.json?v=${bust}`, { cache: "no-store" });
    if (!idxRes.ok) throw new Error("index.json load failed");
    const index = await idxRes.json();
    if (!Array.isArray(index) || index.length === 0) return;

    // pick latest in activeLang, fallback to en, then any
    const byLang = index.filter((item) => item.lang === activeLang);
    let latest = byLang[0];

    if (!latest) {
      const enFallback = index.filter((item) => item.lang === "en");
      latest = enFallback[0] || index[0];
    }

    if (!latest || !latest.i18nPath) return;

    // 2) load post JSON directly from i18nPath (it already includes .lang.json)
    const postRes = await fetch(`${latest.i18nPath}?v=${bust}`, { cache: "no-store" });
    if (!postRes.ok) throw new Error("post json load failed: " + latest.i18nPath);
    const post = await postRes.json();

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
    console.error("news-render failed:", e);
  }
})();
