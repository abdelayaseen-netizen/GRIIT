# GRIIT. Read first.

GRIIT is a photo verified habit challenge app: pick a challenge, post live camera proof daily, secure
the day, build a streak. Target platform is React Native on Expo SDK 54; every value below comes from
`src/tokens.ts`, which is the source of truth.

**If a value you need is not in tokens.ts, stop and ask. Do not invent one.**

## The 25 laws

1. Canvas is `canvas` on every screen. No light screens.
2. UI face is SF Pro at 400 and 500. One second family, Barlow Condensed 600, for earned numbers only; it is the only place above 500.
3. Eight text styles, nothing off the scale. Each maps to an Apple text style except `number`, which is fixed.
4. Screen padding 20, card padding 20, stacked cards 12, sections 32, two column gutter 12. Every number is a multiple of 4.
5. Three radii: 12 inputs and chips, 20 cards, pill for buttons, tab bar and avatars.
6. One `brand` filled action per viewport. Repeated row actions are secondary. Active tabs, chips and segments use `brandText` or a 1.5pt `brand` outline, never a fill.
7. Weight comes from `surface`, not from a black card. Cards are `surface`. Cover fallbacks are `canvas`. Primary buttons are `brand` fill with an `onBrand` label.
8. Three headers: root (display title at the gutter, 8pt below the status bar area), pushed (44pt bar, chevron left, centered 17/500), wizard (Cancel, step, progress bar, tab bar hidden, CTA pinned).
9. Card recipe: `surface`, radius 20, 1pt `border`, no shadow. No placeholder tiles.
10. One empty state component: heading 20, one sentence, one primary button. Errors reuse it.
11. Sentence case except the label style. Second person. No emoji. No dashes. Day format "Day 1", "1 day", "23 days". Same concept, same phrase on every screen.
12. One identity fallback: initials from the display name on `border`, else a person glyph. Never initials from a `user_` handle. Greeting is display name, then username, then first name.
13. Every proof and cover is 4:5. One ProofImage with three sizes: feed, card, thumb. No screen sizes an image itself.
14. Text on an image sits on a scrim: transparent to 60 percent `canvas` over the lower 40 percent.
15. Missing image is a solid `canvas` block with the title in `textPrimary` bodyStrong. Loading image is a blurhash in the same frame.
16. Avatars 32 / 40 / 56 / 96, one fallback, stacks max 3 with a 2pt `surface` ring, never overlapping text.
17. Loading is a skeleton in the card recipe with two `border` bars. Spinners only inside a button while it submits.
18. Error state is the empty state component: what failed, what to do, one primary retry. No banners, no toasts for anything that needs action.
19. Two animated moments: day secured (400ms count up, 400ms square fill, one haptic) and the completion contact sheet (600ms row reveal). Nothing else animates.
20. Every tappable element is at least 44 by 44pt.
21. Content sits on the canvas by default. A card is only for content read or tapped as one unit: a proof, a cover, a settings group, the proof task card, the streak card.
22. Nesting depth is two: canvas, card, content. No bordered element inside a card. No card inside a card. Inside a card a button is filled or tertiary, never outlined.
23. One selection language per screen. One segmented control, directly under the title or the hero. Filters and scopes are ghost chips under a heading, never directly under a segmented control.
24. At most one band of controls between the title and the first content. A hint is a caption line under a heading. HintBox is the Create wizard only.
25. One hero per screen: the number on Home, the featured cover on Discover, the streak card on Profile, the list on Activity, the form on Create, the contact sheet on Complete.

## Tokens

| token | hex | use |
|---|---|---|
| canvas | #0F0F0F | every screen, cover fallback, scrim base |
| surface | #1A1917 | cards, sheets, inputs, tab bar, FAB |
| border | #2E2B27 | card edges, dividers, segmented track, avatar fallback ground, skeleton bars |
| textPrimary | #F5F3EE | primary text, 17.3:1 on canvas, 15.8:1 on surface |
| textSecondary | #A39E95 | subtitles, captions, meta, 7.2:1 on canvas |
| brand | #DC5401 | primary fill, week strip fill, 1.5pt active outline, progress bar, logo bars |
| brandText | #E8600F | orange as text, 5.6:1 on canvas, 5.1:1 on surface |
| brandTint | #3A1F10 | HintBox ground, selected chip ground, own leaderboard row, done row |
| onBrand | #0F0F0F | label on a brand fill, 4.9:1 |
| danger | #E5533D | destructive only, 5.1:1 on canvas |

## Type scale

| style | size | line height | weight | family | letter spacing | Apple style |
|---|---|---|---|---|---|---|
| display | 34 | 41 | 500 | SF Pro | -0.5pt | largeTitle |
| number | 64 | 64 | 600 | Barlow Condensed | -0.64pt | none, fixed |
| title | 28 | 34 | 500 | SF Pro | 0 | title1 |
| heading | 20 | 25 | 500 | SF Pro | 0 | title3 |
| body | 17 | 22 | 400 | SF Pro | 0 | body |
| bodyStrong | 17 | 22 | 500 | SF Pro | 0 | headline |
| secondary | 15 | 20 | 400 | SF Pro | 0 | subheadline |
| caption | 13 | 18 | 400 | SF Pro | 0 | footnote |
| label | 12 | 16 | 500 | SF Pro | 0.72pt, uppercase | caption1 |

`number` sizes: 17 inline, 64 Home and Profile, 96 moment screens, 160 mid, 220 share card. Inline in a
run of SF Pro: same size, weight 600, letterSpacing 1.

## Spacing, radius, size

| token | value |
|---|---|
| space.xs / sm / md / lg / gutter / section | 4 / 8 / 12 / 16 / 20 / 32 |
| radius.input / card / pill | 12 / 20 / 999 |
| hit | 44 |
| buttonHeight.regular / small | 52 / 44 |
| avatarSize | 32 / 40 / 56 / 96 |
| shutter | 72 |
| proofAspect | 4 / 5 |
| contactSheet | cols 6, rows 5, gap 4, radius 4, revealMs 600, dimmed 0.4 |
| motion.daySecuredMs | 400 |
| shareProofWidth.story / feed | 720 / 560 |

## Lint greps. All seven must return zero.

```
1  grep -rnE "#[0-9A-Fa-f]{6}" src --include="*.tsx" --include="*.ts" | grep -v "lib/design-system.ts"
2  grep -rnE "fontWeight: *'?(600|700|800|900)" src --include="*.tsx" | grep -v "DisplayNumber|Stamp|Badges|ContactSheet"
3  grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src
4  grep -rn "!" src --include="*.tsx" | grep -E "'[^']*![^']*'|\"[^\"]*![^\"]*\""
5  grep -rnE "[—–]|( - )" src --include="*.tsx"
6  grep -rn -A2 "backgroundColor: color.brand\b" src --include="*.tsx" | grep "color.textPrimary"
7  grep -rnE "(height|width|minHeight|minWidth): *([0-9]|[1-3][0-9]|4[0-3])," src --include="*.tsx" | grep -iE "pressable|touchable|button|chip|tab|icon"
```

Grep 8, optional: `grep -rn "displayFace" src --include="*.tsx"` must only hit DisplayNumber, Stamp,
Badges and ContactSheet.
