# Overnight report, 14 Oct 2026

The one-page summary is `ONE-PAGE.md`. The scorecard is `SCORECARD.md`. The bug table is `../build89.md`.

## Funnel

The 36 people were not started. Counts are zero at every step.

| Step | Count | Percent |
| --- | --- | --- |
| Opened | 0 | 0 |
| Finished onboarding | 0 | 0 |
| Joined or created a challenge | 0 | 0 |
| Finished a first task | 0 | 0 |
| Posted | 0 | 0 |
| Liked or followed | 0 | 0 |
| Came back the next day | 0 | 0 |

Nobody dropped on a screen, because nobody was launched. The stop is in `BLOCKERS.md`: no service-role key, so a fresh account could not be marked `is_test` by the server at creation.

## By persona type

| Chunk | People | Funnel | Average score |
| --- | --- | --- | --- |
| First-timers | 0 of 6 | not run | none |
| Faith and routine | 0 of 6 | not run | none |
| Fitness and competitive | 0 of 6 | not run | none |
| Social | 0 of 6 | not run | none |
| Edge cases | 0 of 6 | not run | none |
| Returning and account | 0 of 6 | not run | none |

The app was not shown to work or fail for any of those groups tonight. The only person on the simulator was an existing guest, used to check the 16 bugs.

## Concept test

Secured, freeze, and self-reported were not asked. Oct 12 was 0 of 24. This run is 0 of 0. There are no wrong guesses to quote.

## Top problems

These are from the bug check, not from 36 agents. Severity is how badly it blocks a person, not an agent count.

1. Practice history cannot be created from this machine. Screen: none. Agents: 0. Cause: `scripts/seed-build89.ts` exits when `SUPABASE_SERVICE_ROLE_KEY` is missing. Size L.
2. Your data on the phone still comes from the old API. Screen: Profile, Your data. Agents: 0. Cause: `backend/lib/me-stats.ts` is in this commit and is not the process the app calls. Size L.
3. Add task was below the bottom of the sheet, so a custom task could not be saved. Screen: Create, Add a task. This is fixed in `components/create/AddTaskSheet.tsx` by capping the scroll height. Size M. Proven after the fix.
4. About shows the commit from the installed native app (`e2c7b2e`), not `e457e85a`. Screen: Settings. Cause: `app/settings/index.tsx` reads `Constants.expoConfig.extra.commit`, which is set when the native app is built. Size S.
5. Likes were not tapped on a real post. Screen: Home feed. This guest's feed had no heart. Cause: bugs 1 and 2 need a photo event. Size M until proven.

## Bugs found

No new crash was seen. The Add task button missing from the sheet is the one new break, and it is fixed in this commit. It is not added to `BUGS.md` as open, because the after flow tapped Add task successfully.

## Build 89 verification

Held on the simulator: bugs 3, 4, 5, 6, 7, 13, 14, 16.

Not re-checked on a phone with the right history: bugs 1, 2, 8, 9, 10, 11, 12, 15.

## Design gap

No side-by-side with the v53 frames was made tonight. The create success screen now lists every task and says "Day 1 is today." Review shows the category, the length, Solo, and Standard on one line. That is the gap work that was checked. Home, Profile, the post, and the share card were not placed next to the frames.

## Speed

No release build was installed. Cold start was not timed. The agents did not record the slowest screens.

## Quotes

No exit interviews. The 15 quotes are not available.

## Recommendations

### Next build

1. Create the day-6 practice account with the service role and rerun bugs 1, 2, 9, 10, 11, 12, and 15. Why: those fixes are in the code and unseen on a phone. Problems 1 and 5.
2. Ship the API that contains `me-stats` and the Maestro `is_test` write, without changing Railway settings by hand if the usual deploy already does this. Why: the phone still calculates the old numbers. Problem 2.
3. Run the smoke list from builds 87 and 88 on that account. Why: that list is the gate for TestFlight.
4. Internal TestFlight only after that smoke is green. Record the build number, the commit, the EAS id, and the submission id.
5. Point Settings → About at the commit of that native build. Problem 4.

### The build after

1. Run the 36 people, six at a time, on the build that shipped. Cap the model spend at $40.
2. Ask each person what secured, freeze, and self-reported mean.
3. Log steps and an exit interview.
4. Score the ten categories against Oct 12.
5. Fix the top problems that more than a few people hit.

### The build after that

1. Home, Profile, the post, the share card, and Create next to the v53 frames, five differences each.
2. Time a cold start on a release build.
3. Anything the 36 people still fail at, in the order of how many people hit it.

## Data

`agents/oct14/summary/all-steps.csv` and `all-interviews.csv` have headers only. No agent took a step.
