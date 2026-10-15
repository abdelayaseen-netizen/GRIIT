# Chunk 02: First day

**Why:** In the Oct 15 test only about 10 of 38 testers reached a secured day. Most never got to a first task.

**Areas you may touch:**
- `components/onboarding/v2/**`
- `components/home/HomeV3.tsx`
- `app/challenge/[id].tsx` (join flow only)
- the starter task code on this branch
- `components/task-v2/steps/TimerEntryStep.tsx` and `RunningStep.tsx`
- the join and enroll procedures in `backend/trpc/routes/`

## 02.1 The onboarding Join doesn't stick
- 5 of 6 testers who joined Gym Buddy Challenge on "Start here" landed on Home with "No challenge yet." The one who joined 7-Day Gratitude Journal kept it.
- Find why no enrollment row is created. Check the challenge type, a partner or group requirement, guest session timing, and errors that get swallowed.
- **Test:** Welcome → Goals → How it works → Start here → Join (run once for each of the 3 suggested challenges) → Reminders → Home shows that challenge's first task.

## 02.2 Land on the first task after any Join
- From onboarding or Discover, joining opens today's first task.
- Not Home, not Discover.

## 02.3 No empty Home
- Replace "No challenge yet / Find a challenge" with one starter challenge card that joins in one tap and opens its task. Guests are allowed.
- Use the starter task code on this branch (commits a9d93d60, f4ab696b, 0a4fde94, 5a67a1d5).
- Review that code first and list problems in the report.
- Turn on `STARTER_TASK_ENABLED` only after its test passes.

## 02.4 The Home ring opens the task
- "Done {task}" on the Home ring opens the same screen as tapping the task row, photo tasks included (`HomeV3.tsx` around line 290).

## 02.5 Timer
- The countdown length comes from the task config. 5-Minute Morning Prayer currently starts at 10:00.
- Tapping Done while it runs asks "Finished early?" If yes, the task completes.

## 02.6 Onboarding ends on a task
- Cut "How it works" to three short lines, or remove it.
- The last onboarding step opens the user's first task, not Home.
- Don't add new screens.

## Gates
- [ ] 02.1 test passes for all 3 suggested challenges
- [ ] A fresh guest goes from Welcome to a completed first task in 12 taps or fewer (show the Maestro flow)
- [ ] Empty Home shows the starter card; tapping it opens a task
- [ ] Timer length matches the task; "Finished early?" works
- [ ] All chunk 01 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
