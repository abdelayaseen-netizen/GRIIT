# Verify challenges flow (Discover, create, join)

## 1. Check challenges in the database

**You must run this in the Supabase SQL Editor** (Cursor cannot connect to your Supabase project):

```sql
SELECT id, title, visibility, status, is_featured FROM challenges;
```

**Expected:** Rows with `visibility = 'PUBLIC'` and `status = 'published'` will appear on Discover. If the result is empty:

1. Run `supabase/migrations/20250317000000_visibility_uppercase.sql` (normalize visibility to uppercase).
2. Run seed migrations: `20250316000000_starter_challenges_seed.sql` and/or `20250308000000_discover_challenges_seed.sql`.

## 2. getFeatured query (backend)

In `backend/trpc/routes/challenges.ts`, **getFeatured** runs this Supabase query:

```ts
ctx.supabase
  .from("challenges")
  .select("*, challenge_tasks (*)", { count: "exact" })
  .eq("visibility", "PUBLIC")
  .eq("status", "published")
  .order("is_featured", { ascending: false })
  .order("participants_count", { ascending: false, nullsFirst: false })
  .order("created_at", { ascending: false })
  .range(safeOffset, safeOffset + limit - 1);
```

- Filters: `visibility = 'PUBLIC'`, `status = 'published'`.
- Optional: `search` (ilike on title), `category` (eq).

## 3. RLS

Migration `20250318000000_challenges_rls_public_read.sql`:

- Enables RLS on `challenges` and `challenge_tasks`.
- Adds SELECT for all users on both tables so getFeatured and getById work.
- Ensures `active_challenges` has INSERT for `auth.uid() = user_id` so the join_challenge RPC works.

Run this migration in the Supabase SQL Editor if Discover or join fails with permission errors.

## 4. Discover page → tRPC

- **File:** `app/(tabs)/discover.tsx`
- **Call:** `trpcQuery('challenges.getFeatured', params)` with `params = { search?, category? }`.
- **Backend route:** `challenges.getFeatured` (publicProcedure) in `backend/trpc/routes/challenges.ts`. Names match.

## 5. Create flow

- **Payload:** `lib/create-challenge-helpers.ts` `buildCreatePayload()` sends: `title`, `description` (default `""`), `type`, `durationDays`, `visibility` (uppercase `PUBLIC`|`FRIENDS`|`PRIVATE`), `tasks`, etc.
- **Backend:** `challenges.create` expects the same (description optional default `""`, visibility enum uppercase). No mismatch.

## 6. Join flow

- **Backend:** `challenges.join` takes `challengeId`, then calls Supabase RPC `join_challenge(p_challenge_id)`. The RPC inserts into `active_challenges` as the authenticated user (SECURITY INVOKER).
- **RLS:** Policy "Users can insert own active challenges" allows INSERT where `auth.uid() = user_id`. Migration ensures this policy exists.
