#!/usr/bin/env bash
# Deterministic reviewer router: decides from the diff, with zero LLM tokens, which
# checks and which reviewer subagents are worth running. Max 2 reviewers per run.
#
# Usage: route.sh [base-ref]   (default: merge-base with origin/main)
# Includes committed, staged, unstaged and untracked changes.

set -euo pipefail

MAX_REVIEWERS=2
LARGE_DIFF_LINES=800

target=${1:-origin/main}
base=$(git merge-base "$target" HEAD 2>/dev/null || echo "$target")

files=$( { git diff --name-only "$base"; git ls-files --others --exclude-standard; } | sort -u)

if [ -z "$files" ]; then
  echo "BASE=$base"
  echo "NO_CHANGES"
  exit 0
fi

# Component/mixin source, excluding generated styles and barrel files.
src_files=$(echo "$files" | grep -E '^packages/[^/]+/src/.+\.ts$' | grep -vE '/styles/|/index\.ts$' || true)
api_files=$(echo "$files" | grep -E '^packages/[^/]+/(custom-elements\.json|package\.json|src/index\.ts|README\.md)$' || true)
style_files=$(echo "$files" | grep -E '\.(scss|css)(\.ts)?$|/styles/' || true)
dep_files=$(echo "$files" | grep -E '(^|/)(package\.json|package-lock\.json)$' || true)
demo_files=$(echo "$files" | grep -E '^packages/[^/]+/(demo/|index\.html)' || true)
packages=$(echo "$files" | sed -nE 's#^packages/([^/]+)/.*#\1#p' | sort -u)

# Any change to a file that implements form association or ARIA gets the a11y reviewer.
# Decided per file, not per changed line: a one-line edit next to the logic (e.g. a guard
# in _onBlur) can break error timing without containing any keyword.
a11y_pattern='BlkMixinFormAssociated|BlkMixinInternalsBase|formAssociated|attachInternals|aria-|role='
a11y_hit=""
for f in $src_files; do
  if [ -f "$f" ] && grep -qE "$a11y_pattern" "$f"; then
    a11y_hit=1
    break
  fi
done

# Priority order = risk order. The cap cuts from the bottom.
# api-contract-reviewer is not chosen here: api-diff.sh (deterministic) decides it, and only
# for breaking changes, outside the cap.
reviewers=()
[ -n "$a11y_hit" ] && reviewers+=("forms-a11y-reviewer")
[ -n "$src_files" ] && reviewers+=("lit-correctness-reviewer")

dropped=()
if [ "${#reviewers[@]}" -gt "$MAX_REVIEWERS" ]; then
  dropped=("${reviewers[@]:$MAX_REVIEWERS}")
  reviewers=("${reviewers[@]:0:$MAX_REVIEWERS}")
fi

diff_lines=$(git diff --numstat "$base" -- . ':(exclude)**/custom-elements.json' ':(exclude)**/package-lock.json' ':(exclude)**/__snapshots__/**' | awk '{s+=$1+$2} END {print s+0}')

echo "BASE=$base"
echo "DIFF_LINES=$diff_lines"
[ "$diff_lines" -gt "$LARGE_DIFF_LINES" ] && echo "WARNING=large diff (> $LARGE_DIFF_LINES lines): review per package, not all at once"
echo
echo "## Deterministic checks (always first)"
[ -n "$packages" ] && echo "npx lerna run test --stream --concurrency 1 --since $base -- --run"
[ -n "$style_files" ] && echo "npm run stylelint   # styles changed: also look at the demo in the browser"
[ -n "$dep_files" ] && echo "npm audit --omit=dev   # dependencies changed"
[ -n "$demo_files" ] && echo "# demo changed: open it in the browser, no reviewer"
if [ -n "$(echo "$files" | grep -E '^packages/[^/]+/src/' || true)" ] || [ -n "$api_files" ]; then
  echo "npm run analyze   # regenerate manifests + READMEs before diffing the API"
  echo "bash .claude/skills/review-changes/api-diff.sh $base   # exit 2 = breaking → also run api-contract-reviewer (outside the cap)"
fi
echo
echo "## Reviewers (max $MAX_REVIEWERS)"
if [ "${#reviewers[@]}" -eq 0 ]; then
  echo "none"
else
  printf '%s\n' "${reviewers[@]}"
fi
[ "${#dropped[@]}" -gt 0 ] && echo "DROPPED_BY_CAP=${dropped[*]}"
echo
echo "## Files for reviewers (sources only; generated README/manifest excluded)"
echo "${src_files:-none}"
