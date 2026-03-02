# GRIT — Performance Re-Score (Post–Starter Pack + E2E QA)

**Date:** 2025-02-28  
**Scope:** After Starter Pack on Discover, real join flow, post-signup return, local notifications, invite/share loop, and E2E QA fixes.

---

## 1) Funnel simulation (ranges)

| Stage | Baseline (pre–core fix) | Post–core fix | Post–Starter Pack + QA | Why |
|-------|--------------------------|---------------|-------------------------|-----|
| **Guest → Signup** | 4–12% | 6–14% | **8–16%** | Starter Pack gives a clear “join in 2 taps” path; no fake data; invite link in share message. |
| **Signup → Day 1 Secure** | — | 35–50% | **40–55%** | Post-signup return to pending join; commitment screen then Home; Starter Pack challenges are easy and fast. |
| **Day 1 → Day 7** | 14–24% | 20–30% | **24–34%** | Local “Time to secure your day” at preferred time; “2 hours left” option; D7 milestone + optional invite. |
| **Day 7 → Day 30** | 8–16% | 12–20% | **14–22%** | Same retention hooks; real leaderboard and respects; progression and milestones. |
| **Day 30 → Day 90** | — | 8–15% | **10–18%** | Tiers and leaderboard give long-term goals; invite/share creates social pull. |

**What improved vs baseline**

- **Starter Pack visibility:** Discover always shows a curated “Starter Pack” from the backend (when seeded). Guests can open a challenge and tap Join → gate → signup → return to commitment → join. Fewer steps and no empty Discover.
- **Real leaderboard + respects:** Already in place; no change in this round.
- **Push reminders:** Local notifications at preferred time and optional “2 hours left” reduce “forgot to secure” and improve D1→D7 and D7→D30.
- **Invite loop:** Share includes a real join URL; `invite_shared` is tracked; milestone modal offers “Invite a friend.” Measurable growth loop in place even before full deep-link handling.

---

## 2) Retention strength score (0–5)

| Dimension | Score | Note |
|-----------|-------|------|
| **Activation strength** | **4.0** | Starter Pack + join in 2 taps (Commit → I’m in); post-signup return to join; easy starters. |
| **Habit loop strength** | **4.0** | Daily reminder at preferred time; reschedule when already secured; optional “2 hours left”; milestone reward. |
| **Social stickiness** | **3.5** | Real respects; invite/share with link; no “respect received” toast yet. |
| **Competitive drive** | **4.0** | Real weekly leaderboard; rank and “X people secured today”; “Be the first this week” when empty. |
| **Recovery resilience** | **4.0** | Freeze + recovery banner; unchanged. |
| **Progression depth** | **4.0** | Real tiers and pointsToNextTier; milestones at 7/30. |
| **Monetization readiness** | **2.5** | No paywall; progression/social set up future upsell. |
| **Network effect potential** | **3.5** | Invite/share with link + analytics; join link handling (deep link) still to be wired. |
| **Trust & integrity** | **4.5** | No mocks in Discover; honest empty states; real data only. |

**Overall average:** **(3.8 / 5.0)**

---

## 3) 1,000 downloads simulation

| Metric | Low | Mid | High | Assumption |
|--------|-----|-----|-----|------------|
| **Signups** | 80 | 120 | 160 | Guest→Signup 8–16% |
| **Day 1 secured** | 32 | 60 | 88 | Signup→Day 1 Secure 40–55% |
| **Day 7 active** | 8 | 18 | 30 | Day 1→Day 7 24–34% |
| **Day 30 active** | 2 | 4 | 7 | Day 7→Day 30 14–22% |

**Expected (mid):** ~120 signups, ~60 day‑1 secured, ~18 day‑7 active, ~4 day‑30 active per 1,000 downloads.

---

## 4) Final classification

| Option | Verdict |
|--------|--------|
| **Prototype** | No |
| **Early-stage beta** | No (moved past this) |
| **Strong foundation** | **Yes** |
| **Breakout ready** | Not yet |

**Summary:** GRIT is **strong foundation**: real Starter Pack and join flow, local push, invite/share with link and tracking, post-signup return, real leaderboard and progression, no fake data. To be **breakout ready** it still needs: (1) join link handling (open app → challenge detail → Join), (2) cohort D1/D7/D30 instrumentation and use in product/push, (3) at least one monetization experiment (e.g. second freeze or badge). The current build is in a good state to add those next.
