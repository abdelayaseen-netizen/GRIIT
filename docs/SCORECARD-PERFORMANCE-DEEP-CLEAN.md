# GRIIT Scorecard — Post Deep Clean

**Generated:** 2026-03-22  
**Commit:** 10eebee1236ff11426de0d50aa36635b183df170

## Codebase Metrics

| Metric | Value |
|--------|-------|
| Total files (.ts/.tsx) in app, components, lib, hooks, store, contexts, backend/trpc, backend/lib | 260 |
| Total lines of code (same dirs, measured via PowerShell `Get-Content` line count) | 40,983 |
| Screens (`app/**/*.tsx`) | 44 |
| Components (`components/**/*.tsx`) | 77 |
| Backend routes (`protectedProcedure` in `backend/trpc/routes/*.ts`) | 86 |
| Backend routes (`publicProcedure` in `backend/trpc/routes/*.ts`) | 16 |
| Database migrations (`supabase/migrations/*.sql`) | 45 |
| RLS policies (`CREATE POLICY` in migrations) | 60 |
| Database indexes (`CREATE INDEX` in migrations) | 37 |
| Test files (`**/*.test.ts` + `**/*.test.tsx`, project source) | 12 |

## Code Quality

| Metric | Value | Grade |
|--------|-------|-------|
| Raw hex outside `design-system.ts` (in `app/`, `components/`, `lib/` `.ts`/`.tsx`) | 0 | A |
| Empty catch blocks | 0 | A |
| `console.log` in prod code (`app/`, `components/`, `lib/`, `contexts/`) | 0 | A |
| `Alert.alert` (remaining; confirmations vs errors) | See note | B |
| Accessibility labels (`accessibilityLabel` in app + components + lib + contexts) | 219 | B |
| `React.memo` usage | 12 / 77 components (~16%) | B |
| Inline styles (`style={{}}` in `app/` + `components/`) | 25 matches | C |
| DS_COLORS adoption | Centralized tokens; hex only in design-system for palette | A |
| TypeScript strict errors (`npx tsc --noEmit`) | 0 | A |
| TODO / FIXME / HACK (`.ts`/`.tsx`) | 1 | C |

**Note:** Confirmation-style `Alert.alert` (leave challenge, sign out, draft save, etc.) remains by design. Create-flow and home “leave failed” errors now use `InlineError` where applicable.

## Performance

| Metric | Value | Grade |
|--------|-------|-------|
| Largest file (lines) | `app/challenge/[id].tsx`: 1,515 | D |
| Files > 500 lines (app + components + lib) | 18 | C |
| FlatList / SectionList vs ScrollView (token counts in app, components, lib, contexts, hooks) | 11 : 111 (~1 : 10) | C |
| `React.memo` components | 12 / 77 | B |
| `Promise.all` parallel batches (selected dirs) | 18 | A |
| Prefetch on press-in (`prefetch` / `Prefetch` in `.ts`/`.tsx`) | 15 | A |
| Skeleton loaders (`Skeleton` in `.tsx`) | 21 (mostly `SkeletonLoader.tsx`) | A |
| Error boundaries (`ErrorBoundary` in `.tsx`) | 12 | A |
| Query `staleTime` configured (unique files in app/components/lib) | 7 | B |
| N+1 query patterns (manual review) | Not audited (report 0 pending tooling) | — |

## Security

| Metric | Value | Grade |
|--------|-------|-------|
| Protected API routes | 86 / 102 (~84%) | B |
| RLS-enabled tables (policy count proxy) | 60 policies | A |
| Input validation (zod) | Used on tRPC inputs (routes) | A |
| Auth token verification | Supabase JWT / session | A |
| Sensitive data in client | Public env keys only (`EXPO_PUBLIC_*`); no raw secrets in repo | A |

## Feature Completeness

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (email + password) | ✅ | Supabase auth |
| Onboarding (3 screens + signup) | ✅ | Value-first flow |
| Challenge creation | ✅ | 10 task types, time windows |
| Challenge joining + auto-join creator | ✅ | `joinChallengeDirect` |
| Task completion (all types) | ✅ | Manual, timer, journal, photo, run, workout, checkin, water, reading, counter |
| Multi-challenge home goals | ✅ | `challengeGroups` |
| Streaks + day securing | ✅ | With milestones |
| Leaderboard | ✅ | Weekly + global |
| Activity feed + reactions | ✅ | 3 quick reactions + comments |
| Profile + stats | ✅ | Heatmap, trophies, rank |
| Share proof card | ✅ | ViewShot + share |
| Push notifications | ⚠️ | Code exists, not registered |
| Paywall / monetization | ⚠️ | RevenueCat not configured |
| Teams / duo challenges | ⚠️ | v2, scoped out |
| Strava integration | ⚠️ | OAuth scaffolded, not complete |
| Deep links | ⚠️ | Scheme registered, routing partial |
| App Store submission | ❌ | Not submitted |

## Comparison Benchmarks (for analysis)

| Benchmark | GRIIT | Industry Avg (Source) |
|-----------|-------|----------------------|
| Onboarding screens before signup | 3 | 2–4 (Localytics 2024) |
| Time to first value (screens) | 8 | 3–5 (Mixpanel 2024) |
| Task types supported | 10 | 3–5 (Habitica, Streaks, Fabulous) |
| Free tier limits | Unlimited (no paywall live) | 3–5 habits (Streaks, Habitify) |
| Social features | Feed + reactions + leaderboard | Varies (Strava: full social; Habitica: guilds) |
| Verification methods | Photo, timer, location, heart rate, anti-paste | Photo only (75 Hard apps) |
| Offline support | ❌ | ✅ (most top apps cache locally) |
| D1 retention (projected) | Unknown (no analytics) | 30–35% (Sensor Tower 2025) |
| D30 retention (projected) | Unknown | 20–30% (Sensor Tower 2025) |
| Subscription price planned | $7.99/mo | $4.99–$9.99/mo (category avg) |

## Top 5 Issues Blocking Launch

1. **RevenueCat API key not configured** — monetization not live  
2. **No App Store build submitted** — distribution blocked  
3. **Push notifications not fully registered** — retention risk  
4. **`app/challenge/[id].tsx` still large (~1.5k lines)** — further splits possible (mission row / modals)  
5. **List virtualization ratio** — many `ScrollView`s; `LiveActivity` now uses `FlatList` for feed rows; `discover` still vertical `ScrollView`

## File changes (this deep clean)

| Action | Path |
|--------|------|
| Delete | `components/SuggestedFollows.tsx` |
| Delete | `components/PremiumFeature.tsx` |
| Delete | `components/PremiumPaywallModal.tsx` |
| Delete | `preview-app.html`, `preview-ui.html` |
| Add | `components/challenge/challengeDetailScreenStyles.ts` |
| Add | `components/challenge/ChallengeHero.tsx` |
| Add | `components/challenge/ChallengeStats.tsx` |
| Add | `components/challenge/ChallengeLeaderboard.tsx` |
| Add | `components/challenge/ChallengeTodayGoals.tsx` |
| Add | `components/challenge/challengeInfoChip.tsx` |
| Add | `components/challenge/challengeSocialAvatars.tsx` |
| Modify | `app/challenge/[id].tsx` (styles extracted, section components) |
| Modify | `app/(tabs)/index.tsx`, `app/(tabs)/profile.tsx` |
| Modify | `components/create/CreateChallengeWizard.tsx` |
| Modify | `components/home/*` (memo), `components/profile/*` (memo) |
| Modify | `components/community/LiveActivity.tsx` (FlatList) |
| Modify | `lib/analytics.ts`, `lib/sentry.ts`, `lib/revenue-cat.ts` |

`src/` retained — shared UI and theme tokens are imported from `@/src/...`.
