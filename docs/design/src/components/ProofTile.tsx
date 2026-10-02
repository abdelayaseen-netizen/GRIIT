import React from 'react';
import { color, type, radius, border, space } from '../tokens';

// One tile in Profile → Proofs. Label is the TASK, not the challenge: a user in one or two
// challenges saw "Iron man" on every tile, which is a word that never varies and therefore
// carries nothing. The challenge appears once, as a sub-header, and only on a day that
// holds more than one — see ProofGroupHeader.

export type ProofTileState = 'shared' | 'private' | 'failed' | 'loading';

export type ProofTileProps = {
  id: string;
  taskName: string;
  dateLabel: string;          // "19 September", for the a11y label only
  uri?: string | null;
  state: ProofTileState;
  onPress?: (id: string) => void;
};

// Fades from nothing at 42% to 78% ink at the base. A solid caption bar would sit on every
// tile whether the photo needs it or not; this only darkens where the text is.
const SCRIM = 'linear-gradient(to bottom, rgba(15,15,15,0) 42%, rgba(15,15,15,0.78) 100%)';
// The lock rides its own ground. A bare white glyph vanishes on a white photo and a bare
// dark one vanishes on a dark photo; the disc survives both.
const LOCK_DISC = 'rgba(15,15,15,0.72)';

export function ProofTile(p: ProofTileProps) {
  const flat = p.state === 'failed' || p.state === 'loading';
  const label =
    p.state === 'failed' ? `${p.taskName}, ${p.dateLabel}, photo unavailable`
    : p.state === 'loading' ? undefined
    : `${p.taskName}, ${p.dateLabel}, ${p.state}`;

  return (
    <div
      role={p.state === 'loading' ? undefined : 'button'}
      aria-label={label}
      aria-busy={p.state === 'loading' || undefined}
      onClick={p.state === 'loading' ? undefined : () => p.onPress?.(p.id)}
      style={{
        position: 'relative', aspectRatio: '1', borderRadius: radius.input, overflow: 'hidden',
        background: flat ? color.surface : 'transparent',
        border: flat ? border : '1px solid transparent',
      }}
    >
      {p.state === 'loading' ? <div style={{ position: 'absolute', inset: 0, background: color.border }} /> : null}

      {/* Never a black square: a failed image and a photo taken in the dark are the same
          pixel, and one of them is an error the user should be able to see. */}
      {p.state === 'failed' ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i data-lucide="image-off" style={{ width: 20, height: 20, color: color.textSecondary }} />
        </div>
      ) : null}

      {!flat && p.uri ? <img src={p.uri} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      {!flat ? <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '56%', background: SCRIM }} /> : null}

      {p.state !== 'loading' ? (
        <div style={{
          position: 'absolute', left: 6, right: p.state === 'private' ? 24 : 6, bottom: 5,
          ...type.label, letterSpacing: 'normal', textTransform: 'none',
          color: p.state === 'failed' ? color.textSecondary : color.textPrimary,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{p.taskName}</div>
      ) : null}

      {/* Decorative: the state is already in aria-label, so VoiceOver must not say it twice. */}
      {p.state === 'private' ? (
        <div aria-hidden="true" style={{
          position: 'absolute', right: 5, bottom: 4, width: 16, height: 16, borderRadius: radius.pill,
          background: LOCK_DISC, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i data-lucide="lock" style={{ width: 9, height: 9, color: color.textPrimary }} />
        </div>
      ) : null}
    </div>
  );
}

// 3 columns at space.gutter 16 and gap 6 on a 393pt phone: (393 - 2*16 - 2*6) / 3 = 116pt.
// 2.6x the 44pt minimum, so the tile is the tap target and needs no padding of its own.
// 116 only holds at the Chunk R gutter of 16; at the old gutter of 20 it was smaller.
export function ProofGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>{children}</div>;
}
