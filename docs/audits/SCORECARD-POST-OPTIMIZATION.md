# GRIIT — Post-optimization full-stack scorecard

**Generated:** April 8, 2026  
**Scope:** After running the Master Cursor pipeline (deep clean → consolidation → performance → scorecard) on this repo.

## Work completed in this pass

### Prompt 1 — Deep clean (partial)

- **Migrations:** Removed duplicate/untracked files `add_shared_column.sql`, `teams.sql` (superseded by timestamped migrations). Replaced untimestamped `add_milestone_shared.sql` with `20260409000000_active_challenges_milestone_shared.sql` (same idempotent DDL).
- **Types:** `backend/trpc/guards.ts` — replaced local `SupabaseClient` stub using `any` with `import type { SupabaseClient } from "@supabase/supabase-js"`.
- **Tests:** `lib/api.test.ts` — mock `@/lib/sentry` so Vitest does not load React Native’s Promise polyfill (fixes suite failure).
- **Not done at full master-prompt scope:** exhaustive unused-import pass, design-system token audit, every `console.*` gate (see evidence — production paths are already minimal), raw-hex sweep.

### Prompt 2 — Consolidation (partial)

- **Backend:** Merged `checkins-core.ts` into `checkins.ts` (single router export). Merged `feed-core.ts` + `feed-social.ts` into `feed.ts`. Removed redundant `meta` tRPC router (duplicate of `GET /api/health` version string); dropped `TRPC.meta` from `lib/trpc-paths.ts` and `meta` from `app-router.ts`.
- **Not done:** Splitting mega components (`TaskEditorModal`, `CreateChallengeWizard`, `NewTaskModal`, `app/task/complete.tsx`, etc.), profiles file merge, shared date-utils extraction, replacing every raw navigation string with `ROUTES`.

### Prompt 3 — Performance (partial)

- **React Query:** `lib/prefetch-queries.ts` — `prefetchActiveChallengeById` now sets `staleTime: 2 * 60 * 1000` (aligns with “active challenge” freshness). Global defaults remain in `lib/query-client.ts` (`staleTime` 5m, `gcTime` 10m).
- **Not done:** Full FlatList memoization audit, context splitting, optimistic mutations everywhere, backend `select("*")` sweep (grep shows no `select('*')` pattern in `backend/**/*.ts`).

### Prompt 4 — Evidence commands (this machine)

| Check | Result |
|--------|--------|
| `npx tsc --noEmit` → Select-String "error" | **Count: 0** |
| `npx vitest run` | **75 tests passed** (12 files) |
| `npx expo lint` | **0 errors**, 35 warnings (hooks, array-type style, etc.) |
| Backend `.select(...*...)` | **0 matches** (no `select('*')` grep hit) |

**Files &gt; 500 lines (app/components/lib/contexts — illustrative):**

- `app/task/complete.tsx` (~2105 lines)
- `components/create/CreateChallengeWizard.tsx` (~1695)
- `components/TaskEditorModal.tsx` (~1586)
- `app/(tabs)/activity.tsx` (~1509)
- `components/create/NewTaskModal.tsx` (~1481)
- `backend/trpc/routes/feed.ts` (~789 merged)
- `backend/trpc/routes/checkins.ts` (~503 merged)
- `contexts/AppContext.tsx` (~720)

**Analytics:** `lib/analytics.ts` defines a discriminated union of **60+** typed `name:` events.

**Migration files:** `supabase/migrations/*.sql` — count increased by 1 (milestone migration); net file removal from deleting 3 loose SQL files.

---

## Scorecard (1–10)

| # | Category | Score | Evidence summary | Path to 10 |
|---|----------|-------|------------------|------------|
| 1 | TypeScript strictness | 8 | `tsc` clean; guards fixed; no `as any` in app/lib grep | Stricter DB types; remove remaining loose casts in routes |
| 2 | Component architecture | 5 | Multiple screens/components still &gt;1.4k lines | Extract steps/modals per pipeline doc |
| 3 | Design system compliance | 8 | Tokens in use; design-system.ts is large config | Token pruning / unused comment pass |
| 4 | Navigation safety | 7 | Many `ROUTES` usages; some `router.push({ ... })` / dynamic paths remain | Centralize all paths in `lib/routes.ts` |
| 5 | State management | 6 | `AppContext` still large | Split profile vs challenge vs notifications |
| 6 | Data fetching | 7 | Global `staleTime`/`gcTime`; prefetch stale for active challenge | Per-query tuning; optimistic complete/secure |
| 7 | Accessibility | 7 | Labels present in many touchables; not 100% | Audit all Pressable/TouchableOpacity |
| 8 | Error handling | 8 | ErrorBoundary, InlineError; no Alert.alert in gates | Screen-level boundaries everywhere |
| 9 | Performance | 6 | Defaults good; FlatList/context not fully audited | Memoized lists, image cachePolicy audit |
| 10 | Offline support | 5 | OfflineBanner exists | Mutation queue + read-through cache |
| 11 | Analytics coverage | 8 | 60+ typed events + `trackEvent` | Verify production firing for all funnels |
| 12 | Premium / paywall | 7 | RevenueCat wired | Device smoke tests |
| 13 | Push notifications | 7 | Token + scheduling paths | End-to-end delivery validation |
| 14 | Onboarding flow | 8 | Store + analytics events | Edge-case QA |
| 15 | Code hygiene | 7 | Consolidated routes; fewer dead migrations | ESLint warnings → 0; TODO policy |

| # | Category | Score | Evidence summary | Path to 10 |
|---|----------|-------|------------------|------------|
| 16 | API design | 8 | Routers merged; Zod on procedures | Further trim oversized `feed.ts` |
| 17 | Auth & authorization | 8 | protectedProcedure + RLS patterns | Token rotation hardening |
| 18 | Database schema | 8 | Timestamped milestone migration; removed duplicate SQL noise | Migration inventory only timestamped |
| 19 | Rate limiting | 8 | Upstash patterns (existing) | Alerting on abuse |
| 20 | Cron / background | 6 | Documented stubs / endpoints | Wire + idempotent runs |
| 21 | Push delivery | 7 | Expo push helpers | Retry/metrics |
| 22 | Content moderation | 7 | `content-moderation.ts` | Image moderation if needed |
| 23 | Logging & monitoring | 8 | Pino + structured errors | Request timing dashboards |
| 24 | Security | 8 | Env-based secrets; RLS | CSP / periodic audit |
| 25 | Test coverage | 5 | 75 tests, focused unit/flow | Integration + coverage targets |

### Averages

- **Frontend (1–15):** **6.9 / 10**
- **Backend (16–25):** **7.2 / 10**
- **Weighted (60% / 40%):** **7.0 / 10**

---

*This scorecard is evidence-based for the current tree; large refactors listed in the master pipeline document were only partially executed to preserve a shippable diff.*
