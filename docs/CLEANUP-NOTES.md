# GRIT — Cleanup Notes (Starter Pack E2E QA)

**Branch:** `starter-packs-e2e-qa`  
**Date:** 2025-02-28

---

## What was removed

| Item | Reason |
|------|--------|
| **Discover fallback to STARTER_CHALLENGES** | When `getFeatured` returns empty or errors, we no longer show mock challenges. We show the honest empty state ("No challenges found" / "Retry"). Avoids fake data. |
| **Pending action on gate dismiss** | When user closes the auth gate without signing up, `closeGate()` now clears `pendingActionRef` so the action is not run later. |

---

## What was consolidated

| Area | Change |
|------|--------|
| **Invite / share** | All share paths (challenge detail "Share challenge", "Invite friends", and "Invite friends to this challenge" link) now include a real join URL via `Linking.createURL(\`/challenge/${id}\`)` and track `invite_shared` with `challengeId` and `source: "challenge_detail"`. Milestone modal uses `invite_shared` with `source: "milestone_modal"` and a discover link. |
| **Post-signup return** | Single mechanism in `AuthGateContext`: store pending action when guest hits gated action; when `user` becomes truthy, run action once and clear. No duplicate logic. |

---

## What was not removed (and why)

| Item | Why kept |
|------|----------|
| **STARTER_CHALLENGES in mocks/starter-challenges.ts** | Still referenced by challenge detail for mock/starter IDs (e.g. `starter-1`, `daily-1`) and type `StarterChallenge`. Can be removed in a later pass when all challenge detail flows use only backend data. |
| **Onboarding starter definitions (backend lib/starter-seed.ts)** | Required for `starters.join` and migration seed; separate from Discover Starter Pack. |

---

## Safety

- **TypeScript:** No types removed that are still in use; `StarterChallenge` remains in use for Discover and challenge detail.
- **Build:** No intentional breaking changes; Expo/React Native and backend TRPC routes unchanged except added procedures and notification wiring.
- **References:** Removed only the fallback usage of `STARTER_CHALLENGES` in Discover; the constant and type are still imported where needed.

---

## Suggested follow-up cleanup

1. **Challenge detail** — When all challenges are loaded from backend (including Starter Pack by UUID), treat only UUIDs as remote and remove mock `starter-*` / `daily-*` handling and `STARTER_CHALLENGES` lookup.
2. **Deep link handling** — Add expo scheme and handle `Linking.createURL('/challenge/:id')` so opening the invite link routes to challenge detail and shows "Join Challenge".
3. **Centralize dateKey** — Replace ad-hoc `new Date().toISOString().split('T')[0]` with a small `lib/dateKey.ts` (e.g. `getTodayDateKey()`) for consistency.
