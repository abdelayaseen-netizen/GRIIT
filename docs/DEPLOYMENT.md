# GRIIT Deployment Runbook

## Quick Reference
- **iOS bundle ID:** app.griit.challenge-tracker
- **Apple Team ID:** WZT43QXHZB
- **App Store ID:** 6761116285
- **Backend URL (production):** https://grit-backend-production.up.railway.app
- **Supabase project:** iazdfbqwudlodozgoyov
- **Railway service:** grit-backend
- **GitHub repo:** abdelayaseen-netizen/GRIIT

## Architecture Summary
- Frontend: Expo (React Native) -> EAS Build -> TestFlight -> App Store
- Backend: Hono + tRPC -> Railway -> public HTTPS endpoint
- Database: Supabase (Postgres + Auth + Storage)
- Monetization: RevenueCat (entitlement: "GRIIT Pro")
- Analytics: PostHog (frontend), Sentry (frontend + backend)
- Push: Expo Push (server-triggered via Railway cron)

## Deploy the Backend (Railway)

From the project root:

```powershell
# Confirm you're on the right branch
git status
git log -1 --oneline

# Deploy
railway up --service grit-backend
```

If you need to deploy from inside the backend folder:

```powershell
cd backend
railway up --service grit-backend
cd ..
```

**Wait for the deploy to finish.** Railway shows "Deploy succeeded" when ready. Then verify:

```powershell
# Liveness (Railway healthcheck path — no external calls)
Invoke-WebRequest -Uri https://grit-backend-production.up.railway.app/api/health -Method GET

# Full dependency check (Supabase query — use for monitoring, not as the load balancer probe)
Invoke-WebRequest -Uri https://grit-backend-production.up.railway.app/api/health/deep -Method GET
```

Expected: `200 OK` on `/api/health` whenever the Node process is up (body includes `deps.supabase_configured` — if `false`, fix env vars). `/api/health/deep` returns `200` or `503` depending on whether Supabase is reachable.

### Backend environment variables (Railway dashboard -> Variables)

Required:
- **`EXPO_PUBLIC_SUPABASE_URL`** — **REQUIRED** — Supabase project URL. Without it (and the anon key), the API cannot use the shared Supabase client; liveness still returns `200` with `supabase_configured: false` in the JSON body.
- **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** — **REQUIRED** — Supabase anon key (same as above).
- `SUPABASE_SERVICE_ROLE_KEY` - for backend-only operations
- `NODE_ENV` - `production`
- `CORS_ORIGIN` - app's origin (set to `*` only for dev)
- `PORT` - Railway sets this automatically; do not override

Optional:
- `SENTRY_DSN_BACKEND` - backend error tracking (Sentry)
- `EXPO_ACCESS_TOKEN` - for server-side push sends if used
- `CRON_SECRET` - required if cron endpoints are enabled

### Backend logs (source of truth for errors)

Per project standing rule: Railway logs are the source of truth before writing any fix.

```powershell
railway logs --service grit-backend
```

Tail mode:

```powershell
railway logs --service grit-backend --follow
```

## Deploy the iOS App (EAS Build -> TestFlight -> App Store)

```powershell
# Make sure JS-side type errors are zero before building
npx tsc --noEmit

# Build for iOS production
eas build --platform ios --profile production

# Once build finishes, submit to TestFlight
eas submit --platform ios --latest
```

`eas.json` has `production.autoIncrement: true`, so build numbers increment automatically.

After submission:
1. Wait ~10 min for App Store Connect to process the build
2. Check App Store Connect -> TestFlight -> confirm build status is "Ready to Test" (or wait through Beta App Review)
3. Public TestFlight link: https://testflight.apple.com/join/QDedP231

### Frontend environment variables (set via `.env` for local, EAS secrets for production)

Required:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_BASE_URL` - backend URL, no trailing slash

Optional:
- `EXPO_PUBLIC_POSTHOG_API_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` - RevenueCat iOS public key (`appl_...`)
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` - RevenueCat Android public key (`goog_...`)

To set EAS secrets:

```powershell
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_xxxxx
```

## Database Migrations (Supabase)

Migrations live in `supabase/migrations/`. They are NOT auto-run on deploy - you must apply them manually after creating them.

**Per standing rule: Live DB != migration files. Always verify columns exist before referencing them.**

### Apply a new migration

1. Open Supabase Dashboard -> SQL Editor
2. Copy the contents of the migration file (for example, `supabase/migrations/20260429100000_add_task_mode_to_check_ins.sql`)
3. Run it
4. Run `NOTIFY pgrst, 'reload schema';` to refresh PostgREST cache
5. Verify the column exists:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '<table>';
```

### Storage buckets (one-time setup, already done)

- `avatars` - public read, authenticated write
- `proof-photos` - authenticated read + write, owner-scoped

## Rollback Procedures

### Backend rollback (Railway)

```powershell
# List recent deployments
railway deployments --service grit-backend

# Roll back to previous deployment (Railway dashboard is easier here - Settings -> Deployments -> "Redeploy" on the prior one)
```

### Frontend rollback (App Store)

You cannot remove a TestFlight or App Store build, but you can:
1. **TestFlight:** expire the bad build in App Store Connect -> TestFlight -> Builds -> expire
2. **App Store (live):** ship a new build with `expo-updates` patch (if using OTA), or submit a hotfix build with a higher build number

### Database rollback

Supabase does not auto-rollback migrations. To revert:
1. Write a reverse migration (for example, `DROP COLUMN`, `DROP INDEX`)
2. Apply it via SQL Editor
3. Add the reverse migration as a new file in `supabase/migrations/` for repo audit trail

**Backups:** Supabase Pro tier provides daily PITR backups. To restore:
- Supabase Dashboard -> Database -> Backups -> restore to a new project, then migrate the data manually if needed

## Cron Jobs (cron-job.org)

Daily streak reset and lapsed reminders use cron-job.org pinging Railway:

- `POST https://grit-backend-production.up.railway.app/internal/daily-reset` - daily, runs streak rollover
- `GET https://grit-backend-production.up.railway.app/api/cron/send-reminders` - periodic, sends scheduled push notifications

Both endpoints require a secret. Supported auth modes in backend:
- `Authorization: Bearer <CRON_SECRET>` header
- `?secret=<CRON_SECRET>` query parameter
- `x-cron-secret: <CRON_SECRET>` for `/internal/daily-reset`

Set `CRON_SECRET` in Railway variables and configure cron-job.org accordingly.

## Pre-Push QA Checklist

Before any TestFlight build:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm audit` no high or critical vulnerabilities
- [ ] All migrations in `supabase/migrations/` applied to live Supabase
- [ ] PostHog `paywall_variant` flag configured (50/50 or single-variant decision)
- [ ] RevenueCat sandbox tested end-to-end on a physical iPhone (see `docs/PAYWALL-SMOKE-TEST.md`)
- [ ] Sentry receiving events (frontend + backend)
- [ ] PostHog receiving events (`cold_start`, `paywall_viewed`, `app_opened`)
- [ ] `CHANGELOG.md` updated with this version's changes

## Emergency Contacts (single-developer note)

This is currently a single-developer project. In the event of incapacity:
- GitHub repo access: `abdelayaseen-netizen/GRIIT` - admin via personal account
- Railway: account email on Railway dashboard
- Supabase: account email; project ID `iazdfbqwudlodozgoyov`
- App Store Connect: Team ID `WZT43QXHZB`, Apple ID linked to developer account
- RevenueCat: dashboard login

## Useful Links

- App Store Connect: https://appstoreconnect.apple.com/apps/6761116285
- Public TestFlight: https://testflight.apple.com/join/QDedP231
- Railway: https://railway.app
- Supabase: https://supabase.com/dashboard/project/iazdfbqwudlodozgoyov
- PostHog: dashboard URL (fill in)
- Sentry: dashboard URL (fill in)
- RevenueCat: https://app.revenuecat.com

### Troubleshooting: Healthcheck fails after deploy

If Railway healthcheck reports "service unavailable" after a deploy:

1. Check `railway logs --service grit-backend` for the actual error.
2. The most common cause is missing env vars — check the Variables tab for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Hit `/api/health` (liveness — should return `200` if Node is up):
   - If `200` with `deps.supabase_configured: false` → env vars are missing or empty; fix in Railway Variables.
   - If there is no response at all → the process did not bind (check logs for a stack trace on older builds; with lazy Supabase init, the process should still bind so this is rarer).
4. Hit `/api/health/deep` for a full dependency check (Supabase reachable, etc.). Expect `200` or `503` if the database check fails.
5. After fixing env vars, click **Redeploy** in the Railway dashboard on the latest deployment — no new commit is required.
