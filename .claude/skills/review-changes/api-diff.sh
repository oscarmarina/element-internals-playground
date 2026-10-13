#!/usr/bin/env bash
# Deterministic public-API diff (0 LLM tokens). Run AFTER `npm run analyze` so the
# manifests match the sources.
#
# Compares, per package, against <base>:
#   - custom-elements.json: public members, attributes, events, slots, CSS parts/properties, tags
#   - src/index.ts: `export` lines
#   - package.json: `exports` keys
#
# Exit 0 = no removals (additions are listed, they don't break consumers)
# Exit 2 = something public was removed or renamed → run api-contract-reviewer
#
# Usage: api-diff.sh <base-ref>

set -euo pipefail

base=${1:?usage: api-diff.sh <base-ref>}

# Names starting with `_` are internal by convention and not part of the contract.
# shellcheck disable=SC2016
api_jq='[.modules[]?.declarations[]? | . as $d | ($d.name // "?") as $n |
  ([$d.members[]? | select(.name != null and (.privacy // "public") == "public" and (.name | startswith("_") | not))
     | "\($n).\(.kind) \(.name)"]
   + [$d.attributes[]? | "\($n).attribute \(.name)"]
   + [$d.events[]? | "\($n).event \(.name)"]
   + [$d.slots[]? | "\($n).slot \(.name)"]
   + [$d.cssParts[]? | "\($n).part \(.name)"]
   + [$d.cssProperties[]? | "\($n).cssprop \(.name)"]
   + (if $d.tagName then ["\($n).tag \($d.tagName)"] else [] end))[]] | unique[]'

# Exported names of an index.ts (stdin): `export {a, b as c, type d}`, `export * from 'x'`,
# `export const|class|function|type|interface name`.
export_names() {
  tr '\n' ' ' | tr ';' '\n' | grep -E '^[[:space:]]*export' | while read -r line; do
    if [[ $line =~ \{([^}]*)\} ]]; then
      echo "${BASH_REMATCH[1]}" | tr ',' '\n' | sed -E 's/^ *(type +)?//; s/.* as +//; s/ *$//'
    elif [[ $line =~ export\ +\*\ +from\ +[\'\"]([^\'\"]+) ]]; then
      echo "* from ${BASH_REMATCH[1]}"
    elif [[ $line =~ export\ +(declare\ +)?(const|let|class|function|type|interface|enum)\ +([A-Za-z0-9_$]+) ]]; then
      echo "${BASH_REMATCH[3]}"
    fi
  done | grep -v '^$' | sort -u
}

removed=""
added=""

for pkg in packages/*/; do
  pkg=${pkg%/}
  changed=$(git diff --name-only "$base" -- "$pkg/custom-elements.json" "$pkg/src/index.ts" "$pkg/package.json")
  [ -z "$changed" ] && continue

  old=$(mktemp) new=$(mktemp)

  if echo "$changed" | grep -q 'custom-elements.json$'; then
    git show "$base:$pkg/custom-elements.json" 2>/dev/null | jq -r "$api_jq" | sort -u >"$old" || : >"$old"
    jq -r "$api_jq" "$pkg/custom-elements.json" | sort -u >"$new"
    removed+=$(comm -23 "$old" "$new" | sed "s#^#$pkg  #")$'\n'
    added+=$(comm -13 "$old" "$new" | sed "s#^#$pkg  #")$'\n'
  fi

  if echo "$changed" | grep -q 'src/index.ts$'; then
    git show "$base:$pkg/src/index.ts" 2>/dev/null | export_names >"$old" || : >"$old"
    export_names <"$pkg/src/index.ts" >"$new"
    removed+=$(comm -23 "$old" "$new" | sed "s#^#$pkg  index.ts export #")$'\n'
  fi

  if echo "$changed" | grep -q 'package.json$'; then
    git show "$base:$pkg/package.json" 2>/dev/null | jq -r '.exports // {} | keys[]' | sort -u >"$old" || : >"$old"
    jq -r '.exports // {} | keys[]' "$pkg/package.json" | sort -u >"$new"
    removed+=$(comm -23 "$old" "$new" | sed "s#^#$pkg  package.json exports #")$'\n'
  fi

  rm -f "$old" "$new"
done

removed=$(echo "$removed" | grep -v '^$' || true)
added=$(echo "$added" | grep -v '^$' || true)

echo "## Public API added (non-breaking)"
echo "${added:-none}"
echo
echo "## Public API removed or renamed (BREAKING)"
echo "${removed:-none}"

[ -n "$removed" ] && exit 2
exit 0
