# Deferred items (per v2 prompt §12)

**Audit baseline:** `e4f47b0` (HEAD on `main`)  
**Date:** 2026-05-04

This file lists work explicitly out of scope for the v2 deep-clean pass. Each entry has a one-line rationale and a tag for the workstream that owns the eventual implementation.

---

## v2 prompt §12 — out of scope by prompt rule

| Item | Rationale | Owner / next sprint |
|---|---|---|
| MMKV migration for Zustand persistence | Performance optimization, not launch-blocking | Post-launch perf sprint |
| RN 0.84 / Expo SDK 55 upgrade | Major version bump; requires native rebuild + EAS profile changes | Dependency-bump sprint |
| `1776038400_backfill_day_secures_and_streaks.sql` backfill migration | Out-of-scope per §12; intentionally not yet applied | Streak-rebuild workstream |
| RevenueCat paywall changes | Separate workstream (`docs/PAYWALL-SMOKE-TEST.md` exists) | Monetization sprint |
| Streak rebuild script for testers affected by historical UTC timezone bug | userMemories: separate workstream | Streak-rebuild workstream |
| New features (Habit Builder, etc.) | Out of scope by prompt rule | Roadmap |
| Folder restructuring or file renames | Out of scope per "moderate consolidation only" | n/a |
| Dependency version bumps | Risk of breakage; preserve all behavior | Dependency-bump sprint |
| Native iOS/Android config beyond `app.json` | Out of scope | EAS sprint |
| `web-fallback/` and `web-fallback-deploy/` | Do not exist in this repo | n/a |

---

## Deferred by user STOP-AND-REPORT decisions (2026-05-04)

| Item | Rationale | Owner / next sprint |
|---|---|---|
| `blocks` table + `blockUser`/`unblockUser` procedures + 404 surface for blocked viewers | User picked `blocking = report_only`. Phase 1 wires existing `reports.ts` route to a "Report user" affordance instead. §2.2 block-mechanic deferred. | Safety/Trust post-launch sprint |
| Rename `user_follows.status` `'pending'` → `'requested'` to match §4.3 verbatim | User picked `status_naming = keep_pending`. Functional behavior identical; only the v2 prompt's grep gates needed updating. | n/a (won't fix) |
| Rename `profiles.profile_visibility` → `account_privacy` to match §2.1 verbatim | Breaking change for FE/BE/analytics; column name kept, conceptual mapping documented in `backend/lib/visibility.ts` JSDoc when it lands. | n/a (won't fix) |

---

## Deferred to a later phase within this v2 pass

| Item | Owner phase | Rationale |
|---|---|---|
| Live-DB schema snapshot + drift table (`audit/schema_snapshot_*.sql`, `audit/prod_schema.txt`, `audit/schema_drift.md`) | Phase 0 (resumes when DB URL is supplied) | Blocked on Supabase pooler URL |
| `EXPO_PUBLIC_*` env-var audit (`audit/env_var_audit.md`) | Phase 7 | Per v2 prompt §10.1 |
| Per-procedure rate-limit coverage audit | Phase 7 | Per v2 prompt §10.1 |
| RLS audit per matrix in `audit/SPRINT5-RLS-INVENTORY.md` | Phase 7 | Per v2 prompt §10.1 |
| WCAG contrast fix for 3 pairs in `tests/design-system-contrast.test.ts:62-69` | Phase 6 | Per May 3 audit Phase 10 |
| Pino loader fix for 5 failing vitest suites | Phase 4 (or Phase 5 perf) | Loader issue, not real regression — but blocks honest test gating |
