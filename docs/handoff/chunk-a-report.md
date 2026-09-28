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

## STOP A2

A3 (signed URLs) is not started. Waiting.

---

## Blocked

None for A1/A2.

## Needs decision

None. Standard copy stays the gate-copy line.

## Yaseen to run

None in A1/A2. No SQL.

## Commits touching `backend/` (Railway after merge)

1. `5040701` `fix(checkins): honour shareChoicePending for every task type`
2. `3efc9f0` `feat(record): return v41 day states from first start_at to today`

## Branch head

`3efc9f0ae6ae6e99d4a3f3606f2969e09f8c2495` on `feat/chunk-a-backend`

## Test count

- tsc 0
- **1141** tests, 206 files (was 1128 / 205 on main `fafdb0c`)
- eslint 0 on the files this chunk changed
- repo-wide `npm run lint` is already dirty on main (7 expo warnings). Not introduced here.
