# Chunk 04: Posting and sharing

**Why:** After finishing a task, people don't know whether they're done or how to post. The share card shows wrong data, and the sticker options feel like one sticker in different colors.

**Areas you may touch:**
- `components/task-v2/**` (finish and confirmation steps)
- `app/post/[id]/**`
- `app/proof/[id].tsx`
- `components/feed/ProofPost.tsx`
- `components/share/**`
- `components/ProofShareCard.tsx`
- `backend/trpc/routes/feed.ts` (own-post visibility only)

## 04.1 One clear post choice after every task
- After any task, show one sheet with two options:
  - "Post to feed," with audience chips Friends and Everyone (default Friends)
  - "Keep it private"
- Either option ends the flow. It returns to today's tasks, or to Day secured if it was the last task.
- Self-reported tasks post a text card: task, challenge, day, streak.
- Photo tasks post the photo.
- DESIGN PENDING: use existing v53.1 sheet and button components.

## 04.2 Photo-proof tasks say so up front
- The capture screen shows the challenge name, the day, and "Photo proof required."
- The camera opens directly. Camera only: no camera roll for proof.

## 04.3 The Proof screen has a finish
- After posting, "Share outside GRIIT," "Back to today" and the audience row render as plain text today. Make them real controls:
  - "Done" as the primary button
  - "Share outside GRIIT" as secondary
  - audience as a labeled control

## 04.4 Your own post always shows in your feed
- Whatever audience you chose, your own post appears in your Everyone and Following feeds.
- Today Everyone said "No posts yet" right after a Friends post.

## 04.5 Share card data is correct
- Today it shows "CHALLENGE · Saved · Day 1 of 1 · 0 days in a row" after a Day 2 of 7 task.
- It must show the real challenge name and "Day 2 of 7."
- Show the streak only when it's 1 or more.

## 04.6 Sticker set
- Remove the stock landscape photo (`SAMPLE_STORY` in `components/share/ShareSystemSheet.tsx`). The design rule is no stock photos.
- Swiping shows different stickers, not color variants of one:
  1. **Day stamp**: the current Ink, Orange and White versions stay as color options on this card
  2. **Streak**: flame plus "X days in a row" (hidden when the streak is 0)
  3. **Progress**: week dots plus "Day 2 of 7"
  4. **Photo proof**: the user's own photo as background, only when the task has a photo
- Remove the glow or landscape card.
- "Copy sticker" and "Instagram Story" work on every card.
- DESIGN PENDING for stickers 2 and 3: build them from existing tokens and type only.

## Gates
- [ ] Every task type ends with the post-or-private sheet and lands on today's tasks or Day secured
- [ ] The Proof screen has a working Done button
- [ ] Own post shows in both feeds right after posting
- [ ] The share card shows the right challenge, day and streak (screenshots)
- [ ] 4 sticker cards, no stock photo, Copy sticker works on each
- [ ] Chunk 01–03 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed
