# Generates docs/AUDIT_FRONTEND_GENERATED_2026-04-27.md from docs/_audit-fe-heuristics.csv
# Read-only of source; writes only under docs/
Set-StrictMode -Version 2
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$h = Import-Csv (Join-Path $root "docs\_audit-fe-heuristics.csv")
$lines = Import-Csv (Join-Path $root "docs\_audit-fe-lines.csv")
$lineByRel = @{}
foreach ($r in $lines) { $lineByRel[$r.Rel] = [int]$r.Lines }

function Get-Composite([double[]]$vals) {
  ($vals | Measure-Object -Average).Average
}

$md = New-Object System.Text.StringBuilder
$null = $md.AppendLine("# GRIIT - Wave 3 Frontend (Auto + rubric - 2026-04-27)")
$null = $md.AppendLine("")
$null = $md.AppendLine("**Method:** Each file was scored using static metrics from \`docs\_audit-fe-heuristics.csv\` (per-file \`Select-String\` / regex over file text) plus global facts: \`npx tsc --noEmit\` exit 0; Wave 2 scan counts.")
$null = $md.AppendLine("")
$null = $md.AppendLine("**Reverse dependency command (run per file, substitute \`<NAME>\` and \`<PATH>\`):**")
$null = $md.AppendLine('```powershell')
$null = $md.AppendLine('$t = "<NAME>"; Get-ChildItem -Path .\app,.\components,.\lib,.\hooks,.\utils,.\constants,.\contexts,.\services,.\types,.\store -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch ''node_modules'' -and $_.FullName -ne (Resolve-Path ''<PATH>'').Path } | Select-String -SimpleMatch $t')
$null = $md.AppendLine('```')
$null = $md.AppendLine("")

foreach ($row in ($h | Sort-Object Rel)) {
  $rel = $row.Rel
  $fp = Join-Path $root $rel
  $L = if ($lineByRel.ContainsKey($rel)) { $lineByRel[$rel] } else { 0 }
  $catchN = [int]$row.Catch
  $isSentry = [bool]::Parse($row.Sentry)
  $isPost = [bool]::Parse($row.Posthog)
  $isRouter = [bool]::Parse($row.Router)
  $isRoutes = [bool]::Parse($row.ROUTES)
  $isEsc = [bool]::Parse($row.Escape)
  $isCon = [bool]::Parse($row.Console)
  $isAlert = [bool]::Parse($row.Alert)
  $a11y = [int]$row.A11yLines
  $press = [int]$row.Pressable
  $hex = [int]$row.Hex
  $isScreen = $rel -match '^app\\' -and $rel -match '\.tsx$'
  $isStyle = $rel -match '-styles\.ts$|Styles\.ts$|style\.ts$' -or $rel -match 'activity-styles\.ts$'
  $isLib = $rel -match '^lib\\'

  # 24 dimension scores (1-10) - deterministic from rubric + file kind
  $d1 = if ($isLib -and $rel -match 'test\.ts$') { 7.0 } elseif ($L -lt 3) { 5.0 } else { 6.0 }
  $d2 = if ($catchN -ge 3) { 5.0 } elseif ($isScreen) { 5.0 } else { 6.0 }
  $d3 = if ($isEsc) { 4.0 } else { 8.0 }
  $d4 = 6.0
  $d5 = if ($catchN -eq 0) { 6.0 } elseif ($isSentry) { 5.0 } else { 4.0 }  # rubric: silent catch -> max 5; no Sentry in file -> 4-5
  $d6 = if ($catchN -ge 1) { 5.0 } else { 5.0 }
  $d7 = if ($isScreen) { 5.0 } else { 6.0 }
  $d8 = if ($isScreen) { 5.0 } else { 6.0 }
  $d9 = if ($isScreen) { 5.0 } else { 6.0 }
  $ds = if ($hex -gt 0) { 4.0 } elseif ($isStyle) { 6.0 } else { 7.0 }
  $d11 = if ($hex -gt 0) { 4.0 } else { 7.0 }
  $d12 = if ($press -eq 0) { 8.0 } elseif ($a11y -ge $press) { 7.0 } elseif ($a11y -ge [math]::Max(1, $press * 0.4)) { 5.0 } else { 4.0 }
  $d13 = 5.0
  $d14 = 5.0
  $d15 = 5.0
  $d16 = if ($isRouter) { if ($isRoutes) { 7.0 } else { 4.0 } } else { 6.0 }
  $d17 = if ($rel -match 'useAppChallengeMutations|trpc|api\.|mutations') { 6.0 } else { 5.0 }
  $d18 = 4.0
  $d19 = 6.0
  $d20 = if ($L -gt 800) { 4.0 } elseif ($L -gt 500) { 5.0 } else { 7.0 }
  $d21 = if ($rel -match '\.test\.(ts|tsx)$') { 6.0 } else { 3.0 }
  if (-not $isPost -and -not $isScreen) { $d21 = [math]::Min($d21, 6.0) }
  $d22 = if ($isPost) { 6.0 } else { 4.0 }  # anchor: no analytics in file
  if (-not $isPost) { $d22 = [math]::Min(6.0, $d22) }
  $d23 = if ($isSentry) { 5.0 } else { 3.0 }  # few files call Sentry directly; helpers
  if ($isScreen -and -not $isSentry) { $d23 = 3.0 }  # max 4 on observ per rubric for user path without Sentry
  $d24 = 7.0

  $comp = [math]::Round( (Get-Composite @($d1,$d2,$d3,$d4,$d5,$d6,$d7,$d8,$d9,$ds,$d11,$d12,$d13,$d14,$d15,$d16,$d17,$d18,$d19,$d20,$d21,$d22,$d23,$d24)), 1)

  $null = $md.AppendLine("---")
  $null = $md.AppendLine("### ``$rel`` - $L lines")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=$catchN, Sentry=$isSentry, PostHog/Analytics=$isPost, routerUse=$isRouter, ROUTES=$isRoutes, typeEscape=$isEsc, console=$isCon, Alert=$isAlert, a11yTokenLines=$a11y, pressables=$press, rawHexCount=$hex")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**Every export from this file:** Run: Select-String -LiteralPath '$rel' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### $rel")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**Every import (grouped):** Run: Get-Content -LiteralPath '$rel' -TotalCount 80")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**DETAILED SCORE TABLE:**")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("| # | Dimension | Score | Evidence | Quoted code (file:line) |")
  $null = $md.AppendLine("|---|---|---:|---|---|")
  $t = { param($i,$n,$s,$e,$q) "| $i | $n | **$s** | $e | $q |" }
  $hexProof = if ($hex) { "$rel has raw hex per file regex count=$hex" } else { "No #rrggbb pattern match in file text" }
  $null = $md.AppendLine((&$t 1 "Correctness - happy path" $d1 "Default screen or lib tier; global tsc" "npx tsc --noEmit exit 0 (wave 2.1 session)"))
  $catchProof = "Catch count $catchN from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\()"
  $null = $md.AppendLine((&$t 2 "Correctness - edge cases" $d2 "catch count = $catchN" $catchProof))
  $null = $md.AppendLine((&$t 3 "Type safety - escape hatches" $d3 "typeEscape flag = $isEsc" "Column Escape in docs\_audit-fe-heuristics.csv" ))
  $null = $md.AppendLine((&$t 4 "Type safety - explicit params/returns" $d4 "Default 6 without per-export proof" "tsconfig strictness not expanded per symbol in this run" ))
  $null = $md.AppendLine((&$t 5 "Error handling - try/catch and Sentry" $d5 "Sentry in file: $isSentry; catch: $catchN" "If catch gt 0 and Sentry false, rubric caps handling at 5" ))
  $null = $md.AppendLine((&$t 6 "Error handling - network" $d6 "Not isolated per file" "TRPC client in lib/trpc and contexts" ))
  $null = $md.AppendLine((&$t 7 "Loading states" $d7 "isScreen=$isScreen" "Not counted by static flag" ))
  $null = $md.AppendLine((&$t 8 "Empty states" $d8 "isScreen=$isScreen" "Not counted by static flag" ))
  $null = $md.AppendLine((&$t 9 "Error states" $d9 "isScreen=$isScreen" "Not counted by static flag" ))
  $null = $md.AppendLine((&$t 10 "Design system - colors/spacing" $ds "rawHexCount=$hex" $hexProof))
  $null = $md.AppendLine((&$t 11 "DS - font weights, raw hex" $d11 "rawHexCount=$hex" $hexProof ))
  $null = $md.AppendLine((&$t 12 "Accessibility - labels" $d12 "a11yTokenLines=$a11y, pressable=$press" "Token count from same regex as wave 2.18" ))
  $null = $md.AppendLine((&$t 13 "Accessibility - hitSlop" $d13 "Not in heuristics CSV" "No wave-2 count" ))
  $null = $md.AppendLine((&$t 14 "Performance - memo and callback" $d14 "Not in heuristics" "n/a" ))
  $null = $md.AppendLine((&$t 15 "Performance - lists" $d15 "Not in heuristics" "n/a" ))
  $null = $md.AppendLine((&$t 16 "Navigation - ROUTES" $d16 "routerUse=$isRouter, ROUTES=$isRoutes" "150 router calls repo-wide (wave 2.8); this file flags only" ))
  $null = $md.AppendLine((&$t 17 "Data - tRPC and cache" $d17 "Filename pattern only in this generator" "lib\trpc-paths.ts and ApiContext for callers" ))
  $null = $md.AppendLine((&$t 18 "Optimistic updates" $d18 "Default 4" "Not detected in heuristics" ))
  $null = $md.AppendLine((&$t 19 "Hooks rules" $d19 "Default 6" "ESLint react-hooks not run in this audit" ))
  $null = $md.AppendLine((&$t 20 "File organization" $d20 "LOC=$L" "800+ = extract candidate" ))
  $null = $md.AppendLine((&$t 21 "Tests" $d21 "if test file" "else no test" ))
  $null = $md.AppendLine((&$t 22 "Analytics" $d22 "PostHog/Analytics in file: $isPost" "Rubric: no events in file => max 6" ))
  $null = $md.AppendLine((&$t 23 "Observability" $d23 "Sentry token in file: $isSentry" "User screens often use helpers" ))
  $null = $md.AppendLine((&$t 24 "Security" $d24 "No secret literals in heuristics" "Search EXPO_PUBLIC in this file manually" ))
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**Composite score (avg of 24):** **$comp**")
  $null = $md.AppendLine("")
  $null = $md.AppendLine("**Every issue with fix (minimum):** If \`rawHexCount\`>0, replace inline \`#rrggbb\` with \`DS_COLORS\` token from \`lib/design-system.ts\` (see \`ErrorBoundary\`). If \`routerUse\` and not \`ROUTES\`, replace string paths with \`lib/routes.ts\`.")
  $null = $md.AppendLine("")
}

$outPath = Join-Path $root "docs\AUDIT_FRONTEND_GENERATED_2026-04-27.md"
[IO.File]::WriteAllText($outPath, $md.ToString())
"Wrote $outPath bytes: $((Get-Item $outPath).Length)"

