# Production-Readiness Upgrade Report — Backend

**Date:** 2025-03-05  
**Scope:** Full backend audit and implemented improvements across security, correctness, reliability, performance, maintainability, observability, and data integrity.

**Second pass (rate limiting, logging, atomic join, pagination, DB integrity):** see **docs/SECOND-PASS-HARDENING.md** for remaining risk audit, implementation plan, code changes, migrations, RLS verification, and updated scorecard (7.5/10).

**Third pass (atomic secureDay, distributed rate limit, per-route throttle, error monitoring, typing, pagination):** see **docs/THIRD-PASS-HARDENING.md** for gap audit, implementation plan, code changes, infra steps, and updated scorecard (8.5/10).

---

## SECTION A — EXECUTIVE SUMMARY

### Current condition (before)

The backend is a tRPC-over-Hono API using Supabase for auth and PostgreSQL. It had **one critical security flaw**: checkins (complete, getTodayCheckins, secureDay) accepted `activeChallengeId` from the client and did **not** verify that the active challenge belonged to the authenticated user. Any user could complete tasks or secure the day for another user’s challenge by guessing IDs. Auth and several routes leaked raw Supabase error messages to the client. Input validation was loose (no max lengths, no UUID checks on IDs). Profile update passed the whole input object to the DB. There was no shared ownership guard and no duplicate-join protection for challenges.

### Biggest risks discovered

1. **Critical:** Missing ownership check on `activeChallengeId` in checkins (cross-user data mutation).
2. **High:** Auth and many routes throwing `new Error(error.message)` (information disclosure).
3. **High:** No input caps on search, profile fields, story media/caption, push token (abuse/DoS).
4. **Medium:** Profile update used full input object (risk of updating unintended columns if schema drifts).
5. **Medium:** challenges.join allowed double-join (duplicate active_challenges for same user+challenge).
6. **Medium:** challenges.create did not set `status` explicitly; join did not use TRPCError or NOT_FOUND.

### Biggest improvements made

1. **Security:** Introduced `assertActiveChallengeOwnership` and used it in all three checkin procedures; added UUID validation for `activeChallengeId` and `taskId`; tightened auth error messages and TRPCError usage across routes.
2. **Correctness:** Duplicate-join check in challenges.join; explicit `status: 'published'` on challenge create; check-ins insert error handling and streak upsert onConflict.
3. **Input validation:** Search/category max length; profile update whitelist and max lengths; story mediaUrl/caption and notification token limits; noteText/proofUrl limits.
4. **Consistency:** Standardized on TRPCError with appropriate codes (BAD_REQUEST, NOT_FOUND, FORBIDDEN, INTERNAL_SERVER_ERROR) and client-safe messages in auth, profiles, checkins, challenges, stories, notifications, streaks, respects.

---

## SECTION B — DETAILED AUDIT REPORT (CODEBASE-SPECIFIC)

Every finding lists: **exact file path**, **exact procedure/function name**, **exact risk**, and **exact fix** (code change).

### Critical

| # | File path | Procedure / function | Exact risk | Exact fix |
|---|-----------|----------------------|------------|-----------|
| 1 | `backend/trpc/routes/checkins.ts` | `complete` | Attacker sends `activeChallengeId` = another user's active_challenge UUID and `taskId` = a task UUID from that challenge. Backend ran upsert/update on check_ins and active_challenges without verifying the active_challenge row's `user_id` matched `ctx.userId`. Result: victim's check_ins and progress_percent could be mutated by any authenticated user. | New file `backend/trpc/guards.ts`: `assertActiveChallengeOwnership(supabase, activeChallengeId, userId)` selects `id, user_id` from `active_challenges` by id; throws NOT_FOUND if no row, FORBIDDEN if `row.user_id !== userId`. In `complete`: added at start `await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);`. Input: `activeChallengeId: z.string().uuid()`, `taskId: z.string().uuid()`, `noteText`/`proofUrl`: `.max(2000).optional()`. |
| 2 | `backend/trpc/routes/checkins.ts` | `getTodayCheckins` | Client sends another user's `activeChallengeId`. Backend selected check_ins by `active_challenge_id` and `date_key` with no ownership check. Result: any user could read another user's check-in data for that day. | Added `await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);` at start. Input: `activeChallengeId: z.string().uuid()`. Replaced `throw new Error(error.message)` with TRPCError INTERNAL_SERVER_ERROR and safe message. |
| 3 | `backend/trpc/routes/checkins.ts` | `secureDay` | Client sends another user's `activeChallengeId`. Handler updated streaks, active_challenges, day_secures, profiles using `ctx.userId` but the active_challenge row was client-chosen. Result: attacker could advance current_day and progress_percent on the victim's active_challenge. | Added `await assertActiveChallengeOwnership(...)` at start. Input: `activeChallengeId: z.string().uuid()`. All `throw new Error(...)` replaced with TRPCError (NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST) and safe messages. |

### High

| # | File path | Procedure / function | Exact risk | Exact fix |
|---|-----------|----------------------|------------|-----------|
| 4 | `backend/trpc/routes/auth.ts` | `signUp` | `throw new Error(error.message)` sent Supabase raw message (e.g. "User already registered") to the client. | Replaced with TRPCError BAD_REQUEST and safe message (e.g. "An account with this email already exists." or AUTH_ERROR_MESSAGE). Input: `email: z.string().email().max(255)`, `password: z.string().min(6).max(512)`; body uses trimmed/lowercased email. |
| 5 | `backend/trpc/routes/auth.ts` | `signIn` | Same: raw error leaked. `password: z.string()` allowed empty. | TRPCError UNAUTHORIZED with AUTH_ERROR_MESSAGE. Input: `password: z.string().min(1).max(512)`; body uses trimmed/lowercased email. |
| 6 | `backend/trpc/routes/auth.ts` | `signOut` | `throw new Error(error.message)` leaked. | TRPCError INTERNAL_SERVER_ERROR "Failed to sign out." |
| 7 | `backend/trpc/routes/profiles.ts` | `create` | Raw error and "Username already taken" exposed. | 23505: TRPCError BAD_REQUEST "Username already taken."; else TRPCError INTERNAL_SERVER_ERROR "Failed to create profile." |
| 8 | `backend/trpc/routes/profiles.ts` | `get` | `throw new Error(error.message)` on non-PGRST116. | TRPCError INTERNAL_SERVER_ERROR "Failed to load profile." |
| 9 | `backend/trpc/routes/profiles.ts` | `update` | `.update(input)` passed full Zod output; raw errors to client. | PROFILE_UPDATE_KEYS whitelist; build updatePayload from those keys only; `.update(updatePayload)`. String fields: .max(64/128/500/2000). Errors: 23505 BAD_REQUEST; else INTERNAL_SERVER_ERROR "Failed to update profile." |
| 10 | `backend/trpc/routes/challenges.ts` | `list` | `input.search` unbounded in ilike; 10KB string could stress DB. | Input: `search: z.string().max(100).optional()`, `category: z.string().max(50).optional()`. Use trimmed search in ilike. |
| 11 | `backend/trpc/routes/challenges.ts` | `getFeatured` | Same for search/category. | Same: search max 100, category max 50; trimmed search in ilike. |
| 12 | `backend/trpc/routes/challenges.ts` | `getById` | `id: z.string()`; non-UUID and raw error. | Input: `id: z.string().uuid()`. TRPCError NOT_FOUND "Challenge not found." |
| 13 | `backend/trpc/routes/challenges.ts` | `join` | No duplicate-join check; raw errors; check_ins insert result ignored. | At start: select active_challenges by user_id+challenge_id+status active; if exists throw BAD_REQUEST "You have already joined this challenge." challengeError -> NOT_FOUND; acError/streakError -> TRPCError. After check_ins insert: check error and throw TRPCError. Streak upsert: onConflict 'user_id'. Input: challengeId .uuid(). |
| 14 | `backend/trpc/routes/stories.ts` | `create` | mediaUrl/caption no max; raw error. | mediaUrl .min(1).max(2000), caption .max(500).optional(). TRPCError INTERNAL_SERVER_ERROR "Failed to create story." |
| 15 | `backend/trpc/routes/stories.ts` | `list` | Raw error. | TRPCError INTERNAL_SERVER_ERROR "Failed to load stories." |
| 16 | `backend/trpc/routes/stories.ts` | `markViewed` | storyId not UUID; raw error. | storyId: z.string().uuid(). TRPCError INTERNAL_SERVER_ERROR "Failed to record view." |
| 17 | `backend/trpc/routes/notifications.ts` | `registerToken` | token/device_id no max; raw error. | token .max(500), device_id .max(256). TRPCError "Failed to register push token." |
| 18 | `backend/trpc/routes/notifications.ts` | `updateReminderSettings` / `getReminderSettings` | Raw Error in both. | TRPCError INTERNAL_SERVER_ERROR with "Failed to update/load reminder settings." |
| 19 | `backend/trpc/routes/profiles.ts` | `search` | query not trimmed. | query: z.string().min(1).max(100).transform((s) => s.trim()) |

### Medium

| # | File path | Procedure / function | Exact risk | Exact fix |
|---|-----------|----------------------|------------|-----------|
| 20 | `backend/trpc/create-context.ts` | `createContext` | `authHeader.replace('Bearer ', '')` only; empty token still passed to getUser. | `const token = authHeader.replace(/^Bearer\\s+/i, '').trim();` and only call getUser if token non-empty. |
| 21 | `backend/trpc/routes/challenges.ts` | `create` | Insert did not set status; relied on DB default. | Insert includes `status: 'published'`. |
| 22 | `backend/trpc/routes/streaks.ts` | `useFreeze` | All throw new Error; no tRPC code. | All throws -> TRPCError BAD_REQUEST or INTERNAL_SERVER_ERROR. |
| 23 | `backend/trpc/routes/respects.ts` | `give` | "Cannot give respect to yourself" and error.message. | Self: TRPCError BAD_REQUEST. DB: TRPCError INTERNAL_SERVER_ERROR "Failed to give respect." |
| 24 | `backend/trpc/routes/respects.ts` | `getCountForUser` | throw new Error(error.message). | TRPCError INTERNAL_SERVER_ERROR "Failed to load respect count." |
| 25 | `backend/trpc/routes/checkins.ts` | `complete` / `secureDay` | After guard, branches threw new Error so no tRPC code. | complete: active row missing -> INTERNAL_SERVER_ERROR "Active challenge not found.". secureDay: tasks missing -> INTERNAL_SERVER_ERROR; not all required -> BAD_REQUEST "Not all required tasks completed.". Other errors -> TRPCError INTERNAL_SERVER_ERROR safe message. |

### Low

| # | File path | Procedure / function | Exact risk | Exact fix |
|---|-----------|----------------------|------------|-----------|
| 26 | `backend/trpc/routes/checkins.ts`, `backend/trpc/routes/challenges.ts`, `backend/trpc/routes/stories.ts` | complete, getTodayCheckins, secureDay, getById, join, markViewed | IDs (activeChallengeId, taskId, challengeId, storyId) were z.string(). | checkins: activeChallengeId and taskId .uuid(). challenges getById: id .uuid(). join: challengeId .uuid(). stories markViewed: storyId .uuid(). |

---

## SECTION C — IMPLEMENTED CHANGES (CODEBASE-SPECIFIC)

Implementation reference: for each change, **file path**, **procedure**, **risk**, and **fix** are listed in Section B above. Summary by file:

- **backend/trpc/guards.ts (new)** — `assertActiveChallengeOwnership(supabase, activeChallengeId, userId)`: select active_challenges by id; NOT_FOUND if missing, FORBIDDEN if row.user_id !== userId. Used by checkins complete, getTodayCheckins, secureDay.
- **backend/trpc/routes/checkins.ts** — complete, getTodayCheckins, secureDay: call guard first; activeChallengeId and taskId .uuid(); noteText/proofUrl .max(2000); all errors TRPCError with safe messages.
- **backend/trpc/routes/auth.ts** — signUp, signIn, signOut: TRPCError and AUTH_ERROR_MESSAGE; signUp email/password trimmed and length limits; signIn password .min(1).max(512).
- **backend/trpc/create-context.ts** — createContext: token via `/^Bearer\s+/i` and trim; getUser only if token non-empty.
- **backend/trpc/routes/challenges.ts** — list/getFeatured: search .max(100), category .max(50), trimmed search in ilike. getById: id .uuid(), TRPCError NOT_FOUND. join: duplicate-join check (existing active_challenges for user+challenge), TRPCError NOT_FOUND/BAD_REQUEST/INTERNAL_SERVER_ERROR, check_ins insert error checked, streak upsert onConflict. create: status 'published'.
- **backend/trpc/routes/profiles.ts** — create/get/update: TRPCError and safe messages. update: PROFILE_UPDATE_KEYS whitelist, updatePayload from keys only, string .max(). search: query .transform(trim).
- **backend/trpc/routes/stories.ts** — create: mediaUrl .max(2000), caption .max(500); list, markViewed: TRPCError; markViewed storyId .uuid().
- **backend/trpc/routes/notifications.ts** — registerToken: token .max(500), device_id .max(256); updateReminderSettings, getReminderSettings: TRPCError.
- **backend/trpc/routes/streaks.ts** — useFreeze: all TRPCError BAD_REQUEST or INTERNAL_SERVER_ERROR.
- **backend/trpc/routes/respects.ts** — give, getCountForUser: TRPCError with safe messages.

---

## SECTION D — MANUAL FOLLOW-UP ITEMS

1. **Database**  
   - Ensure `challenges.status` has a default (e.g. `'published'`) if not already set.  
   - Consider a unique constraint or partial unique index on (user_id, challenge_id) where status = 'active' for active_challenges to enforce one active join at the DB level.

2. **Environment**  
   - No new env vars. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in production and not logged.

3. **Supabase**  
   - RLS policies should already restrict rows by auth.uid(); the new ownership check is an application-layer guarantee. Review policies for active_challenges and check_ins to ensure they align with “user can only read/write own rows.”

4. **Rate limiting**  
   - Not implemented. Consider adding rate limiting (e.g. per IP or per user) for auth (signIn/signUp), invite, nudge, and story create in front of tRPC or at the Hono layer.

5. **Monitoring**  
   - Add structured logging for failed auth, TRPCError (code + procedure), and critical mutations (e.g. secureDay, join) for production debugging.

6. **Frontend**  
   - Checkins now require activeChallengeId and taskId to be valid UUIDs; frontend already sends IDs from API so should be compatible.  
   - Auth: frontend may have relied on specific Supabase error strings; now they get "Invalid email or password" or "An account with this email already exists." — update any error parsing if needed.  
   - challenges.join: if the user already joined, response is now BAD_REQUEST with "You have already joined this challenge." — frontend can show that message.

---

## SECTION E — SCORECARD (BRUTALLY HONEST, /10)

Scores are based on the actual codebase. "Before" = pre–production-upgrade state; "After" = current code. Each note explains the score and what still blocks 9–10.

| Category | Before | After | Notes |
|----------|--------|-------|--------|
| **Security** | 4/10 | 7/10 | **Before:** Critical: checkins accepted `activeChallengeId` with no ownership check (cross-user mutation). Auth and many routes threw raw `error.message`. No input caps or UUID validation. **After:** Guard enforces ownership and returns `challenge_id` (one less fetch). All routes use TRPCError with safe messages; no DB/auth leakage. Input capped (search 100, category 50, profile/story/notification lengths, UUIDs on IDs). **Blocks 9–10:** No rate limiting (auth/signup/nudge/join are abuse-prone). No request body size limit. No CORS/security headers documented. RLS alignment not verified. |
| **Correctness** | 5/10 | 7/10 | **Before:** Duplicate join possible (challenges + starters). getById/join threw generic Error. challenges.create didn’t set `status`; check_ins insert in join/starters ignored. **After:** Duplicate-join check in challenges.join and starters.join. NOT_FOUND/TRPCError everywhere. create sets `status: 'published'`. Insert errors checked and throw TRPCError. secureDay idempotent (check day_secures first); 23505 on day_secures/respects treated as success. **Blocks 9–10:** Multi-step flows (join, secureDay) are not in a DB transaction — partial failure can leave orphaned active_challenge or inconsistent streak/profile. No formal idempotency keys. |
| **Reliability** | 5/10 | 6.5/10 | **Before:** secureDay and profiles.getStats swallowed errors with `.then().catch()`. Mixed `throw new Error` vs TRPCError. **After:** requireNoError / TRPCError used consistently; no fire-and-forget that hides failures. day_secures and profile update in secureDay are checked (or 23505 accepted). **Blocks 9–10:** No retries for transient Supabase errors. No circuit breakers. No health-check endpoint. |
| **Performance** | 6/10 | 6.5/10 | **Before:** Unbounded search/category in list/getFeatured; risk of heavy ilike. **After:** search/category capped; one fewer round-trip in checkins.complete (challenge_id from guard). getTodayCheckins selects only needed columns. **Blocks 9–10:** list/getFeatured still limit 50 with no cursor pagination. Indexes in docs/SCHEMA-INDEXES.md are recommendations, not necessarily applied. No caching layer. |
| **Maintainability** | 5/10 | 7.5/10 | **Before:** No shared guard; date logic duplicated (profiles, streaks, checkins). Ad hoc error handling. **After:** `backend/lib/date-utils.ts` (getTodayDateKey, daysBetweenKeys, etc.), `backend/trpc/errors.ts` (requireNoError, handleSupabaseError), guard returns `challenge_id`. TRPCError standard; starters.join aligned with challenges.join. **Blocks 9–10:** secureDay and profiles.getStats are long, multi-step procedures. No shared Supabase row types; `(as any)` still used. |
| **Cleanliness** | 5/10 | 7/10 | **Before:** Mix of `throw new Error(error.message)` and TRPCError; duplicated date/error logic. **After:** Single place for date keys and error mapping; slimmer responses where changed (e.g. getTodayCheckins). **Blocks 9–10:** Type safety: many `(as any)` and untyped Supabase responses. Some handlers still 80+ lines. Dead code: feed.list returns `[]` (stub). |
| **Scalability** | 5/10 | 5.5/10 | **Before:** Stateless API; no obvious bottlenecks. **After:** Same. Capped inputs and one less Supabase call in complete reduce load slightly. **Blocks 9–10:** No rate limiting — a single client can hammer auth/join/nudge. No read replicas or caching. No horizontal scaling considerations in code. |
| **Observability** | 4/10 | 4/10 | **Before:** No structured logging; only error messages in responses. **After:** Unchanged. challenges.create has `logCreateChallenge` in non-prod only. **Blocks 9–10:** No request IDs, no structured logs (procedure, userId, duration, error code). No metrics or tracing. Debugging production = "what did the client get back?". |
| **Data integrity** | 5/10 | 7.5/10 | **Before:** Ownership not enforced on checkins; duplicate active_challenges possible; profile update used full input. **After:** Ownership enforced; duplicate-join prevented; profile update whitelist; secureDay idempotent; day_secures 23505 and respects 23505 handled. **Blocks 9–10:** No DB UNIQUE on (user_id, date_key) for day_secures yet (doc only). Multi-step writes not atomic. |
| **Overall production readiness** | 4.8/10 | 6.2/10 | **Before:** One critical security bug and inconsistent error/validation made production risky. **After:** Safe for production with clear follow-ups: rate limiting, logging, optional DB constraints/transactions. **Blocks 9–10:** Rate limiting, structured logging, transactions or compensating logic for multi-step writes, request size limit, and applied indexes would be required for a 9; full observability and scalability hardening for a 10. |

---

## SECTION F — FINAL VERDICT

- **How much stronger:** The backend is **noticeably stronger** for production: the critical cross-user mutation bug is removed, auth and errors no longer leak internals, and input validation and ownership checks are in place. Duplicate joins and profile update behavior are under control.

- **Top remaining weaknesses:**  
  1. No rate limiting (auth and social actions are abuse-prone).  
  2. No structured production logging (harder to debug live issues).  
  3. Multi-step writes (e.g. join, secureDay) are not in DB transactions — partial failure can leave inconsistent state until you add compensating logic or transactions.  
  4. Request body size is not limited at the server (Hono/tRPC) — very large payloads could be sent.

- **Next upgrade pass (suggested):**  
  1. Add rate limiting middleware (per user and/or per IP) for auth and high-value mutations.  
  2. Add a small structured logger (procedure, userId, error code, duration) and use it in createContext and key procedures.  
  3. Evaluate Supabase RPC or application-level transactions for join and secureDay.  
  4. Add request size limit (e.g. body max 1MB) in Hono.  
  5. Consider idempotency keys for secureDay and other critical mutations to avoid double-submit.
