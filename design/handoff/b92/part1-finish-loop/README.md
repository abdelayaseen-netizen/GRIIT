# GRIIT build 92 · Part 1 · The finish loop

Prototype: `atlas/GRIIT b92 Part 1 Finish Loop.dc.html` (frames P1-01 to P1-33). Uses the Part 0 glass components (post sheet, toasts, floating action bar, top bars).
Folded in from the earlier "simplify three screens" request: the share card (1.3) and Day secured (1.2). Profile goes to Part 2, the home feed to Part 3.

## What changed and why
- **One finish flow.** Done → post sheet → Day secured, a toast, or Challenge complete. The Proof screen never appears (53 dead taps in build 90).
- **Audience asked once**, in the post sheet. Friends is the default. The button names the choice.
- **Day secured fits on an iPhone SE** with no scroll. Done, Back and swipe-down all go Home. The first secured day gets one teaching line, once.
- **Stickers:** 4 swipeable styles. Photo and Week strip are free; Streak glow and Progress ring are GRIIT Pro. The whole card is visible in the preview. There are no stock photos: a day with no proof photo gets a plain card. Themes follow the orange rule (no orange squares on White).
- **Posts show their result:** run distance, time and pace; workout type and minutes; the count; the duration; "Journal entry". One small badge each.
- **Likes:** double-tap likes; a single tap opens full screen after 250 ms. You can't like your own post; it shows "Liked by Sami and 3 others" with no heart button.
- **Proof detail:** working Back and no Done. The comment bar is pinned above the keyboard. The audience changes from the "…" menu.
- **Inputs:** the counter can go past the goal and nothing dims. Runs take h:mm:ss. An impossible pace blocks Done.
- **Short of the goal is said before Done:** the run is logged but doesn't count.

## Locked decisions in this part
| Decision | Rule |
|---|---|
| Short of the goal | Logged, doesn't count. Saved (and posted if chosen) as "2 of 3 mi · 1 mi short". The task stays open; the day isn't secured. Shown on the task screen before Done. |
| Own posts | Can't be liked. Show "Liked by {name} and {n} others", no heart button. |
| Premium stickers | Free: Photo, Week strip. Pro: Streak glow, Progress ring (lock + "GRIIT Pro"; tap opens the upgrade sheet). |

## Routing (src/finish/routeAfterSave.ts)
1. Short of the goal → Home, toast "Run saved. 1 mi short, so today isn't secured yet.", the task stays open.
2. Finished the whole challenge → Challenge complete (with the "other challenges still need today" line when today isn't secured).
3. Last task today → Day secured.
4. Otherwise → Home, toast "{task} done. {n} left today.", the next task highlighted ("Next").
The Proof screen is never a destination.

## Screens and states
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

## Copy table
| Where | String |
|---|---|
| Post sheet | Post your proof · {task} · {challenge} · Day {n} of {N} · Add a caption (optional) · {count} / 120 · Who sees this |
| Audience | Friends · Everyone · Only me |
| Audience lines | Your {n} friends see it in their feed. · Anyone on GRIIT can see it. · Only you can see it. It still counts for today. |
| Post buttons | Post to friends · Post to everyone · Save privately · Posting · Try again |
| Offline | No connection. Your task is saved and counts. Post again when you're back online. |
| Toast | {task} done. {n} left today. |
| Short toast | Run saved. {x} short, so today isn't secured yet. |
| Closed sheet | Saved privately. |
| Partial | {done} of {goal} {unit} so far · {done} of {goal} {unit} so far today · Add distance · Today's total · Done · {goal} of {goal} {unit} |
| Home row | Next · {done} of {goal} {unit} logged · {x} {unit} to go |
| Day secured | {n} · day in a row / days in a row · Every task today is done. · Share · Done |
| First time | A day is secured when every task in all your challenges is done. |
| Challenge complete | {challenge} · finished · {secured} of {N} days secured · Longest streak · Freeze used / Freezes used · Dates · {start} – {end} |
| Other challenges open | Today isn't secured yet. {challenge} still needs today. |
| Stickers | Share · Photo · Week strip · Streak glow · Progress ring · Free · GRIIT Pro · plain card · Ink · Orange · White · Instagram Story · Copy sticker · Save · Unlock with GRIIT Pro |
| Sticker content | Day {n} · {challenge} · Day {n} of {N} · {n} days in a row · of {N} · Verified · Self-reported · @{handle} · griit.app |
| Upgrade sheet | GRIIT Pro · Everything in Free stays free. · Streak glow and Progress ring stickers · 4 freezes instead of 2 · Stats for every challenge · Auto-verify runs with Strava · {price} a month or {price} a year. Price from the App Store via RevenueCat. · Try GRIIT Pro · Not now |
| Post results | Run · {d} mi · {time} · {pace} /mi · Workout · {type} · {m} min · {n} {unit} · Timer · {m} min · Journal · Journal entry · The entry stays private. · {done} of {goal} {unit} · {x} {unit} short |
| Badges | Verified · Verified by Strava · Self-reported |
| Own post | Liked by {name} and {n} others · Liked by {name} |
| Proof detail | {challenge} (title) · {author} (subtitle) · Add a comment · No comments yet. · Say something to {first name}. |
| Owner menu | Who sees this · Share · Delete post · Delete removes it from the feed only. The proof stays in your record and the day stays secured. |
| Counter | {n} · of {goal} {unit} · Goal reached · Goal reached. Done saves it. · {x} to go. · −1 · +1 · +5 · +10 · Type it · Done · {n} {unit} · Save {n} · won't count today |
| Run | Distance · mi · Time · h:mm:ss · Pace · {pace} /mi · Or connect Strava to verify runs · Done · {d} mi · That pace looks off. Check the distance and time. · {done} of {goal} mi · {x} mi short · Today won't count toward the {goal} mi goal. The run is saved, the task stays open and today isn't secured. · Save {d} mi · won't count today |

## Source (src/finish/)
- `routeAfterSave.ts`: the routing rule.
- `PostSheet.tsx`: on GlassSheet (Part 0).
- `PostResult.tsx`: result cards per task type.
- `format.ts`: result strings, h:mm:ss, pace check, short-of-goal and counter lines.
- `copy.ts`: every string.
- `DaySecuredScreen.tsx`: on FloatingActionBar (Part 0).
- `stickers.ts`: styles, themes, the Pro gate, exports.
- `useDoubleTapLike.ts`: double-tap like and single-tap full screen.

Token names (`DS_V3.type.earnedNumber`, `earnedHero`, `surface`, `captionStrong`) are assumed. Map them to the shipped DS_V3 names; Barlow Condensed 600 is for earned numbers only.

## Acceptance checklist
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
