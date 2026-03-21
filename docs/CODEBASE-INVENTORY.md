# Codebase inventory

Generated as **Phase 0** of the full-stack scorecard audit. Commands were run from the repo root on **Windows (PowerShell)**; Linux `find`/`sed` equivalents were approximated where noted.

---

## 1. File tree (depth 4, excluding `node_modules` / `.expo` / `.git` / `coverage`)

PowerShell:

```powershell
Get-ChildItem -Recurse -Depth 4 -File | Where-Object { $_.FullName -notmatch 'node_modules|\.expo|\.git|coverage' } | Select-Object -First 300 -ExpandProperty FullName
```

**Sample (first ~80 lines of output):** project root files, `app/` screens, `assets/`, `backend/` (Hono, tRPC routes, lib), `components/`, `constants/`, `contexts/`, `docs/` (many markdown reports), `lib/`, `scripts/`, `src/components/ui/`, `supabase/migrations/`, config files (`app.json`, `eas.json`, `tsconfig.json`, `package.json`), etc.

**Notable layout:**

- **Frontend:** `app/` (Expo Router), `components/`, `src/components/ui/`, `hooks/`, `contexts/`, `store/`, `lib/`
- **Backend:** `backend/server.ts`, `backend/hono.ts`, `backend/trpc/` (routers under `routes/`)
- **DB:** `supabase/migrations/*.sql`, plus legacy SQL under `backend/*.sql`
- **API surface (Expo):** `app/api/health+api.ts`, `app/api/trpc/[trpc]+api.ts`

---

## 2. Count files by extension (excluding `node_modules` / `.git`)

PowerShell:

```powershell
Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' } |
  ForEach-Object { if ($_.Extension) { $_.Extension.TrimStart('.') } else { '(noext)' } } |
  Group-Object | Sort-Object Count -Descending | Select-Object -First 20 Name, Count
```

**Output:**

| Name | Count |
|------|------:|
| ts | 156 |
| tsx | 148 |
| md | 103 |
| sql | 50 |
| html | 47 |
| json | 11 |
| (noext) | 10 |
| js | 8 |
| png | 7 |
| bat | 2 |
| css | 2 |
| lock | 2 |
| gitignore | 2 |
| … | … |

---

## 3. All `app/**/*.tsx` screen/page files

Sorted list (45 files):

- `app/+not-found.tsx`
- `app/_layout.tsx`
- `app/accountability.tsx`
- `app/accountability/add.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/activity.tsx`
- `app/(tabs)/create.tsx`
- `app/(tabs)/discover.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/teams.tsx`
- `app/api/health+api.ts` *(ts, not tsx — listed in tree only)*
- `app/auth/_layout.tsx`
- `app/auth/forgot-password.tsx`
- `app/auth/login.tsx`
- `app/auth/signup.tsx`
- `app/challenge/[id].tsx`
- `app/challenge/[id]/chat-info.tsx`
- `app/challenge/[id]/chat.tsx`
- `app/challenge/active/[activeChallengeId].tsx`
- `app/challenge/complete.tsx`
- `app/create-profile.tsx`
- `app/create-team.tsx`
- `app/edit-profile.tsx`
- `app/invite/[code].tsx`
- `app/join-team.tsx`
- `app/legal/_layout.tsx`
- `app/legal/privacy-policy.tsx`
- `app/legal/terms.tsx`
- `app/onboarding/_layout.tsx`
- `app/onboarding/index.tsx`
- `app/paywall.tsx`
- `app/pricing.tsx`
- `app/profile/[username].tsx`
- `app/secure-confirmation.tsx`
- `app/settings.tsx`
- `app/success.tsx`
- `app/task/checkin.tsx`
- `app/task/complete.tsx`
- `app/task/journal.tsx`
- `app/task/manual.tsx`
- `app/task/photo.tsx`
- `app/task/run.tsx`
- `app/task/timer.tsx`
- `app/teams.tsx`
- `app/welcome.tsx`

---

## 4. API / backend route files (`server`, `api`, `routes`, `router`)

Representative `*.ts` files (excluding `node_modules`):

- `app/api/health+api.ts`
- `app/api/trpc/[trpc]+api.ts`
- `backend/hono.ts`
- `backend/server.ts`
- `backend/trpc/app-router.ts`
- `backend/trpc/create-context.ts`
- `backend/trpc/create-test-caller.ts`
- `backend/trpc/errors.ts`
- `backend/trpc/guards.ts`
- `backend/trpc/routes/*.ts` (accountability, achievements, auth, challenges, checkins, feed, integrations, leaderboard, meta, notifications, nudges, profiles, referrals, respects, sharedGoal, starters, stories, streaks, teams, user)

---

## 5. Store / context / state files (`*store*`, `*zustand*`, `*context*`)

Examples:

- `store/onboardingStore.ts`
- `contexts/ApiContext.tsx`
- `contexts/AppContext.tsx`
- `contexts/AuthContext.tsx`
- `contexts/AuthGateContext.tsx`
- `contexts/ThemeContext.tsx`

---

## 6. tRPC router entrypoints

The prompt’s `router({` pattern does not match this codebase; routers use **`createTRPCRouter`** from `backend/trpc/create-context.ts` (alias for `t.router`).

Files defining routers include:

- `backend/trpc/app-router.ts` — root `appRouter`
- `backend/trpc/routes/accountability.ts`, `achievements.ts`, `auth.ts`, `challenges.ts`, `checkins.ts`, `feed.ts`, `integrations.ts`, `leaderboard.ts`, `meta.ts`, `notifications.ts`, `nudges.ts`, `profiles.ts`, `referrals.ts`, `respects.ts`, `sharedGoal.ts`, `starters.ts`, `stories.ts`, `streaks.ts`, `teams.ts`, `user.ts`

---

## 7. Supabase migration files (`**/migrations/**/*.sql`)

**40 files** under `supabase/migrations/`, including (alphabetical sample):

- `20250228000000_accountability_pairs.sql`
- `20250228100000_last_stand.sql`
- `20250305000000_schema_fixes_profiles_challenges_stories.sql`
- …
- `20250616000000_active_challenges_end_at.sql`
- `20260320060000_restore_public_challenge_read_policies.sql`
- `20260320073000_active_challenges_select_policy.sql`
- `add_milestone_shared.sql`, `add_shared_column.sql`, `teams.sql`

---

## 8. Package.json dependencies (root)

From `package.json` — `dependencies` (abridged; full list in repo):

`@expo-google-fonts/inter`, `@expo/vector-icons`, `@hono/node-server`, `@hono/trpc-server`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, `@supabase/supabase-js`, `@tanstack/react-query`, `@trpc/client`, `@trpc/server`, `@upstash/ratelimit`, `@upstash/redis`, `dotenv`, `expo` (~54), `expo-*` modules (router, notifications, image, etc.), `hono`, `lucide-react-native`, `posthog-js`, `react`, `react-native`, `react-native-purchases`, `react-native-purchases-ui`, `superjson`, `zod`, `zustand`, …

**Other `package.json` files:**

- `backend/package.json` (backend workspace)

---

*End of inventory.*
