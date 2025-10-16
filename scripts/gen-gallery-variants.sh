#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s nullglob

SRC_DIR="assets/img/gallery/originals"
OUT_DIR="assets/img/gallery"

cd "$(git rev-parse --show-toplevel)"

[[ -d "$SRC_DIR" ]] || SRC_DIR="$OUT_DIR"
mkdir -p "$OUT_DIR"

for f in "$SRC_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [[ -e "$f" ]] || continue
  bn="$(basename "$f")"
  base="${bn%.*}"
  [[ "$base" =~ -[0-9]{3,4}$ ]] && continue
  magick "$f" -resize 600x600\> -strip -interlace Plane -quality 85 "$OUT_DIR/${base}-600.jpg"
  magick "$f" -resize 1200x1200\> -strip -interlace Plane -quality 85 "$OUT_DIR/${base}-1200.jpg"
  magick "$f" -resize 600x600\> -strip "$OUT_DIR/${base}-600.webp"
  magick "$f" -resize 1200x1200\> -strip "$OUT_DIR/${base}-1200.webp"
done
