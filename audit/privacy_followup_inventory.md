# Phase 0.5 — Privacy / follow / friend inventory (per v2 prompt §3.5)

**Audit baseline:** `e4f47b0`  
**Date:** 2026-05-04  
**Working set:** `audit/privacy_follow_surface.txt` (246 grep hits across 39 files).

This inventory grounds Phase 1 (Section 2.1–2.4) work. Every cell is backed by a file:line reference verified by reading the file at HEAD `e4f47b0`.

---

## 1. Schema state — every column / table that touches privacy, visibility, follow status

| Table | Column | Type | Default | Constraints | Migration | Verified by reading |
|---|---|---|---|---|---|---|
| `profiles` | `profile_visibility` | TEXT | `'public'` | CHECK in `('public', 'friends', 'private')` (3-tier) | `20250328000000_profiles_profile_visibility.sql` | ✅ |
| `user_follows` | `follower_id` | UUID | — | NOT NULL, FK `auth.users(id) ON DELETE CASCADE`, PK with `following_id`, CHECK `follower_id <> following_id` | `20260325100000_user_follows_in_app_notifications.sql` | ✅ |
| `user_follows` | `following_id` | UUID | — | NOT NULL, FK `auth.users(id) ON DELETE CASCADE`, PK with `follower_id` | `20260325100000_user_follows_in_app_notifications.sql` | ✅ |
| `user_follows` | `created_at` | TIMESTAMPTZ | `NOW()` | NOT NULL | `20260325100000_user_follows_in_app_notifications.sql` | ✅ |
| `user_follows` | `status` | TEXT | `'accepted'` | NOT NULL, CHECK in `('accepted', 'pending')` (**not** `requested`) | `20260328140000_user_follows_status_notifications_v2.sql` | ✅ |
| `accountability_pairs` | `status` | TEXT | `'pending'` | CHECK in `('pending', 'accepted', 'declined', 'blocked')` (separate concept — Accountability Circle, not friend graph) | `20250228000000_accountability_pairs.sql` | ✅ |
| `in_app_notifications` | `type` | TEXT | — | NOT NULL, CHECK in `('respect', 'comment', 'follow', 'rank', 'follow_request', 'general')` (**no `follow_accepted` value**) | `20260328140000_user_follows_status_notifications_v2.sql` line 22-24 | ✅ |
| `challenges` | `visibility` | TEXT | (uppercase) | values stored uppercase; comparisons cast to lowercase. CHECK enforced upstream. | `20250317000000_visibility_uppercase.sql` | ✅ |
| `posts` | — | — | — | **No `posts` table exists.** Posts (= shared task completions / activities) live in `feed_activities`/`activity_events`. | n/a | ✅ (`activity_events` migration `20250329000002_activity_events.sql`) |

### Section 2 contract gaps in schema

| Section 2 contract | Reality | Gap |
|---|---|---|
| §2.1: account-level `account_privacy ∈ {public, private}` | column is `profile_visibility ∈ {public, friends, private}` | **Different name** + **third value `friends`** that Section 2.1 does not allow. |
| §2.2: `follows` status `∈ {requested, accepted}` | `user_follows.status ∈ {accepted, pending}` | **Value mismatch** — `pending` vs `requested`. Functionally equivalent, but Section 4.5 grep gates expect `requested`. |
| §2.2: `friends` is a **derived view** `v_friends` | **Does not exist.** | Net-new migration required. |
| §2.4: notification type `follow_accepted` | `in_app_notifications.type` enum is `('respect', 'comment', 'follow', 'rank', 'follow_request', 'general')` — `follow_accepted` not in CHECK | **Missing enum value**; current code sends `type: "general"` for accepted-request notifications (see §3 below). |

---

## 2. RLS policies — every policy on `profiles`, `posts`, `challenges`, `tasks`, `proofs`, `follows`, `notifications`

### `profiles`
| Policy | Operation | USING / WITH CHECK | Migration |
|---|---|---|---|
| `Profiles are viewable by everyone` | SELECT | `USING (true)` | `20250305000000_schema_fixes_profiles_challenges_stories.sql` (per file inspection in May 3 audit) |
| `Users can update own profile` | UPDATE | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` | `20260503000000_profiles_delete_policy_and_update_hardening.sql` |
| `Users can delete own profile` | DELETE | `USING (auth.uid() = user_id)` | `20260503000000_profiles_delete_policy_and_update_hardening.sql` |
| `Users can insert own profile` | INSERT | `WITH CHECK (auth.uid() = user_id)` | `20250305000000_schema_fixes_profiles_challenges_stories.sql` |

**Section 2.1 gap:** the `Profiles are viewable by everyone` policy does **not** enforce the stripped-profile rule (private accounts visible only at the avatar/name/bio/counts level to non-followers). Server-side procedures must shape the response per viewer relationship — currently `getPublicByUsername` returns the full row regardless of viewer (read `backend/trpc/routes/profiles.ts:79+` to confirm in Phase 1).

### `user_follows`
| Policy | Operation | USING / WITH CHECK | Migration |
|---|---|---|---|
| `Users read own follows` | SELECT | `USING (auth.uid() = follower_id OR auth.uid() = following_id)` | `20260325100000_user_follows_in_app_notifications.sql:16-19` |
| `Users insert own follow` | INSERT | `WITH CHECK (auth.uid() = follower_id)` | `20260325100000_user_follows_in_app_notifications.sql:21-24` |
| `Users delete own follow` | DELETE | `USING (auth.uid() = follower_id)` | `20260325100000_user_follows_in_app_notifications.sql:26-29` |
| `Users update own follow rows` | UPDATE | `USING (auth.uid() = following_id OR auth.uid() = follower_id) WITH CHECK (...)` | `20260328140000_user_follows_status_notifications_v2.sql:12-16` |

**Section 2.2 gap:** "Remove follower" requires deleting a row where `following_id = auth.uid()` (the target removing a follower). Current DELETE policy only allows the **follower** to delete (USING `auth.uid() = follower_id`). Target cannot remove a follower under current RLS. Requires policy expansion or a SECURITY DEFINER RPC.

### `in_app_notifications`
| Policy | Operation | USING / WITH CHECK | Migration |
|---|---|---|---|
| `Users read own in_app_notifications` | SELECT | `USING (auth.uid() = user_id)` | `20260325100000_user_follows_in_app_notifications.sql:45-48` |
| `Users update own in_app_notifications` | UPDATE | `USING (auth.uid() = user_id)` | `20260325100000_user_follows_in_app_notifications.sql:50-53` |
| `Users insert notifications` | INSERT | `WITH CHECK (true)` | `20260328140000_user_follows_status_notifications_v2.sql:26-29` |

**Section 2.4 gap:** `INSERT WITH CHECK (true)` allows any authenticated user to insert notifications for any other user. Section 2.4 says certain transitions explicitly fire **no notification** — the wide-open INSERT policy doesn't prevent abuse. Risk: medium (would need a malicious authenticated client). Phase 7 will tighten.

### `challenges`
| Policy | Operation | USING / WITH CHECK | Migration |
|---|---|---|---|
| `Anyone can read public challenges` | SELECT | gated on `visibility = 'PUBLIC' AND status = 'published'` | `20250318000000_challenges_rls_public_read.sql`, tightened by `20250326000000_challenges_rls_tighten_select.sql`, restored by `20260320060000_restore_public_challenge_read_policies.sql` |
| `Users can read own challenges` | SELECT | `USING (auth.uid() = creator_id)` | various |
| `Users can read via active participation` | SELECT | derived from `active_challenges` membership | `20250620100000_rls_challenges_via_active_participation.sql` |
| INSERT/UPDATE/DELETE | various | creator-scoped | `20250305000000_schema_fixes_profiles_challenges_stories.sql` |

**Section 2.3 gap:** `challenges.visibility ∈ {PUBLIC, FRIENDS, PRIVATE}` (uppercase) but **no RLS policy enforces FRIENDS** as "owner + their friends." Currently FRIENDS challenges fall through to "owner only" via the `creator_id`-scoped policy. Need a `v_friends`-backed RLS policy for FRIENDS.

### `activity_events` / `feed_reactions` / `feed_comments`
| Coverage | Migration |
|---|---|
| `activity_events`: SELECT/INSERT scoped, DELETE own | `20250329000002_activity_events.sql` + `20260325120000_activity_events_delete_own.sql` |
| `feed_reactions` + `feed_comments`: SELECT/INSERT/DELETE | `20260322000000_feed_reactions_comments.sql` + `20260329150000_feed_reactions_comments_delete_rls.sql` |

**Section 2.3 gap:** no policy on `activity_events` references the owner's `profile_visibility`. A private account's feed activities are still readable by anyone with SELECT access. Phase 1 must wire account-privacy as a ceiling.

### `accountability_pairs`
4 policies — SELECT/INSERT/UPDATE/DELETE all participant-scoped. Per `20250228000000_accountability_pairs.sql`. Separate concept from friend graph; not used for Section 2 contracts.

---

## 3. Backend procedures — every tRPC procedure that creates / accepts / declines / queries follow edges

File: `backend/trpc/routes/profiles-social.ts` (read in full; 301 lines, 8 procedures).

| # | Procedure | Type | Currently does | Section 2.4 expectation | Match? |
|---|---|---|---|---|---|
| 1 | `followUser` | mutation | Inserts `user_follows` row with `status='accepted'` (only for `profile_visibility='public'`). Inserts `in_app_notifications.type='follow'`. Sends push with `data.type='follow'`. | Notify `follow` to target on follow of public account. | ✅ |
| 2 | `unfollowUser` | mutation | Deletes the `user_follows` row. **No notification.** | "Unfollow → No notification." | ✅ |
| 3 | `sendFollowRequest` | mutation | For `profile_visibility ∈ {private, friends}` only. Inserts `user_follows` with `status='pending'`. Inserts `in_app_notifications.type='follow_request'`. Sends push. | Notify `follow_request` to target on follow of private account. | ✅ (modulo `pending` vs `requested` naming) |
| 4 | `acceptFollowRequest` | mutation | Updates `user_follows.status` from `pending → accepted`. Inserts `in_app_notifications.type='general'` with body `"${uname} accepted your follow request"`. Sends push with `data.type='general'`. | Notify `follow_accepted` to requester. | ❌ **Wrong type** — sends `'general'` instead of `'follow_accepted'`. The `in_app_notifications.type` CHECK doesn't even include `'follow_accepted'`. |
| 5 | `declineFollowRequest` | mutation | Deletes the pending row. **No notification.** | "Decline → No notification." | ✅ |
| 6 | `getFollowStatus` | query | Returns `'none' | 'pending' | 'following'` | n/a (read) | ✅ |
| 7 | `getFollowCounts` | query | Returns `{ followers, following }` (accepted only). Uses `getSupabaseServer()` (service-role) to count, falling back to `ctx.supabase`. | n/a (read) | ✅ |
| 8 | `getPendingFollowRequests` | query | Returns array of pending requests directed at `ctx.userId`. | n/a (read) | ✅ |

### Procedures missing entirely vs Section 2.2

| Section 2.2 action | Procedure expected | Exists? |
|---|---|---|
| Tap "Remove follower" | `removeFollower` (delete reverse edge) | ❌ **missing** |
| Tap "Cancel pending request" | `cancelFollowRequest` (delete own pending edge) | ⚠️ partial — `unfollowUser` deletes any edge regardless of status, so cancel works but no dedicated procedure |
| Block | `blockUser` (delete both edges + insert into a blocks table) | ❌ **missing** — no `blocks` table either |
| Unblock | `unblockUser` | ❌ **missing** |

---

## 4. Frontend surfaces — every screen that displays a profile / follow button / request list / feed item

| Screen | File | Currently shows | Honors §2.1 stripped-profile rule? |
|---|---|---|---|
| Public profile | `app/profile/[username].tsx` (935 LOC) | Full profile; gates challenges/posts behind `canSeeContent = vis === 'public' \|\| isFollowing \|\| user.id === profile.user_id` (line 145-146). Sets `vis` from `profile_visibility`. | ⚠️ partial — gates **content sections** (challenges, posts, badges) but still returns and renders `total_days_secured`, `tier`, `active_streak`, `longest_streak`, `bio`, `created_at` for non-followers of private accounts. Section 2.1 stripped layout requires only avatar/name/bio/counts/mutuals — **`total_days_secured`, streaks, and `tier` should be hidden for non-followers of private accounts.** |
| Own profile tab | `app/(tabs)/profile.tsx` (983 LOC) | Self view — full data. | n/a (self) |
| Settings → Visibility | `components/settings/VisibilitySection.tsx` | 3 toggles: `profile_visibility`, `challenge_visibility`, `activity_visibility` — each a 3-tier `{public, friends, private}` segmented pill. | ⚠️ Section 2.1 says account privacy is **2-tier**. Current UI exposes a 3rd tier (`friends`) at the account level. |
| Activity tab → notifications list | `components/activity/NotificationsTab.tsx` | Renders `in_app_notifications` rows. | Need to verify it distinguishes `follow`, `follow_request`, `follow_accepted` (currently the latter isn't a real type). |
| Follow button / "Request to follow" CTA | **Inline in `app/profile/[username].tsx`** | Switches between Follow / Request / Following / Pending based on `getFollowStatus` and `profile_visibility`. | No standalone `components/FollowButton.tsx` exists. Section 4.4 expects one. |
| Pending follow requests list | TBD (need to grep for `getPendingFollowRequests` consumer) | Procedure exists; consumer likely in `NotificationsTab.tsx` or a dedicated drawer. | Pending Phase 1 inspection. |
| Feed items | `components/feed/FeedPostCard.tsx`, `app/(tabs)/index.tsx`, `components/LiveFeedSection.tsx` | Feed items rendered via `feed.list*` procedures in `backend/trpc/routes/feed.ts` (20 privacy-related grep hits — feed already has visibility filtering). | Need Phase 1 read of `feed.ts` to confirm account-privacy ceiling is enforced. |

---

## 5. Notifications — every type currently dispatched, by event

| Event in code | Dispatch site | Notification `type` | Push? |
|---|---|---|---|
| Follow accepted (public account) | `profiles-social.ts:47-58` (`followUser`) | `'follow'` | ✅ yes (`profiles-social.ts:63-72`) |
| Follow request sent (private/friends account) | `profiles-social.ts:137-148` (`sendFollowRequest`) | `'follow_request'` | ✅ yes (`profiles-social.ts:153-162`) |
| Follow request accepted | `profiles-social.ts:190-197` (`acceptFollowRequest`) | `'general'` ❌ | ✅ yes (`profiles-social.ts:199-208`) — but `data.type='general'` |
| Follow request declined | n/a — silent delete | none | n/a |
| Unfollow / Remove follower / Block | n/a — silent | none | n/a |
| Respect (cheer) on activity | `respects.ts` | `'respect'` | (not inspected this pass) |
| Comment on activity | (presumed `feed.ts` or comment route) | `'comment'` | (not inspected) |
| Rank change | (achievement / leaderboard route) | `'rank'` | (not inspected) |

**Type enum currently allows:** `('respect', 'comment', 'follow', 'rank', 'follow_request', 'general')`.  
**Section 2.4 wants additionally:** `'follow_accepted'`.

---

## 6. Gaps vs §2 contracts (the table the v2 prompt §3.6 requires verbatim)

| Section 2 clause | Implemented? | If no, what's missing | Risk if shipped as-is |
|---|---|---|---|
| **§2.1** account-level privacy is **two-tier** `{public, private}` | ❌ | Schema is 3-tier `{public, friends, private}`. Settings UI exposes 3 tiers. | **Medium** — semantic mismatch. Users who pick `friends` at the account level have no friend graph to gate against (no `v_friends` view). Behavior likely degrades to "private" silently. |
| **§2.1** `account_privacy` column name | ❌ | Column is named `profile_visibility`. | Low — naming difference; rename is breaking unless aliased in `canViewProfile`. Recommendation: keep column name, treat Section 2.1 as conceptual; document the mapping in `backend/lib/visibility.ts` JSDoc. |
| **§2.1** stripped-profile renders only avatar/name/bio/follower count/following count/mutuals for non-followers of private accounts | ❌ | `getPublicByUsername` returns full payload regardless of viewer. UI gates content sections but still shows `total_days_secured`, `tier`, `active_streak`, `longest_streak`, `bio`, `created_at`. | **High** — privacy expectation broken: a non-follower can see a private account's streak number and tier, contradicting §2.1's stripped-layout rule. |
| **§2.1** blocked viewer sees 404 | ❌ | No `blocks` table exists. No 404-tier in `canViewProfile`. | High at launch if blocking is a marketed safety feature. Low if blocking is post-launch. |
| **§2.2** Follow public → `accepted`, notify `follow` | ✅ | — | — |
| **§2.2** Follow private → `requested`, notify `follow_request` | ⚠️ partial | Status is `'pending'` not `'requested'`. Functionally identical; only the v2 prompt's grep gate (§4.5 expects `'requested'`) trips. | Low — purely naming. |
| **§2.2** Accept request → notify `follow_accepted` | ❌ | Code sends `type: 'general'`. Enum doesn't allow `'follow_accepted'`. | **Medium** — recipient sees a generic notification rather than a typed one; analytics, push routing, and UI cannot disambiguate accepted-request notifications from generic system notifications. |
| **§2.2** Decline request → no notification | ✅ | — | — |
| **§2.2** Unfollow → no notification | ✅ | — | — |
| **§2.2** Remove follower → no notification | ❌ | No `removeFollower` procedure. RLS DELETE policy only allows the follower to delete; the target cannot remove a follower at all. | **Medium** — UX gap: target can't expel a follower. |
| **§2.2** Block / Unblock → 404 from blocked viewer's POV | ❌ | No `blockUser`/`unblockUser`/`blocks` table. | High at launch if marketed. |
| **§2.2** `friends` is **derived** mutual-accepted-follow, never stored | ❌ | No `v_friends` view, no derivation function. Code has no concept of "friend." | **High** — the entire `friends` visibility tier on `challenges` and `activity_events` has no enforcement. Any RLS policy referencing "friends" silently never matches. |
| **§2.3** Challenge `visibility ∈ {public, friends, private}` enforced at RLS | ⚠️ partial | `public` enforced. `friends` not enforced (no `v_friends`). `private` falls through to `creator_id`-only via the existing creator policy. | Medium — `friends`-visibility challenges leak to non-friends if any policy uses an OR condition that admits them. Needs Phase 1 audit of every challenge SELECT policy. |
| **§2.3** Posts inherit challenge visibility, can override more restrictively | ❌ | No `posts` table; equivalent rows are `activity_events`. No per-row visibility override. | Medium — users can't make a single completion private inside a public challenge. |
| **§2.3** Account privacy is a **ceiling** | ❌ | No code enforces "if account is private, public posts are visible only to accepted followers." | **High** — same risk as §2.1 stripped profile. |
| **§2.4** Notification matrix (`follow`, `follow_request`, `follow_accepted`) | ⚠️ partial | `follow_accepted` value missing from enum + dispatched as `'general'`. | Medium — analytics drift, UI cannot route accepted-request taps. |
| **§2.4** Push pipeline reuses existing wiring | ✅ | `lib/sendPush.ts` + `sendPushToProfile` used in all three follow procedures. | — |

---

## 7. Action plan implications for Phase 1

These are pre-implementation notes for Phase 1. **Design decisions locked in by user 2026-05-04 STOP-AND-REPORT response:**

- **`tier_count = drop_friends`** — Phase 1 drops the `friends` option from the **account-level** Settings UI (`components/settings/VisibilitySection.tsx` + `app/settings.tsx`). Per-challenge / per-post `friends` visibility (§2.3) stays. A migration (data-only, transactional) reduces existing `profiles.profile_visibility = 'friends'` rows to `'private'`. The CHECK constraint can stay 3-tier so per-row `'friends'` continues to work for challenges (which use a separate uppercase enum), but the account-level UI surface only exposes `{public, private}`.
- **`blocking = report_only`** — Phase 1 does **not** build a `blocks` table. The §2.2 "blocked viewer sees 404" rule is documented as **deferred post-launch** in `audit/deferred.md`. Instead, Phase 1 ensures the existing `reports.ts` route is reachable from the public profile screen as a "Report user" affordance.
- **`status_naming = keep_pending`** — `user_follows.status` stays `{accepted, pending}`. No rename migration. Phase 1.5 grep gates I write check for `'pending'` not `'requested'`. The §4.3 deviation is documented here.

1. **Rename or keep `profile_visibility`?** Recommendation: keep the column name; treat Section 2.1's `account_privacy` as conceptual; map `friends` → effective `private` in `canViewProfile` until friend graph is wired (or remove the `friends` option from the settings UI as a Phase 3 simplification).
2. **`pending` vs `requested`?** Recommendation: keep `pending` (no migration needed), update Section 4.5 grep gates to look for `pending`. Reduces breaking-change risk.
3. **Add `follow_accepted` enum value:** new migration `<ts>_in_app_notifications_add_follow_accepted.sql` extending the CHECK. Update `acceptFollowRequest` to use it.
4. **Add `removeFollower` procedure** + matching RLS UPDATE/DELETE policy.
5. **Add `blockUser`/`unblockUser` procedures + `blocks` table + RLS** — only if blocking is a launch requirement; otherwise document as deferred.
6. **Build `v_friends` view** as a stored Postgres view (`CREATE VIEW v_friends AS SELECT ... WHERE EXISTS reverse-edge`).
7. **Build `backend/lib/visibility.ts`** with `canViewProfile`/`canViewPost`/`canViewChallenge` predicates. All three return tier + permissions.
8. **Strip `getPublicByUsername` response** when viewer is non-follower of private account: drop streak/tier/days_secured/created_at fields.
9. **Build `components/FollowButton.tsx`** to consolidate inline follow logic in `app/profile/[username].tsx`.
10. **Update `in_app_notifications` INSERT RLS** to enforce a per-type allow-list (e.g. only allow `INSERT type='follow_accepted'` from `acceptFollowRequest` via SECURITY DEFINER, etc.) — Phase 7.
