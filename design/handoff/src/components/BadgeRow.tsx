import React from 'react';
import { color, type, space, radius, displayFace, stamp } from '../tokens';
import type { Badge } from './Badges';

// Chunk U A4: a TREATMENT change to the existing Badges component, not a new badge set.
// The five marks, their requirements, their earned dates and the footnote are unchanged
// from Badges.tsx / frame 21. What changes is the layout: rows instead of a two-column
// tile grid, because the requirement line is the part that says what the mark costs and in
// a tile it had nowhere to go.
//
// The stamp language holds: NO ICONS, NO CIRCLES, NO CARDS. Earned and unearned differ on
// three channels — stamp border, stamp letters, trailing word — which is enough without a
// glyph and without opacity (opacity alone fails WCAG 1.4.1 and reads as "disabled").
//
// The locked word is textSecondary, NOT color.border: border on canvas is 1.36:1, which
// makes one of the three stated channels invisible and the rationale false. Grey against
// the earned orange is the distinction; illegibility is not.

export function BadgeRows({ badges, footnote }: { badges: Badge[]; footnote: string }) {
  const earnedCount = badges.filter(b => !!b.earnedOn).length;
  const word = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'][earnedCount] ?? String(earnedCount);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.lg }}>
      <div style={{ ...type.caption, color: color.textSecondary }}>{word} of {badges.length} earned.</div>
      <div>
        {badges.map((b, i) => {
          const earned = !!b.earnedOn;
          const c = earned ? color.brandText : color.textSecondary;
          return (
            <React.Fragment key={b.label}>
              {i > 0 ? <div style={{ height: 1, background: color.border }} /> : null}
              <div
                aria-label={`${b.label}, ${earned ? `earned ${b.earnedOn}` : `locked. ${b.requirement}`}`}
                style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: space.lg, minHeight: 44 }}
              >
                <div style={{
                  flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: `${stamp.strokeWidth}px solid ${earned ? color.brandText : color.border}`,
                  borderRadius: radius.input, padding: stamp.padding,
                  fontFamily: displayFace, fontSize: stamp.fontSize, lineHeight: `${stamp.fontSize}px`,
                  fontWeight: '600', letterSpacing: stamp.tracking, textTransform: 'uppercase', color: c,
                }}>{b.label}</div>
                {/* Body type, left-aligned, in the row — as A4 asked. */}
                <div style={{ flex: 1, ...type.caption, color: color.textSecondary }}>
                  {earned ? `Earned ${b.earnedOn}` : b.requirement}
                </div>
                <div style={{ ...type.label, letterSpacing: 'normal', textTransform: 'none', color: earned ? color.brandText : color.textSecondary, flex: 'none' }}>
                  {earned ? 'Earned' : 'Locked'}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ ...type.caption, color: color.textSecondary }}>{footnote}</div>
    </div>
  );
}
