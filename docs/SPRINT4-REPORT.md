# Sprint 4 Report: Business Readiness

**Date:** 2026-03-21

## Summary

Sprint 4 wires **Sentry** (optional DSN, dev-safe), **PostHog** funnel events with a **dev guard**, **RevenueCat** API key aliases and helpers, **paywall** purchase/restore analytics, and **centralized sign-out cleanup** (React Query, Sentry user, analytics reset). `.env.example` documents new public variables.

## Metrics

| Area | Before | After |
|------|--------|--------|
| Sentry (`@sentry/react-native`) | Not integrated | `lib/sentry.ts`, `initSentry()` in root layout, `Sentry.wrap(RootLayout)` |
| PostHog in `__DEV__` | Sent when API key set | `shouldSendPostHog()` — production always; dev only if `EXPO_PUBLIC_POSTHOG_ENABLE_DEV === 'true'` |
| RevenueCat env names | `EXPO_PUBLIC_REVENUECAT_*` only | Also reads `EXPO_PUBLIC_RC_IOS_API_KEY` / `EXPO_PUBLIC_RC_ANDROID_API_KEY` (+ legacy aliases) |
| Sign out | Ad-hoc `queryClient.clear()` | `runClientSignOutCleanup()` on profile, settings, and tRPC 401 |
| `trackEvent(` call sites (app/lib, excl. definition) | 0 | 30+ |

## Environment variables (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry client DSN; omit to disable |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | PostHog project key |
| `EXPO_PUBLIC_POSTHOG_ENABLE_DEV` | `"true"` to send events from dev builds |
| `EXPO_PUBLIC_RC_IOS_API_KEY` / `EXPO_PUBLIC_RC_ANDROID_API_KEY` | RevenueCat (preferred names) |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | RevenueCat (aliases) |

No secrets are hardcoded; placeholders only in `.env.example`.

## Funnel and product events (`trackEvent`)

Examples: `onboarding_started`, `onboarding_goal_selected`, `onboarding_discipline_selected`, `signup_started`, `profile_created`, `challenge_viewed`, `challenge_joined`, `proof_uploaded`, `challenge_completed`, `task_completed`, `streak_milestone`, `paywall_viewed`, `paywall_plan_selected`, `purchase_completed`, `purchase_failed`, `team_created`, `team_joined`, `share_tapped`, `invite_sent`.

## Verification

- `npx tsc --noEmit`: pass

## Follow-ups

- Pass `challengeId` in navigation params wherever `/challenge/complete` is opened so `challenge_completed` always includes `challenge_id`.
- Align hardcoded paywall prices with live `getOfferings()` when product IDs are finalized.
