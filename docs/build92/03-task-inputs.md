# Chunk 03: Task inputs and partial logs

**Spec:** `part1-finish-loop/` frames P1-28 to P1-33 and P1-35. Checklist: the Part 1 lines from "The counter can go past the goal…" through "A short save keeps the task open…".

**Why:**
- The counter dims at its goal with no word (22 dead taps; testers who read 12 pages quit instead).
- Run time is mm:ss only.
- A 0:10/mi pace was accepted, and Done was enabled while the screen said "1 mi short".
- "Read 30 min before bed" still counts pages.

## Items
- **03.1 Counter:**
  - The count can go past the goal ("12 of 10 pages" with a check icon), and +/− stay active.
  - At the goal, show "Goal reached. Done saves it."
- **03.2 Run and workout inputs:** runs take h:mm:ss; workouts take minutes.
- **03.3 Impossible pace:** faster than 3:30/mi shows "That pace looks off. Check the distance and time." and disables Done.
- **03.4 Short of the goal:**
  - The task screen shows "{done} of {goal} · {x} short" and the won't-count line before saving.
  - The button reads "Save {n} · won't count today".
  - Saving keeps the task open and doesn't secure the day. It can be posted as "{done} of {goal} · {x} short".
- **03.5 Partial logs add up (server):**
  - Logs for the same task on the same local day add up ("2 of 3 mi so far", then "3 of 3 mi" completes it). Same for counters.
  - Totals reset at local midnight in the user's timezone.
  - If storage needs a new column or table, write the SQL and STOP.
- **03.6 Data fix:** list every live counter or reading task whose **challenge** title says minutes but whose task counts pages, like "Read" in "Read 30 min before bed". Write a read-only SELECT plus a guarded UPDATE limited to the listed ids in `docs/sql/build92.sql`. Don't run it.

**Areas:** `components/task-v2/steps/`, `lib/task-flow-state.ts`, `backend/trpc/routes/checkins.ts`, `backend/lib/finish-bundle.ts`, task progress libs.

## Gates
- [ ] vitest: past-goal counter, h:mm:ss parsing, the pace check, the short save stays open, partial logs add up, and the midnight reset in 2 timezones. All failed before and pass now.
- [ ] Maestro: 2 mi save → "2 of 3 mi so far" → a 1 mi save → Done → the day is secured.
- [ ] Screenshots next to P1-28, P1-31, P1-32 and P1-35.
- [ ] SQL written (and STOP if a migration is needed). Deploy the backend after Yaseen runs any migration.
- [ ] Chunk 01–03 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
