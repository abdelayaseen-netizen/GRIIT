# GRIT — Full Product Audit & Success Scorecard

**Purpose:** Evidence-based evaluation of GRIT’s current implementation (guest mode, onboarding, starter challenge, day1-quick-win, streaks, recovery, leaderboards, social, etc.) using categories that predict app success.  
**Basis:** Actual codebase (backend TRPC routes, app screens, contexts, mocks).  
**Date:** 2025-02-28.

---

## PART 1 — SUCCESS CATEGORIES

Each category: Name, Why It Matters, How Top Apps Do It, How GRIT Implements It, Score (0–5), Specific Improvements.

---

### 1. Activation speed (time to first value)

- **Why it matters:** First 7 days drive retention; long or confusing onboarding increases drop-off. Duolingo and Headspace optimize “first lesson” or “first session” within minutes.
- **How top apps do it:** Duolingo: one lesson extends streak; users reach “first value” (streak +1) in under 2 minutes. Notion: “What do you need?” then templates; invited users land on a working page fast.
- **How GRIT implements it:**
  - New users: create-profile → onboarding (3 steps: goal, time budget, starter pick) → `starters.join` → day1-quick-win with one task → `checkins.complete` + `checkins.secureDay`. Backend creates real participation and streak.
  - `setDay1StartedAt()` and `ttfv_seconds` in analytics measure time to first secure.
  - Friction: profile required before onboarding; 3 steps + 1 task + 2 taps (Mark complete, Secure Day) before “first value.”
- **Score:** 3.5  
  - Functional path to first secure with backend persistence; timing instrumented. Not yet “one tap” or &lt;90s by default.
- **Improvements:**
  1. Optional: defer full profile until after Day 1 secure (e.g. username only up front).
  2. Surface “&lt;90 seconds” as a design goal in day1-quick-win copy or microcopy.
  3. A/B test 2-step onboarding (goal + starter only) vs current 3-step.
  4. Pre-select one “recommended” starter on step 3 to reduce choice paralysis.

---

### 2. Streak & commitment mechanics

- **Why it matters:** Loss aversion (losing a streak hurts more than gaining a reward) drives return. Duolingo: 2.4× next-day continuation for 7+ day streakers; streak experiments improved 7-day retention.
- **How top apps do it:** Duolingo: one lesson extends streak; streak freeze (limited); “Don’t lose your streak” reminders. Yale/StickK: commitment contracts and stakes increase follow-through.
- **How GRIT implements it:**
  - `checkins.secureDay` updates `streaks` (active_streak_count, last_completed_date_key) via `computeNewStreakCount`.
  - Home shows current streak and “Secure today to protect your streak”; countdown to midnight.
  - Streak freeze: backend `streaks.useFreeze(dateKeyToFreeze)`, `streak_freezes` table, profile `streak_freeze_used_count` / `streak_freeze_reset_at`, monthly reset; recovery banner shows “Use streak freeze” when `canUseFreeze` from getStats.
- **Score:** 4  
  - Real streak logic and persisted freeze; recovery banner and modal wired. No “streak saved” celebration animation; freeze copy could be clearer (“1 left this month”).
- **Improvements:**
  1. Add a short celebration (confetti or modal) when user secures day, not only on day1-quick-win.
  2. Optional push: “Don’t lose your streak — X hours left” when &lt;2h to midnight.
  3. Show “Streak saved” micro-message after using freeze (in addition to banner disappearing).
  4. Consider second freeze as premium upsell later.

---

### 3. Recovery & re-engagement

- **Why it matters:** One missed day is the main drop-off point. Recovery loops (comeback mode, one-time restore) bring users back. Wharton BCFG: “recovery after miss” interventions improved gym visits.
- **How top apps do it:** Duolingo: streak repair, comeback reminders. Headspace: “You missed yesterday” and gentle re-onboarding.
- **How GRIT implements it:**
  - `lib/retention-config.ts`: missedOneDayThreshold 1, comebackModeMinDays 2, comebackModeMaxDays 6, comebackRequiredDays 3, restartThreshold 7.
  - Home: recovery banner text by effectiveMissedDays (missed yesterday / comeback 3 days / start fresh); `effectiveMissedDays` and `canUseFreeze` from `profiles.getStats` (frozen dates excluded).
  - Streak freeze persisted in backend; banner disappears on reload/other device after using freeze.
- **Score:** 4  
  - Recovery states and freeze are backend-backed and consistent. No dedicated “comeback 3 days” flow or push yet.
- **Improvements:**
  1. Push or in-app message: “You missed yesterday — secure today to stay in the game” (or use freeze).
  2. When in comeback mode, show “2 of 3 days secured” progress toward restore.
  3. Optional: one-time “free” restore for first-ever miss (separate from monthly freeze).
  4. Instrument recovery_freeze_used and comeback_restored in analytics.

---

### 4. Habit formation (cue–routine–reward)

- **Why it matters:** Consistent cue (e.g. time, notification) + simple routine + immediate reward support automaticity. Wharton BCFG: triggers and barriers matter; Duolingo uses notifications as cue, one lesson as routine.
- **How top apps do it:** Duolingo: daily reminder, one lesson = streak extended, XP and streak as reward. Headspace: daily reminder + one session.
- **How GRIT implements it:**
  - “Today’s Reset” task list on Home; one “Secure Day” action; streak and stats as reward.
  - No fixed-time reminder or “time to secure” push in codebase.
  - Day 1 celebration exists; post–secure-day celebration on Home is minimal (Celebration component exists but used for secure flow, not a recurring “you secured” moment).
- **Score:** 3  
  - Clear routine (complete tasks → Secure Day) and visible reward (streak). Missing: default daily cue (push at set time) and stronger post-secure reward.
- **Improvements:**
  1. Add one default push: “Time to secure your day” at user-set or 8pm.
  2. After Secure Day from Home, show same celebration/confetti as day1 (or short “Day X secured” toast).
  3. Optional: “Lock in” one micro-habit that always counts for streak (e.g. one 5-min task).
  4. Store “preferred secure time” in profile for future reminder optimization.

---

### 5. Retention (D1 / D7 / D30)

- **Why it matters:** Retention is the strongest predictor of LTV. Benchmarks ~26% D1, ~13% D7, ~7% D30; top apps do better with hooks and instrumentation.
- **How top apps do it:** Duolingo: D1/D7/D30 tracked; streak and leagues drive return. Strava: kudos and segments drive 90-day retention.
- **How GRIT implements it:**
  - Structure supports retention: streaks, recovery, active challenge, Home “Continue where you left off.”
  - Analytics: onboarding_step_completed, day1_task_completed, day1_secured (with ttfv_seconds, starter_id, primary_goal, daily_time_budget), streak_freeze_used, comeback_mode_started, comeback_day_secured, gate_modal_shown.
  - No evidence of cohort D1/D7/D30 computation or D1/D7-specific in-app or push hooks.
- **Score:** 3  
  - Events exist to build cohorts; no retention dashboard or targeted D1/D7/D30 hooks in product.
- **Improvements:**
  1. Instrument signup date and last_active; compute D1/D7/D30 by cohort (analytics or Supabase).
  2. D1: push or in-app “You secured Day 1 — come back tomorrow” and optional tomorrow preview.
  3. D7: “7-day streak” or “7 days in a row” milestone + badge or share card.
  4. D30: “30-day streak” or “30 days in app” celebration and optional invite.
  5. Weekly review of D1/D7/D30 and first-secure rate.

---

### 6. Progress clarity & feedback

- **Why it matters:** Clear progress (today’s tasks, streak, rank) increases perceived competence and continuation. Princeton/UC Berkeley work on gamification aligns short-term rewards with long-term goals.
- **How top apps do it:** Strava: segments, PRs, progress to goals. Duolingo: XP, leagues, streak counter.
- **How GRIT implements it:**
  - Home: “Today’s Reset” task list with completed state from `todayCheckins`; progress_percent; Secure Day CTA; streak and “Score” (longestStreak); countdown to midnight.
  - Backend: `checkins.complete` updates progress_percent; `getStats` returns activeStreak, longestStreak, lastCompletedDateKey.
  - Profile: discipline score, tier, days secured, tier progress are placeholders (PLACEHOLDER_*, TODO backend).
- **Score:** 3.5  
  - Daily progress and streak are real and clear. Tier/points/“39 pts to Builder” and “7 friends secured” are hardcoded; no real discipline score or rank from backend.
- **Improvements:**
  1. Backend: expose discipline_score, tier, days_secured, pts_to_next_tier (or equivalent) in profiles/getStats or dedicated endpoint.
  2. Replace “39 pts to Builder” and “7 friends secured” with real data or remove until available.
  3. Small “win” feedback on task complete (e.g. check animation or toast) before Secure Day.
  4. “YOUR POSITION” / rank on Home: wire to real leaderboard when available.

---

### 7. Leaderboards & competition

- **Why it matters:** Social comparison and “beat your neighbor” goals increase motivation when framed well. Strava segments drive return; leaderboards work when commitment is high.
- **How top apps do it:** Strava: segment and club leaderboards; “King of the Mountain.” Duolingo: leagues and leaderboard.
- **How GRIT implements it:**
  - Activity tab: `mockLeaderboard`, “Weekly Leaderboard”, “Top This Week”, “Resets Sunday” — all mock data (`mockLeaderboard`, `mockFeedItems`, `mockUsers`). TODO: backend to provide daily movement stats.
  - Home: “YOUR POSITION” and feed items (MOCK_FEED) include rank-type cards; taps gate with requireAuth.
  - No backend route for leaderboard or weekly rank in codebase.
- **Score:** 2  
  - UI and copy are in place; data is fully mock. No real competition loop yet.
- **Improvements:**
  1. Backend: leaderboard or “top this week” endpoint (by challenge or global), plus daily stats (secured today, new streaks, lost today).
  2. Wire Activity tab to real leaderboard and feed; keep fallback or skeleton when empty.
  3. “Beat #7” or “Catch [next user]” micro-goal on Home when rank is real.
  4. Per-challenge leaderboard on challenge detail when backend supports it.

---

### 8. Social validation (kudos / respect)

- **Why it matters:** Peer acknowledgment drives re-engagement. Strava: kudos within 4h → 40% more likely to upload again in 48h.
- **How top apps do it:** Strava: kudos, comments. Duolingo: leagues, friends.
- **How GRIT implements it:**
  - Auth gate context includes “respect” and “chase”; feed cards show “respectCount”, “Give respect” style CTAs.
  - Feed and Movement items are MOCK_FEED / mockFeedItems; no backend for “give respect” or “respect received” in TRPC routes.
- **Score:** 2  
  - Gate and UI support respect/chase; no persisted social graph or respect actions.
- **Improvements:**
  1. Backend: “respect” or “kudos” table (actor, recipient, challenge/activity, created_at); TRPC procedure to give respect and to fetch “respect received.”
  2. Wire feed “respect” buttons to that procedure; show “X gave you respect” in feed or notifications.
  3. Optional push: “Someone gave you respect on [challenge]” to pull users back.

---

### 9. Discovery & first action

- **Why it matters:** Users must find a challenge and commit quickly. Pre-filled or recommended discovery increases join rate.
- **How top apps do it:** Notion: “What do you need?” then templates. Duolingo: placement then first lesson.
- **How GRIT implements it:**
  - Discover: `challenges.getFeatured` (TRPC) loads real challenges; fallback to `STARTER_CHALLENGES` mock when error or empty. Categories and search filter the list.
  - Onboarding uses `lib/onboarding-starters.ts` (6 starters); post-onboarding discovery is full catalog. New users go onboarding → starter → day1, not Discover.
  - No “one-tap start with recommended” on first open for users who skip or bypass onboarding.
- **Score:** 3.5  
  - Discovery is backend-backed with fallback; onboarding gives a clear first action. No single “recommended challenge” CTA on Discover for new users.
- **Improvements:**
  1. For users with no active challenge, show “Start your first challenge” or “Recommended for you” at top of Discover (e.g. from getFeatured or starter set).
  2. “Join in 2 taps” microcopy on challenge cards when not yet joined.
  3. Optional: pre-fill Discover with challenges matching onboarding primary_goal/daily_time_budget.

---

### 10. Viral loops / invite & share

- **Why it matters:** Shares and invites reduce CAC and can drive re-engagement. TikTok weights shares heavily; Strava clubs and segments encourage “bring a friend.”
- **How top apps do it:** Strava: share activity, invite to club. Notion: invite to workspace. Duolingo: share streak, invite to league.
- **How GRIT implements it:**
  - Challenge detail: More menu with “Share challenge” and “Invite friends”; Share.share() with message; “Invite friends to this challenge” link when joined. TODOs: shareable challenge link (deep link or web URL), invite endpoint for in-app join.
  - Profile: Share button (Share.share). Success screen: “Share Completion.”
  - No shareable link or deep link in code; no invite-to-join tracking or reward.
- **Score:** 3  
  - Share/invite UI exists and works with native share; no link, no attribution, no “invite 1 friend → unlock X.”
- **Improvements:**
  1. Backend: shareable challenge URL (e.g. /join?challenge=id or universal link) and invite endpoint; include link in share message.
  2. Pre-written copy: “I’m on a [X]-day streak on GRIT. Join me: [link]” for profile/share streak.
  3. “Invite 1 friend to this challenge → unlock [badge/feature]” and track invite-to-join.
  4. Track share/invite events in analytics for viral coefficient.

---

### 11. Monetization readiness

- **Why it matters:** Clear path to paid (subscription or one-off) supports sustainability. Median 30-day free-to-paid ~1.7%; top apps ~4%+; Duolingo/Strava use freemium and premium tiers.
- **How top apps do it:** Duolingo: streak freeze, no ads, extra features. Strava: Premium for analytics, training, no ads. Headspace: subscription for full library.
- **How GRIT implements it:**
  - No paywall, subscription, or IAP in codebase. Streak freeze is free (1/month, backend-enforced). No “premium” or “plus” tier or feature flag.
- **Score:** 0.5  
  - Product is free-only; no monetization path implemented.
- **Improvements:**
  1. Define one premium tier (e.g. “GRIT Plus”: extra freeze(s), no ads, advanced stats, early features).
  2. Single paywall moment (e.g. after 7-day streak, or on second freeze use).
  3. Integrate RevenueCat or Stripe for subscription; gate 1–2 features behind paywall.
  4. Do not remove the free monthly freeze; use “extra freezes” or “unlimited freeze” as premium benefit.

---

### 12. Guest mode & auth gating

- **Why it matters:** Letting guests browse increases top-of-funnel; gating commit actions (join, secure, respect) converts intent to signup. Reduces bounce from “sign up to see anything.”
- **How top apps do it:** Many apps allow browse/explore without account; sign-up required to save progress or compete.
- **How GRIT implements it:**
  - `AuthGateProvider`, `requireAuth(context, action)`, `showGate(context)`; contexts: join, secure, respect, chase, create, team, other.
  - Guest can browse; joining challenge, securing day, giving respect, etc. show AuthGateModal (“Sign up to commit”) then route to signup.
  - `useIsGuest()` used on Home to hide recovery banner and other authenticated-only UI.
- **Score:** 4  
  - Guest browse and contextual gating are implemented; gate tracks context for analytics. Apple/Google sign-in not wired in AuthGateModal (both open email signup).
- **Improvements:**
  1. Wire “Continue with Apple” / “Continue with Google” in AuthGateModal if auth supports it.
  2. Optional: after signup from gate, return to the action that triggered the gate (e.g. join challenge).
  3. Track gate_modal_shown by context and conversion (signed up vs dismissed).

---

### 13. Progression system (tiers / ranks)

- **Why it matters:** Visible progression (ranks, tiers, points) gives long-term goals. Duolingo leagues and Strava fitness/PRs keep users coming back.
- **How top apps do it:** Duolingo: XP, levels, leagues. Strava: fitness, PRs, segments.
- **How GRIT implements it:**
  - UI: “Starter”, “Builder”, “Relentless”, “Elite”; “39 pts to Builder”; tier progress bar on profile. Activity: badges (Elite, Relentless, Builder, Initiate) on mock leaderboard.
  - Backend: no discipline_score, tier, or pts_to_next_tier in profiles or getStats; profile and Home use placeholders.
- **Score:** 2.5  
  - Progression is designed in UI; no backend logic or persistence for tiers/points.
- **Improvements:**
  1. Backend: define tier rules (e.g. by days_secured or points); store tier and pts_to_next in profile or getStats.
  2. Replace PLACEHOLDER_* on profile and “39 pts to Builder” on Home with real values.
  3. Unlock badge or title when reaching new tier; show “Next rank” preview (what you get at Builder).
  4. Optional: weekly or monthly tier recalculation and “You moved to Builder” moment.

---

### 14. Emotional identity & clarity

- **Why it matters:** “Build discipline daily” and clear identity (e.g. “I’m someone who shows up”) support habit and retention. Headspace/Calm own “mindfulness”; Strava owns “serious mover.”
- **How top apps do it:** Duolingo: “Learn a language in 5 min/day.” Strava: “The social network for athletes.” Headspace: “Meditation made simple.”
- **How GRIT implements it:**
  - Logo “GRIT”, subtitle “Build Discipline Daily”; commitment and “secure your day” language; recovery and comeback copy; “Only discipline shows here” on Home.
  - Onboarding: “What are you here to build?” and goal/time budget; starter choice reinforces first win.
- **Score:** 4  
  - Message is clear and consistent; onboarding and recovery copy support identity. Could sharpen “who this is for” (e.g. “For people who don’t want to break the chain”).
- **Improvements:**
  1. Optional one-liner on onboarding or splash: “For people who show up every day.”
  2. After 7-day streak: “You’re a 7-day streaker” or similar identity reinforcement.
  3. Keep tone consistent in push and email (discipline, streak, secure).

---

## PART 2 — WEIGHTED SCORE

### Weights (total 100%)

| Category | Weight |
|----------|--------|
| Retention (D1/D7/D30) | 12% |
| Streak & commitment | 10% |
| Activation speed | 8% |
| Habit formation | 8% |
| Recovery & re-engagement | 8% |
| Progress clarity | 7% |
| Leaderboards & competition | 7% |
| Discovery & first action | 7% |
| Guest mode & auth gating | 6% |
| Social validation | 6% |
| Viral loops | 5% |
| Progression system | 5% |
| Monetization readiness | 4% |
| Emotional identity | 2% |

### Weighted overall score (0–5)

(3.5×0.08 + 4×0.10 + 4×0.08 + 3×0.08 + 3×0.12 + 3.5×0.07 + 2×0.07 + 3.5×0.07 + 4×0.06 + 2×0.06 + 3×0.05 + 2.5×0.05 + 0.5×0.04 + 4×0.02)  
= 0.28 + 0.40 + 0.32 + 0.24 + 0.36 + 0.245 + 0.14 + 0.245 + 0.24 + 0.12 + 0.15 + 0.125 + 0.02 + 0.08 = **2.965**

**Rounded: 3.0 / 5.**

### Interpretation

- **Strong foundation, not yet breakout.**  
  Activation and streak/recovery are backend-real and consistent; guest mode and identity are clear. Leaderboards, social validation, and progression are mostly UI/mock; monetization is absent. Retention instrumentation and D1/D7/D30 hooks are the next lever. Suitable for early-stage: double down on one loop (e.g. streak + recovery), then add real social and one paywall.

---

## PART 3 — FUNNEL ANALYSIS

Based on current implementation:

| Stage | Expected performance (range) | What in the product drives it |
|-------|-------------------------------|-------------------------------|
| **Guest → Signup** | Low–medium (5–15%) | Auth gate on join/secure/respect; clear “Sign up to commit” and benefits. No link or pre-landing for shares; no Apple/Google in gate. |
| **Signup → Day 1 Secure** | Medium (30–50%) | Onboarding is 3 steps + starters.join + day1-quick-win with one task and Secure Day; path is clear and backend-backed. Friction: create-profile first, 3 steps, then 2 taps on day1. Drop-off likely at profile creation or step 2/3. |
| **Day 1 → Day 7** | Medium (15–25%) | Streak and “Secure today” on Home; recovery banner and freeze for one miss. No D1 “come back tomorrow” push or D7 milestone; no daily reminder. Main driver: streak visibility and habit; gap: reminders and milestones. |
| **Day 7 → Day 30** | Low–medium (8–15%) | Same streak/recovery mechanics; no real leaderboard or social yet, so less “see friends” pull. Progression (tier) is placeholder. Main driver: streak and “Continue where you left off”; gap: social proof and progression. |

**Lever by stage:**

- **Guest → Signup:** Add shareable link and “invite 1 friend → unlock”; add Apple/Google in gate; measure gate conversion by context.
- **Signup → Day 1 Secure:** Shorten or defer profile; optional 2-step onboarding; measure time-to-first-secure and step drop-off.
- **Day 1 → Day 7:** D1 push “You secured Day 1 — come back tomorrow”; one “Time to secure your day” push; D7 “7-day streak” milestone.
- **Day 7 → Day 30:** Real leaderboard and “X friends secured today”; real tier/points; optional “30-day streak” moment and invite prompt.

---

## PART 4 — TOP 5 HIGHEST-IMPACT CHANGES

Ranked for impact on retention, growth, and long-term revenue:

1. **Define and ship a minimal monetization path**  
   - Add one premium tier (e.g. extra freeze(s), no ads, advanced stats) and one paywall moment (e.g. after 7-day streak or on second freeze use).  
   - Impact: Revenue and sustainability; moves monetization from 0.5 to 2+; supports retention (premium users stay longer).

2. **Real leaderboard + daily movement stats**  
   - Backend: leaderboard or “top this week” + “secured today / new streaks / lost today.” Wire Activity tab and Home “YOUR POSITION” / “7 friends secured” to real data.  
   - Impact: Social proof and competition; improves D7→D30 retention and engagement depth.

3. **D1/D7 retention hooks and instrumentation**  
   - Instrument D1/D7/D30 by cohort; add D1 push (“You secured Day 1 — come back tomorrow”) and D7 milestone (“7-day streak” + share or badge).  
   - Impact: Retention has highest weight (12%); these hooks directly target the first week.

4. **One daily push and post-secure celebration**  
   - “Time to secure your day” at user-set or default time; after Secure Day from Home, show same celebration as day1 (or short “Day X secured” feedback).  
   - Impact: Habit formation (cue + reward); supports D1→D7 and D7→D30.

5. **Shareable link + invite attribution**  
   - Backend: shareable challenge URL and invite endpoint; include link in Share/Invite; track invite-to-join and share events.  
   - Impact: Viral loop and growth; improves Guest→Signup and brings re-engagement via “X joined your challenge.”

---

## PART 5 — BRUTALLY HONEST ASSESSMENT

**Where GRIT is over-engineered**

- Create-challenge flow and task types (timer, journal, photo, run, checkin, etc.) are rich; for an early-stage app, most users will use 1–2 task types and starter-like challenges. Risk: maintenance and testing cost without proportional retention.
- Multiple gate contexts (join, secure, respect, chase, create, team, other) are tracked; only join/secure matter for conversion until social is real. Rest can be one “other” until needed.
- Preview/mock HTML files and multiple doc files are useful but add surface; keep one source of truth for “what we ship.”

**Where it is underpowered**

- **Social and competition are fake.** Activity tab and Home feed are 100% mock. No real “respect,” leaderboard, or “friends secured today.” Without real social, GRIT is a personal tracker with a social skin — hard to differentiate from a simple habit app.
- **Monetization is zero.** No paywall, no premium tier, no IAP. Sustainable only with funding or future monetization; every month without a path is opportunity cost.
- **Retention is hope, not design.** D1/D7/D30 are not computed or surfaced; no D1 “come back” or D7 milestone. Streak and recovery are good; the rest is “users will return because streak.” They might not without reminders and milestones.
- **Progression is theater.** “39 pts to Builder” and tier labels are placeholders. Users will notice they never move; trust in the system can drop.

**Where it may fail to scale**

- **Single active challenge.** If the product assumes one active challenge per user, power users or “try several” behavior will hit limits; consider multiple active challenges or “focus mode” and clarity on what “counts” for streak.
- **No real-time or batch aggregation.** Leaderboard and “secured today” require either real-time writes or batch jobs. Current schema supports it, but no aggregation layer is implemented; at scale this will need design.
- **Onboarding and profile.** Profile creation before onboarding can be a funnel killer; if growth scales, this step will show up in drop-off. Defer or shorten profile until after first value.

**Where competitors could beat it**

- **Habit apps (Streaks, Habitica, etc.):** Simpler “one habit, one tick” and lower friction. GRIT wins if commitment and “secure day” feel more meaningful and social is real; loses if social stays mock and onboarding stays longer.
- **Duolingo / language apps:** They own “streak + lesson in 2 min” and have massive retention data. GRIT can win on “discipline + challenges + community” only if community (leaderboard, respect) is real and differentiated.
- **Strava / fitness:** They own “record activity + kudos + segments.” GRIT is not a tracker; it’s a commitment layer. It wins if it becomes the “commitment layer” people open before or after Strava (e.g. “I committed to run 5x this week on GRIT”). It loses if it tries to be a tracker or a social feed without real data.

**Summary**

GRIT has a solid core: backend-backed activation (starters, day1 secure, streaks, freeze) and recovery, clear identity, and guest gating. It is underpowered on social (mock), progression (placeholder), and monetization (absent), and under-designed on retention (no D1/D7 hooks). Fix the “fake” parts (leaderboard, respect, tier) and add one revenue path and one retention hook (D1 push or D7 milestone) before scaling acquisition.

---

*All scores and improvements are based on the codebase as of 2025-02-28 (backend: TRPC starters, checkins, profiles, streaks; app: onboarding, day1-quick-win, Home recovery and freeze, Discover, Activity and profile placeholders).*
