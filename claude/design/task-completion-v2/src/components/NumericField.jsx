import React from 'react';

// empty / editing / filled. README §4.3.
// The unit button is a preference (persisted), not a per-entry field.
export function NumericField({ label, value, display, hint, unit, onUnit, editing, onEdit,
  stepDown, stepUp, onStepDown, onStepUp }) {
  const state = editing ? 'editing' : value === null || value === undefined ? 'empty' : 'filled';
  return (
    <div className={`numfield numfield--${state}`}>
      <div className="numfield__head">
        <span className="numfield__label">{label}</span>
        {unit && (
          <button className="numfield__unit" onClick={onUnit} disabled={!onUnit}>{unit}</button>
        )}
      </div>
      <button className="numfield__value" onClick={onEdit}>
        {state === 'empty' ? '—' : display}
      </button>
      {hint && <div className="numfield__hint">{hint}</div>}
      <div className="numfield__steppers">
        <button className="numfield__step" onClick={onStepDown}>{stepDown}</button>
        <button className="numfield__step" onClick={onStepUp}>{stepUp}</button>
      </div>
    </div>
  );
}
