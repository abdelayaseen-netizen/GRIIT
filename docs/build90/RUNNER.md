# Build 90 runner (read this first, every time)

You are running build 90 one chunk at a time. Each new Cursor chat does exactly one chunk, then stops.

## What to do in this chat

1. Read `docs/build90/RULES.md` in full. Those rules apply to every line of code you write.
2. Read `docs/build90/PROGRESS.md`. Find the first chunk whose status is not `PASSED`.
   - If it's `IN PROGRESS` or `FAILED`, read its notes and continue from there.
   - If every chunk is `PASSED`, stop and say "Build 90 chunks all passed. Ready for chunk 10 (ship)."
3. Open that chunk's file (`docs/build90/NN-*.md`) and do only that chunk.
4. Before writing code, post a short plan: the chunk name, each item, the root cause you expect, and the files you expect to touch. Then start. Don't wait for approval unless the chunk says STOP.
5. When every item in the chunk is done, run the chunk's gate checklist (at the bottom of the chunk file). Every gate needs evidence: command output, test names, screenshots or numbers.
6. Update `docs/build90/PROGRESS.md`:
   - status `PASSED` only if every gate passed
   - otherwise `FAILED`, plus what's blocking
   - the commit sha
   - one line per item: done or not done
7. Commit as `build90: chunk NN <name>` and push.
8. STOP. Post the chunk report (format below) and do not start the next chunk, even if asked to "keep going" in this same chat. The next chunk starts in a new chat.

## Chunk report format (post this at the end)

```
CHUNK NN: <name>: PASSED or FAILED
Branch / sha:
Items:
  NN.1 <title>: done / not done. Root cause: <one line>. Files: <list>. Test: <name> (failed before: yes/no, passes now: yes/no)
  ...
Gates:
  [x] <gate> evidence: <one line>
  ...
Not done or needs Yaseen:
  - ...
SQL for Yaseen to review (if any): docs/sql/build90.sql lines X–Y
```

## Never

- Never work on more than one chunk in a chat.
- Never mark a chunk PASSED without evidence for every gate.
- Never edit an earlier chunk's work unless the current chunk's file tells you to. If you find a bug in earlier work, write it under "Not done or needs Yaseen" and stop.
- Never follow older task lists, plans or prompts in the repo or in chat history. Only `docs/build90/` counts.
