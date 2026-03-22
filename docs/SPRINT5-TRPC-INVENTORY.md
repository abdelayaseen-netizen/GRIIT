# tRPC Procedure Inventory (Sprint 5)

Generated from `backend/trpc/routes/*.ts` (excluding `*.test.ts`). Each procedure was checked in source.

## Summary

| Metric | Count |
|--------|------:|
| Total procedures | 77 |
| Protected | 66 |
| Public | 11 |
| Queries | 38 |
| Mutations | 39 |

**Public procedures (intentional):** `auth.signUp`, `auth.signIn`, `auth.getSession`, `auth.getEmailForUsername`, `meta.version`, `challenges.list`, `challenges.getFeatured`, `challenges.getStarterPack`, `challenges.getById`, `leaderboard.getWeekly`, `profiles.getPublicByUsername`.

**Note:** `getStarterPack` and `meta.version` take no client input (discovery / static metadata). `getFeatured` / `list` use optional `z.object({...}).optional()` where appropriate.

---

## accountability.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| invite | mutation | protected | `z.object({ partnerId: uuid })` | |
| listMine | query | protected | none (ctx only) | |
| respond | mutation | protected | `z.object({ inviteId, action enum })` | |
| remove | mutation | protected | `z.object({ partnerId: uuid })` | |

## achievements.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| getForUser | query | protected | none (ctx only) | |

## auth.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| signUp | mutation | public | email + password | |
| signIn | mutation | public | email + password | |
| signOut | mutation | protected | `z.object({})` (Sprint 5) | No user-supplied fields |
| getSession | query | public | none | |
| getEmailForUsername | query | public | username string | |

## challenges.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| list | query | public | search/category/limit/cursor | |
| getFeatured | query | public | optional filter object | |
| getStarterPack | query | public | none | Curated seed challenges |
| getById | query | public | `id: uuid` | |
| join | mutation | protected | `challengeId: uuid` | |
| leave | mutation | protected | `challengeId: uuid` | |
| getActive | query | protected | none | |
| listMyActive | query | protected | none | |
| startTeamChallenge | mutation | protected | `challengeId: uuid` | |
| getTeamMembers | query | protected | `challengeId: uuid` | Membership checked in handler |
| create | mutation | protected | large zod object | Custom challenges |

## checkins.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| complete | mutation | protected | task/check-in payload | Uses `assertActiveChallengeOwnership` |
| getTodayCheckins | query | protected | `activeChallengeId` | |
| getTodayCheckinsForUser | query | protected | none | |
| secureDay | mutation | protected | `activeChallengeId` | RPC `secure_day` |
| markAsShared | mutation | protected | `completionId` | |
| getShareStats | query | protected | none | |
| getMilestoneShared | query | protected | `activeChallengeId` | |
| setMilestoneShared | mutation | protected | `activeChallengeId`, milestone day | |

## feed.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| list | query | protected | limit + optional cursor | |

## integrations.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| getStravaAuthUrl | query | protected | none | |
| isStravaEnabled | query | protected | none | |
| getStravaConnection | query | protected | none | |
| getStravaActivities | query | protected | zod | |
| getStravaAthlete | query | protected | none | |
| disconnectStrava | mutation | protected | `z.object({})` (Sprint 5) | |
| verifyStravaTask | mutation | protected | activeChallengeId, taskId, optional dateKey | Ownership asserted |

## leaderboard.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| getWeekly | query | public | optional limit/cursor | Aggregates `day_secures` (see RLS note) |

## meta.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| version | query | public | none | App version string |

## notifications.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| registerToken | mutation | protected | zod | |
| updateReminderSettings | mutation | protected | zod | |
| getReminderSettings | query | protected | none | |

## nudges.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| send | mutation | protected | `toUserId` | |
| getForUser | query | protected | optional pagination | |

## profiles.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| create | mutation | protected | profile fields | |
| getPublicByUsername | query | public | username | |
| get | query | protected | none | |
| validateSubscription | mutation | protected | `z.object({})` (Sprint 5) | RevenueCat server validation |
| update | mutation | protected | partial profile | Subscription fields excluded |
| getStats | query | protected | none | |
| getCompletedChallenges | query | protected | none | |
| getSecuredDateKeys | query | protected | none | |
| search | query | protected | query string | |
| setWeeklyGoal | mutation | protected | goal enum | |
| getWeeklyProgress | query | protected | none | |
| getWeeklyTrend | query | protected | none | |
| deleteAccount | mutation | protected | `z.object({})` (Sprint 5) | Service role delete auth user when configured |

## referrals.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| recordOpen | mutation | protected | referrer + optional challenge | |
| markJoinedChallenge | mutation | protected | challengeId | |

## respects.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| give | mutation | protected | recipientId | |
| getForUser | query | protected | optional pagination | |
| getCountForUser | query | protected | userId | |

## sharedGoal.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| logProgress | mutation | protected | amount, challengeId, etc. | |
| getRecentLogs | query | protected | challengeId, limit | |
| getContributions | query | protected | challengeId | |

## starters.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| getChallengeIdByStarterId | query | protected | starterId string | |
| join | mutation | protected | starterId string | |

## stories.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| create | mutation | protected | media fields | |
| list | query | protected | optional cursor | |
| markViewed | mutation | protected | story id | |

## streaks.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| useFreeze | mutation | protected | dateKey | |

## teams.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| createTeam | mutation | protected | name | |
| joinTeam | mutation | protected | invite code | |
| getMyTeam | query | protected | none | |
| leaveTeam | mutation | protected | teamId | |
| getTeamFeed | query | protected | teamId | |

## user.ts

| Procedure | Type | Auth | Input validation | Notes |
|-----------|------|------|------------------|-------|
| completeOnboarding | mutation | protected | onboarding fields | |

---

## Security anti-patterns (Sprint 5 Phase 0D)

| Check | Result |
|-------|--------|
| Raw `sql` / `rpc` in TS | `checkins.secureDay` and challenges use `.rpc()` with **named parameters** only (Supabase client). No string-concat SQL in app code. |
| Hardcoded API keys in source | None found (use `process.env`). |
| Service role | `backend/lib/supabase-admin.ts`, `supabase-server.ts`, Strava callback, `profiles.deleteAccount` — documented in Sprint 5 report. |
