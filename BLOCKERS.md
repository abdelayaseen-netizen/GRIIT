# Blockers

## Ship

Smoke is not all green, so EAS was not started and nothing was sent to TestFlight.

Passed: build87-done-checkoff, build87-done-counter, build87-done-write, build87-faith, build87-guest-account, build87-delete-account, build88-finish-early.

Failed:

- build87-done-timer: `checkins.complete` returned 429. Not retried.
- build87-done-photo and build87-fitness: the composer button is now "Post to friends", and it stays disabled when the simulator camera does not attach a photo.
- build87-post-photo: "Post to friends" stayed disabled after the camera step.
- build88-likes: after "Send it" the flow is still on Settings, which has no Home tab. The like itself passed on the seeded account.

## What is no longer blocked

The Railway CLI is logged in. The seed ran. The API deployment `da8951e2-e4ff-4980-98ac-81620f5dacc4` reports commit `e061ecd`. The 38 sessions ran. Spend was $0.83 of $40. The review password was not printed. No Railway variables were changed.
