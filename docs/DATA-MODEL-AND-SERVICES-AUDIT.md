# Data Model and Services Audit

**Date:** 2025-03-05  
**Scope:** Data model (database schema, entities, relationships) and services (tRPC routes, frontend API usage, consistency).

---

## 1. Executive Summary

- **Data model:** Central schema lives in `backend/seed.sql` with additive migrations in `backend/migration*.sql` and `supabase/migrations/*.sql`. Several tables and columns are expected by the backend but only added in later migrations; running migrations in order is required.
- **Services:** Backend is tRPC-only over Supabase (no raw SQL). Frontend uses `lib/trpc.ts` (`trpcQuery` / `trpcMutate`) with path strings and no shared TypeScript types from the backend.
- **Risks:** Schema spread across many migration files; no single source of truth for “current schema”; frontend types are ad hoc (`as any` / inline); some routes assume columns/tables that may be missing if migrations were skipped.

---

## 2. Data Model

### 2.1 Canonical Tables (from seed + migrations)

| Table | Primary key | Key columns | Created in |
|-------|-------------|-------------|------------|
| **profiles** | user_id (UUID, FK → auth.users) | username (unique), display_name, bio, avatar_url, cover_url, created_at, updated_at | seed.sql |
| **stories** | id (UUID) | user_id (FK → auth.users or profiles), media_url, media_type, caption, created_at, expires_at | seed.sql |
| **story_views** | id (UUID) | story_id (FK → stories), user_id (FK → auth.users), viewed_at, UNIQUE(story_id, user_id) | seed.sql |
| **challenges** | id (UUID) | title, description, visibility, status, is_featured, creator_id, duration_*, category, … | seed.sql |
| **challenge_tasks** | id (UUID) | challenge_id (FK → challenges), title, type, required, … (many optional columns) | seed.sql |
| **active_challenges** | id (UUID) | user_id, challenge_id, status, start_at, end_at, current_day, progress_percent, created_at, completed_at | seed.sql |
| **check_ins** | id (UUID) | user_id, active_challenge_id, task_id, date_key, status, value, note_text, proof_url | seed.sql |
| **streaks** | user_id (PK, FK → auth.users) | active_streak_count, longest_streak_count, last_completed_date_key | seed.sql |
| **day_secures** | id (UUID) | user_id, date_key, UNIQUE(user_id, date_key) | migration-core-fixes.sql |
| **respects** | id (UUID) | actor_id, recipient_id, created_at | migration-core-fixes.sql |
| **streak_freezes** | id (UUID) | user_id, date_key, UNIQUE(user_id, date_key) | migration-activation-retention.sql |
| **last_stand_uses** | id (UUID) | user_id, date_key, UNIQUE(user_id, date_key) | 20250228100000_last_stand.sql |
| **push_tokens** | id (UUID) | user_id, token, device_id, UNIQUE(user_id, token) | migration-push-tokens.sql |
| **nudges** | id (UUID) | from_user_id, to_user_id, message, created_at | migration-nudges.sql |
| **accountability_pairs** | id (UUID) | user_id, partner_id, status, created_at, updated_at, UNIQUE(user_id, partner_id) | supabase/migrations/20250228000000_accountability_pairs.sql |

### 2.2 Profiles: columns added by migrations

Backend expects these; they are **not** in seed.sql and come from migrations:

- **user_id** – seed has it as PK; some setups may have created profiles with `id` PK only → 20250305000000 adds column + unique.
- **onboarding_completed** – 20250305000000_schema_fixes.
- **total_days_secured, tier, preferred_secure_time** – migration-core-fixes.sql.
- **streak_freeze_used_count, streak_freeze_reset_at** – migration-activation-retention.sql.
- **expo_push_token** – migration-profiles-push-token.sql.
- **reminder_enabled, reminder_timezone** – migration-push-tokens.sql.

Backend usage: `profiles.ts` (create/update/get/getStats), `streaks.ts`, `notifications.ts`, `accountability.ts`, `nudges.ts`, `respects.ts`, `leaderboard.ts`, `checkins.ts`, `stories.ts` (embed).

### 2.3 Challenges: columns added by migrations

- **status** – seed has it; 20250305000000 adds if missing.
- **is_featured** – seed has it; 20250305100000 adds if missing.
- **source_starter_id** (TEXT UNIQUE) – migration-activation-retention.sql (for starter-pack challenges).
- **live_date, replay_policy, require_same_rules, show_replay_label** – migration.sql.

### 2.4 Streaks: columns added by migrations

- **last_stands_available, last_stands_used_total, last_stand_earned_at** – 20250228100000_last_stand.sql.

### 2.5 Challenge_tasks: columns added by migrations

- **strict_timer_mode, require_photo_proof** – migration.sql.
- **journal_type, journal_prompt, allow_free_write, capture_mood/energy/body_state** – migration.sql.
- **word_limit_*, time_enforcement_*, schedule_type, anchor_time_local, *_offset_min, timezone_*** – migration.sql.

### 2.6 Relationships and integrity

- **stories → profiles:** Backend joins `stories` to `profiles (username, avatar_url)`; PostgREST needs a FK. Migration 20250305100000 adds unique on `profiles.user_id` and FK `stories.user_id` → `profiles(user_id)`.
- **profiles.user_id:** Must be unique for `onConflict('user_id')` in profiles.upsert and for the stories FK. Seed already has user_id as PK; if profiles was created with `id` PK only, 20250305000000 / 20250305100000 add column and unique index.
- All other FKs in seed/migrations point to `auth.users(id)` or to other app tables; no other missing FK identified.

### 2.7 Schema consistency issues

1. **Multiple migration sources:** Schema is split across `backend/seed.sql`, `backend/migration*.sql`, and `supabase/migrations/*.sql`. There is no single “apply all” script; order matters and skipping a file can leave backend expectations unmet.
2. **Naming:** Backend uses snake_case for DB columns; frontend often sees camelCase in procedure inputs/outputs (e.g. `activeChallengeId`). No shared DTO/types file.
3. **challenges.visibility:** Backend sends `PUBLIC`/`FRIENDS`/`PRIVATE` and stores lowercase (`public`/`friends`/`private`). Seed CHECK is `('public', 'private', 'friends')`; migration adds `'friends'`. Consistent.
4. **challenges.create** does not set `status` in insert; DB default `'published'` is relied on. If a migration added the column without default, inserts could fail or be null.

---

## 3. Services

### 3.1 Backend: tRPC router layout

- **Entry:** `backend/trpc/app-router.ts` composes one router per domain.
- **Context:** `create-context.ts` provides `req`, `userId` (from Bearer token via Supabase auth), and `supabase` (anon client or user-scoped client with token). No raw SQL; all data access via Supabase client.

| Router | Procedures (summary) | Tables used |
|--------|----------------------|-------------|
| auth | signUp, signIn, signOut, getSession | Supabase Auth only |
| profiles | create, get, update, getStats, search | profiles, active_challenges, streaks, streak_freezes, last_stand_uses, push_tokens |
| challenges | list, getFeatured, getStarterPack, getById, join, getActive, create | challenges, challenge_tasks, active_challenges, check_ins, streaks |
| checkins | complete, getTodayCheckins, secureDay | check_ins, challenge_tasks, active_challenges, streaks, day_secures, profiles |
| stories | create, list, markViewed | stories, story_views (embed profiles) |
| starters | getChallengeIdByStarterId, join | challenges, challenge_tasks, active_challenges, check_ins, streaks |
| streaks | useFreeze | streaks, profiles, streak_freezes |
| leaderboard | getWeekly | day_secures, profiles, streaks, respects |
| respects | give, getForUser | respects, profiles |
| nudges | send, getForUser | nudges, profiles, push_tokens |
| notifications | registerToken, updateReminderSettings, getReminderSettings | push_tokens, profiles |
| accountability | invite, listMine, respond, remove | accountability_pairs, profiles, push_tokens |
| meta | version | — |
| feed | list | — (returns [] ) |

### 3.2 Frontend: API usage

- **Client:** `lib/trpc.ts` – `trpcQuery(path, input?)` (GET) and `trpcMutate(path, input?)` (POST). Uses `getTrpcUrl()` from `lib/api.ts` and Supabase session for `Authorization: Bearer <token>`.
- **Paths used in app:**  
  `profiles.get`, `profiles.getStats`, `profiles.create`, `profiles.update`, `profiles.search`  
  `challenges.getActive`, `challenges.getFeatured`, `challenges.getStarterPack`, `challenges.getById`, `challenges.join`, `challenges.create`  
  `checkins.getTodayCheckins`, `checkins.complete`, `checkins.secureDay`  
  `stories.list`  
  `starters.join`  
  `streaks.useFreeze`  
  `leaderboard.getWeekly`  
  `respects.give`, `respects.getForUser`  
  `nudges.send`, `nudges.getForUser`  
  `notifications.getReminderSettings`, `notifications.updateReminderSettings`, `notifications.registerToken`  
  `accountability.listMine`, `accountability.invite`, `accountability.respond`, `accountability.remove`
- **Types:** No generated or shared types from backend. Call sites use `as any` or inline type assertions (e.g. `as ListData`). Procedure names and shapes are string-based; refactors can break callers without compile-time errors.

### 3.3 Service-layer observations

1. **No shared contract:** Backend uses Zod for input validation; frontend does not import those schemas or AppRouter types for response typing. `AppRouter` is exported but not used on the client for type-safe calls.
2. **Error handling:** `lib/trpc.ts` maps tRPC errors to `Error` with message and optional `data.code`. `formatTRPCError` in `lib/api.ts` maps codes (e.g. UNAUTHORIZED, BAD_REQUEST) to user-facing messages. Consistent pattern but no shared error type.
3. **Auth:** All mutations that touch user data use `protectedProcedure` and `ctx.userId`. Public procedures (e.g. leaderboard.getWeekly, challenges.list) do not require auth. Matches intended design.
4. **Idempotency / conflicts:** Profiles upsert on `user_id`; story_views upsert on (story_id, user_id); push_tokens upsert on (user_id, token). Schema supports these.
5. **meta / feed:** `meta.version` and `feed.list` exist so external checks or future clients do not 404; no frontend usage found.

---

## 4. Recommendations

### Data model

1. **Single schema source:** Maintain one “current full schema” script (e.g. `supabase/migrations/YYYYMMDD_full_schema.sql`) or use Supabase diff so new deploys and audits have a single reference.
2. **Migration checklist:** Document required migrations and order (e.g. in SETUP.md or README) so new environments run: seed → migration-core-fixes → migration-activation-retention → migration.sql → migration-push-tokens → migration-profiles-push-token → migration-nudges → last_stand → accountability_pairs → schema_fixes_profiles_challenges_stories → stories_fk_and_challenges_is_featured.
3. **Backfill profiles.user_id:** If any environment has profiles with `id` PK and no `user_id`, add a one-off backfill (e.g. from auth.users) and then add the unique constraint and stories FK.
4. **challenges.status default:** Ensure `status` has `DEFAULT 'published'` wherever the column is added so `challenges.create` never inserts null.

### Services

1. **Type-safe client:** Use tRPC client with `AppRouter` (e.g. `@trpc/client` or Expo-compatible fetch wrapper) so procedure paths and input/output types are inferred and refactors are caught at compile time.
2. **Shared error codes:** Consider a small shared constants file for tRPC error codes (e.g. UNAUTHORIZED, BAD_REQUEST) used by backend and frontend formatting.
3. **Document public vs protected:** In code or docs, list which procedures are public (no auth) vs protected (auth required) to avoid accidental exposure of user data.

---

## 5. Table × Route Reference (backend only)

Quick map of which tables each route reads/writes (R = read, W = write).

| Table | auth | profiles | challenges | checkins | stories | starters | streaks | leaderboard | respects | nudges | notifications | accountability |
|-------|------|----------|------------|----------|---------|----------|--------|-------------|----------|--------|---------------|-----------------|
| profiles | — | R,W | — | R,W | — | — | R,W | R | R | R | R,W | R |
| stories | — | — | — | — | R,W | — | — | — | — | — | — | — |
| story_views | — | — | — | — | R,W | — | — | — | — | — | — | — |
| challenges | — | — | R,W | — | — | R | — | — | — | — | — | — |
| challenge_tasks | — | — | R,W | R | — | R | — | — | — | — | — | — |
| active_challenges | — | R | R,W | R,W | — | R,W | — | — | — | — | — | — |
| check_ins | — | — | W | R,W | — | W | — | — | — | — | — | — |
| streaks | — | R | R,W | R,W | — | R,W | R | — | — | — | — | — |
| day_secures | — | — | — | R,W | — | — | — | R | — | — | — | — |
| streak_freezes | — | R,W | — | — | — | — | R,W | — | — | — | — | — |
| last_stand_uses | — | R,W | — | — | — | — | — | — | — | — | — | — |
| push_tokens | — | R | — | — | — | — | — | — | — | R | R,W | R |
| respects | — | — | — | — | — | — | — | R | R,W | — | — | — |
| nudges | — | — | — | — | — | — | — | — | R,W | — | — | — |
| accountability_pairs | — | — | — | — | — | — | — | — | — | — | — | R,W |

---

*End of audit.*
