(async function () {
  try {
    const qs = new URLSearchParams(location.search);
    const path = location.pathname || "";

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

    const idxRes = await fetch(`data/news/index.json?v=${bust}`, { cache: "no-store" });
    if (!idxRes.ok) throw new Error("index.json load failed");

    const index = await idxRes.json();
    if (!Array.isArray(index) || index.length === 0) return;

    const langMatches = index.filter((item) => item && item.lang === activeLang);

    if (!langMatches.length) {
      const messages = {
        sv: {
          title: "Inga artiklar på svenska ännu",
          body: "Det finns ännu inga nyheter på svenska. Vänligen titta in igen senare."
        },
        en: {
          title: "No articles available yet",
          body: "There are no news articles available yet in this language. Please check back later."
        },
        sr: {
          title: "Нема доступних текстова",
          body: "Још нема вести на изабраном језику. Молимо свратите поново касније."
        }
      };

      const msg = messages[activeLang] || messages.en;
      root.innerHTML = `
        <article class="card my-3">
          <div class="card-body">
            <h2 class="h5 my-2">${msg.title}</h2>
            <p>${msg.body}</p>
          </div>
        </article>
      `;
      return;
    }

    // sort by date descending; if same date, keep whatever order index.json has
    langMatches.sort((a, b) => {
      if (!a || !b) return 0;
      const da = a.date || "";
      const db = b.date || "";
      if (da === db) return 0;
      return da < db ? 1 : -1;
    });

    function renderBody(raw) {
      if (!raw) return "";

      // convert Markdown image syntax: ![alt](url)
      let html = raw.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
        const safeAlt = String(alt || "").replace(/"/g, "&quot;");
        const safeUrl = String(url || "").replace(/"/g, "&quot;");
        return `<img src="${safeUrl}" alt="${safeAlt}" class="img-fluid my-3">`;
      });

      // basic newline handling
      html = html.replace(/\n/g, "<br>");

      return html;
    }

    const posts = await Promise.all(
      langMatches.map(async (item) => {
        if (!item || !item.i18nPath) {
          return { meta: item, post: null, error: true };
        }
        try {
          const res = await fetch(`${item.i18nPath}?v=${bust}`, { cache: "no-store" });
          if (!res.ok) throw new Error("post json load failed");
          const post = await res.json();
          return { meta: item, post, error: false };
        } catch (e) {
          console.error("Failed to load post JSON:", item.i18nPath, e);
          return { meta: item, post: null, error: true };
        }
      })
    );

    const html = posts
      .map(({ meta, post, error }) => {
        const date = meta && meta.date ? meta.date : "";
        if (error || !post) {
          return `
            <article class="card my-3">
              <div class="card-body">
                <div class="small text-muted">${date}</div>
                <h2 class="h5 my-2">Article could not be loaded</h2>
                <p>This news item could not be loaded at the moment.</p>
              </div>
            </article>
          `;
        }

        const title = post.title || meta.title || "";
        const body = post.body || "";
        const renderedBody = renderBody(body);

        return `
          <article class="card my-3">
            <div class="card-body">
              <div class="small text-muted">${date}</div>
              <h2 class="h4 my-2">${title}</h2>
              <div>${renderedBody}</div>
            </div>
          </article>
        `;
      })
      .join("\n");

    root.innerHTML = html;
  } catch (e) {
    console.error("news-render failed:", e);
  }
})();
