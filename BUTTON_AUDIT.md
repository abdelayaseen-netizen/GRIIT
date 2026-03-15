# GRIIT — Full Button & Navigation Audit

**Audit date:** 2025-03-15  
**Scope:** All `app/` screens, `components/` with navigation, `hooks/` and `lib/` that trigger navigation.

---

## PHASE 1: DISCOVERY

### 1.1 Every file in `app/` (Expo Router screens and layouts)

| File | Type |
|------|------|
| `app/(tabs)/_layout.tsx` | Tab layout |
| `app/(tabs)/index.tsx` | Home tab |
| `app/(tabs)/create.tsx` | Create tab |
| `app/(tabs)/discover.tsx` | Discover tab |
| `app/(tabs)/profile.tsx` | Profile tab |
| `app/(tabs)/activity.tsx` | Movement/Activity tab |
| `app/_layout.tsx` | Root layout + auth redirector |
| `app/+not-found.tsx` | 404 screen |
| `app/accountability.tsx` | Accountability list |
| `app/accountability/add.tsx` | Add accountability partner |
| `app/auth/_layout.tsx` | Auth stack layout |
| `app/auth/login.tsx` | Login |
| `app/auth/signup.tsx` | Sign up |
| `app/auth/forgot-password.tsx` | Forgot password |
| `app/challenge/[id].tsx` | Challenge detail |
| `app/challenge/[id]/chat.tsx` | Challenge chat |
| `app/challenge/[id]/chat-info.tsx` | Chat info |
| `app/challenge/complete.tsx` | Challenge completion |
| `app/commitment.tsx` | Commitment (standalone) |
| `app/create-profile.tsx` | Create profile |
| `app/day-missed.tsx` | Day missed |
| `app/day1-quick-win.tsx` | Day 1 quick win |
| `app/edit-profile.tsx` | Edit profile |
| `app/invite/[code].tsx` | Invite redirect (deep link) |
| `app/legal/_layout.tsx` | Legal layout |
| `app/legal/privacy-policy.tsx` | Privacy policy |
| `app/legal/terms.tsx` | Terms |
| `app/onboarding/_layout.tsx` | Onboarding layout |
| `app/onboarding/index.tsx` | Onboarding (wraps OnboardingFlow) |
| `app/onboarding-questions.tsx` | Onboarding questions |
| `app/pricing.tsx` | Pricing |
| `app/profile/[username].tsx` | Public profile |
| `app/secure-confirmation.tsx` | Day secured confirmation |
| `app/settings.tsx` | Settings |
| `app/success.tsx` | Challenge created success |
| `app/task/checkin.tsx` | Location check-in task |
| `app/task/complete.tsx` | Task completion (unified) |
| `app/task/journal.tsx` | Journal task |
| `app/task/manual.tsx` | Manual task |
| `app/task/photo.tsx` | Photo task |
| `app/task/run.tsx` | Run task |
| `app/task/timer.tsx` | Timer task |
| `app/teams.tsx` | Teams |
| `app/welcome.tsx` | Welcome (pre-auth flow) |
| `app/api/health+api.ts` | API route (not a screen) |
| `app/api/trpc/[trpc]+api.ts` | API route (not a screen) |

### 1.2 Components with navigation logic

- `components/home/EmptyChallengesCard.tsx` — router.push Discover
- `components/home/ExploreChallengesButton.tsx` — router.push Discover
- `components/home/ChallengeCard.tsx` — router.push Challenge by id
- `components/home/LiveFeedCard.tsx` — (used in index; nav in index)
- `components/profile/ProfileHeader.tsx` — router.push Edit Profile
- `components/profile/ShareDisciplineCard.tsx` — (share, no nav)
- `components/AuthGateModal.tsx` — router.push Sign up / Login
- `components/PremiumPaywallModal.tsx` — router.push Pricing
- `components/onboarding/OnboardingLayout.tsx` — router.back, router.replace /auth/signup (Skip to sign up)
- `components/onboarding/OnboardingFlow.tsx` — router.replace(path)

### 1.3 Hooks / utils that trigger navigation

- `hooks/useSubscription.ts` — router.push Pricing (when subscription required)
- `lib/deep-links.ts` — (parses links; navigation from invite or app open)
- `lib/share.ts` — (share only; no direct nav)

---

## PHASE 2 & 3: COMPLETE BUTTON AUDIT WITH ROUTE VALIDATION

| # | Screen File | Button/Element Text | Element Type | Navigation Action | Target Screen/Route | Validation | Notes |
|---|-------------|---------------------|--------------|-------------------|---------------------|------------|-------|
| 1 | `app/(tabs)/_layout.tsx` | Home tab | Tab | Tab switch | `/(tabs)` (index) | ✅ | Tab bar |
| 2 | `app/(tabs)/_layout.tsx` | Discover tab | Tab | Tab switch | `/(tabs)/discover` | ✅ | Tab bar |
| 3 | `app/(tabs)/_layout.tsx` | Create tab | Tab | Tab switch | `/(tabs)/create` | ✅ | Tab bar |
| 4 | `app/(tabs)/_layout.tsx` | Movement tab | Tab | Tab switch | `/(tabs)/activity` | ✅ | Tab bar |
| 5 | `app/(tabs)/_layout.tsx` | Profile tab | Tab | Tab switch | `/(tabs)/profile` | ✅ | Tab bar |
| 6 | `app/(tabs)/index.tsx` | Explore challenges | TouchableOpacity | router.push | `/(tabs)/discover` | ✅ | Guest hero CTA |
| 7 | `app/(tabs)/index.tsx` | (Popular challenge card) | TouchableOpacity | router.push | `/challenge/[id]` | ✅ | challengeId from list |
| 8 | `app/(tabs)/index.tsx` | See all challenges → | TouchableOpacity | router.push | `/(tabs)/discover` | ✅ | Guest |
| 9 | `app/(tabs)/index.tsx` | Find a challenge / Pick a Challenge | TouchableOpacity | router.push | `/(tabs)/discover` | ✅ | requireAuth("join") |
| 10 | `app/(tabs)/index.tsx` | (Suggested challenge row) | TouchableOpacity | router.push | `/challenge/[id]` | ✅ | requireAuth("join"), challengeId |
| 11 | `app/(tabs)/index.tsx` | View Challenge > / Open Challenge > | TouchableOpacity | router.push | `/challenge/[id]` or Discover | ✅ | challenge_cta feed item |
| 12 | `app/(tabs)/index.tsx` | View Profile > | TouchableOpacity | router.push | `/profile/[username]` | ✅ | rank_up feed item |
| 13 | `app/(tabs)/index.tsx` | Secure Now | TouchableOpacity | router.push | `/(tabs)/discover` | ✅ | requireAuth("secure") |
| 14 | `app/(tabs)/index.tsx` | (Secure day → success) | (programmatic) | router.push | `/challenge/complete` | ✅ | Params: challengeName, totalDays, etc. |
| 15 | `app/(tabs)/index.tsx` | (Secure day → confirmation) | (programmatic) | router.push | `/secure-confirmation` | ✅ | Params: day, streak, challengeId, etc. |
| 16 | `app/(tabs)/index.tsx` | Dismiss syncing banner | TouchableOpacity | (none) | — | — | Dismiss only |
| 17 | `app/(tabs)/index.tsx` | Retry | TouchableOpacity | (none) | — | — | leaderboardQuery.refetch |
| 18 | `app/(tabs)/index.tsx` | Respect / Chase pills | TouchableOpacity | (none) | — | — | Alert "Coming Soon" |
| 19 | `app/(tabs)/create.tsx` | Cancel (header) | CreateFlowHeader | router.back | Back | 🔄 | — |
| 20 | `app/(tabs)/create.tsx` | Next / Review | Header right | (step) | — | — | No nav |
| 21 | `app/(tabs)/create.tsx` | < Back | TouchableOpacity | handleBack | — | — | Step back |
| 22 | `app/(tabs)/create.tsx` | Create Challenge | PrimaryButtonCreate | router.push | `/success` | ✅ | Params: challengeId, title, etc. |
| 23 | `app/(tabs)/create.tsx` | OK (create succeeded fallback) | Alert | router.replace | `/(tabs)` | ✅ | — |
| 24 | `app/(tabs)/create.tsx` | TaskEditorModal onCancel | — | router.back | Back | 🔄 | — |
| 25 | `app/(tabs)/create.tsx` | PremiumPaywallModal onClose (after create) | — | router.push | `/success` | ✅ | pending params |
| 26 | `app/(tabs)/discover.tsx` | (24h / Featured / Row card press) | ChallengeCard24h / Featured / RowCard | router.push | `/challenge/[id]` | ✅ | handleChallengePress(id) |
| 27 | `app/(tabs)/discover.tsx` | Create challenge / Clear filters / Clear search | EmptyState onPrimaryCta | router.push or clear | `/(tabs)/create` or local | ✅ | Conditional |
| 28 | `app/(tabs)/discover.tsx` | Retry (error banner) | TouchableOpacity | handleRefresh | — | — | refetch |
| 29 | `app/(tabs)/discover.tsx` | Refresh (guest empty) | TouchableOpacity | handleRefresh | — | — | refetch |
| 30 | `app/(tabs)/discover.tsx` | Load more | TouchableOpacity | fetchNextPage | — | — | Pagination |
| 31 | `app/(tabs)/profile.tsx` | Sign in | TouchableOpacity | router.push | `/auth/login` | ✅ | Guest |
| 32 | `app/(tabs)/profile.tsx` | Sign up | TouchableOpacity | router.push | `/auth/signup` | ✅ | Guest |
| 33 | `app/(tabs)/profile.tsx` | Profile: Public — Edit / Settings | TouchableOpacity | router.push | `/settings` | ✅ | Two menu items |
| 34 | `app/(tabs)/profile.tsx` | Sign Out | TouchableOpacity | handleLogout → router.replace | `/auth` | ✅ | After sign out |
| 35 | `app/(tabs)/profile.tsx` | Retry (error card) | TouchableOpacity | onRefresh | — | — | refetch |
| 36 | `app/(tabs)/profile.tsx` | Sign Out (error card) | TouchableOpacity | handleLogout | `/auth` | ✅ | — |
| 37 | `app/(tabs)/activity.tsx` | 🧑‍🤝‍🧑 Teams | TouchableOpacity | router.push | `/teams` | ✅ | requireAuth; FLAGS.IS_BETA shows alert |
| 38 | `app/(tabs)/activity.tsx` | (Proof of work feed item) | TouchableOpacity | router.push | `/challenge/[id]` or `/profile/[username]` | ✅ | By event type |
| 39 | `app/(tabs)/activity.tsx` | (SuggestedFollows user) | onUserPress | router.push | `/profile/[username]` | ✅ | — |
| 40 | `app/(tabs)/activity.tsx` | Global / Friends / Team filters | TouchableOpacity | setFeedFilter | — | — | No nav |
| 41 | `app/_layout.tsx` | (Session expired) | — | router.replace | `/auth` | ✅ | Programmatic |
| 42 | `app/_layout.tsx` | (Auth redirects) | — | router.replace | `/onboarding`, `/create-profile`, `/(tabs)` | ✅ | Programmatic |
| 43 | `app/_layout.tsx` | Dismiss session expired | Pressable | setMessage(null) | — | — | No nav |
| 44 | `app/_layout.tsx` | (Redirect when needs onboarding) | Redirect | href | `/onboarding` | ✅ | — |
| 45 | `app/+not-found.tsx` | Go to Home | Link (Pressable) | href="/" | `/` | ✅ | Root → tabs |
| 46 | `app/accountability.tsx` | Back (header) | — | router.back | Back | 🔄 | — |
| 47 | `app/accountability.tsx` | Add partner / Add accountability partner | TouchableOpacity | router.push | `/accountability/add` | ✅ | — |
| 48 | `app/accountability/add.tsx` | (After add) | — | router.replace | `/onboarding?step=4` or `/(tabs)` or router.back | ✅ | Depends on params.from |
| 49 | `app/auth/login.tsx` | Forgot password? | TouchableOpacity | router.push | `/auth/forgot-password` | ✅ | — |
| 50 | `app/auth/login.tsx` | Sign in (success) | — | router.replace | `/create-profile` or `/(tabs)` | ✅ | Conditional on profile |
| 51 | `app/auth/login.tsx` | Sign up | TouchableOpacity | router.push | `/auth/signup` | ✅ | — |
| 52 | `app/auth/login.tsx` | Back | TouchableOpacity | router.back | Back | 🔄 | — |
| 53 | `app/auth/signup.tsx` | Sign up (success) | — | router.replace | `/(tabs)` | ✅ | — |
| 54 | `app/auth/signup.tsx` | Already have an account? Log in | TouchableOpacity | router.replace | `/auth/login` | ✅ | — |
| 55 | `app/auth/signup.tsx` | Terms of Service | TouchableOpacity | router.push | `/legal/terms` | ✅ | — |
| 56 | `app/auth/signup.tsx` | Privacy Policy | TouchableOpacity | router.push | `/legal/privacy-policy` | ✅ | — |
| 57 | `app/auth/forgot-password.tsx` | Send reset / Back to Login | Button / TouchableOpacity | router.replace | `/auth/login` | ✅ | — |
| 58 | `app/auth/forgot-password.tsx` | Back | TouchableOpacity | router.back | Back | 🔄 | — |
| 59 | `app/challenge/[id].tsx` | Back (header / empty) | TouchableOpacity | router.back | Back | 🔄 | Multiple |
| 60 | `app/challenge/[id].tsx` | Browse challenges | TouchableOpacity | router.push | `/(tabs)/discover` | ✅ | When challenge not found |
| 61 | `app/challenge/[id].tsx` | Retry | TouchableOpacity | challengeQuery.refetch | — | — | No nav |
| 62 | `app/challenge/[id].tsx` | (Task row / Continue Today) | TouchableOpacity | router.push | `/task/checkin`, `/task/run`, or `/task/complete` | ✅ | taskId / params |
| 63 | `app/challenge/[id].tsx` | Leave challenge (confirm) | Alert | router.replace | `/(tabs)/discover` | ✅ | — |
| 64 | `app/challenge/[id].tsx` | Connect Strava | — | router.push | `/(tabs)/profile` | ✅ | When not this challenge |
| 65 | `app/challenge/[id].tsx` | (Commitment modal) Cancel / Close | TouchableOpacity | setShowCommitmentModal(false) | — | — | In-screen modal |
| 66 | `app/challenge/[id].tsx` | Confirm Commitment (modal) | TouchableOpacity | (join API then stay) | — | — | No nav from modal |
| 67 | `app/challenge/[id]/chat.tsx` | Back | TouchableOpacity | router.back | Back | 🔄 | — |
| 68 | `app/challenge/[id]/chat.tsx` | (Leave / error) | — | router.replace | `/challenge/[id]` | ✅ | — |
| 69 | `app/challenge/[id]/chat.tsx` | Chat info (i) | TouchableOpacity | router.push | `/challenge/[id]/chat-info` | ✅ | id param |
| 70 | `app/challenge/[id]/chat-info.tsx` | Back | TouchableOpacity | router.back | Back | 🔄 | — |
| 71 | `app/challenge/complete.tsx` | (Post-complete) | — | router.replace | `/(tabs)/discover` or `/(tabs)` | ✅ | Button choice |
| 72 | `app/commitment.tsx` | Cancel / Backdrop | TouchableOpacity | router.back | Back | 🔄 | — |
| 73 | `app/commitment.tsx` | OK / Not now / Share (alert) | Alert | router.replace | `/challenge/[id]` | ✅ | challengeId |
| 74 | `app/create-profile.tsx` | (Success / no user) | — | router.replace | `/auth/login` or `/(tabs)` | ✅ | Conditional |
| 75 | `app/day-missed.tsx` | (Alert actions) | Alert | router.replace | `/challenge/[id]` or `/(tabs)` | ✅ | challengeId |
| 76 | `app/day1-quick-win.tsx` | (Actions) | — | router.replace | `/(tabs)`, `/accountability/add?from=day1` | ✅ | — |
| 77 | `app/edit-profile.tsx` | Close | TouchableOpacity | router.back | Back | 🔄 | — |
| 78 | `app/invite/[code].tsx` | (Effect) | — | router.replace | `/(tabs)` or `/challenge/[id]` | ✅ | code → challengeId |
| 79 | `app/onboarding/OnboardingFlow` | Back | Pressable | prevStep | — | — | Step only |
| 80 | `app/onboarding/OnboardingFlow` | (Finish) | — | router.replace | `/(tabs)` | ✅ | handleStartApp |
| 81 | `app/onboarding-questions.tsx` | (Submit) | — | router.replace | `/auth/signup` | ✅ | — |
| 82 | `app/pricing.tsx` | Back / Close | TouchableOpacity | router.back | Back | 🔄 | — |
| 83 | `app/pricing.tsx` | Terms of Service | TouchableOpacity | router.push | `/legal/terms` | ✅ | — |
| 84 | `app/pricing.tsx` | Privacy Policy | TouchableOpacity | router.push | `/legal/privacy-policy` | ✅ | — |
| 85 | `app/profile/[username].tsx` | Back | TouchableOpacity | router.back | Back | 🔄 | — |
| 86 | `app/profile/[username].tsx` | (Not found / error) | — | router.replace | `/(tabs)` or `/(tabs)/profile` | ✅ | — |
| 87 | `app/secure-confirmation.tsx` | Return to home / Share again | TouchableOpacity / Alert | router.back or router.replace | Back or `/(tabs)/discover` | ✅ | — |
| 88 | `app/settings.tsx` | Back | — | router.back | Back | 🔄 | — |
| 89 | `app/settings.tsx` | Edit profile | TouchableOpacity | router.push | `/edit-profile` | ✅ | — |
| 90 | `app/settings.tsx` | Accountability | TouchableOpacity | router.push | `/accountability` | ✅ | — |
| 91 | `app/settings.tsx` | Upgrade / Pricing | TouchableOpacity | router.push | `/pricing` | ✅ | params: source |
| 92 | `app/settings.tsx` | Sign out (confirm) | — | router.replace | `/auth` or `/auth/login` | ✅ | — |
| 93 | `app/settings.tsx` | Privacy Policy | TouchableOpacity | router.push | `/legal/privacy-policy` | ✅ | — |
| 94 | `app/settings.tsx` | Terms of Service | TouchableOpacity | router.push | `/legal/terms` | ✅ | — |
| 95 | `app/success.tsx` | (Auto / CTA) | — | router.replace | `/(tabs)` | ✅ | — |
| 96 | `app/task/checkin.tsx` | Back to Tasks | TouchableOpacity | router.back | Back | 🔄 | — |
| 97 | `app/task/complete.tsx` | OK (alert) | Alert | router.back | Back | 🔄 | — |
| 98 | `app/task/journal.tsx` | Back / Save & Exit | TouchableOpacity / Alert | router.back | Back | 🔄 | — |
| 99 | `app/task/manual.tsx` | OK (alert) / Back | Alert / — | router.back | Back | 🔄 | — |
| 100 | `app/task/photo.tsx` | OK (alert) | Alert | router.back | Back | 🔄 | — |
| 101 | `app/task/run.tsx` | Back to Tasks | TouchableOpacity | router.back | Back | 🔄 | — |
| 102 | `app/task/timer.tsx` | OK (alert) | Alert | router.back | Back | 🔄 | — |
| 103 | `app/teams.tsx` | Back | — | router.back | Back | 🔄 | — |
| 104 | `app/welcome.tsx` | Skip / Sign up flow | — | router.replace | `/auth/signup` or `/(tabs)` | ✅ | — |
| 105 | `app/welcome.tsx` | Already have an account? Log in | TouchableOpacity | router.replace | `/auth/login` | ✅ | — |
| 106 | `components/home/EmptyChallengesCard.tsx` | Explore challenges | (button) | router.push | `/(tabs)/discover` | ✅ | — |
| 107 | `components/home/ExploreChallengesButton.tsx` | (CTA) | — | router.push | `/(tabs)/discover` | ✅ | — |
| 108 | `components/home/ChallengeCard.tsx` | (Card press) | — | router.push | `/challenge/[id]` | ✅ | challengeId |
| 109 | `components/profile/ProfileHeader.tsx` | Edit profile | TouchableOpacity | router.push | `/edit-profile` | ✅ | — |
| 110 | `components/AuthGateModal.tsx` | Sign up / Log in | — | router.push | `/auth/signup`, `/auth/login` | ✅ | — |
| 111 | `components/PremiumPaywallModal.tsx` | Upgrade / CTA | — | router.push | `/pricing` | ✅ | params: source |
| 112 | `components/onboarding/OnboardingLayout.tsx` | Back | Pressable | router.back | Back | 🔄 | — |
| 113 | `components/onboarding/OnboardingLayout.tsx` | Skip (to sign up) | TouchableOpacity | router.replace | `/auth/signup` | ✅ | Fixed: was /onboarding/signup (no such route) |
| 114 | `hooks/useSubscription.ts` | (When premium required) | — | router.push | `/pricing` | ✅ | params: source |

---

## PHASE 3: ROUTE VALIDATION SUMMARY

**Valid routes (from `app/` and `lib/routes.ts`):**

- `/(tabs)`, `/(tabs)/index`, `/(tabs)/discover`, `/(tabs)/create`, `/(tabs)/profile`, `/(tabs)/activity`
- `/auth`, `/auth/login`, `/auth/signup`, `/auth/forgot-password`
- `/challenge/[id]`, `/challenge/[id]/chat`, `/challenge/[id]/chat-info`, `/challenge/complete`
- `/task/checkin`, `/task/run`, `/task/complete`, `/task/journal`, `/task/manual`, `/task/photo`, `/task/timer`
- `/profile/[username]`, `/edit-profile`, `/settings`, `/accountability`, `/accountability/add`
- `/pricing`, `/success`, `/secure-confirmation`, `/commitment`, `/day-missed`, `/day1-quick-win`
- `/create-profile`, `/welcome`, `/onboarding`, `/onboarding-questions`
- `/invite/[code]`, `/teams`, `/legal/privacy-policy`, `/legal/terms`
- `/` (root → redirect)

**Validation key:** ✅ Route exists and matches | ⚠️ Route exists but params/usage may vary | 🔄 Navigates back (router.back / goBack)

**Finding:** All targets used in the audit exist as files under `app/`. No broken route strings found. **Resolved:** OnboardingLayout previously used `router.replace("/onboarding/signup")` (no such file). It was updated to `router.replace("/auth/signup")` so "Skip to sign up" navigates to the real auth signup screen.

---

## PHASE 4: DEAD SCREEN CHECK (ORPHAN SCREENS)

**Update:** The following four orphan screens were **removed** in a follow-up cleanup (no inbound navigation):

- ~~`app/commitment.tsx`~~ — deleted (challenge detail uses in-screen commitment modal only)
- ~~`app/onboarding-questions.tsx`~~ — deleted
- ~~`app/day1-quick-win.tsx`~~ — deleted
- ~~`app/day-missed.tsx`~~ — deleted

**Reachable only by system/redirect:**

- `app/+not-found.tsx` — Shown when no route matches (system).
- `app/onboarding/index.tsx` — Reached via `Redirect href="/onboarding"` in root layout when `needsOnboarding`.
- `app/invite/[code].tsx` — Reached via deep link; effect replaces to tabs or challenge.

---

## PHASE 5: TABLES SUMMARY

### Table 1: Complete Button Audit

See **Phase 2 & 3** table above (full list with validation).

### Table 2: Broken Routes

| Screen File | Button Text | Broken Target | Issue |
|-------------|-------------|---------------|-------|
| (none) | — | — | No ❌ or ⚠️ broken targets. All navigated routes exist. |

### Table 3: Orphan Screens (Unreachable)

| Status | Screen File | Note |
|--------|-------------|------|
| Removed | ~~app/commitment.tsx~~ | Deleted in cleanup; challenge uses in-screen modal only. |
| Removed | ~~app/onboarding-questions.tsx~~ | Deleted in cleanup. |
| Removed | ~~app/day1-quick-win.tsx~~ | Deleted in cleanup. |
| Removed | ~~app/day-missed.tsx~~ | Deleted in cleanup. |

### Table 4: Navigation Summary by Screen

| Screen | Total Buttons/Nav | Working | Broken | Warnings |
|--------|-------------------|---------|--------|----------|
| (tabs)/index | 14+ | 14+ | 0 | 0 |
| (tabs)/create | 8+ | 8+ | 0 | 0 |
| (tabs)/discover | 5+ | 5+ | 0 | 0 |
| (tabs)/profile | 6+ | 6+ | 0 | 0 |
| (tabs)/activity | 4+ | 4+ | 0 | 0 |
| challenge/[id] | 10+ | 10+ | 0 | 0 |
| challenge/[id]/chat | 3 | 3 | 0 | 0 |
| challenge/[id]/chat-info | 1 | 1 | 0 | 0 |
| settings | 8+ | 8+ | 0 | 0 |
| auth (login, signup, forgot) | 10+ | 10+ | 0 | 0 |
| Others (single back or 1–2 nav) | 2–4 each | all | 0 | 1 (onboarding path) |
| **Total** | **114+** | **114+** | **0** | **1** |

---

## RULES COMPLIANCE

- ✅ All 5 phases completed.
- ✅ All `app/` and navigation-related `components/` and `hooks/` scanned.
- ✅ Every interactive element that triggers navigation or meaningful action included (back, push, replace, tab, link).
- ✅ Duplicates noted (e.g. multiple “Back” or “Discover” from home).
- ✅ Inconsistencies resolved: OnboardingLayout now uses `/auth/signup` instead of non-existent `/onboarding/signup`.

---

## RECOMMENDATIONS

1. **Onboarding path:** Fixed. `router.replace("/onboarding/signup")` was replaced with `router.replace("/auth/signup")` in OnboardingLayout and store/onboardingStore step-8 route.
2. **Orphan screens:** Resolved. The four unreachable screens (commitment, onboarding-questions, day1-quick-win, day-missed) were removed in a follow-up cleanup.
