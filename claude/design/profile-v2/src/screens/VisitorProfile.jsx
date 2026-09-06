import React, { useState } from 'react';
import StreakCard from '../components/StreakCard';
import ConsistencyCard from '../components/ConsistencyCard';
import ChallengeRow from '../components/ChallengeRow';
import TabBar from '../components/TabBar';
import { LockIcon, MessageIcon } from '../components/Icons';
import { VISITOR } from '../fixtures';

// visibility: 'public' | 'friends' | 'private' — resolved SERVER-side, never in the client.
export default function VisitorProfile({ visibility = 'public', onBack }) {
  const [rel, setRel] = useState('none');   // none | requested | following
  const open = visibility === 'public';
  const relLabel = rel === 'following' ? 'Following' : rel === 'requested' ? 'Requested' : open ? 'Follow' : 'Request';

  return (
    <div className="screen">
      <div className="screen__scroll">
        <div className="profile-header">
          <button className="iconbtn" aria-label="Back" onClick={onBack}><span className="chev-back" /></button>
          <button className="iconbtn" aria-label="More">···</button>
        </div>

        <div className="identity">
          <div className="avatar">AVATAR<br />PLACEHOLDER</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display-name">{VISITOR.name}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted-light)' }}>@{VISITOR.handle}</div>
          </div>
        </div>
        <p className="bio">{VISITOR.bio}</p>

        <div className="btn-row">
          <button
            className="btn"
            style={rel === 'none'
              ? { flex: 1, height: 46, background: 'var(--orange)', color: '#fff' }
              : { flex: 1, height: 46, background: '#fff', border: '2px solid var(--border-strong)', color: rel === 'requested' ? 'var(--muted)' : 'var(--ink)' }}
            onClick={() => setRel(rel === 'none' ? (open ? 'following' : 'requested') : 'none')}>
            {relLabel}
          </button>
          <button className="btn btn--ghost" style={{ flex: '0 0 46px', width: 46 }} aria-label="Message"><MessageIcon /></button>
        </div>

        {open ? (
          <>
            <StreakCard current={VISITOR.streak.current} best={VISITOR.streak.best} note={VISITOR.streak.note} />
            <ConsistencyCard consistency={VISITOR.consistency} possessive="their" />
            <div className="microhead">ACTIVE RUNS</div>
            <div style={{ marginTop: 10 }}>
              {VISITOR.runs.map((r) => <ChallengeRow key={r.name} run={r} />)}
            </div>
            <div className="proofs">
              {VISITOR.proofDays.map((d) => (
                <div key={d} className="proof"><span className="proof__day">Day {d}</span></div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ border: '2px solid var(--border)', textAlign: 'center', padding: '24px 20px', marginTop: 20 }}>
              <span style={{ color: 'var(--muted-light)' }}><LockIcon /></span>
              <div style={{ marginTop: 12, fontSize: 17, letterSpacing: '-.3px' }}>
                {visibility === 'private' ? 'This profile is private' : 'Visible to their circle'}
              </div>
              <p className="empty__body" style={{ marginBottom: 0 }}>
                {visibility === 'private'
                  ? 'Marcus keeps this record private. Nothing is shown, and requests are not accepted automatically.'
                  : 'Marcus shows the streak, activity and proofs to people they have accepted. Send a request to see the record.'}
              </p>
            </div>
            {/* what is hidden is NAMED, never faked with blurred numbers */}
            <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
              {['STREAK', 'CONSISTENCY'].map((label) => (
                <div key={label} className="card card--sunken" style={{ flex: 1, margin: 0, borderRadius: 16, padding: '13px 14px' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.7px', color: 'var(--muted-light)' }}>{label}</div>
                  <div style={{ marginTop: 5, fontSize: 19, fontWeight: 500, color: 'var(--muted-light)' }}>Hidden</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <TabBar />
    </div>
  );
}
