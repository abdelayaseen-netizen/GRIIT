# Beta Launch Score Card

**Date:** March 8, 2025  
**Scope:** Post beta-prep (cleanup, performance, stability, deep-link config, verification).  
**Previous baseline:** 52/100 (referenced in task).

Ratings are 1–10 based on what is **actually in the code**, not intentions. Brutally honest.

---

## Category ratings

### 1. Code Quality — **6.5/10**

- **Dead code:** Reduced: removed unused `Card`, `PreviewCard`, `handleSupabaseError`, debug `logCreateChallenge`, unused `RetentionConfig` export. Some optional exports (e.g. analytics `setIdentify`) remain for future wiring.
- **Duplication:** Improved: single `formatSecondsToMMSS` in `lib/formatTime.ts`, single `isValidExpoToken` in `backend/lib/push-utils.ts`, deep links and share URLs use `lib/config.ts` (`DEEP_LINK_BASE_URL`). Date formatting and `getTodayDateKey` still duplicated in a few places.
- **Consistency:** Good: tRPC errors, Zod input validation, and shared constants. Some `(as any)` and ad hoc types remain.
- **TypeScript strictness:** `tsc --noEmit` passes; strict null checks and full typings are not enforced everywhere.

**Reasoning:** Cleaner codebase and single source of truth for key utilities; duplication and typing could be tighter.

---

### 2. Performance — **6/10**

- **Re-renders:** List card components (`ChallengeCard24h`, `ChallengeCardFeatured`, `ChallengeRowCard`) wrapped with `React.memo`. No broad audit of every screen for unnecessary re-renders; many components still re-render on parent updates.
- **List optimization:** All FlatLists now have `keyExtractor` and `initialNumToRender` (5–20). Inline `renderItem` still used in discover and SharedGoalProgress; accountability/add and chat use stable `useCallback` renderItem.
- **API efficiency:** `refetchAll` / `refetchTodayCheckins` on focus in key screens (home, challenge detail, profile, activity); intentional for fresh data. No request deduplication or React Query–style cache; some redundancy possible.
- **Memory:** Timers, intervals, and subscriptions (AppState, Location, AccessibilityInfo) cleaned up in useEffect returns in timer, run, checkin, signup, ChallengeCard24h, challenge [id], AppContext, AuthContext. Rate-limit cleanup in backend.

**Reasoning:** Solid list and cleanup improvements; no systematic image sizing audit or API caching layer.

---

### 3. Stability — **6.5/10**

- **Error boundaries:** Root `ErrorBoundary` added in `_layout.tsx`; catches render errors and shows "Try again" with logging in __DEV__. No route-level boundaries for onboarding, auth, or payments.
- **Try/catch:** Many async flows (auth, profile, challenge detail, tasks, settings, activity) use try/catch; some still surface generic or silent failures.
- **User-facing errors:** tRPC errors mapped to user messages via `TRPC_ERROR_USER_MESSAGE`; Alert/Toast used in places. Not every path shows a clear, actionable message.
- **Navigation:** No dead-end or orphan routes identified; back and deep links wired. Leave-challenge flow commented out (backend support pending).

**Reasoning:** Single global boundary and existing backend TRPCError + client handling; critical flows could use more granular boundaries and consistent user messaging.

---

### 4. User Experience — **6/10**

- **Onboarding:** Flow exists: create-profile → onboarding → (day1-quick-win) → home. Friction points (e.g. mandatory steps, copy) not re-validated in this pass.
- **Navigation:** Tab + stack navigation; deep links for challenge, invite, profile. No broken back or dead ends found.
- **Feedback/loading:** Loading states and skeletons in discover, home, profile; some screens still lack clear loading or empty states.
- **Accessibility:** Limited audit; Celebration uses AccessibilityInfo; no broad a11y review.

**Reasoning:** Core flow is coherent; polish and consistency of loading/empty/error states vary.

---

### 5. Retention Mechanics — **5.5/10**

- **Triggers:** Push reminders, comeback mode, streak freeze, last stand; config in `lib/retention-config.ts`.
- **Actions:** Secure day, complete task, join challenge; clear CTAs.
- **Variable rewards:** Streak milestones, celebration; no randomized rewards.
- **Investment:** Profile, streak, history; social (respect, nudge) present.

**Reasoning:** Hook-style elements exist; variable rewards and habit loops could be stronger.

---

### 6. Growth Mechanics — **5/10**

- **Viral loops:** Share challenge, invite, profile, day secured, milestone, app; messages and links built in `lib/share.ts` and `lib/deep-links.ts`. Single base URL config (`DEEP_LINK_BASE_URL`) for production swap.
- **Deep linking:** Challenge, invite, profile deep links; `app.json` prefixes; ref param for attribution.
- **Sharing:** In-app share with copy; App Store URL still placeholder (idXXXXXX).
- **Network effects:** Team/shared-goal challenges; accountability partners; no strong viral coefficient (e.g. invite-only rewards) in code.

**Reasoning:** Sharing and deep links are in place and configurable; viral mechanics and store URLs need finishing for launch.

---

### 7. Monetization Readiness — **4.5/10**

- **Premium infrastructure:** Subscription types and product IDs in `lib/subscription.ts`; premium prompts and paywall modal exist.
- **Feature gating:** Some checks for subscription status; not fully audited across all premium features.
- **Payment integration:** RevenueCat/IAP wiring and server-side validation not fully verified in this pass.

**Reasoning:** Building blocks exist; end-to-end payment and gating need verification for beta.

---

### 8. Security — **7/10**

- **Authentication:** Supabase auth; session expiry handling; auth errors not leaked (TRPCError with safe messages).
- **RLS:** Backend uses Supabase with ownership guard `assertActiveChallengeOwnership` for checkins; production-readiness docs describe RLS and guard usage.
- **Input validation:** Zod with max lengths and UUIDs on critical IDs (challenges, checkins, profiles, etc.).
- **API protection:** Rate limiting and error reporting on backend; no client-side secrets in repo.

**Reasoning:** Strong backend hardening (ownership, TRPCError, validation); client-side auth and token handling assumed correct.

---

### 9. Scalability — **6/10**

- **Database:** Supabase/Postgres; RLS; indexes and migrations not re-audited in this pass.
- **API architecture:** tRPC over Hono; procedures and pagination (cursor/limit) on list endpoints.
- **Caching:** No app-level API cache (e.g. React Query); refetch-on-focus pattern. Backend has no distributed cache layer mentioned.

**Reasoning:** Structure supports growth; caching and connection pooling depend on deployment and load.

---

### 10. Beta Launch Readiness — **6/10**

- **Polish:** Dead code and duplicates reduced; lint and tsc clean; deep-link base URL configurable.
- **Critical bugs:** No new critical paths broken; ownership and validation in place from prior hardening.
- **MVP features:** Onboarding, auth, challenge create/join, day secure, tasks (timer, run, checkin, journal, photo), sharing, and error boundary in place. Leave challenge and some premium flows pending.

**Reasoning:** Ready for a controlled beta with known gaps (store URL, full payment verification, some UX polish).

---

## Overall score: **59/100**

(Sum of category scores 59.0; normalized to 100 scale: 59.)

---

## Top 5 strengths

1. **Security and validation** — Ownership guard on checkins, TRPCError and safe messages, Zod validation and length limits on inputs.
2. **Single source of truth** — Deep link and share base URL in `lib/config.ts`; formatTime and push token validation consolidated.
3. **Stability improvements** — Root ErrorBoundary, cleanup of timers/subscriptions/listeners, FlatList tuning and React.memo on list cards.
4. **Clean codebase** — Removed unused components and debug logging; tsc and lint pass.
5. **Retention and sharing hooks** — Streak, comeback mode, share flows, and deep links in place and configurable.

---

## Top 5 remaining risks

1. **Monetization and payments** — Premium/subscription flow and server-side receipt validation not fully verified; risk of revenue or entitlement bugs in beta.
2. **Error handling depth** — Single global error boundary; no flow-specific boundaries or consistent user messaging on every async failure.
3. **Placeholder and config** — App Store URL still idXXXXXX; production domain and env (e.g. EXPO_PUBLIC_DEEP_LINK_BASE_URL) must be set for real launch.
4. **Performance and scale** — No app-level API caching; refetch-on-focus may add load; image sizing and list inline renderItems could be optimized further.
5. **UX and accessibility** — Loading/empty/error states and a11y not uniformly polished; onboarding flow not re-validated for friction.

---

## Comparison to previous 52/100

| Area | Before (52) | After (59) |
|------|-------------|------------|
| **Code quality** | Dead code, duplication, hardcoded URLs | Fewer dead code paths, shared formatTime/push-utils/config; tsc/lint clean. |
| **Performance** | Unbounded lists, possible leaks | initialNumToRender, React.memo on list cards, timer/subscription cleanup. |
| **Stability** | No error boundary | Root ErrorBoundary; existing try/catch retained. |
| **Beta readiness** | Scattered URLs, debug logs | Single DEEP_LINK_BASE_URL, no debug console in challenges route. |

**What improved:** Cleaner codebase, fewer duplicates, configurable deep links, list and lifecycle optimizations, and a root error boundary. Security and validation were already strengthened in earlier backend passes; this round added app-side polish and consistency.

**What still needs work:** End-to-end payments/premium, granular error handling and UX consistency, replacing store placeholder, and optional caching and a11y passes for post-beta.
