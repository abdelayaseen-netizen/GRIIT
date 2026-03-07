# GRIIT Launch-Readiness Improvement Pass — Report

**Date:** March 2025  
**Scope:** Focused, high-leverage fixes to raise product and engineering scorecard. Not a full rewrite or speculative work.

---

## 1. Stubbed / Incomplete Features Handled

| Feature | Action | Notes |
|--------|--------|-------|
| **Leave Challenge** | **Hidden** | Button and confirmation flow removed from challenge detail. Backend has no `challenges.leave`; re-enable when ready via comment in `app/challenge/[id].tsx` with `trpcMutate("challenges.leave", { challengeId: id })` + refetch. |
| **Chat** | **No change** | Only reachable via direct URL; challenge detail does not link to it. Chat screen shows "Chat not available" when room is null. |
| **Strava / Integrations** | **No change** | Integrations section only renders when `stravaEnabled === true` from backend. No fake UI. |

No broken or fake buttons remain in visible product paths.

---

## 2. Core Flow QA Findings and Fixes

### Validated (code-level)

- **Auth / app load:** AuthGateContext and protected flows gate correctly; app load and authenticated state resolution follow existing patterns.
- **Home:** Uses `useFocusEffect` + `refetchAll`, `RefreshControl` + `onRefresh`; active challenges and daily status use shared data from AppContext.
- **Discover / join:** Join uses `trpcMutate('challenges.join', { challengeId })`; after join, challenge appears via active challenge and home refetch.
- **Challenge detail:** Loads challenge by id; join, share, invite (copy to clipboard on web); Strava verify calls `trpcMutate(TRPC.integrations.verifyStravaTask)` and `refetchTodayCheckins()`.
- **Tasks / check-ins:** Task completion flows through `/task/journal`, `/task/photo`, `/task/run`, `/task/timer`, `/task/checkin`; AppContext exposes `completeTask` and `refetchTodayCheckins`.

### Fix applied

- **Stale UI after task completion:** Challenge detail did not refetch today’s check-ins when returning from a task screen. **Fix:** Added `useFocusEffect` in `app/challenge/[id].tsx` to call `refetchTodayCheckins()` when the screen is focused and the user is joined (`isJoined`), so mission completion state is up to date after completing a task.

### Still recommended (manual QA)

- Full E2E: auth → home → discover → join → open challenge → complete task → back to home/challenge and confirm progress and daily status.
- Pull-to-refresh on home and challenge list.
- Secure-day flow and retention messaging.
- Create challenge: full flow from basics → tasks → review → publish, then confirm challenge appears where expected.

---

## 3. Challenge Creation Improvements

- **Not done in this pass:** Dead/legacy task-builder code in `app/(tabs)/create.tsx` (e.g. `handleAddTask`, `renderTaskTypeSelector`, `renderVerificationOptions`, `renderTimeEnforcement`, `renderStrictToggles`) remains but is unused after the modal-based task editor; removal is recommended in a follow-up.
- Shared helpers in `lib/create-challenge-helpers.ts` are in place; create flow uses modal and step-based UI. No structural or UX changes made in this pass.

---

## 4. Profile Improvements

- **Removed unused local components** from `app/(tabs)/profile.tsx`: `StatCard`, `AchievementBadge`, `TierProgress`, `ActivityCalendar`, `DisciplineGrowthCard`, `StreakAtRiskAlert` (and mistaken `_AchievementBadgePlaceholder`). These were defined in-file but not used; profile uses `@/components/profile` (e.g. `ProfileHeader`, `TierProgressBar`, `LifetimeStatsCard`, `AchievementsSection`, etc.).
- **Removed orphaned StyleSheet entries** (~300+ lines): `statsGrid`, `statCard*`, `cardSection`, `tierProgressWrap`, `tierPill*`, `tierBar*`, `tierPtsToNext`, `activitySection` through `activityLegendSquare`, `disciplineGrowth*`, `streakAtRisk*`, `taglinePill*`, `statusBadge*`, `sectionHeader`, `sectionTitle`, `achievementsScroll`, `achievementBadge*`. Only styles still referenced in JSX (e.g. integrations, menu, error, guest, container, scroll) were kept.
- **Result:** Profile file is smaller and clearer; one coherent story (identity, stats, progress, integrations, settings) with less dead code and no duplicate local components.

---

## 5. Home Improvements

- No structural changes in this pass. Home already has:
  - Daily status, active challenges, retention/recovery messaging, and CTAs.
  - Pull-to-refresh and `useFocusEffect` refetch.
- **Recommendation for next pass:** Audit hierarchy of daily status vs active challenges vs retention messaging and CTA priority; tighten empty/loading/error states if needed.

---

## 6. Social Layer Improvements

- No code changes. Current state:
  - **Real:** Feed/activity and leaderboard load and refresh; share/invite from challenge detail copy message to clipboard (web) or use system share.
  - **Intentional:** Chat is not linked from challenge detail; respect/nudge can be evaluated in a later pass to surface or hide consistently.

---

## 7. Monetization Foundations

- **Added** `lib/feature-flags.ts` as the premium/launch config surface:
  - `IS_BETA_LAUNCH` — beta/launch state for hiding or softening unfinished features.
  - `PREMIUM_ENABLED`, `PREMIUM_CHALLENGE_PACKS`, `PREMIUM_ANALYTICS`, `PREMIUM_PROFILE` — placeholders for future premium gating.
  - `HIDE_LEAVE_CHALLENGE` — documents that Leave is hidden until backend supports it.
- No paywall or billing implementation. No UI changes for premium; flags are ready for future use when adding paywalls or premium features.

---

## 8. Refactors / Maintainability Gains

- **Profile:** Large reduction in dead code (unused components + orphaned styles). Same screen behavior with a simpler, easier-to-extend file.
- **Challenge detail:** Leave Challenge block removed (reduces clutter and fake affordance); refetch on focus added for data correctness. No file split or aesthetic-only refactor.

---

## 9. Warnings / Performance Improvements

- No new warnings introduced; existing lint/typecheck clean on modified files.
- No hot-path or performance changes in this pass (no vanity cleanup).

---

## 10. Validation

| Check | Result |
|-------|--------|
| **TypeScript** | `npx tsc --noEmit` — **pass** |
| **Lint** | No linter errors on `app/(tabs)/profile.tsx`, `app/challenge/[id].tsx` |
| **Build/run** | Not run in this pass; typecheck and lint pass |

**Still needs:** Manual QA on device/simulator for auth, home, discover, join, task completion, create challenge, profile, and activity flows.

---

## 11. Updated Self-Scorecard

Scores below are **1–10** and reflect impact of this pass (conservative; no manual QA yet).

| Category | Score | Notes |
|----------|-------|--------|
| **UX / Ease of Use** | 6 | Stale challenge detail after task completion fixed; no other UX changes. |
| **Visual Design** | — | Unchanged. |
| **Social / Virality Potential** | 5 | Share/invite present; chat and deeper social not expanded. |
| **Challenge System Quality** | 6 | Join, tasks, Strava verify, refetch on focus; leave hidden. |
| **Profile System Quality** | 7 | Cleanup and dead code removal; clearer structure. |
| **Home Screen Quality** | 6 | Already had refetch/refresh; no changes. |
| **Challenge Creation Flow Quality** | 5 | Unchanged; legacy dead code still in create.tsx. |
| **Engineering Quality** | 7 | Profile and challenge detail simplified; feature flags added. |
| **State Synchronization / Data Correctness** | 7 | Refetch on focus for challenge detail; home already refetches. |
| **Performance / Smoothness** | — | Unchanged. |
| **Monetization Readiness** | 6 | Foundation (feature flags) in place; no payments. |
| **Launch Readiness** | 6 | Fewer stubs, better data freshness, cleaner profile; manual QA still needed. |

### What improved most

- **Profile:** Coherence and maintainability (removed dead components and styles).
- **State / data correctness:** Challenge detail no longer shows stale completion state after returning from a task.
- **Trust:** No visible fake or broken actions (Leave removed until backend ready).
- **Monetization readiness:** Clear config surface for premium and beta behavior.

### What still caps scores

- No recent **manual QA**; scorecard assumes code-level fixes only.
- **Challenge creation** still has unused legacy code and could be simplified.
- **Home** hierarchy and empty/loading/error states not audited.
- **Social** depth and feed/respect/nudge not standardized.

### Next highest-leverage pass

1. **Manual QA** of core flows (auth, home, discover, join, tasks, create, profile, activity) and fix any bugs found.
2. **Challenge create cleanup:** Remove dead task-builder helpers and modal-unused branches in `create.tsx`; align validation and review with shared helpers.
3. **Home polish:** Clarify daily status vs active challenges vs retention; improve empty/loading/error states.
4. **Optional:** Use `lib/feature-flags.ts` in one or two places (e.g. settings or a future premium section) so the foundation is clearly wired.

---

**Summary:** This pass focused on removing trust-harming stubs, fixing stale state on the challenge detail screen, and cleaning the profile screen. Monetization and feature behavior are now configurable via `lib/feature-flags.ts`. The app is in a better position for beta launch; the next step is manual QA and targeted cleanup of the create flow and home states.
