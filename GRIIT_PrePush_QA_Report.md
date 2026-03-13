# GRIIT Pre-Push Cleanup & QA Report

## 1 — Dead Code & Unused Imports ✅

- **grit-design-tokens / GRIT_ / "GRIT" / "G R I T"**: No matches. Naming is consistently GRIIT.
- **Day 1 Quick Win**: Still referenced in `lib/routes.ts` (ROUTES.DAY1_QUICK_WIN, SEGMENTS.DAY1_QUICK_WIN) and `app/_layout.tsx` (inDay1QuickWin check, Stack.Screen). Kept intentionally: screen is reachable for future use (e.g. deep link); it is no longer a required step in onboarding.
- **Unused imports**: Addressed by fixing TS errors (missing `Shield` in discover; `data.user` null check in signup).

## 2 — Route Integrity ✅

- All `router.push` / `router.replace` / ROUTES usages were checked against `app/` file structure. Every target maps to an existing file or Expo segment (e.g. `/(tabs)`, `auth`, `challenge/[id]`). No orphan routes found.

## 3 — Console Logs & Debug Code ✅

- **Removed**: `app/onboarding.tsx` — `console.log("[Onboarding] notification permission:", status)` (debug).
- **Kept**: All other `console.log`/`warn`/`error` are either:
  - `__DEV__`-guarded (signup, challenge, commitment, journal, AppContext),
  - Backend/tests (strava, push, cron, trpc, error-reporting, test files),
  - Or intentional error logging (ErrorBoundary, catch blocks).
- No logs found that print passwords, tokens, or session info.

## 4 — TypeScript ✅

- **`npx tsc --noEmit`**: Passes (exit code 0).
- **Fixes applied**:
  - `app/(tabs)/discover.tsx`: Added missing `Shield` import from `lucide-react-native`.
  - `app/auth/signup.tsx`: Guarded `data.user` — after session check, use `data.user?.id` and `if (!userId)` before profile upsert; clear loading and show alert if null.

## 5 — Supabase Schema Check (Manual)

Verify in Supabase Dashboard or SQL:

- **profiles**: `user_id` (uuid, PK/FK to auth.users.id), `display_name` (text), `username` (text, unique), `email` (text, optional depending on your design), `onboarding_completed` (boolean, default false), `updated_at` / `created_at`, `avatar_url` (optional).
- **RLS**: Authenticated user can insert/update their own profile row (so signup handler upsert succeeds).
- **Username uniqueness**: Unique constraint on `username` for availability check and to avoid races.

## 6 — Environment & Config ✅

- **.gitignore**: Includes `.env`, `.env*.local`, `*.key` — env/secrets not committed.
- **app.json**: `expo.name` is "GRIIT"; slug remains "grit-challenge-tracker"; scheme "griit". Bundle IDs still use "grit" — update to "griit" in app.json if you want consistency (optional).

## 7 — Full Flow Smoke Test (Manual)

Run on simulator/device:

| Test | What to verify |
|------|----------------|
| **1. Fresh signup → onboarding → home** | Login → Sign Up → 4 fields → Create Account → Onboarding (all steps) → Home; tabs work; display name shown where expected. |
| **2. Log out → log back in** | Profile → Sign Out → Login; no back into app; log in → Home (no onboarding again). |
| **3. Wrong password** | Human-readable alert; button not stuck. |
| **4. Duplicate email signup** | Error about email already existing; can retry. |
| **5. Username availability** | Taken → "Username taken"; change → "Available". |
| **6. Kill app mid-onboarding** | Reopen → onboarding (not Home). |
| **7. Network offline** | Login/signup show network error; retry after reconnecting works. |

## 8 — Git Hygiene (Before Push)

```bash
git status
git diff --cached --name-only | findstr /i "env secret key password token"
git diff --cached --stat
```

- Ensure no `.env` or secrets in staged files.
- Recommended commit message (or split into smaller commits):  
  `feat: pre-push cleanup and QA — remove debug log, fix TS (Shield, data.user), tsc clean`

## 9 — Known Edge Cases (Documented)

- Email confirmation deep link: test with real email if Supabase email confirmation is on.
- Create Profile fallback: still used when profile is missing (e.g. failed upsert); pre-fill from auth metadata.
- Username race: DB unique constraint handles two users picking same name; signup shows error.
- Forgot Password: separate screen exists and is linked from login.
- Social auth: not implemented.

---

**Summary**: Dead code/imports and naming are clean; one debug log removed; two TS errors fixed (Shield import, `data.user` null safety); tsc passes. Route integrity and console usage reviewed. Schema, smoke tests, and git hygiene are documented for you to run before push.
