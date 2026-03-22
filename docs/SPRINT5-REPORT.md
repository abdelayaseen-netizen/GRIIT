# Sprint 5 Report: Backend Hardening

**Date:** 2026-03-22

**Commits (this sprint):**

| SHA | Message |
|-----|---------|
| `ec02d8b` | docs: Sprint 5 backend inventory — tRPC procedures, RLS policies, storage |
| `7b36c5e` | security: tRPC hardening — zod input on parameterless mutations, POST body default |
| `bc40054` | security: RLS + storage — profiles delete own row, task-proofs delete own objects |
| `0ccf1a5` | chore: document Upstash Redis and Supabase service role for backend |

## Metrics

| Metric | Before (approx.) | After | Notes |
|--------|------------------|-------|--------|
| Mutations with `.input()` | 32 / 36 lacked empty-object validation on 4 parameterless mutations | 36 / 36 | `z.object({})` on sign-out, validate subscription, delete account, Strava disconnect |
| `lib/trpc.ts` mutation POST body | Omitted when `input` undefined | Always `serialize(input ?? {})` | Ensures server receives `{}` for validated empty input |
| Protected procedures | 66 | 66 | Unchanged |
| Public procedures (intentional) | 11 | 11 | Discovery, auth, leaderboard, meta |
| RLS migration additions | — | `profiles` DELETE; `storage.objects` DELETE | `20260321120000_sprint5_rls_storage_hardening.sql` |
| Storage policies (task-proofs) | INSERT + SELECT | + DELETE own prefix | Aligns with `userId/...` uploads in `lib/uploadProofImage.ts` |
| Rate limiting | `routeLimitMiddleware` + `checkRouteRateLimit` in `backend/lib/rate-limit.ts` | Verified | Auth paths + write paths; Upstash optional via env |
| Service role usage | 3 areas | 3 | `supabase-admin`, `supabase-server`, `profiles.deleteAccount` + Strava callback — justified |

## tRPC audit summary

See `docs/SPRINT5-TRPC-INVENTORY.md` for the full procedure table. **Every mutation** now has a Zod `.input()` (including `z.object({})` where the client sends no fields).

## RLS final matrix (new migration)

See `docs/SPRINT5-RLS-INVENTORY.md`. This sprint adds:

- **`profiles`:** authenticated users may `DELETE` their own row (required for `profiles.deleteAccount` with the user JWT).
- **`storage.objects`:** authenticated users may `DELETE` objects in `task-proofs` when the first path segment equals `auth.uid()`.

No change to `day_secures` / `activity_events` broad `SELECT` policies: `leaderboard.getWeekly` aggregates using the user-scoped Supabase client and relies on existing read access patterns (see inventory notes).

## Rate limiting & service role (Phase 4)

- **Rate limiting:** Implemented in `backend/trpc/create-context.ts` (`routeLimitMiddleware`) and `backend/lib/rate-limit.ts`. Stricter limits for `auth.signIn`, `auth.signUp`, `profiles.create`, and listed write paths (including `profiles.deleteAccount`).
- **Env:** `.env.example` documents `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_MAX_PER_MIN`, and `SUPABASE_SERVICE_ROLE_KEY`.

## Verification (Phase 5)

- `npx tsc --noEmit`: pass
- `npx vitest run`: pass (75 tests)

### Checklist commands (representative)

- Mutations vs inputs: every `.mutation(` in `backend/trpc/routes/*.ts` is paired with `.input(` (36 mutations; multiple `.input` lines exist for chained refinements).
- `TRPCError`: used across routers for structured errors (see `backend/trpc/routes/*.ts`).
- `ENABLE ROW LEVEL SECURITY` / `CREATE POLICY`: cumulative counts in `supabase/migrations/*.sql` (inventory in `docs/SPRINT5-RLS-INVENTORY.md`).

## Estimated scorecard impact

| Category | Estimated after Sprint 5 |
|----------|-------------------------|
| API route coverage | ~90+ |
| Input validation | ~90+ |
| RLS & data isolation | Stronger delete semantics; full matrix still depends on deployed DB |
| Database schema / migrations | Documented + one hardening migration |

## Known remaining gaps

- **Leaderboard + `day_secures`:** If `SELECT` is tightened on `day_secures`, move weekly aggregation to a service-role query or a secure RPC.
- **Uncommitted local work:** There are unstaged changes (create-challenge wizard refactor) not part of these commits; keep them separate from Sprint 5.
- **Apply migration:** Run `supabase db push` / deploy migration on your Supabase project so `profiles` DELETE and storage DELETE policies exist in production.
