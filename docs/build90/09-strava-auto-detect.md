# Chunk 09: Strava auto-detect (flag `STRAVA_AUTO_VERIFY`, off by default)

**Why:** Yaseen wants a run logged in Strava to count in GRIIT automatically, without opening GRIIT. Then the user chooses whether to post it.

**What already exists:**
- `backend/lib/strava-*.ts`
- `backend/trpc/routes/integrations.ts`
- `verifyStravaTaskCompletion` and `activityMatchesRule` in `backend/lib/strava-verifier.ts`
- verification today only runs when the user asks

**Areas you may touch:**
- `backend/lib/strava-*.ts`
- `backend/trpc/routes/integrations.ts`
- a new webhook route under `app/api/` or the backend router
- `lib/feature-flags.ts`
- the task create and edit screens (verification option only)
- notification sending for this event

## 09.1 Webhook
- Add the endpoint `/api/strava/webhook`:
  - a `GET` handshake (`hub.challenge`)
  - a `POST` for events
- **On an activity create event:**
  - fetch the activity
  - match it against the user's active tasks for that date using `activityMatchesRule`
  - complete the matching task with verification `strava`
  - secure the day if it was the last task (use the single-call path from chunk 01)
- **Idempotent:** the same Strava activity id never completes twice. Store processed ids. If that needs a table, write the SQL and STOP.
- **Tests:** a valid event completes once; a repeat event does nothing; a non-matching activity does nothing.

## 09.2 Notification
- Text: "Strava run logged. Morning run is done for Day 2."
- Opening it shows the post-or-private choice from chunk 04.

## 09.3 Task setting
- On run and ride tasks, offer "Verify with Strava" (only if connected) or "Self-reported."
- A verified completion shows "Verified by Strava" once, in place of "Self-reported."

## 09.4 Registering the webhook
- Registration is a one-time Strava API call, not a Railway setting.
- Put the exact curl command in the report, with placeholders for the client id and secret, for Yaseen to run himself.
- Never commit or print the secret.

**Not in this chunk:** Apple Health, Garmin and WHOOP. Apple Health needs a native HealthKit module, a permission screen and extra App Store review, so it gets its own build after 90. Garmin and WHOOP both sync workouts into Apple Health, so that later build covers them too.

## Gates
- [ ] Webhook handshake and event tests pass
- [ ] Repeat events don't double-complete
- [ ] With the flag off, nothing changes for users
- [ ] The curl registration command is in the report, with no secret in the repo
- [ ] Chunk 01–08 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
- [ ] STOP: tell Yaseen the backend needs `railway up --service grit-backend`, and list any SQL to run first
