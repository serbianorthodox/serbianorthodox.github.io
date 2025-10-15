#!/usr/bin/env bash
set -euo pipefail
err=0
while IFS= read -r -d '' f; do
  b="${f%.*}.webp"
  if [ ! -f "$b" ]; then
    echo "MISSING WEBP for $f"
    err=1
  fi
done < <(find assets/img -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print0)
while IFS= read -r -d '' f; do
  name="$(basename "$f")"
  if [[ "$name" =~ [A-Z] ]]; then
    echo "UPPERCASE filename: $f"
    err=1
  fi
done < <(find assets/img -type f -print0)
exit $err
