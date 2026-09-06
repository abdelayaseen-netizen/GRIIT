import React from 'react';

// Timer entry rows: hard mode and sound. Whole row is the hit target. README §4.2.
export function SwitchRow({ label, sub, value, onChange, first }) {
  return (
    <button className={`switchrow${first ? '' : ' switchrow--ruled'}`} onClick={() => onChange(!value)}>
      <span className="switchrow__text">
        <span className="switchrow__label">{label}</span>
        <span className="switchrow__sub">{sub}</span>
      </span>
      <span className={`switch${value ? ' switch--on' : ''}`}><span className="switch__knob" /></span>
    </button>
  );
}
