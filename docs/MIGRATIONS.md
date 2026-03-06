# Database migrations – run order

Run these in **Supabase SQL Editor** in this order. New projects should run **seed first**, then every migration below. Existing projects: run only migrations you have not yet applied.

| Order | File | What it does |
|-------|------|----------------|
| 1 | `backend/seed.sql` | Base schema: profiles, stories, story_views, challenges, challenge_tasks, active_challenges, check_ins, streaks; RLS; seed challenges. |
| 2 | `backend/migration-core-fixes.sql` | day_secures, respects tables; profiles: total_days_secured, tier, preferred_secure_time. |
| 3 | `backend/migration-activation-retention.sql` | challenges.source_starter_id; profiles: streak_freeze_used_count, streak_freeze_reset_at; streak_freezes table; starter challenge seed. |
| 4 | `backend/migration.sql` | challenges: live_date, replay_policy, require_same_rules, show_replay_label; challenge_tasks: journal/time/word-limit/strict_timer/require_photo_proof columns. |
| 5 | `backend/migration-push-tokens.sql` | push_tokens table; profiles: reminder_enabled, reminder_timezone. |
| 6 | `backend/migration-profiles-push-token.sql` | profiles: expo_push_token. |
| 7 | `backend/migration-nudges.sql` | nudges table. |
| 8 | `supabase/migrations/20250228100000_last_stand.sql` | streaks: last_stands_available, last_stands_used_total, last_stand_earned_at; last_stand_uses table. |
| 9 | `supabase/migrations/20250228000000_accountability_pairs.sql` | accountability_pairs table + RLS. |
| 10 | `supabase/migrations/20250305000000_schema_fixes_profiles_challenges_stories.sql` | profiles: user_id, onboarding_completed; challenges: status; active_challenges: created_at; stories + story_views tables if missing; RLS for stories. |
| 11 | `supabase/migrations/20250305100000_stories_fk_and_challenges_is_featured.sql` | profiles: unique on user_id; stories FK → profiles(user_id); challenges: is_featured. |

**After running:** In Supabase Dashboard → Settings → API, use “Reload schema” (or run `NOTIFY pgrst, 'reload schema';`); each migration already does this.

**Troubleshooting:** If a migration fails (e.g. “column already exists”), that step was likely applied before; skip it and continue. If `profiles.user_id` has duplicates, fix data before adding the unique constraint in step 11.
