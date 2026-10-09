# Build 80

Shipped to internal TestFlight on Oct 8, 2026.

- Build number: **80** (1.0.0)
- Merge commit: `da7257be`
- Health: `https://grit-backend-production.up.railway.app/api/health` returned 200 with commit `da7257b`
- EAS build: `bd5482a2-8f50-4fa1-b70a-8544e5ac7930`
- Submission: `c2280061-6c6d-4cb7-860b-8b85d57a37f6`
- Group: internal only. The production submit profile does not attach an external TestFlight group.

## What shipped

- A proof with no share state stays private, and proof images load through signed URLs (`28ba7983`).
- Home and the challenge detail share today's completion list.
- Future days on the week strip are dotted. Missed days stay misses. Days before join stay a dot.
- Streak share squares use each day's real state, including misses.
- Empty finishes stay off the feed. The streak line sits inside the challenge-complete card.
- Your data counts proofs by method and buckets hours in the profile time zone.
- A proof shows the challenge, the day, and the task. Reply threads are included.
- Discover preview tasks show their gates.
- Heart, comment, and share do not open the post.
- The sticker preview sits on a checkerboard. The export text is white. One handle on a share card.
- The liked heart, header badges, and sticker cells use Text 1. Spinners use Text 2.

## Frames 1228–1230

Simulator shots are in `docs/frame-match/build80/` (photo post, started line, finished post). The design atlas was not captured.

Accepted:

- The photo is full-bleed 4:5 with the caption on the fade. The written lines for 1228–1230 do not specify the photo; this matches the drawn system-line frame.
- "View all N comments" under the actions is the comments entry the spec asks for when comment previews are not inlined.
- Join goes through `challenges.join`, the app's join API.
- The complete-card cover is the duration numeral on a gradient.
- "30 of 30 days secured" is a large number plus the phrase.
- The dev harness labels (1226, 1227, "Still on the feed") are not part of the feed.

## Skipped

- Timer Live Activity and Apple Health. They are not in this build.
- A full-app orange purge. Orange remains on the primary button, the flame, the done check, and the active tab, and in places this build did not list.
- The privacy SQL for the task-proofs bucket. It was not run. Run it after this build is installed.
