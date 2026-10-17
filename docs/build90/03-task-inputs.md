# Chunk 03: Task inputs that make sense

**Why:** Yaseen's phone test turned up several problems:
- the Workout task asked for miles
- 3 mi in 12:50 was accepted as "Target met"
- "...." and "my my my my" counted as journal words
- "Read 30 min" counted pages

**Areas you may touch:**
- `components/task-v2/steps/LogStep.tsx`, `WriteStep.tsx`, `CountStep.tsx`
- `lib/task-flow-state.ts`
- `backend/lib/journal-verification.ts`, `workout-verification.ts`, `run-verification.ts`, `counter-verification.ts`
- the matching tests

## 03.1 Workout is not a run
- **Workout tasks:**
  - activity type chips: Strength, Basketball, Swim, Cycling, Yoga, Sports, Other
  - Duration
  - Distance only for Cycling and Swim, and optional
- **Run tasks:** keep Distance and Duration.
- If there's a minimum, show it in plain words ("30 min minimum").

## 03.2 Sanity checks
- **Run pace** faster than 4:30 per mile or slower than 30:00 per mile shows "That pace looks off. Check your distance and time." with Edit and Save anyway.
- **Cycling** faster than 35 mph average gets the same check.
- Never show "Target met" before the check-in is saved.
- **Test:** unit tests for the edge values.

## 03.3 Journal counts real words (client and server)
- A word must contain at least 2 letters. Punctuation-only tokens count as 0.
- The same word counts at most 3 times per entry, case-insensitive.
- Use one shared rule in `lib/task-flow-state.ts` (`wordCount`) and in `backend/lib/journal-verification.ts`, so the server rejects what the client rejects.
- The word bar must not hide the first line while typing.
- **Tests:**
  - "...." scores 0
  - "my my my my my my" scores 3
  - a normal 20-word sentence scores 20

## 03.4 Counter units
- The unit shown matches the task's unit.
- "Done · 30 pages" can't finish at 0. The button stays inactive, or shows what's left, until the target is reached.
- List any seeded challenge whose title unit doesn't match its task unit (for example "Read 30 min" counting pages). Don't change seeded data. Write the SQL fix for Yaseen to review.

## Gates
- [ ] Workout shows a type and duration; no distance unless Cycling or Swim
- [ ] Pace and speed checks show for impossible values and allow Save anyway
- [ ] Journal word rule is identical on client and server (show both tests)
- [ ] The counter can't finish below target
- [ ] Chunk 01–02 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
