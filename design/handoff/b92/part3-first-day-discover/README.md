# GRIIT build 92 · Part 3 · The first day, Discover and the challenge page

Prototype: `atlas/GRIIT b92 Part 3 First Day and Discover.dc.html` (frames P3-01 to P3-25). Uses the Part 0 glass chrome and the Part 1/2 components.
Folded in from the earlier "simplify three screens" request: the home feed when it's mostly empty, and how "X started Y" events are grouped and limited so real proofs lead.

## What changed and why (from the build 90 test)
| Evidence | Change |
|---|---|
| "Faith and prayer" hidden under the button, tapped 11 times | 7 goals in 2 columns of 56 pt cards, all above the docked button on SE; Faith and prayer is second |
| Start here radio buttons tapped 38 times (selecting read as joining) | Each card has its own Join; one tap joins and opens the first task |
| "Join" tapped 14 times after joining | Joined challenges say "Joined" (disabled) in Discover; the challenge page says "Start today's task" or "Today's task is done"; "You're already in this challenge" is removed |
| Only 10% understood "Freeze" | Defined once at the moment it happens (first freeze earned, first freeze held), one sentence, then an "i" |

Also:
- **Account:** "Continue with Apple" first, email by one-time code (no password), and "Not now" for guests, all on one screen. The code fields use oneTimeCode, so iOS offers the code in the keyboard bar, never over the fields.
- **Discover:** cards show what you'll do ("Run 3 mi · Strava", "Gym photo · daily"). Categories get a motif-and-texture system on ink with a Barlow day count; no stock photos. Under 5 people shows "New". Featured always includes a run and a gym challenge.
- **Challenge page:** before joining, it shows what you do, how it's proven, and Standard/Strict in one line each. After joining, it shows two numbers only, "Day 5 of 14" and "2 days secured" (held days don't add to secured), both derived from the same days as the dots, plus readable dots with a key on first view, and "Your posts here: Friends ›".
- **Home:** when today is done, "Today is secured. See you tomorrow." and the tasks fold into "4 done". Errors give the real reason, with a retry only when it can work.
- **Feed:** proofs lead. "Started" events fold into one quiet line per day, after the first proof: never at the top, never two in a row, at most one per 5 posts. With no proofs, the empty state points to Discover and Invite; it never shows only "started" lines. The toggle caption matches the tab.
- **Words:** Secured, Freeze, Self-reported and Verified get one definition each, shown once at the moment, then a small "i".

## Screens and states
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

## Copy table
| Where | String |
|---|---|
| Goals | What are you building? · Pick up to 3. We'll suggest challenges that match. · Fitness and gym · Faith and prayer · Running · Reading · Health · Discipline · Mind · Pick at least one · {n} of 3 picked · Continue |
| Start here | Start here · Join one to start today. You can add more later. · Join · Joining · Day 1 is tomorrow at {time} · Browse all challenges · Nothing open right now for {goal}. · Browse all |
| Freeze line (once) | Miss a day? A freeze covers it so your streak doesn't break. You earn one every 7 days in a row. |
| After Join | You're in. Day 1 is today. · Take a gym photo · Live camera only. It stays private unless you post it. · Done · take photo |
| Account | Save your streak · So your challenge and Day 1 are kept if you change phones. · Continue with Apple · or · Email · Continue with email · Send code · We sent a 6-digit code to {email} · Use a different email · Resend in {m:ss} · Not now |
| Account errors | That code didn't match. Check the latest email. · That code expired. Send a new one. |
| Discover | Discover · For you · Fitness · Faith · Mind · Health · Discipline · Featured · For {goals} · {does} · {category} · New / {n} people · days · Join · Joined |
| Challenge (before) | {category} · {N} days · {n} people · Every day · How it's proven · Standard · Miss a day and a freeze can cover it. · Strict: a missed day ends the challenge. Freezes don't apply. · {names} are in · Join · Day 1 is today · Join · Day 1 is tomorrow at {time} |
| Challenge (after) | Day {n} of {N} · {n} days secured · What the dots mean · Got it · Secured · Today · Held by a freeze · Missed · Before you joined · Your posts here: {audience} · Start today's task · Today's task is done |
| Posts-here sheet | Your posts in {challenge} · The default for new posts in this challenge. You can still change it on each post. · Friends · Everyone · Only me · Save |
| Home | Today is secured. See you tomorrow. · {n} done · Show · This task's window closed at {time}. It opens tomorrow. · Couldn't save. No connection. Try again |
| Feed | Feed · Following · Everyone · Proofs from the {n} people you follow. · Proofs from everyone on GRIIT, newest first. · {names} and {n} others started challenges today · {n} people started challenges today · No proofs from people you follow yet. · No proofs yet today. · Find a challenge, or invite a friend to start one with you. · Discover · Invite |
| Words | Secured · Every task today is done, so the day counts toward your streak. · Freeze · Covers one missed day so your streak doesn't break. You earn one every 7 days in a row. · Self-reported · You marked it done yourself, with no photo or app proof. · Verified · Proven by the camera or Strava. · What these words mean |
| Freeze moments | You earned a freeze. · You have {n}. Hold up to 2 (4 with Pro). · Got it · A freeze covered yesterday. Your {n}-day streak is safe. |
| First self-reported | Self-reported: you marked it done yourself, with no photo or app proof. |

## Engineering notes
- Email one-time code: enable Supabase Auth email OTP and configure the OTP email template to send the 6-digit code (not a magic link).
- Joining after today's window closed sets `enrollment.started_on` to tomorrow; today is never counted as missed.

## Source
- `src/onboarding/goals.ts`
- `startHere.ts`: closed-window labelling, Join → first task.
- `AccountStep.tsx`: Apple, email code, Not now.
- `src/discover/discover.ts`: does-lines, people label, category motifs.
- `src/challenge/ChallengeState.ts`: dots, top numbers, primary action, visibility row.
- `src/home/feed.ts`: proofs lead, started grouping, captions, empty state, real errors.
- `src/words/words.ts`: definitions and first-moment flags.

`DS_V3` token names are assumed; map them to the shipped names.

## Acceptance checklist
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
