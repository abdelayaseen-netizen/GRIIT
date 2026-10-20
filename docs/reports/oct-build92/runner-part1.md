# Build 92 agents

23 sessions on 2026-10-19. Models: claude-sonnet-5-5 (default), claude-opus-5-5 (first-day group). Cap $60.00.

## Main numbers

- New users who secured Day 1: 12 of 12.
- Day 2 return (secured again on the next day): 0 of 0.
- Social actions by partners (9 sessions): 0 likes, 0 double-taps, 0 comments, 9 profile screens, 9 invites accepted.
- Cold start, launch to first screen with text, median: 9205 ms (through Maestro, so it includes its launch overhead).
- 3-word quiz: 32 right of 69 answers (23 people).

## Session ends

| Persona | Group | Model | Steps | Ended | Tag | Stuck notes |
|---|---|---|---|---|---|---|
| f-01 Jordan | first-day | claude-opus-5-5 | 21 | Agent stopped on their own. | finished | 0 |
| f-02 Amina | first-day | claude-opus-5-5 | 16 | Agent stopped on their own. | finished | 0 |
| f-03 Robert | first-day | claude-opus-5-5 | 17 | Agent stopped on their own. | finished | 0 |
| f-04 Casey | first-day | claude-opus-5-5 | 23 | Agent stopped on their own. | finished | 0 |
| f-05 Priya | first-day | claude-opus-5-5 | 21 | Agent stopped on their own. | finished | 0 |
| f-06 Sam | first-day | claude-opus-5-5 | 20 | Agent stopped on their own. | finished | 0 |
| f-07 Yusuf | first-day | claude-opus-5-5 | 17 | Agent stopped on their own. | finished | 0 |
| f-08 Helen | first-day | claude-opus-5-5 | 21 | Agent stopped on their own. | finished | 0 |
| f-09 Marcus | first-day | claude-opus-5-5 | 25 | Agent stopped on their own. | finished | 0 |
| f-10 Elena | first-day | claude-opus-5-5 | 16 | Agent stopped on their own. | finished | 0 |
| f-11 Tom | first-day | claude-opus-5-5 | 19 | Agent stopped on their own. | finished | 0 |
| f-12 Grace | first-day | claude-opus-5-5 | 19 | Agent stopped on their own. | finished | 0 |
| h-01 Priya | history | claude-sonnet-5-5 | 20 | Agent stopped on their own. | app bug | 0 |
| h-02 Marcus | history | claude-sonnet-5-5 | 21 | Agent stopped on their own. | finished | 0 |
| s-01a Alex | social | claude-sonnet-5-5 | 22 | Agent stopped on their own. | finished | 0 |
| s-01b Blake | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | harness stop | 0 |
| s-01c Alex | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | harness stop | 0 |
| s-02a Dana | social | claude-sonnet-5-5 | 22 | Agent stopped on their own. | finished | 0 |
| s-02b Femi | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | app bug | 0 |
| s-02c Dana | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | harness stop | 0 |
| s-03a Kim | social | claude-sonnet-5-5 | 23 | Agent stopped on their own. | finished | 0 |
| s-03b Jun | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | harness stop | 0 |
| s-03c Kim | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | harness stop | 0 |

## Day 2

| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Days missed before |
|---|---|---|---|---|---|

## Social

| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens |
|---|---|---|---|---|---|
| s-01a | yes | 0 | 0 | 0 | 0 |
| s-01b | yes | 0 | 0 | 0 | 0 |
| s-01c | yes | 0 | 0 | 0 | 6 |
| s-02a | yes | 0 | 0 | 0 | 0 |
| s-02b | yes | 0 | 0 | 0 | 0 |
| s-02c | yes | 0 | 0 | 0 | 0 |
| s-03a | yes | 0 | 0 | 0 | 0 |
| s-03b | yes | 0 | 0 | 0 | 1 |
| s-03c | yes | 0 | 0 | 0 | 2 |

## History

- h-01: I'm back on Home. It shows Streak 33 days in a row and 'No Days Off · Day 35 of 75'. Profile said Streak 33, Best 33, 33 days secured, and no posts. The streak matches at 33. The day number does not: Home says Day 35 but Profile says 33 days secured, and '33 of 34 days secured' i / I've checked Profile to the end and I'm back on Home. Profile has no posts, only 'No shared proofs yet'. The streak matches: Home says 33 days in a row and Profile says Streak 33, Best 33. The day number does not match. Home says 'No Days Off · Day 35 of 75', but Profile says 33 
- h-02: The profile says 'No shared proofs yet', so there are no posts to scroll through, and scrolling didn't change the screen. I'm moving on to Home to compare numbers. Profile: Streak 33, Best 33, Days secured 33. Home earlier showed Day 35 of 75, which doesn't match the 33 days secu / Home shows Streak 33 and 'No Days Off · Day 35 of 75'. Profile showed Streak 33, Best 33 and Days secured 33, with 'No shared proofs yet', so there were no posts to scroll through. Stats showed 33 of 34 days secured. The streak matches at 33. The mismatches are Home's Day 35 agai

## Cost

Measured: $5.18 across 734 calls (1459474 input, 96017 output tokens).

Projected full run (12 first-day, 2 history, 3 pairs × 3, 6 day-2 sessions, 31 steps each): $7.01.
- 12 sessions × 31 steps on claude-opus-5-5 at $0.01/step: $4.10
- 17 sessions × 31 steps on claude-sonnet-5-5 at $0.01/step: $2.91

## Notes

- History account: 12/history. Seeded.
- Day 2: no --from run dir, so no returning users.
- Secured Day 1 sessions in this run: 15.
