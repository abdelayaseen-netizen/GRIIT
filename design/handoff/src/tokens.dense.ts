// DENSITY PASS — proposed replacement values for src/tokens.ts (chunk R, frames 67 to 74).
//
// Not yet applied to tokens.ts: it waits on one decision, body 15 vs 14 (see below).
// Nothing is renamed, so applying this file's values to tokens.ts propagates the whole
// change through every component that already reads the tokens. The components listed in
// cursor/05_diff_from_current_app.md are the ones tokens alone cannot reach.
//
// WHAT DOES NOT MOVE
//   type.number, every numberSize, and displayFace. The Barlow Condensed numerals are the
//   signature. Everything around them coming down 2pt makes them read larger, which is the
//   point: the streak should be the biggest thing on any screen it appears on.
//   hit = 44. The floor, and buttonHeight.small is already sitting on it.
//   shutter = 72. A camera shutter is sized by the thumb, not by the type scale.

export const typeDense = {
  display:    { fontSize: 28, lineHeight: 34, fontWeight: '500', letterSpacing: -0.4 },  // was 34 / 41
  number:     { fontSize: 64, lineHeight: 64, fontWeight: '600' },                        // unchanged
  title:      { fontSize: 22, lineHeight: 28, fontWeight: '500' },                        // was 28 / 34
  heading:    { fontSize: 17, lineHeight: 22, fontWeight: '500' },                        // was 20 / 25
  body:       { fontSize: 15, lineHeight: 20, fontWeight: '400' },                        // was 17 / 22
  bodyStrong: { fontSize: 15, lineHeight: 20, fontWeight: '500' },                        // was 17 / 22
  secondary:  { fontSize: 13, lineHeight: 18, fontWeight: '400' },                        // was 15 / 20
  caption:    { fontSize: 12, lineHeight: 16, fontWeight: '400' },                        // was 13 / 18
  label:      { fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: '0.06em' },// was 12 / 16
} as const;

// DECISION PENDING — body 15 or 14.
//
// 15 is what these frames show. It is iOS subheadline, it is one step off the 17 the app
// ships today, and it holds a row title at weight 500 without the title looking like
// metadata. Against the reference apps it is one point large on body and one point small
// on row titles, which lands GRIIT between them rather than copying either.
//
// 14 is the reference body size exactly. It buys roughly one more task row per screen and
// costs the row title its authority: at 14/500 a title and its 12pt gate line are two
// points apart, and the row stops having a hierarchy. It also puts secondary at 12 and
// caption at 11, where caption and label collide.
//
// RECOMMENDATION: 15. If you want 14, take it on body/bodyStrong ONLY and hold secondary
// at 13 — do not shift the whole ladder down, or the bottom two steps merge.

export const spaceDense = {
  xs: 4,        // unchanged
  sm: 8,        // unchanged
  md: 10,       // was 12
  lg: 12,       // was 16
  gutter: 16,   // was 20
  section: 24,  // was 32
} as const;

export const radiusDense = {
  input: 10,    // was 12
  card: 14,     // was 20
  pill: 999,    // unchanged
} as const;

export const hitDense = 44;                                    // unchanged, the floor
export const buttonHeightDense = { regular: 46, small: 44 } as const;   // regular was 52
export const avatarSizeDense = { xs: 28, sm: 32, md: 44, lg: 80 } as const; // was 32/40/56/96
export const sizeDense = { tabBarClearance: 80 } as const;     // was 96: bar 56 + offset 12 + gutter 16 - 4
export const numberSizeDense = { inline: 15, home: 64, moment: 96, mid: 160, share: 220 } as const;
// inline was 17 and tracks body, because it sits on a body baseline. The rest are heroes.
export const stampDense = { fontSize: 11, tracking: '0.08em', padding: '5px 9px', strokeWidth: 1.5 } as const;

// Component sizes that live outside tokens.ts today and have to move with it.
export const componentDense = {
  listRowPaddingY: 10,     // was 16. min-height 44 still governs, so short rows do not shrink
  listRowGap: 10,          // was 12, icon to text
  statusRing: 18,          // was 20, the task row leading slot
  rowIcon: 22,             // was 24, ListRow leading and trailing glyphs
  cardPadding: 14,         // was 20
  tabBarHeight: 56,        // was 64
  tabBarIcon: 22,          // was 26
  tabBarLabel: 11,         // was 11, unchanged — already at the floor for a legible label
  feedPostHeaderPaddingY: 8,   // was 14
  weekSquareRadius: 8,     // was 12, tracks radius.input down
  weekSquareGap: 6,        // was 8
  chipPaddingX: 12,        // was 14
  chipPaddingY: 7,         // was 8. min-height 44 governs any chip that is a control
  counterButton: 116,      // was 132, the Add one circle
  progressBarHeight: 5,    // was 6
} as const;
