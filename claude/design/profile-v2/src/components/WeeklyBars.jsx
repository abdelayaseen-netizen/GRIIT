// 6-month view: 26 weekly bars (verified / due), with the user's OWN average as a dashed baseline,
// so weeks read as above or below their normal — never against other people.
import React from 'react';
import { weeklyAverage } from '../fixtures';

export default function WeeklyBars({ weeks, from = 'Mar 2026', possessive = 'your', height = 92 }) {
  const avg = weeklyAverage(weeks);
  return (
    <>
      <div className="weeks" style={{ height }}>
        {weeks.map((w, i) => (
          <span key={i}
            className={`weeks__bar${w === null ? ' weeks__bar--empty' : ''}`}
            style={{ height: w === null ? 3 : Math.max(4, Math.round(w * height)) }} />
        ))}
        <span className="weeks__avg" style={{ bottom: Math.round(avg * height) }} />
      </div>
      <div className="weeks__foot">
        <span>{from}</span>
        <span>Dashed line · {possessive} average {Math.round(avg * 100)}%</span>
      </div>
    </>
  );
}
