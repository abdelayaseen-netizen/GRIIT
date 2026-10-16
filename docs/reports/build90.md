# Build 90

## 01 Speed

### 01.1 Measure first

Root cause: `components/task-v2/useTaskFlowV2.ts` `finishSubmit` only logged `completeMs` and `secureMs`. Photo read, upload, `shareProof`, and the Home refetch were not timed.

The log now prints `photoReadMs`, `uploadMs`, `completeMs`, `secureMs`, `shareMs`, `homeRefetchMs`, and `totalMs` from `[finishSubmit] timing`.

Measured on the GRIIT iPhone 16 simulator, iOS 26.4, Mac Wi-Fi. The dev client was built and installed this session. The before JavaScript is worktree `a375b25a`. Medians are in milliseconds. The fifth before self-report returned HTTP 429 and was not retried.

| Step | Before photo (5) median | Before self-report (4) median |
|---|---|---|
| photo read | 9 | 0 |
| upload | 406 | 0 |
| completeTask | 3405 | 2732 |
| secure day | 0 | 0 |
| shareProof | not a separate call | 0 |
| Home refetch | not called | not called |
| Done to visible | 3406 | 2732 |

Photo samples, read / upload / complete / visible: 10/938/3405/3406, 9/406/18501/18501, 8/357/8914/8914, 5/411/3037/3037, 9/406/3198/3198. Self-report samples, complete / visible: 2550/2551, 10569/10569, 2570/2571, 2894/2894. On this build the screen waits for the server, so Done to visible matches `completeMs`. `secureMs` stayed 0 because these were not the last task, and the home refetch lives inside that secure call.

### 01.2 Shrink photos before upload

Root cause: `components/task-v2/TaskCapture.tsx` line 58 takes the photo at `quality: 0.8` (full sensor size). `uploadPhoto` then read it as base64, and `lib/uploadProofImage.ts` `base64ToArrayBuffer` decoded that string in JavaScript.

Fix: `lib/proof-resize.ts` `proofLongEdgeSize` caps the long edge at 1080. `shrinkProofForUpload` re-encodes JPEG at 0.7. `uploadProofImageFromFile` reads the resized file with `fetch` / `arrayBuffer` and uploads that buffer. The task flow no longer calls `readAsStringAsync` or `uploadProofImageFromBase64`.

Files: `lib/proof-resize.ts`, `lib/uploadProofImage.ts`, `components/task-v2/useTaskFlowV2.ts`.

Test: `lib/proof-resize.test.ts` `outputs a long edge of 1080 or less`, `uploads the resized file, not the original`. `lib/build90-speed.test.ts` `resizes then uploads the file, and uses the cached session`.

Failed before: yes (`shrinkProofForUpload` missing). Passes now: yes.

Three camera photos taken in the app on the simulator and uploaded through `uploadProofImageFromFile`. Stored sizes from `[uploadProof] bytes`: 17,178, 17,430, and 16,057 bytes. All are under 400 KB, so JPEG quality stays 0.7. The frames are the simulator camera (a dark frame with the date stamp), not the synthetic sips samples.

### 01.3 Remove the extra auth call

Root cause: `uploadProofImageFromBase64` called `supabase.auth.getUser()` on every upload.

Fix: `cachedUserId` uses `supabase.auth.getSession()`.

Files: `lib/uploadProofImage.ts`.

Test: `lib/build90-speed.test.ts` expects `auth.getSession` and not `auth.getUser`. Failed before: yes. Passes now: yes.

### 01.4 One server call per finish

Root cause: `finishSubmit` awaited `completeTask`, then `attemptSecureDayAfterComplete`, then `postHeldShare`. `checkins.complete` did not secure the day or apply a share choice.

Fix: `backend/lib/finish-bundle.ts` `bundleTaskFinish`. When `requiredRemaining` is 0, `checkins.complete` calls the existing `secureDay` procedure. When `applyShare` is true and an event was written, it calls the existing `shareProof` procedure. Both procedures are still on the router for older builds. A same-day second `secure_day` hits `v_had_secure` and does not move the streak again. The new client skips those follow-up calls when `daySecure` or `shared` comes back. If the field is missing (old server), it still calls them.

Files: `backend/lib/finish-bundle.ts`, `backend/trpc/routes/checkins.ts`, `hooks/useAppChallengeMutations.ts`, `contexts/AppContext.tsx`, `components/task-v2/useTaskFlowV2.ts`.

Test: `backend/lib/finish-bundle.test.ts` `one call completes the task and secures the day`. Failed before: the wiring test expected `bundleTaskFinish` in `checkins.complete` and did not find it. Passes now: yes. `checkins.secureDay` tests still pass.

No SQL. Yaseen approved the deploy. `railway up --service grit-backend` shipped this server. `/api/health` commit is `e8f4440`.

### 01.5 Optimistic UI

Root cause: Home's count and rings come from `bootstrap.data.todayCheckinsForUser`. `finishSubmit` waited for the server before leaving for Home. A second Post tap was only blocked after the upload had already started.

Fix: `markOptimisticTaskDone` runs before the server call, and Home merges that row into today's check-ins, so the count and the next open ring update immediately. `returnToOrigin` runs before `completeTask`. On failure, `rollbackOptimisticTaskDone` and Home shows "Couldn't save. Tap to try again." (`testID` `home-save-retry`). A photo post is published with caption "Posting…" before the upload, and `submitPhoto` sets `submitInFlight` before `uploadPhoto`.

Files: `lib/optimistic-home.ts`, `lib/optimistic-feed.ts`, `components/home/HomeV3.tsx`, `app/(tabs)/index.tsx` (Home reads the check-ins here), `components/task-v2/useTaskFlowV2.ts`, `components/task-v2/steps/ReviewStep.tsx` (the review line is the Posting state on that screen).

Test: `lib/optimistic-home.test.ts`. Maestro `.maestro/build90-done-count.yaml` on a fresh `is_test` account `b80done06029@example.com` (`profiles.is_test` true). Tap Done, then `1 of .* done` within 1 second. Exit 0.

Failed before: yes (`markOptimisticTaskDone` and `home-save-retry` missing). Unit tests pass now. Maestro passes now.

### 01.6 Location

Root cause: `finishSubmit` used `Location.Accuracy.High` with no timeout.

Fix: `finishWaitsOnLocation` is false for a normal photo, timer, journal, or self-report. Location-gated tasks use `Accuracy.Balanced` and `LOCATION_FIX_TIMEOUT_MS` (5000).

Files: `lib/finish-location.ts`, `components/task-v2/useTaskFlowV2.ts`.

Test: `lib/finish-location.test.ts`. Failed before: the wiring test expected `finishWaitsOnLocation` and did not find it. Passes now: yes.

### 01.7 Measure again

Same device and network as 01.1. After JavaScript is `feat/build90`. The server at `/api/health` was `e8f4440`.

| Step | After photo (3) median | After self-report (5) median |
|---|---|---|
| photo read | 311 | 0 |
| upload | 705 | 0 |
| completeTask | 6056 | 4867 |
| secure day | 0 | 0 |
| shareProof | 0 | 0 |
| Home refetch | 1163 | 1314 |
| Done to visible | 2 | 2 |
| Photo post visible | 2 |  |

Photo samples, read / upload / complete / home / visible / bytes: 272/743/4451/1163/2/17178, 311/486/20187/19465/3/17430, 492/705/6056/593/2/16057. Self-report visible samples: 2, 2, 4, 2, 3. Complete samples: 4545, 4570, 8768, 4867, 8876.

Done to visible is under 300 ms on both task types. The photo card is on screen in 2 ms, under 3 s. The server confirm is still the slow step: `completeTask` median 6.1 s on photo and 4.9 s on self-report, on the simulator over Wi-Fi. One home refetch was 19.5 s while other queries were returning 429. Uploaded photos are 16–17 KB.

`secureMs` 0 means the client did not make a follow-up secure call. `shareMs` 0 means it did not make a follow-up share call.

### Gates

- Before and after timing tables: filled from the simulator logs above.
- Done to visible: 2–4 ms on photo and self-report. Under 300 ms.
- Photo post: median 2 ms until the local post. Device: GRIIT iPhone 16 simulator, iOS 26.4, Mac Wi-Fi.
- Uploaded photo size: 17,178, 17,430, and 16,057 bytes. Under 400 KB. Quality left at 0.7.
- Old procedures: `secureDay` and `shareProof` are still procedures. `checkins-secure-day.test.ts` 7 passed.
- `npx tsc --noEmit` on `a375b25a`: 5 errors (`lib/featured-catalog-seed.test.ts` four, `lib/share.ts` one). The same 5 remain on this branch. A sixth error in `app/profile/day.tsx` came from a stale local `.expo/types/router.d.ts`. Metro regenerated that file and the error is gone. No new source errors.
- New tests: `lib/build90-speed.test.ts` failed 5/5 before the fix. After this session: that file, `proof-resize`, `finish-location`, `optimistic-home`, and `finish-bundle` passed (13 tests).
- Maestro `build90-done-count`: passed, exit 0, account `b80done06029@example.com`, `is_test` true.
- Backend: `railway up --service grit-backend` deployed `8d3c6b47`. `GET /api/health` returned `"commit":"e8f4440"`.

### Needs Yaseen

- Nothing for this chunk. The fifth before self-report was a 429 and was not retried. Four samples are in the table.

## 02 First day

### 02.1 The onboarding Join doesn't stick

Root cause: `lib/onboarding-v2-suggest.ts` `isRecommendableChallenge` allows `duo` / `shared_goal`. Gym Buddy (`participation_type: duo`, `run_status: waiting`) is suggested on Start here. `challenges.join` then only inserts `challenge_members` and returns `{ joined: true, runStatus: "waiting" }` with no `active_challenges` row (`backend/trpc/routes/challenges-join.ts`). `joinFirstChallenge` treats any non-throw as success. Solo catalog rows (e.g. 7-Day Gratitude Journal) call `joinChallengeDirect` and stick.

### 02.2 Land on the first task after any Join

Root cause: After join, onboarding `handleFinish`, challenge detail, and Discover all `replace`/`push` Home (`ROUTES.TABS` / `TABS_HOME`). Join already returns an enrollment `id` but nothing opens today's first task.

### 02.3 No empty Home

Root cause: `HomeV3.tsx` empty state shows `NO_CHALLENGE_YET` + Find/Create. Starter task code exists behind `STARTER_TASK_ENABLED: false` and is a micro-task row, not a one-tap join card. Guests with no session never reach `HomeV3`.

Starter task review (problems): (1) flag off; (2) micro-task picker, not a challenge join card; (3) does not replace empty Home; (4) guests excluded; (5) `startTomorrow` defers Day 1; (6) `completeNow` can secure without enrollment; (7) grateful note not persisted; (8) AccountScreen starter copy not in v2 order.

### 02.4 The Home ring opens the task

Root cause: `HomeV3.tsx` ring with `tapDone` calls `onCheckOff` (instant check-off). Photo and other types have no ring press. Task row uses `onPressTask`.

### 02.5 Timer

Root cause: `useTaskFlowV2.ts` uses `config.min_duration_minutes ?? 10`. Seeds store duration in `config.duration_minutes` (e.g. 5 for Morning Prayer); `mapTaskRowToApi` leaves `min_duration_minutes` null for timers. `RunningStep` Finish early / Done while running does not ask "Finished early?".

### 02.6 Onboarding ends on a task

Root cause: How it works has 3 body lines plus a freeze line. Reminders Continue → `exitOnboardingV2(ROUTES.TABS)` → Home, not the first task.

### Fixes and evidence

**02.1** `isRecommendableChallenge` rejects `duo` / `shared_goal`. `joinFirstChallenge` fails when join returns no enrollment `id`.  
Files: `lib/onboarding-v2-suggest.ts`, `lib/onboarding-v2-join.ts`.  
Test: `lib/onboarding-v2-suggest.test.ts` `never recommends duo or shared_goal…`. Maestro `.maestro/build90-join-suggest.yaml`: Gym Buddy not shown; Join → not empty Home. Exit 0.  
Failed before: yes (duo allowed). Passes now: yes. Screenshot of Start here showed three solos: Show Up 7, 7K Steps, 2-Week Hydration Check.

**02.2** Join returns `first_task` (additive). Client builds task href via `firstTaskHrefAfterJoin` (falls back to `getById` if the server omits `first_task`). Onboarding finish, detail join, and Discover join open that href.  
Files: `backend/lib/join-challenge.ts`, `lib/open-first-task.ts`, `lib/enrich-join-first-task.ts`, `OnboardingFlowV2.tsx`, `app/challenge/[id].tsx`, `app/(tabs)/discover.tsx`.  
Test: `lib/open-first-task.test.ts`. Maestro `build90-first-day.yaml`: after reminders, task screen (`Camera access is off` / proof), not empty Home. Exit 0.

**02.3** Empty Home shows Drink Water Today starter card when `STARTER_TASK_ENABLED`; one tap joins and opens the task. Guests get the same card. Flag on. Micro-task picker skipped on the first-day path (Day 1 today wins).  
Files: `lib/empty-home-starter.ts`, `components/home/HomeV3.tsx`, `app/(tabs)/index.tsx`, `lib/feature-flags.ts`.  
Test: `lib/empty-home-starter.test.ts`, `lib/feature-flags.test.ts`. Maestro `build90-empty-starter.yaml`. Exit 0.

**02.4** Ring `Done {task}` calls `onPressTask` for every open row (including photo).  
Files: `components/home/HomeV3.tsx`.  
Test: `lib/empty-home-starter.test.ts` `ring Done opens the task`. Failed before: yes (`onCheckOff`). Passes now: yes.

**02.5** `timerRequiredSeconds` reads `min_duration_minutes` then `duration_minutes`. `mapTaskRowToApi` / `buildTaskConfigParam` pass nested config duration. Finish early and Done while running show ConfirmDialog "Finished early?".  
Files: `lib/timer-duration.ts`, `useTaskFlowV2.ts`, `TaskFlowV2.tsx`, `RunningStep.tsx`, `challenge-tasks.ts`, `build-task-config-param.ts`.  
Test: `lib/timer-duration.test.ts`. Maestro `build90-timer-early.yaml`: Breathe 1 Min shows `01:00`, Finish early → Finished early? → Yes. Exit 0.

**02.6** How it works is three lines (freeze line removed). Reminders finish → first task href.  
Files: `HowItWorksScreen.tsx`, `OnboardingFlowV2.tsx`.  
Test: Maestro `build90-first-day.yaml` (6 taps to task). Exit 0.

### Gates

- 02.1 all 3 suggestions: unit + Maestro join-suggest; Start here showed 3 solos, no Gym Buddy.
- Welcome → first task ≤12 taps: `build90-first-day.yaml` (6 taps). Exit 0.
- Empty Home starter: `build90-empty-starter.yaml`. Exit 0.
- Timer + Finished early?: `build90-timer-early.yaml`. Exit 0.
- Chunk 01: unit tests + `build90-done-count.yaml` (updated for starter card / open-task join). Exit 0. Email `b90done…@example.com`.
- `npx tsc --noEmit`: same 5 baseline errors as a375b25a / chunk 01. No new source errors.
- Backend `first_task` is additive; client enrich works without a Railway deploy this chunk.

### Needs Yaseen

- Optional: deploy backend so join responses include `first_task` without the getById enrich.
- No SQL.

## 03 Task inputs

### 03.1 Workout is not a run

Root cause: `backend/lib/challenge-tasks.ts` `toTaskType` (line 214) and `buildTaskConfigFromInput` (line 271) store a Workout as DB `task_type: "run"`; `lib/challenge-packs.ts` line 82 sends it as `type: "run"`, `trackingMode: "time"`, `unit: "minutes"`. Home passes the raw `task_type` (`app/(tabs)/index.tsx` line 360), so `useTaskFlowV2.ts` line 171 sees `taskType === "run"` and `LogStep.tsx` line 147 renders the run branch: Distance in mi/km plus Duration. `buildTaskConfigParam` drops `tracking_mode` and `unit`, so the task screen cannot tell a workout from a run. The workout branch (line 196) has chips Lift / Push / Pull / Conditioning and no minimum line. The client never sends `value` for a run or workout, so a workout with a floor is rejected by `checkins.ts` line 677 ("You logged 0").

### 03.2 Sanity checks

Root cause: no pace or speed check exists. `lib/work-step.ts` `runPaceLine` (line 220) prints "Target met." as soon as distance ≥ target, before anything is saved. `CountStep.tsx` line 108 shows a check and "Target met" the moment the count reaches the goal. 3 mi in 12:50 is 4:17 per mile and is accepted.

### 03.3 Journal counts real words

Root cause: `lib/task-flow-state.ts` `wordCount` (line 88) is `split(/\s+/).filter(Boolean)`; "...." is 1 and "my my my my my my" is 6. `backend/trpc/routes/checkins.ts` repeats the same split at lines 520, 656, and 735, so the server accepts the same junk. `WriteStep.tsx` editor has `padding: 0` under the counter block; the first line has no clearance from the word bar.

### 03.4 Counter units

Root cause: `useTaskFlowV2.ts` `onCompleteCount` (line 1325) sets `count = counterGoal` and submits `value: counterGoal` no matter what was counted; `CountStep.tsx` line 164 never disables the Done button. The unit comes from `counterDisplayUnit(taskType, config)` (config `unit` / `unit_label` / `target_unit`, else `pages` for `reading`), so a `reading` task titled "Read 30 min" counts pages because that is what the row says. No repo seed carries that row (`scripts/seed-challenges.sql`, `supabase/migrations/*starter*`, `lib/featured-catalog-seed.ts`, `backend/lib/daily-challenge-templates.ts` all use `timer` for minutes); it is live-only data.

### Fixes and evidence

**03.1** `buildTaskConfigParam` now carries `tracking_mode` and `unit`. `resolveLogKind` in `lib/task-flow-state.ts` turns a DB `run` with `tracking_mode: "time"` (or unit minutes, or a workout name) into `workout`; a run with a distance target stays `run`. LogStep workout branch: chips Strength / Basketball / Swim / Cycling / Yoga / Sports / Other, Duration in min, "30 min minimum" in plain words, Distance (optional) only for Cycling and Swim, no mm:ss. The client sends `value` minutes for workouts and timed runs so the server floor check reads the right number.  
Files: `lib/build-task-config-param.ts`, `lib/task-helpers.ts`, `lib/task-flow-state.ts`, `components/task-v2/steps/LogStep.tsx`, `components/task-v2/useTaskFlowV2.ts`, `components/task-v2/TaskFlowV2.tsx`.  
Test: `lib/build90-task-inputs.test.ts` `resolveLogKind…`, `workout chips…`, `distance field…`, `minimum line…`. Maestro `.maestro/build90-task-inputs.yaml` WORKOUT block: 7 chips, Duration, "30 min minimum", no Distance; Cycling shows "Distance (optional)", Strength hides it. Exit 0. Screenshots `build90-03-workout.png`, `build90-03-workout-cycling.png`.  
Failed before: yes (workout screen asked for Distance in mi). Passes now: yes.

**03.2** `runPaceCheck` flags under 4:30 per mile or over 30:00 per mile; `cyclingSpeedCheck` flags over 35 mph (km inputs convert first). `logSanityCheck` runs on Done / Next and opens ConfirmDialog "That pace looks off." / "Check your distance and time." with Edit and Save anyway. Save anyway posts the same payload. "Target met" removed from `runPaceLine` and CountStep; nothing says met before the save.  
Files: `lib/task-flow-state.ts`, `lib/work-step.ts`, `components/task-v2/useTaskFlowV2.ts`, `components/task-v2/TaskFlowV2.tsx`, `components/task-v2/steps/CountStep.tsx`.  
Test: `lib/build90-task-inputs.test.ts` edge values 4:29 / 4:30 / 30:00 / 30:01 per mile, 35 / 35.01 mph, 56 / 57 km in an hour, 3 mi in 12:50. Maestro RUN block: 3 mi, 12:50 → "That pace looks off." / "Save anyway" / Edit closes it; "Target met" not on screen. Exit 0. Screenshot `build90-03-pace-off.png`.  
Failed before: yes (3 mi in 12:50 accepted silently). Passes now: yes.

**03.3** One rule, `countJournalWords` in `backend/lib/journal-verification.ts`: a word needs 2 or more letters, the same word counts at most 3 times. `lib/task-flow-state.ts` `wordCount` imports it (allowlisted in `lib/backend-client-imports.test.ts`); `checkins.ts` uses it in all three places (reject check, floor check, logged word count) and now floor-checks `text` journals too. WriteStep editor gets `paddingTop` and a three-line `minHeight`; the title and honesty line fold while the keyboard is up so the first line stays clear of the word bar.  
Files: `backend/lib/journal-verification.ts`, `lib/task-flow-state.ts`, `backend/trpc/routes/checkins.ts`, `components/task-v2/steps/WriteStep.tsx`, `lib/backend-client-imports.test.ts`, `lib/task-flow-state.test.ts`, `lib/write-step.test.ts`.  
Test: `lib/build90-task-inputs.test.ts` "...." → 0, "my my my my my my" → 3, 20-word sentence → 20, server uses the shared function and no raw split. Maestro WRITE block: my×6 → "3 of 20", "...." → "0 of 20". Exit 0. Screenshots `build90-03-write-repeats.png` (typed line visible under the bar with the keyboard up), `build90-03-write-dots.png`.  
Failed before: yes. Passes now: yes.

**03.3 follow-up (done in the chunk 04 chat, on Yaseen's call):** "I" and "a" count as words. Root cause: `countJournalWords` (`backend/lib/journal-verification.ts` line 41) dropped every token with fewer than 2 letters, so "I went to a park" scored 3. Fix: `JOURNAL_ONE_LETTER_WORDS = {"i", "a"}`; a one-letter token counts when its lowercased key is in that set. Other single letters still count 0 and the 3-repeat cap still applies ("a a a a a" → 3). The client `wordCount` imports the same function, so nothing else changed.  
Files: `backend/lib/journal-verification.ts`, `lib/build90-task-inputs.test.ts`, `lib/task-flow-state.test.ts`.  
Test: `lib/build90-task-inputs.test.ts` "'I went to a park' counts 5 (client and server)" (`countJournalWords` and `wordCount` both 5, "i went to A park." 5, "b c d e" 0, "a a a a a" 3); `lib/task-flow-state.test.ts` wordCount "I went to a park" → 5.  
Failed before: yes (`expected 3 to be 5`, test at line 153). Passes now: yes (18/18 in the file; 70 files / 464 tests across `task-flow-state`, `write-step`, `backend/lib`, `checkins`). Server deploy for this is left for a chunk that deploys; until then the server accepts one-letter words only after the next `railway up`.

**03.4** `counterDoneEnabled` / `counterDoneLabel` in `lib/counter.ts`: below target the button reads "22 pages left" and is disabled; at target it reads "Done · 30 pages". `onCompleteCount` submits the real count and refuses below target. Unit comes from the task row as before. Seeded mismatch ("Read 30 min" counting pages) is live-only; read and fix SQL written to `docs/sql/build90.sql`, not run.  
Files: `lib/counter.ts`, `components/task-v2/steps/CountStep.tsx`, `components/task-v2/useTaskFlowV2.ts`, `docs/sql/build90.sql`.  
Test: `lib/build90-task-inputs.test.ts` `counter cannot finish below target…`. Maestro COUNT block: "30 pages left" shown and "Done · 30 pages" absent at 0; Type it → 30 → "Done · 30 pages". Exit 0. Screenshots `build90-03-counter-zero.png`, `build90-03-counter-full.png`.  
Failed before: yes (Done at 0 saved 30). Passes now: yes.

Other files in this chunk: `components/ds/TextField.tsx` (testID passthrough so Maestro can target inputs), `lib/counter.ts`, `lib/work-step.ts`, `lib/task-helpers.ts`, `lib/build-task-config-param.ts`, `useTaskFlowV2.ts`, `TaskFlowV2.tsx`, `checkins.ts`, `lib/backend-client-imports.test.ts`. Each is named above with the item that needed it.

### Gates

- Workout shows type + duration, no distance unless Cycling or Swim: unit + Maestro WORKOUT block. Exit 0.
- Pace and speed checks with Save anyway: unit edge values + Maestro RUN block. Exit 0.
- Journal rule identical client and server: one function, imported by both; `checkins.ts` has no raw `split(/\s+/)` left (asserted in the test).
- Counter cannot finish below target: unit + Maestro COUNT block. Exit 0.
- Chunk 01–02 tests still pass: full vitest 1723 passed, the same 3 baseline failures as `34ef5003` (`challenge-detail-mapping`, `featured-catalog-seed` needs pglite, `join-challenge-error`). Maestro `build90-timer-early`, `build90-empty-starter`, `build90-first-day`, `build90-join-suggest` all exit 0 on this build. `build90-done-count` needs `MAESTRO_EMAIL` and was not run.
- `npx tsc --noEmit`: same 5 baseline errors as a375b25a (4 in `lib/featured-catalog-seed.test.ts`, 1 in `lib/share.ts`). No new errors.
- eslint on touched files: 0 errors.
- Backend: Yaseen approved. `railway up --service grit-backend` from `49f6ae0f`. The first upload came up with the stale Railway variable (`"commit":"5155614"`) because nothing writes `backend/deploy-sha.txt`, the file `hono.ts` reads first. Wrote the HEAD sha to that file and uploaded again: `GET /api/health` → `{"ok":true,"status":"ok","commit":"49f6ae0",…}`. The file is now in `.gitignore` so it never lands in a commit; write it before each `railway up`.

### Needs Yaseen

- SQL in `docs/sql/build90.sql` (chunk 03, 03.4): Step 1 lists reading / counter / water rows whose title says minutes; Step 2 converts them to `timer`. Run Step 1 first and read the list before Step 2.
- ~~One-letter words ("I", "a") count 0 under the literal "2 or more letters" rule, so "I went to a park" is 3. Say if you want "I" to count.~~ Resolved: "I" and "a" count (03.3 follow-up above).
- Pre-existing, not changed: task steps add `paddingTop: insets.top` on top of `Screen`'s own safe-area padding (double top gap); ConfirmDialog backdrop covers the whole screen; water unit is "oz" on the client (`lib/counter-log.ts`) and "cups" on the server.
- Same 3 baseline failing tests as chunk 02.
