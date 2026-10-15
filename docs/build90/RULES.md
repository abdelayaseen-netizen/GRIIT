# Build 90 rules (apply to every chunk)

## Branch and setup
- Work on branch `feat/build90`.
  - If it doesn't exist, create it from `feat/build89` at `a375b25a`.
  - Print `git branch --show-current` and `git rev-parse --short HEAD` before any code.
- Before any Maestro run: `export JAVA_HOME=/opt/homebrew/opt/openjdk`. Use a fresh is_test account per flow. Never wait out a 429.
- Yaseen runs `caffeinate -dimsu` in its own terminal tab.

## Design
- The only design spec is `design/GRIIT-v53.1-ONLY.md`. Older handoffs are history; don't read them for rules.
- Don't restyle anything beyond what an item asks for.
- Where an item says DESIGN PENDING, build the behavior with existing v53.1 components. Don't invent a new look.
- Copy rules: no exclamation marks, no motivational lines, sentence case, "likes" not "respects", orange only where v53.1 allows it.

## Every item, in this order
1. **Root cause.** Write the file, line and reason in `docs/reports/build90.md` before changing code.
2. **Failing test.** Write a Maestro flow (UI) or a vitest test (logic) that FAILS on the current code. Save its output or screenshot.
3. **Fix.** Make the smallest change that fixes the root cause.
4. **Passing test.** The same test now PASSES. Save its output or screenshot.
5. **Typecheck.** `npx tsc --noEmit` shows 0 errors.
6. **Record.** Add the item to `docs/reports/build90.md`: root cause, files changed, test name, before and after evidence.

## Scope fence
- Touch only the files an item needs. If a fix needs a file outside the chunk's listed areas, say why in the report.
- Never delete or rewrite working features you weren't asked to change.
- Never refactor for style.

## Backend and data
- Never change Railway or Supabase settings.
- Code deploys with `railway up --service grit-backend` are allowed, but only in a chunk that says to deploy.
- Write all SQL to `docs/sql/build90.sql` with a comment naming the chunk and item. Never run SQL against prod. Yaseen reviews it with Claude and runs it.
- New server behavior must keep older app builds working. Add fields and procedures; don't break existing ones.
- Never put keys or secrets in the repo, in logs or in chat.

## Pre-authorized decisions (don't stop to ask)
- A starter challenge on an empty Home is allowed for guests.
- Posting is always a choice, never automatic. The default audience is Friends.
- A journal entry is private: never moderated, never shown, only counted.
- When a number looks impossible, ask the user to check it ("Edit" / "Save anyway"). Never block silently.
- "Strict" is the label users see. The stored value stays `hard`.
- Accounts with `profiles.is_test = true` are hidden everywhere a real user could see them.
- If two fixes conflict, the one that makes the first day simpler wins. Write down the choice.

## When to STOP and ask
- A fix needs a database migration: write the SQL, stop, and ask Yaseen to run it.
- A fix needs a new native module, a new permission, or an App Store entitlement.
- An item seems wrong or would break something else.
- Tests that passed in an earlier chunk now fail.

## Shipping
- Never run an EAS build or submit to TestFlight except in chunk 10.
- Never build for the BETA TESTERS group. Internal TestFlight only, group "Team (Expo)".
- Keep the local `ios/` folder out of the EAS upload.
