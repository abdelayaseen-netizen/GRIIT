# iOS app release checklist

Steps to ship GRIT as an iOS app (TestFlight and/or App Store). Order matters where noted.

---

## Prerequisites (do first)

| # | Step | Notes |
|---|------|--------|
| 1 | **Apple Developer Program** | Paid membership at [developer.apple.com](https://developer.apple.com). Required for App Store and for installing on physical devices. |
| 2 | **Expo account** | Sign up at [expo.dev](https://expo.dev). Needed for EAS Build and Submit. |
| 3 | **Supabase project** | Create at [supabase.com](https://supabase.com). Run `backend/seed.sql` in SQL Editor; create storage buckets per SETUP.md. |
| 4 | **EAS CLI** | `npm i -g eas-cli` then `eas login`. |

---

## Backend (API must be live before the app can use it in production)

| # | Step | Notes |
|---|------|--------|
| 5 | **Deploy backend** | Use Railway (or another Node host). This repo has `railway.json`; connect repo to Railway, set env vars (see below), deploy. Root `railway.json` runs `cd backend && npm install` and `cd backend && npm run start`; `backend/package.json` has `"start": "tsx server.ts"`. |
| 6 | **Backend env vars** | On Railway (or your host) set: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `PORT` (optional, default 8080), `NODE_ENV=production`, `CORS_ORIGIN` (optional for app-only; set if you have a web origin). |
| 7 | **Note backend URL** | After deploy, copy the backend base URL (e.g. `https://your-app.up.railway.app`) with no trailing slash. The iOS app will need this at build time. |

---

## EAS Build configuration

| # | Step | Notes |
|---|------|--------|
| 8 | **EAS config** | This repo includes `eas.json` with `development`, `preview`, and `production` profiles. Run `eas build:configure` if you want to regenerate or change it. |
| 9 | **App build-time env** | The iOS app needs `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_API_BASE_URL` at **build time**. In EAS: **Project → Secrets** in Expo dashboard, add those three. They are injected as env vars during `eas build`. |
| 10 | **App icon and splash** | Ensure `assets/images/icon.png` (1024×1024) and `assets/images/splash-icon.png` exist; `app.json` references them. If the folder is missing or empty, add these assets before your first build or the build may fail. |

---

## Build and install (TestFlight or device)

| # | Step | Notes |
|---|------|--------|
| 11 | **Build for iOS** | From repo root: `eas build --platform ios`. Uses default `production` profile unless you pass `--profile preview`. First run may prompt for Apple credentials; EAS can manage them. |
| 12 | **Install build** | After build completes: download from the EAS build page, or use the link to install on a registered device. For TestFlight/App Store, proceed to submit. |

---

## Submit to App Store / TestFlight

| # | Step | Notes |
|---|------|--------|
| 13 | **App Store Connect app** | In [App Store Connect](https://appstoreconnect.apple.com), create an app (e.g. name “GRIT”, bundle ID `app.grit.challenge-tracker` to match `app.json`). |
| 14 | **Submit build** | `eas submit --platform ios --latest` (or specify build ID). Or in EAS dashboard, open the build and use “Submit to App Store”. |
| 15 | **TestFlight** | Once processed, the build appears in TestFlight for internal/external testers. |
| 16 | **App Store release** | In App Store Connect, complete product page, pricing, and submit for review when ready. |

---

## Verification

- [ ] Backend health: `curl https://YOUR_BACKEND_URL/api/health` returns `{"ok":true,...}`.
- [ ] Supabase: Tables exist; RLS enabled; storage buckets created.
- [ ] EAS: `eas build:list` shows a successful iOS build.
- [ ] App: Install build on device; log in; confirm API calls hit your backend (e.g. check backend logs or Supabase).

---

## Summary order

1. **Prerequisites:** Apple Developer, Expo account, Supabase project, EAS CLI (steps 1–4).  
2. **Backend:** Deploy to Railway (or other), set env, get URL (steps 5–7).  
3. **EAS:** Configure `eas.json`, set EAS Secrets for app env, verify assets (steps 8–10).  
4. **Build:** `eas build --platform ios` (steps 11–12).  
5. **Ship:** App Store Connect app, `eas submit`, TestFlight then App Store (steps 13–16).
