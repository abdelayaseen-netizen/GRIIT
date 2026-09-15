# BLOCKERS — Daylight v3 Implementation

Branch: `feat/daylight-v3` | Date: 2026-06-24

---

## B1 — Real Verification: `verifyTask` returns success unconditionally

**Screen:** Home (S1/S2), Post Proof (S5), Streak Moment (S12)  
**What's missing:** `completeTask()` calls the real backend `checkins.complete` tRPC procedure, but there is no independent "verification" step that confirms a photo was actually taken live (vs uploaded). Camera-only mode (`require_camera_only === true`) is enforced client-side in `usePhotoCapture.handlePickImage`, but the server does not validate that a photo is from the camera.

**Flag:** `FLAGS.REAL_VERIFICATION = false`  
**Effect:** Home secured state transition and streak increment continue to show when `completeTask()` succeeds (real server call), but the UI celebrates as "secured" even though real camera verification is not independently confirmed server-side.

**Gap for future sprint:** Server-side `require_camera_only` enforcement + timestamp/metadata validation.

---

## B2 — Freeze action: not server-enforced per session

**Screen:** Home (S1, atRisk), Jeopardy (S3)  
**What's missing:** `TRPC.streaks.useFreeze` exists and is called when user taps "Use a freeze". However, there is no server-side check that the freeze is being applied in the same session where the streak-at-risk condition was confirmed. The client call is real, but success UX relies on client-derived state.

**Flag:** `FLAGS.FREEZE_SERVER_ENFORCED = false`  
**Effect:** Freeze button calls `trpcMutate(TRPC.streaks.useFreeze)` on press. If call fails, error is shown. Success dismisses the modal. No deceptive "it worked" — if the mutation throws, the error state is visible.

---

## B3 — Respect mutation: not independently server-enforced per session

**Screen:** Feed (S4)  
**What's missing:** `TRPC.feed.react` is a real mutation and does run server-side. However, the `FREE_LIMITS.MAX_DAILY_RESPECTS` cap (5/day) is only checked client-side in the `FLAGS.PREMIUM_ENABLED` path. The server does not enforce per-user per-day respect limits beyond the tRPC handler.

**Impact:** Minor — single respect signal is wired correctly. Limit enforcement is a future hardening task.  
**No flag required** — this is a hardening gap, not a missing flow.

---

## B4 — Streak Moment (S12): trigger requires Proof → Home navigation

**Screen:** Streak Moment (S12)  
**What's missing:** The `StreakMomentOverlay` fires when `proofSharePromptStore.payload` is set AND all tasks for today are complete. The `proofSharePromptStore.show()` is called from `TaskCompleteCelebration` on successful task completion. However, the moment only fires **on Home screen** — if the user navigates away directly to another tab, the overlay will not appear until they return to Home.

**Decision:** This is acceptable behavior (moment fires on next Home visit after completion). Log only.

---

## B6 — Phase 8: TestFlight build blocked (EXPO_TOKEN absent + no ASC API key)

**Screen:** N/A — CI/ship blocker  
**What's missing:** Two credentials are required for a fully non-interactive EAS build + submit:

1. **`EXPO_TOKEN`** — EAS account token for `pure.soul.business@gmail.com`. Must be set as an env var before running `eas build`. Currently absent from the shell environment.

2. **ASC API Key** — `eas.json` submit profile (`production`) has `appleTeamId` and `ascAppId` but is missing the App Store Connect API key fields (`appleApiKeyId`, `appleApiIssuerId`, `appleApiKeyPath`). Without these, `eas submit --non-interactive` cannot authenticate to App Store Connect and will fail or hang.

**Impact:** EAS build and submit were skipped entirely in Phase 8. The branch is pushed and the PR is open. No build artifact exists.

**To unblock:**
1. Export `EXPO_TOKEN=<eas-token-for-pure.soul.business@gmail.com>`
2. Add to `eas.json` under `submit.production.ios`:
   ```json
   "appleApiKeyId": "<key-id>",
   "appleApiIssuerId": "<issuer-id>",
   "appleApiKeyPath": "<path-to-.p8>"
   ```
3. Run from `feat/daylight-v3`:
   ```bash
   eas build --platform ios --profile production --non-interactive
   eas submit --platform ios --latest --profile production --non-interactive
   ```
4. Set TestFlight "What to Test":
   > New Daylight UI across Home, Feed, Discover, Proof, plus the new streak-jeopardy screen. Note: completing/securing a day is intentionally disabled in this build (verification backend pending) — review UI and navigation only.

---

## B5 — "Build your own" route: Create wizard is mid-migration

**Screen:** Discover (S6)  
**What's noted:** `CreateWizardV2` (in `app/(tabs)/create.tsx`) and `CreateChallengeWizard` (in `app/create/index.tsx`) are both in the repo. Per spec, the "Build your own" CTA routes to the **existing entry point only** — `ROUTES.CREATE_WIZARD` (`/create`). This is the full-screen modal that was on main. The internal wizard state machine is untouched.

---

## Appended: SHIP_TASK_FLOW blockers (from `feat/task-flow-daylight`, merged 2026-07-09)

# BLOCKERS.md — SHIP_TASK_FLOW (v2)

## Phase 0 blockers

### B-01 — Check-in location gate non-functional on unified screen
**Severity:** Critical  
**File:** `hooks/useTaskCompleteScreen.tsx:1092–1094`  
`setUserLocation`, `handleCheckLocation`, and `onHardGatesResolved` are in the suppression
`void` block. `userLocation` is always `null`, `distance` is always `null`, `locationOk`
resolves to `!config.require_location` (i.e. always true when location not required).  
**Impact:** Check-in type on `task/complete.tsx` cannot verify the user is at the correct
location. The gates card in `TaskShell` shows the location gate but it never resolves to "pass".  
**Resolution (Phase 3):** Remove from suppression block; wire `handleCheckLocation` as the
"Start" arming action for checkin type; pass live `distance` and `locationOk` into
`TaskCheckinBody`.

---

### B-02 — Legacy screens still reachable via deep-link
**Severity:** High  
**Files:** `app/task/checkin.tsx`, `app/task/run.tsx`  
Both screens are marked `// LEGACY` and use the deprecated `verifyTask` context method.
`app/task/run.tsx` additionally passes a raw `file://` URI as `proofUrl` (server rejects this;
noted in a comment at line 529 of `run.tsx`).  
Both routes (`ROUTES.TASK_CHECKIN`, `ROUTES.TASK_RUN`) are still active and reachable from old
push notification deep-links.  
`FLAGS.LOCATION_CHECKIN_ENABLED = false` gates the home-screen navigation entry point for
`checkin.tsx` only.  
**Resolution (Phase 1/3):** Add `FLAGS.LEGACY_CHECKIN_SCREEN` and `FLAGS.LEGACY_RUN_SCREEN`
(default `false`). Gate the screens behind these flags. Full replacement in Phase 3.

**Phase 1 status:** DONE — `app/task/run.tsx` and `app/task/checkin.tsx` now export a
`*Blocked` fallback component when the flag is `false`. Deep-links to these routes show a
"Go back" redirect screen instead of the legacy UI.

---

### B-03 — `secure_day` RPC may fail if migration not applied
**Severity:** Low (already handled by server)  
**File:** `backend/trpc/routes/checkins.ts:712`  
If migration `20260625000001_fix_secure_day_rpc_required_column.sql` is not applied, the
`secure_day` RPC errors. The server logs the error and still returns `{ verified: true }`.
This means the day is verified but the streak counter is not advanced server-side.  
**Impact on Verifying overlay:** Safe — the overlay shows checkmarks for gates the server
evaluated; `verified: true` means all gates passed. The overlay is not wired to `secure_day`
internally.  
**Resolution:** Apply the migration. Track via `docs/MIGRATIONS.md`. No code change required.

---

### B-04 — Journal PlaceholderChips are no-op enabled buttons
**Severity:** Medium  
**File:** `components/task/bodies/TaskJournalBody.tsx:132`  
Mood, Wins, and Photo chips have `onPress={() => undefined}` while rendered as enabled
`Pressable` elements. This violates the acceptance criterion ("no `onPress={() => {}}` on an
enabled control").  
**Resolution (Phase 3):** Gate behind `FLAGS.JOURNAL_TAGS = false` and render as disabled/hidden
until the feature ships.

**Phase 1 status:** DONE — `showTagChips={FLAGS.JOURNAL_TAGS}` prop added; chips hidden when flag is false.

---

### B-05 — Workout "Add exercise" tile in structured mode has no `onPress`
**Severity:** Low (structured mode not currently rendered)  
**File:** `components/task/bodies/TaskWorkoutBody.tsx:195–199`  
The "Add exercise" tile is a `View`, not a `Pressable`. It has no `onPress`.  
**Impact:** Zero — structured mode is not rendered by `renderBody` (always `mode="simple"`).  
**Resolution (Phase 3):** Gate structured mode behind `FLAGS.WORKOUT_STRUCTURED = false`. If
shipped, add `onPress` prop.

---

### B-06 — Timer reset only pauses, doesn't reset seconds
**Severity:** Low  
**File:** `hooks/useTaskCompleteScreen.tsx:750–752`; `components/task/bodies/TaskTimerBody.tsx:122`  
`onReset: () => { if (isTimerRunning) toggleTimer() }` only pauses the timer. It does not call
a reset function that resets `timerSeconds` to 0.  
**Resolution (Phase 3):** Add `resetTimer` to `useTaskTimer` and call it from `onReset`.

---

### B-07 — `TaskCompleteCelebration` uses legacy design tokens
**Severity:** Medium  
**File:** `components/task/TaskCompleteCelebration.tsx:19`  
Imports `DS_COLORS` and `DS_DAYLIGHT` instead of `DS_COLORS_V2`. This is a Phase 4 item.  
**Resolution (Phase 4):** Migrate to `DS_COLORS_V2`.
