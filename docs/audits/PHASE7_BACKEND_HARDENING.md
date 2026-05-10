# Phase 7 — Backend Hardening

**Branch:** `cleanup/2026-05-deep-clean`
**Status:** STAGED. Migration written but **NOT applied** — Yaseen runs SQL manually (Gate C).

---

## 1. tRPC route audit

```
public:    26 procedures
protected: 113 procedures
total:     139 procedures
```

### Public procedures — justified

| File | Procedure | Why public |
|---|---|---|
| `auth.ts` | `signUp`, `signIn`, `getSession`, `getEmailForUsername` | Pre-auth (cannot require auth). |
| `auth.ts` | `signOut` (mutation) | Has `.input(z.object({}))`; no-arg mutation. |
| `feed.ts` | `getRecentCompletions` | Homepage social-proof reel — deliberately public read. |
| `profiles.ts` | `getPublicByUsername`, `getFollowers`, `getFollowing` | Public profile pages support deep-link previews. |
| `leaderboard.ts` | `getWeekly` | Public leaderboard. |
| `challenges.ts` | `list`, `getById` | Discover catalogue. |
| `challenges-discover.ts` | `getDiscoverFeed`, `getDiscoverFeatured`, `getDiscoverGrid`, `getDiscoverHabits`, `getRecommended`, `getCategoryCounts`, `getFeatured`, `getStarterPack`, `getCommunityPicks`, `getNewArrivals`, `getMostPopular`, `getTrending`, `getCompletedHabits` | Discover feed variants — read-only catalogue queries. |

All **mutations** (44 total) require auth. Verified by grep: no `publicProcedure ... .mutation` outside `auth.ts`.

### Input validation

```
mutations:                   44
procedures with .input(z.):  63
```

Sample of every mutation chain shows `.input(z.object(...))` immediately preceding `.mutation()`. The 95 procedures without `.input()` are zero-arg queries (`getDiscoverFeed`, `getRecentCompletions`, etc.) — valid.

### Rate limiting

```
$ grep -rEn "ratelimit\." --include="*.ts" backend/
backend/lib/rate-limit.ts                   (Upstash @ 5 req/sec → withRateLimit wrapper)
backend/trpc/routes/auth.ts                 signUp, signIn — wrapped
backend/trpc/routes/respects.ts             give — wrapped
backend/trpc/routes/reports.ts              create — wrapped
backend/trpc/routes/checkins.ts             complete — wrapped
backend/trpc/routes/challenges-create.ts    create — wrapped
```

Auth, abuse-prone (respects, reports), and write-heavy (checkins, create) routes are rate-limited.

### Error handling

```
catch blocks in backend:  55
empty catches:            0
```

All catches log via `pino` `logger.error({ err }, "...")` per the project's logging policy ("Backend = pino"). No silent swallows.

---

## 2. RLS audit — `public.profiles` (P0)

### Current state (the leak)

```sql
-- Effective policy on public.profiles:
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);
```

This was explicitly flagged-and-deferred in migration
`20260503000000_profiles_delete_policy_and_update_hardening.sql` (lines 17-24):

> Other RLS issues (e.g. the overly permissive SELECT policy that exposes
> columns like `expo_push_token`, `subscription_status`, etc. to anonymous
> requests) require additional product decisions...

**Anonymous callers with the anon key can today SELECT every column on
every row, including `expo_push_token`, `subscription_status`,
`subscription_expires_at`, `last_comeback_push_at`, `reminder_time`.**

### Production-safety verification

I verified that closing this leak does not break the app:

```bash
$ grep -rEn "from\(['\"]profiles['\"]\)\." --include="*.ts" backend/trpc/
```

All client-context (`ctx.supabase`) reads project safe columns only:
- `user_id, username, display_name, avatar_url`
- `user_id, profile_visibility`
- `user_id, total_days_secured` (own user via `eq("user_id", ctx.userId)`)

Any read of sensitive columns (`expo_push_token`) goes through
`createServiceClient()` (service role), which **bypasses RLS
entirely** — so server-side jobs are unaffected by RLS tightening.

### Migration written (NOT applied)

`supabase/migrations/20260510000000_profiles_rls_hardening.sql`

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone"        ON public.profiles;

CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE VIEW public.profiles_public AS
  SELECT user_id, username, display_name, avatar_url, bio,
         profile_visibility, created_at
  FROM public.profiles;
ALTER VIEW public.profiles_public SET (security_invoker = on);

GRANT SELECT ON public.profiles_public TO anon;
GRANT SELECT ON public.profiles_public TO authenticated;
```

**Rationale:**
- App requires sign-in for every profile-reading screen today, so
  authenticated-only is sufficient and least-privilege.
- `profiles_public` view exists for any future anon-facing surface
  (e.g. universal-link previews) — opt-in, projected columns only.
- `security_invoker = on` so the view honours the caller's RLS, not
  the view-owner's.

---

## 3. Migration drift

```bash
$ ls supabase/migrations/ | tail -10
20260427000000_lichess_handle.sql
20260428000000_completions_proof_extras.sql
20260429000000_streak_freeze_v3.sql
20260501000000_phone_otp_legacy_dep.sql
20260502000000_phone_otp_revert.sql
20260503000000_profiles_delete_policy_and_update_hardening.sql
20260510000000_profiles_rls_hardening.sql   ← NEW (this sprint, NOT applied)
```

Yaseen — verify against Supabase Dashboard → Database → Migrations and apply
the new file manually.

---

## Gates

| Gate | Status |
|---|---|
| `npx tsc --noEmit` | 0 errors ✓ |
| `npm run lint` | 0 errors ✓ |
| `npm test` | passing ✓ |
| Empty catches in backend | 0 ✓ |
| Public mutations | 0 (all behind auth) ✓ |
| RLS migration written | YES (Gate C — pending Yaseen) |
| RLS migration applied | NO (Gate C — Yaseen runs manually) |

---

## STOP — Gate C

Migration `20260510000000_profiles_rls_hardening.sql` is staged in repo
but **not applied to Supabase**. Yaseen reviews and applies SQL
manually. Phase 8 proceeds in parallel since Phase 8 does not depend
on this migration.
