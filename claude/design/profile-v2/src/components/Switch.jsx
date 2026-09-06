import React from 'react';

// 50x30 switch. It is the one control under 44pt, so the WHOLE ROW (>= 62px) is the hit target.
export default function SwitchRow({ label, sub, value, onChange }) {
  return (
    <div className="switchrow" onClick={() => onChange(!value)}>
      <span style={{ flex: 1 }}>
        <span className="list__label">{label}</span>
        <span className="list__sub">{sub}</span>
      </span>
      <button className={`switch${value ? ' switch--on' : ''}`} aria-label={label}
        onClick={(e) => { e.stopPropagation(); onChange(!value); }}>
        <span className="switch__knob" />
      </button>
    </div>
  );
}
