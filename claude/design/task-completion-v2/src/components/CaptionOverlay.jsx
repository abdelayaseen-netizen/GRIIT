import React from 'react';

// Caption sits on the photo, matching the proof card spec: 70 / 92 / 100% opacity
// hierarchy, "..." truncation on the caption line.
export function CaptionOverlay({ challengeName, completion, caption }) {
  return (
    <span className="caption-overlay">
      <span className="caption-overlay__challenge">{challengeName}</span>
      <span className="caption-overlay__completion">{completion}</span>
      <span className="caption-overlay__caption">{caption || 'Add a caption'}</span>
    </span>
  );
}

export function CaptionField({ value, onChange }) {
  return (
    <div className="caption-field">
      <input value={value} maxLength={120} placeholder="Add a caption"
        onChange={(e) => onChange(e.target.value.slice(0, 120))} />
      <span className="caption-field__count">{value.length} / 120</span>
    </div>
  );
}
