# Build 89

Commit: `e457e85a` on `feat/build89`.

Build number: none. EAS was not started. TestFlight was not submitted.

Smoke did not pass. The seeded day-6 account was never created, and the build 87 and 88 Maestro list was not all green. The rule is to ship only after that smoke passes.

## Bug results

| Bug | Fixed? | Before | After | Screenshot |
| --- | --- | --- | --- | --- |
| 1 Likes | code written, not proven on the phone | FAIL | not rerun on a post | none |
| 2 Profile grid | code written, not proven on the phone | FAIL | not rerun, this guest has no proofs | none |
| 3 Custom task | yes, on the simulator | FAIL | PASS, Evening journal plus the Athlete tasks | `docs/reports/build89/after/after-create-finish.png` |
| 4 Discipline | yes, on the simulator | FAIL | PASS, Review shows Discipline · 7 days · Solo · Standard | `docs/reports/build89/after/after-create.png` |
| 5 Invite | yes, on the simulator | FAIL | PASS, Only people you invite | same Review screenshot |
| 6 Day 1 sentence | yes, on the simulator | FAIL | PASS, Day 1 is today. The old "Day 1 of 7 is today" line is gone | success screenshot |
| 7 Success lists tasks | yes, on the simulator | FAIL | PASS, Morning run, Workout, Body check-in, Evening journal | success screenshot |
| 8 Test accounts in Everyone | code written, not proven on the production API | PASS on this guest because those handles were not on the first screen | not a proof of the hide | none |
| 9 Best streak | code and unit tests, not on the phone | FAIL, no Best 6 on this guest | not rerun | none |
| 10 Day of duration | code and unit tests, not on the phone | FAIL | not rerun | none |
| 11 Proof count | code and unit tests, not on the phone | FAIL | not rerun | none |
| 12 Hour bucket | code and unit tests, not on the phone | FAIL | not rerun | none |
| 13 Everyone hint | yes, on the simulator | FAIL, the hint was visible on Following | PASS | `docs/reports/build89/after/after-bug-13.png` |
| 14 Guest | yes, on the simulator | FAIL, the flow started on Home | PASS, banner and Account say guest | `docs/reports/build89/after/after-bug-14.png` |
| 15 Share card | code written, not proven | FAIL, no Share control on this guest | not rerun | none |
| 16 Strict | yes, on the simulator | FAIL, the flow was not on How strict | PASS, Strict is visible and Hard is not, on Create and on Discover | `docs/reports/build89/after/after-bug-16-discover.png` |

## Not fixed on a phone

Bugs 1, 2, 8, 9, 10, 11, 12, and 15. The day-6 account with 18 proofs was not created. `SUPABASE_SERVICE_ROLE_KEY` is not on this machine. The scoreboard and the `is_test` write run in the API, and this simulator still talks to the production API, which does not have this commit.

## Pending SQL

None. No backfill was written. Nothing in `/sql/pending/` was added for this run.
