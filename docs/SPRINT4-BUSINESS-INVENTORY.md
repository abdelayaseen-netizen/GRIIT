# Sprint 4 Business Inventory

## PostHog / Analytics

- **SDK initialised:** yes — `lib/posthog.ts` uses `posthog-js` with `EXPO_PUBLIC_POSTHOG_API_KEY`
- **identify on auth:** yes — `contexts/AppContext.tsx` calls `identify(user.id, { email, isPremium, tier })` when profile is ready
- **Events currently tracked:** typed `track()` in `lib/analytics.ts` (e.g. `signup_completed`, `onboarding_started`, `challenge_viewed` type exists, `paywall_shown` / `purchase_*` on pricing screen, etc.)
- **Dev guard:** partial before Sprint 4 — PostHog sent whenever key is set; Sprint 4 adds explicit `__DEV__` / `EXPO_PUBLIC_POSTHOG_ENABLE_DEV` gating for captures

## Crash Reporting

- **Sentry SDK installed:** no (before Sprint 4)
- **Sentry initialised:** placeholder via optional `global.Sentry` in `lib/client-error-reporting.ts`
- **Error boundaries:** yes — `components/ErrorBoundary.tsx` → `reportClientError`
- **Existing module:** `lib/client-error-reporting.ts`

## RevenueCat

- **SDK installed:** yes — `react-native-purchases` in `package.json`
- **Configured:** yes — `lib/revenue-cat.ts` (`configureRevenueCat`), `lib/subscription.ts` (alternate init path), called from `app/_layout.tsx`
- **API keys in env:** placeholders — `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` in `.env.example` (and legacy `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in `lib/revenue-cat.ts`)
- **Paywall screen:** `app/paywall.tsx` (uses `purchasePro` / `restorePurchases` from `lib/revenue-cat.ts`; plan UI partly hardcoded)
- **Backend subscription sync:** yes — `profiles.validateSubscription`, `lib/subscription.ts` sync helpers
- **Premium gate:** yes — `FREE_TIER` / `canJoinChallenge`, `useProStatus`, join flow to paywall
