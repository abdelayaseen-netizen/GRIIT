import React from 'react';
import { color, type, space, radius, displayFace, stamp } from '../tokens';

export type Badge = { label: string; earnedOn?: string; requirement: string };

// The five marks in the stamp language: no icons, no circles, no cards. Two columns on
// the canvas. Earned carries brand.action; unearned carries the border colour.
export function Badges({ badges, footnote }: { badges: Badge[]; footnote: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.gutter }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
        {badges.map(b => {
          const earned = !!b.earnedOn;
          const c = earned ? color.brandText : color.textSecondary;
          return (
            <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `${stamp.strokeWidth}px solid ${earned ? color.brandText : color.border}`,
                borderRadius: radius.input, padding: stamp.padding,
                fontFamily: displayFace, fontSize: stamp.fontSize, lineHeight: `${stamp.fontSize}px`,
                fontWeight: '600', letterSpacing: stamp.tracking, textTransform: 'uppercase', color: c,
              }}>{b.label}</div>
              <div style={{ ...type.caption, color: color.textSecondary }}>
                {earned ? `Earned ${b.earnedOn}` : b.requirement}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ ...type.caption, color: color.textSecondary }}>{footnote}</div>
    </div>
  );
}
