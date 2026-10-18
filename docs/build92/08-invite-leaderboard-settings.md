# Chunk 08: Invite, leaderboard and settings

**Spec:** `part2-profile-social/` frames P2-14 to P2-22. Checklist: Part 2 lines from "Invite links are…" to the end of Part 2.

**Why:** the raw `griit://i/<uuid>?ref=…` link confused you ("what's the point of showing it?"). The leaderboard has no filled design, and Strava can't be connected from the app.

## Items
- **08.1 Short invite codes:**
  - A short code per invite (for example `k7Q2pX`), stored server side and mapped to the challenge and the inviter.
  - Links read `{INVITE_BASE_URL}/i/{code}`. Never show or share a `griit://` UUID.
  - If storage needs a migration, write the SQL and STOP.
- **08.2 Landing page:**
  - The backend serves `GET /i/:code`, a small HTML page (P2-18): the challenge name, day, inviter and an App Store button.
  - With the app installed, it opens the app's accept screen. Use a universal link if the entitlement exists; otherwise a `griit://` redirect fallback.
  - If an associated-domains entitlement is needed, STOP and list it.
- **08.3 Invite sheet:**
  - Share is primary, with the system share sheet and a preview. Copy is secondary, with the toast "Link copied."
  - Shown only after creating a challenge, on an empty leaderboard, and as Invite on a challenge.
  - Remove the always-visible raw link block from the leaderboard.
- **08.4 Accept screen (P2-19):**
  - "Yaseen invited you". A group room shows "Accept · Day 1 is today"; a public challenge shows "Join · Day 1 is today". Both offer "Not now".
  - No owner approval.
- **08.5 Leaderboard (P2-15 to P2-17):**
  - For 2–10 people: rank, photo, name, days secured this week and the Verified count.
  - Your row reads "You". Ties go to more verified days, then whoever secured earlier.
  - is_test accounts are hidden from real users.
- **08.6 Settings (P2-20, P2-21):**
  - Connect Strava ("Connected as {name}" or Disconnect) through the existing OAuth.
  - Apple Health shows "Coming soon", disabled.
  - The Pro perks list carries Pro tags and gates nothing in the free core.
  - The Strava row shows when `STRAVA_AUTO_VERIFY` is on.

**Areas:** `backend/` (an invites route and a public `/i/:code` route), `app/invite/`, `components/activity/LeaderboardTab.tsx`, settings, `lib/invite-link.ts`. Deploy is approved after any SQL is run.

## Gates
- [ ] vitest: code generation is unique and unguessable (at least 6 characters, from a 62-character alphabet); code → challenge; the self-invite and full-room cases.
- [ ] `curl {INVITE_BASE_URL}/i/{code}` returns the landing page with the right challenge; an unknown code returns a friendly 404 page.
- [ ] Maestro two-account flow: A shares → B opens the link → Accept → B lands on the first task.
- [ ] The leaderboard with 5 seeded members matches P2-16 (screenshot).
- [ ] A grep shows no `griit://i/` string rendered or shared anywhere in the UI.
- [ ] Backend deployed. Chunk 01–08 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
