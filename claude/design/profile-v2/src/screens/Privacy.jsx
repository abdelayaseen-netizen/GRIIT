import React from 'react';

const LEVELS = ['public', 'friends', 'private'];

const EXPLAIN = {
  profile: {
    public: 'Anyone can open your profile and see your bio, stats and activity.',
    friends: 'Only people you have accepted see the record. Others see your name, photo and bio only.',
    private: 'Nobody but you. You still appear to people inside challenges you share.',
  },
  challenge: {
    public: 'Anyone can see which challenges you are running and how far in you are.',
    friends: 'Only your circle sees your runs. Others see the tab as hidden.',
    private: 'Your runs are hidden from your profile entirely.',
  },
  activity: {
    public: 'Anyone can see your consistency record and your proof photos.',
    friends: 'Only your circle sees your record and proof photos.',
    private: 'Your record and proofs are yours alone.',
  },
};

const GROUPS = [
  { key: 'profile', label: 'Profile' },
  { key: 'challenge', label: 'Challenges' },
  { key: 'activity', label: 'Activity and proofs' },
];

export default function Privacy({ value, onChange, onPreviewVisitor, onBack }) {
  return (
    <div className="screen">
      <div className="navbar">
        <button className="iconbtn" aria-label="Back" onClick={onBack}><span className="chev-back" /></button>
        <span className="navbar__title">Privacy</span>
      </div>
      <div className="screen__scroll screen__scroll--page">
        <p className="empty__body" style={{ margin: '0 0 18px', textAlign: 'left' }}>
          Three controls, applied everywhere your record appears — profile, search and shared links.
        </p>

        {GROUPS.map((g) => (
          <div key={g.key} className="card" style={{ padding: 16, borderRadius: 20 }}>
            <div style={{ fontSize: 15 }}>{g.label}</div>
            <div className="segmented">
              {LEVELS.map((lvl) => (
                <button key={lvl} className={`segmented__opt${value[g.key] === lvl ? ' segmented__opt--on' : ''}`}
                  onClick={() => onChange({ ...value, [g.key]: lvl })}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
            <div className="explain">{EXPLAIN[g.key][value[g.key]]}</div>
          </div>
        ))}

        {/* true of the current data model — do not drop it */}
        <div className="card card--sunken" style={{ padding: 16, borderRadius: 20 }}>
          <div style={{ fontSize: 13 }}>None of this hides a proof from a challenge you joined</div>
          <p className="explain" style={{ marginTop: 6 }}>
            Everyone in a shared challenge sees whether you verified the day. Privacy controls what your profile shows outside it.
          </p>
        </div>

        <button className="btn" style={{ marginTop: 16, width: '100%', height: 48, background: 'none',
          border: '2px dashed var(--border-dashed)', color: 'var(--body)', fontSize: 14 }}
          onClick={onPreviewVisitor}>
          See how a stranger sees your profile
        </button>
      </div>
    </div>
  );
}
