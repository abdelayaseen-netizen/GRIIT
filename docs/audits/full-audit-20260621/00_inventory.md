# 00 — Baseline & Full Inventory

> Full-app audit (READ-ONLY recon). Phase 0 of 10.
> Part of `docs/audits/full-audit-20260621/`.

## Audit metadata

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Branch audited | `feat/onboarding` |
| HEAD commit | `953bccb` (feat(onboarding): fix 2 — Google sign-in on AccountScreen) |
| Base | branched from `main` @ `b801d75` |
| Mode | Read-only. Only artifacts created: markdown under `docs/audits/full-audit-20260621/`. |

> **⚠ Branch note (confirm before Phase 1):** This audit is running against `feat/onboarding`,
> the currently checked-out branch. It includes the flag-gated `OnboardingFlowV2` work
> (`FLAGS.ONBOARDING_V2 = false`). If you intended the audit to run against `main` or a
> dedicated audit branch (e.g. `chore/overnight-audit-20260618`), say so and I will re-baseline.
> The `archivo`/font-weight migration called out as "known App-Store-disqualifying" was **not**
> merged into this branch's base (`main`), so it is not expected here — confirmed in later phases.

---

## 1. Baseline tool results

| Tool | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `tsc --noEmit` | **0** | **0 errors** — clean |
| Lint | `eslint . --ext .ts,.tsx --max-warnings 0` | **1** | **1 problem (0 errors, 1 warning)** — warning trips the `--max-warnings 0` gate |
| Knip | `npx knip` | **1** | 35 unused files · 80 unused exports · 74 unused exported types · 29 duplicate exports · 2 unused devDeps · 2 unlisted deps · 1 unresolved import |
| Tests | `vitest run` | **0** | **15 files / 85 tests passed**, 0 failed |

### Typecheck
`tsc --noEmit` → exit 0, zero `error TS` lines. Clean.

### Lint
`eslint . --ext .ts,.tsx --max-warnings 0` → exit 1. Single warning:

```
components/onboarding/v2/screens/CommitmentScreen.tsx
  3:8  warning  Using exported name 'StreakFlame' as identifier for default import  import/no-named-as-default
✖ 1 problem (0 errors, 1 warning)
ESLint found too many warnings (maximum: 0).
```

- 0 errors. The lone warning is in onboarding-v2 code (`CommitmentScreen.tsx:3`), and because the gate is `--max-warnings 0`, it makes `npm run lint` fail.
- Caveat: the npm `lint` script is `expo lint && eslint …`; the strict ESLint gate (above) was captured directly. `expo lint`'s own output was not separately captured this phase.

### Knip (`npx knip`, exit 1)

| Category | Count |
|---|---|
| Unused files | 35 |
| Unused devDependencies | 2 (`depcheck`, `ts-prune`) |
| Unlisted dependencies | 2 (`expo-system-ui` @ `app.json`; `docx` @ `scripts/audit/build_scorecard.mjs:28`) |
| Unresolved imports | 1 (`babel-preset-expo` @ `babel.config.js`) |
| Unused exports | 80 |
| Unused exported types | 74 |
| Duplicate exports | 29 (mostly `Name|default` — a default + named export of the same screen) |
| Configuration hints | 21 (knip.json ignore-list drift) |

> Caveat for Phases 4/8: many "unused exports / duplicate exports" are `default` exports of
> Expo-Router and screen components that knip cannot see consumed via the router / default
> imports. These need cross-referencing before being called truly dead (done in Phase 8).
> Genuinely dead-looking files (e.g. `components/home/StreakHeroV2.tsx`, `components/home/HomeHeader.tsx`,
> `lib/prefetch-queries.ts`) align with the known debt shelf.

### Tests (`vitest run`, exit 0)
- **15 test files passed, 85 tests passed, 0 failed.** Duration ~0.8s.
- **No `pino` import failures observed on this run** (the known pre-existing failure did not surface here).
- The `INTERNAL_SERVER_ERROR` log lines in `tests/flows/edge-cases.test.ts` / `critical-paths.test.ts`
  (e.g. `ctx.supabase.from(...).upsert is not a function`) are **intentional negative-path mocks**
  inside tests that pass — not failures. Noted for Phase 7/8 follow-up.

---

## 2. Inventory counts

| Category | Count |
|---|---|
| App route files (`app/**/*.tsx`) | 38 |
| — of which `_layout.tsx` | 6 |
| App `.ts`+`.tsx` total | 42 |
| Route constants file | `lib/routes.ts` (1) |
| Zustand stores (`store/*.ts`) | 6 |
| Contexts (`contexts/*`) | 5 |
| tRPC route files (`backend/trpc/routes/*.ts`, excl. tests) | 23 |
| tRPC procedures (`.query(`/`.mutation(` call sites) | 113 |
| Backend non-tRPC routes (Hono) | 8 endpoints + 2 tRPC mounts |
| SQL migrations (`supabase/migrations/*.sql`) | 72 |
| Components (`components/**/*.tsx`) | 164 |
| Hooks (`hooks/*`) | 14 |
| Feature flags (`FLAGS.*`) | 13 (+ 4 `FREE_LIMITS`) |

---

## 3. File lists

### App routes (38 `.tsx`, incl. 6 layouts)
```
app/_layout.tsx                                  (root layout)
app/+not-found.tsx
app/(tabs)/_layout.tsx                           (tab layout)
app/(tabs)/index.tsx        — Home
app/(tabs)/discover.tsx     — Discover
app/(tabs)/activity.tsx     — Activity
app/(tabs)/create.tsx       — Create (tab)
app/(tabs)/profile.tsx      — Profile
app/(tabs)/teams.tsx        — Teams (tab present in tree)
app/auth/_layout.tsx
app/auth/login.tsx
app/auth/signup.tsx
app/auth/forgot-password.tsx
app/onboarding/_layout.tsx
app/onboarding/index.tsx                         (flag-switched OnboardingFlow / OnboardingFlowV2)
app/create/_layout.tsx
app/create/index.tsx
app/create-challenge.tsx
app/create-profile.tsx
app/legal/_layout.tsx
app/legal/privacy-policy.tsx
app/legal/terms.tsx
app/challenge/[id].tsx
app/challenge/active/[activeChallengeId].tsx
app/challenge/complete.tsx
app/discover/category/[slug].tsx
app/task/checkin.tsx
app/task/complete.tsx
app/task/run.tsx
app/post/[id].tsx
app/profile/[username].tsx
app/invite/[code].tsx
app/follow-list.tsx
app/accountability.tsx
app/accountability/add.tsx
app/edit-profile.tsx
app/settings.tsx
app/paywall.tsx
```

### Zustand stores (6)
```
store/activeSessionStore.ts
store/celebrationStore.ts
store/feedToggleStore.ts
store/notificationPrefsStore.ts
store/onboardingStore.ts
store/proofSharePromptStore.ts
```

### Contexts (5)
```
contexts/ApiContext.tsx
contexts/AppContext.tsx
contexts/AuthContext.tsx
contexts/AuthGateContext.tsx
contexts/ThemeContext.tsx
```

### tRPC route files (23)
```
accountability.ts  achievements.ts  auth.ts  challenges-create.ts  challenges-discover.ts
challenges-join.ts  challenges.ts  checkins.ts  feed.ts  integrations.ts  leaderboard.ts
notifications.ts  nudges.ts  profiles-social.ts  profiles-stats.ts  profiles.ts  referrals.ts
reports.ts  respects.ts  sharedGoal.ts  starters.ts  streaks.ts  user.ts
```
(113 `.query`/`.mutation` procedures across these files — enumerated per-router in Phase 4.)

### Backend non-tRPC routes (`backend/hono.ts`)
```
GET  /                          backend/hono.ts:50   status
GET  /api/health, /health       backend/hono.ts:71-72 liveness
GET  /api/health/deep           backend/hono.ts:106  deep health
GET  /api/cron/send-reminders   backend/hono.ts:109  cron
GET  /api/cron/daily-challenge  backend/hono.ts:129  cron
POST /internal/daily-reset      backend/hono.ts:149  daily reset (CRON_SECRET)
GET  /api/auth/strava/callback  backend/hono.ts:175  OAuth callback
USE  /api/trpc/*, /trpc/*        backend/hono.ts:226-238 tRPC mounts
```

### Hooks (14)
```
useAppChallengeMutations.ts  useCelebration.ts  useCreateChallengeWizardPersistence.ts
useInlineError.ts  useJournalInput.ts  useNetworkStatus.ts  useNotificationScheduler.ts
usePhotoCapture.ts  useProStatus.ts  useReduceMotion.ts  useScreenTracker.ts
useTaskCompleteScreen.tsx  useTaskCompleteShareCardProps.ts  useTaskTimer.ts
```

### Components by subdirectory (164 total)
```
15 home          15 (root)       12 shared        12 profile       10 ui
 9 challenge      8 task/bodies   8 skeletons      8 onboarding/v2/screens
 8 discover       8 create        6 challenges     5 typography     5 task
 5 onboarding/screens   5 feed    4 discover/grid  4 create/steps
 3 settings       3 create/v2     2 share          2 paywall
 2 onboarding/v2  2 onboarding    2 activity       1 cards
```

### Feature flags (`lib/feature-flags.ts`)
```
IS_BETA: true                      LOCATION_CHECKIN_ENABLED: false   ← gated OFF
PREMIUM_ENABLED: true              PREMIUM_CHALLENGE_PACKS: true
PREMIUM_ANALYTICS: true            PREMIUM_PROFILE_FEATURES: true
PREMIUM_INTEGRATIONS: false        ← gated OFF
PR3_IMAGE_VIEWER: true             PR3_FEED_DEDUPE: true
PR3_ZERO_STATE_GATES: true         PR3_HOME_STATE_ANALYTICS: true
RUN_GOAL_CONFIG: false             ← intentionally gated (known)
ONBOARDING_V2: false               ← intentionally gated (this branch's new flow)
FREE_LIMITS: MAX_ACTIVE_CHALLENGES=3, MAX_CREATED_CHALLENGES=1, MAX_DAILY_RESPECTS=5, MAX_DAILY_NUDGES=3
```

### SQL migrations
72 files under `supabase/migrations/` — enumerated and analyzed for RLS/policy coverage in
Phase 5 (`05_supabase.md`).

---

## Phase 0 verdict

- Build/type: **clean** (tsc 0).
- Lint: **1 warning** fails the zero-warning gate (`CommitmentScreen.tsx:3`, onboarding-v2).
- Knip: substantial unused-surface signal (35 files / 80 exports / 74 types) — to be triaged in Phase 8.
- Tests: **all 85 pass**; no pino failure this run.

**STOP — awaiting "go" for Phase 1 (Navigation & routing graph).**
