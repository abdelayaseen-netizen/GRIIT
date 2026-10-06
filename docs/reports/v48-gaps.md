# v48 gaps

Written 5 Oct 2026 on `feat/v48-d-feed-discover-challenge-profile`. This list is what is not built, not matched, blocked, or accepted. It is not a status of the screens that already exist.

## Frame match

The gate is a simulator shot beside the atlas frame in `docs/frame-match/`, with differences fixed or marked accepted.

Captured and compared:

- 309 Home, closed window. The status line matches. Accepted: the seed streak is 0, the week is empty, and the three challenges are the seed set. A RevenueCat offerings error on the simulator is StoreKit configuration, not a price string in the app.
- 390 Not found. Copy and the one filled primary match.

Not captured:

- Batch 1R frames 301–308 and 310–389 and 391–405. Index marks them “state not reachable with seed data”. That mark is incomplete. Several of those states are reachable (secured day, freeze sheet, share sheet, not-found was reachable, leave confirm, permissions). They were not screenshotted.
- Batch 2 (501+), batch 3 (601+), batch 4 (701+): no side-by-side images.
- v48.1 frames 801–822: no side-by-side images.
- v48.2 Home band, option C, frames 909–913: no side-by-side images. Frames 901–908 are the options that were not chosen.
- The last simulator session was left on the LogBox for a missing `feed.todayPosters` procedure. Production does not have that procedure until Railway deploys. The client now hides the band on that error instead of showing the none line. Discover covers were changed after the last good Discover screenshot, so the cover tint is not visually confirmed.

## Phase I — streak safety net

Built on the server and in the client. Not live until Railway deploys this commit.

- Grant on `checkins.secureDay` when the new secured streak is a multiple of 7, held is under the cap (Free 2, Pro 4), and `freeze_grants` has no earned row for that date. Returns `freezeGranted`, `freezesHeld`, `freezeCap`, `freezeAtCap`.
- Tests cover 7, 14, at cap, unique-date re-save, and a freeze-held day that bridges without counting.
- Secured screen: “Freeze earned. You hold {n}.” or “You’re holding the max, {cap} freezes.” Snowflake, no confetti.
- Streak sheet adds “{n} of {cap}” and “Next at {7k}-day streak” beside the older “n freezes left” sentence. The older sentence was not removed.
- Record and streak sheet already include “{done} of {total}”. The sheet still appends “tasks.”
- Closed window (frame 309) already says the other task still counts for its own challenge.
- Morning-after push is in the reminder cron. Tap data is `focus: freeze`, and Home opens the freeze sheet.

Accepted deviations on the push:

- The 3-a-day cap counts `activity_events` with `metadata.channel = push` since UTC midnight of the date key. The existing morning and streak-at-risk reminders do not write that marker, so they are not in the count.
- “Never sent twice” is the `morning_miss_push` row for yesterday’s date key. There is no new column. A failed insert after a successful push can send again on the next cron hour.
- Median check-in time uses `task_completed` events from the last 14 days. Fallback is 9:00.

`supabase/migrations/20261005120000_freeze_grants.sql` matches the table already applied in production. It was not executed from this run.

## Retired

- `(tabs)/teams` redirects to Home. The tab stays `href: null`.
- `create-challenge` already redirects to `/create`.
- `JeopardyModal` is already deleted.
- `create-profile` is not a redirect. Login still sends a user with no profile there. Replacing that form with onboarding was not done, because it is the only profile-creation path on that branch.

## No Global leaderboard

Activity does not offer a Global chip. The weekly global query is no longer fetched. The `leaderboard.getWeekly` procedure still exists on the server and is still tested. It is not shown.

## Locked-law leftovers

- Orange text (`brandText`) is still used on buttons, text links, chips, and onboarding. Discover’s “Be the first” was changed to secondary text. A full sweep was not done.
- User-facing “days verified” on the profile consistency line, the finish line, and the Sunday notification note now says “secured”. Field names such as `totalVerified` remain. Design-handoff source still says Verified. That source is the atlas, not the app.
- Invite links use `INVITE_BASE`. They do not use griit.app.
- Paywall prices are read from RevenueCat. The simulator offerings error is StoreKit, and RevenueCat was not changed.
- Safe-area floors are in `lib/safe-area.ts`. Frame 394 and 395 were not screenshotted.

## Product deviations

- `enrollmentFinished` returns false when `counterReachedTarget` is true, including on the last day. A counter that hits its target does not open the finish moment. Logged, not changed.
- Onboarding order is still welcome → goals → why proof → why circle → commitment → first challenge → reminders → account → profile. The spec order uses a day-target step. `store.commitment` is still decorative. Standard/Hard remains challenge difficulty. The hard label in the create wizard is “Strict”. Not swapped, because the commitment screen’s product meaning was not confirmed.
- Leave copy is “You leave at midnight.” It does not name a successor. Creator ownership pass is not in the sheet.
- Blocked-user confirm is gender-neutral. The frame’s “He’ll” for Khalid is not used.
- Own-post “Delete from the feed” calls `checkins.unshareProof`. It does not revert a `secured_day` row.
- `is_test` authors, including the viewer, are dropped from `feed.todayPosters`. The seed account sees the none line only when that query returns zero.
- Share sticker export is 1080×1920 via `SHARE_H`. The atlas sticker is a square transparent PNG. Copy sticker exists (`copyStickerPngToPasteboard`). The square export was not built.
- Instagram Story stays behind `showStoryAction` until a Meta App ID is set.
- Apple Health row stays “Not asked” / “Import runs (not built)”.
- No offline posting queue was added.
- No custom domain. No gym map.

## QA

Not run. Maestro and Detox are not installed. No recordings in `docs/qa/`.

These flows have no pass:

- onboarding → first proof → share choice → Secured
- two-challenge day
- freeze the morning after a miss
- closed window
- join from Discover
- create from a pack
- free limit → leave
- leave at midnight
- Profile grid → day feed → share a private proof
- comment, respect, report, block → unblock
- Copy sticker
- typing in every input with the keyboard open
- earn a freeze at 7, freeze cap
- both morning-after push branches

Simulator camera captures have previously written files under the 8KB proof minimum. A camera flow will fail until that file is a real photo.

## Ship

Not done.

- About already formats “Version 1.0.0 (build N) · commit abc1234”. Build 76 has not been cut. The last production EAS build is 75.
- Railway `/api/health` was last confirmed on `142f379`. It does not yet serve `feed.todayPosters`, `checkins.unshareProof`, `challenges.finishRecord`, or the freeze grant. Do not cut a build before that deploy.
- v48 branches are not merged to main. `main` is checked out in the other worktree `/Users/yaseenabdela/Developer/GRIIT`, so this worktree must not check out main.
