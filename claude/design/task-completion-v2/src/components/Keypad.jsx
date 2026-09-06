import React from 'react';

// One keypad for distance / duration / minutes / count. Docks in place of the primary CTA.
// Not the system keyboard: it covers the CTA, animates over the disclosure, and offers paste,
// which means nothing for a self-entered number. README §4.3.

export const MASKS = {
  // digits fill two implied decimals from the right: 5,0,2 -> 5.02
  distance: { max: 5, format: (b) => (b ? (parseInt(b, 10) / 100).toFixed(2) : '0.00'),
    parse: (b) => (b ? parseInt(b, 10) / 100 : null) },
  // mm:ss shifting in from the right: 2,7,4,1 -> 27:41
  duration: { max: 4,
    format: (b) => { const p = b.padStart(4, '0'); return p.slice(0, 2) + ':' + p.slice(2); },
    parse: (b) => { if (!b) return null; const p = b.padStart(4, '0');
      return parseInt(p.slice(0, 2), 10) * 60 + Math.min(59, parseInt(p.slice(2), 10)); } },
  minutes: { max: 3, format: (b) => b || '0', parse: (b) => (b ? parseInt(b, 10) : null) },
  count: { max: 2, format: (b) => b || '0', parse: (b) => (b ? parseInt(b, 10) : 0) },
};

export function Keypad({ label, mask, buffer, onBuffer, onDone }) {
  const m = MASKS[mask];
  const push = (d) => onBuffer((buffer + d).replace(/^0+(?=\d)/, '').slice(0, m.max));
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return (
    <div className="keypad">
      <div className="keypad__head">
        <span className="keypad__label">{label}</span>
        <span className="keypad__draft">{m.format(buffer)}</span>
      </div>
      <div className="keypad__grid">
        {keys.map((d) => (
          <button key={d} className="keypad__key" onClick={() => push(d)}>{d}</button>
        ))}
        <button className="keypad__key keypad__key--word" onClick={() => onBuffer('')}>Clear</button>
        <button className="keypad__key" onClick={() => push('0')}>0</button>
        <button className="keypad__key keypad__key--word" onClick={() => onBuffer(buffer.slice(0, -1))}>Del</button>
      </div>
      {/* Done commits. Navigating away commits too — the stepper can correct any value, so
          there is nothing to cancel. */}
      <button className="btn btn--ink" onClick={() => onDone(m.parse(buffer))}>Done</button>
    </div>
  );
}
