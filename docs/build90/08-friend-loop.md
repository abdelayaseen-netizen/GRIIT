# Chunk 08: Friend loop

**Why:** The Oct 15 social testers finished 0 of 8 tasks, and research says accountability to a friend is GRIIT's strongest lever. Invites must be easy to find, easy to open and easy to join.

**Areas you may touch:**
- `app/challenge/[id]/invite.tsx`
- create-success screen
- Day secured screen
- leaderboard empty state
- `lib/deep-links.ts`
- `app/_layout.tsx` (link handling only)
- `app/(tabs)/discover.tsx`
- the Discover search procedure

## 08.1 Invite link visible
- Show the link as visible text with a Copy button, plus Share, in three places:
  - create-success
  - after the first secured day
  - the leaderboard's "A board needs two"

## 08.2 Opening an invite
- Opening a `griit://i/` link on another device or account, including a brand-new guest, lands on that challenge with Join.
- After joining, the user lands on their first task (as in chunk 02).
- **Test:** a Maestro flow with two accounts. Write the link to a file so the second account can open it.

## 08.3 Discover search
- Search by challenge name or invite code.
- Searching an exact invite code opens that challenge.

## Gates
- [ ] The invite link is visible and copyable in all 3 places
- [ ] A second account (fresh guest) opens the link, joins, and lands on the first task
- [ ] Search finds challenges by name and by code
- [ ] Chunk 01–07 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
