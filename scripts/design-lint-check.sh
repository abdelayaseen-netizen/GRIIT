#!/usr/bin/env bash
# Compare design-lint.sh counts to scripts/design-lint.baseline. Exit 1 if any count increased.
set -u
now_out=$(bash scripts/design-lint.sh)
st=$?
if [ "$st" -eq 2 ]; then
  echo "$now_out"
  exit 2
fi

failed=0
while read -r check baseline; do
  [ -z "$check" ] && continue
  now=$(printf '%s\n' "$now_out" | awk -v c="$check" '$1 == c { print $2; exit }')
  if [ -z "$now" ]; then
    echo "FAIL $check $baseline -> (missing)"
    failed=1
    continue
  fi
  if [ "$now" -gt "$baseline" ]; then
    echo "FAIL $check $baseline -> $now"
    failed=1
  else
    echo "PASS $check $baseline -> $now"
  fi
done < scripts/design-lint.baseline

if [ "$failed" -ne 0 ]; then
  exit 1
fi
