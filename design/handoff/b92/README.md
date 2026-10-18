# GRIIT build 92 · design handoff (Parts 0–3)

Everything from the build 92 design brief, Parts 0–3, as approved on Oct 18, 2026. Each part folder holds its final README (what changed, states, copy table, checklist), React Native source, prototype (`atlas/*.dc.html`, open in a browser) and assets.

| Part | Folder | Prototype | Status |
|---|---|---|---|
| 0 · Liquid Glass foundation | `part0-liquid-glass/` | `part0-liquid-glass/atlas/GRIIT b92 Part 0 Glass.dc.html` | 9/10 |
| 1 · The finish loop | `part1-finish-loop/` | `part1-finish-loop/atlas/GRIIT b92 Part 1 Finish Loop.dc.html` | approved |
| 2 · Profile and social | `part2-profile-social/` | `part2-profile-social/atlas/GRIIT b92 Part 2 Profile and Social.dc.html` | approved |
| 3 · The first day, Discover and the challenge page | `part3-first-day-discover/` | `part3-first-day-discover/atlas/GRIIT b92 Part 3 First Day and Discover.dc.html` | approved |

Build order: Part 0 (chrome and fallback) → Part 1 (finish loop) → Part 2 → Part 3. Parts 1–3 use the Part 0 glass components (`src/ds/glass/`, included in every folder).

## Locked design system
- Ink #0F0F0F everywhere. Orange only in 4 places: the primary fill #BB471D, the flame, the done check #DC5401, the active tab.
- Barlow Condensed 600 for earned numbers only (streak, day, distance). UI text is weights 400 and 500, at v51 sizes (Body 17/22, Secondary 15/20, Caption 13/18).
- Lucide icons plus the GRIIT flame. No emoji.
- "Day 1", "1 day", "23 days". Never "Day 1/30" or "DAY 1".
- No exclamation marks, no motivational lines. Use "likes", never "respects".
- Touch targets at least 44 pt; every control has a label and role.
- "Verified" only for the camera, Strava or a checked time window.

## Locked decisions from this session
**Part 0 · Liquid Glass**
- Glass only on floating chrome: tab bar, top bars, bottom sheets, floating action bar, toasts. Never on content, never glass on glass, never orange glass.
- The solid #1A1A1A + 1 px hairline fallback is the default path until native tabs and the glass effect both work on an Expo SDK 54 build on an iOS 26 device. It's also used on iOS < 26 and with Reduce Transparency.
- Tabs: Home · Discover · Create · Activity · Profile, in shipped Lucide icons. SF Symbol fallback on the tab bar only: house, safari, plus.circle, **flame** (Activity), person.
- Create (the tab, and "+ Create" while the bar is shrunk) opens a chooser: "Log today's task" / "Create a challenge". Never a post sheet.
- Reduce Motion: the bar never shrinks.
- On glass, orange is only the active tab icon. Labels stay Text 1. The primary is always a solid #BB471D fill.
- A toast's "Share" opens the sticker carousel.

**Part 1 · Finish loop**
- One flow: Done → post sheet → Challenge complete / Day secured / Home toast with the next task highlighted. The Proof screen never appears in it.
- The audience is asked once, in the post sheet. Friends is the default. The button names the choice. Closing without choosing saves privately, with the toast "Saved privately."
- Short of the goal: logged but doesn't count. Saved (and postable) as "2 of 3 mi · 1 mi short". The task stays open and the day isn't secured. This is said on the task screen before saving, and the button reads "Save 2 mi · won't count today".
- Partial logs add up within the same local day ("2 of 3 mi so far" → "3 of 3 mi"). Counters work the same way. Totals reset at local midnight.
- Your own posts can't be liked. They show "Liked by {name} and {n} others" with no heart.
- Stickers: Photo and Week strip are free; Streak glow and Progress ring are GRIIT Pro (a lock plus "GRIIT Pro"; tapping opens the upgrade sheet). No stock photos: with no proof photo, the Photo style becomes a plain card. Themes follow the orange rule.
- Day secured fits on an iPhone SE without scrolling. Done and Back go Home. The teaching line shows once.

**Part 2 · Profile and social**
- At most 3 profile numbers: Streak, Best, Days secured (with "N verified" under it). Followers and following are one quiet line. Each number has one server field.
- The proof grid comes first. Challenges, Badges and Stats live in "Your record" via a labelled row (Option A).
- In Your record, streak history, per-challenge progress and badges are free. Only deeper stats (charts, best times, verified %, month over month) are Pro.
- The post viewer scrolls through every post and swipes between photos. Back always works. No route names in headers.
- The header loads from cache instantly; skeletons appear only in the content.
- Invite: the short link griit.app/i/{code}, Share first and Copy second. Shown only after creating a challenge, on an empty leaderboard, and as Invite on a challenge.
- An invited friend joins a group room directly with "Accept · Day 1 is today"; the invite is the approval. Public challenges show "Join · Day 1 is today".
- Leaderboard for 2–10 people with secured this week and a Verified count. Settings: Strava connect/disconnect, Apple Health "Coming soon", and Pro perks listed without gating the free core.

**Part 3 · First day, Discover, challenge page**
- All 7 goals sit above the button on SE. Start here has Join on every card (no radio buttons); one tap joins and opens the first task.
- A closed-window challenge: Day 1 is tomorrow. Today isn't counted as missed. "Day 1 is tomorrow at {time}" appears on the card, the challenge page and the join button. It's never the first Start here card; that card can always be finished today.
- Account: Apple first, email one-time code, "Not now". Engineering: enable Supabase email OTP and configure its template to send the 6-digit code.
- Discover cards say what you do. Category motifs, no stock photos. Under 5 people shows "New". Featured includes a run and a gym challenge.
- The challenge page shows two numbers, derived from the same days as the dots. Held days hold the streak but don't add to secured. After joining: "Start today's task", never Join again.
- Feed: proofs lead. "Started" events fold into one line per day, after the first proof, at most one per 5 posts. There's never a feed of only started lines. The toggle caption matches the tab.
- Secured, Freeze, Self-reported and Verified are each defined once at their first moment, then a small "i". Freeze: earned at each 7-day streak; hold up to 2 (4 with Pro).

## Open items for engineering
- `DS_V3` / `DS_COLORS_V2` token names in the source are assumed; map them to the shipped names.
- Confirm the bottom accessory can hide when the tab bar is expanded (Part 0). If it can't, drop the Create tab and keep "+ Create".
- Upgrade sheet prices come from RevenueCat; the prototype shows placeholders.

## Every frame

### Part 0 · Liquid Glass foundation
| Frame | Component | Device | State |
|---|---|---|---|
| P0-01 | Tab bar | 16 Pro Max | expanded over the photo feed, Home selected |
| P0-02 | Tab bar | SE | shrunk on scroll down, + Create accessory inline (not shown with Reduce Motion) |
| P0-03 | Tab bar | SE | over the empty ink canvas (empty feed) |
| P0-04 | Top bar | 16 Pro Max | scrolled, glass in, title "Posts" |
| P0-05 | Bottom sheet | SE | post sheet, Friends default, over the feed |
| P0-06 | Bottom sheet | 16 Pro Max | join sheet, over ink |
| P0-07 | Floating action bar | SE | "Start today's task" over the challenge page |
| P0-08 | Floating action bar | 16 Pro Max | disabled + secondary, over ink |
| P0-09 | Toast | SE | success over the feed |
| P0-10 | Toast | 16 Pro Max | error, longest real text, over ink |
| P0-11 | Top bar + toast | SE | longest real text (long challenge name, 3-line toast) |
| P0-12 | Tab bar + toast | SE | fallback |
| P0-13 | Bottom sheet | 16 Pro Max | fallback, Only me selected |
| P0-14 | Create chooser | SE | from the Create tab or + Create |
| States panel | tab item, primary, glass secondary, segmented | – | default, pressed, selected, disabled, loading |

Loading for chrome: the bar is always shown; only the primary shows a spinner + "Posting". Glass components have no empty state of their own; P0-03, P0-06 and P0-08 show them over empty content.

### Part 1 · The finish loop
| Frame | Screen | Device | State |
|---|---|---|---|
| P1-01 | Post sheet | SE | photo task, Friends default |
| P1-02 | Post sheet | Pro Max | run, no photo, Everyone |
| P1-03 | Post sheet | SE | loading ("Posting") |
| P1-04 | Post sheet | Pro Max | error, offline, "Try again" |
| P1-05 | Home | SE | tasks remain: toast + next task highlighted |
| P1-06 | Day secured | SE | first time, teaching line, fits with no scroll |
| P1-07 | Day secured | Pro Max | camera |
| P1-08 | Day secured | SE | self-reported |
| P1-09 | Day secured | Pro Max | verified by Strava |
| P1-10 | Challenge complete | SE | last day, day secured |
| P1-11 | Challenge complete | Pro Max | challenge done, other challenges still need today |
| P1-12 | Stickers | SE | Photo · Ink |
| P1-13 | Stickers | Pro Max | Photo · White |
| P1-14 | Stickers | SE | Photo with no proof photo → plain card (empty state) |
| P1-15 | Stickers | Pro Max | Week strip · White |
| P1-16 | Stickers | SE | Streak glow · Pro, locked |
| P1-17 | Stickers | Pro Max | Progress ring · Pro · Orange |
| P1-18 | Upgrade sheet | SE | from a Pro sticker |
| grid | Stickers | – | 4 styles × 3 themes + the plain card |
| P1-19 | Feed | Pro Max | run, workout, counter, timer, journal |
| P1-20 | Feed | SE | longest real text in the post header |
| P1-21 | Feed | SE | double-tap like burst |
| P1-22 | Full-screen photo | Pro Max | double-tap still works |
| P1-23 | Own post | SE | no heart, "Liked by Sami and 3 others" |
| P1-24 | Proof detail | Pro Max | from the feed, comments |
| P1-25 | Proof detail | SE | keyboard open, composer pinned |
| P1-26 | Proof detail | Pro Max | no comments (empty) |
| P1-27 | Owner menu | SE | Who sees this · Share · Delete post |
| P1-28 | Counter | SE | past the goal |
| P1-29 | Counter | Pro Max | partial |
| P1-30 | Run | SE | valid, h:mm:ss |
| P1-31 | Run | Pro Max | impossible pace, Done disabled (error) |
| P1-32 | Run | SE | short of the goal, said before Done |
| P1-33 | Home | Pro Max | after a short run: the task stays open, the short post |
| P1-34 | Home | SE | post sheet closed without choosing → toast "Saved privately." |
| P1-35 | Run | Pro Max | second log adds up: "2 of 3 mi so far" → "3 of 3 mi" |

Loading is P1-03. Empty states are P1-14 and P1-26. Errors are P1-04 and P1-31. Longest text is P1-02 and P1-20.

### Part 2 · Profile and social
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

### Part 3 · The first day, Discover and the challenge page
| Frame | Screen | Device | State |
|---|---|---|---|
| P3-01 | Goals | SE | nothing picked, all 7 above the button |
| P3-02 | Goals | SE | 3 picked |
| P3-03 | Goals | Pro Max | 1 picked |
| P3-04 | Start here | SE | Join on each card; a closed-window match labelled "Day 1 is tomorrow at 5:00 am"; freeze line once |
| P3-05 | Start here | Pro Max | joining |
| P3-06 | First task | Pro Max | after Join: Day 1, toast |
| P3-07 | Start here | SE | empty: nothing open for the goal |
| P3-08 | Account | SE | default |
| P3-09 | Account | Pro Max | code entry, keyboard bar suggestion |
| P3-10 | Discover | SE | For you, Featured (run + gym) |
| P3-11 | Discover | Pro Max | Faith, Joined, New |
| P3-12 | Discover | SE | loading |
| P3-13 | Challenge page | SE | before joining |
| P3-13b | Challenge page | Pro Max | window closed today: "Day 1 is tomorrow at 5:00 am" |
| P3-14 | Challenge page | Pro Max | after joining, first view with the dot key |
| P3-15 | Challenge page | SE | today done |
| P3-16 | "Your posts here" sheet | Pro Max | Friends selected |
| P3-17 | Home | SE | today done, tasks folded, feed |
| P3-18 | Home | Pro Max | error: window closed |
| P3-19 | Feed | Pro Max | mostly empty, Following, grouped started line |
| P3-20 | Feed | SE | Following empty |
| P3-21 | Feed | Pro Max | Everyone |
| P3-22 | First freeze earned | SE | definition once |
| P3-23 | Home | Pro Max | a freeze covered yesterday |
| P3-24 | Words sheet | SE | the "i" |
| P3-25 | Home | Pro Max | first self-reported task toast |
| panel | Category motifs | – | Fitness, Faith, Mind, Health, Discipline |

## Combined acceptance checklist

### Part 0 · Liquid Glass foundation
- [ ] Glass appears only on: tab bar, top bars of scrolling screens, bottom sheets, floating action bar, toasts.
- [ ] No glass on proof photos, feed cards, the streak card or text blocks.
- [ ] No glass sits on top of another glass surface.
- [ ] Tab bar has 5 tabs in order Home, Discover, Create, Activity, Profile, each with an SF Symbol and a label.
- [ ] Tapping Create opens the Create chooser ("Log today's task" / "Create a challenge") and the previously selected tab stays selected.
- [ ] Nothing in the Create path opens the post sheet; the post sheet only opens after Done on a task.
- [ ] "Create a challenge" opens the Create challenge flow; "Log today's task" opens the next open task, and is disabled with "Every task today is done." when today is secured.
- [ ] Scrolling down shrinks the tab bar; scrolling up or tapping it restores it.
- [ ] While the bar is shrunk, "+ Create" is visible and opens the Create chooser in one tap.
- [ ] With Reduce Motion on, the tab bar never shrinks and stays at full size.
- [ ] The Activity tab uses the GRIIT flame icon; its SF Symbol fallback is flame (not bell).
- [ ] Tab icons are the shipped Lucide icons; if SF Symbols are used, they match the mapping table and appear on the tab bar only.
- [ ] The active tab icon is #DC5401; the active tab label is Text 1; no other orange appears on glass.
- [ ] The primary button is a solid #BB471D fill on every glass surface, with a Text 1 label.
- [ ] Selected glass control = white 14% pill; pressed = white 22% + scale 0.98; disabled = 38% opacity.
- [ ] Top bar is transparent at scroll 0 and fully glass by 8 pt of scroll.
- [ ] Top bar titles are human names ("Posts", the challenge name), never a route.
- [ ] Long top bar titles ellipsize on one line; the subtitle sits underneath.
- [ ] Post headers keep the time on the right on one line; it never wraps into the title.
- [ ] The post sheet asks "Who sees this" once, Friends selected by default, and the button names the choice.
- [ ] Sheets dim the screen with black 35% and close on a tap outside or swipe down.
- [ ] A toast "Share" action opens the sticker carousel.
- [ ] Toasts sit 70 pt above the tab bar, last 4 s, wrap up to 3 lines, and are announced to VoiceOver.
- [ ] Error toasts give the real reason and offer no Retry unless a retry can work.
- [ ] Lists under floating chrome have enough bottom inset that the last item scrolls fully clear.
- [ ] On iOS < 26, and with Reduce Transparency on, every glass surface renders #1A1A1A with a 1 px #2A2A2A hairline.
- [ ] If native tabs or the glass effect don't work on the Expo SDK 54 + iOS 26 build, the app ships the solid fallback bar and surfaces, with the same 5 tabs, icons and states.
- [ ] Every interactive element has an accessibility label and role, and is at least 44 pt.
- [ ] Layout holds on iPhone SE (375 pt, no home indicator) and iPhone 16 Pro Max (440 pt).

### Part 1 · The finish loop
- [ ] Tapping Done on any task opens the post sheet (after the camera for photo tasks); nothing else opens it.
- [ ] The post sheet is the only place the audience is asked; Friends is selected by default.
- [ ] The post button reads "Post to friends", "Post to everyone" or "Save privately" to match the selection.
- [ ] Closing the post sheet without choosing saves privately, shows the toast "Saved privately.", and the task stays done.
- [ ] While posting, the button shows a spinner and "Posting".
- [ ] Offline, the sheet shows the offline line and "Try again", and the task still counts.
- [ ] After posting with tasks left: Home, toast "{task} done. {n} left today.", and the next task is highlighted with "Next".
- [ ] After the last task today: Day secured. After the final day of a challenge: Challenge complete. Never both.
- [ ] The Proof screen never opens in the finish flow.
- [ ] Day secured fits on an iPhone SE (375×667) with no scroll.
- [ ] Day secured order: streak number (Barlow), "Every task today is done.", the week strip with today filled, the tasks, then Share (primary) and Done.
- [ ] Done, Back and swipe-down on Day secured all go to Home.
- [ ] The teaching line shows on the first secured day only, never again.
- [ ] Self-reported Day secured shows no photo placeholder.
- [ ] Challenge complete with other challenges open says "Today isn't secured yet. {challenge} still needs today."
- [ ] The sticker carousel swipes between 4 styles with dots, and the whole card is visible on an iPhone SE.
- [ ] Photo and Week strip export freely; Streak glow and Progress ring show a lock and "GRIIT Pro", and tapping opens the upgrade sheet.
- [ ] With no proof photo, the Photo style is a plain card in the theme colour; no stock or placeholder photo ever appears.
- [ ] The White theme shows no orange except the flame; the Orange theme uses ink type; the ring is never orange.
- [ ] Verified shows only for camera or Strava proof; otherwise "Self-reported".
- [ ] Stickers export as a 1080×1920 story and as a transparent PNG.
- [ ] Run posts show "{d} mi · {time} · {pace} /mi"; workouts "{type} · {m} min"; counters the count; timers the duration.
- [ ] Journal posts show "Journal entry" and never the text; journals default to Only me.
- [ ] Each post has exactly one badge: Verified, Verified by Strava or Self-reported.
- [ ] The post header time stays on one line on the right and never wraps into the title.
- [ ] Double-tapping a photo likes it (never unlikes), shows a white heart for 600 ms and fills the heart icon.
- [ ] A single tap on a photo opens full screen after 250 ms; double-tap works in full screen.
- [ ] Your own posts have no heart button and can't be double-tap liked; they show "Liked by {name} and {n} others".
- [ ] Proof detail has a working Back to the previous screen and scroll position, and no Done button.
- [ ] Proof detail titles are the challenge name, never a route name.
- [ ] The comment bar sits on the keyboard and the latest comment stays visible above it.
- [ ] The owner changes who sees a post from the "…" menu; there is no inline segmented control on the post.
- [ ] The counter can go past the goal ("12 of 10 pages" + check icon); +/− stay active and nothing dims.
- [ ] At the goal the line reads "Goal reached. Done saves it."
- [ ] Run time accepts h:mm:ss; workouts accept minutes.
- [ ] A pace faster than 3:30 /mi shows "That pace looks off. Check the distance and time." and Done is disabled.
- [ ] Short of the goal, the task screen shows "{done} of {goal} · {x} short" and the won't-count line before saving, and the button reads "Save {n} · won't count today".
- [ ] Partial logs add up within the same local day: after a 2 mi save the task reads "2 of 3 mi so far", and a second 1 mi log completes it as "3 of 3 mi"; counters add up the same way; totals reset at local midnight.
- [ ] A short save keeps the task open and doesn't secure the day; it can be posted as "{done} of {goal} · {x} short".
- [ ] Every interactive element has a label and role, and is at least 44 pt.

### Part 2 · Profile and social
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

### Part 3 · The first day, Discover and the challenge page
- [ ] All 7 goal cards are fully visible above the docked button on an iPhone SE, including Faith and prayer.
- [ ] A selected goal card is filled and shows a check icon; a 4th pick swaps out the oldest.
- [ ] Every Start here card has its own Join button; there are no radio buttons.
- [ ] One tap on Join joins the challenge and opens its first task, with the toast "You're in. Day 1 is today."
- [ ] The freeze line appears once on Start here, not on each card.
- [ ] A challenge whose task window has closed today shows "Day 1 is tomorrow at {time}" on its card, its challenge page and its join button ("Join · Day 1 is tomorrow at {time}"); joining sets Day 1 to tomorrow and today is not counted as missed.
- [ ] The first Start here card can always be finished today; a closed-window challenge is first only when nothing else matches.
- [ ] The account screen shows "Continue with Apple" first, email with a one-time code, no password field, and "Not now", on one screen.
- [ ] Code fields use oneTimeCode; the iOS suggestion appears in the keyboard bar and never covers a field; the focused field stays 24 pt above the keyboard.
- [ ] Discover cards show what you do ("Run 3 mi · Strava", "Gym photo · daily"), never just "Camera" or "Self-reported".
- [ ] Discover uses the category motif system (no stock photos), with the day count in Barlow Condensed.
- [ ] Under 5 people shows "New"; 5 or more shows "{n} people".
- [ ] Featured includes at least one run and one gym challenge.
- [ ] Joined challenges show "Joined" (disabled) in Discover; the challenge page never shows Join after joining and never says "You're already in this challenge".
- [ ] Before joining, the challenge page shows what you do each day, how it's proven, Standard/Strict in one line each, and "Join · Day 1 is today".
- [ ] After joining, the top numbers are exactly "Day {n} of {N}" and "{n} days secured", derived from the same day records as the dots (held days don't count as secured), matching Your record and the profile.
- [ ] Week dots: before joining blank, missed slashed ring, freeze snowflake, secured filled, today outlined; the key shows on first view and "Got it" hides it.
- [ ] "Your posts here: {audience} ›" replaces the "Private. Only you." box and opens the audience sheet.
- [ ] The primary is "Start today's task" when open and "Today's task is done" (disabled) when done.
- [ ] When today is secured, Home says "Today is secured. See you tomorrow.", tasks fold into "{n} done", and nothing says "Finish the task".
- [ ] Errors give the real reason; "Try again" appears only when a retry can work.
- [ ] The feed toggle caption matches the selected tab.
- [ ] Proofs lead the feed; "started" events fold into one line per day, after the first proof, never at the top, never adjacent to another, at most one per 5 posts.
- [ ] Started lines aren't likeable or commentable; tapping opens the list.
- [ ] With no proofs, the feed shows the empty state with Discover and Invite and no "started" lines.
- [ ] Secured, Freeze, Self-reported and Verified each show their definition once at their first moment, then a small "i" that opens the words sheet.
- [ ] The first freeze earned shows "You earned a freeze." with the definition and the count; a freeze covering a day shows "A freeze covered yesterday. Your {n}-day streak is safe."
- [ ] Every interactive element has a label and role, and is at least 44 pt.
