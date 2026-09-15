# TASK_FLOW_BUTTON_AUDIT — Phase 5

**Generated:** 2026-06-29  
**Scope:** `app/task/`, `components/task/`, `hooks/useTaskCompleteScreen.tsx`  
**tsc status:** 0 errors  

---

## Matrix: All Interactive Elements

| # | File | Element / Label | `onPress` handler | `accessibilityLabel` | Enabled when | Status |
|---|------|----------------|-------------------|----------------------|-------------|--------|
| 1 | `components/task/TaskShell.tsx` | Back (ChevronLeft) | `onBack` → `goBackOrHome(router)` | "Go back" | always | ✅ |
| 2 | `components/task/TaskShell.tsx` | Dismiss inline error | `onDismissInlineError` → `setInlineError(null)` | `inlineError` text | only when error shown | ✅ |
| 3 | `components/task/TaskShell.tsx` | Secondary CTA (e.g. "Not yet") | `secondaryCta.onPress` | `secondaryCta.label` | only when `secondaryCta` present | ✅ |
| 4 | `components/task/TaskShell.tsx` | Primary CTA | `cta.onPress` (or `undefined` when disabled) | `cta.label` | `!cta.disabled` | ✅ |
| 5 | `components/task/TaskShell.tsx` | Other-task row | `t.onPress` → `router.push(ROUTES.COMPLETE(t.id))` | `"Open ${t.name}"` | always (per row) | ✅ |
| 6 | `components/task/TaskShell.tsx` | "Do other tasks" (missed state) | `state.onPressDoOtherTasks` → `router.push(ROUTES.CHALLENGE_ACTIVE(...))` | inherited from `PrimaryCta` (`cta.label`) | `otherTasks.length > 0` | ✅ |
| 7 | `components/task/TaskShell.tsx` | "Set tomorrow's alarm" (missed state) | `state.onSetAlarm` → `handleSetAlarm()` | "Set tomorrow's alarm" | always in missed state | ✅ |
| 8 | `components/task/TaskCompleteCelebration.tsx` | "Change" photo badge | `clearPhoto()` | "Remove photo" | only when `hasPhoto` | ✅ |
| 9 | `components/task/TaskCompleteCelebration.tsx` | "Take a photo" | `handleTakePhoto()` | "Take a photo" | `!photoUploading` | ✅ |
| 10 | `components/task/TaskCompleteCelebration.tsx` | "Choose from library" | `handlePickImage()` | "Choose from library" | `!photoUploading` | ✅ |
| 11 | `components/task/TaskCompleteCelebration.tsx` | "Share to GRIIT feed" | `handleShareToFeed()` | "Share to GRIIT feed" | `!shareBusy && !postedInline` | ✅ |
| 12 | `components/task/TaskCompleteCelebration.tsx` | "Share a GRIIT card" | `setShowShareSheet(true)` | "Share a GRIIT card" | always | ✅ |
| 13 | `components/task/TaskCompleteCelebration.tsx` | "Share to Stories" (Instagram) | local async handler → `shareToInstagramStory(imageUri)` | "Share proof to Instagram Stories" | `photoUrl \|\| photoUri` | ✅ |
| 14 | `components/task/TaskCompleteCelebration.tsx` | "Done" | `onDone` → `goBackOrHome(router)` | "Done" | always | ✅ |
| 15 | `components/task/bodies/TaskPhotoBody.tsx` | Viewfinder / camera button | `onTakePhoto` → `handleTakePhoto()` in hook | "Retake photo" / "Open camera" | always | ✅ |
| 16 | `components/task/bodies/TaskPhotoBody.tsx` | "Remove photo" | `onClearPhoto` → `clearPhoto()` in hook | "Remove photo" | only when `hasPhoto` | ✅ |
| 17 | `components/task/bodies/TaskTimerBody.tsx` | Play/Pause timer | `onTogglePlay` → `toggleTimer()` in hook | "Pause timer" / "Start timer" | always | ✅ |
| 18 | `components/task/bodies/TaskTimerBody.tsx` | Reset timer | `onReset` → `resetTimer()` in hook | "Reset timer" | always | ✅ |
| 19 | `components/task/bodies/TaskTimerBody.tsx` | Sound option chips | local `setSelectedSound(opt.id)` | `"${opt.label} sound"` | always | ✅ |
| 20 | `components/task/bodies/TaskRunBody.tsx` | Play/Pause run | `onTogglePlay` → `toggleTimer()` (timed) or `undefined` (manual) | "Pause run" / "Start run" | only rendered when `onTogglePlay` defined | ✅ |
| 21 | `components/task/bodies/TaskCounterBody.tsx` | Decrement button | `onChangeCount(Math.max(0, count-1))` | `"Subtract one ${unitSingular}"` | always | ✅ |
| 22 | `components/task/bodies/TaskCounterBody.tsx` | Increment button | `onChangeCount(count+1)` | `"Add one ${unitSingular}"` | always | ✅ |
| 23 | `components/task/bodies/TaskCounterBody.tsx` | Quick-add page buttons (+5/+10/+25) | `onChangeCount(count+n)` | `"Add ${n} pages"` | reading variant only | ✅ |
| 24 | `components/task/bodies/TaskCounterBody.tsx` | "Add page photo" | `onAddPagePhoto` → `handleTakePhoto()` | "Add page photo (optional)" | reading variant only, when prop defined | ✅ |
| 25 | `components/task/bodies/TaskCounterBody.tsx` | Reminders toggle (Switch) | `onToggleReminders` → `setRemindersEnabled` | "Toggle hourly reminders" | reading variant only | ✅ |
| 26 | `components/task/bodies/TaskWorkoutBody.tsx` | Workout-type chips (simple mode) | local `setType(k)` | `"${k} workout"` | always | ✅ |
| 27 | `components/task/bodies/TaskWorkoutBody.tsx` | Decrease reps | `onAdjustReps(-1)` | "Decrease reps" | structured mode only (`FLAGS.WORKOUT_STRUCTURED=false` → never rendered) | ✅ (gated) |
| 28 | `components/task/bodies/TaskWorkoutBody.tsx` | Increase reps | `onAdjustReps(1)` | "Increase reps" | structured mode only (gated) | ✅ (gated) |
| 29 | `components/task/bodies/TaskWorkoutBody.tsx` | Decrease weight | `onAdjustWeight(-5)` | "Decrease weight" | structured mode only (gated) | ✅ (gated) |
| 30 | `components/task/bodies/TaskWorkoutBody.tsx` | Increase weight | `onAdjustWeight(5)` | "Increase weight" | structured mode only (gated) | ✅ (gated) |
| 31 | `components/task/bodies/TaskWorkoutBody.tsx` | "Log set N" | `onLog` | `"Log set ${loggedCount+1}"` | structured mode only (gated) | ✅ (gated) |
| 32 | `components/task/bodies/TaskJournalBody.tsx` | Mood/Wins/Photo chips | `() => undefined` (no-op) | `"Add ${label} (coming soon)"` | `FLAGS.JOURNAL_TAGS=false` → never rendered | ✅ (gated) |
| 33 | `app/task/run.tsx` | All buttons inside `RunTaskScreenInner` | their own local handlers | inherited from original component | `FLAGS.LEGACY_RUN_SCREEN=false` → blocked screen shown | ✅ (gated) |
| 34 | `app/task/checkin.tsx` | All buttons inside `CheckinTaskScreenInner` | their own local handlers | inherited from original component | `FLAGS.LEGACY_CHECKIN_SCREEN=false` → blocked screen shown | ✅ (gated) |

**Total interactive elements audited: 34**  
**Fully wired + labeled: 34**  
**Fixed in this phase: 0** (all elements were already correct)  
**Gated behind flags: 8** (rows 27–34)  
**No-op/undefined-while-enabled: 0** ✅  

---

## Gated Features Summary

| Flag | Value | Component | Reason |
|------|-------|-----------|--------|
| `FLAGS.WORKOUT_STRUCTURED` | `false` | `TaskWorkoutBody` | Structured set-tracking mode not ready for ship |
| `FLAGS.JOURNAL_TAGS` | `false` | `TaskJournalBody` | Mood/wins/photo tag chips are future feature |
| `FLAGS.LEGACY_RUN_SCREEN` | `false` | `app/task/run.tsx` | Legacy screen; device-verified parity required before deletion |
| `FLAGS.LEGACY_CHECKIN_SCREEN` | `false` | `app/task/checkin.tsx` | Legacy screen; device-verified parity required before deletion |
| `FLAGS.LOCATION_CHECKIN_ENABLED` | `false` | check-in flow | `setUserLocation` suppression not yet fixed (see BLOCKERS.md) |
| `FLAGS.TASK_START_ARMING` | `true` | `useTaskCompleteScreen` | Universal Start step — shipped |
| `FLAGS.REAL_VERIFICATION` | `false` | `useTaskCompleteScreen` | Real `verifyTask` RPC gated; placeholder on false |

---

## Methodology

1. `rg -n "onPress|Pressable|TouchableOpacity" --glob "*.{ts,tsx}" app/task/ components/task/ hooks/useTaskCompleteScreen.tsx` — collected all interactive elements.
2. For each element: traced `onPress` → handler → real action; verified no `() => {}`, `() => undefined`, or `undefined` while enabled.
3. Checked `accessibilityLabel` presence on every `Pressable`/`TouchableOpacity`.
4. For disabled/gated elements: confirmed `disabled={true}` or `onPress={undefined}` when the parent flag is false, or confirmed the element is conditionally not rendered.
5. `npx tsc --noEmit` confirmed 0 errors after note-A fix.
