# Changelog

All notable changes to GRIIT are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Sprint 6 (deploy & docs):**
  - `docs/DEPLOYMENT.md` - full backend + frontend runbook with rollback procedures
  - `railway.json` - version-controlled Railway deploy config
  - `docs/ASO.md` - App Store Optimization strategy with keyword and screenshot framework
  - `CHANGELOG.md` - this file

- **Sprint 5 (UX polish & accessibility):**
  - WCAG AA contrast tests for `DS_COLORS` (`tests/design-system-contrast.test.ts`)
  - `useReduceMotion` hook + applied to `CelebrationOverlay`
  - Inline form validation on auth screens (`lib/validation.ts`)
  - Haptics consistency pass on success and warning moments
  - Dynamic Type audit (informational)

- **Sprint 4 (habit moat):**
  - `reminder_type` taxonomy across all push notifications (8 types)
  - Identity copy on `StreakHero` rotating by streak tier (`constants/identity-copy.ts`)
  - Minimum Viable Day completion mode for non-hard-mode challenges
  - Loss-aversion microcopy on streak-at-risk reminders

- **Sprint 3 (performance visibility):**
  - Home screen migrated from `FlatList` to `FlashList`
  - Cold-start time instrumentation (`cold_start_ms` + `cold_start_bucket` events)
  - Backend P50/P95 latency via Sentry Performance + `x-response-time` header
  - Replaced last raw hex (`#aaaaaa`) with `DS_COLORS.TEXT_TERTIARY`

- **Sprint 2 (monetization proof):**
  - PostHog feature flag for paywall A/B (`paywall_variant`: control vs social_proof)
  - `PaywallSocialProof` variant with placeholder testimonials and founder line
  - Full paywall conversion funnel events (variant_assigned, offering_selected, purchase_started/completed/failed/cancelled, restore_tapped/failed)
  - `docs/MONETIZATION.md` - pricing, trial, A/B strategy
  - `docs/PAYWALL-SMOKE-TEST.md` - physical iPhone test playbook

- **Sprint 1 (visibility & hygiene):**
  - D30 + return cohort events (`day_30_task_completed`, `app_opened`, `user_returned_after_lapse`)
  - `profiles.push_token` migration shipped to repo (no more inline SQL warnings)
  - `npm audit fix` - high-severity findings resolved in Sprint 1 scope
  - Backend Sentry wired in `backend/server.ts` and `backend/lib/error-reporting.ts`
  - `docs/SECURITY-DEBT.md` - accepted moderate findings documented

### Changed
- Master scorecard trajectory: overall 5.90 -> ~7.40 across 6 sprints

### Fixed
- Schema drift: removed manual SQL warning in `app/_layout.tsx`
- Performance: home list scroll smoothness (FlashList migration)
- Design system: zero raw hex outside `lib/design-system.ts`

## [1.0.0] - TestFlight Build 2 - Pre-Sprint baseline

### Added
- Hard Mode verification system (time gate, location gate, camera-only)
- Transparent share card system (V3 max bold, 6 card types)
- iOS alarm-style scroll pickers
- Instagram-style image lightbox on feed proof photos
- RevenueCat integration with `GRIIT Pro` entitlement
- PostHog analytics with `useScreenTracker` hook
- Backend scalability fixes (leaderboard/discover query caps, parallel feed enrichment)

### Notes
- Build 2 passed Beta App Review
- Public TestFlight: https://testflight.apple.com/join/QDedP231
- Pre-Sprint master scorecard: 5.90/10 (Beta-quality tier)
