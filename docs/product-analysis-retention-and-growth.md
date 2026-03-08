# GRIIT Product Analysis: Retention, Engagement & Growth

**Scope:** Full codebase review — architecture, UI/UX, features, retention mechanics, gamification, social, and product strategy.  
**Frameworks:** Stanford Hook Model, HBS retention, MIT network effects, Wharton gamification, real-world benchmarks (Strava, Duolingo, BeReal, Habitica).  
**Intent:** Honest evaluation with ratings, gaps, and prioritized actions.

---

## 1. Stanford Hook Model (Trigger → Action → Variable Reward → Investment)

**Rating: 5.5 / 10**

### What you’re doing well
- **Action** is simple and clear: complete tasks → secure day. Friction is low (task types: journal, timer, run, photo; optional check-in “coming soon”). Day-1 quick win exists: onboarding → pick starter → complete first task → celebration, which creates an early “win.”
- **Investment** accumulates: streak count, tier (Starter → Builder → Relentless → Elite), total days secured, calendar history, achievements (first streak, 7-day, 30-day, 75-day, tier badges). Data is stored and shown (profile, discipline score, calendar). Streak freezes and Last Stand add “sunk cost” and loss-aversion.
- **Internal trigger** is partially built: comeback/recovery banners (missed 1 day, 2–6 days, 7+ days) and “secure your day” messaging create a reason to return. Retention config is centralized and tunable.

### What’s missing or weak
- **External trigger:** Push reminder is a placeholder. `sendSecureReminder()` in `backend/lib/push-reminder.ts` is not wired to real delivery; `sendPushToUser` exists for Expo but the daily “secure your day” cron/job is not implemented. So there is no reliable external trigger to bring users back.
- **Variable reward:** Rewards are mostly fixed: same celebration pattern (confetti, “DAY SECURED,” streak count, points to next tier). Milestones (3, 7, 14, 21, 30, 50, 75, 100) add some variability, but there’s no unpredictable reward (e.g. random bonus, surprise badge, or varied celebration copy). The hook is more “routine” than “variable.”
- **Trigger diversity:** No email, no in-app reminder at a chosen time, no “your team is waiting” or “X people secured today” type triggers. One internal trigger (recovery banners) is not enough to form a strong habit loop.

### Actionable improvements
| Priority | Improvement | Rationale |
|----------|-------------|-----------|
| **High** | Wire daily push reminder: cron/job that calls `shouldSendSecureReminder` and `sendPushToUser` (or `sendSecureReminder`), using `profiles.expo_push_token` and `reminder_enabled` / `preferred_secure_time`. | External trigger is the biggest gap; without it, habit formation depends only on memory. |
| **High** | Add variable reward layer: random “bonus” message or rare celebration variant after secure (e.g. “Lucky streak!” or “Top 10% today”), or occasional surprise badge/tooltip. | Stanford research stresses variable reward for habit strength; current experience is too predictable. |
| **Medium** | Store and show “last opened” / “preferred time” and send one smart reminder (e.g. 2 hours before midnight in user’s TZ if not secured). | Increases likelihood of action before day-break. |
| **Low** | A/B test celebration copy and minor animation variants by cohort. | Low effort, can improve perceived variability. |

---

## 2. Harvard Business School — Customer Retention, Switching Costs & Loyalty

**Rating: 5 / 10**

### What you’re doing well
- **Switching cost (data):** User invests in streak, tier, total days, calendar, achievements. Leaving means losing visible progress (no export or “take your data” flow in codebase). That creates psychological switching cost.
- **Recovery paths:** Comeback mode (2–6 days missed → “secure 3 days to restore”), streak freeze (1/month, yesterday only), Last Stand (earn by consistency, use to protect streak). These reduce all-or-nothing loss and support re-engagement.
- **Structural retention:** Team and shared-goal challenges add social obligation; accountability partners (invite/accept) add interpersonal commitment. Both are in the product.

### What’s missing or weak
- **No real monetization:** Premium is stubbed (`lib/premium.ts`: `isPremium()` always false). No subscription, no paywall, no revenue-based retention. You’re not creating “I paid for this” switching cost.
- **Loyalty program:** No explicit loyalty or “member since” benefits, no exclusive content or early access. Tier is progression, not loyalty.
- **Churn reduction:** No win-back email, no “we miss you” push, no re-engagement campaign. No in-app survey or churn reason capture.
- **Relationship depth:** Accountability and team exist but chat is off (`FLAGS.CHAT_ENABLED` false), so relationship-building inside the app is limited. “Friends” filter on Activity exists but friend graph isn’t central to the flow.

### Actionable improvements
| Priority | Improvement | Rationale |
|----------|-------------|-----------|
| **High** | Implement at least one paid tier (e.g. unlimited challenges, no ads, premium badge) via RevenueCat or Stripe; gate 1–2 high-value actions. | Adds monetary and psychological commitment; aligns with HBS “increase switching cost.” |
| **High** | Add “win-back” flow: if user hasn’t opened in 3–7 days, one push (and later email) with simple CTA (“Your streak is waiting” / “One task to get back on track”). | Directly targets churn. |
| **Medium** | Surface “member since” and small loyalty perks (e.g. exclusive starter challenge, badge). | Strengthens identity and belonging. |
| **Medium** | When user is about to leave (e.g. delete account or long inactivity), optional 1-tap “Why are you leaving?” and save reason. | Informs retention product and messaging. |
| **Low** | Consider light “loyalty” rewards for long-term users (e.g. extra freeze at 30 days secured). | Reinforces staying. |

---

## 3. MIT Sloan — Network Effects & Platform Growth

**Rating: 3.5 / 10**

### What you’re doing well
- **Sharing exists:** Share challenge, invite to challenge, share profile, share day secured, share milestone, share challenge complete, share app. All use `lib/share.ts` and generic APP_URL (`https://griit.app`). Copy is clear (“Join me on …”, “Think you can keep up?”).
- **Social structure:** Leaderboard (weekly, resets Sunday), Activity feed (respect, nudge, streak_milestone, day_secured, challenge_joined), team challenges, shared-goal challenges, accountability partners. So there is a skeleton for social and collaborative use.

### What’s missing or weak
- **No viral loop:** Shares use a single static APP_URL. There is no challenge-specific or user-specific link (e.g. `https://griit.app/c/abc123` or `https://griit.app/invite/xyz`). Code comment in `lib/share.ts`: “TODO: Add deep links when available.” Without deep links, new users land on a generic page and don’t get a direct path to the challenge or inviter. Viral coefficient is near zero.
- **Network effects are weak:** Leaderboard and feed don’t require “friends”; they’re global. Friends filter is present but the product doesn’t strongly drive adding friends or seeing friends’ activity first. So growth doesn’t compound with user count in an obvious way.
- **No invite incentive:** No reward for inviting (no extra freeze, no badge, no premium trial). Invite is altruistic only.
- **Discovery is one-sided:** Discover has featured/starter challenges and categories, but there’s no “challenges your friends are in” or “trending this week” that would create pull from the network.

### Actionable improvements
| Priority | Improvement | Rationale |
|----------|-------------|-----------|
| **High** | Add deep links: `/challenge/[id]` and `/invite/[code]` (or similar). Use them in `shareChallenge` and `inviteToChallenge` so that shared links open the app (or web) to that challenge. | Single highest-leverage change for viral loop; required for any meaningful K-factor. |
| **High** | Add invite attribution: track which user/challenge an install or signup came from; show “X invited you” and pre-fill join. | Makes shares measurable and reinforces inviter-invitee bond. |
| **Medium** | Incentivize invites: e.g. “Invite a friend, get one extra streak freeze this month” or “Unlock [badge] when 3 friends join.” | MIT work on growth often highlights incentive alignment for viral loops. |
| **Medium** | “Challenges friends are in” or “Activity from people you follow” in Discover/Home. | Uses existing graph to create pull and FOMO. |
| **Low** | Referral code or shareable profile link (e.g. griit.app/u/username). | Another vector for attribution and sharing. |

---

## 4. Wharton — Gamification & Behavioral Psychology

**Rating: 6.5 / 10**

### What you’re doing well
- **Streaks:** Core mechanic, well implemented. Streak is computed, stored, displayed on Home and Profile; loss is tracked (`streak_lost`). Aligns with “don’t break the chain” and loss aversion.
- **Progression:** Tiers (Starter → Builder → Relentless → Elite) by total days secured; “X points to next tier” and clear next milestone. Matches goal-gradient effect (more effort near goals).
- **Milestones:** 3, 7, 14, 21, 30, 50, 75, 100 days with distinct copy (e.g. “21 days — they say this is where habits form”). Good use of milestone framing.
- **Leaderboard:** Weekly rank, “Top this week,” resets Sunday. Creates comparison and short-term competition. Badges (Elite, Relentless, Builder, Starter) on leaderboard and profile.
- **Achievements:** First Streak, 7-Day Consistent, 30-Day Strong, 75-Day Legend, tier badges. Locked/unlocked in UI. Taps into achievement and collection.
- **Feedback:** Celebration (confetti, haptics, “DAY SECURED”), secure-confirmation screen, progress bar. Immediate positive feedback after action.
- **Loss protection:** Streak freeze and Last Stand reduce catastrophic loss and support continued play (behavioral “safety net”).

### What’s missing or weak
- **Points are underused:** “Discipline points” appear on profile but progression is driven by days secured, not a separate point economy. No spending, no point-based rewards. So “points” don’t add a second loop.
- **Leaderboard is weekly only:** No daily, all-time, or per-challenge leaderboard. Less variety and less reason to check back at different times.
- **No meaningful rewards:** No unlocks, no premium trial for streaks, no tangible benefit for achievements beyond badge. Rewards are mostly status (badge, rank).
- **Social proof in flow:** No “Y% of people who start complete day 1” or “You’re in the top X% this week” on key screens. Could reinforce commitment.
- **Commitment device:** Hard mode and consequences are present in settings, but the product doesn’t strongly emphasize pre-commitment (e.g. “I commit to 7 days” with a visible contract).

### Actionable improvements
| Priority | Improvement | Rationale |
|----------|-------------|-----------|
| **High** | Add one tangible reward for achievements (e.g. 7-day streak → 1 extra freeze; 30-day → premium trial week). | Wharton-style gamification links rewards to effort; currently rewards are only symbolic. |
| **Medium** | Add daily or all-time leaderboard (or per-challenge) in addition to weekly. | Gives more reasons to open app and compare. |
| **Medium** | Show social proof on commitment/secure: “You’re in the top 20% today” or “80% of people who secured yesterday came back today.” | Behavioral principle: others’ behavior influences commitment. |
| **Medium** | Make “points” matter: either rename to “days” everywhere or add a simple point rule (e.g. 1 point per day, 2 for streak day) and a small reward (e.g. 50 points = extra freeze). | Clarifies or enriches progression. |
| **Low** | Optional “commitment contract” at join: “I commit to completing this challenge” with checkbox and reminder. | Strengthens pre-commitment. |

---

## 5. Real-World Benchmarks (Strava, Duolingo, BeReal, Habitica)

**Rating: 5 / 10**

### Comparison (concise)

| Dimension | GRIIT | Strava | Duolingo | BeReal | Habitica |
|-----------|--------|--------|----------|--------|----------|
| **Onboarding** | Goal + time + starter → Day 1 task | Sign up → connect device | Placement + goal (min/day) + first lesson | Sign up → first post | Sign up → pick habits → RPG |
| **First value** | One task (day 1 quick win) | First upload / first activity | First lesson in minutes | First BeReal in 2 min | First check-in + XP |
| **Core loop** | Tasks → secure day | Record/upload → kudos/segments | Lessons → streak | One photo/day → discovery | Habits → XP/gold/quests |
| **Retention mechanics** | Streak, freeze, Last Stand, comeback | Streaks, challenges, clubs | Streak, leagues, hearts, XP | Daily notification, friends’ feed | Streak, HP, quests, party |
| **Social/viral** | Share/invite (no deep link), team, accountability | Follow, kudos, clubs, segments | Friends, leagues, share | Friends, discovery, share | Friends, party, challenges |
| **Monetization** | None (premium stubbed) | Subscription (analysis, challenges) | Freemium (hearts, no ads, plus) | Ads / optional | Freemium (gems, subscription) |
| **Notifications** | Placeholder only | Activity, kudos, challenges | Heavy (streak, reminders) | One daily push (core) | Reminders, social |

### What you’re doing well
- **Day-1 quick win:** Closer to Duolingo/Habitica (immediate action) than to “empty dashboard.” Onboarding → starter → first task → celebration is a strength.
- **Recovery mechanics:** More nuanced than many apps (freeze, Last Stand, comeback mode). Strava and Duolingo don’t offer equivalent “save your streak” in the same way.
- **Tiers + milestones:** Clear progression like Duolingo’s levels and Habitica’s RPG; copy (e.g. 21 days) is good.
- **Team/shared goal:** Differentiated; Strava has clubs/challenges but not “we all complete or we all fail” in the same way.

### What’s missing or weak
- **No daily trigger:** Duolingo and BeReal are famous for one clear daily trigger (lesson, BeReal). GRIIT’s “secure your day” push isn’t implemented. That’s a major gap.
- **No monetization:** Every benchmark app monetizes. You don’t; no revenue and no “I paid” commitment.
- **No deep link / invite flow:** Duolingo and others use invite links that open the app to a specific screen. You share a generic URL; conversion from share will be low.
- **Discovery:** No “trending” or “friends are doing” like Strava/Duolingo. Discover is catalog-style.
- **Onboarding length:** You have 4 steps + day-1 task; Duolingo gets to value in one step. You could shorten or make steps skippable for some users.

### Actionable improvements
| Priority | Improvement | Rationale |
|----------|-------------|-----------|
| **High** | Ship one daily push (time-based “secure your day”) like Duolingo/BeReal. | Benchmarks all rely on a clear daily trigger. |
| **High** | Add deep links and use them in every share (challenge, invite, profile). | Matches how successful apps convert shares. |
| **High** | Introduce at least one revenue stream (e.g. premium: unlimited challenges + no ads). | Aligns with category and enables paid retention. |
| **Medium** | Shorten or skip onboarding for “power users” (e.g. skip goal/time, go straight to starter pick). | Speeds time-to-value. |
| **Medium** | Add “Trending” or “Popular this week” in Discover using join or completion counts. | Improves discovery and FOMO. |
| **Low** | Consider one “habit stack” moment (e.g. “After my morning coffee I open GRIIT”) in onboarding. | Ties app to existing routine (implementation science). |

---

## 6. Overall Score and Summaries

### Overall score: **52 / 100**

- **Hook / habit (15):** 5.5 → ~8 pts. Good action + investment; weak triggers and variable reward.
- **Retention / loyalty (20):** 5 → ~10 pts. Good recovery and data lock-in; no monetization or win-back.
- **Network / growth (20):** 3.5 → ~7 pts. Sharing and social structure exist; no viral loop or deep links.
- **Gamification (20):** 6.5 → ~13 pts. Strong streaks, tiers, milestones; rewards and variety could be better.
- **Benchmarks / execution (25):** 5 → ~14 pts. Good day-1 and recovery; missing daily push, monetization, and invite conversion.

(Weights are illustrative; the 52 reflects that core mechanics are solid but triggers, monetization, and viral growth are underdeveloped.)

---

### Current state summary

GRIIT is a **discipline/challenge app** with a clear core loop (tasks → secure day), **strong recovery mechanics** (streak freeze, Last Stand, comeback mode), **good gamification** (streaks, tiers, milestones, leaderboard, achievements), and **social scaffolding** (teams, shared goals, accountability, feed). Architecture is coherent (Expo, tRPC, Supabase), and retention logic is centralized and tunable.

**Critical gaps:**  
(1) **No reliable external trigger** — daily push is not implemented, so habit formation is left to memory.  
(2) **No viral loop** — shares use a generic URL and there are no deep links or invite attribution.  
(3) **No monetization** — premium is stubbed; no revenue or “paid” switching cost.  
(4) **Variable reward** is light — celebrations are consistent rather than variable.

The product is **engagement-ready** (good loops, recovery, progression) but **growth- and retention-limited** by triggers, sharing, and business model.

---

### Future potential (6 and 12 months)

- **6 months (realistic):**  
  - Daily push live; deep links for challenge/invite; at least one paid tier (e.g. unlimited challenges); one tangible reward (e.g. extra freeze for 7-day streak).  
  - Result: better D1/D7 retention, measurable invite conversion, and early revenue. **Score could move to ~65–70.**

- **12 months (if improvements continue):**  
  - Invite incentives, win-back flows, “friends/challenges” discovery, richer variable rewards, and possibly a second revenue stream (e.g. challenge packs).  
  - Result: higher retention, some viral growth, and a clearer path to sustainability. **Score could reach ~75–82.**

---

## 7. Top 10 Priorities (by impact on retention and growth)

| Rank | Priority | Impact | Effort (rough) |
|------|----------|--------|----------------|
| 1 | **Ship daily “secure your day” push** (cron + `sendPushToUser` / reminder time from profile) | High retention, habit formation | Medium |
| 2 | **Add deep links** (`/challenge/[id]`, `/invite/[code]`) and use in all share/invite flows | High growth, viral potential | Medium |
| 3 | **Implement one paid tier** (e.g. unlimited challenges + premium badge) with RevenueCat or Stripe | Revenue + switching cost | High |
| 4 | **Add one variable reward** (e.g. random bonus message or rare celebration after secure) | Habit strength, engagement | Low |
| 5 | **Invite attribution** (track referrer/challenge from link; show “X invited you”) | Growth, optimization | Medium |
| 6 | **Win-back flow** (one push/email after 3–7 days inactive) | Churn reduction | Medium |
| 7 | **One tangible reward** (e.g. 7-day streak → extra freeze or short premium trial) | Engagement, loyalty | Low–Medium |
| 8 | **“Challenges friends are in” or “Activity from friends”** in Discover/Home | Retention, network | Medium |
| 9 | **Invite incentive** (e.g. extra freeze or badge for inviting N friends) | Viral coefficient | Low–Medium |
| 10 | **Social proof on key screens** (e.g. “Top 20% today” or “80% came back”) | Commitment, engagement | Low |

---

*Document generated from full codebase review. Ratings and priorities are based on implemented behavior and gaps relative to the cited research and benchmarks.*
