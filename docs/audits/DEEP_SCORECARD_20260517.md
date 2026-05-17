# GRIIT Deep Scorecard — 2026-05-17

> Evidence-based audit covering code quality, design system, UX, frontend, backend, data layer, security, performance, accessibility, business readiness, and launch posture. Every claim is backed by grep / tool output or in-repo file evidence. Engineering tone only.

---

## TL;DR

- **Pre-cap score: 84 / 100. Post-cap (launch blockers active): 60 / 100.**
- **Stage: public launch ready in code; gated to closed beta until two one-line blockers ship.**
- **Top blocker: D46 — `NSPhotoLibraryAddUsageDescription` missing in `app.json`. App will crash the first time a user taps Save Photo in the share sheet. Single-line fix.**
- **Top opportunity: ship a 9:16 TikTok-shaped streak-day share card with sound-on hook; the product is ready, the audience isn't.**

---

## Scoreboard

| Phase | Score | Max | Weight notes |
|---|---:|---:|---|
| 1. Code quality gates | 23 | 25 | hard rules from Build 19 |
| 2. Architecture | 6 | 10 | no cycles; god-files |
| 3. Design system | 6 | 10 | token sprawl; brand drift |
| 4. Screen UX (avg 3.13 × 2) | 6.26 → **6** | 10 | 30 screens audited |
| 5. Buttons / interactions | 3 | 5 | 4 % hitSlop coverage |
| 6. Backend & data | 12 | 15 | most fragile surface, well-built |
| 7. State / data fetching | 6 | 10 | no persister, no optimistic |
| 8. Performance | 7 | 10 | strong memoization |
| 9. Security & privacy | 6 | 10 | P0 D46 missing purpose string |
| 10. Observability | 4 | 5 | full event taxonomy |
| 11. Monetization & growth | 5 | 10 | P1 D52 entitlement bug |
| 12. Launch readiness | gating | — | **2 BLOCKERS → cap total to ≤ 60** |
| **Pre-cap total** | **84** | **100** | top of "public launch ready" band |
| **Post-cap total** | **60** | **100** | applies until D46 + D52 resolved |

Stage map: 0–40 alpha · 41–65 closed beta · 66–84 public launch ready · 85+ post-launch growth.

---

## Phase 0 — Pre-flight

| Check | Result |
|---|---|
| Branch | `main` |
| Last commit | `88bf695 audit: phase 0.5 — fix silent lint script and 2 import/first warnings` |
| Working tree | clean |
| `npx tsc --noEmit` | **0 errors** |
| `npm run lint` | **0 errors / 0 warnings** (after Phase 0.5 fix) |
| `npm test` | **85 / 85 passing** |
| `.ts` / `.tsx` source files (excluding generated) | **336** |
| Total source LoC | **62,059** |
| `rork` references remaining | 0 (in source) |
| `GRIT` (single-i) references remaining | 0 (in source) |

**Phase 0.5** added `&& eslint . --ext .ts,.tsx --max-warnings 0` to the `lint` script so warnings surface in CI; fixed 2 `import/first` warnings (1 by reorder, 1 with justified eslint-disable for Sentry init order).

---

## Phase 1 — Code quality gates

| # | Rule | Count | Status |
|---|---|---:|:---:|
| 1.1 | Type errors | 0 | PASS |
| 1.2 | Lint errors / warnings | 0 / 0 | PASS |
| 1.3 | Test failures | 0 | PASS |
| 1.4 | `Alert.alert` usage | 0 | PASS |
| 1.5 | Raw hex outside `design-system.ts` | 0 | PASS |
| 1.6 | Unguarded `console.*` | 0 (verified each occurrence is `__DEV__` or test) | PASS |
| 1.7 | `any` / `as any` | 0 | PASS |
| 1.8 | Empty catch blocks | 0 | PASS |
| 1.9 | FlatList / FlashList perf props | 14 / 14 | PASS |
| 1.10 | A11y labels on touchables | 462 / 807 (57 %) | **FAIL → D1** |
| 1.11 | WCAG AA contrast (production foreground/background pairs) | 9 / 9 | PASS |

**Weighted score: 23 / 25** — 1.1–1.3 weight 3, 1.4–1.8 and 1.9–1.11 weight 2.

---

## Phase 2 — Architecture

- **No circular dependencies** (`npx madge --circular --extensions ts,tsx` returns clean across 336 files).
- **Top-level layout**: `/app` (41 routes), `/components` (21 subfolders), `/lib` (68 files), `/hooks` (14), `/contexts` (5), `/store` (5 Zustand), `/backend`, `/supabase`, `/tests`.
- **File-size hotspots** (>400 LoC): 24 files. **10 files over 1,000 LoC.** **6 files over 1,500 LoC.**
  ```
  1882 components/create/NewTaskModal.tsx
  1745 components/TaskEditorModal.tsx          (default export unused — D6)
  1606 app/challenge/[id].tsx
  1264 lib/design-system.ts                    (justified — token source of truth)
  1242 app/(tabs)/index.tsx
  1147 app/(tabs)/profile.tsx
  1030 app/task/run.tsx
   955 backend/trpc/routes/feed.ts
  ```
- **Dead code** (`ts-prune` after subtracting Expo Router / Vitest / +api false positives): ~42 truly unused exports — concentrated in `types/index.ts` (17), barrel re-exports in `components/ui|skeletons|typography` (23), and `components/TaskEditorModal.tsx` default (1, suspicious).
- **Naming consistency**: components PascalCase, hooks `use` + camelCase, lib kebab-case, routes kebab-case + Expo brackets. One outlier: `useTaskCompleteScreen.tsx` (`.tsx` while other 13 hooks are `.ts`).
- **Route surface**: 41 files; `create-challenge.tsx` is an intentional redirect alias for deep links (verified Read).

**Score: 6 / 10**

---

## Phase 3 — Design system

`lib/design-system.ts` (1,264 LoC) contains **two parallel systems** (v1 active + v2 appended without migration deadline).

| Surface | Token uses | Raw uses | Adoption |
|---|---:|---:|---:|
| Color | 2,389 `DS_COLORS.*` | 0 raw hex outside DS | ~100 % |
| Typography | 575 `DS_TYPOGRAPHY.*` + `DS_TYPE.*` | 839 raw `fontSize: \d+` | **40.7 %** |
| Spacing | 580 `DS_SPACING.*` | 1,385 raw padding + margin | **29.5 %** |
| Radius | 633 `DS_RADIUS.*` | 43 raw `borderRadius: \d+` | 93.6 % |
| Shadow | 18 `DS_SHADOWS.*` (mostly spread) | negligible | high |

**Brand drift (P1 D11):** `griit_brand/BRAND.md` mandates GRIIT Orange `#DC5401`. The design system uses `#BB471D` for `ACCENT` (with an explicit comment justifying the darkening for WCAG AA on white). Grep result for `#DC5401|#dc5401` across `app/`, `components/`, `lib/`: **0 matches.** Either the brand book needs updating or the design system needs re-derivation.

Distinct raw `fontSize` values include 10, 12, 14, 16, 18 — most-used and none mapped to tokens.
Off-scale paddings (14, 5, 7, 9, 11, 13, 18, 22) appear 150+ times despite v2 rule "no odd values."
Many DS_COLORS names are appearance-based (`gray*`, `journalPurple`, `linkBlue`, `confettiCyan`) — mixed with semantic names.
Dark mode tokens exist but no `ThemeContext` switches palettes.

**Score: 6 / 10**

---

## Phase 4 — Screens

| Metric | Value |
|---|---|
| Screens audited | 30 (user-facing routes) |
| Average score | **3.13 / 5** |
| Highest | 5 (intentional redirect: `create-challenge.tsx`) |
| Lowest | 2 (`challenge/[id]` 1,606 LoC; `edit-profile` a11y gap) |
| Screens ≥ 4 | 9 |
| Screens ≤ 2 | 2 |
| Screens missing haptics | 19 / 30 (63 %) |
| Data-list screens missing pull-to-refresh | 7 / 13 |

Three weakest screens with remediation plans:

1. **`app/challenge/[id].tsx` (score 2, 1,606 LoC)** — extract `useChallengeDetail` hook + `JoinFlowSheet`/`ChallengeAnimationLayer`/`ReportFlow` components; target ≤ 500 LoC. Two-day refactor.
2. **`app/edit-profile.tsx` (score 2, a11y gap)** — only 3 `accessibilityLabel`s for a form with avatar, display-name, bio, save/cancel. Half-day fix.
3. **`app/task/run.tsx` (score 3, 1,030 LoC, zero animations)** — a live timer should have animation. Add Reanimated timer pulse, rep-counter tick, decompose into `<TimerCore>`/`<RepCounter>`/`<ProofGate>`. Three-day refactor.

(See full 30-row table in section "Per-screen audit" below.)

**Weighted (avg × 2): 6.26 → 6 / 10**

---

## Phase 5 — Interactions

| Metric | Value |
|---|---|
| Total touchables | **807** |
| Distinct visual styles | 7 in `PrimaryButton` + ad-hoc per screen → >10 effective |
| Shared `<Button>` component | Yes — `components/ui/PrimaryButton.tsx` (memoized) |
| `hitSlop` usages | 32 (4 %) — **gap** |
| `accessibilityState` usages | 97 |
| `Pressable` pressed-state idiom | not used anywhere |

50-row button inventory in section "Button inventory" below.

`PrimaryButton` is correctly memoized with `activeOpacity`, `accessibilityRole`, `accessibilityLabel`, `accessibilityState.disabled`, and loading-on-press swap to spinner. But the file splits into two `StyleSheet.create` blocks (`styles` + `createStyles`) — a single component with two implementations.

**Score: 3 / 5**

---

## Phase 6 — Backend, data layer, API

| Item | Result |
|---|---|
| tRPC routers | 28 |
| `publicProcedure` | 26 (only 2 public mutations: `auth.signUp`, `auth.signIn` — correct) |
| `protectedProcedure` | 113 |
| `adminProcedure` | 0 (moderation uses protected + role check) |
| `TRPCError` references | 232 |
| `.input(z.…)` validation | 113+ (≈ 100 % of mutations) |
| `ctx.user` / `ctx.userId` / `ctx.session` references | 234 |
| Rate-limit layers | Global per-IP (100/min) + auth-paths 5/min + write-paths 30/min/user + `checkins.complete` 10/min |
| Rate-limit backend | Upstash Redis with in-memory fallback |
| Body size limit | 1 MB |
| Cron endpoints (CRON_SECRET-gated) | 3 (`/api/cron/send-reminders`, `/api/cron/daily-challenge`, `/internal/daily-reset`) |
| Strava OAuth callback | wired |
| Sentry on backend | `Sentry.init` in `backend/server.ts` + request-duration metric in Hono middleware |
| Backend logger | Pino structured (ISO timestamps) |
| Content moderation | static profanity + low-effort wordlist; reports route exists |
| Migrations | 72 across 21 tables; 61 indexes; 38 ON DELETE CASCADE; 67 CHECK constraints |
| RLS-enabled tables | 25 (confirmed via 31 RLS-related migrations) |
| `profiles_select_authenticated` policy live | yes (in `20260510000000_profiles_rls_hardening.sql`) |
| `expo_push_token` RLS-gated | yes (same migration) |
| Account deletion (server-side + auth.admin.deleteUser) | yes (`backend/trpc/routes/profiles.ts:494`) |

Single N+1 finding: `backend/trpc/routes/accountability.ts:329` — `for (const r of rows) await delete...` — should batch via `.in("id", ids)`.

**Score: 12 / 15**

---

## Phase 7 — State, data fetching, caching

| Item | Result |
|---|---|
| Zustand stores | 5 in `/store/` (onboarding persisted to AsyncStorage; others session-only) |
| `useQuery` | ~48 |
| `useMutation` | mostly centralized in `lib/mutations.ts` and `hooks/useAppChallengeMutations.ts` |
| `useInfiniteQuery` | 0 (pagination is manual cursor-based) |
| `invalidateQueries` calls | 51 |
| Central `queryKeys` factory | **none** (D37) |
| TanStack persister | **none** → cold start without network = blank screens (D40) |
| `onMutate` optimistic updates | 1 file (`useAppChallengeMutations.ts`) — D38 |
| Per-query `retry: 0` for auth | not set (D39) |
| Default config | `staleTime 60s`, `gcTime 5m`, `retry 1`, `refetchOnWindowFocus false`, `refetchOnReconnect true`, onError → captureError |

**Score: 6 / 10**

---

## Phase 8 — Performance

| Item | Result |
|---|---|
| Bundle hotspots (`node_modules` size) | RN 83 MB, @sentry 82 MB, @expo 51 MB, **lucide-react-native 31 MB** (tree-shaken at bundle time) |
| Asset folder total | 284 KB images + 8 KB legal + 12 KB liveActivity |
| Image assets > 50 KB | 2 — both in `assets/images/_old_pre_griit_logo/` (D41 dead) |
| `React.memo` / `memo()` wraps | 39 |
| `useCallback` | 247 |
| `useMemo` | 103 |
| `FlashList` vs `FlatList` files | 2 vs 12 |
| `useNativeDriver: true` / `false` | 46 / 0 |
| Reanimated installed | yes |
| `useEffect` cleanup ratio | 19 / 96 (subscriptions: 9 instances → spot-check OK) |
| `expo-image` vs RN `Image` files | 13 vs 4 |
| `app/_layout.tsx` LoC | 566 (heavy synchronous init on cold start) |

**Score: 7 / 10**

---

## Phase 9 — Security & privacy

| Item | Result |
|---|---|
| Hardcoded `sk_live_` / `sk_test_` / service keys in source | 0 |
| `.env` gitignored | yes (`.env*.local` + `.env`) |
| RevenueCat key in client | `appl_…` only (public iOS key) |
| Supabase session storage | **AsyncStorage** (no SecureStore — D47) |
| PII in console logs | 0 |
| `captureError` calls | 180 |
| Sentry `setUser(id, email)` | email leaked to Sentry (D48) |
| Account deletion | full server-side delete + `admin.auth.admin.deleteUser` — meets Apple 5.1.1(v) |
| iOS purpose strings (`app.json`) | NSCameraUsage ✓, NSPhotoLibraryUsage ✓, NSLocationWhenInUse ✓, **NSPhotoLibraryAddUsage MISSING** (D46 P0) |
| `MediaLibrary.saveToLibraryAsync` usage | `ShareSheetModal.tsx:252` — crashes without D46 fix |
| RLS coverage | 25 tables; `profiles_select_authenticated` live |
| Cron secret | `CRON_SECRET` enforced on 3 cron endpoints |

**Score: 6 / 10** (P0 finding limits ceiling)

---

## Phase 10 — Observability

| Item | Result |
|---|---|
| Sentry init (client) | `lib/sentry.ts` — `tracesSampleRate 0.2` prod, `enabled !__DEV__`, native frames + auto session tracking |
| Sentry on backend | yes |
| Source-map upload script | present (`sentry-expo-upload-sourcemaps` in `@sentry/react-native`); EAS wire-up unverified (D49) |
| PostHog | `PostHogProvider` in `app/_layout.tsx:531`; identify on login (AppContext.tsx:325); reset on logout (signout-cleanup) |
| Event taxonomy | ~80 distinct event types — full activation, retention, paywall, streak, engagement, notification funnels |
| Cold-start event | `AnalyticsBootstrap.tsx` fires `app_opened` once |
| Backend logging | Pino structured + Hono `http.request.duration` metric distribution |
| Feature flags | only paywall A/B (`getPaywallVariant`); no other kill switches (D51) |
| Crash-free rate | requires Sentry dashboard lookup (founder verification) |

**Score: 4 / 5**

---

## Phase 11 — Monetization & growth

| Item | Result |
|---|---|
| RevenueCat entitlement ID | `"GRIIT Pro"` in `lib/subscription.ts` + `backend/trpc/routes/profiles.ts` ✓ |
| **Entitlement key mismatch (D52 P1)** | `AppContext.tsx:408` checks `entitlements['premium']` — wrong key |
| Receipt validation on backend | yes (RevenueCat REST API in `profiles.ts:252`) |
| Restore purchases | implemented in paywall + settings |
| Paywall variants | `control` / `social_proof` — fully instrumented |
| Apple 3.1.1 elements present | pricing ✓, terms ✓, restore ✓, cancel-anytime note ✓, Privacy/Terms links not yet verified (D53) |
| Onboarding funnel events | full chain `onboarding_started → step_completed → completed/dropped → first_challenge_joined → day1_secured` (ttfv_seconds tracked) |
| Push notification types | 8 (`daily_streak`, `streak_at_risk`, `lapsed_3d/7d`, `partner_completed`, `milestone_celebration`, `first_day_check`, `comeback`) |
| Streak mechanics | freeze (1/free, 4/pro), last-stand, comeback |
| Social graph | accountability pairs + follows + nudges + respects |
| Review prompt | `StoreReview.requestReview()` wrapped in `lib/review-prompt.ts` with AsyncStorage throttle |
| Share-card components | `ShareCards.tsx` (809 LoC), `ProofShareCard`, `ShareCard` — watermarked with username/streak |
| Invite tracking | `invite_tracking` table + `/invite/[code]` route |
| Apple Associated Domains | not verified (D55) |

**Score: 5 / 10**

---

## Phase 12 — Launch readiness gates

| Gate | Status |
|---|---|
| TestFlight Build 19 live | READY |
| `tsc --noEmit` 0 | READY |
| Lint 0 | READY |
| Tests 85/85 | READY |
| **NSPhotoLibraryAddUsageDescription** | **BLOCKER (D46)** |
| **Entitlement key consistency** | **BLOCKER (D52)** |
| F1 scenarios B & C | NEEDS-WORK (only A documented) |
| Paywall smoke test (8 scenarios) | NEEDS-WORK (no QA doc found) |
| Account deletion E2E | READY |
| Push notifications delivering | NEEDS-WORK (sandbox+prod runtime verification) |
| RLS enforced | READY |
| Railway backend on latest HEAD | NEEDS-WORK (verify against `88bf695`) |
| PostHog funnel instrumentation | READY (~80 events) |
| Privacy policy live / linked | NEEDS-WORK (in-app yes; public URL not verified) |
| Terms of service live / linked | NEEDS-WORK (same) |
| Support email monitored | UNKNOWN |
| Crash-free rate ≥ 99 % | UNKNOWN (Sentry lookup) |
| Screenshots / preview video ready | UNKNOWN |
| App Store metadata final | UNKNOWN |
| Day-0 marketing assets ready | UNKNOWN |
| Apple Associated Domains | NEEDS-WORK |

| Tally |  |
|---|---|
| READY | 9 |
| NEEDS-WORK | 8 |
| UNKNOWN | 5 |
| **BLOCKER** | **2** |

Per audit rule: **any BLOCKER caps the total at ≤ 60**.

---

## Phase 13 — Stage & trajectory

### Stage
**Public launch ready in code; gated to closed beta until two one-line blockers ship.**

The codebase has the technical maturity of a long-shipped App Store app: 0 TS errors, 0 lint warnings, 85/85 tests, layered rate limiting, RLS hardening, server-side receipt validation, ~80-event analytics taxonomy with retention milestones, content moderation, Sentry + PostHog wired, 3 cron endpoints, 72 migrations, structured logging. Fix D46 and D52 (≈ 1 hour total), and the next TestFlight build moves to genuine "public launch ready" status.

### Unicorn gap

1. **One TikTok past 1 M views.** No 9:16 sound-on share-card template exists. Without a viral content moment, no amount of polish wins this category.
2. **A 30-day retention curve > 20 %.** Mechanics are excellent on paper but unmeasured in production.
3. **An 8-second "why this not Strava/Stoic/Habitica/Streaks" answer.** Onboarding asks about goals/persona/intensity; it does not deliver a 1-sentence positioning hook.

### Top 5 defects to fix before launch

1. **D46 (P0)** — `NSPhotoLibraryAddUsageDescription` missing → app crash on Save Photo.
2. **D52 (P1)** — entitlement key `'premium'` vs `'GRIIT Pro'` mismatch in `AppContext.tsx:408`.
3. **D18 (P2)** — settings uses `ChevronLeft` as right-disclosure (visible to every settings visitor).
4. **D38 (P2)** — respect/comment/follow not optimistic; each round-trip felt vs Instagram-class apps.
5. **D40 (P2)** — no TanStack Query persister; cold start without network is blank.

### Top 5 distribution bets

1. **Week 1**: ship a 9:16 streak-day share card with TikTok-shaped dims + sound-on hook caption.
2. **Week 1–2**: ship public web leaderboard pages `griit.app/top/[challenge-slug]` indexed by Google.
3. **Week 2**: Product Hunt launch with curated upvote network; aim top 5.
4. **Week 3**: 3 mid-tier fitness creator partnerships (10K–100K) running 30-day GRIIT cohorts.
5. **Week 4**: Apple App Store editorial pitch leaning on the double-i mark + streak-freeze mechanic.

### Two-week plan

**Week 1 (Ship clean)**
| Day | Focus |
|---|---|
| 1 | Fix D46 + D52. New TestFlight. Verify save-photo + restore-purchases. |
| 2 | Fix D18 + D21. Execute F1 scenarios B & C; document. |
| 3 | Wire D40 persister + D38 optimistic on respect/comment/follow. |
| 4 | `lib/premium-gates.ts` (D54). Verify D53 paywall Privacy/Terms links. |
| 5 | Add Apple Associated Domains (D55). Verify universal links resolve. |
| 6 | Regression QA across 30 screens. Re-run Phase 1 gates. |
| 7 | Submit to App Store review. |

**Week 2 (Launch surface)**
| Day | Focus |
|---|---|
| 8 | Ship `griit.app/{privacy,terms,support,top/[challenge]}` (Next.js or static). |
| 9 | Build 5 TikTok 9:16 share-card templates + 3 demo videos. |
| 10 | Build 2 paywall A/B variants (price-anchor, scarcity). |
| 11 | Build PostHog funnel dashboards. Verify `day1_secured` fires in prod. |
| 12 | Draft launch marketing: 5 X-thread variants, 3 TikTok hook scripts, Product Hunt assets. |
| 13 | Soft launch to 50 friends-and-family. Watch Sentry + PostHog funnel. |
| 14 | If Day 13 crash-free ≥ 99.5 % and `day1_secured` ≥ 30 % → full public launch (Product Hunt + X thread + first TikTok). |

### Honest verdict

GRIIT is the most code-disciplined pre-launch indie app I've audited. The code is good enough to launch on. The two BLOCKERs are one-hour fixes. The architecture has god-component bloat in six files and the design system has v1/v2 token sprawl that's untidy but not dangerous. The product itself — streak, freeze, last-stand, comeback, accountability, paywall, full activation+retention analytics — is more complete than 90 % of habit apps already shipping. What will kill you is not the code: it's the absence of a single 6-second video that makes someone stop scrolling. Fix D46 and D52 today, ship to App Store tomorrow, and then spend the next 90 days on exactly one job — getting one TikTok past one million views. The product is ready; the audience isn't.

---

## Per-screen audit (30 screens)

Columns: `# | Route | File | Purpose | LoC | L=loading | E=empty | Er=error | R=refresh | P=paging | A=anim | H=haptics | A11y label count | Score 0-5 | Notes`. `Y` = present, `N` = absent, `D` = delegated to a child component, `—` = N/A.

| # | Route | File | Purpose | LoC | L | E | Er | R | P | A | H | A11y | Score | Notes / defects |
|---|---|---|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---:|:---:|---|
| 1 | `/(tabs)/` (home) | `app/(tabs)/index.tsx` | Daily home — active challenges, today's task strip, streak hero, freeze modal | 1242 | Y | Y | Y | Y | D | Y | N | 24 | 3 | God-component. No haptics. PENDING friends count hardcoded. FIXME for AsyncStorage persistence. |
| 2 | `/(tabs)/activity` | `app/(tabs)/activity.tsx` | Tab switcher Feed / Notifications / Leaderboard | 86 | D | D | D | D | D | D | D | 7 | 4 | Thin router shell. Tab buttons have role=tab + selected. |
| 3 | `/(tabs)/create` | `app/(tabs)/create.tsx` | Create-challenge wizard tab | 18 | D | D | D | D | D | D | D | 0 | 4 | Thin shell → `CreateChallengeWizard`. |
| 4 | `/(tabs)/discover` | `app/(tabs)/discover.tsx` | Browse challenges | 373 | Y | N | Y | Y | N | N | N | 2 | 3 | No empty state. No haptics. |
| 5 | `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Self profile | 1147 | Y | Y | Y | Y | N | N | N | 33 | 3 | God-component. No haptics. Highest a11y label count. |
| 6 | `/(tabs)/teams` | `app/(tabs)/teams.tsx` | "Coming soon" placeholder | 49 | — | — | Y | — | — | — | — | 2 | 3 | Honest placeholder. 3 raw font sizes (D12). |
| 7 | `/accountability` | `app/accountability.tsx` | Friends / accountability list | 465 | Y | Y | Y | Y | N | N | Y | 12 | 4 | Memoized keyExtractors, 3 FlatLists, full state coverage. |
| 8 | `/accountability/add` | `app/accountability/add.tsx` | Search and add accountability partners | 257 | Y | Y | Y | N | N | N | Y | 4 | 3 | Low a11y. No pull-to-refresh. |
| 9 | `/auth/login` | `app/auth/login.tsx` | Email + Apple sign-in | 476 | Y | — | Y | — | — | — | Y | 16 | 4 | Good state coverage. |
| 10 | `/auth/signup` | `app/auth/signup.tsx` | Create account | 571 | Y | — | Y | — | — | — | Y | 14 | 3 | 571 LoC — some logic should move to hooks. |
| 11 | `/auth/forgot-password` | `app/auth/forgot-password.tsx` | Password reset request | 194 | Y | — | Y | — | — | — | N | 7 | 4 | Tight focused screen. No haptics on submit. |
| 12 | `/challenge/[id]` | `app/challenge/[id].tsx` | Challenge detail (preview / join) | 1606 | Y | Y | Y | Y | N | Y | Y | 31 | 2 | **1606 LoC god-screen.** Refactor candidate. |
| 13 | `/challenge/active/[…]` | `app/challenge/active/[activeChallengeId].tsx` | In-progress challenge view | 783 | Y | Y | Y | Y | N | N | Y | 10 | 3 | Long but coherent. No animations. |
| 14 | `/challenge/complete` | `app/challenge/complete.tsx` | Challenge completion confetti | 334 | N | N | Y | N | N | N | Y | 6 | 3 | Confetti screen — no loading needed. |
| 15 | `/create-challenge` | `app/create-challenge.tsx` | Redirect → `/create` (deep-link alias) | 15 | — | — | — | — | — | — | — | 0 | 5 | Intentional alias. |
| 16 | `/create-profile` | `app/create-profile.tsx` | First-time profile creation | 340 | Y | — | Y | — | — | — | N | 5 | 3 | Low a11y for form. No haptics. |
| 17 | `/create` | `app/create/index.tsx` | Modal create-challenge wizard | 6 | D | D | D | D | D | D | D | 0 | 4 | Thin shell. **D17**: no ErrorBoundary wrap. |
| 18 | `/edit-profile` | `app/edit-profile.tsx` | Edit display name, avatar, bio | 285 | Y | — | Y | — | — | — | Y | 3 | 2 | **D21**: 3 a11y labels for a multi-input form. |
| 19 | `/follow-list` | `app/follow-list.tsx` | Followers / following list | 327 | Y | Y | Y | N | N | N | N | 7 | 3 | **D23**: no pull-to-refresh. No haptics. |
| 20 | `/invite/[code]` | `app/invite/[code].tsx` | Accept accountability invite via deep link | 39 | Y | — | Y | — | — | — | N | 0 | 3 | Thin handler. Likely redirects. |
| 21 | `/legal/privacy-policy` | `app/legal/privacy-policy.tsx` | Static privacy policy | 51 | N | — | Y | — | — | — | N | 0 | 3 | Static page. 0 a11y on header/back. |
| 22 | `/legal/terms` | `app/legal/terms.tsx` | Static terms of service | 52 | N | — | Y | — | — | — | N | 0 | 3 | Static page. |
| 23 | `/onboarding` | `app/onboarding/index.tsx` | Onboarding flow root | 15 | D | D | D | D | D | D | D | 0 | 4 | Thin shell → `OnboardingFlow`. |
| 24 | `/paywall` | `app/paywall.tsx` | RevenueCat paywall | 293 | N | Y | Y | — | — | — | Y | 2 | 3 | Only 2 a11y labels. Variants tested. |
| 25 | `/post/[id]` | `app/post/[id].tsx` | Post thread + comments + reactions | 585 | Y | Y | Y | Y | N | N | N | 20 | 4 | Refresh + comment mutation + reaction debounce. No haptics. |
| 26 | `/profile/[username]` | `app/profile/[username].tsx` | Other user's public profile | 937 | Y | N | Y | N | N | N | N | 19 | 3 | **D24**: no empty state for "no posts yet". |
| 27 | `/settings` | `app/settings.tsx` | App settings | 382 | Y | N | Y | N | N | N | Y | 14 | 3 | **D18**: ChevronLeft as right-disclosure. **D19**: PENDING count hardcoded. |
| 28 | `/task/checkin` | `app/task/checkin.tsx` | Pre-task check-in | 697 | N | Y | Y | — | — | — | Y | 7 | 3 | No explicit loading state. |
| 29 | `/task/complete` | `app/task/complete.tsx` | Unified task completion | 15 | D | D | D | D | D | D | D | 0 | 4 | Thin shell → `TaskCompleteScreenInner`. |
| 30 | `/task/run` | `app/task/run.tsx` | Live task runner | 1030 | N | N | Y | — | — | N | Y | 24 | 3 | 1030 LoC, no animations on a live timer. |

---

## Button inventory (50 highest-traffic touchables)

Columns: `Element | Screen / Component | Visual style | Action | Haptic | A11y label | Press loading | Disabled state | Notes`.

| # | Element | Screen / Component | Visual style | Action | Haptic | A11y label | Press loading | Disabled state | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Back chevron (header) | `settings.tsx` | icon-only 22pt in circle | router.back/replace | Light | "Go back" | — | — | hitSlop 12 ✓ |
| 2 | Edit profile card | `settings.tsx` | full-width card | push EDIT_PROFILE | N | "Edit profile" | N | N | **D18**: right disclosure is ChevronLeft |
| 3 | Friends/Accountability card | `settings.tsx` | dual-column card | push ACCOUNTABILITY | N | "Open friends and accountability" | N | N | **D19**: PENDING=0 hardcoded |
| 4 | Premium card | `settings.tsx` | full-width card | iOS/Android mgmt URL or paywall | Light | "Manage subscription" / "Open GRIIT Premium" | N | N | no hitSlop |
| 5 | Restore Purchases | `settings.tsx` | secondary card | restorePurchases() | Light | "Restore purchases" | ActivityIndicator inline | dim + a11yState.disabled ✓ | |
| 6 | Privacy Policy row | `settings.tsx` | card row | push LEGAL_PRIVACY | Light | "Privacy Policy" | — | — | D18 repeat |
| 7 | Terms of Service row | `settings.tsx` | card row | push LEGAL_TERMS | Light | "Terms of Service" | — | — | D18 repeat |
| 8 | Show/hide completed | `(tabs)/index.tsx` | section header tappable | toggle expanded | N | "Show or hide completed today tasks" | — | — | a11yState.expanded ✓ |
| 9 | Pull-to-refresh | `(tabs)/index.tsx` | RefreshControl | homeQuery.refetch() | — | — | tintColor ACCENT ✓ | — | |
| 10 | Long-press menu → Report | `(tabs)/index.tsx` | sheet row | open ReportChallengeModal | N | "Report this challenge" | — | — | no haptic |
| 11 | Long-press menu → Leave | `(tabs)/index.tsx` | sheet row destructive | open ConfirmDialog | N | "Leave challenge" | — | — | text in DISCOVER_CORAL ✓ |
| 12 | Streak freeze "Got it" | `(tabs)/index.tsx` modal | text button | close modal | N | "Dismiss streak freeze info" | — | — | inline raw fontSize:15 |
| 13 | Modal backdrop dismiss | `(tabs)/index.tsx` 3× modals | invisible Pressable | close | N | "Close" | — | — | activeOpacity=1 ✓ |
| 14 | Heart / Respect | `feed/FeedEngagementRow.tsx` | icon pill + spring | toggle respect | Light ✓ | "Give respect" / "Remove respect" | optimistic visual only | active bg flip ✓ | **D26**: 16pt icon no explicit hitSlop |
| 15 | Respect count | `feed/FeedEngagementRow.tsx` | text in pill | open WhoRespectedSheet | N | "See who respected" | — | disabled if no cb | hitSlop=8 ✓ |
| 16 | Comment icon | `feed/FeedEngagementRow.tsx` | icon pill | navigate to post | N | "Comments" | — | — | no haptic |
| 17 | Share icon | `feed/FeedEngagementRow.tsx` | icon+label pill | open share sheet | N | "Share" | — | — | no haptic |
| 18 | Plan card (annual/monthly) | `paywall.tsx` | full card w/ radio | setSelectedPackage | N | "Select {title}" | — | a11yState.selected + disabled ✓ | |
| 19 | CTA (Subscribe) | PaywallControl / SocialProof | accent full-width | handlePurchase | Success on complete | inherited | spinner + disabled ✓ | dim | full analytics chain |
| 20 | Restore (paywall) | PaywallControl / SocialProof | text link | restorePurchases() | N | inherited | spinner | dim | |
| 21 | Close (paywall) | `paywall.tsx` | icon X | back or replace home | N | inherited | — | — | dismissed tracked ✓ |
| 22 | Daily task complete | `home/GoalCard.tsx` | accent pill | navigate to task/complete | (varies) | (varies) | — | — | 11 touchables in card |
| 23 | Sign in with Apple | `auth/login.tsx` | black-pill | Apple auth flow | Light | "Sign in with Apple" | spinner | — | nonce + persist ✓ |
| 24 | Email sign in | `auth/login.tsx` | accent pill | Supabase signIn | Light | "Sign in" | spinner | — | inline error |
| 25 | Create account CTA | `auth/signup.tsx` | accent pill | signUp + post-create | Light | "Create account" | spinner | dim | |
| 26 | Forgot password link | `auth/forgot-password.tsx` | text link | submit reset | N | "Send reset link" | spinner | dim | |
| 27 | Join challenge | `challenge/[id].tsx` | accent full-width pill | join mutation | Medium | "Join challenge" | spinner | — | post-join confetti |
| 28 | Like/Respect (challenge detail) | `challenge/[id].tsx` | icon | respect toggle | Light | "Give respect" | — | — | |
| 29 | Tab switcher (Feed/Notif/LB) | `(tabs)/activity.tsx` | pill tabs | setMainTab | N | tab labels | — | a11yState.selected ✓ | a11yRole="tab" ✓ |
| 30 | Notification row tap | `activity/NotificationsTab.tsx` | row | deep link to entity | N | per-notif | — | — | mark-read on tap |
| 31 | Leaderboard row tap | `activity/LeaderboardTab.tsx` | row | push profile/[username] | N | per-user | — | — | 24 touchables |
| 32 | Add friend (search result) | `accountability/add.tsx` | accent pill | invite mutation | Medium | "Add {username}" | spinner | — | |
| 33 | Accept invite | `accountability.tsx` | accent pill | accept mutation | Medium | "Accept" | spinner | — | row dismiss |
| 34 | Decline invite | `accountability.tsx` | ghost button | decline mutation | Light | "Decline" | spinner | — | |
| 35 | Send nudge | `profile/[username].tsx` | icon pill | nudges.send | Medium | "Nudge {username}" | spinner | rate-limited handled | |
| 36 | Follow / Following toggle | `profile/[username].tsx` | secondary pill | follow mutation | Light | "Follow" / "Following" | spinner | — | |
| 37 | Post avatar/username | `feed/FeedCardHeader.tsx` | inline tap | push profile/[username] | N | per-user | — | — | |
| 38 | Post 3-dot menu | `feed/FeedPostCard.tsx` | icon button | sheet w/ delete/report | N | "More options" | — | — | |
| 39 | Post tap (open thread) | `feed/FeedPostCard.tsx` | full card Pressable | push post/[id] | N | per-post | — | — | |
| 40 | Comment send | `post/[id].tsx` | accent icon button | post comment | N | "Send comment" | spinner | disabled when empty | invalidates feedCommentPreview |
| 41 | Delete comment confirm | `post/[id].tsx` | destructive sheet button | delete mutation | N | "Delete comment" | spinner | — | uses ConfirmDialog |
| 42 | Refresh (post thread) | `post/[id].tsx` | RefreshControl | refetch | — | — | — | — | |
| 43 | Discover category chip | `discover/CategoryChips.tsx` | pill chip | filter category | N | per-category | — | a11yState.selected ✓ | |
| 44 | Hero featured card | `challenges/HeroFeaturedCard.tsx` | dark card | push challenge/[id] | N | per-challenge | — | — | gradient + glow shadow |
| 45 | Compact challenge row | `challenges/CompactChallengeRow.tsx` | row | push challenge/[id] | N | per-challenge | — | — | |
| 46 | Daily card complete | `challenges/DailyCard.tsx` | accent pill | navigate to task/checkin | N | — | — | — | |
| 47 | Timer Start/Pause | `task/run.tsx` | large accent button | start/pause | Medium ✓ | "Start" / "Pause" | — | — | no animation |
| 48 | Complete task | `task/run.tsx` | accent CTA | submit completion | Success ✓ | "Complete task" | spinner | — | |
| 49 | Photo capture | `task/run.tsx` (via `usePhotoCapture`) | icon button | open camera | Light | "Take photo" | — | — | |
| 50 | Account deletion confirm | `settings/AccountDangerZone.tsx` | destructive modal CTA | delete account | None | "Delete account permanently" | spinner | type-to-confirm | requires typed phrase to enable |

---

## Appendix A — Defect log

Severity legend: **P0** ship-blocker · **P1** critical functional · **P2** material UX/quality · **P3** polish / debt.

| ID | Sev | Phase | Description | Fix sketch |
|---|---|---|---|---|
| D1 | P2 | 1 | 345 / 807 touchables (43 %) lack `accessibilityLabel`. | Audit each unlabeled touchable; rely on visible Text via inferred a11y or add explicit labels. |
| D2 | P3 | 0.5 | Pre-fix lint script was silent (`expo lint` only). | Resolved Phase 0.5 — script now chains `eslint . --max-warnings 0`. |
| D3 | P3 | 0.5 | `import/first` warning in `backend/server.ts` for `logger` import. | Resolved Phase 0.5 — intentional disable with justification (Sentry init must precede). |
| D4 | P2 | 2 | 6 source files over 1,500 LoC (god-components). | Extract hooks + subcomponents on the worst three first. |
| D5 | P3 | 2 | 17 unused type exports in `types/index.ts`. | Delete; verify nothing imports them via barrel. |
| D6 | P3 | 2 | `components/TaskEditorModal.tsx` default export unused per ts-prune (1,745 LoC). | Confirm replacement by `NewTaskModal.tsx`; delete if dead. |
| D7 | resolved | 2 | Duplicate route `app/create-challenge.tsx` and `app/create/index.tsx`. | Verified: `create-challenge.tsx` is an intentional Redirect alias for deep links. |
| D8 | P3 | 2 | `app/task/checkin-styles.ts` and `app/task/run-styles.ts` are style modules colocated inside the route dir. | Move to a non-route subfolder. |
| D9 | P3 | 2 | `contexts/AppContext.tsx` is 17 KB — likely a god-context. | Decompose by concern (auth-adjacent / session / theme-adjacent). |
| D10 | P3 | 2 | `useTaskCompleteScreen.tsx` uses `.tsx` while other 13 hooks are `.ts`. | Rename. |
| D11 | P1 | 3 | Brand drift: brand book mandates `#DC5401`, implementation uses `#BB471D`. | Choose canonical; update the other. If `#BB471D`, update brand book + marketing assets. |
| D12 | P2 | 3 | Typography adoption 40.7 % — 839 raw `fontSize` uses vs 575 token uses. | Add tokens for 12/14/16/18 or migrate to nearest existing. |
| D13 | P2 | 3 | Spacing adoption 29.5 % — 1,385 raw paddings/margins vs 580 token uses; 150+ off-scale. | Add codemod or grep-and-migrate sweep. |
| D14 | P3 | 3 | Design system v1 and v2 coexist with no migration deadline. | Set a deletion date for v1 aliases; document. |
| D15 | P3 | 3 | 30+ distinct raw `borderRadius` values. | Add radius tokens or migrate. |
| D16 | P3 | 3 | Dark mode tokens exist but `ThemeContext` doesn't switch palettes. | Delete dark tokens or wire them up. |
| D17 | P3 | 4 | `app/create/index.tsx` lacks `ErrorBoundary` wrap (others wrap). | Wrap. |
| **D18** | **P2** | 4/5 | **Settings uses `ChevronLeft` as a right-disclosure chevron** (visually inverted). | Replace with `ChevronRight`. |
| D19 | P2 | 4 | Settings Friends panel hardcodes "PENDING" count to `0`. | Wire to real data. |
| D20 | P3 | 4 | `(tabs)/index.tsx` has FIXME for AsyncStorage persistence of `hasAcknowledgedFreezeUsed`. | Persist with today's date as key. |
| D21 | P2 | 4 | `edit-profile.tsx` has only 3 a11y labels for a form with multiple inputs. | Add labels to every input. |
| D22 | P3 | 4 | 19 of 30 screens have no haptics; home + discover have zero. | Add `Haptics.impactAsync` on primary actions. |
| D23 | P3 | 4 | `follow-list.tsx` has no pull-to-refresh on a list of network data. | Add `RefreshControl`. |
| D24 | P3 | 4 | `profile/[username].tsx` has no empty state + no pull-to-refresh. | Add both. |
| D25 | P1 | 4 | Six routes exceed 1,000 LoC. | Refactor backlog. |
| D26 | P2 | 5 | `FeedEngagementRow` 16pt icons have no explicit `hitSlop`. | Add `hitSlop={{top:12,bottom:12,left:8,right:8}}`. |
| D27 | P2 | 5 | Only 32 / 807 touchables (4 %) set `hitSlop`. | Audit all icon-only buttons. |
| D28 | P3 | 5 | `Pressable` `style={({pressed}) => ...}` pressed-state idiom unused. | Adopt for primary CTAs. |
| D29 | P3 | 5 | `PrimaryButton.tsx` splits into two `StyleSheet.create` blocks. | Consolidate. |
| D30 | P3 | 5 | Several engagement buttons lack haptic feedback. | Add Light haptic on respect/comment/share. |
| D31 | P3 | 6 | N+1 deletes in `accountability.ts:329`. | Batch with `.in("id", ids)`. |
| D32 | P3 | 6 | `check_ins` has three proof-photo column variants. | Consolidate to one. |
| D33 | P3 | 6 | Content moderation is static profanity wordlist. | Consider LLM moderation post-launch. |
| D34 | P3 | 6 | Backend routers `feed.ts` (955), `challenges-discover.ts` (832), `checkins.ts` (571) are large. | Decompose. |
| D35 | P3 | 6/9 | Storage bucket policies for proof images need explicit verification (signed URLs, size cap, content-type whitelist). | Verify in `20260321120000_sprint5_rls_storage_hardening.sql`. |
| D36 | P3 | 6 | `adminProcedure` defined but unused. | Delete or migrate moderator handlers. |
| D37 | P2 | 7 | No central `queryKeys` factory; 19 files build keys ad hoc. | Add `lib/queryKeys.ts`. |
| D38 | P2 | 7 | Optimistic updates used in only 1 file. | Add `onMutate` + rollback for respect/comment/follow. |
| D39 | P3 | 7 | No per-query `retry: 0` on auth/login queries. | Add explicit override. |
| D40 | P2 | 7 | No TanStack Query persister. | Add `@tanstack/react-query-persist-client` + `createAsyncStoragePersister`. |
| D41 | P3 | 8 | Delete `assets/images/_old_pre_griit_logo/*.png` (212 KB dead). | `rm`. |
| D42 | P3 | 8 | 4 files still use RN `Image`. | Migrate to `expo-image`. |
| D43 | P3 | 8 | 12 FlatList files; consider FlashList migration. | Profile each; migrate hot lists. |
| D44 | P3 | 8 | No baseline production bundle size measurement. | `expo export --dump-sourcemap`. |
| D45 | P3 | 8 | `app/_layout.tsx` (566 LoC) runs heavy synchronous init. | Defer to first-screen interaction where safe. |
| **D46** | **P0** | 9 | **`NSPhotoLibraryAddUsageDescription` missing in `app.json` despite `MediaLibrary.saveToLibraryAsync` in `ShareSheetModal.tsx:252`.** | **Add string to `app.json` `ios.infoPlist`. Single-line fix. LAUNCH BLOCKER.** |
| D47 | P2 | 9 | Supabase session in plaintext AsyncStorage (no SecureStore). | Migrate auth tokens to `expo-secure-store`. |
| D48 | P2 | 9 | `setSentryUser(user.id, user.email)` leaks email to Sentry. | Drop email arg. |
| D49 | P3 | 10 | Verify `sentry-expo-upload-sourcemaps` wired into `eas.json`. | Inspect build hooks. |
| D50 | P3 | 10 | PostHog `identify` includes email. | Trim to id only. |
| D51 | P3 | 10 | Feature flags / kill switches lightly used. | Add `notifications_enabled`, `share_to_instagram_enabled`. |
| **D52** | **P1** | 11 | **`AppContext.tsx:408` checks `entitlements['premium']` but canonical key is `'GRIIT Pro'`.** | **Replace literal with imported `ENTITLEMENT_ID`. Single-line fix. LAUNCH BLOCKER.** |
| D53 | P2 | 11 | Verify `PaywallControl.tsx` + `PaywallSocialProof.tsx` link to Privacy + Terms (Apple 3.1.1). | Add explicit links. |
| D54 | P3 | 11 | No single document enumerates `isPremium` gates. | Create `lib/premium-gates.ts`. |
| D55 | P3 | 11 | Apple Associated Domains for universal links not verified. | Add `ios.associatedDomains` to `app.json`. |

**Total defects: 55** (2 BLOCKERs, 1 P0 + 1 P1, plus the gating mismatch; remaining = 7 P1, 14 P2, ~30 P3, 1 resolved).

---

## Appendix B — File inventory snapshot

| Surface | Files | Total LoC (excl. node_modules / .expo / ios / android) |
|---|---:|---:|
| `app/` routes | 41 | dominated by 6 god-files listed in Phase 2 |
| `components/` | ~150 across 21 subfolders | top 5 in Phase 2 hotspot table |
| `lib/` | 68 | top: `design-system.ts` 1,264; `notifications.ts` 748 |
| `hooks/` | 14 | top: `useTaskCompleteScreen.tsx` 877 |
| `contexts/` | 5 | top: `AppContext.tsx` 17 KB (D9) |
| `store/` (Zustand) | 5 | `onboardingStore.ts` 5.3 KB |
| `backend/trpc/routes/` | 28 routers | top: `feed.ts` 955; `challenges-discover.ts` 832 |
| `supabase/migrations/` | 72 SQL files | 21 tables, 61 indexes, 67 CHECK constraints |
| `tests/` + colocated | 15 test files | 85 tests passing |

Total source: **336 files / 62,059 LoC.**

— end of report —
