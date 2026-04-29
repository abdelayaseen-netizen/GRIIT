# Paywall Smoke Test — Physical iPhone

## Prerequisites
- TestFlight build installed on a real iPhone (not simulator)
- Sandbox tester Apple ID created in App Store Connect → Users → Sandbox
- Sign out of personal Apple ID in Settings → App Store → Sandbox Account, sign in as sandbox tester

## Test Matrix
1. Cold install → reach paywall → cancel → confirm `paywall_view` and back-out events fire
2. Cold install → reach paywall → start trial → confirm `paywall_purchase_completed` event + entitlement granted
3. Force-close app, reopen → confirm Pro features stay unlocked (RevenueCat cache)
4. Settings → Restore Purchases → confirm entitlement restored after fresh install
5. Cancel sandbox subscription in iOS Settings → wait for renewal cycle → confirm entitlement revoked
6. Variant flag check: toggle `paywall_variant` in PostHog → reopen paywall → confirm correct variant renders and `paywall_variant_assigned` fires

## Pass Criteria
- All 6 scenarios pass
- PostHog dashboard shows all funnel events firing in real time
- RevenueCat dashboard shows the test purchase
- No console errors or Sentry events during the flow

## After Pass
- Update docs/MONETIZATION.md "Physical Device Smoke Test" status to COMPLETED with date
- Tag the build in git with `paywall-smoked-v1.0.0`
