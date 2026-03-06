# Product + Engineering Implementation Pass — Audit & Plan

## PART 1 — AUDIT

### CHANGE 1 — GRIT → GRIIT (branding)

| Location | Current | Action |
|----------|---------|--------|
| `app.json` | `"name": "GRIT"` | Change to "GRIIT" (display name) |
| `app/auth/login.tsx` | Logo text "GRIT" | Change to "GRIIT" |
| `app/auth/signup.tsx` | Logo text "GRIT" | Change to "GRIIT" |
| `app/create-profile.tsx` | Caption "GRIT" | Change to "GRIIT" |
| `app/(tabs)/index.tsx` | Logo "GRIT" | Change to "GRIIT" |
| `app/success.tsx` | Share message "on GRIT" | Change to "on GRIIT" |
| `app/(tabs)/profile.tsx` | Share "on GRIT" | Change to "on GRIIT" |
| `app/challenge/[id].tsx` | Share "Join me on GRIT" (3 places) | Change to "GRIIT" |
| `app/(tabs)/index.tsx` | Streak share "on GRIT" | Change to "GRIIT" |
| `backend/hono.ts` | Root message "GRIT API" | Change to "GRIIT API" (user-facing in health) |

**Intentionally left unchanged (per requirements):** `app.json` slug, scheme, bundleIdentifier, package; repo/folder names; env var names; package name; deep links.

---

### CHANGE 2 — Focus lock (timer stay-on-screen)

| File / flow | Current state | Gap |
|-------------|----------------|-----|
| `backend/trpc/routes/challenges.ts` | `strict_timer_mode` in taskStrictAndPhoto, only for type `timer` | Correct — not applied to run. |
| `backend/migration.sql` | `strict_timer_mode` column exists | OK. |
| `app/(tabs)/create.tsx` | Toggle "Require active timer (leaving resets progress)" → `strictTimerMode` | OK; label can be clearer. |
| `app/task/timer.tsx` | useFocusEffect + AppState reset when `strictTimerMode`; `setStrictResetMessage(...)` | **Bug:** `strictResetMessage` is never rendered in JSX. No pre-start warning. |

**Risks:** None. Run/workout tasks do not get strict_timer_mode in backend.

---

### CHANGE 3 — Challenge creation + success + feed

| File / flow | Current state | Gap |
|-------------|----------------|-----|
| `app/(tabs)/create.tsx` | handleCreate: validation, ref guard, trpcMutate('challenges.create'), then router.push('/success', params) | (1) Success screen expects daysCompleted, finalStreak — undefined when coming from create; (2) No confetti/create-specific celebration; (3) Submit button can flash back to enabled before navigate. |
| `app/success.tsx` | Uses params.challengeId, title, duration, tasksCount, difficulty, daysCompleted, finalStreak, isCompletion | When opened from create: daysCompleted/finalStreak undefined → "undefined/undefined" in stats. |
| Backend `challenges.create` | Inserts challenge + tasks, returns { ...challenge, tasks } | Returns snake_case (duration_days). Frontend uses challenge.duration_days — OK. |
| Visibility / feed | create uses visibility FRIENDS; backend inserts visibility lowercase | getFeatured returns public only. Created challenges (FRIENDS/PRIVATE) won’t appear in discover; they appear in “my challenges” / home if we show them. Documented. |
| Duplicate submit | createMutationPendingRef + submitStatus | Guard is correct; finally clears ref. Keep button disabled until navigate. |

**Root cause of “unreliable” create:** Likely network/timeout or missing .env; also success screen is built for completion, not create — confusing UX and possible undefined display.

---

### CHANGE 4 — Verification (photo / journal / timer)

| Area | Current state | Gap |
|------|----------------|-----|
| `check_ins` table | proof_url, note_text, value | Backend accepts proof and text. |
| `backend/trpc/routes/checkins.ts` | completeTask: inserts check_ins with value, note_text, proof_url | Does not enforce “photo required” or “min words” server-side. |
| Task types | timer → value (minutes); journal → note_text; photo → proof_url | UI should require the right input; backend should validate. |
| Starter/daily | Same completion flow | Verification types need to be enforced in API and UI. |

**Risks:** Adding strict validation can break existing flows if clients don’t send proof_url/note_text. Prefer: backend validates when task has require_photo_proof / min_words and returns BAD_REQUEST if missing.

---

### CHANGE 5 — Discover 10+ challenges

| Source | Current state | Gap |
|--------|----------------|-----|
| `backend/trpc/routes/challenges.ts` | getFeatured: DB query public + published; getStarterPack: source_starter_id not null | Seed has 10 challenges in seed.sql; no source_starter_id on them — starter pack empty unless separate seed. |
| `backend/seed.sql` | 10 challenges + tasks (no source_starter_id) | getFeatured returns these if seed was run. Many envs use migrations only — no challenges. |
| Discover page | Uses getFeatured + getStarterPack | If DB empty → 0 challenges. |

**Plan:** Add a migration that seeds 10+ public featured challenges (and optionally link some to source_starter_id for starter pack). Ensure discover always has at least 10 when DB is migrated.

---

## PART 2 — IMPLEMENTATION PLAN (prioritized)

1. **Challenge creation + success (CHANGE 3)** — Fix create flow; add create-success screen or param; prevent double submit; add celebration; ensure success shows correct copy for “just created”.
2. **Branding GRIIT (CHANGE 1)** — Replace all user-facing “GRIT” with “GRIIT” in app and backend health message.
3. **Focus lock (CHANGE 2)** — Timer: render strictResetMessage; add pre-start warning when strict; clarify create label.
4. **Verification (CHANGE 4)** — Backend: validate photo/journal/timer completion where required; frontend: ensure completion UI requires and sends proof/note/value.
5. **Discover 10+ (CHANGE 5)** — Migration to seed 10+ challenges; balance categories and difficulty; ensure getFeatured/getStarterPack return them.

---

## PART 4 — CONTENT / SEEDING (10+ DISCOVER CHALLENGES)

Migration `20250308000000_discover_challenges_seed.sql` adds **12** public featured challenges:

| Challenge | Duration | Difficulty | Category | Task type |
|-----------|----------|------------|----------|-----------|
| 5-Minute Morning Prayer | 7 days | Easy | Mind | timer (5 min) |
| 7-Day Gratitude Journal | 7 days | Easy | Mind | journal (30w) |
| 10-Minute Daily Focus Block | 14 days | Medium | Mind | timer (10 min) |
| Make Your Bed Every Day | 14 days | Easy | Discipline | manual |
| 2-Week Hydration Check | 14 days | Easy | Fitness | manual |
| 21-Day Reflection Sentence | 21 days | Easy | Mind | journal (10w) |
| 7-Day Digital Sunset | 7 days | Medium | Mind | manual |
| 14-Day 2-Minute Breath | 14 days | Easy | Mind | timer (2 min) |
| 30-Day 10K Steps | 30 days | Medium | Fitness | run |
| 21-Day Cold Shower | 21 days | Hard | Discipline | manual |
| 14-Day One Compliment | 14 days | Medium | Mind | manual |
| 30-Day Read 20 | 30 days | Medium | Mind | timer (20 min) |

**Balance:** Easy (6), Medium (5), Hard (1). Categories: mind (7), discipline (2), fitness (2). Mix of timer, journal, manual, run. No duplicate concepts; each is joinable and habit-forming.

---

## PART 5 — FINAL SUMMARY

### What changed

1. **Branding:** All user-facing "GRIT" → "GRIIT" (app name, auth, create-profile, home, success, profile share, challenge share, backend root message). Slug, scheme, bundle ID, package, env, repo left unchanged.
2. **Focus lock:** Timer screen shows reset banner when `strictResetMessage` is set; pre-start Alert when `strict_timer_mode` is on; create flow label clarified to "Require participants to stay on timer screen (resets if they leave)". Not applied to run/workout (backend only sets strict_timer for type `timer`).
3. **Challenge creation:** Create flow passes `isCreateSuccess: "true"` to success screen; success screen shows "Challenge created.", hide stats card, different recognition copy and share text; haptic on create success; duplicate submit still guarded by ref + status.
4. **Verification:** Backend `checkins.complete` validates: (a) photo required → proofUrl required; (b) journal with min_words → noteText word count >= min_words; (c) timer with duration_minutes → value >= duration_minutes.
5. **Discover:** New migration seeds 12 public featured challenges with tasks. Run migration so getFeatured returns at least 10.

### Manual follow-up

- Run Supabase migration: `20250308000000_discover_challenges_seed.sql` (and any prior migrations if not already applied).
- If using existing seed.sql for local DB, note it uses non-UUID challenge ids; the new migration uses UUIDs and ON CONFLICT (id) DO NOTHING for challenges.
- Created challenges (visibility FRIENDS/PRIVATE) do not appear in discover; they appear in the creator’s home/active list. No change to that behavior.

### Testing recommendations

- Create challenge end-to-end: submit → success screen with "Challenge created." and share.
- Timer: enable "Require participants to stay on timer screen", start timer, leave screen → return and see reset banner; start again with pre-start warning.
- Complete a journal task with &lt; min_words → expect BAD_REQUEST; with enough words → success.
- Run migration, open discover → at least 10 challenges visible (featured + more).
