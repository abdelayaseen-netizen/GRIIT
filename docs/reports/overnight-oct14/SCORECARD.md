# Scorecard, 14 Oct 2026

Same 10 categories as 12 Oct. Scores are judgment from the seeded proof and the 38 sessions. The exit interview was not asked, so these are not interview scores.

Overall: **5.2**. Product loop, onboarding, and data integrity are weighted double, the same way as 12 Oct. 12 Oct overall was 5.5.

Would a real user stay: **3**. 26 of 38 sessions quit because the same screen returned.

| # | Category | 14 Oct | 12 Oct | Why |
| --- | --- | --- | --- | --- |
| 1 | Product loop | 5 | 6 | 5 of 38 finished a task. 4 reached a photo. The post button then stayed disabled. |
| 2 | UX and onboarding | 4 | 5 | Fresh guests get through Start, Join, and reminders. Most then bounce between Home and Discover. |
| 3 | Frontend | 6 | 6 | The share card, Strict, and Your data read correctly on the seeded account. No new visual system was added. |
| 4 | Backend | 6 | 5 | The deployed API returns the scoreboard the phone shows. One check-in returned 429. |
| 5 | Data integrity | 7 | 7 | Best 6, 6 of 7, 18 proofs, and 8 pm all matched the database. |
| 6 | Performance | 4 | 4 | Cold start was not measured on a release build. This was the dev client. |
| 7 | Reliability | 4 | 4 | Photo posting and the timer smoke did not finish. The other check-off smoke did. |
| 8 | Security and privacy | 6 | 6 | is_test is set on the server. Test viewers still see test authors, which is the rule. |
| 9 | Tests | 6 | 7 | 7 of 12 build 87 and 88 flows passed. The rest failed on a 429 or a disabled photo button. |
| 10 | Analytics | 4 | 4 | Not remeasured. |

Concept quiz: not asked this run. 12 Oct was 0 of 24.
