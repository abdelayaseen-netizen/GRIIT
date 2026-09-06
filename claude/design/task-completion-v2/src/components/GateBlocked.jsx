import React from 'react';

// window / range / hardmode / upload. One layout, four copy sets (fixtures.BLOCKED_COPY).
// The primary is ink, not orange: nothing has been achieved yet.
export function GateBlocked({ copy, danger, onPrimary, onSecondary }) {
  return (
    <div className="notice">
      <div className="notice__center">
        <div className={`notice__eyebrow${danger ? ' notice__eyebrow--danger' : ''}`}>{copy.eyebrow}</div>
        <div className="title">{copy.headline}</div>
        <div className="notice__body">{copy.body}</div>
        {copy.meta && <div className="notice__meta">{copy.meta}</div>}
      </div>
      <div className="actions">
        <button className="btn btn--ink" onClick={onPrimary}>{copy.primary}</button>
        <button className="btn btn--quiet" onClick={onSecondary}>
          {copy.secondary || 'Back to today'}
        </button>
      </div>
    </div>
  );
}
