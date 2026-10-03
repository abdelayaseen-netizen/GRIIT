# Overnight 2026-10-03 — fix/streak-truth

No merge, no deploy, no SQL, no migration applied. `20261003040000_profiles_server_columns_secure_day.sql` was not edited.

`npx tsc --noEmit` was clean before every commit below. Vitest was green before every commit. `.gitignore` ignores `audit/`, so this file is committed on its own.

## Items

### 1. total_days_secured recounts — done

Commit `dd05840e`. Tests: 246 files, 1357 passed.

`checkins.secureDay` writes `profiles.total_days_secured` from a service-role `COUNT` of that user's `day_secures` rows, and sets `tier` with the existing bands (Starter / Builder / Relentless / Elite). The write runs only when this secure is new. A stored value of 3 with 12 `day_secures` rows becomes 12 and Builder. A second secure the same day does not write.

### 2. Service-role key visible at boot — done

Commit `ef97e502`. Tests: 247 files, 1358 passed.

`backend/server.ts` logs one error, `[boot] ERROR missing …`, naming `EXPO_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or both. The process does not exit. Nothing else in boot changed.

### 3. G2a tells the truth — done, with 3a skipped

Commit `0fa73079`. Tests: 248 files, 1363 passed.

**3a skipped.** Both functions stay. `scheduleNextSecureReminder` has no call sites (the definition is `lib/notifications.ts:124`; `lib/g2a-notifications.test.ts` only asserts the scheduler does not contain the name). `eveningSecureCopy` still has callers:

- `lib/notifications.ts:141` and `:173`, inside `scheduleNextSecureReminder`
- `lib/evening-secure.test.ts`
- `lib/notification-due-count.test.ts`

**3b done.** A successful check-in and a secure call `scheduleG2aForUser`, which refetches active challenges and today's check-ins, cancels today's G2a pair, and schedules the new plan. A secured day schedules nothing for today.

**3c done.** `planG2aAhead` leaves a day empty when that day's remaining count is 0. An evening body that starts with "0 task" or "0 tasks" is not queued.

**3e done.** Tests cover a check-in dropping the evening count from 2 to 1, secure cancelling today's identifiers, and a 0 count scheduling nothing.

### 4. This report — this commit

## 3d. Server evening pushes (no code change)

No server sender is named Chunk P. The only server evening push is the hourly cron `GET /api/cron/send-reminders` → `runReminderCron` → `shouldSendStreakAtRiskReminder` → `sendSecureReminder` with type `streak_at_risk`. `getStreakAtRiskCopy` is the copy that is sent. The `EVENING_TEMPLATES` array in `backend/lib/push-reminder.ts` is built and then replaced.

| | |
|---|---|
| Time | 20:00–20:59 in `profiles.timezone`, else `reminder_timezone`, else UTC. The cron is hourly, so it sends once inside that hour. |
| Skip | `reminder_enabled` is not true. Token missing or not an Expo push token. A `day_secures` row exists for the user's today. Local minutes outside `[20:00, 21:00)`. Timezone formatting throws. |
| Copy, streak 0 | Title: "First day. Don't break it before it starts." Body: "30 seconds is enough. Mark today and begin." |
| Copy, streak 1–6 | Title: "{n} days. Don't lose it tonight." Body: "You're closer to a habit than you think. Mark today before midnight." |
| Copy, streak 7–29 | Title: "{n}-day streak at risk." Body: "You earned this. Don't give it back. Even a minimum day keeps it alive." |
| Copy, streak 30+ | Title: "{n} days. This is who you are now." Body: "Don't let one night undo it. Mark today before midnight." |

The same cron also sends a morning reminder at the user's `reminder_time` (default 09:00) for the following hour, and a comeback push when the UTC hour is 10–20 inclusive. Comeback is not an evening-local reminder. It skips a bad token, a comeback push in the last 7 days, and a last secure fewer than 3 calendar days ago in the user's timezone.

G2a local evening is 20:00 on the device clock (`Date.setHours`), not the profile timezone. The other G2a slots are 45 minutes before the earliest window close, and 07:00. At most two per day. Today is empty when the day is secured or the remaining count is 0.

A user can get the server 20:00 push and a G2a local notification on the same evening. That happens when the day is not secured, today's remaining count is above 0, reminders are enabled, the token is valid, and the cron runs during the profile timezone's 20:00 hour while a G2a notification is still queued (the 20:00 slot, or a window-close warning that falls in the evening). The two clocks can disagree when the device timezone and `profiles.timezone` differ. A secured day gets neither. A remaining count of 0 gets no G2a today, and the server push can still fire because it only looks at `day_secures`.

No server sender was deleted or changed.

## Would have stopped

- **3a.** `eveningSecureCopy` has callers, so neither legacy function was deleted. `scheduleNextSecureReminder` itself has no call sites.
- **3d.** The server streak-at-risk push and a G2a local can both fire on the same evening. Left the server sender as it is.
- **Prod `secure_day` diff.** The production function body was never in the message (it still said `<paste CSV here>`). The migration file is unchanged and unapplied.
