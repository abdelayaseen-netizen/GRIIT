# Supabase `profiles` Table — Schema & RLS Verification

Use this checklist in the **Supabase Dashboard** (or SQL editor) to verify the app’s expectations for the `profiles` table and RLS. This addresses scorecard items 9.1 and 9.2.

## 1. Required columns

Run in SQL or check in Table Editor:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Expected columns (or equivalent):

| Column                | Type         | Nullable | Default   | Notes                          |
|-----------------------|-------------|----------|-----------|--------------------------------|
| `user_id`             | `uuid`      | NOT NULL | —         | PK, FK to `auth.users(id)`     |
| `display_name`        | `text`      | NOT NULL | —         |                                |
| `username`            | `text`      | NOT NULL | —         | **UNIQUE**                     |
| `email`               | `text`      | YES      | —         | Optional                       |
| `onboarding_completed`| `boolean`   | NOT NULL | `false`   |                                |
| `onboarding_answers`  | `jsonb`     | YES      | `null`    |                                |
| `primary_goal`        | `text`      | YES      | `null`    |                                |
| `daily_time_budget`   | `text`      | YES      | `null`    |                                |
| `avatar_url`          | `text`      | YES      | `null`    |                                |
| `created_at`          | `timestamptz`| NOT NULL | `now()`   |                                |
| `updated_at`          | `timestamptz`| NOT NULL | `now()`   |                                |

Add missing columns if needed:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_answers jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_goal text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_time_budget text;
-- etc.
```

## 2. Unique constraint on `username`

```sql
-- List constraints
SELECT conname, contype FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- Add if missing
ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
```

## 3. RLS policies

```sql
-- List policies
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'profiles';
```

Required:

- **SELECT (own row):** authenticated user can read their own row (`auth.uid() = user_id`).
- **INSERT (own row):** authenticated user can insert a row with `user_id = auth.uid()`.
- **UPDATE (own row):** authenticated user can update their own row.
- **Username availability:** either a public/anonymous `SELECT` that allows checking by `username` (e.g. for signup), or an Edge Function / DB function used by the app.

Example policies (adjust names to match your conventions):

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- For username availability check (unauthenticated or other users):
CREATE POLICY "Anyone can check username"
ON profiles FOR SELECT TO anon, authenticated
USING (true);
```

If you restrict public `SELECT` for privacy, use a DB function or Edge Function that returns only “username taken” (boolean) instead of full rows.

## 4. Document what you did

After running the checks:

- Note any columns you added.
- Note any policies you created or changed.
- If you use a function for username check, document its name and usage here.

Once this is done, scorecard items 9.1 and 9.2 can be marked as verified.
