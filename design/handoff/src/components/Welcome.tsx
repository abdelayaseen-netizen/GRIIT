import React from 'react';
import { color, type, space, displayFace } from '../tokens';
import { Button } from './Primitives';

// The only marketing surface, and the only dark screen outside the proof moment.
// Every screen after Welcome is cream.
export function Welcome({ onStart, onLogIn }: { onStart?: () => void; onLogIn?: () => void }) {
  return (
    <div style={{ position: 'relative', flex: 1, background: color.textPrimary, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'flex', alignItems: 'flex-end', gap: space.sm, height: 32 }}>
        <div style={{ width: 10, height: 32, borderRadius: 4, background: color.brand }} />
        <div style={{ width: 10, height: 22, borderRadius: 4, background: color.brand }} />
      </div>
      <div style={{ position: 'absolute', left: space.gutter, right: space.gutter, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: space.lg }}>
        <div style={{ fontFamily: displayFace, fontSize: 44, lineHeight: '44px', fontWeight: '600', color: color.textPrimary }}>
          Discipline,<br />witnessed.
        </div>
        <div style={{ ...type.secondary, color: color.textPrimarySecondary }}>Photo proof. Daily. No way to fake it.</div>
      </div>
      <div style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: space.gutter, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        <Button label="Start" onPress={onStart} />
        <div onClick={onLogIn} style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong, color: color.textPrimary }}>Log in</div>
      </div>
    </div>
  );
}
