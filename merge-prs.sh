#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

REPO="serbianorthodox/serbianorthodox.github.io"
MODE="${1:-dry}"          # dry | merge
UPDATE="${UPDATE:-0}"     # 1 = update BEHIND branches before merge
ORDER="${ORDER:-updated}" # updated | created | number | smallest
LIMIT="${LIMIT:-1}"       # how many PRs to act on this run

command -v gh >/dev/null || { echo "gh not installed"; exit 1; }
gh auth status >/dev/null || { echo "gh not authenticated"; exit 1; }

case "$ORDER" in
  updated)  JQ='sort_by(.updatedAt) | .[].number' ;;
  created)  JQ='sort_by(.createdAt) | .[].number' ;;
  number)   JQ='sort_by(.number) | .[].number' ;;
  smallest) JQ='sort_by(.additions + .deletions) | .[].number' ;;
  *) echo "invalid ORDER"; exit 1 ;;
esac

FIELDS="number,updatedAt,createdAt,isDraft,mergeStateStatus,reviewDecision,additions,deletions,headRefName,baseRefName"
mapfile -t PRS < <(gh pr list --repo "$REPO" --state open --json $FIELDS --jq "$JQ")

[ "${#PRS[@]}" -eq 0 ] && { echo "no open PRs"; exit 0; }

count=0
for n in "${PRS[@]}"; do
  read -r isDraft mergeState reviewDecision head base < <(
    gh pr view "$n" --repo "$REPO" \
      --json isDraft,mergeStateStatus,reviewDecision,headRefName,baseRefName \
      --jq '[.isDraft, .mergeStateStatus, (.reviewDecision//"NONE"), .headRefName, .baseRefName] | @tsv'
  )

  if [[ "$isDraft" == "true" ]]; then
    echo "skip  #$n draft"
    continue
  fi

  case "$mergeState" in
    CLEAN|HAS_HOOKS) ;;
    BEHIND)
      if [[ "$UPDATE" == "1" ]]; then
        echo "update-branch #$n"
        gh api -X PUT "repos/$REPO/pulls/$n/update-branch"
      else
        echo "skip  #$n BEHIND (set UPDATE=1 to update before merge)"
        continue
      fi
      ;;
    *) echo "skip  #$n mergeState=$mergeState"; continue ;;
  esac

  if [[ "$reviewDecision" != "APPROVED" && "$reviewDecision" != "NONE" ]]; then
    echo "skip  #$n reviewDecision=$reviewDecision"
    continue
  fi

  if [[ "$MODE" == "dry" ]]; then
    echo "would merge #$n ($head -> $base)"
  else
    echo "merge #$n ($head -> $base)"
    gh pr merge "$n" --repo "$REPO" --squash --delete-branch
  fi

  count=$((count+1))
  if [[ "$count" -ge "$LIMIT" ]]; then
    echo "limit reached ($LIMIT)"
    break
  fi
done
