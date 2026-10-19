# Build 92 agents: dry run

3 sessions on 2026-10-19. Models: claude-sonnet-5-5 (default), claude-opus-5-5 (first-day group). Cap $0.95.

## Main numbers

- New users who secured Day 1: 0 of 0.
- Day 2 return (secured again on the next day): 1 of 1.
- Social actions by partners (1 sessions): 0 likes, 0 double-taps, 0 comments, 0 profile screens, 1 invites accepted.
- Cold start, launch to first screen with text, median: 2314 ms (through Maestro, so it includes its launch overhead).
- 3-word quiz: 5 right of 9 answers (3 people).

## Session ends

| Persona | Group | Model | Steps | Ended | Tag | Stuck notes |
|---|---|---|---|---|---|---|
| h-01 Priya | history | claude-sonnet-5-5 | 46 | Agent stopped on their own. | finished | 0 |
| s-dry-b Blake | social | claude-sonnet-5-5 | 60 | Hit the 60-step cap. | app bug | 0 |
| d-01 Tess | day2 | claude-sonnet-5-5 | 46 | Stopped because measured API spend hit the $0.95 cap. | harness stop | 2 |

## Day 2

| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Days missed before |
|---|---|---|---|---|---|
| d-01 | 2026-10-19 | yes | yes | no | 1 |

## Social

| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens |
|---|---|---|---|---|---|
| s-dry-b | yes | 0 | 0 | 0 | 0 |

## History

- h-01: Still on Home. The screen hasn't changed for several steps, so I'll scroll the feed down to look for other numbers. Numbers so far: Home streak 0, Day 1 of Drink Water Today, 'Your best' blank. Profile showed streak 0, best 0, days secured 0, 0 proofs. Stats matched at streak 0,  / I've used 15+ actions. Profile shows streak 0, best 0, days secured 0, 0 proofs, and no posts to scroll through. Home shows streak 0, Day 1 for Drink Water Today, and 'No challenge yet'. The streak and best numbers match at 0. The only mismatch is Home's 'Day 1' against Profile's

## Cost

Measured: $0.96 across 163 calls (354526 input, 24820 output tokens).

Projected full run (12 first-day, 2 history, 3 pairs × 3, 6 day-2 sessions, 51 steps each): $13.17.
- 12 sessions × 51 steps on claude-opus-5-5 at $0.01/step: $7.71 (rate scaled from the measured model by list price)
- 17 sessions × 51 steps on claude-sonnet-5-5 at $0.01/step: $5.46

## Notes

- History account: 12/history. Not seeded: the 30-day seed in docs/sql/build92.sql has not been run, so this account has only the history it built itself.
- Day 2: 14 saved accounts from oct-build90 qualify; 0 secured yesterday (2026-10-19 is today). 1 used. The ones used missed at least one day, so this is a return after a gap, not a true Day 2.
- Social: one B session against a saved build 90 partner (p4-03a, Kim). Invite found.
- Secured Day 1 sessions in this run: 1.
