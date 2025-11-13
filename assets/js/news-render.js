(async function () {
  try {
    const qs = new URLSearchParams(location.search);
    const path = location.pathname || "";

    // --- Language detection: query > <html lang> > path > default(en) ---
    const queryLang = (qs.get("lang") || "").toLowerCase();
    const attrLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();

    let pathLang = "";
    if (path.includes("/sv/")) {
      pathLang = "sv";
    } else if (path.includes("/sr/") || path.includes("/rs/")) {
      pathLang = "sr";
    }

    const activeLang = (queryLang || attrLang || pathLang || "en").toLowerCase();
    const bust = Date.now();

    // --- Prepare layout ---
    const main = document.querySelector("main") || document.body;
    const h1 = main.querySelector("h1");

    Array.from(main.children).forEach((el) => {
      if (el !== h1) el.remove();
    });

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

    // --- Load index.json with cache-bust ---
    const idxRes = await fetch(`data/news/index.json?v=${bust}`, { cache: "no-store" });
    if (!idxRes.ok) throw new Error("index.json load failed");

    const index = await idxRes.json();
    if (!Array.isArray(index) || index.length === 0) return;

    // pick latest entry for activeLang, else EN, else first
    const langMatches = index.filter((item) => item.lang === activeLang);
    let latest = langMatches[0];

    if (!latest) {
      const enMatches = index.filter((item) => item.lang === "en");
      latest = enMatches[0] || index[0];
    }

    if (!latest || !latest.i18nPath) return;

    // --- Load post JSON directly from i18nPath (already includes .lang.json) ---
    const postRes = await fetch(`${latest.i18nPath}?v=${bust}`, { cache: "no-store" });
    if (!postRes.ok) throw new Error("post json load failed: " + latest.i18nPath);
    const post = await postRes.json();

    // --- Render ---
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
