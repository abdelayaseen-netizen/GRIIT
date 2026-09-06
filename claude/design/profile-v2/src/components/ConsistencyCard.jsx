// Headline -> verdict -> detail on tap. GRIIT's one honest signal is verified days / due days.
import React, { useState } from 'react';
import DueDayStrip from './DueDayStrip';
import WeeklyBars from './WeeklyBars';

export default function ConsistencyCard({ consistency, onOpenDetail, possessive = 'your' }) {
  const [range, setRange] = useState('30d');
  const dueDays = consistency.strip.length;
  const showRange = dueDays >= 7;              // small samples lie; hide the window control
  const view = showRange ? range : '30d';

  return (
    <div className="card">
      <div className="card__head">
        <span className="card__label">CONSISTENCY</span>
        {showRange && (
          <span className="range">
            {[['30d', '30 days'], ['6mo', '6 months']].map(([id, label]) => (
              <button key={id} className={`range__opt${view === id ? ' range__opt--on' : ''}`}
                onClick={() => setRange(id)}>{label}</button>
            ))}
          </span>
        )}
      </div>

      <div className="rate">
        <span className="rate__value">{consistency.rate}</span>
        {consistency.verdict && (
          <span className={`rate__verdict rate__verdict--${consistency.verdict === 'Locked in' ? 'good' : 'warn'}`}>
            {consistency.verdict}
          </span>
        )}
      </div>
      <div className="rate__line">{consistency.line}</div>

      {view === '30d'
        ? <DueDayStrip days={consistency.strip} />
        : <WeeklyBars weeks={consistency.weeks} possessive={possessive} />}

      {onOpenDetail && (
        <button className="btn btn--quiet" style={{ marginTop: 16 }} onClick={onOpenDetail}>
          See the full record
        </button>
      )}
    </div>
  );
}
