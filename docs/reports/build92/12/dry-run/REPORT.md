# Build 92 agents: dry run

3 sessions on 2026-10-19. Models: claude-sonnet-5-5 (default), claude-opus-5-5 (first-day group). Cap $60.00.

## Main numbers

- New users who secured Day 1: 0 of 0.
- Day 2 return (secured again on the next day): 1 of 1.
- Social actions by partners (1 sessions): 0 likes, 0 double-taps, 0 comments, 0 profile screens, 1 invites accepted.
- Cold start, launch to first screen with text, median: 9831 ms (through Maestro, so it includes its launch overhead).
- 3-word quiz: 5 right of 9 answers (3 people).

## Session ends

| Persona | Group | Model | Steps | Ended | Tag | Stuck notes |
|---|---|---|---|---|---|---|
| h-01 Priya | history | claude-sonnet-5-5 | 16 | Gave up. home repeated 3 times. | agent stuck | 0 |
| s-dry-b Blake | social | claude-sonnet-5-5 | 19 | Gave up. home repeated 3 times. | agent stuck | 0 |
| d-01 Tess | day2 | claude-sonnet-5-5 | 17 | Agent stopped on their own. | finished | 0 |

## Day 2

| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Days missed before |
|---|---|---|---|---|---|
| d-01 | 2026-10-19 | yes | yes | yes | 1 |

## Social

| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens |
|---|---|---|---|---|---|
| s-dry-b | yes | 0 | 0 | 0 | 0 |

## History

- h-01: That's 14 of 15 actions. I'm back on Home and the numbers are the same as before: streak 0, 'Day 1 starts now', no challenge. Profile said Streak 0, Best 0, Days secured 0, 0 proofs. So nothing mismatches between Home and Profile, but after a month of use both should show real nu / That's 15 actions. I opened Profile and found Streak 0, Best 0, Days secured 0 and 0 proofs, so there were no posts to scroll through. Home shows streak 0, 'No challenge yet', and 'Day 1 starts now'. Nothing mismatches between Home and Profile: streak 0 vs 0, and Day 1 not starte

## Cost

Measured: $0.32 across 58 calls (120666 input, 8254 output tokens).

Projected full run (12 first-day, 2 history, 3 pairs × 3, 6 day-2 sessions, 17 steps each): $4.34.
- 12 sessions × 17 steps on claude-opus-5-5 at $0.01/step: $2.54 (rate scaled from the measured model by list price)
- 17 sessions × 17 steps on claude-sonnet-5-5 at $0.01/step: $1.80

## Notes

- History account: 12/history. Not seeded: the 30-day seed in docs/sql/build92.sql has not been run, so this account has only the history it built itself.
- Day 2: 15 saved accounts from oct-build90 qualify; 0 secured yesterday (2026-10-19 is today). 1 used. The ones used missed at least one day, so this is a return after a gap, not a true Day 2.
- Social: one B session against a saved build 90 partner (p4-03a, Kim). Invite found.
- Secured Day 1 sessions in this run: 2.
