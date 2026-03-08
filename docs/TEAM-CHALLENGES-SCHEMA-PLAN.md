# GRIIT Team Challenges — Schema & API Plan (Backend Only)

**Purpose:** Map the [team challenges spec](GRIIT-team-challenges-spec.md) to the existing database and tRPC surface. Propose minimal schema and API changes so team mode works without breaking solo.  
**Scope:** Migrations + types + tRPC procedures only; no UI changes.

---

## 1. Current schema (relevant parts)

### challenges
- `id`, `title`, `description`, `rules_text`, `duration_type`, `duration_days`, `difficulty`, `category`, `visibility`, `status` ('published'|'draft'), `is_featured`, `created_by`, `creator_id`, `participants_count`, `cover_image_url`, `short_hook`, `theme_color`, `live_date`, `replay_policy`, `require_same_rules`, `show_replay_label`, `created_at`, `source_starter_id` (from activation migration).

### active_challenges
- `id`, `user_id`, `challenge_id`, `status` ('active'|'completed'|'quit'), `start_at`, `end_at`, `current_day`, `progress_percent`, `created_at`, `completed_at`.
- **Unique:** `(user_id, challenge_id)` WHERE `status = 'active'` (one active join per user per challenge).

### check_ins
- `id`, `user_id`, `active_challenge_id`, `task_id`, `date_key`, `status` ('pending'|'completed'|'missed'), `value`, `note_text`, `proof_url`, `created_at`, plus any `completion_image_url` from migrations.

### day_secures
- `id`, `user_id`, `date_key`, `created_at`. Unique `(user_id, date_key)`.

### Existing RPCs
- **join_challenge(p_challenge_id uuid):** Inserts one `active_challenges` row, seeds `check_ins` for all tasks, upserts `streaks`. Returns the new `active_challenges` row.
- **secure_day(p_active_challenge_id uuid):** Verifies all required check_ins for today, then inserts `day_secures`, updates `streaks`, increments `active_challenges.current_day` and `progress_percent`, updates `profiles` (total_days_secured, tier).

### Existing tRPC (challenges + checkins)
- **challenges:** list, getFeatured, getStarterPack, getById, **join**, getActive, listMyActive, create.
- **checkins:** complete, secureDay (calls RPC `secure_day`).

---

## 2. Mapping spec → existing model

| Spec concept | Current mapping | Gap |
|--------------|-----------------|-----|
| Solo | One user joins → one `active_challenges` row; check_ins per task/day; secure_day per user. | None. |
| Team (Daily Discipline) | Multiple users, same challenge; each must complete all tasks daily; if any misses or quits → whole run fails. | Need: (1) “Run” identity (who started together). (2) Members before start (join until full). (3) Run-level status (waiting / active / completed / failed). (4) On “start,” create one `active_challenges` per member with same `start_at`. (5) secure_day: per-user as today; end-of-day or on last-secure check “all secured?” → advance or fail run. |
| Shared Goal | 2–10 people, one cumulative target; log progress (amount + unit); optional deadline. | No daily tasks; need: shared_goal_* on challenge, `shared_goal_logs`, run status and deadline handling. |
| Challenge “run” status | N/A (solo run = one active_challenge). | For team/shared_goal: WAITING | ACTIVE | COMPLETED | FAILED. |

**Design choice:** One run per challenge at a time. For team/shared_goal, “run” is identified by `challenges.started_at` (when the run started). For team daily discipline, all members get `active_challenges` with the same `start_at` (= `challenges.started_at`). No separate `team_runs` table in the minimal plan.

---

## 3. Schema changes (minimal)

### 3.1 challenges — new columns

| Column | Type | Default | Notes |
|--------|------|---------|--------|
| `participation_type` | TEXT | `'solo'` | One of: `'solo'`, `'duo'`, `'team'`, `'shared_goal'`. Constraint recommended. |
| `team_size` | INTEGER | 1 | 1 for solo; 2–10 for team/shared_goal. |
| `shared_goal_target` | NUMERIC | NULL | e.g. 100 (miles). Only for `participation_type = 'shared_goal'`. |
| `shared_goal_unit` | TEXT | NULL | e.g. `'miles'`. Only for shared_goal. |
| `shared_goal_current` | NUMERIC | 0 | **Omit from migration** (see §9.2). Progress is derived as SUM(shared_goal_logs.amount). If added later as a cache, update only under row lock in log_shared_goal. |
| `deadline_type` | TEXT | NULL | `'none'` \| `'soft'` \| `'hard'`. Only for shared_goal. |
| `deadline_date` | DATE | NULL | Only when deadline_type is soft/hard. |
| `started_at` | TIMESTAMPTZ | NULL | When this run started. Solo: leave null. Team/shared_goal: set when run goes from waiting → active. |
| `run_status` | TEXT | NULL | For team/shared_goal only: `'waiting'` \| `'active'` \| `'completed'` \| `'failed'`. **Solo: always null and ignored** (see §9.3). |

**Constraints (add in migration):**
- `participation_type` IN ('solo','duo','team','shared_goal').
- `run_status` IN ('waiting','active','completed','failed') or NULL.
- `team_size` BETWEEN 1 AND 10 (or 2–10 when participation_type IN ('duo','team','shared_goal') — can be enforced in app or CHECK).

### 3.2 New table: challenge_members

Represents “who is in this challenge (run).” For solo, creator is the only member; for team/shared_goal, multiple rows per challenge until run is started.

| Column | Type | Nullable | Notes |
|--------|------|----------|--------|
| `id` | UUID | NO | PK, default uuid_generate_v4(). |
| `challenge_id` | UUID | NO | FK → challenges(id) ON DELETE CASCADE. |
| `user_id` | UUID | NO | FK → auth.users(id) ON DELETE CASCADE. |
| `role` | TEXT | NO | `'creator'` \| `'member'`. |
| `status` | TEXT | NO | `'active'` \| `'quit'` \| `'failed'`. Default `'active'`. |
| `joined_at` | TIMESTAMPTZ | NO | Default now(). |

**Unique:** `(challenge_id, user_id)` — one membership per user per challenge.  
**Indexes:** `challenge_id`, `user_id`.  
**RLS:** Members of the same challenge can read rows for that challenge (e.g. SELECT where challenge_id in (challenges I’m a member of)); insert/update per membership ownership.

### 3.3 New table: shared_goal_logs

For Shared Goal challenges only. Each row = one contribution (e.g. 5 miles logged).

| Column | Type | Nullable | Notes |
|--------|------|----------|--------|
| `id` | UUID | NO | PK, default uuid_generate_v4(). |
| `challenge_id` | UUID | NO | FK → challenges(id) ON DELETE CASCADE. |
| `user_id` | UUID | NO | FK → auth.users(id) ON DELETE CASCADE. |
| `amount` | NUMERIC | NO | e.g. 5. |
| `unit` | TEXT | NO | e.g. `'miles'` (should match challenge.shared_goal_unit). |
| `logged_at` | TIMESTAMPTZ | NO | Default now(). |
| `note` | TEXT | YES | Optional. |

**Indexes:** `(challenge_id, logged_at)`, `user_id`.  
**RLS:** Only members of the challenge can SELECT/INSERT (and update/delete only own row if needed).

### 3.4 active_challenges — no new columns

Team daily discipline: when the run starts, we create one `active_challenges` row per member with the same `start_at` (and same `end_at` from duration). “Same run” = same `challenge_id` and same `start_at`. No `team_run_id` column required for the minimal design.

### 3.5 check_ins — no change

Still keyed by `active_challenge_id` + `task_id` + `date_key`. Each team member has their own active_challenge and their own check_ins.

### 3.6 day_secures — no change

Per user, per date. Team logic uses “did every member secure this date?” by checking each member’s active_challenge’s check_ins (or day_secures) for that date.

---

## 4. RPC changes (Supabase / SQL)

### 4.1 join_challenge (behavior change + keep solo path)

**Current:** Always inserts one `active_challenges` + check_ins + streak upsert.

**New behavior:**
- If `challenges.participation_type = 'solo'` (or `'duo'` with single-join semantics): keep current behavior (insert active_challenge + check_ins, etc.).
- If `participation_type = 'team'` or `'shared_goal'`:
  - If `run_status = 'active'` or `'completed'` or `'failed'`: raise error (run already started or over).
  - If `run_status = 'waiting'`: insert into `challenge_members` (user_id, challenge_id, role = 'member' unless creator). Do **not** create `active_challenges` yet. If this was the Nth member and N = team_size, optionally auto-start (see 4.2). Return something that indicates “joined waiting team” (e.g. a synthetic or challenge_members row) so tRPC can return a consistent shape.

So the RPC needs to branch on `participation_type` and `run_status`. Solo path unchanged.

### 4.2 New RPC: start_team_challenge(p_challenge_id uuid)

- Allowed only when `participation_type` IN ('team','shared_goal') and `run_status = 'waiting'`.
- Caller must be creator (from `challenge_members` where role = 'creator') or optionally allow start when `COUNT(*) = team_size` (auto-start when full).
- Set `challenges.started_at = now()`, `challenges.run_status = 'active'`.
- **If participation_type = 'team'** (Daily Discipline): for each row in `challenge_members` for this challenge, insert one `active_challenges` row (user_id, challenge_id, start_at = started_at, end_at = started_at + duration_days, status = 'active', current_day = 1, progress_percent = 0). Then for each of those active_challenges, insert `check_ins` for every required `challenge_tasks` for today’s date_key (pending). No streak upsert here (streaks stay per user and are updated on first secure_day).
- **If participation_type = 'shared_goal'**: no active_challenges or check_ins; only started_at and run_status. Progress is tracked via shared_goal_logs and shared_goal_current.

### 4.3 secure_day (behavior change for team)

**Current:** One active_challenge_id; verify all required check_ins for today; update that user’s day_secures, streaks, active_challenge, profile.

**New behavior:**
- If this active_challenge’s challenge has `participation_type = 'solo'` (or duo with single-user run): keep current behavior.
- If `participation_type = 'team'`:
  - Perform the same “secure my day” for this user (day_secures, streaks, active_challenge.current_day, profile) as today.
  - Then: determine “run” by (challenge_id, start_at). Find all active_challenges with same challenge_id and start_at. For the same date_key (today), check if every one of those has “all required tasks completed” (same logic as current secure_day). If **all** have completed: no extra work (each already did their part when they called secure_day). If **any** has not completed and date_key is still “today,” do nothing (wait). If date_key is in the past and any member did not secure that day: set `challenges.run_status = 'failed'` and optionally set all members’ `active_challenges.status = 'failed'`. **When “day over” is evaluated** is defined in §9.1 (lazy on app open + optional cron).

So: **secure_day** stays per active_challenge_id; for team we add logic (in RPC or in tRPC) to (1) allow secure_day only when all required tasks are done (same as today), (2) after updating this user, optionally check “all members secured today?” and if yes advance all members’ current_day; and (3) have a way to set run_status = 'failed' when the day has passed and someone didn’t secure (cron or on-next-day check).

### 4.4 New RPC (optional): log_shared_goal(p_challenge_id uuid, p_amount numeric, p_unit text, p_note text)

- Check user is in challenge_members for this challenge; challenge is shared_goal and run_status = 'active'.
- Insert into shared_goal_logs (challenge_id, user_id, amount, unit, note). Do **not** update shared_goal_current in DB; derive as SUM(shared_goal_logs.amount) when needed (see §9.2).
- After insert, compute current total (SUM); if >= shared_goal_target, set run_status = 'completed'.
- If deadline_type = 'hard' and deadline_date < current_date and shared_goal_current < shared_goal_target, set run_status = 'failed'.

---

## 5. tRPC changes (backend only)

### 5.1 challenges.create

- **Input:** Add optional fields: `participationType` ('solo'|'duo'|'team'|'shared_goal'), `teamSize` (number 1–10), `sharedGoalTarget`, `sharedGoalUnit`, `deadlineType` ('none'|'soft'|'hard'), `deadlineDate` (ISO date string).
- **Behavior:** Insert into `challenges` with new columns (defaults: participation_type = 'solo', team_size = 1, run_status = null, started_at = null). If participation_type IN ('team','shared_goal'), set run_status = 'waiting' and insert one row into `challenge_members` (challenge_id, user_id = creator, role = 'creator', status = 'active').

### 5.2 challenges.getById

- **Response:** Include new challenge columns. If participation_type IN ('team','shared_goal'), optionally join or second query `challenge_members` (and for shared_goal, shared_goal_current, shared_goal_logs summary or count) so the client can show “waiting for N more” or “team list” or “progress bar.”

### 5.3 challenges.join

- **Behavior:** If challenge is solo (or duo with current “one join = one run”): call existing `join_challenge` RPC (unchanged). If challenge is team/shared_goal and run_status = 'waiting': call a **new** join path: insert into `challenge_members` only (and optionally auto-start when full). Do not call the existing join_challenge RPC for team when run is waiting. So backend either: (a) adds a new RPC `join_team_challenge` that only inserts challenge_members and returns a stub, or (b) extends `join_challenge` RPC to do the above. Prefer (b) in one RPC so tRPC `challenges.join` stays one call. So: **join_challenge RPC** is extended to handle team/shared_goal (insert challenge_members, optionally start when full); for team started run, “join” is no longer allowed.

### 5.4 New: challenges.startTeamChallenge

- **Input:** `challengeId` (uuid).
- **Behavior:** Call new RPC `start_team_challenge(challenge_id)`. Only creator (or system when full) can start. Returns updated challenge or run status.

### 5.5 New: challenges.getTeamMembers (or include in getById)

- **Input:** `challengeId`.
- **Behavior:** Select from `challenge_members` for this challenge (and optionally join profiles for display names). Protected: only members of the challenge can list.

### 5.6 New: sharedGoal.logProgress (or checkins.logSharedGoal)

- **Input:** `challengeId`, `amount`, `unit`, `note` (optional).
- **Behavior:** Call RPC `log_shared_goal` (or implement in tRPC: insert shared_goal_logs, update challenges.shared_goal_current, check completion/deadline). Protected.

### 5.7 checkins.secureDay

- No input change. Backend (or RPC) implements team logic: after securing caller’s day, if run is team and all members secured today, advance all members’ current_day; if day is past and any member didn’t secure, set run_status = 'failed'. Optionally add a small **evaluateTeamDay** RPC called by cron for “end of day” failure.

### 5.8 Quit / fail

- **New (optional):** `challenges.quitTeamChallenge` or update `challenge_members.status = 'quit'` and set `challenges.run_status = 'failed'` for team runs. Same for marking a member failed when they miss a day (could be done inside evaluate_team_day).

---

## 6. What stays the same (solo)

- **challenges:** Existing rows keep participation_type default 'solo', team_size 1, run_status/started_at null.
- **challenges.create:** Without new fields, create behaves as today (solo).
- **challenges.join:** For solo, RPC `join_challenge` behavior unchanged (one active_challenge + check_ins).
- **checkins.complete / secureDay:** For solo, same as today. Team branch only when challenge.participation_type = 'team'.
- **getActive / listMyActive:** No schema change; they still read active_challenges. Team members will have their own row per challenge with same start_at.

---

## 7. Migration order and files

1. **New migration:** e.g. `supabase/migrations/20250312000000_team_challenges.sql`
   - Add columns to `challenges` (participation_type, team_size, shared_goal_target, shared_goal_unit, deadline_*, started_at, run_status). Do not add shared_goal_current; derive from SUM(shared_goal_logs).
   - Create `challenge_members` table + indexes + RLS.
   - Create `shared_goal_logs` table + indexes + RLS.
2. **RPC migration:** e.g. `supabase/migrations/20250312000001_team_challenge_rpcs.sql`
   - Replace `join_challenge` with version that branches on participation_type/run_status.
   - Add `start_team_challenge(p_challenge_id uuid)`.
   - Add `log_shared_goal(p_challenge_id, p_amount, p_unit, p_note)`.
   - Optionally add `evaluate_team_day(p_challenge_id uuid, p_date_key text)` for “mark run failed if not all secured.”
   - Update `secure_day` to include team “all secured today” check and failure logic (or document that evaluate_team_day is called by cron).

Update **docs/MIGRATIONS.md** with the new files and order.

---

## 8. Summary: columns and tables

| Where | What |
|-------|------|
| **challenges** | + participation_type, team_size, shared_goal_target, shared_goal_unit, deadline_type, deadline_date, started_at, run_status. (shared_goal_current omitted; derive as SUM(shared_goal_logs.amount).) |
| **challenge_members** | New table: id, challenge_id, user_id, role, status, joined_at. Unique (challenge_id, user_id). |
| **shared_goal_logs** | New table: id, challenge_id, user_id, amount, unit, logged_at, note. |
| **active_challenges** | No new columns. |
| **check_ins** | No change. |
| **day_secures** | No change. |

**Existing tRPC to change:** challenges.create (add inputs + set run_status/challenge_members for team), challenges.getById (return new fields + members for team), challenges.join (call extended join_challenge).  
**New tRPC:** challenges.startTeamChallenge, challenges.getTeamMembers (or folded into getById), sharedGoal.logProgress (or checkins.logSharedGoal).  
**RPCs:** join_challenge (extend), start_team_challenge (new), log_shared_goal (new), secure_day (extend for team), optionally evaluate_team_day (new).

---

## 9. Design clarifications

### 9.1 When is “day over” enforced for team daily discipline?

**Chosen approach: lazy check on app open + optional cron.**

- **Lazy on app open:** When any user (member or not) loads data that depends on a team run — e.g. `challenges.getById`, `challenges.getTeamMembers`, `checkins.secureDay`, or a dedicated “team run status” query — the backend runs an **evaluate_team_day** step for that challenge and date: “For this team run and this date_key (e.g. yesterday), did every member secure?” If the date is in the past and any member did not secure, set `challenges.run_status = 'failed'` and optionally set all members’ `active_challenges.status` to `'failed'`. No cron is strictly required for correctness.
- **Optional cron:** To fail runs even when no one opens the app, a daily job (e.g. after midnight UTC or per timezone) can call `evaluate_team_day` for all active team runs and each “just finished” date_key. That way a run fails within ~24 hours of the missed day even if nobody opens the app.
- **If no team member opens the app for 2 days:** With **lazy only**, the run stays `active` until someone next opens the app and triggers the check; then we evaluate the missed day(s) and set `run_status = 'failed'`. With **cron**, the run is marked failed on the first midnight after the missed day. So: lazy = correct but possibly delayed; cron = fail promptly without any app open. Implementation can start with lazy only and add cron later.

### 9.2 How is shared_goal_current maintained?

**Derived from SUM(shared_goal_logs.amount), not updated per log.**

- **Option A (chosen):** Do not store `shared_goal_current` on `challenges` at all; whenever we need the current total (API response, completion check, deadline check), compute it as `SELECT COALESCE(SUM(amount), 0) FROM shared_goal_logs WHERE challenge_id = ?`. No race conditions, single source of truth. If we already added a `shared_goal_current` column, we can leave it unused or drop it, or use it as a cache updated by a single writer (e.g. only inside `log_shared_goal` under a row lock on the challenge).
- **Option B (rejected):** Update `challenges.shared_goal_current = shared_goal_current + p_amount` on every log. That requires a row lock on the challenge to avoid lost updates (race condition); doable but more error-prone.
- **Recommendation:** Treat current total as **derived**. In the RPC or tRPC that logs progress: after inserting into `shared_goal_logs`, run `SELECT SUM(amount) FROM shared_goal_logs WHERE challenge_id = p_challenge_id` (or use a subquery); if result >= shared_goal_target, set `run_status = 'completed'`. For `getById` and progress display, use the same SUM. If we keep a `shared_goal_current` column for performance, it is either a cached value updated under lock in the same transaction as the insert, or we remove it and always derive. The plan text above is updated to “derive only”; if we keep the column, document it as “optional cache, otherwise derive.”
- **Summary:** No per-log write to `challenges.shared_goal_current` without explicit locking; prefer deriving from SUM(shared_goal_logs) everywhere.

### 9.3 How does run_status interact with existing challenge status for solo?

**Solo ignores run_status entirely. Existing status fields are unchanged.**

- **challenges.status** (existing): Remains **template** visibility: `'published'` | `'draft'`. Meaning: “Is this challenge discoverable / joinable?” Unchanged for solo and team.
- **run_status** (new): Used **only** for team and shared_goal runs. For those, it is the run’s state: `'waiting'` | `'active'` | `'completed'` | `'failed'`. For **solo** challenges we never set or read `run_status`; it stays NULL. Solo “run” state lives only on **active_challenges.status**: `'active'` | `'completed'` | `'quit'`. So:
  - **Solo:** `challenges.run_status` = NULL always. “Is this user’s run active?” → `active_challenges.status = 'active'`. No code path for solo should read or write run_status.
  - **Team / shared_goal:** `challenges.run_status` = current run state. `active_challenges.status` still exists per member (and can be set to `'failed'` when the run fails). So we have two layers: challenge template (challenges.status), run state (run_status for team), and per-member participation (active_challenges.status).
- **Summary:** Solo uses only `active_challenges.status`; `challenges.run_status` is for team/shared_goal only and is ignored for solo.

---

Once you approve this plan, next step is implementing the migrations, TypeScript types for the new columns/tables, and the tRPC procedures (no UI).
