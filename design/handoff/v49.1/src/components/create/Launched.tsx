import React from 'react';
import { color, type, space } from '../../tokens';
import { Button } from '../Primitives';

// Not a celebration screen. The same surface the prototype already used, plus the name.
export function Launched({ challenge, group, onHome, onInvite }: {
  challenge: string; group: boolean; onHome: () => void; onInvite?: () => void;
}) {
  return (
    <div style={{ flex: 1, background: color.canvas, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: `64px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>You are in.</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>Day 1 begins tomorrow morning.</div>
        <div style={type.bodyStrong}>{challenge}</div>
      </div>
      <div style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: space.gutter, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {group ? <Button label="Invite friends" variant="secondary" onPress={onInvite} /> : null}
        <Button label="Back to Home" onPress={onHome} />
      </div>
    </div>
  );
}
