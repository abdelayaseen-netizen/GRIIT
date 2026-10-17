# Chunk 01b: Server save speed and request budget

**Why:**
- Chunk 01 made the screen instant, but the server still takes about 6 s to save a photo task (`completeTask` median 6056 ms on the simulator). Friends see posts late, and a failed save only shows after the wait.
- Chunk 04 found a full flow uses 74–79 of the 100 requests allowed per minute, mostly in sign-up and join: `home.bootstrap` 4 times in the first 2 s, `profiles.update` twice. A new user on a weak signal with retries can still hit the limit.

**Areas you may touch:**
- `backend/trpc/routes/checkins.ts`
- `backend/lib/finish-bundle.ts`
- `backend/lib/*-verification.ts` (query shape only)
- the onboarding and join client code that fires requests
- `lib/home-bootstrap-refresh.ts`
- `hooks/`

## 01b.1 Measure the server
- Add per-step timing inside `checkins.complete`: each Supabase query, storage call and secure-day step. Use server logs only, no client changes.
- Run 5 photo and 5 self-reported finishes. Put a table of where the time goes in `docs/reports/build90.md`.
- Check the network distance too: record Railway's region, Supabase's region, and the round-trip time of one trivial query from Railway.

## 01b.2 Cut the slow steps
Fix what the measurement shows. Likely causes:
- queries in a loop (N+1)
- queries that could run in parallel (`Promise.all`)
- re-reading rows already in hand
- a missing index (write the SQL to `docs/sql/build90.sql` and STOP for Yaseen)
- sync work that could happen after the response (feed fan-out, notifications)

**Target:** server median under 1.5 s for both task types.

**If the main cost is the distance between Railway and Supabase:** say so with numbers and stop. Moving regions is a settings change for Yaseen, not code.

## 01b.3 Request budget in sign-up and join
- Remove duplicate requests in onboarding and join: `home.bootstrap` should load once after sign-in; `profiles.update` once.
- **Target:** a full fresh-user flow (Welcome → join → first task → post) uses under 50 requests in its busiest minute.
- **Test:** a request-count test like `lib/build90-finish-requests.test.ts`, plus a Maestro run with the request log.

## Gates
- [ ] Before and after server timing tables (per step) in the report
- [ ] Server median under 1.5 s for photo and self-reported finishes, or proof that the remaining cost is network distance
- [ ] Busiest minute of a fresh-user flow is under 50 requests
- [ ] Zero 429 responses in 5 runs of the full flow
- [ ] Chunk 01–09 tests still pass
- [ ] `npx tsc --noEmit`: 0 new errors
- [ ] Backend deployed (write HEAD to `backend/deploy-sha.txt`, `railway up --service grit-backend`), /api/health shows the sha
- [ ] PROGRESS.md updated (add a row for 01b), committed, pushed
