import React, { useRef, useState } from 'react';
import { Keypad } from './Keypad.jsx';

// counter / water / reading. Primary is INK, not orange: the count is self-entered and this
// surface reserves orange for verified things. README §4.5.
export function TapCounter({ value, goal, unit, onChange, onSubmit }) {
  const [typing, setTyping] = useState(false);
  const [buffer, setBuffer] = useState('');
  const hold = useRef(null);
  const held = useRef(false);

  // 450ms hold opens the keypad; a hold that opens it must not also increment.
  const start = () => { held.current = false; hold.current = setTimeout(() => { held.current = true; open(); }, 450); };
  const end = () => clearTimeout(hold.current);
  const open = () => { setTyping(true); setBuffer(''); };
  const inc = () => { if (held.current) { held.current = false; return; } onChange(Math.min(goal, value + 1)); };

  const ready = value >= goal;

  return (
    <div className="body" style={{ alignItems: 'center' }}>
      <div className="body__fill" style={{ alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="bignum">{typing ? (buffer || '0') : value}</span>
          <span style={{ fontSize: 20, color: 'var(--muted)' }}>/ {goal} {unit}</span>
        </div>
        {!typing && (
          <>
            <button className="tap-target" onClick={inc}
              onPointerDown={start} onPointerUp={end} onPointerLeave={end}>Add one</button>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn--quiet" style={{ width: 'auto', padding: '0 16px' }}
                onClick={() => onChange(Math.max(0, value - 1))}>Remove one</button>
              <button className="btn btn--quiet" style={{ width: 'auto', padding: '0 16px' }}
                onClick={open}>Type the number</button>
            </div>
            <div className="numfield__hint">Press and hold "Add one" to type it instead</div>
          </>
        )}
      </div>

      {typing ? (
        <Keypad label={unit.toUpperCase()} mask="count" buffer={buffer} onBuffer={setBuffer}
          onDone={(v) => { onChange(Math.min(goal, v)); setTyping(false); }} />
      ) : (
        <>
          {/* Typing the number is exactly as unverified as tapping it. Same disclosure. */}
          <div className="disclosure" style={{ marginBottom: 14, textAlign: 'center' }}>
            Self-entered count · nothing is checked
          </div>
          <button className="btn btn--ink" disabled={!ready} onClick={onSubmit}>
            {ready ? `Log ${goal} ${unit}` : `${value} of ${goal} logged`}
          </button>
        </>
      )}
    </div>
  );
}
