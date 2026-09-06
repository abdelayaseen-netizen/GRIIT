#!/usr/bin/env bash
# GRIIT design lint. Each check prints a count. The gate is: no count may increase
# over the baseline in scripts/design-lint.baseline, and every count must reach 0 by Chunk F.
set -u
SRC="app components hooks"

fail() { echo "ERROR $1" >&2; exit 2; }

# Run a command. grep/perl exit 1 (no matches) is a zero count. Exit 2 is a broken check.
run_check() {
  local check="$1"
  local cmd="$2"
  local out st
  set +e
  set -o pipefail
  out=$(eval "$cmd")
  st=$?
  set +o pipefail
  set -e
  if [ "$st" -eq 2 ]; then
    fail "$check"
  fi
  local n
  n=$(printf '%s' "$out" | grep -v "lib/design-system.ts" | grep -v "design/handoff" | grep -c . || true)
  echo "$n"
}

echo "hex        $(run_check hex "grep -rnE '#[0-9A-Fa-f]{6}\b' $SRC --include=*.tsx --include=*.ts")"
echo "weight     $(run_check weight "grep -rnE \"fontWeight: *['\\\"]?(600|700|800|900|bold|semibold)\" $SRC --include=*.tsx")"
echo "radius     $(run_check radius "grep -rnE 'borderRadius: *[0-9]+' $SRC --include=*.tsx | grep -vE 'borderRadius: *(4|12|20|999)\b'")"
echo "fontsize   $(run_check fontsize "grep -rnE 'fontSize: *[0-9]+' $SRC --include=*.tsx | grep -vE 'fontSize: *(12|13|15|17|20|28|34|64|96)\b'")"
echo "emoji      $(run_check emoji "find $SRC -name '*.tsx' -print0 | xargs -0 perl -CSD -ne 'print \"\$ARGV:$.:\$_\" if /[\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}]/'")"
echo "dash       $(run_check dash "grep -rn \$'\\u2014\\|\\u2013' $SRC --include=*.tsx")"
echo "rnimage    $(run_check rnimage "grep -rn \"from 'react-native'\" $SRC --include=*.tsx | grep -w Image")"
