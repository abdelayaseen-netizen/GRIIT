# GRIIT — Complete App Breakdown

**Generated:** 2025-03-15  
**Total screens:** 35  
**Total interactive elements:** 150+

> **Sprint 6 note:** This document is a snapshot. Screens **`app/success.tsx`**, **`app/secure-confirmation.tsx`**, and root **`app/teams.tsx`** were removed in Sprint 6 Phase 1. Completion and celebration flows use other routes (e.g. **`challenge/complete`**, tabs). Use **`lib/routes.ts`** and **`app/_layout.tsx`** as the source of truth for current stacks.

---

## TABLE OF CONTENTS

1. [Tab Bar](#tab-bar)
2. [Home](#home)
3. [Discover](#discover)
4. [Create Challenge](#create-challenge)
5. [Activity / Movement](#activity--movement)
6. [Profile](#profile)
7. [Login](#login)
8. [Signup](#signup)
9. [Forgot Password](#forgot-password)
10. [Create Profile](#create-profile)
11. [Welcome](#welcome)
12. [Challenge Detail](#challenge-detail)
13. [Commitment](#commitment)
14. [Challenge Chat](#challenge-chat)
15. [Chat Info](#chat-info)
16. [Settings](#settings)
17. [Edit Profile](#edit-profile)
18. [Success](#success)
19. [Day Missed](#day-missed)
20. [Secure Confirmation](#secure-confirmation)
21. [Teams](#teams)
22. [Pricing](#pricing)
23. [Challenge Complete](#challenge-complete)
24. [Accountability](#accountability)
25. [Accountability Add](#accountability-add)
26. [Invite by Code](#invite-by-code)
27. [Profile by Username](#profile-by-username)
28. [404 / Not Found](#404--not-found)
29. [Onboarding Questions](#onboarding-questions)
30. [Onboarding (post-signup)](#onboarding-post-signup)
31. [Day 1 Quick Win](#day-1-quick-win)
32. [Legal Terms](#legal-terms)
33. [Legal Privacy Policy](#legal-privacy-policy)
34. [Task screens (Run, Journal, Timer, Photo, Check-in, Manual, Complete)](#task-screens)
35. [Shared Components](#shared-components)

---

## TAB BAR

**File:** `app/(tabs)/_layout.tsx`  
**How to get here:** Always visible when user is in the tab stack.  
**Layout:** Fixed bottom bar with five items; center item is a prominent "+" button. No header on tab screens.

### Header
None (headerShown: false for all tabs).

### Tab items

| Tab | Label | Icon | Route | Badge? |
|-----|-------|------|-------|--------|
| 1 | Home | Home (house) | `/(tabs)` (index) | No |
| 2 | Discover | Compass | `/(tabs)/discover` | No |
| 3 | Create | Plus (center, filled circle) | `/(tabs)/create` | No |
| 4 | Movement | Flame | `/(tabs)/activity` | No |
| 5 | Profile | User | `/(tabs)/profile` | No |

### Interactive elements

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | Home | Tab | Bottom bar, 1st | Switch to Home tab | `/(tabs)` |
| 2 | Discover | Tab | Bottom bar, 2nd | Switch to Discover tab | `/(tabs)/discover` |
| 3 | + (Create) | Tab | Bottom bar, center | Switch to Create tab | `/(tabs)/create` |
| 4 | Movement | Tab | Bottom bar, 4th | Switch to Activity tab | `/(tabs)/activity` |
| 5 | Profile | Tab | Bottom bar, 5th | Switch to Profile tab | `/(tabs)/profile` |

---

## HOME

**File:** `app/(tabs)/index.tsx`  
**How to get here:** Tab bar → Home (1st tab), or app launch for logged-in users.  
**Layout:** Scrollable vertical feed with pull-to-refresh. Top: wordmark and badge pills. Then stats row (STREAK, SCORE, RANK), optional discipline week card, active challenge card (if any) with today's tasks and "Secure Day" button, suggested challenges (if no active), LIVE section header, feed cards (secured/milestone/challenge_cta/rank_up), YOUR POSITION or leaderboard card, footer tagline. Modals for milestone, weekly goal, share progress, freeze, last stand, streak lost.

### Header
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| GRIIT wordmark | "GRIIT" (subtitle when logged in: "Build Discipline Daily") | Top-left | None (no scroll-to-top in current code) |
| Score pill | Number (longest streak) | Top-right | None (display) |
| Streak pill | Number (current streak) | Top-right | None (display) |
| PRO badge | "PRO" (if premium) | Next to streak | None |
| Syncing banner | "Syncing... we'll update when you're back online." + × | Below header when syncing | × dismisses banner |
| First-session banner | Welcome/celebration text + dismiss | When first session just finished | Dismiss |

### Section: Stats row (logged-in only)
**Shows:** STREAK (number), SCORE (longest streak), RANK (tier name).  
**Exact text:** "STREAK", "SCORE", "RANK" — non-tappable.

### Section: Discipline this week (logged-in only)
**Shows:** "+X Discipline this week", "+100% from last week".  
**Exact text:** "+{stats.longestStreak} Discipline this week", "+100% from last week" — non-tappable.

### Section: Active challenge card
**Shows when:** User has an active challenge.  
**Content:** "Today" label, progress (e.g. 2/3), progress bar, task rows (check + title), "View Details" + chevron.

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | Active challenge card (entire card) | TouchableOpacity | Main scroll | router.push(ROUTES.CHALLENGE_ID(activeChallenge.challenge_id)) | `/challenge/[id]` |
| 2 | "Secure Day" (green button) | TouchableOpacity | Below task list | requireAuth("secure", handleSecureDay) → secureDay API then navigate to secure-confirmation or challenge/complete | `/secure-confirmation` or `/challenge/complete` |
| 3 | "Day X Secured" banner | View (non-tappable) | Below card when day secured | — | — |

### Section: Suggested for you (no active challenge)
**Shows when:** No active challenge and suggested list exists.  
**Exact text:** "SUGGESTED FOR YOU", challenge titles.

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | Challenge row (title + chevron) | TouchableOpacity | Suggested section | requireAuth("join", () => router.push(ROUTES.CHALLENGE_ID(c.id))) | `/challenge/[id]` |

### Section: LIVE
**Exact text:** "LIVE" (with red dot), "People are moving".  
**Content:** Feed cards (see below).

### Section: YOUR POSITION (when rank available)
**Exact text:** "YOUR POSITION", "You are ranked #X among friends this week.", "You're X days away from your best streak."

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | "Secure Now" (with Shield icon) | TouchableOpacity | Card bottom | requireAuth("secure", () => router.push(ROUTES.TABS_DISCOVER)) | `/(tabs)/discover` |

### Section: Feed cards (LIVE)
**Card types:** secured, milestone, challenge_cta, rank_up.  
**Secured card:** "[user] secured Day X of [challenge]", "🔥 Streak: X days", "[time] ago", "Respect X", "Chase".  
**Milestone card:** "Hit X days straight", "Top X% this week", "Respect X".  
**Challenge CTA card:** "X% of participants secured today", "in [challenge]", "Are you in?", "View Challenge >" or "Open Challenge >".  
**Rank up card:** "[user] moved to Rank '[rank]'", "📈 +X Discipline this week", "View Profile >".

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | "Respect X" pill (secured/milestone) | TouchableOpacity | Feed card | Haptics + Alert "Coming Soon" | Stays |
| 2 | "Chase" pill | TouchableOpacity | Secured card | Haptics + Alert "Coming Soon" | Stays |
| 3 | "View Challenge >" / "Open Challenge >" | TouchableOpacity | challenge_cta card | challengeId ? router.push(ROUTES.CHALLENGE_ID) : router.push(ROUTES.TABS_DISCOVER) | `/challenge/[id]` or Discover |
| 4 | "View Profile >" | TouchableOpacity | rank_up card | router.push(ROUTES.PROFILE_USERNAME(r.user)) | `/profile/[username]` |

### Section: Leaderboard error
**Exact text:** "LEADERBOARD", "Couldn't load leaderboard. Check your connection and try again.", "Retry".

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | "Retry" | TouchableOpacity | Error card | leaderboardQuery.refetch() | Stays |

### Section: Leaderboard empty (no rank yet)
**Exact text:** "LEADERBOARD", "Be the first this week.", "View Activity".

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | Card (entire) | TouchableOpacity | — | router.push(ROUTES.TABS_ACTIVITY) | `/(tabs)/activity` |

### Footer
**Exact text:** "Only discipline shows here." — non-tappable.

### Modals (Home)
- **Milestone modal:** Title e.g. "X-Day Streak", subtitle, "Share", "Got it". Share → shareMilestone then dismiss. Got it → dismiss.
- **Weekly goal modal:** "Weekly goal", "How many days do you want to secure per week?", options "Casual (3 days)", "Regular (5 days)", "Committed (7 days)", "Cancel".
- **Share progress modal:** "Share your progress", ShareCard preview, "Share", "Cancel".
- **Freeze modal:** "Use your streak freeze?", description, "Use freeze", "Cancel".
- **Last Stand used modal:** "Last Stand used.", "Streak preserved.", "Got it".
- **Streak lost modal:** "Streak lost.", "Start again today.", "Continue", ✕.

### States
- **Loading:** HomeScreenSkeleton (placeholder blocks).
- **Guest:** Hero "🔥", "Build discipline one day at a time.", "Explore challenges" → Discover; or single featured challenge card "Open challenge" → Challenge detail; "See all challenges" → Discover.
- **Empty feed:** "Loading activity…" or "No activity yet", "Join a challenge to see the community in action."
- **Error (leaderboard):** LEADERBOARD error card with Retry.

### Conditional elements
- "Secure Day" only when canSecureDay && !optimisticDaySecured.
- "Day X Secured" banner only when day already secured.
- YOUR POSITION card only when leaderboardData.currentUserRank != null; otherwise leaderboard error card or "Be the first" card.
- Last Stand / PRO badge when applicable.
- Comeback messaging when user missed yesterday.

---

## DISCOVER

**File:** `app/(tabs)/discover.tsx`  
**How to get here:** Tab bar → Discover (2nd tab).  
**Layout:** SafeAreaView, header block ("Discover", "Find challenges worth committing to"), search bar, horizontal category chips (✨ All, 🏋️ Fitness, 🧠 Mind, 🛡 Discipline), vertical scroll: optional "⚡ 24-Hour Challenges" horizontal list, "📈 Featured" list, "✨ More Challenges" list, "Load more" button. Pull-to-refresh.

### Header
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| Title | "Discover" | Top | — |
| Subtitle | "Find challenges worth committing to" | Below title | — |

### Section: Search bar
**Shows:** TextInput placeholder "Search challenges...", clear (X) when has text.  
**Tap:** Clear button clears search.

### Section: Category chips
**Exact text:** "✨ All", "🏋️ Fitness", "🧠 Mind", "🛡 Discipline".  
**Tap:** Select category (filter).

### Section: Error banner
**Exact text:** "📡 Offline mode", "Retry".  
**Tap:** Retry → handleRefresh.

### Section: 24-Hour Challenges
**Exact text:** SectionHeader "⚡ 24-Hour Challenges", caption "New every day". Cards show title, description, countdown, difficulty, task previews, participants.  
**Tap:** Card → router.push(ROUTES.CHALLENGE_ID(c.id)).

### Section: Featured
**Exact text:** "📈 Featured". Cards: FEATURED badge, difficulty, title, description, task chips, duration, participants, active today.  
**Tap:** Card → router.push(ROUTES.CHALLENGE_ID(c.id)).

### Section: More Challenges
**Exact text:** "✨ More Challenges". Row cards: stripe, title, description, duration, participants.  
**Tap:** Row → router.push(ROUTES.CHALLENGE_ID(c.id)).

### Section: Load more
**Exact text:** "Load more" (or spinner when loading).  
**Tap:** featuredQuery.fetchNextPage().

### Empty state (guest)
**Exact text:** "Challenges coming soon", "We're building something great. Check back soon.", "↻ Refresh".  
**Tap:** Refresh → handleRefresh.

### Empty state (logged in, no results)
**Exact text:** "No challenges found" or "No challenges yet. Be the first to create one!", subtitle varies, primary CTA "Clear search" / "Clear filters" / "Create challenge", secondary "Refresh".  
**Tap:** Primary → clearSearch or set filters + refresh or router.push(ROUTES.TABS_CREATE). Secondary → handleRefresh.

### States
- **Loading:** Skeleton list (pulse placeholders).
- **Error:** "📡 Offline mode" + Retry.
- **Empty:** See above.

---

## CREATE CHALLENGE

**File:** `app/(tabs)/create.tsx`  
**How to get here:** Tab bar → Create (center +).  
**Layout:** SafeAreaView, CreateFlowHeader (Cancel, title "Create Challenge", Next/Review), stepper (1–2–3), ScrollView with step content, footer with Back (when step > 1) and Next or "Create Challenge". TaskEditorModal, Recovery modal, PremiumPaywallModal.

### Header
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| Cancel | "Cancel" | Top-left | router.back() |
| Title | "Create Challenge" | Center | — |
| Next / Review | "Next" or "Review" | Top-right | handleNext (step++) |

### Step 1: Challenge Basics
**Exact text:** "Challenge Basics", "What are you building?", "Most people finish this in under 2 minutes.", "Title" (input placeholder "e.g. 75 Day Hard"), "Challenge type" (Standard / 24-Hour cards), "Duration" (7–75 days pills + Custom), "Live Date" (24H), "Replay Policy" (Live Only / Allow Replay), "Add purpose (optional)", "Category (optional)" (Fitness, Mind, Faith, Discipline, Other tags).  
**Tap:** Type cards, duration pills, replay cards, purpose trigger, category tags → set state. Next → handleNext.

### Step 2: Daily Tasks
**Exact text:** "Daily Tasks", "What must be done each day?", "QUICK START WITH PACKS", pack cards (Athlete, Faith, Entrepreneur, HYROX, Morning Routine), task list with Edit + Trash, "+ Add Task" / "Add your first daily task".  
**Tap:** Pack card → setTasks(pack.buildTasks()); task row → handleEditTask (opens TaskEditorModal); Trash → handleDeleteTask; Add Task → setShowTaskBuilder(true). Next → "Review >".

### Step 3: Review
**Exact text:** "Review", "Review before publishing", summary card (title, type, duration, visibility), "Visibility" (Everyone, Friends, Only me), "You can edit this later.", task list.  
**Tap:** Visibility cards → setVisibility. "Create Challenge" → handleCreate (API then router.push(ROUTES.SUCCESS) or paywall then success).

### Footer
**Exact text:** "< Back" (when step > 1), "Next: Add Tasks >" / "Review >" (step 1–2), "Create Challenge" / "Creating..." (step 3).  
**Tap:** Back → handleBack; Next → handleNext; Create Challenge → handleCreate.

### Modals
- **TaskEditorModal:** Cancel, Save → handleTaskSave.
- **Recovery modal:** "Server not responding", message, "Retry", "Back to Review".
- **PremiumPaywallModal:** Close → may then router.push(ROUTES.SUCCESS).

### States
- **Disabled:** Next disabled when !canProceedStep1 or !canProceedStep2; Create disabled when submitting or !canCreateChallenge.
- **Loading:** "Creating..." on button.

---

## ACTIVITY / MOVEMENT

**File:** `app/(tabs)/activity.tsx`  
**How to get here:** Tab bar → Movement (4th tab).  
**Layout:** SafeAreaView, header ("Movement", "Proof of discipline", "🧑‍🤝‍🧑 Teams" button), filter pills (🌐 Global, 🧑‍🤝‍🧑 Friends, 🧑‍🤝‍🧑 Team), ScrollView: daily stats card ("X secured today"), optional SuggestedFollows, "Top This Week" row, "Weekly Leaderboard" (top 3 + list), "THIS WEEK" movement feed (Respect / Nudge per row), "PROOF OF WORK" community feed, "Recent" activity. Pull-to-refresh.

### Header
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| Title | "Movement" | Top-left | — |
| Subtitle | "Proof of discipline" | Below title | — |
| Teams | "🧑‍🤝‍🧑 Teams" | Top-right | requireAuth then router.push(ROUTES.TEAMS) or Alert (beta) |

### Section: Filter pills
**Exact text:** "🌐 Global", "🧑‍🤝‍🧑 Friends", "🧑‍🤝‍🧑 Team".  
**Tap:** setFeedFilter.

### Section: Daily stats
**Exact text:** "X secured today" (with Shield icon). Non-tappable.

### Section: Top This Week
**Shows:** Avatar row with rank badges, names, "+X" score. Non-tappable.

### Section: Weekly Leaderboard
**Exact text:** "Weekly Leaderboard", "Resets Sunday", rank circles, names, scores, badges. Non-tappable list.

### Section: THIS WEEK (movement feed)
**Shows:** Rows with avatar, name, badge, "X days secured this week • Xd streak", Respect (ThumbsUp + count), "Nudge".  
**Tap:** Respect → onGiveRespect(userId); Nudge → onGiveNudge(userId) (disabled for self).

### Section: PROOF OF WORK
**Shows:** Feed items (e.g. "X completed Day Y of Z").  
**Tap:** Item → router.push(ROUTES.CHALLENGE_ID or PROFILE_USERNAME).

### Section: Recent
**Shows:** Activity items (follow, challenge_joined, respect, day_secured, streak_milestone, nudge). "Show X more" / "Show less".  
**Tap:** setExpanded(!expanded).

### States
- **Team filter:** Empty state "No team yet", "Create or join a team to see shared progress here."
- **Loading:** "Loading…" / COPY.loading.
- **Error:** COPY.couldNotLoad, COPY.pullToRetry.

---

## PROFILE

**File:** `app/(tabs)/profile.tsx`  
**How to get here:** Tab bar → Profile (5th tab).  
**Layout:** ScrollView with RefreshControl. ProfileHeader (avatar, full name, @username, tier badge, join date, "✏️ Edit", "🔗 Share"), DisciplineScoreCard, TierProgressBar, LifetimeStatsCard, DisciplineCalendar, DisciplineGrowthCard, AchievementsSection, optional streak-at-risk card, IntegrationsSection (Strava), menu rows (Profile: Public / Edit, Settings), "↪ Sign Out". Guest: card "Sign in to view your profile", "Sign in", "Sign up".

### Header (ProfileHeader component)
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| Avatar | Initial or image | Top | — |
| Full name | display_name / username | — | — |
| @username | @username | — | — |
| Tier badge | e.g. "Starter" | — | — |
| Joined date | "Joined [month year]" | — | — |
| ✏️ Edit | "✏️ Edit" | Actions | router.push(ROUTES.EDIT_PROFILE) |
| 🔗 Share | "🔗 Share" | Actions | handleShare (shareProfile) |

### Section: Discipline score card
**Shows:** Score, tier, days secured, friend rank. Non-tappable (or optional onPress from component).

### Section: Tier progress bar
**Shows:** Progress to next tier. Non-tappable.

### Section: Lifetime stats
**Shows:** Current streak, longest streak, days secured, challenges completed. Non-tappable.

### Section: Menu
| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | "Profile: Public" / "Edit" row | TouchableOpacity | Menu | router.push(ROUTES.SETTINGS) | `/settings` |
| 2 | "Settings" row ("Privacy, notifications, consequences") | TouchableOpacity | Menu | router.push(ROUTES.SETTINGS) | `/settings` |
| 3 | "↪ Sign Out" | TouchableOpacity | Danger section | handleLogout() → router.replace(ROUTES.AUTH) | `/auth` |

### Section: Integrations (Strava)
**Exact text:** "Integrations", "Strava", "Connected" / "Connect to verify...", "Disconnect" / "Connect Strava", "View recent activities" / "Hide recent activities".  
**Tap:** Disconnect / Connect / Toggle activities.

### Guest state
**Exact text:** "Sign in to view your profile", "Sign in to see your stats, streaks, and achievements.", "Sign in", "Sign up".  
**Tap:** Sign in → router.push(ROUTES.AUTH_LOGIN); Sign up → router.push(ROUTES.AUTH_SIGNUP).

### Error state
**Exact text:** "Profile Setup Issue" / "Connection Issue", message, "Retry", "Sign Out".  
**Tap:** Retry → onRefresh; Sign Out → handleLogout.

---

## LOGIN

**File:** `app/auth/login.tsx`  
**How to get here:** Auth redirect, Profile (guest) "Sign in", Welcome "Log in".  
**Layout:** SafeAreaView, back button, title, subtitle, email input, password input (with show/hide), "Forgot password?", "Sign in" button, "or" divider, Apple/Google buttons, "Sign up" link.

### Header
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| ← Back | ChevronLeft | Top-left | router.back() |

### Section: Form
**Exact text:** "Welcome back.", "Sign in to continue building your streak.", placeholder "Email", placeholder "Password", "Forgot password?", "Sign in", "or", "Continue with Apple", "Continue with Google", "Sign up" (link).  
**Tap:** Forgot password → router.push("/auth/forgot-password"); Sign in → handleSignIn (then replace create-profile or tabs); Show/hide password → setShowPassword; Sign up → router.push("/auth/signup").

### States
- **Loading:** Spinner on Sign in button.
- **Error:** formError inline below button.

---

## SIGNUP

**File:** `app/auth/signup.tsx`  
**How to get here:** Login "Sign up", onboarding.  
**Layout:** Back, title, form (display name, username, email, password), "Create account", Terms/Privacy links, "Already have an account? Log in".  
**Tap:** Back → router.back(); Create account → handleSignUp → router.replace(ROUTES.TABS); Log in → router.replace(ROUTES.AUTH_LOGIN); Terms/Privacy → router.push(ROUTES.LEGAL_*).

---

## FORGOT PASSWORD

**File:** `app/auth/forgot-password.tsx`  
**How to get here:** Login → "Forgot password?".  
**Layout:** Form to request reset. Submit → router.replace(ROUTES.AUTH_LOGIN).

---

## CREATE PROFILE

**File:** `app/create-profile.tsx`  
**How to get here:** After login when no username.  
**Layout:** Form (username, display name). "Continue" → create profile then router.replace("/(tabs)").

---

## WELCOME

**File:** `app/welcome.tsx`  
**How to get here:** First launch (pre-auth).  
**Layout:** Multi-step (goals, discipline level, signup). Step 4: display name, username, email, password. "Continue" / "Create account", "Already have an account? Log in".  
**Tap:** Log in → router.replace(ROUTES.AUTH_LOGIN); signup → router.replace(ROUTES.TABS).

---

## CHALLENGE DETAIL

**File:** `app/challenge/[id].tsx`  
**How to get here:** Tap challenge card from Home, Discover, or Activity.  
**Layout:** Header (back, title, more ⋯), gradient header with challenge name/difficulty/duration, progress, task list (each row: Start/Continue → task flow), optional team section, sticky CTA ("Commit" / "Start" / "Continue Today" or "Leave Challenge"). Commitment modal (checkbox "I'm in", "Not now").

### Header
| Element | Text/Icon | Position | Tap Action |
|---------|-----------|----------|------------|
| ← Back | ChevronLeft | Top-left | router.back() |
| More (⋯) | MoreHorizontal | Top-right | Alert: Share challenge / Invite friends |
| Leave Challenge | Text button | In sheet/header | handleLeave → Alert → leaveMutation then router.replace(ROUTES.TABS_DISCOVER) |

### Section: Task rows
**Tap:** "Start" / "Connect Strava" / etc. → router.push(ROUTES.TASK_* with taskId).

### Sticky CTA
**Exact text:** "Commit" / "Start" (not joined), "Continue Today" (joined).  
**Tap:** If joined → router.push(ROUTES.TABS). If not → handleJoin (commitment modal) or showGate("join").

### Commitment modal (inline)
**Exact text:** "I'm in" / "Not now", checkbox "I understand...".  
**Tap:** I'm in → handleCommitmentConfirm → join then router.replace(ROUTES.TABS). Not now / overlay → setShowCommitmentModal(false).

### Empty / error
**Exact text:** "Go back", "Retry", "Browse challenges".  
**Tap:** router.back(), challengeQuery.refetch(), router.push(ROUTES.TABS_DISCOVER).

### Team failed state
**Exact text:** "Challenge failed for all X team members", "Back to Home".  
**Tap:** router.replace(ROUTES.TABS).

---

## COMMITMENT

**File:** `app/commitment.tsx`  
**How to get here:** From Challenge Detail after tapping Start/Commit.  
**Layout:** Backdrop, card with title, "Confirm Commitment" button, "Cancel". Alert OK/Not now → router.replace(ROUTES.TABS).  
**Tap:** Backdrop / Cancel → router.back(); Confirm → handleConfirm (join API) → router.replace(ROUTES.TABS).

---

## CHALLENGE CHAT

**File:** `app/challenge/[id]/chat.tsx`  
**How to get here:** From Challenge Detail (if chat link present).  
**Layout:** Chat UI, back → router.replace(ROUTES.CHALLENGE_ID(id)), info → router.push(ROUTES.CHAT_INFO(id)).

---

## CHAT INFO

**File:** `app/challenge/[id]/chat-info.tsx`  
**How to get here:** Challenge Chat → info.  
**Layout:** Info content, back.

---

## SETTINGS

**File:** `app/settings.tsx`  
**How to get here:** Profile → Settings row.  
**Layout:** Back, "Settings" title. Sections: Privacy & Visibility (Profile/Challenge/Activity visibility pills), Profile row (email, "Tap to edit profile"), Friends card (count, "Open friends and accountability"), Notifications (Daily Reminder switch, Reminder time pills, Last Call switch, Friend Activity switch), Premium (Manage / Restore), Account (Sign Out, Delete account). Legal (Privacy Policy, Terms of Service).  
**Tap:** Back → router.back(); Edit profile → router.push(ROUTES.EDIT_PROFILE); Accountability → router.push(ROUTES.ACCOUNTABILITY); Reminder toggles → API; Subscription → router.push(ROUTES.PRICING) or restore; Sign Out → signOut + router.replace(ROUTES.AUTH); Delete → modal then router.replace(ROUTES.AUTH_LOGIN); Legal → router.push(ROUTES.LEGAL_*).

---

## EDIT PROFILE

**File:** `app/edit-profile.tsx`  
**How to get here:** Profile → Edit.  
**Layout:** Close (X), "Edit profile" (or similar), form fields, "Save".  
**Tap:** Close → router.back(); Save → handleSave (API) then router.back().

---

## SUCCESS

**File:** `app/success.tsx`  
**How to get here:** After creating challenge (or flow completion).  
**Layout:** Success message, "Continue", "Share".  
**Tap:** Continue → router.replace(ROUTES.TABS); Share → handleShare.

---

## DAY MISSED

**File:** `app/day-missed.tsx`  
**How to get here:** Deep link or flow when user missed a day.  
**Layout:** Message, CTA.  
**Tap:** CTA → router.push(ROUTES.TABS).

---

## SECURE CONFIRMATION

**File:** `app/secure-confirmation.tsx`  
**How to get here:** After securing day (from Home).  
**Layout:** Confirmation, CTA.  
**Tap:** CTA → router.replace(ROUTES.TABS_DISCOVER).

---

## TEAMS

**File:** `app/teams.tsx`  
**How to get here:** Activity → Teams button.  
**Layout:** Back, "Teams" title, icon, "Small Groups, Big Results", subtitle, "+ Create a Team" (opacity 0.5, "Coming Soon" below), "Join with Code" (opacity 0.5, "Coming Soon" below).  
**Tap:** Back → router.back(); Create → Haptics + Alert "Coming Soon"; Join → Haptics + Alert "Coming Soon".

---

## PRICING

**File:** `app/pricing.tsx`  
**How to get here:** Settings (non-premium) or in-app CTA.  
**Layout:** Back, package options, "Subscribe", "Restore purchases", Terms/Privacy links.  
**Tap:** Back → router.back(); Subscribe → handleSubscribe; Restore → handleRestore; Legal → router.push(ROUTES.LEGAL_*).

---

## CHALLENGE COMPLETE

**File:** `app/challenge/complete.tsx`  
**How to get here:** After completing a challenge.  
**Layout:** Success, "Browse more" / "Home".  
**Tap:** Browse → router.replace(ROUTES.TABS_DISCOVER); Home → router.replace(ROUTES.TABS_HOME).

---

## ACCOUNTABILITY

**File:** `app/accountability.tsx`  
**How to get here:** Profile/Settings → Friends/Accountability.  
**Layout:** List, "Add" or similar.  
**Tap:** Add → router.push(ROUTES.ACCOUNTABILITY_ADD).

---

## ACCOUNTABILITY ADD

**File:** `app/accountability/add.tsx`  
**How to get here:** Accountability → Add.  
**Layout:** Form, submit.  
**Tap:** Submit → router.replace(ROUTES.ONBOARDING_STEP4 or ROUTES.TABS).

---

## INVITE BY CODE

**File:** `app/invite/[code].tsx`  
**How to get here:** Deep link /invite/[code].  
**Layout:** Auto or CTA to join.  
**Tap:** router.replace(ROUTES.TABS) or router.replace(ROUTES.CHALLENGE_ID(challengeId)).

---

## PROFILE BY USERNAME

**File:** `app/profile/[username].tsx`  
**How to get here:** Tap profile from feed/activity.  
**Layout:** ProfileHeader (may show Edit if own), stats.  
**Tap:** Edit → router.push(ROUTES.EDIT_PROFILE); back / own profile → router.replace(ROUTES.TABS) or ROUTES.TABS_PROFILE.

---

## 404 / NOT FOUND

**File:** `app/+not-found.tsx`  
**How to get here:** No matching route.  
**Layout:** Stack.Screen title "Not Found". Centered: title, message, button.

### Section: Content
**Exact text:** "Page Not Found", "This screen doesn't exist.", "Go to Home".

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | "Go to Home" | Pressable (Link) | Center | Navigate to home | `/` |

---

## ONBOARDING QUESTIONS

**File:** `app/onboarding-questions.tsx`  
**How to get here:** Guest taps Join (pre-signup).  
**Layout:** SafeAreaView, step indicator (1–4), question text, option pills/cards, "Next" / "Continue". Step 1: main goal. Step 2: focus. Step 3: days per week. Step 4: solo/friends/both. On finish: setOnboardingAnswers + setPendingChallengeId, router.replace(ROUTES.AUTH_SIGNUP).

### Exact text (options)
- Step 1: "Build discipline", "Get fit", "Improve mindset", "Break bad habits", "All of the above".
- Step 2: "Fitness", "Mental health", "Productivity", "Diet & nutrition", "Social accountability".
- Step 3: "3 days", "5 days", "Every day".
- Step 4: "Solo", "With friends", "Both".

| # | What It Says / Shows | Type | Where On Screen | What Happens When You Tap It | Destination |
|---|---|---|---|---|---|
| 1 | Option pill/card | TouchableOpacity | Per step | setMainGoal / setFocus / setDaysPerWeek / setChallengePreference | Stays |
| 2 | "Next" / "Continue" | TouchableOpacity | Bottom | handleNext → step++ or replace signup | `/(tabs)` or `/auth/signup` |

---

## ONBOARDING (POST-SIGNUP)

**File:** `app/onboarding/index.tsx`, `app/onboarding/_layout.tsx`  
**How to get here:** After create-profile when onboarding not completed.  
**Layout:** Multi-step survey (7 steps). Back, Next, Skip. On complete: set onboarding_completed, router.replace(ROUTES.TABS).

---

## DAY 1 QUICK WIN

**File:** `app/day1-quick-win.tsx`  
**How to get here:** Deep link or flow after first join (day 1).  
**Layout:** Steps: (1) "I'm ready" → (2) task complete / intention input → (3) celebration. Modal: accountability prompt ("Add friends?", "Add friends", "Maybe later").  
**Exact text:** "Complete your first task", "I'm ready", "Mark complete", "Add friends?" (if shown).  
**Tap:** I'm ready → setWinStep(2); Mark complete → completeTask + refetchAll, setShowCelebration; Add friends → router.push(ROUTES.ACCOUNTABILITY_ADD); Maybe later → dismiss. Then "Continue" / "Home" → router.replace(ROUTES.TABS).

---

## LEGAL TERMS

**File:** `app/legal/terms.tsx`  
**How to get here:** Settings / Signup → Terms of Service link.  
**Layout:** SafeAreaView, ScrollView. Title "GRIIT Terms of Service", "Last updated: March 2025", sections: Acceptance of Terms, Account Responsibilities, Subscription and Billing, Acceptable Use, Intellectual Property, Limitation of Liability, Termination, Contact (griit.health@gmail.com). No tappable navigation; read-only.

---

## LEGAL PRIVACY POLICY

**File:** `app/legal/privacy-policy.tsx`  
**How to get here:** Settings / Signup → Privacy Policy link.  
**Layout:** Similar to Terms — title, sections, read-only. Back via stack.

---

## TASK SCREENS

**Files:** `app/task/run.tsx`, `app/task/journal.tsx`, `app/task/timer.tsx`, `app/task/photo.tsx`, `app/task/checkin.tsx`, `app/task/manual.tsx`, `app/task/complete.tsx`  
**How to get here:** Challenge Detail → tap task (Start/Continue).  
**Layout:** Each task type has its own UI (run: distance/time; journal: text; timer: countdown; photo: capture; checkin: location; manual: tap complete). Back, submit/complete.  
**Tap:** Back → router.back(); Complete → router.push(ROUTES.TASK_COMPLETE) or back to challenge. Task complete screen → router.replace(ROUTES.CHALLENGE_ID) or home.

---

## SHARED COMPONENTS

### GRIITWordmark
**Used on:** Home. Shows "GRIIT", optional subtitle "Build Discipline Daily", compact mode for guest. Non-tappable.

### CreateFlowHeader
**Used on:** Create tab, TaskEditorModal. Left: "Cancel" (onCancel). Right: "Next" / "Review" / "Save" (onRight, disabled when rightDisabled). Tap: onCancel → typically router.back(); onRight → step next or save.

### ProfileHeader (components/profile/ProfileHeader.tsx)
**Used on:** Profile, profile/[username]. Avatar, fullName, @username, tier, joinDate, "✏️ Edit", "🔗 Share". Tap: Edit → router.push(ROUTES.EDIT_PROFILE); Share → onShare().

### ChallengeCard (components/home/ChallengeCard.tsx)
**Used on:** Home (ActiveChallenges). Card with challenge name, progress badge, optional team/shared goal badge. Tap: onOpenChallenge?.(); router.push(ROUTES.CHALLENGE_ID(challengeId)).

### LiveFeedCard (components/home/LiveFeedCard.tsx)
**Used on:** Home (feed). Renders secured_day, milestone, challenge_promo, rank_up. Respect/Chase pills: onRespect/onChase or placeholder (Haptics + Alert). Open Challenge: onOpenChallenge(id). View Profile: onViewProfile.

### AuthGateModal
**Used on:** When guest tries protected action. "Sign up to commit.", "Continue with email", "Sign up with email". Backdrop closes; Continue → router.push(ROUTES.AUTH_LOGIN); Sign up → router.push(ROUTES.AUTH_SIGNUP).

### EmptyState (src/components/ui/EmptyState.tsx)
**Used on:** Discover (empty). Title, subtitle, primary CTA, secondary CTA (e.g. "Refresh"). Tap: onPrimaryCta, onSecondaryCta.

### FilterChip, CategoryTag, DurationPill, ChallengeTypeCard
**Used on:** Discover, Create. Tap: onPress with key/value. Parent controls navigation or state.

### TaskEditorModal
**Used on:** Create tab. Cancel, Save. Tap: onCancel (close), onSave (handleTaskSave).

### PremiumPaywallModal
**Used on:** Create (after 3rd create). Close. Tap: onClose (may then navigate to success).

### SectionHeader (src/components/ui)
**Used on:** Discover. Title, icon, caption. Non-tappable.

### SearchBar (src/components/ui)
**Used on:** Discover. value, onChangeText, placeholder, onClear. Tap: clear button clears search.

### ChallengeCard24h, ChallengeCardFeatured, ChallengeRowCard (src/components/ui)
**Used on:** Discover. Entire card/row tappable; onPress from parent → router.push(ROUTES.CHALLENGE_ID(id)).

### PrimaryButton, PrimaryButtonCreate (src/components/ui)
**Used on:** Auth, Create, modals. Label and onPress from parent.

### SuggestedFollows
**Used on:** Home, Activity. User rows. Tap: onUserPress(u) → router.push(ROUTES.PROFILE_USERNAME(u.username)).

### DisciplineScoreCard, TierProgressBar, LifetimeStatsCard, DisciplineCalendar, DisciplineGrowthCard, AchievementsSection (components/profile)
**Used on:** Profile. Display + optional onPress. No navigation in component; parent can pass.

### ErrorBoundary
**Used on:** Multiple screens. Wraps content; shows error UI on throw. Retry if provided.

### SkeletonLoader / HomeScreenSkeleton
**Used on:** Home (loading). Placeholder blocks. Non-tappable.

---

*End of APP_BREAKDOWN. Every screen and shared component documented with sections A–F where applicable.*
