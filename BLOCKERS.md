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
