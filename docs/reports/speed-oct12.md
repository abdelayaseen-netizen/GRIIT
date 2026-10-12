# Speed, 12 Oct

S1–S8 were not timed.

There is no release build of this branch on the simulator. The only running app server is the dev Metro process that started before today's onboarding changes, so a tap-to-paint measurement on it would be a dev bundle, and a stale one. A dev timing is not a release timing, and it is not a pass or a fail against the targets.

Targets, from the overnight brief (R10):

| Step | What it measures | Target |
|---|---|---|
| S1 | Cold start to an interactive Home | under 2 s |
| S2 | Tab switch | under 300 ms |
| S3 | Open a challenge | under 500 ms |
| S4 | Post a photo, then Home | under 3 s |
| S5–S8 | The rest of the Phase 1c list, including no frozen frame over 700 ms | not timed |

No milliseconds are recorded here because none were measured. Nothing in the Phase 1c list (thumbnails, staleTime, prefetch, resizing a photo before upload, an optimistic post) was changed for speed today.
