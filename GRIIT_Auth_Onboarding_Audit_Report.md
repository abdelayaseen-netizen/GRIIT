# GRIIT App — Auth & Onboarding Audit Report

## 1. FILE MAP (Phase 1)

Every file involved in auth and onboarding, with a one-line role:

| File | Role |
|------|------|
| `app/auth/login.tsx` | Login screen: email/password form, Sign In, link to Signup and Forgot Password |
| `app/auth/signup.tsx` | Signup screen: email/password/confirm, Create Account, handles session + email-confirmation flow |
| `app/auth/forgot-password.tsx` | Forgot password: email input, reset link via Supabase, Back to Sign In |
| `app/auth/_layout.tsx` | Auth stack layout: login, signup, forgot-password (no header) |
| `app/create-profile.tsx` | Post-signup profile: username, display name, bio; upserts profiles, then `router.replace(ROUTES.ONBOARDING)` |
| `app/onboarding.tsx` | 7-step onboarding: Welcome, How heard, Notifications, Goal, Time, Pick challenge, Done; sets `onboarding_completed` on step 6, step 7 → day1-quick-win or tabs |
| `app/onboarding-questions.tsx` | Optional pre-signup onboarding (AsyncStorage); can set pending answers used at create-profile |
| `app/day1-quick-win.tsx` | Day 1 celebration after onboarding; "Let's go" → tabs or accountability add |
| `app/_layout.tsx` | Root layout: AuthRedirector, Stack with auth/create-profile/onboarding/(tabs)/etc. |
| `app/(tabs)/_layout.tsx` | Tab layout (Home, Discover, etc.) |
| `app/(tabs)/profile.tsx` | Profile screen; Sign Out calls `supabase.auth.signOut()` then navigates to auth |
| `app/settings.tsx` | Settings; Sign Out calls `supabase.auth.signOut()` and `router.replace(ROUTES.AUTH)` |
| `lib/supabase.ts` | Supabase client: AsyncStorage (RN), persistSession, autoRefreshToken, detectSessionInUrl: false |
| `lib/routes.ts` | ROUTES and SEGMENTS constants (AUTH, CREATE_PROFILE, ONBOARDING, etc.) |
| `lib/auth-expiry.ts` | Session expiry handler: Alert + `router.replace(ROUTES.AUTH)` |
| `lib/onboarding-pending.ts` | get/set/clear onboarding answers and pending challenge id (AsyncStorage) |
| `lib/onboarding-starters.ts` | Filter onboarding starter challenges by goal/time |
| `lib/starter-join.ts` | saveJoinedStarterId, setDay1StartedAt, getDay1TtfvSeconds, etc. |
| `contexts/AuthContext.tsx` | Auth provider: getSession + onAuthStateChange, exposes user/session/loading |
| `contexts/AuthGateContext.tsx` | Auth gate / guest handling |
| `backend/trpc/routes/profiles.ts` | Profile create/update; includes onboarding_completed, onboarding_answers |
| `backend/trpc/routes/auth.ts` | Auth-related tRPC (if any) |

---

## 2. ISSUES FOUND (Phases 2–4)

| # | File | Location | Description |
|---|------|----------|-------------|
| 1 | `app/auth/signup.tsx` | Error branch (~81–93) | On Supabase signUp error, code returned without `setLoading(false)` or `isSubmittingRef.current = false`, leaving the button stuck and allowing double-submit. |
| 2 | `app/(tabs)/profile.tsx` | handleLogout onPress | After `supabase.auth.signOut()` there was no navigation; user stayed on Profile with null user. Audit requires: "Sign Out clears session and navigates to Login." |
| 3 | `app/_layout.tsx` | AuthRedirector when `!user` | When there was no session, redirector did nothing. App could show tabs/home for unauthenticated users. Audit requires: "No session → Login screen." |

### Other checks (no code change)

- **Login**: Loading cleared only on error; on success loading stays until AuthRedirector navigates. Forgot Password and Create Account links present and navigate correctly.
- **Signup**: Uses `router.replace()` for Create Profile and Login; email-confirmation path handled with message and redirect to login.
- **Create profile**: Session check, validation, upsert, error alerts, `finally` clears `isPending`. On success `router.replace(ROUTES.ONBOARDING)`.
- **Onboarding**: 7 steps with progress dots; step 4/5 Next disabled until selection; step 6 saves and sets `onboarding_completed`; error Alert + `setSubmitting(false)`; step 7 "Let's go" → day1-quick-win or tabs via `router.replace`.
- **Profile fetch retry**: AuthRedirector already retries once (timeout + one retry) before treating as no profile.
- **Forgot password**: Exists; reset link, success state, Back to Sign In with `router.replace(ROUTES.AUTH_LOGIN)`.
- **Supabase**: `persistSession: true`, `autoRefreshToken: true`, storage adapter, `detectSessionInUrl: false`.
- **Settings**: Sign Out already calls `router.replace(ROUTES.AUTH)` after signOut.

---

## 3. FIXES APPLIED (Phase 5)

| Issue | File | Change |
|-------|------|--------|
| 1 | `app/auth/signup.tsx` | In the `if (error)` block, before showing the alert and cooldown, added `setLoading(false)` and `isSubmittingRef.current = false`, then `return`. Ensures loading and ref reset on any signup error. |
| 2 | `app/(tabs)/profile.tsx` | In handleLogout's "Sign Out" button `onPress`, after `await supabase.auth.signOut()` added `router.replace(ROUTES.AUTH as never)`. Added `router` to `useCallback` dependency array. |
| 3 | `app/_layout.tsx` | In AuthRedirector, when `!user`: if not already in auth and not in `onboarding-questions`, call `router.replace(ROUTES.AUTH as never)` so unauthenticated users are sent to the login stack. |

---

## 4. VERIFICATION CHECKLIST (Phase 6)

### New User Flow

- [x] App launch with no session → Login screen (AuthRedirector sends to AUTH).
- [x] Login: "G R I I T" and "Build Discipline Daily" present.
- [x] Login: "Create Account" navigates to Signup.
- [x] Login: "Forgot password?" navigates to Forgot Password.
- [x] Signup: email, password, confirm password; validation (length, match).
- [x] Signup: "Create Account" shows loading, calls Supabase, handles success and error (loading cleared on error).
- [x] After signup success (session): user lands on Create Profile via `router.replace`.
- [x] Create Profile: username/display name/bio, validation, submit saves to DB.
- [x] After Create Profile: `router.replace(ROUTES.ONBOARDING)` → Onboarding step 1.
- [x] Onboarding steps 1–7: each step renders, answers selectable, Next/Continue works; step 4/5 disabled until selection; step 6 saves and sets `onboarding_completed`.
- [x] Final step: "Let's go" → day1-quick-win or tabs; no back stack into onboarding.
- [x] Home/tabs: user authenticated, tabs work.
- [x] Post-auth/onboarding navigations use `replace` (no back into signup/onboarding).

### Returning User Flow

- [x] Valid session + completed onboarding → AuthRedirector sends to tabs (no login/onboarding flash).
- [x] Loading/splash during auth check (AuthRedirectorLoading).

### Incomplete Onboarding Flow

- [x] Session + profile + `onboarding_completed === false` → AuthRedirector sends to ONBOARDING.

### No Profile Flow

- [x] Session + no profile → AuthRedirector sends to Create Profile.
- [x] Profile fetch retries once before treating as no profile.

### Logout + Re-login Flow

- [x] Sign Out (Profile): clears session and navigates to Login.
- [x] Sign Out (Settings): already did replace to AUTH.
- [x] Re-login: AuthRedirector sends to Home (onboarding already done).

### Error Handling

- [x] Wrong password on Login → Alert, loading cleared.
- [x] Signup error (e.g. duplicate email, rate limit) → Alert, loading and ref cleared.
- [x] Forgot password: error shown, loading cleared in `finally`.
- [x] Onboarding step 6 save failure → Alert, `setSubmitting(false)` in `finally`.

---

## 5. ITEMS NOT FIXED / NOTES

- **Initial route**: Expo Router’s default index is `(tabs)`. With the new redirect, unauthenticated users are sent to `/auth` (login) by AuthRedirector, so they no longer see tabs first.
- **Deep link / email confirmation**: Supabase `onAuthStateChange` runs when the session appears (e.g. after email confirmation). AuthRedirector reacts to `user` and profile/onboarding_completed, so no extra deep-link handling was added; confirm in production with real email links.
- **Login "Forgot password"**: Uses `router.push(ROUTES.AUTH_FORGOT_PASSWORD)` so Back returns to Login; left as-is (audit allows either).
- **Create Profile "GRIIT"**: Header shows "GRIIT"; audit asked for "G R I I T" on auth screens; create-profile is post-auth and was not changed for this audit.

---

## Summary

- **File map**: 20+ files listed with roles.
- **Issues found**: 3 (signup error state, profile sign-out navigation, unauthenticated redirect).
- **Fixes**: All 3 applied (signup loading/ref, profile replace to AUTH, AuthRedirector redirect when `!user`).
- **Checklist**: All listed items verified or satisfied by current code and the applied fixes.

Auth and onboarding flows are aligned with the audit requirements; the only follow-ups are optional (e.g. deep-link testing, create-profile branding).
