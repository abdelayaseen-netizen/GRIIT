# 04 — Data & Backend Wiring

> Phase 4 of 10. Read-only. Branch `feat/onboarding @ 953bccb`.

## 1. Zustand stores (write vs. read)

| Store | External refs | Status |
|---|---|---|
| `store/onboardingStore.ts` | 15 | live (both flows + AuthRedirector) |
| `store/celebrationStore.ts` | 6 | live (`CelebrationOverlay`, `useCelebration`) |
| `store/activeSessionStore.ts` | 4 | live (`ActiveTaskCard`, task timer) |
| `store/notificationPrefsStore.ts` | 4 | live (settings/reminders) |
| `store/feedToggleStore.ts` | 2 | live but minimal (`LiveFeedSection` toggle) |
| `store/proofSharePromptStore.ts` | 2 | live (`ProofShareOverlay`) |

- **No dead stores** — every store is both written and read.
- **`selectedGoals` downstream (the previously-flagged item):**
  - **V1** (`OnboardingFlow`): `ProfileSetup.tsx:127,160` persists `onboarding_answers: { selected_goals }` to Supabase — so V1 selectedGoals **does** feed the profile.
  - **V2** (`GoalsScreen.tsx:9,14,18`): persisted to the store + emitted as `onboarding_goals_selected` analytics **only**; the explicit `TODO goals→pack mapping pending` means it feeds **nothing downstream** (no recommendation wiring). Confirmed — but it's behind `ONBOARDING_V2=false`. → **intentionally-gated / debt.**

## 2. TanStack Query

useQuery/useMutation appear in ~22 files (counts in Phase 0/2). Spot-checks show results are consumed/rendered (challenge detail, profile, discover, feed, leaderboard, notifications). `tsc` passing means key/selector typings line up. **No obvious defined-but-unused query** surfaced; loading/error consumption verified in Phase 2. (A full per-key consumption audit is `UNVERIFIED` at static level but low-risk.)

## 3. tRPC procedures → frontend callers

- **Backend procedures defined:** 113 (across 23 routers).
- **Frontend `TRPC.<router>.<proc>` call sites (unique):** 71.
- **Frontend → backend resolution:** every one of the 71 frontend calls maps to a real backend procedure. → **0 calls to non-existent procedures.** ✅ (caught at compile by typed `TRPC` paths + zod; `tsc` is green.)

### Orphan endpoints — backend procedures with **zero frontend `TRPC.` caller** (~43)

> Method: `rg -oN "TRPC\.<r>\.<p>"` across the app vs. backend procedure list. Verified the `auth.*` / `completeOnboarding` apparent-hits were **false positives** (`supabase.auth.*` and the local `completeOnboarding()` helper, **not** the tRPC procedures). Caveat: a subset of these may be invoked **server-side by other procedures** or by tests — "orphan" here means *no frontend caller*.

**Intentionally-gated (Strava — `PREMIUM_INTEGRATIONS=false`):**
`integrations.getStravaAthlete`, `disconnectStrava`, `getStravaAuthUrl`, `isStravaEnabled`, `getStravaActivities` (5) → **intentionally-gated.**

**Auth router redundant with direct Supabase client (FE uses `supabase.auth.*`):**
`auth.signIn`, `auth.signUp`, `auth.signOut`, `auth.getSession`, `auth.getEmailForUsername` (5) → likely dead-or-internal (`getEmailForUsername` may back username-login server-side).

**No frontend caller (candidate dead / future / backend-internal):**
`user.completeOnboarding`; `respects.give/getForUser/getCountForUser`; `nudges.send/getForUser`; `starters.join/getChallengeIdByStarterId`; `streaks.useFreeze`; `achievements.getForUser`; `profiles-social.getPendingFollowRequests`; `notifications.markAllRead/previewTaskReminderBody`; `challenges-discover.getDiscoverGrid/getDiscoverHabits/getCategoryCounts/getDiscoverFeed/getFeatured`; `challenges.getTeamMembers`; `checkins.markAsShared/getShareStats/getMilestoneShared/setMilestoneShared`; `feed.list/listMine/getMySummary/getRecentCompletions`; `profiles-stats.getCompletedChallenges/getWeeklyProgress/getWeeklyTrend/setWeeklyGoal`; `profiles.isFollowing` (~33).

> Notable: **`user.completeOnboarding` is orphaned** — the V2/V1 completion path writes `ONBOARDING_COMPLETED` (AsyncStorage) + `profiles.onboarding_completed` (direct Supabase) rather than calling this procedure. Also **`streaks.useFreeze` has no caller** while `streaks.getFreezeStatus` is used — the streak-freeze *spend* action may be unwired in the UI (verify against Phase 7). The `respects.*` router (give/get) has no FE caller — the "respect" UI appears to route through `feed.react`/`feed.getReactions` instead.

### Schema (input/output) match
- tRPC procedures use zod input schemas and the frontend uses typed `TRPC` paths; `tsc --noEmit` = 0 means caller↔procedure **shape mismatches would fail compilation**. No static mismatch found. Column-level DB matching is handled in **Phase 5**.

## Counts (Phase 4)
| Metric | Count |
|---|---|
| Dead stores | **0** |
| Written-never-read / read-never-written store fields | `selectedGoals` (V2) feeds nothing downstream (gated) |
| Unused queries | **0 obvious** |
| Orphan tRPC endpoints (no FE caller) | **~43** (5 Strava-gated, 5 auth-redundant, ~33 candidate dead/internal) |
| Frontend calls to missing procedures | **0** |
| Static schema mismatches | **0** (tsc green) |
