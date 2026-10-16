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
Test: `lib/build90-posting.test.ts` 04.1 block (sheet constants, `needsPostChoice`, hook / flow / secured wiring, `selfReportedCardMeta`, `createsActivityPost` with audience, `checkins.ts` passes `input.audience`). Maestro `.maestro/build90-post-choice.yaml` (fresh guest): 7K Steps → Done → sheet with "Who sees this", Friends, Everyone, Keep it private; Everyone flips the line; Keep it private → Day 1 secured. Exit 0. Screenshots `docs/reports/build90/build90-04-post-choice.png`, `build90-04-kept-private.png`. Maestro `.maestro/build90-post-detail.yaml` (fresh `is_test` email `b89post175142@example.com`): Post to friends → Home "1 of 1 done", sheet gone. Exit 0. Screenshot `build90-04-posted-home.png`.  
Failed before: yes (4 of 4 tests in the block against `70b747b5`). Passes now: yes.

**04.2** `captureHeaderLine(challenge, dayLine)` and `CAPTURE_PROOF_REQUIRED` ("Photo proof required.") in `lib/proof-capture.ts`. `TaskCapture` takes `dayLine` and prints "7K Steps · Day 2 of 7" with "Photo proof required." under it; `CaptureStep` builds the day line with `homeDayLine(currentDay, durationDays)`; `TaskFlowV2` passes `durationDays`. No library path added or removed: the screen was already camera only.  
Files: `lib/proof-capture.ts`, `components/task-v2/TaskCapture.tsx`, `components/task-v2/steps/CaptureStep.tsx`, `components/task-v2/TaskFlowV2.tsx`.  
Test: `lib/build90-posting.test.ts` 04.2 block (header line with and without a day, the three files wired, `CameraView` present and no `expo-image-picker` / `launchImageLibraryAsync`). No Maestro: the simulator has no camera, so the capture screen shows its "Camera access is off" state and never reaches the header.  
Failed before: yes (header test). Passes now: yes.

**04.3** `app/post/[id]/index.tsx` author block is now `ds/Button` Done (primary, `router.replace(TABS_HOME)`, testID `post-done`), `ds/Button` "Share outside GRIIT" (secondary, opens `ShareStickerSheet` with the post's challenge, day, task, streak and photo, testID `post-share-outside`), and a labeled `ds/SegmentedControl` "Who sees this" over Friends / Everyone / Only me that calls the existing `audienceMutation`. The small audience badge is hidden for the author since the control shows it. The `react-native` `Share` import is gone. Copy in `lib/post-detail.ts`; `postDetailAudience` reads an older post with no stored audience as Friends.  
Files: `app/post/[id]/index.tsx`, `lib/post-detail.ts`.  
Test: `lib/build90-posting.test.ts` 04.3 block (two Buttons with the right variants and testIDs, SegmentedControl with the label, `Share` import gone, `postDetailAudience`). Maestro: not reachable on this build, see Gates.  
Failed before: yes (2 of 2). Passes now: yes.

**04.4** `audienceShowsInScopeForViewer({ audience, scope, viewerId, authorId })` in `lib/post-audience.ts` returns true for the author's own post and falls through to `audienceShowsInScope` for everyone else. `feed.ts` `keepEvent` uses it.  
Files: `lib/post-audience.ts`, `backend/trpc/routes/feed.ts`.  
Test: `lib/build90-posting.test.ts` 04.4 block (own Friends post stays in Everyone, other people's posts keep the scope rule, `feed.ts` calls the viewer-aware function). Maestro: needs the server, see Gates.  
Failed before: yes (3 of 3). Passes now: yes.

**04.5** `shareCardFromToast(toast, username)` in `lib/task-complete-toast.ts` maps the toast to the card: challenge name, task name, `currentDay`, `totalDays`, streak only when ≥ 1, photo and camera seal. The toast now carries `streak` from `complete.streakDays`. `app/(tabs)/_layout.tsx` uses the mapper instead of the title strip.  
Files: `lib/task-complete-toast.ts`, `app/(tabs)/_layout.tsx`, `components/task-v2/useTaskFlowV2.ts`.  
Test: `lib/build90-posting.test.ts` 04.5 block (mapper; painted card says "READ 10 PAGES A DAY", "Day 2", "of 7" and never "Saved" or "1 of 1"; streak 0 left off; layout uses the mapper). Maestro `build90-post-detail.yaml` Share today on the real account: "7K Steps", "Day 1 of 7", "1 day in a row". Screenshots `build90-04-share-streak.png`, `build90-04-share-progress.png`.  
Failed before: yes (4 of 4). Passes now: yes.

**04.6** `lib/share-image.ts`: new style H "Day stamp" (challenge in caps, task, big "Day 2 of 7", seal line). `MOMENT_STYLES` is now `photo_proof` H / E / D / A, `self_reported` H / E / D, `day_secured` E / D, `challenge_finished` F / D, `invite` G. `stylesForMoment(moment, { streak, hasPhoto })` drops E (Streak) when the streak is under 1 and A (Photo) when there is no photo, so a photo task with a streak swipes through four cards and a self-reported task through three. D (Progress) for task moments paints the week dots with "Day 2 of 7" instead of "0 of due days". `copyStickerAvailable` is true for every card and the Copy target is on every page; Instagram Story was never style-bound. `ShareSystemSheet.tsx` drops `SAMPLE_STORY`, the `expo-image` import and the B background; the ViewShot background is transparent. `lib/share-colour.ts` knows H so Ink / Orange / White is remembered per card. The B paint code and `storyUsesSticker` remain in `share-image.ts` but no moment lists B; left in place so the chunk does not touch v44.1 paint it does not need.  
Files: `lib/share-image.ts`, `lib/share-colour.ts`, `components/share/ShareSystemSheet.tsx`, `lib/share-image.test.ts` (old B expectations updated).  
Test: `lib/build90-posting.test.ts` 04.6 block (four cards with streak and photo, Streak hidden at 0, Photo hidden without a photo, no B anywhere, no `SAMPLE_STORY` in the sheet, the four cards paint different strings, Copy sticker on every card). Maestro `build90-post-detail.yaml`: Share today → Streak card, Copy sticker and Instagram Story present with Ink / Orange / White; swipe → Progress card, Copy sticker still there, Orange applies. Exit 0.  
Failed before: yes (5 of 5). Passes now: yes.

Files outside the chunk's list, and why: `app/(tabs)/_layout.tsx` (owns the toast → share sheet handoff, 04.5), `backend/trpc/routes/checkins.ts` (one line so a self-reported task can post, 04.1), `lib/task-secured-nav.ts` and `app/task/secured.tsx` (no second share offer after the sheet, 04.1), `lib/feed-card-family.ts` and `components/feed/FeedPostV3.tsx` (the text card's streak, 04.1), `lib/post-audience.ts` (shared client / server rule, 04.1 and 04.4), `lib/task-complete-toast.ts` (04.5), `lib/proof-capture.ts` (pure helpers so 04.2 is unit-testable), `lib/share-colour.ts` (04.6), `lib/share-image.test.ts` (its B expectations contradicted 04.6).

### Gates

- Every task type ends with the sheet and lands on today's tasks or Day secured: `submitWithoutPhoto` is the one exit for timer, journal, counter, run, workout, Did it and check-in payloads (asserted in the test); Maestro `build90-post-choice` Keep it private → Day 1 secured, `build90-post-detail` Post to friends → Home "1 of 1 done". Exit 0 both. On this build the Post branch ends on Home with the day secured rather than on the post, because the deployed server (`70b747b5` is not on Railway) still returns no post id for a self-reported task; the client's "Saved. The post did not go out." lands on a task screen the optimistic return already closed, so what the user sees is Home with the day secured. With the chunk 04 server it goes Day secured → post → Done.
- The Proof screen's Done works: unit-tested wiring (`post-done` → `TABS_HOME`). Not shown in Maestro: a self-reported post needs the new server, and a photo post needs a camera the simulator does not have.
- Own post in both feeds: unit-tested rule and `feed.ts` wiring. Not shown live for the same reason (server not deployed in this chunk).
- Share card correct, screenshots: `docs/reports/build90/build90-04-share-streak.png` ("7K Steps", "1 day in a row", real date and handle), `build90-04-share-progress.png` ("7K STEPS", "Day 1 of 7", Orange). The toast path is covered by the painted-string test.
- 4 sticker cards, no stock photo, copy works: `stylesForMoment("photo_proof", { streak: 3, hasPhoto: true })` → H / E / D / A; `SAMPLE_STORY` gone; Copy sticker visible on both cards in the Maestro run. The copy action itself (`copyStickerPngToPasteboard`) is unchanged from v44.1.
- Chunk 01–03 tests pass: full `npx vitest run` 1747 passed, the same 3 baseline failures as `34ef5003` (`challenge-detail-mapping`, `featured-catalog-seed` needs pglite, `join-challenge-error`). `lib/build90-posting.test.ts` 23/23, `lib/share-image.test.ts` 5/5.
- `npx tsc --noEmit`: 5 errors, the same baseline as a375b25a (4 in `lib/featured-catalog-seed.test.ts`, 1 in `lib/share.ts`). 0 new.
- eslint on touched files: 0 errors; 3 warnings, all present before this chunk (`comments` useMemo in `post/[id]`, `card.username` dep in `ShareSystemSheet`, `TaskCompleteToast` redeclare).
- No deploy, no Railway or Supabase change, no SQL written this chunk.

### Needs Yaseen

- Deploy: 04.1 (`checkins.ts` audience on self-reported posts), 04.4 (`feed.ts` own-post rule) and the 03.3 follow-up (one-letter words) are server changes and this chunk does not deploy. Until `railway up`, a self-reported Post to friends saves the task but no post is created (the client says nothing wrong; it ends on Home as Keep it private does), and a Friends post still drops out of your own Everyone feed.
- Pre-existing, not changed: the guest "Save your challenge" sheet (`components/home/SaveStreakSheet.tsx`) opens over Day secured after a guest's first task, and its back chevron sits under the status bar (no top inset inside the Modal), so it cannot be dismissed by tap; the flows use an email account to get past it. On Day secured the task row sits behind the Done button (`app/task/secured.tsx`, see `build90-04-kept-private.png`). `storyUsesSticker` is still B-only, so Instagram Story sends every card as a background image, not a sticker.
- Maestro flows that post need `MAESTRO_EMAIL=b89…@example.com` (the `is_test` pattern is `^b8\d.*@example\.com`); accounts created this chunk: `b89post174553`, `b89post174717`, `b89post175001`, `b89post175142` at `@example.com`.
- Same 3 baseline failing tests as chunk 03.
