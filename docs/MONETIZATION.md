# GRIIT Monetization Strategy

## Pricing
- Annual: griit_premium_annual — $49.99/year ($4.16/month equivalent)
- Monthly: griit_pro_monthly — $9.99/month
- Entitlement ID: "GRIIT Pro"

## Paywall Strategy
- Hard paywall after onboarding completion (RevenueCat 2026: hard paywalls convert 5x better than freemium)
- Free trial: 7 days (current) — REVIEW: research suggests 17-32 days converts 70% better
  - Action: Test 14-day trial in App Store Connect after first 50 paying users baseline
- Annual emphasized as default selection (Health & Fitness category benchmark: 68% annual adoption)
- Restore button visible on paywall AND in Settings

## A/B Test Status
- Control: feature-bullet paywall (current)
- Variant: social-proof paywall (added Sprint 2)
- Flag: PostHog `paywall_variant`
- Decision rule: ship variant globally if D7 trial-to-paid ≥ +20% over control with n≥200 per arm

## Required Action: Physical Device Smoke Test
- Status: NOT YET COMPLETED
- Instructions: see docs/PAYWALL-SMOKE-TEST.md
- Until completed, do not run paid acquisition.

## Research Anchors
- RevenueCat 2026 State of Subscription Apps: hard paywall 5x conversion, 17-32d trial +70%, 80% trials start day 0, 55% of 3-day trial cancellations on day 0
- Cialdini Influence: social proof one of six core persuasion levers; testimonials with specifics outperform generic
- Health & Fitness benchmark: 68% annual plan adoption

## Performance Targets (research-anchored)
- Cold start P50: <2000ms (industry: <2s = top quartile)
- Cold start P95: <4000ms
- API P50: <300ms
- API P95: <1000ms
- Crash-free sessions: >99.5%
- Measurement source: PostHog (cold_start), Sentry Performance (API)
- Action threshold: any P50 > target → file as performance bug, fix before next paid acquisition push
