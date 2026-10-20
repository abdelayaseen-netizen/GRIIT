# Build 92 report

Branch `feat/build92` from `origin/feat/build90` (`f217c38f`). Spec: `docs/build92/` and `design/handoff/b92/`.
Artifacts per chunk under `docs/reports/build92/<chunk>/`.

Baselines (chunk 01 start, `ce607336`): `tsc --noEmit` 5 errors (`docs/reports/build92/01/tsc-baseline.txt`);
vitest 4 failing tests in 3 files, all pre-existing (`challenge-detail-mapping` ×2, `featured-catalog-seed`,
`join-challenge-error`; `docs/reports/build92/01/vitest-baseline.txt`).

## Chunk 01 · Glass foundation and Create

Design reference: `design/handoff/b92/part0-liquid-glass/` README + `src/ds/glass/*` + `app/-tabs-/_layout.tsx`;
frames P0-01 … P0-14; top-level README "Part 0" checklist (lines 190–219).

Token mapping (handoff → shipped): `DS_COLORS_V2.brand` → `DS_V3.color.brand` (#DC5401, active tab icon only);
`DS_COLORS_V2.textPrimary` → `DS_V3.color.textPrimary`; primary fill → `DS_V3.color.primary` (#BB471D);
`DS_V3.type.secondary/caption/bodyStrong` exist; `secondaryStrong` → secondary + weight 500;
`Button` is `label`-prop based, so `variant="glass"` was added to `components/ds/Button.tsx`.
Folder: the handoff's `src/ds/glass/` ports to `components/ds/glass/` (the app's DS folder; there is no `src/`),
with pure tokens and the on/off rule in `lib/glass.ts` so vitest can read them.

### 01.1 Glass components
- Design reference: part0 README "Tokens", "Orange on glass", "Engineering notes"; `src/ds/glass/*`.
- Root cause (why new): no glass tokens, sheet, action bar or top bar existed; `Sheet.tsx` uses a 60% canvas scrim.
- Change: `lib/glass.ts` (GLASS, GLASS_FALLBACK, GLASS_STATE, GLASS_ACCENT, radii/insets, `glassEnabled`,
  `topBarGlassOpacity`), `components/ds/glass/{useGlass,GlassSurface,GlassSheet,FloatingActionBar,GlassTopBar,index}`,
  `FLAGS.LIQUID_GLASS = false`, `Button variant="glass"`.
- Fallback rule: flag off, or iOS < 26, or Reduce Transparency → #1A1A1A + 1 px #2A2A2A (`glassEnabled`).
- **Needs Yaseen:** `expo-glass-effect` (the native `GlassView`) is not installed and is a native module (new dev
  client). Flag-on today renders the Part 0 tint without blur. Steps: `npx expo install expo-glass-effect`, rebuild
  the dev client (`npx expo run:ios`), then in `components/ds/glass/GlassSurface.tsx` replace the tinted `View` in the
  flag-on branch with `<GlassView glassEffectStyle="regular" tintColor={GLASS[kind].tint}>` (comment marks the spot).
- Test: `lib/glass.test.ts` (failed before: module missing; passes now).

### 01.2 Tab bar
- Root cause: `components/ds/TabBar.tsx` had 4 tabs + a FAB circle (order Home, Discover, +, Activity, Profile) on
  `DS_V3.color.surface` (#1A1918) / `border` (#2A2928), FAB pushed the wizard tab. No native-tabs path.
- Change (flag off): 5 tabs Home, Discover, Create, Activity, Profile; Lucide `Home, Compass, CirclePlus, Flame, User`;
  pill on `GLASS_FALLBACK`; active icon `GLASS_ACCENT.activeTabIcon` (#DC5401), active label Text 1; pressed state
  white 22% + scale 0.98; `testID`s `tab-*`. Create calls `openCreateChooser()` and never navigates.
- Change (flag on): `components/ds/glass/NativeGlassTabs.tsx` on `expo-router/unstable-native-tabs` (verified present
  in expo-router 6.0.24: `NativeTabs`, `Trigger`, `Icon sf/src`, `Label`, `minimizeBehavior`, `iconColor`,
  `labelStyle`). `minimizeBehavior` is `never` with Reduce Motion, else `onScrollDown`. Icons use the README's SF Symbol
  mapping (house, safari, plus.circle, flame, person) on the tab bar only, because the Lucide-as-template-PNG path needs
  assets the repo does not ship.
- Not available in expo-router 6.0.24: a tab-bar bottom accessory ("+ Create" while shrunk). Flag-on only; recorded
  under "Needs Yaseen".
- Test: `lib/glass.test.ts` "tab bar" (failed before: yes; passes now: yes). Maestro `build92-01-create-chooser.yaml`
  asserts the five `tab-*` ids.

### 01.3 Create chooser (P0-14)
- Root cause: `app/(tabs)/create.tsx` rendered `CreateWizardV2` directly; the FAB pushed `ROUTES.TABS_CREATE`; Home's
  empty-state "Create a challenge" also pushed the tab. No chooser existed.
- Change: `lib/create-chooser.ts` (copy table, rows, open/close store, Home snapshot), `components/create/CreateChooser.tsx`
  (GlassSheet, two rows, 44 pt icons, disabled 38%), `app/(tabs)/create.tsx` (on focus: open chooser, go back to the
  previous tab — used by deep links and the native tab bar), `app/(tabs)/index.tsx` publishes `{ todaySecured, nextTask }`
  from the same `startTask` Home uses, `lib/task-complete-href.ts` (one builder for the task href; Home's `onPressTask`
  uses it too), Home empty-state "Create a challenge" → `ROUTES.CREATE_WIZARD`.
- Decision: with no open task and today not secured (no challenge yet), the log row is disabled with no subtitle
  (the copy table has no line for it; "Create a challenge" is the one thing to do on day one).
- Test: `lib/create-chooser.test.ts` (failed before: module missing; passes now). Maestro
  `.maestro/build92-01-create-chooser.yaml`.

### 01.4 Toasts
- Root cause: `components/task-v2/TaskCompleteToast.tsx` sat at `tabBarContentPad() + 12` (no safe-area inset, so
  108 pt on every phone), solid `surface` card with 1-line title/body, no VoiceOver announcement, "Share" went straight to
  the share sheet through a prop.
- Change: chrome `GlassSurface`, `toastBottomOffset(insets.bottom)` = pill 64 + dock + 70, `TOAST_LIFE_MS` 4000,
  title wraps to 3 lines (2 + body), `accessibilityRole="alert"` + `announceForAccessibility` on publish, horizontal
  inset 12 (SE) / 21. "Share" → `openStickerCarousel(toast)` (`lib/sticker-carousel.ts`, a registry; the tabs layout
  registers the current share sheet until chunk 05 swaps in the carousel). Retry is only offered when a caller sets
  `actionLabel` (unchanged behaviour; no toast offers Retry by default).
- Test: `lib/tab-bar-inset.test.ts` "toast offset" (failed before: yes; passes now: yes); `lib/glass.test.ts` "toast".

### 01.5 Top bars and the "profile/posts" leak
- Root cause: `app/_layout.tsx:297` root `<Stack screenOptions={{ headerBackTitle: "Back" }}>` left native headers on
  by default; `profile/posts` (also `challenge/active/[id]`, `challenge/set-gym`, `create-challenge`, `i/[code]`,
  `dev/*`) had no `Stack.Screen` entry, and the screen's own inline `<Stack.Screen options={{ headerShown: false }}>`
  only applies after first render, so the native header painted the route name over `PushedHeader` for a frame.
- Change: root `screenOptions.headerShown = false` (nested `legal/_layout` keeps its own titled headers).
  `GlassTopBar` ported; `app/profile/posts.tsx` uses it (title "Posts", transparent at 0, in by 8 pt; list padded under it).
- Test: `lib/glass.test.ts` "root stack headers" (failed before: yes; passes now: yes). Maestro walks every tab and opens
  a profile post asserting no route name is visible.

### 01.6 Bottom insets
- Already met: every tab list passes `tabBarContentPad(insets.bottom)` (`lib/tab-bar-inset.test.ts` "is used on…",
  grep: `LiveFeedSection`, `DiscoverV3`, `NotificationsTab`, `LeaderboardTab`, `profile.tsx`, `index.tsx`). Posts list
  pads `insets.bottom`. `ACTION_BAR_CONTENT_INSET = 90` is exported for lists under a `FloatingActionBar` (no screen uses
  the bar yet; Part 1 does).

### Chunk 01 gates and evidence
- Screenshots (`docs/reports/build92/01/se/` and `/16promax/`, from `.maestro/build92-01-frames.yaml`):
  `P0-01-P0-03-tab-bar-home.png` (tab bar, Home), `P0-14-P0-05-create-chooser-sheet.png` (chooser on GlassSheet),
  `P0-09-P0-12-toast-over-home.png` (toast 70 pt above the bar, via `griit://dev/build92-toast`). Compared against
  `design/handoff/b92/part0-liquid-glass/frames/`: fallback (flag off) matches the solid variants; blur variants need
  `expo-glass-effect` (Needs Yaseen).
- Maestro `.maestro/build92-01-create-chooser.yaml` passed on run 9 (`maestro-create-chooser-run9.txt`, iPhone 16):
  fresh guest → chooser (empty: log disabled, no "Who sees this") → "Create a challenge" → wizard Step 1 → Cancel →
  join 7K Steps → chooser shows "Log today's task · Walk 7,000 steps · 7K Steps · Day 1 of 7" → task → Done → post
  → Day secured → chooser shows "Every task today is done." → every tab + `profile/posts` show no route name.
  Runs 1–8 were flow fixes (label regexes, Day secured copy, the build-91 Proof/save prompt after Day secured, no
  proof tile in a fresh grid; the final flow opens Posts by deep link). The SE frames flow also needed a settle wait
  before the first frame and taps through the dev-client "Open in GRIIT?" dialog.
- Full suite after the chunk: vitest 4 failed / 2117 passed (`vitest-final.txt`) = the 4 baseline failures; tsc 5 errors =
  baseline set (`tsc-final.txt`). Three tests moved with the code, not weakened: `origin-tab` now checks
  `taskCompleteHref` + the href builder's `originTab = "home"` default; `share-choice-photo` / `task-complete-toast`
  check `PHOTO_LIFE_MS = TOAST_LIFE_MS` with `TOAST_LIFE_MS === 4000` asserted. `safe-area` caught that
  `app/(tabs)/create.tsx` and `app/dev/build92-toast.tsx` rendered without `<Screen>`; both fixed.
- Self-check diff: no skipped tests, no hard-coded colours outside `lib/glass.ts`, no symptom hidden.

### Chunk 01 decisions made alone
- Glass port lives in `components/ds/glass/` + `lib/glass.ts` (no `src/` in this repo).
- Flag-on tab bar uses SF Symbols from the README mapping; `minimizeBehavior: onScrollDown` kept even without an
  accessory API, so Create is two taps while the bar is shrunk (flag-on only).
- Log row with no open task and nothing secured: disabled, empty subtitle.
- Toast "Share" goes through `lib/sticker-carousel.ts`; the tabs layout registers the current share sheet until chunk 05.
- Home empty-state "Create a challenge" opens the wizard (`/create`) instead of the Create tab.
- Chooser subtitle wraps to 2 lines (SE truncated "Pick the tasks, the length and who can join." at 1 line).

### Chunk 01 not done / Needs Yaseen
- `expo-glass-effect` install + dev client rebuild (steps under 01.1). Until then `FLAGS.LIQUID_GLASS` stays off.
- Tab-bar bottom accessory ("+ Create" while shrunk) has no API in expo-router 6.0.24; revisit on upgrade.
- Seen in build 91 while running the flow (not chunk 01 items; for chunk 02/04): Day secured shows "0 tasks." and an
  odd share-card preview; Done on Day secured goes to a Proof screen and then the guest "Save your challenge." prompt;
  a self-reported check-off post has no tile in the author's own proof grid.

## Chunk 02 · Finish flow and Day secured

Design reference: `design/handoff/b92/part1-finish-loop/README.md` ("What changed", "Routing", copy table,
checklist lines 114–128), `src/finish/{routeAfterSave,copy,PostSheet,DaySecuredScreen,format}.ts(x)`; frames
P1-01 … P1-11, P1-34. Top-level README Part 1 locked decisions (lines 33–40) and checklist (222–236).

Token mapping: `DS_V3.type.earnedHero` (Barlow 88) → `DS_V3.type.number` (64/800 tabular; no Barlow Condensed is
bundled, so the shipped earned-number style is used and noted); `secondaryStrong` → secondary + weight 500;
`captionStrong` → caption + weight 500; `SegmentedControl` with icons → three glass radio pills (the shipped
`SegmentedControl` has no icon slot and is being removed from the Proof screen anyway).

### 02.1 One finish flow
- Root cause: the audience was asked in two places — `steps/ReviewStep.tsx` chips (photo tasks, before Done) and
  `steps/PostChoiceSheet.tsx` (everything else, Friends/Everyone + "Keep it private", no Only me). Closing the sheet
  (scrim) saved privately with no toast. `useTaskFlowV2.ts` `showDoneLocally()` left for Home before the server
  answered, so "Posting" and an offline error had no screen to show on; a failed save rolled the task back.
- Change: `lib/finish-flow.ts` (copy table, `routeAfterFinish`, `remainingAfter`, `isOfflineError`, `verifyLabel`,
  `finishDates`, the teaching flag). `PostChoiceSheet` rebuilt on `GlassSheet` (inline; a Modal cannot present in
  the frame another closes): "Post your proof", "{task} · {challenge} · Day n of N", photo thumb + caption when the
  camera came first, "Who sees this" Friends / Everyone / Only me (Friends default), the line per audience, one
  button "Post to friends" / "Post to everyone" / "Save privately" / "Posting" / "Try again"; X, scrim and swipe-down
  save privately. `ReviewStep` keeps only the photo + Retake + Done (`review-done`). The hook: `onReviewPost` opens
  the sheet (camera first), `answerPostChoice` keeps the sheet up until the save lands, failures show on the sheet
  (`postChoiceError`, offline line for network errors) with "Try again"; the closed sheet toasts "Saved privately."
  (body "{task} done. {n} left today."). `GlassSheet` gained `inline` and `closeTestID` (chunk 01 component; needed
  here). `app/task/strava.tsx` adopted the new sheet props.
- Decision: the sheet waits for the server ("Posting") instead of build 90's optimistic leave, because P1-03/P1-04
  need a screen to show the state on. Done → sheet is still immediate (gate below). Offline: the optimistic Home row
  is kept and the sheet says the task is saved and counts; a true offline queue (survives a kill) is not built —
  listed under Needs Yaseen.
- Test: `lib/finish-flow.test.ts` 02.1 (failed before: module missing / static checks; passes now). Maestro
  `build92-02-finish-checkoff-counter.yaml`, `build92-02-finish-photo.yaml`.

### 02.2 Where it goes next
- Root cause: `useTaskFlowV2.ts:787` `router.replace(ROUTES.POST_ID(postedId))` after every published post with the
  day still open (the trap: 53 dead taps); `app/task/secured.tsx:197` opened the Proof on Done when `openPost` was
  set; the toast title was `taskDoneTitle()` = "Saved."; Challenge complete was reachable only from Day secured's
  Done (`afterSecuredNext`), never straight from the save; Home had no "Next" marker.
- Change: both `POST_ID` replaces removed; `routeAfterFinish` decides ChallengeComplete (with `otherOpen` when today is
  not secured) → DaySecured → Home. Home toast "{task} done. {n} left today." where n = open tasks across all active
  challenges minus this one (`lib/create-chooser.ts` snapshot now carries `openTaskIds`, published by Home). The
  first open row on Home shows a "Next" tag (`components/home/HomeV3.tsx`, `home-task-next`). The toast carries
  `highlightTaskId`.
- Test: `lib/finish-flow.test.ts` 02.2; `lib/route-after-save.test.ts` (enrollmentFinished unchanged). Maestro
  asserts `post-done` (the Proof's button) is never visible and the toast text matches.

### 02.3 Day secured
- Root cause: `components/task-v2/SecuredDayScreen.tsx` was a 462-line ScrollView: sticker preview, proof tiles,
  "N tasks." caption (which read "0 tasks." before the bootstrap landed), invite card, ShareChoice footer; the
  teaching line `SECURED_MEANS` showed every time; only an X close, no Back, no swipe.
- Change: rewritten to the P1-06/08 order inside one non-scrolling view: streak number (`DS_V3.type.number`) +
  "day(s) in a row", "Every task today is done.", `WeekStrip`, today's tasks (title + Verified / Verified by Strava /
  Self-reported; the finishing camera task shows its photo, self-reported rows show nothing), the teaching line on
  the first secured day per user (`SECURED_TEACHING_KEY`, AsyncStorage keyed by user id), then `FloatingActionBar`
  Share (primary) / Done. Done, "Go back" and swipe-down (PanResponder, 64 pt) go Home. Share opens the sticker
  carousel registry (chunk 05; the share sheet until then). Invite moved off this screen (Part 2 locked decision:
  invite after creating, on an empty board, on a challenge).
- Test: `lib/finish-flow.test.ts` 02.3 (order, no ScrollView, teaching once per user). Maestro
  `build92-02-secured-nav.yaml` (Done ×3, Back ×3, swipe ×3) via `griit://dev/build92-secured`.

### 02.4 Challenge complete
- Root cause: `MomentScreenV3` complete variant showed "Held" and "Days done" and had no dates and no
  "other challenges open" line; the save never routed here directly.
- Change: stats are Longest streak · Freeze(s) used · Dates ("Oct 1 – Oct 30" from the enrollment `start_at`
  passed by the hook; no backend change); `otherOpen` line "Today isn't secured yet. {challenge} still needs
  today." where {challenge} is the next open task's challenge from the Home snapshot. `app/challenge/complete.tsx`
  reads `otherOpen`, `otherChallenge`, `startAt`.
- Test: `lib/finish-flow.test.ts` 02.4. Not reproduced on a simulator (needs an enrollment on its last day); see
  "Not done".

### 02.5 Second audience prompt
- Root cause: `app/post/[id]/index.tsx:256–268` rendered "Who sees this" + `SegmentedControl` for the owner.
- Change: removed (the `setPostAudience` mutation stays for the chunk 04 "…" menu).
- Test: `lib/finish-flow.test.ts` 02.5; `lib/build90-posting.test.ts` 04.3 flipped to `not.toContain` with the reason.

### Chunk 02 gates and evidence
- Maestro, each flow run to green once per device, fresh guest each run:
  - `.maestro/build92-02-finish-checkoff-counter.yaml` (iPhone 16 `maestro-checkoff-counter-run4.txt`, SE
    `se/maestro-checkoff-counter-se.txt`): join 7K Steps + 10 Pages → Home shows the `Next` tag on the first open
    task → check-off Done → sheet (`Post your proof`, `Who sees this`, friends/everyone toggle, `Post to friends`)
    → Post → Home toast "Walk 7,000 steps done. 1 left today.", the Proof screen and the sheet never shown, `Next`
    moves to Read 10 pages → counter +10 → `Done · 10 pages` → sheet → close without choosing → saved privately →
    Day secured (streak 1, both rows `Self-reported`, Done + Share) → Done → Home. Runs 1–3 were flow fixes: the
    build-91 guest "Save your challenge." prompt after the first finish (optional `Later`), the counter needs +10
    before Done, and on the SE the rows sit under the tab bar (`scrollUntilVisible`). No app fix was needed.
  - `.maestro/build92-02-finish-photo.yaml` (16 Pro Max, `16promax/maestro-photo-16promax.txt`): camera allowed →
    Drink Water Today → Take proof photo → Review `Done` → sheet with the photo thumb and caption field → Post →
    Challenge complete (Drink Water Today is a 1-day challenge: "Drink Water Today · finished", Longest streak,
    Freezes used, Dates) → See the record → Home. Day secured is not shown as well (routing rule: finished wins).
  - `.maestro/build92-02-secured-nav.yaml` (SE `se/maestro-secured-nav-se.txt`, 16 Pro Max
    `16promax/maestro-secured-nav-16promax.txt`): Day secured → Done ×3, Back ×3, swipe-down ×3, each lands on Home;
    0 failures on either device. The first open shows the teaching line, later opens don't.
  - Run type: not covered on the simulator. There is no seeded run challenge and a run task needs Strava/Health
    (`app/task/strava.tsx`); that screen uses the same `PostChoiceSheet` and was updated and type-checked. See Not done.
- Screenshots next to the design frames (`design/handoff/b92/part1-finish-loop/frames/`):
  `se/` and `16promax/`: `P1-06-day-secured-first-time.png`, `P1-08-day-secured-self-reported.png`,
  `P1-08-day-secured-self-reported-home.png` (dev route `griit://dev/build92-secured`); `se/P1-04-home-toast-next.png`
  and `se/P1-07-day-secured-real.png` (real flow; also `16/` for iPhone 16); `16promax/P1-02-post-sheet-photo.png`,
  `16promax/P1-10-challenge-complete.png`. On the SE, Day secured has no ScrollView (static test) and the whole screen
  (streak, title, week strip, two task rows, teaching line, action bar) fits without scrolling (`se/P1-07`).
- Teaching line once per user: `lib/finish-flow.test.ts` covers `teachingShows`/`markTeachingSeen` (fresh user shows,
  same user hidden after marking, another user still shows, bad JSON treated as unseen); the Maestro secured-nav flow
  asserts `day-secured-teaching` on the first open only.
- Done → sheet timing, from `maestro.log` timestamps (tap COMPLETED → "Post your proof" assert COMPLETED), 8 taps
  across the runs above: 0.09, 0.09, 0.09, 0.09, 0.10, 0.10, 0.10, 0.10 s. The sheet is inline (no Modal), so it
  renders in the same frame as the state change; well under build 90's 0.75 s.
- Full suite after the chunk: vitest 4 failed / 2128 passed (`vitest-final.txt`) = the 4 baseline failures; tsc 5
  errors = baseline set (`tsc-final.txt`). Failing-first run saved as `vitest-before.txt` (7 failed).
  13 build-90 static pins moved to the new behaviour, each with a "Build 92 02" comment (list in 02.1–02.5); none
  weakened: every inverted check (`not.toContain("InviteLinkRow")`, no `POST_ID(` in done, no `<SegmentedControl` on
  Proof, no `openPost`) is the Part 1 locked decision it pins.
- Self-check diff: no skipped tests, no `as any`, no console.log, no hard-coded colours; chunk 01 tests still pass.

### Chunk 02 decisions made alone
- The sheet waits for the server ("Posting" on the button, retries in place) instead of build 90's optimistic leave,
  so the next screen always reflects the real save.
- Offline: the optimistic Home row stays, the sheet shows the offline line and "Try again"; no persistent offline
  queue in this chunk (see Not done).
- Teaching-line "seen" is stored per user in AsyncStorage (`griit.secured.teaching.v1`), no SQL.
- Day secured drops the invite row (Part 2 locked decision); Share opens the sticker carousel registry from chunk 01.
- Challenge complete dates are computed client-side from the enrollment `start_at` + duration; no backend change.
- Day secured shows a photo thumb only for the task that just finished with the camera; other rows show the label.
- `GlassSheet` gained `inline` (renders in-tree, no Modal) and `closeTestID`; the finish sheet uses inline so it can
  stay up while the save runs and so Maestro can read it.
- Closing the sheet without choosing saves privately and the Home toast title becomes "Saved privately." with the
  remaining count as the body.

### Chunk 02 not done / Needs Yaseen
- Run task type not covered by Maestro on the simulator (needs Strava/Health and a run challenge). Steps to cover on
  a device: create a challenge with the "Morning run" pack, connect Strava, finish a run, check Done → sheet → the
  routed screen, Proof screen absent.
- Challenge complete via a multi-day challenge on its last day is not reproducible on the simulator; covered by the
  1-day Drink Water Today flow and `routeAfterFinish` unit tests.
- Offline post queue (retry later automatically) is out of this chunk's scope; the sheet keeps "Try again".
- Dev route `griit://dev/build92-secured` shows the live streak (1 on a fresh guest) rather than the `streak` param;
  harmless, frames only.

## Chunk 03 · Task inputs and partial logs

Design reference: `design/handoff/b92/part1-finish-loop/` frames P1-28 to P1-33, P1-35; checklist lines 146–152;
copy table rows Counter, Run, Partial, Short toast, Home row; `src/finish/format.ts` (`counterLine`, `parseHms`,
`paceWarning`, `shortOfGoal`, `soFarLine`, `dayTotal`). Ported into `lib/counter.ts`, `lib/keypad-masks.ts`,
`lib/task-flow-state.ts` and a new pure `lib/partial-log.ts`; nothing imports the handoff file.

### 03.1 Counter
- Root cause: `lib/counter.ts:27` `step()` returns `Math.min(n + by, target)`; `CountStep.tsx:121,143–144` set
  `disabled={atTarget}` on +1/+5/+10 and dim +1; `CountStep.tsx:109` and `useTaskFlowV2.ts` `onTypeCount` clamp typed
  counts to the goal. The only line under the goal is "Log n of target" (`countCtaLabel`); nothing says the goal is
  reached. So at 10 of 10 the screen dims with no word and the next tap does nothing.
- Change: `step`/`onTypeCount`/keypad no longer cap; +/− stay active; `counterGoalLine` gives "Goal reached. Done
  saves it." at or past the goal and "{x} to go." under it; a check icon sits by the count at the goal; the footer
  under the goal is "Save {n} · won't count today" (03.4) instead of a disabled "{n} left".
- Test: `lib/partial-log.test.ts` (counter past goal, goal line, labels) + static checks on `CountStep.tsx`.

### 03.2 Run and workout inputs
- Root cause: `lib/keypad-masks.ts:7` `KEYPAD_MAX.duration = 4`, so the Duration field is mm:ss only; a 1:05:00 run
  cannot be typed. Workouts already take minutes (`LogStep.tsx:230–243`).
- Change: duration buffer takes 6 digits; 4 or fewer format as mm:ss, more as h:mm:ss; the field trailing reads
  "h:mm:ss". `parseHms` accepts "h:mm:ss" and "mm:ss" strings for tests and Strava copy.
- Test: `lib/partial-log.test.ts` h:mm:ss parse/format; `lib/keypad-masks.test.ts` pins updated where they asserted
  the 4-digit cap (intended change, commented).

### 03.3 Impossible pace
- Root cause: `lib/task-flow-state.ts:140` `RUN_PACE_FAST_SEC_PER_MI = 270` (4:30) and the check only runs on Done as
  an ask dialog with "Save anyway" (`useTaskFlowV2.ts` `onLogContinue`), so a 0:10 /mi run could be saved.
- Change: fast bound 3:30 (210 s); `runPaceTooFast` drives an inline error line "That pace looks off. Check the
  distance and time." on the Log step and disables Done. The slow bound keeps its ask (not in the spec, left as is).
- Test: `lib/partial-log.test.ts` pace check (3:29 blocks, 3:30 passes, km input converted).

### 03.4 Short of the goal
- Root cause: `lib/work-step.ts:208–220` `runPaceLine` only appends "{n} {unit} short." to the pace line;
  `logReady` (`task-flow-state.ts:351`) enables Done with any distance; saving calls `checkins.complete`, which
  completes the task and can secure the day on a 1 mi run against a 3 mi goal.
- Change: under the goal the Log step shows "{done} of {goal} mi · {x} mi short" and "Today won't count toward the
  {goal} mi goal. The run is saved, the task stays open and today isn't secured."; the button reads "Save {d} mi ·
  won't count today" and calls `checkins.saveProgress` (pending row, never `complete`), then Home with the toast "Run
  saved. {x} short, so today isn't secured yet." The task row stays open and reads "{done} of {goal} {unit} logged".
  Counters under the goal do the same with "Save {n} · won't count today".
- Test: `lib/partial-log.test.ts` short lines/labels/toast + static checks (LogStep uses `shortOfGoal`, the hook's
  short save calls `TRPC.checkins.saveProgress` and never `complete`).

### 03.5 Partial logs add up (server)
- Root cause: `backend/trpc/routes/checkins.ts:1610` `saveProgress` writes an absolute `value` (stale-lower no-op)
  and nothing on the client calls it for runs or hydrates it on open (`useTaskFlowV2.ts` starts `count` at 0 and has
  no today-row query); `getTodayCheckinsForUser` (`:1823`) does not select `value`, so Home cannot show progress.
- Change: `saveProgress` gains `mode: "set" | "add"` (default set = today's behaviour) and an optional `log`
  ({distance_km, duration_min, entry_mode}); add mode sums with the pending row and appends the log to
  `proof_payload_json.partial_logs` — existing columns, no migration. `getTodayCheckinsForUser` adds `value` and
  `proof_payload_json` to its select (additive). The task screen loads today's row for its task
  (`checkins.getTodayCheckins`, cached under the existing query key) and shows "{done} of {goal} mi so far today" with
  "Add distance"; the total decides short vs Done. Totals live under `date_key`, which `resolveCheckInTimeZone` +
  `getTodayDateKey` already compute in the user's zone, so they reset at local midnight.
- Test: `backend/lib/counter-progress.test.ts` add mode (sum, logs appended, completed rejected, 2 + 1 reaches 3);
  `backend/lib/date-utils` midnight reset in America/Los_Angeles and Asia/Tokyo around the same instant.

### 03.6 Data fix
- `docs/sql/build92.sql` "Chunk 03 · 03.6": read-only SELECT listing live counter/reading tasks whose challenge title
  says minutes but whose task config counts pages, and a guarded UPDATE limited to an explicit id list (left for
  Yaseen to fill from the SELECT). Not run.

### Chunk 03 gates and evidence
- Maestro, fresh guest each run (`docs/reports/build92/03/`):
  - `.maestro/build92-03-counter-frames.yaml` (SE `se/maestro-counter-frames-se.txt`, 16 Pro Max
    `16promax/maestro-counter-frames-16promax.txt`): join 10 Pages → Read 10 pages → "Add one" ×4 → "6 to go." and
    the footer "Save 4 · won't count today" (P1-29) → +5 +1 → "Goal reached. Done saves it." with the
    `count-goal-check` icon → +1 +1 → count 12, buttons still active (P1-28) → "Remove one" → 11 → back.
  - `.maestro/build92-03-run-partial.yaml` (iPhone 16 `16/maestro-run-partial-run11.txt`; SE
    `se/maestro-run-partial-se.txt`; 16 Pro Max `16promax/maestro-run-partial-16promax.txt`): the gate's "2 mi →
    '2 of 3 so far' → 1 mi → Done → day secured" end to end. Create → Custom → task "Morning run", type Run, Distance
    3 (km, the wizard default) → Standard → start → open the task → 1 km in 2:00 → inline "That pace looks off. Check
    the distance and time." and Done disabled (P1-31) → type 10500 → "1:05:00", trailing "h:mm:ss" (P1-30) → 2 km in
    20:00 → "2 of 3 km · 1 km short", the won't-count note, button "Save 2 km · won't count today" (P1-32) → Home
    toast "Run saved. 1 km short, so today isn't secured yet.", no Day secured, the row still open (P1-33) → reopen →
    "2 of 3 km so far today", field label "Add distance" (P1-35-run-so-far) → 1 km in 10:00 → no "short" line, Done →
    Post your proof → Post → Day secured "Every task today is done." (P1-35-day-secured-after-partials) → Done → Home.
  - Runs 1–9 on iPhone 16 were flow fixes (full-regex labels, `hideKeyboard` not working on these simulators, one
    digit per `inputText` on the formatted Duration field, "Back to Home" on the success screen). Run 10 found two
    app bugs, both fixed with tests: the toast said "1 km short short" (`shortToast` was handed the "{x} short" line;
    `shortOfGoal` now returns a `gap` and the toast takes that), and the finishing `complete` call was sending
    `proof_payload_json.partial_logs`, which the camera-payload schema rejects (the client no longer sends it; the
    server keeps the pending row's `partial_logs` because `complete` only overwrites `proof_payload_json` when one is
    supplied, `checkins.ts:1298`). On the SE the run flow did not get past the create wizard: the keyboard covers
    the Add-task sheet's footer and every tap-away target tried (sheet heading, "What you do" label) dismissed the
    sheet instead (`se/maestro-run-partial-se.txt`, 2 flow attempts, stopped per the budget). The task screens
    themselves have no SE-specific layout (the SE counter frames passed); the run frames are from the 16 and 16 Pro Max.
- Screenshots next to the design frames (`design/handoff/b92/part1-finish-loop/frames/`): `se/` and `16promax/`
  `P1-28-counter-past-goal.png`, `P1-29-counter-partial.png`; `16/` and `16promax/` `P1-30-run-hmmss.png`,
  `P1-31-pace-off.png`, `P1-32-run-short.png`, `P1-33-home-after-short.png`, `P1-35-run-so-far.png`,
  `P1-35-day-secured-after-partials.png`.
- Midnight reset: `backend/lib/counter-progress.test.ts` pins `dateKeyInTimeZone` across 23:30 → 00:30 local in
  America/Los_Angeles and Asia/Tokyo at the same instant (different keys per zone, the Tokyo total starts over
  while LA's does not); totals live under that key.
- Full suite after the chunk: vitest 4 failed / 2146 passed (`vitest-final.txt`) = the 4 baseline failures; tsc 5
  errors = baseline set (`tsc-final.txt`). Failing-first run saved as `vitest-before.txt`. Pins moved to the new
  behaviour with "build 92 03.x" comments: `lib/build90-task-inputs.test.ts` (4:30 → 3:30 bound, "{n} left" →
  "{x} to go.", sanity copy), `lib/counter.test.ts` (step past target), `lib/build90-posting.test.ts`
  (`submitWithoutPhoto(payload, …)`), `.maestro/build90-task-inputs.yaml` ("h:mm:ss", "30 to go."). None weakened;
  the pin on `complete` never carrying `partial_logs` is new.
- Backend deployed (no SQL needed, additive input/select only): `backend/deploy-sha.txt` = `ee6adddb`,
  `railway up --service grit-backend`, `/api/health` → `"commit":"ee6addd"`. Build 91 clients send no `mode`, so
  `saveProgress` behaves as before for them.
- Self-check diff: no skipped tests, no `as any`, no console.log, no hard-coded colours (check icon and error line
  use `DS_V3.color.brand` / `.danger`); chunk 01 and 02 tests still pass in the full run.

### Chunk 03 decisions made alone
- Partial run totals are stored as km in `check_ins.value` on the day's pending row, with per-log facts in
  `proof_payload_json.partial_logs` (existing jsonb column) — no migration. Counters keep "set" mode (the count is
  the total) and hydrate from the pending row on open.
- A short save is saved and never posted: posting needs a completed check-in and an activity event. The sheet is
  skipped and the Home toast is shown instead (copy table "Short toast").
- Counter short toast reads "Count saved. {x} short, so today isn't secured yet." (the copy table only names runs).
- The slow-pace bound keeps build 90's ask dialog; only the fast bound (3:30 /mi) became an inline error, as specified.
- Home row for an open task with a saved partial reads "{done} of {goal} {unit} logged" via a new `partialLine`
  on `HomeProofTask` (unit from the task config; km converted to the task's unit).
- The Maestro run uses km (the wizard default) rather than mi; tapping the "mi" chip closed the sheet on the
  simulator and the copy is unit-agnostic.
- `getTodayCheckinsForUser` returns `value` and `proof_payload_json` (additive) so Home and the task screen share
  one query.

### Chunk 03 not done / Needs Yaseen
- 03.6 SQL: `docs/sql/build92.sql` lines 12–40 (Step 1 read-only SELECT), 42–67 (Step 2 UPDATE, fill the id list
  from Step 1 first), 69–end (Step 3 confirm). Nothing in the app depends on it.
- Posting a short save ("Save 2 mi · won't count today" → feed) is not built; by design it saves silently.
- No seeded run challenge; the run flow builds one through the create wizard each run (~3 min per device).
- SE run-partial frames (P1-30 to P1-35) not captured: the create wizard's Add-task sheet can't be driven past the
  keyboard on the SE simulator by Maestro (see gates). To capture by hand: SE → Create → Custom → Add a task → Run,
  3 km → tap the field's "km" chip to drop the keyboard → Add task, then follow `.maestro/build92-03-run-partial.yaml`.

## Chunk 04 · Posts, likes and proof detail

Design reference: `design/handoff/b92/part1-finish-loop/` frames P1-19 to P1-27; checklist lines 135–145; copy
table rows Post results, Badges, Own post, Proof detail, Owner menu; `src/finish/PostResult.tsx`, `format.ts`
(`resultLine`, `verifyLabel`), `useDoubleTapLike.ts` (reference only, not imported). Token mapping: the handoff's
`DS_V3.type.earnedNumber` → `DS_V3.type.headline` with tabular figures (Barlow is not loaded in the app, pinned by
`lib/display-face.test.ts`); `captionStrong` → `DS_V3.type.caption` at weight 600 (the `label` token is uppercase and
badges are sentence case); `surface` → `DS_V3.color.surface`.

### 04.1 What a post shows, per task type
- Root cause: `backend/trpc/routes/checkins.ts:1354–1368` writes the activity row's metadata with `task_type` and
  `task_name` only; the run/workout/counter/timer facts stay in `check_ins.verification_gates` (`:1107–1160`), and
  `backend/lib/feed-activity-hydrate.ts:370–406` returns nothing about the result. The Strava webhook
  (`backend/lib/strava-webhook.ts:231`) does the same with `distance`/`moving_time` in hand. So the card can only
  print "Morning run · Self-reported".
- Change: `backend/lib/post-result.ts` builds `metadata.result` ({kind, distance_km, duration_min, workout_kind,
  count, unit, …}) at complete and in the webhook; hydrate and `feed.getPost` return `result` and `badge`
  (additive; build 91 ignores them). Client `lib/post-result.ts` turns facts into the copy-table lines
  ("{d} mi · {time} · {pace} /mi", "{type} · {m} min", "{n} {unit}", "{m} min", "Journal entry" + "The entry stays
  private."); `components/feed/PostResult.tsx` renders the row. Posts written before this build have no `result`
  and show the badge only.
- Test: `lib/post-result.test.ts` (each type; journal never includes the text; miles from km) and
  `backend/lib/post-result.test.ts` (facts from complete inputs and from a Strava activity).

### 04.2 One badge per post
- Root cause: `components/feed/FeedPostV3.tsx` shows the camera seal overlay (`:237–241`) and a time-stamped
  "Self-reported · 7:00 pm" (`:254`, `:286–293`), and the compact row a third gate line, so one post can carry two
  proof marks and the wording differs by variant.
- Change: `postBadge(post)` → exactly one of Verified / Verified by Strava / Self-reported, rendered once in the
  result row; the seal overlay and the timed line go.
- Test: `lib/post-result.test.ts` badge cases + static check (no `CameraSeal` render, no `selfReportedLine`).

### 04.3 Post header
- Root cause: `FeedPostV3.tsx:319` subject `numberOfLines={2}` and `:360` the time has no `flexShrink: 0`, so a
  long challenge name pushes "1m" into the subject's second line ("Day 16 1m of 30").
- Change: subject on one line (`numberOfLines={1}`, ellipsis), time `flexShrink: 0`, `numberOfLines={1}`.
- Test: static check in `lib/post-result.test.ts`; frame P1-20 on the SE.

### 04.4 Double-tap to like
- Root cause: `components/feed/DoubleTapRespect.tsx:29` discards `onOpen` and only installs a 2-tap gesture, while
  the photo underneath is a `Pressable` (`FeedPostV3.tsx:217–221`) that opens on the FIRST tap of a double. A
  double tap therefore opens the photo, fires the like a frame later and the burst renders while the screen is
  already transitioning (the flicker). Proof detail and full screen have no double-tap at all.
- Change: `DoubleTapRespect` owns both taps with `Gesture.Exclusive(doubleTap, singleTap)`: the single tap
  resolves only after the 250 ms double-tap window fails, then calls `onOpen`; the photo `Pressable` loses
  `onPress`. The same wrapper goes around the proof-detail image and the full-screen photo. Likes from a double
  tap never unlike (`doubleTapAction` "keep").
- Test: `lib/post-result.test.ts` static checks (Exclusive gesture, `onOpen` wired, no `onPress` on the photo);
  Maestro `build92-04-likes.yaml`.

### 04.5 Own posts
- Root cause: `lib/feed-join.ts:17` `doubleTapAction` ignores `ownPost`; `FeedPostV3.tsx` `ActionRow` always
  renders the heart; `backend/trpc/routes/feed.ts:687–728` `react` toggles a `feed_reactions` row with no owner
  check, so a self-like is stored.
- Change: `doubleTapAction(true, …)` → "noop"; own posts render "Liked by {name} and {n} others" (or "Liked by
  {name}") in place of the heart; the server fetches the owner first and returns FORBIDDEN for a self-like
  (`backend/lib/feed-like.ts` `selfLikeRejected`).
- Test: `lib/feed-join.test.ts` pin moved to noop; `lib/post-result.test.ts` likedByLine; `backend/lib/feed-like.test.ts`.

### 04.6 Proof detail
- Root cause: `app/post/[id]/index.tsx:385` Back is `router.back()` with nothing when there is no history (the
  post opened by `replace`), `:257–267` an owner-only Done + "Share outside GRIIT" block sits above the comments
  and under the composer, `:385` the title is the route word "Proof", `:389` the keyboard offset is 44 and ignores
  the top inset so the composer floats above the keyboard, and the owner menu lives only on the feed card
  (`LiveFeedSection.tsx:484`, "Who can see this" / "Delete from the feed").
- Change: Back goes back or Home; no Done; the title is the challenge name with the author under it; a "…" in the
  header with Who sees this · Share · Delete post (the feed menu uses the same words); the composer offset is the
  top inset + header height and the list scrolls to the latest comment when the keyboard opens or a comment is
  sent; Share opens the sticker sheet.
- Test: `lib/post-result.test.ts` static checks; `lib/build90-posting.test.ts` Done pins moved (intended);
  Maestro `build92-04-back.yaml` ×3.

### Chunk 04 gates and evidence
- vitest: `lib/post-result.test.ts` (run/workout/counter/timer/journal lines, journal never carries the text, one
  badge, likedByLine, header/gesture/detail static checks) and `backend/lib/post-result.test.ts` (facts from
  complete inputs and a Strava activity, `postBadgeFrom`, `selfLikeRejected`, `feed.react` reads the owner before
  the toggle and throws FORBIDDEN "You can't like your own post."). Failing-first run `04/vitest-before.txt`.
- Maestro `.maestro/build92-04-likes.yaml` (16 `16/maestro-likes-run3.txt`, SE `se/maestro-likes-se.txt`, 16 Pro
  Max `16promax/maestro-likes-16promax.txt`): guest A posts a Drink Water photo to everyone and sees the result row
  with the one badge and no heart on the own post (P1-23); a fresh guest B finds it first in the Everyone feed →
  double tap → heart "Liked by you" and "1 likes" (count +1) and nothing opened → second double tap → still 1,
  nothing opened → single tap → full screen (P1-22) → double tap there → Close → still "Liked by you", "1 likes".
  Runs 1–2 were flow fixes (the post sheet is not a ScrollView so a typed caption left the keyboard over the
  audience row — no caption; the heart row sits under the 4:5 photo — scroll to it). The first SE / Pro Max runs
  found an app bug: in full screen the like state came from a cache lookup that missed the infinite-query shape,
  so the double tap toggled the like OFF (count 0). Fixed in two places, with tests: the server's `feed.react`
  gained `mode: "like"` (never deletes an existing reaction) and every double-tap path uses it; the full-screen
  cache lookup reads `pages[]` too. The heart button keeps the toggle. The Pro Max rerun (run alongside two other
  simulators) stopped at the own-post `post-result` scroll with the row visible but under the tab bar — the flow
  asked for `centerElement`; it now accepts 50 % visibility. Pro Max alone then passed (all 3 devices PASS).
- Maestro `.maestro/build92-04-back.yaml` (16 `16/maestro-back-run3.txt`/`run4`, SE `se/maestro-back-se.txt`,
  16 Pro Max `16promax/maestro-back-16promax.txt`): a guest posts a 7K Steps check-off to everyone, then 3× feed →
  tap the post → detail (title "7K Steps", `post-menu` visible, no "Proof" title, no `post-done`) → Back → the feed
  with the same post on screen (`post-result` visible, `tab-home` visible). Then the frames: empty comments
  (P1-26), the owner menu Who sees this · Share · Delete post (P1-27), the composer on the keyboard (P1-25) and the
  sent comment (P1-24). Run 1: the guest "Save your challenge." prompt after Day secured (optional Later); run 2:
  the simulator shows the menu as a popover without Cancel (tap outside). P1-25 from run 3 showed the composer
  floating 100pt above the keyboard: `keyboardVerticalOffset` was the top inset + 44 on a view whose layout already
  reaches the window bottom; it is now 0 and the composer drops its safe-area padding while the keyboard is up.
- Screenshots next to the design frames (`design/handoff/b92/part1-finish-loop/frames/`): `16/`, `se/`,
  `16promax/`: `P1-19-feed-photo-post`, `P1-20-post-header` (SE: longest header, one line, "now" on the right),
  `P1-21-double-tap-burst`, `P1-22-full-screen`, `P1-23-own-post-no-heart`, `P1-24-proof-detail-comments`,
  `P1-25-composer-on-keyboard`, `P1-26-proof-detail-empty`, `P1-27-owner-menu`. Frames were matched to devices by
  pixel width (SE 750, 16 1178, Pro Max 1320). The 16 (not a gate device) has no `P1-20`: its likes run predates
  that step in the flow.
- Backend deployed twice (no SQL; additive input fields and feed item fields, build 91 clients send no `mode` and
  ignore `result`/`badge`): `35ea72d` then `4677dba`, each confirmed on `/api/health`.
- Full suite: see `04/vitest-final.txt` and `04/tsc-final.txt` (baseline set only). Pins moved with comments:
  `lib/feed-join.test.ts` (own-post double tap → noop; no `<CameraSeal`), `lib/build90-posting.test.ts` (no Done /
  Share outside on the Proof screen; Back goes back or Home), `lib/post-detail.test.ts` (image inside the gesture
  wrapper), `lib/build90-strava.test.ts` (Strava badge through `postBadge`), `lib/feed-actions.test.ts` (no timed
  self-reported line). None weakened: each inverted check is the Part 1 decision it pins.
- Self-check diff: no skipped tests, no `as any`, no console.log, no hard-coded colours; chunk 01–03 tests pass in
  the full run.

### Chunk 04 decisions made alone
- Result facts live in `activity_events.metadata.result` written at post time (complete + Strava webhook); older
  posts have none and show only their badge. No backfill, no migration.
- The badge is text in the result row (one per post); the camera seal overlay and its sheet are no longer rendered
  on the card (`CameraSeal.tsx` stays for the profile viewer).
- Likes: `feed.react` keeps toggling for the heart button; double taps send `mode: "like"`. Own-post double tap is a
  no-op on the client and FORBIDDEN on the server.
- Own posts with no likes yet show nothing in the heart's place (the copy has no empty line); "Liked by {name}"
  for one like, "Liked by {name} and 1 other" for two.
- Proof detail: Share in the owner menu opens the existing sticker sheet; Delete asks once with the copy-table
  note as the sheet title and calls the existing `checkins.unshareProof`; the feed card's menu uses the same words.
- The detail title is the challenge with the author under it (PushedHeader `titleSlot`); the route word "Proof"
  remains only as the loading fallback.
- The run post reads in the task's unit (`distance_unit` from the task config, default km).

### Chunk 04 not done / Needs Yaseen
- "Double-tap in full screen likes" from an unliked state is covered by the unit tests and the same wrapper; the
  Maestro flow reaches full screen already liked (one post per guest), so it checks keep-not-unlike there.
- Older posts (before this deploy) show no result line — only the badge — until re-posted. Backfill from
  `check_ins.verification_gates` would be a SQL job; not written since nothing in the spec asks for it.
- Android: the feed's own-post menu rows keep the legacy sheet (words updated); the detail's "…" menu is iOS-only
  (`ActionSheetIOS`), as the rest of the app's menus are.

## Chunk 05 · Share stickers

Design reference: `design/handoff/b92/part1-finish-loop/` frames P1-12 … P1-18 and the "4 styles × 3 themes" grid
(prototype section 1.3; viewport captures saved to `docs/reports/build92/05/design/stickers-*.png`); README copy
rows "Stickers", "Sticker content", "Upgrade sheet"; checklist lines "The sticker carousel swipes…", "Photo and Week
strip export freely…", "With no proof photo…", "The White theme shows no orange…", "Verified shows only…", "Stickers
export as a 1080×1920 story and as a transparent PNG."; `src/finish/stickers.ts` (styles, themes, Pro gate, export
sizes — reference only).

### 05.1 Carousel
- Root cause: `lib/share-image.ts:101` `MOMENT_STYLES` maps the task and day moments to the build 90 set (H day
  stamp, E streak, D progress grid, A photo) and `stylesForMoment` drops E at streak 0 and A without a photo, so the
  sheet shows 2–4 colour variants of the old cards, none of which is a Week strip, Streak glow or Progress ring.
  `components/share/ShareSystemSheet.tsx` has no style name, no Free / Pro label and a loose swatch row instead of the
  Ink · Orange · White control (P1-12/13/15).
- Change: new style ids `photo`, `week`, `glow`, `ring` in `MOMENT_STYLES` for `photo_proof`, `self_reported` and
  `day_secured` (always all four — the Photo style has an empty state, the streak reads 0 honestly); `STICKER_STYLES`
  meta (label, pro, transparent); paint branches per style and theme; the sheet gets the name row, the segmented
  theme control and dots. `challenge_finished` and `invite` keep their cards (not named by the chunk).
- Token mapping: handoff Barlow numerals → the shipped display face (`lib/display-face.test.ts` pins that Barlow is
  not loaded) at weight 800 with tabular nums; `surface` → `DS_V3.color.surface`; the segmented control uses
  `DS_V3.color.raised` for the selected pill.

### 05.2 No stock photos
- Root cause: `lib/share-image.ts:202` hides the photo card without a photo rather than painting a plain card; the
  transparent preview in build 90 (`SAMPLE_STORY`) was removed and nothing replaced it.
- Change: `photo` without `photoUri` paints the theme ground with the day stamp ("Photo · plain card" in the name
  row, P1-14). Transparent styles preview over the user's own proof photo when there is one, otherwise over a checker
  (no bundled photo; the grid's "sample photo" is a prototype stand-in and the chunk forbids stock).

### 05.3 Pro lock
- Root cause: nothing in `components/share/` knows about the entitlement; `stylesForMoment` has no Pro flag; the
  only paywall is the full-screen `/paywall` route, which cannot present over the full-screen share `Modal`.
- Change: `STICKER_STYLES[].pro`; the sheet reads `useProStatus()` (entitlement "GRIIT Pro",
  `lib/subscription.ts:15`); a locked card shows the lock chip, hides the export row and shows "Unlock with GRIIT
  Pro"; card or button tap opens `components/share/ProUpgradeSheet.tsx` (P1-18 copy) whose prices come from
  `getOfferings()` (monthly + annual package `priceString`); "Try GRIIT Pro" purchases through `purchasePackage` and
  refetches the entitlement, returning to the same style unlocked; "Not now" closes.

### 05.4 Verified mark
- Root cause: `buildSharePaint` paints a "Camera" seal from `cameraSeal` and never says Verified / Self-reported;
  Strava proof has no path to the sticker.
- Change: `ShareCardInput.proofSource?: "camera" | "strava" | "self"` with `stickerMark()` → "Verified" for camera or
  Strava, otherwise "Self-reported"; `cameraSeal: true` maps to camera for existing callers.

### 05.5 Export
- Root cause: `ShareSystemSheet.tsx:309` captures one 1080×1920 PNG of the full card; the transparent styles would
  ship as a 1080×1920 sheet of mostly empty pixels, and Instagram would scale the whole page as the sticker.
- Change: a second `ViewShot` of the sticker block alone (transparent, content-sized) feeds Copy sticker and the
  Instagram `stickerImage` for `glow` / `ring`; Save, Messages and More keep the 1080×1920 story file. Targets:
  Instagram Story · Copy sticker · Save · Messages · More. The toast "Share" opener from chunk 01
  (`app/(tabs)/_layout.tsx:95`) already shows this sheet, which is now the carousel; comments updated in
  `lib/sticker-carousel.ts`.
- Follow-up found while building: the carousel `Modal` lived in the tabs layout, whose view is detached under a
  pushed root-stack screen, so Day secured's "Share" (`app/task/secured.tsx`) opened nothing (chunk 02 only
  asserted the button). The opener registration and the sheet moved to `components/share/StickerCarouselHost.tsx`,
  mounted once in `app/_layout.tsx`; the tabs layout no longer owns share state.
- Story pixel size: `react-native-view-shot` sizes `width`/`height` in points × the device scale, so a 1080×1920
  target produced 3240×5760 on a 3× device. `storyShotSize(PixelRatio.get())` (`lib/share-image.ts`) divides the
  target by the scale; the file is now exactly 1080×1920 on every device.

### Chunk 05 gates and evidence
- vitest `lib/stickers-b92.test.ts` (15 tests, failing-first run `05/vitest-before.txt`): every task/day moment
  lists Photo · Week strip · Streak glow · Progress ring in that order and in every state; style meta (Free / Pro /
  transparent); the sheet shows the style name, the Free / GRIIT Pro tag, the Ink · Orange · White control, the
  lock and "Unlock with GRIIT Pro"; the White theme paints no orange (flame glyph excepted), the ring stroke and
  track are never orange on White, the Orange theme is an orange plate with ink type; the plain card paints for
  every theme and reads "Photo · plain card"; no bundled jpg/png or unsplash URL in the sheet or painter; the Photo
  card carries "Day 16", "Read 30 · Day 16 of 30", "Verified", "@yaseen · griit.app"; the upgrade sheet copy, the
  live price line, "Try GRIIT Pro" through `getOfferings()` / `purchasePackage(` with no `$d.dd` literal; the
  Verified / Self-reported mark; the week strip cells; the carousel host in the root layout; the story shot size
  (3× → 360×640 pt, 2× → 540×960 pt, both 1080×1920 px).
- Maestro `.maestro/build92-05-stickers.yaml` (SE `se/maestro-stickers-se.txt` PASS, 16 Pro Max
  `16promax/maestro-stickers-16promax.txt` PASS, 16 `16/maestro-stickers-run1..8.txt`, run 8 reached Save and
  failed only on a since-removed "Self-reported" text assert — that text sits inside the scaled preview and is
  pinned by vitest instead). Guest A (camera prelude) posts a Show Up 7 photo → Day secured → Share → the
  carousel: "Photo" + "Free" + theme control (P1-12 Ink, P1-13 White) → swipe → "Week strip" (P1-15 White) →
  swipe → "Streak glow" with the lock chip and "Unlock with GRIIT Pro", no "Instagram Story" (P1-16) → swipe →
  "Progress ring" (P1-17 Orange) → Unlock → `pro-upgrade-sheet` with the full copy (P1-18) → Not now → still on
  "Progress ring" → back to "Week strip" → the five targets → Save → "Saved to Photos." → Close. Guest B posts a
  7K Steps check-off → Day secured → Share → "Photo · plain card" (P1-14 Orange) → Close. Runs 1–7 were flow
  fixes and two app bugs: the detached carousel host (above) and an RN `processFontVariant` crash on the ring card
  when `fontVariant` went from an array to `undefined` (now always an array).
- Export check (`05/export/export-check.txt`, files `export-1..2.png`, flow `16/maestro-export-check.txt` through
  the dev screen `griit://dev/share-styles` "Export build 92 stickers to tmp"): the story file is 1080×1920 RGBA;
  the transparent sticker block is RGBA with 85 % fully transparent pixels (an earlier run of the same path:
  transparent ring story RGBA, 86.9 % transparent; opaque stories 0 %).
- Screenshots next to the design frames: `05/se/`, `05/16promax/` P1-12 … P1-18 (7 each); `05/16/` 6 (its run
  predates the P1-14 step). Design references: `05/design/stickers-*.png` (prototype 1.3 grid, viewport captures).
- Full suite `05/vitest-final.txt`: baseline 4 failures only. `05/tsc-final.txt`: baseline 5 only. Pins moved with
  comments ("Build 92 05.x"): `lib/share-image.test.ts` moment map; `lib/build90-posting.test.ts` 04.6 set tests
  (the set no longer shrinks at streak 0 / no photo — each case now asserts the four cards) and the 04.5 mapper
  pin (reads `StickerCarouselHost.tsx` instead of the tabs layout).
- Self-check diff: no skipped tests, no removed assertions beyond those pin moves, no hard-coded prices (the sheet
  shows "Loading prices…" / "Prices aren't available right now." until the offering arrives), no console.log;
  chunks 01–04 tests pass in the full run.

### Chunk 05 decisions made alone
- Footer word: the copy table's "Sticker content" row gives `@handle · griit.app`; `STICKER_FOOTER_DOMAIN` holds the
  domain so one place changes it.
- "Try GRIIT Pro" buys the annual package when the offering has one, else monthly (the sheet lists both prices; the
  design frame has one button). No introductory-offer logic: the price line shows `priceString` as RevenueCat gives it.
- Transparent styles preview over the user's own proof photo when there is one, otherwise a checker; no sample photo
  ships in the app (05.2). The dev review screen uses a picsum URL as a stand-in for the Photo style only.
- The carousel host moved to the root layout (needed for Day secured; see 05.5).
- The caption row stays under the card (chunk 01 copy); it hides while a style is locked so the unlock button sits
  where the targets were.
- The week strip reads the last seven cells of the challenge grid ending today when cells are passed, else it is
  reconstructed from the streak count (a toast carries no grid).
- Theme labels are Ink · Orange · White as pills (segmented) instead of three swatches; the selected pill uses the
  raised surface.
- Instagram Story uses the transparent sticker as `stickerImage` for glow / ring (and the story file as the
  background); Photo and Week strip send the story file only.

### Chunk 05 not done / Needs Yaseen
- Live offering prices on the simulator: RevenueCat returns no offering, so P1-18 shows "Prices aren't available
  right now." The sheet, the price line and the purchase path are wired; verify on a device with a sandbox tester
  (or add a StoreKit configuration to the dev client scheme) — Needs Yaseen, no code change expected.
- Earlier-chunk observations for 04 / 07: a photo post's single tap opens the full-screen photo, so photo posts have
  no feed path to proof detail (check-off posts do); `app/profile/posts.tsx` Comment → post detail does not navigate
  from the profile Posts list (the slide starts and stops). Both outside this chunk's items; not changed.
- The dev-client LogBox banner (a RevenueCat console error on the simulator) can cover the upgrade sheet; the flow
  dismisses it. Not a release-build concern.
- The 16 set has no P1-14 (the gate devices SE and Pro Max have it).

## Chunk 06 · One source for every number

Spec: top-level README "Each number has one server field"; Part 2 README "The numbers (one source each)" table
(`user_stats.current_streak / best_streak / secured_days / verified_days / proof_count`) and checklist lines
"Streak, Best, Days secured and Verified match…", "Each number reads its server field…"; Part 3 line "After joining,
the top numbers are exactly "Day {n} of {N}" and "{n} days secured", derived from the same day records as the dots".

### 06.1 Root cause of each mismatch (written before any change)
- **Profile "Best 6" vs Your data "Best 7 · Oct 7 – Oct 13".** Profile header: `app/(tabs)/profile.tsx:258`
  `bootstrap.stats.longestStreak` ← `backend/trpc/routes/profiles-stats.ts:225` `max(streaks.longest_streak_count,
  active)` — a counter the SQL `secure_day` RPC increments per secured day (a freeze-held day restores the previous
  count and adds nothing). Your data: `components/profile/YourDataTab.tsx:114` `meStats.user_stats.best_streak` ←
  `backend/lib/me-stats.ts:70` `bestStreakRun(secured ∪ held)`, which recomputes from `day_secures` + `freeze_uses`
  and counts the held day in the run. Two formulas (counter vs recount; held day counted or not) → 6 vs 7.
- **"19 proofs" vs "25 proofs".** Your data: `me-stats.ts:212–218` counts `activity_events` `task_completed` rows
  with a photo, de-duplicated by photo URL (limit 500). Proofs tab: `lib/proofs-grid.ts:87` `proofsCountLine(
  getRecord.proofs.length)` ← `backend/trpc/routes/profiles-record.ts:418` `cameraProofTiles` built from
  `check_ins` rows with a proof image (limit 800, no de-dup, one tile per check-in). Different tables, different
  de-dup → 19 vs 25.
- **"Workout every day: 5 of 7 days" vs "0 of 4 days secured".** Your data enrollment line: `me-stats.ts:247–258`
  sets `secured_days: day` where `day` is the elapsed *day number* and `due_days` is the *duration*, so the bar reads
  "day 5 of 7" and is labelled as if secured. The challenge card / page: `backend/lib/enrollment-day-stats.ts:36–53`
  and `backend/lib/secured-elapsed.ts:55` count secured days of elapsed days (today only once secured) → "0 of 4".
  Same enrollment, numerator and denominator both different.
- **"Wake up at 5: 7 of 7" vs "Left on day 5".** Your data: `me-stats.ts:166–170` `enrollmentEnd` ignores
  `ended_at` for a `left` enrollment unless it precedes the planned end and the line (above) prints the day number
  through that end → "7 of 7". Profile Challenges: `lib/profile-challenges.ts:73` prints `ended_on_day` (5) and
  `:81` the secured count. The Your data line never says the challenge was left.
- **Current streak on Home / Profile:** `app/(tabs)/index.tsx:446` and `app/(tabs)/profile.tsx:266` override the
  server value with `streakFromDays(uDays)` computed on the client from the record's day array — a third formula.

### 06.2 Server fields
- Decision (no SQL): the five numbers are computed once in `backend/lib/user-stats.ts` `computeUserStats` from the
  existing tables (`day_secures`, `freeze_uses`, `check_ins`), loaded by one helper `loadUserStats` and attached as
  `user_stats` to `profiles.getStats` (so `home.bootstrap.stats` carries it), `profiles.getRecord` and
  `profiles.meStats`. `getStats.activeStreak / longestStreak / totalDaysSecured` and `getRecord.streak` are set from
  the same object; no view, function or column is needed, so nothing waits on SQL and the backend can deploy.
- Definitions (Part 2 table): `current_streak` = secured days in the unbroken chain of secured-or-held days ending
  today (if secured) or yesterday, else 0; `best_streak` = the longest such chain's secured count with its first and
  last dates; `secured_days` = all `day_secures` up to today; `verified_days` = secured days where every completed
  check-in that day had camera or Strava proof; `proofs_count` = completed check-ins with proof (photo or Strava).
  A held day keeps the chain and never adds to the count (README: "A freeze holds the streak but doesn't count as a
  secured day"); this matches the SQL counter's behaviour on the Day secured screen.
- Per challenge: `challenges.progress({ activeChallengeId })` returns `day_number`, `total_days`, `days_secured`,
  `elapsed_days` and `days[]` states (before_join / secured / held / missed / today / future) from the same
  `enrollmentDayStats` + `day_secures` the dots use; the page prefers it and keeps its local computation only until it
  loads.
- Client readers stop computing: Home and Profile drop the `streakFromDays` override; Profile header reads
  `stats.user_stats`; the Proofs tab count line reads `proofs_count`; Your data reads the shared `user_stats` and
  the enrollment lines come from `enrollmentDayStats` ("{secured} of {elapsed} days secured", "Left on day n ·
  {secured} of {elapsed} secured").

### 06.3 Freeze rule
- Root cause: `backend/trpc/routes/streaks.ts:34–42,131–150` refills a monthly allotment (Free 1 / Pro 4) 30 days
  after the last use, on top of the earned-at-7 grant (`backend/lib/freeze-grant.ts`), and
  `app/settings/index.tsx:128` says "Free plan · 1 streak freeze a month"; `components/paywall/PaywallControl.tsx:18`
  says "4 streak freezes per month (free: 1)"; `streaks.ts:261` "No streak freezes left this month."
- Change: remaining = min(stored, hold cap) — no refill; the cap is 2, 4 with Pro; the Settings, paywall and error
  copy describe the earn rule.

### 06.4 Progress-bar wording
- Definition applied: "{secured} of {elapsed} days secured" where elapsed = days before today plus today once
  secured (`enrollment-day-stats.ts`, `secured-elapsed.ts`). The Your data bar and line move to it; the old
  "{day} of {duration} days. Today counts." line goes.

### Chunk 06 before and after (the four mismatches)
The fixtures in `backend/lib/user-stats.test.ts` ("Yaseen-like": 8 secured days 10-08…10-18 with 10-11 held and
10-16/17 missed; camera, Strava and self-reported check-ins) make each pair concrete:

| Pair | Before (two code paths) | After (one field) |
| --- | --- | --- |
| Profile Best vs Your data Best | header: `streaks.longest_streak_count` counter; Your data: `bestStreakRun(secured ∪ held)` → the held day counted, so 7 secured days read "Best 8 · Oct 8 – Oct 15" against "Best 7" | both `user_stats.best_streak` = 7, `Oct 8 – Oct 15` (chain dates, held day keeps the chain, counts nothing) |
| "19 proofs" vs "25 proofs" | Your data: photo `activity_events` de-duplicated by URL; Proofs tab: one per `check_ins` tile | both `user_stats.proofs_count` = completed check-ins with camera or Strava proof (fixture: 8) |
| "Workout every day: 5 of 7 days" vs "0 of 4 days secured" | Your data: day number of duration ("5 of 7 days. Today counts."); card: secured of elapsed | both `enrollmentProgress` → "3 of 5 days secured" (fixture enrollment from 10-14) |
| "Wake up at 5: 7 of 7" vs "Left on day 5" | Your data: day number through the planned end for a left enrollment; Challenges: `ended_on_day` | Your data: "Left on day 5 · 4 of 5 secured" from the same records |

### Chunk 06 gates and evidence
- vitest consistency test `backend/lib/user-stats.test.ts` (17 tests; failing-first run `06/vitest-before.txt`
  — the module did not exist): three seeded users (Yaseen-like with a freeze and misses, fresh, lapsed) through
  `computeUserStats`; `buildMeStats` returns the same current/best/dates/secured/proofs/verified; the routes attach
  `user_stats` from the one `loadUserStats` and set the legacy `activeStreak / longestStreak / totalDaysSecured /
  streak.current / streak.best` from it; the clients read the fields (Home and Profile no longer call
  `streakFromDays`, the Proofs tab count and the challenge page read `proofs_count` / `challenges.progress`);
  `enrollmentProgress` equals `enrollmentDayStats` and `securedElapsed` for the same keys and stops at a left
  enrollment's end; Your data lines; the freeze rule (no refill, cap 2 / 4, copy gone).
- Maestro `.maestro/build92-06-numbers.yaml` — SE `06/se/maestro-numbers-run6.txt` PASS, 16 Pro Max
  `06/16promax/maestro-numbers-16promax.txt` PASS (runs 1–5 were flow fixes: the guest's "Save your challenge."
  prompt after Done is where the account is created; the simulator has no soft keyboard to hide; Maestro matches
  the whole label, the profile card is "Open Show Up 7 challenge"). A fresh `b89num…@example.com` (is_test)
  account secures Day 1 of Show Up 7 with a photo, then: Home "1 · day in a row · Your best"; Profile "1 Streak ·
  1 Best · 1 Days secured"; Your data "1-day streak · Best 1 · Oct 18 · 1 proofs"; the challenge page "Day 1 of 7 ·
  1 of 1 day secured" (and the Profile Challenges card "Day 1 of 7 · 1 of 1 day"). Screenshots
  `06-home-numbers`, `06-profile-numbers`, `06-your-data-numbers`, `06-profile-challenges-card`,
  `06-challenge-numbers` in `06/se/` and `06/16promax/`. Limit: a Maestro account cannot carry days of history,
  so the flow proves the four surfaces read the same source on a one-day record; the multi-day cases (freeze,
  misses, left challenge) are the vitest fixtures above.
- SQL: none needed. The one source is computed server-side from existing tables (`day_secures`, `freeze_uses`,
  `check_ins`); no view, function or column. `docs/sql/build92.sql` has no chunk 06 entry.
- Backend deployed (no SQL; additive — `user_stats` on three responses, new `challenges.progress`, freeze status
  unchanged in shape; build 91 clients ignore the new fields): `de7d012d`, `railway up --service grit-backend`,
  `/api/health` → `"commit":"de7d012"`. `backend/deploy-sha.txt` is git-ignored; it holds `de7d012d` locally.
- Full suite `06/vitest-final.txt`: baseline 4 only. `06/tsc-final.txt`: baseline 5 only. Pins moved with
  "Build 92 06.x" comments: `backend/trpc/routes/home.test.ts` and `profiles-stats.test.ts` (streak numbers now
  come from the mocked `day_secures`, not the `streaks` counter), `streaks.test.ts` (monthly allotment → held
  count capped), `backend/lib/me-stats.test.ts` (`userStats` input; "secured of elapsed" lines),
  `lib/chunk-u-feed.test.ts` and `lib/consistency.test.ts` (Home/Profile no longer reduce the day array).
- Self-check diff: no skipped tests, no `as any`, no console.log, no hard-coded numbers; chunk 01–05 tests pass
  in the full run (`lib/stickers-b92.test.ts`, `lib/post-result.test.ts`, … all green).

### Chunk 06 decisions made alone
- Server-side computation instead of a SQL view: `backend/lib/user-stats.ts` reads the existing tables, so the
  chunk does not wait on SQL and the backend could deploy. A view would be a later speed step (chunk 11).
- A held day keeps the chain and never adds to any count (streak, best, secured). `Best N · dates` therefore
  spans the chain including held days while N counts secured days only. This matches the SQL `secure_day` counter
  the Day secured screen shows right after a finish, so the two never disagree.
- `verified_days` requires every completed check-in that day to carry camera or Strava proof; a day with no
  check-in rows (older data) is not verified. `proofs_count` counts completed check-ins with a proof image or
  Strava source (no de-dup by URL — one task, one proof).
- The Proofs tab's "N proofs · newest first" reads `proofs_count` (the grid still shows photo tiles only, so the
  line can exceed the tiles when a Strava proof has no photo).
- The streak-row (`streaks.active_streak_count`) and `profiles.total_days_secured` are still written by the
  finish path for last-stand and tier logic; they are no longer displayed.
- `challenges.progress` is a new read procedure; the page keeps its local `enrollmentDayStats` only as the
  loading stand-in (same formula, same keys).
- Freeze copy: Settings "Earn a freeze at each 7-day streak. Hold up to 2." (Premium: "hold up to 4 freezes");
  paywall "Hold up to 4 freezes (free: 2)"; error "No freezes left. You earn one at each 7-day streak." The
  README has no copy row for these; sentence case, no exclamation.
- `ProfileHeader` stats gained an accessibility label "1 Streak" (one element per number) so the flow can read
  them; no visual change.

### Chunk 06 not done / Needs Yaseen
- Older accounts whose finished days predate `check_ins` proof columns show fewer verified days / proofs than the
  old photo-event count until a backfill from `activity_events.metadata` is written — not in the spec; flagging.
- `loadUserStats` reads up to 5000 check-ins per call on three procedures; fine for build 92 users, a candidate
  for one cached row (or the SQL view) in chunk 11.
- Share cards (`ShareStickerSheet`, Day secured) still take `streak` from the finish response's counter, which
  equals `user_stats.current_streak` under the held-day rule; not re-plumbed here.
- The Maestro check uses a one-day record (above); the multi-day consistency is unit-tested only.

## Chunk 07 · Profile and post viewer

### 07.1 Scroll freeze · root cause (written before the fix)
`app/profile/posts.tsx` (build 91):
- Every post renders its full-resolution `photoUrl` in an expo-image sized `aspectRatio: 1` at screen width
  with no `recyclingKey` and no fixed layout. FlashList recycles the row but the image view decodes a fresh
  1080–4000 px file for each recycled cell, so a 25-post scroll decodes 25 full files on the UI thread.
- The header fade is an `Animated.event` with `useNativeDriver: false` and `scrollEventThrottle 16`: every
  scroll frame crosses the bridge and re-renders the header on the JS thread.
- `onViewableItemsChanged` depends on `posts` and calls `Image.prefetch` for every visible full photo on each
  change; a long list repeats the prefetches during the whole scroll.
- `scrollToIndex` runs from each image `onLoad` while `landed` is false, so late loads re-scroll the list.
Design references: P2-12 (own viewer), P2-13 (two-photo post, 1 of 2); Part 2 checklist lines 102–105.

### 07.2 – 07.6 · design references
- Header: P2-01 (own, Option A), P2-07 (visitor, not following), P2-08 (visitor, following, long name, empty
  bio, zero numbers); checklist lines 88–91, 97, 99. Copy: "Streak · Best · Days secured · {n} verified",
  "{n} followers · {n} following", "Edit profile · Find friends", "Follow · Following · Invite to a challenge".
- Proof grid: P2-01; checklist line 92 (3 columns, 4:5, date on a small bottom label), line 101 (empty and
  offline copy, "Try again" refetches). Copy table row "Proofs".
- Your record: P2-03 (Challenges), P2-05 (Badges), P2-06 (Stats); checklist lines 93–96. Copy table rows
  "Record row", "Your record", "Badges", "Stats".
- Loading: P2-09; checklist line 100 (header from cache, grid skeleton, never blank).

### 07.1 Scroll freeze · fix and numbers
- `components/profile/PostViewer.tsx` (new) replaces the list in `app/profile/posts.tsx`: RN `Animated.FlatList`
  with `getItemLayout` from per-post heights computed from the data (`postRowHeight`, prefix offsets),
  `initialScrollIndex` at the tapped post, `windowSize 5`, `initialNumToRender 2`, `maxToRenderPerBatch 2`,
  `removeClippedSubviews`; expo-image with `recyclingKey={uri}`, `allowDownscaling`, memory-disk cache; the
  top-bar glass is an `Animated.event` with `useNativeDriver: true` (opacity only) at throttle 32; the first
  three photos around the opened post are prefetched once (`posts.tsx`), not on every viewability change.
- Harness: `app/dev/build92-posts.tsx` (25 synthetic 2000 px posts, `mode=new|legacy`, JS frame meter from
  `lib/frame-meter.ts`), `app/dev/build92-grid.tsx` (25-tile `ProfileProofs` over the viewer),
  `lib/dev-synthetic-posts.ts`. Flow `.maestro/build92-07-frames.yaml`, 16 Pro Max simulator, 10 s of swipes:
  | run | list | frames | max | over 50 ms | avg |
  |---|---|---|---|---|---|
  | before | legacy (FlashList, full-res, JS scroll) | 599 | 44 ms | 0 | 16.7 ms |
  | after run 1 | PostViewer (fixed row, nested pager) | 596 | 59 ms | 1 | 16.8 ms |
  | after run 2 | + per-item heights, plain image for 1-photo posts, batches of 2 | 597 | 52 ms | 1 | 16.8 ms |
  | after run 3 | same code, meter opens 300 ms after the tap | 597 | 54 ms | 1 | 16.8 ms |
  Screenshots `docs/reports/build92/07/16promax/07-frames-*.png`, logs `frames-*.log`.
- Honest reading: the simulator does not reproduce the build 91 freeze through JS frame times (the legacy
  harness row is also lighter than the real build 91 card: no action row, no DoubleTapRespect). The new
  viewer shows one frame of 52–59 ms per 10 s run, most likely the mount of a batch of two cards. Two fix
  attempts were spent; the gate "no frame over 50 ms" is **not met strictly** and the chunk is marked FAILED on
  this gate only. The root-cause changes (recycled decoding, fixed layout, native-thread bar, single prefetch)
  are in. A device check with real camera photos is the real test.

### 07.2 Header (P2-01, P2-07, P2-08)
- `components/profile/ProfileHeader.tsx`: Streak (flame) · Best · Days secured with `verifiedLine()` under it
  (`user_stats.verified_days`); one `followLine()` ("{n} followers · {n} following", singular "1 follower"),
  each half tappable; no Friends count, no Message button; own: Edit profile · Find friends; visitor:
  Follow/Following (primary fill when not following) · Invite to a challenge (`shareInvite`). Name wraps to
  2 lines; empty bio leaves no gap. Record row (Option A) under the buttons, `testID="profile-record-row"`.
  The number elements keep their chunk 06 labels ("1 Days secured"); "1 verified" is its own element.
- `components/profile/ProfileV3.tsx` is now header-only (root header + ProfileHeader + locked copy); the tab
  strip, tab bodies and badge rendering left it. Props `friends/friendFaces/isFriend/onMessage/onFriends/
  tab/onChangeTab/runs/proofs/badges/badgeGrid/consistency*/onSeeRecord` removed; `verifiedDays`, `record`,
  `onRecord` added. Callers: `app/(tabs)/profile.tsx`, `app/profile/[username].tsx`, `app/dev/build81-friends.tsx`.
- Copy helpers in `lib/profile-header.ts` (`followLine`, `verifiedLine`, `recordRowLine`, `postViewerTitle`,
  `photoPagerLine`, `INVITE_TO_CHALLENGE`, `PROFILE_RECORD_TABS`).

### 07.3 Proof grid first (P2-01)
- `components/profile/ProfileProofs.tsx` renders directly under the header on both profiles; tiles
  `aspectRatio 4/5`, 3 columns, date on the bottom scrim. Empty copy from the Part 2 table: "No proofs yet." ·
  "Finish a task and it shows up here." with "Start today's task" (a run is open) or "Find a challenge";
  `lib/g3-profile.ts` `NO_PROOFS_BODY` updated (its test updated with the reason). Offline state
  "Couldn't load proofs. You're offline." + "Try again" (`offline`, `onRetry` props; own profile passes
  `recordQuery.isError`). `ProofGridSkeleton` (six 4:5 tiles) exported for 07.6.

### 07.4 Your record (P2-03, P2-05, P2-06)
- `app/profile/record.tsx` (new), `ROUTES.PROFILE_RECORD` / `PROFILE_RECORD_TAB(tab)`. Segmented
  Challenges · Badges · Stats. Challenges = `ProfileChallenges` (Running · Finished · Left; rows from
  `rowsFromProfileRecord` with the shared `todayTaskCounts` left counts). Badges = `BadgeGrid` (next /
  earned / locked) with the `BadgeRows` fallback. Stats = "Streak history · free" card (Best with
  `best_streak_start – best_streak_end`, Current), the existing `YourDataTab`, then "Deeper stats · GRIIT Pro"
  → "Deeper stats are part of GRIIT Pro" / "Charts, best times, verified %, month over month." / "Try GRIIT Pro"
  (opens `ProUpgradeSheet`); hidden for Pro.
- Visitor: the record row pushes `/profile/record?userId=…&handle=…`; tabs are Challenges · Badges only (no
  Stats, checklist line 98), data from that user's gated `getRecord`, visitor badges only from `record.badges`
  (no client computation; privacy pin moved to this file). Title is `@handle`.
- `lib/profile-record.ts`: copy constants, `recordCountsFromRecord` (running = runs, finished =
  completed with status `completed`, badges = earned), `streakSpanLine`.

### 07.5 Post viewer (P2-12, P2-13)
- Title `postViewerTitle(challenge)` → "Posts" (or the challenge name when the route passes `challenge`).
  Photos of a post (`photoUrl` + a distinct `proofPhotoUrl`) swipe in a paged row with "1 of 2"
  (`photoPagerLine`); one photo renders a plain image. Own posts: `likedByLine(lastReactorName, count)`
  ("Liked by Sara and 2 others"), else "{n} likes", no heart; visitors keep the heart. Back returns to the
  grid at the same tile (the profile list stays mounted; the viewer is a pushed modal).
- Flow `.maestro/build92-07-back.yaml` (dev grid → tile 10 → viewer at post 10 → 5 swipes → Back → tile 10
  visible) ×3 in one run: PASS on 16 Pro Max (`back-run2.log`) and SE (`back-se-run1.log`, scrolls the grid).

### 07.6 Header from cache (P2-09)
- `lib/profile-header-cache.ts` `useProfileHeaderCache(userId, live)`: reads `griit.profile.header.<userId>`
  from AsyncStorage once, writes the live snapshot when anything but `savedAt` changed; strict parse drops
  partial snapshots. Own profile: while `profile` is loading the header renders from the snapshot (or
  `ProfileHeaderSkeleton`) over `ProofGridSkeleton`; once the profile is in, the header is live and only the
  grid skeletons until `getRecord` lands. Never a blank screen.
- Measured: `[b92-07] profile header visible after 47 ms (live)` and `48 ms (live)` after a cold relaunch
  (Metro log; `AppContext` already had the profile, so the live path won the race; the cache path is pinned
  by unit tests). The relaunch flow `.maestro/build92-07-relaunch.yaml` captured the loaded header within one
  Maestro step (`P2-09-profile-loading.png` shows the full header; the skeleton window is shorter than a step).

### Chunk 07 · gates and evidence
- [ ] Scroll freeze numbers: before max 44 ms / 0 over 50; after max 52–59 ms / 1 over 50 in ~597 frames
      (table above). **Not met strictly** — one frame over 50 ms per run.
- [x] Maestro tile 10 → 5 posts → Back on tile 10, 3 runs: `back-run2.log` (Pro Max) and `back-se-run1.log`
      (SE) both "Repeat 3 times... COMPLETED"; screenshots `07-viewer-at-10.png`, `07-back-on-tile-10.png`.
- [x] Header within 300 ms: 47 ms and 48 ms logged (see 07.6).
- [x] Screenshots next to P2-01, P2-03, P2-05, P2-06, P2-07, P2-09, P2-12 on SE and Pro Max:
      `docs/reports/build92/07/{se,16promax}/P2-*.png` (flows `screens-promax-run1.log`, `screens-se-run2.log`,
      `relaunch-*.log`). P2-08 (visitor, following) could not be staged with a single fresh account: the
      stranger preview gives the not-following state only (noted under not done).
- [x] Tests: `lib/build92-profile.test.ts` 23 tests (failed before: `test-before.txt`; pass: `test-after.txt`);
      full suite 2219 passed, 4 failed = the baseline four (`vitest-full.txt`); tsc 5 errors = baseline (`tsc.txt`).

### Chunk 07 · decisions made alone
- Option A (record row) per the README's recommendation; the row text wraps to 2 lines on Pro Max rather
  than truncating.
- Visitor record screen: Challenges · Badges, title `@handle` (the copy table only names "Your record").
- Own viewer with no reactor name shows "{n} likes" (copy rule "likes"), nothing at 0 likes.
- The visitor "Share profile" button left the header (the top-bar More menu still shares); the own Share
  icon stays in the root header.
- Stats tab hides the Pro card for Pro users; the free content is the same for both.
- Harness measurements stand in for a real 25-post profile (a real one needs 25 days of data or DB writes).

### Chunk 07 · tests moved (behaviour moved, none weakened)
`lib/challenge-card.test.ts`, `lib/chunk-u-profile.test.ts`, `lib/consistency.test.ts`,
`lib/profile-bootstrap-source.test.ts`, `lib/glass.test.ts`, `lib/home-streak.test.ts`,
`lib/profile-read.test.ts`, `lib/build90-links-numbers.test.ts`, `backend/lib/account-privacy.test.ts` pinned
the tab strip, the consistency headline props (already `void`-ed in ProfileV3), the posts.tsx glass bar, the
visitor badges source and the per-challenge rows in `profile.tsx`; each now pins the same behaviour at its new
file, with a "Build 92 07.x" comment. `lib/g3-profile.test.ts` pins the Part 2 empty-grid copy.

### Chunk 07 · not done / needs Yaseen
- 07.1 frame gate (above). Please scroll a real 20+ post profile on a device; the viewer logs nothing, so the
  check is by eye plus the dev harness `griit://dev/build92-posts?mode=new`.
- P2-08 (visitor · following) and P2-13 (visitor two-photo post) screenshots need a second account that
  follows the first; not staged.
- The Today tile's fallback left-count while the bootstrap has not loaded is now `record.runs.length`
  (was the per-row sum, which also had no bootstrap counts yet); the bootstrap value wins as before.
- `app/profile/consistency.tsx` has no entry point now (its row was replaced by the record row); left in place.
- The own viewer lists a photo-less "day secured" event under the proof post (build 91 did too); Part 1 rules
  for which events are posts are unchanged here.

## Chunk 08 · Invite, leaderboard and settings

### Root causes (written before the fix)
- 08.1 `lib/invite-link.ts:23` `inviteLinkFor(challengeId)` → `lib/deep-links.ts:28` `inviteDeepLink`: the "code" is
  the challenge UUID and, with no `EXPO_PUBLIC_DEEP_LINK_BASE_URL`, the link is `griit://i/<uuid>?ref=<uuid>`.
  `components/InviteLinkRow.tsx:32` renders that string as visible text on create-success, the waiting room and
  the leaderboard. There is no server-side code store; `app/invite/[code].tsx:28` decodes the code as a challenge id.
- 08.2 `backend/hono.ts` has no `GET /i/:code`; a link opened without the app goes nowhere.
- 08.3 `components/activity/LeaderboardTab.tsx:257` shows the raw link block whenever the board is empty;
  Share is the EmptyState action and Copy is a secondary row with "Copied" (not "Link copied.").
- 08.5 `backend/trpc/routes/leaderboard.ts:396` sorts by secured then display name; no Verified count, no
  `lastSecuredAt`; `lib/challenge-board.ts:46` repeats the same tie rule; `BoardRow` shows "secured" with no
  "You" label. is_test is already dropped at `leaderboard.ts:308`.
- 08.6 `lib/settings-rows.ts:32` says "Connected", not "Connected as {name}"; no Apple Health row; no Pro perks list.
Design references: P2-14 (invite sheet), P2-15/16/17 (leaderboard), P2-18 (landing), P2-19 (accept),
P2-20/21 (settings); Part 2 checklist lines 106–118; copy table rows "Invite sheet", "Share message", "Landing",
"Accept". Handoff `src/invite/invite.ts`, `src/challenge/leaderboard.ts`, `src/settings/connections.ts`.
Decision: short codes live in the existing `invite_tracking` table (`referrer_user_id`, `challenge_id`,
`invite_code`, `source = 'invite_link'`, `referred_user_id` null until accepted) — no migration, no SQL.

### Chunk 08 · state on resume (Oct 18, 23:15, new chat on Claude Opus)
`git status` / `git diff` on top of `41a48b05` (the interim code commit, deployed):
- Modified, not committed:
  - `app/challenge/[id]/invite.tsx`: the bottom "Share a link" button (raw `inviteToChallenge`) is gone; the
    `InviteSheet` (P2-14) sits at the top of the picker. Unused `Link`, `Button`, `Divider`, `ICON` removed.
  - `backend/lib/invite-store.ts`: `loadInviteChallenge` counts live `active_challenges` rows for the landing
    page's people count (`participants_count` lagged at 0); takes the larger of the two. **Not deployed yet.**
  - `components/activity/LeaderboardTab.tsx`: `BoardRow` exported so the dev board reuses it.
  - `components/challenge/ChallengeDetailV3.tsx`: the "{n} of 10" chip shows only for a group room opened
    through an invite; a public challenge keeps its own count.
- Untracked: `.maestro/build92-08-invite.yaml` (two-account flow), `app/dev/build92-board.tsx` (5 / 10 member
  board, same `rankBoard` + `BoardRow`), `docs/reports/build92/08/landing-0jeQjRVg.html`, SE screenshots
  `docs/reports/build92/08/se/{P2-14-invite-sheet,P2-14-link-copied,P2-18-landing-safari,P2-19-invite-accept,08-b-first-task}.png`.
- Overwritten-then-restored file: `lib/invite-code.ts`. `git diff 838e8765 HEAD -- lib/invite-code.ts` is one
  doc-comment line (`griit://i/<uuid>` → "an older scheme link", for the grep gate); the parser is
  byte-for-byte the chunk 07 version and the working tree matches HEAD. The fetch cache that had overwritten it
  lives in `lib/invite-code-fetch.ts`. Only intended changes remain.
- `/api/health` commit `41a48b0` = HEAD; the only backend change since is the `invite-store.ts` edit above, so
  the backend is redeployed with the final chunk 08 commit.

### 08.1 Short invite codes
`backend/lib/invite-codes.ts` draws 8 characters from a 62-character alphabet (`crypto.randomInt`, injectable for
retry on a clash); `backend/lib/invite-store.ts` stores one code per (inviter, challenge) in `invite_tracking`
(no migration). `invites.create` / `invites.resolve` in `backend/trpc/routes/invites.ts`. Links read
`{INVITE_BASE_URL}/i/{code}` (`lib/config.ts`, `lib/deep-links.ts` `inviteDeepLink`). Tests:
`backend/lib/invite-codes.test.ts` "uses a 62-character alphabet and at least 6 characters", "does not repeat across
many draws and is not a UUID", "maps a stored row back to the challenge and inviter", "self-invite, full room,
member, ended and open outcomes" (failed before: `08/test-before.txt`, the module did not exist; pass: `08/test-after.txt`).

### 08.2 Landing page (P2-18)
`GET /i/:code` in `backend/hono.ts` renders the challenge name, days, inviter, people count, the App Store button and
an "Open it" `griit://invite/{code}` fallback. No associated-domains entitlement exists, so no universal link (listed
under needs Yaseen). The people count now reads live `active_challenges` rows (`participants_count` lagged at 0).
Evidence: `08/curl-landing.txt` (200, title "user_5a0f3804 invited you to Show Up 7"; unknown code 404 "This invite
link doesn't work any more."), `08/se/P2-18-landing-safari.png`.

### 08.3 Invite sheet (P2-14)
`components/InviteSheet.tsx`: preview (challenge, "Join me. Day 1 is today.", short link), Share primary (system
sheet), Copy link secondary with the toast "Link copied.". Shown on create success (`LaunchedScreen`), the empty
board, and the challenge Invite screen (`app/challenge/[id]/invite.tsx`, where it replaces the bottom "Share a link"
button). The raw link block (`components/InviteLinkRow.tsx`) is deleted. Screens: `08/{se,16promax}/P2-14-*.png`.

### 08.4 Accept screen (P2-19)
`app/invite/[code].tsx` resolves the code, then the challenge page shows "{name} invited you" with "Accept · Day 1 is
today" (group room) or "Join · Day 1 is today" (public), and "Not now". No owner approval. The "{n} of 10" chip only
shows for group rooms. Screens: `08/{se,16promax}/P2-19-invite-accept.png`, `08-b-first-task.png`.

### 08.5 Leaderboard (P2-15 – P2-17)
`backend/trpc/routes/leaderboard.ts` adds `verifiedThisWeek` (`backend/lib/board-verified.ts`) and `lastSecuredAt`;
`lib/challenge-board.ts` `rankBoard` ties on verified, then earlier secure. `BoardRow` reads "{s} of 7 · {v}
verified" and "You". is_test authors are dropped by `dropTestAuthors` (unchanged). Test: `lib/build92-invite.test.ts`
"ties go to more verified days, then whoever secured earlier", "row line reads secured of 7 and the verified count;
own row says You". Screens: dev board `griit://dev/build92-board?n=5|10` (same `rankBoard` + `BoardRow`):
`08/se/P2-16-board-5.png`, `08/16promax/P2-17-board-10.png` (+ `-bottom`).

### 08.6 Settings (P2-20, P2-21)
`lib/settings-rows.ts` + `app/settings/index.tsx`: Connections card with Strava ("Connected as {name}" + Disconnect,
or "Verify runs automatically" + Connect, through the existing OAuth in `backend/lib/strava-callback.ts`) only when
`FLAGS.STRAVA_AUTO_VERIFY` is on and not a guest; Apple Health "Steps and workouts" + "Coming soon", disabled; GRIIT
Pro card with the 4 perks, each with a Pro tag, gating nothing. On resume the perk copy was fixed to the copy table
word for word: "Extra freezes" (was "Extra freezes (hold up to 4 instead of 2)") with "Hold up to 4 instead of 2"
as its only second line; the three invented subtitles are gone. Test: "Apple Health is Coming soon and disabled; Pro
perks carry the Pro tag" (failed before: `08/perks-before.txt`; pass: `08/perks-after.txt`). Screens:
`08/16promax/P2-21-settings-strava-off.png` (run with the flag turned on locally for that run only, then reverted;
saved is_test account), `08/se/P2-21-settings-{connections,pro}.png` (guest, flag off: the shipped state).

### Chunk 08 · gates and evidence
- [x] vitest codes: `backend/lib/invite-codes.test.ts` 8 tests + `lib/build92-invite.test.ts` 12 tests pass
      (`08/perks-after.txt`).
- [x] curl: `/i/iXH0FIGZ` 200 with "Show Up 7" and "invited you"; `/i/zzzzzzzz` 404 friendly page (`08/curl-landing.txt`).
- [x] Maestro two-account (`.maestro/build92-08-invite.yaml`): A shares → B opens → Join → B on "Get to the gym":
      SE `08/invite-se-run3.log`, Pro Max `08/invite-promax-run1.log` (exit 0, code iXH0FIGZ).
- [x] Board with 5 members vs P2-16: `08/se/P2-16-board-5.png` (dev seed, see decisions); 10 vs P2-17 on Pro Max.
- [x] grep: `08/grep-griit-i.txt`: no `griit://i/` in `app/`, `components/`, or non-test `lib/`; the 3 backend hits
      are code comments.
- [x] Backend deployed: `116eae9e` (`08/deploy2.log`, `/api/health` commit `116eae9`, `08/health-after-deploy.txt`).
      Full vitest 2239 passed / 4 failed = the chunk 07 baseline four (`08/vitest-full.txt`); tsc 5 = baseline (`08/tsc.txt`).

### Chunk 08 · tests moved (behaviour moved, none weakened)
- `lib/group-invite-link.test.ts` and `lib/share-invite-copy.test.ts` pinned the build 90 `griit://i/<id>` link.
  08.1 replaces it on purpose; both now pin `{INVITE_BASE_URL}/i/{code}`, no `griit://`, still no `griit.app`, and
  the invite screen still shares through `inviteToChallenge` (now via `InviteSheet`).
- `lib/build92-invite.test.ts` perk list: the copy-table words (see 08.6).

### Chunk 08 · decisions made alone
- Codes are 8 characters (gate asks ≥ 6) and live in `invite_tracking` (no migration).
- The P2-16/P2-17 boards are a dev route fed through the live `rankBoard` + `BoardRow`; seeding 5 real members needs
  DB writes or a service key.
- Public challenges opened by a link say "Join · Day 1 is today"; only group rooms say "Accept".
- The landing people count is max(live active enrollments, `participants_count`).

### Chunk 08 · not done / needs Yaseen
- P2-20 (Strava connected) needs a real Strava login; only the not-connected state (P2-21) is shot.
- Universal links: needs an associated-domains entitlement and an `apple-app-site-association` on the invite domain.
  Until then the landing page's "Open it" uses `griit://invite/{code}`.
- The challenge page still reads `participants_count` ("0 people" in `P2-19-invite-accept.png`); the landing page
  counts live enrollments. Same lag, outside chunk 08's areas.
- The live landing count includes test guests (81 on Show Up 7); is_test filtering there was not added.
- The invite screen caption says "0 of 10 in the group" on a public challenge (build 90 picker copy, unchanged).

## Chunk 09 · First day and account

### Root causes (written before the fix)
- 09.1 `components/onboarding/v2/screens/GoalsScreen.tsx:20-21,62-86`: six full-width `OptionRow`s (with an example
  line each) then Faith and prayer last, body `paddingBottom: 280`; on an SE the 7th card sits under the docked
  button. Labels are the build 90 set ("Physical toughness"…), not the Part 3 seven. `lib/onboarding-v2-goals-core.ts:31`
  `toggleOnboardingGoal` refuses a 4th pick (dimmed cards) instead of swapping out the oldest.
- 09.2 `FirstChallengeScreen.tsx:46-50` cards are `accessibilityRole="radio"` with a radio dot; one footer "Join"
  (`:180`) joins the picked card, then `OnboardingFlowV2.tsx:322` goes on to Reminders; the first task opens only
  after Reminders → finish. The Standard freeze line repeats on every card (`modeLine`, `:72`).
- 09.3 `backend/trpc/routes/challenges-discover.ts:952` `getStarterPack` selects `challenge_tasks (id, title,
  task_type, order_index, config)`: no `gate_time_*` columns, so Start here cannot see that Early Riser's
  "by 06:30" window has closed and `suggestChallengesForGoals` (`lib/onboarding-v2-suggest.ts:135`) can put it
  first. The server already defers Day 1 (`backend/lib/join-challenge.ts:130` → `late-join-window.ts`
  `enrollmentStartAt`, since 2824ec0d), but no client surface says so.
- 09.4 `components/onboarding/v2/screens/AccountScreen.tsx:405-473`: email + password fields (the password manager
  sheet), a confirm step and "Send it"; no one-time code. Title/subtitle are the build 90 starter lines.
- 09.5 `AccountScreen.tsx:352-353`: with `STARTER_TASK_ENABLED` on, the skip link is hidden unless the caller passes
  `alwaysOfferSkip`, and it reads `ACCOUNT_SKIP`, not "Not now".
Design references: P3-01, P3-02, P3-03 (goals), P3-04, P3-05, P3-06, P3-07 (Start here, first task), P3-08, P3-09
(account), P3-13b (challenge page, window closed); Part 3 checklist lines 87–96; copy rows Goals, Start here,
Freeze line, After Join, Account, Account errors. Handoff `src/onboarding/{goals.ts,startHere.ts,AccountStep.tsx}`.

### Items
- **09.1 Goals** (`GoalsScreen.tsx`, `lib/first-day.ts`): the Part 3 seven in a 2-column grid (Fitness and gym,
  Faith and prayer, Running, Reading, Health, Discipline, Mind). All 7 sit above the docked Continue on an SE
  (`09/se/P3-01-goals.png`). Selected = filled card + check icon (`P3-02-goals-picked.png`). A 4th pick swaps out the
  oldest (`pickGoal`) and says so to VoiceOver. New goal ids `running` and `health` map to the existing
  `running` / `health` categories; the old `cold_exposure` / `sleep_recovery` ids keep their labels for stored goals.
- **09.2 Start here** (`FirstChallengeScreen.tsx`, `OnboardingFlowV2.tsx`): a Join button on every card, no radio
  buttons, the freeze line once under the list. One tap joins and opens the first task with the toast
  "You’re in. Day 1 is today." (`P3-04-start-here.png`, `P3-06-first-task-toast.png`). The toast is drawn in a
  `FullWindowOverlay` (react-native-screens, already installed) because the first step can be the photo-optional
  Sheet, which is a native Modal and covered the toast. Reminders is skipped on the Join path (Home asks later).
- **09.3 Closed windows** (`lib/time-enforcement.ts` → `windowClosedToday`, `day1TomorrowLabel`, on the pure
  `backend/lib/late-join-window.ts`): Start here puts closed-today cards last with "Day 1 is tomorrow at {time}"; the
  challenge page caption and join button read "Join · Day 1 is tomorrow at {time}". A closed-window Join lands on
  Home, not on a task that can't be done. Server side was already right (`join-challenge.ts` defers `start_at`;
  `enrollmentProgress` never marks days before start as missed) and is now pinned by
  `backend/lib/first-day-window.test.ts` at a fixed 9:41. `getStarterPack` now selects the `gate_time_*` columns
  (backend change, deployed with chunk 10). `windowClosedAtLine("")` no longer reads "Window closed at . Today…".
- **09.4 Account** (`AccountCodeForm.tsx`, `lib/email-otp.ts`, `AccountScreen.tsx`): Apple first, then email with a
  6-digit code (no password field), "Not now". The code field uses `textContentType="oneTimeCode"` and
  `autoComplete="one-time-code"` and verifies itself at 6 digits; 60 s resend; wrong / expired code lines. A guest
  keeps their user id (`updateUser({email})` → `verifyOtp` type `email_change`); a taken email falls back to a
  sign-in code and the existing `adoptExistingAccount` path. Behind `FLAGS.EMAIL_OTP` (default off) until Supabase
  sends codes (steps below). `P3-08-account.png` was shot with the flag on locally, then reverted.
- **09.5 Guest save:** "Not now" is always offered and leaves the guest as they are (same anonymous user, same
  enrollment); saving later converts the same user id, so the streak carries over.

### Gates
- Maestro SE, Welcome → Faith and prayer → Start here → Join → first task → Done → Day secured: **5 of 5 pass**
  after the chunk 10 deploy (health `dce02d8`; `09/maestro-gate-run1..5.txt`, `09/se/P3-06-day-secured.png`).
  Before that deploy: Every step up to Done passes on SE (`.maestro/build92-09-first-day.yaml`),
  but tonight the first Faith card is Fajr Before Sunrise and the live server rejects the check-in with
  "Window closed." (`09/se/gate-fail-window-closed-before-deploy.png`, `09/maestro-gate-before-deploy.txt`).
  The live `getStarterPack` does not send `gate_time_*`, so the client cannot see the closed window; this is the
  09.3 fix, and it reaches the server only with a deploy. Chunk 09 doesn't approve a deploy and chunk 10 does
  ("Backend deployed if changed"), so the deploy and the 5 gate runs happen at the start of chunk 10.
- Vitest at 9:41: `backend/lib/first-day-window.test.ts` (4) + `lib/build92-first-day.test.ts` (20): 24/24
  (`09/test-before.txt` fails: modules missing; `09/test-after.txt`).
- Email OTP flow test against a stubbed Supabase auth (`lib/build92-first-day.test.ts` "09.4"): pass. Dashboard steps below.
- Screenshots P3-01, P3-02, P3-04, P3-06, P3-08: `docs/reports/build92/09/se/`.
- Full vitest: 4 failed (the 4 baseline failures), 2263 passed (`09/vitest-full.txt`). tsc: 5 (baseline, `09/tsc.txt`).

### Tests moved (intended behaviour change)
- `lib/build90-words.test.ts` "always offers Later" → "always offers Not now": 09.5 makes the skip "Not now" and always shown.
- `lib/onboarding-v2-first-challenge.test.ts`: `physical_toughness` now reads "fitness and gym" (Part 3 labels).
- Maestro preludes `build92-guest-home*.yaml`, `build92-01-*.yaml`: tap "Fitness and gym". The build 87–90 flows
  still tap "Physical toughness.*" and the Start here footer "Join"; they are not chunk 01–09 gates and were left alone.

### Decisions
- `EMAIL_OTP` flag, default off, so the shipped account form keeps working until the dashboard is set.
- Kept "Set this up later" next to "Browse all challenges" on Start here (the design has Browse; the skip already existed).
- A closed-window Join goes to Home (Day 1 is tomorrow), not to the task screen.
- New goal ids `running` and `health` instead of renaming the stored `cold_exposure` / `sleep_recovery`.
- For a "by" window, "Day 1 is tomorrow at {time}" uses the By time (there is no opening time).
- Toast drawn in `FullWindowOverlay`; it moved up to just under the status bar so it doesn't cover "Day 1 of 7".

### Needs Yaseen (Supabase dashboard, not changed by the agent)
1. Authentication → Providers → Email: enabled, "Email OTP" on, OTP length 6 (expiry 3600 s is fine).
2. Authentication → Email Templates → **Magic Link**: put `{{ .Token }}` in the body (e.g. "Your GRIIT code is {{ .Token }}").
3. Email Templates → **Change Email Address**: send `{{ .Token }}` too (the guest save uses `email_change`).
4. Email Templates → **Confirm signup**: send `{{ .Token }}` (a brand-new email that signs in, not a guest).
5. Then set `EMAIL_OTP: true` in `lib/feature-flags.ts` and ship.

## Chunk 10 · Discover, challenge page, Home, feed, words

### State on start
- Backend deployed first (chunk 10 allows it): `backend/deploy-sha.txt` = `dce02d80`, `/api/health` → `dce02d8`
  (`10/health-after-deploy.txt`). This shipped chunk 09's `getStarterPack` select; chunk 09's SE gate then passed 5/5.

### Root causes (written before the fix)
- 10.1 `components/discover/ChallengeCard.tsx:27-33`: the grid caption is `{n} people · {gate}`, but `DiscoverV3.tsx:357-366`
  never passes `proofType`, so it is only a count; Featured captions use `discoverProofLabel` / `featuredProofLabel`
  ("Camera", "Self-reported") (`DiscoverV3.tsx:233,255`). `components/ds/Cover.tsx:48-53` is a category gradient.
  "1 person" / "{n} people" at any size (no "New"). `ChallengeCard` takes `joined` and ignores it; only the DB hero
  skips the preview when joined (`DiscoverV3.tsx:208`), builtins and grid cards always open a sheet with Join.
  Featured is the scored DB hero plus the 8 builtins in `lib/featured-catalog-seed.ts`: a gym challenge (Show Up 7), no run.
- 10.2 `app/challenge/[id].tsx:130-193` renders `ChallengeDetailV3` with Join until `listMyActive` loads, then redirects;
  a join from there can fail with "You're already in this challenge." (`app/challenge/[id].tsx:421`,
  `lib/join-challenge-error.ts:30`). The joined page (`ActiveChallengeV3.tsx:187-199`) shows "Day" / big n / "of N" and
  `recordLine` ("X of Y days secured"); dots come from `getSecuredDateKeys` with `frozen: false` hard-coded
  (`active/[activeChallengeId].tsx:477-492`), not from `challenges.progress.days` (which has `held`); no dot key.
  The primary is `{verb} · {task}` and disappears when done. The solo people box says "Private. Only you."
  (`lib/g2a-challenge.ts:104-110`); there is no per-challenge post audience.
- 10.3 `components/home/HomeV3.tsx:244-298`: the streak card is secured from `daySecured || allDone` (local check-ins) but
  `firstDayLine` (`app/(tabs)/index.tsx:1008`, "Day 1 is today. Finish the task to secure it.") reads only
  `homeSecuredToday(securedDateKeys)`, the server list in the same bootstrap that lags the finish: the build 90 split.
  Save errors are always "Couldn't save. Tap to try again." (`lib/optimistic-home.ts:6,43`), even for "Window closed.".
- 10.4 `lib/feed-join.ts:128-197` groups started events per challenge per clock hour and keeps their place, so a feed can
  open with, or be only, "X started Y" lines. Captions: "Everyone is on until you follow 3 people." only on Everyone;
  empties: "Your feed is quiet" / "No posts yet. Be the first to check in today." with Discover only.
- 10.5 `lib/concept-once.ts` one-liners use a device-wide `griit.concept.seen` key (not per user), wording differs from the
  Words table, and there is no words sheet or "i". The freeze explanation exists in 6 strings (`lib/copy.ts:17`,
  `first-day.ts`, `onboarding-v2-first-challenge.ts:8`, `challenge-detail-mapping.ts:242`, `create-mode-copy.ts:5`,
  `freeze-earn.ts:20`).

### Items
- **10.1 Discover** (`lib/discover-card.ts`, `ChallengeCard.tsx`, `DiscoverV3.tsx`, `components/ds/Cover.tsx`): every card
  says what you do and how it is proven ("Get to the gym · photo", "Pray Fajr · self-reported, by 7:00 am",
  "Run 3 mi · Strava"). The proof kind comes from the server (`taskProofKind`, the gates rule, so `photo_mode` wins
  over legacy flags); `getDiscoverFeatured` and the v43 select now read `require_photo`, `require_location` and
  `gate_time_*`. Covers are the category motif on ink (hatch, crescent rings, ruled lines, dot grid, square grid at
  8%), no gradient, no photo. Under 5 people reads "New" (cards and the preview sheet). Joined cards say "Joined" and
  open the challenge page instead of a sheet with Join. Run 3 mi is a pending built-in: hidden until
  `challenges.featuredCatalogIds` lists it (SQL below).
- **10.2 Challenge page** (`app/challenge/[id].tsx`, `ActiveChallengeV3.tsx`, `active/[activeChallengeId].tsx`):
  Join is hidden until membership is known (`membershipKnown`); an "already in" join opens the joined page, and
  Discover refreshes `listMyActive` after every join. The joined page shows "Day {n} of {N}" and
  "{n} days secured" (chunk 06 fields), dots from `challenges.progress.days` (held = freeze, before join = blank), the
  dot key once per user with "Got it", "Your posts here: {audience} ›" with the sheet (stored per user per
  enrollment; the task flow uses it as the default audience), and one primary "Start today’s task" /
  "Today’s task is done" (disabled).
- **10.3 Home** (`app/(tabs)/index.tsx`, `HomeV3.tsx`, `lib/home-done.ts`): one flag `securedNow = todaySecured ||
  proofAllDone` drives the first-day line, the start label, the next task, day-2 hero and the first-proof slot, so
  the server list lagging the finish can no longer show "Finish the task". Secured reads "Today is secured. See you
  tomorrow." with tasks folded into "{n} done · Show". A failed save carries its real reason ("This task’s window
  closed at {time}. It opens tomorrow." with no retry; "Couldn't save. No connection. Try again"; the generic retry
  otherwise).
- **10.4 Feed** (`lib/feed-fold.ts`, `LiveFeedSection.tsx`, `components/feed/StartedDayRow.tsx`): today's started
  events fold into one line after the first proof (never at the top, never twice, so never more than one per 5);
  older started events are dropped; a feed with no proofs is the empty state. The line has no like or comment and
  opens the list. Captions per tab; empty states offer Discover and Invite.
- **10.5 Words** (`lib/words.ts`, `lib/concept-once.ts`, `lib/concept-seen.ts`, `components/words/WordsSheet.tsx`):
  Secured, Freeze, Self-reported and Verified each defined once per user (`griit.concept.seen.v2:{userId}`) at their
  first moment: secured on Home, the first freeze earned as a card on Day secured, the first self-reported toast,
  the first camera/Strava proof on Home. After that a small "i" under the date opens "What these words mean".
  A freeze used reads "A freeze covered yesterday. Your {n}-day streak is safe." The Start here freeze line was
  already said once (chunk 09).

### Gates
- Maestro `build92-10-joined.yaml` (SE, after the deploy of 3cf82f9): join Show Up 7 from Discover → relaunch →
  Discover shows "Joined" → the card opens the joined page with "Start today’s task", "Day 1 of 7", "0 days
  secured", no Join, no "already in" → Back → reopen, same. Passed (`10/maestro-joined-run7.txt`; runs 1–4 were flow
  fixes: tab label, camera-off screen, the hero shifting the carousel, tapping before Home loaded).
- Maestro `build92-10-home-secured.yaml` + `build92-10-home-poll.yaml` (SE): secure the day with 7K Steps, then 10
  polls 6 s apart over 120 s, each "Finish the task" not visible and "Today is secured. See you tomorrow." visible.
  Passed twice, before and after the deploy (`10/maestro-home-run2.txt`, `run3.txt`). The in-flow repeat was
  dropped: Maestro's optional wait only held its timeout once, so 10 polls took 17 s.
- vitest: `lib/build92-part3.test.ts` 26/26 (fails before: `10/test-before.txt`; after: `10/test-after.txt`),
  including the 4 feed fixtures and once-per-user words. Full run: 4 failed, the baseline 4 (`10/vitest-full.txt`).
  tsc: 5 errors, the baseline (`10/tsc.txt`).
- Screenshots: SE `10/se/` P3-10 (Discover, then Joined), P3-11 preview, P3-13, P3-14 (dot key, posts here,
  primary), P3-17, P3-22, P3-24; Pro Max `10/promax/` P3-11 (Faith), P3-18, P3-19 (+ the started list).
  P3-18 and P3-19 use `app/dev/build92-part3.tsx` with fixed data; P3-22 uses `dev/build92-secured?freeze=1`.
- Backend deployed: 756b0dd (chunk 10 code), then 3cf82f9 (server proof kind); `backend/deploy-sha.txt` written
  before each, `/api/health` → `"commit":"3cf82f9"` (`10/health-after-redeploy.txt`). Additive only: build 91 ignores
  the new task fields and does not call `featuredCatalogIds`.

### Tests moved (intended behaviour change)
- `backend/trpc/routes/challenges-discover.test.ts`: the featured column list adds the task gate columns (10.1).
- `lib/featured-catalog.test.ts`: 9 built-ins (Run 3 mi added, pending). The applied v44 SQL test is unchanged:
  Run 3 mi is a separate pending spec, not in the applied file.
- `lib/build90-links-numbers.test.ts`: the record line now appears once (the record card); the top is `topNumbers`.
- `lib/build90-speed.test.ts`, `lib/optimistic-home.test.ts`: Home shows the error's message; the generic retry is
  the fallback, with `retry: true`.
- `lib/greeting.test.ts`, `lib/save-streak-prompt.test.ts`: the Part 3 secured and self-reported lines.
- `lib/backend-client-imports.test.ts`: `backend/lib/freeze-grant.ts` added to the pure allowlist (its only import
  is `lib/freeze-earn`); Day secured reads the 2 / 4 hold caps from it.

### Decisions
- Run 3 mi ships hidden until its catalog row exists, rather than shown and failing to join.
- An open today is drawn as the outlined ring (WeekStrip's "missed" + today index); my own first test said "future".
- The posts-here default is stored on the device per user per enrollment (no server column, so no migration); each
  post can still change it.
- The "i" lives under the date on Home (the list header sits under the status bar).
- The joined page drops the big display number for the exact "Day {n} of {N}" line the spec asks for.
- The challenge page before joining keeps "{n} people" (its copy row), only Discover says "New".

### Needs Yaseen
- SQL: `docs/sql/build92.sql` block "Chunk 10, item 10.1" (Run 3 mi challenge + task). Until it runs, Featured has a
  gym challenge but no run (the gate "Featured includes a run" is met in code, not live).

## Chunk 11 · Speed: app open and profile

### 11.1 Measured first (Release, 16 Pro Max simulator, 5 runs each)
Release build with `xcodebuild -configuration Release -sdk iphonesimulator` (`expo run:ios --device <udid>` asked for
signing). `EXPO_PUBLIC_STARTUP_TRACE=1` turns on `lib/startup-trace.ts`, which writes each phase to AsyncStorage
(Release strips `console.log`); `scripts/measure-startup.py` reads it from the app container. Times are ms from just
before `simctl launch`; phases after "JS start" are ms from JS start. Cold = simulator shut down and booted (nothing
cached), warm = app terminated and relaunched. Interactive = the last of: splash down, loading overlay gone, Home
showing its data. The measured account is a guest in 7K Steps (Day 1). `performance.rnStartupTiming` is empty on this
build, so the "after" builds add `lib/bundle-start.js` (run by Metro right after InitializeCore) to split native launch
from bundle load; the "before" build has them as one number.

| Median (5 runs) | Before warm | Before cold | After warm | After cold |
|---|---|---|---|---|
| Native launch (launch → bundle runs) | 1001 (with bundle) | 1307 (with bundle) | 603 | 807 |
| JS bundle load (bundle → first app module) | | | 403 | 449 |
| Fonts | 89 | 109 | 91 | 101 |
| Auth/session restore | 121 | 142 | 123 | 134 |
| Profile check (routing) | 353 after restore | 404 after restore | 14 (device) | 13 (device) |
| `home.bootstrap` round trip | 836 | 1036 | after Home, in the background | same |
| Home first render | 66 | 83 | 66 | 72 |
| Home shows data | 992 (network) | 1218 (network) | 152 (cache) | 163 (cache) |
| Splash down | 1907 | 1919 | 169 | 181 |
| **Launch → Home interactive** | **2927** | **3280** | **1175** | **1459** |

Runs: `11/before-warm.txt`, `before-cold.txt`, `after-warm.txt`, `after-cold.txt` (+ `.json` with every mark).

Root causes, from the table:
- `app/_layout.tsx:393-398`: the splash came down on a fixed `setTimeout(SplashScreen.hideAsync, 1800)` after fonts,
  so every open waited about 1.9 s after JS start even when Home was ready at 1.0–1.2 s. It was the last phase in all
  10 "before" runs. This is the delay on every open.
- Home had no cache: it waited on `home.bootstrap` (0.8–2.1 s here, 2–5 s server-side in launch bursts on Railway).
- The profile check (`checkProfile`, a Supabase read) gated routing on every open: 150–450 ms, and 2.9 s in one cold
  run (the overlay spinner stayed up to 4.3 s).
- Not the cause: `expo-updates` (`EXUpdatesLaunchWaitMs` 0, no wait), fonts (90–110 ms), session restore (120–140 ms).

### 11.2 Fixes
- Splash comes down when routing settles: `splashMayHide` (`lib/auth-redirect.ts`): no overlay and the decision is
  stay/retry (not wait or a pending replace), on the next frame. The 1800 ms timer is now only a maximum.
- Home from cache, then refresh: `lib/home-bootstrap-cache.ts` keeps the last complete bootstrap per user
  (`griit.homeBootstrap.v1:{userId}`); `useHomeBootstrap(userId, { fromCache: true })`, used only by Home, gives it as
  React Query `placeholderData`. Placeholder data leaves `isFetched` false, so the streak reconcile (now
  `ready: isSuccess && !isPlaceholderData`) and AppContext effects wait for the live answer. A snapshot from an earlier
  day keeps challenges and numbers but drops that day's check-ins, so a new day never opens with tasks shown done.
  Partial answers (`failed` non-empty) are never saved. The live `home.bootstrap` still runs on every open
  (`11/after-launch-bootstrap.txt`: 200 in 771 ms after the cached paint).
- Returning account routes without waiting: `lib/onboarded-user-cache.ts` records per user that the fetch said
  onboarding is done (the same `resolveOnboardingCompleted` rule routing uses). Next open routes from it at once; the
  fetch still runs and can still redirect, and a failed fetch keeps what the device knows instead of showing Retry.
  A new account has no record, so it is never skipped past onboarding.
- `11/after-launch-1.3s.png` (1.3 s after launch: full Home from cache) and `after-launch-9s.png` (after refresh: same).

What is left (after cold, 1459 ms): native launch 807 + bundle load 449 = 86%. That is process start, native modules
and Hermes running the module graph up to the first route. Both are under 2 s together. Cutting them means lazy
native modules or a smaller startup graph, not a network or timing fix.

### 11.3 Profile and feed images
- Root cause: proof photos are signed per request (`backend/lib/proof-image.ts`, new token each fetch), and expo-image
  keyed its disk cache on the full URL, so the grid, feed and viewer downloaded the same photo again on every fetch.
  Uploads are already 1080 px / JPEG 0.7 (`lib/proof-resize.ts`).
- Fix: `lib/proof-cache-key.ts` `proofSource(uri)` keys the cache on the storage object (host + path, no token).
  Used by `ProofsGrid` (plus `allowDownscaling`: decoded at tile size), `ProofImage` (feed), `PostViewer`,
  `app/post/[id]/photo.tsx`, `DayViewer`, `DayCell`, `ProofDayCard`, `ProofViewer`, `ds/FeedPost`, with
  `cachePolicy="memory-disk"` where it was missing.
- Not done: thumbnails at tile size served by the server. The token must be minted by the server
  (`createSignedUrl(path, ttl, { transform })`), which is a backend change plus deploy; chunk 11 does not allow a
  deploy. Storage image transforms look enabled (`/storage/v1/render/image/public/...` answers "Object not found",
  not "not enabled"). Left for Yaseen / a deploy chunk.
- Profile open (mount → first header paint, 5 relaunches each): before 17, 16, 11, 11, 17 ms; after 17, 12, 12, 16,
  16 ms (`11/before-profile.json`, `after-profile.json`). Under the 300 ms target both times; the live profile is
  already in AppContext when the tab opens, so the cache path (chunk 07.6) is not needed for the header.

### 11.4 Request budget
Fresh guest per run on the SE: `.maestro/build92-11-budget.yaml` (Welcome → Faith and prayer → Start here → Join →
first task → Done → Post to friends → Day secured → Not now → Home → Profile → Discover → Activity → relaunch). Counted
from `railway logs --http --json` for this machine's IP in each run's window (`scripts/count-trpc-minute.py`):

| Run | Total tRPC | Busiest minute | Statuses |
|---|---|---|---|
| 1 | 44 | 44 | 200 × 44 |
| 2 | 44 | 44 | 200 × 44 |
| 3 | 44 | 44 | 200 × 44 |
| 4 | 47 | 47 | 200 × 47 |
| 5 | 44 | 44 | 200 × 44 |

Run 4's +3 is one extra app-active event (`finalizeEnded`, `listUnseenEndings`, `getReminderSettings`). 0 × 429.
Timelines: `11/budget-run*-count.txt`; Maestro: `11/maestro-budget-run*.txt` (all exit 0). Raw logs not committed
(they carry the client IP).

### Gates
- [x] Before and after tables for cold start, warm start and profile open, 5 runs each (above).
- [x] Targets met: cold 1459 ms and warm 1175 ms median (< 2 s); profile header 12–17 ms (< 300 ms).
- [x] Request budget: busiest minute 44–47 (< 50), 0 × 429 across 5 runs.
- [x] Tests: `lib/build92-speed.test.ts` 14/14 (new; it imports `splashMayHide`, the bootstrap cache and the
  onboarded record, none of which exist at the chunk 10 sha). Full vitest: 4 failed, the baseline 4
  (`11/vitest-full.txt`). tsc: 5, the baseline (`11/tsc.txt`).
- [x] Chunk 10's Home gate again on the SE with the cache: secure the day, 3 polls, relaunch (Home from cache),
  5 polls: never "Finish the task", always "Today is secured. See you tomorrow." (`11/maestro-home-secured-cache.txt`).
  A first try was cut short by a simulator SpringBoard crash (crash report `SpringBoard-2026-10-19-020851`).

### Also fixed
- Chunk 10 left a 6th tsc error: `lib/build92-part3.test.ts:52` passes `config.require_strava` to `taskProofKind`,
  whose row type did not declare it (the function already read it). Type-only fix in
  `backend/lib/discover-preview-tasks.ts`; no runtime change, no deploy needed. Chunk 10's `10/tsc.txt` was stale.

### Decisions
- Cold start follows Apple's meaning (after a reboot); warm is after the app is terminated.
- The trace ships but is off unless built with `EXPO_PUBLIC_STARTUP_TRACE=1`; `lib/bundle-start.js` sets one global.
- The home cache is per user on the device and is not cleared on sign-out (same as the chunk 07 profile header cache).
- Thumbnails left for a deploy chunk rather than shipping undeployed server code.

## Chunk 12 · Better test agents

Harness work is on `feat/agent-testers` (`agents/`); no app code changed. Evidence is in `docs/reports/build92/12/`.
Build 92 = 53b47e13 Release on the 16 Pro Max simulator; build 91 = f217c38f Release on the iPhone 16 simulator.

### Must-fix for build 92 (app bugs found by the checks, not fixed in chunk 12)
1. **A typed caption traps the post.** On the post sheet (P1-01) the keyboard covers "Post to friends", and every
   normal way to drop it closes the sheet, which saves the proof privately (Only me). The post is lost.
   Checked on the 16 Pro Max simulator with `agents/checks/caption-keyboard.yaml`:
   - Return adds a line; the keyboard stays (`12/shots/b92-caption-1-typed.png`).
   - A slow swipe down from the grab handle does nothing: sheet and keyboard stay (`b92-caption-2-swipe-handle-nothing.png`).
   - Maestro `hideKeyboard` closes the sheet and lands on "Drink Water Today · finished" (`b92-caption-4-hide-keyboard-closed.png`).
   - A tap on the photo above the sheet does the same (`b92-caption-3-tap-above-closed.png`).
   Root cause: `components/task-v2/steps/PostChoiceSheet.tsx:90-102`, the caption is a `multiline` `TextInput` with no
   return-key dismiss, and the sheet is not lifted above the keyboard; `components/ds/glass/GlassSheet.tsx:56-61`, the
   dim area's `onPress` is `onClose`, so the tap that would drop a keyboard closes the sheet instead. Not tried on a
   device: whether an iOS keyboard swipe on hardware behaves differently from the simulator.
2. **The post-sheet caption is never checked for curse words and never shown on the post.** It is sent as
   `noteText` (`components/task-v2/useTaskFlowV2.ts:1065`) and stored only in `check_ins.note_text`
   (`backend/trpc/routes/checkins.ts:1287`); the `task_completed` event metadata (`checkins.ts:1350-1377`) has no
   caption, and the word filter runs only in `feed.shareCompletion` (`backend/trpc/routes/feed.ts:610`). So even with
   bug 1 fixed, "this fucking water" would be saved, not refused. Build 90 07.4 made the review caption private
   journal text on purpose; the build 92 sheet ("Add a caption (optional)" on "Post your proof", Part 1 copy table)
   reads as a public caption. Needs Yaseen to say which is meant before the fix.

### 12.1 Stronger personas
- `agents/agents.config.json`: `claude-sonnet-5-5` default, `claude-opus-5-5` for the first-day group, cap $60,
  `maxTokens` 2000 (Opus thinking counts against it; 400 cut replies short), list prices checked Oct 18.
  `agents/src/config.ts` reads it; `AGENT_MODEL`, `AGENT_FIRST_DAY_MODEL`, `AGENT_CAP_USD`, `AGENT_MAX_TOKENS` override it.
  `cost.ts` prices from config; the runner stops before the next session once spend reaches the cap and writes `stopped.txt`.

### 12.2 "Be a person" rule
- `agents/src/stuck.ts`: two taps on one target that leave the screen signature unchanged make the next prompt say
  "do something different… start your thought with stuck:"; a third tap on that target is refused. Each stuck note is
  logged on the step; 3 on one screen stop the session ("Stopped: 3 stuck notes on …").
- Found by the dry run and fixed: `agents/src/match.ts` `screenSize` only accepted a window 700–950 pt tall (iPhone 16
  is 852). The 16 Pro Max (956) and the SE (667) fell back to 393×852, so every tap point was computed for the wrong
  screen; the Profile tab was clamped to the bottom-right corner. Runs 1 and 2 of the dry run
  (`12/dry-run-1-before-size-fix`, `dry-run-2-before-size-fix`) are every session tapping a control and nothing
  changing. Now 560–1000 pt; test in `agents/src/build92.test.ts` fails on the old rule
  (`12/screen-size-test-before.txt`) and passes on the new one.

### 12.3 Scripted checks (Maestro, not the AI)
`agents/checks/run-checks.sh <udid> <label> <out> <app checkout> [flow…]`; each flow starts from a fresh guest.
Journal typing appends instead of erasing 50 characters (`device.ts` `typePlan`). Final results (first full run at
04:19 / 04:27; curse-caption and curse-comment rerun at 07:10 with the fixed flows):

| Check | Build 91 | Build 92 |
|---|---|---|
| journal-long (typed in three parts into the multiline field, all kept, day secured) | PASS | PASS |
| curse-username | PASS | PASS |
| username-control (a clean name is accepted) | PASS | PASS |
| curse-bio | PASS | PASS |
| curse-caption | FAIL: the caption posts, Day 1 secured, no refusal (`12/shots/b91-caption-posted.png`) | FAIL: closing the keyboard closes the post (must-fix 1) |
| curse-comment | PASS | PASS (after the flow fix) |
| curse-title | PASS | PASS |
| strava-stub (stubbed webhook completes a run task) | PASS | PASS |
| offline-post | not run: no network conditioner on this Mac | not run |

Flow fixes this session:
- `curse-caption` / `photo-post.yaml`: the photo steps moved to `photo-sheet.yaml`; with a caption, the flow closes
  the keyboard (`hideKeyboard`, optional because build 91's review screen keeps Post above its keyboard), then asserts
  the post is still open, then taps Post. The old tap loop tapped keys under the keyboard and never posted on build 92.
  "Post to (friends|everyone)" because build 91 sometimes opened on Everyone.
- `curse-comment`: after Home, `scrollUntilVisible` to a fully visible "Comment"; the 4:5 photo pushed it below the fold.

### 12.4 New persona groups and 12.5 report
- `agents/src/build92.ts`: History (2), Social pairs (3 × A, B, A again), Day 2 (6 returning users), first-day (12, Opus).
  Saved accounts log in through `account.ts` `savedAccountSession`. `--dry` runs one session per new group.
- `agents/src/build92-report.ts`: `screens.csv` in the build 90 format, an end tag on every session (app bug / agent
  stuck / finished / harness stop), the main numbers (Day 1 secured, Day 2 return, social actions per pair, cold start,
  3-word quiz).
- History seed: `docs/sql/build92.sql`, chunk 12 item 12.4, NOT RUN (34 days, 33 secured, 1 freeze used, 25 posts,
  a left 7K Steps). The account is `is_test` "Priya" (`agents/tools/prepare-account.ts`).

### Dry run (`12/dry-run/REPORT.md`, run 3, 16 Pro Max, build 92)
| Session | Steps | End | What happened |
|---|---|---|---|
| h-01 Priya (History) | 16 | agent stuck (home repeated 3 times) | Opened Profile, calendar, Activity, Leaderboard; Home and Profile agree (0 / 0) because the seed has not run |
| s-dry-b Blake (Social) | 19 | agent stuck (home repeated 3 times) | Accepted Kim's invite, joined, posted; Kim's saved build 90 account (`4-social/p4-03a`) has no proof, so nothing to like or comment on |
| d-01 Tess (Day 2) | 17 | finished | Came back after a 1-day gap, saw the streak and the freeze offer, secured the day |

Cost: $0.32 for the 3 sessions (58 calls, 120,666 in / 8,254 out). Projection printed by the runner: $4.34 for the
full run at the dry run's 17 steps a session. At the 60-step limit per session it would be about $16. Both are under
the $60 cap.

### Gates
- [x] Dry run of 3 sessions (one from each new group) completes with the report written (`12/dry-run/REPORT.md`).
- [~] Scripted checks: build 91 is green on everything that works; build 92 is green on everything except
  curse-caption, which fails on both builds for real app reasons (must-fix 1 and 2), not a flow problem.
- [x] Dry-run cost printed with the projected full-run cost.
- [x] Tests: agents vitest 49/49 (`12/vitest-agents.txt`), agents tsc 0 (`12/tsc-agents.txt`). App unchanged: full
  vitest 4 failed, the chunk 11 baseline 4 (`12/vitest-full.txt`); tsc 5, the baseline (`12/tsc.txt`).
- [x] Committed on `feat/agent-testers` and pushed; PROGRESS updated on `feat/build92`.

### Decisions
- Dry run on the 16 Pro Max with build 92, not the iPhone 16 (build 91), since chunk 13 tests build 92.
- History ran against the unseeded account so the gate could run; its numbers mean nothing until the SQL runs.
- Day 2 used a build 90 account that last secured Oct 17 (a return after a gap, labelled as such): no account
  secured yesterday.
- The social partner is the only saved build 90 account that created a challenge (Kim), though it never posted.
- Must-fix 1 and 2 logged, not fixed (chunk 12 does not change app code).

### Not sure
- Sessions still end early on the build 90 "home repeated 3 times" rule (16–19 of 60 steps). It may cut full-run
  sessions short before likes and comments; not changed in this chunk.
- Cold start in the dry run (9.8 s median) is through Maestro and includes its launch and login overhead; it is not
  comparable to chunk 11's 1.46 s.
- In dry run 1 the SE simulator showed a 7K Steps day done; I could not tell if the harness or chunk 11 did that.

## Chunk 12b · Build 92 pre-ship fixes

App on `feat/build92`, harness on `feat/agent-testers` (d1c4c700). Evidence in `docs/reports/build92/12b/`.
Simulators: SE 575796A4 and 16 Pro Max B6CC0160, both on the dev client (HEAD JS from Metro) for the Maestro
flows; the Pro Max went back to the build 92 Release app (53b47e13) for the agent dry run. Backend deployed
8ae6ad56; `/api/health` shows `"commit":"8ae6ad5"`. No new SQL.

### 12b.1 Post sheet keyboard (must-fix 1)
- Root cause (chunk 12 must-fix 1): the caption had no Done key, the sheet did not move with the keyboard, and the
  dim area's tap was `onClose`, so the tap that should drop the keyboard closed the sheet and saved the proof Only me.
- Failing tests first (`.maestro/build92-12b-caption-{done-key,keyboard-open,tap-above}.yaml`, shared steps in
  `build92-12b-caption-sheet.yaml` / `build92-12b-caption-posted.yaml`): type a caption, then Done / Post with the
  keyboard open / tap above the sheet, then Post, then the caption must be in the Home feed. Before the fix:
  SE Done-key and keyboard-open FAIL at "Drink Water Today · finished" (`before-se-*.txt`); Pro Max tap-above FAIL,
  the sheet closed (`before-promax-tap-above.txt`).
- Change: `components/ds/glass/GlassSheet.tsx` `avoidKeyboard` lifts the sheet by the keyboard height
  (`lib/sheet-keyboard.ts` `sheetKeyboardLift`, native driver); while the keyboard is open a tap on the dim area or
  photo, or a swipe down, only drops the keyboard (`sheetOutsideAction`); with it closed they close the sheet as
  before. The X always closes. A strip in the sheet colour sits under the sheet: iOS 26 reports a keyboard frame
  taller than the keys, and the gap showed the screen behind. The swipe-close also reads the latest `onClose` (it held
  the first render's). `PostChoiceSheet.tsx`: `returnKeyType="done"` + `submitBehavior="blurAndSubmit"`.
- After: all 3 flows PASS on SE and Pro Max (`after-{se,promax}-*.txt`). Screens: `12b/screens/se-sheet-keyboard-up.png`,
  `promax-sheet-keyboard-up.png` ("Post to friends" above the keyboard), `*-caption-in-feed.png`.
- Unit: `lib/sheet-keyboard.test.ts` (4).

### 12b.2 Captions are public (must-fix 2, Yaseen's decision)
- Design: the photo caption travels as its own `caption` field on `checkins.complete`, not `noteText`. The server
  word-checks it first (`backend/lib/post-caption.ts` `captionBlock`, same `blockedPlainText` as comments and titles)
  and refuses with "Those words aren't allowed in a caption. Try different ones." before anything is saved; the sheet
  stays open with the text (the existing `showSheetError` path). It is stored only in
  `activity_events.metadata.caption` (trimmed, 120 max, the existing `FINISH_COPY.captionMax`; counter from 100).
- Old notes stay private: feed, hydrate (profile posts, proof detail) now read `metadata.caption` only
  (`postCaptionFromMetadata`); the old `metadata.note_text` fallback is gone, and `check_ins.note_text` is never read for a
  post. Nothing writes `metadata.caption` except this path and the build 90 `shareCompletion` share (already
  moderated). Build 91 still sends `noteText`, which stays private: it keeps working, its captions just do not show.
  Journal text is unchanged (`noteText`, never on a post).
- Shown on the feed card (already rendered `post.caption`), the profile posts list / post viewer (already rendered),
  proof detail (new, under the completion line) and the full-screen photo (new, passed as a route param).
  The optimistic feed post carries the caption too.
- Tests: `backend/lib/post-caption.test.ts` (4), `backend/trpc/routes/journal-private.test.ts` updated to the new
  intended rule (caption field, moderation on caption only, metadata.caption, no `md.note_text`).
- Device: `.maestro/build92-12b-caption-everywhere.yaml` PASS on SE and Pro Max: feed, full photo, posts list,
  proof detail (`12b/screens/{se,promax}-caption-{photo,posts-list,detail}.png`).
  `agents/checks/curse-caption` on build 92: PASS (`12b/curse-caption-b92/results.txt`,
  `screens/promax-curse-caption.png`: the refusal under the sheet, "this fucking water" still in the box). The red
  bar in that shot is the dev client's LogBox, not in Release.

### 12b.3 Sticker footer
`lib/share-image.ts` `STICKER_FOOTER_WORD = "GRIIT"`: "@handle · GRIIT", or "GRIIT" with no handle.
`lib/stickers-b92.test.ts` pins both and that "griit.app" is gone.

### 12b.4 Invite landing count
`backend/lib/invite-store.ts` `inviteLandingCount`: live enrollments minus `is_test` profiles (`testAuthorIdSet`), and
the stored `participants_count` loses its test joins too. `backend/lib/invite-store.test.ts` failed 4/4 on the old
code (`12b/invite-test-before.txt`), passes now. Deployed with 12b.2 (8ae6ad5).

### 12b.5 Test agents
- Stuck rule: the build 90 "{screen} repeated 3 times" exit is gone. A repeated screen is a nudge only
  (`agents/src/stuck.ts` `repeatedScreen`); sessions end on the 60-step cap, the spend or time cap, the agent's own
  stop after 15, or 3 stuck notes on one screen. `stuck.test.ts` failed 2/6 on the old rule
  (`12b/stuck-test-before.txt`), passes now.
- Two simulators: re-checked. With the SE and Pro Max both booted, Maestro MCP `inspect_screen` for the Pro Max
  (on its home screen) returned the SE's GRIIT screen (375×667), in both orders (`12b/two-sim-check.txt`). So the guard is back:
  `device.ts` `assertOnlySimulator`, called by `MaestroSession.start()`, refuses with "Another simulator is booted: …".
  Tests in `harness.test.ts`. Live check: it refused with the SE booted.
- Dry run (`12b/dry-run/REPORT.md`, 16 Pro Max, build 92 Release 53b47e13, cap $0.95): $0.96, 163 calls.

| Session | Steps (chunk 12) | Steps now | End |
|---|---|---|---|
| h-01 Priya (History) | 16, home repeated 3 times | 46 | agent stopped on their own (finished) |
| s-dry-b Blake (Social) | 19, home repeated 3 times | 60 | 60-step cap; tagged "app bug" for a "Day 0 of 1" text |
| d-01 Tess (Day 2) | 17 | 46 | the $0.95 spend cap (harness stop) |

  Projection printed by the runner at 51 steps a session: $13.17 for the full run, under the $60 cap.

### 12b.6 Universal links (report only, nothing changed)
- App: no associated domains. `app.json` `ios` has no `associatedDomains`; `ios/GRIIT/GRIIT.entitlements` has
  push, Sign in with Apple and time-sensitive only. Invite links are `https://grit-backend-production.up.railway.app/i/{code}`
  (`EXPO_PUBLIC_DEEP_LINK_BASE_URL` unset), so today they open the web landing page, which hands off to `griit://`.
- Backend: `GET /.well-known/apple-app-site-association` returns 404; no route serves it.
- Apple developer dashboard, for Yaseen before chunk 13: Certificates, Identifiers & Profiles → Identifiers →
  `app.griit.challenge-tracker` (team WZT43QXHZB) → tick **Associated Domains** → Save. Accept the profile
  regeneration (EAS refreshes it on the next build). That is the only dashboard switch.
- Then in code (not done, a later chunk): `ios.associatedDomains: ["applinks:<invite host>"]` in `app.json`, and a
  backend route serving `{"applinks":{"details":[{"appIDs":["WZT43QXHZB.app.griit.challenge-tracker"],"components":[{"/":"/i/*"}]}]}}`
  as `application/json` with no redirect, deployed before the build. Without both, links keep opening the web page.

### Gates
- [x] 12b.1 three keyboard flows fail before, pass after on SE and Pro Max.
- [x] 12b.2 curse-caption PASS on build 92; caption shown in feed, full photo, posts list, proof detail on SE and Pro Max.
- [x] 12b.3 / 12b.4 unit tests fail-before / pass-after; deployed 8ae6ad5, `/api/health` confirmed.
- [x] 12b.5 sessions run 46–60 steps; guard restored; dry run $0.96.
- [x] Full vitest 4 failed (the baseline 4), 2316 passed; tsc 5 (the baseline). Agents vitest 54/54, agents tsc 0.

### Decisions
- The caption limit stays 120 (the existing limit); the counter shows from 100.
- Old `metadata.note_text` is not shown even where it exists; only `metadata.caption` is public.
- A refused caption keeps the uploaded photo in storage unused; the check-in is not written.
- Build 91 captions (sent as `noteText`) stay private and do not show.
- The full-screen photo shows the caption too (it is where a feed photo tap lands).

### Not sure
- The dry run flagged "Screen said Day 0 of 1" in Blake's session while his own Home showed "Drink Water Today · Day 1 of 1"
  (`12b/dry-run/social/s-dry-b/shots/021.png`). The harness keeps the screen text, not where it came from; the likely
  source is a 1-day post lower in the Everyone feed. Not traced.
- In the same session the harness's scroll at 50%,75% did not move Home for several steps (shots 021–025 are the same).
- Stray output: one `run-checks.sh` call had its arguments in the wrong order and wrote empty check folders into the
  app root; removed, nothing committed.

### 12b.8 Working tree clean-up (what is committed, what is left out)
`git status` / `git diff --stat` in both repos: no tracked file was modified; every uncommitted line was an untracked
file. Committed, in build 90's pattern: source, flows, tests, the report, results/maestro/vitest `.txt`, the dry-run
`REPORT.md` / `screens.csv` / `result.json` / `steps.jsonl` and its shots, and the chosen evidence screenshots
(`12/shots/`, `12b/screens/`). The 12b commits hold 240 files, none over 1 MB, nothing under `ios/`, `node_modules`,
build output or Railway logs. Added now: `12b/curse-caption-b92/strava.txt` and `curse-caption/maestro.txt` (4 KB each).

Left out and now in `.gitignore`:

| Where | What | Size |
|---|---|---|
| App repo, `docs/reports/**/YYYY-MM-DD_HHMMSS/` | Maestro `--test-output-dir` debug folders from the chunk 12 checks, keyboard probe and reruns and the 12b flows: per-step screen-hierarchy JSON, per-step screenshots, `commands.json`, `manifest.json` (the `*.log` files were already ignored) | 881 files, 457 JSON (481,026 lines) + 424 PNG, 107 MB; 10 PNGs over 1 MB |
| Agents repo, `agents/runs/` | Raw harness runs from Oct 10–12 (builds 83–87): step screenshots plus their html/json | 4,600 files, 488 MB (3,462 PNG) |
| Agents repo, `agents/.tmp/` | 16 one-off diagnostic scripts (sign-in, field and tap probes, the 12b two-simulator check, whose output is in `12b/two-sim-check.txt`) | 16 files, under 1 KB each |

Still ignored as before: `docs/reports/**/account.json` (test-persona logins), `*.log`, `ios/`, `node_modules/`,
`backend/deploy-sha.txt`.
