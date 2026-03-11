# Full Codebase Audit Report — What's Real, What's Broken, What's Missing

**Date:** Generated from codebase read.  
**Scope:** React Native (Expo) app, Hono/tRPC backend, Supabase/Postgres.  
**Rule:** Audit only; no fixes applied.

---

## STEP 1–2: Data flow summary by screen

### Auth — Login (`app/auth/login.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Email, password | Local state | — | Labels: "Email", "Password" (clear). |
| signInWithPassword | Supabase auth | REAL | Calls `supabase.auth.signInWithPassword`. |
| Errors | Alert | REAL | Shows error.message. |
| After login | Auth state + _layout | REAL | No explicit redirect; AuthRedirector sends to create-profile (no profile) or tabs. |
| Username login | — | MISSING | Email only; no "forgot password" link. |

### Auth — Signup (`app/auth/signup.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Email, password, confirm | Local state | — | Validation: non-empty, length ≥6, match. |
| signUp | Supabase auth | REAL | `supabase.auth.signUp`. |
| After signup | router.replace | REAL | Goes to CREATE_PROFILE (fixed in prior pass). |
| Duplicate/weak password | Alert | REAL | Rate limit cooldown; no email confirmation handling in UI. |

### Create Profile (`app/create-profile.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Username, display name, bio | Local state | — | Username required, validated (length, pattern). |
| Save | Supabase upsert + tRPC | REAL | `profiles` upsert (user_id, username, display_name, bio, onboarding_completed); then `profiles.update` for onboarding_answers if pending. |
| Uniqueness | DB 23505 | REAL | "Username is already taken" on conflict. |
| After save | router.replace | REAL | Goes to ONBOARDING. |

### Onboarding Questions (`app/onboarding-questions.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| 4 steps: main goal, focus, days/week, solo/group | Local state | — | Options are hardcoded. |
| Persist | AsyncStorage | PARTIAL | `setOnboardingAnswers` (onboarding-pending); not written to Supabase by this screen. |
| onboarding_completed | — | NOT SET | This screen does not set it; redirects to AUTH_SIGNUP. |
| Flow | Pre-signup | — | Entry point: guest taps Join → gate → onboarding-questions → signup. Create-profile then sends to onboarding.tsx (post-signup). Two different flows. |

### Onboarding (`app/onboarding.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| 7 steps: Welcome, How heard, Notifications, Goal, Time, Pick challenge, Done | Local state + starters | REAL | Saves to profiles via `profiles.update` (onboarding_completed, onboarding_answers, primary_goal, daily_time_budget, starter_challenge_id). |
| First challenge | starters.join | REAL | `trpcMutate("starters.join", { starterId })` creates real active_challenge. |
| Push permission | expo-notifications | REAL | Requested on notifications step. |

### Home (`app/(tabs)/index.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Active challenge | AppContext → challenges.getActive | REAL | tRPC; Supabase active_challenges + challenges + challenge_tasks. |
| Today's tasks / progress | checkins.getTodayCheckinsForUser, listMyActive | REAL | Real check-ins and task completion. |
| Stats (streak, score, rank) | profiles.getStats | REAL | Streaks, day_secures, tier, etc. |
| LIVE feed | Hardcoded empty array | FAKE / STUB | `liveFeedItems = []`; no feed.list call. Shows "No activity yet" + SuggestedFollows (leaderboard). |
| Leaderboard (position, entries) | leaderboard.getWeekly | REAL | Used for "YOUR POSITION" and SuggestedFollows. |
| Suggested challenges | challenges.getFeatured(limit: 3) | REAL | When no active challenge. |
| Secure Day | checkins.secureDay | REAL | RPC + day_secures, streaks, active_challenges update. |

### Discover (`app/(tabs)/discover.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Starter Pack | challenges.getStarterPack | REAL | Requires challenges with source_starter_id in DB. Seed in scripts/seed-challenges.sql. |
| Featured / More | challenges.getFeatured | REAL | Paginated; visibility=PUBLIC, status=published. |
| Category filter | Client filter + query param | REAL | activeCategory passed to getFeatured. |
| Search | getFeatured search param | REAL | Backend ilike on title. |
| Unauthenticated | publicProcedure | REAL | getStarterPack and getFeatured are public. |
| Type import | @/mocks/starter-challenges | TYPE ONLY | No mock data rendered; API data used. |

### Challenge Detail (`app/challenge/[id].tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Challenge (UUID) | challenges.getById | REAL | Supabase challenges + challenge_tasks. |
| Challenge (id like starter-* or daily-*) | STARTER_CHALLENGES (mock) | FAKE | When `id.startsWith("starter-")` or `"daily-"`, uses mocks/starter-challenges; no DB. |
| Join (real UUID) | challenges.join | REAL | RPC join_challenge, active_challenges insert. |
| Join (starter) | commitment.tsx | N/A | commitment isStarter: saveJoinedStarterId only; no backend join. Discover uses real UUIDs from getStarterPack so normal join path used. |
| Leave | challenges.leave | REAL | Backend leave. |
| Share | inviteToChallenge (deep link) | REAL | lib/share. |
| 24h countdown | ch.ends_at from getById | REAL | From DB. |

### Commitment (`app/commitment.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| challengeId, isStarter from params | Navigation | — | From discover or challenge detail. |
| Confirm (real challenge) | challenges.join + referrals.markJoinedChallenge | REAL | refetchAll after. |
| Confirm (isStarter) | saveJoinedStarterId (AsyncStorage) only | PARTIAL | No challenges.join; user sees "You're in!" but no active_challenge created unless they came from onboarding starters.join. |

### Create Challenge (`app/(tabs)/create.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Step 1: title, type, duration, category, etc. | Local state | — | |
| Step 2: tasks | TaskEditorModal | REAL | Builds payload; backend buildTaskInsertPayload. |
| Create | challenges.create | REAL | Inserts challenges + challenge_tasks. |
| Appear in Discover | getFeatured | REAL | If visibility PUBLIC, status published. |
| Soft paywall | FLAGS / premium | REAL | After 3rd create; PremiumPaywallModal. |

### Movement/Activity (`app/(tabs)/activity.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Leaderboard / Top This Week | leaderboard.getWeekly | REAL | Entries, currentUserRank, totalSecuredToday. |
| Friends tab | Same leaderboard + SuggestedFollows | REAL | "Find people to follow" with leaderboard entries. |
| Activity feed (respects/nudges) | respects.getForUser, nudges.getForUser | REAL | Combined into activity items. |
| Respect button | respects.give | REAL | Mutation. |
| Nudge | nudges.send | REAL | Mutation. |
| Teams button | ROUTES.TEAMS or Alert (beta) | REAL | Navigates or "Coming in the next update". |

### Profile (`app/profile/[username].tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Profile data | profiles.getPublicByUsername | REAL | user_id, username, display_name, avatar_url, total_days_secured, tier, active_streak. |
| Stats / calendar | Same + getSecuredDateKeys etc. | REAL | (Own profile uses (tabs)/profile.tsx with getStats, getCompletedChallenges, getSecuredDateKeys.) |

### Settings (`app/settings.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Reminder toggle / time | notifications.getReminderSettings, updateReminderSettings | REAL | profiles.preferred_secure_time, etc. |
| Accountability count | accountability.listMine | REAL | |
| Visibility toggles | UI state | PARTIAL | VisibilitySubsection exists; need to confirm profiles.update visibility fields if used. |
| Restore Purchases | restorePurchases (RevenueCat) | REAL | lib/subscription. |

### Teams (`app/teams.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| hasTeam | Hardcoded false | FAKE | `const hasTeam = false;` |
| Team data | MOCK_TEAM | FAKE | Used when hasTeam true (never in current code). |
| Create Team | handleCreateSubmit | STUB | Only closes modal and clears teamName; no backend call. |
| Roster / Chat / Secure for Team | — | FAKE / STUB | All based on MOCK_TEAM; no real mutations. |

### Task completion (app/task/*)

| Screen | Backend | Real/Fake | Notes |
|--------|---------|-----------|--------|
| journal | checkins.complete (noteText, taskId, activeChallengeId) | REAL | |
| timer | checkins.complete (value = minutes) | REAL | |
| photo | checkins.complete (proofUrl) | REAL | |
| run | checkins.complete (value, proofUrl optional) | REAL | |
| checkin | checkins.complete (optional proof); location | REAL | mockLocationDetected is UI state only. |
| simple | checkins.complete | REAL | |

### Secure Confirmation (`app/secure-confirmation.tsx`)

| Data / Action | Source | Real/Fake | Notes |
|---------------|--------|-----------|--------|
| Params | Navigation | — | From secureDay success. |
| Share | inviteToChallenge | REAL | |

---

## STEP 3: Backend route audit (concise)

| Route | Used by frontend? | Works? | Notes |
|-------|--------------------|--------|--------|
| auth.signUp, signIn, getSession | Yes (auth, init) | Yes | Supabase auth. |
| profiles.get, getStats, update, getPublicByUsername, getCompletedChallenges, getSecuredDateKeys | Yes | Yes | Multiple screens. |
| challenges.list | Not in app (getFeatured/getStarterPack used) | Yes | Public. |
| challenges.getFeatured, getStarterPack, getById, join, leave, getActive, listMyActive, create, startTeamChallenge | Yes | Yes | Discover, detail, home, create, commitment. |
| checkins.complete, getTodayCheckins, getTodayCheckinsForUser, secureDay | Yes | Yes | Task completion, home. |
| starters.join | Yes (onboarding) | Yes | Creates active_challenge from starter template. |
| leaderboard.getWeekly | Yes (home, activity) | Yes | |
| respects.give, getForUser | Yes (activity) | Yes | |
| nudges.send, getForUser | Yes (activity) | Yes | |
| feed.list | Path exists; not used by Home (Home uses empty array + leaderboard) | Stub | Returns `[]`. |
| stories.list | AppContext | Yes | |
| notifications.getReminderSettings, updateReminderSettings | Settings | Yes | |
| accountability.listMine, remove, respond | Settings, accountability screen | Yes | |
| referrals.recordOpen, markJoinedChallenge | Challenge detail, commitment | Yes | |
| meta.version | Public; no UI | Yes | |
| integrations.* (Strava, etc.) | Profile, challenge detail | Yes | |
| sharedGoal.* | Challenge detail (shared_goal challenges) | Yes | |

---

## STEP 4: Database audit (tables referenced in backend)

| Table | Used by | Has RLS? (from migrations) | Notes |
|-------|---------|----------------------------|--------|
| profiles | profiles, checkins, leaderboard, streaks, notifications | Yes | user_id, onboarding_completed, onboarding_answers. |
| challenges | challenges, checkins, starters | Yes | visibility, status, duration_type, source_starter_id. |
| challenge_tasks | challenges, checkins | Yes | task_type, config. |
| active_challenges | profiles, checkins, challenges, guards | Yes | |
| check_ins | checkins | Yes | |
| day_secures | checkins, leaderboard, profiles | Yes | RPC secure_day. |
| streaks | profiles, checkins, streaks | Yes | |
| streak_freezes | streaks | Yes | |
| last_stand_uses | profiles, checkins | Yes | |
| stories, story_views | stories | Yes | |
| push_tokens | notifications | Yes | |
| respects | respects | Yes | |
| nudges | nudges | Yes | |
| invite_tracking | referrals | Yes | |
| connected_accounts | integrations (Strava) | Yes | |
| shared_goal_logs | sharedGoal | Yes | |
| challenge_members | challenges (team) | Yes | |

Migrations present for: schema_fixes (profiles, challenges, status), secure_day RPC, join_challenge RPC, team challenges, referrals, onboarding_answers, reminders, visibility uppercase, challenges RLS, 24h starts/ends, starter_challenges_seed, discover_challenges_seed (name from prompt; file may be 20250308000000). Seed data: run scripts/seed-challenges.sql for featured + starter pack if DB empty.

---

## STEP 5: Environment / config

- **App:** EXPO_PUBLIC_API_URL or EXPO_PUBLIC_API_BASE_URL (backend base). EXPO_PUBLIC_DEEP_LINK_BASE_URL, EXPO_PUBLIC_APPLE_APP_ID, EXPO_PUBLIC_PLAY_STORE_PACKAGE. Supabase: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (from env load in lint).
- **Backend:** CORS_ORIGIN, CRON_SECRET, Supabase (service role if used), REQUEST_BODY_MAX_BYTES. Rate limit (Upstash): backend uses checkRateLimit.
- No hardcoded secrets in scanned files; API base and Supabase come from env.

---

## STEP 6: Summary report

### CATEGORY 1: FULLY WORKING (real data, real backend, real DB)

- Auth: login (email/password), signup → create-profile → onboarding.
- Create profile: username uniqueness, Supabase + tRPC profiles.update, redirect to onboarding.
- Onboarding: 7-step survey, starters.join, profiles.update (onboarding_completed, onboarding_answers).
- Home: active challenge (getActive), today tasks (getTodayCheckinsForUser, listMyActive), stats (getStats), leaderboard (getWeekly), suggested challenges (getFeatured limit 3), Secure Day (secureDay), empty LIVE state + SuggestedFollows from leaderboard.
- Discover: getStarterPack, getFeatured (with category/search), public (no auth).
- Challenge detail: getById for UUIDs; join, leave, share; 24h countdown from ends_at.
- Commitment: challenges.join for real IDs; refetchAll; isStarter path only stores AsyncStorage (no backend join).
- Create challenge: full flow, challenges.create, TaskEditorModal, validation.
- Task completion: journal, timer, photo, run, checkin → checkins.complete.
- Movement/Activity: leaderboard.getWeekly, respects.give, nudges.send, getForUser feeds, SuggestedFollows on Friends tab.
- Profile (public): getPublicByUsername.
- Settings: reminder settings, accountability list, restore purchases.
- Accountability: listMine, remove, respond.

### CATEGORY 2: FAKE / MOCK DATA (UI shows something but data is hardcoded)

1. **Challenge detail for "starter-*" / "daily-*" IDs**  
   Uses `STARTER_CHALLENGES` from mocks/starter-challenges (fake counts, fake tasks). Discover uses real UUIDs from getStarterPack so this path is only for old or direct links with mock IDs. **Fix:** Prefer real getById for all IDs; or remove mock path and 404 for non-UUIDs.

2. **Teams screen**  
   `hasTeam = false` and `MOCK_TEAM` for roster/chat/secure. Create Team does not call any backend. **Fix:** Implement teams API (create, join by code, roster, secure for team) or show a single "Coming soon" state.

3. **feed.list**  
   Backend returns `[]`; Home does not call it (shows empty state + leaderboard). **Fix:** Either implement feed from day_secures/respects/activity or leave as stub and keep current Home UX.

### CATEGORY 3: BROKEN (code exists but doesn’t work)

1. **Commitment isStarter path**  
   When isStarter=1, only saveJoinedStarterId(AsyncStorage); no challenges.join or starters.join. User sees "You're in!" but no active_challenge. **Fix:** For starter IDs that map to backend starters (e.g. onboard-water), call starters.join and then redirect; or stop using isStarter from Discover (use real UUIDs only).

2. **Discover empty if DB not seeded**  
   getStarterPack and getFeatured return [] if no rows (visibility=PUBLIC, status=published; getStarterPack also needs source_starter_id). **Fix:** Run scripts/seed-challenges.sql (or equivalent migration) in Supabase.

3. **Onboarding-questions vs onboarding**  
   onboarding-questions is pre-signup (saves to AsyncStorage, redirects to signup); create-profile then sends to onboarding.tsx. onboarding_answers from onboarding-questions are passed via create-profile to profiles.update. If user goes signup → create-profile → onboarding (no onboarding-questions), those 4 answers are never collected. **Fix:** Clarify product flow: either drop onboarding-questions or merge its steps into post-signup onboarding.

### CATEGORY 4: MISSING (feature expected but no or incomplete code)

1. **Login by username**  
   Prompt asked for username or email; only email implemented. **Fix:** Resolve username → email (e.g. profiles lookup) and allow login by username.

2. **Forgot password**  
   No link or flow. **Fix:** Add "Forgot password?" and Supabase reset flow.

3. **Teams backend**  
   No create team, join by code, roster, or "secure for team" mutations. **Fix:** Add tRPC routes and DB (team table, team_members, etc.) or keep UI as "Coming soon".

4. **Feed content**  
   feed.list is stub; no "real" feed of activity (e.g. day_secures + profile). **Fix:** Implement feed.list from DB or accept current empty + suggested follows.

5. **Visibility in Settings**  
   VisibilitySubsection exists; need to confirm profiles.update writes profile visibility and that backend supports it. **Fix:** If not, add visibility to profile update and backend.

### CATEGORY 5: RORK AI ARTIFACTS (should be removed or isolated)

1. **mocks/starter-challenges.ts**  
   Large mock array (starter-1..daily-6). Still used by challenge/[id].tsx when id is starter-* or daily-*. **Action:** Remove mock path from challenge detail and rely on getById + real seed, or keep only for offline/dev fallback and document.

2. **STARTER_CHALLENGES in challenge/[id].tsx**  
   Fallback for non-UUID ids. **Action:** Same as above; prefer real API only.

3. **MOCK_TEAM in teams.tsx**  
   **Action:** Remove when teams are real or replace with single "Coming soon" screen.

4. **onboarding-questions.tsx**  
   Pre-signup survey; overlaps with onboarding.tsx. **Action:** Either remove and use one onboarding flow or clearly separate "pre-signup" vs "post-signup" and document.

---

## Onboarding flows (clarification)

- **onboarding-questions** (`app/onboarding-questions.tsx`): **Pre-signup, optional.** Entry when a guest taps Join. Saves 4 answers to AsyncStorage only; redirects to signup. Does not set `onboarding_completed`.
- **create-profile** (`app/create-profile.tsx`): If pre-signup answers exist, writes them via `profiles.update` (`onboarding_answers`, `onboarding_completed: true`) so they are stored in Supabase. Then redirects to onboarding.
- **onboarding** (`app/onboarding.tsx`): **Post-signup, required.** Runs when `onboarding_completed === false`. 7-step survey; sets `onboarding_completed`, `onboarding_answers`, `primary_goal`, `daily_time_budget`, `starter_challenge_id` via `profiles.update`; calls `starters.join` for first challenge.

Both flows can set `onboarding_completed` / `onboarding_answers`: create-profile when user came from onboarding-questions; onboarding.tsx when user completes the post-signup survey.

---

## PRIORITY FIX ORDER

1. **Discover empty** — Run seed (scripts/seed-challenges.sql) so getStarterPack/getFeatured return data.
2. **Commitment isStarter** — Use starters.join for starter IDs or stop using isStarter for Discover-sourced joins (real UUIDs only).
3. **Teams** — Replace MOCK_TEAM with "Coming soon" or implement full teams backend + UI.
4. **Challenge detail mock path** — Remove or gate STARTER_CHALLENGES; use getById for all valid IDs.
5. **Onboarding-questions vs onboarding** — Unify or clearly separate flows; ensure onboarding_completed and onboarding_answers set correctly.
6. **feed.list** — Implement real feed or formally document as stub and keep current Home behavior.
7. **Login by username** — Optional; add username → email resolution.
8. **Forgot password** — Optional; add reset flow.
9. **Visibility in Settings** — Confirm and wire profile visibility to backend.
10. **Remove or isolate mocks** — starter-challenges mock, MOCK_TEAM, dead onboarding path.

---

*End of audit. No code was changed.*
