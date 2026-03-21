# Sprint 1 Report: Trust & Polish

**Date:** 2026-03-21

**Commits:**

- `5a968e0` — feat: Sprint 1 trust & polish (cache, DS tokens, InlineError, a11y)
- Latest on `main`: `docs: Sprint 1 report with before/after metrics` (run `git log -1 --oneline` after pull for SHA)

## Verification commands (run from repo root)

PowerShell equivalents of the sprint greps:

```text
# queryClient clear on sign-out (expected: profile + 2× settings)
git ls-files "*.tsx" "*.ts" | ForEach-Object { Select-String -Path $_ -Pattern "queryClient\.clear|removeQueries|resetQueries" }

# accessibilityLabel count (git-tracked .ts/.tsx only)
(git ls-files "*.tsx" "*.ts" | ForEach-Object { (Select-String -Path $_ -Pattern "accessibilityLabel" -ErrorAction SilentlyContinue).Count } | Measure-Object -Sum).Sum

# Alert.alert count
(git ls-files "*.tsx" "*.ts" | ForEach-Object { (Select-String -Path $_ -Pattern "Alert\.alert" -ErrorAction SilentlyContinue).Count } | Measure-Object -Sum).Sum

# Raw hex (excludes lib/design-system.ts path only)
$hex = 0; git ls-files "*.tsx" "*.ts" | ForEach-Object { if ($_ -match "design-system") { return }; $c = Select-String -Path $_ -Pattern "#[0-9A-Fa-f]{3,8}" -ErrorAction SilentlyContinue; if ($c) { $hex += $c.Count } }; $hex
```

**Sample output from this audit:**

- `queryClient.clear`: matches in `app/(tabs)/profile.tsx` (1×), `app/settings.tsx` (2×).
- `accessibilityLabel`: **199** total matches (tracked sources).
- `Alert.alert`: **42** total matches (tracked sources; confirmations and non-error flows retained).
- Raw `#hex` outside `design-system`: **162** remaining occurrences (down from pre–Phase 1 baseline; eight target files tokenized).

## Metrics

| Metric | Before (scorecard / estimate) | After (2026-03-21) | Delta |
|--------|-------------------------------|---------------------|-------|
| Raw hex count (codebase-wide, excl. `lib/design-system.ts`) | Dozens+ in hot files | 162 | Reduced; 8 files fully tokenized per Phase 1 |
| Alert.alert count | 100+ | 42 | Error-only alerts moved to `InlineError` where applicable |
| accessibilityLabel count | Lower | 199 | Increased across targeted screens + onboarding |
| Unlabeled interactive elements | N/A (heuristic noisy on Windows) | — | Spot-fixed high-traffic screens |
| queryClient.clear on signout | 0 | 3 | +3 (profile once; settings twice incl. delete flow) |
| GRIT misspellings in `app/` + `components/` (excl. bundle IDs) | — | 0 | `grep \bgrit\b` on `app/`, `components/`: no matches |

## Estimated Scorecard Impact

| Category | Before | Estimated After |
|----------|--------|-----------------|
| 1A Design System | 20 | ~60+ |
| 1B GRIIT Spelling | 65 | ~85+ |
| 1E Accessibility | 38 | ~55+ |
| 1F Error Handling | 38 | ~65+ |
| 3A Auth Flow | 70 | ~80+ |
| **Overall (weighted)** | **69** | **~80+** |

## Files Changed

**Phase 0 — cache + spelling**

- `app/(tabs)/profile.tsx`, `app/settings.tsx`, `README.md`, `lib/config.ts`, `app/(tabs)/activity.tsx` (spelling + DS overlap)

**Phase 1 — design tokens**

- `components/community/Leaderboard.tsx`, `LiveActivity.tsx`
- `components/home/GoalCard.tsx`, `WeekStrip.tsx`
- `components/profile/ProfileHeader.tsx`, `RankProgress.tsx`
- `app/(tabs)/index.tsx`, `app/(tabs)/activity.tsx`

**Phase 2 — inline errors**

- `components/InlineError.tsx`, `hooks/useInlineError.ts`
- `app/task/run.tsx`, `timer.tsx`, `photo.tsx`, `journal.tsx`, `complete.tsx`, `manual.tsx`
- `app/(tabs)/create.tsx`, `app/challenge/[id].tsx`

**Phase 3 — accessibility**

- `app/(tabs)/discover.tsx`, `app/welcome.tsx`, `app/settings.tsx`, `app/challenge/[id].tsx`
- `app/auth/login.tsx`, `app/auth/signup.tsx`
- `components/profile/ProfileActions.tsx`
- `components/onboarding/OnboardingFlow.tsx`, `screens/ValueSplash.tsx`, `GoalSelection.tsx`, `SignUpScreen.tsx`, `AutoSuggestChallengeScreen.tsx`

## Known Remaining Gaps

- Raw hex remains in files outside the eight Phase 1 targets (~162 matches excluding `design-system.ts`).
- `Alert.alert` still used for confirmations, success feedback, and some flows (~42 total).
- Historical docs and setup guides still mention “GRIT” in places; app and `components` source under `app/` and `components/` have no standalone `grit` token per audit.
- Full interactive “unlabeled touchable” count not automated on Windows CI; manual pass covered listed screens.
