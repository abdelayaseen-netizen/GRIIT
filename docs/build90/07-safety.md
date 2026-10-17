# Chunk 07: Safety

**Why:** People can get offensive words into public text. The filter in `backend/lib/content-moderation.ts` is a short word list that's easy to dodge, and it only runs on some fields.

**Areas you may touch:**
- `backend/lib/content-moderation.ts` and its test
- the backend routes that save public text: `feed.ts`, `profiles.ts`, `challenges-create.ts`, invite messages, task titles
- the client error display for those fields
- the comment report UI

## 07.1 Moderate every public text field, server-side
- Already covered: captions and comments (`feed.ts`), some profile fields, challenge creation.
- Add: usernames, display names, bios, challenge titles and descriptions, task titles, invite messages.
- Return `BLOCKED_TEXT` with a clear message on the right field.

## 07.2 Harder to dodge
- Normalize before matching:
  - lowercase
  - strip accents and zero-width characters
  - collapse runs of 3 or more repeated letters
  - map leetspeak (0→o, 1→i, 3→e, 4→a, 5→s, @→a, $→s)
  - remove spaces and punctuation between single letters ("f u c k", "f.u.c.k")
- Match whole words, so normal words that merely contain a blocked string still pass (for example "class", "assess", "Scunthorpe", "cocktail").
- **Tests:** at least 30 dodges that must be blocked and 30 clean words that must pass.

## 07.3 Report a comment
- Same flow as reporting a post or user.
- The comment hides for the reporter at once.

## 07.4 Journal entries stay private and unmoderated
- Add a test proving journal text never goes through moderation and is never returned to other users.

## Gates
- [ ] Every listed field rejects blocked text on the server (one test each)
- [ ] 30+ dodge tests and 30+ clean-word tests pass
- [ ] Comment report works and hides the comment
- [ ] The journal test passes
- [ ] Chunk 01–06 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
- [ ] STOP: tell Yaseen the backend needs `railway up --service grit-backend` before chunk 08
