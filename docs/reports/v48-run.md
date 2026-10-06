# v48 run

Branch stack starts at `feat/v48-a-foundations` from main `3b8e9af5`.

## A1 Tokens

Commit `36f2c242`. tsc 0. Tests 281 files / 1482 after A5 (A1 was 279 files / 1475).

Ported `tokens.v46.ts` into `lib/design-system.ts` (`DS_V3`): surface `#1A1918`, raised, hairline, text roles, selected invert colours, `categoryTint` (flag 199), six avatar tints. Title L, Title, and Headline are weight 600. Display numerals stay SF Pro weight 800 (`fontFamily` unset so iOS uses the system face). `dynamicType` maps titleL → title1, title → title3, headline → subheadline, number → null. Old names `display`, `heading`, and `bodyStrong` alias the new roles.

Grep:

- Raw 6-digit hex in `components/` and `app/`: none.
- `fontSize` / `fontWeight` literals outside `lib/design-system.ts`: 162 files in `components/`, `app/`, and `lib/`. BLOCKED: rewriting every stylesheet is the screen work in C–F. The token values those screens already spread from `DS_V3.type` did change.
- Orange still in use: `DS_V3.color.brand` (`#DC5401`) and `primary` (`#BB471D`) are the token roles. Retired `brandText` / `brandTint` are still referenced from 74 files (onboarding, share stickers, profile tokens, theme palettes, create steps). Those stay listed until the screen phases invert selection and drop orange text.

## A2 Safe areas

Commit `bb774608`. tsc 0. Tests 280 files / 1478 at that commit; suite is 1482 at the phase tip.

`lib/safe-area.ts` ports the v48 floors (top 59, bottom 34, tab total 83). `components/ds/Screen.tsx` applies `max(inset, floor)` for the requested edges. `lib/safe-area.test.ts` fails if an `app/` route (not a layout, not `+api`) renders without `<Screen`.

Files changed: every previous `SafeAreaView` route under `app/`, plus `app/create/index.tsx`, `app/(tabs)/create.tsx`, `app/create-challenge.tsx`, `app/onboarding/index.tsx`, `app/paywall.tsx`, `app/+not-found.tsx`, `app/proof/[id].tsx`, `app/profile/day.tsx`, `app/task/complete.tsx`, `app/task/secured.tsx`, `app/challenge/complete.tsx`, `app/challenge/end.tsx`. Inner flows that already padded the same inset (`TaskFlowV2`, `CreateWizardV2`, `OnboardingFlowV2`, paywall bodies, `MomentScreenV3`, `SecuredDayScreen`, `ChallengeEnd`) no longer add a second top inset. `components/ds/Sheet.tsx` uses `max(inset.bottom, 34)`.

## A3 Copy

Commit `8e6e24dd`. tsc 0. Suite green.

`lib/copy.ts` is the port of `v48/copy.ts`, including `FREEZE`. Home recovery, the morning-after fact and button, FreezeSheet, StreakSheet, and the challenge-detail freeze row read `FREEZE`.

Grep: no `"Verified"` or `VERIFIED` string literals in `app/` or `components/`. Other freeze sentences remain and are not the shared offer line: hard-mode "No freezes." on challenge detail, paywall "4 streak freezes…", JeopardyModal (Phase C deletes it), consistency explanation, settings "1 streak freeze a month".

## A4 Routing

Commit `12ebdca0`. tsc 0. Suite 1480 tests at that commit.

`originTabHref("home")` is `/(tabs)`, the file `app/(tabs)/index.tsx`. `/(tabs)/index` was the build 75 not-found. A test checks every origin tab href exists on disk and does not contain `/index`. `+not-found` is canvas, `headerShown: false` on the screen and in the root stack, label "Go to Home", and that link uses `originTabHref("home")`.

## A5 Config

Commit `05d20f40`. tsc 0. Tests 281 files / 1482 passed.

`INVITE_BASE` lives in `lib/config.ts` (the deep-link env, otherwise null). `inviteDeepLink` builds `{INVITE_BASE}/i/{code}`, or `griit://i/{code}` when the base is unset. Never `griit.app`. `app/i/[code].tsx` redirects onto `/invite/[code]`.

`GET /api/config` returns `{ min_supported_build }` from `MIN_SUPPORTED_BUILD`. Launch calls `readMinSupportedBuild()`. The force-update screen is Phase F. **needs Railway deploy.**

## Phase A tip

`feat/v48-a-foundations` @ `fe1cf1a3` (report on top of `05d20f40`). tsc 0. 281 files, 1482 tests.

## B Week strip

Commit `49878a88`. tsc 0. Suite green at that commit.

`WeekStrip` is one Pressable. Circle sizes: home and detail 30, sheet 36, profile 20. One VoiceOver label. Cells are hidden from accessibility.

## B Avatar tints

Commit `04c1c583`. tsc 0. Tests passed (avatar suite).

`avatarTint` returns one of the six `DS_V3.avatarTints` pairs, hashed from `userId`. A missing id stays border / textPrimary.

## B Task row and gate line

Commit `a62b5fab`. tsc 0. `lib/gate-line.test.ts` 3 tests.

`lib/gate-line.ts` orders Camera, then the time window, then Location. A closed window reads `Window closed · from–to`. A window that is not open reads `Opens at {from}`. Photo mode none with no location inserts `Self-reported`. `TaskRow` done check is brand on a raised circle. `TodaySection` is in the same file.

## B Streak strip

Commit `dcaa06ca`. tsc 0.

Flame is brand. The number uses number size M and weight 800. The strip and the week row share one open target for the streak sheet. Status is body. The primary slot is optional.

## B Share choice

Commit `bfdfa2dd`. tsc 0.

States: unanswered, shared, kept, failed. Unanswered offers share and "Keep it to the record", with caption "No answer keeps it private." Those buttons are raised, not the one orange primary.

## B Cover

Commit `b18bf9b6`. tsc 0.

`Cover` paints `categoryTint` and a day count. It does not take a proof photo.

## B Selection

Commit `a878e4c5`. tsc 0. Suite 283 files / 1486 tests.

Selected chips and segments use `selectedBg` / `selectedText`. No orange fill and no orange label on the selected state.

## B Feed post

Commit `91126726`. tsc 0. `lib/feed-group.test.ts` 2 tests. Suite 284 files / 1488 tests after the sheet commit.

`PhotoPost` is a full-bleed 4:5 carousel with a camera seal. It does not say Verified. `groupActivity` merges consecutive events for one challenge and drops extras inside the cap of one group per four posts. `activityText` reads "A, B, C and 1 other started Dawn".

## B Proof day feed

Commit `62158e03`. tsc 0.

Grid tiles are 4:5. Today is a dashed tile. A tile with no photo shows the task name and Self-reported. Private tiles show a lock. `ProofDayBlock` is the vertical day carousel. The owner sees Shared or Private and "Share this proof".

## B Image fallback

Commit `78054099`. tsc 0.

`ProofFallbackTile` already drew the missing photo. `ImageFallback` is that same component.

## B Sheet

Commit `5051e198`. tsc 0. Suite 284 files / 1488 tests.

When a sheet has a footer, the body keeps `stickyGap` (12) above that footer so the last line is not flush with the button.

Frame match: none in Phase B. These are shared components. Screens land in C–F.

## Phase B tip

`feat/v48-b-components` @ `ef1e7501` (report on top of `5051e198`). tsc 0. 284 files, 1488 tests.

## C1 Home

Commit `f2fc9c5e`. tsc 0. Suite 285 files / 1490 tests.

Home opens on `StreakStrip`: flame, number, week circles, one `homeStatus` sentence, then the primary. The date and name header and the Home bell are gone. `JeopardyModal` is deleted. The first-day line sits under the first Today section. The week count `WEEK.line` renders only in `StreakSheet`. The Activity tab carries the unread dot in `textPrimary`. The active tab icon is brand. The plus is textPrimary.

Grep: `JeopardyModal` has no callers in `app/`, `components/`, or `lib/`. HomeV3 does not call `homeDateCaption` and does not label Notifications.

Frame match 301–326: BLOCKED. A simulator is booted (GRIIT iPhone 16 Pro, not the required iPhone 15 Pro) and this run has no seeded `is_test` login, so no side-by-side frames were saved.

## C2 Task window

Commit `a0c3df9b`. tsc 0. Suite 285 files / 1491 tests.

Blocked step title is `WINDOW.opensAt` from `schedule_window_start`, otherwise `gateTime.start`, formatted 12-hour. It does not say midnight. The closed-window follow-up is "It opens again at the same time tomorrow." Task complete is already inside `Screen`, so the top floor is 59.

Grep: `Tomorrow opens at midnight` is gone from `lib/task-ui.ts`. `BlockedStep.tsx` contains `WINDOW.opensAt` and does not contain midnight.

## C3 Share choice

Commit `ae59b182`. tsc 0. Suite 285 files / 1491 tests.

The finish moment uses `ShareChoice`. A photo offers "Share to the feed". Anything else offers "Share as a card", which opens the sticker sheet. "Keep it to the record" stays on the screen as private. No answer stays private.

Frame match 375+: BLOCKED for the same reason as C1. No iPhone 15 Pro capture and no seeded `is_test` session.

## C4 Free-tier limit

Commit `43c86ce4`. tsc 0. Suite 285 files / 1491 tests.

Joining a fourth challenge opens a sheet headed "3 challenges" with the free-plan sentence, primary See Pro, and secondary Leave. It no longer toasts the one-line error and jumps straight to the paywall.

## C5 Leave at midnight

`leave_effective_at` is applied in production. Leave writes that timestamp as the next local midnight and leaves `status` active. `runDailyReset` calls `applyScheduledLeaves`, which sets `abandoned` plus `ended_at` only after that instant has arrived in the profile timezone. A UTC-date rollover during the evening in New York does not abandon the row.

Commit `74148044`. tsc 0. Suite 286 files / 1496 tests. **needs Railway deploy.**

Grep: `challenges-join.ts` contains `leave_effective_at: endsAt` and `nextLocalMidnightIso`. `daily-reset.ts` contains `ended_at: at`.

## C frame match

Seed account `seedgriit` on iPhone 16, 393×852. Side-by-side images: `docs/frame-match/309.png`, `docs/frame-match/390.png`. Index: `docs/frame-match/INDEX.md`.

Fixes from the frames: the lost-day sentence includes the close time and the task that still counts; the home primary is the task name; the today ring is textTertiary; a section count reads “n of n done”; not-found uses the frame copy on a dark screen.

309 accepted differences are the seed’s streak, challenges, and the feed sitting under those three cards. 390 matches. The other batch-1 frames are logged as state not reachable with seed data.

tsc 0. Suite 286 files / 1496 tests.

## D6 Strict

The difficulty label is Strict. The No Days Off starter pack keeps that name. A freeze on a strict challenge says “Strict challenges do not use freezes.”

tsc 0. Suite 286 files / 1496 tests. Frame match for Discover, Challenge, and Profile is still ahead.

## Step 1 · v48.1 and v48.2 handoff

The newest export is `~/Desktop/AURAPEP/OCT 5 0721.zip` (5 Oct 2026, 19:21). Extracted with `ditto -x -k`. `atlas/source` has `GRIIT v48.1 Patch.dc.html` and `GRIIT v48.2 Home Opening.dc.html`. `atlas/source/assets/proofs` has 20 jpgs. Those photos stay in the handoff. They are not imported into the app.

Committed on main as `6b24fe59` (`design: v48.1 + v48.2 handoff (approved)`) and pushed. Merged into `feat/v48-d-feed-discover-challenge-profile` as `5dc25735`.

## Phase H · routing, keyboard, sticker, plurals

Commit `e8de1da2`. tsc 0. Suite 287 files / 1502 tests.

`routeAfterSave` sends a finished enrollment to FinishMoment, a day that just secured to Secured, and every other save to a Home toast. A counter at its target does not finish the enrollment, and the day index alone does not either. That flag is passed from the counter, water, and reading steps into the secured screen.

The sticker style still paints a transparent PNG. “1 day in a row” replaces “1 days in a row” on the big-number and sticker styles. Copy sticker is on the sticker style only and sets the line “Copied. Paste it in your Instagram story.” Instagram Story stays hidden until a Meta App ID is set.

Caption, write, and the counter type field sit in one `KeyboardDock`. The number pad has a Done bar that only dismisses the pad. “Log n of N” stays in the footer of that dock. Comments, create, and edit profile are not on that wrapper yet.

Not done in this commit: the outlined share pill on the camera toast (814–816), the optimistic Home insert with Undo, and the finish card reading server `secured_days` and `longest_streak`. The secure response still returns the active streak, not those two fields.

## Phase H2 · band copy

The none line is `No one’s posted today. You’re first.` in `lib/today-band.ts`, with the 1 / 2 / 3+ name rules. `StreakStrip` has a slot between the week strip and the day line. The slot is empty until a `today_posters` query exists. Showing the none line without that query would be wrong on a day when someone has posted.

tsc 0. Suite 288 files / 1506 tests.

## H2 · today_posters

`feed.todayPosters` reads shared photo proofs since the viewer’s local midnight. The circle is people they follow plus members of their active challenges, including themselves. Blocked people and `is_test` authors are dropped. One person counts once, newest first. No new table.

The Home band fills the streak-strip slot. While the query is loading the slot stays empty. Zero posters is the one line “No one’s posted today. You’re first.” and it is not tappable. Any poster is a surface row with the newest photo. Tapping it scrolls the Home list to that event, or to the first feed row if the event is not loaded yet. Opening Home and pulling to refresh refetch the query.

tsc 0. Suite 289 files / 1510 tests. **needs Railway deploy.**

## H · camera share pill

A camera proof toast and the secured screen use an outlined pill, “Share this photo to the feed”, with “Keep it to the record” as quiet text. Nothing starts selected. The photo toast stays 8 seconds. Sharing calls `checkins.shareProof` and puts that post at the top of the Home feed immediately. Undo calls `checkins.unshareProof` and removes it. A self-reported toast still opens the card sheet.

tsc 0. Suite 290 files / 1511 tests. **needs Railway deploy** (`unshareProof`).

## H · keyboard dock on comments, create, and edit profile

Comments (the sheet), create, and edit profile use `KeyboardDock`, the same wrapper as the caption, write, and counter steps. Create’s Continue sits in that dock. The custom duration field uses the number-pad Done bar.

tsc 0. Suite 290 files / 1511 tests.

## H · finish card

`challenges.finishRecord` counts `day_secures` on the enrollment’s due dates and the longest run. A freeze holds that run and does not add to it. The finish screen stays blank until the query returns, then shows secured days, longest streak, held days, and days done. The share card gets the same numbers. No new column.

tsc 0. Suite 291 files / 1515 tests. **needs Railway deploy.**

## C–F · leave, group activity, force update

Leave confirms with “Leave at midnight” and “Stay”. Today still counts. Notifications label is “Group activity”. A build below `min_supported_build` shows “Update GRIIT to keep going” and opens the App Store. An unset minimum never blocks.

tsc 0. Suite 291 files / 1516 tests. **needs Railway deploy** (`/api/config` already in the tree; the screen reads it).

## D · delete from the feed

An own post’s menu says “Delete from the feed” and calls `checkins.unshareProof`. The proof stays on the record as private. It is not deleted.

tsc 0. Suite 291 files / 1516 tests. **needs Railway deploy.**

## E · blocked users

Privacy opens Blocked users. The list comes from `profiles.blockedUsers`, including the block date already stored on the row. Unblock removes the block and does not restore a follow. Empty state: “No one blocked.”

tsc 0. Suite 291 files / 1516 tests. **needs Railway deploy** (the list now includes `created_at`).

## Still ahead

Phases C through F are not finished. C frame match covers the reachable seed states only. D6 (Strict) is the only Phase D product commit. Discover, challenge, profile, activity, create, settings, paywall, onboarding, and auth frame match are not done.

QA flows are not scripted. `docs/reports/v48-gaps.md` is not written. Build 76 is not cut. Railway has not been deployed for the daily-reset leave path or the Strict freeze message.
