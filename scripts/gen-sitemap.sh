#!/bin/sh
set -eu
BASE_URL="https://serbianorthodox.github.io"
OUT="sitemap.xml"
tmp="$(mktemp)"
git ls-files '*.html' | grep -Ev '^(assets/|vendor/|node_modules/|\.|\.github/)' > "$tmp"
printf '%s\n' '<?xml version="1.0" encoding="UTF-8"?>' > "$OUT"
printf '%s\n' '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> "$OUT"
while IFS= read -r f; do
  case "$f" in
    index.html) URL="$BASE_URL/";;
    */index.html) URL="$BASE_URL/${f%/index.html}/";;
    *) URL="$BASE_URL/$f";;
  esac
  last="$(git log -1 --format=%cs -- "$f" 2>/dev/null || true)"
  [ -n "$last" ] || last="$(date -u +%F)"
  printf '%s\n' "  <url>" >> "$OUT"
  printf '%s\n' "    <loc>${URL}</loc>" >> "$OUT"
  printf '%s\n' "    <lastmod>${last}</lastmod>" >> "$OUT"
  printf '%s\n' "    <changefreq>weekly</changefreq>" >> "$OUT"
  printf '%s\n' "    <priority>0.5</priority>" >> "$OUT"
  printf '%s\n' "  </url>" >> "$OUT"
done < "$tmp"
printf '%s\n' '</urlset>' >> "$OUT"
rm -f "$tmp"
