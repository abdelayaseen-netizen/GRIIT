import React, { useState } from 'react';

const TAKEN = ['yaseen', 'marcus', 'kyle', 'griit'];

export default function EditProfile({ identity, onCancel, onSave }) {
  const [name, setName] = useState(identity.name);
  const [username, setUsername] = useState(identity.handle);
  const [bio, setBio] = useState(identity.bio);

  const taken = TAKEN.includes(username);
  const tooShort = username.length > 0 && username.length < 3;
  const invalid = taken || tooShort;
  const status = taken ? 'Taken' : tooShort ? '3 characters min' : username === identity.handle ? '' : 'Available';

  return (
    <div className="screen">
      <div className="navbar" style={{ justifyContent: 'space-between', padding: '0 20px' }}>
        <button className="textlink" style={{ textDecoration: 'none', fontSize: 15 }} onClick={onCancel}>Cancel</button>
        <span style={{ fontSize: 15 }}>Edit profile</span>
        <button className="textlink" style={{ textDecoration: 'none', fontSize: 15, color: invalid ? '#C9C4BA' : 'var(--orange)' }}
          disabled={invalid} onClick={() => onSave({ name, handle: username, bio })}>Save</button>
      </div>

      <div className="screen__scroll screen__scroll--page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div className="avatar avatar--lg">AVATAR<br />PLACEHOLDER</div>
          <button className="btn btn--ghost" style={{ height: 44, flex: 'none', padding: '0 18px', fontSize: 14 }}>Change photo</button>
          {/* square crop is iOS-native; say what it becomes */}
          <div className="hint">Square crop — crops to a circle everywhere.</div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="dn">DISPLAY NAME</label>
          <input id="dn" className="input" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="un">USERNAME</label>
          <div className={`input${invalid ? ' input--invalid' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted-light)' }}>@</span>
            <input id="un" style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', fontSize: 16, outline: 'none', padding: '0 4px' }}
              maxLength={20} value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
            <span className={invalid ? 'status--bad' : 'status--ok'} style={{ fontSize: 12 }}>{status}</span>
          </div>
          <div className="hint">Lowercase letters, numbers and underscores. Changing it breaks old links to your profile.</div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bio">
            <span>BIO</span>
            <span className={bio.length > 140 ? 'status--bad' : ''}>{bio.length}/150</span>
          </label>
          <textarea id="bio" className="textarea" rows={4} maxLength={150} placeholder="What are you building?"
            value={bio} onChange={(e) => setBio(e.target.value.slice(0, 150))} />
          <div className="hint">Shown on your profile to anyone who can see it.</div>
        </div>
      </div>
    </div>
  );
}
