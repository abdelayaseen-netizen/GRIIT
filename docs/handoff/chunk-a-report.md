# Chunk A — backend truth

Branch `feat/chunk-a-backend` off `fafdb0c` (main after #103). Never committed to main.

Binding copy: Standard line stays the gate-copy text already on main, not the handoff’s “Every gate blocks…”.

---

## Done

### A1. Unshared writes for every task type (contradiction 115)

`checkins.complete` already accepted `shareChoicePending` on every complete. Named that contract and locked it.

- `shareColumnsForComplete` — `backend/lib/activity-share.ts:36` — task type is ignored. Omit / `false` → shared (old clients). `true` → `unanswered`.
- Complete uses it for every type, not inside a photo branch — `backend/trpc/routes/checkins.ts:835`.
- `shareProof` flips by `eventId` with no `has_photo` / `isPhotoProof` gate — `backend/trpc/routes/checkins.ts:1458`.
- Client unchanged. Build 65 still only sends the flag for camera (`components/task-v2/useTaskFlowV2.ts:333`).

Tests (`backend/lib/activity-share.test.ts`):

- `self-report with the flag is unshared; omit stays shared for old clients`
- `checkins.complete honours shareChoicePending for every task type`
- `shareProof flips a non-photo row the same as a camera row`
- `feed hides an unshared row and listMine still shows it`

Commit: `5040701133c9c91383068151eace11c9de8d24fd`

### A2. Record payload day states (frame 117; contradictions 79, 81, 86, 88, 113)

`profiles.getRecord` now returns `days[]` from the first `start_at` through today (profile timezone). Future days are omitted. `daySource` is unchanged so build 65’s client `daysFromSource` still works.

#### Payload shape

```ts
{
  date: string;            // YYYY-MM-DD
  state: "camera" | "self" | "freeze" | "last_stand"
       | "missed" | "today_open" | "today_secured" | "before_first";
  cover_path: string | null;  // first camera proof that day; storage path when we can parse one
  shared: boolean;            // true if any camera activity row that day is shared
  tasksDone: number;          // tasksDueOnDay + tallyTasks
  tasksDue: number;
}

header: { secured: number; days: number }  // securedElapsed, same reducer as Home
```

Writer: `buildProofsDays` / `proofsHeader` in `backend/lib/proofs-days.ts`. No new table. No user INSERT/UPDATE.

Visitor (`relationship !== "self"` or `preview=stranger`): same `state` (including `camera`); `cover_path` is null when that camera day is not shared — `backend/trpc/routes/profiles-record.ts:438` `viewer: "visitor"`.

Breakdown (`detail.cameraDays` / `selfReportedDays` / `lastStandDays` / `freezeDays`) comes from `proofsBreakdown(days)`, not hardcoded 0.

`byChallenge` denominators go through `rangeSecuredElapsed` → `securedElapsed` (`lib/profile-v2-record.ts:204`).

```
git grep -n fractionDateKeysForRange -- ':!*.test.ts'
# empty
```

The symbol remains only in `backend/trpc/routes/profiles-record.test.ts` as `not.toContain("fractionDateKeysForRange")`.

#### securedElapsed vs frame 117 (freeze / Last Stand)

They agree. Did not pick a side.

- Frame 117 (`design/handoff/cursor/02_screens.md:5465`): secured = camera + self. Days = first `start_at` through yesterday, plus today once secured. Freeze and Last Stand are in the denominator, not the numerator.
- `securedElapsed` (`backend/lib/secured-elapsed.ts:16-34`): numerator = due keys that are also in `securedDateKeys` (`day_secures`). Denominator = due keys through yesterday, plus today only if today is secured.
- Freeze writes `freeze_uses` only (`backend/trpc/routes/streaks.ts:218`). Last Stand writes `last_stand_uses` only (`backend/lib/miss-reconcile.ts:185`). Neither inserts `day_secures`.
- Those days stay in `dueDayKeys` (enrollment window) so they sit in `elapsed`, and they are absent from `day_secures` so they are absent from `secured`.

Header on getRecord is `proofsHeader` → that same `securedElapsed`. Home uses `consistencyFromDayArray` → the same function (`lib/consistency.ts:39`).

#### Sample JSON (fixture user, owner)

Fixture: enrolled 2026-09-12–30, two required tasks. Today = 2026-09-19. Secured 16 (camera, unshared), 17 (self), 19 (camera, shared). Freeze 14. Last Stand 15.

```json
{
  "header": { "secured": 3, "days": 8 },
  "days": [
    { "date": "2026-09-12", "state": "missed", "cover_path": null, "shared": false, "tasksDone": 0, "tasksDue": 2 },
    { "date": "2026-09-13", "state": "missed", "cover_path": null, "shared": false, "tasksDone": 0, "tasksDue": 2 },
    { "date": "2026-09-14", "state": "freeze", "cover_path": null, "shared": false, "tasksDone": 0, "tasksDue": 2 },
    { "date": "2026-09-15", "state": "last_stand", "cover_path": null, "shared": false, "tasksDone": 1, "tasksDue": 2 },
    { "date": "2026-09-16", "state": "camera", "cover_path": "u1/first.jpg", "shared": false, "tasksDone": 2, "tasksDue": 2 },
    { "date": "2026-09-17", "state": "self", "cover_path": null, "shared": false, "tasksDone": 2, "tasksDue": 2 },
    { "date": "2026-09-18", "state": "missed", "cover_path": null, "shared": false, "tasksDone": 0, "tasksDue": 2 },
    { "date": "2026-09-19", "state": "today_secured", "cover_path": "u1/today.jpg", "shared": true, "tasksDone": 1, "tasksDue": 2 }
  ]
}
```

Visitor on 2026-09-16: `{ "state": "camera", "cover_path": null, "shared": false }`.

Tests (`backend/lib/proofs-days.test.ts`): every state; LA vs Auckland first day; joined-today; freeze; Last Stand; visitor private cover; header equals Home.

Commit: `3efc9f0ae6ae6e99d4a3f3606f2969e09f8c2495`

---

## A3. Signed URLs — store paths, mint at read (contradiction T2)

Bucket stays **public**. Phase 3 (flip private) is report-only. Do not apply.

Canonical stored value: `{userId}/{ts}-{rand}.jpg`. APIs mint signed URLs (TTL 300) via service-role `createSignedUrls`. Missing service role → null, not a public URL. Sign only if first folder === viewerId **or** a shared activity row the author owns references the path.

### Phase 1 — resolver + read sites

`backend/lib/proof-image.ts`

- `toProofPath` / `pathOwnerId` / `canSignProofPath` / `sharedPathsFromEvents`
- `signProofPaths` — one batch, TTL `PROOF_SIGN_TTL_SEC` = 300
- `signProofPair`

Wired:

| Surface | File:line |
|---|---|
| Feed hydrate `photoUrl` / `proofPhotoUrl` | `backend/lib/feed-activity-hydrate.ts:370-378` |
| `feed.getPost` | `backend/trpc/routes/feed.ts:253` `signProofPair` |
| `feed.list` metadata photo fields | `backend/trpc/routes/feed.ts:346` |
| `feed.listMine` `proofUrl` | `backend/trpc/routes/feed.ts:392` |
| `profiles.getRecord` `days[].cover_url` + `proofs[].imageUrl` | `backend/trpc/routes/profiles-record.ts:500,517` |
| `checkins.complete` returned proof fields + `dayProofs` | `backend/trpc/routes/checkins.ts:982` |
| `checkins.getTodayCheckins` | `backend/trpc/routes/checkins.ts:1257` |
| `checkins.getTodayCheckinsForUser` (`proof_url`, `completion_image_url`) | `backend/trpc/routes/checkins.ts:1322` |

`publicUrlForProofHttp` no longer rewrites signed → public (`lib/profile-v2-proof-photo.ts:42-51`).

Hydrate forces `share_state: "shared"` on already-visible events (`feed-activity-hydrate.ts:371`). `getPost` uses `sharedPathsFromEvents([ev])` so an owner still signs their own unshared path via first-folder === viewerId.

Commit: `74314230b3d95313a2abdee6b93317b463f753e6`

### Phase 2 — writes (build 65 stores the URL as-sent)

Do **not** normalise on write. Build 65 sends a public URL; build 66 will send a path. The read resolver already accepts both. `ownedProofWrite` keeps the trimmed client string when the writer owns the object; `file://` and anyone else's path are stored null.

`storedProofValue` is the rewrite helper for the path-migration SQL only. Writes must not call it.

| Write | File:line |
|---|---|
| Upload on this branch returns `data.path` (build 66 client) | `lib/uploadProofImage.ts:105` |
| `checkins.complete` + activity `metadata.photo_url` | `backend/trpc/routes/checkins.ts:252,774-788,849` |
| `checkins.saveProgress` | `backend/trpc/routes/checkins.ts:1182-1185` |
| `feed.shareCompletion` backfill + `proof_photo_url` | `backend/trpc/routes/feed.ts:469,493` |

Avatars are a different bucket (`lib/uploadAvatar.ts:57`). Untouched.

### Columns

| Column | Table |
|---|---|
| `photo_url` | `check_ins` |
| `proof_url` | `check_ins` |
| `completion_image_url` | `check_ins` |
| `metadata->>'photo_url'` | `activity_events` |
| `metadata->>'proof_photo_url'` | `activity_events` |

Schema: `20260321150000_check_ins_table_and_rls.sql`, `20250310000000_check_ins_completion_image_url.sql`, `20250330000000_task_verification_options.sql`.

### Migration (do not apply)

File: `supabase/migrations/20260928010000_task_proofs_store_paths.sql`

Writer: that file, applied by hand. No user UPDATE policy. Strips `/storage/v1/object/(public|sign)/task-proofs/` (and `?...`) down to `{userId}/{file}`.

Preview (one statement per block): `docs/sql-drafts/20260928010000_task_proofs_store_paths_preview.sql`

### Phase 3 — after build 66 is installed

Order: install build 66 → apply the rewrite migration → then flip the bucket. Same wait as the flip. Do not apply the migration against build 65.

```sql
UPDATE storage.buckets
SET public = false
WHERE id = 'task-proofs';

DROP POLICY IF EXISTS "Public read proofs" ON storage.objects;
```

Keep `"Users can upload own proofs"` INSERT (`20250330000000_task_verification_options.sql:54-57`). No public SELECT. No new user UPDATE.

#### What build 65 breaks if the bucket flips now (before build 66 + rewrite)

APIs that already sign keep working: feed, getPost, listMine, getRecord covers/proofs, complete return, getTodayCheckins, getTodayCheckinsForUser (`proof_url` / `completion_image_url`).

These still read a stored value (path or leftover public URL) and/or rebuild `/object/public/task-proofs/…`:

| Surface | Why it 403s / fails to load |
|---|---|
| Active today stamps | `app/challenge/active/[activeChallengeId].tsx:153-155` selects `check_ins` with the user JWT. `:90-92` passes the raw stored value into `proof_photo_url`. A path is not an Image URI. A leftover public URL dies when the bucket is private. |
| Moment / just-captured fallback | `components/task-v2/MomentScreenV3.tsx:243` → `proofImageUrlForCheckIn` → `publicUrlForProofStoragePath` (`lib/profile-v2-proof-photo.ts:29-39`) builds `/object/public/task-proofs/…`. `file://` still works. |
| Any leftover public URL in DB | Same public path. Migration must land before the flip or those rows stay broken even on signed APIs until `toProofPath` can parse them (it can — signed APIs still work on old public URLs). The client-direct reads do not. |
| `getTodayCheckinsForUser` `photo_url` | Not signed (`checkins.ts:1307` does not select it; `:1322` signs only `proof_url` / `completion_image_url`). Home today stamps use `hasCameraProof` (boolean), not the image bytes — stamps survive. A later consumer of `photo_url` from this payload would not. |

Build 66 needs Active (and any other client `check_ins` photo read) to go through a signed API, and `publicUrlForProofStoragePath` must stop minting public URLs.

---

## STOP A3

Chunk B / UI / EAS / Railway / RevenueCat / onboarding / v37–v41 screens are not started. Bucket is still public. Migration is not applied. Waiting.

---

## Blocked

None for A1–A3.

## Needs decision

None. Standard copy stays the gate-copy line. Do not flip `task-proofs` until build 66.

## Yaseen to run

Preview only, one statement per block, from `docs/sql-drafts/20260928010000_task_proofs_store_paths_preview.sql`. Do not run `supabase/migrations/20260928010000_task_proofs_store_paths.sql` until build 66 is installed. Do not flip the bucket until after that rewrite.

## Commits touching `backend/` (Railway after merge)

1. `5040701` `fix(checkins): honour shareChoicePending for every task type`
2. `3efc9f0` `feat(record): return v41 day states from first start_at to today`
3. `7431423` `feat(proofs): return signed task-proofs URLs from the API`
4. `1ff5395` `feat(proofs): store task-proofs paths instead of public URLs`
5. `c1660a0` `chore(sql): add unapplied task-proofs path rewrite` (SQL only)

## Branch head

`feat/chunk-a-backend`. A3 writes `1ff5395e0211d60a90e47dad92ab7e8f6ec8471f`. Migration `c1660a03be97e6e697918a33c11d518c3a335dd6`. This report is the next commit.

## Test count

- tsc 0
- **1149** tests, 207 files (was 1147 / 207 after A3 phase 1; 1128 / 205 on main `fafdb0c`)
- eslint 0 on the files this chunk changed
- repo-wide `npm run lint` is already dirty on main (7 expo warnings). Not introduced here.
