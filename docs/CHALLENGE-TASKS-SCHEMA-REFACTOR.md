# Challenge Tasks Schema Refactor — Backend

Real schema for `public.challenge_tasks`: **id**, **created_at**, **challenge_id**, **title**, **task_type**, **order_index**, **config** (JSONB).  
No flat columns: ~~type~~, ~~required~~, ~~duration_minutes~~, ~~min_words~~, ~~photo_required~~, ~~require_photo_proof~~.

---

## A. Audit of affected files/functions

| File | Function / area | What it did | Change |
|------|------------------|-------------|--------|
| **backend/trpc/routes/checkins.ts** | `complete` | Selected `id, type, photo_required, require_photo_proof, min_words, duration_minutes`; validated proof, journal min_words, timer duration | Select `id, task_type, config`. Use `getTaskVerification(taskRaw)` for needsProof, minWords, durationMinutes; validate using task_type and those values. |
| **backend/trpc/routes/checkins.ts** | `complete` (progress) | Selected `id, required` from challenge_tasks; filtered required tasks | Select `id, task_type, config`. Filter required with `isTaskRequired(t)`. |
| **backend/trpc/routes/checkins.ts** | `secureDay` (fallback) | Selected `challenge_tasks (id, required)`; filtered by `t.required` | Select `challenge_tasks (id, task_type, config)`. Filter with `isTaskRequired(t)`. |
| **backend/trpc/routes/challenges.ts** | `list` | Returned `challenge.challenge_tasks` as-is | Map with `mapTaskRowsToApi(challenge.challenge_tasks)` before return. |
| **backend/trpc/routes/challenges.ts** | `getFeatured` | Same | Same mapping. |
| **backend/trpc/routes/challenges.ts** | `getStarterPack` | Selected `challenge_tasks (id, title, type, required, duration_minutes, min_words)` | Select `challenge_tasks (id, title, task_type, order_index, config)`. Map with `mapTaskRowsToApi`. Dropped short_hook, theme_color, duration_type from challenges select. |
| **backend/trpc/routes/challenges.ts** | `getById` | Returned `data.challenge_tasks` | Map with `mapTaskRowsToApi(data.challenge_tasks)`. |
| **backend/trpc/routes/challenges.ts** | `getActive` | Returned `data` with nested `challenges.challenge_tasks` | After query, set `data.challenges.challenge_tasks = mapTaskRowsToApi(...)`. |
| **backend/trpc/routes/challenges.ts** | `create` | Inserted flat columns (type, required, min_words, duration_minutes, photo_required, etc.) into challenge_tasks | Build payload with `buildTaskInsertPayload(task, challenge.id, i)` (task_type + config). Insert that. Return `mapTaskRowsToApi(tasksRaw)`. |
| **backend/trpc/routes/starters.ts** | `join` | Selected `challenge_tasks (*)`; used `tasks[0].id` for check_ins | No change: raw rows still have `id`. Tasks not returned to client. |
| **supabase/migrations/20250307000000_secure_day_rpc.sql** | `secure_day` RPC | `WHERE ct.required = true` | RPC uses flat column. New migration **20250309000000_secure_day_challenge_tasks_config.sql** redefines `secure_day` to use `COALESCE((ct.config->>'required')::boolean, true) = true`. |
| **backend/types/db.ts** | `ChallengeTaskRow` | `{ id, required }` | Left as-is for type refs; actual required now derived from config in code. |
| **backend/lib/challenge-tasks.ts** | (new) | — | Central helpers: raw row type, API shape, `mapTaskRowToApi`, `mapTaskRowsToApi`, `isTaskRequired`, `getTaskVerification`, `buildTaskConfigFromInput`, `buildTaskInsertPayload`, `toTaskType`. |

---

## B. Code changes made

1. **backend/lib/challenge-tasks.ts** (new)  
   - `ChallengeTaskConfig`, `ChallengeTaskRowRaw`, `ChallengeTaskApiShape`.  
   - `mapTaskRowToApi` / `mapTaskRowsToApi`: DB row → API shape (type, required, duration_minutes, min_words, photo_required, require_photo_proof, strict_timer_mode).  
   - `isTaskRequired(row)`, `getTaskVerification(row)`, `getTaskType(row)`.  
   - `buildTaskConfigFromInput`, `buildTaskInsertPayload`, `toTaskType` for create.

2. **backend/trpc/routes/checkins.ts**  
   - complete: select `id, task_type, config`; use `getTaskVerification` and `task_type` for validation.  
   - complete: allTasks select `id, task_type, config`; required via `isTaskRequired`.  
   - secureDay fallback: select `challenge_tasks (id, task_type, config)`; required via `isTaskRequired`.

3. **backend/trpc/routes/challenges.ts**  
   - list, getFeatured, getById: return `tasks: mapTaskRowsToApi(challenge_tasks)`.  
   - getStarterPack: select challenge_tasks with `task_type, order_index, config`; return mapped tasks; challenges select no short_hook/theme_color/duration_type.  
   - getActive: after load, set `challenges.challenge_tasks = mapTaskRowsToApi(...)`.  
   - create: `tasksToInsert = input.tasks.map((task, i) => buildTaskInsertPayload(...))`; insert into challenge_tasks; return `tasks: mapTaskRowsToApi(tasksRaw)`.

4. **supabase/migrations/20250309000000_secure_day_challenge_tasks_config.sql**  
   - Replaces `secure_day` so required tasks are those with `COALESCE((ct.config->>'required')::boolean, true) = true`.

---

## C. Mapping strategy (DB → API)

- **task_type** → **type** (same value; frontend expects `type`).  
- **config.required** → **required** (default true if missing).  
- **config.duration_minutes** → **duration_minutes**.  
- **config.min_words** → **min_words**.  
- **config.photo_required** / **config.require_photo_proof** → **photo_required**, **require_photo_proof**.  
- **config.strict_timer_mode** → **strict_timer_mode**.  
- **order_index** passed through.  
- **id**, **title** unchanged.

All reads from `challenge_tasks` that need to expose tasks to the frontend go through `mapTaskRowsToApi` so the API shape stays the same.

---

## D. Remaining manual follow-up

1. **Run migration**  
   Apply `20250309000000_secure_day_challenge_tasks_config.sql` so `secure_day` uses `config` for required.

2. **Challenges table**  
   getStarterPack no longer selects `short_hook`, `theme_color`, `duration_type`. If your `challenges` table lacks those columns, the rest of the challenges select is already compatible. If other routes still select them, update or drop those columns from selects as needed.

3. **join_challenge RPC**  
   Still only inserts from `challenge_tasks` (task ids); it does not read `required`. No change.

4. **Frontend**  
   No change required; backend returns the same task shape (type, required, duration_minutes, min_words, etc.) via mapping.

---

## E. Testing steps

1. **Challenge creation**  
   Create a challenge with timer, journal, and manual tasks. Confirm tasks are stored with `task_type` and `config` in DB. Confirm the create response includes `tasks` with `type`, `required`, `duration_minutes`/`min_words` where applicable.

2. **Starter pack**  
   Call `challenges.getStarterPack`. Confirm each challenge has `tasks` array with `type`, `required`, and other expected fields.

3. **Verification (checkins.complete)**  
   - Photo: task with `config.require_photo_proof` or `config.photo_required`; complete without proof → BAD_REQUEST; with proof → success.  
   - Journal: task with `config.min_words`; complete with fewer words → BAD_REQUEST; with enough words → success.  
   - Timer: task with `config.duration_minutes`; complete with lower value → BAD_REQUEST; with enough minutes → success.

4. **secureDay**  
   With migration applied: secure day when all required tasks (from `config.required`) are completed → success. When RPC is used, required is read from config.

5. **Discover / getFeatured**  
   Load discover; confirm featured challenges show tasks with correct type and details (mapped from config).

6. **getActive**  
   With an active challenge, call getActive; confirm `challenges.challenge_tasks` has `type`, `required`, etc., and that the timer screen can read e.g. `strict_timer_mode` from the mapped task.
