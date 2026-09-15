# GRIIT Full-Stack Audit Scorecard
**Generated:** 2026-04-07 22:16:43 -04:00  
**Commit:** `456bd5d5605e9b4c9db07c67a06aff36725047e0`  
**Auditor:** Cursor AI  

Verification: PowerShell 5.1 on Windows, repo root `GRIT-1`. Commands run as specified in the audit prompt unless noted (e.g. `Get-Content -Raw` unavailable — substituted `[System.IO.File]::ReadAllText` for expo-image scan).

---

## Summary

| # | Category | Weight | Score | Weighted |
|---|----------|--------|-------|----------|
| 1 | Architecture & Code Organization | 8 | 7/10 | 0.56 |
| 2 | TypeScript & Type Safety | 7 | 8/10 | 0.56 |
| 3 | Design System Compliance | 6 | 6/10 | 0.36 |
| 4 | Component Quality | 8 | 6/10 | 0.48 |
| 5 | Navigation & Routing | 5 | 7/10 | 0.35 |
| 6 | State Management | 6 | 5/10 | 0.30 |
| 7 | Backend & API | 10 | 9/10 | 0.90 |
| 8 | Security | 10 | 7/10 | 0.70 |
| 9 | Performance | 8 | 5/10 | 0.40 |
| 10 | Testing | 7 | 5/10 | 0.35 |
| 11 | UX Polish | 7 | 8/10 | 0.56 |
| 12 | Monetization & Paywall | 6 | 8/10 | 0.48 |
| 13 | Analytics & Observability | 5 | 8/10 | 0.40 |
| 14 | Infrastructure & DevOps | 4 | 8/10 | 0.32 |
| 15 | Documentation | 3 | 8/10 | 0.24 |
| | **TOTAL** | **100** | | **6.96/10** |

## Verdict
**CONDITIONAL GO** — The app typechecks (`npx tsc --noEmit` **passes**), tRPC + Zod + JWT context are in good shape, and observability/monetization hooks exist. Launch risk is concentrated in **performance tuning** (many FlatLists and inline list renderers), **test depth** (~1.5% test lines vs measured app surface), **`AppContext` size** (720 lines), and **dual theming** (`lib/theme` vs `lib/design-system.ts`). Address those before calling production “low risk.”

---

## Detailed Breakdown

### 1. Architecture & Code Organization — 7/10
**Verification (PowerShell):**
- `*.tsx` (excl. `node_modules`): **152** files  
- `*.ts` (excl. `node_modules`): **176** files  
- `router.push(` lines **not** containing `ROUTES.`: **5**  
- `trpcQuery|trpcMutate` lines **not** containing `TRPC.` (excl. `trpc-paths`): **0**  

**Evidence:**
- Central routes: `lib/routes.ts` — e.g. `ROUTES.TABS_DISCOVER` used widely (grep shows most pushes go through `ROUTES`).
- Stray navigation: `app/(tabs)/index.tsx` ~L325 `router.push(url as never)`; `app/(tabs)/activity.tsx` ~L325 ``router.push(`/post/${...}` ``; `app/challenge/active/[activeChallengeId].tsx` / `app/challenge/[id].tsx` use `router.push({ ... })` object hrefs (legitimate but bypass `ROUTES` string constants).
- Barrel: `components/ui/index.ts` (20 lines) — trimmed; create-flow exports still consumed by `components/TaskEditorModal.tsx`.

**Strengths:**
- Clear layering: `app/` screens, `components/`, `contexts/`, `lib/`, `backend/trpc/`.
- tRPC paths centralized in `lib/trpc-paths.ts` with **0** raw string calls detected in the grep gate.

**Issues:**
- **MEDIUM:** Five `router.push` call sites evade the `ROUTES.` constant pattern (dynamic URLs / object form) — harder to grep and refactor-safe.
- **MEDIUM:** `lib/theme/` still present (`Test-Path "lib/theme"` → **True**) — parallel token system vs `lib/design-system.ts`.

**Action items:**
- [ ] Map dynamic pushes to helpers on `ROUTES` (e.g. `ROUTES.POST_ID`) or a typed `Href` builder.
- [ ] Finish migration in prompt plan: collapse `lib/theme/*` into `DS_*` imports only.

---

### 2. TypeScript & Type Safety — 8/10
**Verification:**
- `Select-String -Path "tsconfig.json" -Pattern '"strict":\s*true'`: **1** match  
- `: any` / `as any` / `<any>`: **0** matches  
- `unknown[]`: **16** matches  
- `types/index.ts` lines: **594**  
- `backend/trpc/routes/*.ts` lines matching `z.object|z.string|z.number`: **191**  

**Evidence:**
- Strict compiler flags: `tsconfig.json` L4–8 — `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`.

**Strengths:**
- No `any` escapes in the audited pattern set; backend heavily uses Zod.

**Issues:**
- **MEDIUM:** **16** `unknown[]` / loose array typings — often context or legacy API shapes; tighten gradually.

**Action items:**
- [ ] Replace high-traffic `unknown[]` (e.g. context leftovers) with domain types from `types/index.ts`.

---

### 3. Design System Compliance — 6/10
**Verification:**
- Raw `#RRGGBB` outside `design-system` / tests: **0**  
- `style={{` in `*.tsx`: **88** matches  
- `export const` at start of line in `lib/design-system.ts`: **10** top-level token exports (large `DS_COLORS` object is one export)  
- `Test-Path "lib/theme"`: **True**  
- `accessibilityLabel` in `*.tsx`: **444** matches  

**Evidence:**
- Tokens: `lib/design-system.ts` L8 (`DS_COLORS`), L670 (`DS_TYPOGRAPHY`), etc.
- Config still uses raw hex: `app.json` L21 `backgroundColor`, L38, L64 — acceptable for Expo config but outside `design-system.ts`.

**Strengths:**
- **0** stray hex in app `*.ts`/`*.tsx` per gate (design-system is canonical for UI code).

**Issues:**
- **HIGH:** **`lib/theme`** duplicate naming vs `DS_*` — undermines “single source of truth.”
- **MEDIUM:** **88** inline `style={{ ... }}` — harder to audit and reuse tokens.

**Action items:**
- [ ] Complete theme → design-system migration; delete `lib/theme` when imports are zero.
- [ ] Move hot-path inline styles into `StyleSheet.create` or tokenized style helpers.

---

### 4. Component Quality — 6/10
**Verification:**
- `React.memo`: **51** matches in `*.tsx`  
- `Skeleton|isLoading|isFetching`: **123**  
- `ErrorBoundary|ErrorRetry`: **62**  
- `Alert.alert`: **0**  
- expo-image files: `<Image` lines without `contentFit|import|ImagePicker|...` heuristic: **12** (see issues)  

**Evidence:**
- Error handling: `components/ErrorBoundary.tsx` uses `logger` + `reportClientError`.
- Feed list: `components/LiveFeedSection.tsx` — memoized export + `FeedSeparator` (post-audit).

**Strengths:**
- No `Alert.alert`; loading/skeleton patterns appear across many files.

**Issues:**
- **MEDIUM:** **12** potential `<Image` lines missing `contentFit` in expo-image files (heuristic; excludes `ImageIcon` etc.) — verify and fix remaining.
- **MEDIUM:** Memo usage (**51**) vs **152** `tsx` files — many list children still unmemoized.

**Action items:**
- [ ] Audit the 12 expo-image hits; add `contentFit="cover"|"contain"`.
- [ ] `React.memo` for heavy list rows (`components/challenge/*`, discover rows) per performance prompt.

---

### 5. Navigation & Routing — 7/10
**Verification:**
- `app/**/*.tsx` excluding `api`, `_layout`: **31** files  
- `app/+not-found.tsx`: **exists** (`True`)  
- `app/(tabs)/*.tsx` excluding `_layout`: **6**  
- `app.json` `scheme|prefixes`: **2** matching lines (scheme + linking block)  
- `ITSAppUsesNonExemptEncryption`: **1** match in `app.json`  

**Evidence:**
- Deep linking: `app.json` L8–14 — `scheme: "griit"`, prefixes `griit://`, `https://griit.app/`, `https://griit.fit/`.
- iOS encryption: `app.json` L32 `ITSAppUsesNonExemptEncryption`: **false**.

**Strengths:**
- Expo Router structure; not-found route present; linking configured.

**Issues:**
- **LOW:** Stub surfaces remain (e.g. `app/(tabs)/teams.tsx` pushes discover — acceptable placeholder but not a full feature).

**Action items:**
- [ ] Document deep-link QA matrix (auth, invite, paywall) in manual checklist.

---

### 6. State Management — 5/10
**Verification:**
- `store/**/*.ts`: **3** files  
- `useQuery|useMutation|useQueryClient`: **77** matches  
- `contexts/*.tsx`: **5** files  
- `contexts/AppContext.tsx` lines: **720**  
- `staleTime|cacheTime|gcTime`: **36** matches  

**Evidence:**
- `contexts/AppContext.tsx` — large provider (profile, check-ins, tasks, premium, stubs for chat room APIs).

**Strengths:**
- TanStack Query used; Zustand store folder present.

**Issues:**
- **HIGH:** **720**-line `AppContext` — high merge conflict and re-render risk.
- **MEDIUM:** Cache tuning sparse relative to **77** hook usages — not every query documents `staleTime`/`gcTime`.

**Action items:**
- [ ] Split `AppContext` by domain (profile vs challenge vs feed) or move server state to React Query exclusively.
- [ ] Standardize React Query defaults in a shared `queryClient` factory.

---

### 7. Backend & API — 9/10
**Verification:**
- `protectedProcedure|publicProcedure`: **126**  
- `protectedProcedure`: **107**  
- `publicProcedure`: **24**  
- `.input(z.`: **58**  
- `TRPCError|throw new`: **205**  
- `rateLimit|rateLimiter` in `create-context.ts`: **2** matches  
- `checkRateLimit|checkRouteRateLimit` in `rate-limit.ts`: **2** matches  
- `logger.` under `backend/`: **81** matches  
- `console.` under `backend/` (excl. tests): **0**  
- `requireUuid|escapeLike|sanitize`: **24** matches  
- `Test-Path backend/lib/cache.ts`: **True**  

**Evidence:**
- Auth: `backend/trpc/create-context.ts` L29–36 — `Bearer` token + `sharedSupabase.auth.getUser(token)`.
- Rate limit: `create-context.ts` L69–79 — `checkRouteRateLimit` middleware.
- Logging: `backend/lib/logger.ts` (pino); `backend/lib/cache.ts` uses `logger.error`.

**Strengths:**
- Strong Zod + procedure coverage; structured logging; optional Redis cache; **0** backend `console.*` in gate.

**Issues:**
- **LOW:** Not every procedure may use `.input(z...)` — **58** inputs vs **126** procedures — review uncovered mutations.

**Action items:**
- [ ] Audit procedures without `.input` for public/mutation paths.

---

### 8. Security — 7/10
**Verification:**
- Hardcoded secret heuristic (`sk_|eyJ|supabase.*=`): **3** matches — **false positives** (`checks.supabase` in `backend/hono.ts` L31–33; test mock in `nudges.test.ts` L80).  
- `process.env.` in `backend/**/*.ts`: **64**  
- `auth.getUser|Bearer` in `create-context.ts`: **4** matches  
- `.or(` in `backend/**/*.ts`: **23**  
- `requireUuidForPostgrestOr`: **7**  
- `Test-Path backend/lib/content-moderation.ts`: **True**  

**Evidence:**
- JWT: `create-context.ts` L29–36 as above.

**Strengths:**
- No real secret keys found by heuristic; content moderation module exists; JWT verified server-side.

**Issues:**
- **HIGH:** **23** `.or(` vs **7** `requireUuidForPostgrestOr` — review remaining `.or` filters for injection / filter-string safety.

**Action items:**
- [ ] Grep each `.or(` call site; ensure user input never concatenated into filter strings unsanitized.

---

### 9. Performance — 5/10
**Verification:**
- `<FlatList`: **38**  
- `maxToRenderPerBatch`: **32** → **~84%** of FlatLists have the prop (not 100%)  
- `renderItem=\{.*=>`: **30** (inline arrow pattern)  
- `ItemSeparatorComponent=\{?\(\)`: **4**  
- `cachePolicy` (expo-image): **8**  
- `useCallback`: **210**  
- `staleTime`: **34** matches (repo-wide)  

**Evidence:**
- Embedded feed list: `components/LiveFeedSection.tsx` — `scrollEnabled={false}`, tuning props adjusted in recent pass.

**Strengths:**
- Substantial `useCallback` usage; some lists tuned.

**Issues:**
- **HIGH:** **30** inline `renderItem` closures — list re-render pressure on Home/Discover/Activity.
- **MEDIUM:** **6** FlatLists missing `maxToRenderPerBatch`; **12** expo-image `contentFit` gaps (category 4).

**Action items:**
- [ ] Extract `renderItem` to `useCallback` + stable row components on tab screens.
- [ ] Add `maxToRenderPerBatch` / `windowSize` / `initialNumToRender` to remaining FlatLists.

---

### 10. Testing — 5/10
**Verification:**
- `*.test.ts` / `*.test.tsx`: **12** files  
- Total lines in test files: **885**  
- `Test-Path vitest.config.ts`: **True**  
- `Test-Path tests/MANUAL_TEST_CHECKLIST.md`: **True**  

**Evidence:**
- Test lines **885** vs measured **~48,287** lines under `app|components|contexts|hooks|lib|store` → **~1.8%** test/code by line (rough).

**Strengths:**
- Vitest configured; manual checklist exists; backend route tests (e.g. nudges).

**Issues:**
- **HIGH:** Low automated coverage on critical UX paths (onboarding, check-in, paywall).

**Action items:**
- [ ] Add integration tests for `checkins.complete`, join challenge, and paywall purchase stub.

---

### 11. UX Polish — 8/10
**Verification:**
- `Haptics|impactAsync`: **91**  
- `KeyboardAvoidingView|keyboardDismiss`: **47**  
- `Animated.|useSharedValue|LayoutAnimation`: **168**  
- `useNetworkStatus|OfflineBanner`: **7**  
- `EmptyState|ListEmptyComponent`: **21**  
- `accessibilityLabel`: **444**  

**Strengths:**
- Strong haptic + animation usage; good a11y label count; empty states present.

**Issues:**
- **MEDIUM:** Offline affordances thin (**7** matches) — may need explicit offline banner on core flows.

**Action items:**
- [ ] Verify network loss on home feed and task complete; add `OfflineBanner` if missing.

---

### 12. Monetization & Paywall — 8/10
**Verification:**
- `Purchases|RevenueCat|useProStatus`: **90** matches  
- `Test-Path app/paywall.tsx`: **True**; **585** lines  
- `isPremium|isProUser|FREE_LIMITS`: **53**  
- `profiles.ts` lines matching `REVENUECAT|validateSubscription`: **13**  
- `lib/feature-flags.ts` lines: **44**  

**Strengths:**
- Dedicated paywall screen; RevenueCat references; backend profile validation hooks.

**Issues:**
- **MEDIUM:** Ensure free-tier limits (`FREE_LIMITS`) enforced consistently on **all** mutation entry points.

**Action items:**
- [ ] Add E2E or contract tests for “3 active challenges” and paywall edge cases.

---

### 13. Analytics & Observability — 8/10
**Verification:**
- `trackEvent|posthog|PostHog|useScreenTracker`: **87**  
- `Sentry|captureError|captureMessage`: **191**  
- Funnel strings `onboarding_completed|trial_started|subscription_cancelled|day_secured|respect_given`: **33**  
- `Test-Path hooks/useScreenTracker.ts`: **True**  
- `logger.` in `backend/`: **81**  

**Strengths:**
- Sentry + structured backend logs; screen tracker hook exists; funnel events present.

**Issues:**
- **LOW:** Validate PostHog env in production builds (not counted here).

**Action items:**
- [ ] Add dashboard checklist: DAU, funnel drop-off, error rate by `captureError` tags.

---

### 14. Infrastructure & DevOps — 8/10
**Verification:**
- `Test-Path eas.json`: **True**  
- `Test-Path lib/config.ts`: **True**  
- `Test-Path nixpacks.toml`: **True**  
- `supabase/migrations` entries: **60**  
- `scripts/` entries: **4**  

**Strengths:**
- EAS + Nixpacks + env config; healthy migration count.

**Issues:**
- **LOW:** Only **4** scripts — may need more automation (db reset, seed, smoke).

**Action items:**
- [ ] Add CI workflow file list to docs if not already (GitHub Actions not measured in gate).

---

### 15. Documentation — 8/10
**Verification:**
- `docs/**/*.md`: **12** files  
- `README.md`: **True**, **104** lines  
- `SETUP.md`: **True**, **256** lines  
- `Test-Path docs/ARCHITECTURE.md`: **True**  
- Lines matching `^\s*//` in `*.ts`/`*.tsx`: **300** (rough comment density)  

**Strengths:**
- README + SETUP + architecture doc present; additional docs under `docs/`.

**Issues:**
- **LOW:** Keep scorecard + runbooks updated per release.

**Action items:**
- [ ] Link this scorecard from `README.md` “Quality” or “Contributing” section.

---

## Critical Path to 9.0+
1. **Performance:** Remove inline `renderItem` closures on tab screens; tune all FlatLists; finish expo-image `contentFit` + `cachePolicy` on hot paths.  
2. **Architecture:** Delete `lib/theme` indirection; shrink `AppContext.tsx` below ~400 lines or split providers.  
3. **Security:** Audit all **23** `.or(` usages in `backend/`.  
4. **Testing:** Double test line coverage on check-in, join, paywall, and feed respect.  
5. **Design system:** Reduce **88** inline `style={{` hotspots in high-traffic screens.

---

## Metrics Snapshot

| Metric | Value |
|--------|-------|
| Total `.tsx` files (excl. node_modules) | 152 |
| Total `.ts` files (excl. node_modules) | 176 |
| Measured frontend lines (`app|components|contexts|hooks|lib|store`) | ~48,287 |
| Measured backend lines (`backend/**/*.ts`) | ~9,523 |
| App screen files (excl. `_layout`, `api`) | 31 |
| Tab route files (excl. `_layout`) | 6 |
| tRPC procedure markers (`protectedProcedure` + `publicProcedure`) | 126 |
| Test files (`*.test.ts`, `*.test.tsx`) | 12 |
| Test file lines (sum) | 885 |
| Test-to-code ratio (tests / frontend lines) | ~1.8% |
| Supabase migration files | 60 |
| `React.memo` matches (`*.tsx`) | 51 |
| FlatLists total / with `maxToRenderPerBatch` | 38 / 32 |
| `accessibilityLabel` matches (`*.tsx`) | 444 |
| Funnel-related event string matches | 33 |
| `npx tsc --noEmit` | **PASS** (exit 0, no `error TS` on last run) |

---

## TypeScript compile gate
```text
npx tsc --noEmit
```
**Result:** Pass (no output; exit code 0) at audit time.
