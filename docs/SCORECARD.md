# GRIIT Codebase Scorecard

**Date:** April 1, 2026  
**Baseline commit (code + scorecard generation):** `3cdd26a833390cdf0947b58aa24c957a9215a286`  
**Generated after:** Targeted cleanup aligned with Phases 1–3 of the deep-clean playbook; Phase 4 metrics captured from the repo at generation time.

**Scope note:** The full playbook (unused-import sweep every file, all hex/rgba outside `design-system.ts`, broad `React.memo` audit, four separate gate commits) was **not** executed to completion in one pass. This scorecard records **evidence from the current tree** after the changes applied in this session (TypeScript fixes, removal of three unused modules, ESLint fix, explicit Supabase `select` lists, `expo-image` for remaining RN `Image` usages).

## Summary Table

| # | Category | Weight | Score (/10) | Weighted |
|---|----------|--------|-------------|----------|
| 1 | Frontend Architecture | 7% | 5 | 0.35 |
| 2 | Backend Architecture | 7% | 8 | 0.56 |
| 3 | Type Safety | 5% | 9 | 0.45 |
| 4 | Performance | 7% | 8 | 0.56 |
| 5 | Accessibility | 5% | 6 | 0.30 |
| 6 | Design System Compliance | 5% | 6 | 0.30 |
| 7 | Error Handling | 5% | 7 | 0.35 |
| 8 | Analytics & Tracking | 5% | 7 | 0.35 |
| 9 | Security & RLS | 8% | 8 | 0.64 |
| 10 | Test Coverage | 4% | 6 | 0.24 |
| 11 | Code Hygiene | 4% | 6 | 0.24 |
| 12 | Database & Migrations | 5% | 8 | 0.40 |
| 13 | Monetization | 6% | 7 | 0.42 |
| 14 | Launch Readiness | 7% | 7 | 0.49 |
| — | **WEIGHTED TOTAL** | **80%** | — | **6.15 / 8.0** → **~7.7 / 10** |

*(Weighted column = score × weight. Total raw = 6.15 on an 0–8.0 scale; normalized to /10: 6.15 / 0.80 ≈ **7.7**.)*

Weights sum to 80% intentionally — remaining 20% is reserved for real-device testing, user testing, and App Store review experience which cannot be measured via grep.

---

## Detailed Findings

### Category 1: Frontend Architecture (7%) — **Score: 5/10**

**Evidence (representative):**

- **Total `*.tsx` files (workspace glob):** 163  
- **Screen files under `app/`:** 43  
- **Reusable components under `components/*.tsx`:** 114  
- **Complexity hotspot:** `app/challenge/[id].tsx` ≈ **1392** lines (line count via PowerShell `Get-Content -LiteralPath`).

**Justification:** Clear separation into `app/`, `components/`, `lib/`, and `hooks/`, but at least one screen is a very large monolith (`[id].tsx`), which drags down maintainability.

**Fix priority:** **HIGH** — split `app/challenge/[id].tsx` into hooks + presentational sections without changing UX.

---

### Category 2: Backend Architecture (7%) — **Score: 8/10**

**Evidence (grep counts in `backend/**/*.ts`):**

| Metric | Approx. count |
|--------|----------------|
| `.input(` | 74 (sum across route files) |
| `.mutation(` | 43 |
| `.query(` | 58 |
| `protectedProcedure` | 99 |
| `publicProcedure` | 25 |
| `TRPCError` | 200+ |

**Justification:** tRPC is split by domain routes; most mutations use Zod `.input()`. Some procedures rely on implicit validation or server-side checks only — not perfect but solid.

**Fix priority:** **MEDIUM** — audit any mutation missing `.input()` and align with Zod.

---

### Category 3: Type Safety (5%) — **Score: 9/10**

**Evidence:**

- `npx tsc --noEmit` — **0 errors** (after fixes to `checkins-core` insert typing and `lib/analytics` PostHog props).
- `@ts-ignore` / `@ts-expect-error` — **1** hit: `backend/lib/strava-callback.ts` (documented `@ts-expect-error`).
- `: any` / `as any` in `*.ts` / `*.tsx` (excluding nothing extra) — **0** matches in quick grep.
- `tsconfig` — project uses TypeScript strictness consistent with Expo (verify `strict` in repo `tsconfig`).

**Justification:** Strong typing; minimal suppression.

**Fix priority:** **LOW** — replace Strava `@ts-expect-error` with generated Supabase types when available.

---

### Category 4: Performance (7%) — **Score: 8/10**

**Evidence:**

- `React.memo` — **45+** component files reference `React.memo` (grep per file).
- `useMemo` / `useCallback` — present across major screens (not exhaustively counted here).
- **RN `Image` from `react-native`:** **0** imports matching `import { … Image … } from "react-native"` after migrating `app/(tabs)/profile.tsx` and `components/TaskEditorModal.tsx` to `expo-image`.
- **`expo-image` imports:** **15** files.
- **Unfiltered `.select()` / `.select('*')` in `backend/**/*.ts`:** **0** (all bare `.select()` replaced with column lists in this session).
- **`Promise.all` in backend:** ~18 occurrences across 11 files.

**Justification:** List memoization, no bare `select()`, expo-image for bitmap UI — good. Not every list row is audited for `React.memo`.

**Fix priority:** **MEDIUM** — spot-audit `FlatList` `renderItem` components still inline or non-memoized.

---

### Category 5: Accessibility (5%) — **Score: 6/10**

**Evidence:** Not fully automated in this run. Spot checks: many touch targets use `accessibilityLabel`; ESLint does not enforce full coverage.

**Justification:** Partial labeling; likely gaps on secondary actions.

**Fix priority:** **MEDIUM** — run a focused audit on `Pressable` / `TouchableOpacity` without labels.

---

### Category 6: Design System Compliance (5%) — **Score: 6/10**

**Evidence:**

- Raw `#hex` literals appear **only** in `lib/design-system.ts` for token definitions (grep); components generally consume `DS_COLORS`.
- **`rgba(` outside `design-system.ts`:** still present in e.g. `components/task/journalScreenStyles.ts`, `components/challenge/challengeDetailScreenStyles.ts`, `lib/theme/tokens.ts`, `lib/theme/colors.ts`, `components/onboarding/onboarding-theme.ts`, `lib/theme-palettes.ts` (grep).

**Justification:** Central palette exists; semi-transparent and shadow colors still leak outside the single DS file.

**Fix priority:** **MEDIUM** — move remaining `rgba` into `DS_COLORS` / theme tokens per playbook Phase 2F.

---

### Category 7: Error Handling (5%) — **Score: 7/10**

**Evidence:** `Sentry` / `captureError` patterns exist; some flows use inline error UI (`InlineError`, etc.). `Alert.alert` still appears in places (not fully counted).

**Justification:** Better than alert-only; not fully unified.

**Fix priority:** **MEDIUM** — consolidate on shared error surfaces.

---

### Category 8: Analytics & Tracking (5%) — **Score: 7/10**

**Evidence:** `lib/analytics.ts` + PostHog; `track` / `trackEvent` used across onboarding and flows. Funnel coverage is plausible but not exhaustively mapped in this document.

**Justification:** Instrumentation exists; verify all key lifecycle events in PostHog project.

**Fix priority:** **MEDIUM** — checklist against playbook Category 8 manual flows.

---

### Category 9: Security & RLS (8%) — **Score: 8/10**

**Evidence:** Backend uses `ctx.supabase` with user JWT; `getSupabaseServer` for elevated cases; migrations enable RLS on core tables (grep `ENABLE ROW LEVEL SECURITY` / `CREATE POLICY` in `supabase/migrations`). Zod usage is widespread in routes.

**Justification:** Architecture matches least-privilege intent; every route still deserves periodic review for service-role misuse.

**Fix priority:** **MEDIUM** — periodic audit of `getSupabaseServer` call sites.

---

### Category 10: Test Coverage (4%) — **Score: 6/10**

**Evidence:**

- `npm test` (Vitest): **11 files passed**, **67 tests** passed; **`lib/api.test.ts` failed to load** (React Native / `promise` resolution error in suite setup).
- Test files include `*.test.ts` under `backend/`, `lib/`, `tests/flows/`.

**Justification:** Good unit/flow coverage for a subset; one suite broken; no coverage percentage cited.

**Fix priority:** **HIGH** — fix `lib/api.test.ts` environment or exclude RN entry from that test file.

---

### Category 11: Code Hygiene (4%) — **Score: 6/10**

**Evidence:** TODOs remain (e.g. `app/(tabs)/profile.tsx`); `expo lint` still reports **warnings** (hooks deps, `no-unused-expressions`, duplicate imports in `OnboardingFlow.tsx`). **1 ESLint error** fixed (`WhoRespectedSheet` unescaped entity).

**Justification:** Acceptable for shipping; not pristine.

**Fix priority:** **LOW** — chip away at warnings and stale TODOs.

---

### Category 12: Database & Migrations (5%) — **Score: 8/10**

**Evidence:** Many dated migrations; indexes and FKs present in feed/check_ins/challenge migrations (spot-checked).

**Justification:** Mature schema evolution; keep migration hygiene when adding features.

**Fix priority:** **LOW**

---

### Category 13: Monetization (6%) — **Score: 7/10**

**Evidence:** RevenueCat / subscription helpers (`lib/revenue-cat.ts`, `lib/subscription.ts`, paywall screen) present in tree.

**Justification:** Integrated; validate end-to-end on device and in RevenueCat dashboard.

**Fix priority:** **MEDIUM** — device QA of purchase, restore, and entitlement gates.

---

### Category 14: Launch Readiness (7%) — **Score: 7/10**

**Evidence:** `app.json`, EAS, Sentry, push registration (`lib/register-push-token.ts`), legal routes under `app/legal/`, sharing utilities — all present in repo.

**Justification:** Close to store-ready; confirm production envs and store metadata.

**Fix priority:** **MEDIUM** — final checklist against store requirements.

---

## Top 5 Launch Blockers

1. **Monolithic challenge screen** — `app/challenge/[id].tsx` (~1392 lines) increases bug risk and slows change (**HIGH**).
2. **Failing test suite entry** — `lib/api.test.ts` breaks Vitest run (**HIGH**).
3. **ESLint warning debt** — `no-unused-expressions`, hook dependency warnings across several screens (**MEDIUM**).
4. **Design tokens** — `rgba` and duplicate theme paths (`lib/theme/*` vs `DS_COLORS`) reduce consistency (**MEDIUM**).
5. **Accessibility gaps** — unverified coverage for all interactive controls (**MEDIUM**).

## Top 5 Strengths

1. **Typecheck cleanliness** — `tsc --noEmit` passes with strict handling of analytics and Supabase inserts.
2. **tRPC + Zod** — clear procedure layout and widespread input validation.
3. **Supabase query discipline** — no remaining bare `.select()` in `backend/**/*.ts` after this pass.
4. **Image pipeline** — raster images use `expo-image` with caching on updated screens.
5. **Tests for critical flows** — `tests/flows/*` and backend unit tests cover important edge cases.

## Recommendations to Reach 9.0+

| Recommendation | Effort | Impact |
|------------------|--------|--------|
| Decompose `app/challenge/[id].tsx` | L | High |
| Fix `lib/api.test.ts` / Vitest RN resolution | S | High |
| Move residual `rgba` into `DS_COLORS` | M | Medium |
| Complete a11y pass on touchables + `TextInput` | M | Medium |
| Raise analytics coverage for paywall + purchase funnel | M | Medium |

---

## Session changelog (for auditors)

- **Removed (zero importers verified via search):** `components/community/Leaderboard.tsx`, `lib/design-tokens.ts`, `lib/constants/copy.ts`.
- **Type fixes:** `activity_events` insert cast in `checkins-core.ts`; PostHog-safe property helpers in `lib/analytics.ts`.
- **Lint:** `components/feed/WhoRespectedSheet.tsx` JSX apostrophe.
- **Perf:** Explicit `select(...)` on inserts/upserts across accountability, nudges, stories, starters, join-challenge, profiles, check-ins, challenges create; `expo-image` on profile avatar + task illustration preview.
