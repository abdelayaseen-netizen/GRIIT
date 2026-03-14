# GRIIT Comprehensive Scorecard (Post-Monetization)

**DO NOT STOP until every category is scored, every table is filled in, and the Top 5 improvements are listed. Read every actual file before scoring — do not guess from file names.**

---

## Context

GRIIT is a React Native (Expo) + expo-router discipline/challenge app. "Duolingo for discipline meets Strava for self-improvement." Target: 1,000 paying subscribers at ~$10/month ($10K MRR).

**Recent changes since last scorecard (82.5/130, 63%):**
- Full monetization infrastructure added: RevenueCat SDK, pricing screen with dynamic offerings, `useSubscription` hook, `PremiumBadge`, `PremiumFeature` wrapper
- 4 paywall gates enforced: 3rd active challenge, streak freeze, Last Stand (server-side), create challenge
- Profile subscription section, Settings restore purchases, Home upgrade prompt
- Edge case handling: no internet, pending, double-tap, already-premium
- Deep cleanup: removed mock data, consolidated theme system, removed debug logs
- Navigation fix: AuthRedirector no longer traps users on Home tab

**Stack:** React Native (Expo), expo-router, tRPC, Hono backend, Supabase/Postgres, RevenueCat, react-native-purchases

---

## Instructions

For EVERY category below:
1. **Read the actual code** — open the key files, don't assume
2. **Score from 0–10** (0.5 increments allowed)
3. **Write 3–5 sentences** explaining what exists, what works, what's missing, what's broken
4. **List specific files** relevant to the score
5. **List 2–3 concrete next steps** to raise the score

Be HONEST. If something is half-built, score it as half-built. If something is a shell with no real logic, call it out.

---

### CATEGORY 1: Authentication & User Management (0–10)

Evaluate: Sign up/in (email, social), password reset, email verification, session persistence, guest browsing, profile creation/editing, account deletion, auth guards, error handling for auth failures.

**Score:** 7/10

**What exists:** Email sign up and sign in via Supabase in `app/auth/signup.tsx` and `app/auth/login.tsx`; password reset in `app/auth/forgot-password.tsx`. Session persistence via Supabase `getSession` and `onAuthStateChange` in `contexts/AuthContext.tsx`. Guest browsing (isGuest when no user). Profile creation via onboarding (username, display name) and `profiles.create`; edit profile in `app/edit-profile.tsx`. Auth guards in root `app/_layout.tsx` (AuthRedirector) with profile check and onboarding redirect. UsernameScreen resolves userId from Supabase session only.

**What works:** Sign up, sign in, forgot password, session restore, guest mode, profile create/edit, redirects to onboarding or tabs based on profile/onboarding state.

**What's missing:** Social auth (Apple/Google) not implemented. Email verification flow when Supabase "Confirm email" is enabled. Account deletion flow. No explicit "session expired" UI beyond redirect.

**What's broken:** Nothing critical.

**Key files:** `contexts/AuthContext.tsx`, `app/auth/signup.tsx`, `app/auth/login.tsx`, `app/auth/forgot-password.tsx`, `app/_layout.tsx` (AuthRedirector), `components/onboarding/screens/SignUpScreen.tsx`, `components/onboarding/screens/UsernameScreen.tsx`, `app/edit-profile.tsx`.

**Next steps:** Add Apple/Google OAuth; add account deletion (Supabase + profile); document email verification for production.

---

### CATEGORY 2: Core Challenge System (0–10)

Evaluate: Challenge data model, listing/browsing (Discover), detail view, join/leave, progress tracking, proof/verification (photo, timer, journal, GPS), challenge types, custom creation, categories/filtering/search, featured challenges, completion/graduation.

**Score:** 7.5/10

**What exists:** Full challenge model in backend (`backend/trpc/routes/challenges.ts`): list, getFeatured, getById, join, leave, create, listMyActive, getStarterPack. Discover tab uses getFeatured with category and search; challenge detail at `app/challenge/[id].tsx` with join/leave, commitment modal. Checkins and secure day in `backend/trpc/routes/checkins.ts`. Task verification: photo, timer, journal, run, manual, checkin (location behind feature flag). Create flow at `app/(tabs)/create.tsx` (solo/team/shared goal, tasks, duration). Categories and filtering on Discover.

**What works:** Browse, join, leave, complete tasks, secure day, create custom challenges, starter pack and featured challenges. Verification types wired; team and shared-goal challenges supported in backend.

**What's missing:** REST `/api/challenges` for onboarding ChallengePreview is optional (uses getApiBaseUrl + path). Some edge cases in task verification (e.g. location check-in disabled). Completion/graduation UX could be more prominent.

**What's broken:** Nothing critical.

**Key files:** `backend/trpc/routes/challenges.ts`, `backend/trpc/routes/checkins.ts`, `app/(tabs)/discover.tsx`, `app/challenge/[id].tsx`, `app/(tabs)/create.tsx`, `lib/create-challenge-helpers.ts`, `app/task/complete.tsx`, `app/task/photo.tsx`, `app/task/timer.tsx`, `app/task/journal.tsx`.

**Next steps:** Add GET `/api/challenges` on backend if onboarding must hit REST; enable and polish location check-in; surface completion/graduation more clearly.

---

### CATEGORY 3: Streaks, Scoring & Gamification (0–10)

Evaluate: Streak tracking, display, recovery/grace period, score/XP system, rank/tier progression, badges/achievements, daily/weekly goals, "Today is not secured" system, streak notifications, milestones, discipline score algorithm.

**Score:** 7/10

**What exists:** Streak logic in backend (profiles.getStats, checkins.secureDay, streaks table, day_secures). Tier progression in `backend/lib/progression.ts` (getTierForDays, getPointsToNextTier). `lib/home-derived.ts` derives showRecoveryBanner, canUseFreeze, lastStandsAvailable, comeback/restart mode from stats. Streak freeze (1/month free, premium for more) and Last Stand (earn/use, backend and client). Milestones and celebrations in `lib/constants/milestones.ts` and home. Achievements in `backend/lib/achievements.ts` and profile. Discipline score = total days secured; displayed on profile and home.

**What works:** Active streak, longest streak, tier name, points to next tier, recovery banner, streak freeze and Last Stand (with premium gates). Milestone modals; achievement definitions and unlock.

**What's missing:** Documented discipline score formula. Deeper gamification (e.g. levels, weekly goals). Streak-at-risk notification content could be richer.

**What's broken:** Nothing critical.

**Key files:** `backend/trpc/routes/profiles.ts` (getStats), `backend/trpc/routes/checkins.ts` (secureDay), `backend/trpc/routes/streaks.ts`, `lib/home-derived.ts`, `lib/retention-config.ts`, `backend/lib/progression.ts`, `backend/lib/achievements.ts`, `lib/constants/milestones.ts`, `app/(tabs)/index.tsx`, `components/home/DailyStatus.tsx`.

**Next steps:** Document discipline score algorithm; add weekly goals or levels; enrich streak-at-risk messaging.

---

### CATEGORY 4: Social & Community (0–10)

Evaluate: Leaderboards (global, per-challenge, friends), friends/follow, activity feed, challenge comments/reactions, sharing externally, community challenges, public profiles, participant counts, DMs, team challenges, accountability partners.

**Score:** 5.5/10

**What exists:** Leaderboard in `backend/trpc/routes/leaderboard.ts` (getWeekly by day_secures); used on home. Activity feed in `backend/trpc/routes/feed.ts` (list); Movement tab shows feed. Public profile at `app/profile/[username].tsx`. Accountability partners (backend accountability routes, invite flow). Share in `lib/share.ts` (challenge, invite, profile); deep links in `lib/deep-links.ts`. Referral/invite at `app/invite/[code].tsx`. Participant counts on challenges. Team challenges and shared goals in backend and create flow.

**What works:** Weekly leaderboard, activity feed, public profiles, accountability invite, share sheet and deep links, team/shared-goal creation.

**What's missing:** Full friends list UI; rich activity feed (comments/reactions); share to Instagram/social; per-challenge leaderboard prominence. DMs not present.

**What's broken:** Nothing critical.

**Key files:** `backend/trpc/routes/leaderboard.ts`, `backend/trpc/routes/feed.ts`, `backend/trpc/routes/accountability.ts`, `app/(tabs)/activity.tsx`, `app/profile/[username].tsx`, `lib/share.ts`, `lib/deep-links.ts`, `app/invite/[code].tsx`, `components/SuggestedFollows.tsx`.

**Next steps:** Add share to social (e.g. Instagram); improve feed and leaderboard prominence; add friends list or follow management.

---

### CATEGORY 5: UI/UX Design Quality (0–10)

Evaluate: Visual consistency, design system adherence, empty states, loading states (skeletons vs blank), error states, animations/transitions, typography hierarchy, icon consistency, dark mode, tablet support, pull-to-refresh, haptics, overall polish.

**Score:** 7/10

**What exists:** Design system in `lib/design-system.ts` and base palette in `constants/theme.ts` (cream/orange/green). DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY used across app. EmptyState component in `src/components/ui/EmptyState.tsx`. Loading: skeletons (HomeScreenSkeleton, ProfileSkeleton), ActivityIndicator. ErrorBoundary and inline error states. Pull-to-refresh on home, discover, profile. Haptics on key actions (expo-haptics). Lucide icons. Pricing screen and profile subscription block match design system.

**What works:** Consistent palette and spacing; empty and loading states on main screens; error boundaries; refresh and haptics.

**What's missing:** Dark mode not systematized (userInterfaceStyle: automatic only). Tablet/large-screen layouts not explicit. Some screens could have stronger empty/error copy.

**What's broken:** Nothing critical.

**Key files:** `lib/design-system.ts`, `constants/theme.ts`, `contexts/ThemeContext.tsx`, `components/ErrorBoundary.tsx`, `src/components/ui/EmptyState.tsx`, `components/SkeletonLoader.tsx`, `app/(tabs)/index.tsx`, `app/pricing.tsx`.

**Next steps:** Add dark theme tokens and toggle; audit empty/error copy; add responsive breakpoints if targeting tablet.

---

### CATEGORY 6: Navigation & Information Architecture (0–10)

Evaluate: Tab bar (all tabs work), stack navigation, deep linking, navigation guards, back button, modal presentations, route structure clarity, onboarding flow, settings navigation, header consistency.

**Score:** 8.5/10

**What exists:** Expo Router with (tabs) and stack; tab bar: Home, Discover, Create, Movement, Profile. AuthRedirector in `app/_layout.tsx` with profile and onboarding checks; redirect to tabs only when not already in tabs (fix prevents "stuck on Home"). Deep links (scheme griit://, prefixes in app.json). Onboarding flow (splash → goals → intensity → challenge preview → sign up → username → notification → health → ready). Settings from profile; back button and modals (commitment, freeze, pricing). ROUTES and SEGMENTS in `lib/routes.ts`; PRICING added for monetization.

**What works:** All tabs work; auth and onboarding redirects correct; no tab trap; modals and back behavior; deep link scheme configured.

**What's missing:** Deep link handling for specific challenge/invite URLs could be expanded; some header titles could be more consistent.

**What's broken:** Nothing critical.

**Key files:** `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `lib/routes.ts`, `app.json` (scheme, linking), onboarding screens under `components/onboarding/`.

**Next steps:** Document and test deep link routes for challenge/invite; standardize header titles.

---

### CATEGORY 7: Backend & API (0–10)

Evaluate: tRPC router structure, API coverage (real backend vs mocked), DB schema, data validation (Zod), error handling, auth middleware, rate limiting, pagination, file upload, real-time features, performance, migrations.

**Score:** 7.5/10

**What exists:** Hono + tRPC in `backend/`; create-context uses Supabase auth (getUser with token). Routers: profiles, challenges, checkins, streaks, leaderboard, feed, accountability, nudges, respects, integrations, notifications, referrals. Zod inputs on procedures. protectedProcedure and publicProcedure. Rate limiting: `backend/lib/rate-limit.ts` and checkRouteRateLimit in create-context. Pagination with cursor on list/getFeatured. File upload for proof (e.g. photo). Supabase migrations in `supabase/migrations/`; RLS on key tables.

**What works:** Full tRPC coverage for core flows; auth middleware; Zod validation; rate limit integration; migrations and RLS present.

**What's missing:** Rate limiting not applied to every sensitive route; REST endpoint for challenges optional; real-time (e.g. presence) not implemented. Migrations not fully summarized in one doc.

**What's broken:** Nothing critical.

**Key files:** `backend/hono.ts`, `backend/trpc/create-context.ts`, `backend/trpc/routes/*.ts`, `backend/lib/rate-limit.ts`, `supabase/migrations/`.

**Next steps:** Apply rate limiting to auth and high-risk routes; add REST challenges endpoint if needed; document migrations.

---

### CATEGORY 8: Monetization (0–10)

Evaluate: Subscription model defined, payment integration (RevenueCat), paywall screens, subscription tiers, free tier limitations enforced, trial period, subscription status checking, receipt validation, restore purchases, pricing display, revenue analytics.

**Score:** 7.5/10

**What exists:** Full RevenueCat integration in `lib/subscription.ts`: initializeRevenueCat, checkPremiumStatus, getOfferings, purchasePackage, restorePurchases, getCustomerInfo; syncSubscriptionToSupabase (profiles by user_id). AppContext: isPremium, refreshPremiumStatus, customerInfo listener. Full-screen pricing at `app/pricing.tsx` with dynamic offerings, monthly/annual, CTA, restore, legal copy, source param. useSubscription hook and PremiumFeature wrapper; PremiumBadge. Four gates: 3rd challenge (canJoinChallenge + requirePremium), streak freeze (requirePremium + PRO badge), Last Stand (backend getStats checks subscription; client upgrade CTA), create challenge (redirect + PRO on tab). Profile subscription block (free vs premium, manage subscription); Settings subscription row and restore. Home upgrade prompt (dismissible). Edge cases: no API key/Expo Go safe, no internet message, pending message, retry offerings, double-tap prevention, already-premium screen. .env.example has iOS and Android RevenueCat keys.

**What works:** End-to-end purchase and restore; status sync to Supabase; four enforced gates; pricing and profile/settings integration; restore and edge handling.

**What's missing:** Trial period not explicitly configured in prompt/flow. Server-side receipt validation (backend validateSubscription) exists but client-driven sync is primary. Revenue analytics (RevenueCat dashboard) not in-app. Free tier limits (e.g. 2 vs 3 challenges) could be tuned and communicated more (Discover shows "Free: 3 active challenges").

**What's broken:** Nothing critical. In Expo Go, Purchases is not loaded (by design); app treats user as free.

**Key files:** `lib/subscription.ts`, `lib/premium.ts`, `contexts/AppContext.tsx`, `app/pricing.tsx`, `hooks/useSubscription.ts`, `components/PremiumBadge.tsx`, `components/PremiumFeature.tsx`, `app/challenge/[id].tsx`, `app/(tabs)/index.tsx`, `backend/trpc/routes/profiles.ts` (getStats lastStandRequiresPremium), `app/(tabs)/create.tsx`, `app/(tabs)/profile.tsx`, `app/settings.tsx`, `docs/MONETIZATION-OUTPUT.md`.

**Next steps:** Add trial in RevenueCat and surface in pricing; add in-app revenue/cohort view or rely on RevenueCat dashboard; tune and communicate free limits (e.g. 2 challenges).

---

### CATEGORY 9: Growth & Retention (0–10)

Evaluate: Push notifications (setup, permission, types), onboarding quality, referral system, share functionality, App Store optimization prep, analytics integration, email collection, engagement loops, re-engagement, invite flow, social media integration.

**Score:** 5/10

**What exists:** Push: expo-notifications, registerPushTokenWithBackend, scheduleNextSecureReminder (and two-hours-left, streak-at-risk) in `lib/notifications.ts`; permission in onboarding (NotificationScreen). Onboarding: multi-step flow with goals, intensity, challenge preview, sign up, username, notification, health. Share: `lib/share.ts` (shareChallenge, inviteToChallenge, etc.); deep links. Analytics: `lib/analytics.ts` with track() and event names; no persisted provider wired. Referral: invite/[code], markJoinedChallenge. No email collection or re-engagement flow beyond push.

**What works:** Push token registration; secure-day and optional reminders; onboarding and share; analytics events fired.

**What's missing:** Server-side or persisted analytics provider (PostHog/Mixpanel). Email collection. Re-engagement for lapsed users. App Store optimization (keywords, screenshots) not in repo. Social share (e.g. Instagram) not implemented.

**What's broken:** Nothing critical.

**Key files:** `lib/notifications.ts`, `lib/register-push-token.ts`, `lib/analytics.ts`, `lib/share.ts`, `lib/deep-links.ts`, `components/onboarding/screens/NotificationScreen.tsx`, `app/invite/[code].tsx`.

**Next steps:** Connect analytics to PostHog/Mixpanel; add email capture; add lapsed-user flow and ASO prep.

---

### CATEGORY 10: Performance & Reliability (0–10)

Evaluate: App startup time, list rendering (FlatList), image optimization, memory leaks, crash handling (error boundaries), network caching/optimistic updates, bundle size, TypeScript strictness, testing.

**Score:** 6.5/10

**What exists:** ErrorBoundary in `components/ErrorBoundary.tsx` with retry; used in app layout and key screens. OfflineBanner. React Query (TanStack) for caching and staleTime. FlatList/ScrollView on discover and activity. TypeScript across app and backend. Vitest for backend and lib tests (e.g. api, formatTimeAgo, time-enforcement, trpc routes). No E2E for app; some `any` in backend tests and routes.

**What works:** Error boundaries catch render errors; offline banner; list rendering; tRPC + React Query reduce redundant requests.

**What's missing:** No app-level E2E tests; bundle size not audited; optimistic updates not everywhere (e.g. some mutations could be optimistic). Startup time not measured.

**What's broken:** Nothing critical.

**Key files:** `components/ErrorBoundary.tsx`, `components/OfflineBanner.tsx`, `app/(tabs)/discover.tsx`, `app/(tabs)/activity.tsx`, `lib/trpc.ts`, `lib/query-client.ts`, `vitest.config.ts`, `tests/`.

**Next steps:** Add critical-path E2E tests; reduce `any` in routes; add optimistic updates for key mutations; audit bundle size.

---

### CATEGORY 11: Code Quality & Architecture (0–10)

Evaluate: Folder structure, naming conventions, component modularity, state management, custom hooks, code duplication, error boundaries, ESLint/Prettier, git hygiene, README, documentation.

**Score:** 7/10

**What exists:** Clear structure: app/ (expo-router), components/, src/components/ui/, lib/, contexts/, backend/. Zustand for onboarding store; React Query; Auth, App, Theme, Api, AuthGate contexts. Reusable components (home/, profile/, ui). Custom hooks (useSubscription, useDebounce, useNetworkStatus, useCelebration). Design system and theme consolidation (BASE_COLORS in theme.ts). ESLint (expo lint). Docs: DEEP-CLEANUP-SCORECARD, MONETIZATION-OUTPUT, SCORECARD-POST-MONETIZATION.

**What works:** Naming consistent; contexts and hooks used; theme single source; monetization and cleanup documented.

**What's missing:** Some large files (e.g. index.tsx, create.tsx). README could include env and run instructions. Duplicate components/ and src/components/ may confuse new contributors.

**What's broken:** Nothing critical.

**Key files:** `store/onboardingStore.ts`, `contexts/`, `lib/design-system.ts`, `constants/theme.ts`, `hooks/useSubscription.ts`, `components/`, `src/components/ui/`, `docs/`.

**Next steps:** Split largest screens into subcomponents; update README with env and run steps; document folder convention.

---

### CATEGORY 12: Security (0–10)

Evaluate: API keys in env (not committed), Supabase RLS, input sanitization, SQL injection protection, auth token storage (SecureStore vs AsyncStorage), HTTPS, CORS, rate limiting on auth, data privacy/GDPR, sensitive data not logged.

**Score:** 7/10

**What exists:** API and Supabase keys in env; .env in .gitignore; .env.example without secrets. Supabase RLS on profiles, challenges, streak_freezes, last_stand_uses, etc. Parameterized queries via Supabase client (no raw SQL). tRPC auth middleware (Bearer token, getUser). Rate limiting in backend (getClientIp, checkRouteRateLimit). No sensitive data in console in production (__DEV__ guards). CORS configured on backend.

**What works:** No committed secrets; RLS and protected procedures; rate limit used in context; auth verification on API.

**What's missing:** Supabase default token storage (AsyncStorage); SecureStore would be stronger on device. Rate limiting not on every auth/sensitive route. Input sanitization and GDPR/data-deletion policy not fully documented.

**What's broken:** Nothing critical.

**Key files:** `lib/supabase.ts`, `backend/trpc/create-context.ts`, `backend/lib/rate-limit.ts`, `.gitignore`, `.env.example`, `supabase/migrations/` (RLS policies).

**Next steps:** Consider SecureStore for session; apply rate limiting to auth and sensitive routes; document CORS and data-deletion policy.

---

### CATEGORY 13: App Store Readiness (0–10)

Evaluate: App icon, splash screen, bundle ID, version management, privacy policy URL, terms of service URL, permission rationale strings, screenshots, store description, TestFlight/beta, EAS Build, OTA updates.

**Score:** 4/10

**What exists:** app.json: name GRIIT, version 1.0.0, icon and splash paths, bundleIdentifier (iOS), package (Android), scheme griit, linking prefixes. Assets referenced: icon.png, splash-icon.png, adaptive-icon, favicon. No expo-updates or EAS config in app.json; plugins include expo-router, expo-font, expo-web-browser.

**What works:** Unique identifiers; icon and splash configured; scheme and deep link base.

**What's missing:** Privacy policy and terms URLs not in app or app.json. Permission rationale strings (e.g. notifications) not clearly in config. Screenshots and store description not in repo. TestFlight/EAS Build and OTA not verified or documented.

**What's broken:** Nothing critical; store submission will require policy URLs and assets.

**Key files:** `app.json`, `package.json`, `assets/images/`.

**Next steps:** Add privacy and terms URLs (in app and config); add permission rationale; run EAS Build and configure OTA; draft store listing and screenshots.

---

## MASTER SCORECARD SUMMARY TABLE

| # | Category | Previous Score | New Score | Change | One-Line Summary |
|---|----------|----------------|-----------|--------|------------------|
| 1 | Authentication & User Management | 7 | 7 | — | Solid email auth and onboarding; missing social auth and account deletion |
| 2 | Core Challenge System | 7.5 | 7.5 | — | Strong challenge/checkin/verification; optional REST endpoint |
| 3 | Streaks, Scoring & Gamification | 7 | 7 | — | Streaks, tiers, milestones, freeze/Last Stand; score formula could be documented |
| 4 | Social & Community | 5.5 | 5.5 | — | Leaderboard, feed, accountability, share exist; depth and friends list missing |
| 5 | UI/UX Design Quality | 7 | 7 | — | Consistent design system; dark mode and responsive not formalized |
| 6 | Navigation & Information Architecture | 8 | 8.5 | +0.5 | Tab trap fix; deep links and headers can be expanded |
| 7 | Backend & API | 7.5 | 7.5 | — | Good tRPC and rate limit; migrations doc and coverage gaps |
| 8 | Monetization | 2 | 7.5 | +5.5 | RevenueCat, pricing, 4 gates, sync, restore; trial and analytics in-app missing |
| 9 | Growth & Retention | 5 | 5 | — | Push and analytics hooks; no provider or full retention flows |
| 10 | Performance & Reliability | 6.5 | 6.5 | — | Error boundaries and caching; E2E and bundle audit missing |
| 11 | Code Quality & Architecture | 7 | 7 | — | Clear structure and theme consolidation; some large files |
| 12 | Security | 7 | 7 | — | Env and RLS; token storage and rate limiting could improve |
| 13 | App Store Readiness | 4 | 4 | — | Identifiers and assets; policy links and store assets missing |
| | **PREVIOUS TOTAL** | **82.5/130** | | | |
| | **NEW TOTAL** | **89/130** | **+6.5** | | |
| | **PREVIOUS %** | **63%** | | | |
| | **NEW %** | **68%** | | | |

---

## BIGGEST IMPROVEMENTS SINCE LAST SCORECARD

List the 3 categories that improved the most and why.

| Category | Old → New | What Changed |
|----------|-----------|--------------|
| Monetization | 2 → 7.5 | Full RevenueCat integration, pricing screen, four enforced paywall gates, sync to Supabase, restore, profile/settings/home integration, edge case handling. |
| Navigation & IA | 8 → 8.5 | AuthRedirector fix so users are no longer stuck on Home when already in tabs; PRICING route and monetization flows integrated. |
| (Theme/cleanup) | — | No category score change; deep cleanup (theme consolidation, mock removal, debug log removal) improved consistency and maintainability. |

---

## TOP 5 HIGHEST IMPACT IMPROVEMENTS (Path to $10K MRR)

For each: What, Why it matters for users/revenue, Effort (Low/Medium/High), Which categories it improves, Estimated score gain.

| Priority | What | Why | Effort | Categories | Est. Gain |
|----------|------|-----|--------|------------|-----------|
| 1 | Add free trial (e.g. 7-day) in RevenueCat and surface in pricing | Converts more users to paid; lowers friction. | Low | Monetization, Growth | +0.5 |
| 2 | Connect analytics to PostHog/Mixpanel and add cohort events | Data for retention and paywall optimization; measure LTV and churn. | Low | Growth & Retention, Monetization | +1–1.5 |
| 3 | Add privacy policy and terms URLs; permission rationale strings | Required for store approval and user trust. | Low | App Store Readiness, Security | +1.5–2 |
| 4 | Share to social (e.g. Instagram) and polish invite deep links | Viral loop and attribution; more installs and referrals. | Medium | Social & Community, Growth | +1–1.5 |
| 5 | Rate limiting on auth and sensitive tRPC routes; SecureStore for session | Reduces abuse and improves token security. | Medium | Security, Backend | +0.5–1 |

---

*Scorecard saved to `docs/SCORECARD-POST-MONETIZATION.md`.*
