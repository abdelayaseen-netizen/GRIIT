# Build 92 agents

6 sessions on 2026-10-20. Models: claude-sonnet-5-5 (default), claude-opus-5-5 (first-day group). Cap $54.82.

## Main numbers

- New users who secured Day 1: 0 of 0.
- Day 2 return (secured again on the next day): 6 of 6.
- Social actions by partners (0 sessions): 0 likes, 0 double-taps, 0 comments, 0 profile screens, 0 invites accepted.
- Cold start, launch to first screen with text, median: 2221 ms (through Maestro, so it includes its launch overhead).
- 3-word quiz: 12 right of 18 answers (6 people).

## Session ends

| Persona | Group | Model | Steps | Ended | Tag | Stuck notes |
|---|---|---|---|---|---|---|
| d-01 Tess | day2 | claude-sonnet-5-5 | 16 | Agent stopped on their own. | app bug | 0 |
| d-02 Omar | day2 | claude-sonnet-5-5 | 17 | Agent stopped on their own. | app bug | 0 |
| d-03 Lena | day2 | claude-sonnet-5-5 | 31 | Agent stopped on their own. | app bug | 1 |
| d-04 Raj | day2 | claude-sonnet-5-5 | 16 | Agent stopped on their own. | app bug | 0 |
| d-05 Ivy | day2 | claude-sonnet-5-5 | 17 | Agent stopped on their own. | app bug | 0 |
| d-06 Sam | day2 | claude-sonnet-5-5 | 46 | Agent stopped on their own. | app bug | 2 |

## Day 2

| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Days missed before |
|---|---|---|---|---|---|
| d-01 | 2026-10-20 | yes | yes | yes | 0 |
| d-02 | 2026-10-20 | yes | yes | yes | 0 |
| d-03 | 2026-10-20 | yes | yes | yes | 0 |
| d-04 | 2026-10-20 | yes | yes | yes | 0 |
| d-05 | 2026-10-20 | yes | yes | yes | 0 |
| d-06 | 2026-10-20 | yes | yes | yes | 0 |

## Social

| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens |
|---|---|---|---|---|---|

## History


## Cost

Measured: $0.83 across 151 calls (313843 input, 20580 output tokens).

Projected full run (12 first-day, 2 history, 3 pairs × 3, 6 day-2 sessions, 24 steps each): $5.74.
- 12 sessions × 24 steps on claude-opus-5-5 at $0.01/step: $3.36 (rate scaled from the measured model by list price)
- 17 sessions × 24 steps on claude-sonnet-5-5 at $0.01/step: $2.38

## Notes

- History account: 12/history. Seeded.
- Day 2: 12 saved accounts from oct-build92 qualify; 12 secured yesterday (2026-10-20 is today). 6 used.
- Secured Day 1 sessions in this run: 6.
