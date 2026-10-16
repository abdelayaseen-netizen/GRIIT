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
