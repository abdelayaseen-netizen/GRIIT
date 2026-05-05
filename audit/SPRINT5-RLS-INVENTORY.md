# SPRINT 5 — RLS policy inventory (regenerated)

> Substitute for `docs/SPRINT5-RLS-INVENTORY.md` referenced by `docs/ARCHITECTURE.md` line 69 and the v2 prompt §1. The original file does not exist in the repo. Per AskQuestion answer (`missing_docs = audit_dir`), this lives in `audit/` instead.

**Source:** `supabase/migrations/*.sql` at HEAD `e4f47b0`.  
**Method:** PowerShell 7 + .NET regex parser (`audit/_run_sweeps.ps1` is the canonical sweep harness; the matrix below was extracted with the helper script in §4).  
**Total CREATE POLICY statements parsed:** 81 across 29 migration files.  
**Total CREATE TABLE statements:** 21.

> ⚠️ **Live-DB verification still pending.** This inventory reflects what migrations *say* should be in production; per v2 prompt §3.2 the live snapshot will only land once the Supabase pooler URL is supplied. Schema drift between this file and prod will be captured in `audit/schema_drift.md`.

---

## 1. Per-table coverage matrix

Operations covered by at least one `CREATE POLICY` statement in the migration history.

| Table | Operations covered | Notes |
|---|---|---|
| `accountability_pairs` | SELECT, INSERT, UPDATE, DELETE | participant-scoped (Accountability Circle) |
| `active_challenges` | SELECT, INSERT, UPDATE, DELETE | UPDATE added 2026-05-02 (`20260502230000_active_challenges_update_policy.sql`) |
| `activity_events` | SELECT, INSERT, DELETE | DELETE-own added 2026-03-25 |
| `challenge_members` | SELECT, INSERT, UPDATE, DELETE | DELETE added in `20250407000000_challenge_members_delete_policy.sql` |
| `challenge_reports` | SELECT, INSERT | report-owner scoped |
| `challenge_tasks` | SELECT, INSERT | UPDATE/DELETE absent — tasks are append-only via creator role |
| `challenges` | SELECT, INSERT | UPDATE/DELETE inherit from creator-scoped check via app code; matches public read tightening cycle (`20250318000000_*` → `20250326000000_*` → `20260320060000_restore_*`) |
| `check_ins` | SELECT, INSERT, UPDATE | added 2026-03-21 (`20260321150000_check_ins_table_and_rls.sql`) |
| `connected_accounts` | SELECT, INSERT, UPDATE, DELETE | Strava integration |
| `day_secures` | SELECT, INSERT | Phase 4 sweep target — `t.required` bug pattern intersects with this table; verify in Phase 4 |
| `feed_comments` | SELECT, INSERT, DELETE | DELETE added in `20260329150000_feed_reactions_comments_delete_rls.sql` |
| `feed_reactions` | SELECT, INSERT, UPDATE, DELETE | DELETE added in same migration as comments |
| `in_app_notifications` | SELECT, INSERT, UPDATE | INSERT is `WITH CHECK (true)` — **flagged in `audit/privacy_followup_inventory.md` §2.4** |
| `invite_tracking` | SELECT, INSERT, UPDATE | referrals |
| `last_stand_uses` | SELECT, INSERT | streak-rescue feature |
| `profiles` | UPDATE, DELETE (parsed); SELECT + INSERT exist but live in older migrations with non-quoted policy names | DELETE added in `20260503000000_profiles_delete_policy_and_update_hardening.sql`; UPDATE hardened with `WITH CHECK` in same migration |
| `push_tokens` | SELECT, INSERT, UPDATE, DELETE | push-notifications schema (`20260414000000_push_notifications_schema.sql`) |
| `shared_goal_logs` | SELECT, INSERT | team-challenge accountability |
| `stories` | SELECT, INSERT | story-views |
| `story_views` | SELECT, INSERT, UPDATE | upsert-style |
| `team_invites` | SELECT, INSERT, UPDATE | team challenge invites |
| `team_members` | SELECT, INSERT, DELETE | UPDATE absent (membership is binary) |
| `teams` | SELECT, INSERT, UPDATE, DELETE | full ownership coverage |
| `user_achievements` | SELECT, INSERT | event-driven |
| `user_follows` | SELECT, INSERT, UPDATE, DELETE | UPDATE added 2026-03-28; **DELETE policy only allows the follower to delete; target cannot remove a follower** — see `audit/privacy_followup_inventory.md` §2 |

### Tables in the schema with NO RLS coverage at the migration level

The parser found policies for 25 tables. The migrations also reference these table names without explicit `CREATE POLICY` statements — these may inherit from older non-quoted policies or may need verification in the live snapshot:

- `posts` — does **not exist** as a table; activity rows live in `activity_events`/`feed_*`.
- `tasks` (top-level) — does **not exist**; structure is `challenges → challenge_tasks → check_ins`.
- `proofs` — does **not exist** as a table; proof URLs are columns on `check_ins`.

**Net:** the v2 prompt's `proofs`/`tasks`/`posts` references in Sections 2.2–2.4 must be translated to GRIIT's actual schema (`check_ins`, `challenge_tasks`, `activity_events`).

---

## 2. Notable RLS findings (privacy/follow-relevant)

The full per-policy enumeration lives in `audit/privacy_followup_inventory.md` §2. Highlights:

- **`profiles` SELECT is `USING (true)`** — public read of all profile rows. Section 2.1 stripped-profile rule must be enforced **server-side in tRPC** (response shaping), not via RLS.
- **`user_follows` DELETE is `USING (auth.uid() = follower_id)`** — `removeFollower` (target action) is not possible under current RLS. Phase 1 needs to either expand the policy or add a SECURITY DEFINER RPC.
- **`in_app_notifications` INSERT is `WITH CHECK (true)`** — any authenticated user can insert any notification for any other user. Phase 7 hardening target.
- **`challenges.visibility` enforcement** — `PUBLIC` enforced by `20250318000000_challenges_rls_public_read.sql`. `FRIENDS` has **no enforcement** (no `v_friends` view exists). `PRIVATE` falls through to creator-only via the standard creator policy.
- **No `blocks` table** — Section 2 contracts that involve blocking cannot be implemented without schema additions.

---

## 3. Migration files containing privacy-relevant changes

| Migration | What it does |
|---|---|
| `20250228000000_accountability_pairs.sql` | `accountability_pairs` table + 4 RLS policies (Accountability Circle — separate from friend graph) |
| `20250317000000_visibility_uppercase.sql` | Normalises `challenges.visibility` to uppercase values |
| `20250318000000_challenges_rls_public_read.sql` | Public-read RLS for `visibility='PUBLIC'` |
| `20250326000000_challenges_rls_tighten_select.sql` | Tightens public-read |
| `20250328000000_profiles_profile_visibility.sql` | Adds `profiles.profile_visibility` column with 3-tier CHECK |
| `20260320060000_restore_public_challenge_read_policies.sql` | Restores public-challenge SELECT after a tightening regression |
| `20260325100000_user_follows_in_app_notifications.sql` | Creates `user_follows` + `in_app_notifications` tables |
| `20260328140000_user_follows_status_notifications_v2.sql` | Adds `user_follows.status` + extends notification type enum |
| `20260503000000_profiles_delete_policy_and_update_hardening.sql` | Adds DELETE policy + hardens UPDATE with `WITH CHECK` |

---

## 4. Reproducing this matrix

```powershell
pwsh -NoProfile -Command "
\$rows = @()
Get-ChildItem -Recurse supabase/migrations/*.sql | ForEach-Object {
  \$content = Get-Content \$_.FullName -Raw
  \$pattern = 'CREATE\s+POLICY\s+\"([^\"]+)\"\s+ON\s+(?:public\.)?([\w_]+)\s+(?:AS\s+\w+\s+)?FOR\s+(SELECT|INSERT|UPDATE|DELETE|ALL)'
  [regex]::Matches(\$content, \$pattern, 'IgnoreCase') | ForEach-Object {
    \$rows += [pscustomobject]@{ Table=\$_.Groups[2].Value; Op=\$_.Groups[3].Value.ToUpper() }
  }
}
\$rows | Group-Object Table | Sort-Object Name | ForEach-Object {
  '{0,-40} {1}' -f \$_.Name, ((\$_.Group.Op | Sort-Object -Unique) -join ',')
}
"
```

Re-run after every migration is added/edited. Drift between this and `audit/prod_schema.txt` (when generated) becomes a row in `audit/schema_drift.md`.
