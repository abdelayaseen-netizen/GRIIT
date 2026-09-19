# Diff from the current app

Source: the 17 screenshots in `uploads/`. Left column is what ships today, right column is the
change, then the chunk that does it.

| current screen | what changes | chunk |
|---|---|---|
| Home | Canvas #F4F3F1 to `canvas`; "Welcome" greeting to display name, then username, then first name; "?" avatar to the single fallback; "Current streak" label to `secondary` sentence case matching Profile; streak number to Barlow Condensed 600 at 64; feed switcher segmented control to ghost chips under the Feed heading; feed post names 700 to bodyStrong 500; em dash banner "While you were away, your network kept moving — catch up below." to caption "Three friends posted while you were away."; proof task circle loses its 1.5pt border; proof card done state from a filled button to a `brandTint` row with a check glyph and "Posted today", not tappable | C |
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
| Activity, Leaderboard | Two stacked segmented controls to one, with scope as ghost chips under a "This week" heading; pink flame banner to a caption line "Rankings reset every Monday. Post daily to climb."; the ink card holding one row to ListRows on the canvas with dividers; the viewer's own row filled `brandTint` at radius 12; rank, check ins and points to Barlow Condensed 600; flame emoji removed | D |
| Create, step 1, tab bar and CTA | Tab bar hidden; CTA pinned above the home indicator instead of behind the tab bar; "JUST YOU" and "UP TO 10" all caps to caption sentence case; duration chips radius 12; Solo and Group to the selected form chip style; tip to HintBox | F |
| Create, steps 2 and 3 | New, same wizard chrome, progress bar at 2 of 3 and 3 of 3, step 3 CTA "Start challenge" | F |
| Capture | New screen. `canvas`, Cancel tertiary at 44, 44pt flip glyph, challenge and task above the frame, 4:5 viewfinder at radius 20, one 72pt `textPrimary` shutter | E |
| Secured | New screen. `canvas`, number 96 Barlow counting up over 400ms, "Day 23. Verified." bodyStrong, proof 4:5, stamp on the scrim at the end of the count, week strip and buttons in the pinned footer, primary "Share", tertiary "Done" | E |
| Self reported | Same layout, no count up, no stamp, square not filled, "Day 23. Self reported.", Done only | E |
| Complete | New screen. Number 96, "30 days. Every one witnessed.", contact sheet of all 30 proofs, COMPLETE stamp, primary "Start the next one", secondary "Share", tertiary "Done" | E |
| Welcome | New screen. `canvas`, two `brand` bars 32 tall top left, "Discipline, witnessed." 44pt Barlow, "Photo proof. Daily. No way to fake it.", primary "Start", tertiary "Log in" to `/auth/login` | E |
| Share card | New. Both sizes, `canvas`, number 220, one copy line, proof, stamp, logo | E |
| Tab bar | Kept, with the FAB from an ink circle to a `surface` circle with a 1pt `border` and a `brandText` glyph | B |
| Every screen | Multi colour initials avatars (purple, blue, red, yellow, green) removed; `#BB471D` retired; all weights above 500 removed except Barlow 600; every emoji removed | A, B |
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
