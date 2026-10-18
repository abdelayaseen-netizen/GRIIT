# Build 92 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Glass foundation and Create | PASSED | c2912c61 | Flag off ships the fallback; expo-glass-effect install is Needs Yaseen. Report: docs/reports/build92.md |
| 02 | Finish flow and Day secured | PASSED | ca530dad | Run type not covered on simulator (Strava); offline queue out of scope. Report: docs/reports/build92.md |
| 03 | Task inputs and partial logs | PASSED (waiting for SQL) | 96a72a63 | 03.6 data fix is SQL in docs/sql/build92.sql, not run; short saves are saved, not posted. Report: docs/reports/build92.md |
| 04 | Posts, likes and proof detail | PASSED | 91ee4f74 | Backend deployed 35ea72d then 4677dba (feed.react mode "like", result/badge on feed items). Report: docs/reports/build92.md |
| 05 | Share stickers | PASSED | 74853f8a | No SQL, no deploy (client only). Needs Yaseen: verify live RevenueCat prices on a device/sandbox. Report: docs/reports/build92.md |
| 06 | One source for every number | PASSED | 15983b8c (code de7d012d) | No SQL (server computes user_stats from existing tables). Backend deployed de7d012 (user_stats on getStats/getRecord/meStats, challenges.progress, freeze refill removed). Report: docs/reports/build92.md |
| 07 | Profile and post viewer | FAILED (07.1 frame gate only) | 838e8765 | Items 07.1–07.6 built and tested; all gates pass except "no frame over 50 ms": PostViewer shows 1 frame of 52–59 ms per 10 s run on the Pro Max simulator (legacy harness max 44 ms). 2 fix attempts spent; needs a device check with real photos. P2-08/P2-13 (second account) not staged. No SQL. |
| 08 | Invite, leaderboard and settings | NOT STARTED | | |
| 09 | First day and account | NOT STARTED | | |
| 10 | Discover, challenge page, Home, feed, words | NOT STARTED | | |
| 11 | Speed: app open and profile | NOT STARTED | | |
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
03.6 Data fix: built, waiting for SQL (docs/sql/build92.sql lines 12-70), 96a72a63
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
