# 05 — Supabase / DB Integrity

> Phase 5 of 10. Read-only, **static** (72 migrations). Branch `feat/onboarding @ 953bccb`.
>
> ## 🔴 UNVERIFIED-LIVE BANNER
> No Supabase CLI/credentials were available in this environment. **No `to_regclass` / `pg_policies` live check was run.** Everything below is static evidence from `supabase/migrations/`. Static migrations are **not proof** that the schema is applied in production. The live step is **UNVERIFIED-LIVE**.

## 1. RLS matrix (static)

- `enable row level security` statements: **29** · `create policy` statements: **90**.
- **Every table that has RLS enabled also has ≥1 policy** — no RLS-without-policy lockout, and no detected table left with RLS off.

| Table | RLS enabled | ≥1 policy |
|---|---|---|
| profiles | ✅ (`20260510…profiles_rls_hardening`) | ✅ |
| challenges | ✅ | ✅ |
| active_challenges | ✅ | ✅ |
| challenge_tasks | ✅ | ✅ |
| challenge_members | ✅ | ✅ |
| challenge_reports | ✅ | ✅ |
| check_ins | ✅ | ✅ |
| day_secures | ✅ | ✅ |
| feed_comments | ✅ | ✅ |
| feed_reactions | ✅ | ✅ |
| activity_events | ✅ | ✅ |
| in_app_notifications | ✅ | ✅ |
| push_tokens | ✅ | ✅ |
| user_follows | ✅ | ✅ |
| user_achievements | ✅ | ✅ |
| accountability_pairs | ✅ | ✅ |
| connected_accounts | ✅ | ✅ |
| shared_goal_logs | ✅ | ✅ |
| invite_tracking | ✅ | ✅ |
| last_stand_uses | ✅ | ✅ |
| stories / story_views | ✅ | ✅ |
| teams / team_members / team_invites | ✅ | ✅ |

**No table found with RLS missing or no policy.** ✅ (static)

## 2. Storage buckets + policies

| Bucket | Defined | Policies |
|---|---|---|
| `avatars` (public) | `20260325120000_storage_avatars_bucket.sql:3-4` | Public read + owner insert/update/delete (`:8-32`) ✅ |
| `task-proofs` (public) | `20250330000000_task_verification_options.sql:49-50` | upload-own (`(storage.foldername(name))[1] = auth.uid()`, `:54-57`), delete-own (`20260321120000_sprint5_rls_storage_hardening.sql:18-22`), select ✅ |

Proof-photo bucket exists with owner-scoped access policies. ✅

## 3. Schema ↔ query match

| Column / object | In migrations? | Note |
|---|---|---|
| `onboarding_completed` | ✅ `20250331…add_onboarding_fields`, `20250320…profiles_onboarding_answers`, `20250329…profile_columns` | backs `AuthRedirector` profile check ✅ |
| `onboarding_answers` | ✅ `20250320…profiles_onboarding_answers` | backs V1 `selectedGoals` write ✅ |
| `subscription_status` / `subscription_expiry` | ✅ `20250315…subscription`, `20260510…rls_hardening` | backs RC→Supabase sync (`subscription.ts:114-115`) ✅ |
| `push_token` | ✅ `20260429…add_push_token_to_profiles` | backs push registration ✅ |
| **`goal_type`** | ❌ **0 migrations** | — |
| **`tracking_mode`** / `run_target` | ❌ **0 migrations** | — |

- **`goal_type` / `tracking_mode` do NOT exist in any migration.** This **confirms `FLAGS.RUN_GOAL_CONFIG=false` is correctly gated** — the backing columns aren't present, so the run-goal UI must stay off. → **intentionally-gated.** ⚠ If the flag were flipped to `true`, the run-goal config would write to non-existent columns and fail. (Note for the gated bucket, not a live bug.)

### 🔴 Major finding — base DDL for core tables is NOT in version control
`rg` finds **0 `CREATE TABLE`** statements for **`profiles`, `challenges`, `active_challenges`, `challenge_tasks`** anywhere in `supabase/migrations/` (multiline-checked). They are only ever `ALTER`-ed / RLS-hardened / policy-attached (earliest is `20250305000000_schema_fixes_profiles_challenges_stories.sql`, whose name presumes the tables already exist). Implications:
- The migration set is **not a complete, reproducible schema** — a fresh DB built only from these files would fail (ALTER/policy on non-existent tables). The base schema for the app's most important tables was created **outside tracked migrations** (Supabase dashboard or an untracked bootstrap).
- Column-completeness for these core tables (beyond the tracked ALTERs above) **cannot be statically verified** → **UNVERIFIED-LIVE.**
- **Severity: Major** (DB reproducibility / disaster-recovery / review-trail gap), bucket `fix-before-public`. RLS itself is present for these tables via ALTER migrations, so this is a reproducibility gap, not an open-RLS hole.

## 4. Live verification
**Not performed — `UNVERIFIED-LIVE`.** No `to_regclass` per table, no `select * from pg_policies`. Requires Supabase service credentials / CLI access not available here. The static RLS matrix above must be confirmed against the live DB before treating any cell as proven.

## Counts (Phase 5)
| Metric | Count |
|---|---|
| Tables missing RLS (static) | **0** |
| Tables with RLS but no policy (static) | **0** |
| Storage buckets without policies | **0** |
| Schema mismatches | **goal_type/tracking_mode absent (gated, expected)** |
| Core tables with no tracked CREATE TABLE | **4** (`profiles`, `challenges`, `active_challenges`, `challenge_tasks`) — **Major** |
| Live verification | **UNVERIFIED-LIVE** (no CLI/creds) |
