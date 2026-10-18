# How to run build 92 (for Yaseen)

## One-time setup
1. Unzip `GRIIT-b92-design-handoff` into the repo at `design/handoff/b92/`, so that `design/handoff/b92/README.md` exists.
2. Unzip this folder into the repo as `docs/build92/`.
3. Raise the Cursor spend cap so it can't silently fall back to Grok halfway through.
4. Run `caffeinate -dimsu` in its own terminal tab.

## For every chunk
1. Open a **new** Cursor chat and pick **Claude Fable 5.1 High** (or Opus). Check that it actually shows that model.
2. Paste exactly this:
   > Read docs/build92/RUNNER.md and follow it. Do the next chunk only.
3. Let it work. It posts a plan, does the chunk, then posts a report and stops.
4. Send the report to Claude. Don't start the next chunk until Claude says PASSED.
5. If it says STOP for SQL, a deploy or a dashboard change, bring that to Claude first.

## What needs you
| Chunk | What | Needs from you |
| --- | --- | --- |
| 01 | Glass foundation and Create | — |
| 02 | Finish flow and Day secured | — |
| 03 | Task inputs and partial logs | Review SQL (partial logs, the "Read" task fix) |
| 04 | Posts, likes, proof detail | — |
| 05 | Share stickers | — |
| 06 | One source for every number | Review SQL (streak fields, freeze rule) |
| 07 | Profile and post viewer | — |
| 08 | Invite, leaderboard, settings | Review SQL (invite codes); domain later |
| 09 | First day and account | Turn on Supabase email OTP (Claude walks you through it) |
| 10 | Discover, challenge page, Home, feed, words | Maybe SQL (Featured catalog) |
| 11 | Speed | — |
| 12 | Better test agents | — |
| 13 | Ship and overnight test | Confirm SQL, deploy, OTP and the glass flag |

## Liquid glass
It ships **off** (the solid bar) by default. After build 92 is on your phone, turn on `FLAGS.LIQUID_GLASS` in a dev build. If it looks right on your iOS 26 iPhone, it goes on in build 93.
