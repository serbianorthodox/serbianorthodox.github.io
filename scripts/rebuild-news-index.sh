#!/usr/bin/env bash
set -euo pipefail

echo "=== Checking working tree is clean ==="
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: Working tree is not clean. Commit or stash your changes first."
  exit 1
fi

echo "=== Fetching and syncing main ==="
git fetch origin
git switch main >/dev/null 2>&1 || git checkout main
git pull --ff-only origin main

TS="$(date +%Y-%m-%d-%H%M)"
BRANCH="fix/rebuild-index-$TS"

echo "=== Creating branch $BRANCH ==="
git switch -c "$BRANCH"

echo "=== Collecting news files ==="
files=($(find i18n/news -type f -name '*.json' | sort))

if [ ${#files[@]} -eq 0 ]; then
  echo "ERROR: No news JSON files found under i18n/news."
  exit 1
fi

echo "Found ${#files[@]} files."

echo "=== Rebuilding data/news/index.json ==="
mkdir -p data/news
jq -s 'flatten | sort_by(.date) | reverse' "${files[@]}" > data/news/index.json

echo "=== Checking for changes in index.json ==="
if git diff --quiet data/news/index.json; then
  echo "No changes in data/news/index.json. Nothing to commit."
  exit 0
fi

echo "=== Committing ==="
git add data/news/index.json
git commit -m "chore(news): rebuild index.json"

echo "=== Pushing ==="
git push -u origin "$BRANCH"

echo
echo "=== DONE ==="
echo "Open this URL to create the PR:"
echo "  https://github.com/serbianorthodox/serbianorthodox.github.io/pull/new/$BRANCH"
echo
