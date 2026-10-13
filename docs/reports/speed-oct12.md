# Speed, 12 Oct

Measured after build 87 was uploaded to App Store Connect. Release binary on the GRIIT iPhone 16 simulator, iOS 26.4, commit `8972cd30`. The session was a signed-in account on Home (day already secured). Clock for S1: `simctl launch`, then a screenshot, then on-device text recognition. A run is the gap between the last frame that did not show Home content and the first frame that showed “Day secured”, “Good evening”, or “1 done”.

## S1. Cold start to interactive Home

| Run | Still on the previous frame (ms) | Home content visible by (ms) |
|---|---:|---:|
| 1 | 2948 | 3509 |
| 2 | 2847 | 3370 |
| 3 | 2860 | 3374 |
| 4 | 2910 | 3432 |
| 5 | 2868 | 3387 |

Median of the “visible by” times: 3387 ms. Worst: 3509 ms. Home content was still absent at a median of 2868 ms (latest absence 2948 ms). The R10 target is under 2 s. This fails.

The sample gap is about half a second, so the number is the first frame that showed the content, not the exact millisecond it appeared.

## S2. Tab switch

Five cycles, Home to Discover, Activity, and Profile, then back. The tap goes through Maestro, which waits until the screen is static before the call returns, so the clock includes the tool. On a separate check, the first screenshot after a Discover, Activity, or Profile tap already showed that tab.

Tool-included times, five samples:

| Tab | Median (ms) | Worst (ms) |
|---|---:|---:|
| Discover | 701 | 4508 |
| Activity | 646 | 734 |
| Profile | 655 | 760 |

The Discover worst sample is one stall at 4508 ms. The other four were 696, 698, 701, and 712. Home’s return taps clustered near 3.7 s inside the tool while the screen was already Home, so those samples are the tool waiting, not a measured Home switch. The 300 ms target is not resolved. There is no pass or fail.

## S3–S8

Not given a five-run clock. The same tap tool cannot separate its wait from the app. This account’s day was already secured: Home had “Share today” and no Post control, no undone Done row, and the profile’s first screen showed Edit profile and the streak, not a proof grid. Opening a proof and swiping to the next one had no tile to open. Pull to refresh was not timed separately.

Network requests per screen were not counted. No proxy was attached. No frozen frame was isolated on its own clock. The S1 frames are about half a second apart, which is under the 700 ms freeze line, so a freeze shorter than the gap would not show up.

An earlier signed-out release launch, taken before this submit, reached Welcome by a median of 3316 ms (worst 3391 ms). That was Welcome, not Home.
