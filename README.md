# GRIIT

A social discipline app for iOS — structured multi-day challenges, daily task completion with proof verification, streaks, leaderboards, and accountability mechanics. Think *Duolingo for discipline meets Strava for self-improvement*.

Built end-to-end: Expo + React Native frontend, Hono + tRPC backend on Railway, Supabase for auth and Postgres, RevenueCat for subscriptions, PostHog for analytics, Sentry for error monitoring.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 |
| Routing | Expo Router 6 (file-based, typed routes) |
| Client state | Zustand |
| Server state | TanStack Query + tRPC client |
| Backend | Hono + tRPC, deployed on Railway |
| Database | Supabase (Postgres + Auth, with RLS) |
| Rate limiting / cache | Upstash Redis (optional; in-memory fallback) |
| Monetization | RevenueCat (entitlement: GRIIT Pro) |
| Analytics | PostHog |
| Error monitoring | Sentry (frontend + backend) |
| Notifications | Expo Push, with cron-driven daily reset |
| Live Activities | `expo-live-activity` (iOS Lock Screen / Dynamic Island) |
| Tests | Vitest |

App identity: **GRIIT** · iOS bundle `app.griit.challenge-tracker` · Android package `app.griit.challenge_tracker` · Scheme `griit://` · Origin `https://griit.fit`.

---

## Project structure

```
app/                Expo Router screens
  (tabs)/           Home, Discover, Activity, Create, Profile
  api/              In-app API routes (tRPC, health) when bundled with the app
  auth/             Login, signup, forgot password, OTP, email verify
  challenge/        Challenge detail, chat
  task/             Task flows (journal, timer, run, photo, etc.)
  paywall.tsx       RevenueCat paywall
  legal/            Privacy policy, ToS
backend/            Hono + tRPC API (deploys to Railway)
  trpc/             Routers (auth, profiles, challenges, checkins, leaderboard, feed)
  lib/              Supabase client, rate limit, streak helpers
components/         Shared UI components
contexts/           Auth, App, Theme, AuthGate
hooks/              Custom React hooks
lib/                Supabase client, design system, analytics, share, notifications, RevenueCat, Sentry
store/              Zustand stores
constants/          Theme, copy, milestones
styles/             Shared styles
supabase/migrations/  SQL migrations (schema + RLS policies)
tests/              Vitest suites
docs/               Architecture, deployment, monetization, design system docs
docs/audits/        Historical audit reports and scorecards
assets/             Images, fonts, legal markdown
```

---

## Local development

**Prerequisites**

- Node.js 20.x (see `engines` in `package.json`)
- npm (canonical — see [Lockfile note](#lockfile) below)
- A Supabase project (create at [supabase.com](https://supabase.com); run the SQL files in `supabase/migrations/`)

**Setup**

```bash
git clone https://github.com/abdelayaseen-netizen/GRIIT
cd GRIIT
npm install

cp .env.example .env
# Fill in at minimum:
#   EXPO_PUBLIC_SUPABASE_URL
#   EXPO_PUBLIC_SUPABASE_ANON_KEY
# Optional but recommended for full functionality:
#   EXPO_PUBLIC_API_URL                  (backend URL when running it separately)
#   EXPO_PUBLIC_REVENUECAT_IOS_KEY       (paywall in dev)
#   EXPO_PUBLIC_POSTHOG_API_KEY          (analytics)
#   EXPO_PUBLIC_SENTRY_DSN               (errors)
```

**Run**

```bash
npm start               # Expo dev server
npm run start:ios       # iOS Simulator
npm run start:tunnel    # Expo via tunnel (useful for physical devices on locked-down networks)
npm run backend:start   # Hono backend on port 8080
npm test                # Vitest
npm run typecheck       # tsc --noEmit
npm run lint            # expo lint
```

See [SETUP.md](./SETUP.md) for the full local setup walkthrough including Supabase project creation, storage buckets, and seed SQL.

---

## Backend (production)

The Hono + tRPC backend lives in `backend/` and deploys to Railway:

- `nixpacks.toml` configures the build (`cd backend && npm install`)
- Start command: `cd backend && npm run start`
- Set in Railway dashboard: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV=production`, `CORS_ORIGIN`, `CRON_SECRET`, and (optional) `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

Then point the app at the deployed backend URL via `EXPO_PUBLIC_API_URL` (no trailing slash).

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full deployment notes.

---

## iOS (production)

Build and ship with [EAS](https://docs.expo.dev/build/introduction/):

```bash
npm i -g eas-cli
eas build --platform ios --profile production
eas submit --platform ios
```

See [docs/IOS-RELEASE-CHECKLIST.md](./docs/IOS-RELEASE-CHECKLIST.md) for the pre-submission checklist.

---

## Environment variables

Full list in [.env.example](./.env.example). Highlights:

| Variable | Required | Where | Description |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | yes | App + Backend | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | yes | App + Backend | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod | Backend | Service role for admin ops (cron, account deletion). Never expose client-side. |
| `EXPO_PUBLIC_API_URL` | prod | App | Deployed backend URL (no trailing slash). `EXPO_PUBLIC_API_BASE_URL` is also accepted. |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | prod | App | RevenueCat iOS SDK key (`appl_...`) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | prod | App | RevenueCat Android SDK key (`goog_...`) |
| `REVENUECAT_API_KEY` | optional | Backend | Server-side subscription validation; if unset, validation is skipped |
| `EXPO_PUBLIC_SENTRY_DSN` | optional | App | Frontend error reporting |
| `SENTRY_DSN_BACKEND` | optional | Backend | Backend error reporting |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | optional | App | PostHog analytics (`phc_...`) |
| `CRON_SECRET` | prod | Backend | Authenticates `/internal/daily-reset` cron calls |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | optional | Backend | Distributed rate limiting + response cache |
| `CORS_ORIGIN` | recommended | Backend | Allowed origin for browser-based callers |

---

## Documentation

- **Architecture overview** — [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Setup** — [SETUP.md](./SETUP.md)
- **Deployment** — [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Migrations** — [docs/MIGRATIONS.md](./docs/MIGRATIONS.md)
- **Monetization** — [docs/MONETIZATION.md](./docs/MONETIZATION.md)
- **iOS release checklist** — [docs/IOS-RELEASE-CHECKLIST.md](./docs/IOS-RELEASE-CHECKLIST.md)
- **Design system** — [docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md)
- **Historical audits & scorecards** — [docs/audits/](./docs/audits/)

---

## Lockfile

The repo is canonical on **`package-lock.json`** (npm). `bun.lock` and `bun.lockb` are listed in `.gitignore` and should not be tracked. If you prefer `bun`, install lives at the same `package.json` — but commits and CI assume npm.

---

## License

To be decided by project owner. All rights reserved until specified otherwise.
