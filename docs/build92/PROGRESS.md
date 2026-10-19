# Build 92 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Glass foundation and Create | PASSED | c2912c61 | Flag off ships the fallback; expo-glass-effect install is Needs Yaseen. Report: docs/reports/build92.md |
| 02 | Finish flow and Day secured | PASSED | ca530dad | Run type not covered on simulator (Strava); offline queue out of scope. Report: docs/reports/build92.md |
| 03 | Task inputs and partial logs | PASSED | 96a72a63 | 03.6 SQL run on production by Yaseen on Oct 18 (2 tasks → 30-minute timers); short saves are saved, not posted. Report: docs/reports/build92.md |
| 04 | Posts, likes and proof detail | PASSED | 91ee4f74 | Backend deployed 35ea72d then 4677dba (feed.react mode "like", result/badge on feed items). Report: docs/reports/build92.md |
| 05 | Share stickers | PASSED | 74853f8a | No SQL, no deploy (client only). Needs Yaseen: verify live RevenueCat prices on a device/sandbox. Report: docs/reports/build92.md |
| 06 | One source for every number | PASSED | 15983b8c (code de7d012d) | No SQL (server computes user_stats from existing tables). Backend deployed de7d012 (user_stats on getStats/getRecord/meStats, challenges.progress, freeze refill removed). Report: docs/reports/build92.md |
| 07 | Profile and post viewer | FAILED (07.1 frame gate only) | 838e8765 | Items 07.1–07.6 built and tested; all gates pass except "no frame over 50 ms": PostViewer shows 1 frame of 52–59 ms per 10 s run on the Pro Max simulator (legacy harness max 44 ms). 2 fix attempts spent; needs a device check with real photos. P2-08/P2-13 (second account) not staged. No SQL. |
| 08 | Invite, leaderboard and settings | PASSED | 354ce8ad (code 116eae9e) | Short codes in invite_tracking (no SQL). Backend deployed 41a48b0 then 116eae9. Needs Yaseen: universal links entitlement; P2-20 (Strava connected) needs a real Strava login. Report: docs/reports/build92.md |
| 09 | First day and account | PASSED | 8d4aaab5 | Items 09.1–09.5; SE gate 5/5 after the chunk 10 deploy (dce02d8) of getStarterPack gate_time_*. Needs Yaseen: Supabase email OTP steps, then flip EMAIL_OTP. Report: docs/reports/build92.md |
| 10 | Discover, challenge page, Home, feed, words | PASSED | 3cf82f96 (code 756b0dd2) | Items 10.1–10.5; both Maestro gates pass on SE after the deploy (3cf82f9). Needs Yaseen: Run 3 mi SQL (docs/sql/build92.sql, chunk 10.1), hidden on Discover until it runs. Report: docs/reports/build92.md |
| 11 | Speed: app open and profile | PASSED | 53b47e13 | Release sim medians: cold 3280 → 1459 ms, warm 2927 → 1175 ms (splash on a fixed 1.8 s timer; Home and routing waited on the network). Profile header 12–17 ms. Budget 44–47/min, 0 × 429. 11.3 server thumbnails not done (needs a deploy). Report: docs/reports/build92.md |
| 12 | Better test agents | NOT STARTED | | |
| 13 | Ship and overnight test | NOT STARTED | | |

## Item log
(Cursor adds one line per item: `NN.N title: done / not done, sha`)
01.1 Glass components: done, c2912c61 (native GlassView waits on expo-glass-effect install)
01.2 Tab bar: done, c2912c61
01.3 Create chooser: done, c2912c61
01.4 Toasts: done, c2912c61
01.5 Top bars and route-name leak: done, c2912c61
01.6 Bottom insets: done (already met, verified), c2912c61
02.1 One finish flow (sheet, audiences, Posting, offline line): done, ca530dad
02.2 Where it goes next (routeAfterFinish, Home toast + Next tag, no Proof screen): done, ca530dad
02.3 Day secured (no scroll, task rows, teaching line once, Done/Back/swipe): done, ca530dad
02.4 Challenge complete (longest streak, freezes used, dates, other-open line): done, ca530dad
02.5 Second audience prompt removed from Proof: done, ca530dad
03.1 Counter (no cap, goal line, check icon, +/- stay active): done, 96a72a63
03.2 Run and workout inputs (h:mm:ss duration): done, 96a72a63
03.3 Impossible pace (3:30 /mi inline error, Done disabled): done, 96a72a63
03.4 Short of the goal (short lines, "Save x · won't count today", saveProgress, toast, Home row): done, 96a72a63
03.5 Partial logs add up (saveProgress add mode, partial_logs, so-far line, midnight reset test): done, 96a72a63 (backend deployed ee6addd)
03.6 Data fix: done, 96a72a63. Yaseen ran the SQL on production on Oct 18; tasks 8ae7e1d1-2be2-4ca4-bcb8-7eb4bfe42856 and 5cb89dcb-f59b-4181-a2b6-c2c0c499bae1 became 30-minute timers (docs/sql/build92.sql block marked RUN, Oct 18)
04.1 What a post shows (result facts per task type, journal never shows text): done, 91ee4f74 (backend deployed 35ea72d)
04.2 One badge per post (Verified / Verified by Strava / Self-reported, camera seal gone from card): done, 91ee4f74
04.3 Post header (challenge + Day x of y on one line, "now" right): done, 91ee4f74
04.4 Double-tap to like (feed + detail + full screen, never unlikes, mode "like" on server): done, 91ee4f74 (backend deployed 4677dba)
04.5 Own posts (no heart, "Liked by…" line, server FORBIDDEN on self-like, owner menu words): done, 91ee4f74
04.6 Proof detail (Back goes back, title = challenge, owner "…" menu, composer on keyboard, no Done/Share outside): done, 91ee4f74
05.1 Carousel (Photo · Week strip · Streak glow · Progress ring for every task/day moment, style name, Free/Pro tag, Ink · Orange · White control): done, 74853f8a
05.2 No stock photos (plain card without a proof photo, transparent preview over own photo or checker, no bundled image): done, 74853f8a
05.3 Pro lock (glow/ring locked without "GRIIT Pro", lock chip, "Unlock with GRIIT Pro", upgrade sheet with live prices, purchase → unlocked in place): done, 74853f8a (prices on simulator: none — verify on device)
05.4 Verified mark (camera/Strava → Verified, else Self-reported; proofSource on the card input): done, 74853f8a
05.5 Export (1080×1920 story PNG via storyShotSize, transparent sticker PNG for glow/ring, Copy sticker · Instagram Story · Save · Messages · More; carousel host moved to root layout so Day secured opens it): done, 74853f8a
06.1 Root cause each mismatch (Best counter vs recount w/ held day; proofs events vs tiles; day-number-as-secured line; left enrollment read as finished): done, de7d012d
06.2 Server fields (backend/lib/user-stats.ts computeUserStats → user_stats on getStats/home.bootstrap, getRecord, meStats; challenges.progress; clients stop computing): done, de7d012d
06.3 Freeze rule (earn at each 7-day streak, hold 2 / 4 Pro, monthly refill and its Settings/paywall/error copy gone, existing counts capped): done, de7d012d
06.4 Progress-bar wording ("{secured} of {elapsed} days secured" on Your data; "Left on day n · s of e secured"): done, de7d012d
07.1 Scroll freeze (root cause written; PostViewer with recycled images, fixed per-item layout, native-thread bar, single prefetch; dev harness + frame meter): done, gate not met strictly (1 frame >50 ms), 838e8765
07.2 Header (3 numbers + "{n} verified", one follow line, no Friends, Edit profile · Find friends / Follow · Invite to a challenge, record row): done, 838e8765
07.3 Proof grid first (3 cols 4:5, date label, Part 2 empty copy + CTA, offline + Try again): done, 838e8765
07.4 Your record (Challenges · Badges · Stats; visitor Challenges · Badges; Pro deeper-stats preview): done, 838e8765
07.5 Post viewer ("Posts", 1 of 2 pager, own posts Liked by / no heart, Back lands on tile ×3): done, 838e8765
07.6 Header from cache (AsyncStorage snapshot, header/grid skeletons, 47–48 ms measured): done, 838e8765
08.1 Short invite codes (8 chars, 62-char alphabet, invite_tracking, {INVITE_BASE_URL}/i/{code}): done, 41a48b05
08.2 Landing page (GET /i/:code, friendly 404, griit://invite fallback, live people count): done, 116eae9e (universal link waits on entitlement)
08.3 Invite sheet (Share primary, Copy link + "Link copied.", create success / empty board / Invite screen, raw link block gone): done, 116eae9e
08.4 Accept screen ("{name} invited you", Accept/Join · Day 1 is today, Not now, no approval): done, 116eae9e
08.5 Leaderboard (secured this week + Verified, You row, ties verified then earlier, is_test hidden): done, 41a48b05
08.6 Settings (Strava Connect / Connected as + Disconnect behind the flag, Apple Health Coming soon, Pro perks with Pro tags, copy-table words): done, 116eae9e
09.1 Goals (Part 3 seven, 2-column grid on SE, filled + check, 4th pick swaps oldest): done, 8d4aaab5
09.2 Start here (Join on every card, toast "You’re in. Day 1 is today.", freeze line once): done, 8d4aaab5
09.3 Closed windows (closed cards last, "Day 1 is tomorrow at {time}" on card / page / join button; server pinned at 9:41): done, 8d4aaab5 (getStarterPack select deployed dce02d8)
09.4 Account (Apple, email 6-digit code, oneTimeCode, Not now; behind EMAIL_OTP until dashboard): done, 8d4aaab5
09.5 Guest save (Not now always; same user id on save): done, 8d4aaab5
10.1 Discover (does-line from the server proof rule, motif covers, New under 5, Joined opens the page; Run 3 mi pending SQL): done, 3cf82f96
10.2 Challenge page (no Join once in, Day n of N, n days secured, progress dots + key once, Your posts here, one primary): done, 756b0dd2
10.3 Home (one secured flag, Today is secured + n done · Show, real save reasons, retry only when it can work): done, 756b0dd2
10.4 Feed (started fold after the first proof, not likeable, captions per tab, Discover + Invite empty): done, 756b0dd2
10.5 Words (once per user at the first moment, freeze-earned card, words sheet behind the i): done, 756b0dd2
11.1 Measure first (Release 16 Pro Max sim, 5 cold + 5 warm, per-phase trace, before table): done, 53b47e13
11.2 Biggest phases (splash on settle, Home from per-user cache then refresh, returning account routes from device record): done, 53b47e13
11.3 Profile and feed images (cache keyed on the storage object, tiles decoded at tile size): done; server-sized thumbnails not done (needs backend deploy), 53b47e13
11.4 Request budget (5 fresh-guest runs: 44–47 in the busiest minute, 0 × 429): done, 53b47e13
