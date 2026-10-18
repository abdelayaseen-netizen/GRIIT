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
