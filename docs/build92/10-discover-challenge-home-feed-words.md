# Chunk 10: Discover, challenge page, Home, feed, words

**Spec:** `part3-first-day-discover/` frames P3-10 to P3-25 and the category motif panel. Checklist: Part 3 lines from "Discover cards show what you do…" to the end.

**Why:**
- Discover cards were blank gradients saying only "Camera".
- "Join" was tapped 14 times after already joining.
- "Couldn't save. Tap to try again." was tapped 11 times when the real reason was a closed window.
- Home showed "Day secured" and "Finish the task" at once.
- Only 10% understood "Freeze" and 33% "Self-reported".

## Items
- **10.1 Discover:**
  - Cards say what you do ("Run 3 mi · Strava").
  - Category motifs instead of stock photos.
  - Under 5 people shows "New"; 5 or more shows "{n} people".
  - Featured includes at least one run and one gym challenge (catalog data change → SQL if needed).
  - Joined challenges show "Joined".
- **10.2 Challenge page:**
  - Before joining, follow P3-13 and P3-13b.
  - After joining, show exactly "Day {n} of {N}" and "{n} days secured" from chunk 06's fields.
  - The dots and key from P3-14. "Your posts here: {audience} ›" opens the audience sheet.
  - The primary reads "Start today's task", or "Today's task is done" (disabled).
  - Never Join again, and never "You're already in this challenge".
- **10.3 Home:**
  - When today is secured, show "Today is secured. See you tomorrow.", with tasks folded into "{n} done".
  - Nothing may say "Finish the task" at the same time. Fix the cache-key split found in build 90.
  - Errors give the real reason, with Retry only when it can work.
- **10.4 Feed:**
  - Proofs lead.
  - "Started" events fold into one line per day: after the first proof, never at the top, never next to another, and at most one per 5 posts.
  - Started lines aren't likeable or commentable.
  - The empty state offers Discover and Invite. The toggle caption matches the tab.
- **10.5 Words:**
  - Secured, Freeze, Self-reported and Verified are each defined once at their first moment (P3-22, P3-23, P3-25).
  - After that, a small "i" opens the words sheet (P3-24).
  - Store "seen" per user. Remove the 3× repeated freeze line.

**Areas:** `components/discover/`, `components/challenge/`, `app/(tabs)/index.tsx`, `components/home/`, `components/feed/`, `backend/trpc/routes/feed.ts`, catalog seed.

## Gates
- [ ] Maestro: join from Discover → the challenge page shows "Start today's task" → Back → Discover shows "Joined" → reopen, and Join is never visible.
- [ ] Maestro: secure the day → Home never shows "Finish the task" in 10 polls over 60 s.
- [ ] vitest: the started-event folding rules on 4 feed fixtures; each words definition shows once per user.
- [ ] Screenshots next to P3-10, P3-11, P3-13, P3-14, P3-17, P3-18, P3-19 and P3-22.
- [ ] Backend deployed if changed. Chunk 01–10 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
