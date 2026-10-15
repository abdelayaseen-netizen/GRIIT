# Chunk 01: Speed

**Why:** Yaseen tested build 89 on his phone. Posting a photo and finishing a task both lag badly enough that he wants to stop using the app. This chunk goes first because every later chunk sits on top of it.

**Areas you may touch:**
- `components/task-v2/useTaskFlowV2.ts`
- `components/task-v2/TaskCapture.tsx`
- `lib/uploadProofImage.ts`
- `backend/trpc/routes/checkins.ts`
- `components/home/HomeV3.tsx`, only to consume the optimistic state
- the query or cache helpers that Home reads from

**Budgets:**

| Action | Budget |
|---|---|
| Tap Done until the task shows as done on screen | under 300 ms |
| Server confirms a task (median, phone on LTE) | under 1.5 s |
| Photo post, from tapping Post until the post is visible | under 3 s on LTE |

## 01.1 Measure first (no fixes yet)
- Extend the existing `__DEV__` timing log in `finishSubmit` so it covers every step:
  - photo read
  - upload
  - `completeTask`
  - `attemptSecureDayAfterComplete`
  - `shareProof`
  - Home refetch
- Run 5 photo posts and 5 self-reported finishes on a device or simulator.
- Write a table of the before numbers to `docs/reports/build90.md`.

## 01.2 Shrink photos before upload
- **Known cause:** `TaskCapture.tsx` takes a full-resolution photo (`quality: 0.8`, about 3–4 MB). `uploadPhoto` then reads it as base64 and decodes it in JavaScript (`lib/uploadProofImage.ts`, `base64ToArrayBuffer`).
- **Fix:**
  - resize with `expo-image-manipulator` (already installed) to a 1080 px long edge, JPEG 0.7, aiming for under 400 KB
  - upload the file without the base64 round trip in JavaScript
- **Test:** a vitest test that the resize helper outputs a long edge of 1080 or less; the upload path receives the resized file.

## 01.3 Remove the extra auth call
- **Known cause:** `uploadProofImageFromBase64` calls `supabase.auth.getUser()`, a network request, on every upload.
- **Fix:** use the cached session user.

## 01.4 One server call per finish
- **Known cause:** a finish does `completeTask`, then `attemptSecureDayAfterComplete`, then `shareProof`: three round trips in a row.
- **Fix:**
  - `checkins.complete` also secures the day when the last required task is done
  - it applies the share choice if one was sent
  - it returns everything the finish screen needs
- Keep the old procedures working for older builds.
- **Test:** a backend test showing that one call completes the task and secures the day.

## 01.5 Optimistic UI
- **On Done:**
  - mark the task done locally at once
  - update Home's count and the next-task ring
  - confirm with the server in the background
- **On failure:** roll back and show "Couldn't save. Tap to try again."
- **Photo posts:** appear at once with a "Posting…" state, and a second tap is blocked.
- **Test:** a Maestro flow. Tap Done, then within 1 s Home shows the new count.

## 01.6 Location
- Use `Accuracy.Balanced` with a 5 s timeout.
- Only location-gated tasks may wait on GPS. A normal photo task never waits on it.

## 01.7 Measure again
- Write the after table next to the before table.
- For any budget still missed, name the slow step and why.

## Gates (all must pass before marking PASSED)
- [ ] Before and after timing tables are in the report
- [ ] Done to visible: under 300 ms on every task type tested
- [ ] Photo post: under 3 s median (state device and network)
- [ ] Uploaded photo size: under 400 KB (show 3 samples)
- [ ] Old app builds still complete tasks (the old procedures are untouched or still working)
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] Every new test: failed before, passes now
- [ ] PROGRESS.md updated, committed, pushed
- [ ] If the backend changed: STOP and tell Yaseen it needs `railway up --service grit-backend` before chunk 02. Don't deploy it yourself.
