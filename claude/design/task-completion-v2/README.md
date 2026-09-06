# GRIIT — Task completion flow (v2)

Implementation spec for the core loop: opening a task, doing it, and learning whether the day is
secured. Companion to the onboarding v4 and profile v3 handoffs; same tokens, same honest cut.

- Prototype: `GRIIT Task Completion v2.dc.html` (open in a browser; the right-hand panel switches
  task type, day outcome, and edge states)
- Source: `src/` — unbundled React + CSS, no build step assumed beyond your existing one
- Design frame: 390 x 844 (iPhone 14/15 logical). Everything below is stated at that size.

---

## 0. What changed from today's flow

| Today | v2 |
|---|---|
| Ready screen on every task, often with an empty "GATES" card | Entry screen only for timer (arming) and check-in (location readout). Everything else opens straight into the doing. |
| Camera is a bracketed box inside a card | Full-bleed 4:5 viewfinder, one shutter, no iOS crop sheet |
| Caption is its own screen | Caption lives on the review state, on the photo |
| Timer measured screen time; hard mode reset it if you left the app | Timer runs on the wall clock. Lock the phone. Live Activity + completion notification. Hard mode cut. |
| Five celebration surfaces (+5 points modal, Day 1 full screen, Home card, dark sheet, confetti) | **One** confirmation state, four variants |
| "+5 points", "Next badge progress Day 1-5" | Removed. Only streak, day-of-challenge, and the five profile badge marks are real. |
| 8 screens / 6 taps for a glass of water | 3 taps for a plain photo task (+1 to dismiss the confirmation) |

Deleted outright and **not** replaced: the points number, the Day 1-5 pill row, the post-completion
Home card, the dark "Secured." sheet, confetti, the green check mark (off-system), the coral button
(off-system).

---

## 1. Tokens

Unchanged from profile v3 — `src/tokens.css`. The ones this surface leans on:

| Token | Value | Use here |
|---|---|---|
| `--ink` | `#0A0A0A` | Type, unverified primary button |
| `--body` | `#4A4741` | Gate lines, failure body |
| `--muted` | `#6B6862` | Secondary copy |
| `--muted-light` | `#8A867E` | Chrome title, stat labels, disclosures |
| `--orange` | `#DC5401` | Verified confirmation, primary CTA, gate bullets |
| `--orange-press` | `#B44100` | Pressed |
| `--danger` | `#A4341A` | "NOT POSTED" eyebrow only |
| `--canvas` | `#F5F2EC` | All light screens |
| `--surface` | `#FFFFFF` | Cards |
| `--track` | `#E2DDD2` | Disabled button fill (ink `#A8A49C`) |
| `--camera-bg` | `#0B0B0B` | Capture + review screens (new) |

Type: Archivo, weights **400 and 500 only**. No emoji anywhere. Lucide for icons; the flame is the
custom GRIIT mark, used only next to a streak number. Minimum hit target 44x44 — the "Remove one"
and "Retake" affordances are at 44 and 36+padding respectively; do not shrink either.

---

## 2. Shared chrome

Every capture/review/entry/blocked screen uses the same three-part chrome. The confirmation and Home
do **not** show it.

```
0      status bar                 54px  (dark screens: white glyphs)
54     chrome bar                 52px
106    body                       ...
```

**Chrome bar** — `height: 52px`, `padding: 0 8px`, flex row, `align-items: center`:
- Back: 44x44, `border-radius: 14px`, transparent, hover `--surface-warm` (light) /
  `rgba(255,255,255,.1)` (dark). Glyph: 11x11 box, `border-left`/`border-bottom: 2px solid`
  currentColor, rotated 45deg.
- Title: `flex: 1`, centered, `margin-right: 44px` to offset the back button, 13px / 400 /
  `letter-spacing: .2px` / `--muted-light` (light) or `rgba(255,255,255,.6)` (dark).
  Format: `Day {n} · {typeLabel}` — e.g. "Day 3 · Photo proof". **Never** a bare "Day 1".
- No third slot. There is no overflow menu, no help, no close.

**Gate indicator** is not in the chrome. It sits where the user is about to act:
on the capture screen it is the single line directly above the shutter; on an entry screen it is the
bulleted list; on a light doing-screen it is the disclosure line above the submit button.

Back behavior: from the first step of a flow, back returns Home and discards. From a later step it
goes one step back (review → capture is "retake"). Back is never destructive without discard being
obvious — a captured photo that has not been posted is discarded silently, matching the camera
convention. Flagged as open question 3.

---

## 3. Camera geometry (390 x 844, exact)

The proof card is locked at 4:5, so the viewfinder frames 4:5 and the capture is used **as-is**.
No iOS crop sheet, no letterbox, no re-crop step.

```
y=0     status bar                       54    white glyphs on #0B0B0B
y=54    chrome bar                       52
y=106   viewfinder  390 x 488            488   = 390 x 5/4, full-bleed, no radius, no brackets
y=594   control deck                     250
        ├ gate line, centered            18px from deck top, 13px/400 rgba(255,255,255,.62)
        ├ shutter 76x76                  centered, 26px below the gate line
        └ safe area                      34
y=844
```

- **Viewfinder**: fills the width edge to edge. Placeholder in the prototype is
  `repeating-linear-gradient(135deg, #171614 0 12px, #1E1D1A 12px 24px)` — replace with the camera
  preview layer. Do not inset it, do not round it, do not draw corner brackets. The frame edge *is*
  the crop.
- **Timestamp chip**: `position: absolute; left: 16px; bottom: 16px`, `padding: 6px 10px`,
  `border-radius: 8px`, `background: rgba(0,0,0,.55)`, 12px white. Local 24h time. It is burned into
  the stored proof, not just the UI.
- **Shutter**: 76x76, `border-radius: 38px`, `#FFFFFF` fill, `4px solid rgba(255,255,255,.35)` ring.
  Pressed: `transform: scale(.92)`, 90ms. One shutter. No flash toggle, no lens switch, no library
  button — camera-only is a verification gate, so there is no affordance that could imply otherwise.
- **Review** reuses the identical 390x488 rect at y=106 so the captured frame does not move when the
  state changes. "Retake" pill sits `top: 14px; right: 14px`, 36px tall, `padding: 0 16px`,
  `background: rgba(10,10,10,.6)`, white 13px.
- **Caption on review** overlays the bottom of the photo, matching the proof card spec:
  `padding: 44px 18px 16px`, `background: linear-gradient(to top, rgba(10,10,10,.82), transparent)`,
  three lines — challenge name at 70% white, completion line at 92%, caption at 100%. Overflow is
  `...` truncation on the caption line.
- The caption **input** is below the photo in the light deck: 44px tall, bottom-ruled
  `1px solid --border-strong`, 15px, with a `{n} / 120` counter at 12px `--muted-dark` to its right.
  Live counter, hard stop at 120.

---

## 4. Task types — flows, verification, tap cost

Every flow is `Home → [entry] → doing → [review] → verifying → confirmation → Home`.
Entry and review appear only where the third column says so.

| Type | States | Actually verified | Home→Home taps |
|---|---|---|---|
| `photo` | capture → review | Live camera capture (no library); time window if set | **3** — task → shutter → post |
| `timer` | entry → running (+ lock-screen Live Activity) | A `started_at` → `started_at + duration` span elapsed on the wall clock | **3** — task → start → done |
| `run` | log → capture → review | Photo only. Distance + duration self-entered | **5** — task → log → shutter → post → done |
| `workout` | log → capture → review | Photo only. Duration self-entered unless the in-app timer ran | **5** — task → kind → shutter → post → done |
| `journal` | write | Word count met | **3** — task → write → post |
| `counter`/`water`/`reading` | count | **Nothing.** Count is self-entered (photo if `reading` attaches one) | **2 + goal** — task → n taps → submit |
| `checkin` | entry (location readout) | GPS inside the radius at tap time | **3** — task → I'm here → done |
| `manual`/`simple` | ask | **Nothing.** Self-report | **3** — task → I did it → done |

Tap counts exclude the confirmation dismissal. The literal count from Home back to Home is one
higher; see open question 1 for the auto-dismiss option.

### 4.1 photo
```
Home ──tap task──▶ Capture ──shutter──▶ Review ──post──▶ Verifying ──▶ Confirmation ──done──▶ Home
                       ▲                    │
                       └─────retake─────────┘
```
No entry screen. Tapping the task row opens the camera. If the task has a time window that has not
opened, the tap lands on **Gate blocked** instead (§7).

### 4.2 timer

**The timer runs on the wall clock, not on screen time.** We record `started_at` and the required
duration; everything else is derived. Locking the phone, backgrounding the app, taking a call, or
having the app killed changes nothing. There is **no hard mode on this surface** — it is cut
entirely, along with its copy and its blocked state. A meditation timer that punishes you for
locking your phone is a timer that fails at the thing it is for.

```
Home ──tap task──▶ Entry (arm) ──start──▶ Running ──ends──▶ Verifying ──▶ Confirmation
                                            │                  ▲
                            phone locks ────┤                  │
                                            ▼                  │
                                     Live Activity ──ends──▶ Notification ──tap──┘
                                            │
                                       reopen app ──▶ Running, true remaining time
```

**Entry** — task title, gate lines (`10:00 timer`, `Runs on the clock — lock your phone if you
want`), then one switch card (`--surface`, `border-radius: 20px`, `padding: 4px 20px`,
row `min-height: 68px`, label 15px over sub 12px `--muted-light`, 46x28 switch):
- **Sound when it ends** — "A notification arrives either way". The sound is the optional part; the
  notification is not, because the user is expected to be away from the screen.
Primary "Start 10:00".

**Running** — countdown 84px / 500 / `letter-spacing -3.5px` / tabular-nums, derived from
`started_at` on every tick (never from a decremented counter, which drifts and dies with the
process). Task name 14px `--muted`. Below it a `--surface-sunken` pill: `Started 6:02 PM · ends
6:12 PM` — both timestamps, because both are what get recorded. Then the reassurance line, 13px
`--muted-dark`, max-width 250: *"Runs on the clock. Lock your phone, put it down — we'll tell you
when it's done."* One secondary action: "Cancel the timer" (52px outline), which discards.

**Reopening mid-run is a first-class path.** On mount, if an active timer exists, restore the
Running state and show `required - (now - started_at)`. If that is ≤ 0, the session is already
complete: go straight to Verifying. Never show a stale remainder and never restart the countdown.

**(a) Lock-screen Live Activity** — the timer's real home while it runs. Full spec, both sizes and
both states, in §4A.
- Card: full width minus 16px margins, `border-radius: 22px`, `background: rgba(255,255,255,.14)`
  over the wallpaper (system material in production), `padding: 16px`.
- Header row: 22px `--ink` app mark with the two `--orange` bars, "GRIIT" at 12px
  `rgba(255,255,255,.7)`, and `ends 6:12 PM` right-aligned at 12px `rgba(255,255,255,.55)`.
- Middle row: task name 15px white over `Day 3 · Consistent Bedtime` 12px `rgba(255,255,255,.6)`
  on the left; countdown 40px / 500 tabular-nums white on the right.
- Progress: 4px track `rgba(255,255,255,.2)`, fill `--orange`, `elapsed / required`.
- Tapping the card opens the app on the Running state (or Verifying, if it finished meanwhile).
- Use `ActivityKit` with a `.timer` text style so the countdown updates without pushes. Android:
  a foreground-service ongoing notification with `setUsesChronometer(true)`.

**(b) Completion notification** — fires the instant the duration elapses, wherever the user is.
- Title: **`10:00 done`** · Body: **`Come back to post proof.`**
- Tapping it opens straight into Verifying, then the confirmation — the session is already recorded,
  so the notification is only asking the user to close the loop.
- Sound follows the entry switch and the OS silent setting; the notification itself is not optional.
- If the Live Activity is on screen when the timer ends, it becomes the completion notice in place.

**Verification line:** `Timer ran 10:00 · started 6:02 PM`. Both facts are true regardless of what
the screen was doing, which is the whole point of moving to the clock.

### 4.3 run / workout (two-phase)
```
Home ──tap task──▶ Log ──next──▶ Capture ──shutter──▶ Review ──post──▶ Verifying ──▶ Confirmation
                    │  ▲
        (workout)   └──┘ Session timer ──stop──▶ back-fills duration
```

**Numeric fields.** Values are entered, not decorative. Card: `--surface`,
`border-radius: 18px`, `padding: 14px`, `border: 1.5px solid` (transparent when idle,
`--orange` while editing). Contents top to bottom:

1. Header row, `min-height: 44px`: label 11px `letter-spacing .8px` `--muted-light`, and on
   distance a **unit button** — 44px tall, `min-width: 52px`, `--surface-sunken`,
   `border-radius: 12px`, 13px. Tapping toggles `km` / `mi`; the choice is persisted per user
   (`user_prefs.distance_unit`) and applies everywhere distance is shown, so it is a preference,
   not a per-entry field.
2. Value, 32px / 500 / `letter-spacing -1.3px`, tabular-nums. Whole value is a 46px tap target.
3. Hint, 11px `--muted-dark`: `Tap to type` / `mm:ss` / `At least 30 min` when the workout floor
   is unmet.
4. Stepper row: two 44px buttons, `flex: 1`, `1.5px solid --border`, `border-radius: 12px`, 13px.
   Distance `− 0.1` / `+ 0.1`; run duration `− 0:30` / `+ 0:30`; workout minutes `− 5` / `+ 5`.

**Three states** — `empty`: value is an em dash in `--chevron`, hint "Tap to type", CTA disabled.
`editing`: card border `--orange`, value in `--orange` with the not-yet-typed digits at 45%
opacity, keypad docked. `filled`: value in `--ink`, border transparent. (The prototype's right
panel renders all three side by side under NUMERIC FIELD STATES.)

**Keypad, not the system keyboard.** Tapping a value docks a keypad in place of the primary CTA —
the iOS keyboard would cover the CTA, animate over the disclosure, and offer paste, which has no
meaning for a self-entered number.
- Header row: field label 11px `--muted-light` left, live draft 26px/500 tabular-nums right.
- Keys: `repeat(3, 1fr)` grid, `gap: 8px`, each **50px** tall, `--surface`, `border-radius: 14px`.
  Digits 1-9, then `Clear` / `0` / `Del` (13px `--muted`). No decimal key — see the masks below.
- `Done` commits: 56px, `--ink`. Back / tapping another field commits too; there is no cancel,
  because the stepper can correct any value afterwards.
- **Masks.** Distance: digits fill two implied decimals from the right, so `5` `0` `2` → `5.02`;
  max 5 digits. Duration: `mm:ss` shifts in from the right, `2` `7` `4` `1` → `27:41`, seconds
  clamped to 59; max 4 digits. Minutes and count are plain integers (max 3 and 2 digits).
- While the keypad is open the kind chips, the timer button and the disclosure are hidden — nothing
  behind the keypad is reachable, so nothing behind it is drawn.

**Primary CTA is gated on real values**: "Enter distance and duration" / "Enter the duration"
(disabled, `--track` on `#A8A49C`) until run has both, or workout has ≥ its minimum. It becomes
"Next: photo proof" in `--orange`. Workout below its floor stays blocked with the hint
"At least 30 min".

**"Use the timer instead"** (workout only) — 48px, `1.5px dashed --border-dashed`, full width under
the kind chips. Routes to a **session timer**: eyebrow `SESSION TIMER`, count-**up** at 84px/500
tabular-nums, and the line "Counting up. Stopping fills the duration field for you — the photo is
still what gets verified." Primary "Stop and use {n} min" (`--ink`) returns to the log with the
duration back-filled and the field in its filled state; secondary "Cancel, I'll type it" returns
with the field untouched. A back-filled duration is still self-entered as far as the confirmation
copy is concerned **unless** the backend records that the in-app timer produced it — see open
question 16.

The disclosure below the fields is not optional: *"Distance and duration are self-entered. Only the
photo is verified."* (workout: *"Duration is self-entered unless the in-app timer ran…"*).
The confirmation's verification line reflects the values actually entered, e.g.
"Photo captured live · 5.02 km and 27:41 self-entered".

### 4.4 journal
Editor is the whole screen: word counter at the top left (13px `--muted`, `{n} / 150 words`,
appending *"· minimum met"* when satisfied), textarea at 17px / line-height 1.5, submit pinned to the
bottom. Below the minimum, the button is disabled (`--track` / `#A8A49C`) and states the remainder:
*"Write 38 more words"*. No character counter, no formatting bar, no photo.

### 4.5 counter / water / reading
Count at 84px/500 with `/ 8 glasses` at 20px `--muted` beside it. One 132px circular "Add one"
button — big because it is tapped up to a dozen times. "Remove one" below as a 44px text button.
**Long-press to type.** Twelve taps is the right interaction for someone counting as they go and the
wrong one for someone who already knows the number. Press and hold "Add one" for **450ms**, or tap
the "Type the number" text button beside "Remove one", and the same keypad from §4.3 docks in place
of the tap target and submit — plain integer mask, 2 digits, clamped to the goal. A hold that opens
the keypad does **not** also increment. An 11px `--muted-dark` line under the controls says
"Press and hold \"Add one\" to type it instead"; the self-entered disclosure is identical either
way, because typing the number is exactly as unverified as tapping it.

Disclosure above the submit: *"Self-entered count · nothing is checked."* Submit is disabled until
the goal is met and reads `{n} of 8 logged` while it is. Primary is **ink, not orange** — this type
is unverified. `reading` adds an optional "Attach a page photo" row that routes through the standard
capture + review states; attaching one upgrades the confirmation to the verified variant for the
photo only, and the count disclosure stays.

### 4.6 checkin
Entry is the only state: gate line, then a location card — `DISTANCE TO {place}` label, `24` at
40px/500 with `m away`, a 6px progress track filled to `distance / radius`, and
`Inside the 100 m radius · GPS accuracy ±{n} m`. Primary "I'm here" is enabled only inside the
radius; outside it, the screen is **Out of range** (§7). Accuracy is shown always, not just when
poor — it is the honest caveat on this gate.

### 4.7 manual / simple
Title "Did you do it today?", task name at 16px, then
*"Self-reported. Nothing is checked."* at 14px `--muted-light`. Primary "I did it" is **`--ink`**;
secondary "Not yet" is a 52px outline that returns Home without logging. This screen keeps today's
copy — it was already right — but the primary loses its orange, because orange is the verified
colour on this surface.

---

## 4A. Live Activities (iOS lock screen + Dynamic Island)

Only three types get one: **timer**, **run / workout**, **counter family**. Photo, journal,
check-in and self-report finish in a single interaction, so a persistent card would be noise. The
prototype renders all six cards (each type's running and complete state) below the phone.

**Shared geometry**

| Presentation | Size | Radius | Padding |
|---|---|---|---|
| Lock screen | 360 × 132 (cap 160) | 22 | 18 |
| Dynamic Island, compact | 214 × 37 total, leading + trailing slots either side of the 62 × 21 cutout | 19 | 0 12 |
| Dynamic Island, expanded | 372 wide, height by content (~104) | 40 | 18 22 |

**Shared content, lock screen**, top to bottom:
1. Header row: 22px app mark (accent square, two `--ink` bars — the GRIIT mark, never an emoji),
   "GRIIT" 12px `rgba(255,255,255,.7)`, and a right-aligned status at 12px.
2. Middle row: task name 15px white over challenge line 12px `rgba(255,255,255,.6)` on the left;
   the number at 38px / 500 / `letter-spacing -1.5px` / tabular-nums on the right, with an optional
   unit at 13px `rgba(255,255,255,.6)`.
3. Progress: 4px track `rgba(255,255,255,.2)`, fill in the accent. Plus, on the counter only, the
   `+1` button inline at the right (34px tall, `rgba(255,255,255,.16)`, radius 17).

Background is `--ink` on every card. **Accent is the honesty signal**: `--orange` for the verified
types (timer, run, workout) and `--muted-dark` `#A8A49C` for the counter family, whose number is
self-entered. The compact Dynamic Island inherits the same accent, so the distinction survives at
16px.

Expanded Dynamic Island is the same content one level flatter: mark, task name over a sub line,
optional `+1`, then the number at 30px/500, with the progress track beneath.

### timer
| | Running | Complete |
|---|---|---|
| Status | `ends 6:12 PM` | `ran 6:02 – 6:12 PM` |
| Number | countdown `4:20` | `10:00` |
| Sub / challenge | `Day 3 · Consistent Bedtime` | `Done · Come back to post proof.` |
| Progress | elapsed / required | 100% |
| Compact | mark + `4:20` | mark + `Done` |
| Tap | Running state in-app | Verifying, then the confirmation |

Countdown is derived from `started_at` and rendered with a `.timer` text style so it updates
without pushes (Android: `setUsesChronometer(true)`). The complete card appears the instant the
duration elapses and dismisses when the proof posts.

### run / workout
| | Running | Complete |
|---|---|---|
| Status | `started 6:02 PM` | `ran 6:02 – 6:30 PM` |
| Number | elapsed, counting up `27:41` | final elapsed `27:41` |
| Sub | `Counting up · started 6:02 PM` | `Stopped · Come back to post proof.` |
| Compact | mark + `27:41` | mark + `Done` |
| Tap | Log screen, duration pre-filled from the clock | same |

**No distance and no pace, at any size.** Those are self-entered and we do not fake a number we
never measured. The progress track runs full while the session is open (there is no target to
progress against — it is a presence indicator, not a percentage).

### counter / water / reading
| | Running | Complete |
|---|---|---|
| Status | `Self-entered` | `Self-entered` |
| Number | `3` + `of 8 glasses` | `8` + `of 8 glasses` |
| Sub | `Self-entered · nothing checked` | `Goal met · come back to log it.` |
| Progress | value / goal | 100% |
| Button | `+1`, on the lock screen and expanded island | none |
| Compact | mark + `3/8` | mark + `8/8` |
| Tap | Count screen | Count screen, ready to submit |

`+1` is an interactive Live Activity button (iOS 17+, `Button(intent:)` over an `AppIntent`): it
increments and re-renders the activity **without launching the app**. It disappears at the goal, so
the only remaining action is coming back to submit. The word "Self-entered" is in the status slot at
every size, and the muted accent carries the same meaning where the text does not fit. These cards
never say secured or verified, because nothing was checked.

**Lifecycle**: start the activity when the doing begins (timer start, session start, first
increment); update on state change only; end it when the proof posts, when the task is cancelled, or
at 8 hours, whichever is first. One activity per task; never two at once for the same challenge.

---

## 5. Verifying

Shown from the moment the user submits until the server confirms. Full-canvas, no chrome, not
dismissible.

- 34px spinner: `border: 2.5px solid --track`, `border-top-color: --orange`, 0.8s linear.
- `Posting your proof…` at 15px `--body` (timer: `Recording the session…`; manual/counter:
  `Saving…`).
- `Nothing is secured until the server says so.` at 13px `--muted-light`.

Rules: never render the confirmation optimistically. Streak, day-secured, and badge state all come
from the server response. Target 1-2s; if it exceeds 8s, fall through to the failure state below.

**Upload failed** — eyebrow `NOT POSTED` (11px / `letter-spacing 1.6px` / `--danger`), headline
"Upload didn't go through", body: *"Your photo is saved on this device. The day is not secured yet.
Retry when you have signal — the capture keeps its original timestamp."* Actions: "Retry now"
(orange) and "Keep it for later" (text). A queued proof shows on Home as the task row with a
`QUEUED` chip; it does not count toward `{n} of 3` until it posts.

---

## 6. Confirmation — the one moment

One screen. It answers, in order: this task is done → the day is / is not secured → what the streak
now is. Layout, top to bottom, centered, `padding: 90px 24px 34px`:

1. **Mark** — 66px circle. Verified: `--orange` fill, white 2.5px check. Unverified: transparent with
   `1.5px solid #A8A49C` and an ink check. No glow, no ring pulse, no confetti.
2. **Eyebrow** — 11px / `letter-spacing 1.6px`. `PROOF POSTED` (`--orange`) or
   `LOGGED · SELF-REPORTED` (`--muted-light`).
3. **Headline** — 34px / 500 / `letter-spacing -1.4px`, `text-wrap: balance`.
4. **Task name** — 16px `--body`.
5. **Verification line** — 13px `--muted-light`, max-width 280. Type-specific, always literally true.
6. **Stat row** — two cells between 1px `--border` rules, `padding: 18px 8px`: value 24px/500,
   label 11px `letter-spacing .7px` `--muted-light`.
7. **Footnote** — 12px `--muted-dark`, states what the streak actually counts.
8. **Actions** — "Done" 56px primary; "Share to my circle" as a 48px text button, present only on
   the day-secured verified variant. Sharing is an option here, never its own screen.

### 5.1 The four variants

| # | Trigger | Eyebrow | Headline | Stat 1 | Stat 2 | Footnote | Mark / CTA |
|---|---|---|---|---|---|---|---|
| A | Verified proof, last required task | `PROOF POSTED` | **Day secured** | `14 days` / STREAK | `Day 3 of 14` / {challenge} | "Streak: consecutive days where every required task was completed." | Orange / orange + Share |
| B | Verified proof, required tasks remain | `PROOF POSTED` | **1 required task left** | `13 days` / STREAK · UNCHANGED (muted) | `Day 3 of 14` | "The streak moves only when every required task for the day is done." | Orange / orange |
| C | Verified proof, day already secured earlier | `PROOF POSTED` | **Task done** | `14 days` / STREAK | `Day 3 of 14` | "The day was already secured earlier today. Nothing changes on the streak." | Orange / orange |
| D | Unverified type (`manual`, `counter`, `water`) | `LOGGED · SELF-REPORTED` | same as A/B/C by day state | same as A/B/C | `Day 3 of 14` | "Nothing was checked. You said you did it." (replaces the verification line) | **Outline mark, ink CTA, no Share** | 

Variant D is deliberately plainer: no orange, no share. A self-reported task can still secure the
day — that is the backend's rule — so D can carry "Day secured" as a headline; what it must never
carry is the verified mark or the word "verified".

Verification lines, verbatim:

- `photo`: "Captured live in the app · 9:17 PM"
- `timer`: "Timer ran 10:00 · started 6:02 PM"
- `run`: "Photo captured live · 5.02 km and 27:41 self-entered"
- `workout`: "Photo captured live · 45 min self-entered"
- `journal`: "Word count met · 150 words"
- `counter`/`water`: "Self-entered count · nothing was checked"
- `checkin`: "GPS 24 m from the saved location · ±8 m accuracy"
- `manual`: "Nothing was checked. You said you did it."

### 5.2 Stats and their queries

Only three progress cues are honest on this surface. Each with its query:

| Cue | Query |
|---|---|
| Streak, in days | `SELECT current_streak FROM user_streaks WHERE user_id = :uid` (server-computed; consecutive local days where every required task of every active challenge is complete) |
| Day of challenge | `SELECT day_index, length_days FROM challenge_enrollments WHERE user_id = :uid AND challenge_id = :cid AND status = 'active'` |
| Required tasks remaining today | `SELECT count(*) FROM tasks t LEFT JOIN completions c ON c.task_id = t.id AND c.local_date = :today WHERE t.enrollment_id = :eid AND t.required AND c.id IS NULL` |

Not shown, because nothing computes them: points, levels, XP, "next badge progress" as a five-day
pill row, percentile, rank. The five badge marks (3/7/14/30 days, 100 verified proofs) live on the
profile and are the only badge surface; if a submission crosses one, the confirmation may append a
single line — *"3-day badge earned"* — and nothing more. Backend confirmation needed (open question 4).

---

## 7. Gate blocked

Two cases, one layout: eyebrow / headline / body / meta line, and two actions.

| Case | Eyebrow | Headline | Body | Meta | Primary |
|---|---|---|---|---|---|
| Window not open | `NOT OPEN YET` | Opens at 6:00 AM | "This task only counts inside its window: 6:00 AM to 9:00 AM. You can shoot the photo then. Nothing is logged before it opens." | "Window opens in 8h 43m · we'll remind you at 6:00 AM" | Remind me at 6:00 AM |
| Out of range | `OUT OF RANGE` | You're not at Gold's Gym | "You need to be within 100 m of the saved location. Right now you're 1.4 km away. Nothing is logged until you're inside the radius." | "GPS accuracy ±12 m · last checked just now" | Check again |

Secondary on both: "Back to today". There is no timer-abandoned state: the timer cannot be
abandoned by leaving the app, only cancelled deliberately, which returns Home with nothing logged. Neither action is orange-on-orange; the primary is
`--ink` because nothing has been achieved.

Window copy elsewhere, before the user starts:
- Task row on Home, gated and not yet open: `Opens 6:00 AM` at 12px `--muted-light`.
- Task row, open and closing soon: `Closes in 41m` at 12px `--orange`.
- Entry/capture gate line: `6:00 AM – 9:00 AM` · `Camera only · live capture` ·
  `Be within 100 m of Gold's Gym`. One line each, plain words, never a card labelled "GATES".

---

## 8. Home after

The task row flips to done and the hero updates. Nothing is added.

- Task row: unchecked 24px `1.5px solid --border-strong` circle becomes a filled `--orange` 24px
  circle with a white check; label goes `--muted-light`; chevron disappears.
- Counter `{n} of 3` increments.
- Hero eyebrow `CURRENT STREAK` → `STREAK SECURED` and the number increments **only** when the day
  became secured on this submission. Otherwise the number does not move.
- Hero line: "Day secured. Proof posted 9:17 PM." / "One required task left before the day is
  secured." / "Secure today to reach 14 days."
- No "Streak secured" card, no Day 1-5 pills, no bottom sheet, no confetti, no auto-scroll to feed.

The new proof appears in the feed in its normal position. It is not pinned, highlighted, or
announced.

---

## 9. State model

```
type TaskType = 'photo'|'timer'|'run'|'workout'|'journal'|'counter'|'water'|'reading'|'checkin'|'manual'|'simple'

FlowState =
  | { step: 'entry' }                              // timer, checkin, or a gated task pre-window
  | { step: 'log', distance?, duration?, kind? }   // run, workout
  | { step: 'capture' }                            // photo, run, workout, reading(optional)
  | { step: 'review', photo: Blob, caption: string }
  | { step: 'running', startedAt: number, requiredSec: number }   // timer; remainder is derived
  | { step: 'write', text: string }                // journal
  | { step: 'count', value: number, goal: number } // counter family
  | { step: 'ask' }                                // manual
  | { step: 'verifying' }
  | { step: 'confirmation', result: SubmitResult }
  | { step: 'blocked', reason: 'window'|'range' }

SubmitResult = {           // server-authored, never inferred client-side
  taskComplete: true,
  daySecured: boolean,       // all required tasks, all active challenges
  daySecuredEarlier: boolean,
  requiredRemaining: number,
  streakDays: number,
  challengeDay: number, challengeLength: number,
  verificationKind: 'live_photo'|'timer'|'gps'|'word_count'|'self_report',
  timerStartedAt?: number, timerEndedAt?: number,   // timer only; both are shown
  badgeEarned?: '3d'|'7d'|'14d'|'30d'|'100proofs'
}
```

Confirmation variant selection: `verificationKind === 'self_report'` (or a self-entered count) → D.
Else `daySecuredEarlier` → C, `daySecured` → A, otherwise → B.

---

## 10. Open questions

Do not guess these; each needs a backend or product answer.

1. **Confirmation dismissal.** The brief's 3-tap target counts task → shutter → post. Landing on the
   confirmation and tapping "Done" makes it 4. Should the confirmation auto-return to Home after
   ~2.5s (true 3 taps, but it steals the read), or keep the explicit Done?
2. **Does a self-reported task secure the day?** The spec says a day is secured when all required
   tasks are complete, and `manual` tasks can be required. If yes, variant D can read "Day secured"
   — as designed. If product wants verified-only securing, D needs a different headline and the rule
   needs stating in-app.
3. **Discarding an unposted capture.** Back from review currently discards silently. Confirm dialog,
   or keep the camera convention?
4. **Badge crossings.** Does the submit response return `badgeEarned`? If not, the confirmation
   cannot mention badges at all and the profile is the only place they appear.
5. ~~Timer hard mode: what counts as leaving?~~ **Resolved:** hard mode is cut. The timer runs on the
   wall clock, so no event counts as leaving.
6. ~~Timer completion when the app is killed mid-run.~~ **Resolved:** `started_at` + duration is
   written when the timer starts; the client derives the remainder and the server can complete the
   session without the app ever being reopened. Reopening mid-run restores the true remaining time.
7. **Window edges.** If the window closes while the user is on the review state, does the post still
   count? Client-side we can stamp capture time; server needs to define which timestamp governs.
8. **GPS accuracy floor.** At what accuracy do we refuse a check-in rather than accept it with a
   caveat? Currently we always show ±n and always accept inside the radius.
9. **`reading` with an attached photo** — is the photo stored as a verified proof, or as an
   attachment to a self-entered count? Changes whether variant A or D applies.
10. **Strava-sourced runs.** If distance comes from Strava rather than by hand, is that verified? If
    so it needs its own verification line and it is a fourth gate, which contradicts "exactly three".
11. **Queued proofs and streaks.** A proof captured before midnight but uploaded after — which local
    date does it secure?
12. **Unrequired tasks.** Confirmation for an unrequired task: it cannot secure the day and cannot
    move the streak. Variant B's copy assumes required. Needs its own line, or suppress the stat row.
13. **Multiple active challenges.** The stat row shows one `Day n of m`. With two challenges active,
    which one, or both?
14. **Caption on non-photo types.** Journal has text; timer, counter, check-in have nothing to say.
    Should they get an optional note, or stay silent (current design)?
16. **Timer-sourced workout duration.** When "Use the timer instead" back-fills the duration, does
    the submit record it as timer-measured rather than hand-entered? If it does, the workout
    confirmation line can drop "self-entered" for that case; if it does not, it stays self-entered
    and the back-fill is a convenience only. Currently designed as the latter.
15. ~~Sound on timer completion~~ **Resolved:** the sound is an optional switch and follows the OS
    silent setting; the completion notification is not optional, and completion is honoured
    regardless of what the app was doing when the duration elapsed.
