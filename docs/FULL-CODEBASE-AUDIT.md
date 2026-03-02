# Full Codebase Audit Report

**Date:** 2025-02-28  
**Scope:** Frontend (Expo/React Native) + Backend (Hono/tRPC/Supabase). Every file considered; all changes and flags documented for review.

---

## 1. Dead Code Elimination

### 1.1 Removed

| Location | Change |
|----------|--------|
| `app/create-profile.tsx` | **Removed unused import:** `ScrollView` from `react-native` (screen uses `Screen` component for scroll). |

### 1.2 Unused / Not Referenced (Flagged — Review Before Removing)

| Item | Where | Notes |
|------|--------|--------|
| **Backend auth router** | `backend/trpc/routes/auth.ts` | Procedures: `signUp`, `signIn`, `signOut`, `getSession`. **No frontend calls these**; app uses Supabase auth directly in `AuthContext`, `auth/login`, `auth/signup`, `create-profile`, `profile` (signOut). Safe to keep for future/other clients or remove if you will never use tRPC for auth. |
| **`@nkzw/create-context-hook`** | `package.json` | **Not imported anywhere.** All contexts use React’s `createContext`/`useContext`. Safe to remove from dependencies. |
| **`constants/typography`** | Only used by `styles/create-styles.ts` | Rest of app uses `src/theme/typography` or design-system components. Can consolidate create-styles to `src/theme` and remove `constants/typography` when ready. |

### 1.3 Verified as Used

- **Routes:** All `app/` routes referenced in `_layout.tsx` (auth, create-profile, settings, (tabs), edit-profile, success, challenge/[id], task/*, commitment, secure-confirmation, day-missed, +not-found). No orphan routes.
- **API routes:** `app/api/health+api.ts`, `app/api/trpc/[trpc]+api.ts` — both used (health by ApiContext, trpc by frontend tRPC client).
- **Components:** SkeletonLoader (Skeleton, HomeScreenSkeleton) used by index and profile; StreakTracker, StreakCalendar, Celebration, TaskEditorModal used; all `src/components/ui` and Typography used by create-profile or available for refactors.
- **Exports from `lib/api.ts`:** `getApiBaseUrl`, `getHealthUrl`, `getTrpcUrl`, `fetchWithTimeout`, `fetchWithRetry`, `checkHealth`, `formatError`, `checkDbTables`, `formatTRPCError`, `HealthCheckResult`, `DbSanityResult` — all referenced (trpc.ts, ApiContext, create.tsx, api.test.ts).
- **Backend procedures:** All frontend-invoked procedures exist (see Integration Check below).

---

## 2. Consolidation

### 2.1 Duplicated / Redundant Logic

| Area | Finding | Recommendation |
|------|---------|----------------|
| **Colors** | Two sources: `constants/colors.ts` (legacy) and `src/theme/colors.ts` (design system). Many screens still use `Colors` from constants. | Migrate remaining screens to `src/theme/colors` and optionally re-export from constants from theme for a single source of truth. |
| **Typography** | `constants/typography.ts` (create-styles only) vs `src/theme/typography.ts` (design system). | When refactoring create flow, use `src/theme/typography` and remove `constants/typography`. |
| **Retry/delays** | `ApiContext` uses `[500, 1000, 2000, 4000]`; `lib/api.ts` uses `RETRY_DELAYS = [500, 1000, 2000, 4000]`. | Consider a single constant in `lib/api.ts` and import in ApiContext if you want one place for retry timing. |
| **Error formatting** | `formatError` and `formatTRPCError` in `lib/api.ts`; used from ApiContext and create.tsx. | No duplication; single implementation. |

### 2.2 Repeated API Calls

- **AppContext** fetches profile, stats, activeChallenge, stories, todayCheckins in sequence/effect; no duplicate calls for the same resource in the same context.
- **Discover** calls `trpcQuery('challenges.getFeatured', params)` on load/refresh; **Create** calls `trpcMutate('challenges.create', payload)`. No redundant identical calls found.
- **Challenge detail** calls `trpcQuery('challenges.getById', { id })` and `trpcMutate('challenges.join', { challengeId })`; **commitment** also calls `challenges.join`. Same procedure, different screens (detail vs commitment modal) — intentional.

### 2.3 Conflicting / Overlapping Implementations

- **Backend:** Single entry `backend/server.ts` → `backend/hono.ts` → tRPC + health. No duplicate server or route definitions.
- **Supabase:** Single client in `lib/supabase.ts` (frontend); backend uses `backend/lib/supabase.ts` and per-request client in create-context. No conflict.
- **Profile creation:** Only one path: Supabase upsert in `create-profile.tsx`. AppContext has `profiles.create` tRPC for auto-create fallback; create-profile does not use tRPC for initial create. Not conflicting; different flows.

---

## 3. Integration Check (Frontend ↔ Backend)

### 3.1 tRPC: Frontend Calls → Backend Procedures

| Frontend call | Backend procedure | Contract check |
|---------------|-------------------|----------------|
| `trpcQuery('profiles.get')` | `profiles.get` (no input) | ✅ Match |
| `trpcQuery('profiles.getStats')` | `profiles.getStats` (no input) | ✅ Match |
| `trpcQuery('challenges.getActive')` | `challenges.getActive` (no input) | ✅ Match |
| `trpcQuery('challenges.getById', { id })` | `challenges.getById` input `{ id: z.string() }` | ✅ Match |
| `trpcQuery('challenges.getFeatured', params)` | `challenges.getFeatured` input `{ search?, category? }` | ✅ Match |
| `trpcMutate('challenges.join', { challengeId })` | `challenges.join` input `{ challengeId: z.string() }` | ✅ Match |
| `trpcMutate('challenges.create', payload)` | `challenges.create` (full payload schema) | ✅ Match (create.tsx builds payload to match) |
| `trpcQuery('checkins.getTodayCheckins', { activeChallengeId })` | `checkins.getTodayCheckins` input `{ activeChallengeId }` | ✅ Match |
| `trpcMutate('checkins.complete', params)` | `checkins.complete` (activeChallengeId, taskId, value?, noteText?, proofUrl?) | ✅ Match |
| `trpcMutate('checkins.secureDay', { activeChallengeId })` | `checkins.secureDay` input `{ activeChallengeId }` | ✅ Match |
| `trpcQuery('stories.list')` | `stories.list` (no input) | ✅ Match |
| `trpcMutate('profiles.create', …)` | `profiles.create` (username, display_name?, bio?, …) | ✅ Match |

**URLs / methods:** Frontend uses `lib/trpc.ts` → `getTrpcUrl()` from `lib/api.ts` (base from `EXPO_PUBLIC_API_BASE_URL` + `/api/trpc`). GET for queries, POST for mutations. Backend serves at `/api/trpc/*` (Hono) and Expo API route at `/api/trpc` (fetch handler). **Contracts match.**

### 3.2 Health & API Base

- **Health:** Frontend `checkHealth()` in ApiContext uses `getHealthUrl()` → `${base}/api/health` or `/api/health`. Backend: `backend/hono.ts` has `GET /api/health`; Expo has `app/api/health+api.ts` GET. Both return `{ ok: true, … }`. **Match.**
- **CORS / headers:** Backend Hono CORS allows GET, POST, OPTIONS; Content-Type, Authorization. Expo trpc handler sets CORS headers. **Consistent.**

### 3.3 Auth (Supabase, Not tRPC)

- Login/signup/signOut/session use Supabase client in `lib/supabase.ts`. Backend auth router exists but is **not** called from the app. No contract mismatch; frontend does not rely on tRPC auth.

---

## 4. Dependency Cleanup

### 4.1 Removed

- None in this audit (see 1.2 for optional removal of `@nkzw/create-context-hook`).

### 4.2 Flagged

| Package | Status |
|---------|--------|
| `@nkzw/create-context-hook` | No imports in codebase. **Safe to remove** from `package.json` if you confirm no other tooling uses it. |
| `react-native-worklets` | In package.json; no direct import found. May be a peer/optional of another Expo/RN package. **Verify with `npm ls react-native-worklets`** before removing. |

### 4.3 All Other Imports Resolve

- Path alias `@/*` → `./*` (root). All `@/` imports point to existing files (contexts, lib, app, backend, components, mocks, styles, types, src/theme, src/components).
- No missing or orphan files detected for imports.

---

## 5. Error-Free Verification

### 5.1 Lint / TypeCheck

- **Linter:** No errors reported under `app`, `contexts`, `lib`, `backend`, `src` (run `read_lints` on those trees).
- **Build/run:** Not executed in this environment (npm/node not in PATH). **You should run:** `npm run lint`, `npm run test`, `npx expo start` (or build) and fix any failures.

### 5.2 Broken References / Orphan Files / Type Mismatches

- **No broken references** found: every imported module exists.
- **No orphan files** in app routes; all screens registered in `_layout.tsx`.
- **Types:** `types/index.ts` is the central type set; backend uses Zod for runtime. No frontend/backend type file conflict identified; tRPC input/output are aligned with usage above.

### 5.3 Files Touched in This Audit

| File | Change |
|------|--------|
| `app/create-profile.tsx` | Removed unused `ScrollView` import. |

---

## 6. Summary Checklist

| Area | Result |
|------|--------|
| Dead code (imports/vars/functions) | One unused import removed; auth router and one dependency flagged. |
| Consolidation | No duplicate API calls; color/typography dual sources and retry delays flagged for optional consolidation. |
| Integration (frontend ↔ backend) | All tRPC and health endpoints traced; request/response contracts match. |
| Dependencies | One optional removal flagged; no unresolved imports. |
| Errors / build | Lint clean on audited paths; full build and test left for local run. |

**Recommended next steps**

1. Run `npm run lint` and `npm run test` (and optionally `npx expo start`) locally.
2. Optionally remove `@nkzw/create-context-hook` from `package.json` and run `npm install`.
3. When refactoring create flow or remaining screens, migrate to `src/theme` and remove `constants/typography` (and optionally consolidate `constants/colors` → theme).
4. Decide whether to keep or remove backend `auth` router depending on future use of tRPC for auth.
