#!/bin/sh
# Build 92 12.3: the scripted checks, Maestro and not the AI, against one installed build.
#
#   agents/checks/run-checks.sh <simulator udid> <label> <out dir> <app checkout for the Strava test> [flow ...]
#
# Each flow starts from a fresh guest (clearState). The Strava check runs the stubbed webhook tests
# (backend/lib/strava-webhook.test.ts) of that checkout: a stubbed create event completes the run task.
# Offline posting is not run: this Mac has no simulator network conditioner.
set -u
udid="$1"
label="$2"
out="$3"
app="$4"
shift 4
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
flows="${*:-journal-long curse-username username-control curse-bio curse-caption curse-comment curse-title}"
mkdir -p "$out"
results="$out/results.txt"
echo "# $label $(date '+%F %T') device $udid" > "$results"
for flow in $flows; do
  dir="$out/$flow"
  mkdir -p "$dir"
  "$repo/scripts/run-maestro.sh" --device "$udid" test -e MAESTRO_RUN="$(date +%H%M%S)" "$here/$flow.yaml" --test-output-dir "$dir" > "$dir/maestro.txt" 2>&1
  code=$?
  if [ "$code" -eq 0 ]; then echo "$flow PASS" >> "$results"; else echo "$flow FAIL (exit $code)" >> "$results"; fi
done
(cd "$app" && npx vitest run backend/lib/strava-webhook.test.ts > "$out/strava.txt" 2>&1)
code=$?
if [ "$code" -eq 0 ]; then echo "strava-stub PASS" >> "$results"; else echo "strava-stub FAIL (exit $code)" >> "$results"; fi
echo "offline-post NOT RUN (no network conditioner on this Mac)" >> "$results"
cat "$results"
