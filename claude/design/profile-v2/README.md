# Handoff: GRIIT Profile & Settings (v3)

## Overview
Seven screens covering the record surface and the preferences surface: **own profile** (three tabs, four data states), **consistency detail**, **visitor profile** (three visibility states x three relationship states), **edit profile**, **settings** (top level), **notifications** sub-page, **privacy** sub-page.

Design goals driving this version:
- The profile reads as a **record**, not a feed, and it **interprets** rather than counts: headline rate, one verdict word, one plain sentence, detail on tap.
- Each challenge appears in exactly one place — a three-line row in the Challenges tab with a per-day bar that shows misses inside it.
- **Honest cut** — every stat, label and toggle maps to something the backend can compute or enforce. Anything that couldn't is listed under Open questions rather than drawn.
- **No voids.** A Day 1 user's profile shows a record about to start, with the next action on it.
- Settings becomes a five-row list with sub-pages. Duplicated groups, emoji headers, the raw email, the phantom "Movement tab" and the unenforceable Consequences card are gone.
- Reminder time reads the **same source and the same presets** as onboarding.

## About the Design Files
`GRIIT Profile and Settings v3.dc.html` is a **design reference created in HTML** — a prototype showing intended look and behaviour. It is **not production code to copy**. Recreate it in the React Native app using its existing components, navigation and styling. Port the *layout, tokens, copy, states and logic* described below, not the markup.

The prototype includes a **controls panel below the phone** (screen jumps, the four data fixtures, visitor visibility). That panel is prototype scaffolding — do not implement it.

## Fidelity
**High-fidelity.** Colours, type sizes, spacing, radii and interaction states are final.

Placeholders, all labelled in the prototype:
- **Avatar** (own profile 76px, visitor 76px, edit 96px) — striped circle reading "AVATAR PLACEHOLDER".
- **Proof tiles** (Proofs tab 3-up grid, visitor proof strip) — striped squares reading "PROOF IMG".
Everything else is drawn to spec.

---

## Device frame
- Screen canvas **390 x 844**; status bar 54px (system-provided); body 790px.
- Page gutter **28px**. Nav rows (Settings / sub-pages) use 12px so the 44px back target sits flush-left.
- Tab bar 84px, `#FFFFFF`, 1px `#E7E2D8` top border — present on own profile and visitor profile only. Settings, its sub-pages and Edit profile are pushed screens with no tab bar.
- Bottom content padding 34px (respect safe area).
- Profile bodies **scroll**; the tab bar is fixed.

---

## Screen 1 — Own profile

### Layout, top to bottom
1. **Header row** — 48px. `@handle` left (17px/400, `-0.2px`). Right: two 44px circular `#FFFFFF` buttons — share (arrow-up-from-tray) and settings (gear). Hover/press `#EFEBE2`.
2. **Identity block** — 76px circular avatar + name column, `gap: 16px`.
   - Display name 27px / 500 / `-0.9px` / `line-height 1.05`.
   - Counts row, `gap: 16px`, 13px: `{n} Followers` · `{n} Following`. Numbers `#0A0A0A`, labels `#6B6862`. Both tappable -> list screens (not designed here). **"Done" is no longer in this row** — completed challenges live in the Challenges tab.
3. **Bio** — 14px / 1.45 / `#4A4741`, `margin-top: 14px`, max 150 chars, up to 3 lines then truncate with "more".
   - **Empty**: an underlined text button, 14px `#8A867E` — "Add a line about what you are building" -> Edit profile.
4. **Actions** — two 46px buttons, `gap: 10px`, `radius 16`: **Edit profile** (`#0A0A0A` bg, white 15px) and **Invite friends** (`#FFFFFF`, `2px solid #DED9CE`). One primary per screen; Invite is secondary.
5. **Streak card** — one dark card, `#0A0A0A`, `radius 24`, `padding 20`, shadow `0 24px 40px -22px rgba(0,0,0,.45)`. It carries the streak only; "active runs" is gone from it (that count belongs to the Challenges tab) and total verified days moved to the Consistency detail page.
   - Top row: "CURRENT STREAK" 11px / `1.4px` / `#8A867E` left; `BEST · {n} days` 11px / `0.5px` / `#8A867E` right.
   - Value 54px / 500 / `-2.4px` / `line-height .95` / `#FFFFFF`, baseline unit "days" / "day" 15px `#A8A49C`.
   - Note 13px `#A8A49C`: `Unbroken since {date}.` — or, when current = 0, **"Post today to start."** (never blank). Both states are in the prototype: 7 days / "Unbroken since 29 Aug." and 0 days / "Post today to start."
   - This is the only dark card on the screen.
6. **Consistency card** — `#FFFFFF`, `radius 22`, `padding 18`. Headline → verdict → detail on tap. GRIIT has exactly one honest signal, **verified days ÷ due days**, so the card leads with that rate, attaches one word so the user does not have to interpret it, and states one plain sentence.
   - Title row: **"CONSISTENCY"** 11px / `1.4px` / `#8A867E` left — the same label treatment as "CURRENT STREAK", so the two cards read as siblings and nothing competes with the 40px rate. Right, the window control — two 44px buttons, `radius 13`, 12px, `1.5px` border (selected `#0A0A0A`/white; unselected `#FFFFFF`/`#DED9CE`/`#6B6862`): **30 days** (default) · **6 months**. Hidden when there are fewer than 7 due days.
   - Rate 40px / 500 / `-1.6px` / `#0A0A0A`, then the verdict word 17px on the same baseline, `#DC5401` for "Locked in" and `#4A4741` otherwise.
   - Sentence 13px / 1.45 / `#4A4741`: states the counts and what is due. Never motivational.
   | Rate (closed due days) | Word |
   |---|---|
   | >= 90% | Locked in |
   | 75–89% | Solid |
   | 50–74% | Slipping |
   | < 50% | Rebuilding |
   | < 7 due days | no word, no percentage — show "{v} of {v} verified" instead |
   - Sentence examples: "10 of 11 due days verified. 1 due today." · "You've missed 3 of the last 7. Today counts." · "Day 3 of 30. Today's proof is due." · "Join a challenge and the strip starts filling."
   - **Due-day strip**: one cell per **due day** in the window, newest on the right — `display: flex; justify-content: flex-end; gap: 2px`, cells 26px tall, `radius 3`, `1.5px` border. Days with no challenge running are **not rendered at all** (a pale "not due" cell reads as a miss), so the strip grows from the right as the record grows: 3 due days = three cells at the right edge, 30 due days = a full row.
     - Cells are **`box-sizing: border-box`** with `gap: 4px`, width = `clamp(6, floor((innerWidth - (n-1) * 4) / n), 24)` px — measured at the 390pt canvas (innerWidth 298): **24px at 3 due days, 21px at 12, 6px at 30**, total row width 298px with zero overflow either side at every count. The border must be inside the box or the row overruns the card. Never a fractional `flex: 1` cell, never a horizontal scroll; the 30-day window caps n at 30, so one row always fits.
     - States: verified `#DC5401`; missed `#F1EDE4` with `#C4BEB2` border; today `#FFFFFF` with `dashed #DC5401`.
     - Legend one line, three items, 11px `#8A867E`: Verified · Missed · Today. No explainer sentence under it — the legend is the explanation.
     - Zero due days: no strip and no legend — the sentence carries the state.
   - **6-month view**: 26 weekly bars in a 92px-tall row, `gap: 2px`, each `flex: 1`, `radius 2px 2px 0 0`, height = `round(weekRate * 92)` with a 4px minimum, on a `1px #EFEBE2` baseline. Weeks with no due days render a 3px `#EFEBE2` stub. A `1px dashed #8A867E` line spans the plot at `bottom: round(sixMonthAverage * 92)px` — the user's own baseline, so weeks read as above or below *their* normal, not against other people. Footer: window start month left, "Dashed line · your average {n}%" right, then one 11px note: "One bar per week, verified ÷ due. Blank weeks had no challenge running."
   - **Not 12 months, not a heatmap.** Six months is the longest window that stays legible at this width, and five shades of orange imply an intensity that binary verification does not carry.
   - Footer action: a 44px `2px solid #DED9CE` button "See the full record" → Consistency detail. (In production the whole card is also tappable.)
7. **Tabs** — three equal 44px pills, `gap: 8px`, `radius 14`, 14px/400, `2px` border. Selected `#FFFFFF` bg / `#DC5401` border + text; unselected transparent / `#E7E2D8` border / `#6B6862`. Labels **Challenges · Proofs · Badges** (Posts renamed to Proofs).

### Tab: Challenges
One row per challenge, and challenges appear **nowhere else on the profile** — the promoted run card and the mini second-run row are gone, because they duplicated these rows.
- **Row** — `#FFFFFF`, `radius 18`, `padding 15px 16px`, three lines and no more:
  1. Name left and `Day {n} of {length}` right, **same size and weight** (16px / 400 / `-0.2px`).
  2. **Per-day bar** — one segment per day of the challenge, `display: flex` with no gaps, 6px tall, `radius 3`, `overflow: hidden`; verified `#DC5401`, missed `#C4BEB2`, today `#F6D6BB`, future `#E2DDD2`. One bar, misses visible inside it, and it reads as progress at a glance.
  3. One muted line 12px `#8A867E`, verified first: "10 verified · 1 missed · 2 tasks daily".
- Tapping a row opens challenge detail (its own calendar, tasks, circle) — not designed here.
- **Completed group** — micro header "COMPLETED · {n}", then `#EFEBE2` rows, `radius 18`: name 15px left, completion rate `{v} of {length}` 12px `#6B6862` right (the rate, not the month).
- **Empty** — `#FFFFFF` card, `radius 20`, centered: "No active challenge" 16px, "Start one from Discover. Day 1 begins the morning after you join." 13px, then a 48px `#DC5401` CTA "Go to Discover". This is the screen's one primary action in that state.

### Tab: Proofs
- **Populated** — 3-column grid of square tiles, `gap: 6px`, `radius 12`. Each tile shows a `Day {n}` chip bottom-left (10px, `rgba(255,255,255,.82)`, `radius 5`). Tapping opens the proof detail (not designed here). Footnote 12px `#8A867E`: "Every tile is a live-camera capture."
- **Derive the tile list from the same verified-day set as the strip** — never from a day range. Today has no tile until it is verified, and a missed day has no tile at all; in the main fixture that means Day 11, 10, 9, 8, 7, 6, 5, 3, 2 (Day 12 is today, Day 4 was missed). Empty vs populated keys off the proof count, not off how new the account is.
- **Empty** — `#FFFFFF` card, `radius 20`, `padding 20`: three dashed square outlines (`#DED9CE`, `#E7E2D8`, `#EFEBE2` — a fading row, not a void), then copy that matches the state:
  - with a run, nothing verified yet: "Day 1 proof is due today" 16px / "Proofs land here the moment the camera verifies one. Nothing can be uploaded from your library." / 48px `#DC5401` CTA "Post today’s proof".
  - no challenge: "No proofs yet" / "Join a challenge and every verified day lands here as a photo." / CTA "Go to Discover".

### Tab: Badges
Five rows, not a padlock grid. Each row states the rule and the live distance to it, so a locked badge is a path rather than a closed door.
- Row: `radius 18`, `2px` border, `padding 14px 16px`. Name 15px/`-0.2px`; right-side state 11px/`0.6px`. Rule line 12px `#8A867E`.
  - **Earned** — the state reads `Earned {d Mon yyyy}` in `#DC5401` and there is **no progress bar** (a permanently full bar is noise; the date is the fact).
  - **In progress** — the state reads `{have} / {need}` in `#8A867E`, and a 4px `#E2DDD2` track with a `#CFC9BC` fill shows the distance.
- Earned rows: `#FFFFFF` bg, `#E7E2D8` border. Unearned: transparent bg, `#E2DDD2` border.
- The five marks (renamed to state their own rule — no invented tiers):
  | Name | Rule | Source |
  |---|---|---|
  | 3 days | Three consecutive verified days | `bestStreak >= 3` |
  | 7 days | Seven consecutive verified days | `bestStreak >= 7` |
  | 14 days | Fourteen consecutive verified days | `bestStreak >= 14` |
  | 30 days | Thirty consecutive verified days | `bestStreak >= 30` |
  | 100 verified | One hundred verified days in total | `verifiedDays >= 100` |
- Footnote 12px `#8A867E`: "Five marks, each earned by verified days only. Nothing here can be bought or awarded."

---

## Screen 2 — Consistency detail

Pushed from the Consistency card ("See the full record", and in production the whole card). Nav 52px, back chevron, centered title "Consistency".
- Repeats the rate, verdict and sentence at the top (40px / 17px / 13px).
- **Facts card** — `#FFFFFF`, `radius 20`, four 50%-width cells split by `1px #EFEBE2`: LONGEST STREAK, TOTAL VERIFIED, COMPLETION (`{v} of {d} due days`), FIRST PROOF (`12 Jun 2026`). Label 10px / `0.7px` `#8A867E`; value 16px / 500.
- **BY MONTH** — one row per month: label 74px wide 14px, a 6px `#E2DDD2` track with `#DC5401` fill at that month's rate, and `{v} of {d}` 12px `#8A867E` right.
- **BY CHALLENGE** — one row per run, name 14px left, `{v} of {d}` 13px `#6B6862` right, active and completed runs together.
- Closing note 12px `#8A867E`: "A day inside more than one challenge counts once in the totals. Every figure here is a count of verified proof rows."
- The month-by-month grid is where a calendar view belongs if one is ever built. It is not on the profile.

---

## Screen 3 — Visitor profile

Same skeleton, three differences: back chevron + overflow menu instead of handle/gear; Follow control instead of Edit; the record is gated by the owner's privacy settings.

**Header** — 44px back chevron left, 44px three-dot overflow right (Report, Block, Share — sheet not designed).

**Identity** — avatar, display name 27px/500, `@handle` 13px `#8A867E` beneath, bio 14px.

**Relationship control** — 46px, `flex: 1`, `radius 16`, 15px, beside a 46px square message button (`2px solid #DED9CE`).
| State | Label | Style |
|---|---|---|
| Not following, profile Public | `Follow` | `#DC5401` bg, white |
| Not following, profile Friends/Private | `Request` | `#DC5401` bg, white |
| Request sent | `Requested` | `#FFFFFF`, `#DED9CE` border, `#6B6862` |
| Following / accepted | `Following` | `#FFFFFF`, `#DED9CE` border, `#0A0A0A` |
Tapping `Following` opens an unfollow confirm (not designed).

**Open state** (viewer is allowed to see the record) — streak card, Consistency card (same rate + verdict + 30-day / 6-month control, with *their* average on the baseline), an "ACTIVE RUNS" group using the same three-line row, and a 6-tile proof strip. Same components as own profile, no edit affordances.

The visitor fixture obeys the same rule as the owner's: current streak 47 days (unbroken since 21 Jul), so the last seven weekly bars are 100% and every miss is older than that date; 30-day line "29 of 29 due days verified. 1 due today."; proof tiles start at Day 46, not Day 47 (today has no proof yet).

**Gated state** — identity block, bio and the relationship control stay visible; everything below is replaced by:
- Lock card — `#FFFFFF`, `2px solid #E7E2D8`, `radius 22`, `padding 24px 20px`, centered: 22px line lock icon, title 17px, body 13px/1.5 `#6B6862`.
  - Friends-only: "Visible to their circle" / "Marcus shows the streak, activity and proofs to people they have accepted. Send a request to see the record."
  - Private: "This profile is private" / "Marcus keeps this record private. Nothing is shown, and requests are not accepted automatically."
- Two `#EFEBE2` tiles, `radius 16`: **STREAK** / **CONSISTENCY**, both reading "Hidden" in 19px `#8A867E` — the labels name the two cards that would have been shown. Hidden is stated, never faked with blurred numbers.

**Per-setting gating (implement all three, not just profile):**
| Owner setting | Public | Friends (viewer not accepted) | Private |
|---|---|---|---|
| Profile | full record | lock card, identity only | lock card, identity only |
| Challenges | ACTIVE RUNS group | group hidden | group hidden |
| Activity and proofs | Consistency card + proof strip | both hidden | both hidden |
A viewer who is **accepted** sees Friends-level content as Public. The owner always sees their own profile in full.

---

## Screen 4 — Edit profile

**Nav** — 52px, 1px `#E7E2D8` bottom border: `Cancel` (15px `#6B6862`) · title "Edit profile" 15px · `Save` (15px `#DC5401`, `#C9C4BA` when blocked). Both hit targets 44px tall.

**Avatar block** — centered: 96px circle, then a 40px "Change photo" button (`2px solid #DED9CE`, `radius 14`), then helper 12px `#8A867E`: "Square crop — crops to a circle everywhere." Picker is the iOS square cropper.

**Fields** (`gap: 20px`), each: micro label 11px/`0.8px` `#8A867E`, control, helper 12px `#8A867E`.
1. **Display name** — 52px input, `radius 16`, `2px solid #E7E2D8`, 16px text, focus border `#0A0A0A`. Max 30 chars.
2. **Username** — 52px row containing a `@` prefix (16px `#8A867E`), the input, and a right-aligned status word 12px.
   - Normalise on input: lowercase, strip anything outside `[a-z0-9_]`, max 20.
   - `< 3 chars` -> "3 characters min", border + text `#A4341A`, Save blocked.
   - taken -> "Taken", border + text `#A4341A`, Save blocked. Debounce the availability call 400ms; show nothing while in flight.
   - free and changed -> "Available" `#2E6B33`. Unchanged -> no status word.
   - Helper: "Lowercase letters, numbers and underscores. Changing it breaks old links to your profile."
3. **Bio** — 4-row textarea, `radius 16`, 15px/1.45, hard cap **150**. Counter sits in the label row, right-aligned, `{n}/150`, turning `#A4341A` above 140. Helper: "Shown on your profile to anyone who can see it."

**Behaviour** — edits are staged; Cancel discards, Save commits and returns to the profile. Save is disabled while the username is invalid. A dirty-state discard confirm is an open question.

---

## Screen 5 — Settings (top level)

**Nav** — 52px, back chevron, centered title "Settings".

**One card**, `#FFFFFF`, `radius 20`, rows separated by 1px `#EFEBE2` (no separator above the first). Row: min-height 62px, `padding 12px 16px`, 20px line icon (`stroke-width 1.6`, `#4A4741`), label 15px, sub-label 12px `#8A867E`, 8px chevron `#C6C1B7`.

| Row | Icon | Sub-label (live) | Sub-page |
|---|---|---|---|
| Account | user | `Signed in with {provider} · {maskedEmail}` | Sign-in method, email (masked, tap to reveal), export data |
| Notifications | bell | `Daily reminder at {time}` / `Daily reminder off` | Screen 5 |
| Privacy | eye | `Profile {level} · Activity {level}` | Screen 6 |
| Subscription | credit-card | `Free plan · 1 streak freeze a month` / `Premium · renews {date}` | Paywall / manage |
| About | info | `Version, terms, privacy policy, contact` | Version, Terms, Privacy Policy, Contact |

**Below the card** — `Sign out` (52px, `#FFFFFF`, `2px solid #DED9CE`, `#0A0A0A`) and `Delete account` (52px, transparent, `#A4341A`, hover bg `#F3E5DF`), `gap: 10px`. Then `GRIIT 1.0.0` centered, 12px `#8A867E`. Both destructive actions need a confirm sheet; delete requires typing the username (sheet not designed).

**Removed from today's Settings, deliberately:**
- The duplicate Sign Out / Delete / About groups (they appeared twice).
- Emoji section headers — replaced by line icons on rows.
- The raw email at top level — moved into Account, masked.
- The Friends card (0 friends / 0 pending, "find friends on the Movement tab") — that tab does not exist. Circle counts belong on the profile.
- The **Consequences** card. It described tier drops, "On Thin Ice" and forced 7-day rebuilds. See Open questions.
- **Morning Kickoff** — a motivational push with no relationship to whether the day is verified. It is the "nag" the product promises not to be.
- **Home screen card** — a Home-tab layout preference, not a notification. Belongs wherever Home preferences land.

**Legal pages** keep the existing content but need a real `Last updated` date (currently "March 2025" on both) and should scroll from the top rather than mid-document.

---

## Screen 6 — Notifications

**Reminder card** — `#FFFFFF`, `radius 20`, `padding 16`.
- Row: label "Daily reminder" 15px over sub 12px `#8A867E` "One push a day if today has no verified proof yet."; 50x30 toggle right (`radius 15`, 3px padding, 24px white knob; track `#DC5401` on / `#E2DDD2` off, `transition: background .2s`).
- When on, a divider (1px `#EFEBE2`, 16px above/below) then **SEND IT AT** 11px/`0.8px` `#8A867E` and the picker.

**Picker — identical to onboarding step 6, reading the same `reminderTime` value.**
- Preset row: four equal 56px buttons, `gap: 7px`, `radius 15`, `2px` border, time 15px over meridiem 10px `opacity .65`. Selected `#0A0A0A` bg/border, white text; unselected `#FFFFFF` / `#E7E2D8` / `#0A0A0A`.
- Presets: **6:00 AM · 8:00 AM · 12:00 PM · 7:00 PM** (the old 7:00 AM / 9:00 AM / 10:00 AM set is gone — onboarding is the source of truth).
- "Pick a custom time" underlined link, 13px `#6B6862`.
- If a custom time is saved, a 48px row appears above the link: `#0A0A0A` bg when custom is the active choice (`#F5F2EC` when a preset has since been picked), `radius 15`, "CUSTOM" 11px/`0.7px` `#8A867E` left, the saved time 15px right. Tapping reopens the panel.
- Custom panel (replaces the presets in place, not a modal): draft readout 26px/500/`-0.8px`; AM/PM pair (46x34, `radius 10`); HOUR 6-col grid of 34px buttons 1–12; MINUTES 4-col grid `:00 :15 :30 :45`; selected `#DC5401`. Actions: "Back to presets" (discards) and "Use {draft}" (commits). Draft is staged; reopening re-seeds from the saved custom value.

**OTHER PUSHES** — one `#FFFFFF` card, `radius 20`, rows `padding 15px 16px` split by 1px `#EFEBE2`, same toggle spec.
| Toggle | Sub-label | Default | Fires when |
|---|---|---|---|
| Last call | "60 minutes before the day resets, only if the day is unverified." | on | `now = dayReset - 60min AND today has no verified proof` |
| Circle activity | "When someone in your circle verifies a day." | on | accepted-circle proof verified |
| Weekly summary | "Sunday: days verified, days missed, streak state." | off | Sunday 18:00 local |
| Lock screen timer | "Live activity while a timed task is running." | on | timed task start/stop (iOS Live Activity, not a push) |

Footnote 12px `#8A867E`: "Turning the system permission off in iOS Settings silences all of these, and GRIIT will show that state here." **Implement that state:** when OS permission is denied, show a `#EFEBE2` banner above the reminder card with "Notifications are off in iOS Settings" and an "Open Settings" button, and render every toggle disabled at 50% opacity rather than lying about being on.

---

## Screen 7 — Privacy

Intro 13px `#6B6862`: "Three controls, applied everywhere your record appears — profile, search and shared links."

Three cards, `#FFFFFF`, `radius 20`, `padding 16`, `gap: 12px`. Each: label 15px; a 3-up segmented row (44px, `radius 13`, `2px` border, 14px — selected `#0A0A0A`/white, unselected `#FFFFFF`/`#E7E2D8`/`#0A0A0A`); explanation 12px/1.45 `#8A867E` that **changes with the selection**.

| Control | Public | Friends | Private |
|---|---|---|---|
| Profile | "Anyone can open your profile and see your bio, stats and activity." | "Only people you have accepted see the record. Others see your name, photo and bio only." | "Nobody but you. You still appear to people inside challenges you share." |
| Challenges | "Anyone can see which challenges you are running and how far in you are." | "Only your circle sees your runs. Others see the tab as hidden." | "Your runs are hidden from your profile entirely." |
| Activity and proofs | "Anyone can see your 365-day map and your proof photos." | "Only your circle sees your map and proof photos." | "Your map and proofs are yours alone." |

**Honesty panel** — `#EFEBE2`, `radius 20`: "None of this hides a proof from a challenge you joined" / "Everyone in a shared challenge sees whether you verified the day. Privacy controls what your profile shows outside it." This is true of the current data model and must not be dropped.

**Footer** — 48px `2px dashed #D5D0C5` button "See how a stranger sees your profile" -> the visitor view of the user's own profile, rendered with their current settings. It is the only way a user can check what they just changed.

---

## Interactions & behaviour
- **Navigation** — Profile (tab) -> gear -> Settings (push) -> sub-page (push). Edit profile pushes from the profile. Visitor profile pushes from anywhere a user is tapped, and from the Privacy footer button.
- **Tabs** — client-side; selection is not persisted across app launches (Challenges is always the landing tab).
- **Toggles** — optimistic, with a revert + inline error if the write fails.
- **Privacy** — writes immediately, no Save button. The explanation line updates on selection.
- **Screen entrance** — `griitFade` 300ms (8px rise + fade), keyed on screen and on the data/tab pair.
- **Selection controls** — `transition: all .18s ease`. Toggles `background .2s ease`.
- **Hit targets** — every control is >= 44pt tall, with one stated exception: the 50x30 switches, which sit inside rows >= 62px tall where **the whole row is tappable** (tapping anywhere on the row toggles it). Text links ("Pick a custom time", "Add a line about what you are building") carry a 44px-tall hit area around 13-14px text. Header buttons 44px, tabs 44px, segmented and range options 44px, custom-time hour/minute/meridiem buttons 44px, "Change photo" 44px, nav back 44px. The onboarding v4 custom-time panel uses 34px grid buttons; this surface raises them to 44px and onboarding should follow.
- **Haptics** — light on toggle and tab change; warning on a blocked Save.

## State model
```
// profile (server)
user: { id, handle, displayName, bio, avatarUrl, provider, email, joinedAt }
stats: { verifiedDays, currentStreak, bestStreak, completionRate, scheduledDays, completedChallenges }
runs: [{ id, name, day, length, tasksPerDay, verified, missed }]
completed: [{ id, name, finishedAt, verified, length }]
proofs: [{ id, day, thumbUrl, capturedAt }]
activity: [{ date, verifiedCount }]        // 365 entries, sparse

// viewer context (visitor profile)
viewer: { relationship: 'none'|'requested'|'accepted'|'self' }
gate:   { profile, challenges, activity }  // resolved server-side, never client-side

// settings (client mirror, persisted)
notifications: {
  reminderEnabled: bool                        default true
  reminderTime: 'am6'|'am8'|'pm12'|'pm7'|'custom'   default 'am6'   // shared with onboarding
  customTime: { h: 1-12, m: '00'|'15'|'30'|'45', mer: 'AM'|'PM' } | null
  lastCall: bool          default true
  circleActivity: bool    default true
  weeklySummary: bool     default false
  liveActivity: bool      default true
  osPermission: 'granted'|'denied'|'undetermined'
}
privacy: { profile: 'public'|'friends'|'private', challenge: ..., activity: ... }   // default public/public/friends

// edit profile (staged, local)
draft: { displayName, username, bio }
usernameState: 'idle'|'checking'|'available'|'taken'|'tooShort'
```

**Derived, never stored:** `consistencyWindow: '30d'|'6mo'` (local, defaults `30d`, not persisted); `rate = verifiedClosedDueDays / closedDueDays`; `verdict` from the rate table (no word under 7 due days); `completionShown = scheduledDays >= 14`; run progress `verified / length`; badge state; settings sub-labels; the visitor gate result; `timeText`.

### Stats — one query each (honest cut)
**Derive every string from one fixture.** The streak card, the Consistency card, the strip, the challenge rows and the detail page all describe the same days, so they must be computed from the same rows, never written separately. The prototype ships three fixtures, and every string on every screen is derived from the one in play.

**A — 11 closed due days (the main fixture).** First proof 25 Aug 2026. Read Something from 25 Aug, day 12 of 30 today, day 4 (28 Aug) missed. Cold Plunge Ladder from 3 Sep, day 3 of 14. Nothing before 25 Aug and nothing completed. Everything else follows:
| Surface | Value |
|---|---|
| Streak card | current 7 days (since 29 Aug), best 7 days |
| Consistency | 91% · Locked in · "10 of 11 due days verified. 1 due today." |
| Strip | 12 cells: 3 verified, 1 missed, 7 verified, today |
| Challenges | Read Something Day 12 of 30 — 10 verified · 1 missed; Cold Plunge Ladder Day 3 of 14 — 2 verified · 0 missed; no Completed group |
| Proofs | 10 tiles — Day 11, 10, 9, 8, 7, 6, 5, 3, 2, 1 (no today, no missed day) |
| Badges | 3 days earned 31 Aug 2026; 7 days earned 4 Sep 2026; 14 days 7 / 14; 30 days 7 / 30; 100 verified 10 / 100 |
| Detail page | longest 7 days · total 10 days · 10 of 11 due days · first proof 25 Aug 2026 · Sep 4 of 4, Aug 6 of 7 |
| 6 months | 24 blank weeks, then 86% and 100%; baseline 93% |

**D — 30 due days (the widest one row can get).** Read Something day 30 of 30 today, misses on day 4 and day 12. Streak 17 days (since 19 Aug), best 17, total 27. Consistency 93% · Locked in · "27 of 29 due days verified. 1 due today." Strip is 30 cells at 6px. Badges: 3 days earned 21 Aug, 7 days earned 25 Aug, 14 days earned 1 Sep, 30 days 17 / 30, 100 verified 27 / 100.

**B — 2 closed due days (3 cells).** Joined 3 Sep, day 3 of 30 today. Streak 2 days / best 2. Consistency shows "2 of 2" with no percentage and no verdict word. Strip is three cells. Proofs: Day 2, Day 1. No badge earned (3 days sits at 2 / 3). Range control hidden.

**C — no challenge.** 0 due days. Streak 0 with "Post today to start." Consistency reads "No due days" with no strip and no legend. Challenges tab shows the one primary CTA ("Go to Discover"); Proofs shows "No proofs yet". Every badge at 0 and every detail fact "—".

Two runs can share a date; a shared date is **one** due day and **one** verified day in the totals, which is why per-challenge counts (10 of 11 plus 2 of 2) do not sum to the 10-day total. State that in the query layer, not on the screen.
| Stat | Query |
|---|---|
| Days verified | `select count(distinct date) from proofs where user_id = $1 and status = 'verified'` |
| Current streak | longest run of consecutive verified dates ending today or yesterday |
| Best streak | longest run of consecutive verified dates, all time |
| Consistency rate | `count(distinct date) where verified / count(distinct date) where due and date < today` over the window — today is excluded from the rate and reported separately as "1 due today" |
| Due days | `select distinct date from run_days where user_id = $1 and date between run.start and least(run.end, today)` — a date inside two runs is one due day |
| Weekly rate (6-month view) | the same two counts grouped by ISO week; weeks with zero due days return null and render blank |
| Six-month average | mean of the non-null weekly rates — the dashed baseline is the user's own average, never a cohort average |
| Completion (detail page) | `verified due days / due days` over all time |
| First proof | `select min(captured_at) from proofs where user_id = $1 and status = 'verified'` |
| Completed challenges | `select count(*) from runs where user_id = $1 and state = 'completed'` |
| Activity map | `select date, count(*) from proofs where user_id = $1 and status = 'verified' and date > now() - 365 group by date` (30-day view reads the last 30 rows; 12-month view aggregates by month) |
| Followers / Following | `count` on the follow edge table, accepted only |
| Badge progress | `bestStreak` for the four streak marks, `verifiedDays` for "100 verified" |

Everything on these screens comes from one of those rows. No stat is inferred, weighted or scored.

## Design tokens
Inherited from the onboarding v4 handoff, with the corrected brand orange.

| Token | Hex | Use |
|---|---|---|
| Ink | `#0A0A0A` | Text, dark streak card, selected segmented control |
| Ink hover | `#232220` | Black button press |
| Body | `#4A4741` | Bio, icon strokes, tertiary labels |
| Muted | `#6B6862` | Sub-copy, secondary labels |
| Muted light | `#8A867E` | Meta, micro labels, sub-labels |
| Muted on dark | `#A8A49C` | Meta inside the streak card, inactive tab-bar items |
| Orange | `#DC5401` | Accent: primary CTA, selection, progress fill, active tab |
| Orange press | `#B44100` | Primary CTA press |
| Danger | `#A4341A` | Delete account, invalid field |
| Danger wash | `#F3E5DF` | Delete row press |
| Success | `#2E6B33` | "Available" |
| Canvas | `#F5F2EC` | Screen background |
| Surface | `#FFFFFF` | Cards, controls |
| Surface sunken | `#EFEBE2` | Completed rows, hidden-stat tiles, honesty panel, row separators |
| Surface warm | `#EAE6DE` | Back-chevron press |
| Row press | `#F7F4EE` | Settings row press |
| Border | `#E7E2D8` | Default control border, tab-bar rule |
| Border strong | `#DED9CE` | Secondary button border |
| Border dashed | `#D5D0C5` | Dashed footer button |
| Track | `#E2DDD2` | Progress track, future days in a per-day bar, toggle off, unearned badge border |
| Missed | `#C4BEB2` | Missed days inside a per-day bar; missed-cell border in the strip |
| Today (bar) | `#F6D6BB` | Today's segment in a per-day bar |
| No run | `#F7F4EE` | Days with no challenge running, in the 30-day strip |
| Chevron | `#C6C1B7` | Row chevron |
| Heat 0-4 | `#E7E2D8` `#F6D6BB` `#EDA871` `#DC5401` `#A03C00` | Activity map levels |

**Typography** — Archivo, **weights 400 and 500 only**. Hierarchy comes from size and letter-spacing.
| Role | Size / Weight / Tracking |
|---|---|
| Streak number | 54 / 500 / -2.4 |
| Consistency rate | 40 / 500 / -1.6 |
| Display name | 27 / 500 / -0.9 |
| Custom time readout | 26 / 500 / -0.8 |
| Stat value | 19 / 500 / -0.6 |
| Card title / handle | 15-17 / 400 / -0.2 |
| Body, bio | 13-15 / 400 / — (line-height 1.45) |
| Meta | 12 / 400 / — |
| Micro label | 10-11 / 400 / 0.6-1.4 |

**Spacing** — 2, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 28, 34. Gutter 28. Card padding 13-20. Stack gap 9-10 (dense) / 12 (cards) / 18-22 (sections).

**Radii** — 1-2 (heat cell, progress), 5 (strip cell), 9-10 (grid button), 12-13 (proof tile, segmented), 14-16 (button, tab, tile), 18 (row card), 20-22 (panel, list card), 24 (streak card), 50% (avatar, toggle).

**Shadow** — streak card only: `0 24px 40px -22px rgba(0,0,0,.45)`. Nothing else casts a shadow on these screens.

**Borders** — 2px on interactive controls; the width never changes between states (selection is colour only) so nothing shifts. 1px hairlines for list separators and the tab-bar rule.

**Icons** — Lucide-style line icons, 18-22px, `stroke-width 1.6`, round caps and joins: share (arrow-up-from-tray), gear, user, bell, eye, credit-card, info, lock, message, chevron. **No emoji anywhere.** The two-bar logo mark stays the only illustrative element and does not appear on these screens.

## Assets needed
1. **Proof thumbnails** — real verified captures at 3 columns wide (114px at 1x, needs 2x/3x). Currently striped placeholders.
2. **Avatars** — real profile images; the striped circle is a placeholder, and the shipped empty state should be a neutral `#E4DFD5` circle with initials.
3. **Icon set** — the ten line icons above, from the app's existing Lucide set.

## Open questions — decide before build
1. **Consequences.** The current Settings card promises "tier drops", an "On Thin Ice" warning state and a forced 7-day rebuild after 14 missed days. Does the backend apply any of that? If yes it belongs on the challenge screen where it takes effect, worded to match the code. If no, it stays deleted. Not drawn either way.
2. **Streak freezes.** The Subscription sub-label says "Free plan · 1 streak freeze a month" from the existing paywall copy. Confirm the free allowance and whether remaining freezes should show on the profile.
3. **Completion rate denominator.** Does `scheduledDays` count days on a paused run, and days before a user joined mid-challenge? The number is only honest once that is defined.
4. **Followers vs circle.** The profile says Followers / Following; Settings said "Friends" and onboarding says "circle" (max 8 invites). Are these one relation or two? The visitor gating and the Friends privacy level both depend on the answer, and the copy should use one word.
5. **Follow requests.** Are Friends-only and Private profiles request-based (accept/decline) or invite-only? The `Requested` state assumes requests exist.
6. **Consistency windows.** 30 days and 6 months are a design judgement (6 months over 12 because it stays legible at 390pt). Confirm the backend can distinguish *missed* (a due day with no verified proof) from *no challenge running* — the strip draws them differently and must not guess.
7. **Badge set.** The five marks are re-derived from streak length. Confirm they replace the old named tiers (3-Day Fire, Week Warrior, Fortnight, Month Master, Iron Will) rather than renaming them in place, and whether earning one should notify.
8. **Data export** is listed under Account but not designed; the privacy policy promises deletion, not export.
9. **Blocking and reporting** sheets on the visitor overflow menu are referenced and not designed.
10. **Legal pages** need a current `Last updated` date and a scroll-to-top fix.

12. **Verdict wording.** "Locked in / Solid / Slipping / Rebuilding" are ours, not the backend's. Confirm the thresholds (90 / 75 / 50) and that no push notification or state change is attached to them — they are a reading of the rate, not a tier.
13. **Rest days.** The strip draws days with no challenge running as pale cells and excludes them from the rate. If a challenge ever ships with scheduled rest days, they need a distinct state; today the app cannot express one, so it is not drawn.
14. **"Post today's proof" on the profile.** The promoted run card (with today's tasks and a post CTA) was removed so challenges live in one place. If product wants the profile to be actionable, the cleanest version is a single pinned row above the tabs — flag it and we will design it rather than reinstating the duplicate.
15. **Streak definition.** Current streak is consecutive verified *due* days; a day with no challenge running neither breaks nor extends it. Confirm that matches the backend, because it is the difference between a 7-day and a 0-day streak on the same data.

## Not designed here
Follower / following list screens, proof detail, challenge detail, the paywall (exists), Account sub-page internals, About sub-page internals, confirm sheets (sign out, delete, unfollow, discard edits), block/report sheets, and the notification-permission-denied banner beyond the rule stated in Screen 5.

## Files
- `README.md` — this spec. Self-sufficient: build from it alone.
- `GRIIT Profile and Settings v3.dc.html` — **the prototype.** Clickable through all seven screens; the panel below the phone is prototype scaffolding that switches the four data fixtures (3 / 12 / 30 due days, no challenge), jumps between screens, and switches the three visitor visibility states. Keep `support.js` beside it.
- `GRIIT Profile and Settings (standalone).html` — the same prototype as one offline file, for sharing and review.
- `support.js` — prototype runtime. Not product code; do not port it.
- `src/` — the unbundled source as plain React + CSS, a reading aid that shows structure and exact values in ordinary component form: `tokens.css`, `styles.css`, `fixtures.js` (the four datasets plus `cellWidth`, `runStates`, `verdictFor`, `weeklyAverage`, `badgeRows`), `App.jsx`, `components/` (StreakCard, ConsistencyCard, DueDayStrip, WeeklyBars, ChallengeRow, Switch, TabBar, Icons) and `screens/` (OwnProfile, ConsistencyDetail, VisitorProfile, EditProfile, Settings, Notifications, Privacy). Not a build target — port the values, not the DOM.
- `HANDOFF_NOTES.txt` — what each file is and the four rules the design is built on.
- `design_handoff_griit_onboarding/README.md` — the onboarding handoff these tokens come from.
