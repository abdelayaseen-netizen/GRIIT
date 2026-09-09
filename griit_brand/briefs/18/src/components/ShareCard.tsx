import React from 'react';
import { color, type, displayFace, shareProofWidth } from '../tokens';
import { Stamp } from './Stamp';

// Two sizes. Story keeps 250px safe zones top and bottom. Same tokens as the app.
// Proof width is 840 (story) and 720 (feed), not 900: at 900 the 160px number and the
// 80px logo overflow the fixed box and the only thing that can give is the image, which
// would break the 4:5 rule. The aspect ratio wins over the width.
export function ShareCard({ size, proofUri, streak }: { size: 'story' | 'feed'; proofUri: string; streak: number }) {
  const story = size === 'story';
  return (
    <div style={{
      width: 1080, height: story ? 1920 : 1350, background: color.textPrimary,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: story ? '250px 90px' : 60,
    }}>
      {/* flex: none, or the column's fixed height squashes the image off 4:5 */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'baseline', gap: 32 }}>
        <div style={{ ...type.number, fontFamily: displayFace, fontSize: 160, lineHeight: '160px', color: color.textPrimary }}>{streak}</div>
        <div style={{ ...type.bodyStrong, fontSize: 44, lineHeight: '56px', color: color.textPrimary }}>{`Day ${streak}. Verified.`}</div>
      </div>
      <div style={{ marginTop: 24, width: shareProofWidth[story ? 'story' : 'feed'], aspectRatio: '4 / 5', flex: 'none', borderRadius: 60, overflow: 'hidden', background: color.textPrimary }}>
        <img src={proofUri} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ marginTop: 24, flex: 'none', transform: 'scale(2)', transformOrigin: 'top center' }}><Stamp onInk /></div>
      <div style={{ flex: 1 }} />
      <Logo />
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 80 }}>
      <div style={{ width: 24, height: 80, borderRadius: 12, background: color.brand }} />
      <div style={{ width: 24, height: 56, borderRadius: 12, background: color.brand }} />
      <div style={{ ...type.display, fontSize: 56, lineHeight: '64px', letterSpacing: 2, color: color.textPrimary }}>GRIIT</div>
    </div>
  );
}
