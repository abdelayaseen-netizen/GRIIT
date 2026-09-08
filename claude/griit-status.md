# GRIIT status

Updated 7 September 2026.

## Where to build

`design/v3` at `49cf824` is the **Build 50** candidate.

Chunks A–E are merged, plus:

- **#71** — create payload writes task targets; empty description skips the quality gate
- **#73** — launch routes to `activeChallenge.id`, not challenge id
- **#74** — feed copy by event type; pack timer duration; single pack source
- **#75** — Hard-mode completions (timer and other non-photo types) go through Capture when `require_photo` is set; failure copy branches on the real error (`BAD_REQUEST` vs upload)

Chunk G (active challenge, frame 28) lives in `design/handoff/`. Not implemented.

`main` is `a976851`. Railway is deployed from it; the description quality-gate fix is live in production.

## TestFlight

Build 48 is broken: every challenge launch fails (wrong-id route, missing task targets). Build 50 is the fix and is urgent.

## Device pass (Simulator, 7 Sep)

On `design/v3`: Home, Profile, Discover, Activity, wizard launch, and photo proof all pass. Simulator has no camera — a real-device pass is still required.

## Next (in order)

1. **Chunk F** — wizard, paywall, and task completion → `DS_V3`; CTA out from under the tab bar; double header removed
2. **Chunk G** — active challenge from frame 28
3. PR `design/v3` → `main`
4. `eas build --profile production`

## Parking lot

- RevenueCat V1/V2 secret key on Railway — 403 on every `validateSubscription`
- `profiles.getFollowCounts` 400
- Free tier is 1 on the server vs 3 in the spec
- Reading counter renders `/10count`
- Active screen does not refetch after a completion
- Real-device pass still required (no camera on Simulator)

## Standing rule

Cursor never starts or kills Metro. Yaseen owns it in his own terminal.
