import React from 'react';
import { color, type, radius, border, hit, space } from '../tokens';

// Secondary controls on the step screens: Pause, Reset, Remove one, Type it.
//
// They were bare brandText labels stacked at the left edge with large gaps,
// which reads as an unstyled link list and spends the accent colour on the
// least important control on the screen. A pill gives them an edge, a hit area
// and a rank below the one primary. Orange goes back to meaning the primary.

export function ControlPill({ label, icon, onPress, disabled }: { label: string; icon?: string; onPress?: () => void; disabled?: boolean }) {
  return (
    <div role="button" onClick={disabled ? undefined : onPress} style={{
      minHeight: hit, padding: `0 ${space.lg}px`, borderRadius: radius.pill,
      background: color.surface, border,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: space.sm,
      ...type.secondary, fontWeight: '500',
      color: disabled ? color.textSecondary : color.textPrimary,
      opacity: disabled ? 0.5 : 1,
    }}>
      {icon ? <i data-lucide={icon} style={{ width: 18, height: 18, color: color.textSecondary, flex: 'none' }} /> : null}
      {label}
    </div>
  );
}

// Always a centred row under the thing they act on, never a left-aligned stack.
export function ControlRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: space.sm, justifyContent: 'center' }}>{children}</div>;
}
