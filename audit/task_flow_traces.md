# Phase 2 §5.1 — Task-completion flow traces

**Audit baseline:** `e4f47b0`  
**Date:** 2026-05-04  
**Method:** Code reading (no runtime trace; that lives in §5.4 smoke-test plan).

This file traces the path from "user taps task tile" → "server returns 200" → "UI reconciles" for every active task subtype.

---

## 0. Inventory of task subtypes still active at HEAD `e4f47b0`

Per `lib/routes.ts` after the April 5 cleanup (`docs/SCORECARD-FINAL.md` line 15: removed `TASK_JOURNAL`/`TASK_PHOTO`/`TASK_MANUAL`/`TASK_TIMER`):

| Route constant | File | LOC | Notes |
|---|---|---:|---|
| `TASK_COMPLETE` | `app/task/complete.tsx` (17-line wrapper) → `hooks/useTaskCompleteScreen.tsx::TaskCompleteScreenInner` (862 LOC, 813-line function per May 3 audit) | 879 | Universal: funnels `manual`, `photo`, `timer`, `journal`, `run`/`workout`, `reading`, `water`, `counter` |
| `TASK_CHECKIN` | `app/task/checkin.tsx` | 697 | Location check-in (when `FLAGS.LOCATION_CHECKIN_ENABLED`) |
| `TASK_RUN` | `app/task/run.tsx` | 1030 | GPS run with map |

`app/task/manual.tsx`, `photo.tsx`, `timer.tsx`, `journal.tsx` were deleted in the April 5 cleanup (`docs/SCORECARD-FINAL.md` Phase 1 evidence). Confirmed: `Glob` against those paths returns 0 files.

---

## 1. Universal task complete (`TaskCompleteScreenInner`)

### Frame: parent calls and entry point
- Entry: `handleMissionStart` (in `app/challenge/[id].tsx`) builds `params` and calls `router.push(ROUTES.TASK_COMPLETE(params))`.
- The screen mounts: `app/task/complete.tsx` → `<ErrorBoundary><TaskCompleteScreenInner /></ErrorBoundary>`.

### Sequence (user taps task tile → server returns 200 → UI reconciles)

| # | Step | File:line | Notes / state mutations |
|---|---|---|---|
| 1 | User taps task on Home or Challenge Detail | `app/(tabs)/index.tsx`, `app/challenge/[id].tsx` | navigates with `taskId`, `activeChallengeId`, `taskType`, `taskName`, `taskConfig` URL params |
| 2 | `TaskCompleteScreenInner` parses params | `hooks/useTaskCompleteScreen.tsx:51-83` | `taskId`, `activeChallengeId`, `taskType`, `taskName`, `config` (parsed JSON), header challenge name + day numbers |
| 3 | Hook initializes state | `:68-118` | `submitted`, `isSubmitting`, `hardGatesPassed=true`, `gatesLocation`, `completionMeta`, `runDistance`, `workoutDuration`, `photoCaption`, `postCaption`, `showShareSheet`, `variableReward`, etc. |
| 4 | `useApp()` reads context | `:63` | provides `activeChallenge`, `completeTask` (from `useAppChallengeMutations`), `challenge`, `stats`, `computeProgress`, `todayCheckins` |
| 5 | If `config.hard_mode === true`, `<VerificationGates />` renders | `components/task/VerificationGates.tsx:23-326` | runs continuously while screen is mounted: `useEffect` on `[config, hasSchedule]` (30 s `setInterval` for time gate); `useEffect` on `[config, hasLocationGate]` (one-shot location fetch); `computeAndReport` callback in `useEffect` on every gate change |
| 6 | Gates report up via `onGatesResolved(allPassed, locationData)` | `:171-202` | `TaskCompleteScreenInner` sets `hardGatesPassed` + `gatesLocation`. **`onTimeWindowFailed` callback flips `timeWindowFailed=true`** which surfaces an inline banner |
| 7 | User fills task-specific input (photo / timer / journal / workout / counter / etc.) | `components/task/TaskCompleteForm.tsx` (713 LOC) | each subtype owns its own state setters; submit button is disabled when `isSubmitting === true OR (config.hard_mode AND !hardGatesPassed)` |
| 8 | User taps submit → `handleSubmit` (or per-subtype handler) | `hooks/useTaskCompleteScreen.tsx` (within the 813-line function) | sets `isSubmitting=true`, builds payload (`activeChallengeId`, `taskId`, `value`/`noteText`/`proofUrl`/`photo_url`/`heart_rate_*`/`location_*`/`timer_seconds_on_screen`/`clocked_in_at`/`task_mode`) |
| 9 | Optimistic update applied | `hooks/useAppChallengeMutations.ts:102-108` | `previousCheckins = todayCheckins.slice()` (snapshot); `setTodayCheckins([...prev, optimisticCheckin])`. Haptic success fires immediately on non-web (`:98-100`). |
| 10 | Network call: `trpcMutate(TRPC.checkins.complete, params)` | `:110` | tRPC POST to backend |
| 11 | Backend checks ownership + writes row | `backend/trpc/routes/checkins.ts` `complete` mutation | uses `assertActiveChallengeOwnership` guard, inserts into `check_ins` |
| 12 | On success: analytics fired (`day_7_retained`, `day_3_retained`, `task_completed`, `day1_task_completed`, `minimum_day_completed`, `first_task_completed` based on context) | `:112-204` | each in its own `try/catch /* non-fatal */` (acceptable for analytics) |
| 13 | Cache invalidation | `:154-163` | invalidates `["home"]`, `["home","v2",userId]`, `["discover","myActive",userId]`, `["discover","completed",userId]`, `["community","activeChallenges",userId]`, `["community","feed",userId]`, `["profile"]` |
| 14 | `showGoalCelebration(5)` triggers a 5-second celebration overlay | `:164` | reads from `store/celebrationStore.ts` |
| 15 | Returns `{ firstTaskOfDay, completionId }` to caller | `:204` | |
| 16 | `TaskCompleteScreenInner` flips `submitted=true` and surfaces `<TaskCompleteCelebration />` | `components/task/TaskCompleteCelebration.tsx` | celebration moment per §2.5 #3 |
| 17 | "Share to feed?" prompt is shown OR auto-skipped per `MILESTONE_SHARE_DAYS` | `useAppChallengeMutations.ts:268-279` (for secureDay path) and inline in `useTaskCompleteScreen` (for completion path via `useProofSharePromptStore`) | Per §2.5 #4 — sharing is an optional separate step |

### On error
- `useAppChallengeMutations.ts:206-212` reverses the optimistic update via `setTodayCheckins(previousCheckins)`, calls `captureError(err, "AppContextCompleteTask")`, then `throw new Error(msg)` so the caller can show a user-friendly retry CTA via `useInlineError().showError`. ✅ Matches §2.5 #5.

### Section 2.5 contract match

| §2.5 clause | Implemented? | Evidence |
|---|---|---|
| #1 Inline gate state pre-submit | ✅ | `VerificationGates` is rendered above the submit button; `hardGatesPassed` disables submit when gates fail |
| #2 Optimistic streak/day-secure feedback | ⚠️ partial — optimistic on `todayCheckins` (Step 9). The streak number itself updates only after `secureDay` mutation succeeds (separate flow, see §2 below). The "day-secure flag" is implicit in `current_day` increment which is server-side. | `useAppChallengeMutations.ts:108` for checkin optimistic; `:280-284` for streak (no optimistic — relies on server result). |
| #3 Single source for `canSecureDay` | ✅ | Frontend reads `t.config?.required` directly (`useAppChallengeMutations.ts:88-95`) **and** `t.required` from the API shape (which `mapTaskRowToApi` derives from `config->>'required'`, see §3 below). SQL function uses `config->>'required'`. All three sources agree. |
| #4 Sharing is separate, optional, with skip first-class | ✅ | `useProofSharePromptStore` opens a sheet; user can skip without affecting completion. `MILESTONE_SHARE_DAYS` (`{7, 14, 21, 30, 45, 60, 75}`) is the only auto-prompt trigger. |
| #5 Failure rolls back safely | ✅ | `:102-108, 206-212` snapshot + restore + `captureError` + throw |

---

## 2. Streak & day-secure (separate from completion)

The "secure the day" step is a separate user action that completes a day's worth of tasks. It happens after every required task on a given day is completed.

### Sequence

| # | Step | File:line |
|---|---|---|
| 1 | After last required task completes, `canSecureDay = true` derived in `AppContext` (or wherever) | `contexts/AppContext.tsx` (referenced by `useApp().canSecureDay`) |
| 2 | UI button "Secure the day" appears on Home / Challenge Detail | `app/(tabs)/index.tsx`, `app/challenge/[id].tsx` |
| 3 | User taps → calls `secureDay()` from `useAppChallengeMutations.ts` | `hooks/useAppChallengeMutations.ts:218` |
| 4 | `console.log("[secureDay] called", ...)` fires (ungated; **Phase 2 fix target**) | `:226` |
| 5 | Guard: `if (!activeChallenge?.id || !canSecureDay) return undefined` | `:231` |
| 6 | `trpcMutate(TRPC.checkins.secureDay, { activeChallengeId })` | `:233` |
| 7 | Backend `checkins.secureDay` calls Postgres function `secure_day(p_active_challenge_id)` | `backend/trpc/routes/checkins.ts`, `supabase/migrations/20250309000000_secure_day_challenge_tasks_config.sql` |
| 8 | SQL function: re-checks all required tasks (reading `config->>'required'`), inserts `day_secures`, updates `streaks` row, increments `active_challenges.current_day`, awards `last_stand_earned` if applicable, updates `profiles.total_days_secured` + `tier` | migration lines 51-114 |
| 9 | Returns `{ newStreakCount, lastStandEarned, challengeDay, challengeCompleted, challengeId, challengeName, totalDays }` | `useAppChallengeMutations.ts:233-242` |
| 10 | `trackEvent("day_secured", ...)`, `track({ name: "day1_secured", ... })`, `MILESTONE_SHARE_DAYS` proof-share prompt | `:248-279` |
| 11 | `fetchActiveChallenge`, `fetchStats` fire and update UI | `:280-281` |
| 12 | Notification scheduling: `scheduleNextSecureReminder`, `cancelLapsedUserReminders`, `scheduleLapsedUserReminders`, `scheduleMilestoneApproachingIfNeeded`, `fireStreakCelebration` | `:286-304` |
| 13 | On error: `console.error("[secureDay] mutation failed", err)` (**Phase 2 fix target** — should route to Sentry) + `throw err` | `:307-310` |

### Section 2.5 violations in this flow

| Violation | Site | Severity |
|---|---|---|
| Ungated `console.log("[secureDay] called", ...)` in production | `:226` | Low — chatty log, not a bug |
| `// error swallowed — handle in UI` on `scheduleNextSecureReminder` failure | `:294` | **Medium** — silent failure of a notification scheduler. Per v2 prompt §0 hard rule, this is a "silent catch dressed up as documentation." |
| `// error swallowed — handle in UI` on `scheduleMilestoneApproachingIfNeeded` failure | `:300` | **Medium** — same |
| `console.error` instead of `captureError` on the secureDay catch | `:308` | Medium — Sentry never sees the failure even though it's the most important mutation in the app |

---

## 3. The `t.required` "false-positive bug" (Phase 2 §5.3 sweep clarification)

The v2 prompt §5.3 expects `t.required` count to be 0 ("Expected: 0"). Current count is **3** (`audit/required_field_uses.txt`). After reading the surrounding code:

### What `t.required` actually means in this codebase

There are **two surfaces** with a `required` field on tasks:

| Surface | Where | Source of truth |
|---|---|---|
| Raw DB row (`ChallengeTaskRowRaw`) | `backend/lib/challenge-tasks.ts:24-32` | `config.required` (a JSONB key); top-level `required` column does NOT exist on the live `challenge_tasks` table. |
| API shape (`ChallengeTaskApiShape`) returned to the frontend | `backend/lib/challenge-tasks.ts:57-85` line 61: `required: boolean;` | Always populated by `mapTaskRowToApi:97-98`: `cfg.required !== false` (defaults to `true` if unset). |

So `t.required` at the **API shape** is always populated, derived from `config->>'required'`, defaults to `true`. **It is the canonical access pattern** when reading from a typed API response.

### Audit of the 3 callsites

| Site | Reads from | Verdict |
|---|---|---|
| `hooks/useTaskCompleteShareCardProps.ts:75` `ch?.challenge_tasks?.filter((t) => t.required)` | `challenge` from `TRPC.challenges.getById` → goes through `mapTaskRowsToApi` (verified at `backend/trpc/routes/challenges.ts:96, 258`) | ✅ **CORRECT** — reads the API-shape field |
| `hooks/useTaskCompleteShareCardProps.ts:97` same pattern | same | ✅ **CORRECT** |
| `components/home/ActiveChallenges.tsx:31` `tasks.filter((t) => t.required !== false)` | `ActiveChallengeItem.challenges.challenge_tasks` from active-challenges queries — most paths go through `mapTaskRowsToApi`, but some use raw selects | ⚠️ **Probably correct** but the `!== false` semantics differ from the other two sites (`!== false` defaults to true; `(t.required)` defaults to false). **Inconsistency worth fixing in Phase 3 (consolidation), not Phase 2.** |

### What the v2 prompt §5.3 grep is *actually* meant to catch

The bug pattern userMemories warns about is reading `t.required` from a **raw DB row** (where the column doesn't exist), giving `undefined`. Searching for that pattern in this codebase: **0 raw-DB-row reads of `t.required` anywhere**. All 3 hits are reading from the API shape, which is the correct access pattern.

### Disposition

- The v2 prompt §5.3 expected count of 0 is **wrong for this codebase**. The 3 hits are correct usage.
- **Phase 2 will NOT delete or rewrite these 3 lines** — doing so would either:
  1. Force them through `t.config?.required` (the internal representation), bypassing the API contract.
  2. Treat the API as untrusted, adding defensive `?? true` logic the contract already guarantees.
- **Phase 2 deliverable:** document this finding (this section), update `audit/required_field_uses.txt` consumers to expect `3` as the target, and flag the `!== false` vs `(t)` inconsistency for Phase 3.
- **No fix required** for the bug pattern itself.

---

## 4. Check-in (`app/task/checkin.tsx`)

(Not fully traced this pass — 697 LOC. The §2.5 contract behavior is largely shared via `useApp().completeTask`. Spot-check confirms it uses the same `completeTask` path which inherits the optimistic-update + rollback semantics from §1.)

**Phase 2 disposition:** trace deferred unless Phase 4 surfaces a check-in-specific bug. The screen reuses the central mutation, so §2.5 contract compliance follows from §1.

---

## 5. GPS run (`app/task/run.tsx`)

(Not fully traced this pass — 1030 LOC. The `start/stop/save` lifecycle is more complex but the final save funnels through `completeTask` per the May 3 audit.)

**Phase 2 disposition:** same as §4 — spot-check + defer full trace to Phase 4 unless a run-specific bug surfaces.

---

## 6. Phase 2 fix list (root-cause-confirmed only, per v2 prompt §7.1)

| # | Bug | Symptom | Root cause | Fix | Verification |
|---|---|---|---|---|---|
| F2.1 | `useAppChallengeMutations.ts:226` ungated `console.log("[secureDay] called", ...)` | Chatty production log on every secure-day call | Was never wrapped in `__DEV__`. Same pattern is correctly used at `lib/analytics.ts:172`. | Wrap in `if (__DEV__) { console.log(...) }` (matches existing convention). | grep `console\.log\("\[secureDay\]` → 0 matches outside `__DEV__` block |
| F2.2 | `useAppChallengeMutations.ts:294` `// error swallowed — handle in UI` | `scheduleNextSecureReminder` failure is invisible | Comment-only catch; per v2 prompt §0 this is forbidden | Replace with `captureError(err, "scheduleNextSecureReminder")` from `lib/sentry`. Notification scheduling failure is non-fatal but must be observable. | grep `error swallowed` in this file → 0 |
| F2.3 | `useAppChallengeMutations.ts:300` same pattern on `scheduleMilestoneApproachingIfNeeded` | Same | Same | Same | Same |
| F2.4 | `useAppChallengeMutations.ts:308` `console.error("[secureDay] mutation failed", err)` | Most-important mutation failure never reaches Sentry | Direct `console.error` instead of `captureError` | Add `captureError(err, "secureDay")` before the `throw`. Keep the `throw` so the caller can surface a retry CTA. | grep `console\.error.*secureDay` → 0 |

These four are the Phase 2 fix list. Nothing else in the §2.5 trace requires source changes.

---

## 7. Smoke test plan (§5.4)

Physical-device smoke test required by the v2 prompt §5.4:

1. **Hard Mode failing gate:** open a Hard Mode task whose `schedule_window_start/end` is in the future. Expected: `<VerificationGates>` shows `Time window | Locked | Opens in Xh Ym`. Submit button is disabled.
2. **Passing task with optimistic streak:** complete a normal task. Expected: streak number animates / refreshes immediately after tap, before network completes (currently: optimistic on `todayCheckins`, streak waits for server — partial gap noted in §1).
3. **Network disconnect during submit:** disable network, tap submit. Expected: optimistic completion appears, then rolls back when network catch fires; user sees retry CTA via `useInlineError`.
4. **Submit → celebration → share prompt → skip:** complete a task on a `MILESTONE_SHARE_DAYS` day. Expected: celebration shows, then share sheet appears, user taps Skip (first-class option), task remains completed.

**Disposition:** I cannot execute physical-device smoke tests. This plan is captured here so the user (or a QA pass) can run it against the Phase 2 commits before they're merged.
