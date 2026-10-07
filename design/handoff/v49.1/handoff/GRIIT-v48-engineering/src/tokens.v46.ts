// v46 visual system reset. Proposed values for src/tokens.ts, on top of tokens.dense.ts (chunk R).
// Nothing is renamed except where noted; new roles are additive.

export const colorV46 = {
  canvas:        '#0F0F0F',   // unchanged
  surface:       '#1A1918',   // was #1A1917
  raised:        '#242322',   // NEW: secondary buttons, the done circle, raised controls
  hairline:      '#2A2928',   // was border #2E2B27
  textPrimary:   '#F2F0EB',   // was #F5F3EE
  textSecondary: 'rgba(242,240,235,0.64)',  // was #A39E95. Solid on canvas: #A09F9C, 7.4:1
  textTertiary:  'rgba(242,240,235,0.44)',  // NEW. Solid on canvas: #737270, 3.9:1. Never for body text
  primary:       '#BB471D',   // unchanged: the one filled button per screen
  brand:         '#DC5401',   // unchanged, now ONLY: flame, done check, active tab icon
  // brandText #E8600F and brandTint #3A1F10 are RETIRED. Selected states invert instead:
  selectedBg:    '#F2F0EB',   // NEW: selected chip / segment fill
  selectedText:  '#0F0F0F',   // NEW
} as const;

export const typeV46 = {
  titleL:    { fontSize: 28, lineHeight: 34, fontWeight: '600' },                          // was display 28/34/500
  title:     { fontSize: 20, lineHeight: 25, fontWeight: '600' },                          // was title 22/28/500
  headline:  { fontSize: 15, lineHeight: 20, fontWeight: '600' },                          // was bodyStrong 15/20/500
  body:      { fontSize: 15, lineHeight: 20, fontWeight: '400' },                          // unchanged
  secondary: { fontSize: 13, lineHeight: 18, fontWeight: '400' },                          // unchanged
  caption:   { fontSize: 12, lineHeight: 16, fontWeight: '500' },                          // was 400
  label:     { fontSize: 11, lineHeight: 13, fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase' }, // was lh 14
  // heading 17/22 is RETIRED: Title (20) and Headline (15) cover it.
} as const;

export const numberV46 = { L: 56, M: 40, S: 28 } as const;  // displayFace / displayWeight unchanged

export const categoryTint = {
  Fitness: '#2F4A66', Faith: '#4A3A6B', Mind: '#2F5A4C',
  Health: '#1F5560', Discipline: '#5E4A30', Learning: '#5A5420',
} as const;  // v48 flag 199 (approved Oct 4): raised in chroma so six covers separate by colour alone. Gradient 160deg tint -> #151414

export const avatarTints = [
  ['#3B3F4A', '#C9CEDA'], ['#3E3A48', '#D3CBE0'], ['#34413C', '#C6D8CF'],
  ['#44403A', '#DDD3C4'], ['#3A4144', '#C4D3D8'], ['#463B3B', '#E0CACA'],
] as const;  // [bg, initials]; index = hash(user_id) % 6

export const componentV46 = {
  headerIconButton: 36, gutter: 16, taskRow: 52, cardRadius: 16, segmentHeight: 32,
  chipHeight: 34, buttonPrimary: 48, buttonSecondary: 44, counterButton: 116,
  featuredCover: { w: 160, h: 200 }, gridCoverAspect: 4 / 5, weekDot: 12,
} as const;
