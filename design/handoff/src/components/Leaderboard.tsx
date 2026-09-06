import React from 'react';
import { color, type, space, radius } from '../tokens';
import { Avatar } from './Identity';

// Rows sit on the canvas with dividers, not inside a card (law 21). The viewer's own row
// is the one exception: brand.tint fill at radius 12 so it can be found without a border.
export function LeaderRow({ rank, name, uri, meta, points, isViewer, glyph, last }: {
  rank: number; name: string; uri?: string; meta: string; points: number;
  isViewer?: boolean; glyph?: React.ReactNode; last?: boolean;
}) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: space.lg,
        padding: isViewer ? `${space.gutter}px ${space.lg}px` : `${space.gutter}px 0`,
        marginBottom: isViewer ? 4 : 0,
        borderRadius: isViewer ? radius.input : undefined,
        background: isViewer ? color.brandTint : undefined,
      }}>
        <div style={{ width: 24, ...type.caption, color: color.textSecondary }}>{rank}</div>
        <Avatar size={40} uri={uri} displayName={name} glyph={glyph} />
        <div style={{ flex: 1 }}>
          <div style={type.bodyStrong}>{name}</div>
          <div style={{ ...type.caption, color: color.textSecondary }}>{meta}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={type.bodyStrong}>{points}</div>
          <div style={{ ...type.caption, color: color.textSecondary }}>pts</div>
        </div>
      </div>
      {!last && !isViewer ? <div style={{ height: 1, background: color.border }} /> : null}
    </>
  );
}
