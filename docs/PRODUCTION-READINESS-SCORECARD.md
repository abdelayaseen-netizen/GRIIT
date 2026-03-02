# GRIT-1 Production Readiness Scorecard

**Date:** 2025-02-28  
**Scope:** Post–production-readiness fixes (secrets, profiles schema, tests, dead code, CORS/logging, env docs).

---

## Summary

| Dimension | Before | After | Δ |
|-----------|--------|--------|---|
| Security | 2.5 | 4.0 | +1.5 |
| Reliability | 3.0 | 4.0 | +1.0 |
| Data integrity | 2.0 | 4.0 | +2.0 |
| Observability | 2.0 | 3.0 | +1.0 |
| Code quality | 3.5 | 4.0 | +0.5 |
| Testing | 1.0 | 3.5 | +2.5 |
| Build & deploy | 2.5 | 2.5 | 0 |
| Documentation | 3.0 | 4.0 | +1.0 |
| **Overall** | **2.4** | **3.6** | **+1.2** |

*(Scores 1–5; overall = mean of dimensions.)*

---

## Provenance (what changed)

### Security (2.5 → 4.0)

- **Secrets:** `lib/supabase.ts` — removed hardcoded Supabase URL and anon key; now uses `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY` (with empty string fallback so prod fails fast if unset). No committed secrets.
- **CORS:** `backend/hono.ts` — replaced `cors()` with configurable `cors({ origin: process.env.CORS_ORIGIN ?? (isProd ? '' : '*'), allowMethods, allowHeaders })`. Production can set `CORS_ORIGIN` to a specific origin.
- **Profiles RLS alignment:** Backend and app now use `user_id` for profiles (see Data integrity), so RLS policies that key on `auth.uid() = user_id` apply correctly.

### Reliability (3.0 → 4.0)

- **Profiles bug:** All profile code now uses `user_id` to match schema (see Data integrity), fixing create/get/update and auth redirect behavior.
- **DB sanity check:** `lib/api.ts` — `checkDbTables()` changed from `.select('id')` to `.select('*')` for the existence check so the `profiles` table (which has `user_id` as PK) is checked correctly.

### Data integrity (2.0 → 4.0)

- **Backend:** `backend/trpc/routes/profiles.ts` — create: `id` → `user_id`, `onConflict: 'id'` → `onConflict: 'user_id'`; get: `.eq('id', …)` → `.eq('user_id', …)`; update: `.eq('id', …)` → `.eq('user_id', …)`.
- **App:** `app/_layout.tsx` — profile check `.select('id').eq('id', userId)` → `.select('user_id').eq('user_id', userId)`.
- **App:** `app/create-profile.tsx` — upsert `id` → `user_id`, `onConflict: 'id'` → `onConflict: 'user_id'`.
- **App:** `app/edit-profile.tsx` — `.eq('id', user.id)` → `.eq('user_id', user.id)`.
- **Context:** `contexts/AppContext.tsx` — fallback profile fetch `.eq('id', userId)` → `.eq('user_id', userId)`; fallback upsert `id` / `onConflict: 'id'` → `user_id` / `onConflict: 'user_id'`.

### Observability (2.0 → 3.0)

- **Backend logging:** `backend/trpc/create-context.ts` — all `console.log`/`console.error` for context creation and auth gated with `if (!isProd)` (using `NODE_ENV === 'production'`).
- **Backend logging:** `backend/hono.ts` — root and health route logs gated with `if (process.env.NODE_ENV !== 'production')`.
- **Backend logging:** `backend/lib/supabase.ts` — URL/key presence logs only when `NODE_ENV !== 'production'`.  
*(Structured logging / request IDs / metrics not added; score reflects reduced noise and safer defaults.)*

### Code quality (3.5 → 4.0)

- **Dead code removed:** `app/+native-intent.tsx` deleted (unused). `app/auth/create-profile.tsx` deleted; single create-profile flow at `app/create-profile.tsx`. `app/auth/_layout.tsx` — removed `create-profile` screen. `mocks/data.ts` — removed unused exports `mockCurrentUser`, `socialSnapshots`, `purposeLines`, `encouragementMessages`. `components/SkeletonLoader.tsx` — removed unused `ProfileScreenSkeleton` and its styles.
- **Single create-profile:** One screen and one flow for profile creation; no duplicate screens.

### Testing (1.0 → 3.5)

- **Infra:** `package.json` — added scripts `"test": "vitest run"`, `"test:watch": "vitest"` and devDependency `"vitest": "^2.1.0"`. `vitest.config.ts` — added (node env, include `**/*.test.ts`, exclude app/node_modules, alias `@`).
- **Tests:** `lib/api.test.ts` — tests for `formatError` (null/undefined, string, Error, object.message, REQUEST_TIMEOUT) and `formatTRPCError` (network error → isNetwork true, non-network → message passed through). Uses `vi.mock('@/lib/supabase')` and `vi.mock('react-native')` so api module loads in Node.
- **Tests:** `lib/time-enforcement.test.ts` — tests for `formatTimeHHMM`, `computeWindowSummary`, and `validateTimeEnforcement` (disabled valid, missing anchor, bad format, valid window, window end before start).
- **Run:** From repo root: `npm run test` or `bun run test` (after `npm install` / `bun install`). No E2E or backend integration tests yet; score reflects presence of test runner and critical-path unit tests.

### Build & deploy (2.5 → 2.5)

- No EAS or production app build config added. Backend CORS and logging improvements support production deployment but do not change the build/deploy score.

### Documentation (3.0 → 4.0)

- **SETUP.md** — Added “Production environment variables (checklist)” table: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_BASE_URL`, `PORT`, `NODE_ENV`, `CORS_ORIGIN` with required/optional, where used, and description. Updated Create Profile route from `/auth/create-profile` to `/create-profile`.

---

## How to verify

1. **Secrets:** `lib/supabase.ts` — no literal Supabase URL or anon key; only `process.env.EXPO_PUBLIC_*`.
2. **Profiles:** Search repo for `profiles` + `user_id` in `backend/trpc/routes/profiles.ts`, `app/_layout.tsx`, `app/create-profile.tsx`, `app/edit-profile.tsx`, `contexts/AppContext.tsx`; no remaining `.eq('id', …)` or `onConflict: 'id'` for profiles.
3. **Tests:** Run `npm run test` or `bun run test`; expect `lib/api.test.ts` and `lib/time-enforcement.test.ts` to pass.
4. **CORS/logging:** In `backend/hono.ts` and `backend/trpc/create-context.ts` and `backend/lib/supabase.ts`, grep for `NODE_ENV` / `isProd` to see gating.
5. **Env doc:** Open `SETUP.md` and search for “Production environment variables”.

---

## Remaining gaps (for future work)

- **Security:** Add rate limiting; consider tightening CORS further in production.
- **Observability:** Structured logging, request IDs, and metrics (e.g. health latency, error rates).
- **Testing:** Backend tRPC/integration tests, E2E for auth and profile flows.
- **Build & deploy:** EAS (or equivalent) config for production app builds and store submission.

---

# Round 2 — Correctness, tests, observability, dead code (2025-02-28)

**Scope:** Backend correctness (checkins null safety), production logging gates, dead API surface removal, Activity refetch, backend streak unit tests, lib api test addition, scorecard update.

## Summary (Round 2)

| Dimension | Before (Round 1 After) | After (Round 2) | Δ |
|-----------|------------------------|-----------------|---|
| Security | 4.0 | 4.0 | 0 |
| Reliability | 4.0 | 4.0 | 0 |
| Data integrity | 4.0 | 4.0 | 0 |
| Observability | 3.0 | 3.5 | +0.5 |
| Code quality | 4.0 | 4.0 | 0 |
| Testing | 3.5 | 4.0 | +0.5 |
| Build & deploy | 2.5 | 2.5 | 0 |
| Documentation | 4.0 | 4.0 | 0 |
| **Overall** | **3.6** | **3.75** | **+0.15** |

*(Scores 1–5; overall = mean of dimensions. Round 2 overall = (4+4+4+3.5+4+4+2.5+4)/8 = 3.75.)*

## Provenance (Round 2)

### Reliability (unchanged 4.0; correctness fixes)

- **checkins.complete:** `backend/trpc/routes/checkins.ts` — fetch active challenge row first; if missing or no `challenge_id`, throw `'Active challenge not found'` instead of querying `challenge_tasks` with undefined. Prevents silent wrong progress and runtime errors.
- **checkins.secureDay:** Same file — resolve `(activeChallenge as any).challenges?.challenge_tasks` with optional chaining; if not an array, throw `'Challenge tasks not found'`. Prevents crash when relation shape is missing.
- **Streak logic:** Extracted to `backend/lib/streak.ts` (`computeNewStreakCount`) and used in `secureDay`; same behavior, testable in isolation.

### Observability (3.0 → 3.5)

- **challenges.getFeatured:** `backend/trpc/routes/challenges.ts` — all `console.log` and `console.error` gated with `if (process.env.NODE_ENV !== 'production')`.
- **challenges.create:** Same file — all `console.log` and `console.error` gated with `if (process.env.NODE_ENV !== 'production')`.

### Code quality (unchanged 4.0; dead surface removed)

- **AppContext:** `contexts/AppContext.tsx` — removed unused `notifications` and `markNotificationAsRead` from type and value (no consumer in app).
- **Activity screen:** `app/(tabs)/activity.tsx` — pull-to-refresh now calls `refetchAll()` from `useApp()` instead of a no-op timeout; data actually refetches on refresh.

### Testing (3.5 → 4.0)

- **Backend:** `backend/lib/streak.ts` — new pure function `computeNewStreakCount(todayKey, streak)`. `backend/lib/streak.test.ts` — 5 tests: no previous streak, gap in streak (reset to 1), increment when yesterday completed, longest updates, null counts.
- **Lib:** `lib/api.test.ts` — added test for `formatTRPCError` with message `'Cannot reach server. Backend may be starting.'` → `isNetwork: true`.
- **Run:** From repo root: `npm run test` or `bun run test`; expect `lib/api.test.ts`, `lib/time-enforcement.test.ts`, and `backend/lib/streak.test.ts` to pass.

### Documentation (unchanged 4.0)

- **Scorecard:** This section added with before/after numbers and provenance for Round 2.

## How to verify (Round 2)

1. **Checkins:** In `backend/trpc/routes/checkins.ts`, grep for `activeRow?.challenge_id` and `challengeTasks` / `Challenge tasks not found`.
2. **Logging:** In `backend/trpc/routes/challenges.ts`, grep for `NODE_ENV !== 'production'`; all console logs in getFeatured and create should be gated.
3. **AppContext:** In `contexts/AppContext.tsx`, grep for `notifications` or `markNotificationAsRead`; should be absent from type and value.
4. **Activity:** In `app/(tabs)/activity.tsx`, grep for `refetchAll`; onRefresh should await `refetchAll()`.
5. **Tests:** Run `npm run test` or `bun run test`; all three test files should pass (api, time-enforcement, backend/lib/streak).
6. **Scorecard:** This file contains the Round 2 summary table and provenance above.
