// The one dark card on the screen: streak only. Total verified days lives on the detail page.
import React from 'react';

export default function StreakCard({ current, best, since, note }) {
  return (
    <div className="streak">
      <div className="card__head">
        <span className="card__label">CURRENT STREAK</span>
        <span className="card__label" style={{ letterSpacing: '.5px' }}>BEST · {best === 1 ? '1 day' : `${best} days`}</span>
      </div>
      <div className="streak__value">
        <b>{current}</b><span>{current === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="streak__note">
        {note || (current === 0 ? 'Post today to start.' : `Unbroken since ${since}.`)}
      </div>
    </div>
  );
}
