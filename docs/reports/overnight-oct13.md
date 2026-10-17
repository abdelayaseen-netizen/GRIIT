# Overnight Oct 12 → 13

Build 88 is in progress on `feat/build88`. It has not shipped. API spend against the $25 cap: $0.

## Morning message (partial — the run is still going)

- Build 87: number 87, commit `8972cd30`, EAS `803996c7-ddce-4f63-ae28-6eac22242be2`, FINISHED and submitted to INTERNAL TestFlight (Team (Expo)). Part A was skipped because that build was already on EAS.
- Build 88: not submitted. Branch `feat/build88`. Liquid Glass has not been started.
- PDF: not written yet. The copy next to the design zip is not written yet.
- Pending SQL: the App Review `is_test` update in `docs/sql/pending-oct13.sql` was applied on the morning of Oct 13. Still pending, flags off: Discover category updates for 5-Minute Morning Prayer (faith) and Drink Water Today (health), and the `starter_tasks` table. `STARTER_TASK_ENABLED` is false.
- API cost so far: $0 of $25.
- Live Activity Pause and Done buttons were skipped. `expo-live-activity` 0.5.0-alpha1 has no button or App Intent field. The lock screen says “Done. Tap to post.” Pause and Done stay on the in-app timer.
- Private copy audit: “Private. Only you can see this.” shows on a proof when `task.shared` is false. Feed queries that use `share_state = shared` do not return those proofs. `listMine` does not filter `share_state`, so the owner still sees older private rows in their own list. Friends posts are `shared` with `metadata.audience = friends` and are dropped from the Everyone scope and from non-friends. Only me is `kept` with `audience = only_me`. The owner’s profile post list includes those. Older kept rows with no audience stay off that grid. Hiding is query-side, the same as the existing share filter. No RLS change.

## Build 87

Part A was skipped. The ten build 87 flows had already passed before this night. Delete-account passed.

Delete-account cause: a Maestro tap on `delete-submit` inside the modal does not fire the Pressable. A real touch on “Permanently delete my account” runs `profiles.deleteAccount` and lands on Sign in. The passing flow hides the keyboard and taps the button’s point. The confirm control is not nested, and the backdrop is not a pressable over the card.

## Build 88 so far

| Item | Status | Commit |
|---|---|---|
| 1 Likes | Shipped on the branch | `4958238d` |
| 2 Streak refresh | Shipped on the branch | `146501f3` |
| 3 Timer day numbers | Shipped on the branch | `2545c0f3` |
| 4 Proof viewer dates | Shipped on the branch | `4268288c` |
| 5 Hide test and review accounts | Shipped on the branch | `40586b40` |
| 6 Profile grid thumbnails | Shipped on the branch | `7ac351f2` |
| 7 Saved toast | Shipped on the branch | `c5b54b3e` |
| 8 Share card | Shipped on the branch | `08056677` |
| 9 Counter Done in one tap | Shipped on the branch | `63f917aa` |
| 10 Timer Finish early | Shipped on the branch | `258575f5` |
| 11 Live Activity | Copy only. Pause and Done buttons skipped | `3cdf3a72` |
| 12–15 Posting visibility | Shipped on the branch | `a0983dac`, `47487ee3` |
| 16 Profile header lists | Shipped on the branch | `53862585` |
| 17 Vertical posts | Shipped on the branch | `2f5ed4c9` |
| 18 Feed dates and finished card | Shipped on the branch | `54f8baa2` |
| 19 Discover | Shipped on the branch. Category SQL pending | `e106ab18` |
| 20 Starter task | Flag off (`e64de33d`). Table SQL pending. Screens not built | `e64de33d` |
| 21 v53.1 visuals | Not started | |
| 22 Liquid Glass | Not started | |

### Likes cause

`updatePost` treated the infinite-query cache as `{ posts }`. The cache is `{ pages, pageParams }`, so `old.posts` was undefined and the heart handler threw before `feed.react`. Heart and double-tap both use that handler. The mutation and the likes RLS were already fine. The fix patches `pages`. Double-tap still never unlikes.

### Streak

Home preferred a stale `profiles.getRecord` and ignored the secured flag on today’s circle. Completing a task now refreshes that record, and today’s circle fills when the day is secured.

### Timer day

The timer enrollment read asked for `started_at`, which is not a column on `active_challenges`, so the day fell back to 1. The select is now `start_at, created_at`. The running header uses “Day n of N” as the title and the challenge name as the label. The day line stays hidden until the enrollment row loads.

### Proof dates

The viewer stamped one route date on every photo and kept a stored day number. Each proof now uses the capture time in the profile time zone, and Day n comes from the same calendar function as the rest of the app.

### Test and review accounts

People search did not drop `is_test`. Suggestions and the feed already did, once the flag was set. The App Review profile was created with `is_test` false, so its posts stayed in the feed. Real viewers now also hide the display name “App Review” until the pending SQL sets the flag. Discover participant counts subtract active enrollments whose profile is `is_test`.

### Counter

The primary button reads “Done · {target} {unit}”, including when a photo is required. One tap sets the count to the target. A required photo still opens the camera. +1, +5, and +10 stay as secondary controls.

### Saved toast

The photo thumbnail was drawn inside an outline Share control, so the button looked faded and the image covered the tap target. The photo now sits beside a solid Share button. The toast still stays up for 4 seconds.

### Finish early

While the timer is running, “Finish early” is always enabled. It pauses the clock, stores the elapsed seconds on the existing `timer_seconds_on_screen` column, and completes the task as self-reported. A short duration no longer fails the minimum-minutes check when it is self-reported. No new column was required. The line “Post opens when the timer reaches zero.” is gone.

## Still to do

Starter task screens behind `STARTER_TASK_ENABLED`, v53.1 visuals, Liquid Glass in its own commit, Maestro, merge, deploy, INTERNAL TestFlight for build 88, the 36-agent test, the simulation, S1–S8, and the PDF.
