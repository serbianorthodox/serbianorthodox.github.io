#!/usr/bin/env bash
set -euo pipefail

# ISSUE number: either as argument or prompt
if [ $# -ge 1 ]; then
  ISSUE="$1"
else
  printf "Issue number: "
  read -r ISSUE
fi

if [ -z "${ISSUE}" ]; then
  echo "No issue number provided"
  exit 1
fi

# Make sure we see latest remote branches
git fetch origin

# Find matching origin/news/*-issue-<ISSUE>
BRANCH=$(git branch -r --format='%(refname:short)' \
  | awk '/^origin\/news\/.*issue-'"$ISSUE"'$/ {sub("^origin/",""); print $1; exit}')

if [ -z "${BRANCH}" ]; then
  echo "No news/* branch found for issue $ISSUE"
  exit 1
fi

echo "Using branch: $BRANCH"

# Ensure we have a local branch tracking that remote
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git switch "$BRANCH"
else
  git switch -c "$BRANCH" --track "origin/$BRANCH"
fi

# Update the branch (fast-forward only)
git pull --ff-only

# Create PR and open in browser (link issue manually with “Closes #ISSUE”)
gh pr create --fill --base main --head "$BRANCH" --web
