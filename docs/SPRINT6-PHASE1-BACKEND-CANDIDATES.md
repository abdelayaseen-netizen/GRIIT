# Sprint 6 Phase 1 — tRPC routes with no app usage (candidates only)

Per Sprint 6 rules, backend routers are **not** deleted here; this lists procedures that appear unused by the mobile app (`trpcQuery` / `trpcMutate` / `TRPC.*` outside `backend/`).

| Router / procedure | Notes |
|--------------------|--------|
| `starters.getChallengeIdByStarterId`, `starters.join` | Defined in `lib/trpc-paths.ts`; no `TRPC.starters` usage in app. Onboarding uses `challenges.getStarterPack` instead. |
| `nudges.send`, `nudges.getForUser` | No frontend callers; only backend tests / rate-limit registration. |

**Still used from the app (not candidates):** `challenges.getStarterPack`, `sharedGoal.*`, `stories.list` (see `contexts/AppContext.tsx`), etc.
