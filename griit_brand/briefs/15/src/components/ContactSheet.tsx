import React from 'react';
import { color, contactSheet } from '../tokens';

export type Proof = { uri: string; verified: boolean };

// The completion hero: every proof of the challenge, six across and five down at 4:5.
// Self reported days sit at 40 percent with no stamp. This is the honest cut as a picture.
export function ContactSheet({ proofs, revealedRows = contactSheet.rows, thumbRadius = contactSheet.radius, gap = contactSheet.gap }: {
  proofs: Proof[]; revealedRows?: number; thumbRadius?: number; gap?: number;
}) {
  const rows: Proof[][] = [];
  for (let r = 0; r < contactSheet.rows; r++) rows.push(proofs.slice(r * contactSheet.cols, (r + 1) * contactSheet.cols));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${contactSheet.cols}, 1fr)`, gap, opacity: r < revealedRows ? 1 : 0 }}>
          {row.map((p, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: thumbRadius, overflow: 'hidden', background: color.surface, opacity: p.verified ? 1 : contactSheet.dimmed }}>
              <img src={p.uri} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Five steps of 120ms, then the stamp. Timers, not rAF, so a backgrounded view finishes.
export function revealRows(set: (n: number) => void, onDone: () => void) {
  for (let i = 1; i <= contactSheet.rows; i++) setTimeout(() => set(i), i * (contactSheet.revealMs / contactSheet.rows));
  setTimeout(onDone, contactSheet.revealMs + 40);
}
