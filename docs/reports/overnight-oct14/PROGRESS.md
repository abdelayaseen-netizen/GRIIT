# Overnight 14 Oct 2026

Status: all done. The 36-person test and TestFlight did not run. The reasons are in BLOCKERS.md.

Branch: `feat/build89` in `/Users/yaseenabdela/Developer/GRIIT-build87` (worktree already had this branch; the main checkout is `main`).

| Chunk | Status | Note |
| --- | --- | --- |
| 1 Setup | failed | JAVA_HOME confirmed: `.maestro/build89-java-ok.yaml` passed. BUGS.md written. Before flows saved under `docs/reports/build89/before/` (15 fail, bug 8 pass because those handles were not on this guest's first Everyone screen). Seed did not run. See BLOCKERS.md. |
| 2 Create wizard (bugs 3–7) | done | Simulator: Discipline kept, Evening journal plus Athlete tasks on Review and success, Invite says Only people you invite, Day 1 is today, success lists all four tasks. |
| 3 One scoreboard (bugs 9–12) | done | Code and unit tests. Device proof needs the seeded account, which did not run. |
| 4 Likes (bugs 1–2) | done | Code. Device proof needs a post with a real event id. This guest has no proofs. |
| 5 Small fixes (bugs 8, 13–16) | done | Bug 13 passed on Following. Bug 14 passed (guest banner and Account says guest). Bug 16: Strict is on the How strict step and Hard is not on Discover. Share card and the server is_test flag are not proven on this guest. |
| 6 Prove it | failed | Create, guest, Everyone hint, and Strict passed on the simulator. The seed-backed bugs and the build 87 and 88 smoke list did not. |
| 7 Ship | skipped | Smoke did not pass, so EAS was not started. |
| 8 First-timers | skipped | No service role, so a fresh is_test account could not be created. |
| 9 Faith and routine | skipped | Same block as chunk 8. |
| 10 Fitness and competitive | skipped | Same block as chunk 8. |
| 11 Social | skipped | Same block as chunk 8. |
| 12 Edge cases | skipped | Same block as chunk 8. |
| 13 Returning and account | skipped | Same block as chunk 8. The review password was not printed. |
| 14 Report | done | Written under docs/reports/overnight-oct14 and exported to the Desktop UX folder. Scores are not new, because the 36 people did not run. |

BLOCKERS.md is only written if a step cannot proceed.
