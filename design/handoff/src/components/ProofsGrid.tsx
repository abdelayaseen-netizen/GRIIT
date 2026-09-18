import React from 'react';
import { color, type, space, radius, border } from '../tokens';

// Profile → Proofs. A photo grid of camera proofs, newest first.
//
// Self-reported days do not appear: there is no photo, and a placeholder tile
// would be a picture of a proof that does not exist. The count under the grid
// names them so the grid is never mistaken for the whole record.

export type ProofTile = { id: string; uri: string; day: number; capturedAt: string };

export type ProofsGridProps = {
  proofs: ProofTile[];
  selfReportedDays: number;   // secured days with no camera proof
  hasActiveChallenge: boolean;
  onOpen?: (id: string) => void;
};

export function ProofsGrid(p: ProofsGridProps) {
  if (p.proofs.length === 0) {
    // Two different emptinesses. A user with secured days but no photos has not
    // failed at anything, and must not read the same message as a new user.
    const body = p.selfReportedDays > 0
      ? `Your ${p.selfReportedDays} secured day${p.selfReportedDays === 1 ? ' was' : 's were'} all self-reported. A task with the Camera gate puts a photo here.`
      : 'A proof lands here when a task with the Camera gate is done. Nothing can be added from your library.';
    return (
      <div style={{ padding: `60px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md }}>
        <div style={{ width: 40, height: 40, borderRadius: radius.pill, background: color.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i data-lucide="camera" style={{ width: 24, height: 24, color: color.textPrimary }} />
        </div>
        <div style={{ ...type.heading, color: color.textPrimary, textAlign: 'center' }}>No camera proofs yet</div>
        <div style={{ ...type.secondary, color: color.textSecondary, textAlign: 'center', maxWidth: 280 }}>{body}</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {p.proofs.map(t => (
          <div key={t.id} role="button" onClick={() => p.onOpen?.(t.id)} style={{ position: 'relative', aspectRatio: '1', borderRadius: radius.input, border, overflow: 'hidden' }}>
            <img src={t.uri} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {/* Burned into the corner, not a caption below: the grid is photos. */}
            <div style={{ position: 'absolute', left: 8, bottom: 6, fontSize: 12, lineHeight: '16px', fontWeight: '500', color: color.textPrimary, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Day {t.day}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
        {p.proofs.length} camera proof{p.proofs.length === 1 ? '' : 's'}.
        {p.selfReportedDays > 0 ? ` ${p.selfReportedDays} more day${p.selfReportedDays === 1 ? ' was' : 's were'} secured self-reported and have no photo.` : ''}
      </div>
    </>
  );
}
