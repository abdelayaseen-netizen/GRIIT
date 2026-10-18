# Chunk 06: One source for every number

**Spec:** the top-level README ("Each number has one server field"); Part 2 lines "Streak, Best, Days secured and Verified match…" and "Each number reads its server field…"; Part 3 line "After joining, the top numbers are exactly…".

**Why:** the build 91 phone test found numbers that disagree:
- Profile "Best 6" vs Your data "Best 7 · Oct 7 – Oct 13"
- "19 proofs" vs "25 proofs"
- "Workout every day: 5 of 7 days" vs "0 of 4 days secured"
- "Wake up at 5: 7 of 7" vs "Left on day 5"

A proof app whose numbers disagree loses trust.

## Items
- **06.1 Root cause each mismatch:** for each pair above, find both code paths and the fields they read. Write them in the report before changing anything.
- **06.2 Server fields:** one server source for these values, each with the README's definition:

  | Field | Value |
  | --- | --- |
  | `current_streak` | days in a row secured, up to today |
  | `best_streak` | longest streak ever, plus its start and end dates |
  | `secured_days` | total secured days |
  | `verified_days` | secured days where every task had camera or Strava proof |
  | `proofs_count` | completed tasks with proof |

  - Per challenge: `day_number`, `days_secured` and the day states for the dots (secured, missed, held, today, before join).
  - Every screen reads these fields. None compute their own.
  - If this needs a view, a function or a column, write the SQL and STOP.
- **06.3 Freeze rule:**
  - Earn 1 freeze each time the streak reaches a multiple of 7. Hold up to 2, or 4 with GRIIT Pro.
  - A freeze holds the streak but doesn't add to `secured_days`.
  - Replace the old "1 streak freeze a month" logic and the Settings line that describes it.
  - Existing users keep the freezes they have, capped at the new maximum.
- **06.4 Progress-bar wording on Your data and challenge cards:** "5 of 7 days" must mean days secured of days elapsed, or be relabelled. Pick the README's definition and apply it everywhere.

**Areas:** `backend/trpc/routes/` (profile, home bootstrap, challenges), streak and secure-day libs, `lib/challenge-day.ts`, the client screens that show these numbers. Deploy is approved after any SQL is run.

## Gates
- [ ] A vitest consistency test: for 3 seeded users with real-looking history (missed days, a freeze, a left challenge), every field is computed once and every client reader returns the same values.
- [ ] A Maestro check: Yaseen-like test data shows identical Streak, Best, Days secured and proofs on Home, Profile, Your record and the challenge page.
- [ ] The 4 mismatches above each have a before and after.
- [ ] SQL in `docs/sql/build92.sql` (STOP for Yaseen). Backend deployed after.
- [ ] Chunk 01–06 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
