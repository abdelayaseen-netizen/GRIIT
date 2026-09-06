import React from 'react';
import { UserIcon, BellIcon, EyeIcon, CardIcon, InfoIcon } from '../components/Icons';

// Short top-level list + sub-pages. Everything kept here is true and enforceable:
// the duplicate Sign out / Delete / About groups, the emoji headers, the raw email,
// the Friends card pointing at a non-existent "Movement tab" and the Consequences card are gone.
export default function Settings({ notifications, privacy, onOpen, onBack }) {
  const timeLabel = notifications.reminderEnabled
    ? `Daily reminder at ${notifications.timeText}`
    : 'Daily reminder off';
  const cap = (v) => v.charAt(0).toUpperCase() + v.slice(1);

  const rows = [
    { id: 'account', icon: <UserIcon />, label: 'Account', sub: 'Signed in with Apple · y•••@gmail.com' },
    { id: 'notifications', icon: <BellIcon />, label: 'Notifications', sub: timeLabel },
    { id: 'privacy', icon: <EyeIcon />, label: 'Privacy', sub: `Profile ${cap(privacy.profile)} · Activity ${cap(privacy.activity)}` },
    { id: 'subscription', icon: <CardIcon />, label: 'Subscription', sub: 'Free plan · 1 streak freeze a month' },
    { id: 'about', icon: <InfoIcon />, label: 'About', sub: 'Version, terms, privacy policy, contact' },
  ];

  return (
    <div className="screen">
      <div className="navbar">
        <button className="iconbtn" aria-label="Back" onClick={onBack}><span className="chev-back" /></button>
        <span className="navbar__title">Settings</span>
      </div>
      <div className="screen__scroll screen__scroll--page">
        <div className="list">
          {rows.map((r) => (
            <button key={r.id} className="list__row" onClick={() => onOpen(r.id)}>
              <span className="list__icon">{r.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="list__label">{r.label}</span>
                <span className="list__sub">{r.sub}</span>
              </span>
              <span className="chev-fwd" />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <button className="btn btn--ghost" style={{ height: 52, flex: 'none' }}>Sign out</button>
          <button className="btn" style={{ height: 52, background: 'none', color: 'var(--danger)' }}>Delete account</button>
        </div>
        <div className="hint" style={{ textAlign: 'center', marginTop: 18 }}>GRIIT 1.0.0</div>
      </div>
    </div>
  );
}
