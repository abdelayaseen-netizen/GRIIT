# GRIT — Engineering & Infrastructure Evaluation

**Basis:** Scalability patterns (Duolingo/Strava), modern SaaS reliability, YC growth architecture, retention measurement (D1/D7/D30).  
**Scale:** 0 = Unsustainable → 5 = Elite Infrastructure.

---

# PART 1 — ARCHITECTURE & CODE QUALITY

## 1) Separation of Concerns — **3 (Production-capable)**

| Aspect | Evidence | Gap |
|--------|----------|-----|
| Frontend vs backend | Clear boundary: tRPC router per domain (challenges, checkins, nudges, notifications, etc.); frontend uses `trpcQuery`/`trpcMutate` and `getTrpcUrl()` from a single `lib/api` + `lib/trpc`. | No API versioning or shared OpenAPI; contract is implicit. |
| State management | Global: `AppContext` (profile, activeChallenge, stats, todayCheckins, computeProgress, secureDay, completeTask). Auth: `AuthContext` + `AuthGateContext`. Local state in screens. | No dedicated store (Zustand/Redux); AppContext carries many concerns and some stub values (e.g. `challenges: []`, `getChallengeRoom: () => null`). |
| Component size & coupling | `app/(tabs)/create.tsx` is very large (multi-step form, all task types, time enforcement, presets). Other screens (index, activity, discover) are substantial but more scoped. | Create flow would benefit from extracted hooks and subcomponents to reduce coupling. |

**Verdict:** Boundaries are clear enough for a small team; state is centralized but not minimal. Component size is the main maintainability risk.

---

## 2) Scalability Readiness — **2 (Prototype)**

| Question | Evidence | Rating |
|----------|----------|--------|
| Are queries paginated? | **Challenges:** `list` and `getFeatured` use `.limit(50)` (fixed). **Leaderboard:** `getWeekly` loads *all* `day_secures` for the week with no limit, then sorts in memory and joins profiles/streaks/respects. **Stories:** `list` has *no* `.limit()` — unbounded. **Nudges/respects:** `.limit(50)` on getForUser. | **2** — Critical paths (leaderboard, stories) are unbounded or full-scan. |
| Are endpoints optimized? | Single round-trips per procedure; leaderboard does 4+ queries (secures, profiles, streaks, todaySecures, respectCounts) then in-memory sort. No materialized views or pre-aggregation. | **2** — Works at small scale; will not scale Duolingo/Strava-style without limits and/or caching. |
| Unbounded lists? | **Yes.** `leaderboard.getWeekly`: all users who secured this week. `stories.list`: all non-expired stories. | **1** — High risk under load. |
| Cron infrastructure? | **None.** No cron jobs in repo. Daily reminders and streak-at-risk are *local-only* (scheduled on device via `expo-notifications`). Server-side reminder/streak-at-risk would require external cron (e.g. Railway cron, Inngest). | **0** — No server-side scheduling. |

**Verdict:** Fine for hundreds of users; at thousands, leaderboard and stories become the first failure points. Pagination (or hard caps) and optional cron are required for “scalable” (4).

---

## 3) Data Integrity — **3 (Production-capable)**

| Question | Evidence | Rating |
|----------|----------|--------|
| Is important data server-backed? | **Yes.** Challenges, check-ins, secure day, streaks, respects, nudges, profiles, push_tokens, reminder settings — all in Supabase. | **4** |
| Client-only logic for critical flows? | Secure day, task completion, nudge, respect — all go through tRPC. Progress and “can secure” are derived client-side from server data (todayCheckins, challenge_tasks). | **3** — Logic is consistent; no critical write path is client-only. |
| Mock data left? | **Starter challenges:** `STARTER_CHALLENGES` from `@/mocks/starter-challenges` used for discovery/display; backend has `getStarterPack` for join flow. Placeholder fake tasks on Home were removed (replaced with “No tasks yet”). `mockLocationDetected` in checkin is UI state, not fake data. | **3** — One intentional mock (starter list) for UI; core feeds and stats are real. |

**Verdict:** Data model and critical paths are server-backed. Remaining mock usage is confined and documented.

---

## 4) Error Handling Robustness — **3 (Production-capable)**

| Question | Evidence | Rating |
|----------|----------|--------|
| Mutations fail gracefully? | Create challenge: watchdog, recovery modal, `formatTRPCError`, user-facing alerts. Nudge/respect: Alert on error; rate limit message for nudge. Checkins: TRPCError BAD_REQUEST for photo proof. | **3** — No silent mutation failures in core flows; some catch blocks only rethrow or show generic message. |
| Consistent error formatting? | Backend: mix of `throw new Error()` and `throw new TRPCError({ code, message })`. Frontend: `formatTRPCError` in `lib/api.ts` (Connection, UNAUTHORIZED, BAD_REQUEST, etc.) used in create; other screens use `e?.message` or Alert. | **3** — TRPCError used where it matters; not every route uses it. |
| Retry logic clean? | `fetchWithRetry` in `lib/api.ts`: exponential backoff (500–4000 ms), retry on 502/503/504/408/429 and network-like errors. Used by tRPC client. | **4** — Retry is centralized and sensible. |

**Verdict:** Retry is strong; error surface is consistent enough for production but could be standardized (TRPCError everywhere, single formatTRPCError path for UI).

---

## 5) Push Infrastructure Quality — **3 (Production-capable)**

| Question | Evidence | Rating |
|----------|----------|--------|
| Token storage? | **Yes.** `push_tokens` table (user_id, token, device_id, updated_at); `notifications.registerToken` upserts; profiles.expo_push_token also updated for backward compat. Nudge reads from both. | **4** |
| Delivery reliability? | `sendExpoPush` in `backend/lib/push.ts`: no-op on missing/invalid token; logs on non-OK response. No retry or dead-letter. Expo Push API is single HTTP call. | **3** — Does not crash; no retry or tracking of delivery. |
| Cron-based scheduling? | **No.** Reminders and streak-at-risk are scheduled only on-device (`lib/notifications.ts`). No server cron for “send reminder at user’s 8 PM.” | **1** — Not server-scalable for timezone-aware reminders at scale. |
| Timezone handling? | Profiles have `reminder_timezone`; reminder time is stored (e.g. "20:00"). Scheduling uses local device time. No server-side “run at 8 PM user local” without cron + timezone DB. | **2** — Stored but not used for server-driven scheduling. |

**Verdict:** Token storage and nudge delivery are production-capable. Reminder/streak-at-risk are device-bound; for “elite” (5) you’d add server cron + timezone-aware send.

---

# PART 2 — RETENTION MEASUREMENT READINESS

## 6) Analytics Infrastructure — **3 (Production-capable)**

| Question | Evidence | Rating |
|----------|----------|--------|
| SDK present? | **Abstraction only.** `lib/analytics.ts`: `track()`, `identify()`, `setAnalyticsHandler()`, `setIdentify()`. No PostHog/Mixpanel dependency; handler is optional. | **3** — Ready to wire; not wired. |
| Core events tracked? | **Yes.** app_opened, signup_started/completed, onboarding_completed, first_challenge_joined, first_task_completed, day_secured, nudge_sent, respect_sent, streak_lost, streak_milestone, push_permission_granted/denied, gate_modal_shown, etc. | **4** |
| Activation measurable? | first_task_completed, day_secured, day1_secured (with ttfv_seconds) allow “first value” and “first secure” funnel. | **4** |
| D1/D7/D30 measurable? | **Only if backend computes cohorts.** Events exist (day_secured, signup_completed, etc.) but no server-side cohort table or “last_active_at” aggregation. With a warehouse or PostHog/Mixpanel + identity, D1/D7/D30 can be derived from events. | **3** — Event set supports it; no built-in cohort API. |

**Verdict:** Event taxonomy and identify() are retention-ready; wiring an SDK and (optionally) server-side cohort job would make this a 4.

---

## 7) Social Infrastructure — **3 (Production-capable)**

| Question | Evidence | Rating |
|----------|----------|--------|
| Reactions server-backed? | **Yes.** Respects: `respects` table, `respects.give`, `respects.getForUser`, `getCountForUser`. Nudges: `nudges` table, `nudges.send`, `nudges.getForUser`. Leaderboard uses respect counts. | **4** |
| Nudge rate-limited? | **Yes.** Server-side: 1 nudge per (sender, recipient) per 24h; TOO_MANY_REQUESTS + “You already nudged them today.” Self-nudge rejected. | **4** |
| Friends persistent cross-device? | **No.** Settings shows “0 FRIENDS”; no friends table or follow graph. Social is “global leaderboard + respect/nudge” only. | **1** — No friends infrastructure. |

**Verdict:** Nudge and respect are production-grade and server-backed. “Friends” is not implemented — limits social retention to leaderboard-style only.

---

## 8) Security & Compliance — **2 (Prototype)**

| Question | Evidence | Rating |
|----------|----------|--------|
| Apple Sign-In? | **No.** AuthGateModal has `openSignup("email" | "apple" | "google")` but both apple and google route to email signup. No Supabase Apple/Google provider wired. | **0** — Required for iOS quality; missing. |
| Delete account? | **No.** No procedure or UI to delete account or purge user data. Supabase Auth allows user delete; app does not expose it. | **0** — GDPR/CCPA risk. |
| Rate limiting? | **Nudge only.** 1/sender/recipient/24h. No global API rate limit (per-IP or per-user). | **1** — No general protection. |
| Auth token lifecycle? | Supabase manages session; tRPC uses Bearer from context. No explicit refresh or token rotation logic in app code. | **3** — Standard Supabase; no custom lifecycle. |

**Verdict:** Auth is standard; missing Apple Sign-In, delete account, and global rate limiting keep this at “prototype” for store and compliance.

---

# PART 3 — PRODUCT SCALE PROJECTION

## How many users before refactor?

- **Order of magnitude:** **~1k–5k DAU** with current design, assuming a single backend instance and Supabase.
- **First breakage:**  
  - **Leaderboard:** Loading all users who secured this week (no limit) + 4 follow-up queries. At ~10k+ weekly actives, this becomes slow and memory-heavy.  
  - **Stories.list:** Unbounded; any large story volume will increase latency and memory.  
  - **Challenges list/getFeatured:** Capped at 50; safe until you need pagination for discovery.

## What breaks first under load?

1. **leaderboard.getWeekly** — Full table scan of `day_secures` for the week, then in-memory sort and multiple `.in(user_id, ...)` calls. Add a cap (e.g. top 100) or cursor-based pagination and/or materialized view.
2. **stories.list** — No limit. Add `.limit(50)` or cursor + limit.
3. **Single backend process** — No horizontal scaling or queue; one Node process handles all tRPC. Acceptable until request volume or push volume grows.

## Is notification infra scalable?

- **Current:** One Expo Push API call per nudge; tokens from DB. No batching across users.
- **Scale:** Fine for thousands of users (Expo handles volume). For hundreds of thousands, you’d batch receipts and consider worker queues. Reminders are device-scheduled only — server-side reminder blast would need a job queue + cron.

## Is database structure clean?

- **Yes.** Normalized tables (profiles, challenges, challenge_tasks, active_challenges, check_ins, day_secures, streaks, respects, nudges, push_tokens); RLS on sensitive tables; indexes where they matter (e.g. nudges, leaderboard-related). No obvious schema smell.

---

## Projected readiness levels

| Metric | Level | Note |
|--------|--------|------|
| **D1 retention potential** | **Medium** | Events and first-task/first-secure flows exist; no cohort API or in-app D1 surface. Onboarding is multi-step (not &lt;90s to first win). |
| **D7 retention potential** | **Medium** | Streak and reminder mechanics support habit; no D7 cohort or “top X% of Week 1 returners” yet. |
| **D30 retention potential** | **Low–Medium** | No strong long-term hook (e.g. friends, clubs, challenges) beyond streak; leaderboard is global only. |
| **Monetization readiness** | **Low** | No paywall, no subscription, no IAP. Product is free; adding monetization would be net-new. |

---

# FINAL OUTPUT

## Engineering Score — **3 (Production-capable)**

- Clear separation of frontend/backend and state; good data integrity and retry logic.
- Bounded by: unbounded leaderboard and stories, no cron, large Create component, mixed error patterns.

## Infrastructure Score — **2.5 (Prototype / early Production)**

- Solid: health check, tRPC path alignment, push token storage, nudge delivery, Supabase + RLS.
- Gaps: no server cron, no global rate limiting, no Apple Sign-In, no delete account, unbounded queries.

## Scale Readiness Level — **Prototype–Production (2.5)**

- Can run in production for small to mid user base (roughly 1k–5k DAU) with monitoring.
- Not yet “Scalable” (4) or “Elite” (5) without: pagination/limits on leaderboard and stories, optional cron for reminders, rate limiting, and compliance (Apple, delete).

---

## Biggest architectural weakness

**Unbounded reads on growth-critical paths.**  
`leaderboard.getWeekly` and `stories.list` have no limit. Under load they will dominate latency and resource use and are the first things that will force a refactor. Fix: add a hard cap (e.g. top 100 for leaderboard, limit 50 for stories) and/or cursor-based pagination and, medium-term, pre-aggregation or materialized views for leaderboard.

---

## Highest-leverage system improvement

**Cap leaderboard and stories + add one server cron.**  
- **Leaderboard:** Return at most top N (e.g. 100) by `securedDaysThisWeek`; or add `limit`/`cursor` and paginate.  
- **Stories:** Add `.limit(50)` (or paginate) to `stories.list`.  
- **Cron:** One job (e.g. every 15 min) that: (1) finds users with `reminder_enabled` and `preferred_secure_time` in the current 15-min window (by timezone), (2) checks “has not secured today,” (3) sends one push per user via `sendExpoPush`.  

This preserves current behavior, prevents the first scale failures, and moves reminders toward a scalable, timezone-aware model without rewriting the app.
