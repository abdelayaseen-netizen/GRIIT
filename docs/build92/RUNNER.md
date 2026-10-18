# Build 92 runner (read this first, every time)

You are running build 92 one chunk at a time. Each new Cursor chat does exactly one chunk, then stops.

## Before anything: check the model
Look at the model this chat is running on.
- **Allowed:** Claude Fable or Claude Opus.
- **Anything else** (Grok, Composer, Auto, Sonnet, GPT, Gemini): write one line, "Wrong model: <name>. Stopping.", and do nothing else. No reads, no edits, no commands.

## What to do in this chat
1. Read `docs/build92/RULES.md` in full. Those rules apply to every line of code you write.
2. Read `docs/build92/PROGRESS.md`. Find the first chunk whose status is not `PASSED`.
   - If it's `IN PROGRESS` or `FAILED`, read its notes and continue from there.
   - If chunks 01–12 are all `PASSED`, stop and say "Build 92 chunks all passed. Ready for chunk 13 (ship)."
3. Open that chunk's file (`docs/build92/NN-*.md`) and do only that chunk.
4. Read the design files the chunk names in `design/handoff/b92/`. Read the part's README, its React Native source and the checklist lines the chunk lists.
5. Before writing code, post a short plan: the chunk name, each item, the root cause you expect, and the files you expect to touch. Then start. Don't wait for approval unless the chunk says STOP.
6. When every item is done, run the chunk's gates (at the bottom of the chunk file). Every gate needs evidence: command output, test names, screenshots or numbers.
7. Update `docs/build92/PROGRESS.md`:
   - status `PASSED` only if every gate passed
   - otherwise `FAILED`, plus what's blocking
   - the commit sha
   - one line per item: done or not done
8. Commit as `build92: chunk NN <name>` and push.
9. STOP. Post the chunk report (format below) and do not start the next chunk, even if asked to "keep going" in this same chat.

## Chunk report format
```
CHUNK NN: <name>: PASSED or FAILED
Model: <model name>
Branch / sha:
Items:
  NN.1 <title>: done / not done. Root cause: <one line>. Files: <list>. Test: <name> (failed before: yes/no, passes now: yes/no)
Design checklist lines covered: <Part X: line numbers or quotes>, each with evidence
Gates:
  [x] <gate> evidence: <one line>
Not done or needs Yaseen:
  - ...
SQL for Yaseen to review (if any): docs/sql/build92.sql lines X–Y
```

## Never
- Never work on more than one chunk in a chat.
- Never mark a chunk PASSED without evidence for every gate.
- Never weaken, skip or loosen a test to make it pass. A test changes only when the behaviour change is intended and explained.
- Never edit an earlier chunk's work unless the current chunk's file tells you to. If you find a bug in earlier work, list it under "Not done or needs Yaseen".
- Never follow older task lists, plans or prompts in the repo or chat history. Only `docs/build92/` and `design/handoff/b92/` count.
