# Schema & Index Recommendations for Backend

This document lists schema assumptions and recommended indexes for production readiness. Apply via Supabase migrations or SQL editor.

## Assumptions the backend relies on

- **active_challenges**: `id` (PK), `user_id`, `challenge_id`, `status`, `challenge_id` references challenges. Application enforces one active join per (user_id, challenge_id) via duplicate check; DB constraint recommended.
- **check_ins**: `active_challenge_id` references active_challenges; upsert key is effectively (user_id, active_challenge_id, task_id, date_key) for complete.
- **day_secures**: One row per (user_id, date_key) per day; secureDay is idempotent (checks then inserts). Unique constraint prevents duplicate inserts under race.
- **streaks**: One row per user; upsert uses `onConflict: 'user_id'`.
- **respects**: Unique on (actor_id, recipient_id) implied for idempotent give (23505 treated as success).
- **challenges**: `status` default `'published'`; `source_starter_id` for starter pack.

## Recommended indexes (if not already present)

| Table | Columns | Purpose |
|-------|---------|--------|
| active_challenges | (user_id, status) | getActive, duplicate-join check |
| active_challenges | (user_id, challenge_id) WHERE status = 'active' | Enforce one active join; duplicate-join check |
| check_ins | (active_challenge_id, date_key) | getTodayCheckins, complete progress aggregation |
| check_ins | (user_id, date_key) | Optional: user-day lookups |
| day_secures | (user_id, date_key) UNIQUE | Idempotent secureDay; fast “already secured?” check |
| day_secures | (date_key) | Leaderboard by week |
| streaks | (user_id) UNIQUE | Upsert onConflict |
| respects | (actor_id, recipient_id) UNIQUE | Idempotent give |
| stories | (expires_at), (user_id), (created_at DESC) | list, TTL cleanup |
| story_views | (story_id, user_id) UNIQUE | markViewed upsert |
| push_tokens | (user_id, token) | registerToken upsert |
| accountability_pairs | (user_id, partner_id) UNIQUE | invite upsert |
| nudges | (from_user_id, to_user_id, created_at) | Rate limit “already nudged” |

## Recommended constraints

- **day_secures**: `UNIQUE (user_id, date_key)` so duplicate secure in same day is rejected and can be treated as success (23505).
- **active_challenges**: Partial unique index `UNIQUE (user_id, challenge_id) WHERE status = 'active'` to enforce one active join at DB level (optional if application check is sufficient).
