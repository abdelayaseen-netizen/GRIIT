# Phase 0.1 — Prior-state read (per v2 prompt §3.1)

**Audit baseline:** `e4f47b0` (HEAD on `main`, clean working tree)  
**Repo:** `abdelayaseen-netizen/GRIIT`  
**Date:** 2026-05-04  
**Reading shell:** macOS / zsh + PowerShell 7.6.1 (installed via Microsoft tarball; sweep evidence in `audit/_run_sweeps.ps1` + `audit/_sweeps_summary.txt`).

> The v2 prompt names a "previous March 2025 audit, `DEEP-CLEAN-SCORECARD.md`, scored 79/100" as the prior-state baseline. **That file does not exist in the repo.** Per AskQuestion answer (`baseline = final`), the canonical baseline for this v2 pass is **`docs/SCORECARD-FINAL.md` (2026-04-05, 7.99/10)**. The most recent grep/lint baselines come from **`docs/audits/GRIIT_DEEP_AUDIT_20260503.md` (2026-05-03)** which was committed yesterday as `90cf9ee` and is much closer in time and methodology to this v2 pass.

---

## A. Baseline #1 — `docs/SCORECARD-FINAL.md` (2026-04-05, weighted 7.99/10)

### Confirmed working at the time of that pass

| Pillar | Prior score | Notes |
|---|---|---|
| Build readiness | 9/10 | EAS profile configured, root + backend `tsc --noEmit` clean. |
| Backend hygiene | 8/10 | 27 procedure files, no `select("*")`. |
| Auth & security | 8/10 | `.or()` paths hardened with `requireUuidForPostgrestOr` + `escapedSafe`. |
| Monetization | 8/10 | RC keys env-driven; subscription sync wired. |
| Type safety | 9/10 | `: any` / `as any` already 0. |
| Error handling | 8/10 | `Alert.alert` removed from `ShareSheetModal`; logger used in backend hotspots. |
| Analytics | 8/10 | `trackEvent` taxonomy in `lib/analytics.ts`. |
| Performance | 8/10 | `windowSize`/`maxToRenderPerBatch`/`removeClippedSubviews` on the major lists. |
| Code hygiene | 8/10 | `console.error` in CelebrationOverlay, ActiveChallenges, GoalCard, ErrorBoundary all `__DEV__`-gated. |
| Database | 8/10 | Migrations under `supabase/migrations/` with policies. |
| Legal | 9/10 | Privacy + ToS shipped. |
| TestFlight readiness | 8/10 | Verdict: **READY (with notes)**. |

### Explicitly left as "watch" (W = improve over time)

| Pillar | Prior score | What was open |
|---|---|---|
| **Design system** (#6) | 7/10 W | "raw `#rrggbb` in app/components where scorecard still flags (excluding allowed paths)" |
| **Accessibility** (#10) | 7/10 W | "audit on high-traffic flows (Forms, paywall, task complete)" |
| **Testing** (#11) | 5/10 W | "E2E / integration tests for join → task complete → feed" |

### Optional follow-ups noted

- Migrate `app/task/checkin.tsx` onto `complete.tsx`; remove `checkin-styles.ts` + `TASK_CHECKIN`.

---

## B. Baseline #2 — `docs/audits/GRIIT_DEEP_AUDIT_20260503.md` (2026-05-03, 17-phase deep audit)

This is the most recent reference and the one whose grep counts I will treat as authoritative for the "delta-only" verification of Phases 3–7. Its Phase 1 metrics, captured at HEAD `1969044`:

| Metric | Result | Top offender |
|---|---|---|
| `tsc --noEmit` errors | **0** | — |
| `expo lint` errors / warnings (`app/`, `components/`) | **0 / 0** | — |
| ESLint outside `expo lint` scope (`backend/`, `docs/`) | 2 errors / 2 warnings | `backend/lib/logger.ts:4` (pino unresolved), `backend/lib/sendPush.ts:2` |
| Empty `catch {}` no-param strictly empty | **0** | — |
| Empty `catch (e) {}` strictly empty | **0** | — |
| Catch with comment-only body | **30** (full breakdown in `docs/audits/GRIIT_CATCH_BLOCK_RECONCILIATION_20260502.md`) | `lib/notifications.ts` (13), `lib/active-task-timer.ts` (3), `lib/analytics.ts` (2), `app/(tabs)/discover.tsx` (2) |
| Strictly-empty body remaining | **1** | `lib/live-activity.ts:96` |
| `console.*` outside logger/sentry/posthog/client-error/tests | **39** | `backend/trpc/app-router.ts` (20), `backend/server.ts` (16), `hooks/useAppChallengeMutations.ts` (2), `lib/analytics.ts` (1) |
| `: any` / `<any>` / `as any` (excluding tests) | **0** | — |
| `TODO/FIXME/HACK/XXX` in `*.ts/*.tsx/*.sql` | **1** in app source | `app/(tabs)/index.tsx:709` |
| Raw hex outside `lib/design-system.ts` | **1 file** | `lib/live-activity.ts` (4 literals — F6) |
| Raw `router.push("/...")` outside `ROUTES` | **0** | — |
| Raw tRPC strings outside `TRPC` constants | **0 in client code** | last one closed in `7609800` |
| Files > 1000 LOC | **6** | `components/create/NewTaskModal.tsx` (1882), `components/TaskEditorModal.tsx` (1746), `app/challenge/[id].tsx` (1606), `components/challenge/challengeDetailScreenStyles.ts` (1166), `app/(tabs)/index.tsx` (1054), `app/task/run.tsx` (1020) |
| Functions > 100 lines | **15** | `TaskCompleteScreenInner` (`hooks/useTaskCompleteScreen.tsx`, **813 lines**), `PublicProfileScreenInner` (`app/profile/[username].tsx`, **663**), `TaskCompleteForm` (**602**), `PostThreadScreenInner` (**440**), `SignupScreenInner` (**415**) |
| Vitest pass rate | **8/14 suites passing** | 5 suites fail with `Failed to load url pino` (loader issue, not real); 1 real failure: `tests/design-system-contrast.test.ts:62-69` (3 WCAG pairs below threshold) |

### Findings F1–F7 status as of 2026-05-03 audit

| ID | Description | Status |
|---|---|---|
| F1 | Onboarding `authUserId` lost on resume | **FIXED** in `fda0c7d` |
| F2 | `active_challenges` UPDATE without RLS policy | **FIXED** in `0f57a2a` (migration `20260502230000_active_challenges_update_policy.sql`) |
| F3 | Root `tsc` fails on `@sentry/node` | **FIXED** in `e34aaab` (`@sentry/node ^10.50.0` in devDependencies) |
| F4 | `profiles` RLS coverage in migrations | **FIXED in committed migrations** in `1b8a868` (DB sync still required → flagged for live verification) |
| F5 | Silent / dev-only RC catches | **FIXED** in `222e9e3` (RC stubs replaced with `captureError`) |
| F6 | Raw hex literals in `lib/live-activity.ts` | **STILL OPEN** (lines 67–71, 4 literals) |
| F7 | `task_started` / `proof_uploaded` / `follow_user` analytics events missing | **CONTRADICTED** — these names are not in `AnalyticsEvent`; `follow_user` is a tRPC procedure name |

---

## C. v2 prompt re-verification of "skipped" items (one grep per claim)

Per v2 prompt §0: "Where the prior pass said something was 'verified empty,' confirm it's still empty with a single grep — don't re-do the whole audit." The v2 prompt's claimed-skipped items were "raw hex (regression to 72), accessibility (65), FlatList memo, useMutation/useQuery onError, env var exposure, input sanitization." Below are the single-grep confirmations executed today via `audit/_run_sweeps.ps1`:

| Prompt-claimed open item | Sweep | Today's count | Confirms / contradicts |
|---|---|---|---|
| Raw hex outside `design-system.ts` | `audit/raw_hex.txt` | **4 lines, 1 file** (`lib/live-activity.ts:74-78`) | Confirms May 3 audit (F6 still open). **Contradicts** v2 prompt's named offenders `app/challenge/[id].tsx`, `app/(tabs)/create.tsx`, `app/paywall.tsx`, `components/ShareCard.tsx`, `src/components/ui/ChallengeCard24h.tsx` — those are clean. |
| Empty `catch {} ` | `audit/silent_catches.txt` | **0** | Confirms May 3 audit. |
| `// error swallowed — handle in UI` comments | `audit/error_swallowed_comments.txt` | **10** in app source (`app/_layout.tsx:147`, `components/ErrorBoundary.tsx:9`, `contexts/AuthContext.tsx:42`, `hooks/useAppChallengeMutations.ts:294`, `:300`, `hooks/useNotificationScheduler.ts:44`, `:48`, `:53`, `lib/review-prompt.ts:48`, `lib/trpc.ts:112`) | **Confirms** v2 prompt's claim that these are "silent catches dressed up as documentation." Real Phase 4 work. |
| `: any` / `as any` | `audit/any_uses.txt` | **0** | Confirms. |
| `console.log` left in production | `audit/console_logs.txt` | **35** lines | All but 3 are **intentional** boot/route-load logs in `backend/server.ts` (15) and `backend/trpc/app-router.ts` (20). 3 stragglers worth Phase 4 review: `hooks/useAppChallengeMutations.ts:226` (`[secureDay] called`, ungated debug), `lib/analytics.ts:172` (`__DEV__`-gated, fine), `lib/posthog.ts:18` (need to inspect). |
| `GRIT` typos (no `GRIIT`) | `audit/grit_typos.txt` | **42** lines, **0 in source code** | All in `docs/` and `README.md:26` (`cd GRIT-1` legacy clone hint) and historical Windows audit docs in `docs/audits/`. Source code (`app/`, `components/`, `lib/`, `backend/`, `hooks/`) is clean. The `docs/DEPLOYMENT.md` references are to the Railway service ID `grit-backend` (legitimate infrastructure name, not a typo). |
| Raw route strings | `audit/raw_route_strings.txt` | **0** | Confirms May 3 audit. |
| RN `Image` usage | `audit/rn_image_uses.txt` | **0** | `expo-image` migration is complete. |
| Service role key outside backend | `audit/service_role_uses.txt` | **5 hits, all in `backend/`** | Clean — no frontend exposure. |

**Net delta from v2 prompt's premise:** the bulk of the "moderate consolidation" work the v2 prompt assumes is open (raw hex, route constants, GRIT typos in source) is **already closed** by the April 5 + May 3 passes. The genuine open items at HEAD are:

1. **`lib/live-activity.ts`** — 4 hex literals + 1 strictly-empty `catch{}` block (F6 from May 3 audit).
2. **`error swallowed — handle in UI`** comments × 10 — Phase 4 needs to convert each into either a `captureError(err, ctx)` log or a meaningful UI-side handler.
3. **Stragglers in test/loader infrastructure** — `pino` import failure breaks 5 vitest suites (loader config, not real regression).
4. **WCAG contrast** — `tests/design-system-contrast.test.ts:62-69` reports 3 pairs below threshold; Phase 6 picks this up.
5. **GRIT in `README.md:26`** (`cd GRIT-1`) — single user-facing string worth fixing in Phase 3.
6. **GRIT in user-facing docs** — `docs/DESIGN-SYSTEM.md:1`, `docs/IOS-RELEASE-CHECKLIST.md:3,51`. Historical audit docs in `docs/audits/` are frozen records — leave alone.
7. **Privacy/follow contracts (Section 2)** — net-new work, see `audit/privacy_followup_inventory.md`.
8. **Task-completion loop reconciliation (Section 2.5)** — needs trace + smoke test, see Phase 2.

---

## D. Items confirmed deferred (per v2 prompt §12)

These live in the repo but **must not be touched** in this pass:

- `supabase/migrations/1776038400_backfill_day_secures_and_streaks.sql` — backfill migration (timestamp `1776038400` = far-future epoch sentinel; explicitly out of scope).
- MMKV migration for Zustand persistence.
- RN 0.84 / Expo SDK 55 upgrade.
- Streak rebuild script for testers affected by historical UTC timezone bug.
- `web-fallback/` and `web-fallback-deploy/` directories (do not exist in this repo — no action needed).
- New features (Habit Builder, etc.).
- Folder restructuring or file renames.
- Dependency version bumps.
- Native iOS/Android config beyond `app.json`.
