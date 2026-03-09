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
