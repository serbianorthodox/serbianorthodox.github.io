(async function () {
  try {
    const qs = new URLSearchParams(location.search);
    const path = location.pathname || "";

    // --- Language detection (correct + stable) ---
    let defaultLang = "en";

    if (path.includes("/sv/")) {
      defaultLang = "sv";
    } else if (path.includes("/sr/") || path.includes("/rs/")) {
      defaultLang = "sr";
    }

    const attrLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();

    const activeLang = (
      qs.get("lang") ||
      defaultLang ||
      attrLang ||
      "en"
    ).toLowerCase();

    const bust = Date.now();

    // --- Prepare layout ---
    const main = document.querySelector("main") || document.body;
    const h1 = main.querySelector("h1");

    Array.from(main.children).forEach(el => {
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

    const latest = index[0];
    const i18nPath = latest.i18nPath;

    // --- Load correct language version, fallback to EN ---
    async function loadPost(basePath, lang) {
      const tryUrl = lng => `${basePath}.${lng}.json?v=${bust}`;

      let r = await fetch(tryUrl(lang), { cache: "no-store" });
      if (r.ok) return r.json();

      r = await fetch(tryUrl("en"), { cache: "no-store" });
      if (r.ok) return r.json();

      throw new Error("missing i18n json for " + basePath);
    }

    const post = await loadPost(i18nPath, activeLang);

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
