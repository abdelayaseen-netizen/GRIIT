import React, { useState } from 'react';
import { NumericField } from './NumericField.jsx';
import { Keypad } from './Keypad.jsx';

// run / workout phase one. Values are entered, not decorative. README §4.3.
// The disclosure is not optional: only the photo that follows is verified.
export function LogFields({
  type, title, note, disclosure,
  distance, unit, onDistance, onUnit,
  duration, onDuration,          // run: seconds. workout: minutes.
  minimum,                        // workout floor, minutes
  chips, activeChip, onChip,
  onUseTimer, onNext,
}) {
  const [editing, setEditing] = useState(null);   // 'distance' | 'duration' | null
  const [buffer, setBuffer] = useState('');
  const open = (field) => { setEditing(field); setBuffer(''); };
  const two = (n) => String(n).padStart(2, '0');

  const ready = type === 'run'
    ? distance > 0 && duration > 0
    : duration !== null && duration >= (minimum || 0);

  const commit = (v) => {
    if (editing === 'distance') onDistance(v);
    else onDuration(v);
    setEditing(null); setBuffer('');
  };

  return (
    <div className="body">
      <div className="body__fill">
        <div className="title">{title}</div>
        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--muted-light)' }}>{note}</div>

        <div className="fields">
          {type === 'run' ? (
            <>
              <NumericField label="DISTANCE" value={distance}
                display={distance === null ? '' : distance.toFixed(2)}
                hint="Tap to type" unit={unit} onUnit={onUnit}
                editing={editing === 'distance'} onEdit={() => open('distance')}
                stepDown="− 0.1" stepUp="+ 0.1"
                onStepDown={() => onDistance(Math.max(0, Number(((distance || 0) - 0.1).toFixed(2))))}
                onStepUp={() => onDistance(Number(((distance || 0) + 0.1).toFixed(2)))} />
              <NumericField label="DURATION" value={duration}
                display={duration === null ? '' : `${two(Math.floor(duration / 60))}:${two(duration % 60)}`}
                hint="mm:ss" unit="min"
                editing={editing === 'duration'} onEdit={() => open('duration')}
                stepDown="− 0:30" stepUp="+ 0:30"
                onStepDown={() => onDuration(Math.max(0, (duration || 0) - 30))}
                onStepUp={() => onDuration((duration || 0) + 30)} />
            </>
          ) : (
            <NumericField label="DURATION" value={duration} display={String(duration)}
              hint={duration !== null && duration < minimum ? `At least ${minimum} min` : 'Tap to type'}
              unit="min" editing={editing === 'duration'} onEdit={() => open('duration')}
              stepDown="− 5" stepUp="+ 5"
              onStepDown={() => onDuration(Math.max(0, (duration || 0) - 5))}
              onStepUp={() => onDuration((duration || 0) + 5)} />
          )}
        </div>

        {/* Nothing behind the keypad is reachable, so nothing behind it is drawn. */}
        {!editing && (
          <>
            {!!chips?.length && (
              <div className="chips">
                {chips.map((c) => (
                  <button key={c} onClick={() => onChip(c)}
                    className={`chip${activeChip === c ? ' chip--on' : ''}`}>{c}</button>
                ))}
              </div>
            )}
            {onUseTimer && (
              <button className="btn btn--dashed" onClick={onUseTimer}>Use the timer instead</button>
            )}
            <div className="disclosure" style={{ marginTop: 18 }}>{disclosure}</div>
          </>
        )}
      </div>

      {editing ? (
        <Keypad
          label={editing === 'distance' ? `DISTANCE IN ${unit.toUpperCase()}`
            : type === 'run' ? 'DURATION MM:SS' : 'DURATION IN MINUTES'}
          mask={editing === 'distance' ? 'distance' : type === 'run' ? 'duration' : 'minutes'}
          buffer={buffer} onBuffer={setBuffer} onDone={commit} />
      ) : (
        <button className="btn btn--verified" disabled={!ready} onClick={onNext}>
          {ready ? 'Next: photo proof'
            : type === 'run' ? 'Enter distance and duration' : 'Enter the duration'}
        </button>
      )}
    </div>
  );
}
