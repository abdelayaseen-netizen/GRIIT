import React from 'react';
import { color } from '../tokens';

// v37. Replaces the VERIFIED pill. A brand disc with an ink check, then the proof type.
// The word "Verified" is not rendered anywhere. Self-reported gets no disc and no colour.
// 'camera_place' must not be passed until location verification ships (Part B rule).

export type Proof = 'camera' | 'camera_place' | 'self';
const LABEL: Record<Exclude<Proof, 'self'>, string> = { camera: 'Camera', camera_place: 'Camera · Place' };

export function VerifiedMark({ proof, size = 'feed', onPhoto }: { proof: Proof; size?: 'feed' | 'story'; onPhoto?: boolean }) {
  const z = size === 'feed' ? 12 : 14, lh = size === 'feed' ? 16 : 18, disc = size === 'feed' ? 14 : 16;
  const shadow = onPhoto ? '0 0 2px rgba(15,15,15,0.9), 0 0 2px rgba(15,15,15,0.9), 0 1px 3px rgba(15,15,15,0.55), 0 4px 16px rgba(15,15,15,0.3)' : undefined;
  if (proof === 'self') {
    return <div accessibilityLabel="Self-reported" style={{ fontSize: z, lineHeight: `${lh}px`, color: onPhoto ? color.textPrimary : color.textSecondary, textShadow: shadow }}>Self-reported</div>;
  }
  return (
    <div accessibilityLabel={`Proof: ${LABEL[proof].replace(' · ', ' and ')}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: disc, height: disc, borderRadius: 999, background: color.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i data-lucide="check" style={{ width: Math.round(disc * 0.64), height: Math.round(disc * 0.64), color: color.canvas }} />
      </div>
      <div style={{ fontSize: z, lineHeight: `${lh}px`, fontWeight: '500', color: onPhoto ? color.textPrimary : color.brandText, textShadow: shadow }}>{LABEL[proof]}</div>
    </div>
  );
}
