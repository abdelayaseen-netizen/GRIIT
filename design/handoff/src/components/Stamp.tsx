import React from 'react';
import { color, displayFace, stamp, displayWeight } from '../tokens';

// The only decoration in the app. It never appears on self reported content: rendering
// it is a claim about what the server confirmed.
export function Stamp({ onInk, label = 'Verified' }: { onInk?: boolean; label?: string }) {
  const c = onInk ? color.textPrimary : color.brandText;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `${stamp.strokeWidth}px solid ${c}`,
      borderRadius: stamp.radius,
      padding: stamp.padding,
      fontFamily: displayFace,
      fontSize: stamp.fontSize,
      lineHeight: `${stamp.fontSize}px`,
      fontWeight: displayWeight,
      letterSpacing: stamp.tracking,
      textTransform: 'uppercase',
      color: c,
    }}>{label}</div>
  );
}
