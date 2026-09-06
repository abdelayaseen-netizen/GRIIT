// Three lines, no more: name + Day X of Y, one per-day bar with misses visible inside it, one muted line.
// Challenges appear ONLY here — no promoted run card, no mini duplicate above.
import React from 'react';

export default function ChallengeRow({ run, onPress }) {
  return (
    <div className="run" onClick={onPress} role={onPress ? 'button' : undefined}>
      <div className="run__head">
        <span>{run.name}</span>
        <span>{run.day}</span>
      </div>
      <div className="run__bar">
        {run.days.map((state, i) => <span key={i} className={`run__seg run__seg--${state}`} />)}
      </div>
      <div className="run__meta">{run.meta}</div>
    </div>
  );
}
