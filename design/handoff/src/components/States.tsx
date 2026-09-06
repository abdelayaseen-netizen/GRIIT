import React from 'react';
import { color, type, space, radius, avatarSize } from '../tokens';
import { Button } from './Primitives';

// One empty state, reused for errors. Heading, one sentence, one primary button.
// It sits on the canvas, never inside a card.
export function EmptyState({ icon, heading, body, actionLabel, onAction }: {
  icon?: React.ReactNode; heading: string; body: string; actionLabel: string; onAction?: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md, textAlign: 'center' }}>
      {icon ? (
        <div style={{ width: avatarSize.md, height: avatarSize.md, borderRadius: radius.pill, background: color.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      ) : null}
      <div style={type.heading}>{heading}</div>
      <div style={{ ...type.secondary, color: color.textSecondary, maxWidth: 280 }}>{body}</div>
      <div style={{ marginTop: space.sm }}><Button label={actionLabel} onPress={onAction} /></div>
    </div>
  );
}

// Error is the same component: what failed, what to do, retry.
export function ErrorState(p: { icon?: React.ReactNode; heading: string; body: string; onRetry?: () => void }) {
  return <EmptyState icon={p.icon} heading={p.heading} body={p.body} actionLabel="Retry" onAction={p.onRetry} />;
}
