# GRIIT consistency pass

One system, applied to every screen. Not a redesign: the same loop, the same navigation, the same
copy that already worked, rebuilt on ten tokens, eight text styles, three radii and one card recipe.

- Prototype: `GRIIT System.dc.html` (twelve labelled frames, each with a two line change note; the day
  secured frame plays the only animation in the app).
- Source: `src/tokens.ts` plus `src/components/*`. No raw hex appears outside `tokens.ts`.
- Proof photography: `assets/proof-keyboard.png`, `assets/proof-can.png`, cropped 4:5 from the
  supplied screenshots.

Voice: blunt, short, no cheerleading, no exclamation marks. The app never claims verification it
cannot back. Copy describes, it does not sell.

## The 12 laws

1. **One canvas.** `canvas #0F0F0F` on every screen. No gray screens, no white screens, no light mode.
2. **One family, two weights.** System font, 400 and 500 only. Hierarchy from size and colour.
3. **Eight text styles.** display 34/41, number 64/64 (streak only), title 28/34, heading 20/25,
   body 17/22, bodyStrong 17/22, secondary 15/20, caption 13/18, label 12/16 uppercase. Each maps to
   an Apple text style so Dynamic Type scales the app; the streak number is fixed.
4. **20pt gutters, 4pt grid.** Screen and card padding 20, stacked cards 12, sections 32, two column
   gutter 12. Every number on screen is a multiple of 4.
5. **Three radii.** 12 inputs and chips, 20 cards, pill for buttons, tab bar and avatars.
6. **Orange means "do this".** `brand.action #BB471D` fill with a white label, one per viewport.
   Repeated row actions are secondary. Active tabs, chips and segments use `#BB471D` text or a 1.5pt
   `#DC5401` outline, never a fill. `#DC5401` is non-text only.
7. **Weight comes from surface, not from black.** Cards are `surface`; there is no separate ink hero
   card. The Profile streak card is a surface card carrying the display number, brand.tint if it needs
   weight. Cover fallbacks stay canvas. The proof moment is the full bleed photo with the number over
   it, not a change of ground. Primary buttons are brand fill with an onBrand label.
8. **Two headers plus the wizard.** Root: display title at the gutter, 8pt below the status bar area.
   Pushed: 44pt bar, chevron left, centred heading 17/500. Wizard: Cancel, step, progress bar, tab bar
   hidden, CTA pinned above the home indicator.
9. **One card recipe.** Surface #1A1917, radius 20, 1pt border #2E2B27 on canvas, no shadow. No ghost
   placeholders.
10. **One empty state.** Heading 20, one sentence, one primary button. Same component everywhere.
11. **Copy rules.** Sentence case except the label style. Second person. No emoji, no dashes.
    "Day 1", "1 day", "23 days". The same concept uses the same phrase on every screen.
12. **One identity fallback.** Initials from the display name on `avatar.tint`, else a person glyph.
    Never initials from a `user_` handle. Greeting is display name, then username, then first name.

## Containment, laws 21 to 25

21. **The canvas is a surface.** Content sits directly on the canvas by default. A card is used only
    when content must be read or tapped as one unit: a proof, a challenge cover, a settings group,
    the proof task card, the streak card. Headings, captions, chip rows, people strips, lists of
    rows, prompts and hints sit on the canvas with no box.
22. **Nesting depth is two.** Canvas, then card, then content. Never a bordered element inside a
    bordered card. Inside a card a button is filled or tertiary, never outlined. A card never
    contains a card.
23. **One selection language per screen.** A segmented control switches views, max one per screen,
    directly under the title or directly under the hero (amended, Sept 6 2026). Filters and scopes are ghost chips: text on the canvas, selected is
    brand.tint fill with brand.action text, unselected has no border and no background. Chips never
    sit directly under a segmented control; they belong to a content section, under a heading.
24. **Chrome budget.** At most one band of controls between the title and the first content. A hint
    is a caption line under a heading, not a tinted band. HintBox is reserved for the Create wizard.
25. **One hero per screen.** The number on Home, the featured cover on Discover, the ink card on
    Profile, the list on Activity, the form on Create. Everything else is quiet: text on canvas,
    secondary colour, no fill.

Media, state and motion rules 13 to 20 are enforced in `ProofImage`, `Skeleton`, `EmptyState` and
`motion.daySecuredMs`: 4:5 everywhere, scrim under any text on an image, ink fallback instead of gray
boxes, blurhash instead of spinners, one animated moment, 44 by 44 minimum hit size.

## Tokens

| token | hex | use | measured |
|---|---|---|---|
| canvas | #0F0F0F | every screen | |
| surface | #1A1917 | cards, sheets, inputs | |
| border | #2E2B27 | card edges, dividers, segmented track | |
| text.primary | #F5F3EE | primary text | 17.3:1 canvas, 15.8:1 surface |
| text.secondary | #A39E95 | subtitles, captions, meta | 7.2:1 canvas, 6.6:1 surface |
| brand | #DC5401 | fills, week strip, active outlines | |
| brand.text | #E8600F | orange as text on dark grounds | 5.6:1 canvas, 5.1:1 surface |
| brand.tint | #3A1F10 | hint grounds, selected chips, your own row | |
| onBrand | #0F0F0F | label on a brand fill | 4.9:1 on brand |
| danger | #E5533D | destructive only | 5.1:1 on canvas |

**Why ink, not cream.** Labrecque and Milne (2012) find high value negatively affects
ruggedness (β = -.344, p < .001) and saturation carries ruggedness and excitement; their central
result is that consistency between colour and brand personality predicts preference better than the
colour itself. GRIIT's traits are ruggedness and competence, and the copy says "Discipline,
witnessed." A cream and white ground said journaling app. The audience's own reference set (WHOOP,
Nike Run Club, Hevy, Bandit) and the nearest mechanical analog (BeReal) are dark, and 6am proof
photos read as dark holes on a light page and as content on ink. The cost is sunlight readability,
which does not apply to a 6am indoor use. This is the mode, not a dark mode.

Two text colours, ink and secondary. The pink leaderboard banner and the multi colour initials
avatars are removed.

## Components

`Button` (primary, secondary, tertiary; 52pt, 44pt small) · `Card` · `InkCard` · `Chip` ·
`SegmentedControl` (one level) · `ListRow` · `Divider` · `HintBox` · `EmptyState` · `ErrorState` ·
`Avatar` (32/40/56/96) · `AvatarStack` (max 3, 2pt ring) · `FeedPost` (photo, no photo, finished) ·
`ChallengeCard` · `PersonCard` · `LeaderRow` · `RootHeader` · `PushedHeader` · `WizardHeader` · `WizardFooter` ·
`TabBar` · `WeekStrip` · `ProofImage` (feed, card, thumb) · `Skeleton` · `ShareCard` (story, feed).

## What changed, per screen

1. **Home.** Canvas fixed from cool gray. Greeting is the display name, not "Welcome" with a "?"
   avatar. "Current streak" is secondary in sentence case and matches Profile. The "While you were
   away" banner is one caption line with no dash. Feed uses FeedPost variants, and the Friends and
   Everyone switch became ghost chips under the Feed heading so the screen has one selection
   language. The proof task circle lost its border: nothing bordered sits inside a card.
2. **Discover.** Rebuilt: chips, one featured ChallengeCard, a two column grid, a people strip, the
   idea card. Masonry, proof posts in the grid, gray placeholder tiles and repeated orange Follow
   buttons are gone. One filled orange button on screen, the featured Start. Titles wrap, nothing
   truncates. Difficulty reads as one secondary caption, "14 days · Easy", not an uppercase orange
   chip, and the section heading carries a caption line. Containment pass: the people strip and the
   "Have your own idea?" prompt lost their boxes and sit on the canvas, so the featured cover is the
   only hero and the outlined button no longer sits inside a card. Filter chips are ghost chips.
3. **Activity, notifications.** Canvas fixed. Bold empty title dropped to heading at 500. The text
   link with an arrow became one primary button. EmptyState component.
4. **Activity, leaderboard.** Two stacked segmented controls collapsed into one, with scope as chips.
   The pink banner became a HintBox. The ink card holding one row became ListRows with rank, avatar
   40, name, points, on the canvas with dividers rather than inside a card, and the viewer's own row
   is filled brand.tint at radius 12 so it can be found without a border. Flame emoji removed.
   The HintBox became a caption line under a "This week" heading, and the scope chips moved out from
   under the segmented control into the content section.
5. **Profile.** Handle shows once. Orange "US" avatar replaced by cream initials from the display
   name. Edit profile is secondary. Streak card at radius 20. Tab pills became a SegmentedControl.
   Bio prompt is a tertiary button, not an underlined link. The empty state moved out of its card
   onto the canvas. The Consistency card ("No due days") is restored, with "See the full record" as a
   tertiary button rather than an outlined one, since law 22 bars outlined buttons inside a card.
6. **Settings.** Radius 28 rows became the card recipe at 20. "· —" removed from the Account
   subtitle. Sign out secondary, Delete account tertiary in danger.
7. **Create, step 1.** Tab bar hidden, CTA pinned above the home indicator (it sat behind the tab
   bar). Duration chips at radius 12, Solo and Group use the selected chip style, tip uses HintBox,
   "JUST YOU" all caps became caption sentence case.
8. **FeedPost.** Three variants as a sheet. No photo is one surface line card instead of an empty
   block with three icons, and it is no longer ink: ink stays reserved for the hero card, the FAB and
   cover fallbacks. Finished is a brand tint card with the check in summary.
9. **Share card.** Both sizes on app tokens and app type, a real proof photo, one line of copy. The
   proof frame is 840 wide on the story and 720 on the feed card instead of the specified 900: at 900
   the 160px number and the 80px logo overflow the fixed canvas and the image is what gets squashed
   off 4:5. Law 13 beats the stated width, so the frame carries `flex: none` and the width flexes.
10. **Day secured.** Before and after, plus the 400ms count up and week strip fill.
11. **Loading and error.** Skeletons in the card recipe, blurhash proof frames, no spinners over
    content. Errors reuse EmptyState with no red banner and no toast.
12. **System sheet.** Type scale, tokens, spacing, radii, buttons, states, image sizes.

## Law check

P = pass, n/a = the law does not apply on that frame.

| Law | 1 Home | 2 Disc | 3 Notifs | 4 Board | 5 Profile | 6 Set | 7 Create | 8 Feed | 9 Share1 | 10 Sec | 11 States | 12 Sheet | 13 Face | 14 Cap | 15 Sec2 | 16 Stamp | 17 Share2 | 18 Proto | 19 Welc | 20 Compl | 21 Badges |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 One canvas | P | P | P | P | P | P | P | P | P | P | P | P | n/a | P† | P† | P | n/a | P† | P† | P† | P |
| 2 Two weights | P‡ | P‡ | P‡ | P‡ | P‡ | P | P | P‡ | P‡ | P‡ | P | P‡ | P‡ | P | P‡ | P‡ | P‡ | P‡ | P‡ | P‡ | P‡ |
| 3 Eight text styles | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P |
| 4 20pt gutters, 4pt grid | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P |
| 5 Three radii | P | P | P | P | P | P | P | P | P* | P | P | P | P | P | P | P | P* | P | P | P* | P |
| 6 Orange means do this | P | P | P | P | P | n/a | P | n/a | n/a | n/a | P | P | n/a | n/a | P | n/a | n/a | P | P | P | n/a |
| 7 Black is structure | P | P | P | P | P | n/a | n/a | P | P | P | n/a | P | P | P† | P† | P | P† | P† | P† | P† | n/a |
| 8 Two headers plus wizard | P | P | P | P | P | P | P | n/a | n/a | n/a | P | n/a | n/a | P | P | n/a | n/a | P | n/a | n/a | n/a |
| 9 One card recipe | P | P | P | P | P | P | P | P | n/a | P | P | P | P | n/a | n/a | P | n/a | P | n/a | n/a | P |
| 10 One empty state | n/a | n/a | P | n/a | P | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | n/a |
| 11 Copy rules | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P | P |
| 12 One identity fallback | P | P | n/a | P | P | n/a | n/a | P | n/a | n/a | n/a | P | n/a | n/a | n/a | P | n/a | P | n/a | n/a | n/a |
| 13 Media 4:5, three sizes | P | P | n/a | n/a | n/a | n/a | n/a | P | P | n/a | P | P | n/a | P | P | P | P | P | n/a | P | n/a |
| 14 Scrim under text on image | P | P | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | n/a | P | n/a | n/a | P | P | n/a | P | n/a | P | n/a |
| 15 Ink fallback, blur loading | P | P | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | P | P | n/a | P | P | P | P | P | n/a | P | n/a |
| 16 Avatars 32/40/56/96 | P | P | n/a | P | P | n/a | n/a | P | n/a | n/a | P | P | n/a | n/a | n/a | P | n/a | P | n/a | n/a | n/a |
| 17 Skeleton, no spinners | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | P | P | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | n/a |
| 18 Error reuses empty state | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 19 One animated moment | P | P | P | P | P | P | P | P | n/a | P | P | P | P | P | P | P | n/a | P | P | P | P |
| 20 44 by 44 minimum | P | P | P | P | P | P | P | P | n/a | P | P | P | n/a | P | P | n/a | n/a | P | P | P | P |
| 21 Card only for one unit | P | P | P | P | P | P | P | P | n/a | P | P | P | P | P | P | P | n/a | P | P | P | P |
| 22 Nesting depth two | P | P | P | P | P | P | P | P | n/a | P | P | P** | P | P | P | P | P | P | P | P | P |
| 23 One selection language | P | P | P | P | P | n/a | P | n/a | n/a | n/a | P | P | n/a | n/a | n/a | n/a | n/a | P | n/a | n/a | n/a |
| 24 Chrome budget | P | P | P | P | P | P | P | n/a | n/a | n/a | P | n/a | n/a | P | P | n/a | n/a | P | P | P | n/a |
| 25 One hero per screen | P | P | P | P | P | P | P | n/a | P | P | P | n/a | n/a | P | P | n/a | P | P | P | P | P |

- **† Law 1 and law 7.** After the inversion every frame is ink, so the marks that used to flag dark
  screens now simply mean "canvas". Capture, Secured and Complete are the full bleed photo moment;
  the share card is an export asset, not a screen.
- **‡ Law 2.** Amended: SF Pro 400 and 500 for all UI text, plus Barlow Condensed 600 for numbers the
  user earned and nothing else. Never on a heading, a label or a button.
- **\* Law 5.** Share cards use radius 60 on the proof and 24 on the stamp: 20 and 12 at export
  scale. In the app the same components render at 20 and 12.
- **\*\* Law 22 on frame 12.** The system sheet shows bordered specimens inside panels. They are
  specimens on a documentation sheet, not nested app cards.

## The display face

**Barlow Condensed 600**, tabular, on `type.number` via `displayFace`. Sizes: 17 inline, 64 on Home and
Profile, 96 on the moment screens, 160 mid, 220 for the share card headline. Frame 13 is the specimen.

Earned, so it gets the face: the streak, "Day 23" in a feed header or on the proof card, rank, check
ins and points on the leaderboard, verified days on a badge, best streak, the share card headline.
Not earned, so it stays SF Pro: timestamps, follower counts, task counts like 0 / 1, "14 days" on a
challenge card, wizard step numbers, character counts, prices. Inline in a run of SF Pro it sets at
the same size, weight 600, with 1pt of extra tracking.

## The Verified stamp

Display face 12pt uppercase, tracking 0.08em, 1.5pt stroke, radius 12, 6 and 10pt padding.
brand.action on light grounds, white on ink. It reads COMPLETE on a finished challenge. It appears on
a FeedPost photo, a Profile badge, the secured screen and the share card, and it never appears on self
reported content: rendering it is a claim about what the server confirmed. On Secured it lands at the
end of the 400ms count up, not before it.

## The inversion, Sept 6 2026

The cream canvas was inherited from the first screenshots, never tested, and carried for six rounds.
It is now ink. The swap is one token file; every frame and the prototype re-render from it. Type is
unchanged: SF Pro reads neutral (Shaikh, Chaparro and Fox 2006, 561 participants: sans serifs score
neither high nor low on any personality trait) and Barlow Condensed stays rationed to earned numbers,
where the same study's "assertive, potent" display group belongs. Barlow gains presence reversed out
of black, which is what condensed signage faces do.

### Places a component leaned on the light canvas, and what each became

| leaned on cream | became |
|---|---|
| Avatar fallback (`avatar.tint #EFE9DF` with ink initials) | `border #2E2B27` ground with text.primary initials; the token is retired, so the ten stay ten |
| Avatar stack ring (2pt white) | 2pt `surface` ring |
| Skeleton bars (`border` on white cards) | `border #2E2B27` bars on `surface` cards; the bars now read as lighter, not darker |
| Blurhash placeholder ground | `surface` instead of avatar tint |
| Image scrim | unchanged: transparent to 60 percent ink was already the right gradient on a dark page |
| Stamp on light grounds (`brand.action` stroke) | `brand.text #E8600F`; the white on ink variant became text.primary |
| Segmented control track | `border` track, selected pill is `border` filled with text.primary label (a white pill would out-shout the content) |
| Chip unselected | unchanged in structure, text is now text.secondary on canvas; selected is `brand.tint` with `brand.text` |
| Primary button | `brand #DC5401` fill with an `onBrand` black label, 4.9:1, replacing white on #BB471D at 3.95:1 |
| `brand.action #BB471D` | retired. It only existed to pass contrast on white; `brand.text #E8600F` replaces it |
| Tab bar FAB (ink circle on a white pill) | `brand` circle with an onBrand glyph: an ink circle on a surface pill is a hole |
| Week strip: empty squares cream, filled ink | empty `border`, filled `brand`, today outlined `brand` |
| Profile ink hero card | `surface` card, 1pt border, same display number |
| FeedPost "no photo" ink line card | `surface` line card |
| Cover fallback | stays `canvas`: a missing cover is now a hole in the page by design, with the title in text.primary over it |
| Share card ground | already ink; the logo bars and the stamp were already reversed |
| Badge unearned border | `border` with text.secondary label; earned stays `brand.text` |
| Danger | `#B3261E` to `#E5533D`: the darker red fell below 4.5:1 on ink |
| Document ground behind the frames | canvas, with 1pt `border` frame edges so the phones read against it |

### Frame 20, the contact sheet

Completion was the daily screen with a bigger number: day 30 looked like day 12, and the peak of the
product had no shape. It is now the contact sheet. Display number 96, "30 days. Every one witnessed."
in bodyStrong, then the hero: all thirty proofs at 4:5, six across and five down, 4pt gutters, radius
4, inside the 20pt gutters. Self reported days sit at 40 percent with no stamp, so the honest cut is
visible as a picture. COMPLETE centred under the grid. Primary "Start the next one", because
challenge two is the metric; secondary "Share", tertiary "Done". The story share card is the same
composition. Entry motion: the grid fills row by row over 600ms, five steps of 120ms, then the stamp,
one haptic. Second and last animated moment in the app, earned by thirty days.

Six across and five down rather than five by six: at 390pt with 20pt gutters a five column grid is
521pt tall and pushes the buttons off the screen; six columns is 360pt and fits with the number, the
copy, the stamp and three buttons.

### Diff list for the inversion

- `src/tokens.ts` — the ten dark tokens with measured ratios, law 1, 7, 9 and 19 comments, `contactSheet`.
- All fifteen component files — colour names migrated (`ink` to `textPrimary`, `brandAction` to
  `brandText`, `avatarTint` to `border`, `onInk` to `textPrimary`); primary button to brand fill.
- `src/components/ContactSheet.tsx` — new, plus `revealRows`.
- `src/components/MomentScreen.tsx` — the `complete` variant renders the contact sheet and the three
  button footer.
- `GRIIT System.dc.html` — all 21 frames re-rendered on the dark tokens; frame 12's token panel
  rewritten; frame 20 rebuilt as the contact sheet; the prototype's Complete screen replaced and
  `Start the next one` wired to Discover.
- `GRIIT Prototype.dc.html` — same inversion and the same Complete screen.
- `README.md` — this section, the token table, laws 1, 7 and 9, the tap list.

## The Cursor package

`cursor/` is written for the engineer, not the reviewer: no rationale, no adjectives, one value per
property. `00_READ_FIRST.md` (laws, tokens, type scale, spacing, the seven lint greps),
`01_components.md` (24 components in build order with props, states, token references, hit targets,
never rules and the React Native equivalents), `02_screens.md` (16 screens with component trees,
vertical rhythm in points, display face item by item, every state, literal copy tables),
`03_media.md`, `04_law_table.md`, `05_diff_from_current_app.md` (the 17 screenshots mapped to changes
and chunks).

## Photography rule

The app's texture is real proof photos: grainy, dark, unstyled, 6am. Discover's hero, the feed and the
share card run on real proofs. No stock, no illustration, no gradient backgrounds, ever. The more
people post, the bolder the app looks. A frame that needs a placeholder uses one of the two existing
proof assets.

## Copy rule

Every confirmation is a declarative sentence with a period. "Day 23. Verified." "Day secured." "Not
today." Never an exclamation mark, never "great job", never "you've got this".

## Frames

1 Home · 2 Discover · 3 Activity notifications · 4 Activity leaderboard · 5 Profile · 6 Settings ·
7 Create step 1 · 8 FeedPost variants · 9 Share card v1 · 10 Day secured · 11 Loading and error ·
12 System sheet · 13 Display face · 14 Capture · 15 Secured · 16 Verified stamp · 17 Share card ink ·
18 Prototype · 19 Welcome · 20 Challenge complete · 21 Badges.

## Source

`src/tokens.ts` · `components/Primitives.tsx` · `Identity.tsx` · `Media.tsx` · `States.tsx` ·
`Feed.tsx` · `Chrome.tsx` · `Leaderboard.tsx` · `ShareCard.tsx` · `DisplayNumber.tsx` · `Stamp.tsx` ·
`MomentScreen.tsx` (capture, secured, selfReported, complete) · `Welcome.tsx` · `Badges.tsx` ·
`Prototype.tsx` (state machine). Every value comes from `tokens.ts`; no raw hex in components.

## List 1. Every tap in the prototype

| tap | state |
|---|---|
| Welcome, Start | wired, goes to Home |
| Welcome, Log in | dead |
| Tab bar, Home / Discover / Activity / Profile | wired, active tint follows |
| Tab bar, FAB | wired, opens Create step 1 |
| Home, bell | dead |
| Home, Post your first proof | wired, opens Capture (inert once posted) |
| Home, Friends / Everyone | wired, swaps the feed list |
| Home, heart on your own proof | wired, toggles |
| Home, comment glyph | dead |
| Capture, Cancel | wired, back to Home |
| Capture, flip camera | dead |
| Capture, shutter | wired, opens Secured and counts 0 to 1 over 400ms, stamp at the end |
| Secured, Share | wired, opens the share card full screen |
| Secured, Done | wired, Home with streak 1, today filled, proof card 1 / 1, proof at the top of the feed with the stamp |
| Share, Back | wired, returns to Secured or Complete |
| Discover, chips (For you, Trending, Body, Mind) | wired, swaps the featured card and the grid |
| Discover, featured Start | wired, You're in, and sets Home's proof card to that challenge |
| Discover, a person in the strip | wired, opens the visitor profile |
| Discover, Follow in the strip | dead |
| Discover, Build your own | wired, Create step 1 |
| You're in, Back to Home | wired |
| Activity, Notifications / Leaderboard | wired, swaps the view |
| Activity, Find a challenge | wired, goes to Discover |
| Leaderboard, Global / Friends / Challenges | wired, swaps the list |
| Profile, gear | wired, opens Settings |
| Profile, share glyph | dead |
| Profile, Challenges / Proofs / Badges | wired, Proofs shows the posted proof after the loop |
| Profile, See the full record | wired, month grid with today filled |
| Visitor profile, back chevron | wired, returns to Discover |
| Visitor profile, Request to follow | dead |
| Settings, any row | wired, pushes a detail screen with a back chevron |
| Settings, back chevron | wired, returns to Profile |
| Settings, Sign out / Delete account | dead |
| Record, back chevron | wired, returns to Profile |
| Create, Cancel | wired, returns to the tab the FAB was tapped from |
| Create, Continue | wired, steps 1 to 2 to 3 with the progress bar |
| Create step 3, Start challenge | wired, You're in |
| Complete, Start the next one | wired, goes to Discover and clears the challenge |
| Complete, Share | wired, opens the share card |
| Complete, Done | wired, back to Home |
| Outside the frame, Complete the challenge | wired, jumps to day 30 and opens the contact sheet with the 600ms row reveal |
| Outside the frame, Reset | wired, returns to Welcome |

## List 2. The nine items

- **1. Secured before state, no stamp** — Done. The 22 frame carries no stamp; the stamp appears at the end of the count up, in frame 15 and in the prototype.
- **2. Self reported does not fill the square** — Done. Outlined square, no fill, no stamp, Done only, copy unchanged.
- **3. Share cards, 220 number, new order** — Done, with one deviation: the proof is 720 on the story and 560 on the feed, not 900. With a 220 number, the copy line, the stamp and the 80px logo in the column, 900 overruns the story safe zone and the feed box, and law 13 outranks the width.
- **4. Every earned number in the display face** — Done across frames 1 to 12: Home streak, Profile streak and best, "Day 1" in feed headers and on the proof card, "Day 23" on the FeedPost sheet, "7 of 7" on the finished variant, leaderboard rank, check ins and points, badge requirement, frame 10 before and after, frame 12 specimen, frame 9 share numbers. Timestamps, follower counts, 0 / 1, "14 days", step numbers and character counts were left in SF Pro.
- **5. Welcome in ink** — Done. Frame 19, and the prototype opens on it.
- **6. Challenge complete** — Done. Frame 20, phone plus the story share card with the COMPLETE stamp; reachable in the prototype via "Complete the challenge".
- **7. Badges as stamps** — Done. Frame 21, and inside the prototype's Profile badges tab.
- **8. Frame 18, one tappable phone** — Done. Seventeen screens, the state listed in the brief, cuts only, count up on Secured, dead taps where the brief says dead.
- **9. Handoff** — Done. This README is one document; the two lists are above and below.
