# Bugs

From `docs/reports/bugs-oct13.md`. Only Yaseen sets a bug to closed.

| Bug | Status | Note |
| --- | --- | --- |
| 1 Likes | fixed – awaiting Yaseen | One like path. Heart toggles. Double-tap likes, including your own post. A rejected like logs the server message. |
| 2 Profile photo tap | fixed – awaiting Yaseen | Opens only with a real event id. Scrolls after the list lays out. |
| 3 Custom task dropped | fixed – awaiting Yaseen | Pack tasks and custom tasks are both saved and shown. |
| 4 Discipline saved as Fitness | fixed – awaiting Yaseen | Step 1 category is kept when a pack is picked. |
| 5 Invite copy on Review | fixed – awaiting Yaseen | Invite stays PRIVATE. Review says Only people you invite. |
| 6 Day 1 today and tomorrow | fixed – awaiting Yaseen | One sentence from start_at on step 1, Review, success, and Home. |
| 7 Success shows 1 of 3 tasks | fixed – awaiting Yaseen | Success lists every saved task. |
| 8 Test accounts in Everyone | fixed – awaiting Yaseen | Server sets is_test for Maestro emails at sign-in. Missing flags on b8 handles stay hidden. No backfill SQL. |
| 9 Best 6 vs Best 3 | fixed – awaiting Yaseen | Best streak counts freeze days. |
| 10 Morning Prayer 6 of 7 vs 5 of 6 | fixed – awaiting Yaseen | Your data uses the same day of duration, and says whether today counts. |
| 11 16 vs 18 proofs | fixed – awaiting Yaseen | One proof count. A photo on a self-reported task counts once. |
| 12 Most often around 12 am | fixed – awaiting Yaseen | Hours use the phone zone. A stored UTC default does not win. |
| 13 Everyone hint on Following | fixed – awaiting Yaseen | The hint shows only when Everyone is selected. |
| 14 Guest and signed in with email | fixed – awaiting Yaseen | Anonymous users see guest. Email shows only when one exists. |
| 15 Share preview clips | fixed – awaiting Yaseen | The preview scales the whole card into the frame. |
| 16 Strict vs Hard | fixed – awaiting Yaseen | Users see Strict. The stored value stays hard. |
| 17 Photo post stays disabled | fixed – awaiting Yaseen | A guest Post to friends saved the check-in, then the secured screen still said the photo was private. shareProof rejected anonymous users at checkins.ts (the old line 1695) and ShareChoice.tsx:58 said "Couldn't share. It's still private." The day-secured path never opened the post. Signed-in, the same button stays disabled only while the upload is in flight (Button.tsx:96) with no line. Guests and signed-in accounts now open the post. Flows: docs/reports/oct15/flows/photo-guest.yaml and photo-signed.yaml. |
| 18 Home and Discover loop | fixed – awaiting Yaseen | Build 90 chunk 02: Join lands on the first task (02.2), an empty Home shows one starter challenge card for guests (02.3), the Home ring opens the task (02.4), onboarding ends on a task (02.6). Chunk 05.4: Home, Profile and the challenge page count from the one bootstrap payload. Flows: .maestro/build90-first-day.yaml, build90-empty-starter.yaml, build90-join-suggest.yaml. Rerun overnight in docs/reports/oct-build90. |
| 19 Check-in 429 | fixed – awaiting Yaseen | The shared IP limiter in backend/hono.ts (checkRateLimit on `ip:`) returned HTTP 429, which the client logged as checkins.complete (429). Signed-in calls now use a per-user bucket (rateLimitSubject in backend/lib/rate-limit.ts). The client retries checkins.complete once after 1.5s. Build 90 04.7 and 01b.3 cut the request burst after a finish and in sign-up and join (one bootstrap refresh per finish, busiest minute 78 → 47 requests, 0 × 429 in 5 flows). |
| 20 Journal opens as self-report | fixed – awaiting Yaseen | Home sends the normalized type `text`. The task flow only opened the writer for raw `journal`, so a journal task from Home showed the self-report screen. `text` now uses the same writer. Flow: .maestro/build87-done-write.yaml. |
| 21 Guest Save sheet over Day secured | fixed – awaiting Yaseen | Build 90 06.6: the sheet no longer opens over Day secured and always offers Later; Skip reaches Home. docs/reports/build90.md chunk 06. |
| 22 Day secured task row under Done | fixed – awaiting Yaseen | Build 90 chunk 06: the footer is in flow, the list gets bottom padding, the row scrolls above Done. |
| 23 Water "oz" in the app, "cups" on the server | fixed – awaiting Yaseen | Build 90 chunk 06: one word, cups. The server reads the task's own unit first. Server deployed 66765c0. |
| 24 Double top padding on task steps | fixed – awaiting Yaseen | Build 90 chunk 06: the route owns the top inset; per-step insets removed. |
| 25 ConfirmDialog backdrop covers the screen | fixed – awaiting Yaseen | Build 90 chunk 06: 60% ink scrim like Sheet; the screen stays visible behind the dialog. |
| 26 Day secured "Couldn't load" after a finish | fixed – awaiting Yaseen | Build 90 04.7: a 429 from a request burst after a finish. One bootstrap refresh per finish; Day secured first try 5 runs in a row. |
| 27 Tapping a name or a challenge went nowhere | fixed – awaiting Yaseen | Build 90 chunk 05: every person surface opens the profile through userProfile(); feed subject line and the Home header open the challenge. |
| 28 Blocked words only checked on some fields | fixed – awaiting Yaseen | Build 90 chunk 07: every public text field is moderated server-side before any write, the message names the field; dodge-proof normalizer; report a comment. Server deployed b61ab41. |
| 29 Invite link hard to find, board_opt_in never set | fixed – awaiting Yaseen | Build 90 chunk 08: invite link as visible text with Copy and Share on create-success, after the first secured day and under "A board needs two"; griit://i/<id> opens the challenge for another account or a brand-new guest; board_opt_in true on every new enrollment (backfill SQL run Oct 17). |

| 30 Proof screen after a photo post traps the person | open – found Oct 17 overnight | After Day secured → Close, `app/post/[id]` shows with a back chevron that does nothing and Done hidden under the comment composer until scrolled. 5 of 11 photo sessions ended there. docs/reports/oct-build90/NOTES.md 1, evidence/01-*. |
| 31 Onboarding pre-selects a windowed challenge whose window is closed | open – found Oct 17 overnight | Early Riser 7 at 4:39 pm: "Window closed at 6:30 am. Today is not secured." in the task flow, "Couldn't save. Tap to try again." on Home; Day 1 cannot be secured. NOTES.md 2, evidence/02-*. |
| 32 Home shows "Day secured" and "Finish the task to secure it" together | open – found Oct 17 overnight | Streak card secured with the Day 1 ring empty while the Today caption says finish the task; held for about a minute. NOTES.md 3, evidence/03-*. |
| 33 Create step 1 "Looks good" under a title the server rejects | open – found Oct 17 overnight | Inline hint is length-only; the moderation answer comes at Review. NOTES.md 4, evidence/04-*. |
| 34 Last goal cards hidden under "Pick at least one" | open – found Oct 17 overnight | "Faith and prayer" sits under the docked footer on What are you building?. NOTES.md 5, evidence/05-*. |
| 35 Join → "Couldn't reach GRIIT. Retry" with a blank button | open – found Oct 19 overnight | 3 of 12 new users right after Join on Start here (f-07, f-11, f-12); Retry worked. The button label is invisible: `authRetryButton` and `authRetryButtonText` in `app/_layout.tsx` are both `textPrimary` (since Oct 3, so build 91 too). The root profile check failing for a just-created user is the other half. docs/reports/oct-build92/REPORT.md 1, evidence/01-*. |
| 36 Friend's running challenge from their profile: "Challenge did not load" | open – found Oct 19 overnight | Profile → Challenges, badges and stats → a running challenge. `app/profile/record.tsx` pushes `CHALLENGE_ACTIVE(row.id)` (the other person's enrollment) for visitors; should be `CHALLENGE_ID(row.challengeId)`. Retry never helps. REPORT.md 2, evidence/02-*. |
| 37 Invited friend can't see the inviter's Friends post | open – found Oct 19 overnight | Friends posts show only in Following to followers; accepting an invite doesn't follow; the shared challenge's Recent proofs says "No shared proofs in this challenge yet" to co-members. 0 likes / 0 comments in 9 social sessions. Product decision. REPORT.md 3, evidence/05-*. |
| 38 Profile has no tile for self-reported posts | open – found Oct 19 overnight | Design `ProofGrid.tsx` draws a "Self-reported" tile; the server drops them (`cameraProofTiles`, `proofsAfterSign` in `backend/lib/proof-predicate.ts`). A 33-day self-reported account sees "No shared proofs yet". REPORT.md 4, evidence/03-*. |
| 39 Tap under a sheet's footer button closes the sheet | open – found Oct 19 overnight | `components/ds/Sheet.tsx` panel is `pointerEvents="box-none"`, so the strip under the footer passes the tap to the Close scrim and the draft is lost (Add a task, reproduced). Minor. REPORT.md 5, docs/reports/build92/13/add-task/. |
