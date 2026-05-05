# SPRINT 5 — tRPC procedure inventory (regenerated)

> Substitute for `docs/SPRINT5-TRPC-INVENTORY.md` referenced by `docs/ARCHITECTURE.md` line 64 and the v2 prompt §1. The original file does not exist in the repo. Per AskQuestion answer (`missing_docs = audit_dir`), this lives in `audit/` instead.

**Source:** `backend/trpc/routes/*.ts` at HEAD `e4f47b0`.  
**Method:** PowerShell 7 sweep of `.mutation(` and `.query(` per file (excluding `*.test.ts`).  
**Composed router:** `backend/trpc/app-router.ts` (verified loads all 23 sub-routers).

---

## 1. Per-file procedure counts

| Route file | Mutations | Queries | Total |
|---|---:|---:|---:|
| `accountability.ts` | 3 | 1 | 4 |
| `achievements.ts` | 0 | 1 | 1 |
| `auth.ts` | 3 | 2 | 5 |
| `challenges-create.ts` | 1 | 0 | 1 |
| `challenges-discover.ts` | 0 | 5 | 5 |
| `challenges-join.ts` | 2 | 0 | 2 |
| `challenges.ts` | 1 | 6 | 7 |
| `checkins.ts` | 4 | 4 | 8 |
| `feed.ts` | 5 | 9 | 14 |
| `integrations.ts` | 2 | 5 | 7 |
| `leaderboard.ts` | 0 | 3 | 3 |
| `notifications.ts` | 3 | 3 | 6 |
| `nudges.ts` | 1 | 1 | 2 |
| `profiles-social.ts` | 5 | 3 | 8 |
| `profiles-stats.ts` | 1 | 6 | 7 |
| `profiles.ts` | 5 | 6 | 11 |
| `referrals.ts` | 2 | 0 | 2 |
| `reports.ts` | 1 | 0 | 1 |
| `respects.ts` | 1 | 2 | 3 |
| `sharedGoal.ts` | 1 | 2 | 3 |
| `starters.ts` | 1 | 1 | 2 |
| `streaks.ts` | 1 | 1 | 2 |
| `user.ts` | 1 | 0 | 1 |
| **Total** | **44** | **61** | **105** |

The order-of-magnitude estimate in `docs/ARCHITECTURE.md` line 60–62 (re-derived via `rg`) lines up.

---

## 2. Privacy / follow procedures (Phase 1 working set)

Full breakdown lives in `audit/privacy_followup_inventory.md` §3. Quick reference:

| File | Procedure | Type | Section 2 contract match |
|---|---|---|---|
| `profiles-social.ts` | `followUser` | mutation | ✅ §2.2/§2.4 |
| `profiles-social.ts` | `unfollowUser` | mutation | ✅ §2.2 |
| `profiles-social.ts` | `sendFollowRequest` | mutation | ⚠️ status `'pending'` vs §2.2 `'requested'` |
| `profiles-social.ts` | `acceptFollowRequest` | mutation | ❌ notification type is `'general'`, §2.4 wants `'follow_accepted'` |
| `profiles-social.ts` | `declineFollowRequest` | mutation | ✅ §2.2 (silent) |
| `profiles-social.ts` | `getFollowStatus` | query | ✅ |
| `profiles-social.ts` | `getFollowCounts` | query | ✅ |
| `profiles-social.ts` | `getPendingFollowRequests` | query | ✅ |
| `profiles.ts` | `getPublicByUsername` | query | ⚠️ returns full payload regardless of viewer/account-privacy tier |
| **MISSING** | `removeFollower` | — | ❌ §2.2 |
| **MISSING** | `blockUser` / `unblockUser` | — | ❌ §2.2 (no `blocks` table either) |
| **MISSING** | `cancelFollowRequest` (dedicated) | — | ⚠️ `unfollowUser` works but isn't named for the use case |

---

## 3. Auth, rate-limit, and JWT-forwarding contract

- All write procedures use `protectedProcedure` from `backend/trpc/create-context.ts`. Verified by reading `backend/trpc/routes/profiles-social.ts` — every `.mutation()` is `protectedProcedure.input(...).mutation(...)`.
- Per-request Supabase client is created in `create-context.ts:13` with `createClient(supabaseUrl, supabaseAnonKey, ...)` and the user's JWT forwarded via the `Authorization` header so RLS policies see the correct `auth.uid()`.
- Service-role client (`backend/lib/supabase-server.ts:14` + `backend/lib/supabase-admin.ts:14`) is used **only** in code paths that need to read past RLS for legitimate operations (e.g. `getFollowCounts` falls back to the server client to count rows the viewer cannot see directly). Verified by `audit/service_role_uses.txt` — 5 hits, all in `backend/`.
- Rate limit: `backend/lib/rate-limit.ts` (Upstash-backed). Per-procedure rate-limit coverage is the Phase 7 audit target — current state not enumerated here.

---

## 4. Reproducing the count

```powershell
pwsh -NoProfile -Command "
Get-ChildItem -Recurse backend/trpc/routes/*.ts -Exclude *.test.ts | ForEach-Object {
  \$mut = (Select-String -Path \$_.FullName -Pattern '\.mutation\(' | Measure-Object).Count
  \$qry = (Select-String -Path \$_.FullName -Pattern '\.query\(' | Measure-Object).Count
  if (\$mut + \$qry -gt 0) {
    '{0,-46} mut={1,-3} qry={2}' -f \$_.Name, \$mut, \$qry
  }
} | Sort-Object
"
```

---

## 5. Out of scope for this inventory

- **Per-procedure input schema** (Zod shape) — captured implicitly when reading individual files; full enumeration deferred to a follow-up if needed.
- **Per-procedure call graph** (frontend consumers via `lib/trpc-paths.ts`) — `audit/trpc_call_sites.txt` (112 hits) is the working set when needed.
- **Per-procedure rate-limit coverage** — Phase 7 audit deliverable.
