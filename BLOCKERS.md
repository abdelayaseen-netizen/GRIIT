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

## B5 — "Build your own" route: Create wizard is mid-migration

**Screen:** Discover (S6)  
**What's noted:** `CreateWizardV2` (in `app/(tabs)/create.tsx`) and `CreateChallengeWizard` (in `app/create/index.tsx`) are both in the repo. Per spec, the "Build your own" CTA routes to the **existing entry point only** — `ROUTES.CREATE_WIZARD` (`/create`). This is the full-screen modal that was on main. The internal wizard state machine is untouched.
