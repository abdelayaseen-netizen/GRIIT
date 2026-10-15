# How to run build 90 (for Yaseen)

## One-time setup
1. Unzip this folder into the repo as `docs/build90/`. It should contain `RUNNER.md`, `RULES.md`, `PROGRESS.md` and the files `01-` through `10-`.
2. Commit it on `feat/build89` with the message `build90: add prompts`, or let chunk 01 commit it.
3. Update Cursor first. The version you're on stops working Oct 26.

## For every chunk
1. Open a **new** Cursor chat. Never continue in the previous one.
2. Paste exactly this:

   > Read docs/build90/RUNNER.md and follow it. Do the next chunk only.

3. Let it work. It posts a plan, does the chunk, then posts a chunk report and stops.
4. Check the report:
   - Every gate is ticked, with evidence (numbers, test names, screenshots).
   - Every item says "failed before: yes, passes now: yes."
   - Nothing under "Not done or needs Yaseen" that you haven't handled.
   - If you're unsure, paste the report to Claude and ask "is this chunk really done?"
5. If it says STOP for SQL or a deploy, do that first:
   - **SQL:** paste it to Claude to review, then run it in Supabase.
   - **Deploy:** `railway up --service grit-backend`.
6. Restart the Mac if Cursor felt slow, then go back to step 1 for the next chunk.

## If a chunk fails
- Don't move on. Open a new chat and paste the same line. Cursor reads PROGRESS.md and continues the failed chunk.
- If it fails twice on the same item, send the report to Claude before trying again.

## Order and rough time
| Chunk | What | Needs from you |
|---|---|---|
| 01 | Speed | Deploy backend after |
| 02 | First day | — |
| 03 | Task inputs | Review SQL for seeded units |
| 04 | Posting and sharing | — |
| 05 | Links and numbers | — |
| 06 | Words and small fixes | Review SQL for copy |
| 07 | Safety | Deploy backend after |
| 08 | Friend loop | — |
| 09 | Strava auto-detect | SQL if needed, deploy, run the Strava curl |
| 10 | Ship and overnight test | Confirm SQL and deploys are done |

After chunk 10: install from TestFlight, check that About shows the build 90 sha, run your phone check, and send Claude the overnight report.
