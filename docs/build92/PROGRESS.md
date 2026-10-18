# Build 92 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Glass foundation and Create | PASSED | c2912c61 | Flag off ships the fallback; expo-glass-effect install is Needs Yaseen. Report: docs/reports/build92.md |
| 02 | Finish flow and Day secured | PASSED | ca530dad | Run type not covered on simulator (Strava); offline queue out of scope. Report: docs/reports/build92.md |
| 03 | Task inputs and partial logs | PASSED (waiting for SQL) | 96a72a63 | 03.6 data fix is SQL in docs/sql/build92.sql, not run; short saves are saved, not posted. Report: docs/reports/build92.md |
| 04 | Posts, likes and proof detail | PASSED | 91ee4f74 | Backend deployed 35ea72d then 4677dba (feed.react mode "like", result/badge on feed items). Report: docs/reports/build92.md |
| 05 | Share stickers | NOT STARTED | | |
| 06 | One source for every number | NOT STARTED | | |
| 07 | Profile and post viewer | NOT STARTED | | |
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
