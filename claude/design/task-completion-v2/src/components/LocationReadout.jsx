import React from 'react';

// checkin entry. Accuracy is shown always, not only when poor — it is the honest
// caveat on the only location gate we have.
export function LocationReadout({ place, distance, radius, accuracy }) {
  const inside = distance <= radius;
  return (
    <div className="loccard">
      <div className="loccard__label">DISTANCE TO {place.toUpperCase()}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 7 }}>
        <span className="loccard__value">{distance}</span>
        <span style={{ fontSize: 16, color: 'var(--muted)' }}>m away</span>
      </div>
      <div className="loccard__track">
        <span className="loccard__fill" style={{ width: `${Math.min(100, (distance / radius) * 100)}%` }} />
      </div>
      <div className="loccard__meta">
        {inside ? `Inside the ${radius} m radius` : `Outside the ${radius} m radius`} · GPS accuracy ±{accuracy} m
      </div>
    </div>
  );
}
