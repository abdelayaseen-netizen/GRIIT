# GRIIT Beta-Launch Hardening Pass v5 — Report

## 1. Profile Changes

### 1A — Section inventory (render order, data source, loading/error/empty)

| # | Section | Component | Data source | Loading | Error | Empty |
|---|---------|-----------|-------------|---------|-------|-------|
| 1 | Guest gate | Inline JSX | `isGuest` (AuthGateContext) | N/A | N/A | Guest card + Sign up CTA |
| 2 | Full-screen loading | ProfileSkeleton | `stillLoading && !loadingTimedOut` | ✅ Skeleton | N/A | N/A |
| 3 | Error / timeout | Inline error card | `loadingTimedOut \|\| (isError \|\| profileMissing) && !profile` | N/A | ✅ Retry + Sign out | N/A |
| 4 | Identity | ProfileHeader | `profile` (AppContext), `tierName` (stats) | N/A | N/A | N/A |
| 5 | Discipline score | DisciplineScoreCard | `totalDaysSecured` (stats), `leaderboardRank` (dashboard) | N/A | N/A | ✅ zeroStateHint when 0 |
| 6 | Tier progress | TierProgressBar | `totalDaysSecured`, `ptsToNext`, `nextTierName` (stats) | N/A | N/A | N/A |
| 7 | Lifetime stats | LifetimeStatsCard | `bestStreak`, `totalDaysSecured`, `completedChallengesCount` | N/A | N/A | Shows 0s |
| 8 | Calendar | DisciplineCalendar | `securedDateKeys` (dashboard), `currentStreak`, `bestStreak` | N/A | N/A | ✅ Zero-state hint added |
| 9 | Achievements | AchievementsSection | `achievements` (useMemo from stats), `dashboardDataLoading` | ✅ Loading… | N/A | Badges (locked/unlocked) |
| 10 | Challenge history | CompletedChallengesSection | `completedChallengesList` (dashboard), `dashboardDataLoading` | ✅ Loading… | N/A | ✅ "No completed challenges yet" |
| 11 | Social stats | SocialStatsCard | `leaderboardRank`, `accountabilityCount` | N/A | N/A | N/A |
| 12 | Profile completion | ProfileCompletionCard | Derived booleans from profile/stats | N/A | N/A | N/A |
| 13 | Share discipline | ShareDisciplineCard | `profile`, `disciplineScore`, `currentStreak`, `tierName` | N/A | N/A | N/A |
| 14 | Integrations | IntegrationsSection | tRPC integrations (Strava), local state | Internal loading | N/A | Section hidden when disabled |
| 15 | Menu (Edit profile, Settings) | Inline TouchableOpacity | Router | N/A | N/A | N/A |
| 16 | Sign out | Inline | handleLogout | N/A | N/A | N/A |

### 1B — Stats calculation (excerpts and analysis)

**Discipline score**  
- **Where:** `app/(tabs)/profile.tsx`: `const disciplineScore = totalDaysSecured;` and `totalDaysSecured = (stats as any)?.totalDaysSecured ?? 0`.  
- **Backend:** `backend/trpc/routes/profiles.ts` `getStats`: reads `profiles.total_days_secured`, returns `totalDaysSecured`.  
- **Inputs:** Always available after profile load; `stats` can be null before first fetch — profile uses `stillLoading` and skeleton so we don’t render main content until profile exists; stats default to 0 via `?? 0`.  
- **When it updates:** After `refetchAll()` (e.g. pull-to-refresh or post task completion elsewhere); not real-time on task complete without refetch.

**Streak**  
- **Where:** `currentStreak = stats?.activeStreak || 0`, `bestStreak = stats?.longestStreak || 0`.  
- **Backend:** `getStats` uses `streaks.active_streak_count`, `longest_streak_count`; applies streak-freeze and last-stand logic; “day” uses `getTodayDateKey()` (UTC date string YYYY-MM-DD) and `yesterdayKey` (local date math in `profiles.ts`).  
- **What breaks streak:** Missing all required days (after freeze/last-stand); effective missed days computed from `last_completed_date_key` vs today/yesterday.  
- **Timezone:** Backend uses UTC date keys and local yesterday; potential edge cases at midnight UTC vs local.

**Tier**  
- **Where:** `tierName = (stats as any)?.tier ?? "Starter"`, `ptsToNext`, `nextTierName` from stats.  
- **Backend:** `backend/lib/progression.ts`: `TIER_THRESHOLDS`: Starter 0–6, Builder 7–29, Relentless 30–89, Elite 90+; `getTierForDays`, `getPointsToNextTier`, `getNextTierName`.  
- **Metric:** `total_days_secured`. Tier can effectively regress if days were adjusted (backend stores tier on profile and recomputes from days).

### 1C — Visual hierarchy

- **First visible:** Identity (ProfileHeader: avatar, name, username, tier, join date, share).  
- **Key stats:** Directly below: DisciplineScoreCard, TierProgressBar, LifetimeStatsCard, DisciplineCalendar — prominent, in order.  
- **Settings/integrations:** Integrations section and menu (Edit profile, Settings) are below the fold; Sign out at bottom.  
- **No banner/upsell** between identity and stats. Stats and settings are separated (stats block first, then achievements/history/social/share, then integrations, then menu, then sign out).

### 1D — Code changes made

1. **Streak zero-state (DisciplineCalendar)**  
   - When `currentStreak === 0 && longestStreak === 0`, show hint: “Start your streak by completing today's tasks.”  
   - File: `components/profile/DisciplineCalendar.tsx` (conditional text + `zeroStateHint` style).

2. **Orphaned styles removed (profile.tsx)**  
   - Removed unused StyleSheet entries that were left after moving header into ProfileHeader: `headerSection`, `avatarContainer`, `avatarRing`, `avatar`, `avatarText`, `streakBadge`, `displayName`, `username`, `joinedDate`, `headerActions`, `editButton`, `editButtonText`, `shareButton`, `shareButtonText`.  
   - File: `app/(tabs)/profile.tsx`.

---

## 2. Performance Audit

### 2A — useEffect / useFocusEffect audit (5 screens)

| Screen | Hook | Dependencies | Variables read in body | Match? | Issue? |
|--------|------|--------------|------------------------|--------|--------|
| home (index) | useEffect L69 | [progress, widthAnim] | progress, widthAnim | ✅ | None (AnimatedProgressBar) |
| home | useEffect L101 | [index, scaleAnim] | index, scaleAnim | ✅ | None (TaskRow) |
| home | useEffect L110 | [completed, checkAnim] | completed, checkAnim | ✅ | None (TaskRow) |
| home | useFocusEffect L229 | [isGuest, refetchAll, fetchHomeActiveData] | isGuest, refetchAll, fetchHomeActiveData | ✅ | None |
| home | useEffect L237 | [refreshing, initialFetchDone] | setHomeDataRefreshKey | ✅ | None |
| home | useEffect L241 | [isGuest, stats?.activeStreak] | trpcQuery, setLeaderboardData | ✅ | None |
| home | useEffect L289 | [showComebackMode] | showComebackMode, track | ✅ | None |
| home | useEffect L295 | [canSecureDay, secureBtnGlow] | canSecureDay, secureBtnGlow, Animated | ✅ | Cleanup present |
| create | useEffect L316 | [clearWatchdog] | clearWatchdog | ✅ | Cleanup only |
| profile | useEffect L282 | [isGuest, profile, fetchDashboardData] | isGuest, profile, fetchDashboardData | ✅ | None |
| profile | useEffect L290 | [stillLoading] | stillLoading, timeoutRef, setLoadingTimedOut | ✅ | Cleanup present |
| profile | useEffect L304 | [profile, headerFade] | profile, headerFade, Animated | ✅ | None |
| profile | IntegrationsSection useEffect | [loadIntegrations] | loadIntegrations | ✅ | None |
| profile | IntegrationsSection useFocusEffect | [loadIntegrations] | loadIntegrations | ✅ | None |
| activity | useEffect L404 | [fetchLeaderboard] | fetchLeaderboard | ✅ | None |
| activity | useEffect L408 | [fetchActivityFeed] | fetchActivityFeed | ✅ | None |
| activity | useFocusEffect L412 | [fetchLeaderboard, fetchActivityFeed, currentUserId] | fetchLeaderboard, fetchActivityFeed, currentUserId | ✅ | None |
| challenge [id] | useEffect L189 (CountdownTimer) | [endsAt] | endsAt, setCountdown, getCountdown | ✅ | Cleanup clearInterval |
| challenge [id] | useEffect L196 (CountdownTimer) | [pulseAnim] | pulseAnim, Animated | ✅ | Cleanup loop.stop() |
| challenge [id] | useEffect L402 | [fadeAnim] | fadeAnim | ✅ | None |
| challenge [id] | useEffect L420 | [id, isStarter] | id, isStarter, trpcQuery, setChallenge, setRemoteLoading… | ✅ | None |
| challenge [id] | useEffect L432 | [isStarter, id] | isStarter, id, getJoinedStarterIds | ✅ | None |
| challenge [id] | useEffect L492 | [isDaily, challenge?.ends_at] | isDaily, challenge, setExpired | ✅ | Cleanup clearInterval |
| challenge [id] | useEffect L596 | [isThisActiveChallenge, hasStravaTasks, …] | strava state, trpcQuery | ✅ | None |
| challenge [id] | useFocusEffect L606 | [isJoined, refetchTodayCheckins] | isJoined, refetchTodayCheckins | ✅ | None |

No missing deps or stale-closure issues identified; cleanups (timers, animation loops) are present where needed.

### 2B — Expensive render operations

- **home:** `tasks` and retention-derived values are wrapped in `useMemo`; `getHomeRetentionDerived` and task list depend on stable or memoized inputs.  
- **create:** No large un-memoized filter/sort/map in render.  
- **profile:** `achievements` and `joinedDate` are `useMemo`; dashboard data is state.  
- **activity:** `mapApiEntryToLeaderboardEntry` used in fetch callback; list sizes (leaderboard, activity items) are small; no change.  
- **challenge [id]:** `allTasks`, `rules`, theme and progress derived with useMemo or simple expressions.  

No additional useMemo added; data sets are small.

### 2C — Cleanup / leak check

- **profile:** Timeout in `useEffect` for `loadingTimedOut` is cleared in return.  
- **challenge [id]:** CountdownTimer clears interval and animation loop; expiry check clears interval.  
- **activity:** No subscriptions/timers.  
- **home:** Secure-button pulse animation has cleanup.  
- **create:** clearWatchdog cleanup.  

No missing cleanups found.

---

## 3. Chat Hidden

- **What:** Chat route remains in the app (`app/challenge/[id]/chat.tsx`), but when `FLAGS.CHAT_ENABLED` is false, the screen immediately redirects to the challenge detail so users never see “Chat not available.”  
- **Where:** `app/challenge/[id]/chat.tsx`.  
- **How:** Added a `useEffect` that calls `router.replace(\`/challenge/${id}\`)` when `!FLAGS.CHAT_ENABLED && id`.  
- **Entry point:** No Chat button/link was found in `app/challenge/[id].tsx`; chat was reachable only via direct navigation or deep link. Redirect ensures anyone landing on the chat URL is sent back to the challenge.  
- **Feature flag:** `lib/feature-flags.ts` already has `CHAT_ENABLED: false`.

---

## 4. Activity Screen Audit

### Section inventory and data sources

| Section | Data source | Loading | Error | Empty |
|---------|-------------|---------|-------|-------|
| Header (Movement, Teams) | Static, FLAGS.IS_BETA for Teams | N/A | N/A | N/A |
| Filter pills (Global/Friends/Team) | Local state `feedFilter` | N/A | N/A | N/A |
| Daily stats card | `leaderboard.totalSecuredToday` | Now covered | N/A | Shows 0 |
| Top This Week | `leaderboard.entries` | ✅ Loading… (added) | Implicit (empty) | ✅ “Be the first this week.” |
| Weekly Leaderboard | `leaderboard.entries` | ✅ Loading… (added) | Implicit (empty) | ✅ “Be the first this week.” |
| Movement feed (THIS WEEK) | Same `leaderboard.entries` | Same loading | N/A | ✅ “Be the first this week.” |
| Recent activity | `activityItems` (respects + nudges) | No spinner (feed loads with leaderboard) | Implicit (empty) | Section hidden when 0 items |

**Leaderboard:** tRPC `leaderboard.getWeekly`; refetches on focus and on pull-to-refresh. When user is in no challenge, backend still returns entries (global weekly); empty state is “Be the first this week.”  
**Respect/nudge:** `handleGiveRespect` calls `trpcMutate("respects.give")` then `fetchLeaderboard()`; `handleGiveNudge` calls `trpcMutate("nudges.send")` then `fetchActivityFeed()`. UI is not optimistic; it waits for response then refetches. Errors show Alert.  
**Feed items:** From `respects.getForUser` and `nudges.getForUser`; merged and sorted by date. Not paginated; single load.

### Fixes applied

- **Loading state:** Added `leaderboardLoading` (true until first `fetchLeaderboard()` completes). “Top This Week” and “Weekly Leaderboard” show “Loading…” until data is in; then empty or list as before.  
- File: `app/(tabs)/activity.tsx`.

---

## 5. Lint Warnings

- **Before (this pass):** 12 warnings (from `npx expo lint`).  
- **After:** 12 (no mechanical batch fix applied; prompt referenced 65 → &lt;40; current codebase already &lt;40).  
- **Types:** 7× `@typescript-eslint/no-require-imports` in `app/create-profile.tsx`; 1× `react-hooks/exhaustive-deps` in `app/day1-quick-win.tsx`; 2× in `app/task/checkin.tsx`; 2× in `app/task/journal.tsx`.  
- **Files touched for lint:** None (no safe mechanical fix run; deps/require changes left for a later pass).

---

## 6. Empty State & Error State Sweep

| Screen | Section | Loading | Error | Empty | Fix needed? |
|--------|---------|---------|-------|-------|-------------|
| Home | Active challenges | ✅ (skeleton / loading in ActiveChallenges) | Implicit (empty list) | ✅ EmptyChallengesCard | No |
| Home | Daily status | From refetch | N/A | State-based copy | No |
| Home | Stats / leaderboard | From refetch | N/A | N/A | No |
| Discover | Challenge list | Yes (discover screen) | N/A | Empty state | No change this pass |
| Challenge detail | Task list | Skeleton / loading | Not found empty | Shows missions | No |
| Challenge detail | Progress | From checkins | N/A | N/A | No |
| Activity | Feed / leaderboard | ✅ Added “Loading…” | Alert on mutation error | ✅ “Be the first this week.” | Done |
| Activity | Recent activity | N/A | N/A | Section hidden when 0 | No |
| Profile | Stats / score | Skeleton + dashboard loading | ✅ Retry + error card | ✅ Zero-state hints (score + streak) | Done (streak hint) |
| Profile | Challenge history | ✅ Loading… | N/A | ✅ “No completed challenges yet” | No |
| Profile | Achievements | ✅ Loading… | N/A | Badges | No |
| Create | Task list (step 2) | N/A | N/A | Empty = no tasks yet | No change this pass |

No additional empty/error fixes applied beyond Profile (streak hint, existing zero/loading) and Activity (loading state).

---

## 7. Validation

```
TypeScript: pass, 0 errors (npx tsc --noEmit)
Lint before: 12
Lint after: 12
```

---

## 8. Files Changed

| File | Description |
|------|-------------|
| `components/profile/DisciplineCalendar.tsx` | Streak zero-state hint when current and longest streak are 0; added `zeroStateHint` style. |
| `app/(tabs)/profile.tsx` | Removed orphaned StyleSheet entries (header/avatar/buttons) unused after ProfileHeader extraction. |
| `app/challenge/[id]/chat.tsx` | Redirect to `/challenge/[id]` when `!FLAGS.CHAT_ENABLED` so chat is hidden from normal use. |
| `app/(tabs)/activity.tsx` | Leaderboard loading state: `leaderboardLoading`, show “Loading…” for Top This Week and Weekly Leaderboard until first fetch completes. |
| `docs/HARDENING-V5-REPORT.md` | This report. |

---

## 9. Self-Scorecard

| Dimension | Pass 4 | Pass 5 | What changed |
|-----------|--------|--------|---------------|
| UX / Ease of Use | — | — | Streak zero-state clarifies how to start; Activity loading reduces confusion. |
| Home Screen Quality | — | — | No code change; verified loading/empty. |
| Challenge Creation Quality | — | — | No code change. |
| Profile Quality | — | ↑ | Profile: streak zero-state, removed dead styles, documented sections and stats. |
| Engineering Quality | — | ↑ | Chat redirect by flag; Activity loading; performance and cleanup verified. |
| State Sync / Data Correctness | — | — | No change; stats/refresh behavior documented. |
| Performance / Smoothness | — | — | Audit only; no new issues; cleanups confirmed. |
| Monetization Readiness | — | — | No change. |
| Launch Readiness | — | ↑ | Profile and Activity polished; chat hidden when disabled; lint &lt; 40. |

---

## 10. What Still Caps Scores

1. **Lint:** 12 warnings (require imports, exhaustive-deps) remain; fixing may need product/UX decisions (e.g. deps in checkin/journal).  
2. **Activity feed:** No loading indicator for “Recent” (respects/nudges); could add a short loading state for consistency.  
3. **Discover/Create empty states:** Not re-audited in this pass; may have minor gaps.

---

## 11. Recommended Next Pass

- Fix or suppress remaining lint warnings (require → import where possible; review hook deps in checkin/journal/day1-quick-win).  
- Optionally add a short loading state for Activity “Recent” section.  
- Quick pass on Discover and Create for empty/error copy and loading states.
