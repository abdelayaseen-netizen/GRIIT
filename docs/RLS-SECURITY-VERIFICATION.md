# RLS & Supabase Security Posture Verification

Use this checklist to verify that Row Level Security (RLS) and table policies align with backend assumptions. Run in Supabase SQL Editor or Dashboard.

## 1. Verify RLS is enabled on critical tables

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'active_challenges', 'check_ins', 'day_secures', 'streaks',
    'challenges', 'challenge_tasks', 'respects', 'nudges', 'accountability_pairs',
    'stories', 'story_views', 'push_tokens', 'streak_freezes', 'last_stand_uses'
  )
ORDER BY tablename;
```

Expected: `rowsecurity = true` for tables that hold user-specific data. If any show `false`, enable:

```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
```

## 2. Expected policy posture (backend assumptions)

| Table | Backend assumption | Suggested policy direction |
|-------|--------------------|----------------------------|
| **active_challenges** | User may only read/write own rows (user_id = auth.uid()). | SELECT/INSERT/UPDATE/DELETE WITH CHECK (auth.uid() = user_id). |
| **check_ins** | Same: user_id = auth.uid(). | WITH CHECK (auth.uid() = user_id). |
| **day_secures** | Same. | WITH CHECK (auth.uid() = user_id). |
| **streaks** | Same. | WITH CHECK (auth.uid() = user_id). |
| **profiles** | User may read any profile (search), update only own. | SELECT true or per-row; INSERT/UPDATE own only. |
| **challenges** | Public read for visibility = 'public'; create = creator_id = auth.uid(). | SELECT for public; INSERT with creator_id = auth.uid(). |
| **challenge_tasks** | Read with challenge; insert with challenge ownership. | Via challenge or service. |
| **respects** | Insert as actor_id = auth.uid(); read as recipient or actor. | WITH CHECK (auth.uid() = actor_id). |
| **nudges** | from_user_id = auth.uid() for send; to_user_id for read. | WITH CHECK appropriately. |
| **accountability_pairs** | user_id or partner_id = auth.uid() for list/respond. | SELECT where user_id = auth.uid() OR partner_id = auth.uid(). |
| **stories** | Insert own; read all (list). | INSERT WITH CHECK (auth.uid() = user_id); SELECT true. |
| **story_views** | Insert own. | WITH CHECK (auth.uid() = user_id). |
| **push_tokens** | Own only. | WITH CHECK (auth.uid() = user_id). |

## 3. List existing policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Review that each table above has at least one policy that restricts writes (and reads where intended) by `auth.uid()`.

## 4. Service role vs anon

- Backend uses **anon** key with user JWT: `createClient(url, anonKey, { global: { headers: { Authorization: 'Bearer <user_token>' } } })`. So requests run as the authenticated user; RLS policies using `auth.uid()` apply.
- No service role in app code: good. If you add background jobs or admin tools, use service role only in a controlled environment and never expose it to the client.

## 5. Quick test (after applying policies)

As a signed-in user (e.g. via Supabase Auth in app), verify:

- Cannot read another user’s `active_challenges` or `check_ins` by changing IDs in a direct API call (backend already enforces ownership; RLS is a second layer).
- If RLS is misconfigured, direct Supabase client calls from the client could leak data; the backend uses server-side Supabase with user token, so RLS applies to backend requests.

Run this checklist after any schema or policy change.
