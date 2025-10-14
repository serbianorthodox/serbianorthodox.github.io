#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="assets/img/gallery/originals"
OUT_DIR="assets/img/gallery"

JPG_Q=0.82   # 0..1 for sips
WEBP_Q=82    # 0..100 for cwebp

shopt -s nullglob
for f in "$SRC_DIR"/*.jpg "$SRC_DIR"/*.jpeg; do
  base="$(basename "$f")"
  name="${base%.*}"

  # 1200px wide JPG
  sips -s format jpeg -s formatOptions $JPG_Q --resampleWidth 1200 "$f" --out "$OUT_DIR/${name}-1200.jpg" >/dev/null
  # 600px wide JPG
  sips -s format jpeg -s formatOptions $JPG_Q --resampleWidth 600 "$f" --out "$OUT_DIR/${name}-600.jpg"   >/dev/null

  # WebP from the resized JPGs
  cwebp -q $WEBP_Q "$OUT_DIR/${name}-1200.jpg" -o "$OUT_DIR/${name}-1200.webp" >/dev/null
  cwebp -q $WEBP_Q "$OUT_DIR/${name}-600.jpg"   -o "$OUT_DIR/${name}-600.webp"  >/dev/null

  echo "Generated: ${name}-{600,1200}.{jpg,webp}"
done
