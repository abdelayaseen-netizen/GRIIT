import React from 'react';

// One line per gate, plain words. Never a card labelled "GATES", never an empty container.
// If gates is empty, render nothing at all.
export function GateList({ gates }) {
  if (!gates || !gates.length) return null;
  return (
    <div className="gates">
      {gates.map((g) => (
        <div className="gate" key={g}>
          <span className="gate__dot" />
          <span>{g}</span>
        </div>
      ))}
    </div>
  );
}

// The camera-deck variant: single line, centred, directly above the shutter.
export function GateLine({ children }) {
  return <span className="gate-line">{children}</span>;
}
