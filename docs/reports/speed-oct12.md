# Speed, 12 Oct

Release binary, iPhone 16 simulator, iOS 26.4. Built with `xcodebuild` Release for the simulator after `expo run:ios` stopped on physical-device signing. Five launches. The app had no signed-in session, so each launch opened Welcome.

Clock: `simctl launch`, then a screenshot about every 450 ms. The frame was read with on-device text recognition. A run is the gap between the last frame that did not show Welcome and the first frame that showed “Start”, “Daily challenges”, or “I already have an account”.

| Run | Still on the previous frame (ms) | Welcome visible by (ms) |
|---|---:|---:|
| 1 | 2886 | 3316 |
| 2 | 2906 | 3385 |
| 3 | 2951 | 3391 |
| 4 | 2865 | 3287 |
| 5 | 2861 | 3307 |

Median of the “visible by” times: 3316 ms. Worst: 3391 ms. Welcome was still absent at a median of 2886 ms (latest absence 2951 ms).

This is launch to Welcome. S1 is cold start to an interactive Home, and Home was not on screen. There is no Home pass or fail.

S2 (tab switch, target under 300 ms), S3 (open a challenge, under 500 ms), and S4 (post a photo, then Home, under 3 s) were not timed. Scripted sign-in reached the email form and the fields showed text, and the form still said to fill in email and password, so the session never started.

S5–S8 are the rest of the Phase 1c list, including no frozen frame over 700 ms. That list is not written down as separate steps in the repo, so those steps were not timed and there is no frozen-frame number.

Targets from the overnight brief, unchanged: Home under 2 s, tab switch under 300 ms, open a challenge under 500 ms, post a photo then Home under 3 s.
