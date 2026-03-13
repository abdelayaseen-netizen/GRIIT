# RLS Audit

Run these in the Supabase SQL Editor to verify Row Level Security.

## 1. List all tables and RLS status

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Every table should have `rowsecurity = true`.**

## 2. List all policies

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Tables that must have RLS enabled

- `profiles` — read own, write own
- `challenges` — read all (public catalog)
- `challenge_tasks` — read all
- `active_challenges` — read own, write own
- `check_ins` — read own, write own
- `day_secures` — read all (for leaderboard), write own
- `streaks` — read own, write own
- `respects` — read all, write own
- `nudges` — read own, write own
- `accountability_pairs` — read own, write own
- `push_tokens` — read own, write own
- `streak_freezes` — read own, write own
- `activity_events` — read all (authenticated), write own
- `user_achievements` — read own, write own

If any table has `rowsecurity = false`, enable it and add appropriate policies.
