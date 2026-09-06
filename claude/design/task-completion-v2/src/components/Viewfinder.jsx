import React from 'react';

// 390 x 488 at y=106. Full-bleed 4:5 — the frame edge IS the crop, so the capture is
// used as-is with no system crop sheet. README §3.
export function Viewfinder({ stamp, children }) {
  return (
    <div className="viewfinder">
      {/* Replace the placeholder with the live camera preview layer. */}
      <div className="viewfinder__placeholder" />
      {children}
      {stamp && <span className="viewfinder__stamp">{stamp}</span>}
    </div>
  );
}

export function Shutter({ onPress }) {
  return <button className="shutter" onClick={onPress} aria-label="Take photo" />;
}
