# GRIIT — Full Application Audit

**Generated:** 2026-06-22  
**Build:** B20  
**Auditor:** AI static analysis (read-only, no source edits)  
**Scope:** Phases 0–10; evidence gathered via `rg`, `tsc --noEmit`, `vitest run`, file reads  
**Codebase path:** `/Users/yaseenabdela/Developer/GRIIT`

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Routes](#3-frontend-routes)
4. [Backend — Hono & tRPC](#4-backend--hono--trpc)
5. [Data Model](#5-data-model)
6. [State Management](#6-state-management)
7. [Design System](#7-design-system)
8. [Analytics](#8-analytics)
9. [Monetization & Feature Flags](#9-monetization--feature-flags)
10. [Create Flow & Onboarding](#10-create-flow--onboarding)
11. [Tests & Code Quality](#11-tests--code-quality)
12. [App Store Readiness](#12-app-store-readiness)
13. [Technical Debt Index](#13-technical-debt-index)

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Mobile framework** | Expo SDK | 54 |
| **React Native** | React Native | 0.81.5 |
| **React** | React | 19.1.0 |
| **JS engine** | Hermes | (via RN 0.81.5) |
| **Navigation** | Expo Router | (file-based, typed routes) |
| **Backend runtime** | Bun | ≥1.3.9 |
| **Backend framework** | Hono | latest |
| **API layer** | tRPC v11 | latest |
| **Database** | Supabase (PostgreSQL) | latest |
| **Auth** | Supabase Auth | latest |
| **File storage** | Supabase Storage | latest |
| **Server state cache** | TanStack Query v5 | latest |
| **Client state** | Zustand | latest |
| **Subscriptions** | RevenueCat (`react-native-purchases`) | latest |
| **Analytics** | PostHog (`posthog-react-native`) | latest |
| **Error reporting** | Sentry (client + server) | latest |
| **Rate limiting / cache** | Upstash Redis (in-memory fallback) | latest |
| **Build / deploy (mobile)** | EAS (Expo Application Services) | — |
| **Build / deploy (backend)** | Railway + Nixpacks | Node 20 |
| **Type checking** | TypeScript (strict) | latest |
| **Linting** | ESLint (`eslint-config-expo/flat`) | latest |
| **Testing** | Vitest | 2.1.9 |
| **Node requirement** | Node | 20.x |

**Key runtime facts:**
- `newArchEnabled: true` — React Native New Architecture (Fabric + JSI) is on.
- `jsEngine: "hermes"` — Hermes is the JS engine on both iOS and Android.
- Backend is deployed to Railway; entrypoint is `backend/server.ts` → `backend/hono.ts`.
- tRPC is mounted at both `/api/trpc/*` and `/trpc/*` for compatibility.
- `postinstall` script patches `expo-router` after `npm install`.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Expo (React Native)                          │
│                                                                     │
│  app/_layout.tsx (root)                                             │
│    └─ Provider tree:                                                │
│       QueryClientProvider → PostHogProvider → ThemeProvider        │
│         → AuthProvider → PushRegistrationBootstrap                 │
│           → AuthGateProvider → ApiProvider → AppProvider           │
│              └─ AuthRedirector (reads DB: onboarding_completed)    │
│              └─ RootLayoutNav (reads AsyncStorage: same key)       │
│                                                                     │
│  Expo Router file-based navigation                                  │
│    /(tabs)/        — 5-tab bottom nav (Home, Discover, Create,      │
│                       Activity, Feed/Profile)                       │
│    /onboarding/    — 5-step V1 flow (active) or                    │
│                       8-step V2 flow (FLAGS.ONBOARDING_V2=false)   │
│    /auth/          — sign-in, sign-up, create-profile              │
│    /challenge/     — detail, active, commitment, complete           │
│    /paywall        — RevenueCat subscription screen                │
│    /profile/       — public profile view                            │
│    /settings       — user settings                                  │
│    /app/api/       — Expo API Routes (Hono + tRPC handlers)        │
└─────────────────────────────────────────────────────────────────────┘
           │  HTTPS  tRPC over JSON-RPC (Authorization: Bearer <JWT>)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Railway (Node 20)                            │
│                                                                     │
│  backend/server.ts (Sentry init, uncaughtException handler)        │
│  backend/hono.ts                                                    │
│    ├─ CORS, x-response-time, Sentry metrics                        │
│    ├─ /api/health, /health, /api/health/deep                       │
│    ├─ /api/cron/* (CRON_SECRET protected)                          │
│    ├─ /api/oauth/strava/callback                                   │
│    └─ trpcPreMiddleware → trpcServer (/api/trpc/*, /trpc/*)        │
│         └─ backend/trpc/app-router.ts (18 sub-routers)            │
│              └─ create-context.ts                                  │
│                 ├─ JWT verify via supabase.auth.getUser()          │
│                 ├─ User-scoped Supabase client (RLS enforced)      │
│                 ├─ Rate limiting (Upstash Redis / in-memory)       │
│                 └─ protectedProcedure middleware                   │
└─────────────────────────────────────────────────────────────────────┘
           │  supabase-js (RLS)              │  supabase-admin (service role)
           ▼                                 ▼
┌─────────────────────────────────┐  ┌──────────────────────────────┐
│  Supabase (PostgreSQL)          │  │  Upstash Redis               │
│  26 tables, 106 RLS policies    │  │  Rate limiting counters       │
│  Supabase Auth                  │  │  (in-memory fallback if       │
│  Supabase Storage               │  │   REDIS_URL not set)          │
└─────────────────────────────────┘  └──────────────────────────────┘
```

---

## 3. Frontend Routes

### Root Stack (from `app/_layout.tsx`)

| Route | File | Notes |
|---|---|---|
| `(tabs)` | `app/(tabs)/_layout.tsx` | Main 5-tab navigator |
| `onboarding` | `app/onboarding/index.tsx` | V1 or V2 based on flag |
| `auth/login` | `app/auth/login.tsx` | — |
| `auth/signup` | `app/auth/signup.tsx` | Sets `onboarding_completed: true` on DB — see §10 |
| `auth/create-profile` | `app/auth/create-profile.tsx` | — |
| `paywall` | `app/paywall.tsx` | RevenueCat paywall (dismissible) |
| `challenge/[id]` | `app/challenge/[id].tsx` | Challenge detail |
| `challenge/active/[id]` | — | Active challenge view |
| `challenge/commitment/[id]` | — | Join commitment screen |
| `challenge/complete/[id]` | — | Completion screen |
| `profile/[username]` | — | Public profile |
| `settings` | `app/settings.tsx` | — |
| `create` | (legacy) | Renders deprecated `CreateChallengeWizard` |
| `create-team` | **MISSING FILE** | Declared in Stack.Screen, no `.tsx` exists |
| `team-invite` | **MISSING FILE** | Declared in Stack.Screen, no `.tsx` exists |
| `join-team` | **MISSING FILE** | Declared in Stack.Screen, no `.tsx` exists |

### Tab Navigator (from `app/(tabs)/_layout.tsx`)

| Tab | Route | Icon | Visible |
|---|---|---|---|
| Home | `/(tabs)/index` | House | ✅ |
| Discover | `/(tabs)/discover` | Compass | ✅ |
| Create | `/(tabs)/create` | Plus | ✅ |
| Activity | `/(tabs)/activity` | Bell | ✅ |
| Profile | `/(tabs)/profile` | User | ✅ |
| Teams | `/(tabs)/teams` | Users | ❌ `href: null` (hidden) |

### Auth Redirect Logic (`app/_layout.tsx`)

```
On app boot:
  User null → on /auth/* or /onboarding/* ? stay : replace("/auth/login")
  User present, no profile → replace(ROUTES.CREATE_PROFILE)
  User present, profile, onboarding_completed=false → replace("/onboarding")
  User present, profile, onboarding_completed=true → replace(ROUTES.TABS)

  Guard: profile check has 2.5s timeout + 1 retry.
  Secondary: RootLayoutNav reads AsyncStorage for onboarding status independently.
  ⚠️ Two sources of truth for onboarding_completed (DB + AsyncStorage).
```

---

## 4. Backend — Hono & tRPC

### Cron & Utility Endpoints (`backend/hono.ts`)

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /` `/api/health` `/health` | None | Liveness — returns `{ ok: true }` |
| `GET /api/health/deep` | None | Deep health (DB ping) |
| `POST /api/cron/send-reminders` | `?secret=CRON_SECRET` | Morning + streak-at-risk push notifications |
| `POST /api/cron/daily-challenge` | `?secret=CRON_SECRET` | Daily challenge generation |
| `POST /internal/daily-reset` | `x-cron-secret` header | Streak / Last Stand daily reset |
| `GET /api/oauth/strava/callback` | — | Strava OAuth callback |

⚠️ `/api/cron/*` use query param auth; `/internal/daily-reset` uses a header — inconsistent.

### tRPC App Router (`backend/trpc/app-router.ts`)

18 sub-routers mounted:

| Router | Key Procedures |
|---|---|
| `auth` | `signUp`, `signIn`, `getSession` (public) |
| `user` | User account operations |
| `profiles` | `get`, `update`, `getPublicByUsername`, `validateSubscription`, `blockUser`, `unblockUser` |
| `challenges` | `list`, `getFeatured`, `getStarterPack`, `getById` (public); mutations protected |
| `checkins` | `secureDay` — core daily check-in, streak update, Last Stand logic |
| `starters` | Starter challenge packs |
| `streaks` | Streak queries |
| `leaderboard` | `getWeekly` (public read path) |
| `respects` | Give / remove respect on check-ins |
| `nudges` | Send / receive nudges |
| `notifications` | Push notification preferences |
| `accountability` | Accountability partner pairing |
| `feed` | `getLiveFeed`, `list` |
| `achievements` | Achievement milestones |
| `integrations` | Strava token management |
| `sharedGoal` | Shared goal challenges |
| `referrals` | Referral code management |
| `reports` | Content reporting |

### Context & Auth (`backend/trpc/create-context.ts`)

- JWT extracted from `Authorization: Bearer` header.
- `supabase.auth.getUser(token)` verifies the token server-side.
- A **user-scoped** Supabase client is created per request — all DB calls go through this client and RLS applies.
- `protectedProcedure`: throws `UNAUTHORIZED` if `userId` is null.
- Global middleware applies rate limiting and structured logging to every tRPC call.
- `requestId`, `clientIp` included in every log line and error context.

### Rate Limiting (`backend/lib/rate-limit.ts`)

- Per-IP, 60-second sliding windows.
- Uses Upstash Redis if `REDIS_URL` env var is set; falls back to in-memory `Map` if not.
- Two tiers: global limit (every request) + per-route limit (configurable per procedure).

---

## 5. Data Model

### Tables (26 total, all RLS enabled, 106 RLS policies)

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `user_id`, `username`, `bio`, `avatar_url`, `subscription_status`, `subscription_expiry`, `onboarding_completed`, `expo_push_token`, `push_token` | ⚠️ Duplicate push token columns |
| `challenges` | `id`, `title`, `description`, `type`, `duration_days`, `difficulty`, `visibility`, `status`, `participation_type`, `run_status`, `participants_count` | No `goal_type`/`tracking_mode` columns |
| `challenge_tasks` | `challenge_id`, `title`, `type`, `required`, `require_photo_proof`, `strict_timer_mode`, `duration_minutes`, `min_words`, `order_index` | |
| `active_challenges` | `user_id`, `challenge_id`, `status`, `start_date`, `current_streak`, `longest_streak`, `secured_days`, `last_stand_available`, `last_secured_date` | |
| `check_ins` | `user_id`, `active_challenge_id`, `task_id`, `task_mode`, `photo_url`, `secured_at` | |
| `challenge_members` | Team membership | Dual with `active_challenges` — schema debt |
| `activity_events` | `user_id`, `event_type`, `challenge_id`, `metadata` | Feed source |
| `feed_items` | Feed read cache | |
| `leaderboard_entries` | Weekly leaderboard | |
| `notifications` | Push notification log | |
| `nudges` | User-to-user nudges | |
| `respects` | User-to-user respects on check-ins | |
| `referral_codes` | Referral code → user mapping | |
| `reports` | Content reports | |
| `blocked_users` | Block list | |
| `onboarding_answers` | Goal/commitment answers | ⚠️ Added by two migrations (idempotent but duplicated) |
| `stories` | Story posts | ⚠️ No tRPC router; no UI — orphaned |
| `story_views` | Story view log | ⚠️ Same — orphaned |

### Migration Set

- 74 migration files (first: `20250101000000`, latest: `20260621000000`)
- All 26 tables have RLS enabled
- `20260621000000_baseline_schema_core_tables.sql` — **reconstructed baseline** for 4 core tables from code patterns; requires live schema verification against a real Supabase instance
- No `goal_type` or `tracking_mode` columns exist in any migration (related: `FLAGS.RUN_GOAL_CONFIG: false`)

### Schema Debt

| Issue | Detail |
|---|---|
| Duplicate push token columns | `profiles.expo_push_token` and `profiles.push_token` both exist — unclear which is canonical |
| Orphaned `stories`/`story_views` | Tables + RLS policies, no router, no UI |
| Dual team membership tables | `challenge_members` and `active_challenges` both track team membership |
| `onboarding_answers` added twice | Two migrations add same column; `IF NOT EXISTS` guard makes it harmless |
| Reconstructed baseline | `20260621000000` was machine-generated, not sourced from a live DB dump |

---

## 6. State Management

### Two-layer model

```
Server state  →  TanStack Query (QueryClient)
Client state  →  Zustand stores
```

### TanStack Query

- `QueryClientProvider` wraps the full app.
- `defaultOptions`: staleTime 30s, 2 retries, retry delay capped at 10s.
- `MutationCache.onError`: global mutation error handler (Sentry capture + optional inline error display).
- Query keys used: `["home"]`, `["profile"]`, `["discover"]`, `["pro-status"]`.

### Zustand Stores

| Store | Purpose | Persistence |
|---|---|---|
| `onboardingStore` | Onboarding step, selected goals, profile hints | AsyncStorage (`griit-onboarding`) |
| `celebrationStore` | Post-secureDay celebration modal visibility | — |
| `themeStore` | (if present) App theme | — |

### `AppContext` (critical anti-pattern)

`AppContext` is a React context wrapping a large `useState` object that holds server data:

```
profile, stats, activeChallenge, todayCheckins, isPremium
```

These are **loaded once and held in React state** — not in the TanStack Query cache. This means:
- No automatic revalidation
- No cache deduplication
- No optimistic update support
- Updates to these values don't trigger TQ cache invalidation elsewhere

**Most mutations call `trpcMutate()` directly** (not `useMutation`), bypassing the `MutationCache.onError` global handler. `useLeaveChallenge` is a known exception that does use `useMutation`.

**Multiple `AppContext` methods are no-ops** (stubs for chat/verification features that were never shipped or were removed).

### `ApiContext`

Manages API health state. `lastStatusCode` is defined but its setter is never called from `runHealthCheck` — the diagnostic value is always `null`.

---

## 7. Design System

### Three-generation token system (`lib/design-system.ts`, 1,486 lines)

| Generation | Token object | Usage share | Status |
|---|---|---|---|
| V1 | `DS_COLORS`, `DS_RADIUS`, `DS_SPACING`, `DS_MEASURES`, `DS_TYPOGRAPHY` | ~60% of call sites | Legacy, still dominant |
| V2 | `DS_COLORS_V2`, `DS_TYPE`, `DS_FONTS` | ~14% | Transitional |
| Daylight | `DS_DAYLIGHT` | ~26% | Newest, used in V2 wizard and new screens |

### `lib/theme-palettes.ts`

- Defines `LIGHT_THEME` as camelCase aliases over `DS_COLORS`.
- Comment explicitly states: **"GRIIT is always light mode. No dark mode."**
- `app.json` declares `"userInterfaceStyle": "automatic"` — **contradiction** (see §12).
- Dead dark theme tokens exist in `DS_COLORS` but are never used.

### Hardcoded typography

- **824 instances** of hardcoded `fontSize:` values found in `app/`, `components/`.
- `DS_TYPOGRAPHY` token adoption is low.

---

## 8. Analytics

### PostHog (`lib/posthog.ts`, `lib/analytics.ts`)

- Client: `posthog-react-native`, conditionally initialized if `EXPO_PUBLIC_POSTHOG_API_KEY` is set.
- Dev tracking controlled by `EXPO_PUBLIC_POSTHOG_ENABLE_DEV`.
- Two call paths:
  - `track(TypedEvent)` — type-safe, enforced by `AnalyticsEvent` union (99 event names)
  - `trackEvent(string, props)` — untyped, bypasses schema

### Event coverage

| Status | Count | Examples |
|---|---|---|
| Defined AND emitted | 67 | `challenge_created`, `day_secured`, `paywall_viewed` |
| **Defined but NEVER emitted** | **32** | `day1_task_completed`, `day1_secured`, `onboarding_dropped`, purchase events |
| Emitted untyped via `trackEvent()` | 16 | `clipboard_image`, `instagram_story`, `paywall_viewed` (duplicate!) |

### Silent events (sample — 32 total)

Critical missing instrumentation includes:
- `day1_task_completed`, `day1_secured` — Day 1 completion funnel blind spot
- `onboarding_dropped` — no dropout visibility
- `subscription_cancelled`, `subscription_expired`, `trial_converted` — revenue funnel gaps
- `challenge_abandoned` — retention signal missing

### Paywall A/B test

PostHog feature flag `"paywall_variant"` assigns users to `"control"` (PaywallControl) or `"social_proof"` (PaywallSocialProof). Variant is logged to PostHog on each paywall mount.

---

## 9. Monetization & Feature Flags

### Feature Flags (`lib/feature-flags.ts`)

| Flag | Value | Notes |
|---|---|---|
| `IS_BETA` | `true` | App in beta |
| `LOCATION_CHECKIN_ENABLED` | **`false`** | Location task shows "Coming soon" |
| `PREMIUM_ENABLED` | `true` | Premium active |
| `PREMIUM_CHALLENGE_PACKS` | `true` | Gated |
| `PREMIUM_ANALYTICS` | `true` | Gated |
| `PREMIUM_PROFILE_FEATURES` | `true` | Gated |
| `PREMIUM_INTEGRATIONS` | **`false`** | Strava/health disabled |
| `PR3_IMAGE_VIEWER` | `true` | Full-screen photo viewer live |
| `PR3_FEED_DEDUPE` | `true` | Feed deduplication live |
| `PR3_ZERO_STATE_GATES` | `true` | Hide streak UI when streak=0 |
| `PR3_HOME_STATE_ANALYTICS` | `true` | `home_state_viewed` analytics live |
| `RUN_GOAL_CONFIG` | **`false`** | No DB schema; feature intentionally blocked |
| `ONBOARDING_V2` | **`false`** | Not device-verified; V1 active |

### Free Tier Limits (`lib/feature-flags.ts`)

| Limit | Value | Server-enforced? |
|---|---|---|
| `MAX_ACTIVE_CHALLENGES` | 3 | ✅ `challenges-join.ts` (hardcoded mirror) |
| `MAX_CREATED_CHALLENGES` | 1 | ✅ `challenges-create.ts` (hardcoded mirror) |
| `MAX_DAILY_RESPECTS` | 5 | ⚠️ Defined — enforcement in backend UNVERIFIED |
| `MAX_DAILY_NUDGES` | 3 | ⚠️ Defined — enforcement in backend UNVERIFIED |

⚠️ Server-side hardcoded constants duplicate client-side `FREE_LIMITS` values. Drift risk if one is updated without the other.

### RevenueCat

- **Entitlement ID:** `"GRIIT Pro"` (hardcoded in `lib/subscription.ts` and `backend/trpc/routes/profiles.ts`)
- **Product IDs:** fetched at runtime from RC offerings — not hardcoded
- **Default package selection:** annual (if present), else first
- **Trial detection:** `entitlement.periodType.toLowerCase() === "trial" || "intro"`
- **Post-purchase:** fires `trial_started` or `subscription_started` event; calls `validateSubscription` tRPC mutation (best-effort, failure silently ignored)
- **Expo Go guard:** `Constants.appOwnership === "expo"` → RC SDK not loaded

### Paywall Entry Points (4)

| Trigger | Location |
|---|---|
| Join limit exceeded | `app/challenge/[id].tsx` |
| Create limit exceeded | `components/create/CreateWizardV2.tsx` |
| Settings upgrade CTA | `app/settings.tsx` |
| After account creation (V2 onboarding, currently OFF) | `components/onboarding/v2/OnboardingFlowV2.tsx` |

The paywall has a close button on both variants — it is **dismissible**, not a hard gate.

### Premium State Flow

```
RevenueCat SDK init (initializeRevenueCat)
  → getCustomerInfo() → check ENTITLEMENT_ID
  → setSubscriptionState(status, expiry) [in-memory, lib/premium.ts]
  → syncSubscriptionToSupabase() [writes profiles.subscription_status]
  → validateSubscription tRPC [best-effort DB sync]
  → addCustomerInfoUpdateListener (real-time RC updates)

Server premium check (challenges-join.ts):
  → reads profiles.subscription_status from Supabase DB
  → "premium" or "trial" → unlimited; else → enforce limit

lib/premium.ts canJoinChallenge():
  → exported but NO CALL SITES found — effectively dead code
```

---

## 10. Create Flow & Onboarding

### Create Flow — Two Wizards

#### `CreateWizardV2` (ACTIVE — `/(tabs)/create`)

3 steps: **Basics** → **Tasks** → **Rules**

| Step | Validation gating |
|---|---|
| Step 1 → 2 | `title.trim().length >= 3` AND `durationDays >= 1` |
| Step 2 → 3 | Custom tasks: at least 1 task; Pack: pack selected |
| Step 3 → submit | Steps 1+2 valid |

**Payload sent to `challenges.create`:**

- `type`: hardcoded `"standard"`
- `description`: hardcoded `""`
- `replayPolicy`: hardcoded `"ALLOW_REPLAY"`
- `participationType`: `"solo"` or `"team"` (group = team of 10)
- `visibility`: group → `"FRIENDS"`, solo → `"PUBLIC"`
- Run goal fields (`goal_type`, `tracking_mode`): **intentionally dropped** (no DB schema)
- Photo proof: `require_photo_proof = (photoProof === "required" || difficulty === "hard" || task.requirePhoto)`
- Timer: `strict_timer_mode = (difficulty === "hard" && task.type === "timer")`

**After success:** invalidates `["home"]`, `["profile"]`, `["discover"]` TQ cache; routes to `ROUTES.CHALLENGE_ACTIVE(id)`.

**Draft persistence:** None — all state in local `useState`. Backgrounding or crash discards input.

#### `CreateChallengeWizard` (DEPRECATED — `/create`)

- 4 steps: Basics → Tasks → Rules → Review
- Has AsyncStorage draft persistence via `useCreateChallengeWizardPersistence`
- Has `DraftExitModal` offering "Save Draft"
- `who: "solo" | "duo" | "squad"` — duo option not in V2
- Comment on line 1: `// DEPRECATED: replaced by CreateWizardV2.tsx. Remove after one production cycle.`

### Onboarding — Two Flows

#### V1 `OnboardingFlow` (ACTIVE — `FLAGS.ONBOARDING_V2 = false`)

| Step | Screen | Persists |
|---|---|---|
| 0 | `ValueSplash` | — |
| 1 | `GoalSelection` | `onboardingStore` (Zustand + AsyncStorage) |
| 2 | `SignUpScreen` | Supabase Auth |
| 3 | `ProfileSetup` | DB: `profiles.onboarding_completed = false` |
| 4 | `AutoSuggestChallengeScreen` | DB: `profiles.onboarding_completed = true` |

**Completion:** `AutoSuggestChallengeScreen` writes DB → callback → `finishOnboarding()` writes AsyncStorage → `router.replace(ROUTES.TABS)`.

#### V2 `OnboardingFlowV2` (OFF — `FLAGS.ONBOARDING_V2 = true`)

8 steps: Welcome → WhyProof → WhyCircle → Goals → Commitment → Reminders → Account → FirstChallenge

Between Account and FirstChallenge: pushes to `/paywall?source=onboarding`.

**Completion path:** `completeOnboardingV2()` writes both AsyncStorage AND DB, then routes to `ROUTES.CREATE_WIZARD`.

### Onboarding State Map

| Key | Store | Written by | Read by |
|---|---|---|---|
| `"onboarding_completed"` | AsyncStorage | `OnboardingFlow.finishOnboarding()`, `completeOnboardingV2()` | `_layout.tsx RootLayoutNav` |
| `profiles.onboarding_completed` | Supabase DB | `AutoSuggestChallengeScreen`, `completeOnboardingV2()`, **`app/auth/signup.tsx`** | `_layout.tsx AuthRedirector` |
| `"griit-onboarding"` | AsyncStorage (Zustand) | `onboardingStore` mutations | V1 `OnboardingFlow` |
| `"griit_onboarding_answers"` | AsyncStorage | UNVERIFIED write location | UNVERIFIED |

### Onboarding Risk: `app/auth/signup.tsx` premature DB write

`app/auth/signup.tsx` sets `profiles.onboarding_completed = true` during account creation — before the user completes any onboarding steps. Users who land in the signup screen directly (not via `OnboardingFlow`) get marked as onboarding-complete in the DB immediately. `AuthRedirector` won't redirect them to onboarding, but `RootLayoutNav` will (AsyncStorage is blank). Result: inconsistent redirect behavior for this user cohort.

---

## 11. Tests & Code Quality

### Test Results (last run: 2026-06-22)

```
 Test Files  16 passed (16)
      Tests  91 passed (91)
   Duration  898ms
```

### TypeScript & Lint

```
tsc --noEmit       → 0 errors   ✅
eslint --max-warnings 0 → 0 warnings ✅
```

**TypeScript config:** `strict: true`, `noUncheckedIndexedAccess: true`, `noUnusedLocals: true`, `noUnusedParameters: true`

### Test Coverage by Module

| Area | Test files | Routes tested / total |
|---|---|---|
| Backend routes | 5 (`blocking`, `challenges-create`, `last-stand`, `accountability`, `nudges`) | 5 / 23 |
| Backend lib | 2 (`streak`, `progression`) | — |
| Client lib | 5 (`api`, `formatTimeAgo`, `home-state`, `time-enforcement`, `trpc-errors`) | — |
| Flow / integration | 2 (`critical-paths`, `edge-cases`) — mocked Supabase | — |
| Design system | 1 (`design-system-contrast`) | — |
| Task progress | 1 | — |
| **React Native components** | **0** | — |
| **Screens (`app/`)** | **0** | — |
| **Hooks** | **0** | — |

### Untested tRPC Routes (18 / 23)

`auth`, `challenges`, `challenges-discover`, `challenges-join`, `checkins`, `feed`, `integrations`, `leaderboard`, `notifications`, `profiles`, `profiles-social`, `profiles-stats`, `referrals`, `reports`, `respects`, `sharedGoal`, `starters`, `streaks`, `user`

Critical paths without tests: `checkins.secureDay`, `streaks`, `leaderboard`, `feed.getLiveFeed`, `respects`.

### Mock Quality

`tests/flows/critical-paths.test.ts` uses a static flat Supabase mock that does not chain `.order()`, `.range()`, or `.count()`. Several real procedures fail with `INTERNAL_SERVER_ERROR` during test runs (`.order is not a function`) — tests pass because they only assert on error shape, not procedure correctness.

### TODO / FIXME Markers (4)

| File | Tag | Description |
|---|---|---|
| `components/onboarding/v2/screens/GoalsScreen.tsx` | `TODO(onboarding-v2)` | Goals → pack mapping not wired |
| `components/create/CreateWizardV2.tsx` | `TODO(run-backend)` | Run goal fields intentionally dropped (no DB schema) |
| `components/create/CreateWizardV2.tsx` | (related) | Distance/pace/time derivation constraints |
| `components/create/NewTaskSheet.tsx` | `TODO(profile-unit)` | Distance unit should come from user profile |

### Manual Test Checklist

`tests/MANUAL_TEST_CHECKLIST.md` — 46 items across 12 sections (First Launch, Home, Discover, Challenge Detail, Create, Profile, Daily Challenges, Auth, Push Notifications, Deep Links, Error Handling, Edge Cases). All items unchecked. No completion date or tester recorded. No evidence of a completed run for B20.

---

## 12. App Store Readiness

### iOS (`app.json`)

| Item | Status | Risk |
|---|---|---|
| `privacyManifests` | ❌ **MISSING** | **BLOCKING** — Apple requires `PrivacyInfo.xcprivacy` for apps using SDK APIs that access `UserDefaults`, `NSFileManager`, etc. RevenueCat, Supabase, and PostHog all trigger this. Required since May 2024. |
| `userInterfaceStyle: "automatic"` | ❌ **WRONG** | **BLOCKING** — App is light-only (`theme-palettes.ts`: "GRIIT is always light mode"). `"automatic"` enables system dark mode, rendering the app with undesigned dark styles. Should be `"light"`. |
| `associatedDomains` | ❌ MISSING | Universal Links non-functional. Share links use custom URL scheme fallback. |
| `runtimeVersion` + `updates` | ❌ MISSING | No EAS Update (OTA) configured. Hotfixes require full App Store build + review cycle. |
| `NSCameraUsageDescription` | ✅ Set | Correct description |
| `NSPhotoLibraryUsageDescription` | ✅ Set | Correct description |
| `NSUserTrackingUsageDescription` | ✅ Set | "anonymized usage data" |
| `NSLocationWhenInUseUsageDescription` | ⚠️ Set, feature disabled | Location feature off (`FLAGS.LOCATION_CHECKIN_ENABLED: false`). Permission string declared for non-functional feature may prompt App Store reviewer questions. |
| `ITSAppUsesNonExemptEncryption` | ✅ `false` | Correct |
| `NSSupportsLiveActivities` | ✅ Set | Declared, but no Live Activity widget found in repo |
| `bundleIdentifier` | ✅ `app.griit.challenge-tracker` | — |
| `buildNumber` | Managed by EAS | ✅ `appVersionSource: "remote"` in `eas.json` |

### Android (`app.json`)

| Permission | Status |
|---|---|
| `CAMERA` | ✅ |
| `READ_EXTERNAL_STORAGE` | ⚠️ Deprecated for Android 13+ (API 33+). Should use `READ_MEDIA_IMAGES`. |
| `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` | ⚠️ Feature disabled, permissions declared. |
| `VIBRATE` | ✅ |

### EAS Build Profiles (`eas.json`)

| Profile | Notes |
|---|---|
| `development` | Dev client, iOS simulator or device |
| `development-simulator` | Simulator only |
| `preview` | Internal distribution |
| `production` | `autoIncrement: true`, `appVersionSource: "remote"` |

---

## 13. Technical Debt Index

Severity: **P0** = Blocking / data corruption risk | **P1** = User-visible bug | **P2** = Architecture debt | **P3** = Quality / cleanup

| # | Severity | Area | Description |
|---|---|---|---|
| 1 | **P0** | App Store | `privacyManifests` missing — will block App Store submission with current SDK set |
| 2 | **P0** | App Store | `userInterfaceStyle: "automatic"` — dark mode renders app with zero dark-mode styles |
| 3 | **P1** | Onboarding | `app/auth/signup.tsx` sets `profiles.onboarding_completed = true` before onboarding is done; DB and AsyncStorage diverge |
| 4 | **P1** | Onboarding | Reinstall clears AsyncStorage; `RootLayoutNav` redirects completed users back to onboarding |
| 5 | **P1** | Onboarding | V2 paywall purchase routes to tabs, bypassing `completeOnboardingV2()` — `profiles.onboarding_completed` stays `false` |
| 6 | **P1** | Create flow | V2 wizard has no draft persistence — backgrounding or crash loses all input |
| 7 | **P1** | Create flow | `/create` route still serves deprecated `CreateChallengeWizard` (different UX from tab wizard) |
| 8 | **P1** | Navigation | `create-team`, `team-invite`, `join-team` declared in root Stack but no route files exist — 404 if navigated |
| 9 | **P1** | Monetization | `lib/premium.ts` `canJoinChallenge()` has no call sites — client-side join limit check is dead code |
| 10 | **P1** | Monetization | `MAX_DAILY_RESPECTS` / `MAX_DAILY_NUDGES` defined in `FREE_LIMITS` but enforcement in backend routes UNVERIFIED |
| 11 | **P1** | State | `AppContext` holds server data (`profile`, `stats`, `activeChallenge`) in `useState`, bypassing TanStack Query cache (no revalidation, no deduplication) |
| 12 | **P1** | Analytics | 32 defined `AnalyticsEvent` names never emitted — Day 1 funnel, onboarding dropout, and subscription events are blind spots |
| 13 | **P2** | Backend | Cron secret auth inconsistent: `/api/cron/*` uses query param `?secret=`; `/internal/daily-reset` uses `x-cron-secret` header |
| 14 | **P2** | Backend | CORS origin defaults to `"*"` when `CORS_ORIGIN` env var is unset — effectively open CORS in production |
| 15 | **P2** | State | Most mutations call `trpcMutate()` directly (not `useMutation`), bypassing `MutationCache.onError` global handler |
| 16 | **P2** | State | `ApiContext.lastStatusCode` setter never called from `runHealthCheck` — always `null` |
| 17 | **P2** | Database | `profiles` has both `expo_push_token` and `push_token` — canonical column unclear |
| 18 | **P2** | Database | `stories` / `story_views` tables have RLS policies but no router or UI — orphaned |
| 19 | **P2** | Database | `challenge_members` and `active_challenges` both track team membership — redundant |
| 20 | **P2** | Database | `20260621000000_baseline_schema_core_tables.sql` is reconstructed (not sourced from live DB dump) — requires live verification |
| 21 | **P2** | Design system | Three token generations (`DS_COLORS` / `DS_COLORS_V2` / `DS_DAYLIGHT`) in one 1,486-line file — V1 still 60% of call sites |
| 22 | **P2** | Design system | 824 hardcoded `fontSize:` values — `DS_TYPOGRAPHY` adoption low |
| 23 | **P2** | Analytics | 16 events fired via untyped `trackEvent(string)` — bypass `AnalyticsEvent` schema |
| 24 | **P2** | Monetization | Server-side free limits hardcoded separately from `FREE_LIMITS` client constants — drift risk |
| 25 | **P2** | Features | `FLAGS.RUN_GOAL_CONFIG: false` — feature blocked on missing DB schema (`goal_type`/`tracking_mode` columns don't exist) |
| 26 | **P2** | Onboarding | `ONBOARDING_ANSWERS` storage key defined but no write site found |
| 27 | **P3** | Create flow | `CreateChallengeWizard` (V1) marked deprecated but not removed |
| 28 | **P3** | Tests | 18 / 23 backend routes have no dedicated tests; zero component or hook tests |
| 29 | **P3** | Tests | Flow test Supabase mocks are too flat — many real procedures fail to `INTERNAL_SERVER_ERROR` silently during test run |
| 30 | **P3** | Tests | Manual test checklist exists but has no recorded completion for any build |
| 31 | **P3** | AppStore | `NSLocationWhenInUseUsageDescription` / location permissions declared with feature disabled |
| 32 | **P3** | AppStore | `READ_EXTERNAL_STORAGE` deprecated for Android 13+ |
| 33 | **P3** | AppStore | No `associatedDomains` — Universal Links non-functional |
| 34 | **P3** | AppStore | No `runtimeVersion` / `updates` — OTA (EAS Update) not configured |
| 35 | **P3** | Features | Teams tab hidden (`href: null`); `expo-live-activity` plugin installed with no verifiable widget implementation |

---

*End of audit. All findings are derived from static analysis only. Confirm P0/P1 items against a live build before actioning.*
