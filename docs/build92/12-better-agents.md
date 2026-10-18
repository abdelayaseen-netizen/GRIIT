# Chunk 12: Better test agents

**Branch:** commit the harness work on `feat/agent-testers` (separate from the app). App code doesn't change in this chunk.

**Why:** build 90's testers were too weak to trust:
- Haiku 4.5 looped on the same screen in 34 of 40 sessions.
- They couldn't type a journal past one sentence, and refused curse words.
- They never liked, commented or opened a profile.
- Every one was on Day 1, so streaks, freezes and returning on Day 2 were never tested.

## Items
- **12.1 Stronger personas:**
  - Personas run on Claude Sonnet 5.5. The first-day group runs on Claude Opus 5.5.
  - Model ids come from config, not code.
  - Keep a cost cap per run (default $60) and stop cleanly when it's reached.
- **12.2 A "be a person" rule:** after 2 taps on the same target with no change, the persona must try something different (scroll, dismiss the keyboard, go back, or another control), and record "stuck: {why}". The harness stops the session after 3 stuck notes on one screen.
- **12.3 Scripted checks** (Maestro, not the AI) for what the AI can't or won't do:
  - long journal typing (fix appending to a multiline field)
  - curse words in username, bio, caption, comment and challenge title, which must be blocked
  - offline posting with a network conditioner
  - **Strava:** a stubbed webhook event completes a run task
- **12.4 New persona groups:**
  - **History:** a seeded account with 30+ days, 25 posts, a freeze and a left challenge. It opens the profile, scrolls posts and checks the numbers against Home.
  - **Social pairs:** they must like, double-tap and comment on each other's proofs, open each other's profiles and accept an invite.
  - **Day 2:** a session the next simulated day (clock advanced) for 6 users from the day before. Did they come back, keep the streak, see the freeze?
- **12.5 Report:**
  - Per-screen time and wasted taps (the build 90 `screens.csv` format).
  - "App bug" vs "agent stuck" tagged on every session end.
  - The main number: new users who secure Day 1. Also Day-2 return, social actions per pair, cold start time, and the 3-word quiz.

## Gates
- [ ] A dry run of 3 sessions (one from each new group) completes with the report written.
- [ ] Scripted checks run green against build 91 for things that already work, and show the known failures for things build 92 fixes.
- [ ] The cost of the dry run is printed, along with the projected full-run cost.
- [ ] Committed on `feat/agent-testers`, pushed. PROGRESS updated on `feat/build92`.
