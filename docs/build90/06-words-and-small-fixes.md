# Chunk 06: Words people understand, plus small blockers

**Why:** 14 of 38 testers thought "secured" meant data encryption. Several small bugs also block or confuse people.

**Areas you may touch:**
- the finish and secured screens in `components/task-v2/**`
- `components/home/HomeV3.tsx` (greeting and feed hint)
- `lib/greeting.ts`
- the join sheet in Discover
- `app/auth/login.tsx`
- the guest save-account screens
- the freeze UI
- `components/create/v2/**` (step 1 only)
- the App Review login code
- seeded copy (via SQL in `docs/sql/build90.sql`)

## 06.1 Definitions where the thing happens
- **Day secured:** "Every task today is done. Your streak goes up by one."
- **Freeze:** the first time one is earned or used, say what it does in one line.
- **First self-reported task:** "You're telling us you did it. No photo needed."
- **The Strict label on the Join sheet:** "Miss a day and the streak resets."

## 06.2 "Self-reported" at most once per screen
- Today it appears up to three times on one task screen.

## 06.3 Greeting
- Fall back from display name, to username, to first name.
- Never show `@user_xxxxxxxx`.

## 06.4 Copy fixes
- "Workout everyday" becomes "Workout every day" in seeded content (SQL for Yaseen).
- The "Everyone is on until you follow 3 people" hint must not hide behind the tab bar.

## 06.5 Password label
- Tapping "Password" focuses the field (`app/auth/login.tsx` around line 219).

## 06.6 Guest "Save your streak"
- Stop the Account ↔ Go back loop.
- Skip reaches Home.

## 06.7 Freeze feedback
- "Use a freeze" shows a confirmation and the result, or says why it can't be used.

## 06.8 Create step 1
- The title field accepts typing and emoji normally.
- Double-tapping Continue can't skip a step.

## 06.9 App Review login
- Stays on the review account after the app is reopened.

## Gates
- [ ] Each definition shows at the right moment (screenshots)
- [ ] No screen shows "Self-reported" twice
- [ ] Greeting never shows a machine name
- [ ] 06.5–06.9 each have a passing Maestro flow
- [ ] Chunk 01–05 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
