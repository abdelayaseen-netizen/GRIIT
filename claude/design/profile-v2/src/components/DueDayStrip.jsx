// One cell per DUE day, newest on the right. Days with no challenge running are not rendered:
// a pale "not due" cell reads as a miss. Cell width is computed so the row can never overflow.
import React from 'react';
import { cellWidth } from '../fixtures';

export default function DueDayStrip({ days, innerWidth = 298, showLegend = true }) {
  if (!days.length) return null;
  const w = cellWidth(days.length, innerWidth);
  return (
    <>
      <div className="strip">
        {days.map((state, i) => (
          <span key={i} className={`strip__cell strip__cell--${state}`} style={{ width: w }} />
        ))}
      </div>
      {showLegend && (
        <div className="legend">
          <span><span className="legend__key" style={{ background: 'var(--orange)' }} />Verified</span>
          <span><span className="legend__key" style={{ background: 'var(--missed-fill)', border: '1.5px solid var(--missed)' }} />Missed</span>
          <span><span className="legend__key" style={{ background: '#fff', border: '1.5px dashed var(--orange)' }} />Today</span>
        </div>
      )}
    </>
  );
}
