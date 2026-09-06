import React from 'react';

// (a) Lock-screen Live Activity — where the timer actually lives while it runs, and (b) the
// completion notification. Both are OS surfaces: these components exist to specify the content
// and hierarchy, not to be mounted in the app. README §4.2.
//
// iOS: ActivityKit, countdown rendered with a .timer text style so it updates without pushes.
// Android: foreground-service ongoing notification, setUsesChronometer(true).

const clock = (ms) => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function TimerLiveActivity({ startedAt, requiredSec, taskName, challengeLine, onOpen }) {
  const left = Math.max(0, requiredSec - Math.floor((Date.now() - startedAt) / 1000));
  const pct = ((requiredSec - left) / requiredSec) * 100;
  return (
    <button className="liveactivity" onClick={onOpen}>
      <span className="liveactivity__head">
        <span className="appmark"><span /><span /></span>
        <span className="liveactivity__brand">GRIIT</span>
        <span style={{ flex: 1 }} />
        <span className="liveactivity__ends">ends {clock(startedAt + requiredSec * 1000)}</span>
      </span>
      <span className="liveactivity__mid">
        <span className="liveactivity__text">
          <span className="liveactivity__task">{taskName}</span>
          <span className="liveactivity__sub">{challengeLine}</span>
        </span>
        <span className="liveactivity__count">{fmt(left)}</span>
      </span>
      <span className="liveactivity__track"><span style={{ width: `${pct}%` }} /></span>
    </button>
  );
}

// Fires the instant the duration elapses, wherever the user is. The session is already recorded —
// this only asks them to close the loop, so tapping it goes straight to Verifying.
export function TimerDoneNotification({ duration = '10:00', onOpen }) {
  return (
    <button className="notification" onClick={onOpen}>
      <span className="appmark appmark--lg"><span /><span /></span>
      <span className="notification__text">
        <span className="notification__head">
          <span className="notification__brand">GRIIT</span>
          <span className="notification__when">now</span>
        </span>
        <span className="notification__title">{duration} done</span>
        <span className="notification__body">Come back to post proof.</span>
      </span>
    </button>
  );
}
