# GRIIT Architecture

Single entry point for how the repo is structured and which systems it uses. For API procedure names and counts, see `docs/SPRINT5-TRPC-INVENTORY.md`. For RLS, see `docs/SPRINT5-RLS-INVENTORY.md`.

## Tech stack

| Layer | Technology |
|--------|------------|
| **Frontend** | React Native, Expo, expo-router (file-based routes) |
| **Backend** | Hono + tRPC (deployed separately; e.g. Railway) |
| **Database** | Supabase (Postgres + Auth + Storage) |
| **Auth** | Supabase Auth (email/password; session in app via Supabase client) |
| **Client state** | Zustand (`store/`) |
| **Server state** | TanStack Query (`lib/query-client.ts`, `lib/trpc.ts`) |
| **Design tokens** | `lib/design-system.ts` (`DS_COLORS`, spacing, typography, radius) |
| **Analytics** | PostHog via `lib/analytics.ts` (`trackEvent`) |
| **Crash reporting** | Sentry via `lib/sentry.ts` |
| **Monetisation** | RevenueCat via `lib/revenue-cat.ts` |
| **Icons** | lucide-react-native |

## Project structure (high level)

```
app/                 # Expo Router screens (file-based)
  (tabs)/            # Home, Discover, Activity, Profile, Teams, Create
  auth/              # Login, signup, forgot password
  challenge/         # Detail, active run, complete, chat
  task/              # Photo, timer, journal, run, checkin, manual, complete
  onboarding/        # Onboarding steps
backend/             # Hono + tRPC
  trpc/routes/       # Feature routers (challenges, checkins, profiles, …)
  lib/               # Rate limit, logger, Supabase service client
components/          # Shared UI
contexts/            # Auth, App, Api, AuthGate, Theme
hooks/               # Reusable hooks (teams, subscription, etc.)
lib/                 # Frontend utilities (analytics, sentry, routes, prefetch, design system)
store/               # Zustand stores
supabase/migrations/ # SQL migrations (RLS, schema)
docs/                # Sprint reports, inventories, scorecards
```

## Key files

| File | Role |
|------|------|
| `lib/design-system.ts` | Color, spacing, typography, radius tokens |
| `lib/analytics.ts` | `trackEvent` — single entry for product analytics |
| `lib/sentry.ts` | `initSentry`, `captureError`, user context |
| `lib/revenue-cat.ts` | Purchases configuration and helpers |
| `lib/query-client.ts` | React Query defaults |
| `lib/routes.ts` | Route path constants for navigation |
| `backend/trpc/app-router.ts` | Composed tRPC router |
| `backend/trpc/create-context.ts` | Request context, auth, rate limits |
| `backend/lib/rate-limit.ts` | Upstash-backed limits (when env configured) |

## tRPC API surface (order-of-magnitude)

Exact counts drift over time; regenerate from the repo:

- `rg '\.mutation\(' backend/trpc/routes/*.ts`
- `rg '\.input\(' backend/trpc/routes/*.ts`
- `rg 'protectedProcedure|publicProcedure' backend/trpc/routes/*.ts`

Detailed inventory: `docs/SPRINT5-TRPC-INVENTORY.md`.

## Database & security

- Migrations under `supabase/migrations/` define schema and **RLS** policies.
- Policy matrix: `docs/SPRINT5-RLS-INVENTORY.md`.
- Task proof uploads use storage with user-scoped paths (see migrations and Sprint 5 notes).

## Environment variables

Authoritative list: **`.env.example`** in the repo root. Typical client keys:

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL` or `EXPO_PUBLIC_API_BASE_URL` (backend base, no trailing slash)
- RevenueCat public keys (`EXPO_PUBLIC_RC_*` or `EXPO_PUBLIC_REVENUECAT_*`)
- `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_API_KEY`

Backend-only values (never ship to the client): `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_*`, `REVENUECAT_API_KEY` (server validation), etc.

## Sprint history (scorecard narrative)

| Sprint | Focus | Approx. score (from scorecard docs) |
|--------|--------|-------------------------------------|
| 0 | Baseline audit | 69 |
| 1 | Trust & polish (DS, a11y) | ~76 |
| 2 | UX hardening | ~80 |
| 3 | Design system long tail | ~84 |
| 4 | Business readiness (Sentry, analytics, RevenueCat) | ~88 |
| 5 | Backend hardening (tRPC audit, RLS) | ~91 |
| 6 | Deep clean + final scorecard | See `docs/SCORECARD-FINAL.md` |

## Further reading

- `docs/SPRINT5-TRPC-INVENTORY.md` — procedure list
- `docs/SPRINT5-RLS-INVENTORY.md` — RLS overview
- `docs/SCORECARD-FULLSTACK.md` — original rubric and checks
