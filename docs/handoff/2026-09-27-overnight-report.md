# Overnight report — 27 Sep 2026 (build 65)

## Run this first

1. SQL blocks below, in order, one statement per editor run.
2. Simulator-check `fix/build-65-truth` then `fix/drift-polish` then `feat/time-picker` then `fix/gate-copy`.
3. Merge order: `fix/build-65-truth` → `fix/drift-polish` → `feat/time-picker` → `fix/gate-copy`. Do **not** merge `report/audits`.
4. After merging `fix/build-65-truth`, deploy Railway. That branch is the only one that changes `backend/` runtime code.

### Branch heads

| Branch | Head | Tests at last green run |
|---|---|---|
| `main` | `45dd7296c92892a2a8ca9fd81eedb4459ede63e8` | ~1090 |
| `fix/build-65-truth` | `7177473ba3728c8ae4f7c77db6fa3f8190cf6de9` | 1117 |
| `fix/drift-polish` | `bf8251002056d82838b54f98c3f48ef517965189` | 1091 |
| `feat/time-picker` | `5914a9610e57b75c9f672a0e37a33ab7b2ccae4a` | 1095 |
| `fix/gate-copy` | `0be2abe` | 1090 |
| `report/audits` | `ef5bc3f4b15aaf046d109cf5432faf62ec80f334` | 1090 (main suite, docs only) |

### Commits that touch `backend/` (Railway after merge)

All on `fix/build-65-truth`:

- `7f06b51` join / start-again (`backend/lib/join-challenge.ts`, `backend/lib/join-errors.ts`, `backend/trpc/routes/challenges-join.ts`)
- `0189f21` Discover covers (`backend/trpc/routes/challenges-discover.ts`)
- `9a95f0d9` start tomorrow (`backend/lib/join-challenge.ts`, `backend/trpc/routes/home.ts`, `backend/trpc/routes/challenges.ts`, `backend/trpc/routes/starters.ts`, `backend/trpc/routes/checkins.ts`)
- `7177473` finish-flow timing logs (`backend/trpc/routes/checkins.ts`)

`fix/drift-polish` only changes backend **test fixtures** (`challenges-get-by-id.test.ts`, `challenges-list-my-active.test.ts`). No Railway.

`feat/time-picker` does not touch `backend/`. It **does** add `@react-native-community/datetimepicker` — needs a new native build. Do not run `eas build` from this session.

---

## Done

### Branch 1 — `fix/build-65-truth` (`7177473`)

#### T1 Start again after finished

Railway logs around 17:21 UTC had no `JOIN-BACKEND` / `23505` line. Failure path from the Start again button:

- Client join mutation → `backend/trpc/routes/challenges-join.ts`
- `backend/lib/join-challenge.ts` already-joined check (windowed `status=active`)
- insert into `active_challenges`
- visibility / `canJoinPrivateChallenge` / free-limit

Root cause shipped: a zombie `status=active` row with `end_at` in the past missed the windowed already-joined check, then hit `23505`. Fix closes that row and inserts a new run. Finished / left rows stay.

```
backend/lib/join-errors.ts:2  ALREADY_IN_CHALLENGE_MESSAGE = "You're already in this challenge."
backend/lib/join-errors.ts:3  JOIN_FREE_LIMIT_MESSAGE = "Free accounts can run 3 challenges at once."
backend/lib/join-errors.ts:4  JOIN_FAILED_FALLBACK = "Couldn't start this challenge. Try again."
backend/lib/join-errors.ts:30  23505 → alreadyIn
backend/lib/can-view-challenge.ts:3  PRIVATE_CHALLENGE_MESSAGE = "This challenge is private."
```

Tests: `backend/lib/join-challenge-direct.test.ts` `"inserts a new row when the only enrollment is abandoned (left)"`; `backend/lib/join-errors.test.ts`; `backend/lib/join-challenge.ts:86` already-running throws `You're already in this challenge.`

#### T2 Discover cover privacy

```
git show 0189f21 -- backend/trpc/routes/challenges-discover.ts
# :209  Covers never come from check-ins, activity_events, or participant proofs.
# :331  featuredProof: null
```

`lib/catalog-cover.ts` + `lib/catalog-cover.test.ts`: catalog cards never resolve a proof image.

Storage (unchanged, still public — see Blocked):

```
lib/uploadProofImage.ts:12   BUCKET = "task-proofs"
lib/uploadProofImage.ts:105  getPublicUrl(data.path)
supabase/migrations/20250330000000_task_verification_options.sql:50  public bucket
supabase/migrations/20250330000000_task_verification_options.sql:61-63  SELECT USING (bucket_id = 'task-proofs')
```

#### T3 Home vs detail tasks

Daily Gratitude seed task 2 is `required: false`. Home already required-only. Detail now labels `OPTIONAL_TASK_LABEL = "Optional"` (`lib/challenge-detail-mapping.ts:70`). Profile "Not yet today" is account `secured_today`, not that task.

Tests: `lib/challenge-detail-mapping.test.ts` (optional label).

#### T4 Week strip

`lib/active-challenge-ui.ts:142` `weekStripFilledForEnrollment` uses `securedElapsed`. Days before `start_at` are empty. Tests: `lib/active-challenge-ui.test.ts` `weekStripFilledForEnrollment`.

#### T5 Join after window closed

```
backend/lib/join-challenge.ts:60  anyTimeWindowClosedToday (required tasks only)
backend/lib/join-challenge.ts:76  enrollmentStartAt
backend/lib/join-challenge.ts:144  defer → tomorrow local start
lib/challenge-detail-mapping.ts:191  JOIN_CAPTION_TOMORROW = "Day 1 is tomorrow."
lib/home-starts-tomorrow.ts:1       HOME_STARTS_TOMORROW = "Starts tomorrow"
```

`secure_day` already excludes future starts:

```
supabase/migrations/20260910090000_today_state.sql:110  AND ac.start_at <= now()
supabase/migrations/20260910090000_today_state.sql:255  AND ac.start_at <= now()
```

No RPC migration written. Tests in `backend/lib/join-challenge.test.ts`: before open, inside window, after close, `by` gate passed, no time gate, timezone (`America/Los_Angeles` vs `Pacific/Auckland`).

#### T6 Proof chips

`lib/challenge-detail-mapping.ts` `gatesFor` maps legacy `photo` → Camera. Test: `lib/challenge-detail-mapping.test.ts`.

#### T7 Feed taps

`lib/feed-tap-targets.ts` + `lib/feed-tap-targets.test.ts`. Avatar/name → profile, challenge label → detail (`ROUTES` only), comment author → profile, 44pt hit slop, `accessibilityRole` / `accessibilityLabel`. Private challenge → `#98` "This challenge is private."

#### T8 Finish-flow (report only)

```
lib/verifying-takeover.ts:1          VERIFYING_TAKEOVER_MS = 800
components/task-v2/useTaskFlowV2.ts:317-319  setTimeout → "verifying" after 800ms
backend/trpc/routes/checkins.ts:974   "[checkins.complete] timing"
backend/trpc/routes/checkins.ts:1332  "[secure_day] rpc timing"
```

Share/Keep only when `shareChoicePending: true` (`useTaskFlowV2.ts:332`, camera proof). Self-report Moment footer is Done only. No simulator timings. Design owns any change to the 800ms rule.

---

### Branch 2 — `fix/drift-polish` (`4ba3b49`)

| Item | Evidence |
|---|---|
| 1 Tab bar 96pt | `lib/tab-bar-inset.ts` `TAB_BAR_CLEARANCE = 96`; `tabBarContentPad` ignores inset. `42fa21e` |
| 2 Name once | `components/profile/ProfileV3.tsx` `title="Profile"` (`687b8e5`) |
| 3 No comments on cards | `components/feed/InlineComments.tsx` returns null at zero (`6f72f7c`). Sheet still `COMMENTS_EMPTY` |
| 4 Plurals | `lib/format-days.ts:7-16` `formatDays` / `formatTasks` / `formatOfDays`. `lib/format-days.test.ts` |
| 5 Quiet bio | `ProfileV3.tsx` secondary left-aligned Pressable (`687b8e5`) |
| 6 Drop "due" | `lib/consistency.ts:64` `"Today still open."` was `"1 due today."`. `lib/consistency.test.ts` |
| 7 Count pills | `components/home/HomeV3.tsx` `countTxt` caption, no `countChip`. `lib/home-proof-card.test.ts` `not.toContain("countChip")` |
| 8 Freeze paragraph | `ConsistencyGrid.tsx` no longer renders `HELD_DAY_LINE`. `SECURED_LINE` already states the freeze rule. `fbff990` |
| 9 7 columns | `ConsistencyGrid.tsx` `col` / `wd` width `100/7`. `fbff990` |
| 10 Earned Earned | `lib/profile-v2-badges.ts` `formatBadgeUnlockDate` returns the date only. `BadgeRows.tsx` prefixes once. `4678335` |
| 11 Matthews | `components/create/v2/StepRules.tsx` now `"Public accountability on the feed."` |
| 12 75 Hard | `git grep "75 Hard" fix/drift-polish` → **zero matches**. Pack id `75hard` remains (`lib/challenge-packs.ts:260`). Display name `"No Days Off"` |
| 13 Remove 21 | `components/create/v2/StepBasics.tsx` presets 7 / 14 / 30 / 75. Existing 21-day rows still render via `formatDays` |
| 14 Category | `CreateWizardV2.tsx` `Category · ${Display}` |
| 15 Standard/Hard | `StepRules.tsx` `"Freezes on. Use one to cover a missed day."` / `"No freezes. Miss a day, restart from day 1."` `lib/active-challenge-ui.ts` `difficultyLine` same |
| 16 Feed · Optional | `lib/create-wizard-hard-proof.ts` `reviewPhotoLine` never contains `Photo`. `lib/create-wizard-hard-proof.test.ts` |

#### Plurals before / after (hard-coded)

```
# main
lib/feed-card-family.ts:65  All ${n} tasks done
lib/feed-card-family.ts:70  ${p.securedDays} of ${p.totalDays} days secured

# 4ba3b49
lib/feed-card-family.ts:66  All ${formatTasks(n)} done
lib/feed-card-family.ts:71  ${formatOfDays(p.securedDays, p.totalDays)} secured
```

`git grep "75 Hard" fix/drift-polish` empty. Internal key `75hard` kept so stored pack ids do not break.

---

### Branch 3 — `feat/time-picker` (`5914a96`)

```
lib/time-gate-picker.ts:7-9     defaults 07:00 / 05:00–06:30
lib/time-gate-picker.ts:45      betweenEndAfterStart (end > start)
lib/time-gate-picker.ts:11      BETWEEN_END_BEFORE_START
lib/time-gate-picker.test.ts    format + validation
components/create/AddTaskSheet.tsx  DateTimePicker display="spinner" inside ds/Sheet
package.json  @react-native-community/datetimepicker 8.4.4
app.json      config plugin added
```

Store remains `HH:MM` 24h. Display uses existing `format12h` / `formatWindowRange` (`lib/task-ui.ts:43-79`) e.g. `"5:00–6:30 am"`. Editing loads `draftFromWizardTask`. **Needs a new native build.**

Tests: `lib/time-gate-picker.test.ts`; `lib/add-task-draft.test.ts` `"rejects a Between window whose end is not after the start"`.

---

### Branch 4 — `report/audits` (this file + draft SQL only)

See Audits below. `supabase/migrations/20260927200000_is_member.sql` is a draft. Do not apply from here.

---

## Blocked

1. **T1 unique constraint.** `supabase/migrations/20260927180000_active_challenges_one_active_unique.sql` on `fix/build-65-truth` — apply in the editor, then run the `pg_constraint` block. Logging / start-again TS already shipped.
2. **T2 private proofs are world-readable.** Bucket `task-proofs` is public (`20250330000000_task_verification_options.sql:50`). SELECT policy `USING (bucket_id = 'task-proofs')` (`:61-63`). Client uses `getPublicUrl` (`lib/uploadProofImage.ts:105`). Proposed fix (not built): private bucket + signed URLs, service-role after ownership / `shared = true`. Needs a product/storage decision.
3. **Catalog title rename.** `supabase/migrations/20260927190000_rename_75_hard_catalog.sql` on `fix/drift-polish` (`bf82510`). Title becomes `No Days Off` only when `title = '75' || ' Hard'`. Description replace does not overwrite other titles. Preview SELECT is in the file header.
4. **T5 5am crew repair.** Confirmed: required Run 05:00–06:30 launched 13:24 EDT makes today impossible. Repair SQL is below. Not run.
5. **`secure_day` RPC.** Already filters `start_at <= now()` (`today_state.sql:110,255`). No RPC change. If prod function differs, run the `pg_get_functiondef` block.
6. **`is_member(p_challenge_id uuid)`.** Draft at `supabase/migrations/20260927200000_is_member.sql` (`bc962ea`). Uses `auth.uid()` inside. No user-id argument. No `status` filter until the `information_schema` block proves the column. Do not apply until you review 42P17.
7. **datetimepicker native build.** `feat/time-picker` cannot be simulator-checked on build 65. Needs a new native binary. Do not run EAS from this session.
8. **T8 timings.** No simulator numbers. Server logs are in place after Railway deploy of `7177473`.
9. **Design specs.** Finish-flow redesign (v41 F1), time-picker restyle (v41 F2), Visibility v38b — not built.

---

## Needs decision

1. Apply the three SQL migrations (unique index, catalog rename, `is_member`) or not.
2. Make `task-proofs` private (signed URLs) vs leave public bucket.
3. Whether pack id `75hard` should be renamed (display is already `No Days Off`).
4. Gate copy: `"Standard mode. Gates are recorded, not enforced."` is false (`backend/trpc/routes/checkins.ts:168` `assertTimeGate`, `:248` camera). Replacement ships on `fix/gate-copy`, including `lib/onboarding-v2-first-challenge.ts:8` (authorized exception).

---

## Yaseen to run

One statement per block. Editor shows only the last result.

### 1. Confirm `secure_day` filters `start_at`

```sql
SELECT pg_get_functiondef('public.secure_day(uuid)'::regprocedure);
```

### 2. Active unique constraint (after applying T1 migration)

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.active_challenges'::regclass
  AND contype IN ('u', 'x');
```

### 3. Catalog titles that still say the trademark

```sql
SELECT id, title, creator_id
FROM public.challenges
WHERE title ILIKE '%75%'
   OR description ILIKE '%75 Hard%';
```

Use the split literal from `20260927190000_rename_75_hard_catalog.sql` if this query is run after the trademark sweep.

### 4. 5am crew repair (only if today is still blocked)

```sql
UPDATE public.active_challenges ac
SET start_at = timezone('America/New_York', date '2026-09-28')::timestamptz
WHERE ac.user_id = '10556c76-3c37-4204-8915-fc7fd3b16a59'
  AND ac.status = 'active'
  AND EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = ac.challenge_id
      AND c.title ILIKE '%5am%'
  )
RETURNING id, challenge_id, start_at, end_at, status;
```

### 5. RLS — check-ins

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'public.check_ins'::regclass;
```

### 6. RLS — activity_events

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'public.activity_events'::regclass;
```

### 7. RLS — day_secures

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'public.day_secures'::regclass;
```

### 8. RLS — profiles

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'public.profiles'::regclass;
```

### 9. RLS — challenge_members

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'public.challenge_members'::regclass;
```

### 10. RLS — challenge_invites

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'public.challenge_invites'::regclass;
```

### 11. Storage bucket

```sql
SELECT id, name, public
FROM storage.buckets
WHERE name = 'task-proofs';
```

### 12. Storage object policies

```sql
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass
  AND (
    pg_get_expr(polqual, polrelid) ILIKE '%task-proofs%'
    OR pg_get_expr(polwithcheck, polrelid) ILIKE '%task-proofs%'
  );
```

### 13. Flag `USING (true)` leftovers

```sql
SELECT n.nspname, c.relname, p.polname, p.polcmd, pg_get_expr(p.polqual, p.polrelid) AS using_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'storage')
  AND pg_get_expr(p.polqual, p.polrelid) = 'true';
```

### Simulator

1. **`fix/build-65-truth` after Railway:** Drink Water Today → Start again (no Server Error; old 1/1 stays). Discover Drink Water cover is not your private proof. Daily Gratitude week strip empty before today. 5am crew says Day 1 tomorrow / Home "Starts tomorrow" (or apply repair SQL). Feed avatar/name/challenge/comment taps. Detail Camera chip on photo tasks.
2. **`fix/drift-polish`:** tab clearance, Profile name once, no "No comments yet" on cards, no "due", caption counts, 7-col grid, one freeze paragraph, "Earned 19 Sep 2026", wizard lengths without 21, No Days Off, Feed · Optional, Standard/Hard copy.
3. **`feat/time-picker`:** only after a new native build. By spinner, Between 5:00–6:30 am, end-before-start error, edit loads saved times, preview row updates.

---

## Audits (read-only)

### Freeze mechanic

Nightly cron does **not** null `last_completed_date_key`.

```
backend/lib/daily-reset.ts:6     Never nulls last_completed_date_key
backend/lib/miss-reconcile.ts:3   Never nulls last_completed_date_key (useFreeze needs it)
backend/lib/miss-reconcile.test.ts:182  cronWrites.some(... last_completed_date_key === null) === false
```

`railway.json` has no cron (`backend/lib/daily-reset.ts:8-9`). The route **is** scheduled: `.github/workflows/daily-reset.yml:5` `cron: "30 0 * * *"` (00:30 UTC) POSTs `https://grit-backend-production.up.railway.app/internal/daily-reset` (`:17`). The earlier line that said nothing in-repo schedules it was wrong.

Only yesterday can be frozen:

```
backend/trpc/routes/streaks.ts:134  Spend a freeze for yesterday
backend/trpc/routes/streaks.ts:144  dateKeyToFreeze !== yesterdayKey → BAD_REQUEST
backend/trpc/routes/streaks.ts:195  "Freeze can only be used when you missed exactly one day (yesterday)."
```

Copy that still over-promises (main, before polish):

```
components/create/v2/StepRules.tsx:29  "Streak freezes on. Miss a day and you do not reset."  → fixed on fix/drift-polish
lib/active-challenge-ui.ts:172         "Standard mode" / "Hard mode. No freezes."           → fixed on fix/drift-polish
```

### Feed privacy

`checkins.complete` **does** insert `activity_events` before Share/Keep.

```
backend/trpc/routes/checkins.ts:139-140  shareChoicePending optional
backend/lib/activity-share.ts:10-11      true → "unanswered"; omit → "shared" (old clients)
backend/trpc/routes/checkins.ts:833      shareColumns(shareStateOnInsert(...))
backend/trpc/routes/checkins.ts:854-856  insert task_completed
components/task-v2/useTaskFlowV2.ts:332  camera only sends shareChoicePending: true
```

Self-report (no camera) omits the flag → row is written `shared = true` immediately. That is why there is no Share/Keep after Write 3 gratitudes / Make your bed.

Public feed queries filter `share_state = shared` (`backend/lib/activity-share.test.ts:70-80`: `getLiveFeed`, `getUserPosts`, `list`, `getRecentCompletions`, `getTrending`). `listMine` / profile record / roster do not filter — they are owner surfaces.

RLS after `20260919150000_activity_events_shared_select.sql:11-12`: `(shared = true OR user_id = auth.uid())`. Unshared rows are readable by the owner JWT only, plus service role.

Discover on **main** still hydrates `featuredProof` from `activity_events` (`challenges-discover.ts:277-321`). `fix/build-65-truth` forces `featuredProof: null` (`:331`).

Push copy does not embed proof URLs (notification copy is text). Storage URLs remain guessable if the bucket is public (Blocked).

### RLS map (code paths)

| Table | Latest policy in repo | Relied on by |
|---|---|---|
| `check_ins` | `Users can view/insert/update own` (`20260321150000`:45-63). SELECT own `user_id` or via owned `active_challenges`. No `USING (true)` | `checkins.complete`, profile proofs |
| `activity_events` | `Anyone can read activity` rewritten (`20260919150000`:8-17) shared OR owner; anon own-only. Flip is service-role (`activity-share.ts:4`) | `feed.ts` public queries + `listMine` |
| `day_secures` | own SELECT/INSERT (`20260321143000`:20-27) | `secure_day`, Home week strip, Profile record |
| `profiles` | `profiles_select_authenticated` (`20260822000000`:11-17) own OR non-anon. **Not** `USING (true)` after that migration. Baseline `20260621000000:81` was `USING (true)` — confirm live with query 8 | `profiles.get`, `getRecord` |
| `challenge_members` | `challenge_members_select` self-join (`20250312000000:53-57`) — **42P17 risk** | roster, invites INSERT check |
| `challenge_invites` | select own inviter/invitee; insert if active member (`20260916220000:24-40`) | groups invites |
| `storage.objects` `task-proofs` | INSERT own folder; **SELECT any object in bucket** (`20250330000000:55-63`) | `uploadProofImage.ts` |

`USING (true)` leftovers to confirm live: query 13. Repo history: `challenges` / `challenge_tasks` viewable-by-everyone dropped in `20260926140000`. `feed_reactions` / `feed_comments` still `USING (true)` for SELECT (`20260322000000:12,26`).

### `challenge_members_select` 42P17

Policy at `20250312000000_team_challenges.sql:53-57` SELECTs `challenge_members` from inside its own policy → infinite recursion.

Draft: `supabase/migrations/20260927200000_is_member.sql` — `is_member(p_challenge_id uuid)` reads `auth.uid()` inside (`bc962ea`). Policy: `auth.uid() = user_id OR public.is_member(challenge_id)`. Not applied.

### 14. `challenge_members` columns (before applying `is_member`)

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'challenge_members'
ORDER BY ordinal_position;
```

Repo create lists `status` (`20250312000000_team_challenges.sql:42`). The draft does not filter on it.

---

## Private `task-proofs` + signed URLs (plan only, not built)

Today the bucket is public and every stored value is a world-readable URL.

### Where a proof URL is written

| Write | File:line |
|---|---|
| Upload returns public URL | `lib/uploadProofImage.ts:12` bucket; `:105-106` `getPublicUrl` |
| `check_ins.proof_url` / `photo_url` | `backend/trpc/routes/checkins.ts:783-785` (complete); `:1159-1160` (saveProgress) |
| `activity_events.metadata.photo_url` | `backend/trpc/routes/checkins.ts:846` |
| Share backfill from check-in | `backend/trpc/routes/feed.ts:428-435,447` |
| Caption flip `proof_photo_url` | `backend/trpc/routes/feed.ts:457` |
| Client complete payload | `components/task-v2/useTaskFlowV2.ts:508` `photo_url: url` |

No `createSignedUrl` in the repo (grep). Avatars are a different public bucket (`lib/uploadAvatar.ts:57`).

### Where a proof URL is rendered or re-derived

| Surface | File:line |
|---|---|
| Path → `/object/public/task-proofs/...` | `lib/profile-v2-proof-photo.ts:28-39,42-58,65-73,81-94` |
| Home today rows | `app/(tabs)/index.tsx:200-222` |
| Active task stamps | `app/challenge/active/[activeChallengeId].tsx:83-89,153,281` |
| Profile proofs grid | `backend/trpc/routes/profiles-record.ts:297-301`; `lib/proofs-grid.ts`; `components/profile/ProofsGrid.tsx` |
| Proof day / viewer | `lib/day-state.ts`; `components/profile/ProofDayCard.tsx`; `DayViewer.tsx` |
| Live feed hydrate | `backend/lib/feed-activity-hydrate.ts:334-356` |
| Feed card | `lib/live-feed-list.ts:15-19`; `components/feed/FeedPostV3.tsx:51-53,94-96` |
| Post detail | `lib/post-detail.ts:21-26`; `app/post/[id].tsx` |
| Secured / moment / share | `backend/trpc/routes/checkins.ts:925-967`; `lib/secured-day.ts:84-97`; `components/task-v2/SecuredDayScreen.tsx`; `MomentScreenV3.tsx:243`; `components/share/ShareCardV3.tsx` |
| Discover hero (main) | `backend/trpc/routes/challenges-discover.ts:276-325` — nulled on `fix/build-65-truth` |
| Roster | avatars only (`backend/trpc/routes/groups.ts:522-576`) |

### Proposed shape

1. **Store paths, not URLs.** Canonical value: `{userId}/{ts}-{rand}.jpg` (already the upload path at `uploadProofImage.ts:69`). Never persist `https://…/object/public/task-proofs/…`.
2. **Migration (not written).** Rewrite existing columns to the storage path:
   - `check_ins.photo_url`, `proof_url`, `completion_image_url`
   - `activity_events.metadata->>'photo_url'` and `->>'proof_photo_url'`
   - `regexp_replace` of `/storage/v1/object/(public\|sign)/task-proofs/` → empty, keep `{userId}/{file}`
3. **Bucket.** `UPDATE storage.buckets SET public = false WHERE name = 'task-proofs'`. Drop `"Public read proofs"` (`20250330000000:59-63`). Keep INSERT own-folder. No public SELECT.
4. **Mint signed URLs (service role only)** after one of:
   - `check_ins.user_id = auth.uid()` (owner), or
   - `activity_events.share_state = 'shared'` (or `shared = true`) for that object, or
   - the viewer is the owner reading their own unshared row
   New tRPC e.g. `proofs.sign({ path })` → `supabase.storage.from('task-proofs').createSignedUrl(path, ttl)`. User JWT must not be able to sign arbitrary paths.
5. **TTL / caching.** 120–300 seconds. Do not persist the signed URL in AsyncStorage or the DB. Image cache key = storage path, not the query-string URL. Refresh on 403. Client `resolveProofImageUrl` (`lib/profile-v2-proof-photo.ts:42-58`) today **rewrites signed → public**; that invert must die.
6. **Tests.** `lib/proofs-grid.test.ts:100` held a real production object URL. Removed on `fix/gate-copy` `0be2abe` (`task-proofs/00000000-0000-4000-8000-000000000001/fake-proof.jpg`).

---

## Branches + heads

```
main                  45dd729
fix/build-65-truth    7177473   1117 tests   Railway
fix/drift-polish      bf82510   1091 tests
feat/time-picker      5914a96   1095 tests   new native build
fix/gate-copy         0be2abe   1090 tests
report/audits         ef5bc3f   report + is_member draft
```
