# GRIIT CODEBASE SCORECARD
**Evidence-gated, anti-inflation audit · Read-only · Generated 2026-06-30**

> Every grade cites file:line evidence. Unverified claims are recorded as F.
> This scorecard exists because prior reports fabricated `FLAGS.REAL_VERIFICATION`
> and a `verifyTask` tRPC path. Both are confirmed absent (see CLEANUP_LOG.md).

---

## WEIGHTS (revenue reality, not line count)

| # | Dimension | Weight | Why |
|---|-----------|--------|-----|
| D1 | Honest-cut integrity | 12% | Brand core; App Store review risk |
| D2 | Task-completion flow | 12% | Core product interaction |
| D3 | First-session funnel | 18% | **Highest revenue priority** |
| D4 | Monetization | 15% | Direct revenue |
| D5 | Analytics truthfulness | 8% | Informs growth decisions |
| D6 | Data integrity | 8% | Product reliability |
| D7 | Design-system adherence | 4% | Engineering polish |
| D8 | State management | 3% | Engineering polish |
| D9 | Test coverage | 5% | Engineering reliability |
| D10 | Release readiness | 5% | Shipping prerequisite |
| D11 | Distribution | 10% | Business reality; most leverage |

---

## DIMENSION GRADES

---

### D1 · Honest-cut integrity · **B**
**Verdict:** Fabricated gates and fake rewards exist in code but are properly gated off. One flag flip away from shipping dishonest UI.

**Evidence:**

*Fake points + random rewards — gated off, NOT shipped:*
- `hooks/useTaskCompleteScreen.tsx:606` — `subtitle: FLAGS.COMPLETION_REWARDS ? "+N points" : ""`
- `hooks/useTaskCompleteScreen.tsx:612` — `if (FLAGS.COMPLETION_REWARDS && Math.random() < 0.3)` — variable reward roll gated
- `components/task/TaskCompleteCelebration.tsx:180` — `{FLAGS.COMPLETION_REWARDS && variableReward ? ...}` — chip render gated
- `lib/feature-flags.ts:75` — `COMPLETION_REWARDS: false`
- Test assertion: `tests/flows/task-flow.test.ts:158` — `expect(FLAGS.COMPLETION_REWARDS).toBe(false)`

*Fabricated gate strings — confirmed absent:*
- `grep -r "motion|presence|liveness"` → zero results in any `.ts`/`.tsx` file
- `tests/flows/task-flow.test.ts:102–116` — behavioral test asserts no row label or detail contains "motion", "presence", or "liveness"

*Emoji removed from production UI:*
- `CLEANUP_LOG.md:Item 2` — `🔥` at `components/task/TaskCompleteCelebration.tsx:169` replaced with `<Flame size={13} .../>` (lucide-react-native)
- `grep "🔥\|emoji" components/task/` → zero results

*No raw hex outside design-system:*
- `grep -rn "'#[0-9A-Fa-f]{6}'" --include="*.tsx" --include="*.ts"` (excluding `design-system.ts` and `node_modules`) → zero results

*Fake participants_count previously present, now reset:*
- `supabase/migrations/20260407000000_reset_fake_participants_count.sql` — exists; indicates prior fake counts were wiped

**Gap to A:** The fabricated points/reward code still exists in `useTaskCompleteScreen.tsx:606–619`; the only protection is `FLAGS.COMPLETION_REWARDS = false`. A developer accidentally setting this to `true` would ship "+5 points" and random reward chips with no server backing.

**Highest-leverage fix:** Delete (not gate) the fabricated `variableReward` roll and hardcoded `+N points` strings. Server-driven rewards can be added when the backend actually returns them.

---

### D2 · Task-completion flow · **B**
**Verdict:** All 8 body types exist and are routed correctly. Call chain traced. Reject→no-secure confirmed. Two active blockers (B-01, B-02).

**Evidence:**

*8 body types — all present and routed in `renderBody()`:*
- `hooks/useTaskCompleteScreen.tsx:783–906` — `switch(taskTypeRaw)` routes to `TaskSimpleBody`, `TaskPhotoBody`, `TaskTimerBody`, `TaskRunBody`, `TaskWorkoutBody`, `TaskJournalBody`, `TaskCounterBody`, `TaskCheckinBody`
- Body files confirmed: `components/task/bodies/Task{Simple,Photo,Timer,Run,Workout,Journal,Counter,Checkin}Body.tsx`

*Call chain (traced):*
1. **Entry:** `app/task/complete.tsx` renders `TaskCompleteScreenInner` from `hooks/useTaskCompleteScreen.tsx`
2. **Submit:** `handleSubmit()` at line 513 calls `completeTask(params)` (from `useApp()` context)
3. **Mutation:** `hooks/useAppChallengeMutations.ts:110` — `trpcMutate(TRPC.checkins.complete, params)`
4. **tRPC path:** `lib/trpc-paths.ts` — `TRPC.checkins.complete = "checkins.complete"`
5. **Server:** `backend/trpc/routes/checkins.ts:49` — `complete` procedure; throws `TRPCError` on any gate failure
6. **Result consumed:** `useTaskCompleteScreen.tsx:598` — `setSubmitted(true)` is reached **only** after the `await completeTask(...)` resolves without throwing

*Reject→no-secure (traced):*
- Gate failure (e.g., wrong time window, library photo, short timer) → `checkins.ts` throws `TRPCError`
- Propagates to `useTaskCompleteScreen.tsx:623–626` `catch` block → `showError(err.message)`
- `setSubmitted(true)` (line 598) is **never reached** — confirmed: only one call site, inside the `try` block after `await`
- `secureDay` is a **separate** mutation (`checkins.ts:430`) that requires all required tasks to be completed first; it throws `BAD_REQUEST` with "NOT_ALL_REQUIRED" if conditions aren't met

*Verifying overlay:*
- `VerifyingOverlay` shown when `isSubmitting === true` (line 1316)
- 600ms legibility floor enforced at lines 594–597
- `buildVerifyingRows` (from `lib/task-flow-utils.ts`) produces rows only for gates in config — confirmed by `tests/flows/task-flow.test.ts:46–116`

*Active blockers:*
- **B-01** (`BLOCKERS.md:1`): checkin location gate non-functional — `setUserLocation` and `handleCheckLocation` are in suppression `void` block at `useTaskCompleteScreen.tsx:1210,1212`. `locationOk` resolves to `true` when no location required; checkin body shows gate as never resolving "pass"
- **B-02** (`BLOCKERS.md:19`): Legacy `task/run.tsx` and `task/checkin.tsx` are now blocked by `FLAGS.LEGACY_RUN_SCREEN = false` / `FLAGS.LEGACY_CHECKIN_SCREEN = false` — confirmed `lib/feature-flags.ts:45,50` — but the routes still exist and show a redirect screen (poor UX for old push deep-links)

**Gap to A:** Fix B-01 (wire `handleCheckLocation` as checkin arming action; remove from void block); decommission or properly redirect legacy routes.

**Highest-leverage fix:** Resolve B-01 before any checkin task goes to users.

---

### D3 · First-session funnel / activation · **C**
**Verdict:** Funnel events fire correctly. Critical gap: the live onboarding (old flow, `ONBOARDING_V2 = false`) has **no paywall**. New users who join fewer than 3 challenges never encounter the paywall organically.

**Evidence:**

*ONBOARDING_V2 flag:*
- `lib/feature-flags.ts:39` — `ONBOARDING_V2: false`
- `app/onboarding/index.tsx:8` — `FLAGS.ONBOARDING_V2 ? <OnboardingFlowV2 /> : <OnboardingFlow />`
- Therefore: **`OnboardingFlow` (old, no paywall) is what ships**

*Old onboarding — no paywall push:*
- `grep "paywall|PAYWALL|Paywall" components/onboarding/OnboardingFlow.tsx` → **zero results**
- `onboarding_completed` fires at `components/onboarding/OnboardingFlow.tsx:73` after step 4, with no subsequent paywall push

*V2 onboarding — has paywall, but NOT shipped:*
- `components/onboarding/v2/OnboardingFlowV2.tsx:71` — `router.push({ pathname: ROUTES.PAYWALL, params: { source: "onboarding" } })` after account creation
- But `FLAGS.ONBOARDING_V2 = false` → this code never executes

*Paywall is only triggered by:*
1. `app/challenge/[id].tsx:730` — `canJoinChallenge()` limit hit (4th challenge attempt)
2. `app/challenge/[id].tsx:782` — team challenge join while free
3. `app/settings.tsx:274` — settings "manage subscription" tap

*Funnel events that DO fire (verified call sites):*
- `onboarding_started`: `components/onboarding/screens/ValueSplash.tsx:30`
- `onboarding_step_completed`: `components/onboarding/OnboardingFlow.tsx:53`
- `onboarding_completed`: `components/onboarding/OnboardingFlow.tsx:73`
- `first_challenge_joined`: `app/challenge/[id].tsx:758`
- `first_task_completed`: `hooks/useAppChallengeMutations.ts:180`
- `day1_task_completed`: `hooks/useAppChallengeMutations.ts:193`
- `day1_secured`: `hooks/useAppChallengeMutations.ts:258`

**Gap to B:** Ship `ONBOARDING_V2 = true` OR add a paywall nudge at the end of the old onboarding flow.

**Highest-leverage fix (revenue impact #1):** Enable `ONBOARDING_V2 = true` on device-verified build. The V2 paywall push (`OnboardingFlowV2.tsx:71`) is already implemented; the flag is the only blocker.

---

### D4 · Monetization · **B**
**Verdict:** RevenueCat entitlement "GRIIT Pro" is consistently wired end-to-end. Free-tier limits enforced on both client and server. Gap: paywall is gate-triggered only (see D3), not onboarding-triggered.

**Evidence:**

*Entitlement string consistency:*
- `lib/subscription.ts:16` — `const ENTITLEMENT_ID = "GRIIT Pro"`
- `backend/trpc/routes/profiles.ts:21` — `const RC_ENTITLEMENT_ID = "GRIIT Pro"` (server-side validation)

*RC initialization call chain:*
- `lib/subscription.ts:51` — `initializeRevenueCat(userId)` → `RC.configure({ apiKey, appUserID: userId })` → `RC.getCustomerInfo()` → `setSubscriptionState(premium ? "premium" : "free", expiry)`
- Listener: `RC.addCustomerInfoUpdateListener` (line 88) — real-time updates on purchase/cancellation
- Server sync: `syncSubscriptionToSupabase(userId, info)` (line 83) + `trpcMutate(TRPC.profiles.validateSubscription)` (line 84)

*Entitlement enforcement — client:*
- `lib/premium.ts:24` — `isPremium()` checks `_subscriptionStatus === "premium" || "trial"` AND expiry
- `lib/premium.ts:33` — `canJoinChallenge(count)` returns `{ allowed: false }` when not premium and count ≥ 3
- `app/challenge/[id].tsx:728` — `canJoinChallenge(count)` called before join; pushes `/paywall` on failure

*Entitlement enforcement — server:*
- `backend/trpc/routes/challenges-join.ts:28` — `isPremium` check in tRPC join route
- `backend/trpc/routes/challenges-create.ts:292` — free limit enforced with error mentioning "GRIIT Pro"
- `backend/trpc/routes/profiles-stats.ts:99` — `isPremiumForLastStand` check gates last-stand use

*Premium feature gates:*
- `app/challenge/[id].tsx:364` — `isLockedProFeature = !isPro && (require_location || require_heart_rate)` — hard-mode features locked

*Flagged-off:*
- `lib/feature-flags.ts:20` — `PREMIUM_INTEGRATIONS: false` — Strava not available

**Gap to A:** `isPremium()` reads from in-memory state (`_subscriptionStatus`). If `initializeRevenueCat` fails (missing API key env var, Expo Go environment), `isPremium()` defaults to `false` — correct behavior. However, no alerting when RC API key is missing beyond a Sentry capture.

**Highest-leverage fix:** Ensure `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and Android equivalent are set in EAS secrets; add a startup assertion that logs a visible warning to operators when missing.

---

### D5 · Analytics truthfulness · **B**
**Verdict:** PostHog is wired; key funnel events fire at real call sites. Gaps: some events fire only client-side (subscription cancelled requires app to be open), and two `track()`/`trackEvent()` calls exist for the same paywall events (duplication, not silence).

**Evidence:**

*PostHog gate:*
- `lib/analytics.ts:138–141` — `shouldSendPostHog()` returns `true` in production; dev-only if `EXPO_PUBLIC_POSTHOG_ENABLE_DEV=true`
- `lib/analytics.ts:182–191` — `trackEvent()` → `ph?.capture()`

*Key funnel events — verified fire sites:*
- `app_opened`: `components/AnalyticsBootstrap.tsx:10` — fires with streak_count and isPremium
- `signup_started/completed/login_completed`: `app/auth/signup.tsx:70,199`, `app/auth/login.tsx:88`
- `onboarding_started/step/completed`: `components/onboarding/OnboardingFlow.tsx:30,53,73`
- `first_challenge_joined`: `app/challenge/[id].tsx:758`
- `first_task_completed`, `day1_task_completed`, `day1_secured`: `hooks/useAppChallengeMutations.ts:180,193,258`
- `paywall_viewed`: `app/paywall.tsx:60–62` (fires both `track()` and `trackEvent()` — double-fire)
- `paywall_purchase_started/completed/failed/cancelled`: `lib/analytics.ts:262–291` via `trackPaywall*()` helpers
- `challenge_joined`, `challenge_left`, `task_skipped`: `app/challenge/[id].tsx:750`, `app/challenge/active/[activeChallengeId].tsx:227`

*Silent paths:*
- `subscription_cancelled` fires only from `contexts/AppContext.tsx:311` — only if app is foregrounded when RC listener detects cancellation; background cancellations are not caught until next app open
- No `day_3_retained` / `day_7_retained` fire sites found in `app/` or `hooks/` — these event types are defined in `lib/analytics.ts:39–40` but no call site grepped

**Gap to A:** Wire `day_3_retained` and `day_7_retained` events (defined but never fired); fix paywall double-fire; add background subscription cancellation detection.

**Highest-leverage fix:** Wire `day_3_retained` — this is the most actionable retention cohort signal missing from the funnel.

---

### D6 · Data integrity · **B**
**Verdict:** RLS present in migrations, `secure_day` uses RPC exclusively (no TS fallback), idempotency enforced via upsert. File-level only — live state must be operator-confirmed.

**Evidence:**

*RLS:*
- Multiple migration files confirm RLS enabled: `supabase/migrations/20260321120000_sprint5_rls_storage_hardening.sql`, `20260510000000_profiles_rls_hardening.sql`, `20260321150000_check_ins_table_and_rls.sql`, `20260620100000_rls_challenges_via_active_participation.sql`
- `supabase/migrations/20260503000000_profiles_delete_policy_and_update_hardening.sql:4` — explicitly documents that "RLS enabled: yes (rowsecurity=true)" was confirmed against production state

*`secure_day` RPC — no TS fallback:*
- `backend/trpc/routes/checkins.ts:440` — `ctx.supabase.rpc("secure_day", { p_active_challenge_id: ... })`
- `backend/trpc/routes/checkins.ts:512–536` — on RPC error, logs and throws `TRPCError("INTERNAL_SERVER_ERROR")`; no TS fallback path exists
- BLOCKERS.md B-03 notes that if migration not applied, RPC returns code `42883` — logged, thrown, NOT silently passed

*Idempotency — `check_ins` upsert:*
- `backend/trpc/routes/checkins.ts:302` — `.upsert(payload, { onConflict: "active_challenge_id,task_id,date_key" })`
- Constraint enforced: same user + same task + same calendar day = upsert (no duplicate)

*Anti-cheat:*
- `backend/trpc/routes/checkins.ts:110–128` — rejects if any task completed within last 10 seconds

*Schema-drift risk (operator must confirm):*
- `supabase/migrations/` contains 80+ migrations; live DB must be verified against migration state
- `docs/VERIFY-MIGRATIONS.sql` exists, suggesting operator tooling is available

**Gap to A:** Live DB state unverifiable from file audit. Schema drift between migration files and production is possible if any migration was not applied.

**Highest-leverage fix:** Run `docs/VERIFY-MIGRATIONS.sql` against production to confirm all migrations are applied, particularly `20260307000000_secure_day_rpc.sql`.

---

### D7 · Design-system adherence · **C**
**Verdict:** Token system exists and no raw hex found outside `design-system.ts`. However, v1→v2 migration is approximately 23% complete by usage count, and v1 weight tokens (600/700/800) are pervasive in components despite v2 spec mandating only 400/500.

**Evidence:**

*No raw hex outside `design-system.ts`:*
- `grep -rn "'#[0-9A-Fa-f]{6}'" --include="*.tsx" --include="*.ts"` excluding `design-system.ts` and `node_modules` → **zero results**

*DS_COLORS_V2 nested tokens — exist and used:*
- `lib/design-system.ts:1027` — `export const DS_COLORS_V2 = { surface: {...}, brand: {...}, text: {...}, semantic: {...}, ... }`
- Usage count (grep): **581 references** to `DS_COLORS_V2` / `DS_TYPE` / `DS_SPACING_V2` across codebase
- DS_COLORS (v1) usage: **1911 references** — migration is ~23% complete

*Font weight violations vs DS_TYPE v2 spec (only 400/500 allowed):*
- `lib/design-system.ts:1228–1288` — `DS_TYPE` comment: "Two weights only: 400 (regular) and 500 (medium). No 600, 700, or 800."
- `components/task/VerifyingOverlay.tsx:105` — `fontWeight: "600"`
- `components/task/TaskCompleteCelebration.tsx:145,413,442,455,484,500,519,537,560,581,605` — `fontWeight: "600"` in 11+ places
- `components/profile/PostsGrid.tsx:86,93` — `fontWeight: "600"`
- `components/profile/ChallengeListSheet.tsx:169,193` — `fontWeight: "600"`
- v1 `DS_TYPOGRAPHY.WEIGHT_SEMIBOLD/BOLD/EXTRABOLD` used in `app/auth/login.tsx`, `app/auth/signup.tsx`, `app/post/[id].tsx`, etc.

*ROUTES constants — correct:*
- `lib/routes.ts:5` — `export const ROUTES = { AUTH, TABS_HOME, TASK_COMPLETE, PAYWALL, ... }` — all navigation uses these constants

*DS_DAYLIGHT a11y note:*
- `lib/design-system.ts:1337–1343` — explicitly notes `DS_DAYLIGHT.color.accent (#DC5401)` is ~3.96:1 for white text, below WCAG AA 4.5:1 for normal text; `accentAccessible: "#BB471D"` provided as AA-safe fallback

**Gap to B:** Complete v1→v2 migration; eliminate all `fontWeight: "600"/"700"/"800"` direct strings and v1 `WEIGHT_SEMIBOLD/BOLD` usages from component files.

**Highest-leverage fix:** Enforce the DS_TYPE weight constraint with a lint rule; the constraint is documented but unenforced.

---

### D8 · State management · **A**
**Verdict:** All Zustand stores live exclusively in `store/`; no drift to `lib/stores/` or inline stores found; all imports use `@/store/` path.

**Evidence:**

*Store files — all in `store/`:*
- `store/activeSessionStore.ts`, `store/celebrationStore.ts`, `store/feedToggleStore.ts`, `store/notificationPrefsStore.ts`, `store/onboardingStore.ts`, `store/proofSharePromptStore.ts`

*Import audit — all from `@/store/`:*
- `app/(tabs)/index.tsx:31` — `import { useCelebrationStore } from "@/store/celebrationStore"`
- `app/_layout.tsx:28` — `import { useOnboardingStore } from "@/store/onboardingStore"`
- `components/settings/ReminderSection.tsx:17` — `import { useNotificationPrefsStore } from "@/store/notificationPrefsStore"`
- (full grep of all store imports — all `@/store/` prefixed)

*No Zustand imports outside `store/`:*
- `grep -rn "from 'zustand'\|from \"zustand\""` excluding `store/` and `node_modules` → **zero results**

**Anti-disprove attempted:** Searched for `createStore` / `create(` outside `store/` — only `StyleSheet.create()` matches returned. Held.

**To lose this grade:** A Zustand store would need to be defined outside `store/` or imported directly from `zustand` in a non-store file. Confirmed absent.

---

### D9 · Test coverage · **C**
**Verdict:** Has genuine behavioral tests for the honest-cut invariants, design-system contrast, and ramp math. Critical user flows (reject→no-secure, subscription state machine, onboarding→paywall) have zero behavioral coverage.

**Evidence:**

*Behavioral tests (lock actual behavior):*
- `tests/flows/task-flow.test.ts` — 23 tests: `buildVerifyingRows` row count and forbidden words, `getTypeSuccessLine` per type, `FLAGS.COMPLETION_REWARDS = false`, `TRPC.checkins.complete` path string, `TRPC.checkins.verifyTask` absent (confirms prior fabrication won't recur)
- `tests/design-system-contrast.test.ts` — 9 contrast pairs audited against WCAG ratios; `TEXT_ON_ACCENT on ACCENT` must meet 4.5:1 (correctly exercises the real DS_COLORS values)
- `tests/task-progress.test.ts` — 4 tests on `getDailyTarget()` ramp math (fixed, ramp day1, ramp last day, midpoint interpolation)
- `backend/lib/streak.test.ts`, `backend/lib/progression.test.ts` — backend unit tests (behavioral, not constant)

*Mocked-context tests (lightly behavioral):*
- `tests/flows/critical-paths.test.ts` — 6 tests; mock returns `{ data: null, error: { code: "PGRST116" } }` for most queries; tests exercise input validation and auth guard but not real data paths
- `tests/flows/edge-cases.test.ts` — 4 tests; similar mock pattern

*Missing behavioral tests:*
- Reject→no-secure: no test asserts that a gate failure prevents `setSubmitted(true)`
- Subscription state machine: no test for `isPremium()` returning false after expiry
- Onboarding→paywall: no test that V2 onboarding pushes to paywall route
- Timer hard-mode: no test that `hardModeOk=false` blocks submission

*Constant-assertion tests (per Rule 7 — do not count):*
- `tests/flows/task-flow.test.ts:28–33` — `TRPC.checkins.complete` path string check is effectively a constant check, though it documents an invariant (borderline; kept as behavioral because it caught a real prior fabrication)

**Gap to B:** Add a test asserting that a `TRPCError` thrown by `checkins.complete` propagates to `showError` and NOT to `setSubmitted(true)`.

**Highest-leverage fix:** End-to-end behavioral test for reject→no-secure chain; this is the core anti-cheat invariant.

---

### D10 · Release readiness · **B**
**Verdict:** EAS config is correct for remote versioning. No `buildNumber` in iOS config. Flagged-off inventory documented. Gap: legacy routes still reachable via old push deep-links show a redirect screen, not a redirect to the new flow.

**Evidence:**

*EAS config:*
- `eas.json:4` — `"appVersionSource": "remote"` ✓
- `eas.json:33` — production profile has `"autoIncrement": true` ✓
- No `buildNumber` key in `app.json` iOS section ✓

*`versionCode: 1` in `app.json`:*
- `app.json:46` — `"versionCode": 1` in Android section
- Because `appVersionSource: remote`, EAS uses its own version state and `autoIncrement` overrides this for production builds. Acceptable for local dev builds.

*Flag hygiene:*
- `lib/feature-flags.ts` documents all `false` flags with BLOCKERS.md references (B-01 through B-04)
- `FLAGS.LEGACY_RUN_SCREEN = false` (line 45), `FLAGS.LEGACY_CHECKIN_SCREEN = false` (line 50) — confirmed; legacy screens show redirect UI, not the old form

*Legacy route redirect UX gap:*
- `BLOCKERS.md:B-02` — routes `ROUTES.TASK_CHECKIN` and `ROUTES.TASK_RUN` are still registered; old push notification deep-links resolve to a "Go back" page instead of the unified `task/complete` screen
- Users arriving from old push notifications see a dead-end, not the task

**Gap to A:** Implement a proper redirect from `task/run` and `task/checkin` to `task/complete` with preserved params (taskId, activeChallengeId) rather than a blank "Go back" screen.

**Highest-leverage fix:** Wire the legacy route redirect to `ROUTES.TASK_COMPLETE` with params forwarded.

---

### D11 · Distribution · **F — unverified**
**Verdict:** No content/funnel/retention data is present in the repository. App Store listing copy and ASO docs exist but contain no performance metrics. This dimension grades on business reality, not engineering effort.

**Evidence:**

- `docs/APP-STORE-LISTING.md` — exists (marketing copy)
- `docs/ASO.md` — exists (keyword strategy)
- No download counts, D1/D3/D7/D30 retention cohorts, ARPU, conversion rate, or A/B test results found in any file
- No push campaign results, no referral conversion data, no paid UA data

This is not a code failure. The repository is a codebase, not a business analytics dashboard. But the scoring rules require grading on actual leverage for revenue — and without distribution data or a functioning first-session paywall (D3), distribution cannot be assessed as anything other than unknown.

**Highest-leverage fix:** Ship `ONBOARDING_V2 = true` (adds paywall to the funnel), then instrument D1/D3 cohorts in PostHog within 30 days to establish a retention baseline. Until those numbers exist, no distribution strategy can be evaluated.

---

## WEIGHTED OVERALL GRADE

| Dimension | Grade | Score (A=4) | Weight | Weighted |
|-----------|-------|-------------|--------|---------|
| D1 Honest-cut | B | 3.0 | 12% | 0.36 |
| D2 Task flow | B | 3.0 | 12% | 0.36 |
| D3 Funnel | C | 2.0 | 18% | 0.36 |
| D4 Monetization | B | 3.0 | 15% | 0.45 |
| D5 Analytics | B | 3.0 | 8% | 0.24 |
| D6 Data integrity | B | 3.0 | 8% | 0.24 |
| D7 Design system | C | 2.0 | 4% | 0.08 |
| D8 State management | A | 4.0 | 3% | 0.12 |
| D9 Tests | C | 2.0 | 5% | 0.10 |
| D10 Release | B | 3.0 | 5% | 0.15 |
| D11 Distribution | F | 0.0 | 10% | 0.00 |
| **TOTAL** | | | **100%** | **2.46 / 4.0** |

### **Overall: C+ (61.5%)**

This is a B-grade engineering codebase attached to a C-grade product funnel. The honest-cut work and the task-completion mechanics are solid. The monetization plumbing is real. But the first-session paywall is absent in the live onboarding flow, and there is no retention/distribution data to indicate the product is growing. A repo with A-grade engineering and D-grade distribution is not an A repo.

---

## TOP-5 HIGHEST-LEVERAGE FIXES (revenue-ranked)

| # | Fix | Revenue impact | Effort | Evidence |
|---|-----|---------------|--------|---------|
| 1 | **Enable `ONBOARDING_V2 = true`** — V2 flow pushes to paywall after account creation. The paywall push is already implemented (`OnboardingFlowV2.tsx:71`); only the flag blocks it. | **Critical** — every new user currently bypasses paywall | Low (flip flag after device verification) | `lib/feature-flags.ts:39`, `OnboardingFlowV2.tsx:71` |
| 2 | **Fix B-01 checkin location gate** — Wire `handleCheckLocation` as arming action; remove `setUserLocation` from suppression void block. Without this, checkin tasks cannot be verified, limiting a key retention mechanic. | High — checkin tasks are unverifiable | Medium | `BLOCKERS.md:B-01`, `useTaskCompleteScreen.tsx:1210,1212` |
| 3 | **Wire `day_3_retained` and `day_7_retained` events** — These event types are defined in `lib/analytics.ts:39–40` but no fire site exists. These are the core retention cohort signals. | High — without D3/D7 data, retention optimizations are blind | Low | `lib/analytics.ts:39–40`; grep shows zero call sites |
| 4 | **Redirect legacy deep-links to `task/complete` with params** — Users arriving from old push notifications hit a "Go back" dead-end instead of the unified task screen. This costs completions. | Medium — affects push notification CTR and day-of-use engagement | Medium | `BLOCKERS.md:B-02`, `app/task/run.tsx`, `app/task/checkin.tsx` |
| 5 | **Delete fabricated rewards code** (do not just gate it) — Remove the `+N points` hardcoded string and `Math.random()` reward roll from `useTaskCompleteScreen.tsx:606–619`. Replace when server returns real values. | Medium — removes one flag-flip away from shipping dishonest UI | Low | `useTaskCompleteScreen.tsx:606–619`, `lib/feature-flags.ts:75` |

---

## FLAGGED-OFF INVENTORY

Every `FLAGS.* = false` feature and what it is hiding:

| Flag | Value | What it hides |
|------|-------|---------------|
| `FLAGS.LOCATION_CHECKIN_ENABLED` | `false` | Location check-in task type hidden from home navigation entry point |
| `FLAGS.PREMIUM_INTEGRATIONS` | `false` | Strava / Apple Health / WHOOP verification in settings |
| `FLAGS.RUN_GOAL_CONFIG` | `false` | Goal-type / target / tracking-mode config in Add-task sheet (backend schema not landed) |
| `FLAGS.ONBOARDING_V2` | `false` | New 9-screen onboarding with in-flow paywall after account creation |
| `FLAGS.LEGACY_RUN_SCREEN` | `false` | Blocks `app/task/run.tsx` (legacy GPS/treadmill screen); shows redirect |
| `FLAGS.LEGACY_CHECKIN_SCREEN` | `false` | Blocks `app/task/checkin.tsx` (legacy location-session screen); shows redirect |
| `FLAGS.JOURNAL_TAGS` | `false` | Mood / Wins / Photo chips in journal task body (not yet functional) |
| `FLAGS.WORKOUT_STRUCTURED` | `false` | Sets-and-reps structured workout form in `TaskWorkoutBody` |
| `FLAGS.COMPLETION_REWARDS` | `false` | Hardcoded "+N points" subtitle and `Math.random()` variable reward chip on task completion |

---

## SELF-DISPROVE PASS

The three most favorable grades are **D8 (A)**, **D4 (B)**, and **D2 (B)**. Fresh grep attempts to break each:

### Attempt 1: D8 State Management (A) — tried to find Zustand drift

**Method:** `grep -rn "from 'zustand'\|from \"zustand\""` excluding `store/` and `node_modules`

**Result:** Zero results. No Zustand imports outside `store/`. Also searched for `createStore`, `create(` in non-store files — only `StyleSheet.create()` returned.

**Verdict:** Disprove attempted, grade **held at A**.

---

### Attempt 2: D4 Monetization (B) — tried to find `isPremium()` bypass or entitlement mismatch

**Method 1:** Searched for any use of `"premium"` entitlement string that doesn't match `"GRIIT Pro"` (e.g., `"premium"` as a raw entitlement ID).

**Found:** `contexts/AppContext.tsx:408` — `info.entitlements?.active?.['premium']` — this checks for entitlement key `"premium"`, **not** `"GRIIT Pro"`. This is a different code path from `subscription.ts` (which uses `ENTITLEMENT_ID = "GRIIT Pro"`). The AppContext appears to use a legacy/incorrect entitlement key, which would fail to recognize a "GRIIT Pro" entitlement.

**Impact:** `AppContext.tsx:408` sets `isPremium` in the app context using `'premium'` key. `subscription.ts` uses `"GRIIT Pro"`. If the RC product is configured as `"GRIIT Pro"` in the dashboard, `AppContext` will never set `isPremium = true` for actual subscribers.

**Verdict:** Disprove **partially succeeded.** Grade drops from **B to C** for D4. The monetization plumbing has an entitlement key inconsistency that could silently block premium state from being recognized in the app UI (though `lib/premium.ts:isPremium()` reads from `setSubscriptionState()` which uses the correct key — so premium gating works, but the `isPremium` boolean in the AppContext/UI may always show `false` for subscribers).

**Corrected D4 grade: C** | Evidence: `contexts/AppContext.tsx:408` uses `['premium']`; `lib/subscription.ts:16` defines `ENTITLEMENT_ID = "GRIIT Pro"`.

---

### Attempt 3: D2 Task-completion flow (B) — tried to find a path where `setSubmitted(true)` is reached without server confirmation

**Method:** Searched for all `setSubmitted` calls in `useTaskCompleteScreen.tsx`.

**Result:** `grep -n "setSubmitted(true)" hooks/useTaskCompleteScreen.tsx` → only **one call site: line 598**.

Line 598 is inside the `try` block at the exact point after `await completeTask(...)` returns. The `finally` block (line 629) only sets `setIsSubmitting(false)`. There is no second call to `setSubmitted(true)` in a catch or finally block.

**Verdict:** Disprove attempted, grade **held at B**. The one-call-site pattern is a strong invariant; the reject→no-secure claim is correct.

---

## UPDATED WEIGHTED GRADE (after self-disprove)

D4 corrected from B → C (entitlement key mismatch in AppContext). Re-computation:

| Dimension | Grade | Score | Weight | Weighted |
|-----------|-------|-------|--------|---------|
| D4 Monetization | **C** | 2.0 | 15% | **0.30** (was 0.45) |
| All others | unchanged | | | 2.01 |
| **TOTAL** | | | **100%** | **2.31 / 4.0** |

### **Overall: C (57.8%)**

The entitlement key mismatch (`'premium'` vs `"GRIIT Pro"`) discovered during self-disprove is the most dangerous live bug found in this audit. Premium subscribers may see the free-tier UI if the app context does not recognize their entitlement.
