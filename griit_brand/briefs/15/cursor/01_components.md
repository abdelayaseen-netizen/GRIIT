# Components, in build order

Every value references `tokens.ts`. Chunk B builds the first nine; the rest follow in C to F.

React Native notes that apply everywhere: there is no `linear-gradient` (use `expo-linear-gradient`),
`aspect-ratio` is `aspectRatio: 4/5` on a View, `letter-spacing` is `letterSpacing` in points (0.06em at
12pt is 0.72), `text-transform` is unreliable on Android so uppercase the string in JS, and
`box-shadow` is not used at all.

## Button

One tappable label. Three variants.

**Props** `label: string`; `variant: "primary" | "secondary" | "tertiary" = "primary"`; `size: "regular" | "small" = "regular"`; `destructive?: boolean`; `submitting?: boolean`; `onPress?: () => void`

**States** default; pressed opacity 0.8; disabled opacity 0.4, no press; submitting opacity 0.6 with a 20pt ActivityIndicator in `onBrand` left of the label, label unchanged.

**Tokens** primary ground `brand`, label `onBrand`. secondary ground `surface`, 1pt `border`, label `textPrimary`. tertiary no ground, label `brandText`, or `danger` when `destructive`. radius `pill`. height 52 regular, 44 small. paddingHorizontal 28 regular, 24 small. label bodyStrong.

**Hit** 44 minimum, both axes.

**Never** never a `textPrimary` label on a `brand` fill; never a secondary (outlined) button inside a Card; never two primaries on one viewport; never a `brand` fill that is not the single primary action.

**RN** ActivityIndicator only inside the button, never over content.

## Card

Container for content read or tapped as one unit.

**Props** `tint?: boolean`; `children`

**States** static.

**Tokens** ground `surface`, or `brandTint` when `tint`. 1pt `border`. radius `card` 20. padding `gutter` 20. no shadow.

**Hit** n/a.

**Never** never inside another Card; never contains a bordered element; never wraps a heading, a chip row, a people strip, a list of rows or a prompt.

**RN** no `boxShadow`; do not add `elevation`.

## Chip

Filter, scope or form answer.

**Props** `label: string`; `selected?: boolean`; `variant: "ghost" | "form" = "ghost"`; `onPress?: () => void`

**States** ghost unselected: no ground, no border, label `textSecondary` 400. ghost selected: ground `brandTint`, label `brandText` 500. form unselected: ground `surface`, 1pt `border`, label `textPrimary` 400. form selected: ground `brandTint`, 1.5pt `brand`, label `brandText` 500. pressed opacity 0.8.

**Tokens** radius `input` 12. paddingVertical 12, paddingHorizontal 16. label secondary size 15/20.

**Hit** 44 minimum height.

**Never** never a `brand` fill when selected; never a ghost chip directly under a SegmentedControl; never a form chip outside the Create wizard.

## SegmentedControl

Switches views. One per screen.

**Props** `items: string[]`; `value: string`; `onChange: (v: string) => void`

**States** selected pill; unselected label; pressed opacity 0.8.

**Tokens** track `border`, padding 2, radius `pill`. selected pill ground `border`, label `textPrimary` 500. unselected label `textSecondary` 400 at 15/20. item height 44.

**Hit** 44 per item.

**Never** never two on one screen; never stacked; never with chips immediately beneath it; never a `surface` pill (it outweighs the content).

## ListRow

A row in a settings group or a leaderboard.

**Props** `icon?: ReactNode`; `title: string`; `subtitle?: string`; `trailing?: ReactNode`; `rank?: number`; `highlight?: boolean`; `onPress?: () => void`

**States** default; pressed ground `surface` at opacity 0.6; highlight (the viewer own row).

**Tokens** padding `gutter` 20 inside a card, or paddingVertical 20 with zero horizontal on the canvas. icon 24 `textPrimary`. title bodyStrong. subtitle secondary `textSecondary`. chevron 24 `textSecondary`. divider 1pt `border`. highlight ground `brandTint`, radius `input` 12, paddingHorizontal 16.

**Hit** 44 minimum row height.

**Never** never a border around the row; never a card per row.

## EmptyState

One empty state, reused for errors.

**Props** `icon?: ReactNode`; `heading: string`; `body: string`; `actionLabel: string`; `onAction?: () => void`

**States** static.

**Tokens** glyph circle 56, ground `border`, glyph 24 `textPrimary`. heading `heading` 20/25 500. body `secondary` `textSecondary`, maxWidth 280, centered. gap 12. button primary, marginTop 8.

**Hit** the button, 52.

**Never** never inside a Card; never a text link with an arrow instead of the button; never a heading above 20 or at weight 600.

## Avatar

Identity, one fallback.

**Props** `size: 32 | 40 | 56 | 96 = 40`; `uri?: string`; `displayName?: string`; `ring?: boolean`

**States** image; initials; glyph.

**Tokens** ground `border`. initials `textPrimary` at caption (32), secondary (40), bodyStrong (56), title (96), weight 500. glyph `user` at 24 `textPrimary`. radius `pill`. ring 2pt `surface`.

**Hit** 44 when tappable: wrap a 32 or 40 avatar in a 44 pressable.

**Never** never initials from a `user_` handle; never a coloured ground per user; never a second fallback style.

## AvatarStack

Up to three avatars.

**Props** `people: {uri?, displayName?}[]`

**States** static.

**Tokens** Avatar 40 with `ring`. overlap marginLeft -12. marginRight 12 before any text.

**Hit** n/a, not tappable.

**Never** never more than three; never overlapping text; never without the ring.

## Stamp

The verification mark. The only decoration in the app.

**Props** `label: "Verified" | "Complete" = "Verified"`; `onInk?: boolean`

**States** static.

**Tokens** 1.5pt stroke and label in `brandText`, or `textPrimary` when `onInk`. radius `input` 12. padding 6 vertical, 10 horizontal. label 12pt Barlow Condensed 600, letterSpacing 0.96, uppercase.

**Hit** n/a, not tappable.

**Never** never on self reported content; never before the count up finishes; never at another size in app.

**RN** `letterSpacing: 0.96` in points, not em. Uppercase the string in JS, there is no `textTransform` on Android.

## DisplayNumber

An earned number.

**Props** `value: number | string`; `size: "inline" | "home" | "moment" | "mid" | "share" = "home"`; `onInk?: boolean`

**States** static; counting (see motion).

**Tokens** family Barlow Condensed 600. sizes 17 / 64 / 96 / 160 / 220. colour `textPrimary`. `fontVariant: ["tabular-nums"]`. letterSpacing -0.64 at 64, -1.92 at 96 and above, 1 at inline.

**Hit** n/a.

**Never** never on a heading, a label or a button; never on a timestamp, a follower count, a task count, a challenge length, a step number, a character count or a price.

**RN** `fontVariant: ["tabular-nums"]` on Text. Load the font with `expo-font` before first paint or numbers reflow.

## ProofImage

Every proof and cover.

**Props** `uri?: string`; `blurhash?: string`; `title?: string`; `caption?: string`; `size: "feed" | "card" | "thumb" = "feed"`

**States** loaded; loading (blurhash); missing (fallback).

**Tokens** aspectRatio 4/5. radius `card` 20. ground `canvas`. text inset 16 feed, 12 card and thumb. title bodyStrong `textPrimary`, caption caption `textPrimary`.

**Hit** n/a unless the whole card is tappable, then 44 via the parent.

**Never** never a gray tile; never a placeholder icon; never a spinner; never text without a scrim; never a size chosen by the screen.

**RN** `aspectRatio: 4/5` on the View. Scrim via `expo-linear-gradient` inside an `overflow: "hidden"` parent.

## Skeleton

Loading placeholder.

**Props** `lines: number = 2`

**States** static.

**Tokens** card recipe. bars height 16, radius `input` 12, ground `border`, widths 60 percent then 40 percent, gap 12.

**Hit** n/a.

**Never** never a spinner over content; never a pulsing animation (law 19).

## HintBox

The Create wizard hint.

**Props** `children: string`

**States** static.

**Tokens** ground `brandTint`. radius `input` 12. padding 16. glyph `lightbulb` 24 `brandText`. text secondary `brandText`. gap 12.

**Hit** n/a.

**Never** never outside the Create wizard; elsewhere a hint is a caption line under a heading.

## FeedPost

One post. Three variants.

**Props** `post: {author, meta, variant: "photo" | "noPhoto" | "finished", proofUri?, challengeTitle?, caption?, summary?, verified: boolean}`; `onLike`; `onComment`; `onShare`

**States** photo; noPhoto; finished; liked (heart `brandText`).

**Tokens** card recipe, or `brandTint` card when finished. header Avatar 40, name bodyStrong, meta caption `textSecondary`. media ProofImage feed. Stamp bottom right on the scrim when `verified`. action row three 44 targets, glyphs 24 `textPrimary`.

**Hit** 44 per action glyph.

**Never** never an ink card; never the Stamp on a self reported post; never an action row on the noPhoto variant.

## ChallengeCard

A challenge in Discover.

**Props** `title: string`; `coverUri?: string`; `days: number`; `difficulty: string`; `featured?: boolean`; `onStart?`; `onPress?`

**States** default; featured (Start button on the cover).

**Tokens** ProofImage feed when featured, card in the grid. title bodyStrong `textPrimary` over the scrim, up to two lines. meta one caption `textSecondary`, "14 days · Easy". featured Start is a primary small at 44, inset 16.

**Hit** 44 for Start; the card itself is tappable at full size.

**Never** never a difficulty chip; never truncation; never a second filled button in the grid.

**RN** `numberOfLines={2}` on the title, no ellipsis needed at 2 lines with these strings.

## PersonCard

A person in a horizontal strip.

**Props** `name: string`; `uri?: string`; `onFollow?`; `onPress?`

**States** default; pressed.

**Tokens** width 140, no ground, no border. Avatar 56. name bodyStrong. "New here" caption `textSecondary`. Follow secondary small, full width, 44. gap 8.

**Hit** 44 for Follow, the cell is tappable.

**Never** never a card; never a filled Follow (it repeats).

**RN** `FlatList horizontal` with `contentContainerStyle` paddingHorizontal 20 and `ItemSeparatorComponent` 12.

## WeekStrip

Seven days.

**Props** `days: {letter: string, filled: boolean}[]`; `todayIndex: number`

**States** past filled; past empty; today empty; today filled.

**Tokens** letters caption `textSecondary`, today `textPrimary` 500. squares height 44, radius `input` 12, gap 8, 7 columns. empty ground `border`. filled ground `brand`. today outline 1.5pt `brand`.

**Hit** not tappable.

**Never** never more than seven squares; never a colour other than `brand` for a filled day.

## RootHeader

Root tab screen header.

**Props** `title: string`; `kicker?: string`; `actions?: ReactNode`

**States** static.

**Tokens** paddingTop 8 below the safe area, paddingHorizontal `gutter` 20. kicker caption `textSecondary`. title `display`. actions are 44 circles, ground `surface`, 1pt `border`, glyph 24 `textPrimary`, gap 8.

**Hit** 44 per action.

**Never** never centered; never a `heading` title; never more than two actions.

## PushedHeader

Pushed screen header.

**Props** `title: string`; `onBack: () => void`

**States** static.

**Tokens** height 44. chevron-left 24 `textPrimary` in a 44 target at the gutter. title bodyStrong centered. right spacer 44.

**Hit** 44 for back.

**Never** never a display title; never a tab bar on the same screen when pushed from a wizard.

## WizardHeader

Create wizard header.

**Props** `step: 1 | 2 | 3`; `total: 3`; `onCancel: () => void`

**States** step 1, 2, 3.

**Tokens** height 44. "Cancel" tertiary `brandText` at the gutter. "Step 1 of 3" bodyStrong centered. progress: 3 tracks, height 4, radius `input` 12, gap 8, filled `brand`, empty `border`, marginTop 8.

**Hit** 44 for Cancel.

**Never** never a tab bar; never a CTA that is not pinned above the home indicator; never Barlow on the step number.

## TabBar

Root navigation.

**Props** `active: "home" | "discover" | "activity" | "profile"`; `onTab`; `onFab`

**States** per tab active; FAB pressed opacity 0.8.

**Tokens** floating pill: left 12, right 12, bottom 12, height 64, ground `surface`, 1pt `border`, radius `pill`. items 60 x 56, glyph 24, label 12/16, active `brandText` 500, inactive `textSecondary` 400. FAB 56 circle, ground `surface`, 1pt `border`, glyph `plus` 24 `brandText`.

**Hit** 56 per item, 56 for the FAB.

**Never** never a `brand` fill on the FAB (law 6); never a filled active tab; never five labels of different lengths wrapping.

**RN** Absolute position over the screen, with the scroll view padded 120 at the bottom.

## MomentScreen

Capture, secured, self reported, complete.

**Props** `variant: "capture" | "secured" | "selfReported" | "complete"`; `challenge: string`; `task?: string`; `proofUri?: string`; `allProofs?: Proof[]`; `revealedRows?: number`; `streak?: number`; `week?: Day[]`; `onCancel`; `onShoot`; `onShare`; `onDone`; `onNext`

**States** capture; secured counting; secured settled; selfReported; complete revealing; complete settled.

**Tokens** ground `canvas`. capture: Cancel tertiary `textPrimary`, flip glyph 44, challenge bodyStrong, task secondary `textSecondary`, viewfinder 4:5 radius 20 in 20pt gutters, shutter 72 circle `textPrimary`. secured and complete: DisplayNumber moment 96, copy bodyStrong `textPrimary`, media, Stamp, footer pinned bottom 20 with the WeekStrip above the buttons.

**Hit** 44 everywhere; 72 for the shutter.

**Never** never a tab bar; never a stamp on selfReported; never a filled square on selfReported; never a card.

**RN** Status bar `light-content` on all four.

## ShareCard

Export composition.

**Props** `size: "story" | "feed"`; `streak: number`; `copy: string`; `proofUri?: string`; `proofs?: Proof[]`; `label: "Verified" | "Complete"`

**States** daily; complete (contact sheet).

**Tokens** see 03_media.md for the pixel spec.

**Hit** n/a, offscreen.

**Never** never a light ground; never two copy lines; never a proof at 900 wide (it overruns the safe zone).

**RN** Render offscreen at 360 x 640 and capture at `pixelRatio: 3`.

## Badges

The five marks.

**Props** `badges: {label, earnedOn?, requirement}[]`; `footnote: string`

**States** earned; unearned.

**Tokens** 2 columns, gap 12, on the canvas, no card. cell: stamp frame (1.5pt, radius 12, padding 6 x 10, 12pt Barlow 600 uppercase) plus a caption below. earned stroke and label `brandText`, caption "Earned 6 Sep 2026". unearned stroke `border`, label and caption `textSecondary`, caption is the requirement.

**Hit** 44 if tappable; the grid is static by default.

**Never** never an icon; never a circle; never a card per badge; never a fill.

## Motion. The whole specification.

| moment | spec |
|---|---|
| DisplayNumber count up | from streak to streak + 1 over 400ms, `fontVariant: ["tabular-nums"]` so the layout cannot shift. The Stamp mounts at 400ms, not before. |
| WeekStrip square fill | today square ground `border` to `brand` over the same 400ms, on the same frame clock. |
| Contact sheet row reveal | rows 1 to 5 at 120ms intervals, 600ms total, stamp at 640ms. |
| Haptic | `Haptics.notificationAsync(Success)` once, on secured and on complete. |

Nothing else animates: no chip, tab, card, sheet or list transition. Screen transitions are cuts.

**Reduce Motion** (`AccessibilityInfo.isReduceMotionEnabled`): the number renders its final value, the
square renders filled, all five rows render at opacity 1, the stamp renders immediately, and the
haptic is skipped.
