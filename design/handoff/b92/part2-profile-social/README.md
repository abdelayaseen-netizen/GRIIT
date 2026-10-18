# GRIIT build 92 · Part 2 · Profile and social

Prototype: `atlas/GRIIT b92 Part 2 Profile and Social.dc.html` (frames P2-01 to P2-22). Uses the Part 0 glass chrome and the Part 1 post rules.
Folded in from the earlier "simplify three screens" request: the profile. The first screen answers "who is this and do they show up?"

## What changed and why
- **Profile:** 3 numbers, not 6. Streak, Best and Days secured, with "N verified" under Days secured. Followers and following are one quiet line, with no Friends number.
- **Proofs come first.** Challenges, Badges and Stats move to one place, "Your record". Recommended **Option A**: a labelled row under the buttons. Option B (a top-bar chart icon) is cleaner, but an unlabelled icon is easier to miss.
- **Free in Your record:** streak history, per-challenge progress and badges. **Pro:** only the deeper stats (charts, best times, verified %, month over month).
- **The post viewer** scrolls through every post and swipes between the photos of a post. Back works. The header is "Posts" or the challenge name, never a route.
- **Your own posts:** "Liked by …", no heart.
- **Loading:** the header comes from cache instantly; skeletons appear only in the grid.
- **Invites:** a short link (griit.app/i/…), Share first, Copy second. Shown only after creating a challenge, on an empty board, and as Invite on a challenge. Plus the landing page and the accept screen.
- **Leaderboard:** 2–10 people, with secured this week and a Verified count; your row is highlighted.
- **Settings:** Strava connect/disconnect, Apple Health "Coming soon", and the Pro perks listed without gating the free core.

## The numbers (one source each)
| Number | Definition | Field |
|---|---|---|
| Streak | Days in a row secured, up to today. Today counts once secured; if yesterday wasn't secured or held, 0 | user_stats.current_streak |
| Best | The longest streak ever; matches the "Best 18 · Sep 20 – Oct 7" record | user_stats.best_streak |
| Days secured | Total secured days, all time | user_stats.secured_days |
| Verified | Secured days where every task had camera or Strava proof (shown under Days secured) | user_stats.verified_days |
| Proofs | Total completed tasks with proof. Not on the header; shown once, in Your record | user_stats.proof_count |
| Followers · following | One quiet line, tappable | follows |
Home, Your record, challenge pages and share cards read these same fields.

## Screens and states
| Frame | Screen | Device | State |
|---|---|---|---|
| P2-01 | Own profile · Option A (recommended) | SE | default |
| P2-02 | Own profile · Option B | Pro Max | default |
| P2-03 | Your record · Challenges | Pro Max | running / finished / left |
| P2-04 | Your record · Challenges | SE | longest names |
| P2-05 | Your record · Badges | Pro Max | next / earned / locked |
| P2-06 | Your record · Stats | SE | free streak history + Pro deeper stats preview |
| P2-07 | Visitor profile | Pro Max | not following |
| P2-08 | Visitor profile | SE | following, longest name, empty bio, zero numbers |
| P2-09 | Own profile | SE | loading: header from cache, grid skeleton |
| P2-10 | Own profile | Pro Max | empty: no proofs yet |
| P2-11 | Own profile | SE | error: proofs offline |
| P2-12 | Post viewer · own | Pro Max | Liked by, no heart |
| P2-13 | Post viewer · visitor | SE | two-photo post, 1 of 2 |
| P2-14 | Invite sheet | SE | after creating a challenge |
| P2-15 | Leaderboard | Pro Max | empty: a board needs two |
| P2-16 | Leaderboard | SE | 5 people, your row highlighted |
| P2-17 | Leaderboard | Pro Max | 10 people, longest names |
| P2-18 | Invite landing page (web) | SE | no app installed |
| P2-19 | Invite accept | Pro Max | "Yaseen invited you", group room, Accept |
| P2-20 | Settings | SE | Strava connected |
| P2-21 | Settings | Pro Max | Strava not connected |
| P2-22 | Home task + post | SE | Verified by Strava |

## Copy table
| Where | String |
|---|---|
| Profile numbers | Streak · Best · Days secured · {n} verified |
| Follow line | {n} followers · {n} following (1 follower) |
| Own buttons | Edit profile · Find friends |
| Visitor buttons | Follow · Following · Invite to a challenge |
| Record row | Challenges, badges and stats · {n} running · {n} finished · {n} badges |
| Your record | Your record · Challenges · Badges · Stats · Running · Finished · Left · Day {n} of {N} · {s} of {d} days secured · finished {date} · left {date} |
| Badges | Next · Earned · Locked · {n} of {N} · {rule} · {date} |
| Stats | Streak history · free · Best · Current · {n} · {start} – {end} · Deeper stats · GRIIT Pro · Deeper stats are part of GRIIT Pro · Charts, best times, verified %, month over month. · Try GRIIT Pro |
| Proofs | Proofs · Self-reported · No proofs yet. · Finish a task and it shows up here. · Start today's task · Find a challenge · Couldn't load proofs. You're offline. · Try again |
| Post viewer | Posts · {challenge} · 1 of 2 · Liked by {name} and {n} others |
| Invite sheet | Invite friends · {challenge} is ready. Invite people to start with you. · Join me. Day 1 is today. · griit.app/i/{code} · Share · Copy link · Link copied. |
| Share message | Join me on {challenge}. Day {n} is today. griit.app/i/{code} |
| Landing | GRIIT · {name} invited you · {challenge} · {category} · {N} days · {n} people · Every day · {task} · Proven with the camera, {window} · Get the app and you'll land in this challenge, ready to join. · Get GRIIT on the App Store · Already have GRIIT? Open it |
| Accept | {name} invited you · @{handle} · {n}-day streak · Standard · Miss a day and a freeze can hold it. · {name} and {n} friends are in · Group room · {n} of 10 people · Accept · Day 1 is today (group room) · Join · Day 1 is today (public) · Not now |
| Leaderboard | This week · Secured · Verified · You · /7 · A board needs two. · Invite someone to see how you compare this week. · Invite |
| Settings | Connections · Strava · Connected as {name} · Disconnect · Verify runs automatically · Connect · Runs from Strava show "Verified by Strava" on the task and the post. · Apple Health · Steps and workouts · Coming soon · GRIIT Pro · Free stays free: challenges, proofs, streaks, badges. · See Pro · Auto-verify runs · Extra freezes · Hold up to 4 instead of 2 · Stats · Premium stickers · Pro |
| Strava messages | Disconnect Strava? Runs will need a photo or be self-reported. · Strava connected. · Strava didn't connect. Try again from here. |
| Strava task | {d} mi · {time} · from Strava · Verified by Strava |

## Source
- `src/profile/stats.ts`: the numbers and their definitions.
- `ProfileHeader.tsx`: Option A.
- `ProofGrid.tsx`: loading, empty and error states.
- `PostViewer.tsx`
- `src/invite/invite.ts`
- `src/challenge/leaderboard.ts`
- `src/settings/connections.ts`

`DS_V3` token names are assumed; map them to the shipped names.

## Acceptance checklist
- [ ] The profile header shows at most 3 numbers: Streak (with the flame), Best, Days secured with "{n} verified" under it.
- [ ] Followers and following appear on one tappable line; there is no Friends number.
- [ ] Streak, Best, Days secured and Verified match Home, Your record, challenge pages and share cards for the same user.
- [ ] Each number reads its server field (current_streak, best_streak, secured_days, verified_days); none are computed on the client.
- [ ] The proof grid sits directly under the header, 3 columns of 4:5 tiles, with the date on a small bottom label.
- [ ] Challenges, Badges and Stats are reachable from one place ("Your record"), via the record row (Option A).
- [ ] Your record shows Running, Finished and Left, each card with "Day {n} of {N}" and "{s} of {d} days secured" plus dots; the numbers match the challenge page.
- [ ] Badges show the next badge with progress, earned badges with dates, and locked badges greyed.
- [ ] In Your record, streak history, per-challenge progress and badges are free; only the deeper stats (charts, best times, verified %, month over month) are Pro.
- [ ] The own view shows "Edit profile" and "Find friends"; the visitor view shows "Follow"/"Following" and "Invite to a challenge".
- [ ] Visitors only see posts shared to them, and can't see Stats.
- [ ] Long names wrap to 2 lines; an empty bio leaves no gap.
- [ ] The profile header renders from cache immediately; only the grid shows skeletons; there is never a blank screen.
- [ ] The empty and offline grid states show their copy; "Try again" refetches.
- [ ] Tapping a tile opens the post viewer at that post; it scrolls smoothly through all posts, and photos in a post swipe with "1 of 2".
- [ ] Back from the viewer returns to the grid at the same tile.
- [ ] No header anywhere shows a route name.
- [ ] Your own posts show "Liked by {name} and {n} others" and no heart.
- [ ] Invite links are griit.app/i/{code}; no griit:// UUID is ever shown or shared.
- [ ] "Share" is primary and opens the system share sheet with the preview; "Copy link" is secondary and toasts "Link copied."
- [ ] The invite appears only after creating a challenge, on an empty leaderboard, and as Invite on a challenge you're in.
- [ ] Opening an invite without the app shows the landing page; after install, the accept screen opens for that challenge.
- [ ] An invited friend joins a group room directly with "Accept · Day 1 is today"; there is no owner approval and no "Ask to join". Public challenges show "Join · Day 1 is today". Both offer "Not now".
- [ ] The leaderboard shows rank, photo, name, days secured this week (of 7) and Verified count for 2–10 people; your row is highlighted and labelled "You".
- [ ] Ties sort by verified, then earlier last secure.
- [ ] An empty leaderboard shows "A board needs two." with Invite.
- [ ] Settings shows "Connected as {name}" with Disconnect when Strava is linked, or Connect when not.
- [ ] Apple Health shows "Coming soon" and is disabled.
- [ ] Pro perks are listed with a Pro tag; nothing in the free core is gated.
- [ ] Strava runs show "Verified by Strava" once on the task and once on the post.
- [ ] Every interactive element has a label and role, and is at least 44 pt.
