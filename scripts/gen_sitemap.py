import os, time
from pathlib import Path

ROOT = Path(".").resolve()
BASE_URL = "https://serbianorthodox.github.io"
SKIP = {".git", ".github", "node_modules", "assets"}

urls = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip junk dirs
    parts = Path(dirpath).parts
    if any(s in SKIP for s in parts):
        continue
    for fn in filenames:
        if fn.endswith(".html"):
            p = Path(dirpath) / fn
            rel = p.relative_to(ROOT).as_posix()
            loc = f"{BASE_URL}/{rel}"
            lastmod = time.strftime("%Y-%m-%d", time.gmtime(p.stat().st_mtime))
            urls.append((rel, loc, lastmod))

urls.sort()
if not urls:
    print("[ERROR] 0 HTML files found. CWD:", ROOT)
    raise SystemExit(1)

print(f"[INFO] writing sitemap.xml with {len(urls)} URLs")
with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for rel, loc, lastmod in urls:
        f.write("  <url>\n")
        f.write(f"    <loc>{loc}</loc>\n")
        f.write(f"    <lastmod>{lastmod}</lastmod>\n")
        f.write("    <changefreq>weekly</changefreq>\n")
        f.write("    <priority>0.5</priority>\n")
        f.write("  </url>\n")
    f.write("</urlset>\n")
print("[OK] sitemap.xml written")
