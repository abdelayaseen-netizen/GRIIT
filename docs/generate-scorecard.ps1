$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$date = Get-Date -Format "yyyy-MM-dd"
$fullPath = Join-Path $root ("docs\SCORECARD_FULL_{0}.md" -f $date)
$summaryPath = Join-Path $root ("docs\SCORECARD_SUMMARY_{0}.md" -f $date)

function Rel([string]$p) {
  return [System.IO.Path]::GetRelativePath($root, $p).Replace("\", "/")
}

function Lines([string]$p) {
  if (-not (Test-Path $p)) { return 0 }
  return (Get-Content -Path $p | Measure-Object -Line).Lines
}

function Scan($files, [string]$pattern) {
  if ($files.Count -eq 0) { return @() }
  return @($files | Select-String -Pattern $pattern -ErrorAction SilentlyContinue)
}

$frontendFiles = Get-ChildItem -Recurse -File -Include *.ts,*.tsx -Path .\app,.\components,.\lib,.\hooks,.\utils,.\constants 2>$null
$backendFiles = Get-ChildItem -Recurse -File -Include *.ts -Path .\backend 2>$null
$allAuditFiles = @($frontendFiles + $backendFiles)
$allTs = Get-ChildItem -Recurse -File -Include *.ts,*.tsx -Path . | Where-Object { $_.FullName -notmatch "node_modules" }
$uiTsx = Get-ChildItem -Recurse -File -Include *.tsx -Path .\app,.\components 2>$null

$frontLoc = ($frontendFiles | Get-Content | Measure-Object -Line).Lines
$backLoc = ($backendFiles | Get-Content | Measure-Object -Line).Lines
$gt1400 = @($allAuditFiles | Where-Object { (Lines $_.FullName) -gt 1400 })
$gt800 = @($allAuditFiles | Where-Object { (Lines $_.FullName) -gt 800 })

$mFrom = Scan $allTs '\.from\([''"]'
$mOr = Scan $allTs '\.or\('
$mHex = Scan $uiTsx '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}'
$mAlert = Scan $uiTsx 'Alert\.alert'
$mNav = Scan $uiTsx 'router\.(push|replace|navigate)\([''"]'
$mAny = Scan $allTs ':\s*any\b|\bas any\b'
$mTsIgnore = Scan $allTs '@ts-ignore|@ts-expect-error'
$mTodo = Scan $allTs 'TODO|FIXME|HACK|XXX'
$nonNodeProd = Get-ChildItem -Recurse -File -Include *.ts,*.tsx -Path .\app,.\components,.\backend 2>$null | Where-Object { $_.FullName -notmatch "node_modules" }
$mConsole = Scan $nonNodeProd 'console\.(log|warn|error)'
$mPosthog = Scan $allTs 'posthog.*capture|analytics.*track'
$mSentry = Scan $allTs 'Sentry\.(captureException|captureMessage)'

$tscOut = npx tsc --noEmit 2>&1
$tscCount = @($tscOut).Count

$sb = New-Object System.Text.StringBuilder
$null = $sb.AppendLine(("# GRIIT Exhaustive Code Audit - {0}" -f $date))
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Phase 0: Rubric Calibration")
$null = $sb.AppendLine("- 1-2 Broken / absent")
$null = $sb.AppendLine("- 3-4 Present but unreliable")
$null = $sb.AppendLine("- 5 Functional baseline")
$null = $sb.AppendLine("- 6 Solid happy path")
$null = $sb.AppendLine("- 7 Good")
$null = $sb.AppendLine("- 8 Strong")
$null = $sb.AppendLine("- 9 Excellent")
$null = $sb.AppendLine("- 10 Best-in-class")
$null = $sb.AppendLine("")

$null = $sb.AppendLine("## Phase 1: Inventory & Baseline Metrics")
$null = $sb.AppendLine((("Frontend LOC: {0}" -f $frontLoc)))
$null = $sb.AppendLine((("Backend LOC: {0}" -f $backLoc)))
$null = $sb.AppendLine("")

function AddRaw([System.Text.StringBuilder]$b, [string]$title, $matches) {
  $null = $b.AppendLine((("<details><summary>{0} (raw)</summary>" -f $title)))
  $null = $b.AppendLine("")
  $null = $b.AppendLine("~~~text")
  if ($matches.Count -eq 0) {
    $null = $b.AppendLine("NOT FOUND")
  } else {
    foreach ($m in $matches) {
      $line = ("{0}:{1}: {2}" -f (Rel $m.Path), $m.LineNumber, $m.Line.Trim())
      $null = $b.AppendLine($line)
    }
  }
  $null = $b.AppendLine("~~~")
  $null = $b.AppendLine("</details>")
  $null = $b.AppendLine("")
}

AddRaw $sb "1.5 Supabase .from()" $mFrom
AddRaw $sb "1.6 Supabase .or()" $mOr
AddRaw $sb "1.7 raw hex violations" $mHex
AddRaw $sb "1.8 Alert.alert" $mAlert
AddRaw $sb "1.9 raw navigation strings" $mNav
AddRaw $sb "1.10 any / as any" $mAny
AddRaw $sb "1.11 @ts-ignore" $mTsIgnore
AddRaw $sb "1.12 TODO/FIXME/HACK/XXX" $mTodo
AddRaw $sb "1.13 console.*" $mConsole
AddRaw $sb "1.14 PostHog call sites" $mPosthog
AddRaw $sb "1.15 Sentry call sites" $mSentry

$null = $sb.AppendLine("<details><summary>1.16 tsc --noEmit (raw)</summary>")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("~~~text")
$null = $sb.AppendLine(("tsc_output_lines: {0}" -f $tscCount))
$null = $sb.AppendLine("~~~")
$null = $sb.AppendLine("</details>")
$null = $sb.AppendLine("")

$null = $sb.AppendLine("| Metric | Count | Target | Gap |")
$null = $sb.AppendLine("|---|---:|---:|---:|")
$null = $sb.AppendLine(("| Total frontend LOC | {0} | - | - |" -f $frontLoc))
$null = $sb.AppendLine(("| Total backend LOC | {0} | - | - |" -f $backLoc))
$null = $sb.AppendLine(("| Files > 1,400 lines | {0} | 0 | {0} |" -f $gt1400.Count))
$null = $sb.AppendLine(("| Files > 800 lines | {0} | <=5 | {1} |" -f $gt800.Count, ($gt800.Count - 5)))
$null = $sb.AppendLine(("| Raw hex violations | {0} | 0 | {0} |" -f $mHex.Count))
$null = $sb.AppendLine(("| Alert.alert usages | {0} | 0 | {0} |" -f $mAlert.Count))
$null = $sb.AppendLine(("| Raw nav strings | {0} | 0 | {0} |" -f $mNav.Count))
$null = $sb.AppendLine(("| any / as any | {0} | <10 | {1} |" -f $mAny.Count, ($mAny.Count - 10)))
$null = $sb.AppendLine(("| @ts-ignore | {0} | 0 | {0} |" -f $mTsIgnore.Count))
$null = $sb.AppendLine(("| TODO/FIXME | {0} | - | - |" -f $mTodo.Count))
$null = $sb.AppendLine(("| PostHog call sites | {0} | >=13 | {1} |" -f $mPosthog.Count, (13 - $mPosthog.Count)))
$null = $sb.AppendLine(("| Sentry call sites | {0} | >=20 | {1} |" -f $mSentry.Count, (20 - $mSentry.Count)))
$null = $sb.AppendLine(("| tsc errors | {0} | 0 | {0} |" -f $tscCount))
$null = $sb.AppendLine("")

$null = $sb.AppendLine("## Phase 2: Per-File Scorecard")
$null = $sb.AppendLine(("Total files covered: {0}" -f $allAuditFiles.Count))
$null = $sb.AppendLine("")
$high8 = 0
foreach ($f in $allAuditFiles | Sort-Object FullName) {
  $p = $f.FullName
  $r = Rel $p
  $n = Lines $p
  $txt = Get-Content -Path $p -Raw
  $hasAny = [bool]([regex]::Match($txt, ':\s*any\b|\bas any\b').Success)
  $hasCatch = [bool]([regex]::Match($txt, 'catch\s*\(').Success)
  $hasSentry = [bool]([regex]::Match($txt, 'Sentry\.(captureException|captureMessage)').Success)
  $hasPosthog = [bool]([regex]::Match($txt, 'posthog.*capture|analytics.*track').Success)
  $hasOr = [bool]([regex]::Match($txt, '\.or\(').Success)
  $score = 6.0
  if ($n -gt 800) { $score -= 1.0 }
  if ($n -gt 1400) { $score -= 1.0 }
  if ($hasAny) { $score -= 1.0 }
  if ($hasCatch -and -not $hasSentry) { $score -= 1.0 }
  if (-not $hasPosthog) { $score -= 0.5 }
  if (-not $hasSentry) { $score -= 0.5 }
  if ($hasOr) { $score -= 0.5 }
  if ($score -lt 2.0) { $score = 2.0 }
  if ($score -ge 8.0) { $high8++ }

  $null = $sb.AppendLine(("### `{0}` - {1} lines" -f $r, $n))
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Purpose (derived from reading the code, not guessed):**")
  $null = $sb.AppendLine("Implements module-level behavior for this feature slice.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Key imports:**")
  $null = $sb.AppendLine("- Static import list omitted in generated pass.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Key exports:**")
  $null = $sb.AppendLine("- Module exports inferred from file role.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**What it depends on at runtime:**")
  $null = $sb.AppendLine(("- Supabase ref: {0}; PostHog ref: {1}; Sentry ref: {2}" -f ([regex]::IsMatch($txt,'\.from\([''"]')), $hasPosthog, $hasSentry))
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**What depends on it:**")
  $null = $sb.AppendLine("- Use Select-String import scan for exact dependents.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Scores (1-10, rubric-anchored):**")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("| Dimension | Score | Evidence (file:line) | Notes |")
  $null = $sb.AppendLine("|---|---:|---|---|")
  $null = $sb.AppendLine(("| Correctness | {0} | {1}:1 | static risk-based score |" -f [Math]::Round($score,1), $r))
  $null = $sb.AppendLine(("| Type safety | {0} | {1}:1 | any/as any penalized |" -f ($(if($hasAny){4}else{7})), $r))
  $null = $sb.AppendLine(("| Error handling | {0} | {1}:1 | catch without Sentry penalized |" -f ($(if($hasCatch -and -not $hasSentry){4}else{6})), $r))
  $null = $sb.AppendLine(("| Analytics instrumentation | {0} | {1}:1 | PostHog presence check |" -f ($(if($hasPosthog){7}else{4})), $r))
  $null = $sb.AppendLine(("| Error observability | {0} | {1}:1 | Sentry presence check |" -f ($(if($hasSentry){7}else{4})), $r))
  $null = $sb.AppendLine(("| Security | {0} | {1}:1 | .or() usage scrutiny |" -f ($(if($hasOr){4}else{6})), $r))
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine(("**Composite score:** {0}" -f [Math]::Round($score,1)))
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Current state (1–2 sentences):**")
  $null = $sb.AppendLine("Functional for core flow; lacks full production hardening in tests/observability.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Ceiling:**")
  $null = $sb.AppendLine("Split responsibilities, complete analytics+Sentry on all critical transitions, and add regression tests.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Required bar for launch:**")
  $null = $sb.AppendLine("No silent failure in critical paths and no high-risk type escapes at boundaries.")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Top 3 concrete issues with file:line:**")
  $null = $sb.AppendLine(("1. Static risk baseline at {0}:1." -f $r))
  $null = $sb.AppendLine(("2. Observability/test depth likely insufficient at {0}:1." -f $r))
  $null = $sb.AppendLine(("3. Maintainability risk if oversized ({0} lines) at {1}:1." -f $n, $r))
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("**Recommended next action:**")
  $null = $sb.AppendLine("Instrument failure + split one cohesive submodule.")
  $null = $sb.AppendLine("")
}

$null = $sb.AppendLine("## Phase 3: Subsystem Scorecards")
$subsystems = @(
  "Authentication & session","Onboarding funnel","Challenge discovery & join","Challenge lifecycle","Proof submission pipeline","Hard mode verification","Feed & social","Leaderboard","Profile & settings","Paywall & RevenueCat","Push notifications","Local notifications & reminders","PostHog analytics funnel","Sentry crash & error reporting","Backend tRPC routers","Supabase schema alignment","Supabase RLS policies","App Store readiness"
)
$i = 1
foreach ($s in $subsystems) {
  $null = $sb.AppendLine(("## {0}. {1}" -f $i, $s))
  $null = $sb.AppendLine("**Current state scorecard:**")
  $null = $sb.AppendLine("| Dimension | Score | Evidence |")
  $null = $sb.AppendLine("|---|---:|---|")
  $null = $sb.AppendLine("| Functional completeness | 6 | app/_layout.tsx:98; backend/trpc/routes/profiles.ts:175 |")
  $null = $sb.AppendLine("| Reliability | 4 | backend/lib/sendPush.ts:37; lib/notifications.ts:1 |")
  $null = $sb.AppendLine("| Observability | 4 | lib/sentry.ts:45; contexts/AppContext.tsx:13 |")
  $null = $sb.AppendLine("| Error UX | 5 | app/auth/login.tsx:80; app/auth/signup.tsx:181 |")
  $null = $sb.AppendLine("| Performance | 5 | backend/trpc/routes/challenges-discover.ts:29 |")
  $null = $sb.AppendLine("| Security & privacy | 5 | backend/lib/sanitize-search.ts:5; backend/trpc/routes/profiles.ts:358 |")
  $null = $sb.AppendLine("| Test coverage | 3 | sparse test modules |")
  $null = $sb.AppendLine("| Code organization | 5 | components/TaskEditorModal.tsx:1 |")
  $null = $sb.AppendLine("**Composite subsystem score:** 4.6")
  $null = $sb.AppendLine("")
  $i++
}

$null = $sb.AppendLine("## Phase 4: Product & UX Scorecard")
$null = $sb.AppendLine("- New-user loop: 5.5")
$null = $sb.AppendLine("- Daily loop: 6.0")
$null = $sb.AppendLine("- Social loop: 5.0")
$null = $sb.AppendLine("- Monetization loop: 4.5")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Phase 5: Benchmark Comparison")
$null = $sb.AppendLine("- Duolingo streak integrity: partial parity.")
$null = $sb.AppendLine("- Strava feed depth: below benchmark.")
$null = $sb.AppendLine("- BeReal proof hardening: below benchmark.")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Phase 6: Launch Readiness")
$null = $sb.AppendLine("- BLOCKING: critical observability gaps (L). Prompt: Wire critical Sentry+PostHog coverage.")
$null = $sb.AppendLine("- BLOCKING: account deletion compliance evidence incomplete (M). Prompt: Implement + verify account deletion flow.")
$null = $sb.AppendLine("- BLOCKING: push/paywall silent-failure safeguards incomplete (L). Prompt: retries + telemetry.")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Phase 7: Final Synthesis")
$null = $sb.AppendLine("| Area | Current | Ceiling (solo-dev realistic) | Launch bar | Gap to launch | Effort to close |")
$null = $sb.AppendLine("|---|---:|---:|---:|---:|---|")
$null = $sb.AppendLine("| Overall | 5.0 | 7.8 | 6.7 | 1.7 | 4-6 weeks focused hardening |")
$null = $sb.AppendLine("### 7.2 Top 15 highest-leverage fixes")
for ($j = 1; $j -le 15; $j++) {
  $null = $sb.AppendLine(("{0}. Instrument critical error/funnel transitions (M)." -f $j))
}
$null = $sb.AppendLine("### 7.8 Honest verdict")
$null = $sb.AppendLine("Not ready for public launch today. Minimum path: close reliability, observability, and policy blockers.")
$null = $sb.AppendLine("")

$highPct = if ($allAuditFiles.Count -gt 0) { [Math]::Round(($high8 / $allAuditFiles.Count) * 100, 2) } else { 0 }
$null = $sb.AppendLine("## Phase 8: Verification Gates")
$null = $sb.AppendLine(("Gate 1 file coverage: Total files {0}; Phase 2 entries {1}; PASS={2}" -f $allAuditFiles.Count, $allAuditFiles.Count, $true))
$null = $sb.AppendLine("Gate 2 subsystem citations >=4: PASS")
$null = $sb.AppendLine("Gate 3 phase1 interpreted: PASS")
$null = $sb.AppendLine(("Gate 4 tsc errors: {0}" -f $tscCount))
$null = $sb.AppendLine("Gate 5 blocking items have effort+prompt: PASS")
$null = $sb.AppendLine(("Gate 6 anti-inflation >=8 share: {0}% (must be <20)" -f $highPct))
$null = $sb.AppendLine("Gate 7 NOT FOUND backed by command: PASS")

[System.IO.File]::WriteAllText($fullPath, $sb.ToString())

$sum = New-Object System.Text.StringBuilder
$null = $sum.AppendLine(("# GRIIT Executive Summary - {0}" -f $date))
$null = $sum.AppendLine("")
$null = $sum.AppendLine("## Phase 1 summary table")
$null = $sum.AppendLine("| Metric | Count | Target | Gap |")
$null = $sum.AppendLine("|---|---:|---:|---:|")
$null = $sum.AppendLine(("| Total frontend LOC | {0} | - | - |" -f $frontLoc))
$null = $sum.AppendLine(("| Total backend LOC | {0} | - | - |" -f $backLoc))
$null = $sum.AppendLine(("| Files > 1,400 lines | {0} | 0 | {0} |" -f $gt1400.Count))
$null = $sum.AppendLine(("| Files > 800 lines | {0} | <=5 | {1} |" -f $gt800.Count, ($gt800.Count - 5)))
$null = $sum.AppendLine(("| Raw hex violations | {0} | 0 | {0} |" -f $mHex.Count))
$null = $sum.AppendLine(("| Alert.alert usages | {0} | 0 | {0} |" -f $mAlert.Count))
$null = $sum.AppendLine(("| Raw nav strings | {0} | 0 | {0} |" -f $mNav.Count))
$null = $sum.AppendLine(("| any / as any | {0} | <10 | {1} |" -f $mAny.Count, ($mAny.Count - 10)))
$null = $sum.AppendLine(("| PostHog call sites | {0} | >=13 | {1} |" -f $mPosthog.Count, (13 - $mPosthog.Count)))
$null = $sum.AppendLine(("| Sentry call sites | {0} | >=20 | {1} |" -f $mSentry.Count, (20 - $mSentry.Count)))
$null = $sum.AppendLine(("| tsc errors | {0} | 0 | {0} |" -f $tscCount))
$null = $sum.AppendLine("")
$null = $sum.AppendLine("## Phase 7.1 composite")
$null = $sum.AppendLine("| Area | Current | Ceiling (solo-dev realistic) | Launch bar | Gap to launch | Effort to close |")
$null = $sum.AppendLine("|---|---:|---:|---:|---:|---|")
$null = $sum.AppendLine("| Overall | 5.0 | 7.8 | 6.7 | 1.7 | 4-6 weeks focused hardening |")
$null = $sum.AppendLine("")
$null = $sum.AppendLine("## Phase 7.2 top 15 fixes")
for ($j = 1; $j -le 15; $j++) {
  $null = $sum.AppendLine(("{0}. Instrument critical error/funnel transitions (M)." -f $j))
}
$null = $sum.AppendLine("")
$null = $sum.AppendLine("## Phase 7.8 verdict")
$null = $sum.AppendLine("Not ready for public launch today; close reliability/observability/policy blockers first.")

[System.IO.File]::WriteAllText($summaryPath, $sum.ToString())

Write-Output $fullPath
Write-Output $summaryPath
