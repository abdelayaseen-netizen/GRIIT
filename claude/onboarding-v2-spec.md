# GRIIT Onboarding v2 — Build Spec

**Decision:** finish v2 and flip `FLAGS.ONBOARDING_V2` to `true`.
**Reality check (2026-08-30):** v2 is a mockup shell, not a finished flow. One real integration (Account → anon upgrade). No join, no goal filtering, no back buttons, no step persistence, no Profile screen. Flipping the flag today would ship broken onboarding.
**Voice:** blunt, short, no cheerleading. No exclamation marks.

---

## Locked decisions — build law

1. **Order:** challenge before account; reminders after challenge; profile last.
2. **Paywall is out of the core flow.** See below.
3. **Commitment is a day target** (7/30/75/custom). **Standard/Hard survives** as a separate per-challenge setting — see below.
4. **Identity-taken:** log them in, then merge — or state plainly on-screen that guest progress stays on this device.
5. **Any skip sets `onboarding_completed = true`.** Nobody gets trapped.
6. **Keep the better existing copy.** See the copy note.

## Paywall — removed from onboarding

Delete the paywall insert at `OnboardingFlowV2.tsx:66–72`. Asking for money before someone has completed a single day is asking before you've delivered anything, and the free tier already allows 3 challenges — so the onboarding paywall upsells against a user who hasn't seen value yet.

Move the trigger to either of these, whichever is easier:

- They try to join a 4th challenge (the existing free-tier limit — natural, earned, already messaged in the UI)
- After their first posted proof, as a soft card on Home, not a blocking modal

## Commitment — two settings, two homes

They are different things and got conflated. Split them.

**Day target → onboarding screen 5.** How long are you committing to. Drives "Day 3 of 30" on Home.

**Standard vs Hard → per-challenge setting.** This controls difficulty or verification strictness; it belongs next to a challenge, not in a one-time flow. Cursor should propose where it lives based on the schema — most likely on the participant row at join time, with a default of Standard, editable from the challenge screen. Do not lose it; it's a real feature.

## Routing — who sees onboarding at all

`profiles.onboarding_completed` **already exists** (migrations + `AuthRedirector` in `app/_layout.tsx`). The gaps are in v2's use of it.

| Session | `onboarding_completed` | Where they land |
|---|---|---|
| Real account | true | **Home.** Never show onboarding. |
| Real account | false | Resume at the step they left |
| Anon (guest) | true | **Home**, guest state intact — *not cleanly modeled today* |
| Anon (guest) | false | Resume at the step they left |
| None | — | Welcome |

**v2 step state is `useState("welcome")`** — it does not persist. The old flow persists a numeric `currentStep`; v2 must do the same or resume is impossible.

Guest sessions are device-local. A reinstall wipes them; that person is "None" and starts over. Say so on the account screen.

## Screen order — target

| # | Screen | Status today | Work |
|---|---|---|---|
| 1 | Welcome | Exists, login link works | Copy only |
| 2 | Goals | Exists, Zustand only | **Persist + drive screen 6** |
| 3 | WhyProof | Exists | Add labeled skip |
| 4 | WhyCircle | Exists | Add labeled skip |
| 5 | Commitment | Wrong product (Standard/Hard) | **Rebuild as day target** |
| 6 | FirstChallenge | Hardcoded scaffold | **Rebuild: filter + join + anon** |
| 7 | Reminders | Exists, wrong position | Move; add time picker |
| 8 | Account | Wired, wrong position | Move; skip copy; identity gap |
| 9 | Profile | **Missing** | Build, or adapt old `ProfileSetup` |

Current code order is welcome → why_proof → why_circle → goals → commitment → reminders → account → paywall → first_challenge. Replace `ORDER` at `OnboardingFlowV2.tsx:37–46`.

---

## Screen detail

### 1. Welcome
Keep the existing structure and the `onHaveAccount` → `/auth/login` link — that requirement is already met. On login success: Home if `onboarding_completed`, else resume mid-flow.

### 2. Goals
Pick up to 3. Continue disabled until ≥1. **Persist to the profile / anon profile**, not just Zustand — resolves the TODO at `GoalsScreen.tsx:9`. This is the input to screen 6.

### 3. WhyProof / 4. WhyCircle
Keep as is, add an explicit skip affordance.

### 5. Commitment — rebuild

> **Set your line.**
>
> How many days are you committing to? You can change it later — but you'll have to change it on purpose.
>
> **7 days** — Starting · **30 days** — Serious · **75 days** — All in · Custom
>
> **[ Lock it in ]**

Store as target streak. Surface on Home as "Day X of Y" or the screen is decoration.

### 6. FirstChallenge — rebuild

Three suggestions **filtered by the goals from screen 2**, plus Browse all and Skip for now. Replace the hardcoded "30-day reset."

On Join: `ensureAnonymousSession()` → join the challenge → continue. **No account required.** This is the entire point of the last sprint; today v2 calls `completeOnboardingV2()` and never joins anything.

### 7. Reminders
Permission prompt already lives here — good, keep it. Add a time picker. Move to position 7.

### 8. Account

> **Save your streak.**
>
> You're in. Create an account so your proof, streak and challenges survive this phone.
>
> **[ Continue with Apple ]** · or use email
>
> Have an account? **Log in**
> Skip — I'll risk losing my progress

**Identity gap** — the three cases the uncommitted tests document:

- **Email already has an account:** "That email already has a GRIIT account. Log in and we'll bring today's progress with you." Log in, then merge the anon session's joins and proofs. If merge is deferred for v1, still log them in and say plainly that guest progress stays on this device. Never silently drop it. Today this is an error string with no path forward.
- **Typo'd email:** show the address back before submitting — "We'll confirm at `yaseen@gmial.com` — correct?" — and keep the account screen reachable from Settings.
- **Malformed:** inline validation on blur.

Commit the tests once these are decided in code.

### 9. Profile — build
Adapt the old `ProfileSetup` rather than writing new. Photo, username, display name, bio, all skippable.

**Greeting fallback:** display name → username → first name. Never the literal string "User."

On continue or skip: `onboarding_completed = true`, hand off to Home with the first-proof CTA visible.

---

## Copy note — don't rewrite what's already better

The existing v2 copy is stronger than my draft in places. **"Discipline, witnessed."** and **"Streaks are easy to fake"** are better lines than what I wrote. Keep them. The copy pass is a light polish for consistency, not a rewrite — treat it as the smallest slice, not a real one.

## Cross-cutting

- **No back handlers exist anywhere in `v2/`.** Add them to every screen.
- **Kill the unknown-step placeholder** at `OnboardingFlowV2.tsx:107–110` — route to the next valid screen instead.
- **Persist the step key** so a cold start resumes in place.
- Progress indicator: dots, no "of 9." Number only the required screens if numbering at all.
- No dead ends on any skip path.

## Build order

Ship in three chunks, device-testing between each. Do **not** run all eight slices in one pass — this is an unfinished flow and a single large diff will be undebuggable.

**Chunk A — make it function**
1. Orchestrator: new `ORDER`, persist step, back handlers, kill placeholder, remove paywall insert
2. Routing: AuthRedirector matrix for anon × completed; complete-on-skip
3. Goals → FirstChallenge: persist goals, filter suggestions, join + `ensureAnonymousSession`

*Stop. Build to device. Verify a guest can get from Welcome to a joined challenge.*

**Chunk B — make it complete**
4. Commitment day target + Home "Day X of Y"; relocate Standard/Hard to per-challenge
5. Account: copy, skip, email confirm, identity-taken path; commit the tests
6. Profile screen + handoff; greeting fallback

*Stop. Build to device. Verify the full nine and the guest→account upgrade.*

**Chunk C — ship**
7. Light copy pass
8. Flip `ONBOARDING_V2`; TestFlight

## Definition of done

1. Signed-in user reopening the app lands on Home, never sees onboarding
2. "Log in" on Welcome takes a returning user straight to Home
3. Someone who quit mid-flow resumes where they left off
4. Goals selection demonstrably changes the suggestions on screen 6
5. A guest can finish onboarding, join a challenge and post proof with no account
6. That guest can later create an account and keep their streak
7. All three identity-gap cases behave as specced, tests committed
8. No paywall anywhere in the nine screens
9. Standard/Hard still reachable, per challenge
10. Notification prompt on Reminders only
11. `FLAGS.ONBOARDING_V2` flipped to `true`
12. Verified on a real device build, not simulator
