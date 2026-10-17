# 5-safety-edge

6 sessions. Build 90, GRIIT iPhone 16 simulator.

## Funnel

| Step | Count |
|---|---|
| Joined | 3 |
| First task opened | 1 |
| Task finished | 2 |
| Photo | 0 |
| Day secured seen | 2 |
| Sessions under 15 steps (not a crash) | 0 |
| Early stops refused by the harness | 8 |

## Done to visible

| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |
|---|---|---|---|---|---|
| p5-02 Vic | post-choice-sheet | — | — | 2054 ms | Day secured |
| p5-02 Vic | Proof | — | — | 3864 ms | Day secured |
| p5-06 Felix | post-choice-sheet | — | — | 2899 ms | Day secured |
| p5-06 Felix | Proof | — | — | 2559 ms | Day secured |

Median Done → sheet: —. Median choice → done marker: 2729 ms. Median photo post (Post to friends → done marker): —.

## Safety and edge

| Persona | Check | Blocked message seen | Reached Home | Ended |
|---|---|---|---|---|
| p5-01 Rae | Open Profile, then Edit profile. Change the username to shit… | no | yes | Gave up. auth repeated 3 times. |
| p5-02 Vic | Open the challenge the app shows you, join it, finish today'… | no | yes | Gave up. other repeated 3 times. |
| p5-03 Tess | Open Create and start a new challenge titled shit list with … | no | yes | Gave up. other repeated 3 times. |
| p5-04 Reed | Tap I already have an account and log in with your email and… | no | no | Gave up. other repeated 3 times. |
| p5-05 Guest | Finish onboarding and the first task as a guest. When the ap… | no | no | Gave up. other repeated 3 times. |
| p5-06 Felix | Open the challenge the app shows you, join it, finish today'… | no | yes | Gave up. home repeated 3 times. |

Offline was not applied: this Mac has no simulator network conditioner wired up (agents/src/device.ts applyPrivacy).

## Sessions

| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |
|---|---|---|---|---|---|---|
| p5-01 Rae | 5-safety-edge | home | 17 | opened → home → discover | Gave up. auth repeated 3 times. | auth: Failed to run flow: Element not found: Text matching regex: @ap501mvcxxykd; auth: model reply was not valid JSON |
| p5-02 Vic | 5-safety-edge | home | 17 | opened → home → challenge → joined → completed → shared | Gave up. other repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join 7K Steps; other: Failed to run flow: Element not found: Text matching regex: inputView |
| p5-03 Tess | 5-safety-edge | home | 26 | opened → home | Gave up. other repeated 3 times. |  |
| p5-04 Reed | 5-safety-edge | welcome | 17 | opened | Gave up. other repeated 3 times. | other: model reply was not valid JSON |
| p5-05 Guest | 5-safety-edge | welcome | 17 | opened → joined → task | Gave up. other repeated 3 times. | onboarding: radio button is already selected.; other: Failed to run flow: Element not found: Text matching regex: inputView |
| p5-06 Felix | 5-safety-edge | home | 21 | opened → home → challenge → joined → completed → shared | Gave up. home repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join 7K Steps; home: Failed to run flow: Element not found: Text matching regex: Close |
