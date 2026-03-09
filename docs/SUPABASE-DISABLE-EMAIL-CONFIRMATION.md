# Disable Email Confirmation for Signup (Supabase)

Users cannot sign up when email confirmation is required and emails are not being delivered. Disable it so signup returns a session immediately and users go straight into the app.

## Exact steps

1. Open **Supabase Dashboard**: https://supabase.com/dashboard and select your project.
2. In the left sidebar, go to **Authentication**.
3. Click **Providers** (or **Email** under Providers).
4. Find the **Email** provider and open it.
5. Turn **OFF** the option **"Confirm email"** (or **"Enable email confirmations"**).
6. Save if there is a Save button.

Alternative path (some Supabase UIs):

- **Settings** → **Authentication** → **Email** → toggle off **"Confirm email"**.

After this, `supabase.auth.signUp()` will return a `session` immediately (no confirmation email), and the app will redirect the user to the home screen without a "check your email" step.

---

## If sign-in fails: user created before confirmation was disabled

If a user was created when "Confirm email" was ON, their `email_confirmed_at` in `auth.users` may be `null`. Supabase can block sign-in until the email is confirmed.

**Check in Supabase:**

1. Dashboard → **Authentication** → **Users**.
2. Find the user by email and open them (or use SQL below).
3. Or run in **SQL Editor**:
   ```sql
   SELECT id, email, email_confirmed_at, created_at
   FROM auth.users
   WHERE email = 'the-user@example.com';
   ```
   If `email_confirmed_at` is `null`, sign-in may fail with "Email not confirmed".

**Fix (confirm the user manually):**

Run in **SQL Editor** (replace the email):

```sql
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'the-user@example.com';
```

Or in the Dashboard: **Authentication** → **Users** → select user → use "Confirm email" / "Confirm user" if available.

---

## Verify challenges RLS (Discover page)

If Discover shows "No challenges yet" but the database has PUBLIC published challenges, run this in **Supabase SQL Editor** to list policies on `challenges`:

```sql
SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'challenges';
```

You must have a SELECT policy that allows reading rows (e.g. `USING (true)`). If there is none, run the migration:

`supabase/migrations/20250318000000_challenges_rls_public_read.sql`

It creates:

- `Challenges viewable by everyone` — FOR SELECT USING (true)
- `Challenge tasks viewable by everyone` — FOR SELECT USING (true)
