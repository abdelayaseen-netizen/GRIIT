# Production Upgrade Implementation (Rork AI Plan)

## Summary

P0 and P1 production-ready upgrades were implemented. Core flows (Create Challenge, Secure Day, Discover, Nudge, Respect) are unchanged and working.

---

## P0 — Push Notifications

### Backend
- **push_tokens table** (`backend/migration-push-tokens.sql`): `id`, `user_id`, `token`, `device_id`, `created_at`, `updated_at`, UNIQUE(user_id, token). RLS for own rows. Also adds `profiles.reminder_enabled`, `profiles.reminder_timezone`.
- **backend/lib/push.ts**: `sendExpoPush(tokens, title, body)` — sends via Expo Push API; no-op if tokens missing/invalid.
- **notifications router** (`backend/trpc/routes/notifications.ts`):
  - `notifications.registerToken({ token, device_id? })` — upserts into push_tokens, updates profiles.expo_push_token.
  - `notifications.updateReminderSettings({ reminder_time?, timezone?, enabled? })` — updates profiles.
  - `notifications.getReminderSettings` — returns reminder_time, enabled, timezone.
- **nudges.send**: Fetches recipient tokens from push_tokens and profiles.expo_push_token; sends via `sendExpoPush`. Resilient if push_tokens table is missing.

### Frontend
- **lib/register-push-token.ts**: Requests permission, gets Expo push token, calls `notifications.registerToken`. Tracks push_permission_granted/denied.
- **AppContext**: After permission granted, calls `registerPushTokenWithBackend()` so token is stored on server.
- **lib/notifications.ts**: Time-aware copy: body "It's 8:00 PM — time to secure your day."; "2 hours left to protect your streak."; "45 minutes left to protect your streak." (streak-at-risk at 11:15 PM when day not secured). `formatTimeForNotification(hour, minute)` for display.
- **Settings**: "Daily reminder" toggle and "Reminder time" presets (6/8/9/10 PM) load from and save to server via `notifications.getReminderSettings` and `notifications.updateReminderSettings`. When enabling reminder, registers push token.

### Scheduling
- **Local scheduling** (existing): Daily reminder and streak-at-risk are scheduled locally in `scheduleNextSecureReminder`. Server-side cron can be added later; nudge delivery is already server-sent.

---

## P0 — Remove Fake Data

- **app/challenge/[id].tsx**: Removed `Math.random()` for `userCurrentDay` and `userStreak`. Starter shows day 1; non-starter uses `activeChallenge.current_day_index`; streak uses `userCurrentDay` (no random offset).
- **app/(tabs)/index.tsx**: When `tasks.length === 0`, placeholder fake tasks ("Move for 5 minutes", etc.) replaced with one honest line: "No tasks yet — open your challenge to see today's list."
- **Activity/Home feeds**: Already use server data (leaderboard.getWeekly, respects.getForUser, nudges.getForUser). No mock feed arrays were present in app code.

---

## P0 — Social (Respect + Nudge) and Guest Browsing

- **Leaderboard**: `leaderboard.getWeekly` changed from `protectedProcedure` to `publicProcedure` so guests can load leaderboard. `currentUserRank` is null when not authenticated.
- **Home**: Leaderboard fetch runs for all users (including guests); no longer gated by `!isGuest`.
- **Respect**: `handleGiveRespect` now wrapped in `requireAuth("respect", ...)` so guests see auth gate when tapping Respect. After sign-in, action completes; count persists from server.
- **Nudge**: Already gated with `requireAuth("nudge", ...)` and uses `toUserId` (recipient user_id). No change.
- **Backend**: respects table and nudges table exist; rate limit (1 nudge per sender→recipient per 24h) and self-nudge reject are in place.

---

## P0 — Backend Reliability

- **Health**: GET `/health` and GET `/api/health` already return `{ ok, service, commitSha, time }`.
- **tRPC**: Mount at `/api/trpc`; frontend uses `getTrpcUrl()` = baseUrl + `/api/trpc`. Ensure `EXPO_PUBLIC_API_URL` is set to backend URL in production.

---

## P0 — Apple Sign-In (Not Implemented in This Pass)

- **Gating**: join, secure, nudge, respect already use `requireAuth(context, action)` so guests are prompted to sign in. No change.
- **Apple Sign-In**: Not added. To add: configure Apple provider in Supabase Dashboard (Authentication → Providers), and use `expo-apple-authentication` (or Supabase `signInWithOAuth({ provider: 'apple' })`) in the auth flow. Existing email auth and gate modal remain.

---

## P1 — Analytics

- **lib/analytics.ts**: New event types: `app_opened`, `signup_started`, `onboarding_completed`, `first_challenge_joined`, `first_task_completed`, `day_secured`, `nudge_sent`, `respect_sent`, `streak_lost`, `streak_milestone`, `push_permission_granted`, `push_permission_denied`. `UserProperties` type: days_since_signup, current_streak, discipline_score, timezone, reminder_enabled. `setIdentify(userId, props)` and `identify()` for user properties.
- **Tracking**: `nudge_sent` and `respect_sent` tracked in Activity screen; `push_permission_granted`/`denied` in register-push-token. Wire `setAnalyticsHandler` and `setIdentify` to PostHog or Mixpanel in app bootstrap.

---

## Files Changed

| Area | File | Change |
|------|------|--------|
| Backend | `backend/migration-push-tokens.sql` | **New**: push_tokens table, profiles.reminder_enabled, reminder_timezone |
| Backend | `backend/lib/push.ts` | **New**: sendExpoPush(tokens, title, body) |
| Backend | `backend/trpc/routes/notifications.ts` | **New**: registerToken, updateReminderSettings, getReminderSettings |
| Backend | `backend/trpc/routes/nudges.ts` | Use push_tokens + sendExpoPush; resilient to missing table |
| Backend | `backend/trpc/routes/leaderboard.ts` | getWeekly: protectedProcedure → publicProcedure; currentUserRank null when no user |
| Backend | `backend/trpc/app-router.ts` | Add notificationsRouter |
| Frontend | `lib/notifications.ts` | Time-aware body; formatTimeForNotification; streak-at-risk at 11:15 PM |
| Frontend | `lib/register-push-token.ts` | **New**: register push token with backend; track permission |
| Frontend | `lib/analytics.ts` | New events + UserProperties + identify() |
| Frontend | `contexts/AppContext.tsx` | Call registerPushTokenWithBackend after permission granted |
| Frontend | `app/settings.tsx` | Load/save reminder from server; time presets; handleReminderToggle |
| Frontend | `app/(tabs)/activity.tsx` | requireAuth("respect", ...) for Respect; track nudge_sent, respect_sent |
| Frontend | `app/(tabs)/index.tsx` | Fetch leaderboard for guests; remove fake placeholder tasks |
| Frontend | `app/challenge/[id].tsx` | Remove random userCurrentDay/userStreak; use real or day 1 |

---

## DB Migrations to Run

1. **backend/migration-push-tokens.sql**  
   - Creates `push_tokens` (user_id, token, device_id, created_at, updated_at, UNIQUE(user_id, token)).  
   - Adds `profiles.reminder_enabled`, `profiles.reminder_timezone`.

(Existing: migration-nudges.sql, migration-profiles-push-token.sql if you use profiles.expo_push_token; migration-core-fixes.sql for respects, day_secures.)

---

## Testing Checklist

1. **Push**: On device, sign in → allow notifications → token should be stored (push_tokens and/or profiles). Send nudge to that user → push received. Change reminder time in Settings → save; next day reminder uses new time.
2. **Fake data**: Challenge detail shows day 1 for starter, real day for joined; home shows "No tasks yet" when no tasks.
3. **Guest**: Browse home → leaderboard loads. Tap Respect or Nudge → auth gate. After sign-in, Respect/Nudge complete and persist.
4. **Health/tRPC**: GET `{backend}/health` → 200. POST/GET tRPC (e.g. leaderboard.getWeekly) → 200 with valid response.

---

## What’s Left (Optional)

- **Apple Sign-In**: Supabase Apple provider + expo-apple-authentication (or OAuth).
- **Server-side cron**: Daily reminder and streak-at-risk at user’s time (e.g. cron job that reads push_tokens and reminder settings and calls sendExpoPush). Local scheduling remains as fallback.
- **PostHog/Mixpanel**: Call `setAnalyticsHandler` and `setIdentify` with SDK implementation for production analytics.
