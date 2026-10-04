# Chunk G + H overnight — 3 Oct 2026

Build target: **73**, internal TestFlight only. No SQL applied. No beta group added.

## Ship

| Check | Result |
|---|---|
| `feat/chunk-g` → main | Merged [PR 123](https://github.com/abdelayaseen-netizen/GRIIT/pull/123) as `245e27e7`. Remote branch deleted. |
| `feat/chunk-h` → main | Merged [PR 124](https://github.com/abdelayaseen-netizen/GRIIT/pull/124) as `db79a6a65d457335004b9568542b12629668121d`. Remote branch deleted. |
| Before G merge | `tsc` 0. Vitest **269 files / 1434 tests**. `expo export --platform ios` produced the iOS bundle. |
| Before H merge | `tsc` 0. Vitest **271 files / 1435 tests**. `expo export --platform ios` produced the iOS bundle. |
| Schema | No new table or column. Nudges write `in_app_notifications` (`type` `general`, `actor_id`, `metadata`, `data`, `title`, `body`, `read`). Roster reads `check_ins.active_challenge_id`, `task_id`, `date_key`, `status`. Those columns are in `supabase/migrations`. `verification_gates` is the production column added on main (`20261004010000`) and was merged in so this ship does not drop it. Featured catalog SQL was not applied. |
| Railway | `GET https://grit-backend-production.up.railway.app/api/health` returned **200** with `"commit":"db79a6a"` after the H merge. |
| EAS | **Build 73** (incremented from 72). [Build](https://expo.dev/accounts/yaseenabdela/projects/griit-challenge-tracker/builds/2d870535-a3fd-491d-8034-32037afecd4c) finished and [submitted](https://expo.dev/accounts/yaseenabdela/projects/griit-challenge-tracker/submissions/42f26cea-9181-4b57-9ab1-cd096ed95ca8) to App Store Connect. No external tester group was added. Apple still has to finish processing before it shows in TestFlight: https://appstoreconnect.apple.com/apps/6761116285/testflight/ios |
| Screenshots | No device or simulator frame-match shots. This session has no phone UI. Notes below are what was verified in tests and exports. |

Main had already moved (`fix/checkin-columns`, PR 122) after chunk G branched. That lock was merged into `feat/chunk-g` (`a9616c48`) and then into `feat/chunk-h` (`7dee77d1`) before the pull requests, so the column lock stayed. The GitHub merge tree matches `7dee77d1`.

## Commits

Chunk G (`feat/chunk-g`, now on main):

- `50e8794b` docs: v44 + v44.1 handoff
- `30b7a3c6` Replace the story sheet with one 1080 share image.
- `8581f56c` Remember share colours on device and drop the invite code from the card.
- `30f41488` Give photo and self-reported proofs the same feed card.
- `e8f8465c` Show today's date, streak, and closed window on Home.
- `c72d9a9b` Toast a task when the day is still open, and keep one secured screen for the last.
- `2b138a80` Add the challenge detail sections and the home streak sheet.
- `86a671e9` Add the featured catalog, preview sheet, and set-your-gym step.
- `879b0ae6` Match the create review and launched screens to the finished pass.
- `a9616c48` Merge main so the check_ins column lock stays in chunk G.

Chunk H (`feat/chunk-h`, now on main):

- `afff62f4` docs: v45 groups handoff
- `db8a9f2b` Count a group roster as secured from this challenge's check-ins.
- `4425f049` Send a nudge as an in-app notification, once per person per day.
- `6332b175` Retire accountability partners so groups are the only partner path.
- `8c943e23` Tell group creators that members see today's task count.
- `4b7319fe` Cap group pushes at two a day and let a nudge outrank a join ping.
- `1afbdab5` Keep group invites on the existing app deep link.
- `7dee77d1` Merge chunk G so the check_ins column lock is in chunk H.

## Chunk G

### G1 — share image

Done, including the review:

- Last colour per style is in AsyncStorage (`griit.shareColour.v1`), try/catch, default Ink.
- Until `SHARE_JOIN_WEB_ORIGIN` is set, every style including Invite prints `Find me on GRIIT · @{username}`. The challenge id is not printed as a code.
- Dev-only `/dev/share-styles` renders all 7 styles × 3 colours through view-shot so they can be saved to Photos on a device. `__DEV__` only.

### G2 — feed, Home, toast

Done. Photo and self-reported proofs share one card. Home shows today's date, the streak chip only when the streak is at least 1, and the closed-window follow-up. A non-last task toasts and leaves. The last task opens the secured screen.

### G3 — detail, streak sheet, kept proofs

Done. Challenge detail meta line, home streak sheet, and the kept-proofs empty body when the person has secured days.

### G4 — featured catalog

Done, with these limits:

- Eight built-ins, horizontal Discover cards, preview sheet, and a set-gym screen after a place-gated join.
- Draft SQL is `docs/drafts/v44-featured-catalog.sql`. It was not applied. Joining a built-in fails until that INSERT is applied by hand.
- Member counts on the cards are hardcoded 0 ("Be the first").
- Set-gym does not write a place to the server. Save and Skip both return Home.
- Lengths used: Fajr 7, 7K Steps 7, 3 Good Things 7, 10 Pages 14, Quran Daily 30, Cold Finish 14. 7K Steps is a self proof.

### G5 — create

Done. Category starts empty. Length default 7. Review lock and launched copy match the finished pass. **Start today goes Home**, not into the first task, because the create-launched test forbids opening a task from the wizard. The photo privacy line stays the photo sentence. Groups already skip the Anyone / Invite radios and show the invite caption.

## Chunk H

v45 handoff unzipped from `~/Desktop/AURAPEP/OCT 3 0955 GROUP .zip` into `docs/design/`, excluding `uploads/`.

### H1 — roster secured

Done. "Secured" is today's completed `check_ins` for this challenge against required `challenge_tasks`, in the member's timezone. `day_secures` is not used for that flag. The same helper feeds `groups.members`. Reads use the service client because check-in RLS is own-row only. If the service role is missing, other members look unsecured.

Not built from the frame: "window closed" and "Joined today · Day 1" captions. The row says "Secured" or "Not yet · n of m". Group streak still uses `day_secures`.

### H2 — nudge

Done. No `nudges` table. Inserts `in_app_notifications` with `type` `general`, `actor_id` = sender, and the same payload on `metadata` and `data`: `{kind:'nudge', challenge_id, message_key, date_key}`. The Activity reader uses `data`, so both are written. Lines are only "2 hours left.", "Don't break the chain.", and "We're waiting on you." Once per sender, recipient, challenge, and recipient-local date. Server requires the same challenge, recipient not yet secured, and not self.

Not built: sender name on the push, a real 2-hour deadline before line 0, a bulk "nudge the n who are left", and a banner on the Today card. "Can still secure" means required tasks are not all completed. A closed window is not a separate block.

### H3 — accountability

Screens `app/accountability.tsx` and `app/accountability/add.tsx` are gone. Battle Buddy is no longer awarded. No migration card. The achievement label remains so an old badge still has a name.

**Changed from a hard unmount:** the router stays mounted and every procedure rejects with "Accountability partners are now groups." It does not read `accountability_pairs` and it does not send a partner push. Builds 69–72 keep a route instead of a missing procedure, and production is not queried for a partners table. That is the additive reading of the ship rule.

### H4 — invite-only groups

Done. Create already forces `PRIVATE` for a team and hides the Anyone / Invite radios. The extra line is on the group rules step: "People in a challenge with you see how many of today's tasks you've done." The photo privacy sentence is unchanged. Standard / No Days Off still means freezes versus reset.

### H5 — two pushes

Done. At most 2 group pushes per recipient per local day. A joined ping leaves one slot open until a nudge has used a slot, so a nudge outranks a join. The in-app row is always written. `metadata.pushed` is what counts toward the cap, so an Activity-only row does not burn a push.

### H6 — invite link

Done. Group invite buttons call `inviteToChallenge`, which builds `griit://invite/{code}`. No web domain is printed.

### Skipped — H-G4

No 8pm "you're left" push. No morning-after "finished" push. No cron.

## What to check on the phone, in order

1. Dev screen `/dev/share-styles` (a dev build). Save the 21 cards. Confirm the join line is `Find me on GRIIT · @you` on Invite as well, and that the last colour per style sticks after a restart.
2. Finish a task that is not the last one: a toast, no finish moment. Finish the last one: the secured screen, share preview, save.
3. Home: today's date, streak only when it is at least 1, and the closed-window sentence when the window is shut.
4. Discover: the eight featured cards and the preview sheet. Set-gym Save and Skip both land on Home. The place is not stored. A built-in join will fail until the draft SQL is applied.
5. Create a group: no "Anyone" choice. The task-count privacy line is under the photo line. Share invite opens the system sheet with the app link, not a website.
6. Group roster: a member is Secured only after this challenge's tasks are done today. Yesterday's `day_secures` row must not flip them to Secured.
7. Nudge someone still open, once, with one of the three lines. A second nudge the same day is refused. The row is in Activity. A third group push that day stays in Activity and does not notify.
8. Accountability screens are gone from the app. An old client that still calls the partner invite gets the retired message, not a push.
