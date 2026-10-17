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

## 04 Posting and sharing

### 04.1 One clear post choice after every task

Root cause: `components/task-v2/useTaskFlowV2.ts` `submitWithoutPhoto` (line 964) hands every non-photo payload (timer, journal, counter, run, workout, Did it, check-in) straight to `finishSubmit` with no `audience`, so `audiencePublishes(null)` is false, the row is inserted `kept`, and the user lands on Home with a "Saved." toast whose only action is a sticker card. Only the photo `ReviewStep` has a chooser. On the server `backend/trpc/routes/checkins.ts` line 1006 `createsActivityPost(self_reported, hasPhoto)` writes no `activity_events` row at all for a self-reported completion without a photo, so a Did it task cannot post even when asked to. The self-reported feed card (`components/feed/FeedPostV3.tsx` line 251) prints challenge and day but no streak.

### 04.2 Photo-proof tasks say so up front

Root cause: `components/task-v2/TaskCapture.tsx` line 143 prints the challenge name alone; `components/task-v2/steps/CaptureStep.tsx` declares `currentDay` in its props (line 10) and never reads it, and has no `durationDays`, so the capture screen cannot say which day it is. Nothing on the screen says a photo is required; the only line is the library caption under the finder. Camera only was already true: the screen is `expo-camera` `CameraView` with no image picker anywhere in `components/task-v2`.

### 04.3 The Proof screen has a finish

Root cause: `app/post/[id]/index.tsx` lines 223–256: for the author, "Share outside GRIIT" and "Back to today" are bare `Text` inside unstyled `Pressable`s in the author column, and the audience row is three caption-sized `Text`s with no selected state and no label. Nothing reads as a button and nothing says which audience is current.

### 04.4 Your own post always shows in your feed

Root cause: `backend/trpc/routes/feed.ts` `getLiveFeed` `keepEvent` line 118–119 runs `audienceShowsInScope(audience, scope)` on every event including the viewer's own, so a Friends post is dropped from the Everyone feed right after posting ("No posts yet"). The author checks above it (lines 112, 117) already exempt `ev.user_id === viewerId`; the audience check does not.

### 04.5 Share card data is correct

Root cause: `app/(tabs)/_layout.tsx` lines 163–174 open `ShareSystemSheet` from the Saved toast with `challenge: ""`, `task: toast.title` ("Saved." survives the `/ (done|saved)\.$/` strip because there is no leading space), no `day`, no `durationDays` and no `streak`. `lib/share-image.ts` `buildSharePaint` then falls back to "Challenge" (shown as CHALLENGE), `day = 1`, `total = day` → "Day 1 of 1", and `streak ?? 0` → "0 days in a row". The toast (`lib/task-complete-toast.ts`) already carries `challengeName`, `currentDay`, `totalDays` from `useTaskFlowV2.ts` line 792 but has no streak field, and `_layout.tsx` passes none of them.

### 04.6 Sticker set

Root cause: `lib/share-image.ts` `MOMENT_STYLES` gives `photo_proof` A/B/D and `self_reported` C/B/D. B is the transparent sticker with a glow (`stickerShadow`) previewed over the stock landscape `SAMPLE_STORY` (`components/share/ShareSystemSheet.tsx` line 9, `ScaledPreview` line 78). Swiping A → B → D changes layout only slightly and the colour row re-tints the same card, so it reads as colour variants. `storyUsesSticker` (line 217) is `style === "B"`, so "Copy sticker" exists on B only, and `shareToInstagramStory` goes as a sticker only on B.

### Fixes and evidence

How the choice sits in the flow (decision, recorded because 04.1 "either option ends the flow" and 04.3 "lands on the post" pull two ways): Post → Day secured when the save secured the day (`openPost` param) → the post → Done → Home. If the day is not yet secured, Post → the post directly → Done → Home. Keep it private → Day secured or the Saved toast → Home, as before. Photo tasks keep the v53.1 ReviewStep chooser (Friends / Everyone / Only me, Only me is private) and do not get a second sheet.

**04.1** New inline `PostChoiceSheet` (`components/task-v2/steps/PostChoiceSheet.tsx`): heading is the task name, label "Who sees this", chips Friends / Everyone (Friends selected by default), one line under them ("Your friends see it in their feed." / "Anyone on GRIIT can see it in the feed."), primary "Post to friends" / "Post to everyone" (`postButtonLabel`), secondary "Keep it private". It is an overlay, not a `ds/Sheet` Modal, because it opens in the same frame the ConfirmDialog or OptionalPhotoSheet Modal closes and iOS will not present two Modals at once. `useTaskFlowV2.ts` `submitWithoutPhoto` now stops at the sheet when the payload has no `audience` (`needsPostChoice`), and `answerPostChoice` resumes `finishSubmit` with the chosen one; the optimistic post goes out only when the choice publishes. Copy lives in `lib/post-choice.ts`. Self-reported text card: `selfReportedCardMeta` in `lib/feed-card-family.ts` prints "Challenge · Day 2 of 7 · 3 days in a row" (streak left off under 1), used by `FeedPostV3.tsx`. Server: `createsActivityPost(selfReported, hasPhoto, audience)` in `lib/post-audience.ts` returns `audiencePublishes(audience)` for a self-reported task without a photo, and `checkins.ts` line 1006 passes `input.audience` (one line).  
Files: `components/task-v2/steps/PostChoiceSheet.tsx`, `lib/post-choice.ts`, `components/task-v2/useTaskFlowV2.ts`, `components/task-v2/TaskFlowV2.tsx`, `lib/task-secured-nav.ts` (`choiceMade` param), `app/task/secured.tsx` (no second share offer after a choice), `lib/feed-card-family.ts`, `components/feed/FeedPostV3.tsx`, `lib/post-audience.ts`, `backend/trpc/routes/checkins.ts`.  
Test: `lib/build90-posting.test.ts` 04.1 block (sheet constants, `needsPostChoice`, hook / flow / secured wiring, `selfReportedCardMeta`, `createsActivityPost` with audience, `checkins.ts` passes `input.audience`). Maestro `.maestro/build90-post-choice.yaml` (fresh guest): 7K Steps → Done → sheet with "Who sees this", Friends, Everyone, Keep it private; Everyone flips the line; Keep it private → Day 1 secured. Exit 0. Screenshots `docs/reports/build90/build90-04-post-choice.png`, `build90-04-kept-private.png`. Maestro `.maestro/build90-post-detail.yaml` (fresh `is_test` email each run): Post to friends → Day 1 secured → the post → Done → Home "1 of 1 done", sheet gone. Exit 0 in five runs on the deployed server. Screenshots `build90-04-day-secured-post.png`, `build90-04-posted-home.png`.  
Failed before: yes (4 of 4 tests in the block against `70b747b5`). Passes now: yes.

**04.2** `captureHeaderLine(challenge, dayLine)` and `CAPTURE_PROOF_REQUIRED` ("Photo proof required.") in `lib/proof-capture.ts`. `TaskCapture` takes `dayLine` and prints "7K Steps · Day 2 of 7" with "Photo proof required." under it; `CaptureStep` builds the day line with `homeDayLine(currentDay, durationDays)`; `TaskFlowV2` passes `durationDays`. No library path added or removed: the screen was already camera only.  
Files: `lib/proof-capture.ts`, `components/task-v2/TaskCapture.tsx`, `components/task-v2/steps/CaptureStep.tsx`, `components/task-v2/TaskFlowV2.tsx`.  
Test: `lib/build90-posting.test.ts` 04.2 block (header line with and without a day, the three files wired, `CameraView` present and no `expo-image-picker` / `launchImageLibraryAsync`). No Maestro: the simulator has no camera, so the capture screen shows its "Camera access is off" state and never reaches the header.  
Failed before: yes (header test). Passes now: yes.

**04.3** `app/post/[id]/index.tsx` author block is now `ds/Button` Done (primary, `router.replace(TABS_HOME)`, testID `post-done`), `ds/Button` "Share outside GRIIT" (secondary, opens `ShareStickerSheet` with the post's challenge, day, task, streak and photo, testID `post-share-outside`), and a labeled `ds/SegmentedControl` "Who sees this" over Friends / Everyone / Only me that calls the existing `audienceMutation`. The small audience badge is hidden for the author since the control shows it. The `react-native` `Share` import is gone. Copy in `lib/post-detail.ts`; `postDetailAudience` reads an older post with no stored audience as Friends.  
Files: `app/post/[id]/index.tsx`, `lib/post-detail.ts`.  
Test: `lib/build90-posting.test.ts` 04.3 block (two Buttons with the right variants and testIDs, SegmentedControl with the label, `Share` import gone, `postDetailAudience`). Maestro `build90-post-detail`: the post shows `post-done`, "Who sees this", "Share outside GRIIT"; Done lands on Home with the post gone. Five runs, exit 0, `build90-04-proof-done.png`.  
Failed before: yes (2 of 2). Passes now: yes.

**04.4** `audienceShowsInScopeForViewer({ audience, scope, viewerId, authorId })` in `lib/post-audience.ts` returns true for the author's own post and falls through to `audienceShowsInScope` for everyone else. `feed.ts` `keepEvent` uses it.  
Files: `lib/post-audience.ts`, `backend/trpc/routes/feed.ts`.  
Test: `lib/build90-posting.test.ts` 04.4 block (own Friends post stays in Everyone, other people's posts keep the scope rule, `feed.ts` calls the viewer-aware function). Maestro `build90-post-detail` on the deployed `804ba49`: after a cold relaunch the Friends post is in Everyone and in Following. Five runs, exit 0, `build90-04-feed-everyone.png`, `build90-04-feed-following.png`.  
Failed before: yes (3 of 3). Passes now: yes.

**04.5** `shareCardFromToast(toast, username)` in `lib/task-complete-toast.ts` maps the toast to the card: challenge name, task name, `currentDay`, `totalDays`, streak only when ≥ 1, photo and camera seal. The toast now carries `streak` from `complete.streakDays`. `app/(tabs)/_layout.tsx` uses the mapper instead of the title strip.  
Files: `lib/task-complete-toast.ts`, `app/(tabs)/_layout.tsx`, `components/task-v2/useTaskFlowV2.ts`.  
Test: `lib/build90-posting.test.ts` 04.5 block (mapper; painted card says "READ 10 PAGES A DAY", "Day 2", "of 7" and never "Saved" or "1 of 1"; streak 0 left off; layout uses the mapper). Maestro `build90-post-detail.yaml` Share today on the real account: "7K Steps", "Day 1 of 7", "1 day in a row". Screenshots `build90-04-share-streak.png`, `build90-04-share-progress.png`.  
Failed before: yes (4 of 4). Passes now: yes.

**04.6** `lib/share-image.ts`: new style H "Day stamp" (challenge in caps, task, big "Day 2 of 7", seal line). `MOMENT_STYLES` is now `photo_proof` H / E / D / A, `self_reported` H / E / D, `day_secured` E / D, `challenge_finished` F / D, `invite` G. `stylesForMoment(moment, { streak, hasPhoto })` drops E (Streak) when the streak is under 1 and A (Photo) when there is no photo, so a photo task with a streak swipes through four cards and a self-reported task through three. D (Progress) for task moments paints the week dots with "Day 2 of 7" instead of "0 of due days". `copyStickerAvailable` is true for every card and the Copy target is on every page; Instagram Story was never style-bound. `ShareSystemSheet.tsx` drops `SAMPLE_STORY`, the `expo-image` import and the B background; the ViewShot background is transparent. `lib/share-colour.ts` knows H so Ink / Orange / White is remembered per card. The B paint code and `storyUsesSticker` remain in `share-image.ts` but no moment lists B; left in place so the chunk does not touch v44.1 paint it does not need.  
Files: `lib/share-image.ts`, `lib/share-colour.ts`, `components/share/ShareSystemSheet.tsx`, `lib/share-image.test.ts` (old B expectations updated).  
Test: `lib/build90-posting.test.ts` 04.6 block (four cards with streak and photo, Streak hidden at 0, Photo hidden without a photo, no B anywhere, no `SAMPLE_STORY` in the sheet, the four cards paint different strings, Copy sticker on every card). Maestro `build90-post-detail.yaml`: Share today → Streak card, Copy sticker and Instagram Story present with Ink / Orange / White; swipe → Progress card, Copy sticker still there, Orange applies. Exit 0.  
Failed before: yes (5 of 5). Passes now: yes.

### 04.6 follow-up: Instagram Story sends every card as a sticker

Root cause: `lib/share-image.ts` line 217 `storyUsesSticker(style)` is `style === "B"`. After 04.6 no moment lists B, so for every card the sheet now shows (H, E, D, A, and F / G for the other moments) `components/share/ShareSystemSheet.tsx` line 176 passes `asSticker: false` to `shareToInstagramStory`, and `lib/share.ts` `instagramStoriesShareInput` then hands the PNG over as `backgroundImage` (full-bleed background, no sticker, background colours dropped). The chunk file says "Instagram Story works on every card" and the cards are stickers, so every card has to go as `stickerImage` over the palette background.

Fix: `storyUsesSticker` returns true for every style; the sheet keeps passing `asSticker: storyUsesSticker(styleId)` and `backgroundTopColor: palette.bg`, so every card goes as `stickerImage` over the palette colour. Files: `lib/share-image.ts`, `lib/share-image.test.ts` (its B-only expectations contradicted the rule). Test: `lib/build90-posting.test.ts` "Instagram Story sends every card as a sticker, not as a background" (every style, every `stylesForMoment` result, the sheet wiring). Failed before: yes (2 failed, `/tmp/b90-04-sticker-before.txt`). Passes now: yes (29/29).

### 04.7 Day secured says "Couldn't load" after a finish (request burst hits the rate limit)

Seen on the first `build90-post-detail` run against the chunk 04 server (`b89post181231`, 22:13 UTC): Post to friends → Day secured rendered "Day secured. Couldn't load. Try again." with a "CHALLENGE · Day 1 of 1" card. Retry fixed it, so the screen's own task-count load failed once.

Evidence (Railway edge HTTP log, `railway logs --http`): the user's first authed request was 22:12:55; between then and 22:13:32 the app sent 100 requests; the 100th was Day secured's `GET challenges.listMyActive` at 22:13:32.841 → **429**; everything after was 429 until the window reset at 22:13:55 (`backend/lib/rate-limit.ts` in-memory `memoryLimit`: 100 per user per 60 s from the first request; successes resume at 22:13:57). `fetchWithRetry` then retried each 429 at 0.5 / 1 / 2 / 4 s and React Query twice more, so the one failed load produced 15 more 429s and took ~20 s to give up.

What fired after the one `POST checkins.complete` at 22:13:30.151 (same log, 3 s window): `home.bootstrap` ×10, `feed.getLiveFeed` ×5, `profiles.getRecord` ×2, `challenges.listMyActive` ×2, `checkins.getTodayCheckinsForUser` ×2, `profiles.getFollowCounts`, `challenges.finalizeEnded`, `notifications.getReminderSettings` — 24 requests for one finish. Where the ten bootstraps come from:

- `hooks/useAppChallengeMutations.ts` lines 210–213, in `completeTask().then`: `fetchTodayCheckins()`, `fetchActiveChallenge()`, `fetchStats()` and `invalidateQueries(["home","bootstrap"])`. The first three are all `AppContext.refetchBootstrap` (`contexts/AppContext.tsx` line 207), which is `invalidateQueries` **then** `refetchQueries`. The bootstrap query is always active (`AppContext` holds a `useHomeBootstrap` observer), so each invalidate starts a fetch and each refetch, with React Query's default `cancelRefetch: true`, cancels the in-flight one and starts another. `lib/trpc.ts` `trpcQuery` never reads the query's abort `signal`, so the cancelled fetch still reaches the server. 4 triggers → up to 7 HTTP requests of the same procedure. Lines 214–215 do the same invalidate + refetch pair on `profiles.getRecord` (the ×2).
- `components/task-v2/useTaskFlowV2.ts` line 604 `writeTiming`: `refetchQueries(["home","bootstrap"])`, again with cancel-and-restart.
- `app/task/secured.tsx` lines 133–141: invalidates `home.bootstrap` (one more fetch), then calls `challenges.listMyActive` and `checkins.getTodayCheckinsForUser` directly — both are already inside the bootstrap payload (`backend/trpc/routes/home.ts` `activeChallenges`, `todayCheckinsForUser`). Three requests for data the first one carries; the direct `listMyActive` is the call that took the 429.
- `app/_layout.tsx` `FinalizeEndedGate` effect has `pathname` in its deps (line 532), so every route change posts `challenges.finalizeEnded` and invalidates `home.bootstrap` again. A finish changes route three times (task → Day secured → post → Home) = 3 more POSTs and 3 more bootstraps. That is also why `finalizeEnded` shows 7 times in the minute.
- `app/(tabs)/index.tsx` line 639 `useFocusEffect` → `bootstrap.refetch()` (cancel-and-restart) on each Home focus.

The server limit is not the problem: 100 per minute is generous for a phone app; the app spent 25 of them on one procedure. The fix is on the client: one bootstrap refresh per finish that shares the in-flight request instead of cancelling it, Day secured reads its counts from that payload, and the finalize gate runs on foreground and on arrival at Home, not on every navigation.

**Second pass (traced).** After the first cut Day secured loaded first try, but the relaunch at the end of the flow still hit 429 (run `b89post183314`, 22:34 UTC: 100 requests between the first authed call at 22:33:38 and 22:34:25, then 43 × 429). To attribute every request I put a temporary trace in `trpcQuery` (path, input, stack → a local sink, symbolicated through Metro's `/symbolicate`; removed before commit). One flow, sign-up to relaunch, was 108 GETs. The callers, by count:

- `hooks/useNotificationScheduler.ts` `runExtended`: `getReminderSettings`, `listMyActive`, `getSecuredDateKeys`, then `lib/g2a-refresh.ts` `scheduleG2aForUser` fetches `listMyActive` and `getTodayCheckinsForUser` again — 5 requests per run, and it ran 9 times in the minute (45 requests) because its effect keyed on `activeChallenge.challenges`, a new object after every bootstrap refetch. All four lists are in the bootstrap payload it had just received.
- `components/LiveFeedSection.tsx` `maybeFetchMore`, called from `renderItem` for every row: five rows rendered in one pass → `fetchNextPage()` five times for the same cursor (`cancelRefetch` default true, so each cancels the one before and the server runs all five). Twice per scroll: 10 `feed.getLiveFeed` after one finish (the "×12" in the first pass). `onEndReached` already did the same job once.
- `hooks/useAppChallengeMutations.ts` after `checkins.complete` and after `secureDay`: `scheduleG2aForUser` with no lists → `listMyActive` + `getTodayCheckinsForUser` right after the bootstrap refresh returned them.
- `components/task-v2/useTaskFlowV2.ts` `writeTiming` and `app/(tabs)/index.tsx` Home focus: each a second / third `home.bootstrap` because the finish's refresh had already resolved by the time they ran (joining only helps while a fetch is in flight).
- `components/LiveFeedSection.tsx` `mineQuery` (`listMyActive`, 30 s stale) refetched on every Home focus though it is read only when a "started" row is opened.
- `app/_layout.tsx` `FinalizeEndedGate`: `listUnseenEndings` was outside the try, so its 429 surfaced as an unhandled rejection (the red box in the screenshot).

**Fix** (all client, no server change):

- `lib/home-bootstrap-refresh.ts` (new): `refreshHomeBootstrap(queryClient, { freshAfter? })` is the one way to refresh the bootstrap: one `invalidateQueries({ refetchType: "all" }, { cancelRefetch: false })` — note the option goes in the second argument; in the filters object React Query ignores it — joining a fetch in flight, and returning without a request when the payload was written at or after `freshAfter` (the finish start for `writeTiming`, "ten seconds ago" for Home focus). `bootstrapDayOpenInput` / `bootstrapG2aInput` / `readHomeBootstrap` read enrollments and today's check-ins from the payload. `fetchReminderSettings` reads `notifications.getReminderSettings` through a five-minute cache; `app/settings/notifications.tsx` empties it after a save.
- `hooks/useNotificationScheduler.ts`: takes `enrollments`, `securedDateKeys`, `todayCheckins` from `AppContext` (bootstrap sections; falls back to its own requests only when a section is missing), reads settings through the cache, and re-runs on `schedulerSignature` (the planned values as a string), not object identity. Per run: 0 requests when settings are cached, 1 otherwise; was 5.
- `lib/g2a-refresh.ts` `scheduleG2aForUser` takes optional `enrollments` / `todayCheckins`; `useAppChallengeMutations.ts` passes the bootstrap's after a finish (awaiting the refresh it started) and after a secure.
- `components/LiveFeedSection.tsx`: next page from `onEndReached` only, guarded by a ref and `cancelRefetch: false`; `mineQuery` enabled only while a started preview is open.
- `app/task/secured.tsx`: reads the task count from the bootstrap payload (`bootstrapDayOpenInput`) instead of calling `listMyActive` and `getTodayCheckinsForUser`.
- `hooks/useAppChallengeMutations.ts`, `contexts/AppContext.tsx`, `components/task-v2/useTaskFlowV2.ts`, `app/(tabs)/index.tsx`: every bootstrap refresh goes through the helper; the `getRecord` / `getSecuredDateKeys` / `liveFeed` invalidations pass `{ cancelRefetch: false }`.
- `lib/finalize-ended-foreground.ts` + `app/_layout.tsx`: `finalizeEnded` + bootstrap invalidate on mount and foreground only (`[user, nav]`); a route change runs only `checkUnseenEndingsOnHome`, and only when a run away from Home left it pending; `listUnseenEndings` errors are captured, not thrown.

Files outside the chunk's list, and why: `hooks/useNotificationScheduler.ts`, `lib/g2a-refresh.ts`, `components/LiveFeedSection.tsx`, `app/settings/notifications.tsx`, `lib/finalize-ended-foreground.ts`, `app/_layout.tsx`, `app/(tabs)/index.tsx`, `contexts/AppContext.tsx`, `hooks/useAppChallengeMutations.ts` — each is one of the request sources above; the budget is per user, so the fix has to be where the requests are made. Two existing source-shape tests were updated to the new call form, same intent: `lib/consistency.test.ts` (getRecord invalidate + refetch still both there, now with `cancelRefetch: false`) and `lib/home-pull-refresh.test.ts` (focus effect still never lists `bootstrap` in its deps).

Test: `lib/build90-finish-requests.test.ts` (14): a real `QueryClient` + `QueryObserver` — four concurrent refreshes make one request (was seven), a refresh still fetches with nothing in flight and with no observer, `freshAfter` skips the request; `bootstrapDayOpenInput` / `bootstrapG2aInput`; `scheduleG2aForUser` makes no request when given the lists and exactly `listMyActive` + `getTodayCheckinsForUser` when not; reminder settings read once per cache life and re-read after `invalidateReminderSettings`, null on error; `schedulerSignature` equal across object copies and different when a value changes; finalize gate pending / Home-only behaviour; source assertions on every call site. Failed before: yes (`/tmp/b90-04-7-before.txt`: module not found, then 4 of 7 on the first attempt because `cancelRefetch` was in the filters object and the probe measured 9 requests for four refreshes). Passes now: 14/14.

Request count, same flow (sign-up → onboarding → join → finish → post → Done → cold relaunch), Railway edge log (`railway logs --http --json`):

| | before (`b89post183314`, 22:33) | after (`b89post185444`, 22:54) |
|---|---|---|
| requests in the minute | 100 then 429 | 79, no 429 |
| after `checkins.complete`, 6 s | 24 (bootstrap ×10) | 11 (bootstrap ×2: finish + Day secured) |
| `home.bootstrap` whole flow | 13 | 13 → 2 per finish, rest are sign-up / join / mount |
| `feed.getLiveFeed` whole flow | 22 | 8 (page 1, then one per page while scrolling) |
| `challenges.listMyActive` whole flow | 21 | 2 (challenge detail + join) |
| `notifications.getReminderSettings` | 7 | 2 (one per app launch) |
| 429 | 43 | 0 |

Five runs in a row, Day secured on the first try. The flow has no Retry tap; right after `extendedWaitUntil "Day 1 secured.*"` it asserts `"Couldn't load.*"` is not visible, then goes on through the post, Done, the cold relaunch and both feeds. All five on the final code (`.maestro/build90-post-detail.yaml`, fresh `is_test` account each), edge log per run from `railway logs --http -n 5000 --json`:

| run | account | Maestro | requests in the run | 429 | after `checkins.complete`, 6 s | `home.bootstrap` after |
|---|---|---|---|---|---|---|
| 1 | `b89post190933` | exit 0, 23:09:33–23:11:12 UTC | 74 | 0 | 9 | 2 |
| 2 | `b89post191121` | exit 0, 23:11:21–23:12:51 | 74 | 0 | 12 | 2 |
| 3 | `b89post191300` | exit 0, 23:13:00–23:14:37 | 76 | 0 | 12 | 2 |
| 4 | `b89post191446` | exit 0, 23:14:46–23:16:28 | 75 | 0 | 12 | 2 |
| 5 | `b89post191636` | exit 0, 23:16:36–23:18:09 | 75 | 0 | 12 | 2 |

The two bootstraps after a finish are the finish's own refresh and Day secured's (which must not show stale counts); the other requests in the window are `getFollowCounts`, `getRecord`, `feed.getLiveFeed` ×2 (invalidate + the page the post screen reads), `getComments` + `getPost` (the post), and Home's `starterTask.expire` / `notifications.getAll` / `starterTask.get` / `feed.todayPosters` on return. Screenshots from run 5: `docs/reports/build90/build90-04-day-secured-post.png` (no "Couldn't load"), `build90-04-proof-done.png`, `build90-04-posted-home.png`, `build90-04-feed-everyone.png`, `build90-04-feed-following.png`.

Before the fix, the same flow three times in a row (`b89post183314`, `b89post183454`, `b89post183628`, 22:33–22:38) passed Day secured but 429'd on the relaunch every time (43, 40 and 41 × 429), so "Day secured loads" alone was not the bar; the whole minute had to fit.

One more test case was written after its fix rather than before: `homeBootstrapIsFreshSince` ignoring the disabled guest key (`["home","bootstrap",""]`, no data). Run 1 of the first five-run attempt (`b89post190635`) showed a third `home.bootstrap` on return to Home at 23:07:37 although the payload was 3 s old; the guest key's `dataUpdatedAt` 0 made the rule always false. Fixed, test added, and the five runs above were restarted on the final code.

### Chunk 04 continuation (this chat)

Deploy (approved by Yaseen in the chunk instruction): HEAD `804ba49c` written to `backend/deploy-sha.txt`, `railway up --service grit-backend`. The first upload left `/api/health` on the stale `5155614`: `deploy-sha.txt` is gitignored and `railway up` honours `.gitignore`, so the file never reached the build. `.railwayignore` now has `!backend/deploy-sha.txt`; the second upload gives `{"ok":true,"commit":"804ba49"}` (checked again at the end of the chunk, uptime 24 min then, same commit). No Railway or Supabase setting changed.

`is_test` on the four chunk 04 accounts, read-only through `railway run --service grit-backend npx tsx <temporary script>` (service role stayed in the server env; the script was deleted afterwards): `b89post174553` → `is_test=true`, `b89post174717` → `true`, `b89post175001` → `true`, `b89post175142` → `true`. `backend/trpc/create-context.ts` already flags every `^b8\d.*@example\.com` request. No SQL needed.

Found first: `de0dd8c2` held only the new files. The twenty edited files (checkins.ts audience, feed.ts own-post rule, sticker set, Proof Done, PostChoiceSheet wiring, toast mapper) were in `stash@{0}` (17:53) and never reached a commit, so the repo at `86551622` did not have chunk 04 and `lib/build90-posting.test.ts` could not even import (`copyStickerAvailable`, `stylesForMoment(moment, facts)` did not exist). Popped the stash and committed it as `804ba49c` before anything else; 28/28 in the two chunk 04 test files and the same 5 baseline tsc errors on that tree.

Files outside the chunk's list, and why: `app/(tabs)/_layout.tsx` (owns the toast → share sheet handoff, 04.5), `backend/trpc/routes/checkins.ts` (one line so a self-reported task can post, 04.1), `lib/task-secured-nav.ts` and `app/task/secured.tsx` (no second share offer after the sheet, 04.1), `lib/feed-card-family.ts` and `components/feed/FeedPostV3.tsx` (the text card's streak, 04.1), `lib/post-audience.ts` (shared client / server rule, 04.1 and 04.4), `lib/task-complete-toast.ts` (04.5), `lib/proof-capture.ts` (pure helpers so 04.2 is unit-testable), `lib/share-colour.ts` (04.6), `lib/share-image.test.ts` (its B expectations contradicted 04.6).

### Gates

- Every task type ends with the sheet and lands on today's tasks or Day secured: `submitWithoutPhoto` is the one exit for timer, journal, counter, run, workout, Did it and check-in payloads (asserted in `lib/build90-posting.test.ts`); Maestro `build90-post-choice` (fresh guest, exit 0, 23:20 UTC) Keep it private → Day 1 secured, screenshots `build90-04-post-choice.png`, `build90-04-kept-private.png`; `build90-post-detail` Post to friends → Day 1 secured → the post → Done → Home "1 of 1 done" (five runs, exit 0, table above).
- The Proof screen's Done works: `build90-post-detail` lands on the post (`post-done`, "Who sees this", "Share outside GRIIT" visible, `build90-04-proof-done.png`), taps Done, asserts Home "1 of .* done" with `post-done` and "Who sees this" gone (`build90-04-posted-home.png`). Five runs, exit 0.
- Own post in both feeds right after posting: `build90-post-detail` stops and relaunches the app before looking (the optimistic row lives in memory, so what it finds came from the server), then finds "7K Steps · Day 1 of 7 · 1 day in a row" in Everyone (`build90-04-feed-everyone.png`) and after tapping the Following pill (`build90-04-feed-following.png`). Five runs, exit 0, against the deployed `804ba49` (`feed.ts` own-post rule).
- Share card correct, screenshots: `build90-04-share-streak.png` ("7K Steps", "1 day in a row", real date and handle), `build90-04-share-progress.png` ("7K STEPS", "Day 1 of 7", Orange), from run 5.
- 4 sticker cards, no stock photo, copy works: `stylesForMoment("photo_proof", { streak: 3, hasPhoto: true })` → H / E / D / A; `SAMPLE_STORY` gone; Copy sticker visible on both cards in every run; Instagram Story now sends every card as a sticker (`storyUsesSticker` true for all, 04.6 follow-up). The copy action (`copyStickerPngToPasteboard`) is unchanged from v44.1.
- Chunk 01–03 tests pass: full `npx vitest run` 1763 passed, the same 3 baseline failures as `34ef5003` (`challenge-detail-mapping`, `featured-catalog-seed` needs pglite, `join-challenge-error`). Chunk Maestro flows on this build, all exit 0 (23:20–23:28 UTC): `build90-timer-early`, `build90-empty-starter`, `build90-first-day`, `build90-join-suggest`, `build90-task-inputs`, `build90-done-count`. `build90-done-count` (chunk 01) needed one change: after Done it now taps Keep it private before the 1-second count check, because 04.1 puts the sheet there by design; the rule it measures (Home count moves within 1 s of the no-post exit) still holds. `lib/build90-posting.test.ts` 29/29, `lib/build90-finish-requests.test.ts` 15/15, `lib/share-image.test.ts` 5/5.
- `npx tsc --noEmit`: 5 errors, the same baseline as a375b25a (4 in `lib/featured-catalog-seed.test.ts`, 1 in `lib/share.ts`). 0 new.
- eslint on touched files: 0 errors; 12 warnings present at HEAD before this chat plus 5 `import/first` in the new test (the `vi.mock` hoisting layout every other test here uses).
- Deployed with approval (above); no Railway or Supabase setting changed; no SQL written this chunk.

### Needs Yaseen

- Pre-existing, not changed: the guest "Save your challenge" sheet (`components/home/SaveStreakSheet.tsx`) opens over Day secured after a guest's first task, and its back chevron sits under the status bar (no top inset inside the Modal), so it cannot be dismissed by tap; the flows use an email account to get past it. On Day secured the task row sits behind the Done button (`app/task/secured.tsx`, see `build90-04-kept-private.png`).
- The rate limit stays at 100 per user per minute (`backend/lib/rate-limit.ts`); the flow now uses 74–79 of them from sign-up to relaunch, most in onboarding and join (`profiles.update` ×2, `finalizeEnded`, four `home.bootstrap` in the first 2 s after sign-in, `challenges.listMyActive` + `getSecuredDateKeys` on the challenge page). Not touched here: outside chunk 04 and under the limit.
- The feed's self-reported card is one accessible element, so Maestro matches the meta line inside its label (`.*7K Steps · Day 1 of 7 · 1 day in a row`), and the Following / Everyone pills expose their accessibility labels ("Show feed from people you follow" / "Show feed from everyone"), not the visible words. Flow comments say so.
- Maestro flows that post need `MAESTRO_EMAIL=b89…@example.com` (the `is_test` pattern is `^b8\d.*@example\.com`); accounts created this chunk and in this chat all match it (`b89post…`, `b89g…`).
- Same 3 baseline failing tests as chunk 03.

## 05 Links and numbers

### 05.1 Tap any person and open their profile

Root cause: there is no one route helper, so each surface rolls its own and several skip the tap. `components/ds/CommentRow.tsx` line 26 is a plain `View` with no press prop, so a comment author is never tappable: `components/feed/CommentsSheet.tsx` line 145 renders it bare and `app/post/[id]/index.tsx` line 288 wraps it in a Pressable whose press means Reply. The post author header (`app/post/[id]/index.tsx` lines 208–218) is a `View` with an `Avatar` and a `Text`, not pressable. `components/activity/NotificationsTab.tsx` lines 111–125 route only `follow` / `follow_request` rows to the profile; on a like or comment row the whole row, avatar included, opens the post, so the person cannot be reached. `components/activity/LeaderboardTab.tsx` lines 341–343 return early when the entry has no username instead of falling back to the user id, which `profiles.getPublicByUsername` accepts (`backend/trpc/routes/profiles.ts` line 107). `app/challenge/[id]/members.tsx` line 163 renders the roster `MemberRow` with no `onPress`, and `backend/trpc/routes/groups.ts` `members` line 618 maps the profile to `displayName` and `avatar` but drops `username`. Feed posts (`FeedPostV3.tsx` `PostHeader`, `FeedCompactRow`, `InlineComments`) and Discover people already open the profile through `lib/feed-tap-targets.ts` `feedAuthorHref`, which hand-builds `ROUTES.PROFILE_USERNAME(encodeURIComponent(...))`. Likes lists: the app has no likes-list screen (the feed shows a heart and a count; `feed.getReactions` has no caller), so there is no person to tap there.

### 05.2 Tap any challenge name and open the challenge page

Root cause: `components/feed/FeedPostV3.tsx` `PostHeader` lines 318–327 put the subject line ("Day 1 of 7 · 7K Steps") inside the same Pressable as the author name, so tapping the challenge name opens the author's profile; `onChallengePress` is passed to the component (line 59) but only the compact row uses it (line 187). `components/home/HomeV3.tsx` line 441 renders the open rows of every challenge as one interleaved list (`proof.sections.flatMap(...)`) with the challenge name only inside each row's caption (line 300, `${section.challenge} · ${dayLine} · ${row.caption}`); there is no header line per challenge. The caption Pressable (lines 327–333) does open the challenge already. Profile Challenges cards (`components/profile/ChallengeCard.tsx`) already open the enrollment page.

### 05.3 Hide test accounts

Root cause: `backend/lib/test-authors.ts` has the helpers (`viewerIsTestAccount`, `testAuthorIdSet`, `dropTestAuthors`) and `leaderboard.ts` (lines 67–69, 177–180, 306–309) and `profiles.search` (line 410) use them, but three list procedures never look at `profiles.is_test`: `backend/trpc/routes/notifications.ts` `getAll` lines 103–132 returns every `in_app_notifications` row for the viewer and maps the actor straight from `data.actor_id` (that is how "b89likes15" reached a real user's notifications); `backend/trpc/routes/feed.ts` `getComments` lines 800–837 filters blocked users only; `feed.getReactions` lines 1004–1034 filters nothing.

### 05.4 Numbers agree everywhere

Root cause, tasks left: `lib/profile-challenges.ts` line 186 sets a running challenge's `tasksLeft` to `tasksPerDay` whenever today is not secured, ignoring today's check-ins, and `app/(tabs)/profile.tsx` line 279 sums those into the Today tile ("4 tasks left"). Home counts from the bootstrap's `todayCheckinsForUser` (`app/(tabs)/index.tsx` lines 321–380 → `selectHomeProofCard`), so it says "3 of 4 done". Two formulas for one number.

Root cause, challenge page: `components/challenge/ActiveChallengeV3.tsx` line 197 prints `${dueCount} days done · ${securedCount} secured` with a hardcoded plural ("1 days done"), and `backend/lib/enrollment-day-stats.ts` line 53 sets `done = due`, so the first number is the count of days that were due, not days done: on Day 2 of 7 with day 1 missed it reads "1 days done · 0 secured" over a record card that reads "0 of 1 day secured" (`recordOfDue`, line 365). Same page, `lib/g2a-challenge.ts` line 65 week line `${securedCount} of ${due} days` has no singular either.

Root cause, other hardcoded plurals on the same three screens and the share card: `lib/secured-since.ts` line 52 (`${header.days} days secured`, Home hero and Profile header, while its calendar twin on line 57 pluralises), `lib/profile-v2-record.ts` lines 281 and 497 (Profile consistency and "Your data"), `lib/copy.ts` line 25 `WEEK.line` (Home streak sheet), `lib/share-image.ts` lines 494, 501 and 511 (Finish and Progress cards: "of 1 days secured", "Longest streak 1 days"), `lib/share-copy.ts` line 40 (finished share text). `lib/format-days.ts` already has `formatDays` / `formatOfDays`; these lines do not use it.

### Fixes

Note on this chat: chunk 05 started in an earlier chat that stopped mid-05.4 with everything uncommitted (root causes above, 05.1–05.3 code, `lib/today-counts.ts` written, `app/(tabs)/index.tsx` half-switched to it). This chat picked the tree up as it was, finished 05.4, wrote the Maestro flows and ran the gates.

**05.1** `lib/routes.ts` gains `userProfile(usernameOrId)` (encodes; takes a username or, with no handle, the user id, which `profiles.getPublicByUsername` already accepts). `lib/feed-tap-targets.ts` gets `usableHandle()` and `feedAuthorHref` goes through the helper. Surfaces: `components/ds/CommentRow.tsx` (new `onPressAuthor`: avatar and name are Pressables), `components/feed/CommentsSheet.tsx` (closes the sheet, then opens the author), `app/post/[id]/index.tsx` (author header is a Pressable, `testID="post-author"`; comment rows get `onPressAuthor`), `components/activity/NotificationsTab.tsx` (`openActor`; the avatar is a Pressable `testID="notif-actor"` on every row with an actor, so a like or comment row still opens the post while the person opens the profile), `components/activity/LeaderboardTab.tsx` (no early return; id fallback), `app/challenge/[id]/members.tsx` (`onPress={() => openMember(m)}`) with `backend/trpc/routes/groups.ts` `members` returning `username`, `app/(tabs)/discover.tsx` and `app/follow-list.tsx` (helper instead of hand-built paths). Likes lists: there is no likes-list screen in the app (`feed.getReactions` has no client caller), so the server filter (05.3) is the whole change there. Search: the app has no people-search screen (`profiles.search` has no client caller); Discover's People row and the follow list's Search field are the people lists, both on the helper.

**05.2** `components/feed/FeedPostV3.tsx` `PostHeader`: the name and the subject line are two Pressables; the subject (`testID="feed-post-challenge"`, label "Open <challenge> challenge") calls `onChallengePress`, which `LiveFeedSection` already passed. `components/home/HomeV3.tsx`: open rows render per section under a one-line header `"<challenge> · Day N of M"` (`homeChallengeHeaderLine` in `lib/home-proof-card.ts`, `testID="home-challenge-header"`, hairline top rule, 44pt row, secondary type, chevron) that calls `onPressChallenge(section.challengeId)`. The row caption and the profile `ChallengeCard` already opened the challenge.

**05.3** `backend/trpc/routes/notifications.ts` `getAll`: for a real viewer, rows whose `actorId` is an `is_test` profile are dropped (rows without an actor stay; a test viewer sees everything). `backend/trpc/routes/feed.ts`: `hiddenTestAuthorIds()` helper; `getComments` and `getReactions` drop test authors for a real viewer after the block filter. Query filters, verbatim: `notifications.ts` → `testAuthorIdSet(reader, actorIds)` over `profiles.user_id in (...) and is_test = true`, `keep = !n.actorId || !testIds.has(n.actorId)`; `feed.ts getComments` → `unblocked.filter((c) => !testIds.has(c.user_id))`; `feed.ts getReactions` → same set over the reaction `user_id`s. Leaderboard (`leaderboard.ts` 67–69, 177–180, 306–309) and `profiles.search` (410) already had the filter.

**05.4** New `lib/today-counts.ts`: `requiredTasks`, `enrollmentStarted`, `todayTaskCounts({ activeChallenges, todayCheckins, todayKey, timeZone })` → `{ total, done, left, byEnrollment }`. `app/(tabs)/index.tsx` builds Home's rows with `enrollmentStarted` + `requiredTasks` (same rules it had, now the shared functions). `app/(tabs)/profile.tsx` computes `todayTaskCounts` from the same bootstrap payload Home reads and passes `leftByEnrollment` to `rowsFromProfileRecord` (`lib/profile-challenges.ts`), which uses it for `tasksLeft` instead of `tasksPerDay`. `components/challenge/ActiveChallengeV3.tsx` line 197 prints `recordLine(secured, due)` ("0 of 1 day secured", or "First day is today." while nothing is due; see below), the same string as the record card, instead of "N days done · M secured". Plurals through `lib/format-days.ts`: `lib/g2a-challenge.ts` `weekSecuredOfDue.line`, `lib/secured-since.ts` `securedSinceLine`, `lib/copy.ts` `WEEK.line`, `lib/share-image.ts` (Finish card "of N day(s) secured", "Longest streak N day(s)", Progress card "of N day(s)"), `lib/share-copy.ts`, `lib/profile-v2-record.ts` (consistency line and "Your data" completion). `backend/lib/backend-import-graph.test.ts`'s snapshot gains `lib/format-days.ts` (reached from `profile-v2-record.ts` by a relative import; no `@/` alias, Railway's tsx is fine).

Tests: `lib/build90-links-numbers.test.ts` (9: 05.1 helper + surfaces, 05.2 Home header + feed subject, 05.4 counts, meta line, plurals) and `backend/trpc/routes/hide-test-lists.test.ts` (3: notifications, comments, reactions for a real viewer and a test viewer). Failed before on the 05.4 tests (`expected 4 to be 2` for Profile's left count; `ActiveChallengeV3` contained "days done"; `weekSecuredOfDue` "1 of 1 days"), pass now: 12/12. The 05.1–05.3 tests were written in the earlier chat before their fixes.

Files outside the chunk's list, and why: `lib/today-counts.ts` (new shared counter, 05.4), `lib/profile-challenges.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/profile.tsx` (the consumers that disagreed, 05.4), `components/challenge/ActiveChallengeV3.tsx` is in the list via the challenge page; `lib/g2a-challenge.ts`, `lib/secured-since.ts`, `lib/copy.ts`, `lib/share-image.ts`, `lib/share-copy.ts`, `lib/profile-v2-record.ts` (the hardcoded "days" the item asks to pluralise, on Home, Profile, the challenge page and the share card), `backend/lib/backend-import-graph.test.ts` (snapshot), `app/(tabs)/discover.tsx`, `app/follow-list.tsx`, `app/post/[id]/index.tsx`, `app/challenge/[id]/members.tsx`, `backend/trpc/routes/groups.ts` (the person surfaces 05.1 names).

### Found while running the flows (after `ea97ee14`)

Deploy (approved in the chunk instruction): HEAD `ea97ee14` written to `backend/deploy-sha.txt`, `railway up --service grit-backend`, `/api/health` → `{"ok":true,"commit":"ea97ee1"}` before either flow ran. The server has not changed since, so no second deploy. No Railway or Supabase setting changed; no SQL this chunk.

- **05.1, fresh accounts could not open anyone (and comment authors read "Someone").** Root cause: `lib/anon-auth.ts` `upgradeAnonymousWithEmail` calls `supabase.auth.updateUser({ email, password })`, which flips `auth.users.is_anonymous`, but the stored access token still carries `is_anonymous: true`. `profiles_select_authenticated` (`supabase/migrations/20260822000000_anon_exclude_broad_reads.sql`) reads that claim, so until the token refreshed (up to an hour) the new account's user-scoped client could read no profile but its own: `feed.getComments` filled `display_name` with "Someone" and `username` with "?", `feedAuthorHref` fell back to the id, and `profiles.getPublicByUsername` returned `null`, so the profile page showed the raw uuid as name and handle with "This account is private." (`build90-05-people-feed-author.png` from run `2026-10-17_012121` had `332504c4-…` where "b89links010403" belongs). The feed itself looked fine because `getLiveFeed` reads profiles with the service client. Fix: `refreshedOrStoredSession()` in `lib/anon-auth.ts` calls `supabase.auth.refreshSession()` right after `updateUser` and falls back to the stored session if the refresh fails. Test: `lib/anon-auth.test.ts` "refreshes the session after updateUser so RLS sees a non-anonymous token" + "falls back to the stored session when refreshSession fails" (failed before: `refreshSession` called 0 times; 17/17 now). Flow evidence: `build90-links-people` now asserts the email's local part on A's profile and `assertNotVisible: "Someone"` in the comments sheet.
- **05.1, the person on a notification row was unreachable for VoiceOver and the flow.** `components/ds/ListRow.tsx` put the leading slot under `accessibilityElementsHidden` and inside the row's accessible Pressable, so the `notif-actor` Pressable the earlier chat added existed for a finger but not for assistive tech or Maestro (the row flattened to "b89linksb… commented on your proof"). New `interactiveIcon` prop: the slot is not hidden and, when the row has `onPress`, renders beside the row Pressable instead of inside it (`styles.rowBody`). `NotificationsTab` passes `interactiveIcon={!!onPressActor}`. Leaderboard rows keep whole-row `onPress` and do not use it.
- **05.1, comment authors on the post screen were masked.** `app/post/[id]/index.tsx` wraps each `CommentRow` in a "Reply to <name>" Pressable; being accessible it flattened the author Pressables and the comment text into one button. Now `accessible={false}` on that wrapper: the reply tap still works, the author tap target and the comment text are exposed. The reply affordance is no longer a VoiceOver element (noted under Needs Yaseen).
- **05.4, Profile said "1 task left" before the first finish but not after.** Profile's Today tile read `profiles.getRecord` (`staleTime` 60 s), which lags the bootstrap right after a join. `app/(tabs)/profile.tsx` now computes the tile from the bootstrap (`todayTaskCounts(...)`), the payload Home uses, and falls back to the record only until the bootstrap has loaded.
- **05.4, the challenge page said "0 of 0 days secured" on Day 1** (nothing is due yet) and did not move after the finish (`getSecuredDateKeys` is 60 s stale). `lib/v44-detail.ts` `recordLine(secured, due)` returns "First day is today." when nothing is due, else `recordOfDue`; `ActiveChallengeV3` uses it for the meta line and the record card. `app/challenge/active/[activeChallengeId].tsx` prefers `bootstrap.data.securedDateKeys` over the page's own query (the bootstrap is refreshed on every finish since 04.7).
- **05.2, the subject line of a just-posted card did nothing.** The optimistic feed row from `components/task-v2/useTaskFlowV2.ts` had no `challengeId`, so `onChallengePress` had nothing to open until the server page replaced it. Both `optimisticTaskPost` calls now carry `enrollmentQ.data?.challenge_id`.
- **05.4, Home's header hint said "Finish all 1 tasks".** `lib/g2a-home.ts` `todayFirstDayLine(1)` → "Day 1 is today. Finish the task to secure it." (`lib/g2a-home.test.ts` updated).

Extra files outside the list for these: `lib/anon-auth.ts` + test (05.1 root cause lives in the sign-up upgrade), `components/ds/ListRow.tsx` (05.1 notification avatar), `components/task-v2/useTaskFlowV2.ts` (05.2 optimistic row), `lib/v44-detail.ts`, `app/challenge/active/[activeChallengeId].tsx`, `lib/g2a-home.ts` + test (05.4 numbers on the challenge page and Home). `lib/build90-links-numbers.test.ts` now also asserts `recordLine`, the bootstrap keys on the challenge page and Profile, the optimistic `challengeId` and no "days done" (9/9).

### Gates

- A name in each listed place opens the right profile: Maestro `build90-links.yaml` (account A, exit 0, run `2026-10-17_010404`) taps the feed author (own tab: "Edit profile", no "Follow"), and `build90-links-people.yaml` (account B then A, exit 0, run `2026-10-17_013629`) taps A's name on the feed → A's profile with "b89links010403", `build90-05-people-feed-author.png`; a comment author in the comments sheet → that account's profile ("Follow", "@user_c84becec"); the notification avatar (`notif-actor`) → B's profile, `build90-05-people-notif-actor.png`; the comment author on the post screen → their profile, `build90-05-people-post-comment-author.png`. Leaderboard and challenge members: no second member exists for a fresh account ("A board needs two.", `build90-05-leaderboard.png`); the row handlers are asserted in `lib/build90-links-numbers.test.ts` (`userProfile(usableHandle(...) ?? userId)` in `LeaderboardTab`, `openMember` in `members.tsx`).
- A challenge name in each listed place opens the challenge: `build90-links.yaml` taps the Home header (`home-challenge-header`) → challenge page ("First day is today.", `build90-05-open-home.png`), the Profile Challenges card ("Open 7K Steps challenge") → challenge page ("1 of 1 day secured", `build90-05-open-profile.png`), and the feed subject (`feed-post-challenge`) → challenge page (`build90-05-open-challenge.png`).
- No is_test account in any list: filters quoted under 05.3; `backend/trpc/routes/hide-test-lists.test.ts` 3/3; deployed as `ea97ee1`. In the flows, B (is_test) sees A's post and notifications only because both are test accounts; an anonymous guest viewer is not a test account, so B's feed was empty until B had an account and the app relaunched (the flow does that on purpose).
- Home, Profile and the challenge page show the same counts: before the finish Home "0 of 1 done" (`build90-05-counts-home.png`), Profile "Today. 1 task left" (`build90-05-counts-profile.png`), challenge page "First day is today."; after the finish Home "1 of 1 done", Profile "Days secured" with no Today tile (`build90-05-counts-profile-challenges.png`), challenge page "1 of 1 day secured" (`build90-05-counts-challenge.png`). Same account, same minute, one flow.
- Chunk 01–04 tests still pass: full `npx vitest run` 1776 passed, the same 4 baseline failures in 3 files (`challenge-detail-mapping` ×2, `featured-catalog-seed` needs pglite, `join-challenge-error`). Maestro on this build, all exit 0 (05:41–05:51 UTC): `build90-timer-early`, `build90-empty-starter`, `build90-first-day`, `build90-join-suggest`, `build90-task-inputs`, `build90-post-choice`, `build90-post-detail`, `build90-done-count`. Two harness stalls on the way, not app failures: a camera permission dialog left by one flow sat over the dev launcher (dismissed; `launchApp clearState` resets permissions), and the Maestro XCTest driver died once mid-flow ("Failed to resolve remote element", "Child process terminated with signal 15"); the rerun passed.
- `npx tsc --noEmit`: 5 errors, the same baseline (4 in `lib/featured-catalog-seed.test.ts`, 1 in `lib/share.ts`). 0 new.
- PROGRESS.md updated, committed, pushed: see the commit.

### Needs Yaseen

- The post screen's comment wrapper is `accessible={false}` now, so VoiceOver reads the author, time and text of a comment but no longer announces "Reply to <name>" as an action. A proper fix is a reply control inside `CommentRow`; not done here (outside 05.1).
- Leaderboard: a challenge board lists only `board_opt_in = true` members and nothing in the app sets that flag (`JOIN_THE_BOARD` is voided), so a fresh account's own challenge board reads "A board needs two." even with members. Not changed (not in chunk 05).
- Profiles created by the flows default to private ("This account is private." for a stranger). Expected under the current visibility default; noted because every 05 profile screenshot shows it.
- The Apple sign-up path (`upgradeAnonymousWithApple`, `linkIdentity`) was not re-checked for the stale `is_anonymous` claim; the OAuth callback usually issues a new session, but it is worth one manual check on a device.

## 06 Words and small fixes

Branch `feat/build90`. Code in `66765c0f` (server deployed from it: `backend/deploy-sha.txt` = `66765c0f…`, `railway up --service grit-backend`, `/api/health` → `{"ok":true,"commit":"66765c0"}` before any flow ran) plus the follow-up commit below with the two things the flows found. No Railway or Supabase setting changed. SQL for 06.4 is in `docs/sql/build90.sql` lines 76–104 and was not run; the chunk passes without it (the app copy is unchanged by that row). Unit tests: `lib/build90-words.test.ts` (29) plus updates in `lib/simple-log.test.ts`, `lib/secured-day.test.ts`, `lib/tab-bar-inset.test.ts`, `lib/counter-log.test.ts`, `lib/add-task-draft.test.ts`, `lib/safe-area-status-bar.test.ts`. Run against the pre-fix source (`git stash` of the source files, the tests kept): 5 failed suites / 5 failed tests (`/tmp/b90-06-before-a.txt`, `/tmp/b90-06-before-b.txt`); after: all pass.

### 06.1 Definitions where the thing happens

Root cause: the words were asserted, never explained. `SecuredDayScreen` said "Day 1 secured." and a method line; `AskStep` opened with "Self-reported."; the Join sheet showed a bare `Chip` "Strict"/"Standard"; a freeze earned on Day secured said only "You earned a freeze." (`freezeEarnedNote`). Nothing said what any of them meant, which is why 14 of 38 testers read "secured" as encryption.

Fix:
- **Day secured** — `lib/secured-day.ts` `SECURED_MEANS = "Every task today is done. Your streak goes up by one."`, rendered under the title in `components/task-v2/SecuredDayScreen.tsx` every time (the screen is the moment it happens). Screenshot `build90-06-def-secured.png`.
- **Freeze** — `lib/freeze-earn.ts` `FREEZE_MEANS = "It covers one missed day so your streak holds."`; `freezeEarnedNote(result, firstTime)` appends it the first time one is earned. `app/task/secured.tsx` reads the first-time flag from `useFirstConcept("freeze")`. The first *use* is covered by 06.7's result line, which also carries the definition on the harness screenshot `build90-06-freeze-result.png`.
- **First self-reported task** — `lib/simple-log.ts` `SELF_REPORT_FIRST = "You're telling us you did it. No photo needed."`; `askHonestyLine(first)` returns it when `useFirstConcept("self")` says this phone has not seen it, otherwise "Self-reported." (`components/task-v2/steps/AskStep.tsx`, `testID="ask-honesty"`). Screenshot `build90-06-def-self.png`.
- **Strict on the Join sheet** — `lib/challenge-detail-mapping.ts` `MODE_STRICT_JOIN = "Miss a day and the streak resets."`, `MODE_STANDARD_JOIN = "A freeze can cover a missed day."`, `joinModeLine(difficulty)`; `components/discover/ChallengePreviewSheet.tsx` renders `item.modeLine` under the chip (`testID="join-mode-line"`), set in all three `setPreview` sites in `DiscoverV3.tsx`. The stored value stays `hard`; only the label reads Strict. The seeded catalog is all Standard, so the flow screenshot `build90-06-def-join-mode.png` shows the Standard line; the Strict line is asserted in the unit test.
- `lib/concept-seen.ts` (new) owns the one-time flags: same AsyncStorage key and JSON array Home already used (`griit.concept.seen`), so a definition shown on a task screen is not repeated by Home and vice versa. `useFirstConcept(kind, enabled)` returns `null` until read, then `true` once and marks it.

### 06.2 "Self-reported" at most once per screen

Root cause: on a self-reported Day secured, `SecuredDayScreen` printed it three times: the caption (`securedDayCaption` → "1 task. Self-reported."), the sticker preview (the shared image says it, by design), and a tag on the challenge row (`selfTag`). `AskStep` printed it twice: the honesty line and the footer caption (`SIMPLE_ASK_CAPTION`, the same string). The Join sheet row for a builtin printed "Walk 7,000 steps · Self-reported · Self-reported": `DiscoverV3.openBuiltin` joined `featuredProofLabel(proof)` ("Self-reported" for no photo) with `item.rule` (`gateLabel`, also "Self-reported" when there is no gate).

Fix: the Day secured row keeps the glyph and the challenge line (the word stays in its accessibility label); the caption drops the method when the day is all self-reported ("1 task.") because the sticker under it already says it; `formatSecuredStateLine(day, false)` → "Day n." (the pill beside it says the method). `askFooterCaption(caption)` returns `null` when the footer would repeat the honesty line, and the second `SELF_REPORT_RECORDS_ROWS` row now reads "Your challenge shows it without a photo". `featuredTaskGate(item)` in `lib/featured-catalog.ts` de-duplicates the proof word and the rule. Found by the flow: the Join sheet case was not in the item list; it showed up in the first run's hierarchy.

### 06.3 Greeting

Root cause: `lib/greeting.ts` `greetingName` fell from the display name to `@${username}` and then to "there"; a guest's username is the server-minted `user_` + 8 hex (`backend/lib/guest-username.ts`), so guests and anyone who never chose a handle were greeted "Good morning, @user_a4cebe53".

Fix: `isMachineHandle()` (`/^@?user_[0-9a-f]{8}$/i`) skips that handle; `greetingName(displayName, username, firstName)` goes display name → @username → first name (`firstNameFromAuth(user)` reads `given_name`/`first_name`/`full_name`/`name` from the auth metadata); with nothing usable it returns `null` and `greeting()` stands alone ("Good morning"). `app/(tabs)/index.tsx` passes `firstNameFromAuth(user)`. Flow: `assertNotVisible "Good …, @user_.*"` on a fresh guest's Home, `build90-06-greeting-guest.png`.

### 06.4 Copy fixes

- "Workout everyday" is seeded content (`challenges.title`/`description`, `challenge_tasks.title`), not app copy. SQL written to `docs/sql/build90.sql` (chunk 06, item 06.4): a read-only select, the two `regexp_replace(... '\meveryday\M', 'every day', 'gi')` updates, and a confirm select. Not run.
- Feed hint behind the tab bar. Root cause: `lib/tab-bar-inset.ts` `tabBarContentPad()` ignored its inset argument and returned a fixed 96, while the tab bar dock sits on `max(insets.bottom, 12)` under a 64pt pill, so on a phone with a 34pt home indicator the pill's top edge is 98pt up and the last line ("Everyone is on until you follow 3 people.") sat behind it. Now `max(96, 64 + max(inset, 12) + 16)` → 114 with the indicator, 96 without (`lib/tab-bar-inset.test.ts`).

### 06.5 Password label focuses the field

Root cause: `components/ds/TextField.tsx` rendered the label as a plain `Text` above the input; a finger on "Password" (the obvious target) did nothing. Fix: the label gets `onPress` → `inputRef.current?.focus()` (only while `editable`), with `useImperativeHandle` so the parent's `ref` (login's `passwordRef`) still reaches the `TextInput`. Flow: the sign-in block taps the "Password" *label* (`index: 0`) and types; the login succeeds, which it cannot if the field did not focus (`build90-06-password-label.png`).

### 06.6 Guest "Save your streak" loop, and the sheet over Day secured

Root cause (two parts): (1) `components/home/SaveStreakSheet.tsx` is a full-screen `Modal` with no safe-area padding, so `AccountScreen`'s "Go back" chevron sat under the status bar (y 8–52 on a notch phone), and with `FLAGS.STARTER_TASK_ENABLED` on, `AccountScreen` hid its own "Later" link (`skip = null`), so the only way out was the unreachable chevron. (2) Home stays mounted under a pushed route; `visible={shouldShowSaveStreak(...)}` became true the moment the first task finished, so the Modal opened on top of `/task/secured` ("Save your streak" over Day secured), and dismissing it from there went Account → Go back → Account because the condition was still true.

Fix: the sheet pads `insets.top`/`insets.bottom` and passes `alwaysOfferSkip` so "Later" is always there (`AccountScreen` prop; the onboarding instance keeps the starter behaviour). Home tracks `homeFocused` with `useFocusEffect` and shows the sheet only while Home is the top screen, and only once the stored "Later" flags are read (`saveDismissed` starts `null`), so a cold start cannot flash it. Flow: on Day secured `assertNotVisible "Save your (streak|challenge)."`; after Done, Home shows the sheet with "Later" (`build90-06-save-sheet.png`, chevron at y 59); Later → Home with "1 of 1 done" and no sheet (`build90-06-save-later-home.png`).

### 06.7 Freeze feedback

Root cause: `useFreeze.onSuccess` on Home set a banner only the first time (`conceptOnceLine`), otherwise nothing changed on screen except the week strip, so "Use a freeze" looked like it did nothing. Errors already surfaced through `inlineServerError` in the sheet.

Fix: `lib/copy.ts` `FREEZE.result(streak, left)` → "Freeze used. Yesterday is held and your streak is N. K freeze(s) left." shown every time (prefixed by the one-time definition when applicable). The confirmation (`FreezeSheet`, heading "Use a freeze on yesterday?", body `FREEZE_LINE`) and the no-freezes case ("No freezes left. Your streak resets to 0 at midnight.") were already there. A fresh is_test account cannot have a missed yesterday, so the Maestro proof uses the dev harness `app/dev/build81.tsx` (file outside the list; it now mounts the real `FreezeSheet` and prints `FREEZE_MEANS + FREEZE.result(3, 0)` on confirm, and has a "No freezes" state): `build90-06-freeze-confirm.png`, `build90-06-freeze-result.png`, `build90-06-freeze-none.png`. The live mutation path is unchanged and covered by `lib/freeze-sheet.test.ts` / `lib/freeze-earn.test.ts`.

### 06.8 Create step 1

Root cause: (1) `CreateWizardV2.handlePrimary` closed over `state`; a second tap that landed after the re-render saw `step: 2`, and with a pack already selected `canAdvanceStep2` was true, so a double tap went 1 → 3 (Hugo's run on Oct 14 ended on "Start the challenge" after a double tap). (2) `onTitleFocus` scrolled the list to the *Category* block (`categoryY - 8`), which pushed the title field above the top edge while the person was typing in it: "the field fought him". The `TextInput` itself has no sanitiser or `maxLength`; emoji were never dropped (the Oct 14 "emoji" steps were the agent's keyboard, not the field).

Fix: `lib/create-step-advance.ts` (new) `nextStepAfterPrimary(prev, can)` computes the step from the previous state and `pressIsEcho(last, now)` drops a second press inside 600 ms; `handlePrimary` uses both. Focus scrolls to the title block's own `y` (`onTitleLayout`). Flow: types "Gym before work 😂" (shows "18/60", `build90-06-create-title.png`), `doubleTapOn "Continue"` → "Step 2 of 3", not "How strict?" (`build90-06-create-double-tap.png`).

### 06.9 App Review login persists

Root cause: there is no review-specific login code; the review account is an ordinary email account, and two generic paths could drop it on a reopen. (1) `lib/trpc.ts`: any 401 with a stored session called `supabase.auth.signOut()` at once. After a day away the stored access token is stale; `getSession()` refreshes it lazily, and if that refresh had not completed (slow link, or a transient auth error) the first API call got a 401 and the app signed the person out and cleared onboarding storage. (2) `lib/check-profile.ts` `fetchProfile` returned `data` and ignored `error`, so a failed read (offline, 5xx) became `null` → "no profile" → `onboardingCompleted: false` → `resolveOnboardingLaunch` → onboarding, which looks exactly like being logged out.

Fix: `handleUnauthorized()` in `lib/trpc.ts` refreshes once and signs out only when `refreshVerdictAfter401()` (`lib/auth-expiry.ts`) says the auth server rejected the refresh (4xx or `AuthSessionMissingError`); a network failure (`AuthRetryableFetchError`, 5xx, thrown) keeps the session and the next call retries. `classifyProfileFetch()` treats any error other than PostgREST `PGRST116` (no row) as unknown, which routes through the existing retry + local completed-cache path instead of onboarding. Flow: sign in, `stopApp`, `launchApp` without `clearState` twice → Home with the greeting, no "I already have an account", no "Log in to GRIIT"; Profile → Settings has no "You're using GRIIT as a guest" (`build90-06-relaunch-signed-in.png`, `build90-06-relaunch-profile.png`).

### The five bugs from the chunk instruction

- **Guest "Save your challenge" sheet over Day secured can't be dismissed** — see 06.6.
- **Day secured task row behind the Done button** — `SecuredDayScreen`'s footer was a relatively positioned `View` with `bottom: DS_V3.space.gutter`, which slid it 16pt up over the last row of the scroll content (the sticker preview is 302pt tall, so the row is the part that was under it). The footer is in flow now, the list gets `paddingBottom: section`, and the row scrolls fully above Done (`build90-06-secured-row.png`).
- **Water "oz" in the app, "cups" on the server** — client `lib/counter-log.ts` `counterUnitFromTaskType("water")` returned "oz" and `lib/add-task-draft.ts` seeded the Water preset with "oz", while `lib/counter-ready-gates.ts` and the server's secured meta (`backend/trpc/routes/checkins.ts`) said "cups" and `backend/lib/challenge-tasks.ts` stores `target_kind: "glasses"`. One word now: `WATER_UNIT = "cups"` on the client; the server reads the task's own `config.unit`, then `unit_label`, then the same defaults as the app (water → cups). A task's own unit still wins everywhere (`counterDisplayUnit`). Server change → the deploy above.
- **Double top padding on task steps** — `bb774608` put `app/task/complete.tsx` on `Screen` (all edges, 59pt top), but the steps that own their chrome (`CountStep`, `RunningStep`, `LogStep`, `TimerEntryStep`, `WriteStep`, `CaptureStep`) and `FinishMomentV3` still added `paddingTop: insets.top` themselves, so those screens had 118pt above the header while `TaskChrome` steps had 59. The route owns the inset now; the per-step `insets.top` and the `max(insets.bottom, gutter)` footers are gone (footers keep a 16pt floor; the route adds the home-indicator inset), and `FinishMomentV3` no longer mounts its own `ScreenChrome` band (it would have covered the first 59pt of content once the inset moved). `lib/safe-area-status-bar.test.ts` was updated to the new owner (it encoded the pre-`bb774608` layout). `build90-06-def-self.png` shows a single inset on the ask step.
- **ConfirmDialog backdrop covers the whole screen** — `components/shared/ConfirmDialog.tsx` painted the backdrop `Pressable` with `StyleSheet.absoluteFill` *and* gave the wrapper an opaque canvas background. It is a 60% ink scrim now, like `components/ds/Sheet.tsx`; the screen stays visible behind the dialog.

### Files outside the item list

`lib/concept-seen.ts`, `lib/create-step-advance.ts` (new pure helpers), `lib/trpc.ts`, `lib/auth-expiry.ts`, `lib/check-profile.ts` (06.9 lives in the generic auth path), `lib/tab-bar-inset.ts` (06.4 feed hint), `lib/featured-catalog.ts` (06.2 Join sheet row), `lib/counter-log.ts`, `lib/counter-ready-gates.ts`, `lib/add-task-draft.ts`, `backend/trpc/routes/checkins.ts` (water), `app/task/secured.tsx`, `components/task-v2/FinishMomentV3.tsx`, `components/task-v2/steps/*` (padding), `components/shared/ConfirmDialog.tsx`, `components/home/SaveStreakSheet.tsx`, `components/onboarding/v2/screens/AccountScreen.tsx` (06.6), `app/dev/build81.tsx` (06.7 harness), `.maestro/build90-words-guest.yaml`, `.maestro/build90-words-account.yaml`.

### Gates

- Each definition shows at the right moment: `build90-06-def-secured.png` (Day secured), `build90-06-def-self.png` (first self-reported ask), `build90-06-def-join-mode.png` (Join sheet mode line), `build90-06-freeze-result.png` (freeze, first time, on the harness).
- No screen shows "Self-reported" twice: Day secured `build90-06-secured-row.png` (once, on the sticker), ask step `build90-06-def-self.png` (the definition replaces it on the first run; later runs show it once), Join sheet flow asserts `assertNotVisible ".*Self-reported · Self-reported.*"`.
- Greeting never shows a machine name: `assertNotVisible "Good …, @user_.*"` in `build90-words-guest` (`build90-06-greeting-guest.png`, `build90-06-save-later-home.png`); unit tests in `lib/build90-words.test.ts`.
- 06.5–06.9 each have a passing Maestro flow: `build90-words-account.yaml` (06.5 label tap sign-in, 06.7 harness, 06.8 create, 06.9 two relaunches) exit 0, run `2026-10-17_023757`; `build90-words-guest.yaml` (06.1, 06.2, 06.3, 06.6) exit 0, run `2026-10-17_024412`.
- Chunk 01–05 tests still pass: full `npx vitest run` 1805 passed, the same 4 baseline failures in 3 files (`challenge-detail-mapping` ×2, `featured-catalog-seed` needs pglite, `join-challenge-error`). Maestro on this build, all exit 0 (06:45–07:02 UTC): `build90-timer-early`, `build90-empty-starter`, `build90-first-day`, `build90-join-suggest`, `build90-task-inputs`, `build90-post-choice`, `build90-post-detail`, `build90-done-count`, `build90-links`, `build90-links-people` (A + B pair, `2026-10-17_030049`). Two harness stalls on the way, not app failures: the camera permission dialog left by `build90-join-suggest` sat over the next launch (dismissed with the Allow helper, as in chunk 05), and one `build90-links-people` run was started without `MAESTRO_EMAIL_B` (the field read "undefined"); rerun as the pair.
- `npx tsc --noEmit`: the same 5 baseline errors (4 in `lib/featured-catalog-seed.test.ts`, 1 in `lib/share.ts`). 0 new.
- PROGRESS.md updated, committed, pushed: see the commits.

### Needs Yaseen

- `docs/sql/build90.sql` lines 76–104 (06.4 "Workout everyday" → "Workout every day"): review and run.
- The Day secured screen is taller than an iPhone 16 viewport (302pt sticker preview); the challenge row is above Done but needs one scroll to see. Shrinking the preview is a design call.
- 06.7's live path (a real missed yesterday with a freeze in hand) was not exercised on a device tonight; the copy and the sheet are proven on the harness, the mutation path is unchanged.
- 06.9 is a fix for the two reopen paths found in code. If the review account was dropped for another reason (for example a password reset or a revoked refresh token on the Supabase side), that would still sign it out, by design.

## 07 Safety

Branch `feat/build90`. Code in `b61ab416` (server deployed from it: `backend/deploy-sha.txt` = `b61ab416…`, `railway up --service grit-backend`, `/api/health` → `{"ok":true,"commit":"b61ab41"}` before any flow ran) plus the follow-up commit below (flow, screenshots, visible comment count, this section). No Railway or Supabase setting changed. No SQL this chunk. Unit tests: `backend/lib/content-moderation.test.ts` (+116: normalizer, 50 dodges, 56 clean words, field messages), `backend/trpc/routes/safety-fields.test.ts` (17: one per field + the comment report + the reporter-side hide), `backend/trpc/routes/journal-private.test.ts` (6), `lib/build90-safety.test.ts` (10), `lib/post-detail.test.ts` (+3 assertions). Against the pre-fix source: 53 failed in the first three files (`/tmp/b90-07-before.txt`); the journal file passed before as well (07.4 is a verification item: it pins what is true today). After: all pass; full `npx vitest run` 1953 passed with the same 4 baseline failures in 3 files.

### 07.1 Moderate every public text field server-side

Root cause: moderation was applied field by field as each one came up, so coverage had holes. Checked: `profiles.update` ran `blockedPlainText` on `display_name` and `bio` only, never `username`; `profiles.create` (used by the legacy `/create-profile` screen through a *direct Supabase upsert*, so no server code at all) and `user.completeOnboarding` (username and display name from onboarding) ran nothing; `challenges.create` moderated title+description together and task titles, but not the per-task `journalPrompt` (shown to every joiner on the Write step), `locationName` or `routineAnchorCustom`; `feed.comment` and `feed.shareCompletion` were covered. Every rejection used the same generic `BLOCKED_TEXT` ("That isn't allowed. Try different words."), so the client could not say which field, and two of the clients did not show the message at all: `CreateWizardV2` stored `launchError` but `StepReview` rendered a fixed "Check your connection and try again."; `CommentsSheet` and the post thread only `captureError`'d a rejected comment, so the composer kept the text with no explanation. Invite messages: there is no free-text invite in the product (`groups.invite` has no message; `groups.nudge` sends one of three fixed lines by `messageKey`), so nothing to moderate there.

Fix:
- `lib/blocked-text.ts` (new, no imports, shared by server and client): `blockedTextFor(field)` → "Those words aren't allowed in a {field}. Try different ones." for username, display name, bio, challenge title, challenge description, task title, journal prompt, location name, routine, caption, comment; `blockedFieldFromMessage()` reads it back; the generic `BLOCKED_TEXT` stays for callers that name no field.
- Server, each before any write: `profiles.update` now checks `username` as well; `profiles.create` checks username, display name, bio; `user.completeOnboarding` checks username and display name; `challenges.create` checks title, description, every task title, `journalPrompt`, `locationName`, `routineAnchorCustom` one by one (then the existing combined category checks); `feed.comment` and `feed.shareCompletion` name their field (caption check moved ahead of the service-client check so it is the first thing that can fail).
- Client: `app/create-profile.tsx` saves through `trpcMutate(TRPC.profiles.create, …)` (the direct upsert is gone; its `formError` line shows the message). `StepReview` renders `launchErrorCopy(launchError)` (`lib/create-review.ts`): a blocked-field message is shown in the server's words with a "Change the words" button that opens step 1 (title/description) or step 2 (task fields); other server sentences (quality rules, free limit) are shown as they are; transport failures keep "Check your connection and try again." `CommentsSheet` and the post thread keep the draft and show the message under the composer (`sendError`, cleared on the next keystroke). Edit profile and the onboarding Profile screen already showed `err.message` inline.
- Flow `build90-safety.yaml`: "sh1t post" → "Those words aren't allowed in a comment. Try different ones." under the field with the draft kept (`build90-07-comment-blocked.png`); "well done" posts (`build90-07-comment-clean.png`); bio "f u c k this" on Edit profile → "…in a bio…" (`build90-07-bio-blocked.png`). Both messages came from the deployed server.

### 07.2 Harder to dodge

Root cause: `normalize()` in `backend/lib/content-moderation.ts` lowercased and stripped non-alphanumerics, then matched `\bword\b`. So "sh1t", "f u c k", "fúck", "fu\u200Bck", "shiiiit", "a$$" and "b.i.t.c.h" all passed, and because the strip removed separators *inside* a token, "f.u.c.k" became "fuck" by accident but "f u c k" stayed four letters.

Fix: `normalizeForMatch()` — NFKD and strip combining marks (accents), strip zero-width and soft-hyphen characters, lowercase, leetspeak map (0→o 1→i 3→e 4→a 5→s @→a $→s), join runs of single letters separated by one or two non-alphanumerics ("f u c k", "s.h.i.t", "s_h_i_t"; done before the collapse so "f u u u c k" works), collapse 3+ repeated letters to one ("shiiit" → "shit", "ass" and "class" untouched), then every other non-alphanumeric run becomes a word break. `blockedWord()` matches whole tokens only, so "class", "assess", "Scunthorpe", "cocktail", "cockpit", "shiitake", "Dickens", "cla55", "a55ist", "7000 steps", "Gym before work 😂", "Zoë's plan" pass. `blockedPlainText` and `moderateContent`'s profanity branch use it; the low-effort/negative/inappropriate/dangerous phrase lists keep the old normalizer (leet mapping would break "test123"). Tests: 50 dodges blocked, 56 clean words pass (`content-moderation.test.ts`; gate asks for 30 + 30). Known limit, by the whole-word rule the spec asks for: a blocked word glued to another ("fuckyou", "retarded") is not caught.

### 07.3 Report a comment

Root cause: there was no comment report at all. Posts are reported through `reports.reportUser` with the post id in `details`, users through the same route from the profile; a comment had only the author's own long-press delete. Nothing hid a reported post or comment for the reporter either (the feed's "Hide post" is a local state array that resets on reload).

Fix:
- Server `reports.reportComment({ commentId, reason, details? })`: loads the comment, refuses your own ("You can't report your own comment."), 404s a missing one, and inserts a `user_reports` row for the author with `details = "comment:<id> <excerpt>"` (`lib/comment-report.ts` `commentReportDetails`) — the same table and flow as a reported post, so no SQL. `feed.getComments` drops comments whose id appears in the viewer's own `comment:` reports (`reportedCommentIds`, read with the service client because `user_reports` has no select policy; empty without one). `user_reports` is UNIQUE (reporter, reported), so a second report of the same person is "already reported" and its comment id is not stored server-side; the phone's hidden set still covers it.
- Client: long press on someone else's comment (post thread and `CommentsSheet`; your own still offers Delete) → inline bar "Report this comment? · Cancel · Report" (`REPORT_COMMENT_LABEL` "Report comment"). `useReportComment` hides first (`lib/hidden-comments.ts` AsyncStorage set + query cache) then files the report; on failure it un-hides and says "Couldn't send the report. Try again."; on success "Reported. The comment is hidden for you." All three comment readers (`CommentsSheet`, post thread, feed preview rows in `LiveFeedSection`) go through `fetchComments()`, which drops the hidden ids. The post thread's heading now counts the visible list (`visibleCommentCount`; also "1 comment" instead of "1 comments").
- Flow: long press "nice walk" → prompt (`build90-07-report-prompt.png`) → Report → gone at once with the line (`build90-07-report-hidden.png`) → cold relaunch, Activity → the post: still gone (`build90-07-report-relaunch.png`). Server side alone: run `2026-10-17_034234` was a *fresh install* (empty hidden set) signed in as an A who had reported in the previous run; "nice walk" was already absent (`build90-07-report-server-filter.png`). Each A/B pair therefore works once; the flow header says so.

### 07.4 Journal text is private

Root cause (verification item): the Write step and the photo Review caption both send `noteText` to `checkins.complete`, which writes `check_ins.note_text`. That column is read back only by the owner (`checkins.getTodayCheckins`); the shared `activity_events.metadata` built in `checkins.complete` does not carry it, `feed`/`feed-activity-hydrate` read captions from metadata only, and `profiles.getRecord` selects `check_ins` without `note_text`. `checkins.complete` runs no moderation on `noteText`. There was no test pinning any of that, so a later change could leak it or start moderating a private diary.

Fix (tests only, `backend/trpc/routes/journal-private.test.ts`): the Write step and the Review caption both travel as `noteText` (`useTaskFlowV2.ts`); `checkins.ts` imports nothing from `content-moderation`; `noteText` is written to `check_ins.note_text` only and the `activityEventPayload.metadata` block carries neither `note_text`, `noteText` nor `caption`; no `.select(...)` in `feed.ts`, `feed-activity-hydrate.ts` or `profiles-record.ts` names `note_text`; the feed reads a caption from `md.note_text`/`md.caption` (event metadata) and never from `check_ins`; the only read-back is the owner's own check-ins behind `assertActiveChallengeOwnership`. Passed before the chunk and after (nothing to fix; the point is that it now fails if any of those change).

### Files outside the item list

- `backend/lib/backend-import-graph.test.ts`: the allowlist of app-side `lib/` files the backend may load gains `lib/blocked-text.ts` and `lib/comment-report.ts` (both import nothing).
- `lib/trpc-paths.ts`: `reports.reportComment`.
- `lib/post-detail.ts` + test: `visibleCommentCount`, "1 comment".
- `.maestro/build90-links-people.yaml` (chunk 05 flow): its `hideKeyboard` in the comments sheet failed two runs in a row on this build ("Couldn't hide the keyboard", the known Maestro gotcha); replaced by a tap on the sheet heading. Rerun as the A/B pair: exit 0.

### Gates

- Every listed field has a server test that rejects a blocked value before any write, with the field named: `safety-fields.test.ts` (username ×3 routes, display name ×3, bio ×2, challenge title, description, task title, journal prompt, location name, routine, comment, caption). Invite messages: no free-text field exists (`groups.invite` has none; `groups.nudge` takes a `messageKey` 0–2), recorded above.
- 30+ dodges blocked, 30+ clean words pass: 50 / 56 in `content-moderation.test.ts`, each its own test.
- Report a comment works and hides it: `safety-fields.test.ts` ×4 (report row, own comment refused, 404, `getComments` drops it) and the flow above.
- Journal test: `journal-private.test.ts` ×6.
- Chunk 01–06 tests still pass: full `npx vitest run` 1953 passed, the same 4 baseline failures in 3 files (`challenge-detail-mapping` ×2, `featured-catalog-seed` needs pglite, `join-challenge-error`). Maestro on this build and server, all exit 0 (03:50–04:15 UTC): `build90-timer-early`, `build90-empty-starter`, `build90-first-day`, `build90-join-suggest`, `build90-task-inputs`, `build90-post-choice`, `build90-post-detail`, `build90-done-count`, `build90-words-guest`, `build90-words-account`, `build90-links` + `build90-links-people` (pair `b8907ma040840`/`b8907mb040840`), then `build90-safety` on the same pair (`2026-10-17_041319`).
- tsc: `npx tsc --noEmit` has the same 5 baseline errors (4 in `lib/featured-catalog-seed.test.ts`, 1 in `lib/share.ts`), 0 new.
- Backend deployed before the flows, `/api/health` commit `b61ab41`.

### Needs Yaseen

- The spec's stop note ("the backend needs `railway up` before chunk 08") is already satisfied tonight under the standing approval: the server runs `b61ab41`. Nothing further to deploy from this chunk.
- Reports still land in `user_reports` as "a report of this user with the comment in details"; a moderator sees one row per (reporter, reported) pair. If you want per-comment rows and a server-only hide, a `comment_reports` table is the next step (not written: the chunk passes without it).
- Dev-only: the LogBox toast for a refused comment (`captureError` → console) shows in the dev client; not in release.
