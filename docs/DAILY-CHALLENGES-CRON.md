# Daily (24-Hour) Challenges – Cron and Behavior

## Overview

- **User-created 24h challenges**: Created from the app with "24-Hour" type. Backend sets `starts_at` and `ends_at` on create; countdown and expiry use these.
- **Auto-generated daily challenges**: Optional. A cron job can create one public 24h challenge per day from a fixed set of templates.

## Schema

- `challenges.starts_at`, `challenges.ends_at` (timestamptz, nullable): Set for 24h challenges; used for countdown and expiry.
- `challenges.duration_type`: `'24h'` for 24-hour challenges, `'multi_day'` otherwise.
- `challenges.live_date`: Optional; for 24h challenges without `ends_at` (legacy), API derives `ends_at` as `live_date + 24h`.

Migration: `supabase/migrations/20250327000000_challenges_24h_starts_ends.sql` adds `starts_at` and `ends_at` and backfills from `live_date` for existing 24h rows.

## Timer and Expiry

- **Frontend** `lib/challenge-timer.ts`: `getChallengeTimeRemaining`, `formatTimeRemaining`, `formatTimeRemainingHMS`, `isChallengeExpired`. Used in challenge detail countdown and Discover 24h cards.
- **Backend** `backend/lib/challenge-timer.ts`: `isChallengeExpired`. Used in `checkins.complete` and `checkins.secureDay` to reject task completion and "secure day" after a 24h challenge has ended.

## Auto-Generated Daily Challenge (Optional)

- **Templates**: `backend/lib/daily-challenge-templates.ts` – 20 templates (title, description, category, tasks).
- **Generator**: `backend/lib/daily-challenge-generator.ts` – `pickTemplateForDate(date)`, `createDailyChallengeIfMissing(supabase, date)`. Creates one PUBLIC 24h challenge per calendar day (UTC), `creator_id` null. Idempotent: if a challenge already exists for that day’s window, it skips.
- **Cron endpoint**: `GET /api/cron/daily-challenge?secret=CRON_SECRET` (or `Authorization: Bearer CRON_SECRET`). Creates today’s challenge if missing.

### Running the cron

- **Recommended**: Call once per day (e.g. 00:05 UTC). Example with cron (host):  
  `5 0 * * * curl -s "https://your-api.com/api/cron/daily-challenge?secret=$CRON_SECRET"`
- **Env**: Same as other cron routes – `CRON_SECRET` must match. Backend uses Supabase (service role if `SUPABASE_SERVICE_ROLE_KEY` is set, else default client).

No cron is registered inside the app by default; you configure the schedule in your host (Vercel Cron, GitHub Actions, etc.).

## Discover and 24h Section

- Discover uses `challenges.getFeatured`; 24h challenges are those with `duration_type === "24h"`. Client filters to an "24-Hour" section and uses `ends_at` (from API, possibly derived from `live_date`) for countdown. Backend normalizes `ends_at` for 24h in `getById` and `getFeatured` when missing.
