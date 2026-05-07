# GRIIT design system v2

A research-backed design system for a discipline app that is warm when you're browsing and serious when you're acting.

This document is the source of truth. If a screen, component, or pattern is not described here, it doesn't exist yet. If you find yourself making a design decision that this doc doesn't cover, add it here first, then build it.

| | |
|---|---|
| Version | 2.0 |
| Last updated | May 2026 |
| Maintainer | Yaseen |
| Repo | github.com/abdelayaseen-netizen/GRIIT |
| Token implementation | `lib/design-system.ts` |
| Bundle ID | app.griit.challenge-tracker |

---

## Part 1 — The thesis

GRIIT v1 has a brand identity problem: it looks like a generic warm-toned wellness app when its product is a discipline app. The fix is not "go dark" or "go aggressive." The fix is a **hybrid** — warm and approachable for browsing, identity, and social moments; dark and weighty for moments of effort, achievement, and stakes.

This is not a stylistic choice. It is a research-grounded behavioral one.

### The four research foundations

**1. Self-compassion outperforms self-criticism for goal pursuit.**
People who respond to setbacks with self-kindness are more likely to successfully pursue their goals; those who respond with self-criticism are more likely to abandon them (Powers et al. 2012; Sirois et al. 2019; Neff 2023, *Annual Review of Psychology*, 74:193-217). This rules out a Whoop-style intimidation aesthetic across the entire app. Browsing, identity, and social surfaces must feel encouraging, not judgmental.

**2. Loss aversion drives streak-based retention.**
Duolingo's published data shows their streak widget produced a 60% increase in user commitment, and the team has run 600+ experiments to optimize it. Around day 7, loss aversion takes effect and dominates retention behavior. The streak number is the single most important visual element in the app; it must be the visual hero of the home screen.

**3. Contrast determines hierarchy more than color does.**
Per NN/Group: it's not the actual color of an element that creates visual hierarchy — it's the contrast in value and saturation between the element and its context. A streak number on a cream card cannot win attention; the same number on near-black cannot lose it.

**4. Public commitment + accountability has measurable effect sizes.**
Matthews 2007 (Dominican University, cited in Harvard goal-research literature): public commitment to a goal raises completion to 65%; specific accountability appointments raise it to 95%. A 138-experiment meta-analysis found d=0.40 for progress-monitoring interventions, with stronger effects when paired with social commitment. The proof-photo feed is the single highest-ROI feature in the app from a retention standpoint.

### The hybrid rule

> **Warm surfaces for browsing, identity, and social. Dark surfaces for stakes, effort, and achievement.**

Memorize this sentence. Every design decision flows from it.

| Surface | When | Examples |
|---|---|---|
| Warm canvas (`#F5F2ED`) | Default app background | Discover, Profile, Feed, Activity, Settings |
| Card white (`#FFFFFF`) | Default card on warm canvas | Stats, list rows, post cards |
| Hero dark (`#0F0F0F`) | Stakes, effort, achievement | Streak hero (Home), trending feature (Discover), best-streak trophy (Profile), task-in-flight |
| Hero dark warm (`#262321`) | Secondary effort / focus | Active task row, in-task timer surfaces |

**The dark surface earns its weight by being scarce.** Aim for ONE — at most two — dark elements per screen. If you find yourself making a third element dark, the system is breaking. Fix it.

### What this brand is NOT

- It is **not** Whoop. We are not building a piece of medical equipment.
- It is **not** Calm. We are not a meditation app.
- It is **not** a generic habit tracker. We are not Streaks, Productive, or HabitNow.
- It is **not** maximally aggressive. We are not David Goggins. We respect the user.

### What this brand IS

- A **tactical tool** for people doing hard things voluntarily.
- **Warm in voice** ("Still up?"), **serious in stakes** (the streak hero card).
- **Photo-first** — proof is the unit of accountability, not numbers alone.
- **Numbered, ordered, deliberate** — never decorative.

---

## Part 2 — Color tokens

All colors live in `lib/design-system.ts` under the `DS_COLORS` export. **No raw hex anywhere else in the codebase.**

Verification gate: `grep -rn '#[0-9A-Fa-f]\{3,8\}' --include='*.tsx' --include='*.ts' | grep -v design-system | grep -v node_modules | wc -l` must return 0.

### Surfaces

| Token | Light | Dark mode | Use |
|---|---|---|---|
| `surface.canvas` | `#F5F2ED` | `#0A0A0A` | Main app background |
| `surface.card` | `#FFFFFF` | `#1A1A1A` | Default card |
| `surface.cardSubtle` | `#FAF7F2` | `#161616` | Less-prominent card |
| `surface.heroDark` | `#0F0F0F` | `#0F0F0F` | The signature dark surface — does not invert |
| `surface.heroDarkWarm` | `#262321` | `#262321` | Warm-dark for active task / focused effort — does not invert |
| `surface.divider` | `#E8E4DC` | `#2A2A2A` | Hairlines, table dividers |

**Critical rule:** `surface.heroDark` and `surface.heroDarkWarm` are "always dark" surfaces — they do NOT change when the app switches to dark mode. The streak hero card is dark in both modes; that's its job. The rest of the app inverts normally.

### Brand

| Token | Hex | Use |
|---|---|---|
| `brand.primary` | `#D85A30` | The GRIIT orange. Primary CTAs, dark-surface accents, active markers, streak progress |
| `brand.primaryHover` | `#C04A23` | Pressed/hover state |
| `brand.primarySoft` | `#FAECE7` | Subtle orange tints (selected pill backgrounds in light mode only) |
| `brand.primaryOnDark` | `#E8693E` | Slightly brighter orange used only on dark surfaces — addresses perceptual dimming |
| `brand.primaryText` | `#FFFFFF` | Text on `brand.primary` background. **Never use `brand.primarySoft` text on `brand.primary`** — that's the v1 contrast bug (2.66:1). White on primary = 5.4:1 ✓ |

### Text

| Token | Light | Dark mode | Use |
|---|---|---|---|
| `text.primary` | `#0F0F0F` | `#F5F2ED` | Body and headlines on light surfaces |
| `text.secondary` | `#5F5E5A` | `#A8A6A0` | Captions, metadata, supporting text |
| `text.tertiary` | `#8A8A8A` | `#737272` | Hints, placeholder text |
| `text.onDark` | `#FFFFFF` | `#FFFFFF` | Primary text on hero-dark surfaces |
| `text.onDarkSecondary` | `#A8A6A0` | `#A8A6A0` | Secondary text on hero-dark surfaces |
| `text.onDarkTertiary` | `#737272` | `#737272` | Tertiary text on hero-dark surfaces |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `semantic.success` | `#0F6E56` | Completed states, green checkmarks, "done" pills |
| `semantic.successSoft` | `#EAF3DE` | Success backgrounds (light mode only) |
| `semantic.warning` | `#854F0B` | Caution, "almost there" states |
| `semantic.warningSoft` | `#FAEEDA` | Warning backgrounds |
| `semantic.danger` | `#A32D2D` | Errors, destructive actions, "streak at risk" |
| `semantic.dangerSoft` | `#FCEBEB` | Danger backgrounds |

### Difficulty (specific to GRIIT)

| Token | Hex | Use |
|---|---|---|
| `difficulty.easy.fg` | `#3B6D11` | "Easy" pill text |
| `difficulty.easy.bg` | `#EAF3DE` | "Easy" pill background |
| `difficulty.medium.fg` | `#854F0B` | "Medium" pill text |
| `difficulty.medium.bg` | `#FAEEDA` | "Medium" pill background |
| `difficulty.hard.fg` | `#791F1F` | "Hard" pill text |
| `difficulty.hard.bg` | `#FCEBEB` | "Hard" pill background |

These are the ONLY three difficulty tints. Per NN/Group preattentive processing research, color-coded difficulty allows users to filter the page in one glance. The traffic-light convention (green/amber/red) maps to existing user mental models. Don't deviate.


---

## Part 3 — Typography

GRIIT uses the iOS system font stack: **SF Pro on iOS** with appropriate fallbacks. No custom font files. Typography is the single biggest brand differentiator in v2 — type does the work color used to do.

### Type scale

Locked to Apple HIG with one exception: the `display` size, which is GRIIT-specific and used for the streak number only.

| Token | Size | Weight | Line height | Letter spacing | Use |
|---|---|---|---|---|---|
| `type.display` | 64pt | 500 | 0.95 | -0.04em | Streak hero number ONLY. Never anywhere else. |
| `type.title.lg` | 34pt | 500 | 1.05 | -0.02em | Best streak number, screen titles ("Discover", "Activity"), feature card names |
| `type.title.md` | 22pt | 500 | 1.1 | -0.02em | Section openers ("What are you building?"), Points number, modal titles |
| `type.title.sm` | 20pt | 500 | 1.15 | -0.01em | Sub-sections, in-task titles ("Morning cardio") |
| `type.headline` | 17pt | 500 | 1.3 | 0 | Task names, post author names, primary content. **Apple's default body weight equivalent.** |
| `type.body` | 15pt | 400 | 1.4 | 0 | Default reading text, descriptions, in-line caption body |
| `type.caption` | 13pt | 400 | 1.4 | 0 | Metadata, timestamps, secondary info. **Minimum readable size for content.** |
| `type.label` | 11pt | 500 | 1.2 | 0.04em | Stat labels ("Best streak"), pill text, button labels in tab bar. **Absolute minimum.** |

**Rules:**
- **Two weights only**: 400 (regular) and 500 (medium). No 600, 700, or 800. iOS SF Pro at 500 is bold enough.
- **Sentence case everywhere**. Never Title Case. Never ALL CAPS except in tab bar labels (which are 11pt and need the height).
- **No font sizes below 11pt**, ever. No exceptions.
- **No mid-sentence bolding** in body text. Bold is for headings and labels only.
- **Numbers use SF Pro's native proportional widths** — don't switch to monospaced for stats. SF Pro numerals are designed to look harmonious in dashboard contexts.

### Where each style goes (canonical examples)

```
Home screen
├─ "Still up?"                    type.caption (13pt)
├─ "GRIIT" wordmark              type.title.md (22pt)
├─ Streak number "1"              type.display (64pt) — hero card
├─ "Day streak" label              type.label (11pt) — hero card
├─ "19h 6m to keep it"            type.caption (13pt) — hero card
├─ Stats row "1" (best streak)    type.title.lg (34pt)
├─ Stats row "7" (points)          type.title.md (22pt)
├─ Stats row "Starter" (rank)      type.headline (17pt)
├─ Stats row labels                type.label (11pt)
├─ "Today" section header          type.headline (17pt)
├─ Task name "Morning workout"    type.headline (17pt)
├─ "Day 1 of 21"                   type.caption (13pt)
└─ "Begin →" button                type.label (11pt)
```

### What this fixes from v1

The v1 stats row had a 30pt number with a 9pt all-caps label below it. That mismatch reads as "chart legend" not "stat" — the label is too small to be content but too prominent to be a footnote. The v2 spec puts labels at 11pt sentence case for readability and ties the number sizes to actual hierarchy (1.4 / 1 / 1 ratio in width plus differential type sizes).

---

## Part 4 — Spacing & layout

### Spacing scale

| Token | Value | Use |
|---|---|---|
| `space.xxs` | 4px | Internal padding within tight components (badge insets) |
| `space.xs` | 8px | Tight gaps (icon + text, list dividers) |
| `space.sm` | 12px | Default gap between adjacent UI elements (cards in a row) |
| `space.md` | 16px | Card padding, section spacing |
| `space.lg` | 24px | Section-to-section vertical breathing room |
| `space.xl` | 32px | Major layout breaks |
| `space.2xl` | 48px | Top-of-screen padding, end-of-feed spacing |

**Rule:** Use multiples of 4. No 5px, 7px, 13px, 18px gaps. If you need 14px, use 12 or 16.

### Border radius

| Token | Value | Use |
|---|---|---|
| `radius.sm` | 6px | Pills, badges, small chips |
| `radius.md` | 10px | Buttons, list rows, small cards |
| `radius.lg` | 14px | Cards, post cards |
| `radius.xl` | 18px | Hero surfaces, feature cards, modal sheets |
| `radius.full` | 9999px | Avatars, circular buttons |

**Rule:** Hero surfaces (dark) get `radius.xl`. Default cards get `radius.lg`. Buttons and rows get `radius.md`. The system reads as deliberate when these are consistent.

### Layout grid

- App content max-width on phone: **edge-to-edge minus 16px horizontal padding** (`space.md`)
- Stats row: 3 columns with `space.xs` gap (8px between cards)
- Task list: full-width single column, `space.xs` between rows
- Feed: full-width single column, `space.md` between cards
- Discover lists: full-width single column for solo, 2-column grid for 24h challenges

### Touch targets

- **Minimum 44×44pt** per Apple HIG. Non-negotiable.
- Icons-only buttons get 44px hit area even if the visible icon is smaller.
- Inline text links get extra padding (`space.xs` vertical) to hit 44pt.

---

## Part 5 — Surfaces

### When to use which surface

This is the most important section in this doc. **The hybrid rule (warm vs dark) is enforced here.**

#### Warm canvas (`surface.canvas` — `#F5F2ED`)

The default app background. Used everywhere unless a screen specifically calls for inversion.

#### White card (`surface.card` — `#FFFFFF`)

Default card. Used for:
- Stats row cells
- Task list rows
- Post cards
- Discover list items
- Profile challenge cards
- Activity notification rows
- Settings rows

**No borders by default.** The surface contrast (white on cream) is the separator. Only add `0.5px solid surface.divider` if cards are touching with no gap.

#### Subtle card (`surface.cardSubtle` — `#FAF7F2`)

Used for nested or secondary cards. Example: the "Drink Water Today · Drink water and post a photo" context banner inside an old post card. In v2 this banner moves into the photo overlay, so this surface is rarely needed — keep it for edge cases.

#### Hero dark (`surface.heroDark` — `#0F0F0F`) — **the signature surface**

This is GRIIT's brand-defining surface. Used in EXACTLY these places:

| Screen | Element | Justification |
|---|---|---|
| Home | Streak hero card | Streak is the retention lever (Duolingo +60% data) |
| Home | "Begin →" button on the active task row | Active CTA needs maximum contrast |
| Discover | "Trending now" feature card (one per category) | Featured challenge gets weight |
| Profile | Best-streak / rank trophy | Achievement, not status |
| Task screen | Photo proof CTA "Take photo to continue" | Moment of effort |
| Feed | "Day 01" badge on post cards | Credibility marker |
| Tab bar | Center "+" floating action button | Primary creation action |

**That is the complete list.** If a new screen needs a hero-dark element, it must be one of:
- A streak/count that drives loss aversion
- An active state of effort or in-flight task
- A peer-acknowledgement of achievement

If it doesn't fit those three, use white or warm.

#### Hero dark warm (`surface.heroDarkWarm` — `#262321`)

The "second tier" of dark — used when something needs gravity but not maximum stakes. Currently used for:
- Active task row outline on Home (the task currently in flight)
- In-task timer screens (full-bleed on this surface)

Rule: only use this if hero dark is already consumed by another element on the same screen. Otherwise use hero dark.

### Surface stacking rules

- **Maximum 2 dark elements per screen.** No exceptions.
- **Dark surfaces don't nest.** Never put a hero-dark card inside another dark card.
- **White cards can sit on warm canvas.** That's the default pattern.
- **Warm-dark can border hero-dark.** Active task row (warm-dark outline) sitting under streak hero (hero-dark fill) works because the contrast still reads.

---

## Part 6 — Typography in motion (the streak number)

The streak number is the most important visual element in the entire app. It deserves its own section.

### Specifications

- Size: `type.display` (64pt)
- Weight: 500
- Letter-spacing: -0.04em (tight, almost crashing)
- Line-height: 0.95 (denser than default)
- Color: `text.onDark` (white on hero dark)
- Position: vertically centered in the hero card, left-aligned

### Behavior

- **Streak increments at midnight** with a count-up animation (0.6s ease-out from N to N+1)
- **Streak loss triggers a different animation**: number shakes once, then resets to 0 with a haptic warning
- **Streak protection (freeze used)** shows a small flame icon to the right of the number that pulses for 1.5s
- The unit suffix ("day" or "days") is `type.headline` (17pt), 400 weight, secondary color, baseline-aligned to the bottom of the number

### What never happens to the streak

- Never displayed at less than 64pt on the home screen
- Never displayed in any color other than white on dark
- Never has a border around it — the contrast IS the boundary
- Never has a shadow, glow, or gradient
- Never gets smaller as the number grows from 1 → 10 → 100 → 365. Use whatever space is needed.

For 4-digit streaks (1000+), drop to 56pt to fit. For 5-digit streaks (10,000+) — congratulations, but also: drop to 48pt.


---

## Part 7 — Component patterns

### 7.1 Cards

**Default card:**
```
background: surface.card (#FFFFFF)
border-radius: radius.lg (14px)
padding: space.md (16px)
border: none (rely on surface contrast)
margin-bottom: space.xs (8px) between consecutive cards
```

**Hero dark card:**
```
background: surface.heroDark (#0F0F0F)
border-radius: radius.xl (18px)
padding: space.md to space.lg (16-24px)
border: none
margin-bottom: space.md (16px) — gets more breathing room
```

**Active task card (warm-dark outline pattern):**
```
background: surface.card (#FFFFFF)
border: 1.5px solid surface.heroDarkWarm (#262321)
border-radius: radius.lg (14px)
padding: space.md (16px)
```
This is the only place we use a colored border. The outline marks the active task without darkening the whole card.

### 7.2 Buttons

**Primary button (light surface):**
```
background: brand.primary (#D85A30)
color: brand.primaryText (#FFFFFF)
border-radius: radius.md (10px)
padding: 12px 16px (vertical / horizontal)
type: type.headline (17pt, 500)
min-height: 44px
```

**Primary button (dark surface):**
Same as above, but background is `brand.primaryOnDark` (#E8693E) for OLED-display compensation.

**Secondary button:**
```
background: surface.card (#FFFFFF)
color: text.primary (#0F0F0F)
border: 0.5px solid surface.divider (#E8E4DC)
border-radius: radius.md (10px)
padding: 12px 16px
type: type.headline (17pt, 500)
```

**Ghost button (on dark surface):**
```
background: rgba(255,255,255,0.08)
color: text.onDark (#FFFFFF)
border: none
border-radius: radius.md (10px)
padding: 12px 16px
type: type.headline (17pt, 500)
```

**Inline text button:**
```
color: brand.primary (#D85A30)
type: type.caption (13pt, 500) or type.headline (17pt, 500)
hit-area: 44pt minimum (use padding even if visual is small)
arrow suffix "→" for forward actions, never decorative
```

### 7.3 Pills & badges

**Difficulty pill:**
```
background: difficulty.{level}.bg
color: difficulty.{level}.fg
border-radius: radius.sm (6px)
padding: 3px 8px
type: type.label (11pt, 500)
case: sentence case ("Easy", not "EASY")
```

**Day-counter badge (on post cards):**
```
background: surface.heroDark (#0F0F0F)
color: text.onDark (#FFFFFF)
border-radius: radius.sm (6px)
padding: 2px 8px
type: type.label (11pt, 500)
format: "Day 01" (always 2-digit padded)
```

**Status pill (active / done):**
```
background: semantic.successSoft (for "done") or surface.cardSubtle (for "active")
color: semantic.success or text.secondary
border-radius: radius.full (pill shape)
padding: 3px 10px
type: type.label (11pt, 500)
```

### 7.4 List rows (numbered)

The numbered list pattern is GRIIT's signature. Replaces v1's pastel-icon-squircle pattern across all list contexts.

**Anatomy:**
```
[01]   Task name              [Begin →]
       Day 1 of 21
```

**Specs:**
- Number: `type.headline` (17pt, 500), `text.primary`, fixed width 28px, left-aligned
- Number format: always 2-digit zero-padded (`01`, `02`, ... `99`)
- After 99, drop the leading zero (`100`, `101`)
- Task name: `type.headline` (17pt, 500), `text.primary`
- Subtitle: `type.caption` (13pt, 400), `text.secondary`
- Right-side action (Begin →, Done, status): `type.label` (11pt, 500)

**Where numbered lists go:**
- Today's tasks (Home)
- Pack tasks in Create Challenge flow
- Discover solo challenges list
- Profile active challenges
- Settings sections (numbered)

**Where numbered lists do NOT go:**
- Feed posts (these are social, not ordered)
- Activity notifications (chronological, not ranked)
- Search results
- Tab bar items

### 7.5 Avatars

```
Size sm: 32px (notifications, comments)
Size md: 40px (post cards, list rows)
Size lg: 50px (profile screen header)
Border-radius: radius.full
Fallback: linear-gradient from brand.primary (#D85A30) to brand.primaryHover (#C04A23) with user's initials in white at type.label (11pt) for sm, type.caption (13pt) for md, type.headline (17pt) for lg
```

For the user's own avatar on Profile, add a small circular streak indicator overlay at bottom-right (16px diameter, hero-dark fill, white flame icon).

### 7.6 Feed post card

This is the most-used card pattern in the app. Spec exhaustively.

**Layout (top to bottom):**
1. Header row (12px padding, 36px avatar + name/meta + ⋯ menu)
2. Photo (4:5 aspect ratio, edge-to-edge)
3. Action row (heart+count, comment, share, +bookmark — 14px padding)
4. Engagement summary (`13pt: "Yaseen respected this"` — 14px padding)
5. Caption / context (optional, 14px padding bottom)

**Header specifications:**
- Avatar: 36px, `radius.full`
- Name: `type.headline` (17pt, 500), `text.primary`
- "Day 01" badge: inline next to name, hero-dark pill (see 7.3)
- Meta row: `type.caption` (13pt, 400), `text.secondary`, format "{Challenge name} · {time ago}"
- ⋯ menu: 18px icon, `text.tertiary`, 44px hit area

**Photo specifications:**
- **Aspect ratio: 4:5 (1080×1350) — locked. No exceptions.**
- Photos taken in-app with the camera are auto-cropped to 4:5
- Users cannot upload from camera roll — camera-only enforcement (already in v1)
- Object-fit: cover, with safe zone in the center 80%

**Photo overlay (bottom):**
- Linear gradient from `rgba(0,0,0,0)` at top to `rgba(0,0,0,0.6)` at bottom, height = 30% of photo
- Task description: `type.label` (11pt, 500), uppercase, `rgba(255,255,255,0.7)`
- Day progress: `type.caption` (13pt, 500), `#FFFFFF`, format "Day 1 of 7 · Complete"

**Action row specifications:**
- 3 actions: respect (flame), comment, share — left to right, gap 14px
- Optional 4th action: bookmark — pushed to right edge with `margin-left: auto`
- Icon size: 22px stroke
- "Respect" icon: `ti-flame` (Tabler outline). When user has respected, it fills with `brand.primary`.
- Count next to icon: `type.caption` (13pt, 400), `text.secondary`. Only shown when count ≥ 1.

**Engagement summary line:**
- `type.caption` (13pt, 400)
- Format: `**{name}** respected this` for 1 respect; `**{name}** and **{N}** others respected this` for >1
- Tappable: opens list of who respected
- Hidden if respect count = 0

**Spacing:**
- Card margin between consecutive posts: `space.md` (16px)
- Card border-radius: `radius.lg` (14px) — note: smaller than hero, cards aren't features
- No card border, no shadow

### 7.7 Tab bar

Stays mostly v1, with refinements:

**Layout:**
- 5 slots: Home, Discover, [+], Activity, Profile
- Center [+] is a floating action button — 56px diameter, `surface.heroDark` fill, white "+" icon
- Other 4 tabs: 24px icon, `type.label` (11pt) text below
- Active tab: `brand.primary` for both icon and text
- Inactive tab: `text.secondary` for both

**Background:**
- `surface.canvas` with a 0.5px top border in `surface.divider`
- iOS: respects safe area inset for home indicator

The center [+] is the only "floating" element in the entire app. Don't add others.

### 7.8 Inputs

**Text input:**
```
background: surface.card (#FFFFFF)
border: 0.5px solid surface.divider (#E8E4DC)
border-radius: radius.md (10px)
padding: 14px 16px
type: type.headline (17pt, 400)
focus state: border becomes 1px solid brand.primary
height: 52px (gives 44pt hit area + visual breathing room)
placeholder: text.tertiary (#8A8A8A)
```

**Inline error message (below input):**
```
type: type.caption (13pt, 400)
color: semantic.danger (#A32D2D)
margin-top: 4px
```

**No `Alert.alert` ever.** Inline errors only. (This is already a v1 rule; restated here.)


---

## Part 8 — Iconography

### Rule

GRIIT uses **outline icons only**. No filled icons except in two specific cases: (1) the active state of an interactive element (a "respect" button after the user respects), (2) the streak flame indicator on the user's own avatar.

### Icon library

Use Tabler Icons (already in the codebase via the existing icon system). Specifically:

| Use | Icon name | Size |
|---|---|---|
| Tab — Home | `ti-home` | 24px |
| Tab — Discover | `ti-compass` | 24px |
| Tab — Activity | `ti-flame` | 24px |
| Tab — Profile | `ti-user` | 24px |
| Tab — Center [+] | `ti-plus` | 24px (white on dark FAB) |
| Action — Respect | `ti-flame` (filled when active) | 22px |
| Action — Comment | `ti-message-circle` | 22px |
| Action — Share | `ti-share` | 22px |
| Action — More | `ti-dots` | 18px |
| Action — Settings | `ti-settings` | 22px |
| Time-related | `ti-clock` | 16px–22px depending on context |
| Camera | `ti-camera` | 22px–24px |
| Photo proof gate | `ti-camera-plus` | 22px |
| Search | `ti-search` | 18px (in input) |
| Streak indicator | `ti-flame-filled` (only on user's own avatar) | 12px in 16px circle |

### What goes away from v1

The pastel-icon-in-rounded-square pattern is **eliminated**. Specifically:
- 🔥 emoji in peach square (Pack list)
- ☀️ emoji in cream square (Morning Routine)
- ⛏️ emoji in cream square (Entrepreneur Pack)
- All the various pastel-tinted task type squircles in Create Challenge

These are replaced by:
- Numbered list pattern (see 7.4) — for ordered lists
- Plain text + caption — for unordered selections
- Single small icon at type.label scale where genuinely useful (timer, camera, location)

### What never gets emoji-as-icon

Emoji are reserved for **user-generated content only** (post captions, bio text, comments). Never in chrome, navigation, system messaging, or quick-start packs. The "Athlete Pack" doesn't get a 💪 — it gets a numbered list of what's in it.

---

## Part 9 — Voice and copy

The voice question matters more than any visual choice. The hybrid system needs a hybrid voice.

### The voice rule

> **Warm and human in browse / identity / social moments. Quiet and direct in stakes / effort / results moments.**

The voice mirrors the surface treatment.

### Warm voice (default)

Used in: Discover, Profile, Feed, Activity, Settings, onboarding, empty states.

**Examples that work:**
- "Still up?" (Home greeting at late hour) ✓
- "What are you building?" (Create challenge step 1) ✓
- "Who's in?" (Solo / Duo / Squad) ✓
- "Most people finish in under 90 seconds" (Friction-lowering callout) ✓
- "Earn your spot" (Empty leaderboard) ✓

**Examples to avoid:**
- "Ready to crush it?" (try-hard fitness app voice)
- "Let's go champion!" (false enthusiasm)
- "You got this!" (generic motivation)

### Quiet voice (effort moments)

Used on: hero-dark surfaces, task screens, proof submission, streak-at-risk states.

**Examples that work:**
- "Take photo to continue" (proof gate) ✓
- "19h 6m to keep it" (streak window remaining) ✓
- "Day 1 of 21" (progress, no commentary) ✓
- "Begin →" (task CTA) ✓
- "Locked in" (post-completion confirmation) — **new**

**Examples to avoid:**
- "Smash this workout!" (the app doesn't yell)
- "You're crushing it!" (cheerful tone is wrong here)
- "Failed!" (never use — see below)

### Words to use

| Use this | Not this |
|---|---|
| Respect (verb and noun) | Like, love, heart |
| Locked in | Done (sometimes ok), completed |
| Begin | Start now (ok in some places) |
| Keep your streak | Don't lose your streak |
| Window closes in 7h | 7h until streak ends |
| Streak at risk | You might fail |
| Missed today | Failed today |
| Pause day / freeze | Skip day |

### Words to avoid completely

- "Crush" "smash" "destroy" — false-aggression vocabulary
- "Champion" "legend" "warrior" — sycophantic praise
- "Fail" "loser" "weak" — punitive vocabulary
- "Just do it" — owned by Nike
- "No excuses" — Goggins-coded

### Tense and person

- Address the user as "you" — never "we" (we is for the team) or third-person.
- Use present tense for in-progress states ("Day 1 of 21"), past tense for completions ("Completed Day 1").
- Imperatives are fine for CTAs ("Begin", "Take photo") — that's what buttons do.

### Numbers in copy

- Spell out one through nine in body copy. Use numerals for 10+ ("six tasks", "21 days").
- Streak numbers, scores, durations: always numerals.
- Percentages: numerals with % sign ("76%", not "seventy-six percent").
- Times: 12-hour format with am/pm lowercase ("4:53am").

---

## Part 10 — Screen-by-screen specifications

### 10.1 Home

**Layout (top to bottom):**
1. Status header: greeting (`type.caption`) + "GRIIT" wordmark (`type.title.md`) + day/points pill row
2. Streak hero card (`surface.heroDark`, the signature element)
3. Stats row (3 cards: best streak / points / rank with differential sizing)
4. Bonus progress (if active) — inline below stats, not a separate card
5. "Today" section header
6. Numbered task list (active task gets warm-dark outline)
7. (Below the fold) Feed preview with "While you were away…" pattern

**Streak hero card contents:**
- Label: "Day streak" (`type.label`, dark surface variant)
- Number: streak count at `type.display` (64pt) — left-aligned
- Subtitle: "{X}h {Y}m to keep it · {Z} freeze available" at `type.caption`
- Progress bar (today's tasks completed): 3px height, white track at 8% opacity, primary fill
- Below bar: "0/2 done today" + "Noon bonus +14" — `type.label`, secondary on dark
- Two buttons: "Start first task" (primary on dark) + "Skip" (ghost)

**What shows / doesn't show on stats:**
- Best streak (always shown — anchors achievement)
- Points (always shown)
- Rank (always shown — drives Duolingo-style league progression)
- Active and Completed counts moved OFF home, into Profile (was a v1 redundancy)

### 10.2 Discover

**Layout (top to bottom):**
1. Title + subtitle ("Discover" / "X/Y challenges active") at `type.title.lg` + `type.caption`
2. Search input (text input pattern, ti-search prefix icon)
3. Filter pills row (horizontal scroll, "All" active state is hero-dark)
4. "Picked for you" section
5. Trending feature card (the dark hero element for Discover)
6. "24-hour challenges" 2-column grid
7. "Solo challenges" numbered list
8. "Team challenges" cards with invite CTAs

**Trending feature card contents:**
- Tag: "Trending now" with primary-color dot pulse, `type.label`, uppercase, primary on dark
- Name: `type.title.lg` (34pt) on dark, white
- Description: `type.caption`, secondary on dark
- Meta row: duration · difficulty pill · participant count
- CTA: "Start this challenge →" primary button on dark

**Difficulty pills:** Always color-coded (see Part 2), always sentence case.

**Participant counts:** Always visible. This is the social proof signal that v1 buries. "847 active" on every card.

### 10.3 Profile

**Layout (top to bottom):**
1. Header: avatar (50px with streak indicator overlay) + name (`type.title.lg`) + handle (`type.caption`) + bio (`type.body`) + follower row
2. Action row: "Edit profile" primary + "Share" secondary
3. Best-streak / rank trophy (the dark hero element for Profile)
4. Mini-stats row (day streak / active / done) — three small cards
5. Tabs: Challenges | Posts | Badges
6. Tab content (numbered lists for Challenges)

**Best-streak trophy contents:**
- Number: best-ever streak at `type.title.lg` (34pt-48pt depending on space) on hero-dark, white
- Label "Best streak" at `type.label`, dark surface variant
- Beside the number, vertically aligned to bottom: rank info
  - "Starter rank" at `type.headline`, white
  - "Day 1 of journey" or similar at `type.caption`, secondary on dark
- Below: progress bar to next rank
- Below bar: "Next rank: 7-day streak" + "1/7" at `type.label`

This is the screen where "rank" becomes a goal, not just a label — making the Duolingo-validated league system visible.

### 10.4 Feed (Home / scrolling)

Each card follows component pattern 7.6 exactly. No deviations.

**Feed-level patterns:**
- "While you were away…" peer-activity row at top of feed when re-opening (existing v1 pattern, keep)
- Friends/Everyone toggle: pill switcher, `type.headline`, hero-dark active state
- "X live" indicator next to "Feed" header: `type.caption`, primary color dot

**Empty feed state:**
- Heading: "Quiet around here" at `type.title.md`
- Body: "Follow people doing challenges to see their proof show up here." at `type.body`, secondary
- CTA: "Find people" primary button → Discover

### 10.5 Task / Proof screen (the lowest-rated v1 screen)

This is where the hybrid system most needs to deliver.

**Layout (top to bottom):**
1. Back chevron + task title at `type.title.sm`
2. Verification gates card (white card, lists time window + photo proof requirements)
3. Task name as `type.title.lg` (34pt) — high-contrast on cream
4. Subtitle "{Challenge name} · Day X of Y" at `type.caption`
5. Input section (warm-dark surface for forms — distance, duration)
6. **Photo proof CTA at the bottom: full-bleed `surface.heroDark` block** with:
   - "Photo proof" title at `type.headline`, white
   - Camera icon (ti-camera) at 32px, primary color on dark
   - "Take photo to continue" button — primary on dark, full-width
   - Caption: "Camera only — gallery uploads disabled" at `type.label`, tertiary on dark
7. "Mark minimum day" link below — secondary text button, `text.tertiary`

**Why the input section is warm-dark:**
This is the Fogg "moment of effort" — user is actively logging. Warm-dark (`#262321`) gives gravity without going full hero-dark. The proof CTA at the bottom IS hero-dark because that's the commitment moment.

**Number inputs (distance, duration):**
- Format: large number display (`type.title.lg` 34pt) + smaller unit label
- Stepper buttons (-/+) at 44pt hit area each side
- No twin-zero rendering. If duration is 0, show placeholder "Tap to enter".

### 10.6 Activity / Leaderboard

Stays close to v1. Refinements:

- "New" header at `type.label`, secondary
- Notification rows: numbered list pattern with avatar instead of number (avatars are more contextual here)
- Leaderboard tab: when populated, top 3 get hero-dark feature treatment (one row, since "max 2 dark elements per screen" rule applies — first row is dark, rest are white)
- Empty leaderboard "Earn your spot" — body copy at `type.body`, "Go to my challenges →" button

### 10.7 Create challenge flow

Stays close to v1 — the flow is one of the strongest parts of the app. Refinements:

- Quick start packs use numbered list pattern with subtitle, no emoji icons
- Progress dots at top stay (4 steps)
- Final "Ready to commit?" screen: the preview card gets hero-dark treatment (one dark element on this screen)
- "Launch challenge" is a hero-dark button across the bottom
- Research callouts ("research shows partner-reported progress lifts goal completion from 43% to 76%") stay verbatim — that's the best UX copy in the app

---

## Part 11 — What's NOT in v2 (placeholders)

These need their own design pass. Listed here so they don't get forgotten.

| Topic | Status | Notes |
|---|---|---|
| Motion / animation specs | TODO v2.1 | Streak counter increment, photo capture flow, pull-to-refresh |
| Empty state illustrations | TODO v2.1 | Currently text-only; should have a system |
| Push notification copy & timing | TODO v2.1 | Cron rules exist; copy and tone do not |
| Onboarding flow specifics | TODO v2.1 | Current onboarding is functional, not designed |
| Paywall design | TODO v2.1 | Critical for revenue — needs separate research-backed pass |
| Full dark mode (app-wide inversion) | TODO v2.1 | Spec covers hybrid surfaces; needs app-wide dark variant |
| Haptic feedback rules | TODO v2.1 | When the app vibrates and how |
| Sound design | TODO v2.2 | If we ever do this |
| Apple Watch / widget | TODO v2.2 | Streak widget specifically aligns with Duolingo's +60% data |

---

## Part 12 — Implementation rules for engineers

This section is for whoever is implementing the spec (Cursor, you, or a contractor).

### Hard rules (verification gates required)

1. **Zero raw hex outside `lib/design-system.ts`.**
   `grep -rn '#[0-9A-Fa-f]\{3,8\}' --include='*.tsx' --include='*.ts' | grep -v design-system | grep -v node_modules | wc -l` must return 0.

2. **Zero emoji as icons.**
   `grep -rE '[\x{1F000}-\x{1FFFF}]' --include='*.tsx' src/components src/screens` must return 0 (excluding string templates that pass through user-generated content).

3. **All `type.*` tokens used, not raw font-size values.**
   `grep -rn 'fontSize:' --include='*.tsx' src/ | grep -v design-system | wc -l` must return 0.

4. **All interactive elements have `accessibilityLabel`.**
   This is already a v1 rule.

5. **Touch targets ≥44pt.**
   Verify with React Native testing library or manual audit.

6. **TypeScript: zero errors.**
   `npx tsc --noEmit` returns 0 errors before any commit.

### Component naming

- All hero-dark components prefixed with `Dark` (e.g., `DarkHeroCard`, `DarkButton`, `DarkBadge`)
- All feed components prefixed with `Post` (e.g., `PostCard`, `PostHeader`, `PostActions`)
- All numbered list components prefixed with `Numbered` (e.g., `NumberedTaskRow`, `NumberedListItem`)

### File locations

```
lib/
  design-system.ts        # All tokens, exported as DS_COLORS, DS_TYPE, DS_SPACING, DS_RADIUS
components/
  cards/
    Card.tsx              # Default white card
    CardSubtle.tsx        # surface.cardSubtle
    DarkHeroCard.tsx      # The signature dark surface
    PostCard.tsx          # Feed post (component 7.6)
  buttons/
    PrimaryButton.tsx
    SecondaryButton.tsx
    GhostButton.tsx
    DarkButton.tsx        # primary button on dark surface variant
  lists/
    NumberedTaskRow.tsx
    NumberedListItem.tsx
  badges/
    DifficultyPill.tsx
    DayBadge.tsx          # The "Day 01" hero-dark pill
    StatusPill.tsx
  inputs/
    TextInput.tsx
    InlineError.tsx
  typography/
    Display.tsx           # 64pt streak number — single-purpose component
    Title.tsx             # variants lg/md/sm
    Headline.tsx
    Body.tsx
    Caption.tsx
    Label.tsx
```

### Migration from v1

The v1 → v2 migration touches every screen. Do NOT do this as one PR. Sequenced approach:

1. **Token migration first** — update `lib/design-system.ts` with v2 tokens, keep v1 names as aliases temporarily
2. **Typography components second** — build the type primitives, migrate one screen at a time
3. **Card components third** — build new card variants, migrate Home first (highest visibility)
4. **Numbered list pattern fourth** — replace pastel-icon-squircles in Today list, then ripple
5. **Feed post card fifth** — biggest single visual lift, do it after the system is stable
6. **Voice/copy pass last** — once visuals are in, audit copy against Part 9

Each step is its own PR with grep gates. Don't merge until gates pass.

---

## Part 13 — Research index

Every design decision in this spec maps to one of these citations.

| # | Source | Year | Used in |
|---|---|---|---|
| 1 | Neff, K.D. *Self-Compassion: Theory, Method, Research, and Intervention*. Annual Review of Psychology, 74:193-217 | 2023 | Part 1 thesis (self-compassion > self-criticism) |
| 2 | Powers, T.A., Milyavskaya, M., Koestner, R. *Mediating the effects of self-criticism…*. Personality and Individual Differences, 52 | 2012 | Part 1 thesis |
| 3 | Sirois et al. *Self-compassion and procrastination*. | 2019 | Part 1 thesis |
| 4 | Duolingo team / Jackson Shuttleworth, Group PM. Public talks and Lenny's Podcast Behind the Product: Duolingo Streaks | 2024 | Part 1 (loss aversion data, +60% widget commitment) |
| 5 | Fogg, B.J. *Tiny Habits*. Stanford Behavior Design Lab | 2019 | Part 1 (B=MAP), Part 5 (moment of effort) |
| 6 | Matthews, G. *The impact of commitment, accountability, and written goals on goal achievement*. Dominican University of California | 2007 | Part 1 (65% / 95% completion data) |
| 7 | Harkin et al. Meta-analysis of 138 progress-monitoring experiments | 2016 | Part 1 (d=0.40 effect size) |
| 8 | Nielsen Norman Group. *Visual Hierarchy in UX: Definition* | 2024 | Part 1 (contrast > color), Part 4 (preattentive processing) |
| 9 | Apple Human Interface Guidelines. *Typography* | 2026 | Part 3 (type scale) |
| 10 | Instagram. Feed post sizing and grid changes (Adam Mosseri 2025 announcement) | 2025-2026 | Part 7.6 (4:5 lock) |
| 11 | Strava case studies (multiple — Aalto University 2024, Trophy.so, Hawaii Manoa Scholarspace) | 2024-2026 | Part 7.6 (photo-forward feed), Part 9 (kudos / respect verb) |
| 12 | Tubik Studio. *7 UI Design Trends of 2026* | 2026 | Part 1 (architecture with attitude), Part 3 (type does the work) |

---

*End of spec. If you got here, you understand the system. Now build it.*

