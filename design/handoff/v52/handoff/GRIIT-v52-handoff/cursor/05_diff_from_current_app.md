# Diff from the current app

Source: the 17 screenshots in `uploads/`. Left column is what ships today, right column is the
change, then the chunk that does it.

| current screen | what changes | chunk |
|---|---|---|
| Home | Canvas #F4F3F1 to `canvas`; "Welcome" greeting to display name, then username, then first name; "?" avatar to the single fallback; "Current streak" label to `secondary` sentence case matching Profile; streak number to SF Pro Display Heavy 800 at 64; feed switcher segmented control to ghost chips under the Feed heading; feed post names 700 to bodyStrong 500; em dash banner "While you were away, your network kept moving — catch up below." to caption "Three friends posted while you were away."; proof task circle loses its 1.5pt border; proof card done state from a filled button to a `brandTint` row with a check glyph and "Posted today", not tappable | C |
| Home, feed rows with no photo | Ink block with three action glyphs to one `surface` line card, "Yaseen secured day 4" with meta caption, no action row | F |
| Home, finished card | Star glyph and "Finished — Day 1 of 1. Nothing left to prove." to a `brandTint` card, "Finished. 7 of 7 days verified.", no dash | F |
| Profile | Handle shown twice to once; orange "US" avatar to `border` ground with display name initials; "Edit profile" black fill to secondary; streak card radius 28 to 20 and ink card to `surface`; "BEST · 0 days" to "Best 0 days" following the Day format; three tab pills to one SegmentedControl; underlined "Add a line about what you are building" to a tertiary button; Consistency card keeps title 28 and gains a joined subtitle "Post every day. Missed days count."; "See the full record" outlined button to tertiary; empty states move out of their cards onto the canvas; Badges tab to the stamp grid, 2 columns, no cards, no circles | C |
| Settings | Row radius 28 to the card recipe at 20 with 1pt `border`; Account subtitle "Signed in with email · —" to "Signed in with email"; "Daily reminder at 9:00 AM" to "Daily reminder at 9:00"; Sign out stays secondary; Delete account tertiary `danger` | C |
| Discover, masonry | Mixed masonry of proofs, people and challenges to: ghost chips, one featured ChallengeCard, "Popular with your circle" heading with a caption line and a two column grid, "People" heading with a horizontal strip, an idea prompt on the canvas | D |
| Discover, gray placeholder tiles | Dumbbell, brain and lightning tiles to `canvas` cover fallbacks with the title in bodyStrong | D |
| Discover, PersonCard | White card with a coloured initials avatar and a filled orange Follow to a boxless strip cell: avatar 56 on `border`, name, "New here", secondary Follow at 44 | D |
| Discover, meta | "14 days · Easy" split into an uppercase orange chip and a caption, then reunited as one `secondary` caption "14 days · Easy" | D |
| Discover, "Create your own" dashed tile | Removed. The idea prompt at the bottom is the only entry point, with a secondary "Build your own" | D |
| Discover, "Have your own idea?" card | Card with a black filled "Build your own" to canvas content with a secondary button | D |
| Discover, truncated titles | "Make Your Bed…", "2-Week Hydrati…" to two line wrapping, nothing truncates | D |
| Activity, Notifications | Canvas to `canvas`; "No notifications yet" 700 to heading 20 at 500; ghost bell illustration to the EmptyState glyph circle; "Start a challenge →" text link to a primary "Find a challenge" | D |
| Activity, Leaderboard | Two stacked segmented controls to one, with scope as ghost chips under a "This week" heading; pink flame banner to a caption line "Rankings reset every Monday. Post daily to climb."; the ink card holding one row to ListRows on the canvas with dividers; the viewer's own row filled `brandTint` at radius 12; rank, check ins and points to SF Pro 500 tabular (not hero numbers, so not Heavy); flame emoji removed | D |
| Create, step 1, tab bar and CTA | Tab bar hidden; CTA pinned above the home indicator instead of behind the tab bar; "JUST YOU" and "UP TO 10" all caps to caption sentence case; duration chips radius 12; Solo and Group to the selected form chip style; tip to HintBox | F |
| Create, steps 2 and 3 | New, same wizard chrome, progress bar at 2 of 3 and 3 of 3, step 3 CTA "Start challenge" | F |
| Capture | New screen. `canvas`, Cancel tertiary at 44, 44pt flip glyph, challenge and task above the frame, 4:5 viewfinder at radius 20, one 72pt `textPrimary` shutter | E |
| Secured | New screen. `canvas`, number 96 SF Pro Display Heavy counting up over 400ms, "Day 23. Verified." bodyStrong, proof 4:5, stamp on the scrim at the end of the count, week strip and buttons in the pinned footer, primary "Share", tertiary "Done" | E |
| Self reported | Same layout, no count up, no stamp, square not filled, "Day 23. Self reported.", Done only | E |
| Complete | New screen. Number 96, "30 days. Every one witnessed.", contact sheet of all 30 proofs, COMPLETE stamp, primary "Start the next one", secondary "Share", tertiary "Done" | E |
| Welcome | New screen. `canvas`, two `brand` bars 32 tall top left, "Discipline, witnessed." 44pt SF Pro 500, "Photo proof. Daily. No way to fake it.", primary "Start", tertiary "Log in" to `/auth/login` | E |
| Share card | New. Both sizes, `canvas`, number 220, one copy line, proof, stamp, logo | E |
| Tab bar | Kept, with the FAB from an ink circle to a `surface` circle with a 1pt `border` and a `brandText` glyph | B |
| Every screen | Multi colour initials avatars (purple, blue, red, yellow, green) removed; `#BB471D` retired; all weights above 500 removed except SF Pro Display Heavy 800 on hero numbers (v40); every emoji removed | A, B |
| Create, step 1 | Cream canvas to `canvas`; white cards to `surface`; duration chips to ghost chips at radius 12; Solo and Group from bordered cards with "JUST YOU" and "UP TO 10" in the label style to cards with the descriptor in caption sentence case and a 1.5pt `brand` border when selected; HintBox to `brandTint`; tab bar removed and the CTA pinned; helper gains "Looks good" in `brandText` | F |
| Create, step 2 | Five bordered pack cards each holding a bordered icon tile to rows on the canvas with dividers, glyph 24 and no tile; selection from tint fill plus brand border plus a summary card down to one `brandTint` row; "ATHLETE · 3 TASKS" label removed and the contents inline as caption lines under the row | F |
| Add task sheet | Uppercase "TASK NAME" and "PROOF TYPE" on the canvas to `heading` sentence case; the 3 by 2 grid of bordered tiles with truncated subtitles to ghost chips in a wrapping row with one full sentence for the selected type only; "Need more? 4 advanced types available" to a tertiary "4 more types"; "Verified proof" out of its card onto the sheet ground as a row with a switch; "Enter a name to add task" to a disabled "Add task" | F |
| Create, step 3 | Three selection languages down to one: cards for Standard and Hard mode, ghost chips for public proof and category; the tinted research band to a `caption` under the chips; "75 Hard style — no exceptions" to "75 Hard style. No exceptions."; "Recommended for first challenge" to "Recommended for your first challenge"; Continue reads "Review" | F |
| Review sheet | "Review & launch" to "Review and launch" and "Confirm & launch" to "Launch"; five bordered summary boxes to rows on the sheet ground with dividers and a tertiary Edit per row; loading changes only the button to "Launching"; the raw zod array in red to the empty state pattern with heading "Could not launch" and a retry | F |
| Launch result | No screen today to the existing surface: "You are in.", "Day 1 begins tomorrow morning.", the challenge name, one primary "Back to Home", plus one secondary "Invite friends" for a group | F |

## Chunk Q — the proof moment, the proof grid, the last light screens

Frames 58 to 66, against build 58. Twelve changes, one new component, one server change.

| # | what the app does today | what to build | files |
|---|---|---|---|
| 1 | after a camera task, a text-only list; the photo just taken is not on the screen | the photo leads at 300pt, then two buttons: Share to the feed / Keep it to the record | `components/task-v2/{TaskConfirmation,useTaskFlowV2}.tsx` |
| 2 | the last camera task of the day secures it, skips the moment screen, and the photo is never offered a choice | frame 59's footer carries the same two buttons when the closing completion has an unshared photo. Never 58 then 59 | `app/task/secured.tsx` |
| 3 | Secured renders an empty image card when `proofUri` is absent | 0 proofs: no image area, list the challenges. 1: full width. 3+: three tiles and +n | `app/task/secured.tsx`, `components/task-v2/MomentScreenV3.tsx` |
| 4 | Secured shows an unqualified "Day 2." | the streak is the hero; day numbers appear only with a challenge name | same |
| 5 | Proofs tiles labelled "Day {n}" | date section headers, challenge name on the tile; full-view header is the date | `app/(tabs)/profile.tsx`, `backend/trpc/routes/profiles-record.ts` |
| 6 | Run step claims GPS for typed values and prints a design-system note | conditional honesty line; the GPS variant is written and held | `components/task-v2/steps/RunningStep.tsx` |
| 7 | Pause / Reset / Remove one / Type it are bare orange text in a left stack | `ds/ControlPill`, centred row, 44pt, surface + border | new `components/ds/ControlPill.tsx`; `steps/{TimerEntryStep,CountStep,SessionStep,RunningStep}.tsx` |
| 8 | capture shutter fills `surface` (`TaskCapture.tsx:3`), near-invisible on a dark viewfinder | 78pt `textPrimary` ring + fill; scrim pills on the top controls; the middle pill names the task and its window | `components/task-v2/TaskCapture.tsx` |
| 9 | `edit-profile.tsx` on `PROFILE_V2_COLOR` — cream, 2pt borders, `shared/Avatar` | DS_V3 surfaces, 1pt borders, `ds/Avatar`, Change photo as a ControlPill. Every field and validation unchanged | `app/edit-profile.tsx` |
| 10 | "Ready for more?" on the legacy palette, `#1A1410` ground, `#E8593C` coral, 700 weight | a `ListRow`; subtitle binds `FREE_ACTIVE_CHALLENGES_LIMIT`, not the group cap | `components/home/DiscoverCTA.tsx` |
| 11 | three consistency definitions ship at once | one: secured ÷ due days closed, all-time, today excluded. One phrasing: "{secured} of {due} days". No percentage | `lib/profile-consistency.ts` (delete), Home hero, `profiles-record.ts` (already correct) |
| 12 | `checkins.complete` inserts the public feed row with the photo at completion (`checkins.ts:822-842`) | insert it `shared: false`; "Share to the feed" and the full-view Share flip it. Feed queries add `where shared = true`; record, roster, grid and consistency queries do not | `backend/trpc/routes/checkins.ts`, feed queries |

**Order.** 12 first — it is the server change every share affordance depends on, and 1, 2 and 5 are
dishonest without it. Then 1, 2, 3, 4 as one task-flow pass. Then 7 and 8, which are small and
self-contained. 9, 10 and 11 are independent of all of it.

**Deletions.** `lib/profile-consistency.ts` goes entirely; Home reads
`consistency.verifiedClosed / closedDueDays` from `profiles.getRecord`. The shutter comment at
`TaskCapture.tsx:3` goes with the fill it justifies.

## Chunk R — the density pass

Frames 67 to 74. A value-only token diff plus eleven component edits. No new components, no colour
changes, no copy changes.

**Commit 1 — tokens.** Apply `src/tokens.dense.ts` to the DS_V3 export, and remap `dynamicType` in
the same commit (`body`/`bodyStrong` → `subheadline`, `secondary` → `footnote`, `caption` →
`caption1`, `label` → `caption2`, `heading` → `headline`, `title` → `title3`, `display` →
`title1`). Splitting these ships a scale that misbehaves under Dynamic Type.

**Commit 2 — components**, file by file; a component still on the old paddings looks loose, not broken.

| file | edit |
|---|---|
| `components/ds/Avatar.tsx` | size union 32/40/56/96 → 28/32/44/80. Type error until done |
| `components/ds/ListRow.tsx` | paddingVertical 16 → 10, icon 24 → 22, gap 12 → 10, keep minHeight 44 |
| `components/ds/Card.tsx` | padding 20 → 14 |
| `components/ds/Chip.tsx` | padding 14 × 8 → 12 × 7 |
| `components/ds/TabBar.tsx` | height 64 → 56, icon 26 → 22, labels unchanged at 11 |
| `components/ds/WeekStrip.tsx` | square radius 12 → 8, gap 8 → 6 |
| `components/feed/FeedPostV3.tsx` | header paddingVertical 14 → 8 |
| `components/task-v2/taskFlowStyles.ts` | hardcoded 15pt type and 52pt footer height |
| `components/task-v2/steps/CountStep.tsx` | Add one circle 132 → 116 |
| `components/ds/ControlPill.tsx` | unchanged — already 44 and at the floor |
| `app/edit-profile.tsx` | its own scale; chunk Q rewrites this file anyway |

**Two documented exceptions**, written into the components rather than the tokens: the morning-after
block keeps a 16pt internal gap and a `bodyStrong` fact line, and a window-closed row's gate line uses
`secondary` 13 rather than `caption` 12. Both are places where less prominence is the wrong answer.

**Acceptance, on a 393 × 852 device.** Measure against v27, not against an absolute. Each of these is
taken off the frames in `GRIIT Density.dc.html`:

| surface | test | expected |
|---|---|---|
| Home | task rows fully visible above the tab bar, with 8 rows of content | 6 → 8 |
| Feed | height of the third post visible above the tab bar, with 3 posts | 0 → 50pt |
| Profile | third date section, with 3 sections | clipped → whole |
| Consistency | bottom of the footer caption | 772 → 651 |
| Login | bottom of the Sign in with Google button | 648 → 576 |

Within a few points is a pass — line-height rounding and font fallback move these by one or two.
An unchanged number means the tokens did not reach that component; a much larger drop means something
lost a line, which is a regression, not a win.

**Not an acceptance criterion:** Login clearing the keyboard. It does not, at either scale — see
breakage 9 in `cursor/02_screens.md`.

## v28.1 — patch

Five fixes on top of chunk Q. Frames 75 to 78.

| # | today | build | files |
|---|---|---|---|
| 1 | morning-after third line is unconditional: "Your streak reset to 0." under a hero reading 1 | branch on current streak: "Your {previous_streak}-day streak ended. Today starts the count at 1." Hero sub-line becomes "Day 1 of the next streak." | the Home morning-after block |
| 2 | Secured footer keys off the closing completion, stranding unshared photos when the day ends on a self-report | footer offers every unshared proof in the day as one set; single Done when none | `app/task/secured.tsx` |
| 3 | `accessibilityLabel` missing on section headers, challenge rows and sheet dismiss; empty task title renders "Task" | add the four labels; fallback becomes the task's type or target; disable Add task until the name is non-empty | `components/ds/{ListRow,Sheet}.tsx`, `components/create/NewTaskSheet.tsx` |
| 4 | `N` in "Day {n} of {N}" unbound | bind to `challenges.duration_days`; clamp `n` to `N` and never render past it | today/Home row builders |
| 5 | a challenge whose last day passes leaves Home silently; quitting deletes the row | end screen on first open after `current_day > duration_days`; Running and Finished sections in Profile | new end screen, `app/(tabs)/profile.tsx` |

**Schema.** `challenge_participants` needs `ended_at`, `ended_reason ('completed' \| 'left')` and
`end_seen_at`. Without `end_seen_at` the end screen either never fires or fires every launch.
Quitting must write `ended_reason = 'left'` rather than deleting the row.

**Order.** 4 first, it is a one-line bind and item 5 depends on it. Then 5, which is the only one
needing a migration. 1, 2 and 3 are independent.

## Chunk T — the end of a challenge

| # | today | build | files |
|---|---|---|---|
| 1 | Secured footer draws from the closing completion (correct); the self-report close shows a bare Done | add the "{task} closed the day" card and the Profile, Proofs pointer caption | `app/task/secured.tsx` |
| 2 | a challenge past its end date stays until the day counter passes | end on the end date in the user's timezone, at 23:59:59 local | the enrollment reader |
| 3 | no end screen | `ChallengeEnd`, single and combined | new `components/ChallengeEnd.tsx` |
| 4 | Profile → Challenges is one flat list | Running and Finished, four status lines | `app/(tabs)/profile.tsx`, new `components/ProfileChallenges.tsx` |
| 5 | contact sheet encodes three states on surface-vs-canvas | five states on value and form, WeekStrip encoding, 12 columns | `components/ds/ContactSheet.tsx` |

**Migration.** Add `ended_at` and `end_seen_at` to `active_challenges`. **Backfill
`end_seen_at = ended_at` for every row where `status <> 'active'`** in the same migration, or every
historical enrollment fires an end screen on first launch. No `ended_reason` column — `status`
carries it.

**Order.** 2 first (it decides when anything else fires), then 3 and 4 together, then 5, then 1.

## v41 — Finish, time, record

- **Task finish:** delete the full-screen "Saving your day". Tapping I did it navigates straight to FinishMoment, and the save runs underneath (114).
- **Share:** held on the client until the save succeeds; dropped on failure. Every task type gets a share choice; non-camera tasks share a text card.
- **Time gates:** the text inputs are replaced by `TimeField` + the wheel picker. Store HH:MM 24h, display 12h. Validate end > start (115).
- **Late join:** `start_at` moves to tomorrow when any required window has closed. Home excludes pre-start enrollments from today's count and from `secured_today` (116).
- **Profile Proofs:** the tile grid is replaced by the month calendar (117).
- **Profile Challenges:** rows via `rowText()`; sections Running / Finished / Left; the legacy note is dropped (118).
- **Challenge detail:** a per-challenge week strip from `start_at`; `gateLabel(task)` everywhere; the Rules line uses the freeze copy (119).
- **Join errors:** four coded sheets; no "Server Error" string in the UI (120).
- **Feed:** hit areas per 121; hide "No comments yet."
- **Discover:** covers from `cover_url` or `lib/cover.ts`, never from proofs (122).
- **Create:** seven items are build drift against 104/105. New: the category shows in title case; the Standard copy states the manual freeze (123).


## v41 review, founder decisions

- **Backend, blocks F1.** Every completion writes its feed row unshared (`shared = false`) and flips on Share, for every task type, not only camera. Today self-reported rows are written `shared = true`. Contradiction 115.
- **Copy.** Replace "Standard mode. Gates are recorded, not enforced." with "Standard mode. Every gate blocks. Freezes cover a missed day." everywhere; grep `recorded, not enforced`. Gates block in both modes; modes differ only in freezes.
- **Location gate stays live** in the add-task sheet: row "Only counts at this place.", opens Set place, sets `require_location`. Do not ship the inert "Not available yet." row from the earlier v41 draft.


## v42 · Chunk D

1. Wrap every screen in `ScreenChrome` (`v42/ScreenChrome.tsx`). Delete per-screen SafeAreaView top padding.
2. Replace every avatar render with `v42/Avatar`. Grep: `avatar_url ?`, `borderRadius: 999` + `Image`.
3. Home: remove the "{n} days · {pct}%" line and the "{n} freezes left" line. Add the freeze chip and the "since {date}" hero line. Move next-badge progress to Profile → Badges. Reorder the sections.
4. Feed: replace the VERIFIED pill with `CameraSeal`. Render completions without a photo as `FeedCompactRow`. Group joins with `joinLine()`. Exclude guests server-side in the feed query. Wrap posts in `DoubleTapRespect`.
5. Profile: `ProfileHeader`; icon tabs; the calendar as frame 117 at the new density; the Challenges tab as `ChallengeCard`; remove the footnote paragraph.
6. Badges: server-side evaluation of the 12 in `v42/badges.ts`. Award only from the listed facts. No manual grants.
7. Onboarding: the new strings (frames 137–141). The Start here query uses catalog only, duration ≥ the chosen line, and never 1 day. Gate labels are derived from the task's gates.
8. Finish: `ShareActions`, feed and Story as separate actions; the sheet captions from `STICKER_STYLES`.

9. v42.1: in the Start here sort, put No Days Off last and never pre-select it. Cap `ProgressStrip` at 14 segments with its label. System lines use `FeedSystemLine` with the avatar. Challenge detail: replace any "Day secured" / "Today is secured" with "Done for today." plus the sub-line (frame 145). Guard the double tap on your own post.

10. v42.1 privacy strings. `rg "365-day|verified the day"` against `main` @ 74072b5, current time 2026-09-30T00:31Z:
   - `app/settings/privacy.tsx:34` — ACTIVITY_COPY.public "Anyone can see your 365-day map and your proof photos." → "Anyone can see your calendar and the proofs you shared."
   - `app/settings/privacy.tsx:35` — ACTIVITY_COPY.friends "Only your circle sees your map and proof photos." → "People you follow who follow you back can see your calendar and the proofs you shared."
   - `app/settings/privacy.tsx:36` — ACTIVITY_COPY.private "Your map and proofs are yours alone." → "Only you see your calendar and proofs."
   - `app/settings/privacy.tsx:124` — honesty title "None of this hides a proof from a challenge you joined" → "Photos stay private until you share them."
   - `app/settings/privacy.tsx:127` — honesty body "Everyone in a shared challenge sees whether you verified the day. Privacy controls what your profile shows outside it." → "Challenge members see whether you finished the day, never a photo you kept."
   - Design-only copies, not shipped: `claude/design/profile-v2/GRIIT Profile and Settings v3.dc.html:658, :1127`, `claude/design/profile-v2/README.md:243, :245`, `claude/design/profile-v2/src/screens/Privacy.jsx:60`, `claude/design/profile-v2/GRIIT Profile and Settings (standalone).html:400`. Update or delete them so they are not copied back in.
   - Clean: `components/`, `backend/`. `lib/` returned nothing, but the scan was partial (319 of 341 files). Run the rg locally before closing.
   Lines 35, 36 and 124 match the old strings but not the grep; they are listed because their replacements were in the same instruction.

11. v42.1, contradiction 121 resolved. Friends = mutual follow. In `app/settings/privacy.tsx`:
   - `:23` PROFILE_COPY.friends → "Only people you follow who follow you back see the record. Others see your name, photo and bio only."
   - `:29` CHALLENGE_COPY.friends → "Only people you follow who follow you back see your runs. Others see the tab as hidden."
   - `:35` ACTIVITY_COPY.friends → "People you follow who follow you back can see your calendar and the proofs you shared."
   - `app/profile/[username].tsx:243` "…to people they have accepted. Follow to see the record." → "…to people they follow who follow them back. Follow to see the record."
   The server's `friends` visibility check must be mutual follow.


## v43 · Restructure
1. Home renders the feed (FeedHeader + infinite list) under TodayCard. Remove WeekStrip, the freeze line and "See all in Activity" from Home. Default scope Everyone until following_count >= 3.
2. One `ProofPost` for photo and self-reported; `FeedEvent` with an avatar always, grouped within 60 minutes. Drop FeedCompactRow and FeedSystemLine (v42).
3. Activity: remove the Feed segment. Leaderboard rows go in a card at inset 16. Week line "Day {n} of 7 this week".
4. Discover: add search, the shared category list, Friends are doing, Popular this week (joins in the last 7 days), New from the community (public user-created). Generated covers only.
5. Profile: stats streak / secured / friends (mutual). Proofs grid default with a calendar toggle. Badges earned + next card. Private-not-friend lock card.
6. Privacy: replace the three controls with `is_private`, migrating as specified. Keep the stranger preview.
7. Add task: `photo_mode` replaces `require_photo`; Limits UI; remove Run from the starter chips; placeholder at textSecondary 70%. Check-in sheet for optional photos.
8. Backend: an optional-photo completion without a photo writes `proof_photo_url` null and is self-reported everywhere (seal, badges, stickers).


## v43.1
1. The feed segment label is Following | Everyone. Keep "Friends" for mutual-follow only (profile stat, privacy, Friends are doing).
2. Privacy: write `profile_visibility`, `challenge_visibility` and `activity_visibility` together. Do not add `is_private`.
3. `photo_mode` goes in `challenge_tasks.config`, falling back to `require_photo`. Do not add a column.
4. Remove any completion rate from Discover.
5. Sparse states 155–160 and the challenge detail week/freeze section 161. Optional-photo render rule 162: `proof_photo_url` null means self-reported.
6. Pushes: morning push 45 minutes before the earliest open window closes, plus the evening push at `SECURE_REMINDER_TIME` (8:00 pm). At most 2 a day, none once secured.


## v44
1. ProofPost: inset photo panel (16, radius 20, 4:5) with the title on a scrim; the self-reported panel matches. Hide counts at 0. FeedEvent uses the 32 avatar column.
2. Home header: date 17/22, name 13, streak chip hidden at 0. TodayCard states as in 165, including the window-closed block and the secured footer.
3. ChallengeDetail: add the board (top 3 + you), recent shared proofs, the record card with the 14-segment strip and the invite card. The freeze row becomes actionable. The streak chip opens StreakSheet with "Use a freeze for {weekday}".
4. Discover: Featured row of the 8 built-ins (seed data; no schema change), generated covers, "{n} people in it" / "New". Preview sheet before Join with the v41 Day 1 rule.
5. Create: step 1 defaults to 7 days with no category preselected; task rows show the full rule; one-screen add-task sheet; step 3 copy; Review; Launched with Start today + invite link.
6. Profile: stats rules as in 170; the "Find friends" second button at 0 friends; new-account cards.
7. Task complete: a toast for non-last tasks (no modal). The Secured screen title is "Day {n} secured." for one challenge, otherwise "Day secured." with per-challenge lines.


## v44.1
1. ShareSheet (173): one `ShareImage` component per style, rendered at 1080 × 1920 with react-native-view-shot; the preview is the same component scaled. Targets Instagram Story / Save / Messages / More; caption as text only.
2. Styles A–G per the 174 table; palettes Ink / Orange / White; join line from `inviteDeepLink`.
3. Moment → style lists per 176; remember the last colour per style.
4. Replace the v42 StickerStyles sheet and the "Copy: paste it as a sticker" caption.
5. The place-gated join flow opens SetPlace (177) straight after Join; Skip leaves the place unset.
6. Seed data: Fajr Before Sunrise duration_days 7. Featured "Be the first" at 0 members.
7. Fix the invite-link copy in Create Launched, Challenge detail and Leaderboard solo to `/invite/{code}`.


## v45
1. Challenge detail (group): Today roster, board (top 3 + you, from 3 members), challenge posts, invite row, Bring someone card.
2. Nudge: eligibility, a server-side once-a-day check on notifications (type nudge), three message keys, "2 hours left." gated by the recipient's deadline, bundling.
3. Notifications: joined (batched), you're left (8 pm, replaces the reminder in groups), nudged, finished (the morning after). A 3-push daily budget with priority; overflow goes to Activity only.
4. Solo → group conversion on existing fields; invite via `inviteDeepLink`.
5. Remove accountability partners: screens, routes, pushes, the Battle Buddy award, the limit. One-time migration card.


## v46 · Visual system reset
1. Apply `src/tokens.v46.ts` to `tokens.ts`. Keep `border` as an alias of `hairline` and `bodyStrong` of `headline` for one release.
2. Every tab: `ScreenHeader` (D3). Profile: `HandleNavBar`.
3. Replace every orange chip, segment, pill and board row with the inverted or raised treatment (`Segmented`, `Chip`). Grep `brandText`, `brandTint`, `#E8600F`, `#3A1F10`.
4. Home: `StreakStrip` + `statusLine()`; a single primary button for the next open task; compact challenge sections; Feed header with segments.
5. Feed: `SelfReportedRow`, grouped `activityText()`, `ProofImageFallback` on image error; "You're caught up." with no count.
6. Discover: `Cover` for every card and remove image slots; meta via `coverMeta()`; `inItLine()`; remove "Be the first"; the People query excludes the viewer.
7. Profile stats: Streak · Best · Days secured; "Next badge" moves to the Badges tab.
8. Challenge detail: "days done · secured" copy; the Mon–Sun week; Camera / Self-reported badges, never "VERIFIED".
9. Activity: 32pt segments; a solo challenge shows only the invite state.
10. Counter: two-line header, +5 / +10, sub-line per gate; remove "Nothing is secured until the server says so."


## v47 batch 1
1. `ds/WeekStrip`: the eight-state spec, 30 / 36 / 20 sizes, letters above, the whole strip as one 60pt+ button → StreakSheet, one VoiceOver label.
2. Home: remove the bell from the header; Activity tab unread dot; cards by fill, not hairline; miss row + FreezeSheet copy; milestone row; offline banner; outline shimmer.
3. StreakSheet becomes the record (month, key, stock); the offer stays in FreezeSheet.
4. JeopardyModal: drop the freeze CTA and the motivational copy (159).
5. Task steps: two-line header; remove SIMPLE_ASK_CAPTION from every step; Failed eyebrow text-primary; TaskCompleteToast Share → secondary.
6. Permission pre-prompts + denied states for camera and location (not built).
7. Timer: paused copy, and Home "Back to {task} · {time}" while it runs (not built).
8. Share choice failed state; Instagram return toast; Instagram-missing sheet (not built).

9. v47 review: keep the primary button on "can't be secured" (revert the hide); "Secured. {n} days in a row."; self-reported steps show only "Self-reported." (drop the What this records card); remove JeopardyModal.


## v48 · Batch 1R diff (against build 75, by description; screenshots not yet in project)
1. Home: move streak block to the top; delete the date + name header; move the primary button into the top block (fixes the button hidden by the tab bar).
2. Home: one status line per state; remove the duplicate "Today can’t be secured" in the card; demote the first-day message to the section caption.
3. Freeze: replace both strings with `FREEZE` from `v48/copy.ts` on Home and challenge detail.
4. BlockedStep: "Opens at" reads `window_start` (build 75 says midnight).
5. WindowClosedStep and every full-screen step: respect top inset 59.
6. Router: post-proof navigates to Home + toast, or task/secured; add a dark `+not-found` with no system header and "Go to Home".
7. Feed: full-bleed photo posts, carousel for multi-proof days, compact self-reported rows, `groupActivity()` cap; hide the Everyone hint when Following is selected.
8. proof/[id]: add "Share this proof" for owner + private.
9. Free-tier limit: replace the one-line page with the limit screen (3 challenges, Leave, See Pro).
10. Leave: confirm sheet, then Home toast and recalculated status line.
11. Tab bar: unread dot to text-primary (not orange).
New components: `v47/WeekStrip`, `v47/StreakStrip`, `v47/TaskRow` (GateLine, TodaySection), `v47/ShareChoice` (TaskCompleteToast), `v48/SafeArea`, `v48/FeedPost` (PhotoPost, groupActivity), `v48/copy`.


## v48 · Batch 2 diff
1. Discover: covers from `v48/Cover` only; never a proof tile. Category tints per flag 199.
2. Feed: hide counts at 0; CameraSeal tap opens the explanation sheet; comments get posting/failed states; long-press own comment → delete confirm.
3. Post overflow: Hide, Report (reason picker, not built), Block (confirm + toast). Own: Share, Make private, Delete.
4. Challenge detail: 16pt gutter on every block; freeze row imports `FREEZE`; board only with 2+ people; Leave → "Leave at midnight".
5. Profile: Proofs grid 4:5 with Today tile and honest self-reported tiles → `ProofDayBlock` vertical feed; owner private proofs show "Share this proof".
6. Strictness label "No Days Off" → "Strict" everywhere (the starter pack keeps its name).


## v48 · Batch 3 diff
1. `profile/[username]`: one button per relationship state; visitors get shared proofs only and the shared-only day feed; add blocked-by-me and not-found states.
2. Activity: inline Accept / Not now on group invites; boards use the strip's week array; chip row scrolls (no truncation); add Global "last 7 days" pending flag 206.
3. Create: add-task sheet content padding = sticky height + 12 so the last field clears the button; wheel picker same-day only; duplicate catalog name warning.
4. Settings: rename "Circle activity" → "Group activity"; add Blocked users, Permissions, delete-account subscription step; legal pages render dark.
5. Paywall: read every price/trial/period from RevenueCat offerings; billed amount largest.
6. Own post menu: "Delete from the feed" replaces Delete + Make private (decision 204). Creator leave: ownership auto-passes (203). Group streak counts held days (202).


## v48 · Batch 4 diff
1. Onboarding order: Welcome → WhyProof → WhyCircle → Goals → DayTarget → FirstChallenge → Reminders → Account → Profile (delayed sign-up).
2. Reminders: pre-prompt with one Continue before the iOS alert; designed denied state.
3. Auth: in-button loading; inline field errors; 60 s resend lock with countdown; expired reset-link screen.
4. Retire: `create-challenge`, `(tabs)/teams`, `create-profile` (redirect to onboarding Profile), JeopardyModal (already retired), Global board.
5. System: force update via remote config `min_supported_build` (not built); toasts one at a time at 95pt (tab) / 46pt (no tab).


## v48.1 diff (build 75 device test)
1. Wrap ReviewStep, CountStep (Type it), WriteStep, CommentsSheet, StepBasics and EditProfile in KeyboardAvoidingView (padding) + scroll-to-focused; dock the primary to the keyboard; InputAccessoryView Done bar on every number pad; CountStep button "Log n of N".
2. ShareSystemSheet: add "Copy sticker" (UIPasteboard image/png of the transparent sticker) and the Soft shadow / Outline variants; keep Instagram Story behind the Meta App ID.
3. TaskCompleteToast and SecuredDayScreen: replace the two equal buttons with the outlined photo pill + quiet "Keep it to the record"; toast holds 8 s for photo proofs; optimistic insert of the shared post at the top of Home's feed.
4. Replace ad-hoc post-save navigation with `routeAfterSave()`; stop opening FinishMoment when a counter meets its target; finish card reads server secured_days and longest_streak.
5. Route every number + noun through `count()`; fixes "1 days in a row".


## v49 diff (against v48 / build 75; build 77 screenshots not received)
Build 78
1. FeedPost → X-style layout (avatar column, name/@handle/time, context line, caption, media, Respect/Comment/Share with counts); PostThread with thread lines; tap time → full date; grouped activity lines; empty + sparse feed.
2. New PhotoZoom (full screen, swipe-down dismiss, multi-photo pager "1 of 2").
3. Profile gains "Your data" tab + GET /me/stats?range=; 7d/30d/All segment; empty state; Challenges tab split Running / Finished.
4. Profile "Days secured" reads user_stats.secured_days (seed 28).
5. HomeTop Option B greeting; first-week strip counts days 1–7; pre-join days never "miss".
Build 79
6. HealthKit read-only integration: Settings row, pre-prompt, not-sharing state; Create proof option "From Apple Health" with steps / workout minutes / distance; auto-complete + toast; feed card and proof view labelled "From Apple Health".


## v50 diff (build 78 device feedback; screenshots not received)
Build 79 · app
1. HomeTop → 2c One card (replaces the one-line 800-numeral streak row). Best label rule. Freeze card + "Use a freeze" on a missed yesterday.
2. CountStep: sticky "Complete · {target}"; partial → "Log n of N".
3. StoryCard: "Day n of N" from day_index / duration_days; self-reported + finished variants.
4. FeedPhoto: double-tap like, white burst; filled white heart.
5. Feed: started lines quiet + tap → preview with Join; new finished post type.
6. Profile: ProofScroll from grid tiles.
Build 80 · widget extension
7. TimerLiveActivity (Lock Screen + Dynamic Island) with App Intents.


## v51 diff (build 79, 45 screenshots IMG_0640–0684)
1. Tokens: Headline/Body 17/22, Secondary 15/20, Caption 13/18.
2. Home: greeting → title; Today box-of-boxes → flat rows, done collapsed; no filled orange checks.
3. New post kind: self-reported card.
4. Profile proof viewer: vertical list → stories-style viewer (tasks sideways, days vertical).
5. Profile header: friends count line; one Edit profile button.
6. Streak share cards: real day states, handle once, filled layout; sticker preview over sample photo.
7. Your data: flat sections, "MMM d" ranges, legend, "8 am", plurals.
8. Orange audit: remove from Challenges-tab segments, "Share today" text, badge discs, filled checks.
