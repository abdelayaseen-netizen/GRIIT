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
| 18 Home and Discover loop | open | 26 of 38 sessions gave up because the same screen came back three times, mostly Home and Discover. |
| 19 Check-in 429 | fixed – awaiting Yaseen | The shared IP limiter in backend/hono.ts (checkRateLimit on `ip:`) returned HTTP 429, which the client logged as checkins.complete (429). Signed-in calls now use a per-user bucket (rateLimitSubject in backend/lib/rate-limit.ts). The client retries checkins.complete once after 1.5s. |
| 20 Journal opens as self-report | fixed – awaiting Yaseen | Home sends the normalized type `text`. The task flow only opened the writer for raw `journal`, so a journal task from Home showed the self-report screen. `text` now uses the same writer. Flow: .maestro/build87-done-write.yaml. |

