# GRIIT App — Full-Stack Performance & Completeness Scorecard Report

**Purpose:** Honest audit of the entire GRIIT app (frontend + backend) as it exists now.  
**Scoring:** ✅ COMPLETE (3 pts) | ⚠️ PARTIAL (1 pt) | ❌ MISSING (0 pts)

---

## PART A — FRONTEND AUDIT (150 points max)

### A1. First-Time User Experience (30 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| A1.1 | App opens to onboarding (not login) for first-time users | ✅ 3 | `_layout.tsx`: `hasLaunched` from AsyncStorage; if `!user && !hasLaunched` → replace to `/welcome` |
| A1.2 | Welcome screen renders with branding and CTA | ✅ 3 | `welcome.tsx`: "G R I I T", "Build discipline that lasts.", "Let's go" button; step 1 |
| A1.3 | Goals selection screen (step 2) works | ✅ 3 | Multi-select GOAL_OPTIONS cards, at least 1 required, "Continue" |
| A1.4 | Discipline level screen (step 3) works | ✅ 3 | Single-select DISCIPLINE_OPTIONS rows, "Continue" |
| A1.5 | Signup form (step 4) works end-to-end | ✅ 3 | displayName, username, email, password; validation, username check, Supabase signUp + profile upsert, navigate to Home |
| A1.6 | Onboarding answers are saved to database | ✅ 3 | After signup, `profiles.update` with `onboarding_completed: true`, `onboarding_answers: { goals, disciplineLevel }` |
| A1.7 | Progress indicator shows correct step | ✅ 3 | TOTAL_STEPS = 4; step dots/indicator in welcome flow |
| A1.8 | Back navigation works on steps 2–4 | ✅ 3 | ChevronLeft in header; `setStep(s => s - 1)`; state retained |
| A1.9 | "Skip" on welcome goes to signup | ⚠️ 1 | Welcome step has "Let's go" (no explicit "Skip"); flow is Welcome→Goals→Discipline→Signup; no skip-to-signup without goals/discipline |
| A1.10 | Returning user sees Login, not onboarding | ✅ 3 | When `hasLaunched === true`, unauthenticated user is sent to `/auth` (login), not `/welcome` |

**A1 Score: 27 / 30**

### A2. Authentication (27 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| A2.1 | Login with valid credentials → Home | ✅ 3 | signInWithPassword; AuthRedirector sends to TABS when session + profile + onboarding_completed |
| A2.2 | Login with wrong password → error message | ✅ 3 | mapAuthError; Alert; loading cleared |
| A2.3 | Signup with duplicate email → error message | ✅ 3 | mapAuthError handles "already registered" (signup + welcome) |
| A2.4 | Username availability check (real-time) | ✅ 3 | welcome + signup: debounced check; "Available" / "Taken" |
| A2.5 | Password strength indicator | ✅ 3 | getPasswordStrength (weak/medium/strong); colored bars in welcome + signup |
| A2.6 | Password show/hide toggle | ✅ 3 | Eye/EyeOff; secureTextEntry toggled on login and signup |
| A2.7 | Session persists across app kill + reopen | ✅ 3 | Supabase persistSession + AsyncStorage; session restored on launch |
| A2.8 | Sign out clears session and navigates to Login | ✅ 3 | signOut(); router.replace(ROUTES.AUTH); no back stack |
| A2.9 | Forgot password flow works | ✅ 3 | `/auth/forgot-password` screen; `resetPasswordForEmail`; link from login |

**A2 Score: 27 / 27**

### A3. Home Screen (30 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| A3.1 | Header: "G R I I T" logo, subtitle, two pill badges | ✅ 3 | Serif logo, Score + Streak pills with shadow |
| A3.2 | Status card: "Today is not secured" / "You showed up" | ✅ 3 | DailyStatus; conditional on task completion / secured |
| A3.3 | "Explore challenges" button → Discover | ✅ 3 | heroCTA / ExploreChallengesButton → Discover tab |
| A3.4 | Active challenges: shows challenge OR empty state | ✅ 3 | homeActiveQuery; card or EmptyChallengesCard "Discover challenges" |
| A3.5 | Stats row: Streak / Score / Rank with real data | ✅ 3 | stats from API; streak, score, rank (tier) |
| A3.6 | "Discipline this week" card with data | ✅ 3 | disciplineWeek card; weekly score / trend |
| A3.7 | "Start your first challenge" card (new users) | ✅ 3 | EmptyChallengesCard with dashed border, "Find a challenge" |
| A3.8 | "Suggested for you" section with challenge rows | ✅ 3 | challenges.getFeatured(limit: 3/6); tappable → Challenge Detail |
| A3.9 | LIVE feed section | ⚠️ 1 | Home shows leaderboard + "friends secured today"; LIVE feed is leaderboard-style, not activity-feed (secured_day events) |
| A3.10 | Leaderboard section | ✅ 3 | leaderboard.getWeekly; entries, currentUserRank, totalSecuredToday; empty "Be the first" state |

**A3 Score: 27 / 30**

### A4. Discover Page (21 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| A4.1 | Header and search bar | ✅ 3 | "Discover" title; search input; filters challenges |
| A4.2 | Category filter chips work | ✅ 3 | All/Fitness/Mind/Discipline etc.; activeCategory; list filtered |
| A4.3 | 24-Hour Challenges section | ✅ 3 | duration_type 24h; horizontal scroll; countdown (ends_at) |
| A4.4 | Featured challenge card | ✅ 3 | FEATURED badge; difficulty; task chips; theme_color |
| A4.5 | More Challenges list | ✅ 3 | Vertical cards; colored borders; joined count; tappable |
| A4.6 | Tapping any challenge → Challenge Detail | ✅ 3 | router.push(`/challenge/${id}`) with correct data |
| A4.7 | Search actually filters results | ✅ 3 | useDebounce(300); challenges.getFeatured/list with search param; client filter fallback |

**A4 Score: 21 / 21**

### A5. Challenge Detail + Commitment (24 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| A5.1 | Orange theme for Extreme/Hard | ✅ 3 | theme_color / difficulty; orange header and accents; "Start" CTA |
| A5.2 | Green theme for Medium/Easy | ✅ 3 | Green header and accents; "Commit" button |
| A5.3 | Challenge name in bold italic serif | ✅ 3 | Large white text on colored bg; italic serif |
| A5.4 | Participants row with avatars and counts | ✅ 3 | Overlapping avatars; "X in this challenge", "Y active today" |
| A5.5 | Stats cards with percentages | ✅ 3 | completion / participation stats; accent-colored |
| A5.6 | Today's Missions list | ✅ 3 | Mission names, icons, type badges, "Start ›" links |
| A5.7 | Rules list with checkmarks + warning | ✅ 3 | Rules text; one-miss-resets warning where applicable |
| A5.8 | Commitment modal opens and shows correct data | ✅ 3 | Shield icon; challenge details; Confirm/Cancel; challenges.join on confirm |

**A5 Score: 24 / 24**

### A6. Profile & Settings (18 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| A6.1 | Profile loads user data (name, username, rank, stats) | ✅ 3 | Profile query; displayName, username, tier, join date |
| A6.2 | Avatar with warm color from username | ✅ 3 | getAvatarColor(username \|\| displayName); colored circle + initial |
| A6.3 | Stats row (STREAK, BEST, SECURED, DONE) | ✅ 3 | Real numbers from streaks / profile / completed |
| A6.4 | Activity heatmap | ✅ 3 | GitHub-style grid; secured dates from API |
| A6.5 | Achievements (locked/unlocked) | ✅ 3 | Horizontal scroll; lock icons; badge names from definitions |
| A6.6 | Settings: Privacy toggles (Public/Friends/Private) | ✅ 3 | profile_visibility; profiles.update(profile_visibility) |

**A6 Score: 18 / 18**

**PART A SUBTOTAL: 144 / 150**

---

## PART B — BACKEND AUDIT (120 points max)

### B1. Database Schema (30 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| B1.1 | `profiles` table with required columns | ⚠️ 1 | seed.sql has username, display_name, etc.; profiles route expects onboarding_completed, onboarding_answers, primary_goal, daily_time_budget — need ADD COLUMN migration if not in seed |
| B1.2 | `challenges` table with required columns | ✅ 3 | id, title, description, duration_type, duration_days, difficulty, category, visibility, is_featured, theme_color, etc.; challenge_tasks separate |
| B1.3 | `active_challenges` (user commitments) | ✅ 3 | user_id, challenge_id, status, start_at, end_at, current_day; RLS |
| B1.4 | `check_ins` / task completions | ✅ 3 | user_id, active_challenge_id, task_id, date_key, status, value, note_text, proof_url; UNIQUE(active_challenge_id, task_id, date_key) |
| B1.5 | `day_secures` / activity | ✅ 3 | day_secures table (user_id, date_key); migration-core-fixes; feed.list is stub (returns []) |
| B1.6 | Leaderboard / ranking logic | ✅ 3 | No separate leaderboard table; leaderboard.getWeekly computes from day_secures + profiles + streaks |
| B1.7 | Achievements definitions + user link | ⚠️ 1 | Profile UI shows achievement badges; definitions in app/lib; no user_achievements table in seed — may be computed or separate migration |
| B1.8 | Friends / social table | ✅ 3 | accountability_pairs (inviter, invitee, status); accountability router |
| B1.9 | Teams table | ❌ 0 | No teams table in seed or migrations; accountability is partner-based |
| B1.10 | Seed data for challenges | ✅ 3 | seed.sql: 10 featured challenges with title, description, rules, theme_color, duration, difficulty, category |

**B1 Score: 24 / 30**

### B2. API / Backend Logic (30 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| B2.1 | Challenges CRUD: list, get by ID, filter by category | ✅ 3 | challenges.list (search, category, cursor); getById; getFeatured |
| B2.2 | User challenge commitment (join) | ✅ 3 | challenges.join + starters.join; creates active_challenges row |
| B2.3 | Task completion endpoint | ✅ 3 | checkins.complete; upserts check_ins; validates proof/journal/timer |
| B2.4 | Day securing logic | ✅ 3 | checkins.secureDay; all required tasks done → insert day_secures, update streak |
| B2.5 | Streak calculation | ✅ 3 | lib/streak.ts; computeNewStreakCount; consecutive secured days; reset on miss |
| B2.6 | Score/discipline calculation | ✅ 3 | progression (tier); total_days_secured; leaderboard by secured days |
| B2.7 | Rank determination | ✅ 3 | getTierForDays (progression); tier on profile |
| B2.8 | Activity feed generation | ⚠️ 1 | feed.list returns []; no writes on secure_day/lost_streak/achievement; Movement tab uses respects + nudges |
| B2.9 | Leaderboard query | ✅ 3 | leaderboard.getWeekly; day_secures + profiles + streaks; currentUserRank, entries |
| B2.10 | Achievement unlocking | ⚠️ 1 | last_stand, progression exist; no explicit achievement-unlock write or user_achievements table verified |

**B2 Score: 26 / 30**

### B3. Security & Data Integrity (24 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| B3.1 | RLS enabled on all tables | ⚠️ 1 | profiles, active_challenges, check_ins, streaks, day_secures, respects, nudges, push_tokens, streak_freezes; challenges/challenge_tasks SELECT for all — verify every table |
| B3.2 | Users can only read/write their own profile | ✅ 3 | policies: UPDATE USING (auth.uid() = user_id); INSERT WITH CHECK |
| B3.3 | Users can only manage their own challenges | ✅ 3 | assertActiveChallengeOwnership; RLS on active_challenges |
| B3.4 | Users can only complete their own tasks | ✅ 3 | checkins.complete uses ctx.userId; RLS on check_ins |
| B3.5 | Public data properly scoped | ✅ 3 | Leaderboard from day_secures; profiles SELECT true but profile_visibility respected in app |
| B3.6 | No service role key in client | ✅ 3 | App uses Supabase anon key; backend uses service for admin where needed |
| B3.7 | Input validation on backend | ✅ 3 | Zod on all tRPC procedures; checkins validate proof, word count, duration |
| B3.8 | Rate limiting on sensitive endpoints | ⚠️ 1 | backend/lib/rate-limit.ts exists; not verified on every signup/login/task endpoint |

**B3 Score: 20 / 24**

### B4. Data Flow & Real-Time (18 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| B4.1 | Home screen data from real DB | ✅ 3 | homeActiveQuery, leaderboard, stats, suggested from tRPC |
| B4.2 | Discover from real DB | ✅ 3 | challenges.getFeatured with category/search |
| B4.3 | Challenge Detail from real DB | ✅ 3 | getById with tasks; participants from active_challenges |
| B4.4 | Movement/LIVE feed shows real activity | ⚠️ 1 | Activity tab: respects + nudges (real); feed.list is empty; no "secured_day" event feed |
| B4.5 | Leaderboard shows real rankings | ✅ 3 | leaderboard.getWeekly from day_secures |
| B4.6 | Profile stats are real | ✅ 3 | Streak, secured, completed from API |

**B4 Score: 16 / 18**

### B5. Edge Cases & Error Handling (18 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| B5.1 | Missed day: streak resets, status updates | ✅ 3 | Streak logic in lib/streak; secureDay only when all tasks done; miss = no insert day_secures |
| B5.2 | Midnight (day reset) | ✅ 3 | date_key from getTodayDateKey(); new day = new date_key; incomplete day not secured |
| B5.3 | Join challenge already in | ✅ 3 | starters.join + challenges.join check existing active_challenges; BAD_REQUEST |
| B5.4 | Complete all days of challenge | ✅ 3 | checkins.secureDay updates current_day; status → completed when day >= duration |
| B5.5 | No internet | ⚠️ 1 | React Query retries; some screens show error + refetch; no explicit offline cache strategy |
| B5.6 | Backend error on screen | ⚠️ 1 | Loading states and refetch on many screens; not every screen has retry/error UI |

**B5 Score: 14 / 18**

**PART B SUBTOTAL: 100 / 120**

---

## PART C — CORE FEATURE COMPLETENESS (90 points max)

### C1. The Challenge Loop (30 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| C1.1 | User can browse and discover challenges | ✅ 3 | Discover: list, filters, search, featured |
| C1.2 | User can commit to a challenge | ✅ 3 | Commitment modal → challenges.join → Active |
| C1.3 | User sees today's tasks for active challenge | ✅ 3 | Home + Challenge Detail show today's missions from active_challenges + tasks |
| C1.4 | User can mark a task as complete | ✅ 3 | checkins.complete from mission "Start"; manual/journal/timer/photo supported |
| C1.5 | User can secure the day (all tasks done) | ✅ 3 | Secure Today button → checkins.secureDay when all required done |
| C1.6 | User can see progress over time | ✅ 3 | current_day, streak, progress bar / stats on Home and Profile |
| C1.7 | Challenge resets or pauses on missed day | ✅ 3 | "One miss resets" in rules; streak resets; no day_secures for missed day |
| C1.8 | User can complete full challenge (all X days) | ✅ 3 | secureDay advances current_day; status completed at end |
| C1.9 | Multiple active challenges | ⚠️ 1 | Backend allows multiple; UI emphasizes single "active" (home active challenge); multiple supported |
| C1.10 | 24-hour challenges differ from multi-day | ✅ 3 | duration_type 24h; ends_at; countdown; expires at midnight; can start anew |

**C1 Score: 27 / 30**

### C2. Social & Community (21 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| C2.1 | Movement/Activity feed shows community actions | ⚠️ 1 | Activity tab shows respects + nudges; no "secured_day" / "unlocked achievement" feed (feed.list stub) |
| C2.2 | Leaderboard ranks users | ✅ 3 | leaderboard.getWeekly; entries, rank, totalSecuredToday |
| C2.3 | User can react to activity (flame/like) | ✅ 3 | respects.give(recipientId); leaderboard shows respectCount |
| C2.4 | Friends system works | ✅ 3 | accountability partners: invite, accept, list; accountability router |
| C2.5 | Teams system works | ❌ 0 | No teams table or team creation flow |
| C2.6 | Privacy settings control visibility | ✅ 3 | profile_visibility (public/friends/private); profiles.update; used in leaderboard/visibility |
| C2.7 | "Top This Week" shows real top performers | ✅ 3 | Leaderboard entries from getWeekly; avatars + scores |

**C2 Score: 16 / 21**

### C3. Task Verification (15 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| C3.1 | Manual verification (tap to complete) | ✅ 3 | checkins.complete with task_type manual/simple |
| C3.2 | GPS verification (e.g. "Run 1 mile") | ⚠️ 1 | challenge_tasks support run type; backend config; no GPS capture flow verified in app |
| C3.3 | Journal entry verification | ✅ 3 | task_type journal; min_words validated in checkins.complete; noteText |
| C3.4 | Timer-based verification | ✅ 3 | task_type timer; durationMinutes; value (completed minutes) validated |
| C3.5 | Photo verification | ✅ 3 | proof_url / completion_image_url; require_photo_proof in task config |

**C3 Score: 13 / 15**

### C4. Gamification & Progression (24 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| C4.1 | Streak tracking correct | ✅ 3 | lib/streak; consecutive days; reset on miss |
| C4.2 | Score/discipline points | ✅ 3 | total_days_secured; tier; progression |
| C4.3 | Rank system (Starter → Builder → …) | ✅ 3 | getTierForDays; tier on profile and leaderboard |
| C4.4 | Achievements unlock correctly | ⚠️ 1 | Badges shown on profile; unlock logic may be derived from streak/tiers; no explicit user_achievements table |
| C4.5 | Achievement badges displayed | ✅ 3 | Profile: horizontal scroll, locked/unlocked |
| C4.6 | Activity heatmap reflects real data | ✅ 3 | Secured dates from API; GitHub-style grid |
| C4.7 | "Last Stands" tracking | ⚠️ 1 | last_stand.ts (shouldEarnLastStand, newAvailableAfterEarn); UI display not fully verified |
| C4.8 | "Rebuild Mode" (0/7 after streak loss) | ⚠️ 1 | Rebuild concept may exist in copy; no dedicated rebuild state machine verified |

**C4 Score: 18 / 24**

**PART C SUBTOTAL: 74 / 90**

---

## PART D — PRODUCTION READINESS (60 points max)

### D1. Performance (18 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| D1.1 | App launches in < 3 seconds | ⚠️ 1 | Not measured in audit; splash + JS load depend on device |
| D1.2 | Screen transitions smooth | ⚠️ 1 | No jank observed in code; no performance instrumentation |
| D1.3 | Lists scroll smoothly | ✅ 3 | FlatList/lists in Discover, Activity; no obvious heavy work on scroll |
| D1.4 | Images/avatars load without layout shift | ⚠️ 1 | Avatar placeholders; some dimensions set; not full audit |
| D1.5 | No unnecessary re-renders on Home | ⚠️ 1 | React Query; no obvious global state causing full-tree re-renders |
| D1.6 | Search is debounced | ✅ 3 | useDebounce(300) on Discover search |

**D1 Score: 10 / 18**

### D2. Error Handling & Edge Cases (18 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| D2.1 | Every API call has error handling | ⚠️ 1 | Many useQuery/useMutation with onError or isError; not every call has user-facing message |
| D2.2 | Loading states on every async screen | ✅ 3 | Loading spinners/skeletons on Home, Discover, Profile, Activity, Challenge Detail |
| D2.3 | Empty states for all lists | ✅ 3 | No challenge, no activity, no leaderboard entries — empty states present |
| D2.4 | Network offline graceful degradation | ⚠️ 1 | React Query retry; some error copy; no explicit offline banner or cache-first strategy |
| D2.5 | Pull-to-refresh on key screens | ✅ 3 | Home, Discover, Activity: refetch on pull |
| D2.6 | Deep link / URL handling | ⚠️ 1 | scheme griit://, linking prefixes; no verified /challenge/:id deep link handler |

**D2 Score: 12 / 18**

### D3. Code Quality (12 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| D3.1 | TypeScript: zero errors | ✅ 3 | tsc --noEmit passes (per prior session) |
| D3.2 | No `any` in critical paths | ⚠️ 1 | Some casts (e.g. trpc response types); auth/challenge paths largely typed |
| D3.3 | Design tokens used consistently | ✅ 3 | GRIIT_COLORS, GRIIT_RADII, GRIIT_SHADOWS from theme; shared-styles |
| D3.4 | No console.log with sensitive data | ✅ 3 | No passwords/tokens in logs in reviewed code |

**D3 Score: 10 / 12**

### D4. App Store Readiness (12 pts)

| # | Item | Score | Note |
|---|------|-------|------|
| D4.1 | App icon exists | ✅ 3 | assets/images/icon.png, adaptive-icon |
| D4.2 | Splash screen exists | ✅ 3 | splash-icon.png; backgroundColor #ffffff |
| D4.3 | App name in app.json is "GRIIT" | ✅ 3 | expo.name: "GRIIT" |
| D4.4 | Bundle identifier set | ✅ 3 | ios.bundleIdentifier, android.package set |

**D4 Score: 12 / 12**

**PART D SUBTOTAL: 44 / 60**

---

## FINAL TALLY

| Section | Score | Max |
|---------|-------|-----|
| **A. FRONTEND** | | |
| A1. First-Time Experience | 27 | 30 |
| A2. Authentication | 27 | 27 |
| A3. Home Screen | 27 | 30 |
| A4. Discover Page | 21 | 21 |
| A5. Challenge Detail + Commitment | 24 | 24 |
| A6. Profile & Settings | 18 | 18 |
| **Frontend Subtotal** | **144** | **150** |
| **B. BACKEND** | | |
| B1. Database Schema | 24 | 30 |
| B2. API / Backend Logic | 26 | 30 |
| B3. Security & Data Integrity | 20 | 24 |
| B4. Data Flow & Real-Time | 16 | 18 |
| B5. Edge Cases & Error Handling | 14 | 18 |
| **Backend Subtotal** | **100** | **120** |
| **C. CORE FEATURES** | | |
| C1. The Challenge Loop | 27 | 30 |
| C2. Social & Community | 16 | 21 |
| C3. Task Verification | 13 | 15 |
| C4. Gamification & Progression | 18 | 24 |
| **Features Subtotal** | **74** | **90** |
| **D. PRODUCTION READINESS** | | |
| D1. Performance | 10 | 18 |
| D2. Error Handling | 12 | 18 |
| D3. Code Quality | 10 | 12 |
| D4. App Store Readiness | 12 | 12 |
| **Production Subtotal** | **44** | **60** |
| **GRAND TOTAL** | **362** | **420** |

---

## GRADE: **B** (336–377)

Strong foundation. Core flows work; needs polish and a few completed features (activity feed, teams, full achievement persistence, performance/error hardening) to reach production-ready A.

---

## TOP 10 THINGS THAT WORK WELL

1. **First-time flow** — Welcome → Goals → Discipline → Signup with persistence and returning-user redirect.
2. **Auth** — Login, signup, session persistence, sign out, forgot password, username check, password strength, show/hide.
3. **Challenge loop** — Discover → commit → today’s tasks → complete → secure day → streak and progress; 24h vs multi-day handled.
4. **Backend APIs** — tRPC: challenges (list, getById, getFeatured, join), checkins (complete, secureDay), leaderboard, profiles, accountability, starters.
5. **Home screen** — Header, status card, explore, active challenge, stats, discipline week, suggested, leaderboard, empty states.
6. **Discover** — Search (debounced), category filters, featured, 24h section, more challenges, navigation to detail.
7. **Challenge Detail** — Theme (orange/green), participants, stats, missions, rules, commitment modal with join.
8. **Profile & settings** — User data, colored avatar, stats, heatmap, achievements, privacy toggles.
9. **Security** — RLS on core tables, own-profile/own-challenge/own-check-in, Zod validation, anon key in client.
10. **Design system** — GRIIT tokens, shadows, radii, shared styles, consistent primary buttons and typography.

---

## TOP 10 THINGS THAT NEED WORK

1. **Activity / movement feed** — feed.list is a stub (returns []); no "secured_day" / "lost_streak" / "unlocked achievement" events; Activity tab uses respects + nudges only.
2. **Teams** — No teams table or create/join team flow; scorecard expects teams.
3. **Achievement persistence** — Badges shown on profile; no verified user_achievements table or unlock writes; may be derived only.
4. **Profile schema** — Ensure onboarding_answers, primary_goal, daily_time_budget (and onboarding_completed) exist on profiles (migration if not in seed).
5. **Rate limiting** — Confirm rate-limit applied on signup, login, and high-frequency endpoints.
6. **Offline / network errors** — Explicit offline handling and retry/error UI on every critical screen.
7. **Performance** — Measure cold start < 3s; optimize re-renders and list performance if needed.
8. **Deep linking** — Implement and test griit://challenge/:id (and web) to open Challenge Detail.
9. **"Skip" on welcome** — Optional: allow skip from welcome to signup without goals/discipline for faster signup.
10. **Last Stand / Rebuild Mode** — Clarify and implement UI for last-stands and rebuild (0/7) after streak loss.

---

## RECOMMENDED NEXT STEPS (to move toward Grade A)

| Priority | Step | Effort |
|----------|------|--------|
| 1 | Implement real activity feed: write events on secure_day, lost_streak, achievement_unlock; feed.list returns aggregated list; connect Movement/LIVE to it | **Large** (1–3 days) |
| 2 | Add profiles migration if missing: onboarding_completed, onboarding_answers, primary_goal, daily_time_budget | **Small** (1–2 hours) |
| 3 | Add user_achievements (or equivalent) and unlock logic when user hits 7/14/30/75-day streak and other criteria | **Medium** (3–8 hours) |
| 4 | Introduce teams table + create/join team API + basic UI (or explicitly scope to "no teams" and adjust scorecard) | **Large** (1–3 days) or **Small** (doc only) |
| 5 | Apply rate limiting to auth and checkins endpoints; verify RLS on every table | **Small** (1–2 hours) |
| 6 | Add offline-friendly error copy and retry on every critical screen; optional cache strategy for key queries | **Medium** (3–8 hours) |
| 7 | Measure app launch time; fix any splash/init bottlenecks; ensure lists use FlatList best practices | **Medium** (3–8 hours) |
| 8 | Implement and test deep link for challenge share (griit://challenge/:id) | **Small** (1–2 hours) |
| 9 | Last Stand / Rebuild Mode: wire backend last_stand to UI and add rebuild state/UX | **Medium** (3–8 hours) |
| 10 | Optional: "Skip" from welcome to signup (store minimal onboarding_answers) | **Small** (1–2 hours) |

---

*Report generated from codebase audit. Be strict: full points only where behavior works end-to-end.*
