# Build 90 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Speed | FAILED | | Device timings, Maestro, and upload-size samples were not collected. No simulator was booted. Backend needs `railway up --service grit-backend` before chunk 02. tsc still has 6 errors in files this chunk did not change. |
| 02 | First day | NOT STARTED | | |
| 03 | Task inputs | NOT STARTED | | |
| 04 | Posting and sharing | NOT STARTED | | |
| 05 | Links and numbers | NOT STARTED | | |
| 06 | Words and small fixes | NOT STARTED | | |
| 07 | Safety | NOT STARTED | | |
| 08 | Friend loop | NOT STARTED | | |
| 09 | Strava auto-detect | NOT STARTED | | |
| 10 | Ship and overnight test | NOT STARTED | | |

## Item log
(Cursor adds one line per item: `NN.N title: done / not done, sha`)

01.1 Measure first: not done, timings not collected on a device
01.2 Shrink photos: done, unit tests pass, upload samples not from the app
01.3 Cached session: done
01.4 One server call: done, not deployed
01.5 Optimistic UI: done in code, Maestro not run
01.6 Location: done
01.7 Measure again: not done, same missing device run
