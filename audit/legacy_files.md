# Legacy file & migration disposition (per v2 prompt §0 & §13 #9)

**Audit baseline:** `e4f47b0` (HEAD on `main`)  
**Date:** 2026-05-04

---

## 1. `supabase/migrations/20250228000000_accountability_pairs.sql`

### v2 prompt's claim

> Touch the legacy root-level migration `20250228000000_accountability_pairs.sql` until you've documented in `audit/legacy_files.md` whether it has been applied to production. (This is a known schema-drift smell — a migration sitting in the repo root instead of `supabase/migrations/`.)

### Actual repo state

**The file is not at the repo root.** It sits inside `supabase/migrations/` alongside 70 other timestamped migrations:

```
supabase/migrations/20250228000000_accountability_pairs.sql
```

`git log --follow` confirms the file has lived in `supabase/migrations/` since it was first added — there is no record of it being in the repo root and later moved. The "drift smell" the v2 prompt flags appears to be based on stale grounding.

### Contents (verified by reading the file)

Adds a single table `accountability_pairs` with:
- Columns: `id, user_id, partner_id, status, created_at, updated_at`.
- Status CHECK: `('pending', 'accepted', 'declined', 'blocked')`.
- 2 indexes (user/partner × status × created_at).
- 4 RLS policies: SELECT/INSERT/UPDATE/DELETE (participant-scoped).
- `UNIQUE(user_id, partner_id)`.

### Disposition for this v2 pass

- **Not touched** by Phases 0–8 of this pass. The migration is part of the regular timestamped migration chain and is consumed by `backend/trpc/routes/accountability.ts` (verified — that route is one of the 23 procedure-bearing files counted in `audit/SPRINT5-TRPC-INVENTORY.md`).
- **Production-application status:** unknown without DB schema snapshot. Phase 0.2/0.3 deferred until user provides the Supabase pooler URL. Once available, schema diff will confirm whether `accountability_pairs` exists in prod with the same columns & policies.
- **Action needed:** none in this pass; flag for the schema-drift table when Phase 0.3 unblocks.

---

## 2. `supabase/migrations/1776038400_backfill_day_secures_and_streaks.sql`

### Status

**Out of scope per v2 prompt §12** ("deferred work"). Filename uses a far-future epoch (`1776038400` ≈ 2026-04-19 in seconds, ~2026-04-19 in milliseconds — likely a sentinel value to keep it last in chronological order). The May 3 audit also noted this migration is intentionally not yet applied.

### Disposition for this v2 pass

- **Not touched.** Documented for completeness only.

---

## 3. Files referenced by v2 prompt that do NOT exist in the repo

The following paths are referenced verbatim in the v2 prompt but are absent from the repo at HEAD `e4f47b0`. Documented here so Phases 1–8 do not assume their existence.

| Path in v2 prompt | Exists in repo? | Closest substitute |
|---|---|---|
| `cursorrules` | **no** | none — no `.cursor/rules/` and no `AGENTS.md` either |
| `bun.lock` | **no** | `package-lock.json` (npm only) |
| `src/` (specifically `src/components/ui/ChallengeCard24h.tsx`) | **no** | components live under `components/` |
| `DEEP-CLEAN-SCORECARD.md` (root) | **no** | `docs/SCORECARD-FINAL.md`, `docs/SCORECARD-V3.md`, `docs/audits/GRIIT_DEEP_AUDIT_20260503.md` |
| `GRIIT_PrePush_QA_Report.md` (root) | **no** | `docs/audits/SCORECARD-TESTFLIGHT.md` |
| `GRIIT_App_Health_Scorecard_Report.md` (root) | **no** | `docs/SCORECARD-FINAL.md` |
| `GRIIT_Full_Stack_Scorecard_Report.md` (root) | **no** | `docs/audits/SCORECARD-FULL-STACK.md` |
| `GRIIT_Auth_Onboarding_Audit_Report.md` (root) | **no** | `docs/audits/GRIIT_DEEP_AUDIT_20260503.md` covers this |
| `IMPLEMENTATION_REPORT.md` (root) | **no** | `CHANGELOG.md` covers feature delivery |
| `BUTTON_AUDIT.md` (root) | **no** | `audit/interactive_elements.txt` (generated this pass) is the working set |
| `CLICKABLE_MAP.md` (root) | **no** | n/a |
| `APP_BREAKDOWN.md` (root) | **no** | `docs/ARCHITECTURE.md` |
| `docs/SPRINT5-RLS-INVENTORY.md` | **no** | `audit/SPRINT5-RLS-INVENTORY.md` (built this pass per AskQuestion answer = `audit_dir`) |
| `docs/SPRINT5-TRPC-INVENTORY.md` | **no** | `audit/SPRINT5-TRPC-INVENTORY.md` (built this pass per AskQuestion answer = `audit_dir`) |

### Action

- **No deletes** — none of these files exist; nothing to delete.
- **`audit/SPRINT5-RLS-INVENTORY.md` and `audit/SPRINT5-TRPC-INVENTORY.md` will be built** in this Phase 0 to substitute for the missing originals.
- The `audit/` directory is the substitute home for everything the v2 prompt expected to find at root or in `docs/`.

---

## 4. Possibly-dead code (to flag, not to delete)

Per v2 prompt §13 #7: "If a symbol looks unused, grep its name across the whole repo before deleting. If only the definition matches, **still leave it** and flag it in `audit/possibly_dead.md` for human review."

This file (`possibly_dead.md`) will be created during Phase 3 (consolidation) only if any candidates surface. It is intentionally **not pre-created** — Phase 3 in delta-only mode is unlikely to discover dead code that the May 3 audit missed.
