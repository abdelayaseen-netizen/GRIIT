# Media

## Proof upload

| property | value |
|---|---|
| master | 1080 x 1350 JPEG, quality 82 |
| aspect | 4:5, enforced at capture, no crop UI |
| EXIF | stripped on upload, GPS included in the strip |
| blurhash | computed at upload, 4 x 3 components, stored on the proof row |
| source | live camera only, no library picker |

## Request sizes

| name | pixels | used on |
|---|---|---|
| feed | 1080 x 1350 | FeedPost media, Capture viewfinder frame, Secured proof, featured ChallengeCard cover |
| card | 540 x 675 | two column ChallengeCard grid, Discover grid |
| thumb | 336 x 420 | Profile proofs grid, completion contact sheet |

No screen sizes an image itself: ProofImage takes `size` and picks the request.

## Avatars

Upload 512 x 512 JPEG q82, square, EXIF stripped. Display sizes 32, 40, 56, 96. Fallback: `border`
ground, initials from the display name in bodyStrong `textPrimary`, or a `user` glyph at 24 when there
is no display name. Never initials from a `user_` handle. Stack: max 3, each with a 2pt `surface` ring,
overlap 12pt, never over text.

## Scrim

`expo-linear-gradient`, `colors={['rgba(15,15,15,0)', 'rgba(15,15,15,0.6)']}`, `start={{x:0,y:0}}`,
`end={{x:0,y:1}}`, height 40 percent of the image frame, pinned to the bottom, inside the radius 20
clip. Required behind any text over an image.

## Cover fallback

No cover image: `canvas` ground filling the 4:5 frame, radius 20, title in bodyStrong `textPrimary`
inset 16 (feed) or 12 (card). No icon, no gray tile, no scrim.

## Loading

Blurhash at the same 4:5 frame and radius as the final image. No spinner over content. Skeleton for
text: card recipe with two `border` bars at height 16, radius 12, widths 60 percent and 40 percent.

## Share card export

| property | value |
|---|---|
| sizes | 1080 x 1920 (story), 1080 x 1350 (feed) |
| method | hidden 360 x 640 view, `react-native-view-shot` `captureRef` at `pixelRatio: 3`, `format: 'jpg'`, `quality: 0.92` |
| ground | `canvas` |
| story safe zones | 250 top, 250 bottom |
| composition | number 220, copy 44/56 bodyStrong, proof, stamp, logo 80 |
| proof width | story 720, feed 560, both at 4:5, radius 60 |
| stamp | 28pt Barlow Condensed 600, 3pt `textPrimary` stroke, radius 24, padding 10 x 18 |
| logo | two `brand` bars 24 x 80 and 24 x 56, radius 12, gap 16, wordmark 56/64 500 `textPrimary` |
| copy | one line, "Day 23. Verified." or "30 days. Every one witnessed." |

## Contact sheet, completion only

30 thumbs, 6 columns, 5 rows, gap 4, radius 4, each 4:5, inside the 20pt screen gutters. Self reported
days render at opacity 0.4 with no stamp; verified days at 1. On the share card the same grid runs at
gap 8 and radius 8, 880 wide. Reveal: rows 1 to 5 at 120ms intervals, stamp at 640ms, one success
haptic. Reduce Motion: all rows visible immediately, stamp immediately, no haptic.
