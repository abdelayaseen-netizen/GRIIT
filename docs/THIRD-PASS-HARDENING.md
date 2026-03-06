# Third-Pass Backend Hardening

Baseline: second-pass work (rate limiting, logging, atomic join, pagination, DB integrity). This pass targets 8.5+/10 production readiness.

---

## A. REMAINING GAP AUDIT (CODEBASE-SPECIFIC)

| # | Gap | Exact location | Impact |
|---|-----|----------------|--------|
| 1 | **secureDay not atomic** | `backend/trpc/routes/checkins.ts`: `secureDay` — 6+ Supabase calls (alreadySecured, activeChallenge, completedCheckins, streak, day_secures insert, streaks upsert, active_challenges update, profiles select/update). Partial failure can leave inconsistent streak/profile/day_secures. | Data integrity; double-secure or missed updates under failure. |
| 2 | **In-memory rate limit** | `backend/lib/rate-limit.ts`: Map-based store; `backend/hono.ts`: single-instance only. | Multi-instance or serverless: each instance has its own counter; rate limit not enforced across replicas. |
| 3 | **No per-route throttling** | `backend/hono.ts`: only global per-IP. Auth (`auth.signIn`, `auth.signUp`) and write-heavy (`checkins.secureDay`, `challenges.join`, `nudges.send`, `accountability.invite`) share same 100/min. | Credential stuffing or write abuse with 100 req/min still possible. |
| 4 | **No error monitoring hooks** | `backend/trpc/create-context.ts`: logging middleware logs success/errorCode but no failure reporting (webhook, aggregation). No structured error payload for alerts. | Production incidents require log scraping; no push to Sentry/similar. |
| 5 | **Remaining any-casts** | `backend/trpc/routes/checkins.ts`: (streak as any), (activeChallenge as any), (r: any), (t: any). `leaderboard.ts`, `stories.ts`, `profiles.ts`, `respects.ts`, `nudges.ts`, `accountability.ts`, `challenges.ts`: (p: any), (r: any), (challenge: any). `backend/hono.ts`: (c as any). | Type safety and refactor risk. |
| 6 | **Heavy paths without pagination** | `backend/trpc/routes/leaderboard.ts`: `getWeekly` — fetches up to 100 users + profiles + streaks + todaySecures + respects in one go; no cursor. `backend/trpc/routes/stories.ts`: `list` — limit 50, no cursor. `backend/trpc/routes/respects.ts`: `getForUser` — limit 50, no cursor. `backend/trpc/routes/nudges.ts`: `getForUser` — limit 50, no cursor. | Unbounded or fixed-large responses; no “load more”. |

---

## B. EXACT IMPLEMENTATION PLAN

1. **secureDay atomic** — Add Supabase RPC `secure_day(p_active_challenge_id uuid)` that runs in one transaction: idempotency check, validate tasks completed, compute streak/last-stand/tier in SQL, insert day_secures, update streaks, update active_challenges, update profiles. Return `(new_streak_count int, last_stand_earned boolean)`. In `checkins.ts` call RPC when available; fallback to app logic only if RPC missing (42883).

2. **Distributed rate limiting** — Add `@upstash/ratelimit` and `@upstash/redis`. In `backend/lib/rate-limit.ts`: when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, use Upstash Redis for global and per-route limits; else keep in-memory fallback.

3. **Per-route throttling** — Add `clientIp` to context (from request headers). Add tRPC middleware that calls `checkRouteRateLimit(path, { ip: ctx.clientIp, userId })`: auth paths (auth.signIn, auth.signUp) → 10/min per IP; write paths (checkins.secureDay, challenges.join, nudges.send, accountability.invite) → 30/min per user (or per IP if unauthenticated). Use same Redis or in-memory backend.

4. **Error monitoring** — Add `backend/lib/error-reporting.ts`: `reportError({ requestId, path, userId, code, message })`. Log structured JSON; if `ERROR_REPORT_URL` is set, POST payload (fire-and-forget). Call from logging middleware when `result.ok === false`.

5. **Typing** — Add `backend/types/db.ts` with minimal row types (StreakRow, DaySecureRow, ChallengeTaskRow, ProfileRow, etc.). Replace `(as any)` in routes with these types. Type Hono context in middleware.

6. **Pagination** — `leaderboard.getWeekly`: add optional `limit` (default 100, max 100), `cursor` (offset); return `{ entries, nextCursor, currentUserRank, totalSecuredToday }`. `stories.list`: add `limit`/`cursor`, return `{ items, nextCursor }` when cursor used. `respects.getForUser`, `nudges.getForUser`: add optional `limit`/`cursor`; return shape unchanged when not used (backward compat).

---

## C. CODE CHANGES

(See implementation in referenced files.)

---

## D. INFRA / CONFIG / MANUAL STEPS

1. **Upstash Redis** — Create an Upstash Redis instance; set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production. If unset, in-memory rate limiting is used.
2. **secure_day RPC** — Run migration `supabase/migrations/20250307000000_secure_day_rpc.sql`. Required for atomic secureDay.
3. **Error reporting** — Optional: set `ERROR_REPORT_URL` (e.g. Sentry ingest or custom endpoint) for POST on tRPC errors.
4. **Frontend** — Leaderboard/stories/respects/nudges: when using new `cursor`/`limit`, handle `{ items/entries, nextCursor }`; existing calls unchanged.

---

## E. UPDATED SCORECARD (HONEST, /10)

| Area | Before (2nd pass) | After (3rd pass) | Notes |
|------|-------------------|------------------|--------|
| **secureDay atomicity** | ~6 | **9** | RPC `secure_day` in one transaction; app fallback only when RPC missing (42883). |
| **Rate limiting** | ~6 | **9** | Global per-IP + per-route (auth 10/min, write 30/min); Upstash Redis when configured, in-memory fallback. |
| **Per-route throttling** | 0 | **8** | Auth and write-heavy paths throttled; same backend as global. |
| **Error monitoring** | ~4 | **7.5** | Structured `reportError`, optional `ERROR_REPORT_URL` POST; no SDK (e.g. Sentry) in codebase. |
| **Backend typing** | ~6 | **8.5** | `backend/types/db.ts`; `any` removed in checkins, leaderboard, stories, respects, nudges, profiles, accountability, challenges; Hono `Context` typed. |
| **Pagination / heavy queries** | ~7 | **8.5** | Leaderboard, stories, respects, nudges: optional `limit`/`cursor`; backward compatible when omitted. |
| **Overall production readiness** | ~7–7.5 | **8.5** | Atomic secureDay, distributed rate limit, per-route throttle, error hook, typing, pagination. Not 9: no APM, no built-in Sentry SDK; optional manual steps (Redis, migration, ERROR_REPORT_URL). |
