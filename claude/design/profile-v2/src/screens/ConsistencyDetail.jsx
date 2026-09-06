import React from 'react';

export default function ConsistencyDetail({ fx, onBack }) {
  const { consistency, streak, detail } = fx;
  const facts = [
    { label: 'LONGEST STREAK', value: streak.best === 1 ? '1 day' : `${streak.best} days` },
    { label: 'TOTAL VERIFIED', value: detail.totalVerified === 1 ? '1 day' : `${detail.totalVerified} days` },
    { label: 'COMPLETION', value: detail.completion },
    { label: 'FIRST PROOF', value: detail.firstProof },
  ];

  return (
    <div className="screen">
      <div className="navbar">
        <button className="iconbtn" aria-label="Back" onClick={onBack}><span className="chev-back" /></button>
        <span className="navbar__title">Consistency</span>
      </div>
      <div className="screen__scroll screen__scroll--page">
        <div className="rate" style={{ marginTop: 0 }}>
          <span className="rate__value">{consistency.rate}</span>
          {consistency.verdict && <span className="rate__verdict rate__verdict--good">{consistency.verdict}</span>}
        </div>
        <p className="rate__line">{consistency.line}</p>

        <div className="card card--list" style={{ display: 'flex', flexWrap: 'wrap', padding: '4px 16px' }}>
          {facts.map((f, i) => (
            <div key={f.label} style={{ width: '50%', padding: '14px 0', borderTop: i < 2 ? 'none' : '1px solid var(--surface-sunken)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.7px', color: 'var(--muted-light)' }}>{f.label}</div>
              <div style={{ marginTop: 5, fontSize: 16, fontWeight: 500, letterSpacing: '-.3px' }}>{f.value}</div>
            </div>
          ))}
        </div>

        <div className="microhead">BY MONTH</div>
        <div className="card card--list">
          {detail.months.map((m) => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid var(--surface-sunken)' }}>
              <span style={{ width: 74, fontSize: 14 }}>{m.label}</span>
              <span className="meter" style={{ flex: 1, height: 6, marginTop: 0 }}>
                <span className="meter__fill meter__fill--brand" style={{ height: 6, width: `${m.pct * 100}%` }} />
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted-light)' }}>{m.value}</span>
            </div>
          ))}
        </div>

        <div className="microhead">BY CHALLENGE</div>
        <div className="card card--list">
          {detail.byChallenge.map((c) => (
            <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '1px solid var(--surface-sunken)' }}>
              <span style={{ fontSize: 14 }}>{c.label}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{c.value}</span>
            </div>
          ))}
        </div>

        <p className="hint" style={{ marginTop: 16 }}>
          A day inside more than one challenge counts once in the totals. Every figure here is a count of verified proof rows.
        </p>
      </div>
    </div>
  );
}
