# Chunk 02: Finish flow and Day secured

**Spec:** `part1-finish-loop/`, frames P1-01 to P1-11 and P1-34. Checklist: the Part 1 lines from "Tapping Done…" through "Challenge complete with other challenges open…", plus "Closing the post sheet…".

**Why:** in the build 90 test, 5 of 11 photo finishers were trapped on the Proof screen (53 dead taps), and Done on Day secured failed 15 times. On your phone, the app asked "who sees this" twice.

## Items
- **02.1 One finish flow:**
  - Done goes to the post sheet. For photo tasks the camera comes first.
  - The audience is asked once (Friends by default) and the button names the choice.
  - Closing the sheet saves privately and shows the toast "Saved privately."
  - Offline: show the offline line and "Try again"; the task still counts.
- **02.2 Where it goes next:**
  - If tasks remain: Home, the toast "{task} done. {n} left today.", and the next task marked "Next".
  - If it was the last task today: Day secured.
  - If it was the challenge's last day: Challenge complete.
  - **The Proof screen never opens in this flow.** Remove the `router.replace` to `app/post/[id]` that causes the trap.
- **02.3 Day secured:**
  - Fits on an iPhone SE with no scroll.
  - Order: the streak number (Barlow), "Every task today is done.", the week strip, the tasks, then Share (primary) and Done.
  - Done, Back and swipe-down all go Home.
  - Variants: camera, self-reported, Strava, and first-time (the teaching line shows once, stored per user).
- **02.4 Challenge complete:** the two variants, including "Today isn't secured yet. {challenge} still needs today."
- **02.5 Remove the second audience prompt:** the Proof screen no longer shows the inline "Who sees this" segmented control. The owner changes it from the "…" menu (built in chunk 04).

**Areas:** `components/task-v2/`, `app/task/`, `components/share/`, Day secured and challenge-complete screens, `hooks/`.

## Gates
- [ ] Maestro on 4 task types (photo, check-off, run, counter): Done → sheet → choice → the right next screen. The Proof screen never appears (assert its title is absent).
- [ ] Maestro: Day secured → Done → Home; Back → Home; swipe → Home. 3 runs each, 0 failures.
- [ ] Day secured screenshots on SE and Pro Max next to P1-06 and P1-08; on SE, no scroll view offset > 0.
- [ ] A test proves the teaching line shows once per user.
- [ ] The 0.75 s Done → sheet timing from build 90 doesn't get worse (measure 5 runs).
- [ ] Chunk 01–02 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
