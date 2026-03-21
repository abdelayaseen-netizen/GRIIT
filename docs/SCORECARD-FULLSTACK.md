# GRIIT Full-Stack Scorecard

**Date:** March 21, 2026  
**Commit:** `4bc58b0` (docs add; codebase audited at parent `e3a5bbd`)

## Summary

| # | Category | Weight | Score | Weighted |
|---|----------|--------|-------|----------|
| 1A | Design System Compliance | 5% | 20/100 | 1.00 |
| 1B | GRIIT Spelling | 3% | 65/100 | 1.95 |
| 1C | Navigation & Screen Flow | 7% | 76/100 | 5.32 |
| 1D | Component Quality | 5% | 40/100 | 2.00 |
| 1E | Accessibility | 5% | 38/100 | 1.90 |
| 1F | Empty States & Error Handling | 5% | 38/100 | 1.90 |
| 1G | Mock Data Removal | 2% | 98/100 | 1.96 |
| 2A | API Route Coverage | 5% | 70/100 | 3.50 |
| 2B | Input Validation & Security | 5% | 78/100 | 3.90 |
| 2C | Error Handling & Logging | 5% | 82/100 | 4.10 |
| 2D | Database Schema & Migrations | 5% | 80/100 | 4.00 |
| 2E | Performance | 5% | 74/100 | 3.70 |
| 3A | Auth Flow Integrity | 8% | 70/100 | 5.60 |
| 3B | RLS & Data Isolation | 7% | 78/100 | 5.46 |
| 4A | TypeScript Strictness | 4% | 90/100 | 3.60 |
| 4B | Code Organisation | 3% | 86/100 | 2.58 |
| 4C | Documentation | 3% | 72/100 | 2.16 |
| 5A | Monetisation | 6% | 84/100 | 5.04 |
| 5B | Analytics & Tracking | 4% | 68/100 | 2.72 |
| 5C | App Store Readiness | 4% | 88/100 | 3.52 |
| 5D | Viral & Growth Mechanics | 4% | 78/100 | 3.12 |
| — | **OVERALL** | **100%** | — | **69/100** |

---

## Findings by Category

### 1A. Design System Compliance — 20/100

**Evidence (raw hex outside `lib/design-system.ts`; workspace ripgrep `#hex` in `*.ts`/`*.tsx`):**

Per-file match counts included (non-exhaustive): `app/(tabs)/activity.tsx` (8), `components/community/LiveActivity.tsx` (14), `components/community/Leaderboard.tsx` (26), `components/profile/RankProgress.tsx` (12), `components/profile/ProfileHeader.tsx` (21), `app/(tabs)/index.tsx` (16), `components/home/GoalCard.tsx` (22), `components/home/WeekStrip.tsx` (19), `lib/design-system.ts` (canonical tokens), plus `styles/discover-styles.ts`, `constants/onboarding-theme.ts`, `lib/theme-palettes.ts`, `src/theme/*`, etc.

Example lines:

```80:88:app/(tabs)/activity.tsx
        <Users size={16} color="#E8593C" />
// ...
      <ChevronRight size={14} color="#CCC" />
```

**Issues:**

- Dozens of raw hex values across home, profile, community, and tab screens instead of `DS_COLORS` / tokens from `lib/design-system.ts`.
- Duplicate palette (`#E8593C` vs documented accent `#E8845F` in `DS_COLORS`) fragments the visual system.

**Fix effort:** L (mechanical pass + token alignment).

---

### 1B. GRIIT Spelling — 65/100

**Evidence:**

```1:4:README.md
# GRIT — Challenge Tracker

A standalone **iOS app** (and Android/web) for tracking daily challenges, streaks, and task completion.
```

```16:16:lib/config.ts
const PLAY_STORE_PACKAGE = ... || "app.grit.challenge_tracker";
```

```194:194:app/(tabs)/activity.tsx
        <FriendStreakCard username={(currentUser?.name ?? "grit-user").replace(/\s+/g, ".").toLowerCase()} />
```

**Issues:**

- README title uses **GRIT** not **GRIIT** (user-facing doc).
- Fallback username `grit-user` uses old spelling; bundle ids intentionally use `grit` for store continuity — document distinction.

**Fix effort:** S.

---

### 1C. Navigation & Screen Flow — 76/100

**Evidence (auth / onboarding / challenge guard):**

```167:176:app/_layout.tsx
    if (user && !hasProfile && !onCreateProfile && !inOnboarding) {
      router.replace(ROUTES.CREATE_PROFILE as never);
      return;
    }

    // Only redirect TO tabs when not already in tabs — don't redirect when viewing challenge detail (or we'd dump user to Home)
    if (user && hasProfile && onboardingCompleted === false && !inOnboarding && !inTabs && !inChallenge) {
```

- **Cold start / session:** `AuthContext` uses `getSession` + `onAuthStateChange` (`contexts/AuthContext.tsx` lines 28–47).
- **Challenge detail vs Home:** `inChallenge` prevents redirect that would drop users from detail (`app/_layout.tsx`).
- **Deep linking:** `app.json` defines `scheme` `griit` and `linking.prefixes` (`griit://`, `https://griit.app/`).
- **Logout:** `router.replace(ROUTES.AUTH)` — sign-in stack, not `welcome` (`app/(tabs)/profile.tsx` ~100–103, `app/settings.tsx` ~512–515).

**Issues:**

- Logout lands on **`/auth`**, not Welcome; acceptable product choice but differs from a strict “back to Welcome” checklist.
- End-to-end flows not executed in a device session in this audit (static review only).

**Fix effort:** M (QA pass + copy/route tweaks if product wants Welcome).

---

### 1D. Component Quality — 40/100

**Evidence:**

| Check | Result |
|--------|--------|
| `style={{` in `*.tsx` | 40 files with matches (e.g. `app/_layout.tsx`, `app/settings.tsx`, `components/SkeletonLoader.tsx`, …) |
| `: any` / `as any` | No matches in app/lib/components (strict codebase) |
| `console.log` | `app/(tabs)/create.tsx` (`__DEV__`), `lib/revenue-cat.ts` (`__DEV__`) |
| TODO/FIXME | Matches in `NotificationScreen.tsx`, `create.tsx`, `join-team.tsx`, `teams.tsx` |
| Props interfaces | Many `components/*` files use inline types or omit dedicated `*Props` interfaces |

**Issues:**

- Widespread inline `style={{ ... }}` instead of `StyleSheet.create` / shared styles.
- Residual TODOs in shipping paths.

**Fix effort:** M.

---

### 1E. Accessibility — 38/100

**Evidence:**

- `accessibilityRole` appears in many files (`app/settings.tsx`, `app/welcome.tsx`, `app/challenge/[id].tsx`, …) — **~50+ files** with at least one usage (workspace count).
- Large surface of `TouchableOpacity` / `Pressable` without co-located `accessibilityLabel` on every control (pattern grep for `Pressable`/`TouchableOpacity` returns **100+ files**; many lines lack labels).

**Issues:**

- Interactive density exceeds labeled coverage; images and inputs need systematic `accessibilityLabel` / `accessibilityHint` pass.

**Fix effort:** L.

---

### 1F. Empty States & Error Handling — 38/100

**Evidence:**

- `Alert.alert` appears across **many** files; per-file counts include high usage in `app/task/run.tsx` (15), `app/task/timer.tsx` (12), `app/(tabs)/create.tsx` (11), `app/task/photo.tsx` (10), `app/task/journal.tsx` (10), `app/task/complete.tsx` (10), `app/challenge/[id].tsx` (9), etc. (**100+ total occurrences** when summed).
- Loading patterns: `isLoading` / `ActivityIndicator` / skeletons used in multiple screens (e.g. `app/_layout.tsx` loading gate, query hooks).

**Issues:**

- Heavy reliance on **native alerts** for errors and confirmations vs inline / banner patterns.
- Not all flows verified for empty-state components vs blank screens.

**Fix effort:** L.

---

### 1G. Mock/Fake Data Removal — 98/100

**Evidence:**

```53:53:mocks/starter-challenges.ts
 * The STARTER_CHALLENGES array was removed; use scripts/seed-challenges.sql for DB data.
```

- No `hasan_k`, `pravatar`, or `STARTER_CHALLENGES` arrays found in production UI code.
- `localhost` / `127.0.0.1` appear in **tests** and `backend/trpc/create-test-caller.ts`, not as production API URLs.

**Issues:**

- `mocks/` folder still exists (documentation-only); keep out of bundles.

**Fix effort:** S.

---

### 2A. API Route Coverage — 70/100

**Evidence:**

- Procedures located via `\.query(` / `\.mutation(` under `backend/trpc/routes/*.ts` (e.g. `challenges.ts`, `checkins.ts`, `profiles.ts`, …).
- Router aggregation: `backend/trpc/app-router.ts` mounts `auth`, `user`, `profiles`, `challenges`, `checkins`, `stories`, `starters`, `streaks`, `leaderboard`, `respects`, `nudges`, `notifications`, `accountability`, `meta`, `feed`, `achievements`, `integrations`, `sharedGoal`, `referrals`, `teams`.

**Summary table (pattern, not every leaf procedure):**

| Area | Typical validation | Auth | Notes |
|------|-------------------|------|--------|
| `meta.version` | N/A (no input) | public | `backend/trpc/routes/meta.ts` |
| `challenges.*` public list/get | zod on inputs where defined | mixed public/protected | `challenges.ts` |
| `achievements.getForUser` | none | protected | read-only |
| Most mutations | `.input(z.object(...))` in routers that import zod | `protectedProcedure` | e.g. `checkins.ts`, `profiles.ts` |

**Issues:**

- Large surface area; not every procedure audited line-by-line in this pass; some read-only endpoints rely on RLS + Supabase filters instead of zod where no input.

**Fix effort:** M (procedure inventory script + zod pass).

---

### 2B. Input Validation & Security — 78/100

**Evidence:**

- `protectedProcedure` enforces `ctx.userId` (`backend/trpc/create-context.ts` lines 116–125).
- Zod `.input` usage across routes (grep `.input(` in `backend/trpc/routes` — multiple files).
- Secrets: server uses `process.env` for Supabase (`create-context.ts` lines 9–10); no `sk_` literals found in a quick scan of app code.

**Issues:**

- `publicProcedure` exposure for discovery/meta must stay rate-limited (middleware in `create-context.ts`); ongoing review for any public mutation.

**Fix effort:** M.

---

### 2C. Error Handling & Logging — 82/100

**Evidence:**

- Structured logging + `TRPCError` path in middleware (`backend/trpc/create-context.ts` lines 69–110, `reportError` on failure).
- `backend/lib/logger.ts` consumed by tRPC layer.

**Issues:**

- Some silent `catch` blocks remain on the client (e.g. profile check comment in `app/_layout.tsx` ~107–108).

**Fix effort:** S.

---

### 2D. Database Schema & Migrations — 80/100

**Evidence:**

- **40** SQL migrations under `supabase/migrations/`.
- `active_challenges.end_at` addressed in `supabase/migrations/20250616000000_active_challenges_end_at.sql` (comment references PostgREST schema cache).
- RLS / policies: multiple files contain `CREATE POLICY` (e.g. `20260320073000_active_challenges_select_policy.sql`, `20250318000000_challenges_rls_public_read.sql`, …).
- `profiles` uses `user_id` in app queries (`app/_layout.tsx` lines 80–84).

**Issues:**

- Storage bucket `task-proofs` policies not re-verified against live Supabase in this audit (code references uploads in task flows).

**Fix effort:** M (DB review in Supabase dashboard).

---

### 2E. Performance — 74/100

**Evidence:**

- React Query defaults in `lib/query-client.ts` (`staleTime`, `gcTime`, retries).
- Per-screen `staleTime` overrides e.g. `app/(tabs)/index.tsx`, `app/challenge/[id].tsx`.
- No `prefetch` / `prefetchQuery` matches in app code.
- `expo-image` in dependencies (`package.json`); image usage varies by screen.

**Issues:**

- No list/detail prefetching.
- Image optimisation not uniformly applied (`expo-image` vs legacy `Image` may coexist).

**Fix effort:** M.

---

### 3A. Auth Flow Integrity — 70/100

**Evidence:**

- Session: `getSession` + `onAuthStateChange` — `contexts/AuthContext.tsx`.
- Logout: `supabase.auth.signOut()` + `clearOnboardingStorage()` — `app/(tabs)/profile.tsx` lines 99–102; `app/settings.tsx` 511–514.
- **No** `queryClient.clear()` / `removeQueries` on sign-out (grep found **no** matches).

**Issues:**

- React Query cache may retain prior user data until remount/refetch — privacy/stale UI risk.
- Guest mode + onboarding redirect logic is complex (`app/_layout.tsx`); needs regression tests.

**Fix effort:** M (clear cache + tests).

---

### 3B. RLS & Data Isolation — 78/100

**Evidence:**

- Numerous `CREATE POLICY` statements across migrations; `auth.uid()` usage in policy SQL (e.g. `20260320073000_active_challenges_select_policy.sql`).
- `ENABLE ROW LEVEL SECURITY` on `active_challenges` in recent migrations.

**Issues:**

- Full matrix “every table / every operation” not re-derived here; see `docs/RLS-AUDIT.md` / `docs/RLS-SECURITY-VERIFICATION.md` for historical audits.

**Fix effort:** M.

---

### 4A. TypeScript Strictness — 90/100

**Evidence:**

```3:7:tsconfig.json
  "compilerOptions": {
    "baseUrl": null,
    "strict": true,
    "noUncheckedIndexedAccess": true,
```

- `@ts-expect-error` / `@ts-ignore`: **1** file hit (`backend/lib/strava-callback.ts`).
- `any` escapes: effectively none in application TS/TSX from grep.

**Issues:**

- Single suppression in Strava callback — review for narrowing instead of suppression.

**Fix effort:** S.

---

### 4B. Code Organisation — 86/100

**Evidence:**

- Clear folders: `app/`, `components/`, `lib/`, `hooks/`, `store/`, `backend/trpc/`.
- Route constants: `lib/routes.ts`, tRPC paths `lib/trpc-paths.ts`.
- `.env.example` present at repo root.

**Issues:**

- Parallel theming: `constants/`, `src/theme/`, `lib/design-system.ts` — some overlap.

**Fix effort:** S.

---

### 4C. Documentation — 72/100

**Evidence:**

- `README.md` has prerequisites, install, Supabase, env, `npm start`.
- Large `docs/` corpus (architecture, RLS, scorecards, checklists).
- JSDoc: selective; not all complex modules documented.

**Issues:**

- README product name spelling vs GRIIT branding (`1B`).
- Architecture is fragmented across many markdown reports.

**Fix effort:** M (single ARCHITECTURE.md pointer).

---

### 5A. Monetisation — 84/100

**Evidence:**

- `react-native-purchases`, `react-native-purchases-ui` in `package.json`.
- `lib/subscription.ts`, `lib/revenue-cat.ts`, `configureRevenueCat` in `app/_layout.tsx` (effect on user id).
- Screens: `app/paywall.tsx`, `app/pricing.tsx`, `components/PremiumPaywallModal.tsx`.
- Backend: profile subscription fields / sync patterns in `backend/trpc/routes/profiles.ts` (subscription-related mutations).

**Issues:**

- RevenueCat requires valid keys in env for production; `__DEV__` logging when misconfigured (`lib/revenue-cat.ts`).

**Fix effort:** S (env + store config).

---

### 5B. Analytics & Tracking — 68/100

**Evidence:**

- `posthog-js` + `lib/posthog.ts`, `lib/analytics.ts` — event forwarding when configured.
- Crash reporting: `lib/client-error-reporting.ts` documents optional Sentry hook — **not** a full Sentry SDK integration in grep results.

**Issues:**

- No evidence in this audit that **every** key funnel event fires in production builds.
- Crash reporting is optional / placeholder-level without `@sentry/react-native` wired.

**Fix effort:** M.

---

### 5C. App Store Readiness — 88/100

**Evidence:**

- `app.json`: name **GRIIT**, slug, version, icon, splash, iOS bundle id, Android package, permissions, `userInterfaceStyle`, plugins.
- `eas.json`: `build.development`, `preview`, `production` profiles.
- Assets: `assets/images/icon.png`, `splash-icon.png`, `adaptive-icon.png`.

**Issues:**

- `ios.buildNumber` / Android `versionCode` often set in CI or `eas.json` — confirm for release pipeline.

**Fix effort:** S.

---

### 5D. Viral & Growth Mechanics — 78/100

**Evidence:**

- Share: `Share.share` in profile (`app/(tabs)/profile.tsx`), `lib/share.ts`, `expo-sharing` in dependencies.
- Invites: `app/invite/[code].tsx`, referral routes backend `referrals.ts`.
- Push: `expo-notifications`, `lib/notifications.ts`, `lib/register-push-token.ts`, onboarding `NotificationScreen.tsx`.

**Issues:**

- Growth features need product QA (invite conversion, notification permission funnels).

**Fix effort:** M.

---

## Top 10 Priority Actions

| # | Action | Category | Impact | Effort | Business Value |
|---|--------|----------|--------|--------|----------------|
| 1 | Replace raw hex with `DS_*` tokens and one accent palette across home/profile/community | 1A | High | L | Brand trust + dev velocity |
| 2 | On `signOut`, clear React Query cache (`queryClient.clear`) and reset analytics | 3A, 5B | High | S | Privacy + correct post-logout UI |
| 3 | Reduce `Alert.alert` for errors; use inline/banner patterns on high-traffic flows (tasks, create, challenge) | 1F | High | L | UX quality + retention |
| 4 | Accessibility sweep: labels on primary tabs, task flows, challenge CTAs | 1E | High | L | Store compliance + inclusion |
| 5 | Prefetch challenge detail on Discover card press (`queryClient.prefetchQuery` + trpc) | 2E, 1C | Medium | M | Perceived performance |
| 6 | Align README + public copy to **GRIIT**; document bundle id `grit` vs brand | 1B, 4C | Medium | S | Brand clarity |
| 7 | Wire or document Sentry (or equivalent) for production crash reporting | 5B | High | M | Operational visibility |
| 8 | Audit public tRPC procedures + RLS assumptions with a scripted checklist | 2A, 3B | Medium | M | Security posture |
| 9 | Consolidate theme entry points (`design-system` vs `constants` vs `src/theme`) | 4B, 1A | Medium | M | Maintainability |
| 10 | Verify storage policies for proof uploads (`task-proofs`) in live Supabase | 2D | High | S | Core feature reliability |

---

## Recommended Sprint Plan

### Sprint 1 (Week 1–2): Trust & polish

- [ ] Design-system token pass on highest-traffic screens (`app/(tabs)/index.tsx`, `app/challenge/[id].tsx`, profile/community).
- [ ] Sign-out: clear React Query + analytics reset.
- [ ] Fix README / marketing spelling to GRIIT where intended.

### Sprint 2 (Week 3–4): UX hardening

- [ ] Replace top 20 `Alert.alert` calls with in-screen error states.
- [ ] Accessibility labels on Discover → Challenge → Task paths.
- [ ] Prefetch challenge detail from Discover.

### Sprint 3 (Week 5–6): Scale & observability

- [ ] Production crash reporting (Sentry or similar) + PostHog event audit.
- [ ] SQL/RLS + storage policy review in Supabase for `active_challenges`, proofs, and public challenge reads.
- [ ] Theme consolidation doc + deprecation of duplicate color constants.
