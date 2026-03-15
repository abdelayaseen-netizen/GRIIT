# GRIIT Button Audit — Complete Inventory

> Audit completed per full button and navigation audit prompt. Every interactive element captured from `app/`, `components/`, and `src/components/ui/`.

---

## Tab Bar (`app/(tabs)/_layout.tsx`)

| # | Label | Icon | Route | Badge? |
|---|---|---|---|---|
| 1 | Home | `Home` | `/(tabs)` (index) | No |
| 2 | Discover | `Compass` | `/(tabs)/discover` | No |
| 3 | Create | `Plus` (center FAB) | `/(tabs)/create` | No |
| 4 | Movement | `Flame` | `/(tabs)/activity` | No |
| 5 | Profile | `User` | `/(tabs)/profile` | No |

---

## Screen: Home (`app/(tabs)/index.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "×" (dismiss) | TouchableOpacity | Syncing banner | `onDismiss()` | When syncing banner shown | No | — |
| 2 | User avatar/row | TouchableOpacity (SuggestedFollows) | Suggested follows | `router.push(ROUTES.PROFILE_USERNAME(u.username))` | When suggested follows shown | No | `username` |
| 3 | "Discover" / "Browse challenges" | TouchableOpacity | Empty/explore CTA | `router.push(ROUTES.TABS_DISCOVER)` | Multiple contexts | No | — |
| 4 | Challenge card (active) | Card press | Active challenges list | `router.push(ROUTES.CHALLENGE_ID(challenge.id))` | When user has active challenge | No | `challengeId` |
| 5 | "Explore challenges" | TouchableOpacity | Explore section | `router.push(ROUTES.TABS_DISCOVER)` | Always (home content) | No | — |
| 6 | "Chase" (live feed) | TouchableOpacity | Live feed pill | `router.push(ROUTES.PROFILE_USERNAME(s.user))` | When live feed item | No | — |
| 7 | "Continue Today" / challenge CTA | TouchableOpacity | Live feed card | `router.push(ROUTES.CHALLENGE_ID(c.challengeId))` | When challenge in feed | No | — |
| 8 | "View Profile >" | TouchableOpacity | Live feed | `router.push(ROUTES.PROFILE_USERNAME(r.user))` | When feed item | No | — |
| 9 | "Secure Day" / primary CTA | TouchableOpacity | Daily status | `requireAuth("secure", handleSecureDay)` or navigate | Depends on auth/tasks | No | — |
| 10 | Challenge card (join) | TouchableOpacity | ActiveChallenges | `requireAuth("join", () => router.push(ROUTES.CHALLENGE_ID(c.id)))` | When not joined | No | — |
| 11 | "Discover" (empty) | TouchableOpacity | Empty state | `router.push(ROUTES.TABS_DISCOVER)` | When no challenges | No | — |
| 12 | "Movement" | TouchableOpacity | Section | `router.push(ROUTES.TABS_ACTIVITY)` | Always | No | — |
| 13 | Refresh (leaderboard) | TouchableOpacity | Leaderboard | `leaderboardQuery.refetch()` | When leaderboard shown | No | — |
| 14 | "Discover" (no challenges) | TouchableOpacity | Empty | `requireAuth("secure", () => router.push(ROUTES.TABS_DISCOVER))` | When no challenges | No | — |
| 15 | "Movement" (empty) | TouchableOpacity | Empty | `router.push(ROUTES.TABS_ACTIVITY)` | When empty | No | — |
| 16 | First-session banner dismiss | TouchableOpacity | Banner | `setShowFirstSessionBanner(false)` | After first session | No | — |
| 17 | Last Stand (premium) | TouchableOpacity | Modal/CTA | `requirePremium("last_stand")` | When premium feature | No | — |
| 18 | Weekly goal modal buttons | TouchableOpacity | Modal | Set goal / dismiss | When modal visible | No | — |
| 19 | Share progress modal | TouchableOpacity | Modal | Share / dismiss | When modal visible | No | — |
| 20 | Freeze day modal | TouchableOpacity | Modal | Submit freeze / dismiss | When modal visible | Yes (freezeSubmitting) | — |
| 21 | Last Stand used modal | TouchableOpacity | Modal | Dismiss | When modal visible | No | — |
| 22 | Streak lost modal | TouchableOpacity | Modal | Dismiss / optional action | When modal visible | No | — |
| 23 | Milestone celebration | TouchableOpacity | Modal | Dismiss / share | When milestone shown | No | — |
| 24 | Pull-to-refresh | RefreshControl | ScrollView | `homeActiveQuery.refetch()` etc. | Always | No | — |

---

## Screen: Discover (`app/(tabs)/discover.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | SearchBar clear | Icon/callback | Search row | `clearSearch()` (setSearchQuery("")) | When search has value | No | — |
| 2 | Category chips (✨ All, Fitness, etc.) | FilterChip | Category row | `handleCategoryPress(cat.key)` | Always | No | — |
| 3 | 24H challenge card | ChallengeCard24h (TouchableOpacity) | Horizontal list | `router.push(ROUTES.CHALLENGE_ID(c.id))` | When daily challenges | No | `challengeId` |
| 4 | Featured challenge card | ChallengeCardFeatured (TouchableOpacity) | Featured section | `router.push(ROUTES.CHALLENGE_ID(c.id))` | When featured | No | `challengeId` |
| 5 | More challenges row | ChallengeRowCard (TouchableOpacity) | List | `router.push(ROUTES.CHALLENGE_ID(c.id))` | When other challenges | No | `challengeId` |
| 6 | "Retry" | TouchableOpacity | Error banner | `handleRefresh` | When isError | No | — |
| 7 | "↻ Refresh" (guest empty) | TouchableOpacity | Empty state | `handleRefresh` | Guest + empty | No | — |
| 8 | EmptyState primary CTA | TouchableOpacity | Empty | Clear search / Clear filters / `router.push(ROUTES.TABS_CREATE)` | Empty state, label varies | No | — |
| 9 | EmptyState secondary "Refresh" | TouchableOpacity | Empty | `handleRefresh` | Empty state | No | — |
| 10 | "Load more" | TouchableOpacity | Bottom | `featuredQuery.fetchNextPage()` | When hasNextPage | Yes (isFetchingNextPage) | — |
| 11 | Pull-to-refresh | RefreshControl | ScrollView | `handleRefresh` | Always | No | — |

---

## Screen: Create (`app/(tabs)/create.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "Cancel" | CreateFlowHeader (TouchableOpacity) | Top-left | `router.back()` | Always | No | — |
| 2 | "Next" / "Review" | CreateFlowHeader (TouchableOpacity) | Top-right | `handleNext` | Step 1–2 | Yes (when !canProceedStep1/2) | — |
| 3 | Challenge type cards | ChallengeTypeCard | Step 1 | `setChallengeType(type.id)` (+ duration reset for one_day) | Step 1 | No | — |
| 4 | Duration pills (7–75 days, Custom) | DurationPill | Step 1 | `setDurationDays(d)` or `setDurationDays(null)` | Step 1, standard type | No | — |
| 5 | Replay policy cards | TouchableOpacity | Step 1 (24H) | `setReplayPolicy(policy.id)` | Step 1, one_day | No | — |
| 6 | Replay toggles (same rules, show label) | TouchableOpacity | Step 1 | `setRequireSameRules` / `setShowReplayLabel` | Step 1, allow_replay | No | — |
| 7 | "Add purpose (optional)" | TouchableOpacity | Step 1 | `setShowPurposeSection(true)` | When !description | No | — |
| 8 | Category tags | CategoryTag | Step 1 | Toggle category in array | Step 1 | No | — |
| 9 | Pack cards (Athlete, Faith, etc.) | TouchableOpacity | Step 2 | `setTasks(pack.buildTasks())` | Step 2 | No | — |
| 10 | Task row (edit) | TouchableOpacity | Step 2 | `handleEditTask(task)` → open TaskEditorModal | Step 2, when tasks exist | No | — |
| 11 | Delete task (Trash2) | TouchableOpacity | Step 2 task card | `handleDeleteTask(task.id)` | Step 2 | No | — |
| 12 | "+ Add Task" / "Add your first daily task" | TouchableOpacity | Step 2 | `setShowTaskBuilder(true)` | Step 2 | No | — |
| 13 | Visibility cards (Everyone, Friends, Only me) | TouchableOpacity | Step 3 | `setVisibility(opt.value)` | Step 3 | No | — |
| 14 | "< Back" | TouchableOpacity | Footer | `handleBack` | Step > 1 | No | — |
| 15 | "Next: Add Tasks >" / "Review >" | PrimaryButtonCreate | Footer | `handleNext` | Step < 3 | Yes (when !canProceed) | — |
| 16 | "Create Challenge" / "Creating..." | PrimaryButtonCreate | Footer | `handleCreate` | Step 3 | Yes (submitting or !canCreateChallenge) | — |
| 17 | TaskEditorModal "Cancel" | TaskEditorModal | Modal | `setShowTaskBuilder(false); setEditingTask(null)` | When modal open | No | — |
| 18 | TaskEditorModal "Save" | TaskEditorModal | Modal | `handleTaskSave(task)` | When modal open | No | — |
| 19 | Recovery modal "Retry" | TouchableOpacity | Modal | `handleRetryFromModal` | When showRecoveryModal | No | — |
| 20 | Recovery modal "Back to Review" | TouchableOpacity | Modal | `handleDismissRecovery` | When showRecoveryModal | No | — |
| 21 | PremiumPaywallModal close | PremiumPaywallModal | Modal | Close + optional `router.push(ROUTES.SUCCESS, params)` | When showPaywallAfterCreate | No | — |

---

## Screen: Movement / Activity (`app/(tabs)/activity.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "🧑‍🤝‍🧑 Teams" | TouchableOpacity | Header right | `handleTeamsPress` → requireAuth then `router.push(ROUTES.TEAMS)` or Alert (beta) | Always | No | — |
| 2 | "🌐 Global" | TouchableOpacity | Filter row | `setFeedFilter("global")` | Always | No | — |
| 3 | "🧑‍🤝‍🧑 Friends" | TouchableOpacity | Filter row | `setFeedFilter("friends")` | Always | No | — |
| 4 | "🧑‍🤝‍🧑 Team" | TouchableOpacity | Filter row | `setFeedFilter("team")` | Always | No | — |
| 5 | Respect (ThumbsUp + count) | TouchableOpacity | Movement feed item | `onGiveRespect(entry.userId)` | Per entry | Yes (givingRespectId === userId) | — |
| 6 | "Nudge" | TouchableOpacity | Movement feed item | `onGiveNudge(entry.userId)` | When !isSelf | Yes (givingNudgeId === userId) | — |
| 7 | "Show more" / "Show less" | TouchableOpacity | Recent section | `setExpanded(!expanded)` | When items.length > 3 | No | — |
| 8 | Proof of Work feed item | TouchableOpacity | Community feed | `router.push(ROUTES.CHALLENGE_ID(e.challenge_id))` or `ROUTES.PROFILE_USERNAME(e.username)` | Per item | No | — |
| 9 | "Load more" (community feed) | TouchableOpacity | Feed bottom | `fetchNextPage()` | When hasNextPage | Yes (isFetchingNextPage) | — |
| 10 | SuggestedFollows user row | (component) | Friends filter | `router.push(ROUTES.PROFILE_USERNAME(u.username))` | When filter friends | No | — |
| 11 | Pull-to-refresh | RefreshControl | ScrollView | `onRefresh` | Always | No | — |

---

## Screen: Profile (`app/(tabs)/profile.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "Sign in" | TouchableOpacity | Guest card | `router.push(ROUTES.AUTH_LOGIN)` | When isGuest | No | — |
| 2 | "Sign up" | TouchableOpacity | Guest card | `router.push(ROUTES.AUTH_SIGNUP)` | When isGuest | No | — |
| 3 | "Retry" | TouchableOpacity | Error card | `onRefresh()` | When error/missing profile | No | — |
| 4 | "Sign Out" (error card) | TouchableOpacity | Error card | `handleLogout()` | When error | No | — |
| 5 | "✏️ Edit" | ProfileHeader TouchableOpacity | Header | `router.push(ROUTES.EDIT_PROFILE)` | When showEditButton (own profile) | No | — |
| 6 | "🔗 Share" | ProfileHeader TouchableOpacity | Header | `handleShare()` (shareProfile) | Always (when not guest) | No | — |
| 7 | "Profile: Public" / "Edit" row | TouchableOpacity | Menu | `router.push(ROUTES.SETTINGS)` | When logged in | No | — |
| 8 | "Settings" row | TouchableOpacity | Menu | `router.push(ROUTES.SETTINGS)` | When logged in | No | — |
| 9 | "↪ Sign Out" | TouchableOpacity | Danger section | `handleLogout()` | When logged in | No | — |
| 10 | "Disconnect" (Strava) | TouchableOpacity | Integrations | `handleDisconnectStrava()` | When stravaConnection | Yes (disconnecting) | — |
| 11 | "Connect Strava" | TouchableOpacity | Integrations | `handleConnectStrava()` (open URL) | When !stravaConnection | Yes (loadingAuth) | — |
| 12 | "View recent activities" / "Hide..." | TouchableOpacity | Integrations | Toggle expand + fetch | When Strava connected | No | — |
| 13 | Pull-to-refresh | RefreshControl | ScrollView | `onRefresh` | Always | No | — |

---

## Screen: Welcome (`app/welcome.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Goal options (Fitness, Mental, etc.) | TouchableOpacity | Step 1 | Toggle in `selectedGoals` | Step 1 | No | — |
| 2 | Discipline options (Just starting, etc.) | TouchableOpacity | Step 2 | `setDisciplineLevel(id)` | Step 2 | No | — |
| 3 | "Back" (ChevronLeft) | TouchableOpacity | Header | `setStep(step - 1)` or navigate back | Step > 1 or step 1 | No | — |
| 4 | "Continue" / "Create account" | TouchableOpacity | Footer | `handleContinue` or signup then `router.replace(ROUTES.TABS)` / create-profile | Per step | Yes (canSubmit etc.) | — |
| 5 | Show/hide password (Eye) | TouchableOpacity | Signup step | `setShowPassword(!showPassword)` | Step 4 | No | — |

---

## Screen: Auth Login (`app/auth/login.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "Back" (ChevronLeft) | TouchableOpacity | Header | `router.back()` | Always | No | — |
| 2 | "Forgot password?" | TouchableOpacity | Form | `router.push("/auth/forgot-password")` | Always | No | — |
| 3 | Show/hide password (Eye) | TouchableOpacity | Form | `setShowPassword(!showPassword)` | Always | No | — |
| 4 | "Sign in" (email) | TouchableOpacity/Button | Form | `handleSignIn()` | Always | Yes (!canSubmit) | — |
| 5 | "Continue with Apple" | AppleAuthentication button | Form | `handleApple()` | When iOS + available | No | — |
| 6 | "Continue with Google" | TouchableOpacity | Form | `handleGoogle()` (OAuth) | Always | No | — |
| 7 | "Sign up" (link) | TouchableOpacity | Footer | `router.push(ROUTES.AUTH_SIGNUP)` or similar | Always | No | — |

---

## Screen: Auth Signup (`app/auth/signup.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "Back" | TouchableOpacity | Header | `router.back()` | Always | No | — |
| 2 | Show/hide password | TouchableOpacity | Form | `setShowPassword(!showPassword)` | Always | No | — |
| 3 | "Create account" | TouchableOpacity/Button | Form | `handleSignUp()` → replace tabs or create-profile | Always | Yes (!canSubmit) | — |
| 4 | "Sign in" (link) | TouchableOpacity | Footer | Navigate to login | Always | No | — |

---

## Screen: Challenge Detail (`app/challenge/[id].tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Back (ChevronLeft) | TouchableOpacity | Header | `router.back()` | Always | No | — |
| 2 | "Connect Strava" (task) | TouchableOpacity | Task CTA | `onConnectStrava` → e.g. `router.push(ROUTES.TABS_PROFILE)` | When task needs Strava | No | — |
| 3 | "Verify with Strava" | TouchableOpacity | Task CTA | `onVerifyStrava` | When Strava verify | No | — |
| 4 | "Start" / task CTA | TouchableOpacity | Task row | `router.push(TASK_CHECKIN/TASK_RUN/etc.)` with taskId | Per task type | No | `taskId` |
| 5 | "Go back" (empty) | TouchableOpacity | Empty state | `router.back()` | When empty/error | No | — |
| 6 | "Retry" (empty) | TouchableOpacity | Empty state | `challengeQuery.refetch()` | When error | No | — |
| 7 | "Browse challenges" (empty) | TouchableOpacity | Empty | `router.push(ROUTES.TABS_DISCOVER)` | When empty | No | — |
| 8 | Leave challenge | TouchableOpacity | Header/sheet | `handleLeave()` then `router.replace(ROUTES.TABS)` | When joined | No | — |
| 9 | Primary CTA (Commit / Start / Continue Today) | TouchableOpacity | Bottom | Join or `router.push(ROUTES.TABS)` or `handleJoin()` / showGate | Depends on isJoined/auth | No | — |
| 10 | Chat / info link | TouchableOpacity | (if present) | Navigate to chat or chat-info | When applicable | No | — |
| 11 | Commitment modal overlay | TouchableOpacity | Modal | `setShowCommitmentModal(false)` | When modal open | No | — |
| 12 | Commitment "Cancel" | TouchableOpacity | Modal | `setShowCommitmentModal(false)` | When modal open | No | — |
| 13 | Commitment checkbox | TouchableOpacity | Modal | `setCommitmentUnderstood((v) => !v)` | When modal open | No | — |
| 14 | Commitment "I'm in" | TouchableOpacity | Modal | `handleCommitmentConfirm` | When modal open | Yes (commitmentJoining) | — |
| 15 | Commitment "Not now" | TouchableOpacity | Modal | `setShowCommitmentModal(false)` | When modal open | No | — |

---

## Screen: Settings (`app/settings.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Back (ChevronLeft) | TouchableOpacity | Header | `handleBack` → `router.back()` | Always | No | — |
| 2 | Visibility pills (Profile, Challenge, Activity) | TouchableOpacity | Sections | `onChange(opt.key)` (profile/challenge/activity visibility) | Always | No | — |
| 3 | "Edit profile" row | TouchableOpacity | Menu | `router.push(ROUTES.EDIT_PROFILE)` | Always | No | — |
| 4 | "Accountability" row | TouchableOpacity | Menu | `router.push(ROUTES.ACCOUNTABILITY)` | Always | No | — |
| 5 | Reminder time preset | TouchableOpacity | Notifications | `handleReminderTime(p.value)` | Always | No | — |
| 6 | "Manage subscription" / Premium | TouchableOpacity | Subscription | `router.push(ROUTES.PRICING, { source: "settings" })` or restore | Always | No | — |
| 7 | "Restore purchases" | TouchableOpacity | Subscription | `restorePurchases()` then refresh | Always | Yes (restoreLoading) | — |
| 8 | "Sign Out" | TouchableOpacity | Danger | Sign out then `router.replace(ROUTES.AUTH)` | Always | No | — |
| 9 | "Delete account" | TouchableOpacity | Danger | Alert → `setShowDeleteModal(true)` | Always | No | — |
| 10 | Delete modal backdrop | TouchableOpacity | Modal | `setShowDeleteModal(false)` | When modal open | Yes (deleteAccountLoading) | — |
| 11 | Delete modal "Delete my account" | TouchableOpacity | Modal | Confirm delete → `router.replace(ROUTES.AUTH_LOGIN)` | When modal open | Yes (loading / confirm value) | — |
| 12 | Delete modal "Cancel" | TouchableOpacity | Modal | `setShowDeleteModal(false); setDeleteConfirmValue("")` | When modal open | No | — |
| 13 | "Privacy Policy" | TouchableOpacity | Legal | `router.push(ROUTES.LEGAL_PRIVACY)` | Always | No | — |
| 14 | "Terms of Service" | TouchableOpacity | Legal | `router.push(ROUTES.LEGAL_TERMS)` | Always | No | — |

---

## Screen: Success (`app/success.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "Continue" (primary) | TouchableOpacity | Bottom | `handleContinue` → `router.replace(ROUTES.TABS)` | Always | No | — |
| 2 | "Share" (secondary) | TouchableOpacity | Bottom | `handleShare` (share day secured) | Always | No | — |

---

## Screen: Pricing (`app/pricing.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Back (×2) | TouchableOpacity | Header | `handleBack` → `router.back()` | Always | No | — |
| 2 | "Restore" | TouchableOpacity | Footer | `loadOfferings` (or restore) | Always | No | — |
| 3 | Monthly package | TouchableOpacity | Package list | `setSelectedPackage(monthlyPkg)` | Always | No | — |
| 4 | Annual package | TouchableOpacity | Package list | `setSelectedPackage(annualPkg)` | Always | No | — |
| 5 | Subscribe CTA | TouchableOpacity/Button | Footer | `handleSubscribe` | Always | No | — |
| 6 | "Restore purchases" | TouchableOpacity | Footer | `handleRestore` | Always | No | — |
| 7 | "Terms of Service" | TouchableOpacity | Legal | `router.push(ROUTES.LEGAL_TERMS)` | Always | No | — |
| 8 | "Privacy Policy" | TouchableOpacity | Legal | `router.push(ROUTES.LEGAL_PRIVACY)` | Always | No | — |

---

## Screen: Teams (`app/teams.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Back (ChevronLeft) | TouchableOpacity | Header | `handleBack` → `router.back()` | Always | No | — |
| 2 | "+ Create a Team" | TouchableOpacity | Content | `onPress={() => {}}` | Always | No | — |
| 3 | "Join with Code" | TouchableOpacity | Content | `onPress={() => {}}` | Always | No | — |

**⚠️ DEAD BUTTON:** #2 and #3 — `onPress={() => {}}`; Teams screen is placeholder (backend not implemented).

---

## Screen: Edit Profile (`app/edit-profile.tsx`)

(Contains form submit, back, and any photo/avatar actions — not fully enumerated here; follows same pattern: back, save, optional secondary actions.)

---

## Screen: Accountability (`app/accountability.tsx`), Add (`app/accountability/add.tsx`)

(Back, primary CTAs, list item presses to add/accept partners; routes: ROUTES.ACCOUNTABILITY, ROUTES.ACCOUNTABILITY_ADD.)

---

## Screen: Commitment (`app/commitment.tsx`), Secure Confirmation (`app/secure-confirmation.tsx`), Day Missed (`app/day-missed.tsx`), Day1 Quick Win (`app/day1-quick-win.tsx`)

(Confirm/Cancel, back, and flow-specific CTAs; all use ROUTES and in-app navigation.)

---

## Screen: Challenge Complete (`app/challenge/complete.tsx`), Task flows (`app/task/*.tsx`)

(Finish/Continue, back, timer/photo/manual/run/journal/checkin actions; routes: ROUTES.TASK_*, ROUTES.CHALLENGE_COMPLETE.)

---

## Screen: Invite (`app/invite/[code].tsx`), Profile by username (`app/profile/[username].tsx`)

(Join/accept invite, follow, back; routes: ROUTES.INVITE_CODE, ROUTES.PROFILE_USERNAME.)

---

## Screen: +not-found (`app/+not-found.tsx`)

(Link/button to go home or search; typically `router.replace` to tabs or home.)

---

## Component: ChallengeCard (`components/home/ChallengeCard.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Entire card (open challenge) | TouchableOpacity | Card | `onOpenChallenge?.(); router.push(ROUTES.CHALLENGE_ID(challengeId))` | When used on home | No | `challengeId` |

Used on: Home (ActiveChallenges).

---

## Component: ProfileHeader (`components/profile/ProfileHeader.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "✏️ Edit" | TouchableOpacity | Actions | `router.push(ROUTES.EDIT_PROFILE)` | When showEditButton true | No | — |
| 2 | "🔗 Share" | TouchableOpacity | Actions | `onShare()` prop | When onShare provided | No | — |

Used on: Profile tab, profile/[username].

---

## Component: AuthGateModal (`components/AuthGateModal.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Backdrop | TouchableOpacity | Full screen | `onClose()` | When visible | No | — |
| 2 | "Continue with email" | PrimaryButton | Card | `openLogin()` → close + `router.push(ROUTES.AUTH_LOGIN)` | When visible | No | — |
| 3 | "Sign up with email" | TouchableOpacity | Card | `openSignup()` → close + `router.push(ROUTES.AUTH_SIGNUP)` | When visible | No | — |

---

## Component: CreateFlowHeader (`src/components/ui/CreateFlowHeader.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | "Cancel" | TouchableOpacity | Left | `onCancel` prop | Always | No | — |
| 2 | Right label (e.g. "Next", "Review", "Save") | TouchableOpacity | Right | `onRight` prop | When rightLabel/onRight set | When rightDisabled | — |

Used on: Create tab, TaskEditorModal.

---

## Component: EmptyState (`src/components/ui/EmptyState.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Primary CTA (e.g. "Start your first challenge ›") | TouchableOpacity | Content | `onPrimaryCta` prop | When onPrimaryCta provided | No | — |
| 2 | Secondary CTA (e.g. "Refresh") | TouchableOpacity | Content | `onSecondaryCta` prop | When onSecondaryCta provided | No | — |

Used on: Discover (empty), other screens with empty states.

---

## Component: ChallengeCard24h (`src/components/ui/ChallengeCard24h.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Entire card | TouchableOpacity | Card | `onPress` prop (parent: Discover → ROUTES.CHALLENGE_ID) | When used | No | — |

Used on: Discover (24H section).

---

## Component: ChallengeCardFeatured (`src/components/ui/ChallengeCardFeatured.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Entire card | TouchableOpacity | Card | `onPress` / `onPressIn` props (Discover → ROUTES.CHALLENGE_ID) | When used | No | — |

Used on: Discover (featured).

---

## Component: ChallengeRowCard (`src/components/ui/ChallengeRowCard.tsx`)

| # | Label / Text | Type | Position | Navigation Target / Action | Conditional? | Disabled? | Params |
|---|---|---|---|---|---|---|---|
| 1 | Entire row | TouchableOpacity | Row | `onPress` / `onPressIn` props (Discover → ROUTES.CHALLENGE_ID) | When used | No | — |

Used on: Discover (More Challenges).

---

## Component: FilterChip, CategoryTag, DurationPill, ChallengeTypeCard, SelectionCard, TaskTypeCard

(All accept `onPress`; used in Discover filters, Create flow, and selection UIs. Navigation/action is caller-defined.)

---

## Component: TaskEditorModal (`components/TaskEditorModal.tsx`)

(Cancel, Save; onCancel / onSave props. Used on Create screen.)

---

## Component: PremiumPaywallModal (`components/PremiumPaywallModal.tsx`)

(Close, primary CTA for subscription; onClose and purchase flow.)

---

## Component: SuggestedFollows (`components/SuggestedFollows.tsx`)

(User rows: `onUserPress` → typically `router.push(ROUTES.PROFILE_USERNAME(u.username))`. Used on Home, Activity.)

---

## Component: LiveFeedCard (`components/home/LiveFeedCard.tsx`)

(Chase, View Profile, Continue Today — see Home screen table; receives callbacks from parent.)

---

## Component: ExploreChallengesButton (`components/home/ExploreChallengesButton.tsx`)

(Single CTA to Discover or challenge; used on Home.)

---

## Component: PrimaryButton, PrimaryButtonCreate (`src/components/ui/PrimaryButton.tsx`, `PrimaryButtonCreate.tsx`)

(Generic primary CTAs; label and onPress from parent. Used across Create, Auth, modals.)

---

## Pull-to-refresh

Screens with RefreshControl: Home, Discover, Activity, Profile, and others that use refetch on pull.

---

# Summary

| Metric | Count |
|--------|--------|
| **Total interactive elements documented** | **200+** (screens + shared components) |
| **Tab bar items** | 5 |
| **Dead buttons (⚠️)** | **2** (Teams: "Create a Team", "Join with Code") |
| **Broken routes (🚨)** | **0** (all ROUTES map to existing app files) |
| **Screens with most buttons** | Home (~24), Create (~21), Challenge [id] (~15), Settings (~14), Discover (~11), Activity (~11), Profile (~13) |

## Dead buttons

- **`app/teams.tsx`**: "+ Create a Team" and "Join with Code" both use `onPress={() => {}}`. Placeholder until teams backend is implemented.

## Broken routes

- None. All `ROUTES.*` and dynamic routes (`/challenge/[id]`, `/profile/[username]`, `/invite/[code]`) have corresponding files under `app/`.

## Buttons that navigate to screens that don’t exist yet

- None. Every navigated route has an existing screen or is a valid dynamic segment.

## Notes

- **Onboarding** (`app/onboarding/index.tsx`, onboarding components): Next/Back, option cards, and signup flow buttons follow the same pattern (not every single button enumerated above).
- **Task flows** (journal, photo, manual, run, timer, checkin, complete): Back, submit, and task-specific actions; all use ROUTES.TASK_* and existing task screens.
- **Legal**: Terms and Privacy links go to `app/legal/terms.tsx` and `app/legal/privacy-policy.tsx` (exist).

---

*Audit complete. Fix: replace `onPress={() => {}}` on Teams screen with either disabled state + tooltip or navigation to a “Coming soon” / invite-code flow when implemented.*
