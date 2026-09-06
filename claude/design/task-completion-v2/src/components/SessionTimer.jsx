import React from 'react';

// workout only, reached from "Use the timer instead". Counts UP, and stopping back-fills the
// duration field. It does not change what is verified — the photo still is. README §4.3.
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function SessionTimer({ seconds, onStop, onCancel }) {
  return (
    <div className="body" style={{ alignItems: 'center' }}>
      <div className="body__fill" style={{ alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div className="numfield__label">SESSION TIMER</div>
        <div className="bignum">{fmt(seconds)}</div>
        <div className="disclosure" style={{ maxWidth: 260, textAlign: 'center' }}>
          Counting up. Stopping fills the duration field for you — the photo is still what gets verified.
        </div>
      </div>
      <div className="actions" style={{ width: '100%' }}>
        <button className="btn btn--ink" onClick={onStop}>
          Stop and use {Math.max(1, Math.round(seconds / 60))} min
        </button>
        <button className="btn btn--quiet" onClick={onCancel}>Cancel, I'll type it</button>
      </div>
    </div>
  );
}
