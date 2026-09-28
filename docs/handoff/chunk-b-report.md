# Chunk B — Finish moment through STOP B2

Branch `feat/chunk-b-finish` off `f6b21a2` (main after chunk A #104). Never committed to main.

Specs: `design/handoff/cursor/02_screens.md:5340` (frame 114). Source: `design/handoff/src/components/v41/FinishMoment.tsx`.

Binding: Standard copy stays the gate-copy line already on main. FinishMoment’s table has no Standard line; this slice does not add “Every gate blocks.” Dismissal is never a decision. `shared` flips only after an explicit Share and a successful save.

B3 (standalone text share card) and B4 (v37 stickers) wait. Do not start onboarding, v38, EAS, Railway, or RevenueCat.

---

## Done

### B0 — batch shared-path lookup

`loadSharedPathsForCandidates` slices candidates into batches of 10 and unions via `sharedPathsFromLoadedRows`.

- `SHARED_PATH_BATCH = 10` — `backend/lib/proof-image.ts:12`
- Batch loop — `backend/lib/proof-image.ts:172`
- Test: `35 candidates produce 4 queries, and the results are merged` — `backend/lib/proof-image.test.ts:158`
- Existing “row 801 / URL form” test kept

Commit: `7f27139ddf947277a93ea3aba56dbd814ea4db3b`  
`fix(proofs): query shared paths in batches of 10`

Only commit on this branch that touches `backend/`.

### B1 — `shareChoicePending: true` for every task type

`useTaskFlowV2` always sends the flag on complete. It is no longer gated on camera.

- `shareChoicePending: true` — `components/task-v2/useTaskFlowV2.ts:421`
- Test: `sends shareChoicePending on every complete and flips via shareProof` — `lib/proof-moment.test.ts:61`  
  asserts `shareChoicePending: true` and `not.toContain("hasCameraProof ? { shareChoicePending")`

Commit: `37973734074b41d9740c82b5509c28b61294b018`  
`fix(checkins): send shareChoicePending for every task type`

Did not ship without B2 (same branch / upcoming PR).

### B2 — Finish moment, no blocking wait

#### Pure reducer

`lib/finish-moment.ts` (no I/O):

- `SaveState` `saving | slow | saved | failed`
- `ShareIntent` `none | feed_held`
- `FINISH_SLOW_MS = 3000` — `:16`
- `finishSaveFromElapsed` — `:83`
- `finishAfterMutation` → `failed | saved | secured_nav` from `finishSubmitOutcome` + server `securedToday` — `:90`
- `resolveHeldShare` → `call_share | drop | keep_held` — `:110`
- `enrollmentDueToday` — Home skip `startDateKey > todayKey` — `:40`
- `alsoTodayFromTasks` — undone, exclude current, `gateLine` — `:49`

Branch uses `serverSecuredToday` (`lib/day-open.ts:34`) / `finishSubmitOutcome` (`lib/task-flow-state.ts:265`) from complete + `secureDay` server fields. Never a client task count.

#### Immediate navigate

On I did it, `setStep("finish")` with `save: "saving"` at `useTaskFlowV2.ts:404` **before** `await completeTask` (`:417`). 3 s timer → `slow` (`:407`). FinishMoment is an in-flow step, not a new route. Only Secured uses `router.replace` via `securedNavOnce` / `taskSecuredHref`. No `router.push` to Secured.

Last task: A/E then one replace to F. `save` is never set to `saved` on `secured_nav`, so C does not flash.

#### Held share

Tap Share while pending → `feed_held`, button “Shares when saved”. `checkins.shareProof` only after save succeeds and `closingProofEventId` is known (`postHeldShare` at `:334`, called at `:493`). Failure copy: “Nothing was saved and nothing was shared. The photo stays on this screen until it saves.” Leave (`Leave it saving` / `Keep it to the record`) does not cancel the in-flight promise; a later success still posts.

#### Also today

Home Today minus done, all enrollments, same pre-start skip as Home (`app/(tabs)/index.tsx:232`). `listMyActive` + `getTodayCheckinsForUser` → `dayOpenTasksFromActive` filtered by `enrollmentDueToday` → `alsoTodayFromTasks`. Rows `{ id, title, gate_line }` via `gateLine`. Pluralize: `Also today · {n} task/tasks` (`taskWord`).

#### UI

`components/task-v2/FinishMomentV3.tsx` — ds/ `Button`, `ListRow`, `ProofImage`. Copy from `FINISH_*` constants (table at `02_screens.md:5360–5380`). Ellipsis in “Saving…” is the only one; no exclamation, no frame/spec/design-system words. Camera preview 252pt, shrinks to 170 when `saved` and Also today is non-empty. Self-report: 252pt text card (title, challenge, Day n of N in Barlow Condensed, `gateLine`). Day n from `calendarDayFromStartAt` via `workStepDay` (same as Home). Story / Copy / Save / More are present and no-op until B4.

Share lives on FinishMoment while it is mounted. On F, `setSecuredHandoff` + unmount; Secured is the only share surface. Existing `app/task/secured.tsx` unchanged as a second share UI on the same screen.

#### Takeover deleted

Deleted `lib/verifying-takeover.ts`, `lib/verifying-takeover.test.ts`, `components/task-v2/steps/VerifyingStep.tsx`, `components/task-v2/TaskVerifying.tsx`. `"verifying"` removed from `TaskFlowStep` (`lib/task-flow-state.ts:19` is `"finish"`). `ChallengeDoneScreen` / `ChallengeDoneStep` deleted after grep showed zero callers.

```
git grep -n 'VERIFYING_TAKEOVER_MS\|VerifyingStep\|step === "verifying"' -- ':!docs' ':!design'
# only lib/finish-moment.test.ts asserting those strings are absent
```

```
git grep -n 'ChallengeDoneScreen\|ChallengeDoneStep' -- '*.ts' '*.tsx'
# empty
```

Commits:

1. `658dd7c1fbcd8924679314a0d77879649929614c`  
   `feat(finish): add A–F reducer and held-share resolution`
2. B1 above
3. `adf551130f9d01dd09db71fa9abc4ab6dfe95460`  
   `feat(finish): show FinishMoment on I did it and delete the verifying takeover`

---

## A–F walkthrough

1. **A — camera, saving.** Tap I did it (or Post on review). FinishMoment mounts immediately. Status “Saving…”. 252pt photo if `proofUri` is set. Share is “Share to the feed”. Next task is disabled.
2. **B — self-report, saving, share held.** Same, but the 252pt text card. Tap Share while pending → “Shares when saved”. `shared` is still false.
3. **C — saved, day open.** Mutation returns `secured_today=false`. Status “Task saved.” Also today lists remaining Home Today rows. Camera preview shrinks to 170 if that list is non-empty. If Share was held, `shareProof` runs now.
4. **D — failed.** Status “Didn't save. Try again.” plus the failed body. Held share is dropped. Nothing is posted. Retry stays on this screen with the photo.
5. **E — slow.** Still pending at 3 s. Status “Still saving. It keeps going if you leave.” Footer “Leave it saving”. Mutation keeps running if they leave.
6. **F — day secured.** `secured_today=true` from the server (complete `dayAlreadySecured` or `secureDay.secured`). One `router.replace` to Secured. FinishMoment unmounts. Share block is only on Secured. Never flashes C.

---

## Tests (names)

- `finish moment A–F from save and secured_today`
- `held share posts only after save succeeds`
- `held share is dropped on failed save`
- `held share still posts if the user leaves after choosing Share`
- `branch reads secured_today not a client count`
- `also today skips pre-start enrollments like Home`
- `source: takeover symbols gone`
- `sends shareChoicePending on every complete and flips via shareProof`
- `35 candidates produce 4 queries, and the results are merged`

---

## STOP B2

B3 / B4 / onboarding / v38 / EAS / Railway / RevenueCat are not started.

Waiting on simulator approval of B2 before B3 (extract 252pt non-camera card if Story needs it standalone) and B4 (port `ShareSticker`, replace `ShareCardV3` after grep is empty, Meta App ID from config only).

---

## Blocked

None for B0–B2.

## Needs decision

None. Standard copy stays the gate-copy line. Story / Copy / Save / More stay no-ops until B4.

## Yaseen to run

Simulator checklist below. Do not merge to main. Do not start B3/B4 until this screen is approved.

## Simulator checklist (B2 can prove)

1. Tap I did it — FinishMoment appears at once (no full-screen “Saving your day”), whatever the network.
2. Airplane mode, tap Share to the feed — label becomes “Shares when saved”; after the failure, nothing appears on the feed.
3. Throttle to 5 s — status changes to “Still saving. It keeps going if you leave.” at 3 s.
4. Complete the last task of the day — one replace to Secured; FinishMoment never flashes “Task saved.”
5. A self-reported task shows the 252pt text card (title, challenge, Day n of N, gate line). Story sticker waits for B4.
6. Leave / back-swipe — proof stays private (`shared=false`) unless Share was held **and** the save later succeeded.

Story / Save / Copy / More wait for B4.

---

## Commits touching `backend/` (Railway after merge)

1. `7f27139` `fix(proofs): query shared paths in batches of 10`

B1 and B2 are client-only.

## Native modules

No new native modules. `package.json` already has `expo-sharing` and `react-native-view-shot`. `expo-media-library` is not in `package.json`. B4 will list these against the sticker port.

## Branch head

`feat/chunk-b-finish` @ `adf551130f9d01dd09db71fa9abc4ab6dfe95460`

## Test count

- tsc 0
- **1158** tests, **207** files (verifying-takeover tests deleted; finish-moment source/also-today tests added)
- eslint 0 on the files this chunk changed
- repo-wide `npm run lint` is already dirty on main (7 expo warnings). Not introduced here.
