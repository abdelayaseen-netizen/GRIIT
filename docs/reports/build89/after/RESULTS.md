# Build 89 after, seeded account, 14 Oct 2026

Account: b89seed@example.com. API: production, health commit e061ecd, deployment da8951e2-e4ff-4980-98ac-81620f5dacc4.

The before column stays the pre-fix guest run in `docs/reports/build89/before/`. This folder is the seeded account on the fixed client and the new API.

| Bug | Result | Evidence |
| --- | --- | --- |
| 1 Like | pass | Centered Like became "Liked by you". API react on the friend post returned reacted true, count 1. `bug-01-like.png` |
| 2 Grid photo | pass | Point tap on Proofs, then a Show up tile, opened Posts. `bug-02-grid.png` |
| 3–7 Create | pass | Discipline kept. Review listed Edit Morning run, Edit Workout, Edit Body check-in, Edit Evening journal. Invite is "Only people you invite". Success lists all four tasks and does not say "Day 1 of 7 is today". Day 1 is tomorrow because this account already secured today. `bug-07-success.png` |
| 8 Hide test authors | pass for a test viewer | Everyone feed still shows b88 handles. This account is is_test, and the review account is also is_test, so both are allowed to see them. A non-test viewer was not signed in. |
| 9 Best 6 | pass | Home "Best 6". Your data "Best 6 · Oct 9 – Oct 14". API best_streak 6. `bug-09-home.png`, `bug-10-your-data.png` |
| 10 6 of 7 | pass | Your data "6 of 7 days. Today counts." Thirty Days "11 of 30 days. Today counts." Home card "Day 11 of 30". |
| 11 18 proofs | pass | Your data "18 proofs". API proof_count 18. Camera bucket 10, self-reported bucket 0. |
| 12 Hour | pass | "Most often around 8 pm." API peak hour 20, hour 0 count 0. |
| 13 Everyone hint | pass | Hidden on Following. Visible when Everyone is selected. |
| 14 Guest copy | pass on this email account | Settings does not say "You're using GRIIT as a guest" and does not say "Signed in with email". Guest banner is covered by the guest smoke flow. |
| 15 Share card | pass | Sheet shows the full card (5 days, Morning Prayer, @b89seed). griit.app is not on it. `bug-15-card.png` |
| 16 Strict | pass | How strict step shows Strict and not Hard. Discover does not show Hard. |

About on this dev client reads `Version 1.0.0 (build 1) · commit e061ecd`. That is the current branch commit, loaded with the Metro bundle.
