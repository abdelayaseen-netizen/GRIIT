# Chunk 09: First day and account

**Spec:** `part3-first-day-discover/` frames P3-01 to P3-09 and P3-13b. Checklist: Part 3 lines from "All 7 goal cards…" through "Code fields use oneTimeCode…".

**Why:**
- In build 90 only 4 of 13 brand-new users secured Day 1.
- The Faith card was hidden (11 taps).
- The Start here radio buttons were tapped 38 times: people thought selecting meant joining.
- One user was given Early Riser after its window had closed.
- The account form took about 4 minutes, with the password manager in the way.

## Items
- **09.1 Goals:**
  - All 7 cards are visible above the docked button on an SE.
  - Selected means filled plus a check icon. A 4th pick swaps out the oldest.
- **09.2 Start here:**
  - A Join button on every card, with no radio buttons.
  - One tap joins and opens the first task, with the toast "You're in. Day 1 is today."
  - The freeze line appears once.
- **09.3 Closed windows (server and client):**
  - Joining a challenge whose window has closed today sets Day 1 to tomorrow, and today isn't counted as missed.
  - "Day 1 is tomorrow at {time}" shows on the card, the challenge page and the join button.
  - It's never the first Start here card unless nothing else matches.
  - Use `lib/time-enforcement.ts` for the window rule. If it needs SQL, write it and STOP.
- **09.4 Account:**
  - Sign in with Apple first, then email with a 6-digit one-time code (no password field), and "Not now".
  - Code fields use `textContentType="oneTimeCode"`.
  - Supabase email OTP must be enabled and its template set to send the code. That's a dashboard change: STOP and list the exact steps for Yaseen. Build the client against it.
- **09.5 Guest save:** "Not now" keeps the guest's progress. Saving later carries the streak over.

**Areas:** onboarding v2 screens, `app/(auth)/`, `backend/lib/join-challenge.ts`, `lib/time-enforcement.ts`, auth hooks.

## Gates
- [ ] Maestro on an SE simulator: Welcome → goals (pick Faith and prayer) → Start here → Join → first task → Done → Day secured. Run 5 times with fresh accounts, 5 of 5 pass.
- [ ] A vitest at a fixed clock of 9:41: Fajr (window 5:00–6:30) is never first; joining it sets Day 1 to tomorrow; no missed day is recorded for today.
- [ ] An email OTP flow test against a stubbed or local Supabase, plus Yaseen's dashboard steps written out.
- [ ] Screenshots next to P3-01, P3-02, P3-04, P3-06 and P3-08.
- [ ] Chunk 01–09 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
