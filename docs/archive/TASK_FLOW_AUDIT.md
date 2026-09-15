# TASK_FLOW_AUDIT — Phase 0 Recon

> Generated: 2026-06-29  
> Source of truth: `GRIIT_Task_States.html` (root)  
> Code under audit: `hooks/useTaskCompleteScreen.tsx`, `components/task/TaskShell.tsx`,  
> `components/task/bodies/*`, `app/task/complete.tsx`, `app/task/checkin.tsx`, `app/task/run.tsx`

---

## 0a. State-Reachability Table

Each row is one body type. States are as defined in the storyboard + matched to code flow.  
"Current" = implemented today; "Storyboard" = required states.

### Architecture note

All 8 bodies route through a **single screen** (`app/task/complete.tsx` →
`TaskCompleteScreenInner` in `hooks/useTaskCompleteScreen.tsx`). The screen owns all state; each
`TaskXxxBody` is a pure controlled component. `TaskShell` renders the top-bar, gates card, error
banner, and primary/secondary CTAs. There is **no per-body navigation stack** — states are
driven entirely by React state within the single-screen component.

The storyboard imagines discrete states (Ready → do-state → Verifying → Secured). In code,
"Verifying" is not a separate UI state — `isSubmitting` shows a spinner on the CTA while the
mutation is in flight, and "Secured" is the `TaskCompleteCelebration` component that replaces the
screen when `submitted === true`.

The legacy screens `app/task/checkin.tsx` and `app/task/run.tsx` are **parallel paths** marked
`// LEGACY: consider migrating to task/complete.tsx`. They use the deprecated `verifyTask` helper
(not `verifyAndCompleteTask`) and have their own state machines. These are **not yet replaced**.

---

### Photo

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start** → Live capture | `onBack` → `goBackOrHome` |
| **Live capture** (storyboard) | Tap Start | Shutter → Caption | (tap outside / retake) |
| **Caption** | Photo captured | Tap **Submit proof** → Verifying | Remove photo → back to viewfinder |
| **Verifying** | Tap Submit proof | `verified: true` → Secured | `verified: false` → inline error + retry |
| **Secured** | `submitted === true` | Tap **Done** → `goBackOrHome` | — |

**Current code reality:**  
- Ready and Live capture are **not distinct states**. The screen mounts directly into the
  "do-state" (caption + viewfinder). There is no "Start" button. The viewfinder is always shown.
- "Verifying" = `isSubmitting` spinner on the primary CTA. No separate overlay. Checklist rows
  not shown.
- "Secured" = `TaskCompleteCelebration` (shares photo, feed post, done). Diverges significantly
  from storyboard (shows `+N points`, "Share proof", "Share card", "Share to Stories",
  "Skip — go home" instead of storyboard "Done").
- **Gap:** No "Start" arming step. No Verifying overlay with checklist rows.

---

### Run

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start** → Manual entry | `onBack` |
| **Manual entry** | Tap Start | Fill distance + duration → Tap **Continue** → Verifying | — |
| **Capture** (if photo) | Verifying gate | Camera shutter → Verifying | — |
| **Verifying** | Tap Continue | `verified: true` → Secured | inline error + retry |
| **Secured** | submitted | Done | — |

**Current code reality (`task/complete.tsx` path):**  
- Ready and Manual entry are merged. Screen mounts with `TaskRunBody` showing manual fields.
  No "Start" step.
- `TaskRunBody` renders a GPS hero with manual-input fallback card when `manualInput` prop is
  provided. It also renders a GPS live-tracking UI when `hasGps=true`, but the hook always passes
  `hasGps={false}`.
- CTA label: `runFormOk ? "End run & save" : "End early"` — **GAP** vs storyboard "Continue".
- **Legacy path (`app/task/run.tsx`):** Two modes (outdoor GPS + treadmill). Three treadmill
  sub-steps (timer → proof → distance). Uses deprecated `verifyTask`. GPS tracking, background
  violation detection, `proofUri` passed as raw `file://` URI (server rejects it — comment in
  code says so). This screen is **not gated behind `FLAGS.*`** and could still be navigated to
  from old deep-links.
- **Gap:** No "Start" arming step. Wrong CTA label. Legacy screen still exists.

---

### Workout

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start** → Entry/timer | `onBack` |
| **Entry → timer** | Tap Start | Tap **Finish session** → (optional Capture) → Verifying | — |
| **Capture** (optional) | Finish session | Shutter → Verifying | — |
| **Verifying** | Tap Finish session | `verified: true` → Secured | inline error + retry |
| **Secured** | submitted | Done | — |

**Current code reality:**  
- No "Start" step. Mounts directly into `TaskWorkoutBody` (simple mode).
- CTA label: `"Finish workout"` — **GAP** vs storyboard `"Finish session"`.
- `TaskWorkoutBody` in "simple" mode renders kind-picker + duration input + notes. No live timer
  visualization is plumbed through `TaskWorkoutBody` from the hook, even though the hook has a
  `useTaskTimer` instance for workout. Timer-based workout (when `minDurMinutes > 0`) goes
  through `TaskTimerBody`, not `TaskWorkoutBody`.
- Structured mode (`mode="structured"`) has an `"Add exercise"` tile with no `onPress` — it's a
  `View` not a `Pressable`. **GAP: no-op interactive element.**

---

### Journal

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start writing** → Write | `onBack` |
| **Write** (word-count gate) | Tap Start writing | Word count met, tap CTA → Verifying | — |
| **Verifying** | CTA tap | `verified: true` → Secured | inline error + retry |
| **Secured** | submitted | Done | — |

**Current code reality:**  
- No "Start writing" arming state. Screen mounts directly into `TaskJournalBody`.
- CTA label: `"Save entry"` — **GAP** vs storyboard (no separate "Start writing" CTA; the
  storyboard says "Start writing" is the *only* CTA until word count is met).
- `TaskJournalBody` has three `PlaceholderChip` buttons (Mood, Wins, Photo) that call
  `onPress={() => undefined}` — **GAP: no-op `onPress`**.
- Journal prompt and word counter work correctly.

---

### Counter / Water / Reading

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start** → Count | `onBack` |
| **Count** (tap toward target) | Tap Start | Count >= goal → Tap **Mark today complete** → Verifying | — |
| **Page photo** (reading only) | Tap "Add a page photo" | Shutter → back to Count | — |
| **Verifying** | Tap Mark today complete | `verified: true` → Secured | inline error + retry |
| **Secured** | submitted | Done | — |

**Current code reality:**  
- No "Start" arming step. Screen mounts directly into `TaskCounterBody`.
- CTA label: `"Mark today complete"` — storyboard requires two CTAs: **Add a cup** (increment,
  in-body) + **Mark today complete** (submit, footer). Currently `"Mark today complete"` is the
  only footer CTA; the body CTA is `"Add 1 {unit}"` inside `TaskCounterBody`. This is the
  intended split, but the storyboard calls the body CTA **"Add a cup"** (water variant) vs
  generic label — need to match variant label. **Partial gap.**
- Reading page-photo: `onAddPagePhoto` is wired when `counterVariant === "reading"`, calls
  `handleTakePhoto()`. Correct.
- Water and counter have `onAddPagePhoto={undefined}` — correct per Decision 4.
- **GAP:** Storyboard says the submit CTA for counter is also called "Mark today complete" — that
  label *is* used but should become per-type per storyboard table.

---

### Check-in

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start** → Location | `onBack` |
| **Location** (GPS confirms range) | Tap Start | In range → Tap **Confirm check-in** → Verifying | — |
| **Verifying** | Tap Confirm check-in | `verified: true` → Secured | inline error + retry |
| **Secured** | submitted | Done | — |

**Current code reality (`task/complete.tsx` path):**  
- No "Start" arming step. Screen mounts with `TaskCheckinBody` showing the geofence map.
- CTA label: `"I'm here — check in"` — **GAP** vs storyboard `"Confirm check-in"`.
- Location check: `handleCheckLocation` is declared but **suppressed** (`void handleCheckLocation`
  in the suppression block at line 1094). Location is driven by `gatesLocation` (from
  `onHardGatesResolved`) but `onHardGatesResolved` and `onHardTimeWindowFailed` are also
  suppressed. The `TaskCheckinBody` receives `value={{ inRange: locationOk }}` where `locationOk`
  depends on `userLocation` — but `setUserLocation` is also suppressed (line 1092). So
  `userLocation` stays `null`, `distance` stays `null`, `locationOk` = `!config.require_location`
  (= true if location not required). **This means the location gate is non-functional on the
  unified screen for the checkin type.**
- **Legacy path (`app/task/checkin.tsx`):** Full geofence + timer-based session logic using the
  deprecated `verifyTask` call. Not replaced. `FLAGS.LOCATION_CHECKIN_ENABLED = false`.
- **GAP (critical):** Location arming is broken on `task/complete.tsx` for checkin type. Legacy
  screen has the working location logic but uses deprecated API.

---

### Simple / Manual

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Did you complete it?** (storyboard) | Screen opens | Tap **Mark done** → Verifying | Tap **Not yet** → `onBack` |
| **Secured** (self-report) | submitted | Done | — |

**Current code reality:**  
- CTA label: `"Yes — I did it"` — **GAP** vs storyboard `"Mark done"`.
- No "Not yet" secondary CTA. The storyboard shows two equal CTAs: "Not yet" + "Mark done".
  Currently there is only one CTA (primary). `onBack` exists on the shell but is not exposed as
  a labeled "Not yet" button.
- `TaskSimpleBody` is purely display-only (no interactive elements). The CTA lives in the shell.
- **GAP:** Missing "Not yet" labeled button. Wrong "Mark done" label.

---

### Timer (cardio)

| State | Entry | Forward exit | Back / cancel |
|---|---|---|---|
| **Ready** (storyboard) | Screen opens | Tap **Start now** → Timer running | `onBack` |
| **Timer running** | Tap Start now | Timer meets goal → `"I'm done — capture"` or `"Complete"` → Verifying | Tap **Finish early** |
| **Verifying** | CTA tap | `verified: true` → Secured | inline error + retry |
| **Secured** | submitted | Done | — |

**Current code reality:**  
- No "Start now" arming step. Timer auto-starts on mount (`autoStart: showWorkoutTimer`).
- CTA label: `timerOk ? "Complete" : "Finish early"` — **GAP** vs storyboard `"I'm done — capture"` (when timer done, if photo required) / `"Complete"` (when done, no photo) / `"Finish early"` (before done).
- `TaskTimerBody` has: Play/Pause button (`onTogglePlay`), Reset button (`onReset`), and three
  sound chips (`onChangeSound`). All wired.
- Reset is `onReset: () => { if (isTimerRunning) toggleTimer(); }` — only pauses the timer,
  doesn't actually reset seconds. **Partial gap.**
- **GAP:** No "Start now" arming. CTA label drift. Reset doesn't fully reset.

---

## 0b. Button → UX Matrix

> Handler grep evidence format: `FILE:LINE` (confirmed via Grep tool).

### Legend
- ✅ = Handler exists, wired, real side-effect
- ⚠️ = Handler exists but has a defect or label drift
- ❌ GAP = No real handler / `onPress={() => undefined}` / TODO / label wrong / unreachable

---

### TaskShell — shared across all types

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Back chevron | "Go back" | `onBack` → `goBackOrHome(router)` | ✅ | `TaskShell.tsx:129`, `useTaskCompleteScreen.tsx:1180` |
| Primary CTA | (per type) | `primaryCta.onPress` → `() => void handleSubmit()` | ✅ | `useTaskCompleteScreen.tsx:1048` |
| Primary CTA (disabled) | `disabledReason` | `onPress={undefined}` when disabled | ✅ correct | `TaskShell.tsx:225` |
| Inline error banner | (error text) | `onDismissInlineError` → `clearError` | ✅ | `useTaskCompleteScreen.tsx:1184` |
| "Do other tasks" (missed state) | "Do other tasks" | `onPressDoOtherTasks` → `router.push(ROUTES.CHALLENGE_ACTIVE(id))` | ✅ | `useTaskCompleteScreen.tsx:996–999` |
| "Set tomorrow's alarm" (missed state) | "Set tomorrow's alarm" | `onSetAlarm` → `handleSetAlarm()` | ✅ | `useTaskCompleteScreen.tsx:993–995` |
| Other-task row (missed state) | `"Open {name}"` | `t.onPress` → `router.push(ROUTES.CHALLENGE_ACTIVE(id))` | ✅ | `useTaskCompleteScreen.tsx:926–929` |

---

### TaskPhotoBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Viewfinder / tap to open camera | "Open camera" / "Retake photo" | `onTakePhoto` → `handleTakePhoto()` → `photoCapture.handleTakePhoto()` | ✅ | `TaskPhotoBody.tsx:74`, `useTaskCompleteScreen.tsx:728` |
| "Remove and retake" | "Remove photo" | `onClearPhoto` → `clearPhoto()` | ✅ | `TaskPhotoBody.tsx:136`, `useTaskCompleteScreen.tsx:730` |
| Caption TextInput | "Photo caption" | `onChangeCaption` → `setPhotoCaption` | ✅ | `TaskPhotoBody.tsx:154`, `useTaskCompleteScreen.tsx:723` |
| Primary CTA | "Submit proof" | `handleSubmit()` | ✅ | `useTaskCompleteScreen.tsx:1022` |
| **[GAP] Start button** | "Start" | — | ❌ GAP | Not present — no arming step |

---

### TaskTimerBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Play/Pause button | "Pause timer" / "Start timer" | `onTogglePlay` → `toggleTimer` | ✅ | `TaskTimerBody.tsx:99`, `useTaskCompleteScreen.tsx:749` |
| Reset button | "Reset timer" | `onReset` → `() => { if (isTimerRunning) toggleTimer() }` | ⚠️ | `TaskTimerBody.tsx:122`, `useTaskCompleteScreen.tsx:750–752`; only pauses, doesn't reset seconds |
| Sound chips (3) | "Silent sound" / "Chime sound" / "Rain sound" | `onChangeSound` → `setTimerSound` | ✅ | `TaskTimerBody.tsx:149` |
| Primary CTA | `timerOk ? "Complete" : "Finish early"` | `handleSubmit()` | ⚠️ | Label drift vs storyboard; handler is real |
| **[GAP] Start now** | "Start now" | — | ❌ GAP | No arming step; timer auto-starts |

---

### TaskRunBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Distance TextInput | "Distance in kilometers" | `manualInput.onChangeDistance` → `setRunDistance` | ✅ | `TaskRunBody.tsx:203`, `useTaskCompleteScreen.tsx:773` |
| Duration TextInput | "Duration in minutes" | `manualInput.onChangeDuration` → `setRunDuration` | ✅ | `TaskRunBody.tsx:216`, `useTaskCompleteScreen.tsx:774` |
| Play/Pause button (GPS) | "Pause run" / "Start run" | `onTogglePlay` (optional; not passed in `renderBody`) | ⚠️ | `useTaskCompleteScreen.tsx:757–776`: `onTogglePlay` not passed; button hidden |
| Primary CTA | `runFormOk ? "End run & save" : "End early"` | `handleSubmit()` | ⚠️ | Label drift vs storyboard "Continue"; handler is real |
| **[GAP] Start button** | "Start" | — | ❌ GAP | No arming step |

---

### TaskWorkoutBody (simple mode)

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Kind chips (N chips) | `"{k} workout"` | `onChangeKind` → `setWorkoutKind` | ✅ | `TaskWorkoutBody.tsx:63` |
| Duration TextInput | "Workout duration in minutes" | `onChangeDurationMinutes` → `setWorkoutDuration` | ✅ | `TaskWorkoutBody.tsx:87` |
| Notes TextInput | "Workout notes" | `onChangeNotes` → `setWorkoutNotes` | ✅ | `TaskWorkoutBody.tsx:100` |
| Primary CTA | `"Finish workout"` | `handleSubmit()` | ⚠️ | Label drift vs storyboard "Finish session" |
| **[GAP] Start button** | "Start" | — | ❌ GAP | No arming step |

TaskWorkoutBody (structured mode — not rendered in current renderBody):

| Element | Label | Handler | Status |
|---|---|---|---|
| "Add exercise" tile | — | `View` with no `onPress` | ❌ GAP — no-op |
| Decrease reps | "Decrease reps" | `onAdjustReps(-1)` | ✅ |
| Increase reps | "Increase reps" | `onAdjustReps(1)` | ✅ |
| Decrease weight | "Decrease weight" | `onAdjustWeight(-5)` | ✅ |
| Increase weight | "Increase weight" | `onAdjustWeight(5)` | ✅ |
| Log set | `"Log set {n}"` | `onLog` | ✅ |

*Structured mode is not currently rendered by the hook (`mode="simple"` always). The "Add exercise" no-op is safe since the mode is unused in the live path.*

---

### TaskJournalBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Journal TextInput | "Journal entry" | `onChangeText` → `handleJournalChange` | ✅ | `TaskJournalBody.tsx:55`, `useTaskCompleteScreen.tsx:797` |
| Mood chip | "Add mood (coming soon)" | `onPress={() => undefined}` | ❌ GAP | `TaskJournalBody.tsx:132` — explicit no-op |
| Wins chip | "Add wins (coming soon)" | `onPress={() => undefined}` | ❌ GAP | `TaskJournalBody.tsx:132` |
| Photo chip | "Add photo (coming soon)" | `onPress={() => undefined}` | ❌ GAP | `TaskJournalBody.tsx:132` |
| Primary CTA | `"Save entry"` | `handleSubmit()` | ⚠️ | Label drift: storyboard has no "Save entry" — gate met + auto-save; handler is real |
| **[GAP] Start writing button** | "Start writing" | — | ❌ GAP | No arming step |

---

### TaskCounterBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Subtract button | `"Subtract one {unit}"` | `onChangeCount(max(0, count-1))` | ✅ | `TaskCounterBody.tsx:130` |
| Add button | `"Add 1 {unit}"` (body CTA) | `onChangeCount(count+1)` | ✅ | `TaskCounterBody.tsx:142` |
| Quick-add chips +5/+10/+25 (reading) | `"Add {n} pages"` | `onChangeCount(count+n)` | ✅ | `TaskCounterBody.tsx:164` |
| Cup slots (water) | `"Cup {n} {filled/empty}"` | `accessibilityRole="image"` — display only, no `onPress` | ✅ display only |
| Reminders toggle (water) | "Toggle hourly reminders" | `onToggleReminders` → `setRemindersEnabled` | ✅ | `TaskCounterBody.tsx:187` |
| Page photo row (reading) | "Add page photo (optional)" | `onAddPagePhoto` → `handleTakePhoto()` | ✅ | `TaskCounterBody.tsx:200`, `useTaskCompleteScreen.tsx:817` |
| Book title input (reading) | "Book title" | `onChangeBookTitle` → `setBookTitle` | ✅ | `TaskCounterBody.tsx:68` |
| Primary CTA | `"Mark today complete"` | `handleSubmit()` | ✅ (label drift minor — storyboard matches) | `useTaskCompleteScreen.tsx:1037` |
| **[GAP] Start button** | "Start" | — | ❌ GAP | No arming step |

---

### TaskCheckinBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| Map / geofence SVG | — | Display only | ✅ display only | `TaskCheckinBody.tsx:56` |
| Stay card | — | Display only | ✅ display only | `TaskCheckinBody.tsx:143` |
| Primary CTA | `"I'm here — check in"` | `handleSubmit()` | ⚠️ | Label drift vs storyboard "Confirm check-in"; location check broken (see 0a) |
| **[GAP] Start button** | "Start" | — | ❌ GAP | No arming step |
| **[GAP] Location arm** | — | `handleCheckLocation` / `setUserLocation` suppressed | ❌ GAP | `useTaskCompleteScreen.tsx:1092–1094` |

---

### TaskSimpleBody

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| (no interactive elements in body) | — | — | ✅ | `TaskSimpleBody.tsx` — pure display |
| Primary CTA | `"Yes — I did it"` | `handleSubmit()` | ⚠️ | Label drift vs storyboard "Mark done"; handler is real |
| **[GAP] "Not yet" secondary CTA** | "Not yet" | — | ❌ GAP | Not present — storyboard requires it |

---

### TaskCompleteCelebration (Secured screen)

| Element | Label | Handler | Status | Evidence |
|---|---|---|---|---|
| "Remove photo" badge | "Remove photo" | `clearPhoto()` | ✅ | `TaskCompleteCelebration.tsx:175` |
| "Take a photo" | "Take a photo" | `handleTakePhoto()` | ✅ | `TaskCompleteCelebration.tsx:183` |
| "Choose from library" | "Choose from library" | `handlePickImage()` | ✅ | `TaskCompleteCelebration.tsx:192` |
| Caption TextInput | — (no accessibilityLabel) | `setPostCaption` | ⚠️ | Missing `accessibilityLabel` |
| "Share proof" / "Share to GRIIT feed" | "Share to GRIIT feed" | `handleShareToFeed()` | ✅ | `TaskCompleteCelebration.tsx:232` |
| "Share card" | "Share a GRIIT card" | `setShowShareSheet(true)` | ✅ | `TaskCompleteCelebration.tsx:248` |
| "Share to Stories" | "Share proof to Instagram Stories" | `shareToInstagramStory()` + `trackEvent()` | ✅ | `TaskCompleteCelebration.tsx:261–269` |
| "Skip — go home" | "Done" | `onDone()` → `goBackOrHome(router)` | ✅ | `TaskCompleteCelebration.tsx:281` |
| **[GAP] "Done" label** | storyboard says "Done" | Button text is `"Skip — go home"` | ⚠️ | Label drift |
| **[GAP] "+N points" displayed** | storyboard: no fake points | `+{celebPoints} points` always shown | ❌ GAP | `TaskCompleteCelebration.tsx:141` — fake, not server-returned |
| **[GAP] Per-type secured line** | "Verified in the window" / etc. | Not shown | ❌ GAP | Not implemented |
| **[GAP] Streak chip** | `"{n} day streak"` | Not shown | ❌ GAP | Not shown |
| **[GAP] Header** | storyboard: `"Day 1 secured"` | `"Secured."` | ⚠️ | Incorrect casing and missing day number |
| **[GAP] "Share to feed" inline error** | inline | `shareFeedErr` shown as `Text` | ✅ inline error present | `TaskCompleteCelebration.tsx:229` |
| **[GAP] DS_COLORS_V2 tokens** | — | Uses `DS_COLORS` and `DS_DAYLIGHT` not `DS_COLORS_V2` | ❌ GAP | `TaskCompleteCelebration.tsx:19` imports `DS_COLORS`, `DS_DAYLIGHT` |

---

## 0c. Gap + Decision List

### CRITICAL PATH: Is `verifyAndCompleteTask` real?

**Answer: YES — `FLAGS.REAL_VERIFICATION = true` and `checkins.verifyTask` is real server
verification.**

- `verifyAndCompleteTask` calls `trpcMutate(TRPC.checkins.verifyTask, params)`.
- `TRPC.checkins.verifyTask = 'checkins.verifyTask'` (confirmed `lib/trpc-paths.ts:76`).
- Backend `checkins.verifyTask` at `backend/trpc/routes/checkins.ts:414` runs real gate checks:
  `assertHardModeScheduleWindow`, `assertHardModeCameraOnly`, `evaluateTaskLocation`, photo HEAD
  check, ownership assertion, DB upsert, and calls `secure_day` RPC.
- Returns `{ verified: false, reason, reasonCode }` on gate failure. UI shows inline error and
  stays on screen.
- The `secure_day` RPC may error if migration `20260625000001` is not applied — the server logs
  the error and still returns `verified: true`. **This is safe for the Verifying overlay** (it
  won't show false checkmarks; it shows checkmarks for gates the server actually evaluated, and
  the server confirms verified=true before UI advances).
- **Conclusion: Verifying overlay CAN be wired safely.** Gates checklist rows should reflect
  what was evaluated (`timeWindow`, `cameraOnly`, `location`), not `secure_day` internals.

---

### Decision 1 — CTA label deltas (code vs storyboard)

| Type | Current code label | Storyboard label | Action (Phase 1) |
|---|---|---|---|
| simple / manual | `"Yes — I did it"` | `"Mark done"` | Replace |
| photo | `"Submit proof"` | `"Submit proof"` ✅ | No change |
| timer | `timerOk ? "Complete" : "Finish early"` | `"I'm done — capture"` / `"Complete"` / `"Finish early"` | Refine per state |
| run | `runFormOk ? "End run & save" : "End early"` | `"Continue"` | Replace both variants |
| workout | `"Finish workout"` | `"Finish session"` | Replace |
| journal | `"Save entry"` | (Start writing is only CTA) | Replace with phase-gated flow |
| counter/water | `"Mark today complete"` | `"Mark today complete"` ✅ (submit CTA) | No change (submit) |
| reading | `"Mark today complete"` | `"Mark today complete"` ✅ (submit CTA) | No change (submit) |
| checkin | `"I'm here — check in"` | `"Confirm check-in"` | Replace |
| timer (ready CTA) | _(no ready state)_ | `"Start now"` | Add with arming step |

**Grep evidence (existing wrong labels):**
- `useTaskCompleteScreen.tsx:1020` — `"Yes — I did it"`
- `useTaskCompleteScreen.tsx:1025` — `"Complete"` / `"Finish early"`
- `useTaskCompleteScreen.tsx:1028` — `"End run & save"` / `"End early"`
- `useTaskCompleteScreen.tsx:1031` — `"Finish workout"`
- `useTaskCompleteScreen.tsx:1034` — `"Save entry"`
- `useTaskCompleteScreen.tsx:1040` — `"I'm here — check in"`

---

### Decision 2 — Missing "Start" arming step

All types except `simple` require a Ready state with a "Start" button (or "Start writing" /
"Start now" for journal / timer). Currently the hook has **no `isArmed` state**.

- Phase 1 adds: `const [isArmed, setIsArmed] = useState(false)` in the hook.
- When `!isArmed`, `TaskShell` renders a "gates + intro" view instead of the body, and the
  footer CTA label is the Start label.
- On tap: `setIsArmed(true)` + real arming actions (camera permission request, timer arm,
  location permission request, journal text-area focus).
- Simple skips this state entirely.
- Timer's "Start now" also auto-starts the timer (passes to `autoStart`).

---

### Decision 3 — Verifying overlay

Current: `isSubmitting` = spinner on CTA button only. No overlay, no checklist.

Required (Phase 2):
- On `handleSubmit()` call: mount a full-screen Verifying overlay (`isSubmitting === true`).
- Overlay shows only gate rows that were evaluated for this task:
  - `timeWindow` row → only if `config.schedule_window_start` exists
  - `cameraOnly` row → only if `config.require_camera_only === true` AND photo captured
  - `location` row → only if `config.require_location === true`
  - type success line (run: `"Manual entry · {km} km · {min} min"`, etc.)
- Legibility floor: overlay stays visible for ≥600ms (but does not add artificial delay beyond
  the real round-trip).
- On `verified: false`: unmount overlay, show inline error.
- On `verified: true`: unmount overlay, set `submitted = true`.

---

### Decision 4 — Counter split (already correct)

`onAddPagePhoto` is only passed for `counterVariant === "reading"`. Water and generic counter get
`onAddPagePhoto={undefined}`. **No change needed.** Confirmed `useTaskCompleteScreen.tsx:817–821`.

---

### Decision 5 — Check-in dwell

`TaskCheckinBody` renders stay card only when `requiredStayMinutes > 0`. **Correct.**
Confirmed `TaskCheckinBody.tsx:143`.

**But:** location arming is broken on the unified screen (`setUserLocation`, `handleCheckLocation`
are in the suppression block). The checkin body correctly *shows* distance/range but can never
update `userLocation` on the unified screen. The `locationOk` computation requires `userLocation`.
This is a critical gap: check-in type on `task/complete.tsx` cannot verify location.

**Resolution:** Remove `setUserLocation` and `handleCheckLocation` from the suppression block
and wire them properly in Phase 3 (checkin body). The `TaskCheckinBody` must receive a "Start"
trigger that fires `handleCheckLocation()`, which requests permission and sets `userLocation`.

---

### Decision 6 — Lowercase days + no fake points

| Issue | Location | Status |
|---|---|---|
| `"DAY {n}"` uppercase in top bar | `TaskShell.tsx:139` — `` `DAY ${dayNumber} · ${challengeName.toUpperCase()}` `` | ❌ GAP — must be `Day {n}` |
| `"+{celebPoints} points"` in Celebration | `TaskCompleteCelebration.tsx:141` | ❌ GAP — must show streak only |
| `celebPoints` calculation in hook | `useTaskCompleteScreen.tsx:551` | ❌ GAP — points should not appear |
| `"Secured."` header | `TaskCompleteCelebration.tsx:139` | ⚠️ — storyboard: `"Day 1 secured"` (lowercase Day) |

---

### Decision 7 — Legacy screens (`app/task/checkin.tsx`, `app/task/run.tsx`)

Both are marked `// LEGACY: consider migrating to task/complete.tsx`.

- `checkin.tsx` uses `verifyTask` (deprecated) not `verifyAndCompleteTask`.
- `run.tsx` uses `verifyTask`, passes raw `file://` URI as `proofUrl` (server rejects it — noted
  in a comment in the file itself).
- Both are still reachable via deep-link routes `ROUTES.TASK_CHECKIN` and `ROUTES.TASK_RUN`.
- `FLAGS.LOCATION_CHECKIN_ENABLED = false` gates the *navigation* from the home screen to the
  legacy checkin screen, but the route itself is still live.

**Recommendation:** Gate both legacy screens behind `FLAGS.LEGACY_CHECKIN_SCREEN = false` and
`FLAGS.LEGACY_RUN_SCREEN = false` to prevent accidental navigation from old push notifications.
Full replacement in Phase 3.

---

### Decision 8 — `TaskCompleteCelebration` (Secured screen) design divergence

The Secured screen (`TaskCompleteCelebration`) is a large legacy component using `DS_DAYLIGHT` /
`DS_COLORS` tokens (not `DS_COLORS_V2`). It shows:
- `"Secured."` (not `"Day N secured"`)
- `"+{celebPoints} points"` always (fake — not server-returned)
- No per-type secured line
- No streak chip
- "Skip — go home" (not "Done")
- Photo share, feed post, card share, Stories share — all wired

Phase 4 reconciles this to storyboard. The key changes:
- Header: `"Day {N} secured"` (lowercase)
- Remove fake `+N points` line
- Add streak chip using `stats.currentStreak` or `verifyResult.newStreakCount`
- Add per-type secured line (derived from task type + submitted data)
- "Done" button text
- Migrate tokens to `DS_COLORS_V2`

---

### Decision 9 — `DS_COLORS_V2` token usage

`TaskCompleteCelebration.tsx` imports `DS_COLORS`, `DS_DAYLIGHT` — not `DS_COLORS_V2`.
All body components and `TaskShell` correctly use `DS_COLORS_V2`. Phase 4 migrates the
celebration screen. No raw hex values found in the body components.

---

### Decision 10 — `accessibilityLabel` gaps

| Location | Element | Gap |
|---|---|---|
| `TaskCompleteCelebration.tsx:209` | Caption `TextInput` | Missing `accessibilityLabel` |
| Journal `PlaceholderChip` × 3 | Mood / Wins / Photo | Labels present but `onPress={() => undefined}` — must be disabled or gated |

---

## Summary count

| Category | Count |
|---|---|
| CTA label drifts | 6 |
| Missing "Start" arming step (per type) | 7 (photo, run, workout, journal, counter/reading/water, checkin, timer) |
| No-op `onPress` (enabled control) | 3 (Journal: Mood/Wins/Photo chips) |
| Broken gate (checkin location) | 1 |
| Fake points in Secured | 1 |
| Uppercase `DAY` | 1 |
| Missing per-type secured line | 1 |
| Missing streak chip | 1 |
| Wrong "Done" label on Secured | 1 |
| Missing accessibilityLabel | 1 |
| Legacy screens not behind FLAGS | 2 |
| Verifying overlay not implemented | 1 |

**Total gaps: 26**

---

*End of Phase 0 audit. Awaiting go-ahead for Phase 1.*
