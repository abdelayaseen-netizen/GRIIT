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

## B3 — 252pt text card as a standalone sticker

`components/share/FinishTextCard.tsx` is the 252pt non-camera card from FinishMoment. Story uses it for every type that is not camera. FinishMoment preview imports the same component. Height `FINISH_TEXT_CARD_H = 252` in `lib/share-sticker.ts`.

## B4 — ShareSticker Clear / Card / Photo

Port of `design/handoff/src/components/share/ShareSticker.tsx` (Day / Consistency / Badge) plus the frame 99 sheet.

- Reducers and copy — `lib/share-sticker.ts`
- Stickers — `components/share/ShareSticker.tsx`
- Sheet — `components/share/ShareStickerSheet.tsx` (`ds/Sheet`, `SegmentedControl`)
- FinishMoment Story / Copy / Save / More open that sheet. Camera → Day sticker. Self-report → FinishTextCard.
- Photo background only when the proof was shared to the feed. Kept photos: “This photo is private, so it can't be used here.”
- `ShareCardV3` deleted. Grep on `*.ts` / `*.tsx` is empty except the test that asserts it is gone.
- Meta App ID: `facebookAppId()` from `EXPO_PUBLIC_FACEBOOK_APP_ID` only. Never hardcoded. Empty ID **hides** Instagram Story. Copy / Save / More still render.
- Stories: pasteboard via `react-native-share` `Share.shareSingle({ social: InstagramStories, appId, stickerImage | backgroundImage })`. `instagramStoriesUrl` deleted. Grep callers: 0 (only the negative test assertion).
- Save: `MediaLibrary.requestPermissionsAsync(true)` then `saveToLibraryAsync`. Success: “Saved to Photos.” Denied: “Allow Photos access in Settings to save.” No crash.
- More: system sheet via `expo-sharing` `shareProgressImage`.
- Copy: caption via `sharePlainMessage`.

B4 fix commits (after first-pass rejection):

1. `ea3f4c851801a04da0d6de4f8395599162b403f7` `fix(share): send Instagram Stories through the pasteboard`
2. `03f5235f562420ae17a6ecc6383fecc8d251f29a` `fix(share): hide Instagram Story when the Meta App ID is empty`
3. `cc657aec2290303d53ff17af1c178a5d42b4e7df` `fix(share): save stickers to Photos with add-only permission`

---

## package.json diff vs main `f6b21a2`

| package | version | why |
|---|---|---|
| `react-native-share` | `^12.3.1` | Stories pasteboard (`shareSingle` / `Social.InstagramStories`) |
| `expo-build-properties` | `~1.0.10` | required by the `react-native-share` Expo config plugin |
| `expo-media-library` | `~18.2.1` | Save PNG to Photos, add-only |

Already present, still used: `react-native-view-shot` `4.0.3` (capture), `expo-sharing` `~14.0.8` (More).

Build 66 is a new native build. These three modules must be compiled in.

---

## app.json plugin and Info.plist additions

**Info.plist** (`expo.ios.infoPlist`):

- `NSPhotoLibraryAddUsageDescription`: `"Save your GRIIT stickers to Photos."`
- `LSApplicationQueriesSchemes`: `["instagram-stories", "instagram"]`

**plugins:**

- `"expo-build-properties"`
- `["react-native-share", { "ios": ["instagram", "instagram-stories"], "android": ["com.instagram.android"] }]`
- `["expo-media-library", { "photosPermission": false, "savePhotosPermission": "Save your GRIIT stickers to Photos." }]`

`photosPermission: false` keeps Save add-only. Existing `NSPhotoLibraryUsageDescription` (proof picker) is unchanged.

---

## Tests (B3/B4 names)

- `fits numerals, proof lines, and badge names from the record`
- `hides Photo with no camera, disables it when the photo was kept`
- `reads EXPO_PUBLIC_FACEBOOK_APP_ID and never ships a hardcoded id`
- `uses view-shot, expo-sharing, react-native-share, and expo-media-library`
- `has no ShareCardV3 callers; FinishMoment Story opens the sticker sheet`
- `hides Instagram Story when the Meta App ID is empty` (`empty id → no Story action rendered`)
- `uses add-only permission and keeps More on the system sheet` (`Save writes the PNG to Photos`)

---

## STOP B4

Onboarding / v38 / EAS / Railway / RevenueCat are not started.

---

## Blocked

None for B0–B4.

## Needs decision

None. Standard copy stays the gate-copy line. Empty `EXPO_PUBLIC_FACEBOOK_APP_ID` hides Story; it does not open Instagram.

## Yaseen to run

Simulator: B2 items 1–6 still hold. Plus Story on a camera task (Day sticker), Story on a self-report (252pt text card), Photo disabled while the proof is private, Clear / Card / Photo segments. Empty App ID: no Story button; Copy / Save / More still there. Save → Photos (“Saved to Photos.”). Deny Photos → “Allow Photos access in Settings to save.” More → system sheet.

## Simulator checklist (B2 can prove)

1. Tap I did it — FinishMoment appears at once (no full-screen “Saving your day”), whatever the network.
2. Airplane mode, tap Share to the feed — label becomes “Shares when saved”; after the failure, nothing appears on the feed.
3. Throttle to 5 s — status changes to “Still saving. It keeps going if you leave.” at 3 s.
4. Complete the last task of the day — one replace to Secured; FinishMoment never flashes “Task saved.”
5. A self-reported task shows the 252pt text card (title, challenge, Day n of N, gate line). Story opens that card as a sticker.
6. Leave / back-swipe — proof stays private (`shared=false`) unless Share was held **and** the save later succeeded.

---

## Commits touching `backend/` (Railway after merge)

1. `7f27139` `fix(proofs): query shared paths in batches of 10`

B1–B4 after that are client-only.

## Native modules (build 66)

New vs main, must ship in the native binary:

- `react-native-share` `^12.3.1`
- `expo-build-properties` `~1.0.10`
- `expo-media-library` `~18.2.1`

Already in the binary: `react-native-view-shot`, `expo-sharing`.

## Branch head

`feat/chunk-b-finish` `cc657aec2290303d53ff17af1c178a5d42b4e7df` (last code). This report is the following commit.

## Test count

- tsc 0
- **1165** tests, **208** files
- eslint 0 on the files this chunk changed
- repo-wide `npm run lint` is already dirty on main (7 expo warnings). Not introduced here.
