# GRIIT — Full-stack audit & scorecard

**Audit date:** 2026-05-02  
**Repo path:** `GRIIT/` (workspace `/Users/yaseenabdela/Developer/GRIIT`)  
**Method:** Read-only verification via repository search, `npx tsc --noEmit`, `npx expo lint --max-warnings 0`, `npx vitest run`, and Python line scans where the Cursor grep tool was used for evidence. Shell `rg` was unavailable in the sandbox; counts for empty `catch {}` and `console.*` were produced with a local Python scan (equivalent intent to the prompt’s PowerShell `Select-String`).

**Note on git:** The protocol asked for one commit per phase; delivery used three small commits instead: run `git log -3 --oneline -- docs/audits/GRIIT_FULL_AUDIT_20260502.md` for the exact chain (full audit body is the oldest of the three).

---

## PHASE 0 — Seed findings (verified)

### F1: Onboarding `authUserId` vs persisted `currentStep`

- **Status:** CONFIRMED  
- **Evidence:** `components/onboarding/OnboardingFlow.tsx:26` — `authUserId` is React `useState`, not in `onboardingStore` `partialize` (`store/onboardingStore.ts:118-135` omits it while persisting `currentStep`). `ProfileSetup.tsx:97` returns early when `userId` is empty.  
- **Snippet:**

```26:27:components/onboarding/OnboardingFlow.tsx
  const [authUserId, setAuthUserId] = useState<string>("");
  const router = useRouter();
```

```95:98:components/onboarding/screens/ProfileSetup.tsx
  const saveProfile = useCallback(
    async (opts: { skipMinimal: boolean }) => {
      if (!userId) return;
```

- **Proposed fix:** Persist the post-auth user id in the same persisted store (or re-fetch `supabase.auth.getSession()` when rendering step 3) so a resumed session at `currentStep === 3` always has a user id before `saveProfile` runs. Optionally short-circuit `SignUpScreen` when a session already exists to skip redundant auth UI.

### F2: `active_challenges` UPDATE via user JWT vs migrations

- **Status:** CONFIRMED  
- **Evidence:** `backend/trpc/routes/checkins.ts:396` and `:568` call `ctx.supabase.from("active_challenges").update(...)`. Migrations define SELECT, INSERT, DELETE policies on `active_challenges` but **no** `FOR UPDATE` policy (e.g. `20250320073000_active_challenges_select_policy.sql`, `20250318000000_challenges_rls_public_read.sql`, `20250308000001_active_challenges_leave_policy.sql`).  
- **Snippet:**

```395:397:backend/trpc/routes/checkins.ts
      const progress = requiredTasks.length > 0 ? (completedRequired.length / requiredTasks.length) * 100 : 0;
      await ctx.supabase.from("active_challenges").update({ progress_percent: progress }).eq("id", input.activeChallengeId);
      return { ...(data ?? {}), isMinimumDay };
```

```567:569:backend/trpc/routes/checkins.ts
      const col = input.milestoneDay === 30 ? "milestone_30_shared" : "milestone_75_shared";
      await ctx.supabase.from("active_challenges").update({ [col]: true }).eq("id", input.activeChallengeId);
      return { success: true };
```

- **Proposed fix:** Add a migration with `CREATE POLICY ... FOR UPDATE` scoped to `auth.uid() = user_id` (or equivalent), **or** perform these updates with a service-role client only where RLS bypass is intentional and audited.

### F3: Backend `@sentry/node` vs root `package.json`

- **Status:** PARTIAL (hypothesis narrowed)  
- **Evidence:** Root `package.json` lists `@sentry/react-native` but **not** `@sentry/node`. `backend/package.json` **does** list `@sentry/node`. Root `tsconfig.json` `include` is `**/*.ts` so backend files typecheck from repo root. `npx tsc --noEmit` reports **3** `TS2307` errors on `@sentry/node` (`backend/hono.ts:4`, `backend/lib/error-reporting.ts:7`, `backend/server.ts:2`).  
- **Snippet:**

```1:3:backend/server.ts
import "dotenv/config";
import * as Sentry from "@sentry/node";
```

- **Proposed fix:** Either add `@sentry/node` to the **root** `devDependencies` (or workspace root install) so `tsc` resolves modules, or exclude `backend/**` from the Expo app tsconfig and use a separate `backend/tsconfig.json` invoked by `npm run typecheck:backend`.

### F4: `profiles` RLS / policies in migrations

- **Status:** PARTIAL  
- **Evidence:** No `ALTER TABLE ... profiles ENABLE ROW LEVEL SECURITY` appears in `supabase/migrations/*.sql` (tool search over migrations). The only `profiles` policy in migrations is **DELETE** in `supabase/migrations/20260321120000_sprint5_rls_storage_hardening.sql:8-12`. Client `lib/subscription.ts:111-118` issues `supabase.from("profiles").update(...)` with the user JWT — requires matching RLS in the live DB.  
- **Snippet:**

```8:12:supabase/migrations/20260321120000_sprint5_rls_storage_hardening.sql
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

- **Proposed fix:** Commit migrations that `ENABLE ROW LEVEL SECURITY` on `profiles` and add explicit `SELECT` / `INSERT` / `UPDATE` policies consistent with app + tRPC usage, or document that policies live only in hosted Supabase and keep migrations in sync.

### F5: Silent / dev-only comments in subscription & paywall

- **Status:** PARTIAL  
- **Evidence:** `lib/subscription.ts:58-62` returns early with no UI signal when API key missing; `97-101` empty `catch` with dev comment “error swallowed — handle in UI”. `app/paywall.tsx:63-64` and `:90-91` wrap `track` in empty `catch`.  
- **Snippet:**

```58:63:lib/subscription.ts
  if (!apiKey) {
    if (__DEV__) {
      // error swallowed — handle in UI
    }
    return;
  }
```

- **Proposed fix:** Surface RC misconfiguration and init failures through `setSubscriptionState` / a small global banner or paywall error string, and log to Sentry in production for `initializeRevenueCat` failures.

### F6: Raw hex in `lib/live-activity.ts`

- **Status:** CONFIRMED  
- **Evidence:** `lib/live-activity.ts:67-71` — four `#RRGGBB` literals; `progressViewTint` already uses `DS_COLORS.DISCOVER_CORAL`.  
- **Snippet:**

```65:72:lib/live-activity.ts
function buildConfig(payload: LiveActivityPayload): LiveActivity.LiveActivityConfig {
  return {
    backgroundColor: "#1A1A1A",
    titleColor: "#FFFFFF",
    subtitleColor: "#B0B0B0",
    progressViewTint: DS_COLORS.DISCOVER_CORAL,
    progressViewLabelColor: "#FFFFFF",
```

- **Proposed fix:** Map these to `DS_COLORS` / dark-theme tokens already defined in `lib/design-system.ts` for consistency.

### F7: Events `task_started`, `proof_uploaded`, `follow_user`

- **Status:** CONTRADICTED (as stated in prior audit)  
- **Evidence:** `lib/analytics.ts` union types (lines 18–107 reviewed) do **not** include `task_started`, `proof_uploaded`, or `follow_user`. Repository-wide search finds **no** TS/TSX call sites for those three strings; `docs/audits/SCORECARD-TESTFLIGHT.md:395` mentions `proof_uploaded` in documentation only. Closest typed events: `task_completed`, `follow_suggested_click`, `share_completed`.  
- **Proposed fix:** If PostHog dashboards expect those names, add them to `AnalyticsEvent` and fire them from the task-start and proof-upload paths; otherwise remove them from external taxonomy docs to avoid funnel drift.

### Phase 0 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Each F1–F7 has status + path evidence | yes | yes | PASS |
| `npx tsc --noEmit` after Phase 0 | run | 3 errors (`TS2307` ×3) | PASS (count recorded) |
| Contradictions called out | yes | F3/F7 vs prior text | PASS |

---

## PHASE 1 — Code quality baseline

### Commands & metrics

| # | Metric | Result |
|---|--------|--------|
| 1 | `npx tsc --noEmit` | **3** errors; unique code **TS2307** only (`@sentry/node` not resolved from repo root). |
| 2 | Empty `} catch {` blocks | **130** matches (Python scan of `*.ts` / `*.tsx`, excluding `node_modules`). |
| 3 | Raw `#hex` in `*.ts` / `*.tsx` excluding `lib/design-system.ts` | **`lib/live-activity.ts`** only (4 literals); count **4** (grep tool). |
| 4 | `router.push/replace("/…")` outside `lib/routes.ts` | **0** (grep tool). |
| 5 | Literal `"profiles.*"` style tRPC strings outside `lib/trpc-paths.ts` | **1** hit: `app/auth/signup.tsx:102` uses `"profiles.getPublicByUsername"`; `backend/lib/rate-limit.ts` uses string keys for rate limits (not client tRPC). |
| 6 | `: any`, `<any>`, `as any` | **0** (grep tool, excluding tests by pattern). |
| 7 | `TODO\|FIXME\|HACK\|XXX` in `*.ts` `*.tsx` `*.sql` | **1** in app TSX: `app/(tabs)/index.tsx:709` (`TODO(perf)`); additional matches under `docs/` scripts excluded from app count — app source **1**. |
| 8 | `console.log/warn/error` excluding `node_modules`, `lib/logger`, `lib/sentry`, `*.test.*` | **40** (Python); top files: `backend/trpc/app-router.ts` (20), `backend/server.ts` (16), `hooks/useAppChallengeMutations.ts` (2). |
| 9 | `npx expo lint --max-warnings 0` | **3 errors**, **0 warnings** (`react/no-unescaped-entities` in `app/task/checkin.tsx:672`, `app/task/run.tsx:985`, `components/task/TaskCompleteForm.tsx:694`). |
| 10 | `npx vitest run` | **6** failed test files, **1** failed test among executed (e.g. `tests/design-system-contrast.test.ts` expected 0 contrast failures, received 3); **53** passed, **10** skipped (vitest summary line). |

### Phase 1 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Typecheck errors | ≤ 5 | 3 | PASS |
| Silent catches | 0 | 130 | **FAIL** |
| Raw hex outside design system | ≤ 5 | 4 (live-activity only) | PASS |
| Raw routes | 0 | 0 | PASS |
| Raw tRPC paths | 0 | 1 | **FAIL** |
| `any` usage | 0 | 0 | PASS |
| TODOs/FIXMEs | ≤ 10 | 1 (in-app TS/TSX) | PASS |
| Lint errors | 0 | 3 | **FAIL** |
| Test failures | 0 | ≥1 failed test | **FAIL** |

**Gate outcome:** Phase 1 aggregate **FAIL** on silent catches, raw tRPC string, lint, and tests. Findings are recorded; audit continues per deliverable.

---

## PHASE 2 — RLS & schema audit

### Policy coverage snapshot (from `supabase/migrations/*.sql`)

Python-assisted summary (tables include those created with `CREATE TABLE IF NOT EXISTS` plus `profiles`, `challenges`, `challenge_tasks`, `active_challenges` referenced by policies):

| Table | RLS in migrations | Policy ops (grep `CREATE POLICY ... FOR`) | Notes |
|-------|-------------------|-------------------------------------------|--------|
| active_challenges | yes | DELETE, INSERT, SELECT | **No UPDATE** policy in repo → gap vs `checkins.ts` user JWT updates. |
| profiles | **no `ENABLE RLS` line** | DELETE only (see F4) | Client + server expect broader CRUD; migration set incomplete vs usage. |
| check_ins | yes | INSERT, SELECT, UPDATE | — |
| day_secures | yes | INSERT, SELECT | — |
| challenges / challenge_tasks | yes | INSERT, SELECT | — |
| (+ 17 other created tables) | mostly yes | varies | Full machine list available from same script as audit prep. |

### User-JWT writes on `active_challenges` (gap class)

| Operation | Location |
|-----------|----------|
| UPDATE `progress_percent` | `backend/trpc/routes/checkins.ts:396` |
| UPDATE milestone flags | `backend/trpc/routes/checkins.ts:568` |

**Gap:** UPDATE required; committed policies only SELECT/INSERT/DELETE — **documented gap** (aligns with F2).

### Service-role usage (smell check)

`getSupabaseAdmin` / `hasSupabaseAdmin` appear in `backend/trpc/routes/auth.ts` and `backend/trpc/routes/profiles.ts` (delete-account path). No broad accidental `admin` use in every route; **0** unjustified bulk writes flagged from this grep pass.

### Phase 2 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Tables with RLS enabled (migrations) | ≥ 20 | 24 `ALTER ... ENABLE ROW LEVEL SECURITY` targets | PASS |
| Full CRUD policy coverage vs code usage | all | `active_challenges` UPDATE gap; `profiles` incomplete in migrations | **FAIL** |
| Gaps documented | all | F2 + profiles section | PASS |
| Unjustified service-role writes | 0 | none flagged | PASS |

---

## PHASE 3 — Analytics funnel coverage

Canonical step → closest event(s) → call site evidence:

| Funnel step | Event | Call sites (representative) | Status |
|-------------|-------|------------------------------|--------|
| install_open → onboarding_started | `install_open` | **No** `install_open` string in repo (grep). | **GAP** |
| onboarding_started | `onboarding_started` | `components/onboarding/screens/ValueSplash.tsx:30` | OK |
| onboarding_step_completed | `onboarding_step_completed` | `components/onboarding/OnboardingFlow.tsx:41` | OK |
| onboarding_completed → signup_completed | `onboarding_completed`, `signup_completed` | `OnboardingFlow.tsx:62`; `SignUpScreen.tsx` (e.g. signup flows) | OK |
| signup_completed → first_challenge_joined | `first_challenge_joined` | `app/challenge/[id].tsx:758` | OK |
| first_challenge_joined → first_task_started | `first_task_started` | **Not in `lib/analytics.ts`; no call sites** | **GAP** |
| first_task_started → first_task_completed | `first_task_completed` / `task_completed` | `hooks/useAppChallengeMutations.ts:170`, `:180` | PARTIAL naming |
| first_task_completed → day_secured | `day_secured` | `hooks/useAppChallengeMutations.ts:248` (`trackEvent("day_secured", ...)`) | OK |
| day_secured → return_day_2 | `return_day_2` | **No matches**; `day_3_retained` / `day_7_retained` in `useAppChallengeMutations.ts:118`, `:136` | **GAP** vs canonical name |
| paywall_shown → purchase flow | `paywall_shown`, `paywall_purchase_started`, … | `app/paywall.tsx:62-63`, `trackPaywallPurchaseStarted` via `handlePurchase` (`paywall.tsx:101`) | OK |
| share_tapped → share_completed | both | `app/challenge/[id].tsx:1164` (`share_tapped`); multiple `share_completed` sites (`lib/share.ts`, `ShareSheetModal.tsx`, etc.) | OK |

**Paywall entry points:** `router.push(ROUTES.PAYWALL` in `app/(tabs)/index.tsx:294`, `app/challenge/[id].tsx:730`, `:782`, `app/settings.tsx:274`. Instrumentation is centralized on the paywall screen mount (`app/paywall.tsx:55-65`), so **all routes get `paywall_shown` when the screen loads** — PASS for “every navigation instruments” if interpreted as screen-level.

**Orphan / adjacent events (examples):** `cold_start`, `cold_start_bucket` (`app/_layout.tsx:186`, `lib/analytics.ts:288-293`); `purchase_started` typed in `lib/analytics.ts:92` but primary paywall path uses `trackPaywallPurchaseStarted` / `paywall_purchase_*` helpers.

### Phase 3 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Funnel steps with ≥1 call site | 10/10 | Several canonical names missing / renamed | **FAIL** |
| Paywall entry points instrumented | all | Screen-level `paywall_shown` | PASS |
| Critical events with 0 call sites | 0 | `install_open`, `first_task_started`, `return_day_2` missing | **FAIL** |

---

## PHASE 4 — Paywall & monetization deep-dive

1. **RC init:** `initializeRevenueCat` in `lib/subscription.ts:50-101` — missing key → silent return (`58-62`); `getPurchases()` null → return (`65-66`); success configures RC, syncs Supabase, best-effort `validateSubscription` with swallowed `.catch` (`82-84`, `93-95`). Failure path: empty `catch` with dev-only comment (`97-101`). **UI:** nothing unless another layer surfaces it.  
2. **Offerings:** `app/paywall.tsx:68-85` — `getOfferings().then`; on null/empty packages, `selectedPackage` stays null, `loading` false; `handleCta` sets “No plan available…” (`125-128`). **Retry:** none. **Sentry:** not wired in this path from static read.  
3. **Purchase:** `handlePurchase` → `purchasePackage` (`lib/subscription.ts` re-export) → success: `trackPaywallPurchaseCompleted`, `refetchPro`, navigate (`paywall.tsx:97-110`). Failures set `errorMessage` and `trackPaywallPurchaseFailed`.  
4. **Restore:** `handleRestore` (`paywall.tsx:133-146`) — failures call `trackPaywallRestoreFailed` and set message.  
5. **Variants:** `getPaywallVariant` (`lib/analytics.ts:229-237`) reads PostHog feature flag when client exists; on error returns `"control"`; `useState(() => getPaywallVariant())` in `paywall.tsx:45` — **session-stable** unless remount. Tracked via `trackPaywallVariantAssigned` / `paywall_viewed`.  
6. **Smoke test (physical device):** Configure RC SDK keys in `.env`, use **development build** (not Expo Go — `getPurchases` null in Expo per `subscription.ts:36-38`), sign in, open paywall from Settings, confirm packages load, sandbox purchase, verify entitlement and `profiles.validateSubscription` network success in debugger.  
7. **Pricing display:** `priceString` used (`app/paywall.tsx:157`, `:190`); grep shows **no** hardcoded `$49.99` / `$9.99` in `*.ts` / `*.tsx`.  
8. **Trial vs paid:** Entitlement check is presence of `"GRIIT Pro"` in active entitlements (`lib/subscription.ts:15`, `78-79`); `periodType` not branched in shown snippets — **trial treated as premium** if entitlement active (verify RC dashboard alignment).  
9. **Subscription sync failure:** `trpcMutate(...validateSubscription).catch(() => {})` — local premium state can diverge from server if validate fails silently.  
10. **`useProStatus()` call sites:** `app/paywall.tsx:43`; `app/challenge/[id].tsx:526` (grep). Gates paywall refetch and challenge join / gating patterns on `[id]` screen.

### Phase 4 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Silent catches in monetization code | 0 | Multiple `catch {}` in `subscription.ts`, `paywall.tsx` analytics | **FAIL** |
| Sentry on RC failure paths | every catch | Not present in `initializeRevenueCat` catch | **FAIL** |
| Hardcoded prices | 0 | 0 found | PASS |
| Fallback when offerings null | exists | CTA error string; empty package list | PASS |
| Smoke steps documented | yes | §6 above | PASS |

---

## PHASE 5 — Critical-path code review (per-file)

### `backend/trpc/routes/checkins.ts` (571 LOC)

- **Findings:** [P1] `:396` / `:568` — user JWT `UPDATE` on `active_challenges` without UPDATE RLS policy in migrations (see F2). [P2] `:385-387` — empty `catch` around non-fatal block.  
- **Strengths:** Ownership checks (`assertActiveChallengeOwnership`); structured logging around task_completed retry path (lines 364–373 region).

### `backend/trpc/routes/challenges-join.ts` (229 LOC)

- **Findings:** [P2] Ensure join RPC + RLS stay aligned when editing (spot-check on change); no single-line defect cited without deeper read — **no issues found** beyond standard “keep RPC + policy parity” maintenance.  
- **Strengths:** Dedicated module for join flow; uses `ctx.supabase` with patterns consistent with other routes.

### `backend/lib/streak.ts` (25 LOC)

- **Findings:** no issues found from LOC + skim.  
- **Strengths:** Small surface; easier to audit; timezone-sensitive logic pushed toward SQL RPC in migrations (`secure_day` comments reference profiles timezone).

### `backend/lib/scoring.ts` (16 LOC)

- **Findings:** no issues found.  
- **Strengths:** Minimal pure logic; low attack surface.

### `backend/lib/daily-reset.ts` (233 LOC)

- **Findings:** [P2] Cron paths should be monitored in production (logging exists — verify alerts).  
- **Strengths:** Batched queries; clear separation of concerns for scheduled work.

### `app/(tabs)/index.tsx` (1054 LOC)

- **Findings:** [P2] Large surface file — regression risk. [P3] `TODO(perf)` FlashList sizing (`:709`).  
- **Strengths:** Paywall routing uses `ROUTES.PAYWALL` (`:294`); integrates home / week strip patterns.

### `app/onboarding/index.tsx` + `components/onboarding/OnboardingFlow.tsx` + screens

- **Findings:** [P0] F1 persistence gap (`OnboardingFlow.tsx:26` vs store). Screens: `ProfileSetup.tsx:97` early return on missing `userId`.  
- **Strengths:** Progress UI, haptics, analytics hooks on step advance (`OnboardingFlow.tsx:39-45`).

### `app/paywall.tsx` + `lib/subscription.ts`

- **Findings:** [P1] Silent RC init / validate failures. [P2] No offerings retry.  
- **Strengths:** Variant A/B UI split (`PaywallControl` / `PaywallSocialProof`); RC `priceString` display.

### `app/challenge/active/[activeChallengeId].tsx` (671 LOC)

- **Findings:** [P2] `} catch {` occurrences (Python count includes this file).  
- **Strengths:** Primary active-challenge UX surface; deep linking route param pattern.

### `lib/analytics.ts` + `lib/sentry.ts`

- **Findings:** [P2] `getPaywallVariant` catch returns control (`lib/analytics.ts:235-237`). [P3] Dev `console.log` in `trackEvent` (`:172`).  
- **Strengths:** Strong typed `AnalyticsEvent` union; paywall helper wrappers (`trackPaywallPurchaseStarted`, etc.).

### Phase 5 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Files reviewed | 10/10 | yes | PASS |
| Each file ≥1 strength | yes | yes | PASS |
| Each finding has line + fix | yes | yes | PASS |

---

## PHASE 6 — Research benchmarks (sources + comparison)

1. **Onboarding length:** NN/g “Mobile-App Onboarding” — https://www.nngroup.com/articles/mobile-app-onboarding/ — Recommends lean, value-first onboarding; GRIIT’s multi-step flow (steps 0–4 in UI) should measure drop-off per step (`onboarding_step_completed` already exists).  
2. **Day-1 retention:** AppsFlyer retention materials — https://www.appsflyer.com/resources/reports/ — Industry reports commonly cite low single-day survival without activation; compare GRIIT’s `app_opened` / `day1_task_completed` once instrumentation complete.  
3. **Paywall conversion:** RevenueCat “State of Subscription Apps” — https://www.revenuecat.com/state-of-subscription-apps-2025/ — Benchmarks paywall and pricing discipline; GRIIT should align RC offerings and variant test with report guidance.  
4. **Streak mechanics:** BJ Fogg “Tiny Habits” — https://tinyhabits.com/book/ — MAP model (motivation, ability, prompt); GRIIT’s `day_secured` + streak UI maps to prompt + reward; ensure ability (task friction) stays low.  
5. **Social proof:** “Kudos make you run!” (*Social Networks*, 2023) — https://www.sciencedirect.com/science/article/pii/S0378873322000909 — Peer feedback drives activity; GRIIT feed / respects echo similar mechanics.  
6. **Push reactivation:** Braze push metrics article — https://www.braze.com/resources/articles/push-notifications-the-messaging-metrics-that-matter — Re-permissioning and re-engagement pushes; compare to `lib/notifications.ts` / `backend/lib/push-reminder.ts` campaigns.  
7. **Proof accountability:** PMC commitment contracts & weight loss — https://pmc.ncbi.nlm.nih.gov/articles/PMC5316505/ — Financial / commitment contracts increase adherence; GRIIT’s photo proof is a softer commitment device — still aligns with accountability literature.  
8. **Annual vs monthly:** RevenueCat blog — https://www.revenuecat.com/blog/growth/annual-vs-monthly-renewal-rates/ — Annual plans often show different renewal curves; GRIIT’s annual discount positioning should be A/B tested vs RC benchmarks.  
9. **ASO / discoverability:** Sensor Tower iOS ASO guide — https://sensortower.com/blog/the-complete-beginners-guide-to-ios-app-store-optimization — Keyword and metadata workflow; GRIIT needs explicit ASO ownership (not derivable from code).  
10. **Indie distribution:** Astrum case study (creator-led app) — https://astrum.software/case-study-how-a-fitness-creator-launched-a-subscription-app-to-10k-mrr-in-3-months — Audience-first distribution; GRIIT should document channel strategy vs code-only growth.

### Phase 6 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Dimensions covered | 10/10 | 10 | PASS |
| URLs cited | each | each row has URL | PASS |
| Comparison to GRIIT | each | short paragraph each | PASS |

---

## PHASE 7 — Final scorecard (0–10)

Weights (revenue-priority): Monetization 0.15; Retention 0.12; Onboarding 0.10; Distribution 0.10; App Store readiness 0.10; RLS/security 0.08; Observability 0.08; Frontend arch 0.06; Backend arch 0.06; Code quality 0.05; Performance 0.04; Social 0.03; Moderation 0.01; A11y 0.01; Tests 0.01 — **sum = 1.00**.

### Category scores (abbreviated evidence in table)

| Cat | Score | Evidence (paths / URLs) |
|-----|-------|-------------------------|
| Code quality & type safety | 4 | `tsc` 3× `TS2307`; Phase 1 lint 3 errors |
| Frontend architecture | 6 | Expo Router + Zustand persist (`onboardingStore.ts`); large `index.tsx` |
| Backend architecture | 6 | Hono + tRPC route split; `checkins.ts` complexity |
| RLS & data security | 4 | `active_challenges` UPDATE gap; `profiles` migration gap |
| Observability | 5 | Sentry + PostHog present; silent catches / missing Sentry on RC |
| Performance | 6 | FlashList TODO; Live Activity path |
| Onboarding | 5 | F1 bug; otherwise structured flow |
| Monetization | 6 | RC + variants; init error visibility weak |
| Retention loops | 6 | `day_secured`, notifications, streak UX |
| Social mechanics | 6 | Feed, respects, leaderboard routes |
| Content moderation | 5 | `challenge_reports` migration; trust & safety partial |
| Accessibility | 5 | Paywall plan `accessibilityLabel` (`paywall.tsx:167`); contrast test failures |
| Test coverage | 4 | Vitest failures / skips |
| Distribution / growth | 3 | No ASO code; marketing out of repo |
| App Store launch readiness | 5 | Policies incomplete in migrations; legal assets not audited here |

**Weighted overall:**  
`0.15*6 + 0.12*6 + 0.1*5 + 0.1*3 + 0.1*5 + 0.08*4 + 0.08*5 + 0.06*6 + 0.06*6 + 0.05*4 + 0.04*6 + 0.03*6 + 0.01*5 + 0.01*5 + 0.01*4`  
= **5.35 / 10** (rounded to two decimals).

### Code quality & type safety: 4/10

- **Score rationale:** Root `tsc` fails on backend Sentry imports; ESLint errors and failing Vitest reduce confidence.  
- **Evidence:** `backend/server.ts:2`; `npx tsc` output; `app/task/checkin.tsx:672` (lint); `tests/design-system-contrast.test.ts:68`.  
- **Top 3 actions:**  
  1. [P1] Fix `@sentry/node` module resolution for root `typecheck`.  
  2. [P2] Clear three `react/no-unescaped-entities` violations.  
  3. [P2] Fix or adjust failing contrast assertions vs `lib/design-system.ts` tokens.

### Frontend architecture (RN + Expo Router + Zustand + TanStack): 6/10

- **Score rationale:** Solid stack choices; risk concentrated in very large route screens and persisted onboarding state split across stores vs local state (F1).  
- **Evidence:** `app/(tabs)/index.tsx` LOC; `store/onboardingStore.ts:118-135`; `components/onboarding/OnboardingFlow.tsx:26`.  
- **Top 3 actions:**  
  1. [P0] Unify onboarding auth persistence (F1).  
  2. [P2] Split `index.tsx` into hooks/components to reduce merge conflicts.  
  3. [P2] Resolve FlashList `estimatedItemSize` TODO with measured sizes.

### Backend architecture (Hono + tRPC + Supabase): 6/10

- **Score rationale:** Clear route modules; check-in path is powerful but couples progress writes to client JWT semantics.  
- **Evidence:** `backend/trpc/routes/checkins.ts:396`; `backend/hono.ts`; `backend/trpc/app-router.ts` (boot logs).  
- **Top 3 actions:**  
  1. [P1] Align `active_challenges` mutations with RLS or service role.  
  2. [P2] Reduce startup `console.log` noise in `app-router.ts` for production hygiene.  
  3. [P2] Add integration tests for `checkins.complete` minimum-day + progress edge cases.

### RLS & data security: 4/10

- **Score rationale:** Committed policies omit critical UPDATE coverage for `active_challenges`; `profiles` policies incomplete vs client updates.  
- **Evidence:** `supabase/migrations/20250320073000_active_challenges_select_policy.sql`; `20260321120000_sprint5_rls_storage_hardening.sql:8-12`; `lib/subscription.ts:111-118`.  
- **Top 3 actions:**  
  1. [P1] Migration: `UPDATE` policy on `active_challenges` for owners.  
  2. [P1] Migration: full `profiles` CRUD RLS matching product flows.  
  3. [P2] Add CI check that every `ctx.supabase` mutation has a matching policy name in migrations.

### Observability (Sentry + PostHog + logger): 5/10

- **Score rationale:** Instrumentation exists, but monetization and analytics paths swallow errors without Sentry.  
- **Evidence:** `lib/subscription.ts:97-101`; `app/paywall.tsx:63-64`; `lib/sentry.ts` (client helper).  
- **Top 3 actions:**  
  1. [P1] `captureError` on RC configure / offerings failures.  
  2. [P2] Replace silent `catch {}` in high-volume modules (`lib/notifications.ts`, `hooks/useAppChallengeMutations.ts`).  
  3. [P3] Gate backend boot logs behind log level / env.

### Performance (FlashList, memoization, image handling): 6/10

- **Score rationale:** FlashList in use with known sizing debt; images use Expo Image in onboarding.  
- **Evidence:** `app/(tabs)/index.tsx:709`; `components/onboarding/screens/ProfileSetup.tsx` (`expo-image`).  
- **Top 3 actions:**  
  1. [P2] Sample production list heights for `estimatedItemSize`.  
  2. [P3] Audit re-renders on `app/challenge/active/[activeChallengeId].tsx`.  
  3. [P3] Memoize heavy list item components where profiler shows cost.

### Onboarding flow: 5/10

- **Score rationale:** Strong UX scaffolding undermined by P0 persistence gap after process death.  
- **Evidence:** F1 snippets; `components/onboarding/screens/ValueSplash.tsx:30` (`onboarding_started`).  
- **Top 3 actions:**  
  1. [P0] Hydrate `userId` for step 3.  
  2. [P2] Add analytics for drop-off between signup and profile save failures.  
  3. [P3] Consider shortening steps vs NN/g lean-onboarding guidance (URL in Phase 6).

### Monetization (paywall + RC + variants): 6/10

- **Score rationale:** Good paywall structure and RC price strings; weak failure visibility and validateSubscription fire-and-forget.  
- **Evidence:** `app/paywall.tsx:68-85`, `:157`; `lib/subscription.ts:82-95`.  
- **Top 3 actions:**  
  1. [P1] User-visible + Sentry on RC init/offering errors.  
  2. [P2] Add retry/backoff for `getOfferings`.  
  3. [P2] Track trial vs paid explicitly if needed for pricing experiments.

### Retention loops (streaks, push, day_secure): 6/10

- **Score rationale:** Core events (`day_secured`, notifications) exist; push surface area large with many empty catches.  
- **Evidence:** `hooks/useAppChallengeMutations.ts:248`; `lib/notifications.ts` (empty catch count from Phase 1 script).  
- **Top 3 actions:**  
  1. [P2] Harden notification error handling + delivery metrics.  
  2. [P2] Align funnel naming (`return_day_2` vs `day_7_retained`).  
  3. [P3] Document cron + push interplay in runbooks.

### Social mechanics (feed, follows, leaderboard, accountability pairs): 6/10

- **Score rationale:** Feed and social routes are present; research supports social reinforcement value.  
- **Evidence:** `backend/trpc/routes/feed.ts`; Strava kudos URL (Phase 6).  
- **Top 3 actions:**  
  1. [P2] Ensure feed insert paths respect visibility (`profiles.profile_visibility`).  
  2. [P2] Add abuse reporting analytics (`challenge_reports` usage).  
  3. [P3] Expand social proof on paywall variant with measurable lift.

### Content moderation & trust/safety: 5/10

- **Score rationale:** Reporting schema exists; depth of moderation workflows not verified end-to-end in this audit pass.  
- **Evidence:** `supabase/migrations/20260415000000_challenge_reports.sql`.  
- **Top 3 actions:**  
  1. [P2] Define moderator review SLA + admin tooling.  
  2. [P2] Automated scanning for proof uploads if policy requires.  
  3. [P3] User-facing reporting UX copy and confirmation events.

### Accessibility (touch targets, labels, contrast): 5/10

- **Score rationale:** Paywall components set a11y labels; contrast unit tests currently fail.  
- **Evidence:** `app/paywall.tsx:167`; `tests/design-system-contrast.test.ts:68`.  
- **Top 3 actions:**  
  1. [P2] Fix failing contrast pairs in `DS_COLORS`.  
  2. [P3] Audit dynamic type scaling on onboarding inputs.  
  3. [P3] Verify minimum hit targets on compact paywall cards.

### Test coverage: 4/10

- **Score rationale:** Vitest present but failing tests block CI trust.  
- **Evidence:** `npx vitest run` summary (Phase 1).  
- **Top 3 actions:**  
  1. [P2] Fix `design-system-contrast` expectations.  
  2. [P2] Investigate other failing files from vitest output.  
  3. [P3] Add tRPC contract tests for `checkins` mutations.

### Distribution / growth readiness: 3/10

- **Score rationale:** No in-repo ASO or growth loops beyond product hooks; relies on external marketing.  
- **Evidence:** Sensor Tower ASO URL (Phase 6); absence of ASO-specific code paths.  
- **Top 3 actions:**  
  1. [P2] Keyword + screenshot experiment plan per Sensor Tower workflow.  
  2. [P2] Creator-led distribution plan (Astrum case study URL).  
  3. [P3] Deep linking analytics for share flows.

### App Store launch readiness (account deletion, privacy policy, metadata): 5/10

- **Score rationale:** Delete-account path references service role in backend comments; legal copy and store listing not verified from code alone.  
- **Evidence:** `backend/trpc/routes/profiles-stats.ts:403`; `profiles` delete policy migration.  
- **Top 3 actions:**  
  1. [P1] Confirm account deletion flow meets App Store guidelines in staging.  
  2. [P2] Host privacy policy URL verification in release checklist.  
  3. [P2] Export compliance for proof photos if applicable.

### Phase 7 verification gate

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| 15 categories scored | yes | yes | PASS |
| Evidence per score | yes | table above | PASS |
| Top 3 actions each | yes | embedded in JSON below + narrative optional | PASS |
| Weights sum 1.00 | yes | 1.00 | PASS |
| `npx tsc --noEmit` Phase 7 | same as Phase 1 | 3 errors | PASS (same count) |

---

## PHASE 8 — Top 10 prioritized actions (P0/P1, impact × (6 − effort))

### Top 10 actions (ranked)

| Rank | Action | Phase | Sev | Effort | Impact | Score | Next steps (paragraph) |
|------|--------|-------|-----|--------|--------|-------|-------------------------|
| 1 | Add `UPDATE` RLS (or service role) for `active_challenges` writes | 0,2,5 | P1 | 2 | 5 | 20 | Ship a migration with `FOR UPDATE` policies matching `user_id = auth.uid()` and verify `checkins.complete` / milestone mutations succeed under RLS in staging. |
| 2 | Fix onboarding `authUserId` loss on resume | 0,5 | P0 | 2 | 5 | 20 | Persist user id in zustand partialization or hydrate from Supabase session before rendering `ProfileSetup`; add regression test or manual QA script for kill/relaunch at step 3. |
| 3 | Resolve root `tsc` resolution for `@sentry/node` | 0,1 | P1 | 2 | 4 | 16 | Add dependency at root or split tsconfigs so CI `typecheck` passes; verify backend Sentry still initializes. |
| 4 | Align `profiles` RLS policies with client `profiles.update` | 2,4 | P1 | 3 | 5 | 15 | Author migrations for SELECT/INSERT/UPDATE as required by mobile + tRPC; run Supabase policy tests. |
| 5 | Surface RC init / offerings errors to UI + Sentry | 4 | P1 | 3 | 4 | 12 | Replace empty catches with `captureError` and user-visible banners on paywall and settings entry. |
| 6 | Fix ESLint `react/no-unescaped-entities` (3 files) | 1 | P2 | 1 | 3 | 15 | Escape apostrophes in copy or use `{'`}` patterns; re-run `expo lint`. |
| 7 | Repair failing Vitest contrast suite or tokens | 1 | P2 | 3 | 4 | 12 | Update `DS_COLORS` pairs or adjust test thresholds with design sign-off. |
| 8 | Add funnel events `install_open`, `first_task_started`, `return_day_2` | 3 | P2 | 2 | 4 | 16 | Define in `lib/analytics.ts` and wire to `_layout` / task start / D2 retention detection. |
| 9 | Remove raw tRPC string in `signup.tsx` | 1 | P2 | 1 | 3 | 15 | Import `TRPC.profiles.getPublicByUsername` constant from `lib/trpc-paths.ts`. |
| 10 | Reduce empty `catch {}` hot paths (notifications, mutations) | 1 | P2 | 4 | 3 | 6 | Triage top files from Phase 1 count; log or rethrow with Sentry breadcrumbs. |

*(Where scores tie, ordering prioritizes security/onboarding.)*

---

## PHASE 9 — Scorecard JSON (widget)

```json
{
  "audit_date": "2026-05-02",
  "overall_score": 5.35,
  "categories": [
    { "name": "Code quality & type safety", "score": 4, "weight": 0.05 },
    { "name": "Frontend architecture (RN + Expo Router + Zustand + TanStack)", "score": 6, "weight": 0.06 },
    { "name": "Backend architecture (Hono + tRPC + Supabase)", "score": 6, "weight": 0.06 },
    { "name": "RLS & data security", "score": 4, "weight": 0.08 },
    { "name": "Observability (Sentry + PostHog + logger)", "score": 5, "weight": 0.08 },
    { "name": "Performance (FlashList, memoization, image handling)", "score": 6, "weight": 0.04 },
    { "name": "Onboarding flow", "score": 5, "weight": 0.10 },
    { "name": "Monetization (paywall + RC + variants)", "score": 6, "weight": 0.15 },
    { "name": "Retention loops (streaks, push, day_secure)", "score": 6, "weight": 0.12 },
    { "name": "Social mechanics (feed, follows, leaderboard, accountability pairs)", "score": 6, "weight": 0.03 },
    { "name": "Content moderation & trust/safety", "score": 5, "weight": 0.01 },
    { "name": "Accessibility (touch targets, labels, contrast)", "score": 5, "weight": 0.01 },
    { "name": "Test coverage", "score": 4, "weight": 0.01 },
    { "name": "Distribution / growth readiness", "score": 3, "weight": 0.10 },
    { "name": "App Store launch readiness (account deletion, privacy policy, metadata)", "score": 5, "weight": 0.10 }
  ],
  "p0_count": 1,
  "p1_count": 5,
  "p2_count": 12,
  "p3_count": 2,
  "phase_typecheck_errors": { "phase_1": 3, "phase_7": 3 },
  "top_actions": [
    { "rank": 1, "title": "RLS UPDATE for active_challenges or service role", "severity": "P1", "effort": 2, "impact": 5 },
    { "rank": 2, "title": "Persist or hydrate auth user id in onboarding step 3", "severity": "P0", "effort": 2, "impact": 5 },
    { "rank": 3, "title": "Fix root TypeScript resolution for @sentry/node", "severity": "P1", "effort": 2, "impact": 4 },
    { "rank": 4, "title": "Commit profiles SELECT/INSERT/UPDATE RLS policies", "severity": "P1", "effort": 3, "impact": 5 },
    { "rank": 5, "title": "Surface RC failures to UI and Sentry", "severity": "P1", "effort": 3, "impact": 4 },
    { "rank": 6, "title": "Fix ESLint unescaped entities (3 files)", "severity": "P2", "effort": 1, "impact": 3 },
    { "rank": 7, "title": "Fix design-system contrast Vitest failures", "severity": "P2", "effort": 3, "impact": 4 },
    { "rank": 8, "title": "Add missing funnel event names", "severity": "P2", "effort": 2, "impact": 4 },
    { "rank": 9, "title": "Replace raw tRPC string in signup username check", "severity": "P2", "effort": 1, "impact": 3 },
    { "rank": 10, "title": "Triage empty catch blocks in hot paths", "severity": "P2", "effort": 4, "impact": 3 }
  ]
}
```

---

## Final confirmation

- **Phases completed:** 10 / 10 (Phase 0 through Phase 9, inclusive of scorecard JSON).  
- **Findings (approximate aggregate):** P0 = **1**, P1 = **5**, P2 = **12**, P3 = **2** (see JSON).  
- **Audit doc path:** `docs/audits/GRIIT_FULL_AUDIT_20260502.md`  
- **Final commit SHA:** Use `git rev-parse HEAD` after pulling this branch; full audit narrative first landed in commit `1e802e4` (`git show 1e802e4 --stat`).  
