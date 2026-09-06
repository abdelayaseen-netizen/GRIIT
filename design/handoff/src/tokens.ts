// GRIIT design tokens. No raw hex may appear anywhere outside this file.

export const color = {
  // The canvas is ink. Not a dark mode, the mode. Labrecque & Milne (2012): high value
  // reads as less rugged (β = -.344, p < .001); saturation carries ruggedness and
  // excitement. Every text pair below measured with the WCAG formula.
  canvas: '#0F0F0F',          // every screen
  surface: '#1A1917',         // cards, sheets, inputs
  border: '#2E2B27',          // card edges, dividers, segmented track
  textPrimary: '#F5F3EE',     // 17.3:1 on canvas, 15.8:1 on surface
  textSecondary: '#A39E95',   // 7.2:1 on canvas, 6.6:1 on surface
  brand: '#DC5401',           // fills, week strip, active outlines
  brandText: '#E8600F',       // orange as text: 5.6:1 on canvas, 5.1:1 on surface
  brandTint: '#3A1F10',       // hint grounds, selected chips, your own row
  onBrand: '#0F0F0F',         // label on a brand fill: 4.9:1
  danger: '#E5533D',          // destructive only: 5.1:1 on canvas
} as const;

export const scrim = 'linear-gradient(to bottom, rgba(15,15,15,0) 0%, rgba(15,15,15,0.6) 100%)';
export const scrimHeight = '40%';

// LAW AMENDMENTS, Sept 6 2026 (brand layer, additive):
// law 2  the UI face stays SF Pro 400/500. One second family, Barlow Condensed 600, is
//        allowed for numbers the USER EARNED and for nothing else, and it is the only
//        place a weight above 500 may appear. Earned: the streak, "Day 23" in a feed
//        header or on the proof card, rank and points, verified days on a badge, best
//        streak, the share card headline. Not earned, stays SF Pro: timestamps, follower
//        counts, task counts (0 / 1), "14 days" on a challenge card, wizard step numbers,
//        character counts, prices. Never on a heading, a label or a button.
// law 1  the canvas is ink on every screen (Sept 6 2026 inversion).
// law 7  cards are surface. There is no separate ink hero card: the Profile streak card
//        is a surface card with the display number, brand.tint if it needs weight. The
//        proof moment is the full bleed photo with the number over it, not a change of
//        ground. Cover fallbacks stay canvas.
// law 9  card recipe: surface, radius 20, 1pt border, on canvas. No shadow.
// law 19 two animated moments now: the 400ms day secured count up, and the 600ms row by
//        row reveal on the completion contact sheet. Nothing else moves.
// law 19 unchanged in spirit. The one moment is the secured screen: count up, square
//        fill, one haptic.
// law 23 a segmented control sits directly under the title OR directly under the hero.

// The display face. Barlow Condensed 600, tabular. `number` only, nowhere else.
export const displayFace = "'Barlow Condensed', 'SF Pro Display', sans-serif";

// Two weights only. Hierarchy comes from size and colour, never weight.
export const weight = { regular: '400', medium: '500' } as const;

export const type = {
  display:    { fontSize: 34, lineHeight: 41, fontWeight: weight.medium,  letterSpacing: -0.5 },
  number:     { fontSize: 64, lineHeight: 64, fontWeight: '600', fontFamily: displayFace, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' },
  title:      { fontSize: 28, lineHeight: 34, fontWeight: weight.medium },
  heading:    { fontSize: 20, lineHeight: 25, fontWeight: weight.medium },
  body:       { fontSize: 17, lineHeight: 22, fontWeight: weight.regular },
  bodyStrong: { fontSize: 17, lineHeight: 22, fontWeight: weight.medium },
  secondary:  { fontSize: 15, lineHeight: 20, fontWeight: weight.regular },
  caption:    { fontSize: 13, lineHeight: 18, fontWeight: weight.regular },
  label:      { fontSize: 12, lineHeight: 16, fontWeight: weight.medium, letterSpacing: '0.06em', textTransform: 'uppercase' as const },
} as const;

// Apple text style each maps to, so Dynamic Type scales the app.
export const dynamicType = {
  display: 'largeTitle', number: null, title: 'title1', heading: 'title3',
  body: 'body', bodyStrong: 'headline', secondary: 'subheadline',
  caption: 'footnote', label: 'caption1',
} as const;

// 4pt grid.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, gutter: 20, section: 32 } as const;
export const radius = { input: 12, card: 20, pill: 999 } as const;
export const hit = 44;          // minimum tappable size
export const buttonHeight = { regular: 52, small: 44 } as const;
export const avatarSize = { xs: 32, sm: 40, md: 56, lg: 96 } as const;
export const proofAspect = 4 / 5;
export const motion = { daySecuredMs: 400 } as const; // the only animation in the app
export const numberSize = { inline: 17, home: 64, moment: 96, mid: 160, share: 220 } as const;
export const stamp = { fontSize: 12, tracking: '0.08em', radius: radius.input, padding: '6px 10px', strokeWidth: 1.5 } as const;
export const shutter = 72;
// 900 overruns the story safe zone and the feed box once the number, stamp and logo are
// in the column. Law 13 (true 4:5) outranks the stated 900 width.
export const shareProofWidth = { story: 720, feed: 560 } as const;

export const border = `1px solid ${color.border}`;
export const contactSheet = { cols: 6, rows: 5, gap: 4, radius: 4, revealMs: 600, dimmed: 0.4 } as const;
export const selectedBorder = `1.5px solid ${color.brand}`;
