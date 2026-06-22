# 06 — Background Systems

> Phase 6 of 10. Read-only. Branch `feat/onboarding @ 953bccb`.

## 1. Notifications + cron

### Cron endpoints (all CRON_SECRET-guarded)
| Endpoint | File | Auth | Purpose |
|---|---|---|---|
| `GET /api/cron/send-reminders` | `backend/hono.ts:109` | `CRON_SECRET` (`:111`) | hourly morning + streak-at-risk push |
| `GET /api/cron/daily-challenge` | `backend/hono.ts:129` | `CRON_SECRET` (`:131`) | idempotent daily challenge from templates |
| `POST /internal/daily-reset` | `backend/hono.ts:149` | `CRON_SECRET` (`:151`) | `runDailyReset` — **streak reset depends on this** (`backend/lib/daily-reset.ts:9` "run once daily ~00:30 UTC") |

- All three are auth-gated by `CRON_SECRET`. ✅ Streak reset is wired to `/internal/daily-reset` → `runDailyReset`. (Whether the external scheduler actually hits these on cadence is `UNVERIFIED-LIVE`.)

### Push registration + storage — ⚠ token-column inconsistency
- FE registers via `registerForPushNotificationsAsync` and writes through `profiles.updatePushToken` + `notifications.registerToken` (`AuthContext.tsx:67-68`).
- **Readers disagree on the column:**
  - `backend/lib/sendPush.ts:37` reads **`profiles.push_token`**.
  - `backend/lib/daily-reset.ts:209-213` reads **`push_tokens` table** *and* **`profiles.expo_push_token`**.
  - `backend/lib/cron-reminders.ts:40` reads **`profiles.expo_push_token`**.
- Three storage targets in play (`profiles.push_token`, `profiles.expo_push_token`, `push_tokens` table). If the writer populates one and a given sender reads another, **pushes silently no-op**. **Major / verify** — confirm which column the FE actually writes vs. what each sender reads. (`UNVERIFIED-LIVE` for end-to-end delivery.)

### Notification-tap routing
- `app/_layout.tsx:456-499` `addNotificationResponseReceivedListener` → for `active_task_timer` routes to allow-listed `data.route` (`/task/*`, `/challenge/*`, home), else falls back to `ROUTES.ACTIVITY`. Routes to **real screens**. ✅

## 2. Live Activities (`expo-live-activity`)
- **Actually driven by state — not declared-but-never-called.** `lib/live-activity.ts` exposes `startLiveActivity`/`endLiveActivity` (`:95,:120`), invoked from:
  - `hooks/useTaskCompleteScreen.tsx:318` (start), `:331` (end) — task completion / timer.
  - `app/task/run.tsx:161` (end) — run flow.
- `app.json` declares `expo-live-activity` plugin + `NSSupportsLiveActivities: true` (`:27`). Errors wrapped in `captureError`. ✅ (On-device rendering = `UNVERIFIED-LIVE`.)

## 3. Analytics
- **Catalog:** 99 typed event names defined in `lib/analytics.ts`.
- **Emitted (literal `track({name})` / `trackEvent("…")`):** ~74 unique.
- **`challenge_created` fires from live code:** ✅ `components/create/CreateWizardV2.tsx:278` (the active create wizard) + backend activity event `challenges-create.ts:328`. (Also `useCreateChallengeWizardPersistence.ts:280`, which is debt-shelf.)
- **No PostHog `capture()` bypass** — zero direct `posthog.capture()` calls; all analytics route through `track`/`trackEvent`. ✅
- **Defined-but-never-emitted (candidate): ~38**, e.g. `paywall_purchase_cancelled`, `paywall_purchase_failed`, `purchase_started/completed/failed`, `respect_sent`, `nudge_sent`, `streak_lost`, `streak_lost_no_last_stand`, `streak_saved_last_stand`, `last_stand_earned/used`, `milestone_unlocked`, `weekly_goal_changed`, `weekly_summary_shown`, `invite_shared`, `onboarding_dropped`, `comeback_mode_started`, `day1_secured`, `discover_challenge_tapped`.
  - **⚠ Caveat:** detection matched only literal-string emissions. Events fired through **typed wrapper functions** (`trackColdStart`, `trackAppOpened`, `trackNotificationOpened`, `trackUserReturnedAfterLapse`, etc.) are **not** captured here, so several entries above (e.g. `notification_opened`, `user_returned_after_lapse`, `app_opened`, `cold_start`) **are** emitted via wrappers — the true dead-event count is **lower than 38**. Needs wrapper reconciliation before treating any single name as confirmed-dead. The funnel-gap signal (paywall/purchase/streak-loss events unemitted) is real and worth a pass. **Minor→Major** (analytics funnel completeness).

## 4. Error monitoring (Sentry)
- **Frontend:** `lib/sentry.ts` (`@sentry/react-native`) + `initialiseSentry()` at boot (`app/_layout.tsx:49`) + `export default Sentry.wrap(RootLayout)` (`:539`). ✅
- **Backend:** `backend/server.ts:5` `Sentry.init` (before other imports), with `captureException` on `uncaughtException`/`unhandledRejection` and server errors (`:40,:46,:59,:81`); `backend/lib/error-reporting.ts` + `backend/hono.ts` import Sentry. ✅
- **Error boundaries:** `components/ErrorBoundary` wraps the app (`app/_layout.tsx:531`); `Sentry.ErrorBoundary` wraps the tab layout (`app/(tabs)/_layout.tsx:12`). ✅
- **Swallowed errors:** several `catch {}` / `/* non-fatal */` sites (e.g. `AuthContext.tsx:42` session restore, push-token registration, `recordOpen`). Most critical paths use `captureError`, but a subset of network/non-fatal catches are silent by design. **Minor** (some signal lost, not crash-causing).

## Counts (Phase 6)
| Metric | Finding |
|---|---|
| Cron endpoints | 3, all `CRON_SECRET`-guarded ✅ |
| Notification/cron gaps | push-token **column inconsistency** (`push_token` vs `expo_push_token` vs `push_tokens`) — Major/verify |
| Live-activity wiring | **wired** (start/end driven by task/run state) ✅ |
| Unemitted analytics events | **~38 candidate** (overcounts via wrapper-fn emissions; funnel/paywall/streak gaps real) |
| `posthog.capture()` violations | **0** ✅ |
| Sentry coverage | FE ✅ + BE ✅ + error boundaries ✅; some silent catches (Minor) |
