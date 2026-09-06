import React, { useState } from 'react';
import StreakCard from '../components/StreakCard';
import ConsistencyCard from '../components/ConsistencyCard';
import ChallengeRow from '../components/ChallengeRow';
import TabBar from '../components/TabBar';
import { ShareIcon, GearIcon } from '../components/Icons';
import { badgeRows } from '../fixtures';

const TABS = ['Challenges', 'Proofs', 'Badges'];

export default function OwnProfile({ fx, onEdit, onSettings, onConsistencyDetail }) {
  const [tab, setTab] = useState('Challenges');
  const { identity, streak, consistency, runs, completed, proofDays } = fx;

  return (
    <div className="screen">
      <div className="screen__scroll">
        <div className="profile-header">
          <span className="profile-header__handle">@{identity.handle}</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <button className="iconbtn iconbtn--round" aria-label="Share profile"><ShareIcon /></button>
            <button className="iconbtn iconbtn--round" aria-label="Settings" onClick={onSettings}><GearIcon /></button>
          </span>
        </div>

        <div className="identity">
          <div className="avatar">AVATAR<br />PLACEHOLDER</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display-name">{identity.name}</div>
            <div className="counts">
              <span><b>{identity.followers}</b> Followers</span>
              <span><b>{identity.following}</b> Following</span>
            </div>
          </div>
        </div>

        {identity.bio
          ? <p className="bio">{identity.bio}</p>
          : <button className="bio-prompt" onClick={onEdit}>Add a line about what you are building</button>}

        <div className="btn-row">
          <button className="btn btn--dark" onClick={onEdit}>Edit profile</button>
          <button className="btn btn--ghost">Invite friends</button>
        </div>

        <StreakCard {...streak} />
        <ConsistencyCard consistency={consistency} onOpenDetail={onConsistencyDetail} />

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab${tab === t ? ' tab--on' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Challenges' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {runs.map((r) => <ChallengeRow key={r.name} run={r} />)}
            {!runs.length && (
              <div className="empty">
                <div className="empty__title">No active challenge</div>
                <p className="empty__body">Start one from Discover. Day 1 begins the morning after you join.</p>
                <button className="btn btn--primary">Go to Discover</button>
              </div>
            )}
            {!!completed.length && (
              <>
                <div className="microhead">COMPLETED · {completed.length}</div>
                {completed.map((c) => (
                  <div key={c.name} className="run card--sunken" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15 }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 'Proofs' && (proofDays.length ? (
          <>
            <div className="proofs">
              {proofDays.map((d) => (
                <div key={d} className="proof"><span className="proof__day">Day {d}</span></div>
              ))}
            </div>
            <div className="hint">Every tile is a live-camera capture. Placeholder images.</div>
          </>
        ) : (
          <div className="empty" style={{ marginTop: 14 }}>
            <div className="empty__frames">
              <span className="empty__frame" /><span className="empty__frame" style={{ borderColor: 'var(--border)' }} />
              <span className="empty__frame" style={{ borderColor: 'var(--surface-sunken)' }} />
            </div>
            <div className="empty__title" style={{ marginTop: 16 }}>
              {runs.length ? 'Day 1 proof is due today' : 'No proofs yet'}
            </div>
            <p className="empty__body">
              {runs.length
                ? 'Proofs land here the moment the camera verifies one. Nothing can be uploaded from your library.'
                : 'Join a challenge and every verified day lands here as a photo.'}
            </p>
            <button className="btn btn--primary">{runs.length ? 'Post today\u2019s proof' : 'Go to Discover'}</button>
          </div>
        ))}

        {tab === 'Badges' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            {badgeRows(fx).map((b) => (
              <div key={b.name} className={`badge${b.earned ? ' badge--earned' : ''}`}>
                <div className="badge__head">
                  <span className="badge__name">{b.name}</span>
                  <span className="badge__state">{b.state}</span>
                </div>
                <div className="badge__rule">{b.rule}</div>
                {/* earned marks show the DATE, not a permanently full bar */}
                {!b.earned && (
                  <div className="meter"><span className="meter__fill" style={{ width: `${b.progress * 100}%` }} /></div>
                )}
              </div>
            ))}
            <div className="hint">Five marks, each earned by verified days only. Nothing here can be bought or awarded.</div>
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}
