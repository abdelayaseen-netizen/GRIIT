import React, { useState } from 'react';
import SwitchRow from '../components/Switch';

// Presets are the SAME four as onboarding, reading the same reminderTime value.
const PRESETS = [
  { id: 'am6', time: '6:00', mer: 'AM' },
  { id: 'am8', time: '8:00', mer: 'AM' },
  { id: 'pm12', time: '12:00', mer: 'PM' },
  { id: 'pm7', time: '7:00', mer: 'PM' },
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];

export default function Notifications({ value, onChange, onBack }) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState(value.customTime || { h: 6, m: '30', mer: 'AM' });
  const draftText = `${draft.h}:${draft.m} ${draft.mer}`;
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="screen">
      <div className="navbar">
        <button className="iconbtn" aria-label="Back" onClick={onBack}><span className="chev-back" /></button>
        <span className="navbar__title">Notifications</span>
      </div>
      <div className="screen__scroll screen__scroll--page">
        {/* When the OS permission is denied, show a banner here and render every switch disabled —
            never a switch that says "on" while the system is silencing it. */}
        <div className="card" style={{ marginTop: 0, padding: 16 }}>
          <SwitchRow
            label="Daily reminder"
            sub="One push a day if today has no verified proof yet."
            value={value.reminderEnabled}
            onChange={(v) => set({ reminderEnabled: v })} />

          {value.reminderEnabled && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--surface-sunken)' }}>
              <div className="card__label" style={{ letterSpacing: '.8px' }}>SEND IT AT</div>

              {!customOpen ? (
                <>
                  <div className="presets">
                    {PRESETS.map((p) => (
                      <button key={p.id} className={`preset${value.reminderTime === p.id ? ' preset--on' : ''}`}
                        onClick={() => set({ reminderTime: p.id })}>
                        <span className="preset__time">{p.time}</span>
                        <span className="preset__mer">{p.mer}</span>
                      </button>
                    ))}
                  </div>
                  {value.customTime && (
                    <button className="btn" style={{ marginTop: 7, width: '100%', height: 48, borderRadius: 15, padding: '0 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: value.reminderTime === 'custom' ? 'var(--ink)' : 'var(--canvas)' }}
                      onClick={() => setCustomOpen(true)}>
                      <span style={{ fontSize: 11, letterSpacing: '.7px', color: 'var(--muted-light)' }}>CUSTOM</span>
                      <span style={{ fontSize: 15, color: value.reminderTime === 'custom' ? '#fff' : 'var(--ink)' }}>
                        {`${value.customTime.h}:${value.customTime.m} ${value.customTime.mer}`}
                      </span>
                    </button>
                  )}
                  <button className="textlink" onClick={() => setCustomOpen(true)}>Pick a custom time</button>
                </>
              ) : (
                <div className="card" style={{ border: '2px solid var(--border)', borderRadius: 20, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-.8px' }}>{draftText}</span>
                    <span style={{ display: 'flex', gap: 6 }}>
                      {['AM', 'PM'].map((m) => (
                        <button key={m} className={`grid-btn${draft.mer === m ? ' grid-btn--on' : ''}`}
                          style={{ width: 52, background: draft.mer === m ? 'var(--ink)' : 'var(--surface)', borderColor: draft.mer === m ? 'var(--ink)' : 'var(--border)', color: draft.mer === m ? '#fff' : 'var(--ink)' }}
                          onClick={() => setDraft({ ...draft, mer: m })}>{m}</button>
                      ))}
                    </span>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div className="hint" style={{ letterSpacing: '.7px' }}>HOUR</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginTop: 6 }}>
                      {HOURS.map((h) => (
                        <button key={h} className={`grid-btn${draft.h === h ? ' grid-btn--on' : ''}`} onClick={() => setDraft({ ...draft, h })}>{h}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div className="hint" style={{ letterSpacing: '.7px' }}>MINUTES</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginTop: 6 }}>
                      {MINUTES.map((m) => (
                        <button key={m} className={`grid-btn${draft.m === m ? ' grid-btn--on' : ''}`} onClick={() => setDraft({ ...draft, m })}>:{m}</button>
                      ))}
                    </div>
                  </div>

                  {/* the draft is staged: nothing changes until "Use ..." */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button className="btn btn--quiet" style={{ flex: 1 }} onClick={() => setCustomOpen(false)}>Back to presets</button>
                    <button className="btn" style={{ flex: 1, height: 44, borderRadius: 12, background: 'var(--ink)', color: '#fff', fontSize: 14 }}
                      onClick={() => { set({ customTime: draft, reminderTime: 'custom' }); setCustomOpen(false); }}>
                      Use {draftText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="microhead">OTHER PUSHES</div>
        <div className="list" style={{ marginTop: 10 }}>
          <SwitchRow label="Last call" sub="60 minutes before the day resets, only if the day is unverified."
            value={value.lastCall} onChange={(v) => set({ lastCall: v })} />
          <SwitchRow label="Circle activity" sub="When someone in your circle verifies a day."
            value={value.circleActivity} onChange={(v) => set({ circleActivity: v })} />
          <SwitchRow label="Weekly summary" sub="Sunday: days verified, days missed, streak state."
            value={value.weeklySummary} onChange={(v) => set({ weeklySummary: v })} />
          <SwitchRow label="Lock screen timer" sub="Live activity while a timed task is running."
            value={value.liveActivity} onChange={(v) => set({ liveActivity: v })} />
        </div>
        <div className="hint" style={{ marginTop: 12 }}>
          Turning the system permission off in iOS Settings silences all of these, and GRIIT will show that state here.
        </div>
      </div>
    </div>
  );
}
