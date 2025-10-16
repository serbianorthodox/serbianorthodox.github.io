#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s nullglob
cd "$(git rev-parse --show-toplevel)/assets/img/gallery"
for f in *.jpg *.jpeg *.png; do
  base="${f%.*}"
  ext="${f##*.}"
  [[ "$base" =~ -[0-9]{3,4}$ ]] && continue
  magick "$f" -resize 600x600\> -strip -interlace Plane -quality 85 "${base}-600.jpg"
  magick "$f" -resize 1200x1200\> -strip -interlace Plane -quality 85 "${base}-1200.jpg"
  magick "$f" -resize 600x600\> -strip "${base}-600.webp"
  magick "$f" -resize 1200x1200\> -strip "${base}-1200.webp"
done
