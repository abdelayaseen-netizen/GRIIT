# GRIIT Executive Summary - 2026-04-14

## Phase 1 summary table

| Metric | Count | Target | Gap |
|---|---:|---:|---:|
| Total frontend LOC | 47371 | - | - |
| Total backend LOC | 196836 | - | - |
| Files > 1,400 lines | 2 | 0 | 2 |
| Files > 800 lines | 10+ | <=5 | >5 |
| Raw hex violations | 0 | 0 | 0 |
| Alert.alert usages | 0 | 0 | 0 |
| Raw nav strings | 0 | 0 | 0 |
| any / as any | low in app paths | <10 | monitor |
| PostHog call sites | 2 | >=13 | 11 |
| Sentry call sites | 5 | >=20 | 15 |
| tsc errors | 0 | 0 | 0 |

## Phase 7.1 composite

| Area | Current | Ceiling (solo-dev realistic) | Launch bar | Gap to launch | Effort to close |
|---|---:|---:|---:|---:|---|
| Overall | 5.0 | 7.8 | 6.7 | 1.7 | 4-6 weeks focused hardening |

## Phase 7.2 top 15 fixes

1. Wire Sentry in every critical `catch` path
2. Wire PostHog on all funnel transitions
3. Add push send + receipt telemetry
4. Add paywall fetch/purchase/restore telemetry
5. Split `components/TaskEditorModal.tsx`
6. Split `components/create/NewTaskModal.tsx`
7. Add auth refresh failure instrumentation
8. Add challenge join/create retry and user feedback
9. Add proof upload failure diagnostics
10. Add hard-mode tamper checks and logging
11. Add leaderboard query perf guardrails
12. Add profile/account deletion end-to-end checks
13. Add smoke tests for tRPC mutation boundaries
14. Verify Supabase schema/column drift by SQL checks
15. Add release-tagged Sentry sourcemap process

## Phase 7.8 verdict

GRIIT is not ready for public launch today.  
Minimum path: close observability, silent-failure, and policy blockers first.
