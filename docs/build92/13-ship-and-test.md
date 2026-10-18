# Chunk 13: Ship and overnight test

**Start only when chunks 01–12 are all PASSED and Yaseen has confirmed that:**
- all SQL in `docs/sql/build92.sql` has been run
- the backend is deployed
- the Supabase email OTP is set up
- whether `FLAGS.LIQUID_GLASS` stays off (the default) or he turned it on after a device check

If any of these isn't confirmed, STOP and ask.

## 13.1 Final check
- Run every chunk 01–12 test in one pass; all must pass. tsc shows no new errors.
- Confirm `/api/health` returns the deployed sha.
- A grep proves:
  - no route names in headers
  - no `griit://i/` shown
  - no "Couldn't save. Tap to try again." without a retry path
  - no exclamation marks in copy

## 13.2 Ship
- One EAS production build, submitted to internal TestFlight, group "Team (Expo)" only.
- Keep the local `ios/` folder out of the upload. The About screen shows the build 92 commit.
- Update `BUGS.md` and `claude/griit-status.md`.

## 13.3 Overnight test
Run with the chunk 12 harness on build 92:

| Group | Testers | Main check |
| --- | --- | --- |
| First day | 25 new users | Secure Day 1 |
| Finish loop | 8 | All task types, never see the Proof screen |
| Social pairs | 4 pairs | Like, comment, open a profile, accept an invite |
| History | 4 | Profile scroll; numbers match everywhere |
| Day 2 return | 6 | Came back, streak kept |
| Safety and edge | 6 | Scripted |
| Words quiz | everyone | — |

**Targets (vs build 90):**
- New users who secure Day 1: 4 of 13 → at least 70%
- Photo finishers reaching Home: about 6 of 11 → 100%
- Words understood: 29% → at least 60%
- Social pairs with like, comment and profile: 0 of 3 → 3 of 4
- Cold start: under 2 s

Write `docs/reports/oct-build92/REPORT.md`, a PDF, and `screens.csv` in the morning.

## Gates
- [ ] All tests pass in one run.
- [ ] The TestFlight build is live in "Team (Expo)" and the About sha matches.
- [ ] Every overnight group produced a folder.
- [ ] The combined report, PDF and screens.csv are written, with every target reported as hit or missed.
- [ ] PROGRESS: chunk 13 PASSED.
