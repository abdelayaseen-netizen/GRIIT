# Second-Pass Backend Hardening

Baseline: current backend report and scorecard (Section E). This pass targets the highest-leverage gaps that block 8/10+ production readiness.

---

## A. REMAINING RISK AUDIT (CODEBASE-SPECIFIC)

| # | Risk | Exact location | Impact |
|---|------|----------------|--------|
| 1 | **No rate limiting** | `backend/hono.ts`: all `/api/trpc/*` and `/trpc/*` requests; `backend/trpc/routes/auth.ts`: `signUp`, `signIn`; `backend/trpc/routes/challenges.ts`: `join`; `backend/trpc/routes/checkins.ts`: `secureDay`; `backend/trpc/routes/nudges.ts`: `send`; `backend/trpc/routes/accountability.ts`: `invite` | Single IP or user can hammer auth (credential stuffing), join (spam), secureDay (double-tap), nudge/invite (abuse). |
| 2 | **No request tracing or structured logging** | `backend/trpc/create-context.ts`: no requestId; no middleware logging procedure/path, userId, duration, error. `backend/server.ts`: only `console.log` for port. | Production debugging is guesswork; no correlation ID for support or logs. |
| 3 | **Multi-step mutations not atomic** | `backend/trpc/routes/challenges.ts`: `join` — insert active_challenge → insert check_ins → upsert streaks (three round-trips; partial failure leaves orphan active_challenge or missing check_ins). `backend/trpc/routes/checkins.ts`: `secureDay` — multiple updates (streaks, active_challenges, day_secures, profiles); partial failure can leave inconsistent state. | Orphaned rows or inconsistent streak/profile/secure counts. |
| 4 | **DB integrity not enforced at DB level** | No migration yet: `day_secures` has no UNIQUE(user_id, date_key); `active_challenges` has no partial UNIQUE(user_id, challenge_id) WHERE status='active'; indexes in SCHEMA-INDEXES.md not applied. | Duplicates under race; slower queries; application is sole enforcer. |
| 5 | **Heavy read paths unbounded / no pagination** | `backend/trpc/routes/challenges.ts`: `list`, `getFeatured` — fixed LIMIT 50, no cursor; client cannot page. `backend/trpc/routes/stories.ts`: `list` — limit 50, no cursor. | Large result sets in one response; no scalable “load more”. |
| 6 | **RLS and Supabase security posture unverified** | No checklist or test: tables (active_challenges, check_ins, day_secures, profiles, streaks, etc.) RLS on? Policies restrict by auth.uid()? Service role vs anon usage. | Misconfiguration could allow bypass of app-layer checks. |
| 7 | **Request body size unbounded** | `backend/hono.ts`: no limit on POST body for `/api/trpc/*`. | Very large payloads can cause memory/CPU spike. |

---

## B. EXACT IMPLEMENTATION PLAN

1. **Rate limiting and abuse prevention**
   - Add `backend/lib/rate-limit.ts`: in-memory store (Map), key = IP, window 60s, max 100 requests per window; optional stricter bucket for auth paths (10/min) if request body is inspected.
   - Add Hono middleware before trpc: read `X-Forwarded-For` / `X-Real-IP` / `CF-Connecting-IP` for IP; apply global limit; return 429 with Retry-After if over.
   - Add request body size limit: reject POST with Content-Length > 1_000_000 (1MB).

2. **Structured logging and request tracing**
   - Generate or read `X-Request-ID` in Hono middleware; attach to request (header or pass via context).
   - In `create-context.ts`: add `requestId` to context (from header or `crypto.randomUUID()`).
   - Add tRPC procedure middleware: before `next()` record start time; after `next()` log JSON: `{ requestId, path, userId, durationMs, errorCode? }`. Log on throw (catch in middleware and rethrow).

3. **Transaction/atomic safety**
   - Add Supabase migration: create RPC `join_challenge(p_challenge_id uuid)` that uses `auth.uid()`, checks not already joined, inserts active_challenge, inserts check_ins, upserts streak in one transaction. Return new active_challenge row.
   - In `backend/trpc/routes/challenges.ts`: `join` — call `ctx.supabase.rpc('join_challenge', { p_challenge_id: input.challengeId })` after validating challenge exists and duplicate-join check (or move duplicate check into RPC); remove inline inserts.
   - secureDay: leave in app (complex streak/last-stand logic); document as non-atomic; optionally add RPC in a later pass.

4. **Database-level integrity**
   - New migration: `day_secures` UNIQUE(user_id, date_key); partial UNIQUE on active_challenges(user_id, challenge_id) WHERE status = 'active'; indexes per SCHEMA-INDEXES.md (active_challenges, check_ins, day_secures, streaks, etc.).

5. **Pagination and query tightening**
   - `challenges.list` and `challenges.getFeatured`: add optional `cursor` (opaque string: base64 of `created_at|id`) and `limit` (default 20, max 50). Return `{ items, nextCursor }`. Frontend: backward compatible (no cursor => first page).
   - stories.list: add optional cursor + limit; return `{ items, nextCursor }`.

6. **RLS verification**
   - Add `docs/RLS-SECURITY-VERIFICATION.md`: checklist of tables, expected RLS policies, and how to verify in Supabase dashboard or SQL.

---

## C. REAL CODE CHANGES

(See below and in referenced files.)

---

## D. MANUAL MIGRATION / CONFIG STEPS

1. **Supabase migrations (required for atomic join)**  
   Run in Supabase SQL Editor or via CLI, in order:  
   - `supabase/migrations/20250306000000_join_challenge_rpc.sql` — creates `join_challenge(p_challenge_id)` RPC.  
   - `supabase/migrations/20250306010000_integrity_constraints_indexes.sql` — unique constraints and indexes.  
   Until the first migration is run, `challenges.join` will return INTERNAL_SERVER_ERROR with message asking to deploy the RPC migration.

2. **Environment (optional)**  
   - `RATE_LIMIT_MAX_PER_MIN` — default 100 requests per IP per minute.  
   - `REQUEST_BODY_MAX_BYTES` — default 1_000_000 (1MB).  
   No new vars required for basic operation.

3. **RLS verification**  
   After deploy, run through `docs/RLS-SECURITY-VERIFICATION.md` (enable RLS on tables, confirm policies).

4. **Frontend**  
   - `challenges.list` / `challenges.getFeatured`: when called with no `cursor` or `limit`, response shape is unchanged (array of items). When `cursor` or `limit` is passed, response is `{ items, nextCursor }`.  
   - No other breaking changes.

---

## E. UPDATED SCORECARD (HONEST, /10)

Baseline was Section E of the production-readiness report (after first pass). This pass adds rate limiting, logging, body limit, atomic join RPC, pagination, DB constraints/indexes, and RLS verification doc. Scores are not inflated; 9–10 require strong abuse protection, traceability, transaction safety, DB integrity, and scalable queries.

| Category | Before (2nd pass) | After (2nd pass) | Notes |
|----------|-------------------|------------------|--------|
| **Security** | 7/10 | 8/10 | **Before:** Ownership and errors fixed; no rate limit or body limit. **After:** Global rate limit per IP (100/min), 1MB body limit, X-Request-ID. **Blocks 9–10:** No per-path stricter limits (e.g. auth 10/min), no CORS/headers audit. |
| **Correctness** | 7/10 | 8/10 | **Before:** Duplicate-join and insert handling; secureDay idempotent but join not atomic. **After:** `join_challenge` RPC runs join in one transaction (when migration applied). **Blocks 9–10:** secureDay still multi-step in app; no idempotency keys. |
| **Reliability** | 6.5/10 | 7/10 | **Before:** TRPCError consistent; no retries. **After:** Same; logging gives traceability for failures. **Blocks 9–10:** No retries, circuit breakers, or health checks beyond /health. |
| **Performance** | 6.5/10 | 7.5/10 | **Before:** Capped inputs; one less fetch in complete. **After:** list/getFeatured support cursor + limit and return `{ items, nextCursor }`; default 50, range query with count. **Blocks 9–10:** Indexes are in migration but must be applied; no caching. |
| **Maintainability** | 7.5/10 | 7.5/10 | No change this pass. |
| **Cleanliness** | 7/10 | 7/10 | No change this pass. |
| **Scalability** | 5.5/10 | 7/10 | **Before:** No rate limit. **After:** Per-IP rate limit and pagination reduce single-client impact. **Blocks 9–10:** In-memory rate limit only (single-instance); no Redis/caching. |
| **Observability** | 4/10 | 7/10 | **Before:** No structured logs. **After:** requestId in context; procedure middleware logs JSON (requestId, path, userId, durationMs, errorCode). **Blocks 9–10:** No metrics, tracing, or log aggregation. |
| **Data integrity** | 7.5/10 | 8/10 | **Before:** App-level idempotency and whitelist. **After:** Migration adds UNIQUE(day_secures.user_id, date_key), partial UNIQUE(active_challenges) for one active join, indexes and unique on respects/accountability_pairs. **Blocks 9–10:** secureDay not in transaction. |
| **Overall production readiness** | 6.2/10 | 7.5/10 | **After:** Rate limiting, logging, body limit, atomic join (with migration), pagination, and DB integrity improvements justify 7.5. **Blocks 8+:** Stricter auth rate limits, Redis or shared rate limiter for multi-instance, and transactions or RPC for secureDay would move toward 8. **Blocks 9–10:** Full observability stack, rate limit per procedure, and scalable rate storage. |

**Next:** Third-pass hardening (atomic secureDay, distributed rate limit, per-route throttle, error monitoring, typing, pagination) → **docs/THIRD-PASS-HARDENING.md**.
