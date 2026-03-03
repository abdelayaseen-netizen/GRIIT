# GRIT — Senior Product + Engineering Evaluation

**Evaluator:** Cursor (senior product + engineering reviewer)  
**Basis:** Repo inspection, codebase evidence, prior fix reports, and scorecard docs.  
**Date:** 2025-02-28.

**Rating scale:** 0 = unacceptable, 5 = excellent. Every category includes: Score, Evidence, Risks if launched today, Top 3 fixes (highest ROI).

---

## STEP 1 — BASELINE VERIFICATION

### 1) Install / run checks

| Check | Result | Notes |
|-------|--------|------|
| Packages install | **Unknown** | Node/npm were not in PATH in the evaluation environment. Run `npm install` locally to confirm. |
| App launches | **Unknown** | Not run in this session. Run `npm start` (and optionally `expo start --web`) locally. |
| Backend starts | **Unknown** | Not run. Run `npm run backend:start` (tsx backend/server.ts) locally. |

### 2) TypeScript health

| Check | Result | Notes |
|-------|--------|------|
| TS errors | **Unknown** | `npx tsc --noEmit` was not run (Node unavailable). Run locally; linter reported no errors on recently modified files. |
| Warnings | **Unknown** | Full tsc output not captured. |

### 3) Core flows (evidence from codebase + prior reports)

| Flow | Status | Evidence |
|------|--------|----------|
| App launch | **Assumed working** | `_layout.tsx`: SplashScreen, font load, AuthRedirector; profile check with timeout; redirect to create-profile / onboarding / (tabs). |
| Auth | **Implemented** | Supabase auth; create-profile → onboarding → tabs; AuthGateModal for guest gating (`contexts/AuthGateContext.tsx`, `AuthGateModal.tsx`). |
| Main navigation | **Implemented** | Expo Router; tabs (index, discover, create, activity, profile); stack screens (challenge/[id], chat, commitment, success, settings, auth). |
| Create Challenge E2E | **Fixed (prior work)** | `CREATE-CHALLENGE-AND-BUTTONS-FIX-REPORT.md`: backend maps `simple`→`manual`, journal minWords default 20; TRPCError codes; frontend loading/error/success; regression tests in `challenges-create.test.ts`. |
| Buttons / tap-through | **Addressed** | Chat-info “View all members” and “Report an issue” wired with onPress; Create submit uses handleCreate with loading/disabled; other primary buttons have onPress (grep/audit). |

**Verification gap:** No automated E2E or real-device tap-through was run in this session. **Recommend:** Run `npx tsc --noEmit`, `npm run test`, then manual smoke: launch → auth → tabs → Create Challenge (fill → submit → success) and tap primary CTAs.

---

## STEP 2 — PRODUCT + ENGINEERING EVALUATION (0–5)

### A) Value Proposition Clarity — **4**

- **Evidence:** Onboarding copy: “What are you here to build?” (goal + time budget + starter); app identity “Build Discipline Daily”; Home “Secure your day,” streak, recovery copy (`app/onboarding.tsx`, `app/(tabs)/index.tsx`, `GRIT-SUCCESS-SCORECARD.md`).
- **Risks if launched today:** “Why” is clear for discipline/habit users; less obvious for casual browsers in first 10s if they land on Discover without onboarding.
- **Top 3 fixes:**  
  1. Add one line on splash or first screen: “Build discipline daily. One challenge, one day at a time.”  
  2. Discover empty state or header: “Pick a challenge to build your streak.”  
  3. Optional: short “For people who show up every day” in onboarding step 1.

---

### B) Target User Fit & Problem–Solution Fit — **3.5**

- **Evidence:** Onboarding goal options (Fitness, Mind, Faith, Discipline, Other) and time budget; starter challenges (water, steps, read, journal, breath, bed); secure-day + streak + recovery + freeze align with “commitment and consistency” users (`onboarding.tsx`, `lib/onboarding-starters.ts`, `lib/retention-config.ts`).
- **Risks:** Progression (tiers, “39 pts to Builder”) is placeholder; some profile/Home stats still hardcoded — power users may notice mismatch.
- **Top 3 fixes:**  
  1. Backend: expose real discipline_score / tier / pts_to_next in `profiles.getStats` and replace placeholders.  
  2. Profile/Home: remove or clearly label any “coming soon” stats.  
  3. Optional: narrow positioning (“For people who don’t want to break the chain”) in store copy and onboarding.

---

### C) User Onboarding & Activation — **3.5**

- **Evidence:** Flow: create-profile (username, display name, bio) → onboarding 3 steps (goal, time budget, starter) → `starters.join` → day1-quick-win → complete task + secure day. TTFS instrumented (`day1_task_completed`, `day1_secured` with ttfv_seconds); `setDay1StartedAt()` in `lib/starter-join.ts` (`onboarding.tsx`, `app/day1-quick-win.tsx`, `lib/analytics.ts`).
- **Risks:** Profile required before onboarding adds friction; 3 steps + day1 flow is not “one tap” or &lt;90s to first value.
- **Top 3 fixes:**  
  1. Optional: defer full profile (e.g. username only) until after first secure.  
  2. Pre-select one “Recommended” starter on step 3 to reduce choice paralysis.  
  3. Add microcopy on day1: “One tap to lock in Day 1” or “Under 90 seconds to your first win.”

---

### D) Core Loop & Retention Mechanics — **4**

- **Evidence:** Streak: `checkins.secureDay`, `streaks` table, `computeNewStreakCount`; freeze: `streaks.useFreeze`, `streak_freezes`, monthly limit; recovery: `retention-config` (missed one day, comeback 3 days, restart 7); notifications: `lib/notifications.ts` (secure reminder, “2 hours left”); leaderboard: `leaderboard.getWeekly` used on Home and Activity; respect: `respects.give` used in Activity (`backend/trpc/routes/checkins.ts`, `streaks.ts`, `lib/retention-config.ts`, `contexts/AppContext.tsx`, `app/(tabs)/activity.tsx`, `app/(tabs)/index.tsx`).
- **Risks:** No dedicated “comeback 3 days” progress UI; post-secure celebration on Home is minimal; D1/D7/D30 cohorts not computed or used in-product.
- **Top 3 fixes:**  
  1. After Secure Day from Home, show short “Day X secured” toast or reuse Celebration.  
  2. In comeback mode, show “2 of 3 days secured” progress.  
  3. Instrument and surface D1/D7/D30 (e.g. “You’re in the top 20% of Day 1 returners”).

---

### E) UX/UI Usability & Information Architecture — **3.5**

- **Evidence:** Tab navigation (Home, Discover, Create, Activity, Profile); error handling via `Alert.alert` and `formatTRPCError` (Connection Issue, Invalid Input, Not Authorized); loading states (submit “submitting,” skeleton on profile/home); empty states (Discover EmptyState, retry buttons); recovery modal and freeze flow (`lib/api.ts`, `app/(tabs)/create.tsx`, `app/(tabs)/discover.tsx`, `app/(tabs)/index.tsx`).
- **Risks:** Some placeholder copy (e.g. “39 pts to Builder”); Create flow is long (multi-step form); no global toast system — some errors only in Alert.
- **Top 3 fixes:**  
  1. Replace all placeholder stats with real data or “Coming soon.”  
  2. Add a simple toast helper for non-blocking success (e.g. “Challenge created”) so Alert is for errors only.  
  3. Create flow: show step progress (e.g. “Step 2 of 3”) and optional “Save draft” so users don’t lose work.

---

### F) Reliability & Correctness — **4**

- **Evidence:** Create Challenge: backend validation, `dbTaskType`/`journalMinWords`, TRPCError codes, frontend loading/disabled and error Alert (`backend/trpc/routes/challenges.ts`, `CREATE-CHALLENGE-AND-BUTTONS-FIX-REPORT.md`). Button audit: chat-info buttons fixed; Create submit and primary CTAs have onPress. tRPC client attaches `error.data.code` for formatting (`lib/trpc.ts`, `lib/api.ts`).
- **Risks:** No full E2E test run in this session; edge cases (e.g. offline submit, double-tap) only partially guarded (e.g. createMutationPendingRef).
- **Top 3 fixes:**  
  1. Add one E2E or integration test: sign in → Create Challenge (minimal payload) → assert success and redirect.  
  2. Ensure all mutation buttons use a ref or disabled state for the full request to prevent double-submit.  
  3. Run manual regression: Create Challenge with each task type (simple, journal, timer, etc.) and confirm success.

---

### G) Performance & Responsiveness — **3**

- **Evidence:** `fetchWithTimeout` (12s) and `fetchWithRetry` in `lib/api.ts`; Create submit has watchdog and recovery message on timeout; no pagination on `challenges.list` or `challenges.getFeatured` — full result set returned (`backend/trpc/routes/challenges.ts` lines 26–82).
- **Risks:** Large challenge lists could slow Discover; leaderboard aggregates in backend without cursor; no measured startup or screen transition times.
- **Top 3 fixes:**  
  1. Add `.limit(50)` (or similar) and optional `cursor`/`offset` to `challenges.list` and `getFeatured`; add “Load more” or infinite scroll on Discover.  
  2. Log or measure time-to-interactive for Home and Discover; optimize if &gt;2s.  
  3. Ensure Create payload is not oversized (e.g. cap tasks or trim optional fields) and that success navigation is immediate after response.

---

### H) Security & Privacy Basics — **3.5**

- **Evidence:** Auth: Supabase; tRPC `protectedProcedure` uses `ctx.userId` from Bearer token; `create-context.ts` validates token via `getUser(token)`; creator_id and user_id set server-side (`backend/trpc/create-context.ts`, `challenges.ts`). Input: Zod on all procedure inputs. No PII in createChallenge logs (title slice, taskCount only) (`backend/trpc/routes/challenges.ts`).
- **Risks:** No rate limiting on mutations (signup, create, join, respect); no explicit audit of sensitive data in client logs.
- **Top 3 fixes:**  
  1. Add rate limiting for auth and key mutations (e.g. per-IP or per-user per minute) at API or Supabase edge.  
  2. Audit `console.log`/`__DEV__` paths for any PII or tokens; strip in production.  
  3. Ensure Supabase RLS (or equivalent) is enabled on all tables used by the app.

---

### I) Code Quality & Maintainability — **4**

- **Evidence:** Clear separation: app (screens), contexts, lib, backend (trpc routes); shared helpers (`lib/formatTimeAgo.ts`, `lib/time-enforcement.ts`, `lib/api.ts`); dead code removed (ProgressBar, ListOptionCard, ModalSheet, mocks/data); consolidation (time-ago in Activity + Chat). Tests: `lib/api.test.ts`, `lib/time-enforcement.test.ts`, `lib/formatTimeAgo.test.ts`, `backend/trpc/routes/challenges-create.test.ts`, `backend/lib/streak.test.ts` (`CLEANUP-DEAD-CODE-AND-CONSOLIDATION-REPORT.md`).
- **Risks:** Two theme/color systems (`constants/colors` vs `src/theme`); some large files (e.g. create.tsx, index.tsx).
- **Top 3 fixes:**  
  1. Plan single theme source (e.g. migrate to `src/theme/tokens`) in a dedicated PR.  
  2. Split create.tsx into smaller components (e.g. step panels, task builder) for readability.  
  3. Add a minimal “critical path” test script (e.g. createChallenge + getActive) runnable in CI.

---

### J) Scalability & Data Model Soundness — **3**

- **Evidence:** Supabase/Postgres; challenges and challenge_tasks inserts; leaderboard aggregates from day_secures; respects limited to 50 in getForUser (`backend/trpc/routes/leaderboard.ts`, `respects.ts`). No `.limit()` on `challenges.list` or `getFeatured`.
- **Risks:** Unbounded challenge lists; leaderboard in-memory aggregation may not scale; no evidence of DB indexes on frequently filtered columns.
- **Top 3 fixes:**  
  1. Add pagination (limit + offset or cursor) to list/getFeatured and index `(visibility, status, created_at)`.  
  2. Document or add indexes for day_secures (date_key, user_id), active_challenges (user_id, status).  
  3. Consider caching or materialized view for weekly leaderboard if traffic grows.

---

### K) Accessibility & Inclusivity — **2**

- **Evidence:** Grep: only a handful of `accessibilityLabel`/`accessibilityRole`/`accessibilityHint` in app (e.g. `app/challenge/[id].tsx`). Buttons are TouchableOpacity/Pressable; no systematic labels on primary CTAs or form fields.
- **Risks:** Screen reader users may not get clear labels; touch targets not verified against 44pt minimum; no reduced-motion or contrast considerations in code.
- **Top 3 fixes:**  
  1. Add `accessibilityLabel` and `accessibilityRole="button"` to all primary buttons (Secure Day, Join, Create Challenge, Submit, etc.).  
  2. Ensure form inputs (Create, profile, auth) have `accessibilityLabel` and, where needed, `accessibilityHint`.  
  3. Audit contrast (e.g. text on accent) and minimum touch target size (44x44) on key screens.

---

### L) Analytics & Experimentation Readiness — **3.5**

- **Evidence:** Typed events in `lib/analytics.ts`: guest_view_screen, gate_modal_shown, signup_completed, onboarding_step_completed, starter_challenge_selected, day1_task_completed, day1_secured (with ttfv_seconds, starter_id, primary_goal, daily_time_budget), streak_freeze_used, milestone_unlocked, invite_shared; `setAnalyticsHandler` for provider plug-in; `track()` used in onboarding, day1, index, signup, challenge detail (`lib/analytics.ts`, usage across app).
- **Risks:** No server-side or persisted event store in repo; no cohort or funnel dashboard; D1/D7/D30 not computed from events.
- **Top 3 fixes:**  
  1. Connect `setAnalyticsHandler` to a provider (PostHog, Mixpanel, or Amplitude) and persist key events.  
  2. Add events: challenge_created, challenge_joined, screen_view (with screen name).  
  3. Build a simple cohort table (signup_date, last_active) and compute D1/D7/D30 for product decisions.

---

### M) Monetization & Business Model Readiness — **1**

- **Evidence:** No paywall, subscription, or IAP in codebase; streak freeze is free (1/month, backend-enforced); no premium tier or feature flag (`GRIT-SUCCESS-SCORECARD.md`).
- **Risks:** No revenue path; adding paywall later may require non-trivial refactors if not planned.
- **Top 3 fixes:**  
  1. Define one premium tier (e.g. extra freezes, no ads, advanced stats) and a single paywall moment (e.g. after 7-day streak or second freeze use).  
  2. Add a feature flag or env for “premium_entitlements” and gate one feature behind it (even if always false for now).  
  3. Integrate RevenueCat or Stripe when ready; keep free monthly freeze as baseline.

---

### N) Go-To-Market Readiness — **3**

- **Evidence:** testIDs on key screens (home-challenge-card, secure-day-button, discover-cta, join-challenge-button, create-profile-continue, profile-retry-button, edit-profile-button, journal-entry-input, etc.); onboarding and value prop clear for target users; Create Challenge and core flows fixed.
- **Risks:** No App Store / Play Store assets or review guidelines verified in repo; no deep links or shareable challenge URLs yet; differentiation vs competitors not documented.
- **Top 3 fixes:**  
  1. Add shareable challenge link (e.g. /join?challenge=id) and include in Share message.  
  2. Prepare store listing: one-line value prop, 3–5 screenshots with clear copy, “Build discipline daily” positioning.  
  3. Document “Why GRIT” (e.g. streak + commitment + challenges in one app) for support and marketing.

---

## STEP 3 — ADDITIONAL RATINGS

| Metric | Score (0–5) | Notes |
|--------|-------------|--------|
| **Launch risk** | **3** | Core flows fixed; some placeholders and unbounded queries. Risk of negative reviews from edge-case failures or confusion on progression. |
| **Retention risk** | **3.5** | Strong loop (streak, freeze, recovery); D1/D7 hooks and post-secure celebration could be stronger. |
| **Operational readiness** | **3** | Logging in createChallenge; health check and DB check in api; no centralized error tracking or rollback procedure documented. |
| **Technical debt** | **2.5** | 0 = low, 5 = extremely high. So: moderate — two theme systems, some large files, no E2E; recent cleanup reduced dead code. |
| **Confidence in ratings** | **3.5** | Based on repo inspection and docs; no live run of app/backend or full tsc/test run in this environment. |

---

## STEP 4 — “IF DROPPED TODAY” SIMULATION

- User installs app and opens; sees splash then either auth or (if no auth) limited browse.
- Signs up with email; redirected to create-profile (username, display name, bio) then onboarding (goal, time budget, starter).
- Picks starter; joins via `starters.join`; lands on day1-quick-win with one task.
- Completes task and secures Day 1; sees celebration; can go to Home.
- Home shows “Today’s Reset,” streak, countdown to midnight, and Secure Day CTA; leaderboard and feed use real backend (leaderboard.getWeekly, respects.give).
- Discover shows real challenges (getFeatured); can tap into challenge detail and join; Create tab allows building a challenge (form → submit → success after prior fixes).
- Profile shows stats; some values are placeholders (tier, “39 pts to Builder”); Edit and Settings work.
- If user misses a day, recovery banner and streak freeze (1/month) are available and backend-backed.
- Notifications: “Time to secure your day” and “2 hours left” can be scheduled (lib/notifications).
- No paywall; no shareable challenge link; accessibility is minimal (few labels).
- **Likely App Store rating:** **3.2–3.8** — Core loop works and is engaging; placeholders and lack of polish (progression, accessibility, share links) would draw mixed reviews.
- **D1 retention likelihood:** **Medium** — Strong first experience (day1-quick-win, celebration) and clear “secure your day” loop; friction from profile-first onboarding and long Create flow could reduce activation.
- **Top 3 churn reasons:** 1) Placeholder progression (“39 pts to Builder”) feels unfinished; 2) No clear “return tomorrow” hook after Day 1 (e.g. push or in-app); 3) Discover or Create perceived as slow or confusing for some.
- **Top 3 stay reasons:** 1) Streak and “don’t break the chain”; 2) Clear daily action (Secure Day) and recovery/freeze; 3) Sense of commitment and progress (challenge + streak).

---

## STEP 5 — RECOMMENDATIONS (PRIORITIZED)

### P0 — Must fix before any public launch

| Item | Why it matters | What to change | How to validate |
|------|----------------|----------------|-----------------|
| **Create Challenge + core flows** | Already fixed; ensure no regression. | Keep regression tests; run manual E2E (create → success, join → home). | Run `npm run test`; manual: sign in → Create Challenge (minimal) → submit → see success screen. |
| **Unbounded challenge queries** | Large lists can slow or crash Discover. | Add `.limit(50)` (or similar) to `challenges.list` and `getFeatured` in `backend/trpc/routes/challenges.ts`. | Load Discover with 100+ challenges; confirm response size and UI performance. |
| **Placeholder copy / fake stats** | Erodes trust. | Replace “39 pts to Builder” and other placeholders with real data from backend or “Coming soon.” | Search for PLACEHOLDER, “pts to”, “Builder”; replace or remove. |

### P1 — Should fix for a strong beta

| Item | Why it matters | What to change | How to validate |
|------|----------------|----------------|-----------------|
| **Accessibility** | Store and inclusivity expectations. | Add `accessibilityLabel` and `accessibilityRole` to primary buttons and key inputs (`app/(tabs)/index.tsx`, create, profile, auth). | Enable VoiceOver/TalkBack; navigate key flows. |
| **Post-secure feedback** | Reinforces habit. | After Secure Day from Home, show “Day X secured” toast or reuse Celebration. | Secure day from Home; confirm visible feedback. |
| **Rate limiting** | Prevents abuse and overload. | Add rate limit (per IP or user) for auth and mutations (e.g. at API layer or Supabase). | Send burst of requests; confirm 429 or backoff. |
| **Shareable challenge link** | Viral and re-engagement. | Backend: shareable URL (e.g. /join?challenge=id); include in Share message in app. | Share challenge; open link; confirm join or detail. |

### P2 — Enhancements for growth

| Item | Why it matters | What to change | How to validate |
|------|----------------|----------------|-----------------|
| **D1/D7/D30 cohorts** | Retention product decisions. | Persist signup_date and last_active; compute D1/D7/D30; optional in-app or push hook. | Query cohort table; compare to industry benchmarks. |
| **Single theme system** | Maintainability. | Migrate to `src/theme/tokens` (or one source); remove or alias `constants/colors`/typography. | Visual pass; no regressions. |
| **Monetization path** | Sustainability. | Define premium tier; add feature flag; one paywall moment (e.g. second freeze). | Gate one feature behind flag; test flow. |

---

## FINAL OUTPUT

### Overall score: **3.4 / 5**

(Computed from category scores with equal weight for product + engineering; rounded.)

### Launch readiness verdict: **Limited beta**

- **Do not launch** as a full public launch: placeholders, unbounded queries, and accessibility gaps pose trust and scalability risks.
- **Limited beta** is appropriate: invite a small cohort (e.g. 50–200 users), collect feedback on onboarding, Create flow, and progression; fix P0 and key P1 items; then consider soft launch.

### “If dropped today” outcome

- **Experience:** New users can sign up, complete onboarding, secure Day 1, and use Discover/Create with real backend; leaderboard and respects work. Placeholder stats and missing accessibility would be noticeable; power users might hit slow Discover if many challenges exist.
- **Retention:** D1 likely medium (good first win, some friction); D7/D30 unknown without cohort data.
- **Reviews:** Mixed: “Great concept, needs polish” and “Some buttons/screens feel unfinished.”

### One-sentence summary

**This app is currently at 3.4/5 because it has a strong core loop (streaks, secure day, recovery, Create Challenge) and real backend integration, but it needs P0 fixes (bounded queries, no placeholder stats), better accessibility and post-secure feedback for a confident launch, and a clear path to monetization and shareable links for growth.**
