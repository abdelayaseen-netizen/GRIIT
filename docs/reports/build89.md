# Build 89

Commit: `e061ecda` on `feat/build89`.

Build number: none. EAS was not started. TestFlight was not submitted.

The production API is this commit. Health returned `e061ecd`. Deployment id `da8951e2-e4ff-4980-98ac-81620f5dacc4`.

Smoke did not all pass, so nothing was shipped. The seeded account did run. Details are in `docs/reports/build89/after/RESULTS.md`.

## Bug results

Before is the pre-fix guest run. After is the seeded account on this client and the new API.

| Bug | Fixed? | Before | After | Screenshot |
| --- | --- | --- | --- | --- |
| 1 Likes | yes, awaiting Yaseen | FAIL | PASS. Like became "Liked by you". API react returned count 1 | `docs/reports/build89/after/bug-01-like.png` |
| 2 Profile grid | yes, awaiting Yaseen | FAIL | PASS. A grid tile opened Posts | `docs/reports/build89/after/bug-02-grid.png` |
| 3 Custom task | yes, awaiting Yaseen | FAIL | PASS. Evening journal plus the Athlete tasks | `docs/reports/build89/after/bug-07-success.png` |
| 4 Discipline | yes, awaiting Yaseen | FAIL | PASS. Discipline stayed selected through Review | same |
| 5 Invite | yes, awaiting Yaseen | FAIL | PASS. Only people you invite | same |
| 6 Day 1 sentence | yes, awaiting Yaseen | FAIL | PASS. This account had already secured today, so the sentence is "Day 1 is tomorrow." The old "Day 1 of 7 is today" line is absent | same |
| 7 Success lists tasks | yes, awaiting Yaseen | FAIL | PASS. Morning run, Workout, Body check-in, Evening journal | same |
| 8 Test accounts in Everyone | yes, awaiting Yaseen | not a proof | A test viewer still sees b88 handles. That is the intended short-circuit. The review account is also is_test, so it was not used as a real viewer | `docs/reports/build89/after/bug-13-everyone.png` |
| 9 Best streak | yes, awaiting Yaseen | FAIL | PASS. Home "Best 6". Your data "Best 6 · Oct 9 – Oct 14". API best 6 | `docs/reports/build89/after/bug-09-home.png` |
| 10 Day of duration | yes, awaiting Yaseen | FAIL | PASS. "6 of 7 days. Today counts." and "11 of 30 days. Today counts." | `docs/reports/build89/after/bug-10-your-data.png` |
| 11 Proof count | yes, awaiting Yaseen | FAIL | PASS. "18 proofs". API proof_count 18 | same |
| 12 Hour bucket | yes, awaiting Yaseen | FAIL | PASS. "Most often around 8 pm." API peak hour 20 | same |
| 13 Everyone hint | yes, awaiting Yaseen | FAIL | PASS. Hidden on Following, shown on Everyone | home screenshot |
| 14 Guest | yes, awaiting Yaseen | FAIL | PASS. The email account does not show the guest banner. `build87-guest-account` passed | `docs/reports/build89/after/bug-14-guest.png` |
| 15 Share card | yes, awaiting Yaseen | FAIL | PASS. Full card, no griit.app | `docs/reports/build89/after/bug-15-card.png` |
| 16 Strict | yes, awaiting Yaseen | FAIL | PASS. Strict on How strict. Hard is not on that step or on Discover | `docs/reports/build89/after/bug-16-discover.png` |

## Not shipped

Smoke: 7 pass, 5 fail. The failures are in BLOCKERS.md. The timer failure is a 429 and was not retried.

## Pending SQL

None.
