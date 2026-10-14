# Blockers

## Resolved this session

The Railway CLI is logged in. The seed ran through `railway run --service grit-backend`. The API was deployed with `railway up`. Health commit is `e061ecd`. Deployment id `da8951e2-e4ff-4980-98ac-81620f5dacc4`. No Railway variables, domains, or scaling were changed. The service role key was not copied.

Settings → About on the Metro bundle shows `commit e061ecd`.

## Ship

Smoke is not all green, so EAS was not started and nothing was sent to TestFlight.

Passed: build87-done-checkoff, build87-done-counter, build87-done-write, build87-faith, build87-guest-account, build87-delete-account, build88-finish-early.

Failed:

- build87-done-timer: `checkins.complete` returned 429. Not retried.
- build87-done-photo and build87-fitness: the composer button is now "Post to friends", and it stays disabled when the simulator camera does not attach a photo. The flows still look for "Post proof".
- build87-post-photo: "Post to friends" is disabled (`enabled: false`) after the camera step, so the tap does not leave the composer.
- build88-likes: after "Send it" the flow is still on Settings, which has no Home tab. The like itself passed on the seeded account.

## 36-person test

Not started yet. The harness in the agent-testers worktree refuses to run unless a user JWT can set `is_test`. RLS blocks that. Accounts will be created with `railway run` so the server's own service role sets the flag. Guest personas use the real guest flow. This hour already used the smoke guests, so the next guest chunk stays under 20.
