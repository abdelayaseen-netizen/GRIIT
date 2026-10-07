import React from 'react';
import { color, type, space } from '../tokens';

// "19 September · 3 proofs".
//
// NO private count in the header. The lock marks are already in view, and "3 proofs · 1
// private" makes the reader hold two numbers and reconcile them against the tiles — the
// same arithmetic the old footer was removed for. A count also implies the split matters
// at the day level, and it does not: privacy is a property of a photo.

export function ProofGroupHeader({ dateLabel, count }: { dateLabel: string; count: number }) {
  return (
    <div style={{ padding: `14px ${space.gutter}px 4px`, ...type.label, color: color.textSecondary }}>
      {dateLabel} · {count} {count === 1 ? 'proof' : 'proofs'}
    </div>
  );
}

// The challenge name, once per group, and ONLY when a day holds more than one challenge.
// The alternative was a second line on every tile: at 113pt that costs a fifth of the photo
// and repeats the same word three times across a row to say what one line above it says
// once. Callers group by challenge within the date only when challengeCount > 1.
export function ProofChallengeSubHeader({ challengeName }: { challengeName: string }) {
  return (
    <div style={{ padding: `10px ${space.gutter}px 4px`, ...type.label, letterSpacing: 'normal', textTransform: 'none', color: color.textSecondary }}>
      {challengeName}
    </div>
  );
}

// One line, no arithmetic, no comparison to any other count on the screen. The final
// wording is blocked on the engineering count fix; this is the slot and nothing more.
export function ProofFooter({ photoCount }: { photoCount: number }) {
  return (
    <div style={{ padding: `10px ${space.gutter}px 26px`, background: color.canvas, borderTop: `1px solid ${color.border}` }}>
      <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>
        {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
      </div>
    </div>
  );
}
