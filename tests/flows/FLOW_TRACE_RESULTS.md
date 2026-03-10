# GRIIT Beta — Flow Trace Results (Prompt 1 Part A)

Code trace for 10 critical flows. PASS = path is sound; ISSUES = specific file:line or behavior noted.

---

## FLOW 1: Brand new user — first open to Home

**Sequence:** `_layout.tsx` → AuthRedirector → no user → segments not "auth"/"onboarding-questions" so no redirect (user is null) → user stays on auth. After onboarding-questions → `router.replace("/auth/signup")` → signup → AuthRedirector sees user, no profile (checkProfile) → `router.replace(ROUTES.CREATE_PROFILE)` → create-profile → upsert profile → then either `router.replace("/(tabs)")` (if pendingChallengeId) or `router.replace("/onboarding")` → onboarding.tsx → completes → `onboarding_completed` true → AuthRedirector → `router.replace(ROUTES.TABS)` → Home.

**Edge cases:**
- **Signup succeeds but redirect fails:** User is left on signup screen; next open AuthRedirector will see user and redirect to create-profile. **PASS.**
- **Profile creation partially saves:** Supabase upsert is atomic for the row. If only username saved and bio fails, error is returned and Alert shown; profile may still exist with previous data. **ISSUE:** create-profile does not refetch or re-check profile; user could see "Error" and retry. **LOW.**
- **User kills app mid-onboarding and reopens:** AuthRedirector runs again; hasProfile/onboardingCompleted from checkProfile (DB). If they completed profile but not onboarding, they go to /onboarding. **PASS.**
- **Authenticated but hasProfile check throws:** checkProfile catch sets hasProfile=true, onboardingCompleted=true (fail open). **PASS.**

**Result:** PASS (one minor: partial profile save leaves user on screen with error).

---

## FLOW 2: Returning user — login to Home

**Sequence:** AuthRedirector → no user → auth screen → login → Supabase auth → AuthRedirector sees user, checkProfile → hasProfile + onboardingCompleted → `router.replace(ROUTES.TABS)` → Home.

**Verify:** Session expired on next API call: `lib/trpc.ts` on 401 calls `notifySessionExpired()` and supabase.auth.signOut(); `lib/auth-expiry.ts` triggers listener → Alert "Session expired" + router.replace(ROUTES.AUTH). formatTRPCError handles UNAUTHORIZED with "Please sign in again." **PASS.**

**Result:** PASS.

---

## FLOW 3: Discover → Join a challenge

**Sequence:** discover.tsx → useInfiniteQuery("challenges.getFeatured") → challenges render → tap → router.push(ROUTES.CHALLENGE_ID(id)) → challenge/[id].tsx → useQuery("challenges.getById", { id }) → Join → commitment.tsx → trpcMutate("challenges.join", { challengeId }) → refetchAll() → navigate to tabs.

**Verify:**
- **getById returns null:** challenge/[id].tsx line ~762: `if (!challenge)` shows "Challenge not found" + Go Back. **PASS.**
- **challenges.join fails:** commitment.tsx catch shows `Alert.alert("Error", message)` — raw message, not formatTRPCError. **ISSUE:** commitment.tsx line 104–105 should use formatTRPCError for consistent titles/messages. **FIX RECOMMENDED.**
- **Mutation invalidates:** lib/mutations.ts useJoinChallenge onSuccess invalidates ["challenge", id], ["home"], ["profile"], ["discover"]. **PASS.**
- **Home shows new challenge:** refetchAll() in commitment triggers fetchProfile, fetchStats, fetchActiveChallenge, fetchStories; home uses activeChallenge from AppContext. **PASS.**

**Result:** ISSUES FOUND — commitment error handling (see Code fixes).

---

## FLOW 4: Secure the day (daily check-in)

**Sequence:** Home → completeTask (checkins.complete) → all required done → Secure day → AppContext.secureDay() → trpcMutate(TRPC.checkins.secureDay, { activeChallengeId }) → backend assertActiveChallengeOwnership → RPC secure_day → success → router.push("/secure-confirmation", params).

**Verify:**
- **assertActiveChallengeOwnership:** backend/trpc/guards.ts — checks active_challenges row, FORBIDDEN if user_id !== userId. **PASS.**
- **Already secured today:** backend/trpc/routes/checkins.ts secureDay: if RPC fails, checks day_secures for today; if present returns success with current streak (idempotent). **PASS.**
- **Backend error during secureDay:** AppContext.secureDay returns undefined on catch; Home handleSecureDay catch shows Alert "Couldn't secure day. Try again." (generic). **PASS** (user sees message; could use formatTRPCError if error passed through).
- **secure-confirmation params:** secure-confirmation.tsx lines 76–88: if !day || !streak || !totalDays shows "Not found" + Go back. **PASS.**
- **Home after secure:** refetch in handleSecureDay (leaderboardQuery.refetch, homeActiveQuery.refetch). **PASS.**

**Result:** PASS.

---

## FLOW 5: Create a challenge

**Sequence:** create.tsx → validateDraftTasks, buildCreatePayload (lib/create-challenge-helpers.ts) → Submit → trpcMutate(TRPC.challenges.create, input) → success → router.replace or push to success/challenge.

**Verify:**
- **validateDraftTasks:** create-challenge-helpers validates title, tasks length, task fields. **PASS.**
- **Creation fails (timeout/500):** create.tsx catch uses formatTRPCError and Alert. **PASS.**
- **Soft paywall:** create.tsx uses grit_create_count + PremiumPaywallModal; backend does not enforce create limit (client-only). **NOTE:** Scorecard already notes server-side enforcement not implemented.
- **Discover shows new challenge:** invalidateQueries(["discover"]) in useCreateChallenge onSuccess. **PASS.**

**Result:** PASS.

---

## FLOW 6: View own profile

**Sequence:** Profile tab → (tabs)/profile.tsx or navigate to own profile → profiles.getStats, profile data from AppContext/query.

**Verify:**
- **profiles.getStats:** AppContext fetchStats catch does not surface error (silent). **ISSUE:** Scorecard: "Replace silent .catch on critical flows with error state + Retry." Stats are used for streak/tier; if they fail, UI may show stale or zero. **NON-CRITICAL** (pull-to-refresh can retry).
- **Pull-to-refresh:** Profile tab refetchAll invalidates and refetches. **PASS.**

**Result:** PASS (stats failure is non-blocking; consider error banner in future).

---

## FLOW 7: View another user's profile (leaderboard / deep link)

**Sequence:** Tap username or open griit.app/profile/username → profile/[username].tsx → trpcQuery("profiles.getPublicByUsername", { username }) → differentiates own vs other (isOwnProfile → redirect to (tabs)/profile).

**Verify:**
- **Own vs other:** Lines 99–106: isOwnProfile → router.replace("/(tabs)/profile"). **PASS.**
- **Deep link:** app.json / _layout: expo-router handles /profile/[username]. **PASS.**
- **Username doesn't exist:** getPublicByUsername returns null; profile state stays null; lines 88–96 show "Profile not found". **PASS.**

**Result:** PASS.

---

## FLOW 8: Share a challenge

**Sequence:** Challenge detail → Share → lib/share shareChallenge → challengeDeepLink(challengeId, refUserId) from lib/deep-links.ts → DEEP_LINK_BASE_URL from config → share sheet → recipient opens URL → challenge/[id] with ref param → referrals.recordOpen (fire-and-forget).

**Verify:**
- **DEEP_LINK_BASE_URL:** lib/config.ts uses EXPO_PUBLIC_DEEP_LINK_BASE_URL or "https://griit.app". **PASS.**
- **Share button:** challenge/[id].tsx header Share2 TouchableOpacity, shareChallenge in onPress. **PASS.**
- **App not installed:** Universal link / App Store fallback is platform/config (not in code trace). **NOTE.**
- **getRefFromUrl:** lib/deep-links.ts parses ref from URL search params. **PASS.**

**Result:** PASS.

---

## FLOW 9: Streak at risk → Last stand → Comeback mode

**Sequence:** RETENTION_CONFIG (lib/retention-config.ts) → missedOneDayThreshold 1, comebackModeMinDays 2, etc. Backend getStats returns lastStandsAvailable; secureDay RPC awards last stand when eligible. Home shows Last Stand / comeback UI from stats and daysSinceLastSecure.

**Verify:**
- **RETENTION_CONFIG:** Present and used. **PASS.**
- **Backend last stand:** checkins.secureDay and getStats (profiles.getStats) compute last_stands_available. **PASS.**
- **No last stands:** UI shows disabled or "0 last stands" (from stats). **PASS.**
- **Comeback mode:** Home uses daysSinceLastSecure and RETENTION_CONFIG to show banner. **PASS.**

**Result:** PASS.

---

## FLOW 10: Push notification registration and delivery

**Sequence:** AppContext useEffect → registerPushTokenWithBackend (fire-and-forget, __DEV__ warn on catch). Morning: backend/lib/push-reminder.ts shouldSendMorningReminder; evening: shouldSendStreakAtRiskReminder.

**Verify:**
- **Expo Go:** registerPushTokenWithBackend is no-op or handles missing token; no crash. **PASS.**
- **Token change:** Re-register on each app load; backend overwrites token for user. **PASS.**
- **Timezone:** push-reminder uses user reminder_time and timezone (Intl) for morning/evening. **PASS.**

**Result:** PASS.

---

## Summary

| Flow | Result | Notes |
|------|--------|--------|
| 1. New user → Home | PASS | Partial profile save: user sees error, can retry |
| 2. Returning user login | PASS | Session expiry handled |
| 3. Discover → Join | ISSUES | commitment.tsx: use formatTRPCError |
| 4. Secure the day | PASS | Double-secure idempotent; params guarded |
| 5. Create challenge | PASS | Paywall client-only (known) |
| 6. View own profile | PASS | Stats fail silent (non-critical) |
| 7. View other profile | PASS | Deep link + not found handled |
| 8. Share challenge | PASS | |
| 9. Last stand / Comeback | PASS | |
| 10. Push registration | PASS | |

**Issues to fix:** 1 (commitment error handling).
