# Handoff: GRIIT Onboarding Flow (v4)

## Overview
Ten-screen first-run onboarding for **GRIIT**, a habit app whose differentiator is *verified* completion (photo / GPS / timer) posted to a small private accountability circle. The flow moves a new user from cold splash to a concrete, personalized "Day 1" commitment in eight tracked steps, plus a separate returning-user sign-in branch.

Design goals driving this version:
- Personalization must visibly pay off (goal picks re-rank the challenge list).
- Honest defaults — the forgiving difficulty tier is the default, not the aggressive one.
- Permission asks are bundled with their configuration (notification consent + time picker in one step).
- The final screen is a real Day 1 payoff, not a congratulations page.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior. They are **not production code to copy directly**.

The task is to **recreate these designs in the target codebase's existing environment** (React Native, SwiftUI, Flutter, React, etc.) using its established component library, navigation, styling, and state patterns. If no environment exists yet, pick the framework appropriate for the product (this is a phone-first onboarding — React Native or SwiftUI are the natural candidates) and implement there.

Do not port the HTML/inline-style structure verbatim. Port the *layout, tokens, copy, states, and logic* described below.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and interaction states are final and specified exactly. Recreate pixel-faithfully using the codebase's existing primitives.

One exception: the verification photo on the "Streaks are easy to fake" screen is a **labelled striped placeholder**. It needs a real photograph (a genuine morning-run verification shot) before ship. Same pattern for the 50x50 challenge thumbnails.

---

## Device Frame
The prototype draws an iPhone-style bezel for presentation only — **do not implement the bezel**. Implement the screen contents.

- Screen canvas: **390 x 844** (iPhone 14/15 logical size)
- Status bar region: 54px tall (system-provided in a real app)
- Screen body below status bar: 790px tall
- Horizontal page padding: **28px** each side (nav bar row uses 20px)
- Bottom CTA block bottom padding: **34px** (respect safe-area inset in production)

---

## Screens / Views

### 1. Splash — "Discipline, witnessed."
**Purpose:** Communicate the entire product proposition before any tap.

**Layout:** Full-height flex column, 28px side padding, 34px bottom padding. Content block is `flex: 1` and **centered vertically and horizontally**, `gap: 20px`, text centered. CTA block pinned at bottom.

**Components (top to bottom):**
1. **Logo mark** — two orange rounded bars with two detached square "dots" above, forming a stylized "ii".
   - Dots: two 24x24 squares, `border-radius: 4px`, `background: #D2540A`, `gap: 10px`, aligned flex-end.
   - Bars: two 24x112 rects, `border-radius: 4px`, `background: #D2540A`, `gap: 10px`, `margin-top: -12px` relative to the dots row.
2. **Wordmark** — "GRIIT", 15px / 800 / `letter-spacing: 6px` / `#0A0A0A`, `margin-top: 2px`.
3. **Headline** — "Discipline,\nwitnessed." (hard line break), 46px / 800 / `line-height: .95` / `letter-spacing: -1.8px` / `#0A0A0A`, `margin-top: 8px`.
4. **Subhead** — "The habit app that makes you prove it. Real verification, your circle watching." 17px / 400 / `line-height: 1.45` / `#6B6862` / `max-width: 290px` / `text-wrap: pretty`.
5. **Proof-type strip** — "PHOTO · GPS · TIMER", 12px / 700 / `letter-spacing: 1.2px` / `#8A867E`, separators `#D5D1C8`, `gap: 18px`.
6. **Primary CTA** — "Get started", full width, 60px tall, `radius 16`, `#D2540A` bg, white 18px/700 text. Hover `#BC4907`. -> step 1 (Goals).
7. **Secondary** — "I already have an account", full width, 52px, transparent, `#4A4741` 16px/700. Hover `#0A0A0A`. -> Sign-in branch.

### 2. Sign-in branch — "Welcome back."
**Purpose:** Returning users must not be dragged through setup.

**Layout:** 28px side padding. 48px nav row with back chevron (returns to splash, does **not** advance the step counter). Title block at top, auth buttons in a vertically centered `flex: 1` region, one tertiary link pinned at bottom. **No progress bar on this screen.**

**Components:**
- **Title** — "Welcome back." 38px / 800 / `line-height: 1` / `letter-spacing: -1.4px`.
- **Subhead** — "Your streak, your circle and your challenges are exactly where you left them." 16px / `line-height 1.5` / `#6B6862`.
- **Auth buttons** (58px tall, `radius 16`, 17px/700, `gap: 10px`):
  - "Sign in with Apple" — `#0A0A0A` bg, white text. Hover `#232220`. (Use the platform-official Apple button in production.)
  - "Continue with Google" — `#FFFFFF` bg, `2px solid #DED9CE`, `#0A0A0A` text. Hover border `#0A0A0A`.
  - "Continue with email" — transparent bg, `2px solid #DED9CE`, `#0A0A0A` text. Hover border `#0A0A0A`.
- **"Trouble signing in?"** — centered, 14px/600, `#6B6862`, underlined, `text-underline-offset: 3px`.
- **"I'm new here — create an account"** — bottom, 52px, 15px/700, `#6B6862`. -> back to splash.

**Behavior:** any successful auth path skips the entire setup flow and lands on **Day 1**.

---

### Shared chrome for steps 1-8
Every screen from Goals through Day 1 shares this frame:

**Nav row** — 48px tall, 20px side padding, `display: flex; align-items: center; gap: 10px`:
- **Back chevron button** — 44x44 hit target (do not shrink), `radius 12`, transparent; hover bg `#EAE6DE`. Glyph is an 11x11 box with `border-left`/`border-bottom: 2.5px solid #0A0A0A` rotated 45deg.
- **Progress bar** — `flex: 1`, `gap: 4px`, `padding-right: 20px`. **Eight** equal segments, each `flex: 1`, 4px tall, `radius 2`. Filled `#D2540A`, empty `#E2DDD2`. Segment *i* is filled when `step >= i`. Transition `background .35s ease`.
- **Step label** — right aligned, `min-width: 46px`, 12px / 700 / `#8A867E` / `letter-spacing .3px`. Reads `"Step n/8"`, or `"Done"` on Day 1.

**Content region** — `flex: 1`, `overflow: hidden`, 28px side padding, `padding-top: 6px`. Keyed on the step index so it **re-mounts and re-animates on every navigation**: `animation: griitFade .3s ease both` where `griitFade` is `opacity 0 -> 1` with `translateY(10px) -> none`.

Inside the content region:
- Optional **eyebrow** — 12px / 700 / `letter-spacing 1.6px` / `#D2540A` / `margin-bottom: 10px`.
- **Title** — 36px / 800 / `line-height 1.02` / `letter-spacing -1.3px` / `#0A0A0A` / `text-wrap: balance`.
- **Subtitle** — 16px / 400 / `line-height 1.5` / `#6B6862` / `margin-top 12px` / `text-wrap: pretty`.
- **Body slot** — `flex: 1`, `display: flex; flex-direction: column; justify-content: center`, `padding: 16px 0`. This vertical centering is deliberate: it is what removed the large dead space in the previous version. Keep it.

**Bottom CTA block** — 28px side padding, 34px bottom padding, `gap: 2px`:
- **Primary** — full width, 60px, `radius 16`, 18px/700, `transition: background .2s ease`.
  - Enabled: `#D2540A` bg / `#FFFFFF` text / `cursor: pointer`.
  - Blocked: `#E2DDD2` bg / `#A8A49C` text / `cursor: not-allowed` / `disabled`.
- **Optional secondary** — full width, 44px, transparent, 15px/700, `#6B6862`. Hover `#0A0A0A`. Always advances the step (it is a skip).

---

### Step 1 — Goals: "What are you building?"
**Subtitle:** "Pick two or three. It changes which challenges we put in front of you."

**Body:** 2-column CSS grid, `gap: 10px`, six tiles.

**Tile:** 112px tall, `padding: 14px`, `radius 18`, `border: 2px solid`, flex column, `justify-content: space-between`, left-aligned text, `transition: all .18s ease`.
- Indicator: 22x22, `radius 7`, containing an 8x8 circle.
- Label: 15px / 700 / `line-height 1.15`.
- Example line: 12px / 500 / `line-height 1.25`.

| | Unselected | Selected |
|---|---|---|
| bg | `#FFFFFF` | `#D2540A` |
| border | `#E7E2D8` | `#D2540A` |
| label | `#0A0A0A` | `#FFFFFF` |
| example | `#8A867E` | `rgba(255,255,255,.75)` |
| indicator bg | `#F1EDE4` | `rgba(255,255,255,.22)` |
| indicator dot | `#CFC9BC` | `#FFFFFF` |

**Goal data (id / label / example):**
1. `physical` — Physical toughness — "Lifting, running, no missed sessions"
2. `mental` — Mental discipline — "Meditation, journaling, focus blocks"
3. `habits` — Daily habits — "Wake times, water, tidy space"
4. `reading` — Reading & learning — "Pages a day, a course, a language"
5. `cold` — Cold exposure — "Cold showers, plunges, breathwork"
6. `sleep` — Sleep & recovery — "Phone down, lights out, rest days"

**Behavior:** multi-select toggle. `mental` and `habits` are **pre-selected** so nobody stalls on an empty state. With zero selections the CTA is blocked and its label becomes **"Pick at least one"** (otherwise "Continue").

### Step 2 — "Streaks are easy to fake."
**Eyebrow:** HOW GRIIT WORKS
**Subtitle:** "Every other app takes your word for it. GRIIT doesn't. The day doesn't count until it's verified."

**Body:** flex column, `gap: 10px`.

1. **Proof card** — `radius 24`, `overflow: hidden`, `background #0A0A0A`, `box-shadow: 0 24px 40px -22px rgba(0,0,0,.45)`, `position: relative`.
   - **Photo area** — 206px tall. Placeholder is `repeating-linear-gradient(135deg, #1C1B19 0 10px, #232220 10px 20px)` with centered monospace caption "verification photo" (11px, `letter-spacing 1px`, `#6B6862`, uppercase). **Replace with a real photo.**
   - **Day badge** — absolutely positioned `top: 14px; right: 14px`. Pill, `#D2540A`, `padding: 7px 12px`, `radius 999`. 6px white dot + "DAY 12" (12px/700, white).
   - **Footer row** — `padding: 15px 18px 17px`, space-between, centered.
     - Left: "Morning run" (17px/700, `#FFFFFF`) over "4.1 mi · 7:14am · Sector 7" (13px, `#A8A49C`).
     - Right: verified pill — `rgba(210,84,10,.16)` bg, `padding: 8px 12px`, `radius 999`, 8px `#D2540A` dot + "VERIFIED" (12px/700, `#E8834A`, `letter-spacing .4px`).
2. **Proof-type row** — three equal cards, `gap: 8px`. Each: `#FFFFFF` bg, `2px solid #E7E2D8`, `radius 16`, `padding: 12px 10px`, flex column `gap: 3px`.
   - Kind: 12px / 700 / `letter-spacing .8px` / `#0A0A0A`. Use: 11px / `line-height 1.3` / `#8A867E`.
   - Content: **PHOTO** "Show the work" · **GPS** "Prove you went" · **TIMER** "Prove the time".

### Step 3 — "Your circle is watching."
**Eyebrow:** HOW GRIIT WORKS
**Subtitle:** "Show up for the people who'll notice when you don't. Every proof posts to your circle — that's the accountability."

**Body:** flex column, `gap: 12px`.

1. **Feed post card** — `#FFFFFF`, `radius 22`, `padding: 18px`, `box-shadow: 0 12px 28px -18px rgba(0,0,0,.28)`.
   - Header row (`gap: 12px`): 42px circle avatar, `#E4DFD5` bg, initials "MH" (13px/700, `#6B6862`); then "Marcus Hale" (16px/700, `#0A0A0A`) over "Day 12 · Morning routine" (13px, `#8A867E`).
   - Body text: "Cold start, but it's done. Twelve straight." 15px / `line-height 1.45` / `#2A2822` / `margin-top: 14px`.
   - Reaction row (`margin-top: 14px`, `gap: 10px`): three overlapping 26px avatars (`margin-left: -8px` on the 2nd and 3rd, `border: 2px solid #FFF`, backgrounds `#E4DFD5` / `#DDD7CB` / `#D4CDBF`, initials K/D/J at 10px/700 `#6B6862`); then "Respected by **Kyle** and 13 others" — 13px `#6B6862` with "Kyle" bold `#0A0A0A`.
2. **Privacy reassurance panel** — `#EFEBE2`, `radius 22`, `padding: 16px 18px`, flex column `gap: 4px`.
   - "You choose who sees it" (13px/700, `#0A0A0A`) over "Invite up to 8 people. Nothing is public, ever." (13px, `line-height 1.4`, `#6B6862`).
   - This panel exists to defuse the privacy objection at the exact moment it forms. Do not drop it.

### Step 4 — Difficulty: "How hard do you want it?"
**Subtitle:** "This only sets what happens on a day you miss."

**Body:** flex column, `gap: 10px`, three radio cards, then a footnote.

**Card:** `padding: 15px 16px`, `radius 18`, `border: 2px solid`, flex row `gap: 12px`, `align-items: flex-start`, `transition: all .18s ease`.
- Left column (`flex: 1`, `gap: 5px`): name row (name 16px/700 `#0A0A0A` + optional tag chip), description (13px / `line-height 1.4` / `#6B6862`), freeze line (11px / 700 / `letter-spacing .6px`).
- Tag chip: 10px / 700 / `letter-spacing .7px` / `#6B6862` / `#EFEBE2` bg / `padding: 3px 7px` / `radius 6`.
- Radio: 22x22 circle, `border: 2px solid`, inner 9px dot, `margin-top: 2px`.
- Selected: bg `#FFFFFF`, border `#D2540A`, radio border + inner `#D2540A`. Unselected: bg transparent, border `#E7E2D8`, radio border `#CFC9BC`, inner transparent.

**Tiers:**
| id | Name | Tag | Description | Freeze line | Freeze color |
|---|---|---|---|---|---|
| `standard` | Standard | RECOMMENDED TO START | "Miss a day, spend a freeze to keep the streak." | 2 FREEZES A MONTH | `#8A867E` |
| `committed` | Committed | — | "One freeze, then a miss costs you the streak." | 1 FREEZE A MONTH | `#8A867E` |
| `hard` | Hard mode | — | "Miss a day and the streak resets to zero." | NO SAFETY NET | `#D2540A` |

**Footnote:** "Change this on any challenge, any time." 12px / `line-height 1.4` / `#8A867E`.

**Behavior:** `standard` is the **default**. This is a deliberate product decision — the previous version defaulted to Hard mode and badged it with social proof, which optimized signup feel against week-two retention. Do not reinstate that. Hard mode is described honestly and carries no persuasion.

### Step 5 — First challenge: "Start here"
**Subtitle:** "One tap and Day 1 begins tomorrow morning."

**Body:** flex column, `gap: 10px`, three challenge cards + a text link.

**Card:** `padding: 14px`, `radius 18`, `background #FFFFFF` (always), `border: 2px solid`, flex row `gap: 13px`, `align-items: center`, `transition: all .18s ease`.
- Thumbnail: 50x50, `radius 13`, `repeating-linear-gradient(135deg, #EDE8DF 0 6px, #E3DDD2 6px 12px)`. **Replace with real challenge artwork.**
- Text column (`flex: 1`, `gap: 4px`): name 16px/700 `#0A0A0A`; detail 12px `#8A867E`; **match reason** 11px / 700 / `letter-spacing .4px` / `#D2540A`.
- Radio: 22x22, same spec as difficulty.
- Selected: border `#D2540A`, `box-shadow: 0 14px 28px -18px rgba(210,84,10,.55)`, radio `#D2540A`. Unselected: border `#E7E2D8`, no shadow, radio border `#CFC9BC`.

**"Browse all 40 challenges"** — text button, left aligned, 13px/700, `#6B6862`, underlined, `text-underline-offset: 3px`. Intentionally demoted to a link so this screen has exactly one primary action and one escape. Wire to the challenge catalogue.

**Challenge catalogue (id / name / detail / length / tags):**
1. `reset` — The 30 Reset — "30 days · 3 tasks · daily" — 30 — [habits, mental]
2. `mind` — Clear Head — "21 days · 3 tasks · daily" — 21 — [mental, sleep]
3. `75` — 75 Hard — "75 days · 5 tasks · daily" — 75 — [physical, cold]
4. `plunge` — Cold Plunge Ladder — "14 days · 2 tasks · daily" — 14 — [cold, physical]
5. `pages` — 10 Pages a Day — "30 days · 2 tasks · daily" — 30 — [reading, habits]
6. `rest` — Lights Out — "21 days · 2 tasks · nightly" — 21 — [sleep, habits]

**Task lists (used on Day 1; three shown per challenge):**
- **The 30 Reset** — "Morning routine before 8am" (PHOTO), "Read 10 pages" (PHOTO), "20 min walk outside" (GPS)
- **Clear Head** — "10 min meditation" (TIMER), "Journal one page" (PHOTO), "Phone down by 10pm" (TIMER)
- **75 Hard** — "Two 45 min workouts" (TIMER), "Progress photo" (PHOTO), "Gallon of water" (PHOTO)
- **Cold Plunge Ladder** — "Cold exposure, building daily" (TIMER), "Breathwork after" (TIMER), "Log how it felt" (PHOTO)
- **10 Pages a Day** — "Read 10 pages" (PHOTO), "One line of notes" (PHOTO), "Same time each day" (TIMER)
- **Lights Out** — "In bed by 10:30pm" (TIMER), "No screens after 10pm" (TIMER), "Morning light walk" (GPS)

**Ranking algorithm (this is the personalization payoff — implement it):**
\`\`\`
score(challenge) = count of challenge.tags present in selectedGoals
visible = challenges.sortedByDescending(score).take(3)   // stable sort
\`\`\`
The list must re-rank **live** when goals change, so going back to step 1 and editing visibly changes this screen.

**Match reason line:** the first tag of the challenge that intersects the user's goals, mapped through:
`physical` -> "Matches physical toughness" · `mental` -> "Matches mental discipline" · `habits` -> "Matches daily habits" · `reading` -> "Matches reading & learning" · `cold` -> "Matches cold exposure" · `sleep` -> "Matches sleep & recovery". No intersection -> "Popular first challenge".

**Behavior:** nothing is preselected. CTA "Join challenge" is **blocked** until a card is chosen. Secondary: "Set this up later".

### Step 6 — Reminders: "We'll nudge you. Never nag."
**Subtitle:** "One reminder a day, at a time you pick. Turn it off whenever — that's the deal."
Title contains a hard line break after "you."

**Body:** flex column, `gap: 16px`.

1. **Live notification preview** — `#FFFFFF`, `radius 20`, `padding: 14px 16px`, flex row `gap: 12px`, `box-shadow: 0 12px 28px -18px rgba(0,0,0,.28)`.
   - App icon: 40x40, `radius 11`, `#0A0A0A` bg, containing two 4x14 `#D2540A` bars (`gap: 3px`, `radius 1`) — the logo mark at icon scale. **Not an emoji.** The previous version used 🔔/🔥, which clashed with the geometric mark.
   - Text: "GRIIT" (14px/700 `#0A0A0A`) over the body line (13px, `line-height 1.35`, `#4A4741`).
   - Body line is **dynamic**: `"{challengeName || 'Day 1'} isn't logged yet. {taskCount} tasks left."`
   - Timestamp: right, `align-self: flex-start`, 12px `#8A867E` — shows the **currently selected time**, short form (e.g. `6am`, `6:45am`).
2. **Time selector**, labelled "SEND IT AT" (12px / 700 / `letter-spacing .8px` / `#0A0A0A`).

   **Preset state** (default): four equal buttons, `gap: 7px`, each 60px tall, `radius 15`, `border: 2px solid`, flex column centered, `gap: 2px`. Time 15px/700; meridiem 10px/700 `letter-spacing .5px` `opacity .65`. Selected: `#0A0A0A` bg / `#0A0A0A` border / `#FFFFFF` text. Unselected: `#FFFFFF` bg / `#E7E2D8` border / `#0A0A0A` text.
   - Presets: `am6` 6:00 AM (**default**), `am8` 8:00 AM, `pm12` 12:00 PM, `pm7` 7:00 PM.
   - Below: "Pick a custom time" text link (13px/700, `#6B6862`, underlined) -> opens the custom panel.
   - If a custom time has been saved, an extra full-width 48px row appears above that link: `#0A0A0A` bg, `radius 15`, `padding: 0 16px`, space-between — "CUSTOM" (11px/700, `letter-spacing .7px`, `#8A867E`) on the left, the saved time (15px/700, white) on the right. Tapping it reopens the panel.

   **Custom panel state** (replaces the presets in place — not a modal): `#FFFFFF` bg, `2px solid #E7E2D8`, `radius 20`, `padding: 14px`, flex column `gap: 12px`.
   - **Header row:** live draft readout on the left — 26px / 800 / `letter-spacing -.8px` / `#0A0A0A`, format `H:MM AM`. On the right, AM/PM segmented pair: two 46x34 buttons, `radius 10`, 13px/700, `gap: 6px`. Selected `#0A0A0A` bg / white text; unselected `#FFFFFF` bg / `#E7E2D8` border / `#0A0A0A` text.
   - **HOUR** (label 10px/700 `letter-spacing .7px` `#8A867E`): 6-column grid, `gap: 5px`, values 1-12. Buttons 34px tall, `radius 9`, 13px/700. Selected `#D2540A` bg / white text / `#D2540A` border; unselected `#FFFFFF` / `#E7E2D8` border / `#0A0A0A`.
   - **MINUTES**: 4-column grid, `gap: 5px`, values `:00 :15 :30 :45`, same button spec as hour.
   - **Actions** (`gap: 8px`, `margin-top: 2px`, 44px tall, `radius 12`, 14px/700): "Back to presets" (transparent, `2px solid #DED9CE`, `#4A4741`; hover border/text `#0A0A0A`) and "Use {draft}" (`#0A0A0A` bg, white; hover `#232220`).
   - The draft is **staged** — edits do not affect the reminder until "Use ..." is pressed. "Back to presets" discards. Reopening the panel re-seeds the draft from the saved custom value if one exists, otherwise from the last draft (default 6:30 AM).

**Behavior:** the primary CTA "Turn on reminders" **sets `reminders = true` and advances**. Secondary "No reminders for now" advances without enabling. Merging consent and configuration into one step is the point of this screen — do not split them back apart. In production, the primary CTA is where the OS permission prompt fires; handle denial by treating `reminders` as false.

### Step 7 — Account: "Save your progress"
**Subtitle:** "So your streak and your circle follow you to any device."

**Body:** flex column, `gap: 10px`.
- Three auth buttons, 56px tall, `radius 16`, 17px/700 — same three treatments as the sign-in branch (Apple black / Google white-bordered / email transparent-bordered).
- **Receipt panel** (`margin-top: 6px`): `#EFEBE2`, `radius 18`, `padding: 15px 16px`, flex column `gap: 7px`.
  - Heading "SAVED AND WAITING FOR YOU" — 12px / 700 / `letter-spacing .6px` / `#0A0A0A`.
  - Three bullet rows (`gap: 9px`, 13px `#4A4741`), each with a 5px `#D2540A` dot:
    1. `"{challengeName || 'Your challenge'} · {Standard|Committed|Hard mode}"`
    2. `reminders ? "Reminder at {timeText}" : "Reminders off"`
    3. `"{goalCount} goals selected"`
  - This panel reframes the auth gate as protecting work already done. It is why the gate sits at step 7 rather than step 1.
- **No primary CTA on this screen** — the auth buttons *are* the actions. The bottom CTA block renders nothing here.

### Step 8 — Invite: "Bring three people"
**Subtitle:** "Members with a circle of three or more are far likelier to finish. Invite the ones who will actually say something."

**Body:** flex column, `gap: 10px`.

**Contact row:** `#FFFFFF` bg, `2px solid` border, `radius 18`, `padding: 12px 14px`, flex row `gap: 12px`, `align-items: center`, `transition: all .18s ease`. Border `#D2540A` when invited, else `#E7E2D8`.
- Avatar: 40px circle, `#E4DFD5`, initials 13px/700 `#6B6862`.
- Text (`flex: 1`, `gap: 2px`): name 15px/700 `#0A0A0A`; note 12px `#8A867E`.
- Invite button: 36px tall, `padding: 0 16px`, `radius 10`, 13px/700. Default: transparent bg, `2px solid #DED9CE`, `#0A0A0A`, label "Invite". Invited: `#D2540A` bg + border, white text, label "Invited". Toggles.

**Contacts:** `kyle` Kyle Ndiaye (KN) "Already on GRIIT · Day 34" · `dana` Dana Whitfield (DW) "Already on GRIIT · Day 8" · `jonah` Jonah Reyes (JR) "From your contacts". In production these come from contact-permission matching; keep the "already on GRIIT" distinction, it is the strongest invite signal.

**"Share an invite link instead"** — full width, 52px, `margin-top: 4px`, `radius 16`, transparent, **`2px dashed #D5D0C5`**, 14px/700 `#4A4741`. Hover border + text `#0A0A0A`. Wire to the native share sheet.

**Behavior:** CTA "Continue" always enabled (inviting is not required). Secondary: "I'll build my circle later".

### Day 1 — "You're in."
**Subtitle:** "Tomorrow is Day 1. Here is exactly what it looks like."
Step label reads **"Done"**; all eight progress segments filled.

**Body:** flex column, `gap: 10px`.

1. **Day 1 card** — `#0A0A0A`, `radius 24`, `padding: 20px`, entrance `animation: griitPop .45s ease both` (`scale(.94)`/opacity 0 -> `scale(1.02)` at 60% -> `scale(1)`).
   - Header row, `align-items: baseline`, space-between: "DAY 1 OF {length}" (12px / 700 / `letter-spacing 1.4px` / `#D2540A`) and the mode name (12px / 700 / `letter-spacing .4px` / `#8A867E`).
   - Challenge name: 27px / 800 / `letter-spacing -.8px` / `#FFFFFF` / `margin-top: 7px`.
   - Task list (`margin-top: 16px`, `gap: 9px`), one row per task: 21px unchecked box (`radius 7`, `2px solid #3A3833`), task name (`flex: 1`, 14px/600, `#EFEBE2`), required proof type (10px / 700 / `letter-spacing .6px` / `#8A867E`).
2. **Three summary tiles** — `gap: 9px`, each `flex: 1`, `#FFFFFF`, `radius 16`, `padding: 13px 14px`, flex column `gap: 3px`. Label 10px / 700 / `letter-spacing .7px` / `#8A867E`; value 15px/700 `#0A0A0A`.
   - **REMINDER** -> saved time text, or "Off"
   - **CIRCLE** -> `"{n} invited"`, or "Just you"
   - **STARTS** -> "Tomorrow"

**CTA:** "Start Day 1" -> the app home. This screen replaced a nearly empty "You're in." headline page; its whole job is to make the commitment concrete before the user leaves onboarding.

---

## Interactions & Behavior

**Navigation**
- Linear step machine over: `welcome, goals, proof, circle, mode, challenge, reminder, account, invite, dayone`.
- Back chevron decrements; index is clamped to the array bounds.
- The sign-in branch is **orthogonal** to the step index (a boolean overlay on the welcome step), so returning from it does not disturb progress.
- Successful sign-in jumps directly to the last screen (Day 1).
- All previously entered state survives backward navigation, and step 5's ranking recomputes from the current goals.

**Blocking rules**
- Step 1 blocked while zero goals are selected; CTA label swaps to "Pick at least one".
- Step 5 blocked until a challenge is selected.
- No other step blocks.

**Animation**
- Step transition: `griitFade` 300ms ease — 10px rise + fade, keyed on step index.
- Day 1 card entrance: `griitPop` 450ms ease with a slight overshoot.
- All selection controls: `transition: all .18s ease`.
- Progress segments: `transition: background .35s ease`.
- CTA: `transition: background .2s ease`.
- In production, add a light haptic on every selection toggle and a success haptic on Day 1 entry.

**Hover states** (map to press/active states on touch)
- Back chevron: bg -> `#EAE6DE`.
- Orange primary: -> `#BC4907`.
- Black button: -> `#232220`.
- Bordered button: border -> `#0A0A0A`.
- Text/secondary button: color -> `#0A0A0A`.

**States not yet designed** — flag these to product before implementation: auth failure, contact-permission denial, notification-permission denial, offline join, and the "Browse all 40 challenges" catalogue screen.

## State Management
Single onboarding state object; all of it is local until the account step, then persisted to the account.

\`\`\`
step:       int, 0-9, index into the screen list        (default 0)
signin:     bool, sign-in branch overlay                (default false)
goals:      string[] of goal ids                        (default ['mental','habits'])
mode:       'standard' | 'committed' | 'hard'           (default 'standard')
challenge:  challenge id | null                          (default null)
time:       'am6' | 'am8' | 'pm12' | 'pm7' | 'custom'   (default 'am6')
custom:     { h: 1-12, m: '00'|'15'|'30'|'45', mer: 'AM'|'PM' } | null   (default null)
customOpen: bool, custom panel visible                  (default false)
draftH:     int 1-12, staged custom hour                (default 6)
draftM:     '00'|'15'|'30'|'45', staged minute          (default '30')
draftMer:   'AM'|'PM', staged meridiem                  (default 'AM')
reminders:  bool, notifications enabled                 (default false)
invited:    string[] of contact ids                     (default [])
\`\`\`

**Derived values (compute, never store):**
- `visibleChallenges` — top 3 by goal-tag overlap (see step 5).
- `matchReason` per visible challenge.
- `timeText` — long form for display: custom -> `"H:MM MER"`, preset -> `"H:MM MER"`.
- `timeShort` — notification-timestamp form: drops `:00` minutes and lowercases the meridiem (`6am`, `6:45am`).
- `draftText` — `"H:MM MER"` from the staged draft values.
- `notificationBody` — `"{challengeName || 'Day 1'} isn't logged yet. {taskCount} tasks left."`
- `receiptItems` — the three account-screen bullets.
- `circleLabel` — `"{n} invited"` or "Just you".
- `ctaBlocked`, `ctaLabel`, and the eight progress-segment fills.

**Data fetching:** goals and difficulty tiers are static config. The challenge catalogue should come from the server (the prototype hardcodes six). Contact suggestions require contact permission plus a server-side match for the "already on GRIIT" flag. On account creation, POST the whole state object.

## Design Tokens

**Colors**
| Token | Hex | Use |
|---|---|---|
| Ink | `#0A0A0A` | Primary text, black buttons, dark cards, phone bezel |
| Ink hover | `#232220` | Black button hover; dark placeholder stripe |
| Ink soft | `#2A2822` | Post body text |
| Stripe dark | `#1C1B19` | Dark placeholder stripe |
| Line dark | `#3A3833` | Checkbox border on dark |
| Body | `#4A4741` | Secondary body text, tertiary button labels |
| Muted | `#6B6862` | Subtitles, tertiary labels |
| Muted light | `#8A867E` | Meta text, step label, disabled-ish labels |
| Muted on dark | `#A8A49C` | Meta on dark cards, blocked CTA text |
| Orange | `#D2540A` | Brand accent: primary CTA, selection, progress fill, eyebrows |
| Orange hover | `#BC4907` | Primary CTA hover |
| Orange light | `#E8834A` | "VERIFIED" label on dark |
| Orange wash | `rgba(210,84,10,.16)` | Verified pill background |
| Canvas | `#F5F2EC` | Screen background |
| Surface | `#FFFFFF` | Cards, unselected controls |
| Surface sunken | `#EFEBE2` | Reassurance panels, tag chips |
| Surface warm | `#EAE6DE` | Back-chevron hover |
| Border | `#E7E2D8` | Default control border |
| Border strong | `#DED9CE` | Auth button borders |
| Border dashed | `#D5D0C5` | Share-link dashed border |
| Track | `#E2DDD2` | Empty progress segment, blocked CTA bg |
| Avatar 1/2/3 | `#E4DFD5` / `#DDD7CB` / `#D4CDBF` | Avatar fills |
| Indicator | `#F1EDE4` bg, `#CFC9BC` dot | Unselected goal-tile indicator |
| Page (outside) | `#E7E5E0` | Prototype presentation only |

**Typography** — Archivo (Google Fonts), weights 400/500/600/700/800. Fallback `Helvetica, Arial, sans-serif`. If the codebase already ships a grotesk, use it; the design needs a true 800 weight for headlines.

| Role | Size / Weight / Line-height / Tracking |
|---|---|
| Splash headline | 46 / 800 / .95 / -1.8 |
| Screen title | 36 / 800 / 1.02 / -1.3 |
| Sign-in title | 38 / 800 / 1.0 / -1.4 |
| Day 1 challenge | 27 / 800 / — / -.8 |
| Custom time readout | 26 / 800 / — / -.8 |
| Splash subhead | 17 / 400 / 1.45 / — |
| Body / button | 17-18 / 700 / — / — |
| Subtitle | 16 / 400 / 1.5 / — |
| Card title | 15-17 / 700 / — / — |
| Secondary body | 13-15 / 400-600 / 1.35-1.45 / — |
| Meta | 12-13 / 400-700 / — / .3-.4 |
| Eyebrow | 12 / 700 / — / 1.6 |
| Micro label | 10-11 / 700 / — / .6-.8 |
| Wordmark | 15 / 800 / — / 6 |

**Spacing** — 2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 18, 20, 28, 34. Page gutter 28. Card padding 14-20. Stack gap 10 (dense) / 12 (cards) / 16-20 (sections).

**Radii** — 2 (progress segment), 4 (logo bar), 6-7 (chip / small indicator), 9-10 (grid button), 11-13 (icon / thumbnail), 15-16 (button, tile), 18 (card, panel), 20-22 (large panel), 24 (hero card), 50%/999 (avatar, pill), 56 (bezel — prototype only).

**Shadows**
- Hero dark card: `0 24px 40px -22px rgba(0,0,0,.45)`
- White card: `0 12px 28px -18px rgba(0,0,0,.28)`
- Selected challenge: `0 14px 28px -18px rgba(210,84,10,.55)`
- Bezel (prototype only): `0 40px 80px -20px rgba(0,0,0,.35)`

**Borders** — 2px on every interactive control (selection is communicated by border colour, so the width must not change between states or the layout will shift).

## Assets
**Nothing is bundled — all imagery in the prototype is a placeholder.** Needed before ship:

1. **Verification photo** (step 2 hero, 334x206 at 1x, needs 2x/3x) — a real morning-run verification shot. Currently a striped placeholder labelled "verification photo". This is the single highest-value asset in the flow; it carries the product's core claim.
2. **Challenge thumbnails** (step 5, 50x50, 2x/3x) — one per catalogue entry. Currently striped placeholders.
3. **Avatars** (steps 3 and 8) — initials on tinted circles are the intended fallback; wire real profile images when available.
4. **Logo mark** — drawn in CSS in the prototype (two bars + two dots). Ship as a vector asset and use it for the app icon in the notification preview. **Do not substitute emoji** — an earlier version used 🔔 and 🔥 and they read as off-brand against the geometric mark.
5. **Font** — Archivo from Google Fonts, or the codebase's existing grotesk with a true 800.

## Files
- `GRIIT Onboarding v4.dc.html` — the current design. Open in any browser; fully interactive (goal toggles, difficulty, challenge ranking, custom time picker, invites, back/forward). **This is the reference to build from.**
- `GRIIT Onboarding v3.dc.html` — prior iteration, kept for diffing. v4 adds: goal examples, three difficulty tiers, match-reason lines, proof-type row, the dedicated invite screen, the working custom time picker, the wordmark, and the "trouble signing in" path.

Both files are self-contained apart from the Google Fonts link and a small runtime script they load from the same folder; behaviour and layout are readable directly from the source. Treat the markup as a *specification of appearance*, not as code to port.

## Implementation notes / gotchas
- **Keep the vertical centering.** Each body slot centers within the remaining space between the title block and the pinned CTA. The earlier version top-aligned everything and left roughly half of every screen empty.
- **One primary action per screen.** The previous "pick your challenge" screen had three competing CTAs; this version has one primary, one secondary, and a demoted text link.
- **Preserve the honest defaults.** Standard difficulty default, no social-proof badge on Hard mode, and nothing preselected on the challenge screen.
- **Do not split reminder consent from time selection.** They belong in one step.
- **Back navigation must be lossless** — every selection is preserved, and the challenge ranking recomputes on return.
- **44px minimum hit targets** — the back chevron in particular is a 44x44 target around an 11px glyph.
- **The progress bar has exactly 8 segments and must match the real step count.** The version before this one showed contradictory fill states; it was the most-noticed defect in review.
