# GRIIT Executive Summary - 2026-04-14

## Phase 1 summary table

| Metric | Count | Target | Gap |
|---|---:|---:|---:|
| Total frontend LOC | 47371 | - | - |
| Total backend LOC | 9900 | - | - |
| Files > 1,400 lines | 2 | 0 | 2 |
| Files > 800 lines | 10 | <=5 | 5 |
| PostHog call sites (files) | 2 | >=13 | 11 |
| Sentry call sites (files) | 5 | >=20 | 15 |
| tsc errors | 0 | 0 | 0 |

## Phase 7.1 composite

| Area | Current | Ceiling (solo-dev realistic) | Launch bar | Gap to launch | Effort to close |
|---|---:|---:|---:|---:|---|
| Overall | 5.4 | 7.9 | 6.7 | 1.3 | 4-7 weeks focused hardening |

## Phase 7.2 top 15 fixes
1. Add Sentry capture to every critical catch path.
2. Add PostHog events on all core funnel transitions.
3. Instrument push token and delivery failures.
4. Instrument RevenueCat fetch/purchase/restore failures.
5. Split TaskEditorModal.
6. Split NewTaskModal.
7. Harden empty/error states on primary screens.
8. Remove ts-expect-error and type escapes.
9. Add rate-limit tests on write routes.
10. Add timezone lifecycle regression tests.
11. Add proof upload/permission failure tests.
12. Validate all .or interpolation paths.
13. Run schema drift checks against production.
14. Verify account deletion compliance path.
15. Verify Sentry release tagging and sourcemaps.

## Phase 7.8 verdict
GRIIT is not ready for public launch today; close observability, silent-failure, and policy blockers first.
