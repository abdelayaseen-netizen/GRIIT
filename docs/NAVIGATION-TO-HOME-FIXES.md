# Post-Action Navigation Fixes — Output Table

**Completed:** 2025-03-15

```
┌─────┬────────────────────────────────────────────────┬──────────┬──────────────────────────┬────────────────────────────────┐
│ Fix │ Description                                    │ Status   │ Before                   │ After                          │
├─────┼────────────────────────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────┤
│ 1   │ "Continue Today" → first task, not Home        │ ✅       │ router.push(ROUTES.TABS) │ handleContinueToday(): first    │
│     │                                                 │          │                          │ incomplete task → task route;   │
│     │                                                 │          │                          │ all complete → Alert; else stay │
│ 2a  │ Commitment confirm → challenge detail          │ ✅       │ router.replace(TABS)     │ router.replace(CHALLENGE_ID)    │
│ 2b  │ Inline "I'm in" → stay + refresh               │ ✅       │ router.replace(TABS)     │ close modal + refetch + Alert   │
│ 3   │ Day missed → specific challenge                │ ✅       │ router.push(TABS)        │ challengeId? CHALLENGE_ID : TABS │
│ 4   │ Secure confirmation → challenge detail          │ ✅       │ router.back() / DISCOVER │ challengeId? CHALLENGE_ID : TABS │
│ +   │ (none other changed)                            │ —        │ —                        │ accountability/add left as-is   │
└─────┴────────────────────────────────────────────────┴──────────┴──────────────────────────┴────────────────────────────────┘
```

## Files changed

- **app/challenge/[id].tsx** — Continue Today uses `handleContinueToday` (first incomplete task or alert); inline commitment confirm closes modal + refetch, no replace to TABS.
- **app/commitment.tsx** — After join, all Alert actions use `router.replace(ROUTES.CHALLENGE_ID(challengeId))`.
- **app/day-missed.tsx** — Reads `challengeId` from params; Restart / Continue / Back to Home use `goToDestination()` → CHALLENGE_ID(challengeId) or TABS.
- **app/secure-confirmation.tsx** — Reads `challengeId` from params; auto-dismiss replaces to CHALLENGE_ID(challengeId) or TABS.
- **app/(tabs)/index.tsx** — `handleSecureDay` passes `challengeId` in params when pushing to SECURE_CONFIRMATION.

## Callers to update (optional)

- Any navigation **to** `day-missed` should pass `challengeId` when available (no callers found in app code; screen falls back to Home when missing).
