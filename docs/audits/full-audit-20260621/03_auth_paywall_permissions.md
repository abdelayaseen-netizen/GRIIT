# 03 — Auth, Paywall, Permissions

> Phase 3 of 10. Read-only. Branch `feat/onboarding @ 953bccb`.

## 1. Auth & session

`contexts/AuthContext.tsx` — Supabase-backed.
- **Cold-start restore:** `supabase.auth.getSession()` on mount (`AuthContext.tsx:32-43`), with a **5s timeout fallback** (`:30`) that flips `loading=false` so the UI can't hang.
- **Token refresh / state changes:** `supabase.auth.onAuthStateChange` subscription (`:45-49`) — Supabase auto-refreshes tokens; user/session state updates reactively. ✅
- **Push token registration** after login (`AuthContext.tsx:57-76`) → `profiles.updatePushToken` + `notifications.registerToken`.
- **Error handling gap:** `getSession()` `.catch` **swallows the error** (`:42` "error swallowed") and proceeds as guest. **Minor.**

### Logout
- **Sign-out button:** `components/settings/AccountDangerZone.tsx:63,70` → `supabase.auth.signOut()` + `runClientSignOutCleanup` (`:13`).
- **Cleanup is thorough:** `lib/signout-cleanup.ts:14` clears React Query cache, Sentry user, PostHog session, scheduled notifications; `AppContext.tsx:179` `clearSubscription()`.
- **Redirect:** post-signout → `replace(ROUTES.AUTH)` (`AccountDangerZone.tsx:67`). State cleared + redirect wired. ✅ *(note: `ROUTES.AUTH="/auth"` ambiguity from Phase 1.)*

### Auth screens
| Screen | File | Wired to Supabase → next |
|---|---|---|
| Login | `app/auth/login.tsx` | email/Apple/Google → `replace(CREATE_PROFILE)`/`replace(TABS)` ✅ |
| Signup | `app/auth/signup.tsx` | `supabase.auth.signUp` (`:130`) → `replace(TABS)` (`:206`) |
| Forgot password | `app/auth/forgot-password.tsx` | reset email ✅ |
| **OTP / email-verify** | — | **NONE** |

- **Signup verify path:** `signup.tsx:151-166` — if `signUp` returns no session, it falls back to `signInWithPassword` to mint a session; if still none, errors out. **There is no email-verify / OTP screen.** This works **only if Supabase "Confirm email" is OFF** (auto-confirm). If confirmation is required, signup dead-ends with no verify UI. → **`UNVERIFIED-LIVE`** (depends on Supabase Auth setting). **Major if confirmation is ON.**

## 2. Paywall & entitlements

`lib/subscription.ts` (re-exported via `lib/revenue-cat.ts`).
- **Entitlement ID = `"GRIIT Pro"`** (`subscription.ts:16`) — **matches spec.** ✅ Checked consistently at `:80, :90, :107, :130, :159, :198`.
- **Init:** `initializeRevenueCat(userId)` (`subscription.ts:51`) configures RC with the Supabase user id as `appUserID`, reads `entitlements.active["GRIIT Pro"]`, syncs to `profiles.subscription_status/expiry`, and registers `addCustomerInfoUpdateListener`. Called from **`contexts/AppContext.tsx:127`** (`initSubscription(user.id)`) after auth. ✅
- **Offering-driven prices (no hardcoding):** paywall reads `getOfferings()` → `offerings.current` (`subscription.ts:137-147`); `app/paywall.tsx:70` loads the offering and renders `product.priceString`. **No hardcoded prices.** ✅
- **Product IDs `griit_pro_monthly` / `griit_premium_annual`:** **not referenced in code** — packages come from the RC offering dynamically. Matching the dashboard config is **`UNVERIFIED-LIVE`**.
- **Restore purchases:** `restorePurchases()` (`subscription.ts:188`) wired in both `app/paywall.tsx:137` and `app/settings.tsx:298`. ✅
- **Trial handling:** `purchasePackage` distinguishes `periodType` trial/intro → emits `trial_started` vs `subscription_started` (`subscription.ts:164-170`). ✅
- **Fail-closed when RC unavailable:** `checkPremiumStatus()` returns `false` on web/Expo Go/error (`:127,:131`). ✅ `useProStatus` wraps it in a query (`hooks/useProStatus.ts`).

### Premium-bypass findings
- **⚠ Fail-OPEN default:** `app/challenge/[id].tsx:344` declares `isPro = true` as a **default prop**. The lock `isLockedProFeature = !isPro && (require_location || require_heart_rate)` (`:364`) is therefore **disabled by default**. The live render passes the real value (`isPro={isPro}` from `useProStatus`, `:526,:1328`), so the active path is safe — but the backwards default is a latent bypass: any new render path that forgets the prop unlocks premium task features. **Major (latent).** Should default `false`.
- **⚠ Free-limit enforcement is thin / client-side:** `FREE_LIMITS.MAX_ACTIVE_CHALLENGES=3` is checked in `lib/premium.ts:36` (`currentActiveCount < MAX_ACTIVE_CHALLENGES`), but `lib/premium.ts` exports are **knip-flagged unused** (Phase 0), so the wiring is uncertain. `FREE_LIMITS.MAX_CREATED_CHALLENGES=1` is **defined (`feature-flags.ts:47`) but has no enforcement reference** anywhere. Server-side enforcement: only `streaks.ts` `monthlyFreezeLimit(isPremium)` (`:10,:23,:59`) gates by entitlement. → Free "1 created / 3 active" limits may **not be enforced server-side**; a client could exceed them. **Major / verify.** (Monetization gate, not a security hole.)
- Premium task features (location / heart-rate) are gated by `isLockedProFeature`; `LOCATION_CHECKIN_ENABLED=false` further gates location. Premium packs/analytics/profile flags are `true`.

## 3. OS permissions

| Permission | Usage string (`app.json`) | Runtime request before use |
|---|---|---|
| Camera | `NSCameraUsageDescription` (`:22`) ✅ | `ImagePicker.requestCameraPermissionsAsync` before `launchCameraAsync` — `hooks/usePhotoCapture.ts:49,54`; `app/task/run.tsx:451,458` ✅ |
| Photo library | `NSPhotoLibraryUsageDescription` (`:23`) ✅ | `requestMediaLibraryPermissionsAsync` — `usePhotoCapture.ts:73`; `lib/avatar.ts:35`; `ProfileSetup.tsx:78`; `ShareSheetModal.tsx:247` ✅ |
| Location | `NSLocationWhenInUseUsageDescription` (`:24`) ✅ | location check-in flow (gated by `LOCATION_CHECKIN_ENABLED=false`) |
| Push notifications | (no plist string needed) | `Notifications.requestPermissionsAsync` — `lib/notifications.ts:226,606`; `register-push-token.ts`; bootstrap in `app/_layout.tsx` ✅ |
| Tracking | `NSUserTrackingUsageDescription` (`:25`) ✅ | (ATT — analytics) |

- Android perms declared (`app.json:41-47`): CAMERA, READ_EXTERNAL_STORAGE, ACCESS_FINE/COARSE_LOCATION, VIBRATE.
- **No permission gap found:** the proof-photo flow **does** request camera/library before use — contrary to the "dies silently" concern. ✅ (Denial-state UX not re-verified on device → `UNVERIFIED-LIVE`.)

## UNVERIFIED-LIVE list (Phase 3)
1. RevenueCat dashboard: entitlement `"GRIIT Pro"` + products `griit_pro_monthly` / `griit_premium_annual` exist and match the offering.
2. Apple / Google OAuth actually return a session on a real device.
3. Supabase Auth "Confirm email" setting — determines whether the no-verify-screen signup path works or dead-ends.
4. iOS AASA / Android assetlinks at `griit.fit` (universal links — Phase 1).
5. Runtime free-limit enforcement (1 created / 3 active) on a real account.
6. Permission-denied UX (camera/library/notifications) on device.

## Counts (Phase 3)
| Metric | Finding |
|---|---|
| Auth-flow gaps | **1** (no email-verify/OTP screen — `UNVERIFIED-LIVE`), +1 swallowed session error (Minor) |
| Premium-bypass paths | **2** (fail-open `isPro=true` default; unenforced `MAX_CREATED_CHALLENGES`) |
| Permission gaps | **0** (all requested + usage strings present) |
| UNVERIFIED-LIVE items | **6** |
