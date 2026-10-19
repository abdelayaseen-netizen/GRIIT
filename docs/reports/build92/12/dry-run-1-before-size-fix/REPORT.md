# Build 92 agents: dry run

3 sessions on 2026-10-19. Models: claude-sonnet-5-5 (default), claude-opus-5-5 (first-day group). Cap $60.00.

## Main numbers

- New users who secured Day 1: 0 of 0.
- Day 2 return (secured again on the next day): 0 of 1.
- Social actions by partners (1 sessions): 0 likes, 0 double-taps, 0 comments, 0 profile screens, 0 invites accepted.
- Cold start, launch to first screen with text, median: 2409 ms (through Maestro, so it includes its launch overhead).
- 3-word quiz: 5 right of 9 answers (3 people).

## Session ends

| Persona | Group | Model | Steps | Ended | Tag | Stuck notes |
|---|---|---|---|---|---|---|
| h-01 Priya | history | claude-sonnet-5-5 | 17 | Gave up. home repeated 3 times. | agent stuck | 2 |
| s-dry-b Blake | social | claude-sonnet-5-5 | 11 | Stopped: 3 stuck notes on Gym before work invite. | agent stuck | 3 |
| d-01 Tess | day2 | claude-sonnet-5-5 | 17 | Gave up. home repeated 3 times. | app bug | 0 |

## Day 2

| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Days missed before |
|---|---|---|---|---|---|
| d-01 | 2026-10-17 | no | yes | yes | 1 |

## Social

| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens |
|---|---|---|---|---|---|
| s-dry-b | no | 0 | 0 | 0 | 0 |

## History

- h-01: I'm back on Home after closing the photo. Home shows streak 0, no best number, and 'Day 1 starts now' with no challenge. I'll try the Profile tab again to scroll through my posts and compare the numbers. / Still on Home after the last Profile tap. I'll tap the Profile tab again to open my posts. Home still shows streak 0, no best number, and 'Day 1 starts now' with no challenge, which doesn't look like a month of use.

## Cost

Measured: $0.26 across 48 calls (95106 input, 7056 output tokens).

Projected full run (12 first-day, 2 history, 3 pairs × 3, 6 day-2 sessions, 15 steps each): $3.56.
- 12 sessions × 15 steps on claude-opus-5-5 at $0.01/step: $2.09 (rate scaled from the measured model by list price)
- 17 sessions × 15 steps on claude-sonnet-5-5 at $0.01/step: $1.48

## Notes

- History account: 12/history. Not seeded: the 30-day seed in docs/sql/build92.sql has not been run, so this account has only the history it built itself.
- Day 2: 15 saved accounts from oct-build90 qualify; 0 secured yesterday (2026-10-19 is today). 1 used. The ones used missed at least one day, so this is a return after a gap, not a true Day 2.
- Social: one B session against a saved build 90 partner (p4-03a, Kim). Invite found.
- Secured Day 1 sessions in this run: 1.
