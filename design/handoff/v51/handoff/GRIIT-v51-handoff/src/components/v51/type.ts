// v51 type scale. Map to iOS text styles so Dynamic Type scales.
export const type = {
  title1:   { fontSize: 28, lineHeight: 34, fontWeight: '600', textStyle: 'title1' },
  title3:   { fontSize: 20, lineHeight: 25, fontWeight: '600', textStyle: 'title3' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', textStyle: 'headline' },
  body:     { fontSize: 17, lineHeight: 22, fontWeight: '400', textStyle: 'body' },
  secondary:{ fontSize: 15, lineHeight: 20, fontWeight: '400', textStyle: 'subheadline' },
  caption:  { fontSize: 13, lineHeight: 18, fontWeight: '500', textStyle: 'footnote' },
  label:    { fontSize: 11, lineHeight: 13, fontWeight: '500', letterSpacing: 0.66, textTransform: 'uppercase' },
} as const;
