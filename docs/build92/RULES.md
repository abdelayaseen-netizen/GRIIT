# Build 92 rules (apply to every chunk)

## Model
Only Claude Fable or Claude Opus may write code for build 92. Any other model stops immediately (see RUNNER). If the model changes mid-chat, stop, commit nothing, and report.

## Branch and setup
- Work on branch `feat/build92`.
  - If it doesn't exist, create it from the tip of `origin/feat/build90`.
  - Print `git branch --show-current` and `git rev-parse --short HEAD` before any code.
- Before any Maestro run: `export JAVA_HOME=/opt/homebrew/opt/openjdk`. Use a fresh is_test account per flow. Never wait out a 429.
- Yaseen runs `caffeinate -dimsu` in its own terminal tab.

## Design (the spec)
- The spec is `design/handoff/b92/`:
  - The top-level `README.md` holds the locked decisions and the combined checklist.
  - Each part folder holds its README, its RN source and its prototype (`atlas/*.dc.html`).
- The handoff RN source is a reference. Port it into the app's real structure: existing DS_V3 primitives, `DS_COLORS_V2`, `ROUTES`, `TRPC` constants. Map assumed token names to the shipped ones and note each mapping in the report.
- For anything b92 doesn't cover, `design/GRIIT-v53.1-ONLY.md` still applies.
- Copy comes from the part README copy tables, word for word. Copy rules: no exclamation marks, no motivational lines, sentence case, "likes" not "respects".
- Orange appears in 4 places only: the #BB471D primary fill, the flame, the #DC5401 done check, the active tab.
- Don't restyle anything the chunk doesn't name.

## Every item, in this order
1. **Root cause** (bugs) or **design reference** (new UI): write the file, line and reason, or the frame IDs and checklist lines, in `docs/reports/build92.md` before changing code.
2. **Failing test.** Write a Maestro flow (UI) or a vitest test (logic) that FAILS on the current code. Save its output or screenshot.
3. **Change.** Make the smallest change that meets the spec.
4. **Passing test.** The same test now PASSES. Save its output or screenshot.
5. **Screenshot vs frame.** For UI items, take a simulator screenshot on iPhone SE (3rd gen) and iPhone 16 Pro Max next to the design frame ID. Save both to `docs/reports/build92/<chunk>/`.
6. **Typecheck.** `npx tsc --noEmit` shows no new errors (baseline: 5).
7. **Record.** Add the item to `docs/reports/build92.md`.

## Scope fence
- Touch only what an item needs. If a change needs a file outside the chunk's areas, say why in the report.
- Never delete or rewrite working features you weren't asked to change. Never refactor for style.

## Backend and data
- Never change Railway or Supabase settings, dashboards or auth providers. List what Yaseen must change under "needs Yaseen".
- Code deploys with `railway up --service grit-backend` are allowed only in chunks that say so:
  - First write HEAD to `backend/deploy-sha.txt`.
  - Then confirm `/api/health` shows the sha.
- Write all SQL to `docs/sql/build92.sql` with a comment naming the chunk and item. Never run SQL against prod. Yaseen reviews it with Claude and runs it.
- New server behaviour must keep build 91 working. Add fields and procedures; don't break existing ones.
- Never put keys or secrets in the repo, logs or chat.

## Pre-authorized decisions (don't stop to ask)
- Everything in the "Locked decisions" section of `design/handoff/b92/README.md`.
- **Freeze rule:** earn 1 freeze each time the streak reaches a multiple of 7. Hold up to 2 (4 with GRIIT Pro). A freeze holds the streak but doesn't count as a secured day.
- **Invite links:** the base URL is one config value, `INVITE_BASE_URL`, defaulting to `https://grit-backend-production.up.railway.app`. Links read `{INVITE_BASE_URL}/i/{code}`. The domain may change later; nothing else may hard-code it.
- Posting is always a choice. The default audience is Friends. Journals are private and never shown.
- "Strict" is the label. The stored value stays `hard`.
- Accounts with `profiles.is_test = true` are hidden everywhere a real user could see them.
- The native tabs and glass effect stay behind the flag `FLAGS.LIQUID_GLASS` (default **off**). The solid fallback is what ships unless Yaseen turns the flag on after a device check.
- If two changes conflict, the one that makes the first day simpler wins. Write down the choice.

## When to STOP and ask
- A change needs a database migration: write the SQL, stop, and ask Yaseen to run it.
- A change needs a new native module, a permission, an entitlement, or a Supabase/Apple dashboard change.
- A design frame and the existing app disagree in a way the README doesn't settle.
- Tests that passed in an earlier chunk now fail.

## Shipping
- Never run an EAS build or submit to TestFlight except in chunk 13.
- Internal TestFlight only, group "Team (Expo)". Never the BETA TESTERS group.
- Keep the local `ios/` folder out of the EAS upload.
