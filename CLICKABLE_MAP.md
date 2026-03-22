# GRIIT — Complete Clickable Element Map

**Audit date:** Post Phase 1 + Phase 2 fixes  
**Scope:** Every tap/click/press in `app/` and `components/` — traced to exact destination.

> **Sprint 6 note:** This map is a historical audit. Routes **`/success`**, **`/secure-confirmation`**, and standalone **`/teams`** were removed in Sprint 6 Phase 1 (dead code). Prefer **`/(tabs)`**, **`challenge/complete`**, and **Teams tab** `/(tabs)/teams` when reconciling with the current app.

---

## PAGE: Home
**File:** `app/(tabs)/index.tsx`  
**How user gets here:** Tab bar → Home, or redirect after login/signup.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Syncing banner dismiss (×) | TouchableOpacity | Top banner | `onDismiss()` | Stays on page (dismiss banner) | ✅ |
| 2 | SuggestedFollows user row | TouchableOpacity (from component) | Suggested follows | `router.push(ROUTES.PROFILE_USERNAME(u.username))` | Profile by username | ✅ |
| 3 | Explore / Discover (empty) | TouchableOpacity | Empty state | `router.push(ROUTES.TABS_DISCOVER)` | Discover tab | ✅ |
| 4 | Active challenge card | Card press | Active challenges | `router.push(ROUTES.CHALLENGE_ID(challenge.id))` | Challenge Detail | ✅ |
| 5 | Secure Day / Complete flow | TouchableOpacity | Daily status CTA | `handleSecureDay` → secureDay mutation then `router.push(ROUTES.SECURE_CONFIRMATION)` or `ROUTES.CHALLENGE_COMPLETE` | Secure Confirmation or Challenge Complete | ✅ |
| 6 | Explore challenges (section) | TouchableOpacity | Section | `router.push(ROUTES.TABS_DISCOVER)` | Discover tab | ✅ |
| 7 | Challenge card (join) | TouchableOpacity | ActiveChallenges list | `requireAuth("join", () => router.push(ROUTES.CHALLENGE_ID(c.id)))` | Challenge Detail | ✅ |
| 8 | Respect pill (secured card) | TouchableOpacity | Live feed card | Haptics + Alert "Coming Soon" | Stays on page | ✅ |
| 9 | Chase pill (secured card) | TouchableOpacity | Live feed card | Haptics + Alert "Coming Soon" | Stays on page | ✅ |
| 10 | challenge_cta "View/Open Challenge" | TouchableOpacity | Live feed | `challengeId ? router.push(ROUTES.CHALLENGE_ID(challengeId)) : router.push(ROUTES.TABS_DISCOVER)` | Challenge Detail or Discover | ✅ |
| 11 | View Profile > (rank_up) | TouchableOpacity | Live feed card | `router.push(ROUTES.PROFILE_USERNAME(r.user))` | Profile by username | ✅ |
| 12 | Retry (leaderboard error) | TouchableOpacity | Error card | `leaderboardQuery.refetch()` | Stays on page | ✅ |
| 13 | Secure Now (your position) | TouchableOpacity | Card | `requireAuth("secure", () => router.push(ROUTES.TABS_DISCOVER))` | Discover tab | ✅ |
| 14 | Movement card (empty) | TouchableOpacity | Card | `router.push(ROUTES.TABS_ACTIVITY)` | Activity tab | ✅ |
| 15 | First-session banner dismiss | TouchableOpacity | Banner | `setShowFirstSessionBanner(false)` | Stays on page | ✅ |
| 16 | Modals (weekly goal, share, freeze, last stand, streak lost, milestone) | TouchableOpacity | Modal buttons | Set state / share / dismiss | Stays on page or share | ✅ |
| 17 | Pull-to-refresh | RefreshControl | ScrollView | `refetch` queries | Stays on page | ✅ |

---

## PAGE: Discover
**File:** `app/(tabs)/discover.tsx`  
**How user gets here:** Tab bar → Discover.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | SearchBar clear | Callback | Search row | `clearSearch()` | Stays on page | ✅ |
| 2 | Category chips (All, Fitness, etc.) | FilterChip | Category row | `handleCategoryPress(cat.key)` | Stays on page | ✅ |
| 3 | 24H challenge card | ChallengeCard24h (TouchableOpacity) | Horizontal list | Parent: `router.push(ROUTES.CHALLENGE_ID(c.id))` | Challenge Detail | ✅ |
| 4 | Featured challenge card | ChallengeCardFeatured | List | Parent: `router.push(ROUTES.CHALLENGE_ID(c.id))` | Challenge Detail | ✅ |
| 5 | More challenges row | ChallengeRowCard | List | Parent: `router.push(ROUTES.CHALLENGE_ID(c.id))` | Challenge Detail | ✅ |
| 6 | Retry (error banner) | TouchableOpacity | Banner | `handleRefresh` | Stays on page | ✅ |
| 7 | Empty primary CTA | TouchableOpacity | EmptyState | Clear search/filters or `router.push(ROUTES.TABS_CREATE)` | Create tab or stay | ✅ |
| 8 | Empty secondary "Refresh" | TouchableOpacity | EmptyState | `handleRefresh` | Stays on page | ✅ |
| 9 | Load more | TouchableOpacity | Bottom | `featuredQuery.fetchNextPage()` | Stays on page | ✅ |
| 10 | Pull-to-refresh | RefreshControl | ScrollView | `handleRefresh` | Stays on page | ✅ |

---

## PAGE: Create Challenge
**File:** `app/(tabs)/create.tsx`  
**How user gets here:** Tab bar → Create (center +).

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Cancel | CreateFlowHeader TouchableOpacity | Top-left | `router.back()` | ⬅️ Previous screen | ✅ |
| 2 | Next / Review | CreateFlowHeader TouchableOpacity | Top-right | `handleNext` (step++) | Stays on page | ✅ |
| 3 | Challenge type cards | ChallengeTypeCard | Step 1 | `setChallengeType(type.id)` | Stays on page | ✅ |
| 4 | Duration pills | DurationPill | Step 1 | `setDurationDays(d)` etc. | Stays on page | ✅ |
| 5 | Replay policy / toggles | TouchableOpacity | Step 1 | `setReplayPolicy` / setRequireSameRules | Stays on page | ✅ |
| 6 | Add purpose (optional) | TouchableOpacity | Step 1 | `setShowPurposeSection(true)` | Stays on page | ✅ |
| 7 | Category tags | CategoryTag | Step 1 | Toggle categories | Stays on page | ✅ |
| 8 | Pack cards | TouchableOpacity | Step 2 | `setTasks(pack.buildTasks())` | Stays on page | ✅ |
| 9 | Task row (edit) | TouchableOpacity | Step 2 | `handleEditTask(task)` → TaskEditorModal | Modal | ✅ |
| 10 | Delete task (Trash2) | TouchableOpacity | Step 2 | `handleDeleteTask(task.id)` | Stays on page | ✅ |
| 11 | + Add Task | TouchableOpacity | Step 2 | `setShowTaskBuilder(true)` | Modal | ✅ |
| 12 | Visibility cards | TouchableOpacity | Step 3 | `setVisibility(opt.value)` | Stays on page | ✅ |
| 13 | < Back | TouchableOpacity | Footer | `handleBack` (step--) | Stays on page | ✅ |
| 14 | Next: Add Tasks / Review | PrimaryButtonCreate | Footer | `handleNext` | Stays on page | ✅ |
| 15 | Create Challenge | PrimaryButtonCreate | Footer | `handleCreate` → trpc create then `router.push(ROUTES.SUCCESS, params)` or paywall then success | Success screen | ✅ |
| 16 | Recovery modal Retry / Back to Review | TouchableOpacity | Modal | `handleRetryFromModal` / `handleDismissRecovery` | Stays on page | ✅ |
| 17 | Alert "OK" (create success no id) | Alert button | — | `router.replace(ROUTES.TABS)` | 🚩 HOME | ✅ (intentional) |

---

## PAGE: Movement / Activity
**File:** `app/(tabs)/activity.tsx`  
**How user gets here:** Tab bar → Movement.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Teams button | TouchableOpacity | Header right | `handleTeamsPress` → requireAuth then `router.push(ROUTES.TEAMS)` or Alert (beta) | Teams screen | ✅ |
| 2 | Global / Friends / Team pills | TouchableOpacity | Filter row | `setFeedFilter("global"|"friends"|"team")` | Stays on page | ✅ |
| 3 | Respect (feed row) | TouchableOpacity | Movement feed | `onGiveRespect(entry.userId)` → API | Stays on page | ✅ |
| 4 | Nudge (feed row) | TouchableOpacity | Movement feed | `onGiveNudge(entry.userId)` → API | Stays on page | ✅ |
| 5 | Show more / Show less | TouchableOpacity | Recent | `setExpanded(!expanded)` | Stays on page | ✅ |
| 6 | Proof of Work feed item | TouchableOpacity | Feed | `router.push(ROUTES.CHALLENGE_ID(e.challenge_id))` or `ROUTES.PROFILE_USERNAME(e.username)` | Challenge Detail or Profile | ✅ |
| 7 | Load more (feed) | TouchableOpacity | Bottom | `fetchNextPage()` | Stays on page | ✅ |
| 8 | SuggestedFollows user | (component) | Friends filter | `router.push(ROUTES.PROFILE_USERNAME(u.username))` | Profile by username | ✅ |
| 9 | Pull-to-refresh | RefreshControl | ScrollView | `onRefresh` | Stays on page | ✅ |

---

## PAGE: Profile
**File:** `app/(tabs)/profile.tsx`  
**How user gets here:** Tab bar → Profile.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Sign in (guest) | TouchableOpacity | Guest card | `router.push(ROUTES.AUTH_LOGIN)` | Login | ✅ |
| 2 | Sign up (guest) | TouchableOpacity | Guest card | `router.push(ROUTES.AUTH_SIGNUP)` | Signup | ✅ |
| 3 | Retry (error) | TouchableOpacity | Error card | `onRefresh()` | Stays on page | ✅ |
| 4 | Sign Out (error card) | TouchableOpacity | Error card | `handleLogout()` | Auth (replace) | ✅ |
| 5 | ✏️ Edit | ProfileHeader | Header | `router.push(ROUTES.EDIT_PROFILE)` | Edit Profile | ✅ |
| 6 | 🔗 Share | ProfileHeader | Header | `handleShare()` | Share sheet | ✅ |
| 7 | Profile: Public / Edit row | TouchableOpacity | Menu | `router.push(ROUTES.SETTINGS)` | Settings | ✅ |
| 8 | Settings row | TouchableOpacity | Menu | `router.push(ROUTES.SETTINGS)` | Settings | ✅ |
| 9 | Sign Out | TouchableOpacity | Danger | `handleLogout()` → `router.replace(ROUTES.AUTH)` | Auth | ✅ |
| 10 | Strava Connect/Disconnect, View activities | TouchableOpacity | Integrations | Handlers (API / toggle) | Stays on page | ✅ |
| 11 | Pull-to-refresh | RefreshControl | ScrollView | `onRefresh` | Stays on page | ✅ |

---

## PAGE: Challenge Detail
**File:** `app/challenge/[id].tsx`  
**How user gets here:** Tap challenge card from Home, Discover, or Activity.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back (ChevronLeft) | TouchableOpacity | Header | `router.back()` | ⬅️ Previous screen | ✅ |
| 2 | Task: Connect Strava / Verify / Start | TouchableOpacity | Task CTA | `onConnectStrava` / `onVerifyStrava` / `onStart` → profile or task screen | Profile or task flow | ✅ |
| 3 | Go back (empty state) | TouchableOpacity | Empty | `router.back()` | ⬅️ Previous screen | ✅ |
| 4 | Retry (empty) | TouchableOpacity | Empty | `challengeQuery.refetch()` | Stays on page | ✅ |
| 5 | Browse challenges (empty) | TouchableOpacity | Empty | `router.push(ROUTES.TABS_DISCOVER)` | Discover tab | ✅ |
| 6 | Leave Challenge | TouchableOpacity | Header/sheet | `handleLeave` → Alert Leave → leaveMutation then **router.replace(ROUTES.TABS_DISCOVER)** | Discover tab (FIXED: was Home) | ✅ |
| 7 | Primary CTA (Commit/Start/Continue Today) | TouchableOpacity | Bottom | isJoined ? `router.push(ROUTES.TABS)` : handleJoin / showGate | 🚩 HOME when joined (intentional: show active on home) | ✅ |
| 8 | Commitment modal overlay / Cancel / Not now | TouchableOpacity | Modal | `setShowCommitmentModal(false)` or dismiss | Stays on page | ✅ |
| 9 | Commitment checkbox | TouchableOpacity | Modal | `setCommitmentUnderstood((v) => !v)` | Stays on page | ✅ |
| 10 | I'm in (commitment) | TouchableOpacity | Modal | `handleCommitmentConfirm` → join then replace TABS | 🚩 HOME (intentional after join) | ✅ |
| 11 | Back to Home (team failed) | TouchableOpacity | Team failed CTA | `router.replace(ROUTES.TABS)` | 🚩 HOME (intentional; label says Back to Home) | ✅ |
| 12 | More (⋯) / Share / Invite | TouchableOpacity / Alert | Header | Share / clipboard | Stays on page | ✅ |

---

## PAGE: Commitment
**File:** `app/commitment.tsx`  
**How user gets here:** From Challenge Detail after tapping Start/Commit.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Backdrop | TouchableOpacity | Full screen | `handleCancel` → `router.back()` | ⬅️ Challenge Detail | ✅ |
| 2 | Close (X) | TouchableOpacity | Header | `handleCancel` → `router.back()` | ⬅️ Challenge Detail | ✅ |
| 3 | Confirm Commitment | TouchableOpacity | CTA | `handleConfirm` → join API then `router.replace(ROUTES.TABS)` | 🚩 HOME (intentional) | ✅ |
| 4 | Cancel | TouchableOpacity | Secondary | `handleCancel` → `router.back()` | ⬅️ Challenge Detail | ✅ |
| 5 | Alert OK / Not now (after join error/success) | Alert buttons | — | `router.replace(ROUTES.TABS)` | 🚩 HOME | ✅ |

---

## PAGE: Settings
**File:** `app/settings.tsx`  
**How user gets here:** Profile → Settings row.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back | TouchableOpacity | Header | `handleBack` → `router.back()` | ⬅️ Profile | ✅ |
| 2 | Visibility pills | TouchableOpacity | Sections | `onChange(opt.key)` (profile/challenge/activity) | Stays on page + API | ✅ |
| 3 | Edit profile row | TouchableOpacity | Menu | `router.push(ROUTES.EDIT_PROFILE)` | Edit Profile | ✅ |
| 4 | Accountability row | TouchableOpacity | Menu | `router.push(ROUTES.ACCOUNTABILITY)` | Accountability | ✅ |
| 5 | Reminder time presets | TouchableOpacity | Notifications | `handleReminderTime(p.value)` | Stays on page + API | ✅ |
| 6 | Subscription / Manage / Restore | TouchableOpacity | Section | `router.push(ROUTES.PRICING)` or restorePurchases | Pricing or stay | ✅ |
| 7 | Sign Out | TouchableOpacity | Account | Sign out then `router.replace(ROUTES.AUTH)` | Auth | ✅ |
| 8 | Delete account / Modal | TouchableOpacity | Modal | Confirm → delete then `router.replace(ROUTES.AUTH_LOGIN)` | Login | ✅ |
| 9 | Privacy Policy / Terms | TouchableOpacity | Legal | `router.push(ROUTES.LEGAL_PRIVACY)` / `ROUTES.LEGAL_TERMS` | Legal pages | ✅ |

---

## PAGE: Success
**File:** `app/success.tsx`  
**How user gets here:** After creating challenge or completing flow.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Continue | TouchableOpacity | CTA | `handleContinue` → `router.replace(ROUTES.TABS)` | 🚩 HOME (intentional) | ✅ |
| 2 | Share | TouchableOpacity | Secondary | `handleShare` | Share sheet | ✅ |

---

## PAGE: Login
**File:** `app/auth/login.tsx`  
**How user gets here:** Auth redirect, or Profile (guest) Sign in, or Welcome "Log in".

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back | TouchableOpacity | Header | `router.back()` | ⬅️ Previous | ✅ |
| 2 | Forgot password? | TouchableOpacity | Form | `router.push("/auth/forgot-password")` | Forgot Password | ✅ |
| 3 | Sign in (email) | Button/TouchableOpacity | Form | `handleSignIn` → then `router.replace("/create-profile")` or `router.replace("/(tabs)")` | Create Profile or 🚩 HOME | ✅ |
| 4 | Continue with Apple | Apple auth | Form | `handleApple` → replace create-profile or tabs | Create Profile or HOME | ✅ |
| 5 | Continue with Google | TouchableOpacity | Form | OAuth | — | ✅ |
| 6 | Sign up (link) | TouchableOpacity | Footer | `router.push("/auth/signup")` | Signup | ✅ |

---

## PAGE: Signup
**File:** `app/auth/signup.tsx`  
**How user gets here:** Login "Sign up", Welcome, or onboarding.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back | TouchableOpacity | Header | `router.back()` | ⬅️ Login | ✅ |
| 2 | Create account | TouchableOpacity | Form | `handleSignUp` → then `router.replace(ROUTES.TABS)` | 🚩 HOME | ✅ |
| 3 | Sign in (footer) | TouchableOpacity | Footer | `router.replace(ROUTES.AUTH_LOGIN)` | Login | ✅ |
| 4 | Terms / Privacy links | TouchableOpacity | Footer | `router.push(ROUTES.LEGAL_TERMS)` / LEGAL_PRIVACY | Legal pages | ✅ |

---

## PAGE: Teams
**File:** `app/teams.tsx`  
**How user gets here:** Activity → Teams button.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back | TouchableOpacity | Header | `handleBack` → `router.back()` | ⬅️ Activity | ✅ |
| 2 | + Create a Team | TouchableOpacity | Content | Haptics + Alert "Coming Soon" | Stays on page | ✅ |
| 3 | Join with Code | TouchableOpacity | Content | Haptics + Alert "Coming Soon" | Stays on page | ✅ |

---

## PAGE: Day Missed
**File:** `app/day-missed.tsx`  
**How user gets here:** Deep link or flow when user missed a day.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | (CTA to Home) | TouchableOpacity | — | `router.push(ROUTES.TABS)` | 🚩 HOME | ✅ |

---

## PAGE: Challenge Complete
**File:** `app/challenge/complete.tsx`  
**How user gets here:** After completing a challenge (flow from task complete or home).

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Browse more / Discover | — | — | `router.replace(ROUTES.TABS_DISCOVER)` | Discover | ✅ |
| 2 | Home | — | — | `router.replace(ROUTES.TABS_HOME)` | 🚩 HOME | ✅ |

---

## PAGE: Secure Confirmation
**File:** `app/secure-confirmation.tsx`  
**How user gets here:** After securing day (from Home).

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Continue / CTA | TouchableOpacity | — | `router.replace(ROUTES.TABS_DISCOVER)` | Discover | ✅ |

---

## PAGE: Pricing
**File:** `app/pricing.tsx`  
**How user gets here:** Settings (non-premium) or in-app CTA.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back | TouchableOpacity | Header | `handleBack` → `router.back()` | ⬅️ Previous | ✅ |
| 2 | Restore / Package select / Subscribe | TouchableOpacity | Body | loadOfferings / setSelectedPackage / handleSubscribe | Stays or purchase | ✅ |
| 3 | Terms / Privacy | TouchableOpacity | Footer | `router.push(ROUTES.LEGAL_TERMS)` / LEGAL_PRIVACY | Legal pages | ✅ |

---

## PAGE: Welcome
**File:** `app/welcome.tsx`  
**How user gets here:** First launch or auth redirect.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back | TouchableOpacity | Header | `setStep(step-1)` or back | Stays or ⬅️ | ✅ |
| 2 | Continue / Create account | TouchableOpacity | Footer | Step flow or signup then `router.replace(ROUTES.TABS)` | 🚩 HOME when done | ✅ |
| 3 | Already have an account? Log in | TouchableOpacity | Footer | `router.replace(ROUTES.AUTH_LOGIN)` | Login | ✅ |

---

## PAGE: Edit Profile
**File:** `app/edit-profile.tsx`  
**How user gets here:** Profile → Edit.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Close / Back | TouchableOpacity | Header | `router.back()` | ⬅️ Profile | ✅ |
| 2 | Save | TouchableOpacity | Header | `handleSave` → API then `router.back()` | ⬅️ Profile | ✅ |

---

## PAGE: Create Profile
**File:** `app/create-profile.tsx`  
**How user gets here:** After login when no username set.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Continue | TouchableOpacity | — | `handleCreateProfile` → then `router.replace("/(tabs)")` | 🚩 HOME | ✅ |

---

## PAGE: Accountability
**File:** `app/accountability.tsx`  
**How user gets here:** Settings → Accountability, or Profile Friends.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Add partner / CTA | TouchableOpacity | — | `router.push(ROUTES.ACCOUNTABILITY_ADD)` | Accountability Add | ✅ |

---

## PAGE: Accountability Add
**File:** `app/accountability/add.tsx`  
**How user gets here:** Accountability → Add.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back / Submit | — | — | `router.replace(ROUTES.ONBOARDING_STEP4 or ROUTES.TABS)` / etc. | Onboarding or 🚩 HOME | ✅ |

---

## PAGE: Invite by Code
**File:** `app/invite/[code].tsx`  
**How user gets here:** Deep link /invite/[code].

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | (Auto or CTA) | — | — | `router.replace(ROUTES.TABS)` or `router.replace(ROUTES.CHALLENGE_ID(challengeId))` | HOME or Challenge Detail | ✅ |

---

## PAGE: Profile by Username
**File:** `app/profile/[username].tsx`  
**How user gets here:** Tap profile from feed, SuggestedFollows, or activity.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back / own profile | — | — | `router.replace(ROUTES.TABS)` or `router.replace(ROUTES.TABS_PROFILE)` | HOME or Profile tab | ✅ |

---

## PAGE: Challenge Chat
**File:** `app/challenge/[id]/chat.tsx`  
**How user gets here:** Challenge Detail → Chat.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Back / Info | — | — | `router.replace(ROUTES.CHALLENGE_ID(id))` / `router.push(ROUTES.CHAT_INFO(id))` | Challenge Detail or Chat Info | ✅ |

---

## PAGE: Forgot Password
**File:** `app/auth/forgot-password.tsx`  
**How user gets here:** Login → Forgot password?.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Submit / Back | — | — | `router.replace(ROUTES.AUTH_LOGIN)` etc. | Login | ✅ |

---

## Tab Bar
**File:** `app/(tabs)/_layout.tsx`  
**How user gets here:** Always visible when in tabs.

| # | Element Name / Label | Element Type | Where On Screen | What Happens When Tapped (EXACT code) | Destination Page / Action | WORKING? |
|---|---|---|---|---|---|---|
| 1 | Home | Tab | Tab bar | Expo Router → index | Home | ✅ |
| 2 | Discover | Tab | Tab bar | Expo Router → discover | Discover | ✅ |
| 3 | Create | Tab | Tab bar | Expo Router → create | Create | ✅ |
| 4 | Movement | Tab | Tab bar | Expo Router → activity | Activity | ✅ |
| 5 | Profile | Tab | Tab bar | Expo Router → profile | Profile | ✅ |

---

## COMPONENTS (shared)

### ChallengeCard (`components/home/ChallengeCard.tsx`)
- **Used on:** Home (ActiveChallenges).
- Entire card: `onOpenChallenge?.(); router.push(ROUTES.CHALLENGE_ID(challengeId))` → Challenge Detail. ✅

### ProfileHeader (`components/profile/ProfileHeader.tsx`)
- **Used on:** Profile, profile/[username].
- Edit: `router.push(ROUTES.EDIT_PROFILE)` → Edit Profile. ✅
- Share: `onShare()` prop → Share. ✅

### AuthGateModal (`components/AuthGateModal.tsx`)
- Backdrop: `onClose()`. Continue with email: `router.push(ROUTES.AUTH_LOGIN)`. Sign up: `router.push(ROUTES.AUTH_SIGNUP)`. ✅

### LiveFeedCard (`components/home/LiveFeedCard.tsx`)
- Respect / Chase: `onRespect` / `onChase` or placeholder (Haptics + Alert "Coming Soon"). Open Challenge: `onOpenChallenge(id)` when `openChallengeId`. View Profile: `onViewProfile`. ✅

### CreateFlowHeader (`src/components/ui/CreateFlowHeader.tsx`)
- Cancel: `onCancel` (router.back). Right: `onRight` (step next). ✅

### EmptyState (`src/components/ui/EmptyState.tsx`)
- Primary CTA: `onPrimaryCta`. Secondary: `onSecondaryCta`. Used on Discover (empty). ✅

### FilterChip, CategoryTag, DurationPill, ChallengeTypeCard, etc.
- All accept `onPress`; behavior from parent. ✅

---

# PHASE 2 — VERIFICATION & FIXES

## 🚩 ELEMENTS THAT ROUTE TO HOME — VERIFICATION

| # | Screen | Element | Current Destination | Should it go to Home? | Fix Applied |
|---|---|---|---|---|---|
| 1 | Challenge Detail | Leave Challenge → Confirm "Leave" | `router.replace(ROUTES.TABS_DISCOVER)` | No — user left challenge; send to Discover to browse more | ✅ **FIXED:** was `ROUTES.TABS`; now `ROUTES.TABS_DISCOVER` |
| 2 | Challenge Detail | Primary CTA when already joined (Continue Today) | `router.push(ROUTES.TABS)` → HOME | Yes — show active challenge on home | No change |
| 3 | Challenge Detail | Team failed "Back to Home" | `router.replace(ROUTES.TABS)` | Yes — label is "Back to Home" | No change |
| 4 | Commitment | Confirm Commitment / Alert OK | `router.replace(ROUTES.TABS)` | Yes — just joined, show home | No change |
| 5 | Success | Continue | `router.replace(ROUTES.TABS)` | Yes — post-success dashboard | No change |
| 6 | Create | Alert OK (no challenge id) | `router.replace(ROUTES.TABS)` | Yes | No change |
| 7 | Login / Signup / Create Profile / Welcome | Post-auth | `router.replace("/(tabs)")` | Yes — land on app home | No change |
| 8 | Day Missed | CTA | `router.push(ROUTES.TABS)` | Debatable — left as Home | Flag only |

## ❌ DEAD BUTTONS

| # | Screen | Element | Current Handler | Fix Applied |
|---|---|---|---|---|
| 1 | Teams | + Create a Team | Was `onPress={() => {}}` | Already fixed: Haptics + Alert "Coming Soon" |
| 2 | Teams | Join with Code | Was `onPress={() => {}}` | Already fixed: Haptics + Alert "Coming Soon" |
| 3 | Home / LiveFeedCard | Respect & Chase pills | Were no-op or optional | Already fixed: placeholder Haptics + Alert "Coming Soon" |

## ⚠️ SUSPICIOUS ELEMENTS

None remaining. All handlers either navigate, call API, or show Coming Soon.

---

## Summary of code change (Phase 2)

- **File:** `app/challenge/[id].tsx`
- **Change:** Leave Challenge → Confirm "Leave" onPress: `router.replace(ROUTES.TABS as never)` → `router.replace(ROUTES.TABS_DISCOVER as never)`.
- **Reason:** After leaving a challenge, user should land on Discover to browse other challenges, not Home.
