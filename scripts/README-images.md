# Image maintenance (gallery + etiquette)

## Rules
- Filenames: lowercase, letters/numbers/hyphens only.
- Every `.jpg` must have a same-basename `.webp` in the same folder.
- Gallery uses two sizes: `-600` and `-1200`.
- HTML uses `<picture>`: WebP `<source>` first, `<img>` has only `src` (no srcset).

## Add a new gallery image (basename = `NAME`)
1) Put original in `assets/img/gallery/originals/name.jpg`.
2) Create sized JPGs then WebPs:
   n=name
   convert assets/img/gallery/originals/${n}.jpg -strip -resize 600x600^ -gravity center -extent 600x600 assets/img/gallery/${n}-600.jpg
   convert assets/img/gallery/originals/${n}.jpg -strip -resize 1200x1200^ -gravity center -extent 1200x1200 assets/img/gallery/${n}-1200.jpg
   cwebp -q 82 assets/img/gallery/${n}-600.jpg -o assets/img/gallery/${n}-600.webp
   cwebp -q 82 assets/img/gallery/${n}-1200.jpg -o assets/img/gallery/${n}-1200.webp

3) Add a card in `gallery.html`:
   <picture>
     <source srcset="/assets/img/gallery/NAME-600.webp 600w, /assets/img/gallery/NAME-1200.webp 1200w"
             sizes="(min-width: 992px) 25vw, (min-width: 576px) 33vw, 100vw"
             type="image/webp">
     <img src="/assets/img/gallery/NAME-600.jpg" class="gallery-img" width="1200" height="800" loading="lazy" decoding="async" alt="">
   </picture>

## Add/update etiquette thumbs (basename = `NAME`)
- Files: `assets/img/etiquette/thumbs/name.jpg` and `name.webp`
- HTML pattern:
  <picture>
    <source srcset="/assets/img/etiquette/thumbs/NAME.webp" type="image/webp">
    <img src="/assets/img/etiquette/thumbs/NAME.jpg" class="img-fluid" width="300" height="200" loading="lazy" decoding="async" alt="">
  </picture>

## Contact hero
Use one existing pair, e.g. `profile-1200.jpg` + `.webp`:
<picture>
  <source type="image/webp" srcset="/assets/img/gallery/profile-1200.webp">
  <img class="hero-img" src="/assets/img/gallery/profile-1200.jpg" alt="" loading="eager" decoding="async" fetchpriority="high">
</picture>

## Pre-push checks (same as CI)
find assets -type f -iname '*.jpg' -print0 | while IFS= read -r -d '' f; do w="${f%.*}.webp"; [ -f "$w" ] || echo "MISSING WEBP for: $f"; done
find assets -type f -iname '*.webp' -print0 | while IFS= read -r -d '' f; do j="${f%.*}.jpg"; [ -f "$j" ] || echo "MISSING JPG for: $f"; done
find assets -type f | grep -E '[A-Z]' || echo OK

## Don’t do this
- Don’t run image-generating workflows on `pull_request`.
- Don’t put `srcset` on `<img>` inside `<picture>` (causes JPG double-fetch).
