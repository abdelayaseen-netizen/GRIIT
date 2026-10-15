# Build 90

## 01 Speed

### 01.1 Measure first

Root cause: `components/task-v2/useTaskFlowV2.ts` `finishSubmit` only logged `completeMs` and `secureMs`. Photo read, upload, `shareProof`, and the Home refetch were not timed.

The log now prints `photoReadMs`, `uploadMs`, `completeMs`, `secureMs`, `shareMs`, `homeRefetchMs`, and `totalMs` from `[finishSubmit] timing`.

Before numbers were not collected. No simulator was booted, and this session had no phone run. Inventing those times would be false.

| Step | Before (5 photo / 5 self-report) |
|---|---|
| photo read | not measured |
| upload | not measured |
| completeTask | not measured |
| secure day | not measured |
| shareProof | not measured |
| Home refetch | not measured |
| total | not measured |

Device / network: none. Blocker: no booted simulator and no device session.

### 01.2 Shrink photos before upload

Root cause: `components/task-v2/TaskCapture.tsx` line 58 takes the photo at `quality: 0.8` (full sensor size). `uploadPhoto` then read it as base64, and `lib/uploadProofImage.ts` `base64ToArrayBuffer` decoded that string in JavaScript.

Fix: `lib/proof-resize.ts` `proofLongEdgeSize` caps the long edge at 1080. `shrinkProofForUpload` re-encodes JPEG at 0.7. `uploadProofImageFromFile` reads the resized file with `fetch` / `arrayBuffer` and uploads that buffer. The task flow no longer calls `readAsStringAsync` or `uploadProofImageFromBase64`.

Files: `lib/proof-resize.ts`, `lib/uploadProofImage.ts`, `components/task-v2/useTaskFlowV2.ts`.

Test: `lib/proof-resize.test.ts` `outputs a long edge of 1080 or less`, `uploads the resized file, not the original`. `lib/build90-speed.test.ts` `resizes then uploads the file, and uses the cached session`.

Failed before: yes (`shrinkProofForUpload` missing). Passes now: yes.

Local resize samples (sips, long edge 1080, JPEG quality 70). These are not uploads from the app:

| Sample | Size |
|---|---|
| flat 2400×1800 | 14.6 KB |
| gradient 1800×2400 | 45.3 KB |
| high-frequency 2000×1500 | 629.4 KB |

The high-frequency sample is synthetic noise, not a camera photo. JPEG 0.7 is what the chunk asked for. A real upload sample was not taken.

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

No SQL. Do not deploy from this chunk. Yaseen needs `railway up --service grit-backend` before chunk 02, or the new app keeps using the old follow-up calls.

### 01.5 Optimistic UI

Root cause: Home's count and rings come from `bootstrap.data.todayCheckinsForUser`. `finishSubmit` waited for the server before leaving for Home. A second Post tap was only blocked after the upload had already started.

Fix: `markOptimisticTaskDone` runs before the server call, and Home merges that row into today's check-ins, so the count and the next open ring update immediately. `returnToOrigin` runs before `completeTask`. On failure, `rollbackOptimisticTaskDone` and Home shows "Couldn't save. Tap to try again." (`testID` `home-save-retry`). A photo post is published with caption "Posting…" before the upload, and `submitPhoto` sets `submitInFlight` before `uploadPhoto`.

Files: `lib/optimistic-home.ts`, `lib/optimistic-feed.ts`, `components/home/HomeV3.tsx`, `app/(tabs)/index.tsx` (Home reads the check-ins here), `components/task-v2/useTaskFlowV2.ts`, `components/task-v2/steps/ReviewStep.tsx` (the review line is the Posting state on that screen).

Test: `lib/optimistic-home.test.ts`. Maestro flow `.maestro/build90-done-count.yaml` (tap Done, then `1 of .* done` within 1 second). The flow was not run: no booted simulator.

Failed before: yes (`markOptimisticTaskDone` and `home-save-retry` missing). Unit tests pass now. Maestro: not run.

### 01.6 Location

Root cause: `finishSubmit` used `Location.Accuracy.High` with no timeout.

Fix: `finishWaitsOnLocation` is false for a normal photo, timer, journal, or self-report. Location-gated tasks use `Accuracy.Balanced` and `LOCATION_FIX_TIMEOUT_MS` (5000).

Files: `lib/finish-location.ts`, `components/task-v2/useTaskFlowV2.ts`.

Test: `lib/finish-location.test.ts`. Failed before: the wiring test expected `finishWaitsOnLocation` and did not find it. Passes now: yes.

### 01.7 Measure again

After numbers were not collected on a device or simulator. Same blocker as 01.1.

| Step | After |
|---|---|
| photo read | not measured |
| upload | not measured |
| completeTask | not measured (secure and share run inside this call when the new server is deployed) |
| secure day | not measured; skipped on the client when `daySecure` is present |
| shareProof | not measured; skipped when `shared` is true |
| Home refetch | not measured; it runs after Home is already showing the optimistic row |
| Done to visible | not measured; the code calls `returnToOrigin` before `await completeTask` |
| Photo post visible | not measured; the feed card is published with "Posting…" before the upload |

Budgets still needing a phone or simulator: Done to visible under 300 ms, photo post under 3 s median, uploaded photo under 400 KB.

### Gates

- Before and after timing tables: written, with no device numbers. Not passed.
- Done to visible under 300 ms: not measured.
- Photo post under 3 s: not measured.
- Uploaded photo under 400 KB: not measured. Local sips samples above.
- Old procedures: `secureDay` and `shareProof` are still procedures. `checkins-secure-day.test.ts` passed.
- `npx tsc --noEmit`: 6 errors, all in files this chunk did not change (`app/profile/day.tsx`, `lib/featured-catalog-seed.test.ts`, `lib/share.ts`). None in the speed files.
- New tests: `lib/build90-speed.test.ts` failed 5/5 before the fix (`/tmp/build90-speed-before.txt`, 5 failed). After: that file passed, plus `proof-resize`, `finish-location`, `optimistic-home`, `finish-bundle`.
- Maestro `build90-done-count`: not run.

### Needs Yaseen

- Boot a simulator or use the phone. Run 5 photo posts and 5 self-report finishes. Fill the before table only if a build without this chunk is still installed; otherwise the after table is the one that can still be measured.
- Run `.maestro/build90-done-count.yaml` with `JAVA_HOME=/opt/homebrew/opt/openjdk` and a fresh `is_test` account.
- `railway up --service grit-backend` before chunk 02. This chunk did not deploy.
