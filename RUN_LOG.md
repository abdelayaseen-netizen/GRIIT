# RUN_LOG.md — SHIP_TASK_FLOW (v2)

## Phase 0 — Recon (2026-06-29)

### Files read
- `GRIIT_Task_States.html` (canonical source, root)
- `hooks/useTaskCompleteScreen.tsx` (1198 lines)
- `components/task/TaskShell.tsx` (657 lines)
- `components/task/bodies/TaskPhotoBody.tsx`
- `components/task/bodies/TaskSimpleBody.tsx`
- `components/task/bodies/TaskTimerBody.tsx`
- `components/task/bodies/TaskRunBody.tsx`
- `components/task/bodies/TaskWorkoutBody.tsx`
- `components/task/bodies/TaskJournalBody.tsx`
- `components/task/bodies/TaskCounterBody.tsx`
- `components/task/bodies/TaskCheckinBody.tsx`
- `components/task/TaskCompleteCelebration.tsx`
- `app/task/complete.tsx`
- `app/task/checkin.tsx`
- `app/task/run.tsx`
- `contexts/AppContext.tsx` (excerpt — verifyAndCompleteTask)
- `hooks/useAppChallengeMutations.ts`
- `backend/trpc/routes/checkins.ts` (header — verifyTask exists and is real)
- `lib/feature-flags.ts` (FLAGS.REAL_VERIFICATION = true confirmed)
- `lib/routes.ts` (ROUTES.CHALLENGE_ACTIVE, TABS_HOME, etc.)
- `lib/trpc-paths.ts` (TRPC.checkins.verifyTask, secureDay)

### Grep evidence — legacy CTA labels still in code
```
GRIIT/hooks/useTaskCompleteScreen.tsx:1020:  label = "Yes — I did it";
GRIIT/hooks/useTaskCompleteScreen.tsx:1025:  label = timerOk ? "Complete" : "Finish early";
GRIIT/hooks/useTaskCompleteScreen.tsx:1028:  label = runFormOk ? "End run & save" : "End early";
GRIIT/hooks/useTaskCompleteScreen.tsx:1031:  label = "Finish workout";
GRIIT/hooks/useTaskCompleteScreen.tsx:1034:  label = "Save entry";
GRIIT/hooks/useTaskCompleteScreen.tsx:1040:  label = "I'm here — check in";
```

### Grep evidence — uppercase DAY in TaskShell
```
GRIIT/components/task/TaskShell.tsx:139:  {`DAY ${dayNumber} · ${challengeName.toUpperCase()}`}
```

### Grep evidence — fake points in Celebration
```
GRIIT/components/task/TaskCompleteCelebration.tsx:141:  +{celebPoints} points · {taskName}
GRIIT/hooks/useTaskCompleteScreen.tsx:551:  const celebPoints = taskMode === "minimum" ? 0 : isHardMode ? 8 : 5;
```

### Grep evidence — no-op onPress in Journal
```
GRIIT/components/task/bodies/TaskJournalBody.tsx:132:  onPress={() => undefined}
```

### Grep evidence — verifyAndCompleteTask is real
```
GRIIT/lib/feature-flags.ts:51:  REAL_VERIFICATION: true,
GRIIT/lib/trpc-paths.ts:76:  verifyTask: 'checkins.verifyTask',
GRIIT/hooks/useAppChallengeMutations.ts:350:  const result = (await trpcMutate(TRPC.checkins.verifyTask, params)) as ...
GRIIT/backend/trpc/routes/checkins.ts:414:  verifyTask: protectedProcedure
GRIIT/backend/trpc/routes/checkins.ts:712:  logger.error({ error: rpcError, userId: ctx.userId }, "[verifyTask] secure_day RPC error")
GRIIT/backend/trpc/routes/checkins.ts:732:  return { verified: true as const, checkinId: checkin?.id, streakAdvanced, newStreakCount };
```

### Grep evidence — checkin location suppression
```
GRIIT/hooks/useTaskCompleteScreen.tsx:1092:  void setUserLocation;
GRIIT/hooks/useTaskCompleteScreen.tsx:1094:  void handleCheckLocation;
GRIIT/hooks/useTaskCompleteScreen.tsx:1079:  void onHardGatesResolved;
GRIIT/hooks/useTaskCompleteScreen.tsx:1080:  void onHardTimeWindowFailed;
```

### Output
- `docs/TASK_FLOW_AUDIT.md` — 3 tables + gap list (26 gaps)
- `BLOCKERS.md` — 7 blockers (B-01 through B-07)
- `RUN_LOG.md` — this file

### Status
Phase 0 complete. Awaiting go-ahead for Phase 1.

---

## Phase 1 — Locked Decisions (2026-06-29)

### Branch
`feat/task-flow-daylight` cut from `origin/main` (fb87166)

### Changes applied

| # | File | Change |
|---|------|--------|
| 1 | `lib/feature-flags.ts` | Added `FLAGS.LEGACY_RUN_SCREEN = false`, `FLAGS.LEGACY_CHECKIN_SCREEN = false`, `FLAGS.JOURNAL_TAGS = false`, `FLAGS.TASK_START_ARMING = true` |
| 2 | `components/task/TaskShell.tsx` | `DAY ${n}` → `Day ${n}` (lowercase per spec) |
| 3 | `hooks/useTaskCompleteScreen.tsx` | Added `isArmed` state (simple/manual init true, others false); `handleArm` callback; updated `primaryCta` builder (storyboard CTA-label table); "Not yet" secondary CTA for simple/manual; `renderBody` guard returning hint text when `!isArmed`; `DS_COLORS_V2`/`DS_SPACING_V2` import; `FLAGS` import; `READY_HINTS` map |
| 4 | `components/task/bodies/TaskJournalBody.tsx` | Added `showTagChips?: boolean` prop; gate PlaceholderChips behind `showTagChips \|\| FLAGS.JOURNAL_TAGS`; import `FLAGS` |
| 5 | `components/task/bodies/TaskCounterBody.tsx` | "Add 1 {unit}" → "Add a {unit}" (storyboard: "Add a cup") |
| 6 | `app/task/run.tsx` | Renamed `RunTaskScreen` → `RunTaskScreenInner`; added `RunTaskScreenBlocked` fallback; `export default FLAGS.LEGACY_RUN_SCREEN ? RunTaskScreenInner : RunTaskScreenBlocked` |
| 7 | `app/task/checkin.tsx` | Same gate pattern; `CheckinTaskScreenBlocked` shows B-01 context text |
| 8 | `components/task/TaskCompleteCelebration.tsx` | Removed `+{celebPoints} points ·` from subtitle; `isHardMode` → `_isHardMode` (Phase 4 will use it for streak chip) |

### Grep evidence — CTA labels updated

```
hooks/useTaskCompleteScreen.tsx  : label = "Mark done"        (simple/manual)
hooks/useTaskCompleteScreen.tsx  : label = "Submit proof"     (photo)
hooks/useTaskCompleteScreen.tsx  : label = "Complete"         (timer, done)
hooks/useTaskCompleteScreen.tsx  : label = "Finish early"     (timer, not done)
hooks/useTaskCompleteScreen.tsx  : label = "I'm done — capture" (timer + photo gate)
hooks/useTaskCompleteScreen.tsx  : label = "Continue"         (run)
hooks/useTaskCompleteScreen.tsx  : label = "Finish session"   (workout)
hooks/useTaskCompleteScreen.tsx  : label = "Start writing"    (journal — only CTA)
hooks/useTaskCompleteScreen.tsx  : label = "Mark today complete" (counter family)
hooks/useTaskCompleteScreen.tsx  : label = "Confirm check-in" (checkin)
hooks/useTaskCompleteScreen.tsx  : readyLabel = "Start"       (photo/run/workout/counter/checkin)
hooks/useTaskCompleteScreen.tsx  : readyLabel = "Start writing" (journal)
hooks/useTaskCompleteScreen.tsx  : readyLabel = "Start now"   (timer)
```

### TSC result
`npx tsc --noEmit` → **0 errors**

### Status
Phase 1 committed. Proceeding to Phase 2.

