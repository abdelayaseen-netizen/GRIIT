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
| Create, step 1 | Tab bar hidden; CTA pinned above the home indicator instead of behind the tab bar; "JUST YOU" and "UP TO 10" all caps to caption sentence case; duration chips radius 12; Solo and Group to the selected form chip style; tip to HintBox | F |
| Create, steps 2 and 3 | New, same wizard chrome, progress bar at 2 of 3 and 3 of 3, step 3 CTA "Start challenge" | F |
| Capture | New screen. `canvas`, Cancel tertiary at 44, 44pt flip glyph, challenge and task above the frame, 4:5 viewfinder at radius 20, one 72pt `textPrimary` shutter | E |
| Secured | New screen. `canvas`, number 96 Barlow counting up over 400ms, "Day 23. Verified." bodyStrong, proof 4:5, stamp on the scrim at the end of the count, week strip and buttons in the pinned footer, primary "Share", tertiary "Done" | E |
| Self reported | Same layout, no count up, no stamp, square not filled, "Day 23. Self reported.", Done only | E |
| Complete | New screen. Number 96, "30 days. Every one witnessed.", contact sheet of all 30 proofs, COMPLETE stamp, primary "Start the next one", secondary "Share", tertiary "Done" | E |
| Welcome | New screen. `canvas`, two `brand` bars 32 tall top left, "Discipline, witnessed." 44pt Barlow, "Photo proof. Daily. No way to fake it.", primary "Start", tertiary "Log in" to `/auth/login` | E |
| Share card | New. Both sizes, `canvas`, number 220, one copy line, proof, stamp, logo | E |
| Tab bar | Kept, with the FAB from an ink circle to a `surface` circle with a 1pt `border` and a `brandText` glyph | B |
| Every screen | Multi colour initials avatars (purple, blue, red, yellow, green) removed; `#BB471D` retired; all weights above 500 removed except Barlow 600; every emoji removed | A, B |
