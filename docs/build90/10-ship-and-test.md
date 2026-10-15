# Chunk 10: Ship and overnight test

**Start this chunk only when chunks 01–09 are all PASSED in PROGRESS.md, and Yaseen has confirmed that:**
- all SQL in `docs/sql/build90.sql` has been run
- the backend has been deployed

If either isn't confirmed, STOP and ask.

## 10.1 Final check
- Run every test from chunks 01–09 in one pass. All must pass.
- `npx tsc --noEmit`: 0 errors.
- Confirm `/api/health` returns the deployed backend sha.

## 10.2 Ship
- Run one EAS production build and submit it to internal TestFlight, group "Team (Expo)" only.
- Keep the local `ios/` folder out of the upload.
- Confirm About in the app shows the build 90 commit.
- Update `BUGS.md` with what was fixed. Only Yaseen marks a bug closed.
- Update `claude/griit-status.md` with build 90's state.

## 10.3 Fix the test harness first
Commit the harness changes separately, on `feat/agent-testers`:
- Every fresh persona starts at Welcome, not Home. On Oct 15 only 7 of 38 saw onboarding.
- The 15-tap minimum must actually hold. On Oct 15, 11 sessions ended early.
- Log each session's chunk and the real screen name, taken from the agent's description when the screen title is wrong.
- Log the time from tapping Done until the task shows as done.

## 10.4 Overnight run, in chunks
Install build 90 once, then run the chunks back to back. Each chunk writes `docs/reports/oct-build90/<chunk>/` as soon as it finishes. If a chunk crashes, log why and move on.

| Chunk | Personas | Checks |
|---|---|---|
| 1. Speed | 6 | Done-to-visible time for each task type; photo post time |
| 2. First day | 12 fresh, start at Welcome | Join sticks, lands on the first task, reaches Day secured |
| 3. Task types | 10 | Each type finishes; nonsense input is caught; post choice appears |
| 4. Social | 3 pairs | Invite visible; second account joins; tapping a name opens the profile; like and comment |
| 5. Safety and edge | 6 | Blocked words in username, bio, caption, comment and challenge title; login; guest save; freeze; offline post |
| 6. Words | all personas, in the exit interview | Secured, freeze and self-reported, scored right or wrong |

**Main number:** the share of fresh personas who reach Day secured. Oct 15 baseline: about 10 of 38.

**Also report:**
- joined %, first task %, photo %
- median Done-to-visible time
- concept score
- the same 10-category scorecard

In the morning, write one combined `docs/reports/oct-build90/REPORT.md` and a PDF.

## Gates
- [ ] All chunk tests pass in one run
- [ ] TestFlight build is live in "Team (Expo)" and the About sha matches
- [ ] Harness fixes committed on `feat/agent-testers`
- [ ] All 6 overnight chunks produced a folder
- [ ] Combined report and PDF written
- [ ] PROGRESS.md: chunk 10 PASSED
