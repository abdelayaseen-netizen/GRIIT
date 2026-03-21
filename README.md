# GRIIT — Challenge Tracker

A standalone **iOS app** (and Android/web) for tracking daily challenges, streaks, and task completion. Built with **Expo** and **React Native**, with a **Node/Hono + tRPC** backend and **Supabase** for auth and database.

## What’s in this repo

- **Frontend:** Expo app in `app/`, `components/`, `contexts/`, `lib/`
- **Backend:** Hono + tRPC API in `backend/` (profiles, challenges, check-ins, stories)
- **Database:** Supabase (PostgreSQL + Auth). You bring your own project; schema in `backend/seed.sql`

No Rork or other third‑party app platform required. Run and build everything yourself.

## Prerequisites

- **Node.js** 18+
- **npm** or **bun**
- **Expo CLI** (optional; `npx expo` works without global install)

## Quick start (local)

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd GRIT-1
   npm install
   ```

2. **Supabase**  
   Create a project at [supabase.com](https://supabase.com), run `backend/seed.sql` in the SQL Editor, and create storage buckets (see [SETUP.md](./SETUP.md)).

3. **Environment**
   ```bash
   cp .env.example .env
   # Edit .env: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Start the app**
   ```bash
   npm start
   ```
   Then press `i` for iOS Simulator or scan the QR code with Expo Go.

5. **Backend (optional for local)**  
   If you want the API to run as a separate process (e.g. on port 8080):
   ```bash
   npm run backend:start
   ```
   For same-origin dev, the app can use the in-app API routes under `app/api/` (no separate backend needed).

Full details: [SETUP.md](./SETUP.md).

## iOS app (production)

To ship **GRIIT as an iOS app**:

1. **Backend**  
   Deploy the Node backend so the app can talk to it in production.

   - **Option A — Railway**  
     This repo includes `railway.json`. Connect the repo to [Railway](https://railway.app), set env vars (Supabase, `NODE_ENV`, `CORS_ORIGIN`), and deploy. Railway runs `cd backend && npm run start`. Use the generated URL (e.g. `https://your-app.up.railway.app`) as your API base.

   - **Option B**  
     Use any Node host (Render, Fly.io, your own server). Run `backend/server.ts` and set `PORT` and the same env vars.

2. **App env**  
   Set `EXPO_PUBLIC_API_BASE_URL` to your deployed backend URL (no trailing slash), e.g.:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://your-app.up.railway.app
   ```

3. **Build for iOS**  
   Use [EAS Build](https://docs.expo.dev/build/introduction/):
   ```bash
   npm i -g eas-cli
   eas build:configure
   eas build --platform ios
   ```

4. **Submit to App Store**  
   Use EAS Submit or App Store Connect (see [Expo’s App Store guide](https://docs.expo.dev/submit/ios/)).

So: **Railway (or another host) = backend only.** **EAS Build = iOS app.** They work together; there’s no single “standard” — Railway is just one common choice for the backend.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run start:ios` | Start and open iOS Simulator |
| `npm run start:web` | Start web dev server |
| `npm run backend:start` | Run Hono backend on port 8080 |
| `npm run test` | Run unit tests |

## Environment variables

| Variable | Required | Where | Description |
|----------|----------|--------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | App + Backend | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | App + Backend | Supabase anon key |
| `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_API_BASE_URL` | For prod | App | Backend URL (no trailing slash) |
| `PORT` | No | Backend | Server port (default `8080`) |
| `NODE_ENV` | No | Backend | `production` in prod |
| `CORS_ORIGIN` | Recommended in prod | Backend | Your app’s origin (e.g. for EAS / App Store app) |

See `.env.example` and [SETUP.md](./SETUP.md) for the full list.

## Project structure

```
├── app/                 # Expo Router screens & API routes
│   ├── (tabs)/          # Main tabs (Home, Discover, Activity, Create, Profile)
│   ├── api/             # In-app API (tRPC, health) when not using standalone backend
│   ├── auth/            # Login, signup, forgot-password
│   ├── challenge/       # Challenge detail & chat
│   ├── legal/           # Privacy policy, Terms of Service
│   └── task/            # Task flows (journal, timer, run, photo, etc.)
├── backend/             # Hono + tRPC API
│   ├── server.ts        # Entry (port 8080)
│   ├── trpc/            # Router, context, routes (auth, profiles, challenges, checkins, leaderboard, feed)
│   └── lib/             # Supabase client, rate-limit, streak helpers
├── components/         # Shared UI (home, challenge, profile, onboarding)
├── contexts/           # Auth, App, Theme, AuthGate
├── lib/                # Supabase, tRPC client, analytics, share, notifications
├── constants/          # Theme, copy, milestones
├── assets/              # Images, legal markdown
└── SETUP.md            # Full setup & env checklist
```

## Tech stack

- **App:** Expo 54, React Native, Expo Router, TypeScript
- **API:** Hono, tRPC, Supabase (auth + Postgres)
- **Deploy:** Backend → Railway (or any Node host); iOS app → EAS Build + App Store

For troubleshooting and production readiness, see [SETUP.md](./SETUP.md) and [docs/PRODUCTION-READINESS-SCORECARD.md](./docs/PRODUCTION-READINESS-SCORECARD.md).
