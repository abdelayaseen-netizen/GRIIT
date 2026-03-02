# GRIT — Realistic Performance Evaluation

**Purpose:** Evaluate how GRIT would perform if released publicly today, based strictly on the current codebase (TRPC routes, app screens, real vs mock features).  
**Basis:** Actual implementation only — no theoretical or generic startup advice.  
**Date:** 2026-03-01.

---

## PART 1 — FUNNEL SIMULATION

### 1) Guest → Signup conversion rate

**Estimated range: 4–12%**

| Helps | Hurts |
|-------|--------|
| Guest can browse Home, Discover, challenge detail without account (no hard paywall). | Gate shows on any commit action (join, secure, respect); modal has one CTA path: **email only**. `AuthGateModal`: both "Continue with email" and "Sign up with email" route to `/auth/signup`; **no Apple/Google** in UI. |
| Clear copy: "Sign up to commit," "Join challenges, protect your streak, earn ranks." | No shareable link or deep link from invites; guests who land from a friend’s share still hit email signup. |
| "Not now" lets users dismiss without signup (low pressure). | No pre-filled or one-tap social sign-in; every conversion requires email + password flow. |

**Biggest drop-off:** Guest taps "Join" or "Secure" → sees gate → many bounce at "email only" or leave at signup form (no social login).

---

### 2) Signup → Day 1 Secure rate

**Estimated range: 28–45%**

| Helps | Hurts |
|-------|--------|
| **Forced sequence:** After signup, user is sent to **create-profile** (required), then **onboarding** (3 steps), then `starters.join` → **day1-quick-win**. One path to first value. | **Profile before value:** `_layout.tsx` sends `user && !hasProfile` to `/create-profile`. User must complete profile before ever seeing onboarding or a challenge. |
| Onboarding is short: goal → time budget → pick 1 of 6 starters → "Start Day 1." Backend `starters.join` creates real participation; day1-quick-win has one task and "Secure Day" with `checkins.complete` + `checkins.secureDay`. | **3 steps + 2 taps:** Step 1 (goal), Step 2 (time), Step 3 (pick starter) then "Mark complete" + "Secure Day." No skip or "recommended" one-tap. |
| Day 1 secure is backend-real (streak written, refetch so Home shows streak 1). | If `starters.join` or seed fails (no starter challenges in DB), user gets error and no Day 1. Migration must be run. |
| ttfv_seconds and analytics in place. | No push or email after signup to bring back drop-offs before Day 1. |

**Biggest drop-off:** Abandon at create-profile (username, etc.) or at onboarding Step 2/3; or complete onboarding but close app before "Secure Day" and never return.

---

### 3) Day 1 → Day 7 retention

**Estimated range: 14–24%**

| Helps | Hurts |
|-------|--------|
| Home shows real streak, "Continue where you left off," today’s tasks from `todayCheckins`, and "Secure today to protect your streak" with countdown. | **No daily reminder.** No push at a set time ("Time to secure your day"); return is voluntary. |
| `profiles.getStats` returns `effectiveMissedDays`, `canUseFreeze`; recovery banner and "Use streak freeze" with backend `streaks.useFreeze`. One miss can be forgiven (freeze). | Feed on Home is **MOCK_FEED**. "YOUR POSITION" and rank-style cards are fake; no real social pull to open app. |
| Secure Day uses existing `checkins.secureDay`; celebration exists on day1-quick-win; Home has Celebration component for secure flow. | No D1-specific hook (e.g. "You secured Day 1 — come back tomorrow" push or in-app message). |
| Backend streak and freeze logic are consistent across sessions/devices. | Activity tab is 100% mock (leaderboard, feed); no "friends secured" or real competition to pull Day 2–7 opens. |

**Biggest drop-off:** Day 2–3: user forgets or has no cue to open app; no reminder and no real social/competitive reason to return.

---

### 4) Day 7 → Day 30 retention

**Estimated range: 8–16%**

| Helps | Hurts |
|-------|--------|
| Recovery states (missed 1 day, comeback 2–6 days, restart 7+) and copy are implemented; freeze persists. | **No D7 milestone.** No "7-day streak" badge, share card, or celebration; no moment to reinforce identity. |
| Streak and "Secure today" remain the main reason to open the app. | Leaderboard and Movement feed are **mock** (`mockLeaderboard`, `mockFeedItems`). No real "beat #7" or "X friends secured today." |
| getStats returns real `activeStreak`, `longestStreak`, `lastCompletedDateKey`, freeze state. | Profile shows **PLACEHOLDER_DISCIPLINE_SCORE**, **PLACEHOLDER_TIER**, "39 pts to Builder" hardcoded; progression never changes, so long-term pull is weak. |
| Habit loop exists (task list → Secure Day → streak) but no fixed-time cue. | No re-engagement push (e.g. after a miss or before midnight). |

**Biggest drop-off:** After ~7 days, users who don’t self-anchor (e.g. "I always open at 8pm") drift; fake leaderboard/social and static "tier" reduce perceived progress.

---

### 5) Day 30 → Day 90 retention

**Estimated range: 4–10%**

| Helps | Hurts |
|-------|--------|
| Users who reach Day 30 have a real streak and active challenge; backend supports long-running participation. | **No 30-day moment.** No "30-day streak" or "30 days in app" celebration, share, or invite prompt. |
| Comeback mode (secure 3 days to restore) and restart copy give a path back after multiple misses. | Progression is **placeholder**: tier and "39 pts to Builder" never update; no real long-term goal. |
| Streak freeze (1/month) and recovery banner are backend-backed. | No network effect: no real leaderboard, no real "respect"/kudos, no invite attribution; no reason to open except personal streak. |

**Biggest drop-off:** By Day 30+, the only hook is "don’t break the streak." Users who miss a few days see comeback/restart but get no fresh reason to care (no real social or progression).

---

## PART 2 — RETENTION STRENGTH SCORE (0–5)

| Dimension | Score | Reason (from codebase) |
|-----------|-------|------------------------|
| **Activation strength** | 3.5 | Clear path to Day 1 secure (onboarding → starters.join → day1-quick-win) and backend persistence; profile-first and 3 steps add friction; no one-tap "recommended" start. |
| **Habit loop strength** | 3 | Routine exists (tasks → Secure Day → streak); no default daily push or fixed-time cue; post-secure celebration on day1, less prominent on Home. |
| **Social stickiness** | 1 | Respect/chase in gate; feed and Activity use **MOCK_FEED** and **mockFeedItems**; no TRPC for kudos or "respect received"; no real reason to open for others. |
| **Competitive drive** | 1.5 | Leaderboard UI on Activity; data is **mockLeaderboard**; no backend rank or "beat #X"; Home "YOUR POSITION" is fake. |
| **Recovery resilience** | 4 | effectiveMissedDays, canUseFreeze, comeback/restart copy; `streaks.useFreeze` and streak_freezes table; banner and modal wired; no push after miss. |
| **Long-term progression pull** | 2 | Tier and "39 pts to Builder" on Home and profile are **PLACEHOLDER_***; no backend discipline_score or tier; progress feels static. |
| **Monetization readiness** | 0.5 | No paywall, no premium tier, no IAP in codebase; streak freeze is free (1/month). |
| **Network effect potential** | 1 | Share/invite UI exists but no shareable link or invite endpoint; no viral loop or attribution. |

**Overall average (0–5):** (3.5 + 3 + 1 + 1.5 + 4 + 2 + 0.5 + 1) / 8 = **2.06**

---

## PART 3 — WHAT HAPPENS IF 1,000 USERS DOWNLOAD TODAY?

### Assumptions (from funnel above)

- Guest → Signup: **8%** (mid of 4–12%)
- Signup → Day 1 Secure: **36%** (mid of 28–45%)
- Day 1 → Day 7: **19%** (mid of 14–24%)
- Day 7 → Day 30: **12%** (mid of 8–16%)
- Day 30 → Day 90: **7%** (mid of 4–10%)

### Simulated counts (1,000 downloads)

| Stage | Calculation | Result |
|-------|-------------|--------|
| Sign up | 1,000 × 8% | **80** |
| Secure Day 1 | 80 × 36% | **29** |
| Active Day 7 | 29 × 19% | **~6** (round up) |
| Remain Day 30 | 6 × 12% | **~1** (round) |

So: **1,000 downloads → ~80 signups → ~29 Day 1 secures → ~6 still active at Day 7 → ~1 at Day 30.**

### 3 biggest structural weaknesses preventing scale

1. **No real social or competition.** Leaderboard, feed, "YOUR POSITION," and "7 friends secured today" are mock. There is no backend for rank, kudos, or "who secured today." Growth and retention cannot rely on social proof or competitive pull.
2. **Activation friction (profile-first, email-only gate).** Requiring create-profile before any challenge/onboarding, and offering only email signup at the gate, caps Guest→Signup and Signup→Day 1. No Apple/Google and no "start with recommended challenge" one-tap.
3. **No retention hooks beyond the streak.** No daily push, no D1/D7/D30 milestones or messaging, no real progression (tier/points). After Day 1, return depends on user memory and motivation; product does not actively pull them back.

### 3 biggest structural strengths supporting growth

1. **Backend-backed activation and streak.** starters.join, checkins.complete, checkins.secureDay, getStats, and streak + freeze are real and consistent across devices. Day 1 secure and recovery (including freeze) are not fake; they can scale with real data.
2. **Recovery and freeze are implemented correctly.** effectiveMissedDays, canUseFreeze, streaks.useFreeze, and recovery/comeback/restart copy give a real second chance after one miss and a clear path after 2–6 misses. This protects the small cohort that reaches Day 7+.
3. **Guest mode and gating are clear.** Users can browse without account; gate appears on commit with clear benefits. Conversion is low partly because of email-only and profile-first, not because the value prop is missing.

---

## PART 4 — RISK ASSESSMENT

### Where churn would happen most

- **Immediately after signup:** At create-profile or onboarding steps 2–3; users who expected to "try a challenge" hit forms first.
- **After Day 1:** Days 2–5; no reminder and no social/competitive reason to open the app again.
- **After first miss:** Users who miss one day and don’t use (or don’t notice) the freeze may feel the streak is "gone" and disengage; recovery copy helps those who return.

### Where users would feel friction

- **Signup:** Email-only; no Apple/Google. Extra steps and password creation.
- **Before first value:** Create-profile (username, etc.) required before onboarding and before any challenge.
- **Discover:** If backend/seed fails, Discover can fall back to mock or empty list; "Starter challenge not found" on starters.join if seed wasn’t run.
- **Activity tab:** Looks like a real leaderboard and feed; users may not realize it’s fake until they never see themselves or real friends.

### Where the product feels incomplete (mock vs real)

- **Home feed:** MOCK_FEED; "YOUR POSITION" and rank-style cards are not tied to real data.
- **Activity tab:** mockLeaderboard, mockFeedItems, mockMilestones; "Weekly Leaderboard," "Top This Week," daily stats (secured today, new streaks, lost today) are all mock.
- **Profile:** Discipline score, tier, days secured, pts to next tier are PLACEHOLDER_* or hardcoded ("39 pts to Builder").
- **Share/Invite:** No shareable challenge link or invite endpoint; Share.share uses text only; no attribution or viral loop.
- **Respect/Kudos:** Gate context exists; no backend to give or receive respect.

### What would cause 1-star reviews

- "Leaderboard is fake" / "I’m never on the board" (Activity is mock).
- "Made me sign up with email only, no Google/Apple."
- "Asks for profile before I could even try a challenge."
- "My streak broke and I didn’t know about the freeze" (discoverability of freeze CTA).
- "Nothing happens when I tap Respect" or "Feed is always the same people" (mock social).
- "Points and rank never change" (placeholder progression).

### What would cause 5-star reviews

- "Finally secured Day 1 and saw my streak on Home — felt real."
- "Missed one day, used the freeze, streak stayed; love that it’s not just local."
- "Clear what to do: complete tasks, secure day, don’t break the chain."
- "Recovery message after I missed a few days told me exactly what to do (secure 3 days)."
- "Can browse challenges without signing up; signed up when I wanted to commit."

---

## PART 5 — BREAKOUT POTENTIAL

### If no new features are added

- **Can GRIT grow organically?**  
  Only weakly. Share/invite has no link or attribution; leaderboard and social are mock so there’s no "see your friends" or "compete" pull. Word of mouth could bring downloads, but funnel and retention are limited by email-only signup, profile-first flow, and lack of real social/progression.

- **What growth ceiling would it hit?**  
  With current funnel (e.g. ~8% guest→signup, ~36% signup→Day 1, ~19% D1→D7), paid or viral acquisition would mostly feed a leaky bucket. Ceiling is likely in the low thousands of MAU unless retention improves (D1/D7 hooks, real social) and/or conversion improves (social login, defer profile).

- **What must be fixed before scaling paid acquisition?**  
  1. **Real leaderboard or real social hook** — at least one of: backend leaderboard/rank, or real "respect"/activity feed, so Activity and Home aren’t fake.  
  2. **Conversion:** Add Apple/Google (or equivalent) at the gate; consider deferring or shortening profile until after Day 1 secure.  
  3. **Retention hooks:** At least one daily push ("Time to secure your day") and one milestone (e.g. D7 "7-day streak" or D30 moment).  
  4. **Progression or honesty:** Either backend tier/points so "39 pts to Builder" and profile progress are real, or remove/relabel so users aren’t promised progression that doesn’t exist.

### Final classification

**Early-stage beta**

- **Not Prototype:** Core loop (join → complete tasks → secure day → streak) is implemented and backend-backed; guest mode, onboarding, recovery, and freeze are real and consistent.
- **Not Breakout ready:** Social and competition are mock; monetization is absent; conversion and retention have clear, fixable gaps (gate, profile, reminders, milestones).
- **Strong foundation** is close: activation and streak/recovery are solid. The label "early-stage beta" reflects that the product is usable and coherent but would underperform if released to a large audience today because of mock social/progression, conversion friction, and missing retention hooks.

**Summary:** GRIT has a real core (streak, recovery, freeze, Day 1 secure) and a clear identity, but would realistically convert and retain only a small fraction of downloaders (on the order of ~3% Day 1 secure and ~0.1% Day 30 active from 1,000 downloads). Fixing the three structural weaknesses (real social/competition, activation friction, retention hooks) and at least one of progression or transparency would be necessary before treating it as a scalable, shippable product for broad release.
