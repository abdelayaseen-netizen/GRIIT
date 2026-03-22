# RLS Policy Inventory (Sprint 5)

Sources: `supabase/migrations/*.sql`, `backend/seed.sql`, `backend/migration-core-fixes.sql`. **Latest migration wins** for a given table/policy name when migrations repeat `DROP POLICY IF EXISTS` + `CREATE POLICY`.

## Tables

| Table | RLS enabled | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-------------|--------|--------|--------|--------|--------|
| profiles | yes | Public read (`USING (true)` in seed; tightened in prod via later migrations if any) | own `user_id` | own | **Sprint 5 migration:** own delete | `deleteAccount` requires DELETE policy |
| challenges | yes | Public + participation-based policies (see `20250620100000`, `20260320060000`) | authenticated insert (seed / migrations) | varies | varies | Creator/custom challenge flows |
| challenge_tasks | yes | Tied to challenge read access | authenticated | — | — | |
| active_challenges | yes | own `user_id` (`20260320073000`) | own | own | own leave policy (`20250308000001`) | |
| check_ins | yes | own `user_id` (seed) | own | own | — | |
| streaks | yes | own | own | own | — | |
| stories | yes | `USING (true)` on stories (migration `20250305000000`) | own | — | — | Public story feed |
| story_views | yes | `USING (true)` | own | own upsert | — | |
| teams / team_members | yes | team policies (`teams.sql`) | join/create rules | owner update | leave | |
| challenge_members | yes | member select/insert/update (`20250312000000`) | | | | Team challenges |
| shared_goal_logs | yes | member policies | own insert | — | — | |
| accountability_pairs | yes | participant policies | | | | |
| last_stand_uses | yes | own | own | — | — | |
| connected_accounts | yes | own | own | own | own | Strava |
| user_achievements | yes | own read/insert | | | | |
| activity_events | yes | **broad read** (`USING (true)`) for community feed | own insert | — | — | |
| invite_tracking | yes | referrer/referred scoped | | | | Referrals |
| day_secures | yes (see `migration-core-fixes.sql`) | **`USING (true)`** for weekly aggregation | own insert | — | — | Leaderboard needs cross-user rows with anon JWT — see report |
| respects | yes | (from seed / migrations) | | | | |
| notifications / push (if table) | per migrations | | | | | |

## Storage buckets

| Bucket | Public? | Upload policy | Read policy | Delete policy | Path pattern |
|--------|---------|---------------|-------------|---------------|--------------|
| task-proofs | yes (bucket flag) | Authenticated; first path segment = `auth.uid()` (`20250330000000`) | Public SELECT on bucket | **Sprint 5:** DELETE own folder | `{user_id}/...` — matches `lib/uploadProofImage.ts` |

## Policy details (task-proofs)

From `20250330000000_task_verification_options.sql`:

- **INSERT:** `bucket_id = 'task-proofs' AND (storage.foldername(name))[1] = auth.uid()::text`
- **SELECT:** `bucket_id = 'task-proofs'` (public read — proofs may appear in feed)

Sprint 5 adds **DELETE** for authenticated users on their own prefix (defense-in-depth; upload code uses `${user.id}/`).

## Findings

1. **`day_secures` SELECT (true)** (if applied from `migration-core-fixes.sql`): allows any authenticated user to read all rows — required for `leaderboard.getWeekly` using the **user-scoped** Supabase client unless leaderboard is moved to service role.
2. **`activity_events` "Anyone can read activity"**: public activity feed; intentional for product.
3. **Profiles public SELECT**: usernames/stats visible for discovery; intentional.

## Final policy matrix (post–Sprint 5 migration)

Migration: `supabase/migrations/20260321120000_sprint5_rls_storage_hardening.sql`

| Surface | Change |
|---------|--------|
| `public.profiles` | `DELETE` policy: `TO authenticated` `USING (auth.uid() = user_id)` |
| `storage.objects` | `DELETE` policy: `bucket_id = 'task-proofs'` and first folder segment = `auth.uid()` |

All other tables: no schema change in this migration; rely on existing policies from prior migrations and `backend/seed.sql` where applicable.
