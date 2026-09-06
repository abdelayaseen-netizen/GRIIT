import React from 'react';

// Shared chrome. README §2. Present on entry / capture / review / doing / blocked.
// Absent on the confirmation and on Home.
export function Chrome({ day, typeLabel, onBack }) {
  return (
    <div className="chrome">
      <button className="chrome__back" onClick={onBack} aria-label="Back">
        <span className="chrome__glyph" />
      </button>
      <span className="chrome__title">{`Day ${day} · ${typeLabel}`}</span>
    </div>
  );
}
