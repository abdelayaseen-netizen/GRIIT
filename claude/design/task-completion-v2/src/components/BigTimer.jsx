import React, { useEffect, useState } from 'react';

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const clock = (ms) => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Wall clock, not screen time. The remainder is DERIVED from startedAt on every tick — never a
// decremented counter, which drifts and dies with the process. Locking the phone, backgrounding,
// a call, or the app being killed changes nothing. There is no hard mode. README §4.2.
export function BigTimer({ startedAt, requiredSec, taskName, onCancel, onComplete }) {
  const remaining = () => Math.max(0, requiredSec - Math.floor((Date.now() - startedAt) / 1000));
  const [left, setLeft] = useState(remaining);

  useEffect(() => {
    // Fires immediately when we mount into an already-elapsed timer, e.g. the user reopened the
    // app after the duration passed: the session is complete, go straight to verifying.
    if (remaining() <= 0) { onComplete(); return undefined; }
    const id = setInterval(() => {
      const r = remaining();
      setLeft(r);
      if (r <= 0) { clearInterval(id); onComplete(); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, requiredSec]);

  return (
    <div className="body" style={{ alignItems: 'center' }}>
      <div className="body__fill" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="bignum">{fmt(left)}</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>{taskName}</div>
        {/* Both timestamps, because both are what get recorded. */}
        <div className="pill">Started {clock(startedAt)} · ends {clock(startedAt + requiredSec * 1000)}</div>
        <div className="disclosure" style={{ maxWidth: 250, textAlign: 'center', marginTop: 4 }}>
          Runs on the clock. Lock your phone, put it down — we'll tell you when it's done.
        </div>
      </div>
      <button className="btn btn--outline" onClick={onCancel}>Cancel the timer</button>
    </div>
  );
}
