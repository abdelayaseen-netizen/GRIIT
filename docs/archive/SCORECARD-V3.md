# GRIIT Codebase Scorecard v3 (Post Hard Mode)

**Date:** April 3, 2026  
**Commit:** `3e224ab6bd4e9de2f1026e8e3cea8ed257fc3eb5`

This scorecard is **evidence-gated**: metrics below were produced by running commands on the repo at the commit above (PowerShell on Windows unless noted). **No code was changed** for this audit.

## Summary

| # | Category | Weight | Score (/10) | Weighted |
|---|----------|--------|-------------|----------|
| 1 | Frontend Architecture | 7% | 3 | 0.21 |
| 2 | Backend Architecture | 7% | 6 | 0.42 |
| 3 | Type Safety | 5% | 8 | 0.40 |
| 4 | Design System Compliance | 5% | 4 | 0.20 |
| 5 | Performance | 7% | 6 | 0.42 |
| 6 | Error Handling | 5% | 7 | 0.35 |
| 7 | Analytics & Tracking | 5% | 5 | 0.25 |
| 8 | Security & RLS | 8% | 7 | 0.56 |
| 9 | Monetization / RevenueCat | 6% | 8 | 0.48 |
| 10 | Test Coverage | 4% | 5 | 0.20 |
| 11 | Code Hygiene | 4% | 5 | 0.20 |
| 12 | Database & Migrations | 5% | 8 | 0.40 |
| 13 | Navigation & Routing | 5% | 9 | 0.45 |
| 14 | Launch Readiness | 7% | 8 | 0.56 |
| — | **WEIGHTED TOTAL** | **80%** | — | **5.10 → ~6.4 / 10** |

**Normalized overall:** `5.10 ÷ 0.80 ≈ 6.4/10` on the weighted rubric.  
*(Remaining 20% = real-device testing, user testing, App Store review — not measurable via grep.)*

---

## Detailed Findings

### Category 1: Frontend Architecture (7%) — **Score: 3/10**

**Commands / output**

```text
Total TS/TSX in app,components,contexts,hooks,store,lib,styles,types: 257

Files >500 lines (app + components *.tsx):
1682 lines: CreateChallengeWizard.tsx
1586 lines: TaskEditorModal.tsx
1579 lines: complete.tsx
1498 lines: activity.tsx
1399 lines: NewTaskModal.tsx
949 lines: settings.tsx
838 lines: profile.tsx
808 lines: index.tsx
803 lines: discover.tsx
788 lines: run.tsx
623 lines: LiveFeedSection.tsx
572 lines: journal.tsx
538 lines: paywall.tsx
535 lines: checkin.tsx
530 lines: signup.tsx

Screens (*.tsx under app): 43
Components (*.tsx under components): 115

React.memo matches (components *.tsx): 46
useCallback matches (app + components *.tsx): 199
useMemo matches (app + components *.tsx): 88
```

**Justification:** Rubric “3–4 = many >1000”; this repo has **multiple screens/components over 1,000 lines** (wizard, editor, complete, activity, NewTaskModal). Memo/callback usage exists but does not offset monolith risk.

**Priority:** **HIGH** — split largest `app/` screens and create-flow modals into hooks + sections.

---

### Category 2: Backend Architecture (7%) — **Score: 6/10**

**Commands / output**

```text
Route files (line counts, descending excerpt):
519 lines: feed-core.ts
509 lines: checkins-core.ts
456 lines: profiles.ts
447 lines: feed-social.ts
396 lines: challenges.ts
377 lines: challenges-create.ts
338 lines: challenges-discover.ts
327 lines: profiles-stats.ts
303 lines: leaderboard.ts
291 lines: accountability.ts
(... smaller files omitted)

Lib files (top): 365 lines: challenge-tasks.ts

tRPC .query( / .mutation( matches under backend/trpc: 105
Zod z.object|z.string|z.number matches under backend/trpc: 198
TRPCError matches under backend/**/*.ts: 366
getSupabaseServer matches: 33
ctx.supabase matches: 287
```

**Sample `getSupabaseServer` references (first lines from search):** `checkins-core.ts`, `profiles.ts`, `challenges.ts`, `feed-social.ts`, `feed-core.ts`, `challenges-discover.ts` (service client for public feeds / joins — needs ongoing security review).

**Empty catch `catch (...) { }`:** no multiline matches in `backend/**/*.ts` from repo search.

**Justification:** Several route modules **>500 lines** (feed-core, checkins-core). Zod usage is broad (198 pattern hits) but not proof every procedure has ideal `.input()`. Structure is domain-split.

**Priority:** **MEDIUM** — trim `feed-core` / `checkins-core`; audit procedures without Zod input.

---

### Category 3: Type Safety (5%) — **Score: 8/10**

**Commands / output**

```text
npx tsc --noEmit
(exit 0; no stderr lines on success)

as unknown matches (app,components,lib,backend,contexts *.ts/tsx): 52
```

**Workspace ripgrep-style search (IDE):** `as any` in `*.ts` / `*.tsx` — **0** matches; `: any` — **0** matches (no explicit `any` escape hatches found in source globs).

**Export functions possibly missing return types (heuristic on backend/trpc):** 2 matches (pattern is noisy).

**Justification:** Typecheck is clean. **`as unknown` appears ~52 times** — acceptable for boundaries but not “zero assertion” tier.

**Priority:** **LOW** — replace high-churn `as unknown` with zod inference or shared DTO types where ROI is clear.

---

### Category 4: Design System Compliance (5%) — **Score: 4/10**

**Commands / output**

```text
Raw #hex in components+app *.tsx excluding DS_COLORS/GRIIT_COLORS/design-system/comment/import: 0
DS_COLORS. matches: 2191
fontWeight (600|700|800) pattern matches: 399
borderRadius.*[0-9] excluding DS_RADIUS and common radii (16,14,12,10,8,50,999): 142

TouchableOpacity|Pressable lines: 850
accessibilityLabel lines: 464
Ratio (labeled / touch lines): 55%
```

**Justification:** **No raw hex** in the filtered TSX search (strong). However **399 font-weight 600/700/800** hits and **55%** naive label/touch ratio are **far** from the rubric’s 9–10 bar (>90% a11y, zero weight violations). Border radius drift (142) indicates incomplete token use.

**Priority:** **MEDIUM** — introduce typography tokens; raise `accessibilityLabel` on primary actions.

---

### Category 5: Performance (7%) — **Score: 6/10**

**Commands / output**

```text
expo-image imports (app+components *.tsx): 15
react-native Image import pattern: 0

<FlatList: 36
ScrollView: 93

.select('*') / select(`*` ) pattern in backend *.ts: 0 (no star-select matches found)
staleTime|cacheTime|gcTime (app,hooks,contexts): 28
React.memo (components): 46 (same as Cat 1)
```

**Justification:** **Good:** no RN `Image` imports found; no `select('*')` in backend TS. **Gap:** **ScrollView (93) >> FlatList (36)**; cache tuning only **28** hits — not “every query.”

**Priority:** **MEDIUM** — virtualize long lists; standardize `staleTime` on hot queries.

---

### Category 6: Error Handling (5%) — **Score: 7/10**

**Commands / output**

```text
Alert.alert (app+components *.tsx): 0
ErrorBoundary matches (*.tsx): multiple app shells + components/ErrorBoundary.tsx
captureError|captureException|Sentry. (app,components,lib,backend *.ts/tsx): present across many files
InlineError|errorMessage|setError(|showError (app+components): widespread
```

**Intentional empty / ignore catches (examples):** `app/(tabs)/discover.tsx` (`catch { /* ignore */ }` for AsyncStorage); `lib/analytics.ts` (`catch { // ignore }` around PostHog); `follow-list.tsx` / `profile/[username].tsx` — review for logging.

**Justification:** No `Alert.alert`; Sentry + inline errors are used. **Not** “zero empty catches” or ErrorBoundary on literally every leaf screen.

**Priority:** **LOW** — log or Sentry-breadcrumb ignored AsyncStorage/PostHog failures.

---

### Category 7: Analytics & Tracking (5%) — **Score: 5/10**

**Commands / output**

```text
posthog.capture / trackEvent / analytics. style hits: scattered (see lib/analytics.ts, app/_layout, paywall, etc.)

Literal funnel string counts (app,components,contexts,hooks,lib):
challenge_created: 0
challenge_joined: 6
task_completed: 5
day_secured: 3
onboarding_completed: 12
paywall_viewed: 1
trial_started: 0
subscription_started: 0
share_completed: 3
feed_posted: 0
profile_viewed: 1
signup_completed: 7

useTrackScreen|screen_view|screenView (app *.tsx): 0
```

**Note:** `lib/analytics.ts` defines a rich **typed** event union (e.g. `paywall_shown`, `purchase_completed`, `challenge_joined`) — **names differ** from the doc’s literal grep list (`paywall_viewed`, `challenge_created`). Funnel coverage in *types* is strong; **literal grep undercounts** real instrumentation.

**Justification:** **No dedicated screen tracking hook** found by pattern. Funnel completeness vs. the doc’s 12 strings is **partial** when measured literally.

**Priority:** **MEDIUM** — add consistent `screen_view` / navigation listener; align event names with dashboard taxonomy.

---

### Category 8: Security & RLS (8%) — **Score: 7/10**

**Commands / output**

```text
CREATE POLICY | ALTER...ROW LEVEL (supabase/migrations *.sql): 110 matches
getSupabaseServer usages: 33 (bypass path — must stay scoped)
ctx.userId|protectedProcedure|isAuthed (backend/trpc): high usage per-file counts (grep sum across routes)
service_role / SUPABASE_SERVICE in app,lib *.ts/tsx: 0 matches
Sanitization .trim|z.string().min|z.string().max (backend *.ts): 205
```

**Justification:** RLS/policy SQL is present; **service client** is used deliberately for public/discover paths — acceptable if audited. No obvious secret literals in app/lib from pattern.

**Priority:** **MEDIUM** — document every `getSupabaseServer()` call path; periodic RLS regression tests.

---

### Category 9: Monetization / RevenueCat (6%) — **Score: 8/10**

**Commands / output**

```text
RevenueCat|Purchases|paywall|entitlement pattern files: app/paywall.tsx, lib/subscription.ts, lib/revenue-cat.ts, contexts/AppContext.tsx, hooks/useProStatus.ts, types/react-native-purchases.d.ts, etc.

Paywall screen: app/paywall.tsx
restorePurchases|restore.*purchase: app/paywall.tsx (3), app/settings.tsx (2)
Product IDs (lib/subscription.ts): monthly: "griit_pro_monthly", annual: "griit_premium_annual"
```

**Justification:** Wiring, products, restore, and entitlement hooks exist. **Device / store verification** is outside grep scope.

**Priority:** **LOW** — QA purchase flows on TestFlight/Play internal tracks.

---

### Category 10: Test Coverage (4%) — **Score: 5/10**

**Commands / output**

```text
Test files found (*.test.ts, *.spec.ts, *.test.tsx, *.spec.tsx):
backend/trpc/routes/nudges.test.ts
backend/trpc/routes/accountability.test.ts
tests/flows/edge-cases.test.ts
tests/flows/critical-paths.test.ts
lib/trpc-errors.test.ts
backend/lib/progression.test.ts
lib/time-enforcement.test.ts
lib/formatTimeAgo.test.ts
lib/api.test.ts
backend/trpc/routes/last-stand.test.ts
backend/trpc/routes/challenges-create.test.ts
backend/lib/streak.test.ts
Count: 12

vitest.config.ts: True
jest.config.*: not found
```

**Justification:** Vitest + **12** test files — useful but **not** high coverage of UI or all routes.

**Priority:** **MEDIUM** — add integration tests for check-in / hard-mode gates.

---

### Category 11: Code Hygiene (4%) — **Score: 5/10**

**Commands / output**

```text
console.log (app+components *.tsx, excluding __DEV__/debug comment): 0
TODO|FIXME|HACK with word boundaries (app,components,backend,lib): 109
tsc "declared but never" lines: 0
```

**Justification:** **No stray console.log** in the filtered search. **109** TODO/FIXME/HACK tokens is elevated for a launch polish bar.

**Priority:** **LOW** — burn down TODOs in hot paths.

---

### Category 12: Database & Migrations (5%) — **Score: 8/10**

**Commands / output**

```text
Migration SQL files under supabase/migrations: 53
CREATE INDEX matches: 49
REFERENCES|FOREIGN KEY matches: 47
NOTIFY pgrst: 0
```

**Justification:** Substantial migration history with indexes and FK references. No `NOTIFY pgrst` in migrations (may be fine depending on hosting).

**Priority:** **LOW** — keep migration index doc in sync (`docs/MIGRATIONS.md`).

---

### Category 13: Navigation & Routing (5%) — **Score: 9/10**

**Commands / output**

```text
ROUTES. usages (app+components *.tsx): 151
router.push/replace('/...') literal (app+components *.tsx): 0 matches

app.json scheme: "griit"
linking.prefixes: griit://, https://griit.app/, https://griit.fit/

_layout.tsx files:
app/_layout.tsx
app/(tabs)/_layout.tsx
app/create/_layout.tsx
app/legal/_layout.tsx
app/onboarding/_layout.tsx
app/auth/_layout.tsx

router.back|canGoBack|BackHandler (app *.tsx): 36
```

**Justification:** Heavy use of **route constants**; **no** `router.push("/...")` literal matches in the searched globs; deep links configured.

**Priority:** **LOW**

---

### Category 14: Launch Readiness (7%) — **Score: 8/10**

**Commands / output**

```text
app.json: name GRIIT, slug griit-challenge-tracker, version 1.0.0, bundleIdentifier app.griit.challenge-tracker, scheme griit, icon/splash present
eas.json: present (cli version, build profiles)
Push-related matches (expo-notifications, pushToken, etc.): multiple backend + lib + app/_layout
Sentry: lib/sentry.ts Sentry.init with dsn; app/_layout imports @sentry/react-native
Privacy/terms: app/legal/*, references in settings/paywall/signup
Cron/daily reset pattern (backend *.ts): hono.ts, daily-reset.ts, cron-reminders.ts, etc.

Hard mode evidence:
schedule_window_start (backend *.ts): multiple files
require_location (backend *.ts): multiple files
haversine (backend): checkins-core.ts, geo.ts
require_camera_only (backend *.ts): multiple files
components/task/VerificationGates.tsx: True

Pooler: .env.example comments reference port 6543 / pooler (no secrets committed)
```

**Justification:** Store metadata, EAS, Sentry, legal, push plumbing, and **hard-mode backend + VerificationGates** are present. **Production readiness** still depends on ops (Railway cron, store review).

**Priority:** **MEDIUM** — verify cron endpoints and push certs in staging.

---

## Top 5 Launch Blockers

1. **Monolith screens (1k–1.7k lines)** — regression and ship risk on core flows (**HIGH**).
2. **Analytics / screen tracking** — funnel naming vs dashboard + no `screen_view` hook (**MEDIUM**, data risk).
3. **Accessibility** — ~55% naive touch/label ratio (**MEDIUM**, store review risk).
4. **Backend god routes** — 500+ line modules (**MEDIUM**, security/bug blast radius).
5. **Test depth** — 12 files, limited e2e of hard-mode check-in (**MEDIUM**).

## Top 5 Strengths

1. **TypeScript** — `tsc --noEmit` clean at audited commit.
2. **Navigation** — `ROUTES` constants and deep links; few inline paths.
3. **Error reporting** — Sentry integrated across app and critical libs.
4. **Monetization plumbing** — RevenueCat, paywall, restore, product IDs centralized.
5. **Database discipline** — 53 migrations with indexes and FK references.

## Compared to Previous Scorecard (`docs/SCORECARD.md`, ~Apr 1, 2026)

| Area | Previous (v2 note) | v3 | Delta |
|------|-------------------|-----|-------|
| Frontend architecture | 5/10 | 3/10 | Stricter rubric on >1k line files |
| Backend architecture | 8/10 | 6/10 | Emphasis on 500+ line routes |
| Type safety | 9/10 | 8/10 | `as unknown` volume noted |
| Design / a11y | split (6+6) | 4/10 combined | Font-weight + label metrics |
| Performance | 8/10 | 6/10 | ScrollView vs FlatList reality |
| Error handling | 7/10 | 7/10 | ~flat |
| Analytics | 7/10 | 5/10 | Literal funnel grep + no screen hook |
| Security | 8/10 | 7/10 | Service role count explicit |
| Monetization | 7/10 | 8/10 | Evidence of full wiring |
| Tests | 6/10 | 5/10 | Similar, slightly stricter |
| Hygiene | 6/10 | 5/10 | TODO count |
| Database | 8/10 | 8/10 | ~flat |
| Navigation | (under launch) | 9/10 | Strong `ROUTES` usage |
| Launch readiness | 7/10 | 8/10 | Hard mode + VerificationGates cited |

## Recommendations to Reach 9.0+

1. **Split** `CreateChallengeWizard`, `TaskEditorModal`, `app/task/complete.tsx`, `app/(tabs)/activity.tsx` into testable units (impact **high**, effort **high**).
2. **Typography + radius tokens** — replace raw `fontWeight` / ad-hoc `borderRadius` (impact **medium**, effort **medium**).
3. **Screen analytics** — one navigation integration + name alignment with PostHog (impact **high**, effort **low**).
4. **Virtualize** feed/activity lists with `FlatList` / FlashList (impact **high**, effort **medium**).
5. **Accessibility pass** — `accessibilityLabel` on every primary `TouchableOpacity` / `Pressable` (impact **high**, effort **medium**).

---

*Generated per internal audit playbook GRIIT_Scorecard_V3_Full.md. Commands run from repo root: `c:\Users\abdel\OneDrive\Desktop\GRIT-1`.*
