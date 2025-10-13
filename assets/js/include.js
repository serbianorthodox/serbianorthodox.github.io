// /assets/js/include.js

// --- Canonical link injection ---
(function () {
  try {
    var BASE = "https://serbianorthodox.github.io"; // change if you add a custom domain

    // normalize path: drop query/hash, remove trailing slash, hide "index.html"
    var url = new URL(window.location.href);
    var path = url.pathname.replace(/\/+$/, "") || "/";
    if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length) || "/";

    var canonicalHref = BASE + (path === "/" ? "/" : path);

    var link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalHref);
  } catch (e) {
    // no-op
  }
})();

// --- HTML partial include with cache-buster ---
async function inject(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return false;
  try {
    const bust = `v=${Date.now()}`;
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(`${url}${sep}${bust}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Not found: " + url);
    host.innerHTML = await res.text();
    return true;
  } catch (e) {
    console.error("Include failed:", e);
    return false;
  }
}

// --- Active nav highlighting ---
function markActiveNav() {
  try {
    // normalize current path
    let p = location.pathname.replace(/\/+$/, "") || "/";
    if (p.endsWith("/index.html")) p = p.slice(0, -"/index.html".length) || "/";

    // clear any previous active marks
    document.querySelectorAll("nav .nav-link.active").forEach((el) => {
      el.classList.remove("active");
      el.setAttribute("aria-current", "");
    });

    // rules: first true wins
    const rules = [
      { test: p === "/", sel: 'nav .nav-link[href="/"], nav .nav-link[href="/index.html"]' },
      { test: /^\/about\.html$/.test(p), sel: 'nav .nav-link[href="/about.html"]' },
      { test: /^\/services\.html$/.test(p), sel: 'nav .nav-link[href="/services.html"]' },
      { test: /^\/calendar\.html$/.test(p), sel: 'nav .nav-link[href="/calendar.html"]' },
      { test: /^\/news\.html$/.test(p), sel: 'nav .nav-link[href="/news.html"]' },
      { test: /^\/donations\.html$/.test(p), sel: 'nav .nav-link[href="/donations.html"]' },
      { test: /^\/gallery\.html$/.test(p), sel: 'nav .nav-link[href="/gallery.html"]' },
      // Any etiquette page or directory highlights the Etiquette link
      {
        test: /^\/etiquette(\/|$)/.test(p),
        sel: 'nav .nav-link[href="/etiquette/index.html"], nav .nav-link[href="/etiquette/"], nav .nav-link[href="/etiquette.html"]',
      },
      { test: /^\/contact\.html$/.test(p), sel: 'nav .nav-link[href="/contact.html"]' },
    ];

    for (let i = 0; i < rules.length; i++) {
      if (rules[i].test) {
        const target = document.querySelector(rules[i].sel);
        if (target) {
          target.classList.add("active");
          target.setAttribute("aria-current", "page");
        }
        break;
      }
    }
  } catch (_) {
    // no-op
  }
}

// --- Language helpers ---
async function applyLang(lang) {
  const code = (lang || "").toLowerCase() || "sv";
  localStorage.setItem("lang", code);
  document.documentElement.lang = code;

  // Update compact language button label if present (class .lang-btn in header)
  const trigger = document.querySelector(".lang-btn");
  if (trigger) trigger.textContent = code.toUpperCase();

  // Apply site i18n (so injected header/footer get translated too)
  if (window.__setLang) {
    await window.__setLang(code);
  }
}

function bindLangClicks() {
  // Works for both initial DOM and injected header
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-lang]");
    if (!btn) return;
    const code = (btn.getAttribute("data-lang") || "").toLowerCase();
    if (!code) return;
    e.preventDefault();
    await applyLang(code);
    document.dispatchEvent(new CustomEvent("layout:ready", { detail: { lang: code } }));
  });
}

// --- Boot ---
document.addEventListener("DOMContentLoaded", async () => {
  // 1) Inject header & footer (with cache-buster)
  await inject("#include-header", "/partials/header.html");
  await inject("#include-footer", "/partials/footer.html");

  // 2) Determine language: saved -> URL -> <html lang> -> 'sv'
  const stored = (localStorage.getItem("lang") || "").toLowerCase();
  const urlLang = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
  const htmlLang = (document.documentElement.lang || "").toLowerCase();
  const lang = stored || urlLang || htmlLang || "sv";

  // 3) Apply language to whole page (and injected header/footer)
  await applyLang(lang);

  // 4) Mark current nav item as active (incl. /etiquette/*)
  markActiveNav();

  // 5) Footer dates: current year + page last modified
  (function initFooterDates() {
    const y = document.getElementById("currentYear");
    const lu = document.getElementById("lastUpdated");
    if (y) y.textContent = new Date().getFullYear();
    if (lu) {
      const d = new Date(document.lastModified);
      if (!isNaN(d)) {
        lu.dateTime = d.toISOString();
        lu.textContent = d.toLocaleDateString(document.documentElement.lang || "sv", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    }
  })();

  // 6) Bind language switcher clicks
  bindLangClicks();

  // 7) Signal that layout (header/footer/i18n) is ready
  document.dispatchEvent(new CustomEvent("layout:ready", { detail: { lang } }));
});
