# Real Verification — Phase 0 Recon

> **Status:** All phases complete on branch `fix/real-verification`. Two migrations must be applied manually (see §7).

---

## 1. The verifyTask stub and full completion path

### The stub (was)

- **File:** `contexts/AppContext.tsx`
- **Implementation:** `verifyTask: (_taskId, _verificationData, _task) => ({ success: true, failureReason: undefined })`
- Always returned success. Zero checks. Only called from legacy screens (`run.tsx`, `checkin.tsx`).

### The two completion paths (before this work)

```
Primary path — useTaskCompleteScreen
  handleSubmit → completeTask → checkins.complete (real gates) → check_ins upsert
  setSubmitted(true) — driven by client, not server confirmation

Legacy path — run.tsx / checkin.tsx
  verifyTask stub (always success) → triggerCelebration (local only)
  → navigate back — NO server save ever written

Streak increment — ORPHANED
  checkins.secureDay → secure_day Postgres RPC → streaks.active_streak_count++
  Zero UI callers — never called from production flow
```

**Key finding:** The primary completion flow (`useTaskCompleteScreen`) did NOT call `verifyTask`. It called `completeTask` directly. The stub was a dead branch in the main flow and a live gap in the legacy flow. The streak number displayed was permanently stale.

---

## 2. Proof-photo flow and camera enforcement

**Flow:** `handleTakePhoto` → `ImagePicker.launchCameraAsync` → `uploadProofImageFromBase64` → Supabase Storage bucket `task-proofs` at path `{userId}/{timestamp}-{random}.ext` → public URL → `checkins.complete` input `photo_url` → stored in `check_ins.proof_url / photo_url / completion_image_url`.

**Camera-only enforcement gaps (before this work):**

| Layer | What it did | Trust |
|-------|-------------|-------|
| `handlePickImage` in `usePhotoCapture` | Early-returns with error if `requireCameraOnly` | Client-only |
| `TaskPhotoBody` | Shows camera-only UI copy, exposes only camera tap | Client-only |
| `assertHardModeCameraOnly` on server | Checks URL is non-empty string — no source verification | Presence only |
| Storage RLS | Path prefix must be `auth.uid()` — no MIME/size/source check | Path only |

No capture-source metadata was stored. A caller bypassing the app could pass any URL and pass verification.

---

## 3. Live schema — verified against production DB

All probing done via PostgREST column-existence technique (42703 = missing, empty array = exists but RLS-hidden).

### `check_ins` (live)

| Column | Live? | Notes |
|--------|-------|-------|
| id, user_id, active_challenge_id, task_id, date_key, status, value, note_text | EXISTS | Core |
| proof_url, photo_url, completion_image_url | EXISTS | |
| proof_source, proof_payload_json, external_activity_id, verification_status | EXISTS | `proof_source` populated only for Strava |
| created_at, shared, task_mode | EXISTS | |
| clocked_in_at, verification_gates | EXISTS | No tracked migration — added directly to live DB |
| heart_rate_avg, heart_rate_peak, location_latitude, location_longitude, timer_seconds_on_screen | EXISTS | |
| **capture_source** | **MISSING → added in S1** | Migration file created: `20260625000000` |

**UNIQUE constraint:** `(active_challenge_id, task_id, date_key)` — double-claim prevented by upsert semantics.

### `challenge_tasks` — schema drift

The following columns exist in migration files but **do not exist** on the live table. They live exclusively in the `config` JSONB column.

| Column | In migrations? | In live DB? |
|--------|---------------|------------|
| `hard_mode` | Yes | **NO** — lives in `config->>'hard_mode'` |
| `schedule_window_start` | Yes | **NO** — lives in `config->>'schedule_window_start'` |
| `schedule_window_end` | Yes | **NO** — lives in `config->>'schedule_window_end'` |
| `schedule_timezone` | Yes | **NO** — lives in `config->>'schedule_timezone'` |
| `required` | Yes (in `secure_day` RPC) | **NO** — lives in `config->>'required'` |

The server code (`checkin-complete-gates.ts`) correctly reads from `config` JSONB. The drift does not cause runtime errors except: the `secure_day` Postgres RPC used `ct.required = true` (a column that doesn't exist), causing a runtime error. Fixed in migration `20260625000001`.

### `active_challenges` — schema drift

| Column | Live? |
|--------|-------|
| id, user_id, challenge_id, status, start_at, end_at, current_day, progress_percent, created_at | EXISTS |
| completed_at | MISSING — in migrations, not in live DB |
| milestone_30_shared, milestone_75_shared | MISSING — in migrations, not in live DB |

---

## 4. Live RLS policies

Service role key not available locally (stored in Railway). User confirmed S2 (INSERT + UPDATE ownership tightening) was applied directly in the Supabase SQL editor.

| Table | Policy | Status |
|-------|--------|--------|
| `check_ins` INSERT | `auth.uid() = user_id AND active_challenges ownership` | **LIVE — applied by user** |
| `check_ins` UPDATE | `auth.uid() = user_id AND active_challenges ownership` | **LIVE — applied by user** |
| `check_ins` SELECT | `auth.uid() = user_id` OR owns linked active_challenge | OK |
| `active_challenges` | Full CRUD on own rows | OK |
| `challenge_tasks` SELECT | Public | OK |

Migration file `20260625000002` documents the live S2 state so it can be replayed on a fresh DB.

---

## 5. `secure_day` RPC — idempotency and bug

**Idempotency:** CONFIRMED. The RPC early-returns on `day_secures` row existence:
```sql
IF EXISTS (SELECT 1 FROM day_secures WHERE user_id = v_uid AND date_key = v_date_key) THEN
  RETURN QUERY SELECT current_streak::int, false;
  RETURN;
END IF;
```
Re-calling on the same day returns the current streak count without double-incrementing.

**Bug found:** RPC contained `WHERE ct.required = true` — but `required` is not a top-level column on `challenge_tasks` in the live DB. It lives in `config JSONB`. This caused a runtime error (`column challenge_tasks.required does not exist`) whenever `secure_day` was called. Fixed in migration `20260625000001` to use `(ct.config->>'required')::boolean IS NOT FALSE`.

---

## 6. Legacy screen accessibility

`run.tsx` (GPS/treadmill) and `checkin.tsx` (geo-time) — confirmed no in-app navigation reaches them. The only path is via old push notification deep-links (`/task/run`, `/task/checkin`). Code comment in `useTaskCompleteScreen.tsx` (line 305) confirms: "nothing pushes to TASK_CHECKIN/TASK_RUN anymore."

Both screens' `verifyTask` calls are now wired to the real `AppContext.verifyTask` → `verifyAndCompleteTask` → `checkins.verifyTask` mutation.

---

## 7. Migrations to apply manually

Two migration files are in the repo and committed to `fix/real-verification`. Apply both in the Supabase SQL editor in order:

### S1 — `capture_source` column (required for camera-only enforcement)
```
supabase/migrations/20260625000000_add_capture_source_to_check_ins.sql
```
```sql
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS capture_source TEXT
  CONSTRAINT check_ins_capture_source_check
    CHECK (capture_source IN ('camera', 'library', 'strava', 'unknown'));
```

### S2 — RLS baseline (documents already-live state; safe to re-run)
```
supabase/migrations/20260625000002_check_ins_rls_s2_baseline.sql
```
This migration drops the old weak INSERT/UPDATE policies and re-creates the live tightened ones. Safe to run even if already applied (uses `DROP POLICY IF EXISTS`).

### Secure_day RPC fix (unlocks streak advancement)
```
supabase/migrations/20260625000001_fix_secure_day_rpc_required_column.sql
```
**CRITICAL**: Until this is applied, `secure_day` will error at runtime and `streakAdvanced` will always be `false`. The verification itself (`verified: true`) still succeeds — the error is caught and logged without failing the completion.

---

## 8. What was built

| Phase | Commits | Status |
|-------|---------|--------|
| S1 migration — `capture_source` column | `c201b7c` | ✓ Done — apply manually |
| `secure_day` RPC fix | `c201b7c` | ✓ Done — apply manually |
| `checkins.verifyTask` server mutation | `c201b7c` | ✓ Deployed on push |
| Client swap — primary + legacy flows | `1446066` | ✓ Deployed on push |
| Rejection paths + enriched analytics | `0bde0b9` | ✓ Deployed on push |
| 16 verifyTask tests, FLAGS.REAL_VERIFICATION = true | `bc87135` | ✓ Done |
| S2 RLS baseline migration | — | Phase 2 |
| VERIFY_RECON.md | — | This file |

### `checkins.verifyTask` gates (in order)

1. **Auth + ownership** — throws `FORBIDDEN` if not owned
2. **Task-in-challenge** — `TASK_NOT_FOUND` if task's `challenge_id` ≠ active challenge
3. **Double-claim** — returns `verified:true` idempotently if already completed today
4. **Schedule window** — `OUTSIDE_WINDOW` if server time outside `config.schedule_window_start/end`
5. **Photo path ownership** — `PHOTO_NOT_YOURS` if URL path not under `{userId}/`
6. **Storage HEAD integrity** — `PHOTO_NOT_FOUND` / `PHOTO_INVALID_TYPE` / `PHOTO_TOO_SMALL`
7. **Camera-only** — `CAMERA_REQUIRED` if `config.require_camera_only && captureSource !== 'camera'`
8. **Heart rate** — `HEART_RATE_TOO_LOW` if avg BPM below threshold
9. **Location** — `LOCATION_GATE_FAILED` if outside geofence
10. **Upsert** — writes `check_ins` row with `capture_source`, `verification_status: 'verified'`, `verification_gates`
11. **Auto-secure** — calls `secure_day` RPC when all required tasks complete; `streakAdvanced: true` + `newStreakCount` returned

### Client trust boundary

- `setSubmitted(true)` fires **only** after server returns `{ verified: true }`
- On `{ verified: false }`: `track('task_verify_rejected', { reason_code })` + `showError(reason)` — user stays on screen to fix and retry
- `proof_posted` event fires on every `verified: true`
- `task_verified` event fires with `streak_advanced` flag

---

## 9. Known limitations (honest-cut)

- **`capture_source` is client-reported, server-enforced.** The client sends `captureSource: 'camera'`. The server rejects it if `captureSource !== 'camera'` for camera-only tasks. A modified client can lie. True camera enforcement would require a live-capture timestamp from the OS that cannot be forged — out of scope.
- **No content recognition.** Per spec: no ML/AI image analysis is performed.
- **Treadmill legacy screen** — `run.tsx` treadmill mode sends a `file://` URI (local photo, never uploaded to Storage). The server correctly rejects this with `PHOTO_NOT_YOURS`. User must use the main `task/complete` screen for photo-proof tasks. Nothing in production routes to `run.tsx`.
